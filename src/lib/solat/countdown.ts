import type { SolatDay, SunnahTimes, SunnahToggles } from './types';
import { PRAYER_NAMES, PRAYER_KEYS } from './types';

interface NextPrayer {
  name: string;
  time: Date;
  remaining: number; // ms until next prayer
}

/**
 * Calculate the next upcoming prayer from today's schedule.
 * If all prayers have passed, returns tomorrow's Fajr.
 */
export function getNextPrayer(today: SolatDay): NextPrayer {
  // Use Malaysia timezone (UTC+8) so countdown is consistent with
  // the server-side MYT prayer times regardless of browser timezone.
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' }));

  for (let i = 0; i < PRAYER_KEYS.length; i++) {
    const key = PRAYER_KEYS[i];
    const name = PRAYER_NAMES[i];
    const timeStr = today[key as keyof SolatDay] as string;

    if (!timeStr) continue;

    // Parse time string (format: "HH:mm" or ISO string)
    const prayerTime = parsePrayerTime(timeStr, now);
    if (prayerTime > now) {
      return {
        name,
        time: prayerTime,
        remaining: prayerTime.getTime() - now.getTime(),
      };
    }
  }

  // All prayers passed — calculate tomorrow's Fajr (approximate +8h from isha)
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(5, 45, 0, 0); // Rough fallback

  return {
    name: 'Fajr (esok)',
    time: tomorrow,
    remaining: tomorrow.getTime() - now.getTime(),
  };
}

function parsePrayerTime(timeStr: string, referenceDate: Date): Date {
  // Handle HH:mm format
  if (/^\d{2}:\d{2}$/.test(timeStr)) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date(referenceDate);
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  // Handle ISO strings or timestamps
  const parsed = new Date(timeStr);
  if (!isNaN(parsed.getTime())) return parsed;

  // Handle Unix timestamps (seconds)
  const ts = Number(timeStr);
  if (!isNaN(ts)) {
    return new Date(ts * 1000);
  }

  return new Date(referenceDate);
}

export { parsePrayerTime };

/** Sunnah time entries for the enhanced countdown. */
interface SunnahEntry {
  name: string;
  time: Date;
}

/**
 * Enhanced countdown that includes enabled sunnah times alongside core prayers.
 * Returns the next upcoming event (prayer or sunnah time).
 */
export function getNextPrayerEnhanced(
  today: SolatDay,
  sunnah: SunnahTimes,
  toggles: SunnahToggles
): NextPrayer {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' }));

  // Collect all time entries (core prayers + enabled sunnah)
  const entries: { name: string; time: Date }[] = [];

  // Core prayers
  for (let i = 0; i < PRAYER_KEYS.length; i++) {
    const key = PRAYER_KEYS[i];
    const name = PRAYER_NAMES[i];
    const timeStr = today[key as keyof SolatDay] as string;
    if (timeStr) {
      entries.push({ name, time: parsePrayerTime(timeStr, now) });
    }
  }

  // Sunnah entries
  if (toggles.suhoor && sunnah.suhoor) {
    entries.push({ name: 'Akhir Suhoor', time: parsePrayerTime(sunnah.suhoor, now) });
  }
  if (toggles.duha && sunnah.duhaStart) {
    entries.push({ name: 'Dhuha (Bermula)', time: parsePrayerTime(sunnah.duhaStart, now) });
  }
  if (toggles.midnight && sunnah.midnight) {
    entries.push({ name: 'Tengah Malam Islam', time: parsePrayerTime(sunnah.midnight, now) });
  }
  if (toggles.tahajjud && sunnah.tahajjud) {
    entries.push({ name: 'Tahajjud (Bermula)', time: parsePrayerTime(sunnah.tahajjud, now) });
  }
  if (toggles.firstThird && sunnah.firstThird) {
    entries.push({ name: 'Sepertiga Malam', time: parsePrayerTime(sunnah.firstThird, now) });
  }

  // Sort by time
  entries.sort((a, b) => a.time.getTime() - b.time.getTime());

  // Find next one after now
  for (const entry of entries) {
    if (entry.time > now) {
      return {
        name: entry.name,
        time: entry.time,
        remaining: entry.time.getTime() - now.getTime(),
      };
    }
  }

  // All events passed — fallback to tomorrow's Fajr
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(5, 45, 0, 0);

  return {
    name: 'Fajr (esok)',
    time: tomorrow,
    remaining: tomorrow.getTime() - now.getTime(),
  };
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00:00';

  const totalSec = Math.floor(ms / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}
