<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { SolatDay, SolatResponse } from '../../lib/solat/types';
  import { PRAYER_NAMES, PRAYER_KEYS } from '../../lib/solat/types';
  import { getNextPrayer, formatCountdown, parsePrayerTime } from '../../lib/solat/countdown';
  import { cachePrayerTimes, getCachedPrayerTimes, getTodayPrayers } from '../../lib/solat/storage';
  import { loadSettings, setZone as saveZone, type SolatSettings as SolatSettingsType } from '../../lib/solat/settings';
  import { applyAllAdjustments } from '../../lib/solat/offsets';

  let zone = $state('SGR01');
  let today = $state<SolatDay | null>(null);
  let rawToday = $state<SolatDay | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let countdown = $state('');
  let nextPrayerName = $state('');
  let countdownInterval: ReturnType<typeof setInterval> | null = null;
  let settings = $state<SolatSettingsType | null>(null);

  // Live clock
  let currentTime = $state('');
  let currentDate = $state('');
  let clockInterval: ReturnType<typeof setInterval> | null = null;
  let use24h = $state(true);
  let showSeconds = $state(true);

  // Hijri date
  let hijriDateStr = $state('');
  let hijriDateAr = $state('');
  let hijriMonth = $state('');
  let hijriDay = $state(0);

  // Notification state
  let showNotifPanel = $state(false);
  let notifPermission = $state<NotificationPermission>('default');
  interface NotifPrefs {
    enabled: boolean;
    browser: boolean;
    sound: boolean;
    visual: boolean;
    volume: number;
    preMinutes: number;
    soundType: 'chime' | 'bell' | 'adhan';
    perPrayer: Record<string, boolean>;
  }
  let notifPrefs = $state<NotifPrefs>({
    enabled: false, browser: true, sound: true, visual: true,
    volume: 60, preMinutes: 5, soundType: 'chime',
    perPrayer: { fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true },
  });
  let lastNotifiedPrayer = $state('');
  let visualToast = $state<{ show: boolean; message: string; type: 'info' | 'success' }>({ show: false, message: '', type: 'info' });
  let toastTimeout: ReturnType<typeof setTimeout> | null = null;

  // Share state
  let shareStatus = $state('');

  // Qibla bearing
  let qiblaBearing = $state<number | null>(null);

  // Tracker state
  interface DayRecord { fajr: boolean; dhuhr: boolean; asr: boolean; maghrib: boolean; isha: boolean; }
  type TrackerData = Record<string, DayRecord>;
  const TRACKER_KEY = 'ruang_prayer_tracker';
  const NOTIF_KEY = 'ruang_notif_prefs_v2';
  const CLOCK_KEY = 'ruang_clock_24h';
  let trackerData = $state<TrackerData>({});

  // Weekly streak
  let weekStats = $state<{ day: string; count: number }[]>([]);

  // Elapsed time for current prayer
  let elapsedTime = $state('');

  // View mode: today / weekly
  let viewMode = $state<'today' | 'weekly'>('today');

  let totalWeek = $derived(weekStats.reduce((sum, s) => sum + s.count, 0));

  const TRACKER_PRAYERS = [
    { key: 'fajr', label: 'Subuh', color: 'bg-accent-blue', textColor: 'text-accent-blue' },
    { key: 'dhuhr', label: 'Zohor', color: 'bg-accent-yellow', textColor: 'text-accent-yellow' },
    { key: 'asr', label: 'Asar', color: 'bg-accent-pink', textColor: 'text-accent-pink' },
    { key: 'maghrib', label: 'Maghrib', color: 'bg-accent-green', textColor: 'text-accent-green' },
    { key: 'isha', label: 'Isyak', color: 'bg-indigo-500', textColor: 'text-indigo-500' },
  ] as const;

  const PRAYER_DISPLAY: Record<string, { label: string; emoji: string }> = {
    fajr: { label: 'Subuh', emoji: '🌅' },
    syuruk: { label: 'Syuruk', emoji: '☀️' },
    dhuhr: { label: 'Zohor', emoji: '🌤️' },
    asr: { label: 'Asar', emoji: '⛅' },
    maghrib: { label: 'Maghrib', emoji: '🌇' },
    isha: { label: 'Isyak', emoji: '🌙' },
  };

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];
  const HIJRI_MONTHS = ['Muharram', "Safar", "Rabi' al-Awwal", "Rabi' al-Thani", 'Jumada al-Ula', 'Jumada al-Thani', 'Rajab', "Sha'ban", 'Ramadan', 'Shawwal', "Dhu al-Qi'dah", 'Dhu al-Hijjah'];
  const HIJRI_MONTHS_AR = ['محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني', 'جمادى الأولى', 'جمادى الآخرة', 'رجب', 'شعبان', 'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'];
  const WEEKDAY_AR: Record<string, string> = { Monday: 'الإثنين', Tuesday: 'الثلاثاء', Wednesday: 'الأربعاء', Thursday: 'الخميس', Friday: 'الجمعة', Saturday: 'السبت', Sunday: 'الأحد' };

  // Daily Islamic reminder
  const REMINDERS = [
    '"Solat itu tiang agama." — Hadith',
    '"Sesungguhnya sesudah kesulitan ada kemudahan." — QS 94:6',
    '"Allah tidak membebani seseorang melainkan sesuai dengan kesanggupannya." — QS 2:286',
    '"Barangsiapa bertakwa kepada Allah, nescaya Dia akan membukakan jalan keluar." — QS 65:2',
    '"Dan Dialah yang menjadikan malam dan siang silih berganti." — QS 25:62',
    '"Sesungguhnya Allah bersama orang-orang yang sabar." — QS 2:153',
    '"Cukuplah Allah bagiku." — QS 9:129',
  ];
  let dailyReminder = $state('');

  let nextPrayerKey = $derived.by(() => {
    if (!today) return '';
    const next = getNextPrayer(today);
    return PRAYER_KEYS[PRAYER_NAMES.indexOf(next.name as typeof PRAYER_NAMES[number])] ?? '';
  });

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

  // Time until each prayer (inline badge)
  function timeUntil(key: string): string {
    if (!today) return '';
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' }));
    const timeStr = today[key as keyof SolatDay] as string;
    if (!timeStr) return '';
    const prayerTime = parsePrayerTime(timeStr, now);
    const diff = prayerTime.getTime() - now.getTime();
    if (diff <= 0) return '';
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m`;
    const hrs = Math.floor(mins / 60);
    const m = mins % 60;
    return `${hrs}h${m}m`;
  }

  // Tracker derivations
  function todayStr(): string {
    const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' }));
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  let todayRecord = $derived<DayRecord>(
    trackerData[todayStr()] ?? { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false }
  );

  let completedCount = $derived(
    TRACKER_PRAYERS.filter((p) => todayRecord[p.key as keyof DayRecord]).length
  );

  let streak = $derived.by(() => {
    let count = 0;
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' }));
    for (let i = 0; i < 365; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const record = trackerData[key];
      if (record && record.fajr && record.dhuhr && record.asr && record.maghrib && record.isha) {
        count++;
      } else if (i > 0) { break; }
    }
    return count;
  });

  // Is Ramadan detection
  let isRamadan = $derived(hijriMonth === 'Ramadan' || hijriMonth === 'رمضان');

  onMount(() => {
    settings = loadSettings();
    zone = settings.zone;

    // Load tracker data
    try { const raw = localStorage.getItem(TRACKER_KEY); if (raw) trackerData = JSON.parse(raw); } catch { /* empty */ }
    // Load notification prefs
    try { const raw = localStorage.getItem(NOTIF_KEY); if (raw) notifPrefs = JSON.parse(raw); } catch { /* empty */ }
    // Load clock pref
    try { const raw = localStorage.getItem(CLOCK_KEY); if (raw) { const p = JSON.parse(raw); use24h = p.use24h ?? true; showSeconds = p.showSeconds ?? true; } } catch { /* empty */ }

    // Notification permission
    if ('Notification' in window) notifPermission = Notification.permission;

    // Compute Hijri date
    computeHijriDate();

    // Compute Qibla bearing (Malaysia default coords: 3.14, 101.69)
    computeQibla(3.14, 101.69);

    // Daily reminder based on day of year
    const doy = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    dailyReminder = REMINDERS[doy % REMINDERS.length];

    // Weekly stats
    computeWeekStats();

    window.addEventListener('solat-settings-changed', ((e: CustomEvent<SolatSettingsType>) => {
      settings = e.detail;
      if (e.detail.zone !== zone) { zone = e.detail.zone; rawToday = null; fetchPrayerTimes(); }
      else if (rawToday && settings) { today = applyAllAdjustments(rawToday, settings.prayerOffsets, settings.madhab); }
    }) as EventListener);

    window.addEventListener('prayer-tracker-sync', () => {
      try { const raw = localStorage.getItem(TRACKER_KEY); if (raw) trackerData = JSON.parse(raw); computeWeekStats(); } catch { /* empty */ }
    });

    loadFromCache();
    fetchPrayerTimes();
    countdownInterval = setInterval(updateCountdown, 1000);
    updateClock();
    clockInterval = setInterval(updateClock, 1000);
  });

  onDestroy(() => {
    if (countdownInterval) clearInterval(countdownInterval);
    if (clockInterval) clearInterval(clockInterval);
    if (toastTimeout) clearTimeout(toastTimeout);
  });

  function computeHijriDate() {
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' }));
    const jd = gregorianToJD(now.getFullYear(), now.getMonth() + 1, now.getDate());
    const hijri = jdToHijri(jd);
    hijriDay = hijri.day;
    hijriMonth = HIJRI_MONTHS[hijri.month - 1];
    hijriDateStr = `${hijri.day} ${HIJRI_MONTHS[hijri.month - 1]} ${hijri.year} AH`;
    hijriDateAr = `${hijri.day} ${HIJRI_MONTHS_AR[hijri.month - 1]} ${hijri.year} هـ`;
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
    qiblaBearing = (bearing + 360) % 360;
  }

  function updateClock() {
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' }));
    const h = now.getHours();
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    if (use24h) {
      currentTime = showSeconds ? `${String(h).padStart(2,'0')}:${m}:${s}` : `${String(h).padStart(2,'0')}:${m}`;
    } else {
      const h12 = h % 12 || 12;
      const ampm = h < 12 ? 'AM' : 'PM';
      currentTime = showSeconds ? `${h12}:${m}:${s} ${ampm}` : `${h12}:${m} ${ampm}`;
    }
    const dayName = now.toLocaleDateString('en-MY', { weekday: 'long' });
    const dayAr = WEEKDAY_AR[dayName] ?? '';
    currentDate = `${dayName} · ${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()} · ${dayAr}`;

    // Update elapsed time for current prayer
    if (today && currentPrayerKey) {
      const timeStr = today[currentPrayerKey as keyof SolatDay] as string;
      if (timeStr) {
        const prayerTime = parsePrayerTime(timeStr, now);
        const elapsed = now.getTime() - prayerTime.getTime();
        if (elapsed > 0 && elapsed < 6 * 3600000) {
          const em = Math.floor(elapsed / 60000);
          if (em < 60) elapsedTime = `${em} min lalu`;
          else { const eh = Math.floor(em / 60); elapsedTime = `${eh}j ${em % 60}m lalu`; }
        } else { elapsedTime = ''; }
      }
    }
  }

  function computeWeekStats() {
    const days = ['Ahad', 'Isn', 'Sel', 'Rab', 'Kha', 'Jum', 'Sab'];
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' }));
    const stats: { day: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const record = trackerData[key];
      const count = record ? [record.fajr, record.dhuhr, record.asr, record.maghrib, record.isha].filter(Boolean).length : 0;
      stats.push({ day: days[d.getDay()], count });
    }
    weekStats = stats;
  }

  function loadFromCache() {
    const cached = getCachedPrayerTimes();
    if (cached && cached.zone === zone) {
      const todayPrayers = getTodayPrayers(cached.data);
      if (todayPrayers) {
        rawToday = todayPrayers;
        today = settings ? applyAllAdjustments(todayPrayers, settings.prayerOffsets, settings.madhab) : todayPrayers;
        loading = false;
        updateCountdown();
      }
    }
  }

  async function fetchPrayerTimes() {
    loading = true; error = null;
    try {
      const res = await fetch(`/api/solat/${zone}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: SolatResponse = await res.json();
      cachePrayerTimes(zone, data);
      const todayPrayers = getTodayPrayers(data);
      if (todayPrayers) {
        rawToday = todayPrayers;
        today = settings ? applyAllAdjustments(todayPrayers, settings.prayerOffsets, settings.madhab) : todayPrayers;
        updateCountdown();
      } else { error = 'No prayer times for today'; }
    } catch { if (!today) error = 'Failed to load prayer times. Check your connection.'; }
    finally { loading = false; }
  }

  function updateCountdown() {
    if (!today) return;
    const next = getNextPrayer(today);
    nextPrayerName = next.name;
    const remaining = next.time.getTime() - Date.now();
    countdown = formatCountdown(remaining);
    checkNotification(next);
  }

  // === NOTIFICATIONS ===
  function checkNotification(next: { name: string }) {
    if (!notifPrefs.enabled || !today) return;
    const currentNextKey = PRAYER_KEYS[PRAYER_NAMES.indexOf(next.name as typeof PRAYER_NAMES[number])] ?? '';
    if (currentNextKey && currentNextKey !== lastNotifiedPrayer) {
      lastNotifiedPrayer = currentNextKey;
      const display = PRAYER_DISPLAY[currentNextKey];
      if (display && notifPrefs.perPrayer[currentNextKey]) {
        const timeStr = today[currentNextKey as keyof SolatDay] as string;
        fireNotification(display.label, timeStr);
      }
    }
  }

  function fireNotification(prayerLabel: string, timeStr: string) {
    if (notifPrefs.browser && notifPermission === 'granted') {
      try { new Notification(`🕌 Waktu ${prayerLabel}`, { body: `Telah masuk waktu ${prayerLabel} (${timeStr})`, icon: '/icon-192.svg', tag: `prayer-${prayerLabel}` }); } catch { /* empty */ }
    }
    if (notifPrefs.sound) playNotificationSound();
    if (notifPrefs.visual) showVisualToast(`🕌 Waktu ${prayerLabel} — ${timeStr}`, 'success');
  }

  function playNotificationSound() {
    try {
      const ctx = new AudioContext();
      const vol = notifPrefs.volume / 100;
      if (notifPrefs.soundType === 'adhan') {
        // Adhan-like melody: ascending notes
        const notes = [293.66, 329.63, 349.23, 392.00, 440.00, 493.88];
        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.4);
          gain.gain.setValueAtTime(vol * 0.3, ctx.currentTime + i * 0.4);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.4 + 0.35);
          osc.start(ctx.currentTime + i * 0.4);
          osc.stop(ctx.currentTime + i * 0.4 + 0.4);
        });
      } else if (notifPrefs.soundType === 'bell') {
        // Bell sound: two resonant tones
        [523.25, 659.25].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.6);
          gain.gain.setValueAtTime(vol * 0.4, ctx.currentTime + i * 0.6);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.6 + 2);
          osc.start(ctx.currentTime + i * 0.6);
          osc.stop(ctx.currentTime + i * 0.6 + 2);
        });
      } else {
        // Chime: gentle two-note
        [587.33, 440].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.5);
          gain.gain.setValueAtTime(vol * 0.3, ctx.currentTime + i * 0.5);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.5 + 1.5);
          osc.start(ctx.currentTime + i * 0.5);
          osc.stop(ctx.currentTime + i * 0.5 + 1.5);
        });
      }
    } catch { /* empty */ }
  }

  function testNotification() {
    playNotificationSound();
    showVisualToast('🔔 Uji pemberitahuan — bunyi & visual', 'info');
    if (notifPrefs.browser && notifPermission === 'granted') {
      try { new Notification('🔔 Ruang — Uji', { body: 'Pemberitahuan berfungsi!', icon: '/icon-192.svg' }); } catch { /* empty */ }
    }
  }

  function showVisualToast(message: string, type: 'info' | 'success' = 'info') {
    visualToast = { show: true, message, type };
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => { visualToast = { show: false, message: '', type: 'info' }; }, 8000);
  }

  async function requestNotifPermission() {
    if (!('Notification' in window)) return;
    const result = await Notification.requestPermission();
    notifPermission = result;
    if (result === 'granted') { notifPrefs = { ...notifPrefs, enabled: true }; saveNotifPrefs(); }
  }

  function saveNotifPrefs() { try { localStorage.setItem(NOTIF_KEY, JSON.stringify(notifPrefs)); } catch { /* empty */ } }
  function saveClockPrefs() { try { localStorage.setItem(CLOCK_KEY, JSON.stringify({ use24h, showSeconds })); } catch { /* empty */ } }
  function toggleNotifPrayer(key: string) {
    notifPrefs = { ...notifPrefs, perPrayer: { ...notifPrefs.perPrayer, [key]: !notifPrefs.perPrayer[key] } };
    saveNotifPrefs();
  }

  // === SHARE ===
  async function sharePrayerTimes() {
    if (!today) return;
    const lines = [`🕌 Waktu Solat — ${zone}`, `📅 ${formatDateDisplay(today.date)}`, `📆 ${hijriDateStr}`, ''];
    for (const key of PRAYER_KEYS) {
      const display = PRAYER_DISPLAY[key];
      const timeStr = today[key as keyof SolatDay] as string;
      if (display && timeStr) lines.push(`${display.emoji} ${display.label}: ${timeStr}`);
    }
    if (today.imsak) lines.push(`\n🌙 Imsak: ${today.imsak}`);
    lines.push('', '— Ruang: Your Muslim Companion');
    const text = lines.join('\n');
    if (navigator.share) {
      try { await navigator.share({ title: 'Waktu Solat Hari Ini', text }); shareStatus = 'Dikongsi!'; }
      catch { await copyToClipboard(text); }
    } else { await copyToClipboard(text); }
    setTimeout(() => { shareStatus = ''; }, 3000);
  }

  async function copyToClipboard(text: string) {
    try { await navigator.clipboard.writeText(text); shareStatus = 'Disalin!'; }
    catch { shareStatus = 'Gagal salin'; }
  }

  // === TRACKER ===
  function toggleTracker(prayer: string) {
    const key = todayStr();
    const record = trackerData[key] ?? { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false };
    const updated = { ...trackerData, [key]: { ...record, [prayer]: !record[prayer as keyof DayRecord] } };
    trackerData = updated;
    try { localStorage.setItem(TRACKER_KEY, JSON.stringify(updated)); } catch { /* empty */ }
    computeWeekStats();
    window.dispatchEvent(new CustomEvent('prayer-tracker-sync'));
  }

  function isNextPrayer(key: string): boolean { return key === nextPrayerKey; }
  function isCurrentPrayer(key: string): boolean { return key === currentPrayerKey; }
  function formatDateDisplay(dateStr: string): string {
    const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return dateStr;
    return `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}`;
  }

  // Time progress bar for countdown
  let countdownProgress = $derived.by(() => {
    if (!today || !nextPrayerKey) return 0;
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' }));
    const nextTimeStr = today[nextPrayerKey as keyof SolatDay] as string;
    if (!nextTimeStr) return 0;
    const nextTime = parsePrayerTime(nextTimeStr, now);
    // Find the prayer before the next one
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
</script>

<!-- View mode tabs -->
<div class="flex items-center gap-4 mb-3 border-b-2 border-ink/10">
  <button
    onclick={() => { viewMode = 'today'; }}
    class="pb-2 text-xs font-black uppercase tracking-wider transition-colors border-b-4 -mb-[2px]
           {viewMode === 'today' ? 'border-accent-blue text-accent-blue' : 'border-transparent text-ink/40 hover:text-ink/70'}"
  >📅 Hari Ini</button>
  <button
    onclick={() => { viewMode = 'weekly'; }}
    class="pb-2 text-xs font-black uppercase tracking-wider transition-colors border-b-4 -mb-[2px]
           {viewMode === 'weekly' ? 'border-accent-yellow text-ink border-ink' : 'border-transparent text-ink/40 hover:text-ink/70'}"
  >📊 Minggu Ini</button>
</div>

{#if viewMode === 'weekly'}
<!-- ============ WEEKLY VIEW ============ -->
<div class="flex flex-col gap-4 animate-[fadeSlideUp_0.3s_ease-out]">
  <!-- Weekly hero -->
  <div class="card-hero bg-accent-yellow text-ink relative overflow-hidden">
    <div class="absolute top-0 left-0 right-0 h-2 bg-accent-pink"></div>
    <div class="flex items-center justify-between">
      <div>
        <p class="text-xs font-black uppercase tracking-wider opacity-60">Minggu Ini</p>
        <p class="font-black text-5xl tabular-nums mt-1">{completedCount}<span class="text-2xl text-ink/40">/5</span></p>
        <p class="text-xs font-black mt-1 opacity-60">solat hari ini</p>
      </div>
      <div class="text-right">
        {#if streak > 0}
          <p class="font-black text-5xl tabular-nums">{streak}</p>
          <p class="text-xs font-black opacity-60">hari berturut 🔥</p>
        {:else}
          <p class="font-black text-3xl opacity-40">—</p>
          <p class="text-xs font-black opacity-40">tiada streak lagi</p>
        {/if}
      </div>
    </div>
    <div class="mt-3 h-4 border-4 border-ink bg-white overflow-hidden">
      <div class="h-full transition-all duration-300 {completedCount === 5 ? 'bg-accent-green' : 'bg-accent-blue'}" style="width: {(completedCount / 5) * 100}%"></div>
    </div>
  </div>

  <!-- Weekly bar chart -->
  <div class="card-compact">
    <p class="text-xs font-black uppercase tracking-wider text-ink/40 mb-2">Statistik 7 Hari</p>
    <div class="flex items-end gap-2 h-28">
      {#each weekStats as stat}
        <div class="flex-1 flex flex-col items-center gap-1">
          <span class="text-xs font-black tabular-nums">{stat.count}/5</span>
          <div class="w-full bg-accent-blue/80 transition-all duration-300 min-h-[4px] border-2 border-ink/30" style="height: {(stat.count / 5) * 75}px"></div>
          <span class="text-[10px] font-black text-ink/50">{stat.day}</span>
        </div>
      {/each}
    </div>
    <div class="mt-3 pt-2 border-t-4 border-ink/20 flex items-center justify-between">
      <span class="text-xs font-black text-ink/60">Jumlah minggu ini</span>
      <span class="font-black text-lg tabular-nums">{totalWeek}<span class="text-xs text-ink/30">/35</span></span>
    </div>
  </div>

  <!-- Today's tracker -->
  <div class="border-t-4 border-ink pt-4">
    <p class="text-[10px] font-black uppercase tracking-wider text-ink/40 mb-2">Tracker Hari Ini</p>
    <div class="grid grid-cols-5 gap-2">
      {#each TRACKER_PRAYERS as prayer}
        {@const checked = todayRecord[prayer.key as keyof DayRecord]}
        <button
          onclick={() => toggleTracker(prayer.key)}
          class="flex flex-col items-center justify-center gap-1 p-2 border-4 transition-all duration-75 min-h-[3.5rem]
                 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none
                 {checked ? `${prayer.color} text-white border-ink shadow-[4px_4px_0px_0px_#0D0D0D]` : 'bg-white text-ink border-ink/30 hover:border-ink shadow-[2px_2px_0px_0px_#0D0D0D] hover:shadow-[4px_4px_0px_0px_#0D0D0D]'}"
          aria-label="Toggle {prayer.label}" aria-pressed={checked}
        >
          {#if checked}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><path d="M20 6L9 17l-5-5"/></svg>
          {:else}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="opacity-30"><circle cx="12" cy="12" r="10"/></svg>
          {/if}
          <span class="text-[9px] font-black uppercase tracking-wider leading-none">{prayer.label}</span>
        </button>
      {/each}
    </div>
  </div>

  <!-- Today's prayer times summary -->
  {#if today}
    <div class="card-compact">
      <p class="text-xs font-black uppercase tracking-wider text-ink/40 mb-2">Waktu Hari Ini</p>
      <div class="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {#each PRAYER_KEYS as key}
          {@const timeStr = today[key as keyof SolatDay] as string}
          {@const display = PRAYER_DISPLAY[key]}
          {#if display && timeStr}
            <div class="text-center py-2 px-1 border-4 border-ink bg-white shadow-[3px_3px_0px_0px_#0D0D0D]">
              <span class="text-base">{display.emoji}</span>
              <p class="text-[9px] font-black uppercase tracking-wider text-ink/50">{display.label}</p>
              <p class="font-mono font-black text-sm tabular-nums">{timeStr}</p>
            </div>
          {/if}
        {/each}
      </div>
    </div>
  {/if}
</div>
{:else}
<div class="flex flex-col gap-4 animate-[fadeSlideUp_0.3s_ease-out]">
  <!-- === VISUAL NOTIFICATION TOAST === -->
  {#if visualToast.show}
    <div class="fixed top-16 left-4 right-4 md:left-20 md:right-auto md:max-w-md z-50 border-4 border-ink {visualToast.type === 'success' ? 'bg-accent-green' : 'bg-accent-blue'} text-white p-4 shadow-[8px_8px_0px_0px_#0D0D0D] animate-[slideIn_0.3s_ease-out]">
      <div class="flex items-center justify-between gap-3">
        <p class="font-black text-sm">{visualToast.message}</p>
        <button onclick={() => { visualToast = { show: false, message: '', type: 'info' }; }} class="shrink-0 w-7 h-7 flex items-center justify-center bg-white/20 hover:bg-white/40 transition-colors text-sm font-black" aria-label="Close">✕</button>
      </div>
    </div>
  {/if}

  <!-- === MERGED HERO: Countdown + Clock + Date === -->
  <div class="card-hero bg-white relative overflow-hidden animate-[fadeSlideUp_0.3s_ease-out_0.05s_both]">
    <!-- Accent stripe -->
    <div class="absolute top-0 left-0 right-0 h-2 bg-accent-blue"></div>

    <!-- Countdown section (primary) -->
    {#if today}
      <div class="relative">
        <div class="flex items-center justify-between gap-3">
          <div class="min-w-0">
            <p class="text-[10px] font-black uppercase tracking-wider text-accent-blue">Solat Seterusnya</p>
            <p class="font-black text-2xl sm:text-3xl text-ink">{nextPrayerName}</p>
            {#if currentPrayerKey && currentPrayerKey !== nextPrayerKey}
              <p class="text-[10px] font-bold text-ink/40 mt-0.5">{PRAYER_DISPLAY[currentPrayerKey]?.label} · {elapsedTime}</p>
            {/if}
          </div>
          <div class="text-right shrink-0">
            <p class="font-mono font-black text-3xl sm:text-4xl lg:text-5xl tabular-nums text-accent-blue tracking-tight leading-none">{countdown}</p>
          </div>
        </div>
        <!-- Progress bar -->
        <div class="mt-3 h-2 border-2 border-ink bg-canvas overflow-hidden">
          <div class="h-full transition-all duration-1000 bg-accent-blue" style="width: {countdownProgress}%"></div>
        </div>
      </div>
    {/if}

    <!-- Clock section (secondary) -->
    <div class="flex items-center justify-center gap-2 mt-4 pt-3 border-t-2 border-ink/10">
      <button
        onclick={() => { use24h = !use24h; saveClockPrefs(); }}
        class="text-[9px] font-black uppercase tracking-wider px-2 py-1 border-2 border-ink/20 hover:border-ink transition-colors shadow-[2px_2px_0px_0px_#0D0D0D] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none min-h-[2.75rem] flex items-center
               {use24h ? 'bg-accent-yellow' : 'bg-white'}"
        title="Toggle 24h/12h"
      >{use24h ? '24H' : '12H'}</button>
      <p class="font-mono font-black text-4xl sm:text-5xl lg:text-6xl tabular-nums tracking-tight leading-none select-none text-ink/60">{currentTime || '--:--'}</p>
      <button
        onclick={() => { showSeconds = !showSeconds; saveClockPrefs(); }}
        class="text-[9px] font-black uppercase tracking-wider px-2 py-1 border-2 border-ink/20 hover:border-ink transition-colors shadow-[2px_2px_0px_0px_#0D0D0D] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none min-h-[2.75rem] flex items-center
               {showSeconds ? 'bg-accent-yellow' : 'bg-white'}"
        title="Toggle seconds"
      >{showSeconds ? 'SEC' : 'MIN'}</button>
    </div>

    <!-- Date + Hijri row -->
    <div class="flex items-center justify-center gap-3 mt-2 flex-wrap">
      <p class="text-xs font-bold text-ink/50 tracking-wide">{currentDate || 'Loading...'}</p>
      {#if hijriDateStr}
        <span class="inline-flex items-center gap-1.5 px-2 py-0.5 border-2 border-ink/20 bg-canvas text-[10px] font-bold">
          <span class="text-accent-blue" dir="rtl" lang="ar">{hijriDateAr}</span>
          <span class="text-ink/20">|</span>
          <span class="text-ink/50">{hijriDateStr}</span>
        </span>
      {/if}
    </div>
    {#if isRamadan}
      <p class="mt-2 text-center text-xs font-black text-accent-pink animate-pulse">🌙 Ramadan Mubarak! Semoga ibadat diterima.</p>
    {/if}

    <!-- Action row -->
    <div class="flex items-center gap-2 mt-3 pt-3 border-t-2 border-ink/10">
      <button onclick={sharePrayerTimes} class="text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 border-2 border-ink/20 hover:border-ink hover:bg-canvas transition-colors shadow-[2px_2px_0px_0px_#0D0D0D] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none min-h-[2.75rem] flex items-center" disabled={!today}>
        Kongsi {#if shareStatus}<span class="text-accent-green ml-1">✓ {shareStatus}</span>{/if}
      </button>
      <button onclick={() => (showNotifPanel = !showNotifPanel)} class="text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 border-2 border-ink/20 hover:border-ink hover:bg-canvas transition-colors shadow-[2px_2px_0px_0px_#0D0D0D] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none min-h-[2.75rem] flex items-center">
        🔔 Pemberitahuan {#if notifPrefs.enabled}<span class="text-accent-green ml-1">AKTIF</span>{/if}
      </button>
      {#if qiblaBearing !== null}
        <span class="ml-auto text-[10px] font-black text-ink/40 flex items-center gap-1" title="Qibla bearing">
          <span style="display:inline-block; transform: rotate({qiblaBearing}deg);">↑</span>
          Qibla {Math.round(qiblaBearing)}°
        </span>
      {/if}
    </div>
  </div>

  <!-- === PRAYER TIMES GRID === -->
  {#if loading && !today}
    <div class="flex items-center justify-center py-8">
      <div class="font-black text-ink/40 uppercase tracking-wider animate-pulse">Loading prayer times...</div>
    </div>
  {:else if error && !today}
    <div class="card-brutal-sm bg-accent-pink text-white">
      <p class="font-bold text-sm">{error}</p>
      <button onclick={fetchPrayerTimes} class="btn-brutal-sm mt-2 bg-white text-ink text-xs">Cuba Lagi</button>
    </div>
  {:else if today}
    <!-- Mobile: horizontal 2-col layout -->
    <div class="flex flex-col gap-2 sm:hidden">
      {#each PRAYER_KEYS as key, i}
        {@const timeStr = today[key as keyof SolatDay] as string}
        {@const display = PRAYER_DISPLAY[key]}
        {@const isNext = isNextPrayer(key)}
        {@const isCurrent = isCurrentPrayer(key)}
        {@const tu = timeUntil(key)}
        <div
          class="flex items-center gap-3 px-3 py-2.5 border-4 transition-all duration-100 animate-[fadeSlideUp_0.2s_ease-out_both]
                 {isCurrent && !isNext
                   ? 'border-accent-green bg-accent-green/10 shadow-[4px_4px_0px_0px_#0D0D0D]'
                   : isNext
                     ? 'border-accent-blue bg-accent-blue/10 shadow-[4px_4px_0px_0px_#0D0D0D]'
                     : 'border-ink bg-white shadow-[3px_3px_0px_0px_#0D0D0D]'}"
          style="animation-delay: {i * 0.04}s"
        >
          <span class="text-lg shrink-0">{display.emoji}</span>
          <div class="flex-1 min-w-0">
            <span class="font-black text-xs uppercase tracking-wider">{display.label}</span>
            {#if isCurrent}
              <span class="ml-1.5 text-[8px] font-black uppercase bg-accent-green text-white px-1.5 py-0.5 border border-ink">SEKARANG</span>
            {:else if isNext}
              <span class="ml-1.5 text-[8px] font-black uppercase bg-accent-blue text-white px-1.5 py-0.5 border border-ink">SETERUSNYA</span>
            {/if}
          </div>
          <span class="font-mono font-black text-base tabular-nums shrink-0">{timeStr || '--:--'}</span>
          {#if tu && !isCurrent && !isNext}
            <span class="text-[9px] font-bold text-ink/40 shrink-0 w-12 text-right">dlm {tu}</span>
          {:else}
            <span class="shrink-0 w-12"></span>
          {/if}
        </div>
      {/each}
    </div>
    <!-- Desktop: centered grid -->
    <div class="hidden sm:grid grid-cols-3 lg:grid-cols-6 gap-2">
      {#each PRAYER_KEYS as key, i}
        {@const timeStr = today[key as keyof SolatDay] as string}
        {@const display = PRAYER_DISPLAY[key]}
        {@const isNext = isNextPrayer(key)}
        {@const isCurrent = isCurrentPrayer(key)}
        {@const tu = timeUntil(key)}
        <div
          class="flex flex-col items-center justify-center p-2.5 sm:p-3 border-4 transition-all duration-100 text-center animate-[fadeSlideUp_0.2s_ease-out_both]
                 {isCurrent && !isNext
                   ? 'border-ink bg-accent-green/10 shadow-[6px_6px_0px_0px_#0D0D0D]'
                   : isNext
                     ? 'border-accent-blue bg-accent-blue/10 shadow-[6px_6px_0px_0px_#0D0D0D]'
                     : 'border-ink bg-white hover:bg-canvas shadow-[4px_4px_0px_0px_#0D0D0D] hover:shadow-[6px_6px_0px_0px_#0D0D0D]'}"
          style="animation-delay: {i * 0.04}s"
        >
          <span class="text-lg mb-0.5">{display.emoji}</span>
          <span class="font-black text-[10px] uppercase tracking-wider">{display.label}</span>
          <span class="font-mono font-black text-lg tabular-nums mt-0.5">{timeStr || '--:--'}</span>
          {#if isCurrent}
            <span class="mt-1 text-[8px] font-black uppercase bg-accent-green text-white px-1.5 py-0.5 border-2 border-ink shadow-[2px_2px_0px_0px_#0D0D0D]">SEKARANG</span>
          {:else if isNext}
            <span class="mt-1 text-[8px] font-black uppercase bg-accent-blue text-white px-1.5 py-0.5 border-2 border-ink shadow-[2px_2px_0px_0px_#0D0D0D]">SETERUSNYA</span>
          {:else if tu}
            <span class="mt-1 text-[9px] font-bold text-ink/40">dlm {tu}</span>
          {/if}
        </div>
      {/each}
    </div>
    <!-- Imsak info -->
    {#if today?.imsak}
      <div class="text-[10px] font-bold text-ink/40 px-1">
        <span>Imsak: {today.imsak}</span>
      </div>
    {/if}
  {/if}

  <!-- === DAILY REMINDER === -->
  {#if dailyReminder}
    <div class="px-4 py-2.5 border-2 border-ink/20 bg-accent-yellow/10 animate-[fadeSlideUp_0.3s_ease-out_0.2s_both]">
      <p class="text-[10px] font-black uppercase tracking-wider text-ink/40 mb-0.5">Peringatan Hari Ini</p>
      <p class="text-sm font-bold italic leading-snug">{dailyReminder}</p>
    </div>
  {/if}

  <!-- === NOTIFICATION SETTINGS PANEL === -->
  {#if showNotifPanel}
    <div class="card-hero bg-white flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <p class="text-xs font-black uppercase tracking-wider">Tetapan Pemberitahuan</p>
        <button onclick={() => (showNotifPanel = false)} class="text-sm font-black text-ink/40 hover:text-ink">✕</button>
      </div>

      {#if notifPermission === 'default'}
        <p class="text-xs font-bold text-ink/60">Benarkan pemberitahuan pelayar untuk amaran waktu solat.</p>
        <button onclick={requestNotifPermission} class="btn-brutal-sm text-xs bg-accent-blue text-white border-ink">Benarkan Pemberitahuan</button>
      {:else if notifPermission === 'denied'}
        <p class="text-xs font-bold text-accent-pink">Pemberitahuan pelayar telah disekat. Sila benarkan dalam tetapan pelayar.</p>
      {:else}
        <!-- Master toggle -->
        <div class="flex items-center justify-between">
          <span class="text-xs font-black uppercase tracking-wider">Pemberitahuan Utama</span>
          <button
            onclick={() => { notifPrefs = { ...notifPrefs, enabled: !notifPrefs.enabled }; saveNotifPrefs(); }}
            class="w-12 h-6 border-2 border-ink transition-colors duration-75 relative {notifPrefs.enabled ? 'bg-accent-green' : 'bg-white'}"
            role="switch" aria-checked={notifPrefs.enabled} aria-label="Toggle notifications"
          ><span class="absolute top-0.5 w-4 h-4 bg-white border-2 border-ink transition-transform duration-75 {notifPrefs.enabled ? 'left-6' : 'left-0.5'}"></span></button>
        </div>

        <!-- Notification types -->
        <div class="grid grid-cols-3 gap-2">
          <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" bind:checked={notifPrefs.browser} onchange={saveNotifPrefs} class="w-4 h-4 accent-accent-blue" /><span class="text-[10px] font-bold">Pelayar</span></label>
          <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" bind:checked={notifPrefs.sound} onchange={saveNotifPrefs} class="w-4 h-4 accent-accent-blue" /><span class="text-[10px] font-bold">Bunyi</span></label>
          <label class="flex items-center gap-2 cursor-pointer"><input type="checkbox" bind:checked={notifPrefs.visual} onchange={saveNotifPrefs} class="w-4 h-4 accent-accent-blue" /><span class="text-[10px] font-bold">Visual</span></label>
        </div>

        <!-- Sound type -->
        <div>
          <p class="text-[10px] font-black uppercase tracking-wider text-ink/40 mb-1">Jenis Bunyi</p>
          <div class="flex gap-2">
            {#each [{k:'chime',l:'Chime'},{k:'bell',l:'Bell'},{k:'adhan',l:'Adhan'}] as snd}
              <button
                onclick={() => { notifPrefs = { ...notifPrefs, soundType: snd.k as NotifPrefs['soundType'] }; saveNotifPrefs(); }}
                class="px-3 py-1 border-2 text-[10px] font-black uppercase tracking-wider transition-all {notifPrefs.soundType === snd.k ? 'border-ink bg-accent-blue text-white' : 'border-ink/30 bg-white hover:border-ink'}"
              >{snd.l}</button>
            {/each}
          </div>
        </div>

        <!-- Volume -->
        <div>
          <div class="flex items-center justify-between mb-1">
            <p class="text-[10px] font-black uppercase tracking-wider text-ink/40">Volume</p>
            <span class="text-[10px] font-bold text-ink/40">{notifPrefs.volume}%</span>
          </div>
          <input type="range" min="0" max="100" step="5" bind:value={notifPrefs.volume} oninput={saveNotifPrefs} class="w-full accent-accent-blue" />
        </div>

        <!-- Per-prayer toggles -->
        <div class="border-t border-ink/20 pt-3">
          <p class="text-[10px] font-black uppercase tracking-wider text-ink/40 mb-2">Solat Tertentu</p>
          <div class="flex flex-wrap gap-2">
            {#each TRACKER_PRAYERS as prayer}
              <button
                onclick={() => toggleNotifPrayer(prayer.key)}
                class="px-2 py-1 border-2 text-[10px] font-black uppercase tracking-wider transition-all duration-75
                       {notifPrefs.perPrayer[prayer.key] ? 'border-ink bg-accent-blue text-white' : 'border-ink/30 bg-white text-ink/50'}"
              >{prayer.label}</button>
            {/each}
          </div>
        </div>

        <!-- Test button -->
        <button onclick={testNotification} class="btn-brutal-sm text-xs bg-accent-yellow border-ink w-full">🔔 Uji Pemberitahuan</button>
      {/if}
    </div>
  {/if}

  <!-- === PRAYER TRACKER === -->
  <div class="border-t-4 border-ink pt-4 mt-1 animate-[fadeSlideUp_0.3s_ease-out_0.25s_both]">
    <div class="flex items-center justify-between mb-2">
      <p class="text-[10px] font-black uppercase tracking-wider text-ink/40">Tracker Hari Ini</p>
      <div class="flex items-center gap-2">
        <span class="font-black text-lg tabular-nums">{completedCount}<span class="text-ink/30 text-xs">/5</span></span>
        {#if streak > 0}
          <span class="badge-brutal bg-accent-green text-white text-[10px]">{streak}🔥</span>
        {/if}
      </div>
    </div>
    <div class="h-3 border-4 border-ink bg-white overflow-hidden mb-2">
      <div class="h-full transition-all duration-300 {completedCount === 5 ? 'bg-accent-green' : 'bg-accent-blue'}" style="width: {(completedCount / 5) * 100}%"></div>
    </div>
    <div class="grid grid-cols-5 gap-1.5">
      {#each TRACKER_PRAYERS as prayer}
        {@const checked = todayRecord[prayer.key as keyof DayRecord]}
        <button
          onclick={() => toggleTracker(prayer.key)}
          class="flex flex-col items-center justify-center gap-1 p-1.5 sm:p-2.5 border-4 transition-all duration-75 min-h-[3.5rem]
                 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none
                 {checked ? `${prayer.color} text-white border-ink shadow-[4px_4px_0px_0px_#0D0D0D]` : 'bg-white text-ink border-ink/30 hover:border-ink shadow-[2px_2px_0px_0px_#0D0D0D] hover:shadow-[4px_4px_0px_0px_#0D0D0D]'}"
          aria-label="Toggle {prayer.label}" aria-pressed={checked}
        >
          {#if checked}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><path d="M20 6L9 17l-5-5"/></svg>
          {:else}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="opacity-30"><circle cx="12" cy="12" r="10"/></svg>
          {/if}
          <span class="text-[8px] sm:text-[9px] font-black uppercase tracking-wider leading-none">{prayer.label}</span>
        </button>
      {/each}
    </div>
  </div>
</div>
{/if}

<style>
  @keyframes slideIn {
    from { transform: translateY(-100%); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
</style>
