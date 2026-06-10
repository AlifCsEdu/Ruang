<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { SolatDay, SolatResponse } from '../../lib/solat/types';
  import { PRAYER_NAMES, PRAYER_KEYS } from '../../lib/solat/types';
  import { getNextPrayer, formatCountdown } from '../../lib/solat/countdown';
  import { cachePrayerTimes, getCachedPrayerTimes, getTodayPrayers } from '../../lib/solat/storage';
  import { loadSettings, setZone as saveZone, type SolatSettings } from '../../lib/solat/settings';
  import { applyAllAdjustments } from '../../lib/solat/offsets';
  import ZoneSelector from './ZoneSelector.svelte';
  let zone = $state('SGR01');
  let today = $state<SolatDay | null>(null);
  let rawToday = $state<SolatDay | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let countdown = $state('');
  let nextPrayerName = $state('');
  let countdownInterval: ReturnType<typeof setInterval> | null = null;
  let settings = $state<SolatSettings | null>(null);

  interface Props {
    showZoneSelector?: boolean;
  }
  let { showZoneSelector = true }: Props = $props();

  // Display labels for prayer keys
  const PRAYER_DISPLAY: Record<string, { label: string; emoji: string }> = {
    fajr: { label: 'Subuh', emoji: '🌅' },
    syuruk: { label: 'Syuruk', emoji: '☀️' },
    dhuhr: { label: 'Zohor', emoji: '🌤️' },
    asr: { label: 'Asar', emoji: '⛅' },
    maghrib: { label: 'Maghrib', emoji: '🌇' },
    isha: { label: 'Isyak', emoji: '🌙' },
  };

  let nextPrayerKey = $derived.by(() => {
    if (!today) return '';
    const next = getNextPrayer(today);
    return PRAYER_KEYS[PRAYER_NAMES.indexOf(next.name as typeof PRAYER_NAMES[number])] ?? '';
  });

  onMount(() => {
    // Load zone from settings store
    settings = loadSettings();
    zone = settings.zone;

    // Listen for settings changes from other components
    window.addEventListener('solat-settings-changed', ((e: CustomEvent<SolatSettings>) => {
      settings = e.detail;
      if (e.detail.zone !== zone) {
        zone = e.detail.zone;
        rawToday = null;
        fetchPrayerTimes();
      } else if (rawToday && settings) {
        today = applyAllAdjustments(rawToday, settings.prayerOffsets, settings.madhab);
      }
    }) as EventListener);

    // Try cache first
    loadFromCache();

    // Then fetch fresh
    fetchPrayerTimes();

    // Start countdown timer
    countdownInterval = setInterval(updateCountdown, 1000);
  });

  onDestroy(() => {
    if (countdownInterval) clearInterval(countdownInterval);
  });

  function loadFromCache() {
    const cached = getCachedPrayerTimes();
    if (cached && cached.zone === zone) {
      const todayPrayers = getTodayPrayers(cached.data);
      if (todayPrayers) {
        rawToday = todayPrayers;
        if (settings) {
          today = applyAllAdjustments(todayPrayers, settings.prayerOffsets, settings.madhab);
        } else {
          today = todayPrayers;
        }
        loading = false;
        updateCountdown();
      }
    }
  }

  async function fetchPrayerTimes() {
    loading = true;
    error = null;

    try {
      const res = await fetch(`/api/solat/${zone}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data: SolatResponse = await res.json();

      // Cache for offline
      cachePrayerTimes(zone, data);

      // Extract today's prayers
      const todayPrayers = getTodayPrayers(data);
      if (todayPrayers) {
        rawToday = todayPrayers;
        if (settings) {
          today = applyAllAdjustments(todayPrayers, settings.prayerOffsets, settings.madhab);
        } else {
          today = todayPrayers;
        }
        updateCountdown();
      } else {
        error = 'No prayer times for today';
      }
    } catch (err) {
      // If we already have cached data, keep showing it
      if (!today) {
        error = 'Failed to load prayer times. Check your connection.';
      }
    } finally {
      loading = false;
    }
  }

  function updateCountdown() {
    if (!today) return;
    const next = getNextPrayer(today);
    nextPrayerName = next.name;

    // Recalculate remaining time
    const remaining = next.time.getTime() - Date.now();
    countdown = formatCountdown(remaining);
  }

  function handleZoneChange(newZone: string) {
    zone = newZone;
    saveZone(newZone); // saves to settings store + recentZones
    rawToday = null;
    today = null;
    fetchPrayerTimes();
  }

  function isNextPrayer(key: string): boolean {
    return key === nextPrayerKey;
  }

  // Format "2026-06-11" → "11 Jun 2026"
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];
  function formatDateDisplay(dateStr: string): string {
    const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return dateStr;
    return `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}`;
  }
</script>

<div class="flex flex-col gap-4">
  <!-- Zone Selector -->
  {#if showZoneSelector}
  <div>
    <label class="text-xs font-black uppercase tracking-wider text-ink/60 block mb-1">Zon</label>
    <ZoneSelector currentZone={zone} onZoneChange={handleZoneChange} />
  </div>
  {/if}

  <!-- Date + Next Prayer Banner -->
  {#if today}
    <div class="card-brutal-sm bg-accent-blue text-white">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-xs font-bold uppercase tracking-wider opacity-80">Solat Seterusnya</p>
          <p class="font-black text-2xl">{nextPrayerName}</p>
        </div>
        <div class="text-right">
          <p class="font-mono font-black text-3xl tabular-nums">{countdown}</p>
          <p class="text-xs font-bold opacity-80">{formatDateDisplay(today.date)}</p>
        </div>
      </div>
    </div>
  {/if}

  <!-- Prayer Times List -->
  {#if loading && !today}
    <div class="flex items-center justify-center py-8">
      <div class="font-black text-ink/40 uppercase tracking-wider animate-pulse">
        Loading prayer times...
      </div>
    </div>
  {:else if error && !today}
    <div class="card-brutal-sm bg-accent-pink text-white">
      <p class="font-bold text-sm">{error}</p>
      <button
        onclick={fetchPrayerTimes}
        class="btn-brutal-sm mt-2 bg-white text-ink text-xs"
      >
        Cuba Lagi
      </button>
    </div>
  {:else if today}
    <div class="flex flex-col gap-2">
      {#each PRAYER_KEYS as key, i}
        {@const timeStr = today[key as keyof SolatDay] as string}
        {@const display = PRAYER_DISPLAY[key]}
        {@const isNext = isNextPrayer(key)}
        <div
          class="flex items-center justify-between px-4 py-3 border-2 border-ink
                 transition-all duration-75
                 {isNext
                   ? 'bg-accent-yellow shadow-[4px_4px_0px_0px_#0D0D0D] font-black'
                   : 'bg-white hover:bg-canvas'}"
        >
          <div class="flex items-center gap-3">
            <span class="text-lg">{display.emoji}</span>
            <span class="font-bold text-sm uppercase tracking-wider">
              {display.label}
            </span>
            {#if isNext}
              <span class="badge-brutal bg-accent-blue text-white text-[10px]">
                SETERUSNYA
              </span>
            {/if}
          </div>
          <span class="font-mono font-black text-lg tabular-nums">
            {timeStr || '--:--'}
          </span>
        </div>
      {/each}
    </div>
  {/if}

  <!-- Imsak info -->
  {#if today?.imsak}
    <div class="text-center text-xs text-ink/40 font-bold mt-auto">
      Imsak: {today.imsak}
    </div>
  {/if}
</div>
