/**
 * Calendar utilities — month grid generation and navigation.
 * Generates combined Gregorian+Hijri calendar grids.
 */

import { gregorianToHijri, HIJRI_MONTHS, HIJRI_MONTHS_AR, type HijriDate } from './hijri';
import { getEventsForDate, type CalendarEvent } from './malaysian-holidays';

export interface CalendarDay {
  /** Gregorian date */
  date: Date;
  gYear: number;
  gMonth: number;
  gDay: number;
  /** Day of week (0=Mon, 6=Sun) */
  dayOfWeek: number;
  /** Hijri date for this day */
  hijri: HijriDate;
  /** Events on this day (national + Islamic) */
  events: CalendarEvent[];
  /** Whether this day is today */
  isToday: boolean;
  /** Whether this day is in the displayed month (not padding) */
  inMonth: boolean;
  /** Whether it's a Friday */
  isFriday: boolean;
  /** Whether it's a weekend (Sat/Sun) */
  isWeekend: boolean;
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/**
 * Generate a month grid (6 weeks × 7 days) for a given Gregorian year and month.
 * Includes Hijri dates and events for each day.
 */
export function generateMonthGrid(year: number, month: number): CalendarDay[] {
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;

  // First day of the month
  const firstDay = new Date(year, month - 1, 1);
  // Get day of week (0=Mon): JS getDay() returns 0=Sun, so adjust
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6; // Sunday = 6

  // Days in this month
  const daysInMonth = new Date(year, month, 0).getDate();

  const grid: CalendarDay[] = [];

  // Pad leading days from previous month
  const prevMonthDays = new Date(year, month - 1, 0).getDate();
  for (let i = startDow - 1; i >= 0; i--) {
    const day = prevMonthDays - i;
    const d = new Date(year, month - 2, day);
    const hijri = gregorianToHijri(d.getFullYear(), d.getMonth() + 1, d.getDate());
    const events = getEventsForDate(d.getFullYear(), d.getMonth() + 1, d.getDate(), hijri.month, hijri.day);
    const dow = (d.getDay() + 6) % 7; // 0=Mon
    grid.push({
      date: d,
      gYear: d.getFullYear(),
      gMonth: d.getMonth() + 1,
      gDay: day,
      dayOfWeek: dow,
      hijri,
      events,
      isToday: false,
      inMonth: false,
      isFriday: dow === 4,
      isWeekend: dow >= 5,
    });
  }

  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month - 1, day);
    const hijri = gregorianToHijri(year, month, day);
    const events = getEventsForDate(year, month, day, hijri.month, hijri.day);
    const dow = (d.getDay() + 6) % 7;
    const key = `${year}-${month}-${day}`;
    grid.push({
      date: d,
      gYear: year,
      gMonth: month,
      gDay: day,
      dayOfWeek: dow,
      hijri,
      events,
      isToday: key === todayKey,
      inMonth: true,
      isFriday: dow === 4,
      isWeekend: dow >= 5,
    });
  }

  // Pad trailing days to complete 6 rows (42 cells)
  const remaining = 42 - grid.length;
  for (let day = 1; day <= remaining; day++) {
    const d = new Date(year, month, day);
    const hijri = gregorianToHijri(d.getFullYear(), d.getMonth() + 1, d.getDate());
    const events = getEventsForDate(d.getFullYear(), d.getMonth() + 1, d.getDate(), hijri.month, hijri.day);
    const dow = (d.getDay() + 6) % 7;
    grid.push({
      date: d,
      gYear: d.getFullYear(),
      gMonth: d.getMonth() + 1,
      gDay: day,
      dayOfWeek: dow,
      hijri,
      events,
      isToday: false,
      inMonth: false,
      isFriday: dow === 4,
      isWeekend: dow >= 5,
    });
  }

  return grid;
}

/** Navigate to previous month. Returns { year, month }. */
export function prevMonth(year: number, month: number): { year: number; month: number } {
  if (month === 1) return { year: year - 1, month: 12 };
  return { year, month: month - 1 };
}

/** Navigate to next month. Returns { year, month }. */
export function nextMonth(year: number, month: number): { year: number; month: number } {
  if (month === 12) return { year: year + 1, month: 1 };
  return { year, month: month + 1 };
}

/** Get month name. */
export function getMonthName(month: number): string {
  return MONTH_NAMES[month - 1] ?? '';
}

/** Format a date for display. */
export function formatDate(d: Date): string {
  return d.toLocaleDateString('en-MY', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Kuala_Lumpur',
  });
}

export { DAY_NAMES, MONTH_NAMES };
