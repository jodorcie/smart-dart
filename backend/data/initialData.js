// ─────────────────────────────────────────────────────────────
// Official UDART station coordinates sourced from GeoJSON
// GeoJSON uses [lng, lat]; our backend uses { lat, lng }
// ─────────────────────────────────────────────────────────────

const stations = [
  // ── Phase 1 – Major Terminals ─────────────────────────────
  { id: 'ST_KIM', name: 'Kimara Terminal',               lat: -6.7828, lng: 39.1764, type: 'terminal', corridor: 'P1-Morogoro',   phase: 1, active: true },
  { id: 'ST_UBU', name: 'Ubungo Terminal',               lat: -6.7971, lng: 39.2145, type: 'terminal', corridor: 'P1-Morogoro',   phase: 1, active: true },
  { id: 'ST_MOR', name: 'Morocco Terminal',              lat: -6.7988, lng: 39.2497, type: 'terminal', corridor: 'P1-Morocco',    phase: 1, active: true },
  { id: 'ST_GER', name: 'Gerezani Terminal',             lat: -6.8239, lng: 39.2797, type: 'terminal', corridor: 'P1-City',       phase: 1, active: true },
  { id: 'ST_KIV', name: 'Kivukoni Terminal',             lat: -6.8192, lng: 39.2989, type: 'terminal', corridor: 'P1-Kivukoni',   phase: 1, active: true },
  { id: 'ST_MUH', name: 'Muhimbili',                     lat: -6.8042, lng: 39.2799, type: 'terminal', corridor: 'P1-Feeder',     phase: 1, active: true },

  // ── Phase 1 – Morogoro Road Trunk (Kimara → Fire) ─────────
  // Intermediate stations derived from backbone waypoints
  { id: 'ST_W01', name: 'Mwisho wa Lami',               lat: -6.7865, lng: 39.1856, type: 'station',  corridor: 'P1-Morogoro',   phase: 1, active: true },
  { id: 'ST_W02', name: 'Mbezi Luis',                    lat: -6.7885, lng: 39.1915, type: 'station',  corridor: 'P1-Morogoro',   phase: 1, active: true },
  { id: 'ST_W03', name: 'Mwanakwerekwe',                 lat: -6.7944, lng: 39.2078, type: 'station',  corridor: 'P1-Morogoro',   phase: 1, active: true },
  { id: 'ST_W04', name: 'Ubungo Maziwa',                 lat: -6.7978, lng: 39.2232, type: 'station',  corridor: 'P1-Morogoro',   phase: 1, active: true },
  { id: 'ST_W05', name: 'Mwenge',                        lat: -6.7981, lng: 39.2289, type: 'station',  corridor: 'P1-Morogoro',   phase: 1, active: true },
  { id: 'ST_W06', name: 'Mlimani City',                  lat: -6.7984, lng: 39.2341, type: 'station',  corridor: 'P1-Morogoro',   phase: 1, active: true },
  { id: 'ST_W07', name: 'Makumbusho',                    lat: -6.7987, lng: 39.2378, type: 'station',  corridor: 'P1-Morogoro',   phase: 1, active: true },
  { id: 'ST_W08', name: 'Magomeni Mapipa',               lat: -6.7993, lng: 39.2435, type: 'station',  corridor: 'P1-Morogoro',   phase: 1, active: true },
  { id: 'ST_W09', name: 'Magomeni Hospital',             lat: -6.7998, lng: 39.2482, type: 'station',  corridor: 'P1-Morogoro',   phase: 1, active: true },
  { id: 'ST_W10', name: 'Msimbazi',                      lat: -6.8003, lng: 39.2541, type: 'station',  corridor: 'P1-Morogoro',   phase: 1, active: true },
  { id: 'ST_W11', name: 'Jangwani',                      lat: -6.8009, lng: 39.2599, type: 'station',  corridor: 'P1-Morogoro',   phase: 1, active: true },
  { id: 'ST_W12', name: 'Kariakoo',                      lat: -6.8016, lng: 39.2658, type: 'station',  corridor: 'P1-Morogoro',   phase: 1, active: true },
  { id: 'ST_FIR', name: 'Fire Station',                  lat: -6.8118, lng: 39.2773, type: 'station',  corridor: 'P1-Morogoro',   phase: 1, active: true },

  // ── Phase 1 – Kivukoni Branch (Fire → Kivukoni) ───────────
  { id: 'ST_DIT', name: 'DIT',                           lat: -6.8143, lng: 39.2831, type: 'station',  corridor: 'P1-Kivukoni',   phase: 1, active: true },
  { id: 'ST_KIS', name: 'Kisutu',                        lat: -6.8149, lng: 39.2872, type: 'station',  corridor: 'P1-Kivukoni',   phase: 1, active: true },
  { id: 'ST_CCN', name: 'Halmashauri ya Jiji',           lat: -6.8161, lng: 39.2903, type: 'station',  corridor: 'P1-Kivukoni',   phase: 1, active: true },
  { id: 'ST_POS', name: 'Posta ya Zamani',               lat: -6.8174, lng: 39.2941, type: 'station',  corridor: 'P1-Kivukoni',   phase: 1, active: true },

  // ── Phase 1 – Morocco Branch (Ubungo → Morocco) ───────────
  { id: 'ST_MB1', name: 'Kinondoni',                     lat: -6.7900, lng: 39.2300, type: 'station',  corridor: 'P1-Morocco',    phase: 1, active: true },
  { id: 'ST_MB2', name: 'Tanesco',                       lat: -6.7950, lng: 39.2420, type: 'station',  corridor: 'P1-Morocco',    phase: 1, active: true },

  // ── Phase 1 – Gerezani Spur (Fire → Gerezani) ────────────
  { id: 'ST_GS1', name: 'Kivukoni / Gerezani Jct',      lat: -6.8180, lng: 39.2790, type: 'station',  corridor: 'P1-City',       phase: 1, active: true },

  // ── Phase 2 – Kilwa Road Corridor ─────────────────────────
  { id: 'ST_SAB', name: 'Sabasaba',                      lat: -6.8631, lng: 39.2635, type: 'station',  corridor: 'P2-Kilwa',      phase: 2, active: true },
  { id: 'ST_MBA', name: 'Mbagala Rangi Tatu Terminal',   lat: -6.9242, lng: 39.2685, type: 'terminal', corridor: 'P2-Kilwa',      phase: 2, active: true },
];

// ── Official UDART routes ─────────────────────────────────────
const routes = [
  {
    id: 'RT1',   name: 'Kimara – Kivukoni',          shortName: '1',
    color: '#E53935', active: true, frequency: 8, phase: 1,
    stationIds: ['ST_KIM','ST_W01','ST_W02','ST_W03','ST_UBU','ST_W04','ST_W05','ST_W06','ST_W07','ST_W08','ST_W09','ST_W10','ST_W11','ST_W12','ST_FIR','ST_DIT','ST_KIS','ST_CCN','ST_POS','ST_KIV'],
  },
  {
    id: 'RT1X',  name: 'Kimara – Kivukoni Express',  shortName: '1X',
    color: '#B71C1C', active: true, frequency: 15, phase: 1,
    stationIds: ['ST_KIM','ST_UBU','ST_FIR','ST_KIV'],
  },
  {
    id: 'RT2',   name: 'Ubungo – Kivukoni',           shortName: '2',
    color: '#1E88E5', active: true, frequency: 10, phase: 1,
    stationIds: ['ST_UBU','ST_W04','ST_W05','ST_W06','ST_W07','ST_W08','ST_W09','ST_W10','ST_W11','ST_W12','ST_FIR','ST_DIT','ST_KIS','ST_CCN','ST_POS','ST_KIV'],
  },
  {
    id: 'RT3',   name: 'Morocco – Kivukoni',          shortName: '3',
    color: '#FB8C00', active: true, frequency: 10, phase: 1,
    stationIds: ['ST_MOR','ST_W09','ST_W10','ST_W11','ST_W12','ST_FIR','ST_DIT','ST_KIS','ST_CCN','ST_POS','ST_KIV'],
  },
  {
    id: 'RT4',   name: 'Kimara – Gerezani',           shortName: '4',
    color: '#43A047', active: true, frequency: 8, phase: 1,
    stationIds: ['ST_KIM','ST_W01','ST_W02','ST_W03','ST_UBU','ST_W04','ST_W05','ST_W06','ST_W07','ST_W08','ST_W09','ST_W10','ST_W11','ST_W12','ST_FIR','ST_GS1','ST_GER'],
  },
  {
    id: 'RT4X',  name: 'Kimara – Gerezani Express',   shortName: '4X',
    color: '#2E7D32', active: true, frequency: 15, phase: 1,
    stationIds: ['ST_KIM','ST_UBU','ST_FIR','ST_GER'],
  },
  {
    id: 'RT5',   name: 'Ubungo – Gerezani',           shortName: '5',
    color: '#8E24AA', active: true, frequency: 10, phase: 1,
    stationIds: ['ST_UBU','ST_W09','ST_W10','ST_W11','ST_W12','ST_FIR','ST_GS1','ST_GER'],
  },
  {
    id: 'RT6',   name: 'Morocco – Gerezani',          shortName: '6',
    color: '#00ACC1', active: true, frequency: 12, phase: 1,
    stationIds: ['ST_MOR','ST_W09','ST_W10','ST_W11','ST_W12','ST_FIR','ST_GS1','ST_GER'],
  },
  {
    id: 'RT7',   name: 'Kimara – Morocco',            shortName: '7',
    color: '#F4511E', active: true, frequency: 12, phase: 1,
    stationIds: ['ST_KIM','ST_W01','ST_W02','ST_W03','ST_UBU','ST_MB1','ST_MB2','ST_MOR'],
  },
  {
    id: 'RT10',  name: 'Gerezani – Muhimbili',        shortName: '10',
    color: '#6D4C41', active: true, frequency: 15, phase: 1,
    stationIds: ['ST_GER','ST_GS1','ST_MUH'],
  },
  // ── Phase 2 ──────────────────────────────────────────────
  {
    id: 'RT_P2', name: 'Gerezani – Mbagala Rangi Tatu', shortName: 'P2',
    color: '#FF6F00', active: true, frequency: 12, phase: 2,
    stationIds: ['ST_GER','ST_SAB','ST_MBA'],
  },
];

// ── Route waypoints ──────────────────────────────────────────
// All coordinates are [lat, lng] (converted from official GeoJSON [lng, lat])
// Official Phase 1 trunk backbone: Kimara → Fire (from GeoJSON)
const TRUNK = [
  [-6.7828, 39.1764], [-6.7865, 39.1856], [-6.7885, 39.1915],
  [-6.7909, 39.1983], [-6.7925, 39.2024], [-6.7944, 39.2078],
  [-6.7971, 39.2145], [-6.7978, 39.2232], [-6.7981, 39.2289],
  [-6.7984, 39.2341], [-6.7987, 39.2378], [-6.7993, 39.2435],
  [-6.7998, 39.2482], [-6.8003, 39.2541], [-6.8009, 39.2599],
  [-6.8016, 39.2658], [-6.8118, 39.2773],
];

// Official Fire → Kivukoni branch (from GeoJSON)
const FIRE_TO_KIV = [
  [-6.8118, 39.2773], [-6.8143, 39.2831], [-6.8149, 39.2872],
  [-6.8161, 39.2903], [-6.8174, 39.2941], [-6.8192, 39.2989],
];

// Fire → Gerezani spur (heading south)
const FIRE_TO_GER = [
  [-6.8118, 39.2773], [-6.8150, 39.2782], [-6.8180, 39.2790],
  [-6.8239, 39.2797],
];

// Morocco branch: diverge from trunk near Ubungo → Morocco
const UBU_TO_MOR = [
  [-6.7971, 39.2145], [-6.7920, 39.2220], [-6.7880, 39.2310],
  [-6.7900, 39.2420], [-6.7988, 39.2497],
];

// Phase 2: Gerezani → Mbagala (Kilwa Road – from GeoJSON)
const PHASE2 = [
  [-6.8239, 39.2797], [-6.8350, 39.2750], [-6.8450, 39.2700],
  [-6.8631, 39.2635], [-6.8780, 39.2655], [-6.8950, 39.2665],
  [-6.9242, 39.2685],
];

const routeWaypoints = {
  RT1:   [...TRUNK, ...FIRE_TO_KIV.slice(1)],
  RT1X:  [TRUNK[0], TRUNK[6], TRUNK[16], ...FIRE_TO_KIV.slice(1)],
  RT2:   [TRUNK[6], ...TRUNK.slice(7), ...FIRE_TO_KIV.slice(1)],
  RT3:   [[-6.7988, 39.2497], [-6.7998, 39.2482], ...TRUNK.slice(12), ...FIRE_TO_KIV.slice(1)],
  RT4:   [...TRUNK, ...FIRE_TO_GER.slice(1)],
  RT4X:  [TRUNK[0], TRUNK[6], TRUNK[16], ...FIRE_TO_GER.slice(1)],
  RT5:   [TRUNK[6], ...TRUNK.slice(7), ...FIRE_TO_GER.slice(1)],
  RT6:   [[-6.7988, 39.2497], [-6.7998, 39.2482], ...TRUNK.slice(12), ...FIRE_TO_GER.slice(1)],
  RT7:   [...TRUNK.slice(0, 7), ...UBU_TO_MOR.slice(1)],
  RT10:  [[-6.8239, 39.2797], [-6.8180, 39.2790], [-6.8042, 39.2799]],
  RT_P2: PHASE2,
};

// ── Buses ─────────────────────────────────────────────────────
// All buses start OFFLINE with no position.
// They become 'active' only when a real ESP32 sends GPS data.
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
