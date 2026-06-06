import React from 'react';
import useDartStore from '../../store/dartStore';

export default function StatsCards() {
  const getStats = useDartStore(s => s.getStats);
  const { activeBuses, activeRoutes, activeStations, avgEta } = getStats();

  const cards = [
    { label: 'Active Buses',    value: activeBuses,   icon: '🚌', color: 'border-dart-red',   bg: 'bg-red-50'   },
    { label: 'Active Routes',   value: activeRoutes,  icon: '🗺️', color: 'border-dart-blue',  bg: 'bg-blue-50'  },
    { label: 'Stations',        value: activeStations, icon: '🏢', color: 'border-dart-green', bg: 'bg-green-50' },
    { label: 'Avg ETA (min)',   value: avgEta,        icon: '⏱️', color: 'border-yellow-400', bg: 'bg-yellow-50' },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 p-3">
      {cards.map(c => (
        <div key={c.label} className={`${c.bg} border-l-4 ${c.color} rounded-lg p-3`}>
          <div className="text-xl">{c.icon}</div>
          <div className="text-2xl font-black text-dart-dark">{c.value}</div>
          <div className="text-xs text-gray-500 mt-0.5">{c.label}</div>
        </div>
      ))}
    </div>
  );
}
