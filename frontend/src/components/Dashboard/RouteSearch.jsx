import React from 'react';
import useDartStore from '../../store/dartStore';

export default function RouteSearch() {
  const {
    stations, searchOrigin, searchDest, searchResults,
    setSearchOrigin, setSearchDest, runSearch, setSelectedBus,
    focusedRouteIds, setFocusedRoute, clearFocusedRoute,
  } = useDartStore();

  const stationNames = stations.map(s => s.name);

  // ── Direct result card ────────────────────────────────────────
  function DirectCard({ result }) {
    const { route, buses: rb, key } = result;
    const isFocused = focusedRouteIds.length === 1 && focusedRouteIds[0] === route.id;

    const handleClick = () => {
      isFocused ? clearFocusedRoute() : setFocusedRoute(route.id);
    };

    return (
      <div
        className={`border rounded-lg p-2.5 shadow-sm cursor-pointer transition-all ${
          isFocused ? 'bg-white border-2 shadow-md' : 'bg-white border-gray-200 hover:border-gray-400'
        }`}
        style={isFocused ? { borderColor: route.color } : {}}
        onClick={handleClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-white text-xs font-bold px-2 py-0.5 rounded" style={{ background: route.color }}>
              {route.shortName}
            </span>
            <span className="text-sm font-medium text-dart-dark">{route.name}</span>
          </div>
          {isFocused ? (
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded text-white" style={{ background: route.color }}>
              FOCUSED
            </span>
          ) : (
            <span className="text-[10px] text-gray-400 bg-green-50 border border-green-200 text-green-700 rounded px-1.5 py-0.5 font-semibold">
              DIRECT
            </span>
          )}
        </div>

        <div className="text-xs text-gray-500 mt-1">{rb.length} bus(es) active on this route</div>

        {rb.map(b => (
          <button
            key={b.id}
            onClick={e => { e.stopPropagation(); setSelectedBus(b); }}
            className="flex items-center gap-2 mt-1 text-xs text-dart-blue hover:underline"
          >
            🚌 {b.id} — ETA {b.etaMinutes ?? '–'} min
          </button>
        ))}

        {!isFocused && (
          <div className="text-[10px] text-gray-400 mt-1.5">Tap to isolate on map</div>
        )}
      </div>
    );
  }

  // ── Transfer result card ──────────────────────────────────────
  function TransferCard({ result }) {
    const { legs, transferStation, key } = result;
    const [leg1, leg2] = legs;

    const focusKey = [leg1.route.id, leg2.route.id].sort().join('__');
    const isFocused = focusedRouteIds.length === 2 &&
      [leg1.route.id, leg2.route.id].every(id => focusedRouteIds.includes(id));

    const handleClick = () => {
      isFocused
        ? clearFocusedRoute()
        : setFocusedRoute([leg1.route.id, leg2.route.id]);
    };

    return (
      <div
        className={`border rounded-lg p-2.5 shadow-sm cursor-pointer transition-all ${
          isFocused ? 'bg-orange-50 border-2 border-orange-400 shadow-md' : 'bg-white border-gray-200 hover:border-orange-300'
        }`}
        onClick={handleClick}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-orange-100 text-orange-700 border border-orange-200">
            🔄 TRANSFER JOURNEY
          </span>
          {isFocused && (
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-orange-500 text-white">
              FOCUSED
            </span>
          )}
        </div>

        {/* Leg 1 */}
        <div className="flex items-start gap-2 mb-1">
          <span className="text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5"
            style={{ background: leg1.route.color }}>
            {leg1.route.shortName}
          </span>
          <div className="text-xs">
            <span className="font-semibold text-gray-800">{leg1.from.name}</span>
            <span className="text-gray-400 mx-1">→</span>
            <span className="font-semibold text-gray-800">{leg1.to.name}</span>
            <div className="text-gray-500 text-[10px]">{leg1.route.name} · {leg1.buses.length} bus(es)</div>
          </div>
        </div>

        {/* Transfer point */}
        <div className="flex items-center gap-1.5 my-1.5 ml-1">
          <div className="w-4 h-px bg-gray-300" />
          <span className="text-[10px] text-orange-600 font-bold bg-orange-50 border border-orange-200 rounded px-1.5 py-0.5">
            🔄 Change at {transferStation.name}
          </span>
          <div className="w-4 h-px bg-gray-300" />
        </div>

        {/* Leg 2 */}
        <div className="flex items-start gap-2">
          <span className="text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5"
            style={{ background: leg2.route.color }}>
            {leg2.route.shortName}
          </span>
          <div className="text-xs">
            <span className="font-semibold text-gray-800">{leg2.from.name}</span>
            <span className="text-gray-400 mx-1">→</span>
            <span className="font-semibold text-gray-800">{leg2.to.name}</span>
            <div className="text-gray-500 text-[10px]">{leg2.route.name} · {leg2.buses.length} bus(es)</div>
          </div>
        </div>

        {/* Bus buttons */}
        {[...leg1.buses, ...leg2.buses].length > 0 && (
          <div className="mt-2 pt-2 border-t border-gray-100 space-y-0.5">
            {leg1.buses.map(b => (
              <button key={b.id} onClick={e => { e.stopPropagation(); setSelectedBus(b); }}
                className="flex items-center gap-1.5 text-xs text-dart-blue hover:underline">
                🚌 {b.id} (Leg 1) — ETA {b.etaMinutes ?? '–'} min
              </button>
            ))}
            {leg2.buses.map(b => (
              <button key={b.id} onClick={e => { e.stopPropagation(); setSelectedBus(b); }}
                className="flex items-center gap-1.5 text-xs text-dart-blue hover:underline">
                🚌 {b.id} (Leg 2) — ETA {b.etaMinutes ?? '–'} min
              </button>
            ))}
          </div>
        )}

        {!isFocused && (
          <div className="text-[10px] text-gray-400 mt-1.5">Tap to show both routes on map</div>
        )}
      </div>
    );
  }

  return (
    <div className="p-3 border-t border-gray-200">
      <div className="font-semibold text-dart-dark text-sm mb-2">Route Search</div>

      <div className="space-y-2">
        <input
          list="origins" value={searchOrigin} placeholder="From station…"
          onChange={e => setSearchOrigin(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-dart-blue"
        />
        <datalist id="origins">{stationNames.map(n => <option key={n} value={n} />)}</datalist>

        <input
          list="dests" value={searchDest} placeholder="To station…"
          onChange={e => setSearchDest(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-dart-blue"
        />
        <datalist id="dests">{stationNames.map(n => <option key={n} value={n} />)}</datalist>

        <button
          onClick={runSearch}
          className="w-full bg-dart-red text-white rounded py-1.5 text-sm font-semibold hover:bg-red-700 transition-colors"
        >
          Search Routes
        </button>
      </div>

      {/* Active route filter badge */}
      {focusedRouteIds.length > 0 && (
        <div className="mt-2 flex items-center justify-between bg-dart-blue/10 border border-dart-blue/30 rounded-lg px-2.5 py-1.5">
          <span className="text-xs text-dart-blue font-semibold">
            🔍 {focusedRouteIds.length === 1 ? 'Route' : 'Routes'} filtered on map
          </span>
          <button
            onClick={clearFocusedRoute}
            className="text-xs text-dart-blue hover:text-blue-800 font-bold"
          >
            ✕ Show all
          </button>
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="mt-3 space-y-2">
          <div className="text-xs text-gray-500 font-medium">
            {searchResults.filter(r => r.type === 'direct').length} direct ·{' '}
            {searchResults.filter(r => r.type === 'transfer').length} with transfer
          </div>
          {searchResults.map(result =>
            result.type === 'direct'
              ? <DirectCard key={result.key} result={result} />
              : <TransferCard key={result.key} result={result} />
          )}
        </div>
      )}

      {searchResults.length === 0 && searchOrigin && searchDest && (
        <div className="mt-2 text-xs text-gray-400 text-center">No routes connect these stations.</div>
      )}
    </div>
  );
}
