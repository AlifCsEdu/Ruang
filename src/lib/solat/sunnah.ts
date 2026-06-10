/**
 * Sunnah times calculator.
 * Derives optional/sunnah prayer times from the 6 core JAKIM prayer times.
 */
import type { SolatDay, SunnahTimes, SunnahToggles, MidnightMode, AsrEndTime, Madhab } from './types';

/**
 * Parse "HH:mm" time string into { hours, minutes } on a reference date.
 */
function parseTime(timeStr: string, ref: Date): Date {
  if (/^\d{2}:\d{2}$/.test(timeStr)) {
    const [h, m] = timeStr.split(':').map(Number);
    const d = new Date(ref);
    d.setHours(h, m, 0, 0);
    return d;
  }
  return new Date(timeStr);
}

/**
 * Format Date to "HH:mm" string.
 */
function fmt(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/**
 * Add minutes to a Date.
 */
function addMin(d: Date, mins: number): Date {
  return new Date(d.getTime() + mins * 60_000);
}

/**
 * Calculate night duration based on midnight mode.
 * maghrib-to-fajr: from maghrib today to fajr tomorrow (approx +5h30 from isha)
 * maghrib-to-sunrise: from maghrib today to sunrise tomorrow (approx +12h from maghrib)
 */
function getNightDuration(
  today: SolatDay,
  tomorrow: SolatDay | null,
  mode: MidnightMode
): { nightMs: number; nightStart: Date; nightEnd: Date } {
  const ref = new Date();
  const maghrib = parseTime(today.maghrib, ref);

  let nightEnd: Date;
  if (mode === 'maghrib-to-fajr') {
    if (tomorrow) {
      const tmRef = new Date(ref);
      tmRef.setDate(tmRef.getDate() + 1);
      nightEnd = parseTime(tomorrow.fajr, tmRef);
    } else {
      // Fallback: approximate fajr tomorrow as maghrib + 12h (rough)
      nightEnd = addMin(maghrib, 12 * 60);
    }
  } else {
    // maghrib-to-sunrise
    if (tomorrow) {
      const tmRef = new Date(ref);
      tmRef.setDate(tmRef.getDate() + 1);
      nightEnd = parseTime(tomorrow.syuruk, tmRef);
    } else {
      nightEnd = addMin(maghrib, 12 * 60);
    }
  }

  const nightMs = nightEnd.getTime() - maghrib.getTime();
  return { nightMs, nightStart: maghrib, nightEnd };
}

/**
 * Calculate all sunnah times from core prayer times.
 */
export function calculateSunnahTimes(
  today: SolatDay,
  tomorrow: SolatDay | null,
  options: {
    sunnahToggles: SunnahToggles;
    suhoorOffset: number;
    midnightMode: MidnightMode;
    asrEndTime: AsrEndTime;
    madhab: Madhab;
  }
): SunnahTimes {
  const ref = new Date();
  const fajr = parseTime(today.fajr, ref);
  const syuruk = parseTime(today.syuruk, ref);
  const dhuhr = parseTime(today.dhuhr, ref);
  const asr = parseTime(today.asr, ref);
  const maghrib = parseTime(today.maghrib, ref);
  const isha = parseTime(today.isha, ref);

  // Suhoor end = fajr - suhoorOffset
  const suhoor = addMin(fajr, -options.suhoorOffset);

  // Duha window: sunrise+15 to dhuhr-15
  const duhaStart = addMin(syuruk, 15);
  const duhaEnd = addMin(dhuhr, -15);

  // Zawal (forbidden): dhuhr-5 to dhuhr
  const zawalStart = addMin(dhuhr, -5);

  // Evening forbidden: depends on asrEndTime
  let eveningForbidden: Date;
  if (options.asrEndTime === 'maghrib') {
    // Forbidden starts at maghrib
    eveningForbidden = maghrib;
  } else {
    // Yellow sun: approximate as asr + 35min (for Malaysian latitudes)
    eveningForbidden = addMin(asr, 35);
  }

  // Night calculations
  const { nightMs, nightStart } = getNightDuration(today, tomorrow, options.midnightMode);

  const firstThird = addMin(nightStart, nightMs / 3);
  const midnight = addMin(nightStart, nightMs / 2);
  const tahajjud = addMin(nightStart, (2 * nightMs) / 3);

  // Jumu'ah detection (Friday)
  const isJumuah = ref.getDay() === 5; // 0=Sun, 5=Fri

  return {
    suhoor: fmt(suhoor),
    sunrise: today.syuruk,
    duhaStart: fmt(duhaStart),
    duhaEnd: fmt(duhaEnd),
    zawalStart: fmt(zawalStart),
    eveningForbidden: fmt(eveningForbidden),
    firstThird: fmt(firstThird),
    midnight: fmt(midnight),
    tahajjud: fmt(tahajjud),
    isJumuah,
  };
}

/**
 * Filter sunnah times based on which toggles are enabled.
 * Returns only the times the user wants to see.
 */
export function filterEnabledSunnah(
  times: SunnahTimes,
  toggles: SunnahToggles
): Partial<SunnahTimes> {
  const result: Partial<SunnahTimes> = {};

  if (toggles.suhoor) result.suhoor = times.suhoor;
  if (toggles.sunrise) result.sunrise = times.sunrise;
  if (toggles.duha) {
    result.duhaStart = times.duhaStart;
    result.duhaEnd = times.duhaEnd;
  }
  if (toggles.zawal) result.zawalStart = times.zawalStart;
  if (toggles.evening) result.eveningForbidden = times.eveningForbidden;
  if (toggles.firstThird) result.firstThird = times.firstThird;
  if (toggles.midnight) result.midnight = times.midnight;
  if (toggles.tahajjud) result.tahajjud = times.tahajjud;
  if (toggles.jumuah) result.isJumuah = times.isJumuah;

  return result;
}
