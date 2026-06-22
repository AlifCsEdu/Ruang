/**
 * TV/Mosque Display settings store backed by localStorage.
 * Separate from main solat settings to keep mosque-specific config isolated.
 */
import type { IqamahConfig, TvDisplaySettings } from './types';

const STORAGE_KEY = 'ruang_solat_tv_settings';

const DEFAULT_IQAMAH: IqamahConfig = {
  fajr: 0,
  dhuhr: 0,
  asr: 0,
  maghrib: 0,
  isha: 0,
};

/** Default TV display settings. */
export const DEFAULT_TV_SETTINGS: TvDisplaySettings = {
  mosqueName: '',
  zone: 'SGR01',
  iqamah: { ...DEFAULT_IQAMAH },
  showSeconds: true,
  use24h: true,
  darkMode: true,
  showHijri: true,
  showQibla: true,
  showSunnah: false,
  fontSize: 'large',
  jumuaKhutbah: '13:00',
  adhanReminder: true,
  screensaverPrevention: true,
};

/**
 * Deep-merge partial TV settings with defaults.
 */
function mergeWithDefaults(raw: Partial<TvDisplaySettings>): TvDisplaySettings {
  return {
    ...DEFAULT_TV_SETTINGS,
    ...raw,
    iqamah: { ...DEFAULT_IQAMAH, ...(raw.iqamah ?? {}) },
  };
}

/** Load TV settings from localStorage, merged with defaults. */
export function loadTvSettings(): TvDisplaySettings {
  try {
    if (typeof localStorage === 'undefined') return { ...DEFAULT_TV_SETTINGS, iqamah: { ...DEFAULT_IQAMAH } };
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<TvDisplaySettings>;
      return mergeWithDefaults(parsed);
    }
  } catch {
    // corrupted data — start fresh
  }
  return { ...DEFAULT_TV_SETTINGS, iqamah: { ...DEFAULT_IQAMAH } };
}

/** Persist TV settings to localStorage. */
export function saveTvSettings(settings: TvDisplaySettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // localStorage full or unavailable
  }
}

/** Update a single TV setting key and persist. */
export function updateTvSetting<K extends keyof TvDisplaySettings>(
  key: K,
  value: TvDisplaySettings[K]
): TvDisplaySettings {
  const current = loadTvSettings();
  const updated = { ...current, [key]: value };
  saveTvSettings(updated);
  return updated;
}

/**
 * Parse URL query parameters into partial TV settings.
 * Allows mosque admins to configure display via URL:
 *   /solat/tv?zone=SGR01&mosque=Masjid+Al-Rahman&dark=true&24h=true&iqamah_fajr=25
 */
export function parseTvParams(url: URL): Partial<TvDisplaySettings> {
  const p = url.searchParams;
  const partial: Partial<TvDisplaySettings> = {};

  if (p.has('zone')) partial.zone = p.get('zone')!;
  if (p.has('mosque')) partial.mosqueName = p.get('mosque')!;
  if (p.has('dark')) partial.darkMode = p.get('dark') === 'true';
  if (p.has('24h')) partial.use24h = p.get('24h') === 'true';
  if (p.has('seconds')) partial.showSeconds = p.get('seconds') === 'true';
  if (p.has('hijri')) partial.showHijri = p.get('hijri') === 'true';
  if (p.has('qibla')) partial.showQibla = p.get('qibla') === 'true';
  if (p.has('sunnah')) partial.showSunnah = p.get('sunnah') === 'true';
  if (p.has('adhan')) partial.adhanReminder = p.get('adhan') === 'true';
  if (p.has('screensaver')) partial.screensaverPrevention = p.get('screensaver') === 'true';
  if (p.has('jumua')) partial.jumuaKhutbah = p.get('jumua')!;

  const fontSize = p.get('font');
  if (fontSize === 'normal' || fontSize === 'large' || fontSize === 'xlarge') {
    partial.fontSize = fontSize;
  }

  // Individual iqamah overrides
  const iqamah: Partial<IqamahConfig> = {};
  for (const key of ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const) {
    const val = p.get(`iqamah_${key}`);
    if (val) {
      const num = parseInt(val, 10);
      if (!isNaN(num) && num >= 0 && num <= 60) {
        iqamah[key] = num;
      }
    }
  }
  if (Object.keys(iqamah).length > 0) {
    partial.iqamah = { ...DEFAULT_IQAMAH, ...iqamah };
  }

  return partial;
}

/**
 * Generate a shareable URL from current TV settings.
 */
export function buildTvShareUrl(settings: TvDisplaySettings, base = ''): string {
  const params = new URLSearchParams();
  if (settings.zone !== DEFAULT_TV_SETTINGS.zone) params.set('zone', settings.zone);
  if (settings.mosqueName) params.set('mosque', settings.mosqueName);
  if (!settings.darkMode) params.set('dark', 'false');
  if (!settings.use24h) params.set('24h', 'false');
  if (!settings.showSeconds) params.set('seconds', 'false');
  if (settings.showSunnah) params.set('sunnah', 'true');
  if (settings.fontSize !== 'large') params.set('font', settings.fontSize);
  if (settings.jumuaKhutbah !== '13:00') params.set('jumua', settings.jumuaKhutbah);

  // Iqamah overrides (only non-defaults)
  const iq = settings.iqamah;
  const dq = DEFAULT_IQAMAH;
  if (iq.fajr !== dq.fajr) params.set('iqamah_fajr', String(iq.fajr));
  if (iq.dhuhr !== dq.dhuhr) params.set('iqamah_dhuhr', String(iq.dhuhr));
  if (iq.asr !== dq.asr) params.set('iqamah_asr', String(iq.asr));
  if (iq.maghrib !== dq.maghrib) params.set('iqamah_maghrib', String(iq.maghrib));
  if (iq.isha !== dq.isha) params.set('iqamah_isha', String(iq.isha));

  const qs = params.toString();
  return `${base}/solat/tv${qs ? `?${qs}` : ''}`;
}
