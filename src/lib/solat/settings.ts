/**
 * Central settings store backed by localStorage.
 * All Ruang solat preferences consolidated into one JSON key.
 */
import type { SolatSettings, SunnahToggles, PrayerOffsets } from './types';

const STORAGE_KEY = 'ruang_solat_settings';
const OLD_ZONE_KEY = 'ruang_solat_zone';

const DEFAULT_SUNNAH_TOGGLES: SunnahToggles = {
  suhoor: true,
  sunrise: true,
  duha: true,
  zawal: true,
  evening: true,
  firstThird: true,
  midnight: true,
  tahajjud: true,
  jumuah: true,
};

const DEFAULT_PRAYER_OFFSETS: PrayerOffsets = {
  fajr: 0,
  syuruk: 0,
  dhuhr: 0,
  asr: 0,
  maghrib: 0,
  isha: 0,
};

const DEFAULTS: SolatSettings = {
  zone: 'SGR01',
  recentZones: [],
  favoriteZones: [],
  autoDetectLocation: false,
  lastKnownCoords: null,
  sunnahToggles: { ...DEFAULT_SUNNAH_TOGGLES },
  suhoorOffset: 30,
  imsakOffset: 10,
  midnightMode: 'maghrib-to-fajr',
  asrEndTime: 'maghrib',
  hijriMethod: 'local-official',
  hijriDayAdjust: 0,
  prayerOffsets: { ...DEFAULT_PRAYER_OFFSETS },
  madhab: 'shafii',
};

/**
 * Deep-merge partial settings into defaults.
 * Ensures new fields added in updates don't break existing data.
 */
function mergeWithDefaults(raw: Partial<SolatSettings>): SolatSettings {
  return {
    ...DEFAULTS,
    ...raw,
    sunnahToggles: { ...DEFAULT_SUNNAH_TOGGLES, ...(raw.sunnahToggles ?? {}) },
    prayerOffsets: { ...DEFAULT_PRAYER_OFFSETS, ...(raw.prayerOffsets ?? {}) },
  };
}

/** Migrate old localStorage key if present. */
function migrateOldZone(): Partial<SolatSettings> | null {
  try {
    const oldZone = localStorage.getItem(OLD_ZONE_KEY);
    if (oldZone) {
      localStorage.removeItem(OLD_ZONE_KEY);
      return { zone: oldZone, recentZones: [oldZone] };
    }
  } catch {
    // fail silently
  }
  return null;
}

/** Load settings from localStorage, merged with defaults. */
export function loadSettings(): SolatSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<SolatSettings>;
      return mergeWithDefaults(parsed);
    }
  } catch {
    // corrupted data — start fresh
  }

  // First time: check for old zone key migration
  const migrated = migrateOldZone();
  if (migrated) {
    const settings = mergeWithDefaults(migrated);
    saveSettings(settings);
    return settings;
  }

  return { ...DEFAULTS };
}

/** Persist settings to localStorage and dispatch change event. */
export function saveSettings(settings: SolatSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    // Notify other components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('solat-settings-changed', { detail: settings })
      );
    }
  } catch {
    // localStorage full or unavailable
  }
}

/** Update a single setting key and persist. */
export function updateSetting<K extends keyof SolatSettings>(
  key: K,
  value: SolatSettings[K]
): SolatSettings {
  const current = loadSettings();
  const updated = { ...current, [key]: value };
  saveSettings(updated);
  return updated;
}

// === Zone helpers ===

export function getZone(): string {
  return loadSettings().zone;
}

export function setZone(zone: string): void {
  const settings = loadSettings();
  settings.zone = zone;
  // Add to recent zones (max 3, dedup)
  const recents = settings.recentZones.filter((z) => z !== zone);
  recents.unshift(zone);
  settings.recentZones = recents.slice(0, 3);
  saveSettings(settings);
}

export function getRecentZones(): string[] {
  return loadSettings().recentZones;
}

export function addRecentZone(zone: string): void {
  const settings = loadSettings();
  const recents = settings.recentZones.filter((z) => z !== zone);
  recents.unshift(zone);
  settings.recentZones = recents.slice(0, 3);
  saveSettings(settings);
}

// === Favorite Zones ===

export function getFavoriteZones(): string[] {
  return loadSettings().favoriteZones;
}

export function addFavoriteZone(zone: string): void {
  const settings = loadSettings();
  if (settings.favoriteZones.includes(zone)) return;
  settings.favoriteZones = [...settings.favoriteZones, zone].slice(0, 5);
  saveSettings(settings);
}

export function removeFavoriteZone(zone: string): void {
  const settings = loadSettings();
  settings.favoriteZones = settings.favoriteZones.filter((z) => z !== zone);
  saveSettings(settings);
}
