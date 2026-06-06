import React from 'react';
import LiveMap from '../components/Map/LiveMap';
import StatsCards from '../components/Dashboard/StatsCards';
import RouteSearch from '../components/Dashboard/RouteSearch';
import InfoPanel from '../components/Dashboard/InfoPanel';
import useDartStore from '../store/dartStore';

export default function PassengerDashboard() {
  const buses           = useDartStore(s => s.buses);
  const connectionStatus = useDartStore(s => s.connectionStatus);

  const activeBuses  = buses.filter(b => b.status === 'active');
  const offlineBuses = buses.filter(b => b.status !== 'active');

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className="w-80 bg-white shadow-xl flex flex-col overflow-y-auto z-10 flex-shrink-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-dart-dark to-gray-800 text-white px-4 py-3">
          <div className="text-sm font-black tracking-wide">PASSENGER INFORMATION</div>
          <div className="text-xs text-gray-400 mt-0.5">
            {activeBuses.length > 0
              ? `${activeBuses.length} bus${activeBuses.length === 1 ? '' : 'es'} live · GPS tracking`
              : 'Waiting for GPS signal…'}
          </div>
        </div>

        <StatsCards />

        {/* Bus list */}
        <div className="px-3 pb-1">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Live Fleet</div>

          {activeBuses.length === 0 ? (
            /* No buses online — waiting state */
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <div className="text-2xl">📡</div>
              <div className="text-sm font-semibold text-gray-600">No buses currently online</div>
              <p className="text-xs text-gray-400 leading-snug px-2">
                Buses will appear here automatically once an ESP32 GPS tracker comes online.
              </p>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300 animate-pulse" />
                Listening for GPS data…
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              {activeBuses.map(bus => (
                <BusListItem key={bus.id} bus={bus} />
              ))}
            </div>
          )}

          {/* Offline section — collapsed by default */}
          {offlineBuses.length > 0 && (
            <details className="mt-3">
              <summary className="text-xs text-gray-400 cursor-pointer hover:text-gray-600 transition-colors select-none">
                {offlineBuses.length} bus{offlineBuses.length === 1 ? '' : 'es'} offline
              </summary>
              <div className="space-y-1 mt-1.5">
                {offlineBuses.map(bus => (
                  <OfflineBusItem key={bus.id} bus={bus} />
                ))}
              </div>
            </details>
          )}
        </div>

        <RouteSearch />
      </aside>

      {/* ── Map + Info Panel ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col relative">
        <div className="flex-1 relative">
          <LiveMap />

          {/* Connection status overlay */}
          {connectionStatus !== 'connected' && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-white text-xs px-3 py-1.5 rounded-full shadow z-50 font-semibold">
              {connectionStatus === 'connecting'
                ? '⏳ Connecting to DART server…'
                : '⚠ Connection lost – retrying…'}
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
          <div className="pointer-events-auto">
            <InfoPanel />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Active bus list item ───────────────────────────────────────
function BusListItem({ bus }) {
  const setSelectedBus = useDartStore(s => s.setSelectedBus);
  const routes         = useDartStore(s => s.routes);
  const route          = routes.find(r => r.id === bus.routeId);

  return (
    <button
      onClick={() => setSelectedBus(bus)}
      className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 border border-gray-100 transition-colors text-left"
    >
      {/* Color dot */}
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
        style={{ background: route?.color || '#888' }}
      >
        {bus.id.replace('DART', '')}
      </div>

      {/* Labels */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-dart-dark truncate">{bus.id}</span>
          {bus.outOfArea && (
            <span className="text-[8px] font-black bg-orange-500 text-white rounded px-0.5 leading-tight flex-shrink-0">⚠</span>
          )}
        </div>
        <div className="text-xs text-gray-400 truncate">
          {bus.outOfArea
            ? 'Route Not Found'
            : `${bus.routeShort || ''} · ${Math.round(bus.speed || 0)} km/h`}
        </div>
      </div>

      {/* ETA / status */}
      <div className="text-right flex-shrink-0">
        {bus.outOfArea ? (
          <div className="text-xs font-bold text-orange-500">Out of area</div>
        ) : (
          <>
            <div className="text-xs font-bold text-dart-green">{bus.etaMinutes ?? '–'} min</div>
            <div className="text-xs text-green-500">live</div>
          </>
        )}
      </div>
    </button>
  );
}

// ── Offline bus (greyed out) ───────────────────────────────────
function OfflineBusItem({ bus }) {
  const routes = useDartStore(s => s.routes);
  const route  = routes.find(r => r.id === bus.routeId);
  return (
    <div className="w-full flex items-center gap-2 p-2 rounded-lg border border-gray-100 opacity-50">
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0 grayscale"
        style={{ background: route?.color || '#aaa' }}
      >
        {bus.id.replace('DART', '')}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-gray-400 truncate">{bus.id}</div>
        <div className="text-xs text-gray-300 truncate">{route?.shortName || ''} · offline</div>
      </div>
      <div className="text-xs text-gray-300">—</div>
    </div>
  );
}
