<script lang="ts">
  import { onMount } from 'svelte';
  import { SURAHS } from '../../lib/quran/surahs';
  import { JUZ_DATA } from '../../lib/quran/constants';
  import { getLastRead, getBookmarks, removeBookmark, updateBookmarkNote, clearAllBookmarks, addTagToBookmark, removeTagFromBookmark, getAllProgress } from '../../lib/quran/bookmarks';
  import type { LastRead, Bookmark, ReadingProgress } from '../../lib/quran/bookmarks';
  import BookmarksPanel from './BookmarksPanel.svelte';

  let search = $state('');
  let filter = $state<'all' | 'Meccan' | 'Medinan'>('all');
  let lastRead = $state<LastRead | null>(null);
  let bookmarks = $state<Bookmark[]>([]);
  let progressList = $state<ReadingProgress[]>([]);
  let showJuz = $state(false);
  let showBookmarks = $state(false);
  let viewMode = $state<'grid' | 'list'>('grid');

  const progressMap = $derived(new Map(progressList.map(p => [p.surah, p])));
  const completedCount = $derived(progressList.filter(p => p.percentage >= 100).length);

  onMount(() => {
    lastRead = getLastRead();
    bookmarks = getBookmarks();
    progressList = getAllProgress();
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

  function refreshBookmarks() {
    bookmarks = getBookmarks();
  }

  function handleDeleteBookmark(surah: number, ayah: number) {
    removeBookmark(surah, ayah);
    refreshBookmarks();
  }

  function handleUpdateNote(surah: number, ayah: number, note: string) {
    updateBookmarkNote(surah, ayah, note);
    refreshBookmarks();
  }

  function handleClearAll() {
    clearAllBookmarks();
    refreshBookmarks();
  }

  function handleAddTag(surah: number, ayah: number, tag: string) {
    addTagToBookmark(surah, ayah, tag);
    refreshBookmarks();
  }

  function handleRemoveTag(surah: number, ayah: number, tag: string) {
    removeTagFromBookmark(surah, ayah, tag);
    refreshBookmarks();
  }
</script>

<div class="flex flex-col gap-6">
  <!-- Search + Filter -->
  <div class="flex flex-col sm:flex-row gap-3">
    <div class="flex-1">
      <input
        type="text"
        bind:value={search}
        placeholder="Cari surah... (nama, nombor, makna)"
        class="input-brutal w-full text-sm"
      />
    </div>
    <div class="flex border-4 border-ink shrink-0">
      <button
        onclick={() => (filter = 'all')}
        class="px-3 py-2 text-xs font-black uppercase tracking-wider transition-colors duration-75
               {filter === 'all' ? 'bg-ink text-white' : 'bg-white text-ink hover:bg-canvas'}"
      >Semua</button>
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
      class="card-brutal flex items-center gap-4 bg-accent-green/10 hover:bg-accent-green/20 transition-colors duration-75
             active:translate-x-1 active:translate-y-1 active:shadow-none group"
    >
      <div class="w-14 h-14 bg-accent-green text-white flex items-center justify-center shrink-0 shadow-[4px_4px_0px_0px_#0D0D0D]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
        </svg>
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-[10px] font-black uppercase tracking-wider text-accent-green">Bacaan Terakhir</p>
        <p class="font-black text-lg truncate">{lastRead.surahName}</p>
        <p class="text-xs font-bold text-ink/50">Ayat {lastRead.ayah}</p>
      </div>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="shrink-0 text-ink/40 group-hover:text-ink transition-colors">
        <path d="M9 18l6-6-6-6"/>
      </svg>
    </a>
  {/if}

  <!-- Action buttons row -->
  <div class="flex items-center gap-2 flex-wrap">
    <button
      onclick={() => (showJuz = !showJuz)}
      class="chip-brutal {showJuz ? 'bg-accent-yellow' : 'bg-white'} transition-colors"
    >{showJuz ? '✓ Juz' : 'Juz 1-30'}</button>

    <button
      onclick={() => (showBookmarks = !showBookmarks)}
      class="chip-brutal {showBookmarks ? 'bg-accent-pink text-white' : 'bg-white'} transition-colors"
    >{showBookmarks ? '✓ Bookmarks' : `♥ ${bookmarks.length}`}</button>

    <span class="ml-auto flex items-center gap-1">
      <button
        onclick={() => (viewMode = 'grid')}
        class="w-8 h-8 border-2 border-ink flex items-center justify-center transition-colors {viewMode === 'grid' ? 'bg-ink text-white' : 'bg-white hover:bg-canvas'}"
        title="Grid view"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="8" height="8"/><rect x="13" y="3" width="8" height="8"/><rect x="3" y="13" width="8" height="8"/><rect x="13" y="13" width="8" height="8"/></svg>
      </button>
      <button
        onclick={() => (viewMode = 'list')}
        class="w-8 h-8 border-2 border-ink border-l-0 flex items-center justify-center transition-colors {viewMode === 'list' ? 'bg-ink text-white' : 'bg-white hover:bg-canvas'}"
        title="List view"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="4" width="18" height="3"/><rect x="3" y="10.5" width="18" height="3"/><rect x="3" y="17" width="18" height="3"/></svg>
      </button>
    </span>
  </div>

  <!-- Juz Grid -->
  {#if showJuz}
    <div class="animate-slide-up">
      <p class="text-[10px] font-black uppercase tracking-wider text-ink/40 mb-2">30 Juz Al-Quran</p>
      <div class="grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-10 gap-2">
        {#each JUZ_DATA as j}
          <a
            href={`/quran/${j.startSurah}`}
            class="card-brutal-sm text-center p-2.5 hover:bg-accent-yellow/20 transition-colors duration-75
                   active:translate-x-0.5 active:translate-y-0.5 active:shadow-none group"
          >
            <p class="font-black text-xl group-hover:text-accent-blue transition-colors">{j.juz}</p>
            <p class="text-[8px] font-bold text-ink/40 uppercase">Juz</p>
          </a>
        {/each}
      </div>
    </div>
  {/if}

  <!-- Bookmarks section -->
  {#if showBookmarks}
    <div class="animate-slide-up">
      <BookmarksPanel
        bookmarks={bookmarks}
        onDelete={handleDeleteBookmark}
        onUpdateNote={handleUpdateNote}
        onClearAll={handleClearAll}
        onAddTag={handleAddTag}
        onRemoveTag={handleRemoveTag}
      />
    </div>
  {/if}

  <!-- Surah Grid -->
  <div class={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3' : 'flex flex-col gap-1.5'}>
    {#each filtered as surah (surah.number)}
      <a
        href={`/quran/${surah.number}`}
        class="flex items-center gap-3 hover:bg-accent-yellow/20 transition-all duration-75 group
               active:translate-x-0.5 active:translate-y-0.5 active:shadow-none
               {viewMode === 'grid'
                 ? `card-brutal-sm ${surah.revelationType === 'Meccan' ? 'surah-card-meccan' : 'surah-card-medinan'}`
                 : 'border-2 border-ink bg-white px-3 py-2 shadow-[2px_2px_0px_0px_#0D0D0D]'}"
      >
        <!-- Number badge with revelation color -->
        <div class="w-10 h-10 flex items-center justify-center font-black text-sm shrink-0 border-2 border-ink
                    {surah.revelationType === 'Meccan' ? 'bg-accent-yellow text-ink' : 'bg-accent-blue text-white'}">
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
          </div>
          <!-- Reading progress bar -->
          {#if progressMap.get(surah.number)}
            {@const prog = progressMap.get(surah.number)!}
            <div class="mt-1.5 flex items-center gap-2">
              <div class="flex-1 h-1 bg-ink/10 rounded overflow-hidden">
                <div class="h-full bg-accent-green rounded transition-[width] duration-300" style="width: {prog.percentage}%"></div>
              </div>
              <span class="text-[9px] font-black text-ink/40 shrink-0">{prog.percentage}%</span>
            </div>
          {/if}
        </div>
      </a>
    {:else}
      <div class="col-span-full text-center py-8">
        <p class="font-bold text-ink/40 text-sm">Tiada surah dijumpai untuk "{search}"</p>
      </div>
    {/each}
  </div>

  <!-- Stats footer -->
  <div class="flex items-center justify-between text-[10px] font-bold text-ink/40 border-t-2 border-ink/20 pt-3">
    <span>{filtered.length} surah ditunjukkan</span>
    {#if completedCount > 0}
      <span class="text-accent-green font-black">{completedCount}/114 surah completed</span>
    {/if}
    <span>114 surah keseluruhan</span>
  </div>
</div>
