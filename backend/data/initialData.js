// ─────────────────────────────────────────────────────────────
// Smart DART – Official station list and route geometry
//
// Coordinate system : { lat, lng } (WGS-84)
// Waypoint arrays   : [lat, lng]   (6 decimal places ≈ 0.11 m precision)
//
// PHASE 1 – Morogoro Road BRT corridor
//   Trunk  : Kimara ──► Morogoro Road (east) ──► Fire Station
//   Branch : Fire   ──► east along Sokoine / harbour ──► Kivukoni
//            Fire   ──► south via Msimbazi St          ──► Gerezani
//   Spur   : Magomeni Mapipa ──► north via Kawawa Road ──► Morocco Terminal
//
// PHASE 2 – Kilwa Road corridor
//   Mbagala Rangi Tatu ──► north along Kilwa Road ──► Kivukoni
// ─────────────────────────────────────────────────────────────

const stations = [

  // ── Phase 1 – Morogoro Road Trunk (west → east) ──────────────
  { id: 'ST_KIM', name: 'Kimara Terminal',       lat: -6.782900, lng: 39.176500, type: 'terminal', corridor: 'P1-Trunk',    phase: 1, active: true },
  { id: 'ST_KRG', name: 'Korogwe',               lat: -6.783600, lng: 39.183200, type: 'station',  corridor: 'P1-Trunk',    phase: 1, active: true },
  { id: 'ST_BCH', name: 'Bucha',                 lat: -6.784400, lng: 39.190100, type: 'station',  corridor: 'P1-Trunk',    phase: 1, active: true },
  { id: 'ST_BAR', name: 'Baruti',                lat: -6.785500, lng: 39.197200, type: 'station',  corridor: 'P1-Trunk',    phase: 1, active: true },
  { id: 'ST_CRN', name: 'Corner',                lat: -6.787000, lng: 39.204400, type: 'station',  corridor: 'P1-Trunk',    phase: 1, active: true },
  { id: 'ST_KBO', name: 'Kibo',                  lat: -6.789100, lng: 39.211800, type: 'station',  corridor: 'P1-Trunk',    phase: 1, active: true },
  { id: 'ST_UBM', name: 'Ubungo Maji',           lat: -6.791300, lng: 39.219400, type: 'station',  corridor: 'P1-Trunk',    phase: 1, active: true },
  { id: 'ST_UBU', name: 'Ubungo Terminal',       lat: -6.793200, lng: 39.227100, type: 'terminal', corridor: 'P1-Trunk',    phase: 1, active: true },
  { id: 'ST_SHK', name: 'Shekilango',            lat: -6.794800, lng: 39.234800, type: 'station',  corridor: 'P1-Trunk',    phase: 1, active: true },
  { id: 'ST_URF', name: 'Urafiki',               lat: -6.796200, lng: 39.242600, type: 'station',  corridor: 'P1-Trunk',    phase: 1, active: true },
  { id: 'ST_MNZ', name: 'Manzese',               lat: -6.797600, lng: 39.250100, type: 'station',  corridor: 'P1-Trunk',    phase: 1, active: true },
  { id: 'ST_TTP', name: 'Tip Top',               lat: -6.798400, lng: 39.255800, type: 'station',  corridor: 'P1-Trunk',    phase: 1, active: true },
  { id: 'ST_MNR', name: 'Manzese Royal',         lat: -6.798900, lng: 39.260700, type: 'station',  corridor: 'P1-Trunk',    phase: 1, active: true },
  { id: 'ST_MGK', name: 'Magomeni Kanisani',     lat: -6.799200, lng: 39.265400, type: 'station',  corridor: 'P1-Trunk',    phase: 1, active: true },
  { id: 'ST_MGP', name: 'Magomeni Mapipa',       lat: -6.799500, lng: 39.270200, type: 'station',  corridor: 'P1-Trunk',    phase: 1, active: true },
  { id: 'ST_MGI', name: 'Magomeni Mikumi',       lat: -6.799900, lng: 39.274900, type: 'station',  corridor: 'P1-Trunk',    phase: 1, active: true },
  { id: 'ST_MKW', name: 'Mkwajuni',              lat: -6.801200, lng: 39.279100, type: 'station',  corridor: 'P1-Trunk',    phase: 1, active: true },
  { id: 'ST_JNG', name: 'Jangwani',              lat: -6.804600, lng: 39.282800, type: 'station',  corridor: 'P1-Trunk',    phase: 1, active: true },
  { id: 'ST_FIR', name: 'Fire Station',          lat: -6.812800, lng: 39.284900, type: 'station',  corridor: 'P1-Trunk',    phase: 1, active: true },

  // ── Phase 1 – Kivukoni branch (Fire → east along Sokoine Dr) ─
  { id: 'ST_DIT', name: 'DIT',                   lat: -6.816400, lng: 39.283200, type: 'station',  corridor: 'P1-Kivukoni', phase: 1, active: true },
  { id: 'ST_KIS', name: 'Kisutu',                lat: -6.818200, lng: 39.282100, type: 'station',  corridor: 'P1-Kivukoni', phase: 1, active: true },
  { id: 'ST_HJJ', name: 'Halmashauri ya Jiji',   lat: -6.819600, lng: 39.282400, type: 'station',  corridor: 'P1-Kivukoni', phase: 1, active: true },
  { id: 'ST_PYZ', name: 'Posta ya Zamani',       lat: -6.820400, lng: 39.285600, type: 'station',  corridor: 'P1-Kivukoni', phase: 1, active: true },
  { id: 'ST_KIV', name: 'Kivukoni Terminal',     lat: -6.819800, lng: 39.289400, type: 'terminal', corridor: 'P1-Kivukoni', phase: 1, active: true },

  // ── Phase 1 – Msimbazi / Gerezani branch (Fire → south) ──────
  { id: 'ST_MSA', name: 'Msimbazi-A',            lat: -6.815600, lng: 39.283400, type: 'station',  corridor: 'P1-Gerezani', phase: 1, active: true },
  { id: 'ST_MSB', name: 'Msimbazi-B',            lat: -6.819400, lng: 39.276400, type: 'station',  corridor: 'P1-Gerezani', phase: 1, active: true },
  { id: 'ST_GER', name: 'Gerezani Terminal',     lat: -6.824200, lng: 39.279600, type: 'terminal', corridor: 'P1-Gerezani', phase: 1, active: true },

  // ── Phase 1 – Morocco / Kawawa Road spur (Mapipa → north) ────
  { id: 'ST_MGH', name: 'Magomeni Hospital',     lat: -6.793800, lng: 39.271800, type: 'station',  corridor: 'P1-Morocco',  phase: 1, active: true },
  { id: 'ST_KNS', name: 'Kanisani',              lat: -6.787400, lng: 39.272600, type: 'station',  corridor: 'P1-Morocco',  phase: 1, active: true },
  { id: 'ST_MKK', name: 'Mkwajuni',              lat: -6.781200, lng: 39.271900, type: 'station',  corridor: 'P1-Morocco',  phase: 1, active: true },
  { id: 'ST_MWN', name: 'Mwanamboka',            lat: -6.774600, lng: 39.269800, type: 'station',  corridor: 'P1-Morocco',  phase: 1, active: true },
  { id: 'ST_KNB', name: 'Kinondoni B',           lat: -6.767200, lng: 39.266900, type: 'station',  corridor: 'P1-Morocco',  phase: 1, active: true },
  { id: 'ST_MOR', name: 'Morocco Terminal',      lat: -6.758200, lng: 39.262400, type: 'terminal', corridor: 'P1-Morocco',  phase: 1, active: true },

  // ── Phase 2 – Kilwa Road (south → north) ─────────────────────
  { id: 'ST_MBR', name: 'Mbagala Rangi Tatu Terminal', lat: -7.053820, lng: 39.296240, type: 'terminal', corridor: 'P2-Kilwa', phase: 2, active: true },
  { id: 'ST_MBK', name: 'Mbagala Kuu',           lat: -7.036420, lng: 39.294680, type: 'station',  corridor: 'P2-Kilwa',    phase: 2, active: true },
  { id: 'ST_ZKH', name: 'Zakhem',                lat: -7.024840, lng: 39.291580, type: 'station',  corridor: 'P2-Kilwa',    phase: 2, active: true },
  { id: 'ST_CHR', name: 'Charambe',              lat: -7.013260, lng: 39.288460, type: 'station',  corridor: 'P2-Kilwa',    phase: 2, active: true },
  { id: 'ST_KZI', name: 'Kizuiani',              lat: -7.001920, lng: 39.284230, type: 'station',  corridor: 'P2-Kilwa',    phase: 2, active: true },
  { id: 'ST_MTC', name: 'Mtoni Center',          lat: -6.992740, lng: 39.280840, type: 'station',  corridor: 'P2-Kilwa',    phase: 2, active: true },
  { id: 'ST_MSS', name: 'Mtoni Saba Saba',       lat: -6.983420, lng: 39.277350, type: 'station',  corridor: 'P2-Kilwa',    phase: 2, active: true },
  { id: 'ST_MAA', name: 'Mtoni Kwa Azizi Ali',   lat: -6.974840, lng: 39.274180, type: 'station',  corridor: 'P2-Kilwa',    phase: 2, active: true },
  { id: 'ST_MDP', name: 'Mtoni Depot/Misheni',   lat: -6.965620, lng: 39.271540, type: 'station',  corridor: 'P2-Kilwa',    phase: 2, active: true },
  { id: 'ST_MGO', name: 'Mgambo',                lat: -6.955240, lng: 39.268210, type: 'station',  corridor: 'P2-Kilwa',    phase: 2, active: true },
  { id: 'ST_YMB', name: 'Yombo',                 lat: -6.944560, lng: 39.265380, type: 'station',  corridor: 'P2-Kilwa',    phase: 2, active: true },
  { id: 'ST_KKO', name: 'KeKo',                  lat: -6.933820, lng: 39.261920, type: 'station',  corridor: 'P2-Kilwa',    phase: 2, active: true },
  { id: 'ST_MDJ', name: 'Mandela Junction',      lat: -6.924240, lng: 39.255380, type: 'station',  corridor: 'P2-Kilwa',    phase: 2, active: true },
  { id: 'ST_CHG', name: "Chang'ombe",            lat: -6.915760, lng: 39.250640, type: 'station',  corridor: 'P2-Kilwa',    phase: 2, active: true },
  { id: 'ST_UHB', name: 'Uhasibu (TIA)',         lat: -6.906740, lng: 39.247820, type: 'station',  corridor: 'P2-Kilwa',    phase: 2, active: true },
  { id: 'ST_MGL', name: 'Mgulani',               lat: -6.897420, lng: 39.251580, type: 'station',  corridor: 'P2-Kilwa',    phase: 2, active: true },
  { id: 'ST_GJN', name: 'Gerezani Junction',     lat: -6.884180, lng: 39.264820, type: 'station',  corridor: 'P2-Kilwa',    phase: 2, active: true },
  { id: 'ST_BND', name: 'Bandari',               lat: -6.836240, lng: 39.284920, type: 'station',  corridor: 'P2-Kilwa',    phase: 2, active: true },
  { id: 'ST_RLW', name: 'Railway Station',       lat: -6.824180, lng: 39.288140, type: 'station',  corridor: 'P2-Kilwa',    phase: 2, active: true },
  { id: 'ST_WZR', name: 'Wizara',                lat: -6.822140, lng: 39.290560, type: 'station',  corridor: 'P2-Kilwa',    phase: 2, active: true },
];

// ── Routes ────────────────────────────────────────────────────
const routes = [
  {
    id: 'RT1',  name: 'Kimara – Kivukoni',         shortName: '1',
    color: '#E53935', active: true, frequency: 8,  phase: 1,
    stationIds: ['ST_KIM','ST_KRG','ST_BCH','ST_BAR','ST_CRN','ST_KBO','ST_UBM','ST_UBU',
                 'ST_SHK','ST_URF','ST_MNZ','ST_TTP','ST_MNR','ST_MGK','ST_MGP','ST_MGI',
                 'ST_MKW','ST_JNG','ST_FIR','ST_DIT','ST_KIS','ST_HJJ','ST_PYZ','ST_KIV'],
  },
  {
    id: 'RT1X', name: 'Kimara – Kivukoni Express', shortName: '1X',
    color: '#B71C1C', active: true, frequency: 15, phase: 1,
    stationIds: ['ST_KIM','ST_UBU','ST_FIR','ST_KIV'],
  },
  {
    id: 'RT2',  name: 'Ubungo – Kivukoni',         shortName: '2',
    color: '#1E88E5', active: true, frequency: 10, phase: 1,
    stationIds: ['ST_UBU','ST_SHK','ST_URF','ST_MNZ','ST_TTP','ST_MNR','ST_MGK','ST_MGP',
                 'ST_MGI','ST_MKW','ST_JNG','ST_FIR','ST_DIT','ST_KIS','ST_HJJ','ST_PYZ','ST_KIV'],
  },
  {
    id: 'RT3',  name: 'Morocco – Kivukoni',        shortName: '3',
    color: '#FB8C00', active: true, frequency: 10, phase: 1,
    stationIds: ['ST_MOR','ST_KNB','ST_MWN','ST_MKK','ST_KNS','ST_MGH','ST_MGP','ST_MGI',
                 'ST_MKW','ST_JNG','ST_FIR','ST_DIT','ST_KIS','ST_HJJ','ST_PYZ','ST_KIV'],
  },
  {
    id: 'RT4',  name: 'Kimara – Gerezani',         shortName: '4',
    color: '#43A047', active: true, frequency: 8,  phase: 1,
    stationIds: ['ST_KIM','ST_KRG','ST_BCH','ST_BAR','ST_CRN','ST_KBO','ST_UBM','ST_UBU',
                 'ST_SHK','ST_URF','ST_MNZ','ST_TTP','ST_MNR','ST_MGK','ST_MGP','ST_MGI',
                 'ST_MKW','ST_JNG','ST_FIR','ST_MSA','ST_MSB','ST_GER'],
  },
  {
    id: 'RT4X', name: 'Kimara – Gerezani Express', shortName: '4X',
    color: '#2E7D32', active: true, frequency: 15, phase: 1,
    stationIds: ['ST_KIM','ST_UBU','ST_FIR','ST_GER'],
  },
  {
    id: 'RT5',  name: 'Ubungo – Gerezani',         shortName: '5',
    color: '#8E24AA', active: true, frequency: 10, phase: 1,
    stationIds: ['ST_UBU','ST_SHK','ST_URF','ST_MNZ','ST_TTP','ST_MNR','ST_MGK','ST_MGP',
                 'ST_MGI','ST_MKW','ST_JNG','ST_FIR','ST_MSA','ST_MSB','ST_GER'],
  },
  {
    id: 'RT6',  name: 'Morocco – Gerezani',        shortName: '6',
    color: '#00ACC1', active: true, frequency: 12, phase: 1,
    stationIds: ['ST_MOR','ST_KNB','ST_MWN','ST_MKK','ST_KNS','ST_MGH','ST_MGP','ST_MGI',
                 'ST_MKW','ST_JNG','ST_FIR','ST_MSA','ST_MSB','ST_GER'],
  },
  {
    id: 'RT7',  name: 'Kimara – Morocco',          shortName: '7',
    color: '#F4511E', active: true, frequency: 12, phase: 1,
    stationIds: ['ST_KIM','ST_KRG','ST_BCH','ST_BAR','ST_CRN','ST_KBO','ST_UBM','ST_UBU',
                 'ST_SHK','ST_URF','ST_MNZ','ST_TTP','ST_MNR','ST_MGK','ST_MGP',
                 'ST_MGH','ST_KNS','ST_MKK','ST_MWN','ST_KNB','ST_MOR'],
  },
  {
    id: 'RT10', name: 'Gerezani – Kivukoni',       shortName: '10',
    color: '#6D4C41', active: true, frequency: 15, phase: 1,
    stationIds: ['ST_GER','ST_RLW','ST_WZR','ST_KIV'],
  },
  {
    id: 'RT_P2', name: 'Mbagala – Kivukoni',       shortName: 'P2',
    color: '#FF6F00', active: true, frequency: 12, phase: 2,
    stationIds: ['ST_MBR','ST_MBK','ST_ZKH','ST_CHR','ST_KZI','ST_MTC','ST_MSS','ST_MAA',
                 'ST_MDP','ST_MGO','ST_YMB','ST_KKO','ST_MDJ','ST_CHG','ST_UHB','ST_MGL',
                 'ST_GJN','ST_BND','ST_RLW','ST_WZR','ST_KIV'],
  },
];

// ── Route Waypoints ───────────────────────────────────────────
// All coordinates are [lat, lng] at 6 decimal places.
// Dense intermediate points so the Map Matching API snaps to
// the correct road lane rather than a parallel street.
//
// ══ BUILDING BLOCKS ══════════════════════════════════════════

// ── Morogoro Road Trunk: Kimara Terminal → Fire Station ───────
// Runs east-southeast along the BRT dedicated median lane.
// Station positions are embedded as comments.
const TRUNK = [
  [-6.782900, 39.176500],  // Kimara Terminal
  [-6.783100, 39.179300],
  [-6.783600, 39.183200],  // Korogwe
  [-6.783900, 39.186500],
  [-6.784400, 39.190100],  // Bucha
  [-6.784900, 39.193700],
  [-6.785500, 39.197200],  // Baruti
  [-6.786200, 39.200800],
  [-6.787000, 39.204400],  // Corner
  [-6.788000, 39.207900],
  [-6.789100, 39.211800],  // Kibo
  [-6.790200, 39.215600],
  [-6.791300, 39.219400],  // Ubungo Maji
  [-6.792100, 39.223200],
  [-6.793200, 39.227100],  // Ubungo Terminal
  [-6.793900, 39.230600],
  [-6.794800, 39.234800],  // Shekilango
  [-6.795500, 39.238500],
  [-6.796200, 39.242600],  // Urafiki
  [-6.796900, 39.246500],
  [-6.797600, 39.250100],  // Manzese
  [-6.798000, 39.253400],
  [-6.798400, 39.255800],  // Tip Top
  [-6.798600, 39.258200],
  [-6.798900, 39.260700],  // Manzese Royal
  [-6.799100, 39.263000],
  [-6.799200, 39.265400],  // Magomeni Kanisani
  [-6.799300, 39.267800],
  [-6.799500, 39.270200],  // Magomeni Mapipa (Morocco junction)
  [-6.799700, 39.272500],
  [-6.799900, 39.274900],  // Magomeni Mikumi
  [-6.800200, 39.277000],
  [-6.801200, 39.279100],  // Mkwajuni
  [-6.802400, 39.280900],
  [-6.804600, 39.282800],  // Jangwani
  [-6.806900, 39.283600],
  [-6.809200, 39.284200],
  [-6.812800, 39.284900],  // Fire Station
];

// Morocco / Kawawa Road spur: Magomeni Mapipa → north → Morocco Terminal
const MOR_SPUR_UP = [
  [-6.799500, 39.270200],  // Magomeni Mapipa (junction on Morogoro Road)
  [-6.796900, 39.271000],
  [-6.793800, 39.271800],  // Magomeni Hospital
  [-6.790600, 39.272400],
  [-6.787400, 39.272600],  // Kanisani
  [-6.784100, 39.272200],
  [-6.781200, 39.271900],  // Mkwajuni (Kawawa Road)
  [-6.778000, 39.271100],
  [-6.774600, 39.269800],  // Mwanamboka
  [-6.771000, 39.268400],
  [-6.767200, 39.266900],  // Kinondoni B
  [-6.763500, 39.265000],
  [-6.760100, 39.263300],
  [-6.758200, 39.262400],  // Morocco Terminal
];
const MOR_SPUR_DOWN = [...MOR_SPUR_UP].reverse();

// Kivukoni branch: Fire Station → east along Sokoine Drive → Kivukoni Terminal
const FIRE_TO_KIV = [
  [-6.812800, 39.284900],  // Fire Station
  [-6.814100, 39.284600],
  [-6.816400, 39.283200],  // DIT
  [-6.817500, 39.282800],
  [-6.818200, 39.282100],  // Kisutu
  [-6.819000, 39.282200],
  [-6.819600, 39.282400],  // Halmashauri ya Jiji
  [-6.820100, 39.283700],
  [-6.820400, 39.285600],  // Posta ya Zamani
  [-6.820200, 39.287400],
  [-6.819800, 39.289400],  // Kivukoni Terminal
];

// Gerezani branch: Fire Station → south via Msimbazi Street → Gerezani Terminal
const FIRE_TO_GER = [
  [-6.812800, 39.284900],  // Fire Station
  [-6.813700, 39.283800],
  [-6.815600, 39.283400],  // Msimbazi-A
  [-6.817400, 39.280100],
  [-6.819400, 39.276400],  // Msimbazi-B
  [-6.821200, 39.277800],
  [-6.824200, 39.279600],  // Gerezani Terminal
];

// Gerezani → Kivukoni short coastal route (RT10)
const GER_TO_KIV = [
  [-6.824200, 39.279600],  // Gerezani Terminal
  [-6.824180, 39.284000],
  [-6.824180, 39.288140],  // Railway Station
  [-6.822140, 39.290560],  // Wizara
  [-6.820200, 39.289800],
  [-6.819800, 39.289400],  // Kivukoni Terminal
];

// Kilwa Road Phase 2: Mbagala Rangi Tatu → north → Kivukoni Terminal
const KILWA_ROAD = [
  [-7.053820, 39.296240],  // Mbagala Rangi Tatu Terminal
  [-7.047600, 39.296000],
  [-7.041200, 39.295400],
  [-7.036420, 39.294680],  // Mbagala Kuu
  [-7.031000, 39.293400],
  [-7.024840, 39.291580],  // Zakhem
  [-7.019200, 39.290100],
  [-7.013260, 39.288460],  // Charambe
  [-7.007600, 39.286400],
  [-7.001920, 39.284230],  // Kizuiani
  [-6.997400, 39.282600],
  [-6.992740, 39.280840],  // Mtoni Center
  [-6.988100, 39.279100],
  [-6.983420, 39.277350],  // Mtoni Saba Saba
  [-6.978800, 39.275800],
  [-6.974840, 39.274180],  // Mtoni Kwa Azizi Ali
  [-6.970200, 39.272900],
  [-6.965620, 39.271540],  // Mtoni Depot/Misheni
  [-6.960400, 39.269900],
  [-6.955240, 39.268210],  // Mgambo
  [-6.949800, 39.266800],
  [-6.944560, 39.265380],  // Yombo
  [-6.939200, 39.263600],
  [-6.933820, 39.261920],  // KeKo
  [-6.928800, 39.258800],
  [-6.924240, 39.255380],  // Mandela Junction
  [-6.920000, 39.253000],
  [-6.915760, 39.250640],  // Chang'ombe
  [-6.911200, 39.249100],
  [-6.906740, 39.247820],  // Uhasibu (TIA)
  [-6.902000, 39.249600],
  [-6.897420, 39.251580],  // Mgulani
  [-6.892600, 39.255400],
  [-6.888200, 39.259800],
  [-6.884180, 39.264820],  // Gerezani Junction
  [-6.878400, 39.268100],
  [-6.872400, 39.271600],
  [-6.866800, 39.274900],
  [-6.861200, 39.278200],
  [-6.854800, 39.281400],
  [-6.848200, 39.283200],
  [-6.841600, 39.284100],
  [-6.836240, 39.284920],  // Bandari
  [-6.830800, 39.286400],
  [-6.827200, 39.287400],
  [-6.824180, 39.288140],  // Railway Station
  [-6.822140, 39.290560],  // Wizara
  [-6.820200, 39.289800],
  [-6.819800, 39.289400],  // Kivukoni Terminal
];

// ── Index helpers in TRUNK ────────────────────────────────────
const T_UBU = 14;  // Ubungo Terminal
const T_MGP = 28;  // Magomeni Mapipa (Morocco spur junction)

// ── Compose route waypoints ───────────────────────────────────
const routeWaypoints = {
  // RT1:  Kimara → Morogoro Road (all stops) → Fire → Kivukoni
  RT1:  [...TRUNK, ...FIRE_TO_KIV.slice(1)],

  // RT1X: Kimara express (skip intermediate) → Ubungo → Fire → Kivukoni
  RT1X: [TRUNK[0], TRUNK[T_UBU], TRUNK[TRUNK.length - 1], ...FIRE_TO_KIV.slice(1)],

  // RT2:  Ubungo → Morogoro Road → Fire → Kivukoni
  RT2:  [...TRUNK.slice(T_UBU), ...FIRE_TO_KIV.slice(1)],

  // RT3:  Morocco → south via Kawawa Rd → Magomeni Mapipa → Morogoro Rd → Fire → Kivukoni
  RT3:  [...MOR_SPUR_DOWN, ...TRUNK.slice(T_MGP + 1), ...FIRE_TO_KIV.slice(1)],

  // RT4:  Kimara → Morogoro Road → Fire → Msimbazi → Gerezani
  RT4:  [...TRUNK, ...FIRE_TO_GER.slice(1)],

  // RT4X: Kimara express → Ubungo → Fire → Gerezani
  RT4X: [TRUNK[0], TRUNK[T_UBU], TRUNK[TRUNK.length - 1], ...FIRE_TO_GER.slice(1)],

  // RT5:  Ubungo → Morogoro Road → Fire → Msimbazi → Gerezani
  RT5:  [...TRUNK.slice(T_UBU), ...FIRE_TO_GER.slice(1)],

  // RT6:  Morocco → south via Kawawa Rd → Morogoro Rd → Fire → Msimbazi → Gerezani
  RT6:  [...MOR_SPUR_DOWN, ...TRUNK.slice(T_MGP + 1), ...FIRE_TO_GER.slice(1)],

  // RT7:  Kimara → Morogoro Road → Magomeni Mapipa → north via Kawawa Rd → Morocco
  RT7:  [...TRUNK.slice(0, T_MGP + 1), ...MOR_SPUR_UP.slice(1)],

  // RT10: Gerezani → coastal road → Railway Station → Wizara → Kivukoni
  RT10: GER_TO_KIV,

  // RT_P2: Mbagala Rangi Tatu → Kilwa Road north → Gerezani Junction → port → Kivukoni
  RT_P2: KILWA_ROAD,
};

// ── Buses ─────────────────────────────────────────────────────
// All buses start OFFLINE. They become 'active' only when a real
// ESP32 GPS tracker sends data to /api/gps or Firebase RTDB.
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
