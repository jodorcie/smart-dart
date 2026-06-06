import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import Map, {
  Source, Layer,
  Marker, Popup,
  NavigationControl,
  ScaleControl,
  AttributionControl,
} from 'react-map-gl';
import MapboxDirections from '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions';
import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import useDartStore          from '../../store/dartStore';
import useRoadSnappedRoutes  from '../../hooks/useRoadSnappedRoutes';
import useGeolocation        from '../../hooks/useGeolocation';

const MAPBOX_TOKEN =
  import.meta.env.VITE_MAPBOX_TOKEN ||
  'pk.eyJ1Ijoibmd1c2h3YWkiLCJhIjoiY21wempsY2tuMDJ3ZjJzcjMxdXl0dzRoeiJ9.mdf2eIbYpquNdhM1sHUfEA';

const INITIAL_VIEW = {
  longitude: 39.2589,
  latitude:  -6.8200,
  zoom: 12,
  pitch: 0,
  bearing: 0,
};

// ── Fallback GeoJSON (straight lines shown while road-snap loads) ──
function buildFallbackGeoJSON(routes, waypoints) {
  return {
    type: 'FeatureCollection',
    features: routes
      .filter(r => r.active && waypoints[r.id])
      .map(r => ({
        type: 'Feature',
        properties: { color: r.color, name: r.name, id: r.id, phase: r.phase || 1 },
        geometry: {
          type: 'LineString',
          coordinates: waypoints[r.id].map(([lat, lng]) => [lng, lat]),
        },
      })),
  };
}

const routeCasingLayer = {
  id: 'routes-casing',
  type: 'line',
  layout: { 'line-join': 'round', 'line-cap': 'round' },
  paint: { 'line-color': '#ffffff', 'line-width': 8, 'line-opacity': 0.5 },
};
const routeLineLayer = {
  id: 'routes-line',
  type: 'line',
  layout: { 'line-join': 'round', 'line-cap': 'round' },
  paint: { 'line-color': ['get', 'color'], 'line-width': 5, 'line-opacity': 0.85 },
};

// ── Haversine (km) ─────────────────────────────────────────────
function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371, dLat = (lat2 - lat1) * Math.PI / 180, dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

// ── User location blue dot ─────────────────────────────────────
function UserLocationMarker({ location }) {
  if (!location) return null;
  return (
    <Marker longitude={location.lng} latitude={location.lat} anchor="center">
      <div className="relative flex items-center justify-center" style={{ width: 22, height: 22 }}>
        {/* Accuracy ring */}
        <div className="absolute w-full h-full rounded-full bg-blue-400/25 animate-ping" />
        {/* White border */}
        <div className="absolute w-4 h-4 rounded-full bg-white shadow-md" />
        {/* Blue fill */}
        <div className="absolute w-3 h-3 rounded-full bg-blue-500" />
      </div>
    </Marker>
  );
}

// ── Bus Marker ─────────────────────────────────────────────────
function BusMarker({ bus, routeColor, onClick, isFollowed }) {
  const label    = bus.id.replace('DART', '');
  const outColor = bus.outOfArea ? '#FF6F00' : routeColor;
  return (
    <Marker longitude={bus.lng} latitude={bus.lat} anchor="center" onClick={onClick}>
      <div className="relative cursor-pointer" style={{ width: 40, height: 40 }}>
        <div className="bus-pulse-ring" style={{ background: isFollowed ? outColor + 'aa' : outColor + '44' }} />
        <div
          className="w-full h-full rounded-full flex items-center justify-center text-white font-black shadow-lg select-none"
          style={{ background: outColor, fontSize: 11, border: isFollowed ? '3px solid #fff' : '2px solid #fff' }}
        >
          {label}
        </div>
        <div className={`absolute -top-1 -right-1 text-white text-[7px] font-black rounded px-0.5 leading-tight ${bus.outOfArea ? 'bg-orange-500' : 'bg-green-500'}`}>
          {bus.outOfArea ? '⚠' : 'LIVE'}
        </div>
        {isFollowed && <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full shadow" />}
      </div>
    </Marker>
  );
}

// ── Station Marker ─────────────────────────────────────────────
function StationMarker({ station, onClick }) {
  const isTerminal = station.type === 'terminal';
  const bg   = station.phase === 2 ? '#FF6F00' : isTerminal ? '#212121' : '#1E88E5';
  const size = isTerminal ? 18 : 12;
  return (
    <Marker longitude={station.lng} latitude={station.lat} anchor="center" onClick={onClick}>
      <div
        className="rounded cursor-pointer border-2 border-white shadow-md"
        style={{ width: size, height: size, background: bg, borderRadius: isTerminal ? 3 : '50%' }}
        title={station.name}
      />
    </Marker>
  );
}

// ── Bus Popup ──────────────────────────────────────────────────
function BusPopup({ bus, onClose, followed, onFollow }) {
  const sourceLabel = bus.gpsSource === 'firebase' ? '● FIREBASE' : bus.gpsSource === 'hardware' ? '● ESP32' : '● LIVE';
  return (
    <Popup longitude={bus.lng} latitude={bus.lat} anchor="bottom" offset={22} onClose={onClose} closeButton className="dart-popup">
      <div className="text-xs min-w-[210px] p-1">
        {bus.outOfArea && (
          <div className="flex items-center gap-1.5 bg-orange-100 text-orange-700 rounded-lg px-2 py-1.5 mb-2 font-semibold">
            <span>⚠️</span><span>Route Not Found — outside Dar es Salaam</span>
          </div>
        )}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-base">🚌</span>
          <div className="flex-1">
            <div className="font-black text-sm text-gray-900">{bus.id}</div>
            <div className="text-gray-500">{bus.routeShort} · {bus.routeName}</div>
          </div>
          <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-green-500 text-white">{sourceLabel}</span>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs mb-3">
          <span className="text-gray-400">Speed</span><span className="font-semibold">{Math.round(bus.speed || 0)} km/h</span>
          <span className="text-gray-400">Next Stop</span><span className="font-semibold truncate">{bus.outOfArea ? 'N/A' : (bus.nextStation || '—')}</span>
          <span className="text-gray-400">ETA</span><span className="font-semibold text-green-600">{bus.outOfArea ? '—' : `${bus.etaMinutes ?? '—'} min`}</span>
          <span className="text-gray-400">Passengers</span><span className="font-semibold">{bus.passengers ?? '—'}/{bus.capacity}</span>
          <span className="text-gray-400">Driver</span><span className="font-semibold">{bus.driver || '—'}</span>
          {bus.satellites != null && <><span className="text-gray-400">Satellites</span><span className="font-semibold">{bus.satellites}</span></>}
          <span className="text-gray-400">Updated</span><span className="font-semibold">{bus.lastUpdate ? new Date(bus.lastUpdate).toLocaleTimeString() : '—'}</span>
        </div>
        <button onClick={onFollow} className={`w-full py-1.5 rounded text-xs font-bold transition-colors ${followed ? 'bg-dart-red text-white hover:bg-red-700' : 'bg-gray-800 text-white hover:bg-gray-600'}`}>
          {followed ? '✕ Stop Following' : '📍 Follow This Bus'}
        </button>
      </div>
    </Popup>
  );
}

// ── Station Popup ──────────────────────────────────────────────
function StationPopup({ station, arrivals, onClose }) {
  return (
    <Popup longitude={station.lng} latitude={station.lat} anchor="bottom" offset={14} onClose={onClose} closeButton>
      <div className="text-xs min-w-[180px] p-1">
        <div className="font-black text-sm text-gray-900 mb-0.5">{station.type === 'terminal' ? '🏛️' : '🏢'} {station.name}</div>
        <div className="text-gray-400 capitalize mb-2">Phase {station.phase} · {station.type}</div>
        <div className="font-semibold text-gray-600 mb-1">Incoming Buses</div>
        {!arrivals || arrivals.length === 0
          ? <div className="text-gray-400">No buses nearby</div>
          : arrivals.slice(0, 4).map((a, i) => (
              <div key={i} className="flex justify-between gap-3 mb-0.5">
                <span className="font-semibold">{a.busId}</span>
                <span className="text-gray-500 truncate">{a.routeName}</span>
                <span className="text-green-600 font-bold">{a.etaMinutes}m</span>
              </div>
            ))
        }
      </div>
    </Popup>
  );
}

// ── Nearest stop chip ──────────────────────────────────────────
function NearestStopBadge({ location, stations, onSetDestination }) {
  if (!location) return null;
  const nearest = stations.reduce((best, st) => {
    const d = haversineKm(location.lat, location.lng, st.lat, st.lng);
    return (!best || d < best.dist) ? { ...st, dist: d } : best;
  }, null);
  if (!nearest) return null;
  const distM = Math.round(nearest.dist * 1000);
  return (
    <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-white/95 backdrop-blur-sm shadow-lg rounded-full px-3 py-2 text-xs">
      <span className="text-blue-500">📍</span>
      <span className="font-semibold text-gray-800">Nearest stop:</span>
      <span className="text-dart-blue font-black">{nearest.name}</span>
      <span className="text-gray-400">{distM < 1000 ? `${distM} m` : `${(distM/1000).toFixed(1)} km`}</span>
      <button
        onClick={() => onSetDestination(nearest)}
        className="ml-1 bg-dart-blue text-white rounded-full px-2 py-0.5 font-bold hover:bg-blue-700 transition-colors"
      >
        Get Directions
      </button>
    </div>
  );
}

// ── Route Legend ───────────────────────────────────────────────
function MapLegend({ routes }) {
  const phase1 = routes.filter(r => (r.phase || 1) === 1 && r.active);
  const phase2 = routes.filter(r => r.phase === 2 && r.active);
  return (
    <div className="absolute bottom-8 left-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-3 z-10 max-w-[175px]">
      <div className="text-xs font-black text-gray-700 mb-2 uppercase tracking-wide">Routes</div>
      <div className="space-y-1">
        {phase1.map(r => (
          <div key={r.id} className="flex items-center gap-2">
            <div className="w-5 h-2 rounded-full flex-shrink-0" style={{ background: r.color }} />
            <span className="text-xs text-gray-700 leading-none truncate">{r.shortName} {r.name}</span>
          </div>
        ))}
        {phase2.length > 0 && (
          <>
            <div className="text-xs font-bold text-orange-600 mt-1 pt-1 border-t border-gray-200">Phase 2</div>
            {phase2.map(r => (
              <div key={r.id} className="flex items-center gap-2">
                <div className="w-5 h-2 rounded-full flex-shrink-0" style={{ background: r.color }} />
                <span className="text-xs text-gray-700 leading-none">P2 Mbagala</span>
              </div>
            ))}
          </>
        )}
      </div>
      <div className="mt-2 pt-2 border-t border-gray-200 space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gray-900 border border-white flex-shrink-0" />
          <span className="text-xs text-gray-500">Terminal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white flex-shrink-0" />
          <span className="text-xs text-gray-500">Your location</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded bg-green-500 flex-shrink-0" />
          <span className="text-xs text-gray-500">LIVE = ESP32 GPS</span>
        </div>
      </div>
    </div>
  );
}

function NoBusesOverlay() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl px-8 py-6 flex flex-col items-center gap-3 max-w-xs text-center pointer-events-auto">
        <div className="text-4xl">📡</div>
        <div className="font-black text-gray-800 text-base">Waiting for GPS Signal</div>
        <p className="text-sm text-gray-500 leading-snug">
          Buses appear automatically when an ESP32 GPS tracker comes online.
        </p>
        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
          <span className="w-2 h-2 rounded-full bg-gray-300 animate-pulse" />
          Listening for live data…
        </div>
      </div>
    </div>
  );
}

function FollowHUD({ bus, onStop }) {
  if (!bus) return null;
  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-gray-900/90 text-white text-xs px-3 py-1.5 rounded-full shadow-lg">
      <span className="w-2 h-2 rounded-full bg-dart-red animate-pulse" />
      <span>Following <strong>{bus.id}</strong> · {Math.round(bus.speed || 0)} km/h</span>
      <button onClick={onStop} className="ml-1 text-gray-400 hover:text-white transition-colors">✕</button>
    </div>
  );
}

function OutOfAreaBanner({ buses }) {
  const out = buses.filter(b => b.status === 'active' && b.outOfArea);
  if (!out.length) return null;
  return (
    <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5">
      {out.map(bus => (
        <div key={bus.id} className="flex items-center gap-2 bg-orange-500 text-white text-xs px-3 py-1.5 rounded-full shadow-lg">
          <span>⚠️</span>
          <span><strong>{bus.id}</strong> — Route Not Found (outside Dar es Salaam)</span>
        </div>
      ))}
    </div>
  );
}

// ── Main Map ───────────────────────────────────────────────────
export default function LiveMap() {
  const buses            = useDartStore(s => s.buses);
  const routes           = useDartStore(s => s.routes);
  const stations         = useDartStore(s => s.stations);
  const waypoints        = useDartStore(s => s.waypoints);
  const stationArrivals  = useDartStore(s => s.stationArrivals);
  const setSelectedBus     = useDartStore(s => s.setSelectedBus);
  const setSelectedStation = useDartStore(s => s.setSelectedStation);

  const mapRef       = useRef(null);
  const directionsRef = useRef(null); // MapboxDirections instance

  const [viewState, setViewState] = useState(INITIAL_VIEW);
  const [popupBus,  setPopupBus]  = useState(null);
  const [popupSt,   setPopupSt]   = useState(null);
  const [followId,  setFollowId]  = useState(null);
  const [showDirections, setShowDirections] = useState(false);

  // Road-snapped routes (Mapbox Directions API, cached 24 h)
  const snappedGeoJSON  = useRoadSnappedRoutes(routes, waypoints);
  const fallbackGeoJSON = useMemo(() => buildFallbackGeoJSON(routes, waypoints), [routes, waypoints]);
  const routeGeoJSON    = snappedGeoJSON ?? fallbackGeoJSON;

  // User's live GPS location
  const { location: userLocation } = useGeolocation();

  // Active buses only
  const activeBuses = useMemo(
    () => buses.filter(b => b.status === 'active' && b.lat != null && b.lng != null),
    [buses]
  );

  // ── Mapbox Directions control — added once after map loads ────
  const handleMapLoad = useCallback((e) => {
    const map = e.target;

    const directions = new MapboxDirections({
      accessToken:  MAPBOX_TOKEN,
      unit:         'metric',
      profile:      'mapbox/walking',   // walk to nearest DART stop
      language:     'en',
      controls: {
        inputs:           true,
        instructions:     true,
        profileSwitcher:  false,
      },
      geocoder: { country: 'TZ', proximity: { longitude: 39.2589, latitude: -6.82 } },
    });

    // Hide initially; toggle via button
    directions.container = null; // prevents auto-attach
    directionsRef.current = directions;

    // If geolocation already available, pre-fill origin
    if (userLocation) {
      directions.setOrigin([userLocation.lng, userLocation.lat]);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── When user location arrives, update the Directions origin ──
  useEffect(() => {
    if (!userLocation || !directionsRef.current) return;
    directionsRef.current.setOrigin([userLocation.lng, userLocation.lat]);
  }, [userLocation]);

  // ── When Directions panel is toggled, add/remove map control ──
  useEffect(() => {
    if (!mapRef.current || !directionsRef.current) return;
    const map = mapRef.current.getMap();
    if (showDirections) {
      map.addControl(directionsRef.current, 'top-left');
      // Ensure origin is set to current location
      if (userLocation) {
        directionsRef.current.setOrigin([userLocation.lng, userLocation.lat]);
      }
    } else {
      try { map.removeControl(directionsRef.current); } catch {}
    }
  }, [showDirections]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Pan to user location ───────────────────────────────────────
  useEffect(() => {
    if (!userLocation || followId) return;
    // Pan to user once on first fix, but don't lock the map
  }, [userLocation?.lat, userLocation?.lng]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Camera follow bus ─────────────────────────────────────────
  useEffect(() => {
    if (!followId) return;
    const bus = activeBuses.find(b => b.id === followId);
    if (!bus) { setFollowId(null); return; }
    setViewState(prev => ({
      ...prev,
      longitude: bus.lng, latitude: bus.lat,
      zoom: Math.max(prev.zoom, 15),
      pitch: 55, bearing: bus.heading || 0,
    }));
    setPopupBus(prev => (prev && prev.id === followId ? bus : prev));
  }, [activeBuses, followId]);

  const followedBus = followId ? activeBuses.find(b => b.id === followId) : null;

  const handleBusClick     = useCallback((bus, e) => { e?.originalEvent?.stopPropagation(); setPopupBus(bus); setPopupSt(null); setSelectedBus(bus); },     [setSelectedBus]);
  const handleStationClick = useCallback((st,  e) => { e?.originalEvent?.stopPropagation(); setPopupSt(st);  setPopupBus(null); setSelectedStation(st); }, [setSelectedStation]);

  const handleFollow = useCallback((bus) => {
    if (followId === bus.id) { setFollowId(null); setViewState(p => ({ ...p, pitch: 0, bearing: 0 })); }
    else setFollowId(bus.id);
  }, [followId]);

  const stopFollowing = useCallback(() => {
    setFollowId(null); setViewState(p => ({ ...p, pitch: 0, bearing: 0 }));
  }, []);

  // "Get directions to nearest stop" sets destination in the Directions control
  const handleSetDestination = useCallback((station) => {
    setShowDirections(true);
    // Give the control time to mount before setting destination
    setTimeout(() => {
      directionsRef.current?.setDestination([station.lng, station.lat]);
    }, 300);
  }, []);

  // Pan to user's location button
  const panToUser = useCallback(() => {
    if (!userLocation) return;
    setViewState(prev => ({ ...prev, longitude: userLocation.lng, latitude: userLocation.lat, zoom: 16, pitch: 0 }));
    setFollowId(null);
  }, [userLocation]);

  return (
    <div className="relative w-full h-full">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={e => { if (e.originalEvent) setFollowId(null); setViewState(e.viewState); }}
        onLoad={handleMapLoad}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
      >
        <NavigationControl position="top-right" />
        <ScaleControl position="bottom-right" unit="metric" />
        <AttributionControl compact position="bottom-right" />

        {/* DART route lines — road-snapped */}
        {routeGeoJSON.features.length > 0 && (
          <Source id="routes" type="geojson" data={routeGeoJSON}>
            <Layer {...routeCasingLayer} />
            <Layer {...routeLineLayer} />
          </Source>
        )}

        {/* Station markers */}
        {stations.map(st => (
          <StationMarker key={st.id} station={st} onClick={e => handleStationClick(st, e)} />
        ))}

        {/* Active bus markers */}
        {activeBuses.map(bus => {
          const route = routes.find(r => r.id === bus.routeId);
          return (
            <BusMarker
              key={bus.id} bus={bus}
              routeColor={route?.color || '#E53935'}
              onClick={e => handleBusClick(bus, e)}
              isFollowed={followId === bus.id}
            />
          );
        })}

        {/* User's live location */}
        <UserLocationMarker location={userLocation} />

        {/* Bus popup */}
        {popupBus && (() => {
          const live = activeBuses.find(b => b.id === popupBus.id);
          if (!live) return null;
          return (
            <BusPopup bus={live} onClose={() => setPopupBus(null)} followed={followId === live.id} onFollow={() => handleFollow(live)} />
          );
        })()}

        {/* Station popup */}
        {popupSt && (
          <StationPopup station={popupSt} arrivals={stationArrivals[popupSt.id]} onClose={() => setPopupSt(null)} />
        )}
      </Map>

      {/* ── Floating UI ─────────────────────────────────────── */}

      {/* Follow HUD */}
      <FollowHUD bus={followedBus} onStop={stopFollowing} />

      {/* Out-of-area warnings */}
      <OutOfAreaBanner buses={buses} />

      {/* No buses waiting state */}
      {activeBuses.length === 0 && <NoBusesOverlay />}

      {/* Nearest stop + Get Directions chip */}
      {!showDirections && (
        <NearestStopBadge
          location={userLocation}
          stations={stations}
          onSetDestination={handleSetDestination}
        />
      )}

      {/* My Location button */}
      {userLocation && (
        <button
          onClick={panToUser}
          className="absolute bottom-24 right-3 z-20 bg-white shadow-lg rounded-full w-10 h-10 flex items-center justify-center text-base hover:bg-gray-50 transition-colors border border-gray-200"
          title="Pan to my location"
        >
          🎯
        </button>
      )}

      {/* Directions toggle button */}
      <button
        onClick={() => setShowDirections(d => !d)}
        className={`absolute top-14 right-3 z-20 flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-full shadow-lg transition-colors ${
          showDirections
            ? 'bg-dart-blue text-white'
            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
        }`}
        title="Toggle walking directions"
      >
        {showDirections ? '✕ Close' : '🧭 Directions'}
      </button>

      <MapLegend routes={routes} />
    </div>
  );
}
