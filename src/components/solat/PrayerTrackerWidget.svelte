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

  const STORAGE_KEY = 'ruang_prayer_tracker';

  const PRAYERS = [
    { key: 'fajr', label: 'Subuh', color: 'bg-accent-blue' },
    { key: 'dhuhr', label: 'Zohor', color: 'bg-accent-yellow' },
    { key: 'asr', label: 'Asar', color: 'bg-accent-pink' },
    { key: 'maghrib', label: 'Maghrib', color: 'bg-accent-green' },
    { key: 'isha', label: 'Isyak', color: 'bg-accent-blue/70' },
  ] as const;

  let trackerData = $state<TrackerData>({});

  let todayKey = $derived.by(() => {
    const now = new Date(
      new Date().toLocaleString('en-US', { timeZone: 'Asia/Kuala_Lumpur' })
    );
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });

  let todayRecord = $derived<DayRecord>(
    trackerData[todayKey] ?? { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false }
  );

  let completedCount = $derived(
    PRAYERS.filter((p) => todayRecord[p.key as keyof DayRecord]).length
  );

  // Calculate streak
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
      } else if (i > 0) {
        break;
      }
    }
    return count;
  });

  onMount(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) trackerData = JSON.parse(raw);
    } catch {}

    // Listen for cross-component sync
    window.addEventListener('prayer-tracker-sync', () => {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) trackerData = JSON.parse(raw);
      } catch {}
    });
  });

  function toggle(prayer: string) {
    const record = trackerData[todayKey] ?? { fajr: false, dhuhr: false, asr: false, maghrib: false, isha: false };
    const updated = {
      ...trackerData,
      [todayKey]: {
        ...record,
        [prayer]: !record[prayer as keyof DayRecord],
      },
    };
    trackerData = updated;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}

    // Dispatch sync event for other tracker components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('prayer-tracker-sync'));
    }
  }
</script>

<div class="flex flex-col gap-2">
  <div class="flex items-center justify-between mb-1">
    <h3 class="font-black text-sm uppercase tracking-wider">Tracker Hari Ini</h3>
    <div class="flex items-center gap-2">
      <span class="text-xs font-bold text-ink/60">{completedCount}/5</span>
      {#if streak > 0}
        <span class="badge-brutal bg-accent-green text-white text-[10px]">{streak}🔥</span>
      {/if}
    </div>
  </div>

  <!-- Progress bar -->
  <div class="h-3 border-2 border-ink bg-white overflow-hidden">
    <div
      class="h-full transition-all duration-200 {completedCount === 5 ? 'bg-accent-green' : 'bg-accent-blue'}"
      style="width: {(completedCount / 5) * 100}%"
    ></div>
  </div>

  <!-- Prayer checklist -->
  <div class="flex flex-col gap-1">
    {#each PRAYERS as prayer}
      <button
        onclick={() => toggle(prayer.key)}
        class="flex items-center gap-3 px-3 py-2.5 border-2 border-ink cursor-pointer
               transition-all duration-75
               {todayRecord[prayer.key as keyof DayRecord]
                 ? 'bg-accent-green/20'
                 : 'bg-white hover:bg-canvas'}"
      >
        <div
          class="w-6 h-6 border-2 border-ink shrink-0 flex items-center justify-center
                 transition-all duration-75
                 {todayRecord[prayer.key as keyof DayRecord]
                   ? 'bg-accent-green'
                   : 'bg-white'}"
        >
          {#if todayRecord[prayer.key as keyof DayRecord]}
            <span class="text-white font-black text-sm">✓</span>
          {/if}
        </div>
        <span class="font-bold text-sm">{prayer.label}</span>
        <div class="ml-auto w-3 h-3 {prayer.color} border border-ink shrink-0"></div>
      </button>
    {/each}
  </div>
</div>
