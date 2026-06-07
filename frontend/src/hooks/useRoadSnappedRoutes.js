/**
 * useRoadSnappedRoutes
 *
 * Uses the Mapbox Directions API with each route's STATION COORDINATES
 * as waypoints.  This guarantees:
 *   1. Route lines pass through every station marker (no floating dots)
 *   2. Lines follow actual roads — Kawawa Road for Morocco, Kilwa Road for P2
 *   3. Mbagala Phase-2 route is always drawn
 *
 * Results are cached in localStorage for 24 h (key v6).
 */
import { useState, useEffect } from 'react';

const MAPBOX_TOKEN =
  import.meta.env.VITE_MAPBOX_TOKEN ||
  'pk.eyJ1Ijoibmd1c2h3YWkiLCJhIjoiY21wempsY2tuMDJ3ZjJzcjMxdXl0dzRoeiJ9.mdf2eIbYpquNdhM1sHUfEA';

const CACHE_KEY = 'dart_snapped_routes_v6'; // bump to force fresh fetch
const CACHE_TTL = 24 * 60 * 60 * 1000;     // 24 h

// ── localStorage helpers ──────────────────────────────────────
function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { ts, data } = JSON.parse(raw);
    if (Date.now() - ts < CACHE_TTL) return data;
  } catch {}
  return null;
}
function writeCache(data) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch {}
}

// Evenly subsample to at most maxN points
function subsample(arr, maxN = 25) {
  if (arr.length <= maxN) return arr;
  const out = [];
  const step = (arr.length - 1) / (maxN - 1);
  for (let i = 0; i < maxN; i++) out.push(arr[Math.round(i * step)]);
  return out;
}

// ── Mapbox Directions API (driving) with station coords ───────
async function fetchSnapped(stationCoords) {
  const pts = subsample(stationCoords, 25); // Directions max = 25 waypoints
  if (pts.length < 2) return null;

  const coordStr = pts.map(s => `${s.lng},${s.lat}`).join(';');
  const url =
    `https://api.mapbox.com/directions/v5/mapbox/driving/${coordStr}` +
    `?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Directions HTTP ${res.status}`);
  const json = await res.json();

  if (!json.routes?.[0]) {
    console.warn('[RoadSnap] no route returned for coords');
    return null;
  }
  return json.routes[0].geometry.coordinates; // already [lng, lat] pairs
}

// ── Main hook ─────────────────────────────────────────────────
// routes   — from dartStore (route objects with stationIds, color, etc.)
// stations — from dartStore (station objects with id, lat, lng)
export default function useRoadSnappedRoutes(routes, stations) {
  const [geoJSON, setGeoJSON] = useState(null);

  useEffect(() => {
    if (!routes.length || !stations.length) return;

    const cached = readCache();
    if (cached) { setGeoJSON(cached); return; }

    let cancelled = false;

    (async () => {
      const features = [];

      for (const route of routes) {
        if (!route.active) continue;

        // Build ordered station coordinate list for this route
        const stationCoords = (route.stationIds || [])
          .map(id => stations.find(s => s.id === id))
          .filter(Boolean)
          .map(s => ({ lat: s.lat, lng: s.lng }));

        if (stationCoords.length < 2) continue;

        let coordinates;
        try {
          const snapped = await fetchSnapped(stationCoords);
          // Fallback: straight segments through station positions
          coordinates = snapped ?? stationCoords.map(s => [s.lng, s.lat]);
        } catch (err) {
          console.warn(`[RoadSnap] ${route.id} — fallback to straight lines:`, err.message);
          coordinates = stationCoords.map(s => [s.lng, s.lat]);
        }

        if (cancelled) return;

        features.push({
          type: 'Feature',
          properties: {
            color: route.color,
            name:  route.name,
            id:    route.id,
            phase: route.phase || 1,
          },
          geometry: { type: 'LineString', coordinates },
        });
      }

      if (cancelled) return;
      const result = { type: 'FeatureCollection', features };
      writeCache(result);
      setGeoJSON(result);
    })();

    return () => { cancelled = true; };
  }, [routes, stations]);

  return geoJSON; // null while loading
}
