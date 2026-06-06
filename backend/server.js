const express = require('express');
const http    = require('http');
const { Server } = require('socket.io');
const cors   = require('cors');
const helmet = require('helmet');
const { stations, routes, routeWaypoints, buses: initialBuses } = require('./data/initialData');

const app    = express();
const server = http.createServer(app);

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:4173'];

const io = new Server(server, {
  cors: { origin: ALLOWED_ORIGINS, methods: ['GET', 'POST', 'PUT', 'DELETE'] },
});

app.use(helmet());
app.use(cors({ origin: ALLOWED_ORIGINS }));
app.use(express.json());

// ── Shared state ──────────────────────────────────────────────
const state = {
  stations:      JSON.parse(JSON.stringify(stations)),
  routes:        JSON.parse(JSON.stringify(routes)),
  routeWaypoints,
  buses:         JSON.parse(JSON.stringify(initialBuses)),
};

// Buses start with no position — offline until GPS data arrives
state.buses.forEach(bus => {
  bus.lat        = null;
  bus.lng        = null;
  bus.speed      = 0;
  bus.heading    = 0;
  bus.satellites = 0;
  bus.hdop       = 99.9;
  bus.hasFix     = false;
  bus.outOfArea  = false;
  bus.gpsSource  = null;
  bus.lastUpdate = null;
  bus.passengers = 0;
  bus.status     = 'offline';
});

// ── Dar es Salaam geographic bounds ──────────────────────────
const DAR_BOUNDS = {
  north: -6.50,
  south: -7.10,
  east:  39.55,
  west:  38.90,
};

function isInDarBounds(lat, lng) {
  return (
    lat >= DAR_BOUNDS.south && lat <= DAR_BOUNDS.north &&
    lng >= DAR_BOUNDS.west  && lng <= DAR_BOUNDS.east
  );
}

// ── Helpers ───────────────────────────────────────────────────
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getNextStation(bus) {
  if (bus.lat == null || bus.lng == null) return null;
  const route = state.routes.find(r => r.id === bus.routeId);
  if (!route) return null;
  let minDist = Infinity;
  let nextSt  = null;
  for (const stId of route.stationIds) {
    const st = state.stations.find(s => s.id === stId);
    if (!st) continue;
    const d = haversineKm(bus.lat, bus.lng, st.lat, st.lng);
    if (d < minDist && d > 0.05) { minDist = d; nextSt = st; }
  }
  return nextSt ? { station: nextSt, distKm: minDist } : null;
}

function buildBusPayload(bus) {
  const next  = getNextStation(bus);
  const eta   = next ? Math.round((next.distKm / Math.max(bus.speed || 1, 1)) * 60) : null;
  const route = state.routes.find(r => r.id === bus.routeId);
  return {
    ...bus,
    routeName:   route?.name      || 'Unknown',
    routeShort:  route?.shortName || '',
    routeColor:  route?.color     || '#888',
    nextStation: next?.station?.name || null,
    etaMinutes:  eta,
  };
}

// ── Broadcast helpers ─────────────────────────────────────────
function broadcastAll() {
  io.emit('busesUpdate', state.buses.map(buildBusPayload));
  broadcastStationArrivals();
}

function broadcastStationArrivals() {
  const arrivals = {};
  state.stations.forEach(st => { arrivals[st.id] = []; });
  state.buses.forEach(bus => {
    if (bus.status !== 'active' || bus.lat == null) return;
    const route = state.routes.find(r => r.id === bus.routeId);
    if (!route) return;
    route.stationIds.forEach(stId => {
      const st = state.stations.find(s => s.id === stId);
      if (!st) return;
      const d = haversineKm(bus.lat, bus.lng, st.lat, st.lng);
      if (d < 3) {
        const eta = Math.round((d / Math.max(bus.speed || 1, 1)) * 60);
        arrivals[stId].push({ busId: bus.id, routeName: route.name, etaMinutes: eta });
      }
    });
  });
  io.emit('stationArrivals', arrivals);
}

// ── Stale bus check (every 60 s) ─────────────────────────────
// Mark a bus offline if it hasn't sent GPS data in 3 minutes
const STALE_TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes

setInterval(() => {
  const now = Date.now();
  let changed = false;
  state.buses.forEach(bus => {
    if (bus.status === 'active' && bus.lastUpdate) {
      const age = now - new Date(bus.lastUpdate).getTime();
      if (age > STALE_TIMEOUT_MS) {
        console.log(`[Stale] ${bus.id} offline — last update ${Math.round(age / 1000)}s ago`);
        bus.status     = 'offline';
        bus.lat        = null;
        bus.lng        = null;
        bus.speed      = 0;
        bus.gpsSource  = null;
        bus.outOfArea  = false;
        changed        = true;
      }
    }
  });
  if (changed) broadcastAll();
}, 60_000);

// ── REST routes ───────────────────────────────────────────────
app.use('/api/buses',    require('./routes/buses')(state));
app.use('/api/routes',   require('./routes/routes')(state));
app.use('/api/stations', require('./routes/stations')(state));

// ── GPS ingest — ESP32 + NEO-6M ───────────────────────────────
app.post('/api/gps', (req, res) => {
  const { busId, latitude, longitude, speed, heading,
          timestamp, satellites, hdop, hasFix } = req.body;

  if (!busId) return res.status(400).json({ error: 'busId is required' });

  const bus = state.buses.find(b => b.id === busId);
  if (!bus) {
    return res.status(404).json({
      error: `Bus '${busId}' not registered`,
      validIds: state.buses.map(b => b.id),
    });
  }

  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ error: 'latitude and longitude must be valid numbers' });
  }

  // Check if coordinates are within Dar es Salaam
  const inBounds = isInDarBounds(lat, lng);

  bus.lat        = lat;
  bus.lng        = lng;
  bus.speed      = parseFloat(speed)      || 0;
  bus.heading    = parseFloat(heading)    || 0;
  bus.satellites = parseInt(satellites)   || 0;
  bus.hdop       = parseFloat(hdop)       || 99.9;
  bus.hasFix     = hasFix != null ? hasFix : true;
  bus.lastUpdate = timestamp || new Date().toISOString();
  bus.gpsSource  = 'hardware';
  bus.outOfArea  = !inBounds;
  bus.status     = 'active';  // bus is online whenever it sends data

  if (!inBounds) {
    console.log(`[GPS] ⚠ ${busId} outside Dar es Salaam: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
  } else {
    console.log(`[GPS] ${busId} → ${lat.toFixed(5)}, ${lng.toFixed(5)} | ${bus.speed.toFixed(1)} km/h | sats:${bus.satellites} | fix:${bus.hasFix}`);
  }

  broadcastAll();
  res.json({ ok: true, bus: buildBusPayload(bus), inBounds });
});

app.get('/api/health', (_req, res) =>
  res.json({
    status: 'ok',
    time: new Date().toISOString(),
    activeBuses: state.buses.filter(b => b.status === 'active').length,
  })
);

// ── Auth endpoint ─────────────────────────────────────────────
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const validUser = process.env.OPERATOR_USERNAME || 'operator';
  const validPass = process.env.OPERATOR_PASSWORD || 'dart2024';
  if (username === validUser && password === validPass) {
    return res.json({ ok: true, role: 'operator' });
  }
  res.status(401).json({ ok: false, message: 'Invalid username or password.' });
});

// ── WebSocket ─────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Send initial snapshot — buses are all offline until GPS arrives
  socket.emit('init', {
    buses:     state.buses.map(buildBusPayload),
    routes:    state.routes,
    stations:  state.stations,
    waypoints: routeWaypoints,
  });

  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () =>
  console.log(`Smart DART backend running on port ${PORT} — waiting for GPS data`)
);
