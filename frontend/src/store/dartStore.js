import { create } from 'zustand';

const useDartStore = create((set, get) => ({
  // Data
  buses: [],
  routes: [],
  stations: [],
  waypoints: {},
  stationArrivals: {},
  firebaseLive: {},   // raw Firebase snapshot keyed by busId

  // UI state
  selectedBus: null,
  selectedStation: null,
  searchOrigin: '',
  searchDest: '',
  searchResults: [],
  connectionStatus: 'connecting',

  // Actions
  setInit: (data) => set({
    buses: data.buses || [],
    routes: data.routes || [],
    stations: data.stations || [],
    waypoints: data.waypoints || {},
  }),

  updateBuses: (busPayloads) => set({ buses: busPayloads }),

  updateStationArrivals: (arrivals) => set({ stationArrivals: arrivals }),

  setSelectedBus: (bus) => set({ selectedBus: bus, selectedStation: null }),
  setSelectedStation: (station) => set({ selectedStation: station, selectedBus: null }),
  clearSelection: () => set({ selectedBus: null, selectedStation: null }),

  setConnectionStatus: (status) => set({ connectionStatus: status }),

  setSearchOrigin: (v) => set({ searchOrigin: v }),
  setSearchDest: (v) => set({ searchDest: v }),

  runSearch: () => {
    const { buses, routes, stations, searchOrigin, searchDest } = get();
    if (!searchOrigin || !searchDest) { set({ searchResults: [] }); return; }
    const originSt  = stations.find(s => s.name.toLowerCase().includes(searchOrigin.toLowerCase()));
    const destSt    = stations.find(s => s.name.toLowerCase().includes(searchDest.toLowerCase()));
    if (!originSt || !destSt) { set({ searchResults: [] }); return; }
    const results = routes.filter(r =>
      r.stationIds.includes(originSt.id) && r.stationIds.includes(destSt.id)
    ).map(r => {
      const activeBuses = buses.filter(b => b.routeId === r.id && b.status === 'active');
      return { route: r, buses: activeBuses, origin: originSt, dest: destSt };
    });
    set({ searchResults: results });
  },

  // Merge live Firebase GPS over simulated positions
  applyFirebaseOverlay: (fbData) => set(s => ({
    firebaseLive: fbData,
    buses: s.buses.map(bus => {
      const fb = fbData[bus.id];
      if (!fb || fb.latitude == null || fb.longitude == null) return bus;
      return {
        ...bus,
        lat:        parseFloat(fb.latitude),
        lng:        parseFloat(fb.longitude),
        speed:      fb.speed      != null ? parseFloat(fb.speed)   : bus.speed,
        heading:    fb.heading    != null ? parseFloat(fb.heading)  : (bus.heading || 0),
        satellites: fb.satellites != null ? parseInt(fb.satellites) : bus.satellites,
        hdop:       fb.hdop       != null ? parseFloat(fb.hdop)     : bus.hdop,
        hasFix:     fb.hasFix     != null ? fb.hasFix               : true,
        lastUpdate: fb.timestamp  || new Date().toISOString(),
        gpsSource:  'firebase',
      };
    }),
  })),

  // Admin CRUD helpers (update local state after API calls)
  addBus:       (bus)     => set(s => ({ buses: [...s.buses, bus] })),
  removeBus:    (id)      => set(s => ({ buses: s.buses.filter(b => b.id !== id) })),
  updateBus:    (updated) => set(s => ({ buses: s.buses.map(b => b.id === updated.id ? { ...b, ...updated } : b) })),

  addRoute:     (route)   => set(s => ({ routes: [...s.routes, route] })),
  removeRoute:  (id)      => set(s => ({ routes: s.routes.filter(r => r.id !== id) })),
  updateRoute:  (updated) => set(s => ({ routes: s.routes.map(r => r.id === updated.id ? { ...r, ...updated } : r) })),

  addStation:    (st)     => set(s => ({ stations: [...s.stations, st] })),
  removeStation: (id)     => set(s => ({ stations: s.stations.filter(st => st.id !== id) })),
  updateStation: (updated)=> set(s => ({ stations: s.stations.map(st => st.id === updated.id ? { ...st, ...updated } : st) })),

  // Stats
  getStats: () => {
    const { buses, routes, stations } = get();
    const activeBuses = buses.filter(b => b.status === 'active').length;
    const activeRoutes = routes.filter(r => r.active).length;
    const activeStations = stations.filter(s => s.active).length;
    const etas = buses.filter(b => b.etaMinutes != null).map(b => b.etaMinutes);
    const avgEta = etas.length ? Math.round(etas.reduce((a, b) => a + b, 0) / etas.length) : 0;
    return { activeBuses, activeRoutes, activeStations, avgEta };
  },
}));

export default useDartStore;
