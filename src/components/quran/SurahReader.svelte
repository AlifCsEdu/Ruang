<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { Verse, VerseDisplayMode, AudioState, Word } from '../../lib/quran/types';
  import QuranSettings from './QuranSettings.svelte';
  import VerseBookmark from './VerseBookmark.svelte';
  import { saveLastRead, getLastRead } from '../../lib/quran/bookmarks';
  import { SURAHS } from '../../lib/quran/surahs';

  interface Props {
    chapter: number;
  }

  let { chapter }: Props = $props();

  const surahInfo = SURAHS.find((s) => s.number === chapter);

  let verses = $state<Verse[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);
  let displayMode = $state<VerseDisplayMode>('standard');
  let showTranslation = $state(true);
  let showTransliteration = $state(false);
  let audioState = $state<AudioState>({ playing: false, currentVerse: 0, autoAdvance: true });
  let activeWord = $state<{
    text: string;
    transliteration: string;
    translation: string;
    x: number;
    y: number;
  } | null>(null);

  // Pagination state
  let currentPage = $state(1);
  let totalPages = $state(1);
  let isShortSurah = $state(true);

  // Settings state
  let reciter = $state(7);
  let translation = $state(131);

  let audioEl: HTMLAudioElement | null = $state(null);
  let verseContainer = $state<HTMLDivElement | null>(null);
  let winWidth = $state(1024);

  onMount(async () => {
    try {
      winWidth = window.innerWidth;
      // Load saved preferences
      const savedReciter = localStorage.getItem('ruang_quran_reciter');
      const savedTranslation = localStorage.getItem('ruang_quran_translation');
      if (savedReciter) reciter = parseInt(savedReciter, 10);
      if (savedTranslation) translation = parseInt(savedTranslation, 10);

      // Check for last read position
      const lastRead = getLastRead();
      if (lastRead && lastRead.surah === chapter) {
        // Could scroll to last read verse in the future
      }

      await fetchVerses();

      // Listen for settings changes
      window.addEventListener('quran-settings-changed', handleSettingsChange as EventListener);
    } catch (err) {
      error = 'Failed to initialize reader. Please refresh the page.';
      loading = false;
    }
  });

  onDestroy(() => {
    audioEl?.pause();
    if (typeof window !== 'undefined') {
      window.removeEventListener('quran-settings-changed', handleSettingsChange as EventListener);
    }
  });

  function handleSettingsChange(e: CustomEvent<{ reciter: number; translation: number }>) {
    const { reciter: newReciter, translation: newTranslation } = e.detail;
    const changed = newReciter !== reciter || newTranslation !== translation;
    reciter = newReciter;
    translation = newTranslation;
    if (changed) {
      currentPage = 1;
      fetchVerses();
    }
  }

  async function fetchVerses() {
    loading = true;
    error = null;
    try {
      const params = new URLSearchParams({
        reciter: String(reciter),
        translation: String(translation),
        page: String(currentPage),
        perPage: '50',
      });
      const res = await fetch(`/api/quran/${chapter}?${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      verses = data.verses ?? [];
      if (data.pagination) {
        totalPages = data.pagination.totalPages ?? 1;
        isShortSurah = data.pagination.isShortSurah ?? true;
      }
    } catch {
      error = 'Failed to load verses. Check your connection.';
    } finally {
      loading = false;
    }
  }

  function goToPage(page: number) {
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    fetchVerses();
    verseContainer?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleVerseVisible(verseNum: number) {
    if (surahInfo) {
      saveLastRead(chapter, verseNum, surahInfo.englishName);
    }
  }

  function handleWordHover(e: MouseEvent, word: Word) {
    winWidth = window.innerWidth;
    activeWord = {
      text: word.text,
      transliteration: word.transliteration,
      translation: word.translation,
      x: e.clientX,
      y: e.clientY,
    };
  }

  function handleWordClick(e: MouseEvent | TouchEvent, word: Word) {
    const clientX = 'touches' in e ? e.touches[0]?.clientX ?? 0 : e.clientX;
    const clientY = 'touches' in e ? e.touches[0]?.clientY ?? 0 : e.clientY;
    if (activeWord?.text === word.text) {
      activeWord = null;
    } else {
      activeWord = { text: word.text, transliteration: word.transliteration, translation: word.translation, x: clientX, y: clientY };
    }
  }

  function togglePlay(verseNum: number) {
    if (!audioEl) return;
    const verse = verses.find((v) => v.number === verseNum);
    if (!verse?.audio?.url) return;

    if (audioState.playing && audioState.currentVerse === verseNum) {
      audioEl.pause();
      audioState = { ...audioState, playing: false };
    } else {
      audioEl.src = verse.audio.url;
      audioEl.play().catch(() => {});
      audioState = { ...audioState, playing: true, currentVerse: verseNum };
    }
  }

  function handleAudioEnded() {
    if (!audioState.autoAdvance) {
      audioState = { ...audioState, playing: false, currentVerse: 0 };
      return;
    }
    const idx = verses.findIndex((v) => v.number === audioState.currentVerse);
    const next = verses[idx + 1];
    if (next?.audio?.url && audioEl) {
      audioEl.src = next.audio.url;
      audioEl.play().catch(() => {});
      audioState = { ...audioState, currentVerse: next.number };
    } else {
      audioState = { ...audioState, playing: false, currentVerse: 0 };
    }
  }

  function stopAudio() {
    audioEl?.pause();
    audioState = { playing: false, currentVerse: 0, autoAdvance: audioState.autoAdvance };
  }

  function isPlaying(verseNum: number): boolean {
    return audioState.playing && audioState.currentVerse === verseNum;
  }

  function verseTransliteration(v: Verse): string {
    return v.words?.map((w) => w.transliteration).filter(Boolean).join(' ') ?? '';
  }

  function getPageNumbers(): (number | '...')[] {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  }

  const playIcon = '<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><polygon points="3,1 14,8 3,15"/></svg>';
  const pauseIcon = '<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><rect x="2" y="1" width="4" height="14"/><rect x="10" y="1" width="4" height="14"/></svg>';
  const stopIcon = '<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><rect x="2" y="2" width="12" height="12"/></svg>';
</script>

<div class="flex flex-col gap-4">
  <!-- Hidden audio element -->
  <audio bind:this={audioEl} onended={handleAudioEnded} preload="none"></audio>

  <!-- Controls bar -->
  <div class="flex flex-wrap items-center gap-2 sticky top-14 bg-canvas/95 backdrop-blur-sm py-3 z-10 border-b-4 border-ink mb-2">
    <!-- Display mode toggle -->
    <div class="flex border-2 border-ink shadow-[2px_2px_0px_0px_#0D0D0D]">
      <button
        onclick={() => (displayMode = 'standard')}
        class="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-colors duration-75
               {displayMode === 'standard' ? 'bg-ink text-white' : 'bg-white text-ink hover:bg-canvas'}"
      >Standard</button>
      <button
        onclick={() => (displayMode = 'word-by-word')}
        class="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider border-l-2 border-ink transition-colors duration-75
               {displayMode === 'word-by-word' ? 'bg-ink text-white' : 'bg-white text-ink hover:bg-canvas'}"
      >Perkataan</button>
    </div>

    <!-- Translation toggle -->
    <button
      onclick={() => (showTranslation = !showTranslation)}
      class="chip-brutal {showTranslation ? 'bg-accent-blue text-white' : 'bg-white'} transition-colors"
    >{showTranslation ? '✓ Terjemahan' : 'Terjemahan'}</button>

    <!-- Transliteration toggle -->
    <button
      onclick={() => (showTransliteration = !showTransliteration)}
      class="chip-brutal {showTransliteration ? 'bg-accent-blue text-white' : 'bg-white'} transition-colors"
    >{showTransliteration ? '✓ Rumi' : 'Rumi'}</button>

    <!-- Settings -->
    <QuranSettings currentReciter={reciter} currentTranslation={translation} />

    <span class="text-[10px] font-black uppercase tracking-wider text-ink/40 ml-auto">
      {#if isShortSurah}
        {verses.length} ayat
      {:else}
        Halaman {currentPage}/{totalPages}
      {/if}
    </span>
  </div>

  <!-- Loading state -->
  {#if loading}
    <div class="flex items-center justify-center py-16">
      <div class="card-brutal-sm text-center">
        <p class="font-black text-ink/40 uppercase tracking-wider animate-pulse">Memuatkan ayat-ayat...</p>
      </div>
    </div>

  <!-- Error state -->
  {:else if error}
    <div class="card-brutal-sm bg-accent-pink text-white text-center">
      <p class="font-bold text-sm">{error}</p>
      <button onclick={fetchVerses} class="btn-brutal-sm mt-2 bg-white text-ink text-xs">Cuba Lagi</button>
    </div>

  <!-- Verses -->
  {:else}
    <div bind:this={verseContainer} class="flex flex-col gap-4">
      {#each verses as verse (verse.number)}
        <div
          class="verse-card {isPlaying(verse.number) ? 'verse-playing' : ''}"
          role="article"
          aria-label="Verse {verse.number}"
          onmouseenter={() => handleVerseVisible(verse.number)}
        >
          <!-- Verse header -->
          <div class="flex items-center gap-2 mb-3 border-b-2 border-ink/10 pb-2">
            <span class="w-8 h-8 bg-ink text-white flex items-center justify-center font-black text-xs shrink-0">
              {verse.number}
            </span>

            {#if verse.audio?.url}
              <button
                onclick={() => togglePlay(verse.number)}
                class="w-8 h-8 border-2 border-ink flex items-center justify-center shrink-0 transition-all duration-75
                       active:translate-x-0.5 active:translate-y-0.5 active:shadow-none
                       {isPlaying(verse.number) ? 'bg-accent-yellow shadow-[2px_2px_0px_0px_#0D0D0D]' : 'bg-white hover:bg-canvas'}"
                aria-label={isPlaying(verse.number) ? `Pause verse ${verse.number}` : `Play verse ${verse.number}`}
              >
                {@html isPlaying(verse.number) ? pauseIcon : playIcon}
              </button>
            {/if}

            <!-- Bookmark -->
            {#if surahInfo}
              <VerseBookmark surah={chapter} ayah={verse.number} surahName={surahInfo.englishName} />
            {/if}

            {#if verse.verse_key}
              <span class="text-xs font-bold text-ink/40 ml-auto">{verse.verse_key}</span>
            {/if}
          </div>

          <!-- === Standard Mode === -->
          {#if displayMode === 'standard'}
            <div class="arabic-text" dir="rtl" lang="ar">
              {verse.text}
              <span class="text-accent-blue font-bold text-sm mx-2" style="font-family: var(--font-ui);">﴿{verse.number}﴾</span>
            </div>

            {#if showTransliteration && verse.words?.length}
              <p class="transliteration-text mt-3">{verseTransliteration(verse)}</p>
            {/if}

            {#if showTranslation && verse.translations?.length}
              <div class="mt-3 pt-3 border-t-2 border-ink/10">
                <p class="text-sm text-ink/70 leading-relaxed">
                  {@html verse.translations[0].text}
                </p>
              </div>
            {/if}

          <!-- === Word-by-Word Mode === -->
          {:else if verse.words?.length}
            <div class="flex flex-wrap gap-3 justify-end" dir="rtl" lang="ar">
              {#each verse.words as word}
                <button
                  class="quran-word flex flex-col items-center min-w-[3rem]"
                  onmouseenter={(e) => handleWordHover(e, word)}
                  onmouseleave={() => (activeWord = null)}
                  onclick={(e) => handleWordClick(e, word)}
                  aria-label={word.translation}
                >
                  <span class="arabic-text text-2xl leading-normal">{word.text}</span>
                  {#if showTransliteration && word.transliteration}
                    <span class="transliteration-text mt-1">{word.transliteration}</span>
                  {/if}
                  {#if showTranslation && word.translation}
                    <span class="text-[10px] text-ink/60 font-bold mt-0.5 leading-tight text-center" style="font-family: var(--font-ui); direction: ltr;">
                      {word.translation}
                    </span>
                  {/if}
                </button>
              {/each}
            </div>
          {/if}
        </div>
      {/each}
    </div>

    <!-- Pagination controls -->
    {#if !isShortSurah && totalPages > 1}
      <div class="flex items-center justify-center gap-1.5 py-4">
        <button
          onclick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
          class="btn-brutal-sm text-xs disabled:opacity-30 disabled:cursor-not-allowed"
        >Prev</button>

        {#each getPageNumbers() as p}
          {#if p === '...'}
            <span class="px-2 text-xs font-bold text-ink/40">...</span>
          {:else}
            <button
              onclick={() => goToPage(p)}
              class="w-8 h-8 border-2 border-ink font-black text-xs transition-all duration-75
                     active:translate-x-0.5 active:translate-y-0.5 active:shadow-none
                     {currentPage === p ? 'bg-ink text-white shadow-[2px_2px_0px_0px_#0D0D0D]' : 'bg-white hover:bg-canvas'}"
            >{p}</button>
          {/if}
        {/each}

        <button
          onclick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          class="btn-brutal-sm text-xs disabled:opacity-30 disabled:cursor-not-allowed"
        >Next</button>
      </div>
    {/if}
  {/if}

  <!-- Word tooltip -->
  {#if activeWord}
    <div
      class="word-tooltip fixed z-[9999] border-4 border-ink bg-accent-yellow p-3 shadow-[4px_4px_0px_0px_#0D0D0D] max-w-xs pointer-events-none"
      style="left: {Math.min(activeWord.x + 10, winWidth - 200)}px; top: {activeWord.y - 80}px;"
    >
      <p class="arabic-text text-xl leading-normal" dir="rtl" lang="ar">{activeWord.text}</p>
      {#if activeWord.transliteration}
        <p class="transliteration-text mt-1">{activeWord.transliteration}</p>
      {/if}
      {#if activeWord.translation}
        <p class="text-xs font-bold text-ink/70 mt-1">{activeWord.translation}</p>
      {/if}
    </div>
  {/if}
</div>

<!-- Fixed audio control bar -->
{#if audioState.currentVerse > 0}
  <div class="fixed bottom-20 left-0 right-0 bg-white border-t-4 border-ink p-3 z-40 shadow-[0_-4px_0px_0px_#0D0D0D]">
    <div class="max-w-4xl mx-auto flex items-center justify-between">
      <div class="flex items-center gap-2">
        <span class="text-xs font-black uppercase tracking-wider text-ink/60">Ayat</span>
        <span class="font-black text-lg tabular-nums">{audioState.currentVerse}</span>
      </div>

      <div class="flex items-center gap-2">
        <button
          onclick={() => togglePlay(audioState.currentVerse)}
          class="w-8 h-8 border-2 border-ink bg-white flex items-center justify-center
                 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none
                 shadow-[2px_2px_0px_0px_#0D0D0D]"
          aria-label={audioState.playing ? 'Pause' : 'Play'}
        >
          {@html audioState.playing ? pauseIcon : playIcon}
        </button>

        <button
          onclick={stopAudio}
          class="w-8 h-8 border-2 border-ink bg-white flex items-center justify-center
                 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none
                 shadow-[2px_2px_0px_0px_#0D0D0D]"
          aria-label="Stop audio"
        >
          {@html stopIcon}
        </button>
      </div>

      <button
        onclick={() => (audioState = { ...audioState, autoAdvance: !audioState.autoAdvance })}
        class="btn-brutal-sm text-[10px] {audioState.autoAdvance ? 'bg-accent-green text-white border-ink' : ''}"
      >{audioState.autoAdvance ? '✓ Auto' : 'Auto'}</button>
    </div>
  </div>
{/if}
