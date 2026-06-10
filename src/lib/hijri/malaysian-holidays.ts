/**
 * Malaysian holidays — fixed Gregorian + Islamic-calculated.
 * Combines national public holidays with Islamic dates.
 */

import { hijriToGregorian } from './hijri';

export interface CalendarEvent {
  name: string;
  nameMs?: string;
  type: 'national' | 'islamic' | 'observance';
  color?: string;
}

/** Fixed Gregorian holidays (Malaysia). */
const GREGORIAN_HOLIDAYS: Record<string, CalendarEvent> = {
  '1-1': { name: 'New Year\'s Day', nameMs: 'Tahun Baru', type: 'national' },
  '2-1': { name: 'Federal Territory Day', nameMs: 'Hari Wilayah Persekutuan', type: 'national' },
  '5-1': { name: 'Labour Day', nameMs: 'Hari Pekerja', type: 'national' },
  '5-13': { name: 'His Majesty\'s Birthday', nameMs: 'Hari Keputeraan YDP Agong', type: 'national' },
  '8-31': { name: 'National Day', nameMs: 'Hari Kebangsaan', type: 'national' },
  '9-16': { name: 'Malaysia Day', nameMs: 'Hari Malaysia', type: 'national' },
  '12-25': { name: 'Christmas Day', nameMs: 'Hari Krismas', type: 'national' },
};

/** Islamic holidays keyed by Hijri month-day (e.g. "10-1" = Shawwal 1). */
const ISLAMIC_HOLIDAYS: Record<string, CalendarEvent> = {
  '1-1': { name: 'Awal Muharram', nameMs: 'Awal Muharram', type: 'islamic' },
  '1-10': { name: 'Hari Asyura', nameMs: 'Hari Asyura', type: 'islamic' },
  '3-12': { name: 'Maulidur Rasul', nameMs: 'Maulidur Rasul', type: 'islamic' },
  '7-27': { name: 'Israk & Mikraj', nameMs: 'Israk & Mikraj', type: 'islamic' },
  '8-15': { name: 'Nisfu Syaaban', nameMs: 'Nisfu Syaaban', type: 'observance' },
  '9-1': { name: 'Awal Ramadan', nameMs: 'Awal Ramadan', type: 'islamic' },
  '9-17': { name: 'Nuzul Al-Quran', nameMs: 'Nuzul Al-Quran', type: 'islamic' },
  '10-1': { name: 'Hari Raya Aidilfitri', nameMs: 'Hari Raya Aidilfitri', type: 'islamic' },
  '10-2': { name: 'Hari Raya Aidilfitri (2nd day)', nameMs: 'Hari Raya Aidilfitri (Hari Kedua)', type: 'islamic' },
  '12-9': { name: 'Hari Arafah', nameMs: 'Hari Arafah', type: 'observance' },
  '12-10': { name: 'Hari Raya Aidiladha', nameMs: 'Hari Raya Aidiladha', type: 'islamic' },
  '12-11': { name: 'Hari Raya Aidiladha (2nd day)', nameMs: 'Hari Raya Aidiladha (Hari Kedua)', type: 'islamic' },
};

/**
 * Get all events for a specific Gregorian date.
 * Checks both fixed Gregorian holidays and converts the date to Hijri for Islamic events.
 */
export function getEventsForDate(
  gYear: number, gMonth: number, gDay: number,
  hijriMonth: number, hijriDay: number,
): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  // Gregorian holidays
  const gKey = `${gMonth}-${gDay}`;
  if (GREGORIAN_HOLIDAYS[gKey]) {
    events.push(GREGORIAN_HOLIDAYS[gKey]);
  }

  // Islamic holidays
  const hKey = `${hijriMonth}-${hijriDay}`;
  if (ISLAMIC_HOLIDAYS[hKey]) {
    events.push(ISLAMIC_HOLIDAYS[hKey]);
  }

  return events;
}

/**
 * Get upcoming Islamic holidays for a Gregorian year.
 * Converts known Hijri dates to Gregorian for the given year.
 */
export function getIslamicHolidaysForYear(gYear: number): { date: Date; event: CalendarEvent }[] {
  const results: { date: Date; event: CalendarEvent }[] = [];

  for (const [key, event] of Object.entries(ISLAMIC_HOLIDAYS)) {
    const [hMonth, hDay] = key.split('-').map(Number);

    // Estimate Hijri year: roughly Gregorian year - 578
    const estimatedHYear = gYear - 578;

    for (const hYear of [estimatedHYear, estimatedHYear + 1]) {
      try {
        const g = hijriToGregorian(hYear, hMonth, hDay);
        if (g.year === gYear) {
          results.push({
            date: new Date(g.year, g.month - 1, g.day),
            event,
          });
        }
      } catch {
        // Skip invalid conversions
      }
    }
  }

  results.sort((a, b) => a.date.getTime() - b.date.getTime());
  return results;
}

/**
 * Get fixed Gregorian holidays for a year.
 */
export function getGregorianHolidaysForYear(year: number): { date: Date; event: CalendarEvent }[] {
  return Object.entries(GREGORIAN_HOLIDAYS).map(([key, event]) => {
    const [month, day] = key.split('-').map(Number);
    return { date: new Date(year, month - 1, day), event };
  });
}
