<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { SolatDay, SolatResponse } from '../../lib/solat/types';
  import { PRAYER_NAMES, PRAYER_KEYS } from '../../lib/solat/types';
  import { getNextPrayer, formatCountdown } from '../../lib/solat/countdown';
  import { cachePrayerTimes, getCachedPrayerTimes, getTodayPrayers } from '../../lib/solat/storage';
  import { loadSettings } from '../../lib/solat/settings';

  interface Props {
    hijriDateStr: string;
    hijriDateAr: string;
  }
  let { hijriDateStr, hijriDateAr }: Props = $props();

  let zone = $state('SGR01');
  let today = $state<SolatDay | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let countdown = $state('');
  let nextPrayerName = $state('');
  let currentTime = $state('');
  let greeting = $state('');
  let gregDateStr = $state('');
  let countdownInterval: ReturnType<typeof setInterval> | null = null;
  let clockInterval: ReturnType<typeof setInterval> | null = null;

  // Tracker
  interface DayRecord { fajr: boolean; dhuhr: boolean; asr: boolean; maghrib: boolean; isha: boolean; }
  type TrackerData = Record<string, DayRecord>;
  const TRACKER_KEY = 'ruang_prayer_tracker';
  let trackerData = $state<TrackerData>({});

  const PRAYER_DISPLAY: Record<string, { label: string; emoji: string }> = {
    fajr: { label: 'Subuh', emoji: '🌅' },
    syuruk: { label: 'Syuruk', emoji: '☀️' },
    dhuhr: { label: 'Zohor', emoji: '🌤️' },
    asr: { label: 'Asar', emoji: '⛅' },
    maghrib: { label: 'Maghrib', emoji: '🌇' },
    isha: { label: 'Isyak', emoji: '🌙' },
  };

  const TRACKER_PRAYERS = [
    { key: 'fajr', label: 'Subuh', color: 'bg-accent-blue' },
    { key: 'dhuhr', label: 'Zohor', color: 'bg-accent-yellow' },
    { key: 'asr', label: 'Asar', color: 'bg-accent-pink' },
    { key: 'maghrib', label: 'Maghrib', color: 'bg-accent-green' },
    { key: 'isha', label: 'Isyak', color: 'bg-indigo-500' },
  ] as const;

  let nextPrayerKey = $derived.by(() => {
    if (!today) return '';
    const next = getNextPrayer(today);
    return PRAYER_KEYS[PRAYER_NAMES.indexOf(next.name as typeof PRAYER_NAMES[number])] ?? '';
  });

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

  // Verse of the Day
  interface DailyVerse { key: string; ref: string; text: string; translation: string; chapter: number; verse: number; }
  let dailyVerse = $state<DailyVerse | null>(null);

  // Quick action duas (random daily dua)
  let dailyDuaIndex = $derived.by(() => {
    const day = new Date().getDate();
    return day % 15; // cycle through first 15 duas
  });

  onMount(() => {
    const settings = loadSettings();
    zone = settings.zone;

    // Load tracker
    try {
      const raw = localStorage.getItem(TRACKER_KEY);
      if (raw) trackerData = JSON.parse(raw);
    } catch { /* empty */ }

    window.addEventListener('prayer-tracker-sync', () => {
      try {
        const raw = localStorage.getItem(TRACKER_KEY);
        if (raw) trackerData = JSON.parse(raw);
      } catch { /* empty */ }
    });

    // Format dates
    const now = new Date();
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];
    gregDateStr = `${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;

    loadFromCache();
    fetchPrayers();
    fetchVerseOfDay();
    updateClock();
    countdownInterval = setInterval(updateCountdown, 1000);
    clockInterval = setInterval(updateClock, 1000);
  });

  onDestroy(() => {
    if (countdownInterval) clearInterval(countdownInterval);
    if (clockInterval) clearInterval(clockInterval);
  });

  function updateClock() {
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' }));
    currentTime = now.toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const hour = now.getHours();
    if (hour < 12) greeting = 'Selamat Pagi';
    else if (hour < 14) greeting = 'Selamat Tengahari';
    else if (hour < 18) greeting = 'Selamat Petang';
    else greeting = 'Selamat Malam';
  }

  function loadFromCache() {
    const cached = getCachedPrayerTimes();
    if (cached && cached.zone === zone) {
      const tp = getTodayPrayers(cached.data);
      if (tp) {
        today = tp;
        loading = false;
        updateCountdown();
      }
    }
  }

  async function fetchPrayers() {
    try {
      const res = await fetch(`/api/solat/${zone}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: SolatResponse = await res.json();
      cachePrayerTimes(zone, data);
      const tp = getTodayPrayers(data);
      if (tp) { today = tp; updateCountdown(); }
    } catch {
      if (!today) error = 'Gagal memuatkan';
    } finally { loading = false; }
  }

  function updateCountdown() {
    if (!today) return;
    const next = getNextPrayer(today);
    nextPrayerName = next.name;
    countdown = formatCountdown(next.time.getTime() - Date.now());
  }

  async function fetchVerseOfDay() {
    try {
      const res = await fetch('/api/quran/verse-of-day');
      if (res.ok) dailyVerse = await res.json();
    } catch { /* non-critical, silently fail */ }
  }

  function toggleTracker(prayer: string) {
    const key = todayStr();
    const record = trackerData[key] ?? { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false };
    const updated = { ...trackerData, [key]: { ...record, [prayer]: !record[prayer as keyof DayRecord] } };
    trackerData = updated;
    try { localStorage.setItem(TRACKER_KEY, JSON.stringify(updated)); } catch { /* empty */ }
    window.dispatchEvent(new CustomEvent('prayer-tracker-sync'));
  }
</script>

<div class="flex flex-col gap-6">
  <!-- ===== HERO GREETING ===== -->
  <div>
    <div class="flex items-end justify-between flex-wrap gap-2">
      <div>
        <p class="text-sm font-bold text-ink/40 uppercase tracking-wider">{greeting || '...'}</p>
        <h1 class="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-wider leading-tight">
          Assalamualaikum
        </h1>
      </div>
      <div class="text-right">
        <p class="font-mono font-black text-2xl sm:text-3xl tabular-nums tracking-tight">{currentTime || '--:--:--'}</p>
      </div>
    </div>
    <div class="mt-2 flex flex-wrap gap-x-4 gap-y-0.5">
      <p class="text-sm font-bold text-ink/40">{gregDateStr}</p>
      <p class="text-sm font-bold text-accent-blue" dir="rtl" lang="ar">{hijriDateAr}</p>
      <p class="text-sm font-bold text-ink/40">{hijriDateStr}</p>
    </div>
  </div>

  <!-- ===== COUNTDOWN HERO ===== -->
  {#if today}
    <div class="card-brutal bg-accent-blue text-white relative overflow-hidden">
      <div class="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
      <div class="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
      <div class="relative flex items-center justify-between flex-wrap gap-4">
        <div>
          <p class="text-xs font-bold uppercase tracking-wider opacity-70">Solat Seterusnya</p>
          <p class="font-black text-3xl sm:text-4xl mt-1">{nextPrayerName}</p>
          <a href="/solat" class="text-xs font-bold opacity-70 underline underline-offset-2 hover:opacity-100 mt-1 inline-block">
            {zone} →
          </a>
        </div>
        <div class="text-right">
          <p class="font-mono font-black text-4xl sm:text-5xl tabular-nums tracking-tight">{countdown}</p>
          <p class="text-xs font-bold opacity-60 mt-1">JJ : MM : SS</p>
        </div>
      </div>

      <!-- Mini prayer row -->
      <div class="grid grid-cols-3 sm:grid-cols-6 gap-1.5 mt-4 pt-4 border-t border-white/20">
        {#each PRAYER_KEYS as key}
          {@const timeStr = today[key as keyof SolatDay] as string}
          {@const isNext = key === nextPrayerKey}
          <div class="text-center px-1 py-1.5 transition-all
                     {isNext ? 'bg-white text-accent-blue' : 'bg-white/10'}">
            <p class="text-[9px] font-black uppercase tracking-wider leading-none">{PRAYER_DISPLAY[key]?.label}</p>
            <p class="font-mono font-black text-xs tabular-nums mt-0.5">{timeStr || '--:--'}</p>
          </div>
        {/each}
      </div>
    </div>
  {:else if loading}
    <div class="card-brutal bg-ink/5 animate-pulse">
      <div class="h-24 flex items-center justify-center">
        <span class="font-black text-ink/30 uppercase tracking-wider text-sm">Memuatkan waktu solat...</span>
      </div>
    </div>
  {:else if error}
    <div class="card-brutal-sm bg-accent-pink text-white">
      <p class="font-bold text-sm">{error}</p>
      <a href="/solat" class="text-xs font-bold underline mt-1 inline-block">Buka Waktu Solat →</a>
    </div>
  {/if}

  <!-- ===== PRAYER PROGRESS ===== -->
  <div class="card-brutal-sm">
    <div class="flex items-center justify-between mb-3">
      <div>
        <p class="text-[10px] font-black uppercase tracking-wider text-ink/40">Solat Hari Ini</p>
      </div>
      <div class="flex items-center gap-2">
        <span class="font-black text-xl tabular-nums">{completedCount}<span class="text-ink/30 text-sm">/5</span></span>
        {#if streak > 0}
          <span class="badge-brutal bg-accent-green text-white text-[10px]">{streak}🔥</span>
        {/if}
      </div>
    </div>
    <div class="h-3 border-2 border-ink bg-white overflow-hidden mb-3">
      <div
        class="h-full transition-all duration-300 {completedCount === 5 ? 'bg-accent-green' : 'bg-accent-blue'}"
        style="width: {(completedCount / 5) * 100}%"
      ></div>
    </div>
    <div class="grid grid-cols-5 gap-1.5">
      {#each TRACKER_PRAYERS as prayer}
        {@const checked = todayRecord[prayer.key as keyof DayRecord]}
        <button
          onclick={() => toggleTracker(prayer.key)}
          class="flex flex-col items-center justify-center gap-1 p-2 border-2 transition-all duration-75 min-h-[3rem]
                 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer
                 {checked
                   ? `${prayer.color} text-white border-ink shadow-[3px_3px_0px_0px_#0D0D0D]`
                   : 'bg-white text-ink/40 border-ink/20 hover:border-ink hover:text-ink'}"
          aria-label="Toggle {prayer.label}"
          aria-pressed={checked}
        >
          {#if checked}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><path d="M20 6L9 17l-5-5"/></svg>
          {:else}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="opacity-40"><circle cx="12" cy="12" r="10"/></svg>
          {/if}
          <span class="text-[8px] sm:text-[9px] font-black uppercase tracking-wider leading-none">{prayer.label}</span>
        </button>
      {/each}
    </div>
  </div>

  <!-- ===== QUICK ACTIONS ===== -->
  <div>
    <p class="text-[10px] font-black uppercase tracking-wider text-ink/40 mb-2">Aksi Pantas</p>
    <div class="grid grid-cols-3 gap-2">
      <a href="/tasbih" class="card-brutal-sm flex flex-col items-center gap-2 text-center group hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#0D0D0D] transition-all duration-75 bg-accent-blue/5">
        <span class="text-2xl">📿</span>
        <span class="text-[10px] font-black uppercase tracking-wider">Tasbih</span>
      </a>
      <a href="/duas" class="card-brutal-sm flex flex-col items-center gap-2 text-center group hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#0D0D0D] transition-all duration-75 bg-accent-pink/5">
        <span class="text-2xl">🤲</span>
        <span class="text-[10px] font-black uppercase tracking-wider">Dua Harian</span>
      </a>
      <a href="/solat" class="card-brutal-sm flex flex-col items-center gap-2 text-center group hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#0D0D0D] transition-all duration-75 bg-accent-green/5">
        <span class="text-2xl">🕌</span>
        <span class="text-[10px] font-black uppercase tracking-wider">Waktu Solat</span>
      </a>
    </div>
  </div>

  <!-- ===== VERSE OF THE DAY ===== -->
  {#if dailyVerse}
    <div class="card-brutal-sm bg-accent-green/5 border-accent-green">
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 shrink-0 bg-accent-green/20 border-2 border-ink flex items-center justify-center mt-0.5">
          <span class="text-lg">📖</span>
        </div>
        <div class="min-w-0 flex-1">
          <p class="text-[10px] font-black uppercase tracking-wider text-accent-green">Ayat Hari Ini</p>
          <p class="font-black text-sm mt-0.5">{dailyVerse.ref}</p>
          {#if dailyVerse.text}
            <p class="text-right font-bold text-base mt-2 leading-relaxed" dir="rtl" lang="ar">{dailyVerse.text}</p>
          {/if}
          {#if dailyVerse.translation}
            <p class="text-xs font-bold text-ink/60 mt-2 italic leading-relaxed">"{dailyVerse.translation}"</p>
          {/if}
          <a href="/quran/{dailyVerse.chapter}#verse-{dailyVerse.verse}" class="text-[10px] font-black uppercase tracking-wider text-accent-green underline underline-offset-2 hover:text-ink mt-2 inline-block">
            Surah {dailyVerse.chapter}:{dailyVerse.verse} →
          </a>
        </div>
      </div>
    </div>
  {/if}

  <!-- ===== FEATURE WIDGETS ===== -->
  <div>
    <p class="text-[10px] font-black uppercase tracking-wider text-ink/40 mb-2">Terokai</p>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <!-- Quran Widget -->
      <a href="/quran" class="card-brutal-sm group hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#0D0D0D] transition-all duration-75 bg-accent-green/5 flex items-start gap-4">
        <div class="w-12 h-12 shrink-0 bg-accent-green/20 border-2 border-ink flex items-center justify-center">
          <span class="text-xl">📖</span>
        </div>
        <div class="min-w-0">
          <p class="font-black text-sm uppercase tracking-wider">Al-Quran</p>
          <p class="text-xs font-bold text-ink/50 mt-0.5">Baca dengan terjemahan & audio. 114 surah, 30 juzuk.</p>
        </div>
      </a>

      <!-- Duas Widget -->
      <a href="/duas" class="card-brutal-sm group hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#0D0D0D] transition-all duration-75 bg-accent-pink/5 flex items-start gap-4">
        <div class="w-12 h-12 shrink-0 bg-accent-pink/20 border-2 border-ink flex items-center justify-center">
          <span class="text-xl">🤲</span>
        </div>
        <div class="min-w-0">
          <p class="font-black text-sm uppercase tracking-wider">Doa Pilihan</p>
          <p class="text-xs font-bold text-ink/50 mt-0.5">Himpunan doa harian dari Hisnul Muslim.</p>
        </div>
      </a>

      <!-- Hadith Widget -->
      <a href="/hadith" class="card-brutal-sm group hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#0D0D0D] transition-all duration-75 bg-accent-yellow/10 flex items-start gap-4">
        <div class="w-12 h-12 shrink-0 bg-accent-yellow/20 border-2 border-ink flex items-center justify-center">
          <span class="text-xl">📜</span>
        </div>
        <div class="min-w-0">
          <p class="font-black text-sm uppercase tracking-wider">Hadis</p>
          <p class="text-xs font-bold text-ink/50 mt-0.5">Tradisi & ajaran Nabi Muhammad ﷺ.</p>
        </div>
      </a>

      <!-- Tracker Widget -->
      <a href="/tracker" class="card-brutal-sm group hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#0D0D0D] transition-all duration-75 bg-accent-blue/5 flex items-start gap-4">
        <div class="w-12 h-12 shrink-0 bg-accent-blue/20 border-2 border-ink flex items-center justify-center">
          <span class="text-xl">✅</span>
        </div>
        <div class="min-w-0">
          <p class="font-black text-sm uppercase tracking-wider">Tracker</p>
          <p class="text-xs font-bold text-ink/50 mt-0.5">
            {#if streak > 0}
              Streak semasa: {streak} hari 🔥
            {:else}
              Jejak solat harian anda. Bina streak!
            {/if}
          </p>
        </div>
      </a>

      <!-- Hijri Calendar Widget -->
      <a href="/hijri" class="card-brutal-sm group hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#0D0D0D] transition-all duration-75 bg-accent-yellow/10 flex items-start gap-4">
        <div class="w-12 h-12 shrink-0 bg-accent-yellow/20 border-2 border-ink flex items-center justify-center">
          <span class="text-xl">📅</span>
        </div>
        <div class="min-w-0">
          <p class="font-black text-sm uppercase tracking-wider">Kalendar Hijri</p>
          <p class="text-xs font-bold text-ink/50 mt-0.5">Takwim Islam & tarikh-tarikh penting.</p>
        </div>
      </a>

      <!-- Tasbih Widget -->
      <a href="/tasbih" class="card-brutal-sm group hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#0D0D0D] transition-all duration-75 bg-indigo-50 flex items-start gap-4">
        <div class="w-12 h-12 shrink-0 bg-indigo-100 border-2 border-ink flex items-center justify-center">
          <span class="text-xl">📿</span>
        </div>
        <div class="min-w-0">
          <p class="font-black text-sm uppercase tracking-wider">Tasbih Digital</p>
          <p class="text-xs font-bold text-ink/50 mt-0.5">Pembentang zikir dengan getaran haptik.</p>
        </div>
      </a>
    </div>
  </div>
</div>
