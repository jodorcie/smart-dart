// ─────────────────────────────────────────────────────────────
// Smart DART – Official station list and route geometry
//
// Coordinates: WGS-84, 6 decimal places (~0.11 m precision)
// Station objects: { lat, lng }
//
// Source: user-supplied precise GPS survey data
// ─────────────────────────────────────────────────────────────

const stations = [

  // ── Morogoro Road Trunk (west → east) ─────────────────────────
  { id: 'ST_KIM', name: 'Kimara Terminal',         lat: -6.784532, lng: 39.176421, type: 'terminal', corridor: 'P1-Trunk',    phase: 1, active: true },
  { id: 'ST_KRG', name: 'Korogwe',                 lat: -6.786250, lng: 39.183100, type: 'station',  corridor: 'P1-Trunk',    phase: 1, active: true },
  { id: 'ST_BCH', name: 'Bucha',                   lat: -6.789120, lng: 39.191450, type: 'station',  corridor: 'P1-Trunk',    phase: 1, active: true },
  { id: 'ST_BAR', name: 'Baruti',                  lat: -6.791550, lng: 39.197840, type: 'station',  corridor: 'P1-Trunk',    phase: 1, active: true },
  { id: 'ST_CRN', name: 'Corner',                  lat: -6.793220, lng: 39.202350, type: 'station',  corridor: 'P1-Trunk',    phase: 1, active: true },
  { id: 'ST_KBO', name: 'Kibo',                    lat: -6.795410, lng: 39.207900, type: 'station',  corridor: 'P1-Trunk',    phase: 1, active: true },
  { id: 'ST_UBM', name: 'Ubungo Maji',             lat: -6.797100, lng: 39.213450, type: 'station',  corridor: 'P1-Trunk',    phase: 1, active: true },
  { id: 'ST_UBU', name: 'Ubungo Terminal',         lat: -6.798950, lng: 39.219800, type: 'terminal', corridor: 'P1-Trunk',    phase: 1, active: true },
  { id: 'ST_SHK', name: 'Shekilango',              lat: -6.799420, lng: 39.226100, type: 'station',  corridor: 'P1-Trunk',    phase: 1, active: true },
  { id: 'ST_URF', name: 'Urafiki',                 lat: -6.799910, lng: 39.232550, type: 'station',  corridor: 'P1-Trunk',    phase: 1, active: true },
  { id: 'ST_MNZ', name: 'Manzese',                 lat: -6.800350, lng: 39.238900, type: 'station',  corridor: 'P1-Trunk',    phase: 1, active: true },
  { id: 'ST_TTP', name: 'Tip Top',                 lat: -6.801211, lng: 39.243105, type: 'station',  corridor: 'P1-Trunk',    phase: 1, active: true },
  { id: 'ST_MNR', name: 'Manzese Royal',           lat: -6.802150, lng: 39.248400, type: 'station',  corridor: 'P1-Trunk',    phase: 1, active: true },
  // Magomeni Kanisani = Magomeni Usalama (interchange entry for Morocco spur westbound)
  { id: 'ST_MGK', name: 'Magomeni Kanisani',       lat: -6.803320, lng: 39.254100, type: 'station',  corridor: 'P1-Trunk',    phase: 1, active: true },
  { id: 'ST_MGP', name: 'Magomeni Mapipa',         lat: -6.804200, lng: 39.259450, type: 'station',  corridor: 'P1-Trunk',    phase: 1, active: true },
  { id: 'ST_MGI', name: 'Magomeni Mikumi',         lat: -6.805850, lng: 39.265100, type: 'station',  corridor: 'P1-Trunk',    phase: 1, active: true },
  { id: 'ST_MKW', name: 'Mkwajuni',                lat: -6.810452, lng: 39.271189, type: 'station',  corridor: 'P1-Trunk',    phase: 1, active: true },
  { id: 'ST_JNG', name: 'Jangwani',                lat: -6.811900, lng: 39.277800, type: 'station',  corridor: 'P1-Trunk',    phase: 1, active: true },
  { id: 'ST_FIR', name: 'Fire Station',            lat: -6.813150, lng: 39.282450, type: 'station',  corridor: 'P1-Trunk',    phase: 1, active: true },

  // ── Kivukoni branch (Fire → east along Sokoine Drive) ─────────
  // NOTE: ST_DIT is also the Phase-2 Kilwa Road "Gerezani Junction"
  //       (same physical interchange, different route context)
  { id: 'ST_DIT', name: 'DIT',                     lat: -6.814231, lng: 39.285891, type: 'station',  corridor: 'P1-Kivukoni', phase: 1, active: true },
  { id: 'ST_KIS', name: 'Kisutu',                  lat: -6.815550, lng: 39.289120, type: 'station',  corridor: 'P1-Kivukoni', phase: 1, active: true },
  { id: 'ST_HJJ', name: 'Halmashauri ya Jiji',     lat: -6.816820, lng: 39.292100, type: 'station',  corridor: 'P1-Kivukoni', phase: 1, active: true },
  { id: 'ST_PYZ', name: 'Posta ya Zamani',         lat: -6.817640, lng: 39.294450, type: 'station',  corridor: 'P1-Kivukoni', phase: 1, active: true },
  { id: 'ST_KIV', name: 'Kivukoni Terminal',       lat: -6.818451, lng: 39.296312, type: 'terminal', corridor: 'P1-Kivukoni', phase: 1, active: true },

  // ── Msimbazi / Gerezani branch (Fire → south) ─────────────────
  { id: 'ST_MSA', name: 'Msimbazi-A',              lat: -6.816900, lng: 39.281800, type: 'station',  corridor: 'P1-Gerezani', phase: 1, active: true },
  { id: 'ST_MSB', name: 'Msimbazi-B',              lat: -6.820200, lng: 39.280950, type: 'station',  corridor: 'P1-Gerezani', phase: 1, active: true },
  { id: 'ST_GER', name: 'Gerezani Terminal',       lat: -6.822987, lng: 39.280145, type: 'terminal', corridor: 'P1-Gerezani', phase: 1, active: true },

  // ── Morocco / Kawawa Road spur (Mapipa → north) ────────────────
  { id: 'ST_MGH', name: 'Magomeni Hospital',       lat: -6.799450, lng: 39.258800, type: 'station',  corridor: 'P1-Morocco',  phase: 1, active: true },
  { id: 'ST_KNS', name: 'Kanisani',                lat: -6.794900, lng: 39.258100, type: 'station',  corridor: 'P1-Morocco',  phase: 1, active: true },
  { id: 'ST_MKK', name: 'Mkwajuni',                lat: -6.791245, lng: 39.257412, type: 'station',  corridor: 'P1-Morocco',  phase: 1, active: true },
  { id: 'ST_MWN', name: 'Mwanamboka',              lat: -6.788500, lng: 39.257100, type: 'station',  corridor: 'P1-Morocco',  phase: 1, active: true },
  { id: 'ST_KNB', name: 'Kinondoni B',             lat: -6.785800, lng: 39.256950, type: 'station',  corridor: 'P1-Morocco',  phase: 1, active: true },
  { id: 'ST_MOR', name: 'Morocco Terminal',        lat: -6.783102, lng: 39.256841, type: 'terminal', corridor: 'P1-Morocco',  phase: 1, active: true },

  // ── Kilwa Road Phase 2 (south → north) ────────────────────────
  { id: 'ST_MBR', name: 'Mbagala Rangi Tatu Terminal', lat: -6.908471, lng: 39.266214, type: 'terminal', corridor: 'P2-Kilwa', phase: 2, active: true },
  { id: 'ST_MBK', name: 'Mbagala Kuu',             lat: -6.899450, lng: 39.267110, type: 'station',  corridor: 'P2-Kilwa',    phase: 2, active: true },
  { id: 'ST_ZKH', name: 'Zakhem',                  lat: -6.891120, lng: 39.268020, type: 'station',  corridor: 'P2-Kilwa',    phase: 2, active: true },
  { id: 'ST_CHR', name: 'Charambe',                lat: -6.883400, lng: 39.268950, type: 'station',  corridor: 'P2-Kilwa',    phase: 2, active: true },
  { id: 'ST_KZI', name: 'Kizuiani',                lat: -6.875200, lng: 39.269820, type: 'station',  corridor: 'P2-Kilwa',    phase: 2, active: true },
  { id: 'ST_MTC', name: 'Mtoni Center',            lat: -6.866950, lng: 39.271100, type: 'station',  corridor: 'P2-Kilwa',    phase: 2, active: true },
  { id: 'ST_MSS', name: 'Mtoni Saba Saba',         lat: -6.858450, lng: 39.272140, type: 'station',  corridor: 'P2-Kilwa',    phase: 2, active: true },
  { id: 'ST_MAA', name: 'Mtoni Kwa Azizi Ali',     lat: -6.851200, lng: 39.273550, type: 'station',  corridor: 'P2-Kilwa',    phase: 2, active: true },
  { id: 'ST_MDP', name: 'Mtoni Depot/Misheni',     lat: -6.844350, lng: 39.274800, type: 'station',  corridor: 'P2-Kilwa',    phase: 2, active: true },
  { id: 'ST_MGO', name: 'Mgambo',                  lat: -6.837900, lng: 39.276200, type: 'station',  corridor: 'P2-Kilwa',    phase: 2, active: true },
  { id: 'ST_YMB', name: 'Yombo',                   lat: -6.832100, lng: 39.277350, type: 'station',  corridor: 'P2-Kilwa',    phase: 2, active: true },
  { id: 'ST_KKO', name: 'KeKo',                    lat: -6.828450, lng: 39.278500, type: 'station',  corridor: 'P2-Kilwa',    phase: 2, active: true },
  { id: 'ST_MDJ', name: 'Mandela Junction',        lat: -6.826100, lng: 39.279200, type: 'station',  corridor: 'P2-Kilwa',    phase: 2, active: true },
  { id: 'ST_CHG', name: "Chang'ombe",              lat: -6.824200, lng: 39.280400, type: 'station',  corridor: 'P2-Kilwa',    phase: 2, active: true },
  { id: 'ST_UHB', name: 'Uhasibu (TIA)',           lat: -6.822850, lng: 39.281950, type: 'station',  corridor: 'P2-Kilwa',    phase: 2, active: true },
  { id: 'ST_MGL', name: 'Mgulani',                 lat: -6.821100, lng: 39.283800, type: 'station',  corridor: 'P2-Kilwa',    phase: 2, active: true },
  // Kilwa Road joins city-centre network at DIT / Gerezani Junction (ST_DIT, same coords)
  { id: 'ST_BND', name: 'Bandari',                 lat: -6.814950, lng: 39.288900, type: 'station',  corridor: 'P2-Kilwa',    phase: 2, active: true },
  { id: 'ST_RLW', name: 'Railway Station',         lat: -6.816200, lng: 39.292400, type: 'station',  corridor: 'P2-Kilwa',    phase: 2, active: true },
  { id: 'ST_WZR', name: 'Wizara',                  lat: -6.817150, lng: 39.294900, type: 'station',  corridor: 'P2-Kilwa',    phase: 2, active: true },
  // Kivukoni Terminal shared with P1 (ST_KIV)
];

// ── Routes ────────────────────────────────────────────────────
const routes = [
  {
    id: 'RT1',  name: 'Kimara – Kivukoni',         shortName: '1',
    color: '#E53935', active: true, frequency: 8,  phase: 1,
    stationIds: [
      'ST_KIM','ST_KRG','ST_BCH','ST_BAR','ST_CRN','ST_KBO','ST_UBM','ST_UBU',
      'ST_SHK','ST_URF','ST_MNZ','ST_TTP','ST_MNR','ST_MGK','ST_MGP','ST_MGI',
      'ST_MKW','ST_JNG','ST_FIR','ST_DIT','ST_KIS','ST_HJJ','ST_PYZ','ST_KIV',
    ],
  },
  {
    id: 'RT1X', name: 'Kimara – Kivukoni Express', shortName: '1X',
    color: '#B71C1C', active: true, frequency: 15, phase: 1,
    stationIds: ['ST_KIM','ST_UBU','ST_MGP','ST_FIR','ST_KIV'],
  },
  {
    id: 'RT2',  name: 'Ubungo – Kivukoni',         shortName: '2',
    color: '#1E88E5', active: true, frequency: 10, phase: 1,
    stationIds: [
      'ST_UBU','ST_SHK','ST_URF','ST_MNZ','ST_TTP','ST_MNR','ST_MGK','ST_MGP',
      'ST_MGI','ST_MKW','ST_JNG','ST_FIR','ST_DIT','ST_KIS','ST_HJJ','ST_PYZ','ST_KIV',
    ],
  },
  {
    id: 'RT3',  name: 'Morocco – Kivukoni',        shortName: '3',
    color: '#FB8C00', active: true, frequency: 10, phase: 1,
    // Morocco Terminal → south on Kawawa Rd → join Morogoro Rd at Mapipa → east → Kivukoni
    stationIds: [
      'ST_MOR','ST_KNB','ST_MWN','ST_MKK','ST_KNS','ST_MGH',
      'ST_MGP','ST_MGI','ST_MKW','ST_JNG','ST_FIR',
      'ST_DIT','ST_KIS','ST_HJJ','ST_PYZ','ST_KIV',
    ],
  },
  {
    id: 'RT4',  name: 'Kimara – Gerezani',         shortName: '4',
    color: '#43A047', active: true, frequency: 8,  phase: 1,
    stationIds: [
      'ST_KIM','ST_KRG','ST_BCH','ST_BAR','ST_CRN','ST_KBO','ST_UBM','ST_UBU',
      'ST_SHK','ST_URF','ST_MNZ','ST_TTP','ST_MNR','ST_MGK','ST_MGP','ST_MGI',
      'ST_MKW','ST_JNG','ST_FIR','ST_MSA','ST_MSB','ST_GER',
    ],
  },
  {
    id: 'RT4X', name: 'Kimara – Gerezani Express', shortName: '4X',
    color: '#2E7D32', active: true, frequency: 15, phase: 1,
    stationIds: ['ST_KIM','ST_UBU','ST_MGP','ST_FIR','ST_GER'],
  },
  {
    id: 'RT5',  name: 'Ubungo – Gerezani',         shortName: '5',
    color: '#8E24AA', active: true, frequency: 10, phase: 1,
    stationIds: [
      'ST_UBU','ST_SHK','ST_URF','ST_MNZ','ST_TTP','ST_MNR','ST_MGK','ST_MGP',
      'ST_MGI','ST_MKW','ST_JNG','ST_FIR','ST_MSA','ST_MSB','ST_GER',
    ],
  },
  {
    id: 'RT6',  name: 'Morocco – Gerezani',        shortName: '6',
    color: '#00ACC1', active: true, frequency: 12, phase: 1,
    stationIds: [
      'ST_MOR','ST_KNB','ST_MWN','ST_MKK','ST_KNS','ST_MGH',
      'ST_MGP','ST_MGI','ST_MKW','ST_JNG','ST_FIR','ST_MSA','ST_MSB','ST_GER',
    ],
  },
  {
    id: 'RT7',  name: 'Kimara – Morocco',          shortName: '7',
    color: '#F4511E', active: true, frequency: 12, phase: 1,
    // Kimara east along Morogoro Rd → Mapipa → turn north on Kawawa Rd → Morocco
    stationIds: [
      'ST_KIM','ST_KRG','ST_BCH','ST_BAR','ST_CRN','ST_KBO','ST_UBM','ST_UBU',
      'ST_SHK','ST_URF','ST_MNZ','ST_TTP','ST_MNR','ST_MGK','ST_MGP',
      'ST_MGH','ST_KNS','ST_MKK','ST_MWN','ST_KNB','ST_MOR',
    ],
  },
  {
    id: 'RT10', name: 'Gerezani – Kivukoni',       shortName: '10',
    color: '#6D4C41', active: true, frequency: 15, phase: 1,
    stationIds: ['ST_GER','ST_MSB','ST_MSA','ST_FIR','ST_DIT','ST_BND','ST_RLW','ST_WZR','ST_KIV'],
  },
  {
    id: 'RT_P2', name: 'Mbagala – Kivukoni',       shortName: 'P2',
    color: '#FF6F00', active: true, frequency: 12, phase: 2,
    // Kilwa Road north → join city at DIT/Gerezani Junction → coastal road → Kivukoni
    stationIds: [
      'ST_MBR','ST_MBK','ST_ZKH','ST_CHR','ST_KZI','ST_MTC','ST_MSS','ST_MAA',
      'ST_MDP','ST_MGO','ST_YMB','ST_KKO','ST_MDJ','ST_CHG','ST_UHB','ST_MGL',
      'ST_DIT','ST_BND','ST_RLW','ST_WZR','ST_KIV',
    ],
  },
];

// ── Route Waypoints ───────────────────────────────────────────
// Derived directly from station coordinates so they stay in sync.
// The frontend uses the Directions API to road-snap these; this
// object is kept for reference and lightweight fallback use.
const routeWaypoints = {};
routes.forEach(route => {
  routeWaypoints[route.id] = route.stationIds
    .map(id => stations.find(s => s.id === id))
    .filter(Boolean)
    .map(s => [s.lat, s.lng]);
});

// ── Buses ─────────────────────────────────────────────────────
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
