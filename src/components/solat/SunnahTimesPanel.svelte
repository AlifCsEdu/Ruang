<script lang="ts">
  import { onMount } from 'svelte';
  import type { SolatDay, SolatResponse, SunnahTimes, SunnahToggles } from '../../lib/solat/types';
  import { getCachedPrayerTimes, getTodayPrayers, getTomorrowPrayers } from '../../lib/solat/storage';
  import { loadSettings, updateSetting } from '../../lib/solat/settings';
  import { calculateSunnahTimes } from '../../lib/solat/sunnah';

  let sunnah = $state<SunnahTimes | null>(null);
  let toggles = $state<SunnahToggles | null>(null);

  type SunnahItem = {
    key: keyof SunnahToggles;
    labelMs: string;
    time?: string;
    range?: string;
    type: 'recommended' | 'forbidden' | 'info';
  };

  let items = $derived.by((): SunnahItem[] => {
    if (!sunnah || !toggles) return [];
    return [
      { key: 'suhoor', labelMs: 'Akhir Sahur', time: sunnah.suhoor, type: 'recommended' },
      { key: 'sunrise', labelMs: 'Syuruk (Larangan)', time: sunnah.sunrise, type: 'forbidden' },
      { key: 'duha', labelMs: 'Waktu Dhuha', range: sunnah.duhaStart ? `${sunnah.duhaStart} – ${sunnah.duhaEnd}` : undefined, type: 'recommended' },
      { key: 'zawal', labelMs: 'Zawal (Larangan)', time: sunnah.zawalStart ? `${sunnah.zawalStart} – ${sunnah.sunrise || '12:00'}` : undefined, type: 'forbidden' },
      { key: 'evening', labelMs: 'Petang (Larangan)', time: sunnah.eveningForbidden, type: 'forbidden' },
      { key: 'firstThird', labelMs: 'Sepertiga Malam Pertama', time: sunnah.firstThird, type: 'recommended' },
      { key: 'midnight', labelMs: 'Tengah Malam Islam', time: sunnah.midnight, type: 'recommended' },
      { key: 'tahajjud', labelMs: 'Tahajjud (Sepertiga Akhir)', time: sunnah.tahajjud, type: 'recommended' },
      { key: 'jumuah', labelMs: 'Jumaat', time: sunnah.isJumuah ? 'Ya' : undefined, type: 'info' },
    ];
  });

  onMount(async () => {
    const settings = loadSettings();
    toggles = settings.sunnahToggles;

    // Try cache first
    const cached = getCachedPrayerTimes();
    if (cached) {
      const today = getTodayPrayers(cached.data);
      const tomorrow = getTomorrowPrayers(cached.data);
      if (today) {
        sunnah = calculateSunnahTimes(today, tomorrow, {
          sunnahToggles: settings.sunnahToggles,
          suhoorOffset: settings.suhoorOffset,
          midnightMode: settings.midnightMode,
          asrEndTime: settings.asrEndTime,
          madhab: settings.madhab,
        });
        return;
      }
    }

    // Fallback: fetch
    try {
      const res = await fetch(`/api/solat/${settings.zone}`);
      if (res.ok) {
        const data: SolatResponse = await res.json();
        const today = getTodayPrayers(data);
        const tomorrow = getTomorrowPrayers(data);
        if (today) {
          sunnah = calculateSunnahTimes(today, tomorrow, {
            sunnahToggles: settings.sunnahToggles,
            suhoorOffset: settings.suhoorOffset,
            midnightMode: settings.midnightMode,
            asrEndTime: settings.asrEndTime,
            madhab: settings.madhab,
          });
        }
      }
    } catch {}

    // Listen for settings changes
    window.addEventListener('solat-settings-changed', ((e: CustomEvent) => {
      const s = e.detail;
      toggles = s.sunnahToggles;
    }) as EventListener);
  });

  function handleToggle(key: keyof SunnahToggles, value: boolean) {
    if (!toggles) return;
    toggles = { ...toggles, [key]: value };
    updateSetting('sunnahToggles', toggles);
  }
</script>

<div class="flex flex-col gap-2">
  <div class="flex items-center justify-between mb-1">
    <h3 class="font-black text-sm uppercase tracking-wider">Waktu Sunnah</h3>
    {#if sunnah?.isJumuah && toggles?.jumuah}
      <span class="badge-brutal bg-accent-green text-white text-[10px]">JUMAAT</span>
    {/if}
  </div>

  {#if !sunnah || !toggles}
    <p class="text-xs text-ink/40 font-bold text-center py-4">
      Memuatkan waktu sunnah...
    </p>
  {:else}
    {#each items as item}
      <div
        class="flex items-center justify-between px-3 py-2 border-2 border-ink transition-all duration-75
               {item.type === 'recommended' && toggles[item.key] ? 'bg-accent-green/10' : ''}
               {item.type === 'forbidden' && toggles[item.key] ? 'bg-accent-pink/10' : ''}
               {item.type === 'info' && toggles[item.key] ? 'bg-accent-blue/10' : ''}
               {!toggles[item.key] ? 'opacity-40' : ''}"
      >
        <div class="flex items-center gap-2 flex-1 min-w-0">
          <button
            onclick={() => handleToggle(item.key, !toggles[item.key])}
            class="w-5 h-5 border-2 border-ink shrink-0 cursor-pointer flex items-center justify-center transition-all duration-75
                   {toggles[item.key]
                     ? item.type === 'forbidden' ? 'bg-accent-pink' : item.type === 'info' ? 'bg-accent-blue' : 'bg-accent-green'
                     : 'bg-white hover:bg-ink/10'}"
            aria-label="Toggle {item.labelMs}"
          >
            {#if toggles[item.key]}
              <span class="text-white text-xs font-black">✓</span>
            {/if}
          </button>
          <div class="min-w-0">
            <span class="text-xs font-bold block truncate">{item.labelMs}</span>
            {#if item.type === 'forbidden'}
              <span class="text-[10px] font-bold text-accent-pink">LARANGAN</span>
            {/if}
          </div>
        </div>
        <span class="font-mono font-black text-xs tabular-nums shrink-0 ml-2">
          {item.range ?? item.time ?? '—'}
        </span>
      </div>
    {/each}
  {/if}
</div>
