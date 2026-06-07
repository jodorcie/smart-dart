/**
 * Smart DART – Word Document Generator
 * Generates smart-dart-system-flow.docx
 */
'use strict';

const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, WidthType, BorderStyle, ShadingType,
  VerticalAlign, PageBreak, convertInchesToTwip,
} = require('docx');
const fs = require('fs');

// ── Colour palette ────────────────────────────────────────────
const C = {
  red:    'C62828', // Bus / terminal
  blue:   '1565C0', // Frontend
  green:  '2E7D32', // Backend
  amber:  'E65100', // Firebase
  purple: '4527A0', // Mapbox
  grey:   '37474F', // Operator/User
  teal:   '00695C', // Junction/shared node
  white:  'FFFFFF',
  darkBg: '0D1117',
  midBg:  '1E293B',
  light:  'F1F5F9',
  accent: 'E3F2FD',
};

// ── Helpers ───────────────────────────────────────────────────

function heading1(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 },
    shading: { type: ShadingType.SOLID, fill: C.midBg },
    run: { color: C.white },
  });
}

function heading2(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 120 },
  });
}

function para(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 80, after: 80 },
    children: [new TextRun({ text, size: 20, ...opts })],
  });
}

function bold(text, color = '000000') {
  return new TextRun({ text, bold: true, size: 20, color });
}

function divider() {
  return new Paragraph({
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CBD5E1' } },
    spacing: { before: 160, after: 160 },
    children: [],
  });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

/** Single-row label cell with background colour */
function labelCell(text, fillColor, textColor = C.white, width = 20, colspan = 1) {
  return new TableCell({
    width: { size: width, type: WidthType.PERCENTAGE },
    columnSpan: colspan,
    verticalAlign: VerticalAlign.CENTER,
    shading: { type: ShadingType.SOLID, fill: fillColor },
    borders: {
      top:    { style: BorderStyle.SINGLE, size: 4, color: 'FFFFFF' },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: 'FFFFFF' },
      left:   { style: BorderStyle.SINGLE, size: 4, color: 'FFFFFF' },
      right:  { style: BorderStyle.SINGLE, size: 4, color: 'FFFFFF' },
    },
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 60, after: 60 },
      children: [new TextRun({ text, bold: true, size: 18, color: textColor })],
    })],
  });
}

/** Arrow cell */
function arrow(dir = '→') {
  return new TableCell({
    width: { size: 5, type: WidthType.PERCENTAGE },
    verticalAlign: VerticalAlign.CENTER,
    borders: {
      top:    { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left:   { style: BorderStyle.NONE },
      right:  { style: BorderStyle.NONE },
    },
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: dir, size: 22, bold: true, color: '64748B' })],
    })],
  });
}

/** Empty spacer cell */
function spacer(width = 5) {
  return new TableCell({
    width: { size: width, type: WidthType.PERCENTAGE },
    borders: {
      top:    { style: BorderStyle.NONE },
      bottom: { style: BorderStyle.NONE },
      left:   { style: BorderStyle.NONE },
      right:  { style: BorderStyle.NONE },
    },
    children: [new Paragraph({ children: [] })],
  });
}

/** Flow row: [node] → [node] → [node] ... */
function flowRow(cells) {
  return new TableRow({ children: cells });
}

/** Full-width note row */
function noteRow(text, fill = 'F8FAFC', colspan = 7) {
  return new TableRow({
    children: [new TableCell({
      columnSpan: colspan,
      shading: { type: ShadingType.SOLID, fill },
      borders: {
        top:    { style: BorderStyle.DASHED, size: 2, color: 'CBD5E1' },
        bottom: { style: BorderStyle.DASHED, size: 2, color: 'CBD5E1' },
        left:   { style: BorderStyle.NONE },
        right:  { style: BorderStyle.NONE },
      },
      children: [new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 40, after: 40 },
        children: [new TextRun({ text, size: 17, italics: true, color: '475569' })],
      })],
    })],
  });
}

function makeTable(rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows,
  });
}

// ─────────────────────────────────────────────────────────────
// SECTION BUILDERS
// ─────────────────────────────────────────────────────────────

function buildCoverPage() {
  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 2000, after: 200 },
      children: [new TextRun({ text: '🚌  Smart DART', bold: true, size: 64, color: C.red })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 200 },
      children: [new TextRun({ text: 'Real-Time Bus Tracking System', bold: true, size: 40, color: C.grey })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 600 },
      children: [new TextRun({ text: 'System Flow Diagram  ·  Dar es Salaam, Tanzania', size: 24, color: '94A3B8' })],
    }),
    divider(),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 60 },
      children: [new TextRun({ text: 'Prepared for DART BRT Operations', size: 22, color: '475569' })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 60 },
      children: [new TextRun({ text: 'Frontend: https://smart-dart.vercel.app', size: 20, color: C.blue })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 60 },
      children: [new TextRun({ text: 'Backend: https://smart-dart.onrender.com', size: 20, color: C.green })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 60 },
      children: [new TextRun({ text: 'Source: https://github.com/jodorcie/smart-dart', size: 20, color: C.grey })],
    }),
    pageBreak(),
  ];
}

// ── 1. High-Level Architecture ────────────────────────────────
function buildArchSection() {
  const rows = [
    // Row 1: GPS → Firebase → Frontend
    flowRow([
      labelCell('📡 GPS Tracker\n(Phone / Device)', C.red, C.white, 18),
      arrow('→'),
      labelCell('☁️ Firebase\nRealtime DB\ndart-buses/{busId}', C.amber, C.white, 20),
      arrow('→'),
      labelCell('🔵 Firebase SDK\nonValue() listener\n(Browser)', C.blue, C.white, 20),
      spacer(3),
      labelCell('', 'F8FAFC', 'F8FAFC', 14),
    ]),
    noteRow('GPS payload: { lat, lng, speed, heading, satellites, hdop, hasFix, timestamp }'),

    // Row 2: Backend → Socket.IO → Frontend
    flowRow([
      labelCell('🟢 Backend Server\nNode.js + Express\n(Render)', C.green, C.white, 18),
      arrow('→'),
      labelCell('⚡ Socket.IO\nWebSocket events\nport 3001', C.teal, C.white, 20),
      arrow('→'),
      labelCell('🔵 Zustand Store\ndartStore.js\nbuses · routes · stations', C.blue, C.white, 20),
      arrow('→'),
      labelCell('🗺️ LiveMap.jsx\nMapbox GL JS\nStation markers + Route lines', C.blue, C.white, 14),
    ]),
    noteRow('Socket events: init  ·  busUpdate  ·  stationArrivals  ·  routeUpdate'),

    // Row 3: Admin → REST → Backend
    flowRow([
      labelCell('👤 Operator\nAdmin Panel\n/operator/*', C.grey, C.white, 18),
      arrow('→'),
      labelCell('🔐 REST API\nCRUD endpoints\nJWT Auth', C.green, C.white, 20),
      arrow('→'),
      labelCell('🟢 In-Memory Store\ninitialData.js\n53 stations · 11 routes', C.green, C.white, 20),
      spacer(5),
      labelCell('', 'F8FAFC', 'F8FAFC', 14),
    ]),
    noteRow('Admin endpoints: POST/PUT/DELETE  /api/buses  /api/routes  /api/stations'),

    // Row 4: Frontend → Mapbox
    flowRow([
      labelCell('🗺️ LiveMap.jsx\nStation coords\nas waypoints', C.blue, C.white, 18),
      arrow('→'),
      labelCell('🟣 Mapbox\nDirections API\n/driving', C.purple, C.white, 20),
      arrow('→'),
      labelCell('📐 GeoJSON\nLineStrings\nRoad-snapped routes', C.purple, C.white, 20),
      arrow('→'),
      labelCell('💾 localStorage\nCache v7\n24 h TTL', '546E7A', C.white, 14),
    ]),
    noteRow('Mapbox also serves raster map tiles (street / satellite)'),
  ];

  return [
    heading2('1 · High-Level System Architecture'),
    makeTable(rows),
    para(''),
  ];
}

// ── 2. Passenger Flow ─────────────────────────────────────────
function buildPassengerFlow() {
  const steps = [
    ['1', '🧍 Passenger opens app', C.grey],
    ['2', '🔌 Socket.IO connects to Backend (Render)', C.teal],
    ['3', '📦 Receive init event: routes · stations · buses', C.green],
    ['4', '🗺️ Map renders station markers + road-snapped route lines', C.blue],
    ['5', '🔥 Firebase SDK attaches onValue() listener to dart-buses/*', C.amber],
    ['6', '📡 If no GPS data → "Waiting for GPS Signal" chip (top-right)', C.grey],
    ['7', '🚌 If GPS data arrives → Bus markers appear with speed + heading', C.green],
    ['8', '👆 User taps bus marker → BusInfoPanel: speed · heading · GPS quality', C.blue],
    ['9', '🔍 User opens Route Search → types origin + destination', C.blue],
    ['10', '⚡ runSearch() checks for direct routes first', C.teal],
    ['11', '🔄 If no direct → Transfer search finds shared intermediate stations', C.amber],
    ['12', '📋 Results shown: X direct  ·  Y with transfer', C.blue],
    ['13', '👆 User taps a route card → Map isolates that route (others dimmed)', C.blue],
    ['14', '🎯 fitBounds() zooms map to the focused route\'s station extent', C.purple],
  ];

  const rows = steps.map(([num, text, color]) =>
    new TableRow({
      children: [
        new TableCell({
          width: { size: 8, type: WidthType.PERCENTAGE },
          verticalAlign: VerticalAlign.CENTER,
          shading: { type: ShadingType.SOLID, fill: color },
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: num, bold: true, size: 20, color: C.white })],
          })],
        }),
        new TableCell({
          width: { size: 92, type: WidthType.PERCENTAGE },
          children: [new Paragraph({
            spacing: { before: 60, after: 60 },
            children: [new TextRun({ text, size: 20 })],
          })],
        }),
      ],
    })
  );

  return [
    heading2('2 · Passenger App User Flow'),
    makeTable(rows),
    para(''),
  ];
}

// ── 3. GPS Pipeline ───────────────────────────────────────────
function buildGPSPipeline() {
  const rows = [
    flowRow([
      labelCell('📡 GPS Device\nDARTxxx', C.red, C.white, 22),
      arrow('→'),
      labelCell('Firebase PUT\nhttps://.../dart-buses/DART001\n{ lat, lng, speed, heading,\n  satellites, hdop, hasFix, ts }', C.amber, C.white, 36),
      arrow('→'),
      labelCell('Firebase DB\nPushes to\nall listeners', C.amber, C.white, 22),
    ]),
    noteRow('Firebase handles real-time push — no polling needed', 'FFF8E1', 5),
    flowRow([
      labelCell('Firebase SDK\nonValue() fires\nin browser', C.blue, C.white, 22),
      arrow('→'),
      labelCell('applyFirebaseOverlay(fbData)\nin Zustand store\n• Parse lat/lng as float\n• Validate Dar es Salaam bounds\n• status = "active"\n• Set outOfArea flag', C.blue, C.white, 36),
      arrow('→'),
      labelCell('Bus array updated\nReact re-renders\nLiveMap.jsx', C.blue, C.white, 22),
    ]),
    noteRow('Dar es Salaam bounds: N −6.50 · S −7.10 · E 39.55 · W 38.90', 'E3F2FD', 5),
    flowRow([
      labelCell('LiveMap.jsx\nreceives new\nbus coords', C.blue, C.white, 22),
      arrow('→'),
      labelCell('Bus Marker repositioned\nHeading arrow rotated\nSpeed badge updated\n"SIM" badge removed (live data)', C.blue, C.white, 36),
      arrow('→'),
      labelCell('User sees\nbus moving\nin real time', C.teal, C.white, 22),
    ]),
  ];

  return [
    heading2('3 · Live GPS Data Pipeline'),
    makeTable(rows),
    para(''),
  ];
}

// ── 4. Road Snapping ──────────────────────────────────────────
function buildRoadSnap() {
  const steps = [
    ['Hook mounts (routes + stations loaded)',                              C.blue,   '↓'],
    ['Check localStorage key dart_snapped_routes_v7',                      '546E7A', '↓'],
    ['HIT (< 24 h): return cached GeoJSON instantly  →  map renders',      C.green,  '—'],
    ['MISS: loop over all active routes',                                   C.amber,  '↓'],
    ['For each route: collect station coords from stationIds lookup',       C.teal,   '↓'],
    ['If > 25 stations: subsample evenly to 25 (Directions API limit)',     C.grey,   '↓'],
    ['Call Mapbox Directions API  /driving/lng1,lat1;lng2,lat2;...',        C.purple, '↓'],
    ['SUCCESS: extract routes[0].geometry.coordinates (road-snapped line)', C.green,  '↓'],
    ['FAIL/empty: fallback to straight-line through station positions',     C.amber,  '↓'],
    ['Push GeoJSON Feature { color, name, id, phase }',                    C.blue,   '↓'],
    ['Write full FeatureCollection to localStorage v7 (24 h TTL)',         '546E7A', '↓'],
    ['setGeoJSON() → map re-renders with road-following coloured lines',    C.blue,   '✓'],
  ];

  const rows = steps.map(([text, color, sym]) =>
    new TableRow({
      children: [
        new TableCell({
          width: { size: 8, type: WidthType.PERCENTAGE },
          verticalAlign: VerticalAlign.CENTER,
          shading: { type: ShadingType.SOLID, fill: color },
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun({ text: sym, bold: true, size: 22, color: C.white })],
          })],
        }),
        new TableCell({
          width: { size: 92, type: WidthType.PERCENTAGE },
          children: [new Paragraph({
            spacing: { before: 60, after: 60 },
            children: [new TextRun({ text, size: 20 })],
          })],
        }),
      ],
    })
  );

  return [
    heading2('4 · Route Road-Snapping  (useRoadSnappedRoutes hook)'),
    makeTable(rows),
    para(''),
  ];
}

// ── 5. Transfer Search ────────────────────────────────────────
function buildTransferSearch() {
  const rows = [
    flowRow([
      labelCell('User types\nOrigin + Dest\nstation names', C.grey, C.white, 22),
      arrow('→'),
      labelCell('runSearch()\nLook up originSt\nand destSt objects', C.blue, C.white, 34),
      arrow('→'),
      labelCell('Direct search:\nroutes where\nstationIds ⊇ {origin, dest}', C.green, C.white, 34),
    ]),
    noteRow('If direct routes found → show as DirectCard (green badge)', 'E8F5E9', 5),
    flowRow([
      labelCell('Transfer\nSearch', C.amber, C.white, 22),
      arrow('→'),
      labelCell('originRoutes = routes serving origin\ndestRoutes = routes serving dest', C.amber, C.white, 34),
      arrow('→'),
      labelCell('For each leg1 × leg2 pair\n(leg1 ≠ leg2):\nfind sharedIds = leg1 ∩ leg2\nexcluding origin & dest', C.amber, C.white, 34),
    ]),
    noteRow('Each shared station becomes a potential transfer point (bus change)', 'FFF8E1', 5),
    flowRow([
      labelCell('Transfer\nResult', C.red, C.white, 22),
      arrow('→'),
      labelCell('Leg 1: RT7  Kimara → Magomeni Mapipa\n🔄 Change at: Magomeni Mapipa\nLeg 2: RT3  Magomeni Mapipa → Kivukoni', C.red, C.white, 34),
      arrow('→'),
      labelCell('TransferCard\nshown in\nresults panel', C.blue, C.white, 34),
    ]),
    noteRow('Tap TransferCard → both route lines highlighted on map simultaneously', 'E3F2FD', 5),
  ];

  return [
    heading2('5 · Transfer Journey Search Algorithm'),
    makeTable(rows),
    para(''),
  ];
}

// ── 6. Admin Panel ────────────────────────────────────────────
function buildAdminFlow() {
  const steps = [
    ['Operator visits /operator/login',                               C.grey],
    ['Enters: username = operator  ·  password = dart2024',          C.grey],
    ['POST /api/auth/login → Backend validates credentials',         C.green],
    ['JWT token returned → stored in authStore.js (Zustand)',        C.green],
    ['Redirect to /operator/dashboard',                              C.blue],
    ['Dashboard — Buses Tab: view all buses, add new, edit, remove', C.blue],
    ['Dashboard — Routes Tab: toggle routes active / inactive',      C.blue],
    ['Dashboard — Stations Tab: view all 53 stations with coords',   C.blue],
    ['Dashboard — Live Monitor: real-time bus positions + status',   C.teal],
    ['CRUD action → REST API call (PUT / POST / DELETE)',            C.green],
    ['Backend updates in-memory store',                              C.green],
    ['Socket.IO broadcasts updated data to ALL connected clients',   C.amber],
    ['All passenger browsers receive live update instantly',         C.blue],
  ];

  const rows = steps.map(([text, color]) =>
    new TableRow({
      children: [
        new TableCell({
          width: { size: 6, type: WidthType.PERCENTAGE },
          shading: { type: ShadingType.SOLID, fill: color },
          children: [new Paragraph({ children: [] })],
        }),
        new TableCell({
          width: { size: 94, type: WidthType.PERCENTAGE },
          children: [new Paragraph({
            spacing: { before: 60, after: 60 },
            children: [new TextRun({ text, size: 20 })],
          })],
        }),
      ],
    })
  );

  return [
    heading2('6 · Operator / Admin Panel Flow'),
    makeTable(rows),
    para(''),
  ];
}

// ── 7. Corridors ──────────────────────────────────────────────
function buildCorridors() {
  const corridors = [
    {
      name: '🔴  Corridor 1 — Morogoro Road Trunk',
      color: C.red,
      route: 'RT1 · RT1X · RT2 · RT4 · RT4X · RT5 · RT7',
      stations: [
        'Kimara Terminal  (39.176421, −6.784532)',
        'Korogwe  ·  Bucha  ·  Baruti  ·  Corner  ·  Kibo',
        'Ubungo Maji  →  Ubungo Terminal  (39.219800)',
        'Shekilango  ·  Urafiki  ·  Manzese  ·  Tip Top  ·  Manzese Royal',
        'Magomeni Kanisani  ·  Magomeni Mapipa  ⊕ Junction',
        'Magomeni Mikumi  ·  Mkwajuni  ·  Jangwani',
        'Fire Station  ⊕ Branch node  (39.282450)',
        'DIT  ·  Kisutu  ·  Halmashauri ya Jiji  ·  Posta ya Zamani',
        'Kivukoni Terminal  (39.296312, −6.818451)',
      ],
    },
    {
      name: '🔵  Corridor 2 — Gerezani Branch  (Fire → south)',
      color: C.blue,
      route: 'RT4 · RT4X · RT5 · RT6 · RT10',
      stations: [
        'Fire Station  (39.282450, −6.813150)',
        'Msimbazi-A  (39.281800, −6.816900)',
        'Msimbazi-B  (39.280950, −6.820200)',
        'Gerezani Terminal  (39.280145, −6.822987)',
      ],
    },
    {
      name: '🟠  Corridor 3 — Kawawa Road / Morocco Spur  (Mapipa → north)',
      color: C.amber,
      route: 'RT3 · RT6 · RT7',
      stations: [
        'Magomeni Mapipa  ⊕ Junction  (39.259450, −6.804200)',
        'Magomeni Hospital  (39.258800, −6.799450)',
        'Kanisani  (39.258100, −6.794900)',
        'Mkwajuni  (39.257412, −6.791245)',
        'Mwanamboka  (39.257100, −6.788500)',
        'Kinondoni B  (39.256950, −6.785800)',
        'Morocco Terminal  (39.256841, −6.783102)',
      ],
    },
    {
      name: '🟢  Corridor 4 — Kilwa Road Phase 2  (Mbagala → north)',
      color: C.green,
      route: 'RT_P2',
      stations: [
        'Mbagala Rangi Tatu Terminal  (39.266214, −6.908471)',
        'Mbagala Kuu  ·  Zakhem  ·  Charambe  ·  Kizuiani',
        'Mtoni Center  ·  Mtoni Saba Saba  ·  Mtoni Kwa Azizi Ali',
        'Mtoni Depot/Misheni  ·  Mgambo  ·  Yombo  ·  KeKo',
        'Mandela Junction  ·  Chang\'ombe  ·  Uhasibu (TIA)  ·  Mgulani',
        'DIT / Gerezani Junction  ⊕ P1∩P2 interchange  (39.285891, −6.814231)',
        'Bandari  ·  Railway Station  ·  Wizara',
        'Kivukoni Terminal  (39.296312, −6.818451)  ← shared with Corridor 1',
      ],
    },
  ];

  const children = [heading2('7 · DART BRT Physical Corridors  (53 Stations)')];

  for (const cor of corridors) {
    // Corridor header
    children.push(new Paragraph({
      spacing: { before: 200, after: 80 },
      shading: { type: ShadingType.SOLID, fill: cor.color },
      children: [new TextRun({ text: cor.name, bold: true, size: 22, color: C.white })],
    }));
    children.push(new Paragraph({
      spacing: { before: 0, after: 80 },
      children: [new TextRun({ text: 'Routes: ' + cor.route, size: 18, color: '475569', italics: true })],
    }));
    for (const st of cor.stations) {
      children.push(new Paragraph({
        bullet: { level: 0 },
        spacing: { before: 40, after: 40 },
        children: [new TextRun({ text: st, size: 19 })],
      }));
    }
  }
  children.push(para(''));
  return children;
}

// ── 8. Tech Stack ─────────────────────────────────────────────
function buildTechStack() {
  const rows = [
    new TableRow({
      tableHeader: true,
      children: [
        labelCell('Layer', '1A237E', C.white, 20),
        labelCell('Technology', '1A237E', C.white, 30),
        labelCell('Hosting', '1A237E', C.white, 25),
        labelCell('Purpose', '1A237E', C.white, 25),
      ],
    }),
    ...[
      ['Frontend',        'React 18 + Vite + Tailwind CSS',    'Vercel (CDN)',          'Passenger & operator UI'],
      ['Map',             'Mapbox GL JS via react-map-gl v7',   'Mapbox Cloud',          'Interactive BRT map'],
      ['State',           'Zustand (dartStore, authStore)',      'Browser memory',        'Global app state'],
      ['Road Routing',    'Mapbox Directions API /driving',      'Mapbox Cloud',          'Road-snapped route lines'],
      ['Route Cache',     'localStorage v7  (24 h TTL)',        'Browser',               'Avoid repeated API calls'],
      ['Backend',         'Node.js + Express + Socket.IO',      'Render (cloud)',         'Data server + real-time events'],
      ['Auth',            'JWT middleware (Express)',            'Render',                'Operator login protection'],
      ['GPS Overlay',     'Firebase Realtime Database SDK',     'Firebase (Google)',      'Live bus position stream'],
      ['GPS Input',       'HTTPS PUT from phone/device',        'Firebase REST',         'Bus driver app → Firebase'],
      ['Source Control',  'Git + GitHub',                       'github.com/jodorcie',   'Auto-deploy to Vercel + Render'],
    ].map(([layer, tech, host, purpose]) =>
      new TableRow({
        children: [
          new TableCell({
            width: { size: 20, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.SOLID, fill: 'EEF2FF' },
            children: [new Paragraph({
              spacing: { before: 60, after: 60 },
              children: [new TextRun({ text: layer, bold: true, size: 19 })],
            })],
          }),
          new TableCell({
            width: { size: 30, type: WidthType.PERCENTAGE },
            children: [new Paragraph({
              spacing: { before: 60, after: 60 },
              children: [new TextRun({ text: tech, size: 19, color: C.blue })],
            })],
          }),
          new TableCell({
            width: { size: 25, type: WidthType.PERCENTAGE },
            children: [new Paragraph({
              spacing: { before: 60, after: 60 },
              children: [new TextRun({ text: host, size: 19, color: C.green })],
            })],
          }),
          new TableCell({
            width: { size: 25, type: WidthType.PERCENTAGE },
            children: [new Paragraph({
              spacing: { before: 60, after: 60 },
              children: [new TextRun({ text: purpose, size: 19 })],
            })],
          }),
        ],
      })
    ),
  ];

  return [
    heading2('8 · Technology Stack'),
    makeTable(rows),
    para(''),
  ];
}

// ── 9. Route Summary ──────────────────────────────────────────
function buildRouteSummary() {
  const routes = [
    ['RT1',   '1',   'Kimara – Kivukoni (All stops)',       '#E53935', '24', 'P1'],
    ['RT1X',  '1X',  'Kimara – Kivukoni Express',           '#B71C1C', '5',  'P1'],
    ['RT2',   '2',   'Ubungo – Kivukoni',                   '#1E88E5', '17', 'P1'],
    ['RT3',   '3',   'Morocco – Kivukoni',                  '#FB8C00', '16', 'P1'],
    ['RT4',   '4',   'Kimara – Gerezani',                   '#43A047', '22', 'P1'],
    ['RT4X',  '4X',  'Kimara – Gerezani Express',           '#2E7D32', '5',  'P1'],
    ['RT5',   '5',   'Ubungo – Gerezani',                   '#8E24AA', '15', 'P1'],
    ['RT6',   '6',   'Morocco – Gerezani',                  '#00ACC1', '14', 'P1'],
    ['RT7',   '7',   'Kimara – Morocco',                    '#F4511E', '21', 'P1'],
    ['RT10',  '10',  'Gerezani – Kivukoni',                 '#6D4C41', '9',  'P1'],
    ['RT_P2', 'P2',  'Mbagala – Kivukoni (Kilwa Road)',     '#FF6F00', '21', 'P2'],
  ];

  const rows = [
    new TableRow({
      tableHeader: true,
      children: [
        labelCell('Route ID',   '263238', C.white, 12),
        labelCell('No.',        '263238', C.white, 8),
        labelCell('Name',       '263238', C.white, 40),
        labelCell('Colour',     '263238', C.white, 12),
        labelCell('Stations',   '263238', C.white, 14),
        labelCell('Phase',      '263238', C.white, 14),
      ],
    }),
    ...routes.map(([id, no, name, hex, count, phase]) =>
      new TableRow({
        children: [
          new TableCell({
            width: { size: 12, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ spacing: { before: 60, after: 60 }, children: [new TextRun({ text: id, size: 18, bold: true })] })],
          }),
          new TableCell({
            width: { size: 8, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.SOLID, fill: hex.replace('#', '') },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 60 }, children: [new TextRun({ text: no, size: 18, bold: true, color: C.white })] })],
          }),
          new TableCell({
            width: { size: 40, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ spacing: { before: 60, after: 60 }, children: [new TextRun({ text: name, size: 18 })] })],
          }),
          new TableCell({
            width: { size: 12, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.SOLID, fill: hex.replace('#', '') },
            children: [new Paragraph({ children: [] })],
          }),
          new TableCell({
            width: { size: 14, type: WidthType.PERCENTAGE },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 60 }, children: [new TextRun({ text: count, size: 18 })] })],
          }),
          new TableCell({
            width: { size: 14, type: WidthType.PERCENTAGE },
            shading: { type: ShadingType.SOLID, fill: phase === 'P2' ? 'E65100' : '1565C0' },
            children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 60, after: 60 }, children: [new TextRun({ text: phase, size: 18, bold: true, color: C.white })] })],
          }),
        ],
      })
    ),
  ];

  return [
    heading2('9 · Route Summary  (11 Active Routes)'),
    makeTable(rows),
    para(''),
  ];
}

// ─────────────────────────────────────────────────────────────
// BUILD DOCUMENT
// ─────────────────────────────────────────────────────────────
const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: 'Calibri', size: 20 },
        paragraph: { spacing: { line: 276 } },
      },
    },
    paragraphStyles: [
      {
        id: 'Heading1',
        name: 'Heading 1',
        basedOn: 'Normal',
        run: { size: 34, bold: true, color: C.white, font: 'Calibri' },
        paragraph: {
          spacing: { before: 400, after: 200 },
          shading: { type: ShadingType.SOLID, fill: C.midBg },
        },
      },
      {
        id: 'Heading2',
        name: 'Heading 2',
        basedOn: 'Normal',
        run: { size: 26, bold: true, color: '1E3A5F', font: 'Calibri' },
        paragraph: { spacing: { before: 360, after: 140 } },
      },
    ],
  },
  sections: [
    {
      properties: {
        page: {
          margin: {
            top:    convertInchesToTwip(0.8),
            right:  convertInchesToTwip(0.8),
            bottom: convertInchesToTwip(0.8),
            left:   convertInchesToTwip(0.8),
          },
        },
      },
      children: [
        ...buildCoverPage(),

        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 300 },
          children: [new TextRun({ text: 'Smart DART — System Flow Diagrams', bold: true, size: 36, color: C.white })],
        }),

        ...buildArchSection(),
        pageBreak(),

        ...buildPassengerFlow(),
        pageBreak(),

        ...buildGPSPipeline(),
        pageBreak(),

        ...buildRoadSnap(),
        pageBreak(),

        ...buildTransferSearch(),
        pageBreak(),

        ...buildAdminFlow(),
        pageBreak(),

        ...buildCorridors(),
        pageBreak(),

        ...buildTechStack(),
        pageBreak(),

        ...buildRouteSummary(),
      ],
    },
  ],
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync('smart-dart-system-flow.docx', buffer);
  console.log('✅  Document created: smart-dart-system-flow.docx');
}).catch(err => {
  console.error('❌  Error:', err.message);
  process.exit(1);
});
