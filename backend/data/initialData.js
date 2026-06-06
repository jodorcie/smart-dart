// ─────────────────────────────────────────────────────────────
// Smart DART – Official station list and route geometry
//
// Coordinate system: { lat, lng }  (WGS-84)
// Route waypoint arrays: [lat, lng]
//
// PHASE 1 – Morogoro Road BRT corridor
//   Trunk : Kimara ──── Morogoro Road (east) ──── Fire Station
//             ↑ Morocco spur (north, ~2 km)
//   Branch: Fire ──► east along Sokoine Drive ──► Kivukoni
//           Fire ──► south along Bibi Titi Mohammed ──► Gerezani
//
// PHASE 2 – Kilwa Road corridor
//   Gerezani ──► south along Kilwa Road ──► Mbagala Rangi Tatu
// ─────────────────────────────────────────────────────────────

const stations = [

  // ── Phase 1 Terminals ────────────────────────────────────────
  { id: 'ST_KIM', name: 'Kimara Terminal',             lat: -6.7829, lng: 39.1765, type: 'terminal', corridor: 'P1-Morogoro', phase: 1, active: true },
  { id: 'ST_UBU', name: 'Ubungo Terminal',             lat: -6.7975, lng: 39.2085, type: 'terminal', corridor: 'P1-Morogoro', phase: 1, active: true },
  { id: 'ST_MOR', name: 'Morocco Terminal',            lat: -6.7780, lng: 39.2475, type: 'terminal', corridor: 'P1-Morocco',  phase: 1, active: true },
  { id: 'ST_GER', name: 'Gerezani Terminal',           lat: -6.8239, lng: 39.2797, type: 'terminal', corridor: 'P1-City',     phase: 1, active: true },
  { id: 'ST_KIV', name: 'Kivukoni Terminal',           lat: -6.8185, lng: 39.2988, type: 'terminal', corridor: 'P1-Kivukoni', phase: 1, active: true },
  { id: 'ST_MUH', name: 'Muhimbili',                   lat: -6.8045, lng: 39.2790, type: 'terminal', corridor: 'P1-Feeder',   phase: 1, active: true },

  // ── Phase 1 – Morogoro Road trunk stations ───────────────────
  { id: 'ST_W01', name: 'Mwisho wa Lami',              lat: -6.7858, lng: 39.1855, type: 'station',  corridor: 'P1-Morogoro', phase: 1, active: true },
  { id: 'ST_W02', name: 'Mbezi Luis',                  lat: -6.7878, lng: 39.1938, type: 'station',  corridor: 'P1-Morogoro', phase: 1, active: true },
  { id: 'ST_W03', name: 'Mwanakwerekwe',               lat: -6.7921, lng: 39.2022, type: 'station',  corridor: 'P1-Morogoro', phase: 1, active: true },
  { id: 'ST_W04', name: 'Ubungo Maziwa',               lat: -6.7980, lng: 39.2138, type: 'station',  corridor: 'P1-Morogoro', phase: 1, active: true },
  { id: 'ST_W05', name: 'Mwenge',                      lat: -6.7985, lng: 39.2232, type: 'station',  corridor: 'P1-Morogoro', phase: 1, active: true },
  { id: 'ST_W06', name: 'Mlimani City',                lat: -6.7989, lng: 39.2320, type: 'station',  corridor: 'P1-Morogoro', phase: 1, active: true },
  { id: 'ST_W07', name: 'Makumbusho',                  lat: -6.7991, lng: 39.2362, type: 'station',  corridor: 'P1-Morogoro', phase: 1, active: true },
  { id: 'ST_W08', name: 'Magomeni Mapipa',             lat: -6.7992, lng: 39.2408, type: 'station',  corridor: 'P1-Morogoro', phase: 1, active: true },
  { id: 'ST_W09', name: 'Magomeni Hospital',           lat: -6.7994, lng: 39.2450, type: 'station',  corridor: 'P1-Morogoro', phase: 1, active: true },
  { id: 'ST_W10', name: 'Msimbazi',                    lat: -6.8003, lng: 39.2525, type: 'station',  corridor: 'P1-Morogoro', phase: 1, active: true },
  { id: 'ST_W11', name: 'Jangwani',                    lat: -6.8009, lng: 39.2580, type: 'station',  corridor: 'P1-Morogoro', phase: 1, active: true },
  { id: 'ST_W12', name: 'Kariakoo',                    lat: -6.8016, lng: 39.2640, type: 'station',  corridor: 'P1-Morogoro', phase: 1, active: true },
  { id: 'ST_FIR', name: 'Fire Station',                lat: -6.8118, lng: 39.2773, type: 'station',  corridor: 'P1-Morogoro', phase: 1, active: true },

  // ── Phase 1 – Kivukoni branch (Fire → east) ──────────────────
  { id: 'ST_DIT', name: 'DIT',                         lat: -6.8135, lng: 39.2825, type: 'station',  corridor: 'P1-Kivukoni', phase: 1, active: true },
  { id: 'ST_KIS', name: 'Kisutu',                      lat: -6.8147, lng: 39.2868, type: 'station',  corridor: 'P1-Kivukoni', phase: 1, active: true },
  { id: 'ST_CCN', name: 'Halmashauri ya Jiji',         lat: -6.8159, lng: 39.2907, type: 'station',  corridor: 'P1-Kivukoni', phase: 1, active: true },
  { id: 'ST_POS', name: 'Posta ya Zamani',             lat: -6.8172, lng: 39.2945, type: 'station',  corridor: 'P1-Kivukoni', phase: 1, active: true },

  // ── Phase 1 – Morocco spur stations (Morogoro Rd → Morocco Terminal) ─
  { id: 'ST_MB1', name: 'Kinondoni',                   lat: -6.7880, lng: 39.2482, type: 'station',  corridor: 'P1-Morocco',  phase: 1, active: true },
  { id: 'ST_MB2', name: 'Tanesco',                     lat: -6.7830, lng: 39.2479, type: 'station',  corridor: 'P1-Morocco',  phase: 1, active: true },

  // ── Phase 1 – Gerezani spur junction ─────────────────────────
  { id: 'ST_GS1', name: 'Gerezani Junction',           lat: -6.8180, lng: 39.2788, type: 'station',  corridor: 'P1-City',     phase: 1, active: true },

  // ── Phase 2 – Kilwa Road stations ────────────────────────────
  { id: 'ST_SAB', name: 'Sabasaba',                    lat: -6.8631, lng: 39.2685, type: 'station',  corridor: 'P2-Kilwa',    phase: 2, active: true },
  { id: 'ST_MBA', name: 'Mbagala Rangi Tatu Terminal', lat: -6.9242, lng: 39.2685, type: 'terminal', corridor: 'P2-Kilwa',    phase: 2, active: true },
];

// ── Routes ────────────────────────────────────────────────────
const routes = [
  {
    id: 'RT1',  name: 'Kimara – Kivukoni',         shortName: '1',
    color: '#E53935', active: true, frequency: 8,  phase: 1,
    stationIds: ['ST_KIM','ST_W01','ST_W02','ST_W03','ST_UBU','ST_W04','ST_W05','ST_W06','ST_W07','ST_W08','ST_W09','ST_W10','ST_W11','ST_W12','ST_FIR','ST_DIT','ST_KIS','ST_CCN','ST_POS','ST_KIV'],
  },
  {
    id: 'RT1X', name: 'Kimara – Kivukoni Express', shortName: '1X',
    color: '#B71C1C', active: true, frequency: 15, phase: 1,
    stationIds: ['ST_KIM','ST_UBU','ST_FIR','ST_KIV'],
  },
  {
    id: 'RT2',  name: 'Ubungo – Kivukoni',         shortName: '2',
    color: '#1E88E5', active: true, frequency: 10, phase: 1,
    stationIds: ['ST_UBU','ST_W04','ST_W05','ST_W06','ST_W07','ST_W08','ST_W09','ST_W10','ST_W11','ST_W12','ST_FIR','ST_DIT','ST_KIS','ST_CCN','ST_POS','ST_KIV'],
  },
  {
    id: 'RT3',  name: 'Morocco – Kivukoni',        shortName: '3',
    color: '#FB8C00', active: true, frequency: 10, phase: 1,
    stationIds: ['ST_MOR','ST_MB2','ST_MB1','ST_W09','ST_W10','ST_W11','ST_W12','ST_FIR','ST_DIT','ST_KIS','ST_CCN','ST_POS','ST_KIV'],
  },
  {
    id: 'RT4',  name: 'Kimara – Gerezani',         shortName: '4',
    color: '#43A047', active: true, frequency: 8,  phase: 1,
    stationIds: ['ST_KIM','ST_W01','ST_W02','ST_W03','ST_UBU','ST_W04','ST_W05','ST_W06','ST_W07','ST_W08','ST_W09','ST_W10','ST_W11','ST_W12','ST_FIR','ST_GS1','ST_GER'],
  },
  {
    id: 'RT4X', name: 'Kimara – Gerezani Express', shortName: '4X',
    color: '#2E7D32', active: true, frequency: 15, phase: 1,
    stationIds: ['ST_KIM','ST_UBU','ST_FIR','ST_GER'],
  },
  {
    id: 'RT5',  name: 'Ubungo – Gerezani',         shortName: '5',
    color: '#8E24AA', active: true, frequency: 10, phase: 1,
    stationIds: ['ST_UBU','ST_W04','ST_W05','ST_W06','ST_W07','ST_W08','ST_W09','ST_W10','ST_W11','ST_W12','ST_FIR','ST_GS1','ST_GER'],
  },
  {
    id: 'RT6',  name: 'Morocco – Gerezani',        shortName: '6',
    color: '#00ACC1', active: true, frequency: 12, phase: 1,
    stationIds: ['ST_MOR','ST_MB2','ST_MB1','ST_W09','ST_W10','ST_W11','ST_W12','ST_FIR','ST_GS1','ST_GER'],
  },
  {
    id: 'RT7',  name: 'Kimara – Morocco',          shortName: '7',
    color: '#F4511E', active: true, frequency: 12, phase: 1,
    stationIds: ['ST_KIM','ST_W01','ST_W02','ST_W03','ST_UBU','ST_MB1','ST_MB2','ST_MOR'],
  },
  {
    id: 'RT10', name: 'Gerezani – Muhimbili',      shortName: '10',
    color: '#6D4C41', active: true, frequency: 15, phase: 1,
    stationIds: ['ST_GER','ST_GS1','ST_MUH'],
  },
  {
    id: 'RT_P2', name: 'Gerezani – Mbagala Rangi Tatu', shortName: 'P2',
    color: '#FF6F00', active: true, frequency: 12, phase: 2,
    stationIds: ['ST_GER','ST_SAB','ST_MBA'],
  },
];

// ── Route Waypoints ───────────────────────────────────────────
//
// All waypoints are [lat, lng].
// Dense intermediate points so lines follow actual road curves.
//
// ══ BUILDING BLOCKS ══════════════════════════════════════════

// Morogoro Road trunk: Kimara Terminal → Fire Station
// The BRT runs in a dedicated lane along Morogoro Road (east-west),
// then curves SE toward the Fire Station roundabout near Kariakoo.
const TRUNK = [
  [-6.7829, 39.1765],  // Kimara Terminal
  [-6.7840, 39.1795],
  [-6.7848, 39.1825],
  [-6.7858, 39.1855],  // Mwisho wa Lami
  [-6.7866, 39.1890],
  [-6.7875, 39.1925],
  [-6.7878, 39.1938],  // Mbezi Luis
  [-6.7887, 39.1968],
  [-6.7898, 39.1998],
  [-6.7910, 39.2022],
  [-6.7921, 39.2022],  // Mwanakwerekwe
  [-6.7938, 39.2048],
  [-6.7952, 39.2068],
  [-6.7963, 39.2078],
  [-6.7975, 39.2085],  // Ubungo Terminal
  [-6.7978, 39.2112],
  [-6.7980, 39.2138],  // Ubungo Maziwa
  [-6.7982, 39.2165],
  [-6.7983, 39.2192],
  [-6.7984, 39.2215],
  [-6.7985, 39.2232],  // Mwenge
  [-6.7986, 39.2258],
  [-6.7988, 39.2285],
  [-6.7989, 39.2308],
  [-6.7989, 39.2320],  // Mlimani City
  [-6.7990, 39.2340],
  [-6.7991, 39.2358],
  [-6.7991, 39.2362],  // Makumbusho
  [-6.7992, 39.2382],
  [-6.7992, 39.2408],  // Magomeni Mapipa
  [-6.7993, 39.2428],
  [-6.7994, 39.2450],  // Magomeni Hospital (Morocco junction nearby)
  [-6.7996, 39.2470],
  [-6.7998, 39.2490],  // Morocco junction on Morogoro Road
  [-6.8001, 39.2508],
  [-6.8003, 39.2525],  // Msimbazi
  [-6.8006, 39.2552],
  [-6.8009, 39.2580],  // Jangwani
  [-6.8013, 39.2610],
  [-6.8016, 39.2640],  // Kariakoo
  [-6.8025, 39.2662],
  [-6.8038, 39.2680],
  [-6.8055, 39.2700],
  [-6.8072, 39.2725],
  [-6.8090, 39.2748],
  [-6.8105, 39.2763],
  [-6.8118, 39.2773],  // Fire Station
];

// Morocco spur: Morogoro Road junction → Morocco Terminal (north)
// Diverges from trunk at the Morocco junction point, goes north
const MOR_JUNCTION_IDX = 33; // index of [-6.7998, 39.2490] in TRUNK
const MOR_SPUR_SOUTH_END = [-6.7998, 39.2490]; // junction on Morogoro Road

const MOR_SPUR_UP = [
  [-6.7998, 39.2490],  // Morocco junction (on Morogoro Road)
  [-6.7965, 39.2487],
  [-6.7935, 39.2484],
  [-6.7905, 39.2482],
  [-6.7875, 39.2480],
  [-6.7845, 39.2478],
  [-6.7820, 39.2476],
  [-6.7800, 39.2475],
  [-6.7780, 39.2475],  // Morocco Terminal
];

const MOR_SPUR_DOWN = [...MOR_SPUR_UP].reverse();

// Kivukoni branch: Fire Station → east along Sokoine Drive / harbour front
const FIRE_TO_KIV = [
  [-6.8118, 39.2773],  // Fire Station
  [-6.8126, 39.2795],
  [-6.8132, 39.2812],
  [-6.8135, 39.2825],  // DIT
  [-6.8139, 39.2842],
  [-6.8144, 39.2858],
  [-6.8147, 39.2868],  // Kisutu
  [-6.8151, 39.2882],
  [-6.8155, 39.2895],
  [-6.8159, 39.2907],  // Halmashauri ya Jiji
  [-6.8164, 39.2922],
  [-6.8168, 39.2935],
  [-6.8172, 39.2945],  // Posta ya Zamani
  [-6.8176, 39.2960],
  [-6.8180, 39.2975],
  [-6.8185, 39.2988],  // Kivukoni Terminal
];

// Gerezani spur: Fire Station → south along Bibi Titi Mohammed
const FIRE_TO_GER = [
  [-6.8118, 39.2773],  // Fire Station
  [-6.8132, 39.2778],
  [-6.8148, 39.2782],
  [-6.8162, 39.2785],
  [-6.8175, 39.2787],
  [-6.8188, 39.2789],
  [-6.8200, 39.2792],
  [-6.8215, 39.2794],
  [-6.8228, 39.2796],
  [-6.8239, 39.2797],  // Gerezani Terminal
];

// Kilwa Road – Phase 2: Gerezani → south → Mbagala Rangi Tatu
// Kilwa Road runs roughly south-southeast from the city center
const KILWA_ROAD = [
  [-6.8239, 39.2797],  // Gerezani Terminal
  [-6.8265, 39.2785],
  [-6.8292, 39.2773],
  [-6.8320, 39.2762],
  [-6.8352, 39.2750],
  [-6.8385, 39.2740],
  [-6.8418, 39.2728],
  [-6.8452, 39.2718],
  [-6.8490, 39.2708],
  [-6.8528, 39.2698],
  [-6.8565, 39.2691],
  [-6.8600, 39.2686],
  [-6.8631, 39.2685],  // Sabasaba
  [-6.8665, 39.2683],
  [-6.8700, 39.2681],
  [-6.8738, 39.2678],
  [-6.8775, 39.2674],
  [-6.8815, 39.2670],
  [-6.8855, 39.2666],
  [-6.8898, 39.2662],
  [-6.8942, 39.2660],
  [-6.8988, 39.2660],
  [-6.9035, 39.2662],
  [-6.9080, 39.2665],
  [-6.9125, 39.2672],
  [-6.9170, 39.2678],
  [-6.9210, 39.2682],
  [-6.9242, 39.2685],  // Mbagala Rangi Tatu Terminal
];

// Muhimbili feeder (short loop from Gerezani area)
const GER_TO_MUH = [
  [-6.8239, 39.2797],  // Gerezani Terminal
  [-6.8215, 39.2793],
  [-6.8190, 39.2791],
  [-6.8165, 39.2790],
  [-6.8140, 39.2790],
  [-6.8115, 39.2790],
  [-6.8080, 39.2790],
  [-6.8045, 39.2790],  // Muhimbili
];

// ── Compose route waypoints ────────────────────────────────────
// TRUNK index helpers
const T_UBU  = 14;  // Ubungo Terminal index in TRUNK
const T_MOR  = 33;  // Morocco junction index in TRUNK

const routeWaypoints = {
  // RT1: Kimara → Morogoro Road → Fire → Kivukoni
  RT1:  [...TRUNK, ...FIRE_TO_KIV.slice(1)],

  // RT1X: Kimara express → Ubungo → Fire → Kivukoni
  RT1X: [TRUNK[0], TRUNK[T_UBU], TRUNK[TRUNK.length - 1], ...FIRE_TO_KIV.slice(1)],

  // RT2: Ubungo → east on Morogoro Road → Fire → Kivukoni
  RT2:  [...TRUNK.slice(T_UBU), ...FIRE_TO_KIV.slice(1)],

  // RT3: Morocco Terminal → south spur → Morogoro Road → Fire → Kivukoni
  RT3:  [...MOR_SPUR_DOWN, ...TRUNK.slice(T_MOR + 1), ...FIRE_TO_KIV.slice(1)],

  // RT4: Kimara → Morogoro Road → Fire → Gerezani
  RT4:  [...TRUNK, ...FIRE_TO_GER.slice(1)],

  // RT4X: Kimara express → Ubungo → Fire → Gerezani
  RT4X: [TRUNK[0], TRUNK[T_UBU], TRUNK[TRUNK.length - 1], ...FIRE_TO_GER.slice(1)],

  // RT5: Ubungo → Morogoro Road → Fire → Gerezani
  RT5:  [...TRUNK.slice(T_UBU), ...FIRE_TO_GER.slice(1)],

  // RT6: Morocco Terminal → south spur → Morogoro Road → Fire → Gerezani
  RT6:  [...MOR_SPUR_DOWN, ...TRUNK.slice(T_MOR + 1), ...FIRE_TO_GER.slice(1)],

  // RT7: Kimara → Morogoro Road → Morocco junction → north spur → Morocco Terminal
  RT7:  [...TRUNK.slice(0, T_MOR + 1), ...MOR_SPUR_UP.slice(1)],

  // RT10: Gerezani → north to Muhimbili National Hospital
  RT10: GER_TO_MUH,

  // RT_P2: Gerezani → south along Kilwa Road → Mbagala Rangi Tatu
  RT_P2: KILWA_ROAD,
};

// ── Buses ─────────────────────────────────────────────────────
// All buses start OFFLINE. They become 'active' only when a real
// ESP32 device sends GPS data to /api/gps.
const buses = [
  { id: 'DART001', routeId: 'RT1',   status: 'offline', capacity: 80, driver: 'John Mwamba'    },
  { id: 'DART002', routeId: 'RT1',   status: 'offline', capacity: 80, driver: 'Grace Ndovu'    },
  { id: 'DART003', routeId: 'RT2',   status: 'offline', capacity: 60, driver: 'Peter Msigwa'   },
  { id: 'DART004', routeId: 'RT4',   status: 'offline', capacity: 80, driver: 'Amina Salim'    },
  { id: 'DART005', routeId: 'RT7',   status: 'offline', capacity: 80, driver: 'David Kipchoge' },
  { id: 'DART006', routeId: 'RT3',   status: 'offline', capacity: 60, driver: 'Fatuma Hassan'  },
  { id: 'DART007', routeId: 'RT5',   status: 'offline', capacity: 60, driver: 'Emmanuel Osei'  },
  { id: 'DART008', routeId: 'RT6',   status: 'offline', capacity: 60, driver: 'Rose Mkwawa'    },
  { id: 'DART009', routeId: 'RT10',  status: 'offline', capacity: 40, driver: 'Ibrahim Juma'   },
  { id: 'DART010', routeId: 'RT1X',  status: 'offline', capacity: 80, driver: 'Zawadi Mushi'   },
  { id: 'DART011', routeId: 'RT_P2', status: 'offline', capacity: 80, driver: 'Hassan Kombo'   },
  { id: 'DART012', routeId: 'RT_P2', status: 'offline', capacity: 80, driver: 'Neema Tarimo'   },
];

module.exports = { stations, routes, routeWaypoints, buses };
