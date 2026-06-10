<script lang="ts">
  import { onMount } from 'svelte';
  import { SURAHS } from '../../lib/quran/surahs';
  import { JUZ_DATA } from '../../lib/quran/constants';
  import { getLastRead, getBookmarks } from '../../lib/quran/bookmarks';
  import type { LastRead, Bookmark } from '../../lib/quran/bookmarks';

  let search = $state('');
  let filter = $state<'all' | 'Meccan' | 'Medinan'>('all');
  let lastRead = $state<LastRead | null>(null);
  let bookmarks = $state<Bookmark[]>([]);
  let showJuz = $state(false);

  onMount(() => {
    lastRead = getLastRead();
    bookmarks = getBookmarks().slice(0, 5);
  });

  const filtered = $derived(
    SURAHS.filter((s) => {
      if (filter !== 'all' && s.revelationType !== filter) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        s.englishName.toLowerCase().includes(q) ||
        s.englishMeaning.toLowerCase().includes(q) ||
        String(s.number).includes(q) ||
        s.name.includes(q)
      );
    })
  );
</script>

<div class="flex flex-col gap-6">
  <!-- Search + Filter -->
  <div class="flex flex-col sm:flex-row gap-3">
    <div class="flex-1">
      <input
        type="text"
        bind:value={search}
        placeholder="Search surahs..."
        class="input-brutal w-full text-sm"
      />
    </div>
    <div class="flex border-4 border-ink shrink-0">
      <button
        onclick={() => (filter = 'all')}
        class="px-3 py-2 text-xs font-black uppercase tracking-wider transition-colors duration-75
               {filter === 'all' ? 'bg-ink text-white' : 'bg-white text-ink hover:bg-canvas'}"
      >All</button>
      <button
        onclick={() => (filter = 'Meccan')}
        class="px-3 py-2 text-xs font-black uppercase tracking-wider border-l-4 border-ink transition-colors duration-75
               {filter === 'Meccan' ? 'bg-accent-yellow text-ink' : 'bg-white text-ink hover:bg-canvas'}"
      >Makkah</button>
      <button
        onclick={() => (filter = 'Medinan')}
        class="px-3 py-2 text-xs font-black uppercase tracking-wider border-l-4 border-ink transition-colors duration-75
               {filter === 'Medinan' ? 'bg-accent-blue text-white' : 'bg-white text-ink hover:bg-canvas'}"
      >Madinah</button>
    </div>
  </div>

  <!-- Last Read Banner -->
  {#if lastRead}
    <a
      href={`/quran/${lastRead.surah}`}
      class="card-brutal-sm flex items-center gap-3 bg-accent-green/10 hover:bg-accent-green/20 transition-colors duration-75
             active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
    >
      <div class="w-10 h-10 bg-accent-green text-white flex items-center justify-center shrink-0">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-[10px] font-black uppercase tracking-wider text-accent-green">Continue Reading</p>
        <p class="font-black text-sm truncate">{lastRead.surahName} — Ayah {lastRead.ayah}</p>
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="shrink-0 text-ink/40">
        <path d="M9 18l6-6-6-6"/>
      </svg>
    </a>
  {/if}

  <!-- Juz Toggle -->
  <div class="flex items-center gap-3">
    <button
      onclick={() => (showJuz = !showJuz)}
      class="btn-brutal-sm text-[10px] {showJuz ? 'bg-accent-yellow border-ink' : ''}"
    >{showJuz ? '✓ Browse by Juz' : 'Browse by Juz'}</button>
    {#if bookmarks.length > 0}
      <span class="text-[10px] font-bold text-ink/40">{bookmarks.length} bookmark{bookmarks.length !== 1 ? 's' : ''}</span>
    {/if}
  </div>

  <!-- Juz Grid -->
  {#if showJuz}
    <div class="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-10 gap-2">
      {#each JUZ_DATA as j}
        <a
          href={`/quran/${j.startSurah}`}
          class="card-brutal-sm text-center p-2 hover:bg-accent-yellow/20 transition-colors duration-75
                 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
        >
          <p class="font-black text-lg">{j.juz}</p>
          <p class="text-[9px] font-bold text-ink/40 uppercase">Juz</p>
        </a>
      {/each}
    </div>
  {/if}

  <!-- Surah Grid -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
    {#each filtered as surah (surah.number)}
      <a
        href={`/quran/${surah.number}`}
        class="card-brutal-sm flex items-center gap-3 hover:bg-accent-yellow/20 transition-colors duration-75 group
               active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
      >
        <!-- Number badge -->
        <div class="w-10 h-10 bg-ink text-white flex items-center justify-center font-black text-sm shrink-0">
          {surah.number}
        </div>

        <!-- Surah info -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-2">
            <span class="font-black text-sm truncate">{surah.englishName}</span>
            <span class="arabic-text text-lg leading-none shrink-0" dir="rtl" style="line-height: 1.5;">{surah.name}</span>
          </div>
          <div class="flex items-center gap-2 mt-0.5">
            <span class="text-xs text-ink/50 font-bold">{surah.englishMeaning}</span>
            <span class="text-xs text-ink/30">·</span>
            <span class="text-xs text-ink/50 font-bold">{surah.versesCount} ayat</span>
            <span class="text-xs text-ink/30">·</span>
            <span class="text-xs font-bold px-1.5 py-0 border border-ink/30
                         {surah.revelationType === 'Meccan' ? 'bg-accent-yellow/30' : 'bg-accent-blue/10'}">
              {surah.revelationType === 'Meccan' ? 'Makkah' : 'Madinah'}
            </span>
          </div>
        </div>
      </a>
    {:else}
      <div class="col-span-full text-center py-8">
        <p class="font-bold text-ink/40 text-sm">No surahs found for "{search}"</p>
      </div>
    {/each}
  </div>
</div>
