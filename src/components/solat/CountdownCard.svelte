<script lang="ts">
  import type { SolatDay } from '../../lib/solat/types';

  interface Props {
    today: SolatDay | null;
    nextPrayerName: string;
    nextPrayerKey: string;
    currentPrayerKey: string;
    countdown: string;
    countdownProgress: number;
    elapsedTime: string;
    qiblaBearing: number | null;
    zone: string;
    hijriDateStr: string;
    shareStatus: string;
  }

  let {
    today,
    nextPrayerName,
    nextPrayerKey,
    currentPrayerKey,
    countdown,
    countdownProgress,
    elapsedTime,
    qiblaBearing,
    zone,
    hijriDateStr,
    shareStatus,
  }: Props = $props();

  const PRAYER_DISPLAY: Record<string, { label: string }> = {
    fajr: { label: 'Subuh' },
    syuruk: { label: 'Syuruk' },
    dhuhr: { label: 'Zohor' },
    asr: { label: 'Asar' },
    maghrib: { label: 'Maghrib' },
    isha: { label: 'Isyak' },
  };

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];

  function formatDateDisplay(dateStr: string): string {
    const m = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!m) return dateStr;
    return `${Number(m[3])} ${MONTHS[Number(m[2]) - 1]} ${m[1]}`;
  }
</script>

{#if today}
  <div class="card-brutal-sm bg-accent-blue text-white relative overflow-hidden" role="region" aria-label="Countdown to next prayer">
    <!-- Progress bar background -->
    <div class="absolute inset-0 bg-white/10" style="width: {countdownProgress}%"></div>
    <div class="relative flex items-center justify-between">
      <div>
        <p class="text-[10px] font-black uppercase tracking-wider opacity-70">Solat Seterusnya</p>
        <p class="font-black text-3xl" aria-live="polite">{nextPrayerName}</p>
        {#if currentPrayerKey && currentPrayerKey !== nextPrayerKey}
          <p class="text-[10px] font-bold opacity-60 mt-0.5">Solat semasa: {PRAYER_DISPLAY[currentPrayerKey]?.label} ({elapsedTime})</p>
        {/if}
      </div>
      <div class="text-right">
        <p class="font-mono font-black text-4xl sm:text-5xl tabular-nums" aria-live="polite">{countdown}</p>
        <p class="text-[10px] font-bold opacity-70">{formatDateDisplay(today.date)}</p>
      </div>
    </div>
    <!-- Action row -->
    <div class="relative flex items-center gap-2 mt-3 pt-3 border-t border-white/20">
      <button
        onclick={() => dispatchEvent(new CustomEvent('solat-share'))}
        class="text-[10px] font-black uppercase tracking-wider px-3 py-1 border-2 border-white/30 hover:border-white hover:bg-white/10 transition-colors"
        aria-label="Share prayer times"
      >
        Kongsi {#if shareStatus}<span class="text-accent-yellow">✓ {shareStatus}</span>{/if}
      </button>
      <button
        onclick={() => dispatchEvent(new CustomEvent('solat-toggle-notif'))}
        class="text-[10px] font-black uppercase tracking-wider px-3 py-1 border-2 border-white/30 hover:border-white hover:bg-white/10 transition-colors"
        aria-label="Toggle notifications"
      >
        🔔 Pemberitahuan
      </button>
      {#if qiblaBearing !== null}
        <span class="ml-auto text-[10px] font-bold opacity-60 flex items-center gap-1" title="Qibla bearing from Malaysia" aria-label="Qibla direction {Math.round(qiblaBearing)} degrees">
          <span style="display:inline-block; transform: rotate({qiblaBearing}deg);">↑</span>
          Qibla {Math.round(qiblaBearing)}°
        </span>
      {/if}
    </div>
  </div>
{/if}
