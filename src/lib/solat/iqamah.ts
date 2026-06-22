/**
 * Iqamah timing utilities for mosque display mode.
 * Calculates iqamah times based on Adhan time + configurable delay.
 */
import type { SolatDay, IqamahConfig } from './types';

/**
 * Add minutes to an HH:mm time string, clamping within 00:00–23:59.
 */
function shiftTime(timeStr: string, mins: number): string {
  if (!timeStr || mins === 0) return timeStr;
  const match = timeStr.match(/^(\d{2}):(\d{2})$/);
  if (!match) return timeStr;
  const [, hStr, mStr] = match;
  let totalMins = parseInt(hStr, 10) * 60 + parseInt(mStr, 10) + mins;
  if (totalMins < 0) totalMins = 0;
  if (totalMins > 23 * 60 + 59) totalMins = 23 * 60 + 59;
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Calculate iqamah times for each prayer.
 * Returns a map of prayer key → iqamah time string (HH:mm).
 * Note: Syuruk (sunrise) is excluded — no iqamah for sunrise.
 */
export function calculateIqamahTimes(
  day: SolatDay,
  config: IqamahConfig
): Record<string, string> {
  const result: Record<string, string> = {};

  if (day.fajr) result.fajr = shiftTime(day.fajr, config.fajr);
  if (day.dhuhr) result.dhuhr = shiftTime(day.dhuhr, config.dhuhr);
  if (day.asr) result.asr = shiftTime(day.asr, config.asr);
  if (day.maghrib) result.maghrib = shiftTime(day.maghrib, config.maghrib);
  if (day.isha) result.isha = shiftTime(day.isha, config.isha);

  return result;
}

/**
 * Get countdown string to iqamah time.
 * Returns formatted "MM:SS" or empty string if iqamah has passed.
 */
export function getIqamahCountdown(iqamahTime: string, now: Date): string {
  if (!iqamahTime) return '';
  const match = iqamahTime.match(/^(\d{2}):(\d{2})$/);
  if (!match) return '';

  const [, hStr, mStr] = match;
  const iqamahDate = new Date(now);
  iqamahDate.setHours(parseInt(hStr, 10), parseInt(mStr, 10), 0, 0);

  const diff = iqamahDate.getTime() - now.getTime();
  if (diff <= 0) return '';

  const totalSec = Math.floor(diff / 1000);
  const mins = Math.floor(totalSec / 60);
  const secs = totalSec % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Check if current time is between Adhan time and Iqamah time.
 * Returns true if we're in the iqamah preparation window.
 */
export function isWithinIqamahWindow(
  prayerTime: string,
  iqamahTime: string,
  now: Date
): boolean {
  if (!prayerTime || !iqamahTime) return false;

  const parseHM = (t: string): Date => {
    const m = t.match(/^(\d{2}):(\d{2})$/);
    if (!m) return new Date(0);
    const d = new Date(now);
    d.setHours(parseInt(m[1], 10), parseInt(m[2], 10), 0, 0);
    return d;
  };

  const adhanDate = parseHM(prayerTime);
  const iqamahDate = parseHM(iqamahTime);
  const nowMs = now.getTime();

  return nowMs >= adhanDate.getTime() && nowMs < iqamahDate.getTime();
}

/**
 * Check if we are within N minutes BEFORE the Adhan time.
 * Used for pre-Adhan visual warnings.
 */
export function isPreAdhanWarning(
  prayerTime: string,
  now: Date,
  warningMinutes = 5
): boolean {
  if (!prayerTime) return false;
  const match = prayerTime.match(/^(\d{2}):(\d{2})$/);
  if (!match) return false;

  const adhanDate = new Date(now);
  adhanDate.setHours(parseInt(match[1], 10), parseInt(match[2], 10), 0, 0);

  const diff = adhanDate.getTime() - now.getTime();
  return diff > 0 && diff <= warningMinutes * 60 * 1000;
}
