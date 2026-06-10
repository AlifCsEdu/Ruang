/**
 * Prayer offset and madhab calculation utilities.
 * Applies user-configured time offsets and madhab-based adjustments.
 */
import type { SolatDay, PrayerOffsets, Madhab } from './types';

/**
 * Add minutes to an HH:mm time string, clamping within 00:00–23:59.
 */
function shiftTime(timeStr: string, mins: number): string {
  if (!timeStr || mins === 0) return timeStr;

  const match = timeStr.match(/^(\d{2}):(\d{2})$/);
  if (!match) return timeStr;

  const [, hStr, mStr] = match;
  let totalMins = parseInt(hStr, 10) * 60 + parseInt(mStr, 10) + mins;

  // Clamp to valid day range
  if (totalMins < 0) totalMins = 0;
  if (totalMins > 23 * 60 + 59) totalMins = 23 * 60 + 59;

  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Apply user-configured offsets to each prayer time.
 * Returns a new SolatDay with shifted times.
 */
export function applyOffsets(day: SolatDay, offsets: PrayerOffsets): SolatDay {
  return {
    ...day,
    fajr: shiftTime(day.fajr, offsets.fajr),
    syuruk: shiftTime(day.syuruk, offsets.syuruk),
    dhuhr: shiftTime(day.dhuhr, offsets.dhuhr),
    asr: shiftTime(day.asr, offsets.asr),
    maghrib: shiftTime(day.maghrib, offsets.maghrib),
    isha: shiftTime(day.isha, offsets.isha),
  };
}

/**
 * Apply Hanafi madhab adjustment to Asr time.
 * In the Hanafi school, Asr begins when an object's shadow equals
 * twice its length (plus the noon shadow). In Malaysian latitudes (1-7°N),
 * this is approximately 35 minutes later than the Shafi'i Asr.
 *
 * For Shafi'i/Maliki/Hanbali, no adjustment needed (default JAKIM times).
 */
export function applyMadhab(day: SolatDay, madhab: Madhab): SolatDay {
  if (madhab === 'shafii') return day;

  // Hanafi: shift Asr ~35 minutes later
  return {
    ...day,
    asr: shiftTime(day.asr, 35),
  };
}

/**
 * Apply both offsets and madhab adjustments in the correct order.
 * Madhab is applied first (structural change), then offsets (user preference).
 */
export function applyAllAdjustments(
  day: SolatDay,
  offsets: PrayerOffsets,
  madhab: Madhab
): SolatDay {
  const withMadhab = applyMadhab(day, madhab);
  return applyOffsets(withMadhab, offsets);
}
