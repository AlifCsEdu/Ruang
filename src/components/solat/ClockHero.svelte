<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  interface Props {
    use24h?: boolean;
    showSeconds?: boolean;
    hijriDateStr?: string;
    hijriDateAr?: string;
    isRamadan?: boolean;
  }

  let {
    use24h = $bindable(true),
    showSeconds = $bindable(true),
    hijriDateStr = '',
    hijriDateAr = '',
    isRamadan = false,
  }: Props = $props();

  let currentTime = $state('');
  let currentDate = $state('');
  let clockInterval: ReturnType<typeof setInterval> | null = null;

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogo', 'Sep', 'Okt', 'Nov', 'Dis'];
  const WEEKDAY_AR: Record<string, string> = {
    Monday: 'الإثنين', Tuesday: 'الثلاثاء', Wednesday: 'الأربعاء',
    Thursday: 'الخميس', Friday: 'الجمعة', Saturday: 'السبت', Sunday: 'الأحد',
  };

  function updateClock() {
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' }));
    const h = now.getHours();
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    if (use24h) {
      currentTime = showSeconds ? `${String(h).padStart(2, '0')}:${m}:${s}` : `${String(h).padStart(2, '0')}:${m}`;
    } else {
      const h12 = h % 12 || 12;
      const ampm = h < 12 ? 'AM' : 'PM';
      currentTime = showSeconds ? `${h12}:${m}:${s} ${ampm}` : `${h12}:${m} ${ampm}`;
    }
    const dayName = now.toLocaleDateString('en-MY', { weekday: 'long' });
    const dayAr = WEEKDAY_AR[dayName] ?? '';
    currentDate = `${dayName} · ${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()} · ${dayAr}`;
  }

  onMount(() => {
    updateClock();
    clockInterval = setInterval(updateClock, 1000);
  });

  onDestroy(() => {
    if (clockInterval) clearInterval(clockInterval);
  });
</script>

<div class="text-center py-4" role="timer" aria-label="Live clock">
  <!-- Live Clock -->
  <div class="flex items-center justify-center gap-3 mb-2">
    <button
      onclick={() => { use24h = !use24h; }}
      class="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border-2 border-ink/20 hover:border-ink transition-colors {use24h ? 'bg-accent-yellow' : 'bg-white'}"
      title="Toggle 24h/12h format"
      aria-label="Toggle 24h/12h format, currently {use24h ? '24 hour' : '12 hour'}"
    >{use24h ? '24H' : '12H'}</button>
    <p class="font-mono font-black text-5xl sm:text-6xl lg:text-7xl tabular-nums tracking-tight leading-none select-none" aria-live="polite">
      {currentTime || '--:--'}
    </p>
    <button
      onclick={() => { showSeconds = !showSeconds; }}
      class="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border-2 border-ink/20 hover:border-ink transition-colors {showSeconds ? 'bg-accent-yellow' : 'bg-white'}"
      title="Toggle seconds"
      aria-label="Toggle seconds display, currently {showSeconds ? 'showing' : 'hidden'}"
    >{showSeconds ? 'SEC' : 'MIN'}</button>
  </div>
  <!-- Date row -->
  <p class="text-sm font-bold text-ink/60">{currentDate || 'Loading...'}</p>
  <!-- Hijri date -->
  {#if hijriDateStr}
    <div class="mt-1 inline-flex items-center gap-2 px-3 py-1 border-2 border-ink bg-white">
      <span class="text-xs font-black text-accent-blue" dir="rtl" lang="ar">{hijriDateAr}</span>
      <span class="text-ink/20">|</span>
      <span class="text-xs font-bold text-ink/60">{hijriDateStr}</span>
    </div>
  {/if}
  {#if isRamadan}
    <p class="mt-2 text-xs font-black text-accent-pink animate-pulse">🌙 Ramadan Mubarak! Semoga ibadat diterima.</p>
  {/if}
</div>
