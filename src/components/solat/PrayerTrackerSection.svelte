<script lang="ts">
  interface DayRecord {
    fajr: boolean;
    dhuhr: boolean;
    asr: boolean;
    maghrib: boolean;
    isha: boolean;
  }

  interface Props {
    todayRecord: DayRecord;
    completedCount: number;
    streak: number;
    weekStats: { day: string; count: number }[];
  }

  let { todayRecord, completedCount, streak, weekStats }: Props = $props();

  const TRACKER_PRAYERS = [
    { key: 'fajr', label: 'Subuh', color: 'bg-accent-blue', textColor: 'text-accent-blue' },
    { key: 'dhuhr', label: 'Zohor', color: 'bg-accent-yellow', textColor: 'text-accent-yellow' },
    { key: 'asr', label: 'Asar', color: 'bg-accent-pink', textColor: 'text-accent-pink' },
    { key: 'maghrib', label: 'Maghrib', color: 'bg-accent-green', textColor: 'text-accent-green' },
    { key: 'isha', label: 'Isyak', color: 'bg-indigo-500', textColor: 'text-indigo-500' },
  ] as const;

  function onToggle(key: string) {
    dispatchEvent(new CustomEvent('solat-tracker-toggle', { detail: { prayer: key } }));
  }
</script>

<div class="border-t-4 border-ink pt-5 mt-1" role="region" aria-label="Prayer tracker">
  <div class="flex items-center justify-between mb-3">
    <div>
      <p class="text-[10px] font-black uppercase tracking-wider text-ink/40">Tracker Hari Ini</p>
    </div>
    <div class="flex items-center gap-2">
      <span class="font-black text-lg tabular-nums">{completedCount}<span class="text-ink/30 text-sm">/5</span></span>
      {#if streak > 0}
        <span class="badge-brutal bg-accent-green text-white text-[10px]">{streak}🔥</span>
      {/if}
    </div>
  </div>
  <div class="h-3 border-2 border-ink bg-white overflow-hidden mb-3" role="progressbar" aria-valuenow={completedCount} aria-valuemin={0} aria-valuemax={5}>
    <div class="h-full transition-all duration-300 {completedCount === 5 ? 'bg-accent-green' : 'bg-accent-blue'}" style="width: {(completedCount / 5) * 100}%"></div>
  </div>
  <div class="grid grid-cols-5 gap-2">
    {#each TRACKER_PRAYERS as prayer}
      {@const checked = todayRecord[prayer.key as keyof DayRecord]}
      <button
        onclick={() => onToggle(prayer.key)}
        class="flex flex-col items-center justify-center gap-1.5 p-2 sm:p-3 border-4 transition-all duration-75 min-h-[4rem]
               active:translate-x-0.5 active:translate-y-0.5 active:shadow-none
               {checked ? `${prayer.color} text-white border-ink shadow-[4px_4px_0px_0px_#0D0D0D]` : 'bg-white text-ink border-ink/30 hover:border-ink shadow-[2px_2px_0px_0px_#0D0D0D] hover:shadow-[4px_4px_0px_0px_#0D0D0D]'}"
        aria-label="Toggle {prayer.label}"
        aria-pressed={checked}
      >
        {#if checked}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><path d="M20 6L9 17l-5-5"/></svg>
        {:else}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="opacity-30"><circle cx="12" cy="12" r="10"/></svg>
        {/if}
        <span class="text-[9px] sm:text-[10px] font-black uppercase tracking-wider leading-none">{prayer.label}</span>
      </button>
    {/each}
  </div>

  <!-- Weekly stats -->
  {#if weekStats.length > 0}
    <div class="border-t-2 border-ink/20 pt-4 mt-4">
      <p class="text-[10px] font-black uppercase tracking-wider text-ink/40 mb-2">Minggu Ini</p>
      <div class="flex items-end gap-1 h-16" role="img" aria-label="Weekly prayer completion stats">
        {#each weekStats as stat}
          <div class="flex-1 flex flex-col items-center gap-0.5">
            <div class="w-full bg-accent-blue/80 transition-all duration-300 min-h-[2px]" style="height: {(stat.count / 5) * 48}px"></div>
            <span class="text-[8px] font-black text-ink/50">{stat.count}/5</span>
            <span class="text-[8px] font-black text-ink/30">{stat.day}</span>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
