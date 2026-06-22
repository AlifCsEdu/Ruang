<script lang="ts">
  import type { SolatDay, SunnahTimes } from '../../lib/solat/types';
  import { PRAYER_KEYS } from '../../lib/solat/types';
  import { parsePrayerTime } from '../../lib/solat/countdown';

  interface Props {
    today: SolatDay | null;
    loading: boolean;
    error: string | null;
    nextPrayerKey: string;
    currentPrayerKey: string;
    zone: string;
    sunnah?: SunnahTimes | null;
    showSunnah?: boolean;
  }

  let { today, loading, error, nextPrayerKey, currentPrayerKey, zone, sunnah = null, showSunnah = false }: Props = $props();

  const PRAYER_DISPLAY: Record<string, { label: string; emoji: string }> = {
    fajr: { label: 'Subuh', emoji: '🌅' },
    syuruk: { label: 'Syuruk', emoji: '☀️' },
    dhuhr: { label: 'Zohor', emoji: '🌤️' },
    asr: { label: 'Asar', emoji: '⛅' },
    maghrib: { label: 'Maghrib', emoji: '🌇' },
    isha: { label: 'Isyak', emoji: '🌙' },
  };

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
</script>

{#if loading && !today}
  <div class="flex items-center justify-center py-12" role="status">
    <div class="font-black text-ink/40 uppercase tracking-wider animate-pulse">Loading prayer times...</div>
  </div>
{:else if error && !today}
  <div class="card-brutal-sm bg-accent-pink text-white">
    <p class="font-bold text-sm">{error}</p>
    <button
      onclick={() => dispatchEvent(new CustomEvent('solat-retry'))}
      class="btn-brutal-sm mt-2 bg-white text-ink text-xs"
    >Cuba Lagi</button>
  </div>
{:else if today}
  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2" role="list" aria-label="Prayer times">
    {#each PRAYER_KEYS as key}
      {@const timeStr = today[key as keyof SolatDay] as string}
      {@const display = PRAYER_DISPLAY[key]}
      {@const isNext = key === nextPrayerKey}
      {@const isCurrent = key === currentPrayerKey}
      {@const tu = timeUntil(key)}
      <div
        class="flex flex-col items-center justify-center p-3 border-2 transition-all duration-100 text-center
               {isCurrent && !isNext
                 ? 'border-accent-green bg-accent-green/10 shadow-[4px_4px_0px_0px_#0D0D0D]'
                 : isNext
                   ? 'border-ink bg-accent-yellow shadow-[4px_4px_0px_0px_#0D0D0D]'
                   : 'border-ink bg-white hover:bg-canvas'}"
        role="listitem"
        aria-label="{display.label} at {timeStr || 'unknown'}{isCurrent ? ', currently active' : ''}{isNext ? ', next prayer' : ''}"
      >
        <span class="text-lg mb-0.5" aria-hidden="true">{display.emoji}</span>
        <span class="font-black text-[10px] uppercase tracking-wider">{display.label}</span>
        <span class="font-mono font-black text-lg tabular-nums mt-1">{timeStr || '--:--'}</span>
        {#if isCurrent}
          <span class="mt-1 text-[8px] font-black uppercase bg-accent-green text-white px-1.5 py-0.5 border border-ink">SEKARANG</span>
        {:else if isNext}
          <span class="mt-1 text-[8px] font-black uppercase bg-accent-blue text-white px-1.5 py-0.5 border border-ink">SETERUSNYA</span>
        {:else if tu}
          <span class="mt-1 text-[8px] font-bold text-ink/40">dlm {tu}</span>
        {/if}
      </div>
    {/each}

    <!-- Sunnah time chips (inline between relevant prayers) -->
    {#if showSunnah && sunnah}
      <div class="col-span-2 sm:col-span-3 lg:col-span-6 flex flex-wrap gap-1.5 mt-1">
        {#if sunnah.duhaStart}
          <span class="text-[9px] font-bold px-2 py-0.5 border border-accent-green/50 bg-accent-green/10 text-accent-green" title="Waktu Dhuha bermula">
            🌤️ Dhuha: {sunnah.duhaStart} – {sunnah.duhaEnd}
          </span>
        {/if}
        {#if sunnah.tahajjud}
          <span class="text-[9px] font-bold px-2 py-0.5 border border-accent-blue/50 bg-accent-blue/10 text-accent-blue" title="Tahajjud (sepertiga akhir malam)">
            🌙 Tahajjud: {sunnah.tahajjud}
          </span>
        {/if}
        {#if sunnah.firstThird}
          <span class="text-[9px] font-bold px-2 py-0.5 border border-accent-yellow/50 bg-accent-yellow/10 text-ink/60" title="Sepertiga malam pertama">
            ✨ Sepertiga Malam: {sunnah.firstThird}
          </span>
        {/if}
        {#if sunnah.midnight}
          <span class="text-[9px] font-bold px-2 py-0.5 border border-ink/20 bg-ink/5 text-ink/50" title="Tengah malam Islam">
            🕐 Tengah Malam: {sunnah.midnight}
          </span>
        {/if}
      </div>
    {/if}
  </div>
  <!-- Imsak + Zone -->
  <div class="flex items-center justify-between text-[10px] font-bold text-ink/40 px-1">
    {#if today?.imsak}<span>Imsak: {today.imsak}</span>{:else}<span></span>{/if}
    <span>Zon: {zone}</span>
  </div>
{/if}
