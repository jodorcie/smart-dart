import React, { useState } from 'react';
import FleetMonitor from '../components/Admin/FleetMonitor';
import RouteManager from '../components/Admin/RouteManager';
import StationManager from '../components/Admin/StationManager';
import useDartStore from '../store/dartStore';

const TABS = [
  { id: 'fleet',    label: '🚌 Fleet Monitor' },
  { id: 'routes',   label: '🗺️ Routes' },
  { id: 'stations', label: '🏢 Stations' },
];

export default function OperatorDashboard() {
  const [activeTab, setActiveTab] = useState('fleet');
  const { buses, routes, stations } = useDartStore();
  const activeBuses = buses.filter(b => b.status === 'active').length;

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-gray-100">
      {/* Admin header */}
      <div className="bg-dart-dark text-white px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xl font-black tracking-wide">OPERATOR DASHBOARD</div>
              <div className="text-xs text-gray-400 mt-0.5">Fleet Management & Operations Control</div>
            </div>
            <div className="flex gap-4 text-center">
              <Stat label="Buses"    value={activeBuses}      total={buses.length}    color="text-dart-red" />
              <Stat label="Routes"   value={routes.filter(r=>r.active).length} total={routes.length}   color="text-dart-blue" />
              <Stat label="Stations" value={stations.filter(s=>s.active).length} total={stations.length} color="text-dart-green" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tab bar */}
        <div className="flex gap-1 bg-white rounded-xl shadow-sm p-1 mb-6 w-fit">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === t.id
                  ? 'bg-dart-dark text-white shadow'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Panel */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          {activeTab === 'fleet'    && <FleetMonitor />}
          {activeTab === 'routes'   && <RouteManager />}
          {activeTab === 'stations' && <StationManager />}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, total, color }) {
  return (
    <div>
      <div className={`text-2xl font-black ${color}`}>{value}<span className="text-sm text-gray-400">/{total}</span></div>
      <div className="text-xs text-gray-400">{label}</div>
    </div>
  );
}
