import React from 'react';
import useDartStore from '../../store/dartStore';

function BusInfoPanel({ bus, onClose }) {
  const statusColor = bus.status === 'active' ? 'text-green-600' : 'text-gray-400';
  return (
    <div className="bg-white border-t-4 border-dart-red mx-3 mb-3 rounded-lg shadow-md p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🚌</span>
          <div>
            <div className="font-black text-dart-dark text-base">{bus.id}</div>
            <div className="text-xs" style={{ color: bus.routeColor }}>{bus.routeShort} – {bus.routeName}</div>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
        <InfoRow label="Status"        value={<span className={`font-semibold capitalize ${statusColor}`}>{bus.status}</span>} />
        <InfoRow label="Speed"         value={`${Math.round(bus.speed || 0)} km/h`} />
        <InfoRow label="Next Station"  value={bus.nextStation || '—'} />
        <InfoRow label="ETA"           value={bus.etaMinutes != null ? `${bus.etaMinutes} min` : '—'} />
        <InfoRow label="Passengers"    value={`${bus.passengers ?? '—'} / ${bus.capacity}`} />
        <InfoRow label="Driver"        value={bus.driver || '—'} />
        <InfoRow label="GPS Update"    value={bus.lastUpdate ? new Date(bus.lastUpdate).toLocaleTimeString() : '—'} />
        <InfoRow label="Coordinates"   value={bus.lat ? `${bus.lat.toFixed(4)}, ${bus.lng.toFixed(4)}` : '—'} />
      </div>
    </div>
  );
}

function StationInfoPanel({ station, arrivals, onClose }) {
  const incoming = arrivals || [];
  return (
    <div className="bg-white border-t-4 border-dart-blue mx-3 mb-3 rounded-lg shadow-md p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{station.type === 'terminal' ? '🏛️' : '🏢'}</span>
          <div>
            <div className="font-black text-dart-dark text-base">{station.name}</div>
            <div className="text-xs text-gray-500">Corridor {station.corridor} · {station.type}</div>
          </div>
        </div>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">&times;</button>
      </div>

      <div className="text-xs font-semibold text-gray-600 mb-1">Incoming Buses</div>
      {incoming.length === 0 ? (
        <div className="text-xs text-gray-400">No buses nearby at this time.</div>
      ) : (
        <div className="space-y-1">
          {incoming.slice(0, 5).map((a, i) => (
            <div key={i} className="flex items-center justify-between bg-gray-50 rounded px-2 py-1">
              <span className="font-semibold text-dart-dark">{a.busId}</span>
              <span className="text-gray-500 truncate max-w-[100px]">{a.routeName}</span>
              <span className="text-dart-green font-bold">{a.etaMinutes} min</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <>
      <span className="text-gray-400">{label}</span>
      <span className="text-dart-dark font-medium">{value}</span>
    </>
  );
}

export default function InfoPanel() {
  const { selectedBus, selectedStation, stationArrivals, clearSelection } = useDartStore();
  if (!selectedBus && !selectedStation) return null;

  if (selectedBus) return <BusInfoPanel bus={selectedBus} onClose={clearSelection} />;
  return (
    <StationInfoPanel
      station={selectedStation}
      arrivals={stationArrivals[selectedStation.id]}
      onClose={clearSelection}
    />
  );
}
