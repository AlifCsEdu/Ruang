/**
 * Hijri date conversion utilities.
 * Multiple methods supported: tabular (default), umm-al-qura approx, civil, local-official, sighting.
 */

import type { HijriMethod } from '../solat/types';

const HIJRI_MONTHS = [
  'Muharram', "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
  'Jumada al-Ula', 'Jumada al-Thani', 'Rajab', "Sha'ban",
  'Ramadan', 'Shawwal', "Dhu al-Qi'dah", 'Dhu al-Hijjah',
];

const HIJRI_MONTHS_AR = [
  'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
  'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان',
  'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة',
];

export interface HijriDate {
  year: number;
  month: number; // 1-12
  day: number;
  monthName: string;
  monthNameAr: string;
}

// Convert Gregorian to Hijri with optional method and day adjustment
export function gregorianToHijri(
  gYear: number,
  gMonth: number,
  gDay: number,
  method: HijriMethod = 'tabular',
  dayAdjust: number = 0
): HijriDate {
  // Julian Day Number
  let jd = gregorianToJD(gYear, gMonth, gDay);

  // Apply method-specific adjustments
  switch (method) {
    case 'umm-al-qura':
      // Umm al-Qura uses a slightly different epoch and correction
      jd += 0.5;
      break;
    case 'civil':
      // Civil Islamic calendar (Kuwaiti algorithm) — same tabular but with different leap pattern
      break;
    case 'local-official':
      // Malaysian JAKIM follows tabular + official sighting confirmation
      // For computation purposes, same as tabular + 0
      break;
    case 'sighting':
      // Observational: approximate with slight uncertainty
      jd += 0.5; // sighting often 1 day later than calculated
      break;
  }

  const result = method === 'civil'
    ? jdToHijriCivil(jd)
    : jdToHijri(jd);

  // Apply day adjustment
  if (dayAdjust !== 0) {
    const adjustedJd = jd + dayAdjust;
    return method === 'civil'
      ? jdToHijriCivil(adjustedJd)
      : jdToHijri(adjustedJd);
  }

  return result;
}

function gregorianToJD(year: number, month: number, day: number): number {
  if (month <= 2) {
    year -= 1;
    month += 12;
  }
  const A = Math.floor(year / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
}

function jdToHijri(jd: number): HijriDate {
  jd = Math.floor(jd) + 0.5;
  const y = 10631.0 / 30.0;
  const epoch = 1948439.5;
  const shift = 8.01 / 60.0;

  let z = jd - epoch;
  const cyc = Math.floor(z / 10631.0);
  z = z - 10631 * cyc;
  const j = Math.floor((z - shift) / y);
  z = z - Math.floor(j * y + shift);
  const m = Math.min(Math.floor((z + 28.5001) / 29.5001), 12);
  if (m === 0) return { year: 1, month: 1, day: 1, monthName: HIJRI_MONTHS[0], monthNameAr: HIJRI_MONTHS_AR[0] };

  const year = 30 * cyc + j + 1;
  const month = m;
  const day = Math.floor(z - Math.floor(29.5001 * m - 29)) + 1;

  return {
    year,
    month,
    day,
    monthName: HIJRI_MONTHS[month - 1],
    monthNameAr: HIJRI_MONTHS_AR[month - 1],
  };
}

/** Civil (Kuwaiti) Hijri calendar — uses different leap year pattern. */
function jdToHijriCivil(jd: number): HijriDate {
  jd = Math.floor(jd) + 0.5;
  const epoch = 1948439.5;
  const z = jd - epoch;

  // Civil uses a simpler algorithm
  const cyc = Math.floor(z / 10631.0);
  let rem = z - 10631 * cyc;
  const j = Math.floor(rem / 354.36667);
  rem = rem - Math.floor(j * 354.36667 + 0.5);
  const m = Math.min(Math.floor((rem + 0.5) / 29.5001), 12);
  if (m === 0) return { year: 1, month: 1, day: 1, monthName: HIJRI_MONTHS[0], monthNameAr: HIJRI_MONTHS_AR[0] };

  const year = 30 * cyc + j + 1;
  const month = m;
  const day = Math.floor(rem - Math.floor(29.5001 * m - 29)) + 1;

  return {
    year,
    month,
    day: Math.max(1, day),
    monthName: HIJRI_MONTHS[month - 1],
    monthNameAr: HIJRI_MONTHS_AR[month - 1],
  };
}

/** Reverse: convert Hijri to Gregorian JD. */
function hijriToJD(year: number, month: number, day: number): number {
  const epoch = 1948439.5;
  const y = 10631.0 / 30.0;
  const shift = 8.01 / 60.0;
  const cyc = Math.floor((year - 1) / 30);
  const j = (year - 1) - 30 * cyc;
  return Math.floor(j * y + shift) + Math.floor(29.5001 * month - 29) + day + epoch + 10631 * cyc;
}

/** Convert Hijri date back to Gregorian. */
export function hijriToGregorian(hYear: number, hMonth: number, hDay: number): { year: number; month: number; day: number } {
  const jd = hijriToJD(hYear, hMonth, hDay);
  return jdToGregorian(jd);
}

function jdToGregorian(jd: number): { year: number; month: number; day: number } {
  jd = jd + 0.5;
  const Z = Math.floor(jd);
  const A = Z < 2299161 ? Z : (() => {
    const alpha = Math.floor((Z - 1867216.25) / 36524.25);
    return Z + 1 + alpha - Math.floor(alpha / 4);
  })();
  const B = A + 1524;
  const C = Math.floor((B - 122.1) / 365.25);
  const D = Math.floor(365.25 * C);
  const E = Math.floor((B - D) / 30.6001);

  const day = B - D - Math.floor(30.6001 * E);
  const month = E < 14 ? E - 1 : E - 13;
  const year = month > 2 ? C - 4716 : C - 4715;

  return { year, month, day };
}

export function getDaysInHijriMonth(year: number, month: number): number {
  // Hijri months alternate 30 and 29 days, with some adjustments
  if (month % 2 === 1) return 30;
  if (month === 12 && isHijriLeapYear(year)) return 30;
  return 29;
}

function isHijriLeapYear(year: number): boolean {
  return [2, 5, 7, 10, 13, 16, 18, 21, 24, 26, 29].includes(year % 30);
}

// Key Islamic dates for Malaysian context
export const ISLAMIC_EVENTS: Record<string, { name: string; nameAr: string; description: string }> = {
  '1-1': { name: 'Muharram / Awal Muharram', nameAr: 'رأس السنة الهجرية', description: 'Islamic New Year' },
  '1-10': { name: 'Hari Asyura', nameAr: 'يوم عاشوراء', description: 'Day of Ashura' },
  '3-12': { name: 'Maulidur Rasul', nameAr: 'المولد النبوي', description: "Prophet Muhammad's Birthday" },
  '7-27': { name: 'Israk & Mikraj', nameAr: 'الإسراء والمعراج', description: 'Night Journey & Ascension' },
  '8-15': { name: 'Nisfu Syaaban', nameAr: 'منتصف شعبان', description: 'Middle of Sha\'ban' },
  '9-1': { name: 'Awal Ramadan', nameAr: 'بداية رمضان', description: 'Beginning of Ramadan' },
  '9-17': { name: 'Nuzul Al-Quran', nameAr: 'نزول القرآن', description: 'Revelation of the Quran' },
  '9-27': { name: 'Lailatul Qadr (estimated)', nameAr: 'ليلة القدر', description: 'Night of Decree' },
  '10-1': { name: 'Hari Raya Aidilfitri', nameAr: 'عيد الفطر', description: 'Eid al-Fitr' },
  '12-9': { name: 'Hari Arafah', nameAr: 'يوم عرفة', description: 'Day of Arafah' },
  '12-10': { name: 'Hari Raya Aidiladha', nameAr: 'عيد الأضحى', description: 'Eid al-Adha' },
};

export function getHijriMonthDays(year: number, month: number): { day: number; event?: { name: string; nameAr: string } }[] {
  const days = getDaysInHijriMonth(year, month);
  const result = [];
  for (let d = 1; d <= days; d++) {
    const key = `${month}-${d}`;
    result.push({
      day: d,
      event: ISLAMIC_EVENTS[key] ? { name: ISLAMIC_EVENTS[key].name, nameAr: ISLAMIC_EVENTS[key].nameAr } : undefined,
    });
  }
  return result;
}

export { HIJRI_MONTHS, HIJRI_MONTHS_AR };
