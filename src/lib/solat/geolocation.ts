/**
 * Geolocation utilities for GPS-to-zone mapping.
 * Uses browser Geolocation API + Haversine distance to JAKIM zone centroids.
 */
import { ZONE_COORDS } from './zoneCoords';

export interface Coords {
  lat: number;
  lng: number;
}

export interface GeoResult {
  ok: true;
  coords: Coords;
  zone: string;
  distanceKm: number;
}

export interface GeoError {
  ok: false;
  error: 'denied' | 'unavailable' | 'timeout' | 'unknown';
  message: string;
}

export type GeoResponse = GeoResult | GeoError;

/**
 * Request the user's current location via browser Geolocation API.
 * Returns GPS coordinates or error information.
 */
export function requestLocation(timeoutMs = 10_000, maximumAge = 300_000): Promise<Coords> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject({ error: 'unavailable', message: 'Geolocation not supported' });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            reject({ error: 'denied', message: 'Location permission denied' });
            break;
          case err.POSITION_UNAVAILABLE:
            reject({ error: 'unavailable', message: 'Position unavailable' });
            break;
          case err.TIMEOUT:
            reject({ error: 'timeout', message: 'Location request timed out' });
            break;
          default:
            reject({ error: 'unknown', message: err.message || 'Unknown error' });
        }
      },
      {
        enableHighAccuracy: false,
        timeout: timeoutMs,
        maximumAge,
      }
    );
  });
}

/**
 * Haversine distance between two lat/lng points in kilometers.
 */
export function haversineKm(a: Coords, b: Coords): number {
  const R = 6371; // Earth radius in km
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);

  const a2 =
    sinLat * sinLat +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * sinLng * sinLng;
  const c = 2 * Math.atan2(Math.sqrt(a2), Math.sqrt(1 - a2));

  return R * c;
}

/**
 * Find the nearest JAKIM zone for given coordinates.
 * Returns zone ID and distance in km.
 */
export function getZoneFromCoords(lat: number, lng: number): { zone: string; distanceKm: number } {
  const coords: Coords = { lat, lng };
  let best = ZONE_COORDS[0];
  let bestDist = Infinity;

  for (const z of ZONE_COORDS) {
    const d = haversineKm(coords, { lat: z.lat, lng: z.lng });
    if (d < bestDist) {
      bestDist = d;
      best = z;
    }
  }

  return { zone: best.id, distanceKm: Math.round(bestDist * 10) / 10 };
}

/**
 * Request location and determine zone. Full pipeline.
 */
export async function detectZone(): Promise<GeoResponse> {
  try {
    const coords = await requestLocation();
    const { zone, distanceKm } = getZoneFromCoords(coords.lat, coords.lng);
    return { ok: true, coords, zone, distanceKm };
  } catch (err: any) {
    return {
      ok: false,
      error: err.error ?? 'unknown',
      message: err.message ?? 'Failed to detect location',
    };
  }
}

/**
 * One-shot detect using cached position for fast startup.
 */
export async function autoDetectOnce(): Promise<GeoResponse> {
  try {
    const coords = await requestLocation(10_000, 600_000); // 10 min cache
    const { zone, distanceKm } = getZoneFromCoords(coords.lat, coords.lng);
    return { ok: true, coords, zone, distanceKm };
  } catch (err: any) {
    return {
      ok: false,
      error: err.error ?? 'unknown',
      message: err.message ?? 'Failed to detect location',
    };
  }
}

/**
 * Continuous auto-detect using watchPosition.
 * Low-power: enableHighAccuracy=false, maximumAge=10min.
 * Throttles callbacks to minimum interval (default 30 min).
 * Returns cleanup function.
 */
export function startAutoDetect(
  callback: (result: GeoResponse) => void,
  options?: { minIntervalMs?: number }
): () => void {
  const minInterval = options?.minIntervalMs ?? 1_800_000; // 30 min default
  let lastCallbackTime = 0;

  if (!('geolocation' in navigator)) {
    callback({ ok: false, error: 'unavailable', message: 'Geolocation not supported' });
    return () => {};
  }

  const watchId = navigator.geolocation.watchPosition(
    (pos) => {
      const now = Date.now();
      if (now - lastCallbackTime < minInterval) return;
      lastCallbackTime = now;

      const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      const { zone, distanceKm } = getZoneFromCoords(coords.lat, coords.lng);
      callback({ ok: true, coords, zone, distanceKm });
    },
    (err) => {
      // Non-fatal: report error but keep watching
      callback({
        ok: false,
        error: err.code === err.PERMISSION_DENIED ? 'denied'
          : err.code === err.POSITION_UNAVAILABLE ? 'unavailable'
          : err.code === err.TIMEOUT ? 'timeout'
          : 'unknown',
        message: err.message || 'Location error',
      });
    },
    {
      enableHighAccuracy: false,
      maximumAge: 600_000, // 10 min cache
      timeout: 15_000,
    }
  );

  return () => {
    navigator.geolocation.clearWatch(watchId);
  };
}

/**
 * Compare detected zone against current zone.
 * Returns suggestion info if user appears to be in a different zone.
 */
export async function detectZoneChange(currentZone: string): Promise<
  | { changed: true; suggestedZone: string; coords: Coords; distanceKm: number }
  | { changed: false }
  | { changed: null; error: string }
> {
  const result = await detectZone();
  if (!result.ok) {
    return { changed: null, error: result.message };
  }
  if (result.zone !== currentZone) {
    return {
      changed: true,
      suggestedZone: result.zone,
      coords: result.coords,
      distanceKm: result.distanceKm,
    };
  }
  return { changed: false };
}
