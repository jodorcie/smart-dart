const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const { stations, routes, routeWaypoints, buses: initialBuses } = require('./data/initialData');

const app = express();
const server = http.createServer(app);

// Allow the Vercel frontend + localhost in dev
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:4173'];

const io = new Server(server, {
  cors: { origin: ALLOWED_ORIGINS, methods: ['GET', 'POST', 'PUT', 'DELETE'] },
});

app.use(helmet());
app.use(cors({ origin: ALLOWED_ORIGINS }));
app.use(express.json());

// Shared mutable state
const state = {
  stations: JSON.parse(JSON.stringify(stations)),
  routes: JSON.parse(JSON.stringify(routes)),
  routeWaypoints,
  buses: JSON.parse(JSON.stringify(initialBuses)),
};

// Initialise bus positions from first waypoint
state.buses.forEach(bus => {
  const wps = routeWaypoints[bus.routeId] || [];
  if (wps.length) {
    bus.lat = wps[bus.waypointIndex][0];
    bus.lng = wps[bus.waypointIndex][1];
  }
  bus.lastUpdate = new Date().toISOString();
  bus.passengers = Math.floor(Math.random() * bus.capacity);
});

// ── REST routes ───────────────────────────────────────────────
app.use('/api/buses',    require('./routes/buses')(state));
app.use('/api/routes',   require('./routes/routes')(state));
app.use('/api/stations', require('./routes/stations')(state));

// GPS ingest endpoint – ESP32 + NEO-6M hardware
app.post('/api/gps', (req, res) => {
  const { busId, latitude, longitude, speed, timestamp,
          satellites, hdop, hasFix } = req.body;

  if (!busId) return res.status(400).json({ error: 'busId is required' });

  const bus = state.buses.find(b => b.id === busId);
  if (!bus) {
    return res.status(404).json({
      error: `Bus '${busId}' not found`,
      validIds: state.buses.map(b => b.id),
    });
  }

  const lat = parseFloat(latitude);
  const lng = parseFloat(longitude);
  if (isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ error: 'latitude and longitude must be valid numbers' });
  }

  // Real hardware overrides the simulation
  bus.lat        = lat;
  bus.lng        = lng;
  bus.speed      = parseFloat(speed) || bus.speed;
  bus.lastUpdate = timestamp || new Date().toISOString();
  bus.gpsSource  = 'hardware';   // dashboard shows "Live GPS" badge
  bus.satellites = satellites != null ? parseInt(satellites) : bus.satellites;
  bus.hdop       = hdop       != null ? parseFloat(hdop)     : bus.hdop;
  bus.hasFix     = hasFix     != null ? hasFix               : true;

  const payload = buildBusPayload(bus);
  io.emit('busesUpdate', state.buses.map(buildBusPayload));

  console.log(`[GPS HW] ${busId} → ${lat.toFixed(5)}, ${lng.toFixed(5)} | ${(bus.speed).toFixed(1)} km/h | sats:${bus.satellites} hdop:${bus.hdop} fix:${bus.hasFix}`);
  res.json({ ok: true, bus: payload });
});

app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

// ── Simulation helpers ────────────────────────────────────────
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
  const route = state.routes.find(r => r.id === bus.routeId);
  if (!route) return null;
  const stationIds = route.stationIds;
  // Find the closest upcoming station based on waypoint progress
  const wps = routeWaypoints[bus.routeId] || [];
  if (!wps.length) return null;
  const currentWp = wps[bus.waypointIndex] || wps[0];
  let minDist = Infinity;
  let nextSt = null;
  for (const stId of stationIds) {
    const st = state.stations.find(s => s.id === stId);
    if (!st) continue;
    const d = haversineKm(currentWp[0], currentWp[1], st.lat, st.lng);
    if (d < minDist && d > 0.05) { minDist = d; nextSt = st; }
  }
  return { station: nextSt, distKm: minDist };
}

function buildBusPayload(bus) {
  const next = getNextStation(bus);
  const etaMin = next ? Math.round((next.distKm / Math.max(bus.speed, 1)) * 60) : null;
  const route = state.routes.find(r => r.id === bus.routeId);
  return {
    ...bus,
    routeName: route ? route.name : 'Unknown',
    routeShort: route ? route.shortName : '',
    routeColor: route ? route.color : '#888',
    nextStation: next?.station?.name || 'Terminal',
    etaMinutes: etaMin,
    lastUpdate: bus.lastUpdate,
  };
}

// ── GPS Simulation loop (every 5 s) ──────────────────────────
function simulateBuses() {
  const busPayloads = [];

  state.buses.forEach(bus => {
    if (bus.status !== 'active') return;
    const wps = routeWaypoints[bus.routeId];
    if (!wps || wps.length < 2) return;

    // Advance waypoint index
    bus.waypointIndex += bus.direction;
    if (bus.waypointIndex >= wps.length) { bus.waypointIndex = wps.length - 2; bus.direction = -1; }
    if (bus.waypointIndex < 0)           { bus.waypointIndex = 1;              bus.direction =  1; }

    const wp = wps[bus.waypointIndex];
    bus.lat = wp[0] + (Math.random() - 0.5) * 0.0003;
    bus.lng = wp[1] + (Math.random() - 0.5) * 0.0003;
    bus.speed = Math.max(10, Math.min(65, bus.speed + (Math.random() - 0.5) * 6));
    bus.passengers = Math.max(0, Math.min(bus.capacity, bus.passengers + Math.floor((Math.random() - 0.4) * 5)));
    bus.lastUpdate = new Date().toISOString();

    busPayloads.push(buildBusPayload(bus));
  });

  // Broadcast all updates in one event
  io.emit('busesUpdate', busPayloads);

  // Compute incoming buses per station and broadcast
  const stationArrivals = {};
  state.stations.forEach(st => { stationArrivals[st.id] = []; });
  state.buses.forEach(bus => {
    if (bus.status !== 'active') return;
    const route = state.routes.find(r => r.id === bus.routeId);
    if (!route) return;
    route.stationIds.forEach(stId => {
      const st = state.stations.find(s => s.id === stId);
      if (!st) return;
      const d = haversineKm(bus.lat, bus.lng, st.lat, st.lng);
      if (d < 3) {
        const eta = Math.round((d / Math.max(bus.speed, 1)) * 60);
        stationArrivals[stId].push({ busId: bus.id, routeName: route.name, etaMinutes: eta });
      }
    });
  });
  io.emit('stationArrivals', stationArrivals);
}

setInterval(simulateBuses, 5000);

// ── Auth endpoint (keeps credentials server-side) ────────────
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const validUser = process.env.OPERATOR_USERNAME || 'operator';
  const validPass = process.env.OPERATOR_PASSWORD || 'dart2024';
  if (username === validUser && password === validPass) {
    return res.json({ ok: true, role: 'operator' });
  }
  res.status(401).json({ ok: false, message: 'Invalid username or password.' });
});

// ── WebSocket ────────────────────────────────────────────────
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  // Send initial snapshot
  socket.emit('init', {
    buses: state.buses.map(buildBusPayload),
    routes: state.routes,
    stations: state.stations,
    waypoints: routeWaypoints,
  });

  socket.on('disconnect', () => console.log('Client disconnected:', socket.id));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Smart DART backend running on port ${PORT}`));
