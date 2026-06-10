/**
 * Hijri engine bridge — reads settings from localStorage
 * and returns adjusted Hijri dates using configured method.
 */
import { loadSettings } from '../solat/settings';
import { gregorianToHijri, hijriToGregorian, type HijriDate } from '../hijri/hijri';

/**
 * Get today's Hijri date using configured method and day adjustment.
 */
export function getTodayHijri(): HijriDate {
  const now = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' })
  );
  return getHijriForDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
}

/**
 * Get Hijri date for any Gregorian date using configured settings.
 */
export function getHijriForDate(
  gYear: number,
  gMonth: number,
  gDay: number
): HijriDate {
  const settings = loadSettings();
  return gregorianToHijri(
    gYear,
    gMonth,
    gDay,
    settings.hijriMethod,
    settings.hijriDayAdjust
  );
}

/**
 * Convert Hijri date back to Gregorian.
 */
export function hijriToGreg(
  hYear: number,
  hMonth: number,
  hDay: number
): { year: number; month: number; day: number } {
  return hijriToGregorian(hYear, hMonth, hDay);
}

/**
 * Get the Hijri method display name.
 */
export function getMethodName(method: string): string {
  const names: Record<string, string> = {
    'local-official': 'Rasmi JAKIM',
    'umm-al-qura': 'Umm al-Qura (Arab Saudi)',
    'tabular': 'Tabular (Standard)',
    'civil': 'Civil (Kuwaiti)',
    'sighting': 'Sighting (Pencerapan)',
  };
  return names[method] ?? method;
}
