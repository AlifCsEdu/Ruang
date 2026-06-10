import type { CachedSolatEntry, SolatResponse } from './types';

const STORAGE_KEY = 'ruang_solat_cache';
const CACHE_MAX_AGE = 172800000; // 48 hours in ms

export function cachePrayerTimes(zone: string, data: SolatResponse): void {
  const entry: CachedSolatEntry = { zone, data, cachedAt: Date.now() };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entry));
  } catch {
    // localStorage might be full or unavailable — fail silently
  }
}

export function getCachedPrayerTimes(): CachedSolatEntry | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const entry: CachedSolatEntry = JSON.parse(raw);
    if (Date.now() - entry.cachedAt > CACHE_MAX_AGE) return null;
    return entry;
  } catch {
    return null;
  }
}

/** Build YYYY-MM-DD string for a given date in MYT. */
function mytDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Get MYT-aware "now". */
function mytNow(): Date {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' }));
}

/** Find a SolatDay by date string with fallback matching. */
function findByDate(data: SolatResponse, targetStr: string): import('./types').SolatDay | null {
  // Primary: exact date string match
  const exact = data.prayers.find((p) => p.date === targetStr);
  if (exact) return exact;

  // Fallback A: match by day-of-month within the same year-month
  const dayNum = targetStr.slice(8); // "DD"
  const yearMonth = targetStr.slice(0, 7); // "YYYY-MM"
  const byDay = data.prayers.find((p) => p.date.startsWith(yearMonth) && p.date.endsWith(`-${dayNum}`));
  if (byDay) return byDay;

  // Fallback B: proximity match (±1 day)
  const target = new Date(targetStr + 'T00:00:00');
  for (const offset of [-1, 1]) {
    const d = new Date(target);
    d.setDate(d.getDate() + offset);
    const altStr = mytDateStr(d);
    const match = data.prayers.find((p) => p.date === altStr);
    if (match) return match;
  }

  return null;
}

export function getTodayPrayers(data: SolatResponse): import('./types').SolatDay | null {
  return findByDate(data, mytDateStr(mytNow()));
}

export function getTomorrowPrayers(data: SolatResponse): import('./types').SolatDay | null {
  const now = mytNow();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return findByDate(data, mytDateStr(tomorrow));
}
