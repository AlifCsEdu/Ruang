<script lang="ts">
  import { onMount } from 'svelte';
  import { get, set } from 'idb-keyval';
  import { BeadsIcon } from '../icons/index';

  const PRESETS = [33, 99, 100, 500];

  let count = $state(0);
  let target = $state(33);
  let totalCount = $state(0); // Lifetime total
  let history: { date: string; count: number }[] = $state([]);
  let showHistory = $state(false);

  let progress = $derived(Math.min((count / target) * 100, 100));
  let isComplete = $derived(count >= target);

  onMount(async () => {
    // Load persisted state
    const saved = await get('ruang_tasbih');
    if (saved) {
      const data = saved as { count: number; target: number; totalCount: number; history: { date: string; count: number }[] };
      count = data.count ?? 0;
      target = data.target ?? 33;
      totalCount = data.totalCount ?? 0;
      history = data.history ?? [];
    }
  });

  async function save() {
    await set('ruang_tasbih', { count, target, totalCount, history });
  }

  function increment() {
    count++;
    totalCount++;

    // Haptic feedback
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      if (isComplete) {
        navigator.vibrate([50, 30, 50]); // Completion pattern
      } else {
        navigator.vibrate(10); // Single tap
      }
    }

    // Save every 5 taps to reduce I/O
    if (count % 5 === 0 || isComplete) {
      save();
    }
  }

  function decrement() {
    if (count > 0) {
      count--;
      save();
    }
  }

  function resetCount() {
    if (count > 0) {
      // Record to history before resetting
      const today = new Date().toISOString().split('T')[0];
      const existingIdx = history.findIndex((h) => h.date === today);
      if (existingIdx >= 0) {
        history[existingIdx].count += count;
      } else {
        history = [...history, { date: today, count }];
      }
      // Keep last 30 days
      if (history.length > 30) {
        history = history.slice(-30);
      }
    }
    count = 0;
    save();
  }

  function setTarget(val: number) {
    target = val;
    count = 0;
    save();
  }
</script>

<div class="flex flex-col gap-4">
  <!-- Target selector -->
  <div class="flex items-center gap-2 flex-wrap">
    <span class="text-xs font-black uppercase tracking-wider text-ink/60 shrink-0">Target:</span>
    {#each PRESETS as preset}
      <button
        onclick={() => setTarget(preset)}
        class="btn-brutal-sm text-xs
               {target === preset ? 'bg-accent-blue text-white' : 'bg-white hover:bg-canvas'}"
      >
        {preset}
      </button>
    {/each}
  </div>

  <!-- Progress bar -->
  <div class="h-4 border-2 border-ink bg-white overflow-hidden">
    <div
      class="h-full transition-all duration-150 {isComplete ? 'bg-accent-green' : 'bg-accent-yellow'}"
      style="width: {progress}%"
    ></div>
  </div>

  <!-- Counter display -->
  <div class="text-center py-4">
    <div class="font-black text-6xl tabular-nums tracking-tight">
      {count}
    </div>
    <div class="text-sm font-bold text-ink/50 mt-1">
      / {target}
    </div>
    {#if isComplete}
      <div class="badge-brutal bg-accent-green text-white text-xs mt-3 inline-block">
        TARGET ACHIEVED!
      </div>
    {/if}
  </div>

  <!-- Main tap button -->
  <button
    onclick={increment}
    class="w-full aspect-square max-h-[180px] border-4 border-ink bg-accent-yellow
           shadow-[8px_8px_0px_0px_#0D0D0D]
           active:translate-x-2 active:translate-y-2 active:shadow-none
           transition-all duration-75
           flex flex-col items-center justify-center gap-2
           cursor-pointer select-none"
    aria-label="Count tasbih"
  >
    <span class="text-5xl">{@html BeadsIcon(56)}</span>
    <span class="font-black text-lg uppercase tracking-wider">Tap</span>
  </button>

  <!-- Controls -->
  <div class="flex items-center gap-2">
    <button
      onclick={decrement}
      class="btn-brutal-sm flex-1 text-sm"
      disabled={count <= 0}
    >
      - Undo
    </button>
    <button
      onclick={resetCount}
      class="btn-brutal-sm flex-1 text-sm bg-accent-pink text-white hover:bg-accent-pink/80"
    >
      Reset
    </button>
    <button
      onclick={() => { showHistory = !showHistory; }}
      class="btn-brutal-sm text-sm"
    >
      {showHistory ? 'Hide' : 'History'}
    </button>
  </div>

  <!-- Lifetime stats -->
  <div class="text-center text-xs text-ink/40 font-bold">
    Lifetime total: {totalCount.toLocaleString()}
  </div>

  <!-- History -->
  {#if showHistory && history.length > 0}
    <div class="border-2 border-ink bg-white p-3 overflow-auto max-h-48">
      <p class="text-xs font-black uppercase tracking-wider mb-2">Recent History</p>
      {#each [...history].reverse() as entry}
        <div class="flex items-center justify-between text-xs py-1 border-b border-ink/10">
          <span class="font-bold">{entry.date}</span>
          <span class="font-mono">{entry.count}x</span>
        </div>
      {/each}
    </div>
  {/if}
</div>
