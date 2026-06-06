import React from 'react';
import LiveMap from '../components/Map/LiveMap';
import StatsCards from '../components/Dashboard/StatsCards';
import RouteSearch from '../components/Dashboard/RouteSearch';
import InfoPanel from '../components/Dashboard/InfoPanel';
import useDartStore from '../store/dartStore';

export default function PassengerDashboard() {
  const buses = useDartStore(s => s.buses);
  const connectionStatus = useDartStore(s => s.connectionStatus);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className="w-80 bg-white shadow-xl flex flex-col overflow-y-auto z-10 flex-shrink-0">
        {/* Header */}
        <div className="bg-gradient-to-r from-dart-dark to-gray-800 text-white px-4 py-3">
          <div className="text-sm font-black tracking-wide">PASSENGER INFORMATION</div>
          <div className="text-xs text-gray-400 mt-0.5">
            {buses.length} buses tracked · Updates every 5s
          </div>
        </div>

        <StatsCards />

        {/* Bus list */}
        <div className="px-3 pb-1">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Live Fleet</div>
          <div className="space-y-1.5">
            {buses.map(bus => <BusListItem key={bus.id} bus={bus} />)}
          </div>
        </div>

        <RouteSearch />
      </aside>

      {/* ── Map + Info Panel ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col relative">
        {/* Map fills remaining space */}
        <div className="flex-1 relative">
          <LiveMap />

          {/* Connection overlay */}
          {connectionStatus !== 'connected' && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-yellow-500 text-white text-xs px-3 py-1.5 rounded-full shadow z-50 font-semibold">
              {connectionStatus === 'connecting' ? '⏳ Connecting to DART server…' : '⚠ Connection lost – retrying…'}
            </div>
          )}
        </div>

        {/* Info panel floats above the map bottom */}
        <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
          <div className="pointer-events-auto">
            <InfoPanel />
          </div>
        </div>
      </div>
    </div>
  );
}

function BusListItem({ bus }) {
  const setSelectedBus = useDartStore(s => s.setSelectedBus);
  const routes = useDartStore(s => s.routes);
  const route = routes.find(r => r.id === bus.routeId);

  return (
    <button
      onClick={() => setSelectedBus(bus)}
      className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 border border-gray-100 transition-colors text-left"
    >
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-black flex-shrink-0"
        style={{ background: route?.color || '#888' }}
      >
        {bus.id.replace('DART', '')}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-dart-dark truncate">{bus.id}</div>
        <div className="text-xs text-gray-400 truncate">{bus.routeShort} · {Math.round(bus.speed || 0)} km/h</div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-xs font-bold text-dart-green">{bus.etaMinutes ?? '–'} min</div>
        <div className={`text-xs capitalize ${bus.status === 'active' ? 'text-green-500' : 'text-gray-400'}`}>{bus.status}</div>
      </div>
    </button>
  );
}
