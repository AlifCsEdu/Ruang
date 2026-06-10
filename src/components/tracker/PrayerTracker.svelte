<script lang="ts">
  import { onMount } from 'svelte';

  interface DayRecord {
    fajr: boolean;
    dhuhr: boolean;
    asr: boolean;
    maghrib: boolean;
    isha: boolean;
  }

  type TrackerData = Record<string, DayRecord>;

  const PRAYERS = [
    { key: 'fajr', label: 'Subuh', shortLabel: 'Sub', color: 'bg-accent-blue', textColor: 'text-accent-blue', borderColor: 'border-accent-blue' },
    { key: 'dhuhr', label: 'Zohor', shortLabel: 'Zoh', color: 'bg-accent-yellow', textColor: 'text-accent-yellow', borderColor: 'border-accent-yellow' },
    { key: 'asr', label: 'Asar', shortLabel: 'Asr', color: 'bg-accent-pink', textColor: 'text-accent-pink', borderColor: 'border-accent-pink' },
    { key: 'maghrib', label: 'Maghrib', shortLabel: 'Mag', color: 'bg-accent-green', textColor: 'text-accent-green', borderColor: 'border-accent-green' },
    { key: 'isha', label: 'Isyak', shortLabel: 'Isy', color: 'bg-indigo-500', textColor: 'text-indigo-500', borderColor: 'border-indigo-500' },
  ] as const;

  const STORAGE_KEY = 'ruang_prayer_tracker';
  const DAYS_TO_SHOW = 28;

  let trackerData = $state<TrackerData>({});

  function todayStr(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  function formatDateStr(d: Date): string {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  // Today's record
  let todayRecord = $derived.by(() => {
    const rec = trackerData[todayStr()];
    return rec ?? { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false };
  });

  let todayDone = $derived(
    PRAYERS.filter((p) => todayRecord[p.key as keyof DayRecord]).length
  );

  // Last 7 days for stats
  let days = $derived.by(() => {
    const result: { date: string; dayNum: number; dayName: string; month: string; isFri: boolean }[] = [];
    const today = new Date();
    for (let i = DAYS_TO_SHOW - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      result.push({
        date: formatDateStr(d),
        dayNum: d.getDate(),
        dayName: d.toLocaleDateString('en-MY', { weekday: 'short' }),
        month: d.toLocaleDateString('en-MY', { month: 'short' }),
        isFri: d.getDay() === 5,
      });
    }
    return result;
  });

  // Current streak
  let streak = $derived.by(() => {
    let count = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const ds = formatDateStr(d);
      const record = trackerData[ds];
      if (record && record.fajr && record.dhuhr && record.asr && record.maghrib && record.isha) {
        count++;
      } else if (i > 0) {
        break;
      }
    }
    return count;
  });

  // Weekly completion rate
  let weeklyRate = $derived.by(() => {
    const last7 = days.slice(-7);
    let total = 0;
    let checked = 0;
    for (const day of last7) {
      const record = trackerData[day.date];
      for (const prayer of PRAYERS) {
        total++;
        if (record?.[prayer.key as keyof DayRecord]) checked++;
      }
    }
    return total > 0 ? Math.round((checked / total) * 100) : 0;
  });

  // Per-prayer weekly stats
  let prayerStats = $derived.by(() => {
    const last7 = days.slice(-7);
    return PRAYERS.map((p) => {
      let done = 0;
      for (const day of last7) {
        if (trackerData[day.date]?.[p.key as keyof DayRecord]) done++;
      }
      return { ...p, done, total: 7, pct: Math.round((done / 7) * 100) };
    });
  });

  onMount(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) trackerData = JSON.parse(raw);
    } catch {}

    window.addEventListener('prayer-tracker-sync', () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) trackerData = JSON.parse(raw);
      } catch {}
    });
  });

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trackerData));
    } catch {}
  }

  function togglePrayer(date: string, prayer: string) {
    const record = trackerData[date] ?? { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false };
    trackerData = {
      ...trackerData,
      [date]: { ...record, [prayer]: !record[prayer as keyof DayRecord] },
    };
    save();
    window.dispatchEvent(new CustomEvent('prayer-tracker-sync'));
  }

  function isChecked(date: string, prayer: string): boolean {
    return trackerData[date]?.[prayer as keyof DayRecord] ?? false;
  }

  function isToday(date: string): boolean {
    return date === todayStr();
  }

  const todayDisplay = new Date().toLocaleDateString('en-MY', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
</script>

<div class="flex flex-col gap-5">
  <!-- === TODAY: Large tap targets === -->
  <div class="card-brutal bg-white">
    <div class="flex items-center justify-between mb-4 border-b-4 border-ink pb-3">
      <div>
        <p class="text-[10px] font-black uppercase tracking-wider text-ink/40">Today</p>
        <p class="font-black text-sm uppercase">{todayDisplay}</p>
      </div>
      <div class="text-right">
        <p class="font-black text-2xl tabular-nums">{todayDone}<span class="text-ink/30 text-lg">/5</span></p>
        <p class="text-[10px] font-bold text-ink/40 uppercase">Complete</p>
      </div>
    </div>

    <!-- Large prayer toggle buttons -->
    <div class="grid grid-cols-5 gap-2">
      {#each PRAYERS as prayer}
        {@const checked = todayRecord[prayer.key as keyof DayRecord]}
        <button
          onclick={() => togglePrayer(todayStr(), prayer.key)}
          class="flex flex-col items-center justify-center gap-1.5 p-3 border-4 transition-all duration-75 min-h-[5rem]
                 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none
                 {checked
                   ? `${prayer.color} text-white border-ink shadow-[4px_4px_0px_0px_#0D0D0D]`
                   : 'bg-white text-ink border-ink/30 hover:border-ink shadow-[2px_2px_0px_0px_#0D0D0D] hover:shadow-[4px_4px_0px_0px_#0D0D0D]'}"
          aria-label="Toggle {prayer.label}"
          aria-pressed={checked}
        >
          {#if checked}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          {:else}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="opacity-30">
              <circle cx="12" cy="12" r="10"/>
            </svg>
          {/if}
          <span class="text-[10px] font-black uppercase tracking-wider leading-none">{prayer.label}</span>
        </button>
      {/each}
    </div>
  </div>

  <!-- === STATS BANNER === -->
  <div class="grid grid-cols-2 gap-2">
    <div class="card-brutal-sm text-center bg-accent-green/10">
      <p class="font-black text-3xl tabular-nums">{streak}</p>
      <p class="text-[10px] font-bold text-ink/60 uppercase tracking-wider">Day Streak</p>
    </div>
    <div class="card-brutal-sm text-center bg-accent-blue/10">
      <p class="font-black text-3xl tabular-nums">{weeklyRate}<span class="text-lg">%</span></p>
      <p class="text-[10px] font-bold text-ink/60 uppercase tracking-wider">This Week</p>
    </div>
  </div>

  <!-- === PER-PRAYER WEEKLY STATS === -->
  <div class="card-brutal-sm">
    <p class="text-[10px] font-black uppercase tracking-wider text-ink/40 mb-3 border-b-2 border-ink/10 pb-2">Weekly Breakdown</p>
    <div class="flex flex-col gap-2">
      {#each prayerStats as stat}
        <div class="flex items-center gap-2">
          <span class="text-xs font-black uppercase tracking-wider w-16 shrink-0">{stat.label}</span>
          <div class="flex-1 h-5 bg-ink/5 border border-ink/20 overflow-hidden">
            <div
              class="h-full {stat.color} transition-all duration-300"
              style="width: {stat.pct}%"
            ></div>
          </div>
          <span class="text-xs font-black tabular-nums w-10 text-right">{stat.done}/7</span>
        </div>
      {/each}
    </div>
  </div>

  <!-- === 4-WEEK HISTORY GRID === -->
  <div class="card-brutal-sm">
    <p class="text-[10px] font-black uppercase tracking-wider text-ink/40 mb-3 border-b-2 border-ink/10 pb-2">Last 4 Weeks</p>
    <div class="overflow-x-auto -mx-1 px-1">
      <div class="grid grid-cols-7 gap-1 min-w-[340px]">
        <!-- Header row -->
        {#each ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as day}
          <div class="text-center text-[9px] font-black uppercase tracking-wider text-ink/40 py-1">
            {day}
          </div>
        {/each}

        <!-- Calendar days -->
        {#each days as day}
          <div
            class="border-2 p-1 flex flex-col gap-0.5
                   {isToday(day.date) ? 'border-ink bg-accent-yellow/20 shadow-[2px_2px_0px_0px_#0D0D0D]' : 'border-ink/20 bg-white'}
                   {day.isFri && !isToday(day.date) ? 'border-accent-yellow/40' : ''}"
          >
            <div class="text-center text-[10px] font-black mb-0.5">{day.dayNum}</div>
            {#each PRAYERS as prayer}
              <button
                onclick={() => togglePrayer(day.date, prayer.key)}
                class="w-full h-5 border transition-all duration-75 cursor-pointer
                       {isChecked(day.date, prayer.key)
                         ? `${prayer.color} border-ink`
                         : 'bg-white border-ink/20 hover:bg-ink/10 hover:border-ink/40'}"
                aria-label="{prayer.label} on day {day.dayNum}"
              ></button>
            {/each}
          </div>
        {/each}
      </div>
    </div>
  </div>

  <!-- === LEGEND === -->
  <div class="flex flex-wrap gap-3 justify-center">
    {#each PRAYERS as prayer}
      <span class="flex items-center gap-1.5 text-[10px] font-bold">
        <span class="w-3 h-3 {prayer.color} border border-ink"></span>
        {prayer.label}
      </span>
    {/each}
  </div>
</div>
