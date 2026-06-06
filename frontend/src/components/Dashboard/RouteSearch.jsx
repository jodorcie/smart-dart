import React from 'react';
import useDartStore from '../../store/dartStore';

export default function RouteSearch() {
  const {
    stations, searchOrigin, searchDest, searchResults,
    setSearchOrigin, setSearchDest, runSearch, setSelectedBus,
    focusedRouteId, setFocusedRoute, clearFocusedRoute,
  } = useDartStore();

  const stationNames = stations.map(s => s.name);

  const handleSelectRoute = (route) => {
    // Toggle: clicking same route clears the focus
    if (focusedRouteId === route.id) {
      clearFocusedRoute();
    } else {
      setFocusedRoute(route.id);
    }
  };

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
      {focusedRouteId && (
        <div className="mt-2 flex items-center justify-between bg-dart-blue/10 border border-dart-blue/30 rounded-lg px-2.5 py-1.5">
          <span className="text-xs text-dart-blue font-semibold">🔍 Route filtered on map</span>
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
          <div className="text-xs text-gray-500 font-medium">{searchResults.length} route(s) found</div>
          {searchResults.map(({ route, buses: rb }) => {
            const isFocused = focusedRouteId === route.id;
            return (
              <div
                key={route.id}
                className={`border rounded-lg p-2.5 shadow-sm cursor-pointer transition-all ${
                  isFocused
                    ? 'bg-white border-2 shadow-md'
                    : 'bg-white border-gray-200 hover:border-gray-400'
                }`}
                style={ isFocused ? { borderColor: route.color } : {} }
                onClick={() => handleSelectRoute(route)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-white text-xs font-bold px-2 py-0.5 rounded" style={{ background: route.color }}>
                      {route.shortName}
                    </span>
                    <span className="text-sm font-medium text-dart-dark">{route.name}</span>
                  </div>
                  {isFocused && (
                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded text-white" style={{ background: route.color }}>
                      FOCUSED
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
          })}
        </div>
      )}

      {searchResults.length === 0 && searchOrigin && searchDest && (
        <div className="mt-2 text-xs text-gray-400 text-center">No routes connect these stations.</div>
      )}
    </div>
  );
}
