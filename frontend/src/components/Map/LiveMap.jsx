import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import Map, {
  Source, Layer,
  Marker, Popup,
  NavigationControl,
  ScaleControl,
  AttributionControl,
} from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import useDartStore from '../../store/dartStore';

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

// ── Route GeoJSON ──────────────────────────────────────────────
function buildRouteGeoJSON(routes, waypoints) {
  return {
    type: 'FeatureCollection',
    features: routes
      .filter(r => r.active && waypoints[r.id])
      .map(r => ({
        type: 'Feature',
        properties: { color: r.color, name: r.name, id: r.id, phase: r.phase || 1 },
        geometry: {
          type: 'LineString',
          // backend stores [lat, lng] → GeoJSON needs [lng, lat]
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
  paint: {
    'line-color': ['get', 'color'],
    'line-width': 5,
    'line-opacity': 0.85,
  },
};

// ── Bus Marker ─────────────────────────────────────────────────
function BusMarker({ bus, routeColor, onClick, isLive, isFollowed }) {
  const label = bus.id.replace('DART', '');
  return (
    <Marker longitude={bus.lng} latitude={bus.lat} anchor="center" onClick={onClick}>
      <div className="relative cursor-pointer" style={{ width: 40, height: 40 }}>
        {/* Pulse ring – brighter when followed */}
        <div
          className="bus-pulse-ring"
          style={{ background: isFollowed ? routeColor + '88' : routeColor + '44' }}
        />
        {/* Circle */}
        <div
          className="w-full h-full rounded-full flex items-center justify-center text-white font-black text-xs shadow-lg select-none"
          style={{
            background: routeColor,
            fontSize: 11,
            border: isFollowed ? '3px solid #fff' : '2px solid #fff',
          }}
        >
          {label}
        </div>
        {/* LIVE / SIM badge */}
        <div
          className={`absolute -top-1 -right-1 text-white text-[7px] font-black rounded px-0.5 leading-tight ${
            isLive ? 'bg-green-500' : 'bg-gray-400'
          }`}
        >
          {isLive ? 'LIVE' : 'SIM'}
        </div>
        {/* Follow indicator */}
        {isFollowed && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full shadow" />
        )}
      </div>
    </Marker>
  );
}

// ── Station Marker ─────────────────────────────────────────────
function StationMarker({ station, onClick }) {
  const isTerminal = station.type === 'terminal';
  const isPhase2   = station.phase === 2;
  const bg = isPhase2 ? '#FF6F00' : isTerminal ? '#212121' : '#1E88E5';
  const size = isTerminal ? 18 : 12;
  return (
    <Marker longitude={station.lng} latitude={station.lat} anchor="center" onClick={onClick}>
      <div
        className="rounded cursor-pointer border-2 border-white shadow-md"
        style={{
          width: size, height: size,
          background: bg,
          borderRadius: isTerminal ? 3 : '50%',
        }}
        title={station.name}
      />
    </Marker>
  );
}

// ── Bus Popup ──────────────────────────────────────────────────
function BusPopup({ bus, onClose, followed, onFollow }) {
  const isLive = bus.gpsSource === 'firebase';
  return (
    <Popup
      longitude={bus.lng} latitude={bus.lat}
      anchor="bottom" offset={22}
      onClose={onClose}
      closeButton={true}
      className="dart-popup"
    >
      <div className="text-xs min-w-[210px] p-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-base">🚌</span>
          <div className="flex-1">
            <div className="font-black text-sm text-gray-900">{bus.id}</div>
            <div className="text-gray-500">{bus.routeShort} · {bus.routeName}</div>
          </div>
          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${isLive ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
            {isLive ? '● LIVE GPS' : '◌ SIMULATED'}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs mb-3">
          <span className="text-gray-400">Speed</span>
          <span className="font-semibold">{Math.round(bus.speed || 0)} km/h</span>
          <span className="text-gray-400">Heading</span>
          <span className="font-semibold">{bus.heading != null ? `${Math.round(bus.heading)}°` : '—'}</span>
          <span className="text-gray-400">Next Stop</span>
          <span className="font-semibold truncate">{bus.nextStation || '—'}</span>
          <span className="text-gray-400">ETA</span>
          <span className="font-semibold text-green-600">{bus.etaMinutes ?? '—'} min</span>
          <span className="text-gray-400">Passengers</span>
          <span className="font-semibold">{bus.passengers ?? '—'}/{bus.capacity}</span>
          <span className="text-gray-400">Driver</span>
          <span className="font-semibold">{bus.driver || '—'}</span>
          {isLive && bus.satellites != null && (
            <>
              <span className="text-gray-400">Satellites</span>
              <span className="font-semibold">{bus.satellites}</span>
            </>
          )}
          <span className="text-gray-400">Updated</span>
          <span className="font-semibold">
            {bus.lastUpdate ? new Date(bus.lastUpdate).toLocaleTimeString() : '—'}
          </span>
        </div>
        {/* Follow / Unfollow toggle */}
        <button
          onClick={onFollow}
          className={`w-full py-1.5 rounded text-xs font-bold transition-colors ${
            followed
              ? 'bg-dart-red text-white hover:bg-red-700'
              : 'bg-gray-800 text-white hover:bg-gray-600'
          }`}
        >
          {followed ? '✕ Stop Following' : '📍 Follow This Bus'}
        </button>
      </div>
    </Popup>
  );
}

// ── Station Popup ──────────────────────────────────────────────
function StationPopup({ station, arrivals, onClose }) {
  return (
    <Popup
      longitude={station.lng} latitude={station.lat}
      anchor="bottom" offset={14}
      onClose={onClose}
      closeButton={true}
    >
      <div className="text-xs min-w-[180px] p-1">
        <div className="font-black text-sm text-gray-900 mb-0.5">
          {station.type === 'terminal' ? '🏛️' : '🏢'} {station.name}
        </div>
        <div className="text-gray-400 capitalize mb-2">
          Phase {station.phase} · {station.type}
        </div>
        <div className="font-semibold text-gray-600 mb-1">Incoming Buses</div>
        {!arrivals || arrivals.length === 0 ? (
          <div className="text-gray-400">No buses nearby</div>
        ) : (
          arrivals.slice(0, 4).map((a, i) => (
            <div key={i} className="flex justify-between gap-3 mb-0.5">
              <span className="font-semibold">{a.busId}</span>
              <span className="text-gray-500 truncate">{a.routeName}</span>
              <span className="text-green-600 font-bold">{a.etaMinutes}m</span>
            </div>
          ))
        )}
      </div>
    </Popup>
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
          <div className="w-3 h-3 rounded-full bg-dart-blue border border-white flex-shrink-0" />
          <span className="text-xs text-gray-500">Station</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded bg-green-500 flex-shrink-0" />
          <span className="text-xs text-gray-500">LIVE badge = ESP32</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded bg-gray-400 flex-shrink-0" />
          <span className="text-xs text-gray-500">SIM badge = simulated</span>
        </div>
      </div>
    </div>
  );
}

// ── Follow HUD ─────────────────────────────────────────────────
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

// ── Main Map ───────────────────────────────────────────────────
export default function LiveMap() {
  const buses            = useDartStore(s => s.buses);
  const routes           = useDartStore(s => s.routes);
  const stations         = useDartStore(s => s.stations);
  const waypoints        = useDartStore(s => s.waypoints);
  const stationArrivals  = useDartStore(s => s.stationArrivals);
  const firebaseLive     = useDartStore(s => s.firebaseLive);
  const setSelectedBus     = useDartStore(s => s.setSelectedBus);
  const setSelectedStation = useDartStore(s => s.setSelectedStation);

  const mapRef = useRef(null);
  const [viewState, setViewState]   = useState(INITIAL_VIEW);
  const [popupBus,  setPopupBus]    = useState(null);
  const [popupSt,   setPopupSt]     = useState(null);
  const [followId,  setFollowId]    = useState(null); // bus ID being followed

  const routeGeoJSON = useMemo(
    () => buildRouteGeoJSON(routes, waypoints),
    [routes, waypoints]
  );

  // ── Camera follow ──────────────────────────────────────────
  useEffect(() => {
    if (!followId) return;
    const bus = buses.find(b => b.id === followId);
    if (!bus || bus.lat == null || bus.lng == null) return;

    setViewState(prev => ({
      ...prev,
      longitude: bus.lng,
      latitude:  bus.lat,
      zoom: Math.max(prev.zoom, 15),
      pitch:   55,
      bearing: bus.heading || 0,
    }));

    // Also keep the popup in sync
    setPopupBus(prev => (prev && prev.id === followId ? bus : prev));
  }, [buses, followId]);

  const followedBus = followId ? buses.find(b => b.id === followId) : null;

  const handleBusClick = useCallback((bus, e) => {
    e?.originalEvent?.stopPropagation();
    setPopupBus(bus);
    setPopupSt(null);
    setSelectedBus(bus);
  }, [setSelectedBus]);

  const handleStationClick = useCallback((st, e) => {
    e?.originalEvent?.stopPropagation();
    setPopupSt(st);
    setPopupBus(null);
    setSelectedStation(st);
  }, [setSelectedStation]);

  const handleFollow = useCallback((bus) => {
    if (followId === bus.id) {
      // Unfollow — restore flat view
      setFollowId(null);
      setViewState(prev => ({ ...prev, pitch: 0, bearing: 0 }));
    } else {
      setFollowId(bus.id);
    }
  }, [followId]);

  const stopFollowing = useCallback(() => {
    setFollowId(null);
    setViewState(prev => ({ ...prev, pitch: 0, bearing: 0 }));
  }, []);

  return (
    <div className="relative w-full h-full">
      <Map
        ref={mapRef}
        {...viewState}
        onMove={e => {
          // If user drags the map while following, stop following
          if (e.originalEvent) setFollowId(null);
          setViewState(e.viewState);
        }}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
      >
        <NavigationControl position="top-right" />
        <ScaleControl position="bottom-right" unit="metric" />
        <AttributionControl compact position="bottom-right" />

        {/* Route lines */}
        {routeGeoJSON.features.length > 0 && (
          <Source id="routes" type="geojson" data={routeGeoJSON}>
            <Layer {...routeCasingLayer} />
            <Layer {...routeLineLayer} />
          </Source>
        )}

        {/* Station markers */}
        {stations.map(st => (
          <StationMarker
            key={st.id}
            station={st}
            onClick={e => handleStationClick(st, e)}
          />
        ))}

        {/* Bus markers */}
        {buses.map(bus => {
          if (bus.lat == null || bus.lng == null) return null;
          const route  = routes.find(r => r.id === bus.routeId);
          const isLive = bus.gpsSource === 'firebase';
          return (
            <BusMarker
              key={bus.id}
              bus={bus}
              routeColor={route?.color || '#E53935'}
              onClick={e => handleBusClick(bus, e)}
              isLive={isLive}
              isFollowed={followId === bus.id}
            />
          );
        })}

        {/* Bus popup */}
        {popupBus && (
          <BusPopup
            bus={buses.find(b => b.id === popupBus.id) || popupBus}
            onClose={() => setPopupBus(null)}
            followed={followId === popupBus.id}
            onFollow={() => handleFollow(popupBus)}
          />
        )}

        {/* Station popup */}
        {popupSt && (
          <StationPopup
            station={popupSt}
            arrivals={stationArrivals[popupSt.id]}
            onClose={() => setPopupSt(null)}
          />
        )}
      </Map>

      {/* Follow HUD overlay */}
      <FollowHUD bus={followedBus} onStop={stopFollowing} />

      <MapLegend routes={routes} />
    </div>
  );
}
