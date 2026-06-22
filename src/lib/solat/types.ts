export interface PrayerTime {
  name: string;
  time: string; // ISO time string
}

export interface SolatDay {
  date: string;
  fajr: string;
  syuruk: string; // sunrise
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  imsak: string;
}

export interface Zone {
  id: string;      // e.g. "SGR01"
  name: string;    // e.g. "Gombak, Petaling, Sepang, Hulu Langat..."
  state: string;   // e.g. "Selangor"
}

export interface SolatResponse {
  zone: string;
  prayers: SolatDay[];
}

export interface CachedSolatEntry {
  zone: string;
  data: SolatResponse;
  cachedAt: number;
}

export const PRAYER_NAMES = ['Fajr', 'Syuruk', 'Zohor', 'Asar', 'Maghrib', 'Isyak'] as const;

export const PRAYER_KEYS = ['fajr', 'syuruk', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;

// === Settings Types ===

export interface SunnahToggles {
  suhoor: boolean;
  sunrise: boolean;
  duha: boolean;
  zawal: boolean;
  evening: boolean;
  firstThird: boolean;
  midnight: boolean;
  tahajjud: boolean;
  jumuah: boolean;
}

export interface PrayerOffsets {
  fajr: number;
  syuruk: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
}

export type HijriMethod = 'local-official' | 'umm-al-qura' | 'tabular' | 'civil' | 'sighting';
export type MidnightMode = 'maghrib-to-fajr' | 'maghrib-to-sunrise';
export type AsrEndTime = 'maghrib' | 'yellow-sun';
export type Madhab = 'shafii' | 'hanafi';

export interface SolatSettings {
  zone: string;
  recentZones: string[];
  favoriteZones: string[];
  autoDetectLocation: boolean;
  lastKnownCoords: { lat: number; lng: number } | null;
  sunnahToggles: SunnahToggles;
  suhoorOffset: 15 | 30 | 45 | 60;
  imsakOffset: 2 | 5 | 10 | 15;
  midnightMode: MidnightMode;
  asrEndTime: AsrEndTime;
  hijriMethod: HijriMethod;
  hijriDayAdjust: -2 | -1 | 0 | 1 | 2;
  prayerOffsets: PrayerOffsets;
  madhab: Madhab;
}

// === Sunnah Times ===

export interface SunnahTimes {
  suhoor: string;
  sunrise: string;
  duhaStart: string;
  duhaEnd: string;
  zawalStart: string;
  eveningForbidden: string;
  firstThird: string;
  midnight: string;
  tahajjud: string;
  isJumuah: boolean;
}

export interface EnhancedSolatDay extends SolatDay {
  sunnah?: SunnahTimes;
}

// === TV / Mosque Display Types ===

export interface IqamahConfig {
  fajr: number;    // minutes after Adhan (default 20)
  dhuhr: number;   // default 15
  asr: number;     // default 15
  maghrib: number; // default 10
  isha: number;    // default 15
}

export interface MosqueConfig {
  name: string;           // e.g. "Masjid Al-Rahman"
  zone: string;           // JAKIM zone
  iqamah: IqamahConfig;
  jumuaKhutbah: string;   // e.g. "1:00 PM"
  hidden: boolean;        // hide from TV display
}

export interface StateFlag {
  state: string;
  emoji: string;     // placeholder emoji
  svgPath: string;   // inline SVG path data for the state flag
  color: string;     // primary color hex
}

export interface TvDisplaySettings {
  mosqueName: string;
  zone: string;
  iqamah: IqamahConfig;
  showSeconds: boolean;
  use24h: boolean;
  darkMode: boolean;
  showHijri: boolean;
  showQibla: boolean;
  showSunnah: boolean;
  fontSize: 'normal' | 'large' | 'xlarge' | 'xxlarge';
  jumuaKhutbah: string;
  adhanReminder: boolean;
  screensaverPrevention: boolean;
}
