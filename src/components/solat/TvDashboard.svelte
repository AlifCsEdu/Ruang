<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { SolatDay, SolatResponse, TvDisplaySettings, IqamahConfig } from '../../lib/solat/types';
  import { PRAYER_KEYS, PRAYER_NAMES } from '../../lib/solat/types';
  import { getNextPrayer, formatCountdown, parsePrayerTime } from '../../lib/solat/countdown';
  import { cachePrayerTimes, getCachedPrayerTimes, getTodayPrayers } from '../../lib/solat/storage';
  import { loadTvSettings, saveTvSettings, parseTvParams, DEFAULT_TV_SETTINGS } from '../../lib/solat/tvSettings';
  import { calculateIqamahTimes, getIqamahCountdown, isWithinIqamahWindow, isPreAdhanWarning } from '../../lib/solat/iqamah';
  import TvSettingsPanel from './TvSettingsPanel.svelte';

  interface Props {
    'data-init-config'?: string;
  }
  let { 'data-init-config': initConfigStr }: Props = $props();

  // Settings — initialize with defaults (SSR-safe), load from localStorage in onMount
  let tvSettings = $state<TvDisplaySettings>({ ...DEFAULT_TV_SETTINGS, iqamah: { ...DEFAULT_TV_SETTINGS.iqamah } });
  let showSettings = $state(false);

  // Fullscreen: auto-attempt on mount, fallback on first interaction
  let fullscreenListenersAttached = false;

  // Prayer data
  let today = $state<SolatDay | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let cachedResponse = $state<SolatResponse | null>(null);

  // Clock
  let clockStr = $state('');
  let dateStr = $state('');
  let dayName = $state('');
  let clockInterval: ReturnType<typeof setInterval> | null = null;

  // Countdown
  let countdown = $state('');
  let nextPrayerName = $state('');
  let nextPrayerKey = $state('');
  let countdownInterval: ReturnType<typeof setInterval> | null = null;

  // Hijri
  let hijriDateStr = $state('');
  let hijriMonth = $state('');

  // Iqamah
  let iqamahTimes = $state<Record<string, string>>({});
  let activeIqamahKey = $state('');
  let activeIqamahCountdown = $state('');

  // Zone name resolution
  let zoneName = $state('');
  let zoneState = $state('');

  // Adhan
  let showAdhanOverlay = $state(false);
  let adhanOverlayPrayer = $state('');
  let preAdhanKey = $state('');

  // Friday
  let isFriday = $state(false);

  // Auto-refresh
  let refreshInterval: ReturnType<typeof setInterval> | null = null;

  // Detect if all iqamah values are 0 (personal use — hide iqamah display)
  let hasIqamah = $derived.by(() => {
    const iq = tvSettings.iqamah;
    return iq.fajr > 0 || iq.dhuhr > 0 || iq.asr > 0 || iq.maghrib > 0 || iq.isha > 0;
  });

  const PRAYER_DISPLAY: Record<string, { label: string; emoji: string }> = {
    fajr: { label: 'Subuh', emoji: '🌅' },
    syuruk: { label: 'Syuruk', emoji: '☀️' },
    dhuhr: { label: 'Zohor', emoji: '🌤️' },
    asr: { label: 'Asar', emoji: '⛅' },
    maghrib: { label: 'Maghrib', emoji: '🌇' },
    isha: { label: 'Isyak', emoji: '🌙' },
  };

  const HIJRI_MONTHS = ['Muharram', "Safar", "Rabi' al-Awwal", "Rabi' al-Thani", 'Jumada al-Ula', 'Jumada al-Thani', 'Rajab', "Sha'ban", 'Ramadan', 'Shawwal', "Dhu al-Qi'dah", 'Dhu al-Hijjah'];

  let isRamadan = $derived(hijriMonth === 'Ramadan' || hijriMonth === 'رمضان');

  let darkClass = $derived(tvSettings.darkMode ? 'tv-dark' : 'tv-light');
  let fontClass = $derived(`tv-font-${tvSettings.fontSize}`);
  let screensaverClass = $derived(tvSettings.screensaverPrevention ? 'tv-screensaver' : '');

  // Derive current prayer key
  let currentPrayerKey = $derived.by(() => {
    if (!today) return '';
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' }));
    const keys = ['fajr', 'syuruk', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
    let current = '';
    for (const key of keys) {
      const timeStr = today[key as keyof SolatDay] as string;
      if (!timeStr) continue;
      const prayerTime = parsePrayerTime(timeStr, now);
      if (prayerTime <= now) current = key;
    }
    return current;
  });

  // Time progress bar for countdown
  let countdownProgress = $derived.by(() => {
    if (!today || !nextPrayerKey) return 0;
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' }));
    const nextTimeStr = today[nextPrayerKey as keyof SolatDay] as string;
    if (!nextTimeStr) return 0;
    const nextTime = parsePrayerTime(nextTimeStr, now);
    const keys = ['fajr', 'syuruk', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
    const nextIdx = keys.indexOf(nextPrayerKey as typeof keys[number]);
    if (nextIdx <= 0) return 0;
    const prevTimeStr = today[keys[nextIdx - 1] as keyof SolatDay] as string;
    if (!prevTimeStr) return 0;
    const prevTime = parsePrayerTime(prevTimeStr, now);
    const total = nextTime.getTime() - prevTime.getTime();
    const elapsed = now.getTime() - prevTime.getTime();
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  });

  // SVG progress ring calculations
  const RING_RADIUS = 90;
  const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
  let ringOffset = $derived(RING_CIRCUMFERENCE - (countdownProgress / 100) * RING_CIRCUMFERENCE);

  // Qibla
  let qiblaBearing = $state<number | null>(null);

  // Daily reminder
  const TV_REMINDERS = [
    { ms: '"Solat itu tiang agama."', src: '— Hadith' },
    { ms: '"Sesungguhnya sesudah kesulitan ada kemudahan."', src: '— QS 94:6' },
    { ms: '"Allah tidak membebani seseorang melainkan sesuai dengan kesanggupannya."', src: '— QS 2:286' },
    { ms: '"Dan Dialah yang menjadikan malam dan siang silih berganti."', src: '— QS 25:62' },
    { ms: '"Cukuplah Allah bagiku."', src: '— QS 9:129' },
    { ms: '"Maka nikmat Tuhan kamu yang manakah yang kamu dustakan?"', src: '— QS 55:13' },
    { ms: '"Sebaik-baik manusia adalah yang paling bermanfaat bagi orang lain."', src: '— Hadith' },
  ];
  let dailyReminder = $state(TV_REMINDERS[0]);

  // Fullscreen: auto-enter on mount, fallback on first interaction
  function enterFullscreen() {
    if (document.fullscreenElement) return;
    document.documentElement.requestFullscreen()
      .then(() => removeFullscreenListeners())
      .catch(() => {
        // Attach listeners for fallback (browser requires user gesture)
        if (!fullscreenListenersAttached) {
          fullscreenListenersAttached = true;
          document.addEventListener('click', fullscreenFallback, { once: true });
          document.addEventListener('keydown', fullscreenFallback, { once: true });
        }
      });
  }

  function fullscreenFallback() {
    document.documentElement.requestFullscreen().catch(() => {});
    removeFullscreenListeners();
  }

  function removeFullscreenListeners() {
    document.removeEventListener('click', fullscreenFallback);
    document.removeEventListener('keydown', fullscreenFallback);
    fullscreenListenersAttached = false;
  }

  onMount(() => {
    // Load settings from localStorage (browser-only, safe here)
    tvSettings = loadTvSettings();

    // Apply URL param overrides
    if (initConfigStr) {
      try {
        const cfg = JSON.parse(initConfigStr);
        const url = new URL(window.location.href);
        const overrides = parseTvParams(url);
        if (Object.keys(overrides).length > 0) {
          tvSettings = { ...tvSettings, ...overrides, iqamah: { ...tvSettings.iqamah, ...(overrides.iqamah ?? {}) } };
          saveTvSettings(tvSettings);
        }
      } catch { /* ignore */ }
    }

    computeHijriDate();
    computeQibla(3.14, 101.69);

    const doy = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    dailyReminder = TV_REMINDERS[doy % TV_REMINDERS.length];

    // Check if Friday
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' }));
    isFriday = now.getDay() === 5;

    // Fetch zone name
    fetchZoneName();

    loadFromCache();
    fetchPrayerTimes();
    clockInterval = setInterval(updateClock, 1000);
    countdownInterval = setInterval(updateCountdown, 1000);
    refreshInterval = setInterval(fetchPrayerTimes, 3600000);
    updateClock();

    // Keyboard shortcuts
    window.addEventListener('keydown', handleKeydown);

    // Fullscreen: attempt auto-entry (may require gesture fallback)
    setTimeout(enterFullscreen, 300);
  });

  onDestroy(() => {
    if (clockInterval) clearInterval(clockInterval);
    if (countdownInterval) clearInterval(countdownInterval);
    if (refreshInterval) clearInterval(refreshInterval);
    removeFullscreenListeners();
    window.removeEventListener('keydown', handleKeydown);
  });

  async function fetchZoneName() {
    try {
      const res = await fetch('/api/zones');
      if (res.ok) {
        const data = await res.json();
        const z = data.zones?.find((z: any) => z.id === tvSettings.zone);
        if (z) { zoneName = z.name; zoneState = z.state; }
      }
    } catch { /* ignore */ }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 's' || e.key === 'S') { showSettings = !showSettings; }
    if (e.key === 'Escape') { showSettings = false; }
    if (e.key === 'f' || e.key === 'F') { toggleFullscreen(); }
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  }

  function toggleDarkMode() {
    tvSettings = { ...tvSettings, darkMode: !tvSettings.darkMode };
    saveTvSettings(tvSettings);
  }

  function updateClock() {
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' }));
    const h = now.getHours();
    const m = now.getMinutes();
    const s = now.getSeconds();
    if (tvSettings.use24h) {
      clockStr = tvSettings.showSeconds
        ? `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
        : `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    } else {
      const h12 = h % 12 || 12;
      const ampm = h < 12 ? 'AM' : 'PM';
      clockStr = tvSettings.showSeconds
        ? `${h12}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} ${ampm}`
        : `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
    }
    const DAYS = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];
    const MONTHS = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];
    dayName = DAYS[now.getDay()];
    dateStr = `${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
    isFriday = now.getDay() === 5;
  }

  function computeHijriDate() {
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' }));
    const jd = gregorianToJD(now.getFullYear(), now.getMonth() + 1, now.getDate());
    const hijri = jdToHijri(jd);
    hijriMonth = HIJRI_MONTHS[hijri.month - 1];
    hijriDateStr = `${hijri.day} ${HIJRI_MONTHS[hijri.month - 1]} ${hijri.year} AH`;
  }

  function gregorianToJD(year: number, month: number, day: number): number {
    if (month <= 2) { year -= 1; month += 12; }
    const A = Math.floor(year / 100);
    const B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + day + B - 1524.5;
  }

  function jdToHijri(jd: number): { year: number; month: number; day: number } {
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
    if (m === 0) return { year: 1, month: 1, day: 1 };
    return { year: 30 * cyc + j + 1, month: m, day: Math.floor(z - Math.floor(29.5001 * m - 29)) + 1 };
  }

  function computeQibla(lat: number, lng: number) {
    const KAABA_LAT = 21.4225;
    const KAABA_LNG = 39.8262;
    const latR = lat * Math.PI / 180;
    const lngR = lng * Math.PI / 180;
    const kLatR = KAABA_LAT * Math.PI / 180;
    const kLngR = KAABA_LNG * Math.PI / 180;
    const bearing = Math.atan2(
      Math.sin(kLngR - lngR),
      Math.cos(latR) * Math.tan(kLatR) - Math.sin(latR) * Math.cos(kLngR - lngR)
    ) * 180 / Math.PI;
    qiblaBearing = Math.round((bearing + 360) % 360);
  }

  function loadFromCache() {
    const cached = getCachedPrayerTimes();
    if (cached && cached.zone === tvSettings.zone) {
      cachedResponse = cached.data;
      const todayPrayers = getTodayPrayers(cached.data);
      if (todayPrayers) {
        today = todayPrayers;
        loading = false;
        iqamahTimes = calculateIqamahTimes(todayPrayers, tvSettings.iqamah);
        updateCountdown();
      }
    }
  }

  async function fetchPrayerTimes() {
    if (!tvSettings.zone) return;
    try {
      const res = await fetch(`/api/solat/${tvSettings.zone}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: SolatResponse = await res.json();
      cachedResponse = data;
      cachePrayerTimes(tvSettings.zone, data);
      const todayPrayers = getTodayPrayers(data);
      if (todayPrayers) {
        today = todayPrayers;
        iqamahTimes = calculateIqamahTimes(todayPrayers, tvSettings.iqamah);
        error = null;
        updateCountdown();
      } else { error = 'No prayer times for today'; }
    } catch {
      if (!today) error = 'Failed to load prayer times';
    } finally { loading = false; }
  }

  function updateCountdown() {
    if (!today) return;
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' }));
    const next = getNextPrayer(today);
    nextPrayerName = next.name;
    const remaining = next.time.getTime() - Date.now();
    countdown = formatCountdown(remaining);

    // Determine next prayer key
    const idx = PRAYER_NAMES.indexOf(next.name as typeof PRAYER_NAMES[number]);
    nextPrayerKey = idx >= 0 ? PRAYER_KEYS[idx] : '';

    // Check iqamah windows
    activeIqamahKey = '';
    activeIqamahCountdown = '';
    const prayerKeysNoSyuruk = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
    for (const key of prayerKeysNoSyuruk) {
      const prayerTime = today[key as keyof SolatDay] as string;
      const iqamahTime = iqamahTimes[key];
      if (prayerTime && iqamahTime && isWithinIqamahWindow(prayerTime, iqamahTime, now)) {
        activeIqamahKey = key;
        activeIqamahCountdown = getIqamahCountdown(iqamahTime, now);
        break;
      }
    }

    // Check pre-adhan warning (5 min before)
    preAdhanKey = '';
    for (const key of prayerKeysNoSyuruk) {
      const prayerTime = today[key as keyof SolatDay] as string;
      if (prayerTime && isPreAdhanWarning(prayerTime, now, 5)) {
        preAdhanKey = key;
        break;
      }
    }

    // Adhan overlay
    if (tvSettings.adhanReminder && nextPrayerKey && !['syuruk'].includes(nextPrayerKey)) {
      if (remaining > 0 && remaining < 10000 && !showAdhanOverlay) {
        showAdhanOverlay = true;
        adhanOverlayPrayer = nextPrayerName;
        setTimeout(() => { showAdhanOverlay = false; }, 10000);
      }
    }
  }

  function formatTime12(timeStr: string): string {
    if (!timeStr) return '';
    const match = timeStr.match(/^(\d{2}):(\d{2})$/);
    if (!match) return timeStr;
    const h = parseInt(match[1], 10);
    const m = match[2];
    const h12 = h % 12 || 12;
    const ampm = h < 12 ? 'PG' : 'PTG';
    return `${h12}:${m} ${ampm}`;
  }

  function handleSettingsUpdate(updated: TvDisplaySettings) {
    const oldZone = tvSettings.zone;
    tvSettings = updated;
    saveTvSettings(updated);
    if (today) {
      iqamahTimes = calculateIqamahTimes(today, updated.iqamah);
    }
    if (updated.zone !== oldZone) {
      fetchPrayerTimes();
      fetchZoneName();
    }
    showSettings = false;
  }

  function timeUntil(timeStr: string): string {
    if (!timeStr) return '';
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' }));
    const match = timeStr.match(/^(\d{2}):(\d{2})$/);
    if (!match) return '';
    const target = new Date(now);
    target.setHours(parseInt(match[1], 10), parseInt(match[2], 10), 0, 0);
    const diff = target.getTime() - now.getTime();
    if (diff <= 0) return '';
    const totalMin = Math.floor(diff / 60000);
    if (totalMin < 60) return `+${totalMin}m`;
    const h = Math.floor(totalMin / 60);
    return `+${h}j${totalMin % 60}m`;
  }
</script>

<!-- Adhan Overlay -->
{#if showAdhanOverlay}
  <div class="fixed inset-0 z-[100] flex items-center justify-center bg-accent-green tv-adhan-overlay" role="alert" aria-live="assertive">
    <div class="text-center text-white border-4 border-white/40 p-12 bg-accent-green/80 shadow-[12px_12px_0px_0px_rgba(0,0,0,0.4)]">
      <p class="text-[clamp(2.5rem,7vw,6rem)] font-black leading-tight mb-4">اللّٰهُ أَكْبَرُ</p>
      <div class="h-1.5 w-24 bg-white/60 mx-auto mb-4 border-2 border-white/30"></div>
      <p class="text-[clamp(1.5rem,4vw,3rem)] font-black uppercase tracking-[0.2em]">Waktu {adhanOverlayPrayer}</p>
      <p class="text-[clamp(1rem,2vw,1.75rem)] font-bold mt-4 opacity-80 tracking-wide">Sila bersiap untuk solat</p>
    </div>
  </div>
{/if}

<!-- Main container -->
<div class="w-screen h-screen overflow-hidden {darkClass} {fontClass} {screensaverClass} relative" role="main" aria-label="Full Screen Prayer Display">

  {#if showSettings}
    <TvSettingsPanel settings={tvSettings} onApply={handleSettingsUpdate} onClose={() => { showSettings = false; }} />
  {/if}

  {#if loading}
    <div class="flex items-center justify-center h-full">
      <div class="text-center">
        <p class="text-2xl font-black opacity-40 animate-pulse tracking-wide">Memuatkan waktu solat...</p>
      </div>
    </div>
  {:else if error && !today}
    <div class="flex items-center justify-center h-full">
      <div class="text-center border-4 border-accent-pink px-10 py-8 bg-accent-pink/10 shadow-[8px_8px_0px_0px_rgba(255,51,102,0.3)]">
        <p class="text-3xl font-black mb-2">⚠️</p>
        <p class="text-xl font-black text-accent-pink">{error}</p>
        <button onclick={fetchPrayerTimes} class="mt-6 px-8 py-3 border-4 border-current font-black uppercase tracking-wider hover:bg-current/10 transition-colors text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none">Cuba Semula</button>
      </div>
    </div>
  {:else if today}
    <div class="h-full flex flex-col p-4 lg:p-6 2xl:p-10 gap-3">

      <!-- === ACCENT BAR === -->
      <div class="accent-bar shrink-0"></div>

      <!-- === HEADER === -->
      <header class="shrink-0 flex flex-col gap-2">
        <!-- Row 1: Navigation + Zone + Date info -->
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-3 min-w-0">
            <a href="/solat" class="shrink-0 text-sm font-black uppercase tracking-wider border-4 border-current/30 px-3 py-1.5 hover:border-current/70 hover:bg-current/5 transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,0.1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none" title="Kembali ke paparan biasa">← Kembali</a>
            {#if tvSettings.mosqueName}
              <p class="font-black uppercase tracking-[0.15em] text-sm truncate border-l-4 border-accent-yellow pl-3" style="color: var(--color-accent-yellow, #FFD500);">{tvSettings.mosqueName}</p>
            {/if}
            <!-- Zone chip with name -->
            <div class="shrink-0 flex items-center gap-2">
              {#if zoneName}
                <span class="text-sm font-bold opacity-70 hidden lg:inline">{zoneName}{#if zoneState}, {zoneState}{/if}</span>
              {/if}
              <span class="shrink-0 font-mono text-xs font-black border-2 border-current/30 px-2 py-1 tracking-wider bg-current/5">{tvSettings.zone}</span>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <!-- Day + Date -->
            <div class="text-right hidden sm:block">
              <p class="text-sm font-black uppercase tracking-wider">{dayName}</p>
              <p class="text-xs font-bold opacity-50">{dateStr}</p>
            </div>
            <!-- Hijri badge -->
            {#if tvSettings.showHijri}
              <span class="text-xs font-black uppercase tracking-wider border-2 border-accent-yellow/40 px-2.5 py-1 bg-accent-yellow/10" style="color: var(--color-accent-yellow, #FFD500);">{hijriDateStr}</span>
            {/if}
          </div>
        </div>
        <!-- Row 2: Clock + Controls -->
        <div class="flex items-center justify-between gap-3 pb-2 border-b-4 border-current/15">
          <div class="flex items-center gap-3">
            <!-- Mobile date (visible on small screens) -->
            <div class="sm:hidden">
              <p class="text-xs font-black uppercase tracking-wider">{dayName}</p>
              <p class="text-[10px] font-bold opacity-50">{dateStr}</p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <!-- Clock in dramatic container -->
            <div class="fs-clock">
              <p class="font-mono font-black" style="font-size: var(--tv-clock);" role="timer" aria-live="polite">{clockStr}</p>
            </div>
            <!-- Dark/Light toggle -->
            <button
              onclick={toggleDarkMode}
              class="shrink-0 w-10 h-10 flex items-center justify-center border-4 border-current/30 hover:border-current/60 transition-all text-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,0.1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none hover:bg-current/5"
              aria-label="Toggle dark/light mode"
              title={tvSettings.darkMode ? 'Light mode' : 'Dark mode'}
            >{tvSettings.darkMode ? '☀️' : '🌙'}</button>
            <!-- Settings gear -->
            <button
              onclick={() => { showSettings = !showSettings; }}
              class="shrink-0 w-10 h-10 flex items-center justify-center border-4 border-current/30 hover:border-current/60 transition-all text-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,0.1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none hover:bg-current/5"
              aria-label="Open settings"
              title="Tetapan (S)"
            >⚙️</button>
          </div>
        </div>
      </header>

      <!-- Ramadan banner -->
      {#if isRamadan}
        <div class="shrink-0 text-center py-2 border-4 border-accent-yellow bg-accent-yellow/15 font-black uppercase tracking-[0.2em] text-sm shadow-[4px_4px_0px_0px_rgba(255,213,0,0.3)]" style="color: var(--color-accent-yellow, #FFD500);">
          🌙 RAMADAN MUBARAK 🌙
        </div>
      {/if}

      <!-- Friday banner -->
      {#if isFriday}
        <div class="shrink-0 text-center py-2 border-4 border-accent-green bg-accent-green/15 font-black uppercase tracking-[0.2em] text-sm shadow-[4px_4px_0px_0px_rgba(0,200,83,0.3)]" style="color: var(--color-accent-green, #00C853);">
          🕌 JUMAAT — Khutbah {tvSettings.jumuaKhutbah}
        </div>
      {/if}

      <!-- === MAIN CONTENT: 2-COLUMN GRID (60/40 split) === -->
      <div class="flex-1 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-4 lg:gap-5 2xl:gap-6 min-h-0">

        <!-- LEFT: Countdown Hero -->
        <div class="tv-card fs-hero-card border-[6px] p-6 lg:p-8 flex flex-col justify-center items-center text-center gap-4 relative overflow-hidden">
          <!-- Accent stripe at top -->
          <div class="absolute top-0 left-0 right-0 h-1.5 {activeIqamahKey ? 'bg-accent-green' : 'bg-accent-yellow'}"></div>

          {#if activeIqamahKey}
            <div class="tv-iqamah-active">
              <p class="text-xs font-black uppercase tracking-[0.3em] opacity-50 mb-2">Iqamah Segera</p>
              <div class="border-4 border-accent-green px-6 py-3 bg-accent-green/15 shadow-[6px_6px_0px_0px_rgba(0,200,83,0.3)] mb-4">
                <p class="font-black uppercase tracking-[0.15em]" style="font-size: var(--tv-prayer-name); color: var(--color-accent-green, #00C853);">
                  {PRAYER_DISPLAY[activeIqamahKey]?.label ?? activeIqamahKey}
                </p>
              </div>
              <p class="font-mono font-black tracking-[0.05em]" style="font-size: var(--tv-countdown);">{activeIqamahCountdown}</p>
            </div>
          {:else}
            <!-- Large watermark emoji -->
            <p class="text-[8rem] opacity-[0.06] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none" aria-hidden="true">
              {#if nextPrayerKey && PRAYER_DISPLAY[nextPrayerKey]}
                {PRAYER_DISPLAY[nextPrayerKey].emoji}
              {/if}
            </p>

            <!-- Circular SVG progress ring behind countdown -->
            <div class="relative flex items-center justify-center">
              <svg class="absolute" width="220" height="220" viewBox="0 0 220 220" aria-hidden="true">
                <!-- Track -->
                <circle cx="110" cy="110" r={RING_RADIUS} fill="none" stroke="currentColor" stroke-opacity="0.08" stroke-width="8" />
                <!-- Progress arc -->
                <circle
                  cx="110" cy="110" r={RING_RADIUS}
                  fill="none"
                  stroke={hasIqamah && nextPrayerKey && tvSettings.iqamah[nextPrayerKey as keyof IqamahConfig] > 0 ? '#00C853' : '#FFD500'}
                  stroke-width="8"
                  stroke-linecap="round"
                  stroke-dasharray={RING_CIRCUMFERENCE}
                  stroke-dashoffset={ringOffset}
                  transform="rotate(-90 110 110)"
                  class="transition-all duration-1000"
                />
              </svg>
              <!-- Inner content -->
              <div class="relative flex flex-col items-center gap-3 z-10">
                <p class="text-xs font-black uppercase tracking-[0.3em] opacity-40">Solat Seterusnya</p>
                <!-- Prayer name banner -->
                <div class="border-4 border-current/30 px-10 py-4 bg-gradient-to-r from-current/5 to-transparent shadow-[6px_6px_0px_0px_rgba(0,0,0,0.12)]">
                  <p class="font-black uppercase tracking-[0.15em]" style="font-size: var(--tv-prayer-name);">
                    {nextPrayerName}
                  </p>
                </div>
                <!-- Countdown digits -->
                <p class="font-mono font-black leading-none tracking-[0.05em]" style="font-size: var(--tv-countdown);" role="timer">{countdown}</p>
                <!-- Time + iqamah info -->
                <div class="flex items-center gap-3">
                  <p class="text-sm font-black opacity-40 uppercase tracking-wider">
                    {#if nextPrayerKey && today}
                      ⏰ {formatTime12(today[nextPrayerKey as keyof SolatDay] as string)}
                    {/if}
                  </p>
                  {#if hasIqamah && nextPrayerKey && tvSettings.iqamah[nextPrayerKey as keyof IqamahConfig] > 0}
                    <span class="text-xs opacity-40 font-mono tracking-wider border border-current/20 px-2 py-0.5">IQ +{tvSettings.iqamah[nextPrayerKey as keyof IqamahConfig]}m</span>
                  {/if}
                </div>
              </div>
            </div>
          {/if}
        </div>

        <!-- RIGHT: Prayer Times Grid -->
        <div class="tv-card fs-grid-card border-[6px] p-3 lg:p-4 overflow-y-auto">
          <div class="grid gap-2" role="list">
            {#each PRAYER_KEYS as key, idx}
              {@const display = PRAYER_DISPLAY[key]}
              {@const timeStr = today[key as keyof SolatDay] as string}
              {@const iqamahTime = iqamahTimes[key]}
              {@const isNext = key === nextPrayerKey}
              {@const isCurrent = key === currentPrayerKey}
              {@const isPreAdhan = key === preAdhanKey}
              {@const isIqamahActive = key === activeIqamahKey}
              {#if display && timeStr}
                <div
                  class="fs-prayer-row flex items-center justify-between px-3 py-4 lg:py-5 border-2 transition-all relative
                         {isNext ? 'border-4 border-accent-blue bg-accent-blue/15 shadow-[4px_4px_0px_0px_rgba(0,56,255,0.3)] tv-next-prayer-pulse' : isCurrent ? 'border-accent-green/70 bg-accent-green/10 shadow-[4px_4px_0px_0px_rgba(0,200,83,0.2)]' : 'border-current/15 hover:border-current/30'}
                         {idx % 2 !== 0 && !isNext && !isCurrent ? 'bg-current/[0.02]' : ''}
                         {isPreAdhan ? 'tv-pre-adhan' : ''}
                         {isIqamahActive ? 'tv-iqamah-active' : ''}"
                  role="listitem"
                  aria-label="{display.label} at {formatTime12(timeStr)}"
                >
                  <!-- Left accent strip for next/current -->
                  {#if isNext}
                    <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-accent-blue"></div>
                  {:else if isCurrent}
                    <div class="absolute left-0 top-0 bottom-0 w-1.5 bg-accent-green"></div>
                  {/if}

                  <div class="flex items-center gap-3">
                    <!-- Colored dot indicator -->
                    <span class="w-3 h-3 shrink-0 border-2 {isNext ? 'bg-accent-blue border-accent-blue' : isCurrent ? 'bg-accent-green border-accent-green' : 'bg-current/10 border-current/20'}" aria-hidden="true"></span>
                    <span class="font-black uppercase tracking-wider" style="font-size: var(--tv-prayer-name);">{display.label}</span>
                    {#if isNext}
                      <span class="text-[9px] font-black uppercase bg-accent-blue px-1.5 py-0.5 text-white tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">SETERUSNYA</span>
                    {/if}
                    {#if isCurrent && !isNext}
                      <span class="text-[9px] font-black uppercase bg-accent-green px-1.5 py-0.5 text-white tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)]">SEKARANG</span>
                    {/if}
                  </div>
                  <div class="text-right">
                    <p class="font-mono font-black" style="font-size: var(--tv-prayer-time);">
                      {tvSettings.use24h ? timeStr : formatTime12(timeStr)}
                    </p>
                    {#if hasIqamah && iqamahTime && key !== 'syuruk' && tvSettings.iqamah[key as keyof IqamahConfig] > 0}
                      <p class="text-[10px] font-bold opacity-40 tracking-wide">
                        IQ: {tvSettings.use24h ? iqamahTime : formatTime12(iqamahTime)}
                        {#if isIqamahActive}
                          <span class="text-accent-green font-black"> — {activeIqamahCountdown}</span>
                        {/if}
                      </p>
                    {/if}
                    {#if !isIqamahActive}
                      {@const tu = timeUntil(timeStr)}
                      {#if tu}
                        <p class="text-[10px] font-black opacity-30 tracking-wide">{tu}</p>
                      {/if}
                    {/if}
                  </div>
                </div>
              {/if}
            {/each}
          </div>

          {#if today.imsak}
            <div class="mt-3 pt-2 border-t-2 border-current/10 text-center">
              <span class="text-[10px] font-black uppercase tracking-wider opacity-35">🌙 Imsak: {tvSettings.use24h ? today.imsak : formatTime12(today.imsak)}</span>
            </div>
          {/if}
        </div>
      </div>

      <!-- === FOOTER STRIP === -->
      <footer class="shrink-0 flex items-center justify-between gap-4 px-2 py-3 lg:py-4 border-t-4 border-current/20 text-sm" style="border-image: linear-gradient(90deg, transparent, currentColor 20%, currentColor 80%, transparent) 1;">
        {#if tvSettings.showSunnah}
          <div class="flex items-center gap-3 opacity-50">
            {#if today.imsak}<span class="text-xs font-bold tracking-wide">🌙 Akhir Suhoor: {formatTime12(today.imsak)}</span>{/if}
          </div>
        {/if}

        {#if tvSettings.showQibla && qiblaBearing !== null}
          <span class="text-xs font-black tracking-wide border-2 border-current/20 px-2.5 py-1 bg-current/5 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)]">🧭 {qiblaBearing}°</span>
        {/if}

        {#if dailyReminder}
          <div class="flex-1 text-right border-2 border-current/10 px-3 py-1.5 bg-current/5">
            <span class="italic text-xs font-bold opacity-60 line-clamp-2">{dailyReminder.ms}</span>
            <span class="text-[10px] ml-1 font-black opacity-40">{dailyReminder.src}</span>
          </div>
        {/if}
      </footer>
    </div>
  {/if}
</div>
