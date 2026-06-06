/**
 * useRoadSnappedRoutes
 *
 * For each active route, calls the Mapbox Directions API with the route's
 * key waypoints and returns a GeoJSON FeatureCollection whose LineStrings
 * follow the actual road network shown on the map.
 *
 * Results are cached in localStorage for 24 h so the API is only called
 * once per day per browser, not on every page load.
 */
import { useState, useEffect } from 'react';

const MAPBOX_TOKEN =
  import.meta.env.VITE_MAPBOX_TOKEN ||
  'pk.eyJ1Ijoibmd1c2h3YWkiLCJhIjoiY21wempsY2tuMDJ3ZjJzcjMxdXl0dzRoeiJ9.mdf2eIbYpquNdhM1sHUfEA';

const CACHE_KEY = 'dart_snapped_routes_v2';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

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

// ── Evenly subsample an array to at most maxN elements ────────
function subsample(arr, maxN = 25) {
  if (arr.length <= maxN) return arr;
  const result = [];
  const step = (arr.length - 1) / (maxN - 1);
  for (let i = 0; i < maxN; i++) result.push(arr[Math.round(i * step)]);
  return result;
}

// ── Call Mapbox Directions for one route ──────────────────────
async function fetchSnapped(waypoints) {
  const pts = subsample(waypoints, 25); // Directions API max = 25 waypoints
  if (pts.length < 2) return null;

  // Waypoints stored as [lat, lng] — Directions needs lng,lat
  const coordStr = pts.map(([lat, lng]) => `${lng},${lat}`).join(';');

  const url =
    `https://api.mapbox.com/directions/v5/mapbox/driving/${coordStr}` +
    `?geometries=geojson&overview=full&access_token=${MAPBOX_TOKEN}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Directions ${res.status}`);
  const json = await res.json();
  // Returns coordinates as [lng, lat] pairs — ready for GeoJSON
  return json.routes?.[0]?.geometry?.coordinates ?? null;
}

// ── Main hook ─────────────────────────────────────────────────
export default function useRoadSnappedRoutes(routes, waypoints) {
  const [geoJSON, setGeoJSON] = useState(null);

  useEffect(() => {
    if (!routes.length || !Object.keys(waypoints).length) return;

    // Return cached data immediately if still fresh
    const cached = readCache();
    if (cached) {
      setGeoJSON(cached);
      return;
    }

    let cancelled = false;

    (async () => {
      const features = [];

      for (const route of routes) {
        if (!route.active || !waypoints[route.id]) continue;

        let coordinates;
        try {
          const snapped = await fetchSnapped(waypoints[route.id]);
          coordinates = snapped ?? waypoints[route.id].map(([lat, lng]) => [lng, lat]);
        } catch (err) {
          console.warn(`[RoadSnap] ${route.id} fallback to straight lines:`, err.message);
          coordinates = waypoints[route.id].map(([lat, lng]) => [lng, lat]);
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
  }, [routes, waypoints]);

  return geoJSON; // null while loading (falls back to static lines in LiveMap)
}
