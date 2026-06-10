<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { SolatDay, SolatResponse } from '../../lib/solat/types';
  import { PRAYER_NAMES, PRAYER_KEYS } from '../../lib/solat/types';
  import { getNextPrayer, formatCountdown } from '../../lib/solat/countdown';
  import { cachePrayerTimes, getCachedPrayerTimes, getTodayPrayers } from '../../lib/solat/storage';
  import { loadSettings } from '../../lib/solat/settings';
  import { getTodayHijri } from '../../lib/solat/hijriEngine';

  let zone = $state('SGR01');
  let zoneName = $state('');
  let today = $state<SolatDay | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let countdown = $state('');
  let nextPrayerName = $state('');
  let hijriDateStr = $state('');
  let gregDateStr = $state('');
  let countdownInterval: ReturnType<typeof setInterval> | null = null;

  const PRAYER_DISPLAY: Record<string, string> = {
    fajr: 'Subuh',
    syuruk: 'Syuruk',
    dhuhr: 'Zohor',
    asr: 'Asar',
    maghrib: 'Maghrib',
    isha: 'Isyak',
  };

  let nextPrayerKey = $derived.by(() => {
    if (!today) return '';
    const next = getNextPrayer(today);
    return PRAYER_KEYS[PRAYER_NAMES.indexOf(next.name as typeof PRAYER_NAMES[number])] ?? '';
  });

  onMount(() => {
    const settings = loadSettings();
    zone = settings.zone;

    // Format dates
    const now = new Date();
    const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];
    gregDateStr = `${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
    try {
      const hijri = getTodayHijri();
      hijriDateStr = `${hijri.day} ${hijri.monthName} ${hijri.year} AH`;
    } catch {
      hijriDateStr = '';
    }

    // Try cache first
    const cached = getCachedPrayerTimes();
    if (cached && cached.zone === zone) {
      const tp = getTodayPrayers(cached.data);
      if (tp) {
        today = tp;
        loading = false;
        updateCountdown();
      }
    }

    // Fetch fresh
    fetchPrayers();
    countdownInterval = setInterval(updateCountdown, 1000);
  });

  onDestroy(() => {
    if (countdownInterval) clearInterval(countdownInterval);
  });

  async function fetchPrayers() {
    try {
      const res = await fetch(`/api/solat/${zone}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: SolatResponse = await res.json();
      cachePrayerTimes(zone, data);
      const tp = getTodayPrayers(data);
      if (tp) {
        today = tp;
        updateCountdown();
      }
    } catch (err) {
      if (!today) error = 'Gagal memuatkan waktu solat';
    } finally {
      loading = false;
    }
  }

  function updateCountdown() {
    if (!today) return;
    const next = getNextPrayer(today);
    nextPrayerName = next.name;
    const remaining = next.time.getTime() - Date.now();
    countdown = formatCountdown(remaining);
  }
</script>

<div class="flex flex-col gap-3">
  {#if today}
    <!-- Compact countdown banner -->
    <div class="flex items-center justify-between">
      <div>
        <p class="text-xs font-bold uppercase tracking-wider text-ink/60">Solat Seterusnya</p>
        <p class="font-black text-xl">{nextPrayerName}</p>
        <p class="text-xs font-bold text-ink/50">{gregDateStr} · {hijriDateStr}</p>
      </div>
      <div class="text-right">
        <p class="font-mono font-black text-2xl tabular-nums">{countdown}</p>
        <a
          href="/solat"
          class="text-xs font-bold text-accent-blue underline underline-offset-2 hover:no-underline"
        >
          {zone} →
        </a>
      </div>
    </div>

    <!-- Compact 2-column prayer grid -->
    <div class="grid grid-cols-2 gap-1.5">
      {#each PRAYER_KEYS as key}
        {@const timeStr = today[key as keyof SolatDay] as string}
        {@const isNext = key === nextPrayerKey}
        <div
          class="flex items-center justify-between px-3 py-2 border-2 border-ink
                 transition-all duration-75
                 {isNext
                   ? 'bg-accent-yellow shadow-[3px_3px_0px_0px_#0D0D0D] font-black'
                   : 'bg-white'}"
        >
          <span class="font-bold text-xs uppercase tracking-wider">
            {PRAYER_DISPLAY[key]}
          </span>
          <span class="font-mono font-black text-sm tabular-nums">
            {timeStr || '--:--'}
          </span>
        </div>
      {/each}
    </div>
  {:else if loading}
    <div class="text-center py-6">
      <div class="font-black text-ink/40 uppercase tracking-wider animate-pulse text-sm">
        Loading...
      </div>
    </div>
  {:else if error}
    <div class="text-center py-4">
      <p class="text-sm font-bold text-accent-pink">{error}</p>
      <a href="/solat" class="text-xs font-bold text-accent-blue underline mt-2 inline-block">
        Buka Waktu Solat →
      </a>
    </div>
  {/if}
</div>
