<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { Verse, VerseDisplayMode, AudioState, Word, ScriptType, WordBelowDisplay } from '../../lib/quran/types';
  import QuranSettings from './QuranSettings.svelte';
  import VerseBookmark from './VerseBookmark.svelte';
  import AudioPlayer from './AudioPlayer.svelte';
  import AyahMarker from './AyahMarker.svelte';
  import ShareModal from './ShareModal.svelte';
  import { saveLastRead, getLastRead, saveReadingProgress } from '../../lib/quran/bookmarks';
  import { SURAHS } from '../../lib/quran/surahs';
  import {
    FONT_SIZE_DEFAULT, FONT_SIZE_MIN, FONT_SIZE_MAX, FONT_SIZE_STEP,
    LS_FONT_SIZE, LS_SCRIPT_TYPE, LS_WORD_BELOW,
    LS_DISPLAY_MODE, LS_AUDIO_PREFS, LS_NIGHT_MODE, PLAYBACK_SPEEDS, TRANSLATIONS,
  } from '../../lib/quran/constants';

  interface Props {
    chapter: number;
  }

  let { chapter }: Props = $props();

  const surahInfo = SURAHS.find((s) => s.number === chapter);

  // Core state
  let verses = $state<Verse[]>([]);
  let loading = $state(true);
  let error = $state<string | null>(null);

  // Display state
  let displayMode = $state<VerseDisplayMode>('standard');
  let showTranslation = $state(true);
  let showTransliteration = $state(false);
  let fontSize = $state(FONT_SIZE_DEFAULT);
  let scriptType = $state<ScriptType>('uthmani');
  let wordBelowDisplay = $state<WordBelowDisplay>('translation');

  // Audio state
  let audioState = $state<AudioState>({
    playing: false, currentVerse: 0, autoAdvance: true,
    repeatVerse: false, volume: 1, speed: 1,
  });

  // Word tooltip
  let activeWord = $state<{
    text: string; transliteration: string; translation: string;
    x: number; y: number;
  } | null>(null);
  let wordDismissTimeout: ReturnType<typeof setTimeout> | null = null;

  // Pagination
  let currentPage = $state(1);
  let totalPages = $state(1);
  let isShortSurah = $state(true);

  // Settings state
  let reciter = $state(7);
  let translation = $state(20);

  let verseContainer = $state<HTMLDivElement | null>(null);
  let winWidth = $state(1024);

  // Night mode
  let nightMode = $state(false);

  // Per-verse audio progress
  let verseProgress = $state(0);

  // Word-by-word audio tracking
  let wordAudioEl: HTMLAudioElement | null = $state(null);
  let playingWord = $state<{ verseNum: number; wordPos: number } | null>(null);

  // Sequential WBW playback mode
  let wbwMode = $state(false);
  let wbwVerseIdx = $state(0);
  let wbwWordIdx = $state(0);

  // Toast notification
  let toast = $state<string | null>(null);
  let toastTimeout: ReturnType<typeof setTimeout> | null = null;

  // Reading progress
  let scrollProgress = $state(0);

  // Verse repetition counter
  let repeatCount = $state(0);
  let lastRepeatedVerse = $state(0);

  // In-surah search
  let verseSearch = $state('');
  let searchOpen = $state(false);

  const matchingVerseNums = $derived(
    verseSearch.trim()
      ? verses.filter(v => {
          const q = verseSearch.toLowerCase();
          const translationMatch = v.translations?.some(t => t.text.toLowerCase().includes(q));
          const wordMatch = v.words?.some(w => w.translation.toLowerCase().includes(q));
          return translationMatch || wordMatch;
        }).map(v => v.number)
      : []
  );

  // Shortcuts modal
  let showShortcuts = $state(false);

  // Share modal
  let shareModalVerse = $state<Verse | null>(null);
  let snippetMode = $state(false);

  onMount(async () => {
    try {
      winWidth = window.innerWidth;

      // Load saved preferences
      const savedReciter = localStorage.getItem('ruang_quran_reciter');
      const savedTranslation = localStorage.getItem('ruang_quran_translation');
      const savedFontSize = localStorage.getItem(LS_FONT_SIZE);
      const savedScript = localStorage.getItem(LS_SCRIPT_TYPE);
      const savedWordBelow = localStorage.getItem(LS_WORD_BELOW);
      const savedDisplayMode = localStorage.getItem(LS_DISPLAY_MODE);
      const savedAudioPrefs = localStorage.getItem(LS_AUDIO_PREFS);

      if (savedReciter) reciter = parseInt(savedReciter, 10);
      if (savedTranslation) {
              const tid = parseInt(savedTranslation, 10);
              // Validate against known translation IDs; fall back to default if invalid
              translation = TRANSLATIONS.some(t => t.id === tid) ? tid : 20;
            }
      if (savedFontSize) fontSize = parseFloat(savedFontSize);
      if (savedScript) scriptType = savedScript as ScriptType;
      if (savedWordBelow) wordBelowDisplay = savedWordBelow as WordBelowDisplay;
      if (savedDisplayMode) displayMode = savedDisplayMode as VerseDisplayMode;
      if (savedAudioPrefs) {
        try {
          const prefs = JSON.parse(savedAudioPrefs);
          audioState = { ...audioState, speed: prefs.speed ?? 1, autoAdvance: prefs.autoAdvance ?? true };
        } catch {}
      }

      // Night mode
      const savedNight = localStorage.getItem(LS_NIGHT_MODE);
      if (savedNight === 'true') nightMode = true;

      // Check for last read position
      const lastRead = getLastRead();

      await fetchVerses();

      // Scroll to last-read verse after DOM renders
      if (lastRead && lastRead.surah === chapter && lastRead.ayah > 0) {
        setTimeout(() => {
          requestAnimationFrame(() => {
            const el = document.getElementById(`verse-${lastRead.ayah}`);
            if (el) {
              const y = el.getBoundingClientRect().top + window.scrollY - 120;
              window.scrollTo({ top: y, behavior: 'smooth' });
              el.classList.add('verse-last-read');
            }
          });
        }, 300);
      }

      // Listen for settings changes
      window.addEventListener('quran-settings-changed', handleSettingsChange as EventListener);

      // Listen for audio progress updates
      window.addEventListener('quran-audio-progress', handleAudioProgress as EventListener);

      // Keyboard shortcuts
      window.addEventListener('keydown', handleKeydown);

      // Reading progress scroll listener
      window.addEventListener('scroll', handleScrollProgress, { passive: true });

      // Verse repetition listener
      window.addEventListener('quran-verse-repeat', handleVerseRepeat as EventListener);
    } catch (err) {
      error = 'Failed to initialize reader. Please refresh the page.';
      loading = false;
    }
  });

  onDestroy(() => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('quran-settings-changed', handleSettingsChange as EventListener);
      window.removeEventListener('quran-audio-progress', handleAudioProgress as EventListener);
      window.removeEventListener('keydown', handleKeydown);
      window.removeEventListener('scroll', handleScrollProgress);
      window.removeEventListener('quran-verse-repeat', handleVerseRepeat as EventListener);
    }
    if (wordDismissTimeout) clearTimeout(wordDismissTimeout);
    if (toastTimeout) clearTimeout(toastTimeout);
    stopWbw();
  });

  function handleSettingsChange(e: CustomEvent<{
    reciter: number; translation: number; scriptType?: ScriptType;
    fontSize?: number; wordBelowDisplay?: WordBelowDisplay;
    displayMode?: VerseDisplayMode; audioPrefs?: { speed: number; autoAdvance: boolean };
  }>) {
    const d = e.detail;
    const fetchNeeded = (d.reciter && d.reciter !== reciter) || (d.translation && d.translation !== translation)
      || (d.scriptType && d.scriptType !== scriptType);

    if (d.reciter) reciter = d.reciter;
    if (d.translation) translation = d.translation;
    if (d.scriptType) scriptType = d.scriptType;
    if (d.fontSize !== undefined) fontSize = d.fontSize;
    if (d.wordBelowDisplay) wordBelowDisplay = d.wordBelowDisplay;
    if (d.displayMode) displayMode = d.displayMode;
    if (d.audioPrefs) {
      audioState = { ...audioState, speed: d.audioPrefs.speed, autoAdvance: d.audioPrefs.autoAdvance };
    }

    if (fetchNeeded) {
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
        script: scriptType,
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
      saveReadingProgress(chapter, surahInfo.englishName, verseNum, surahInfo.versesCount);
    }
  }

  function handleWordHover(e: MouseEvent, word: Word) {
    winWidth = window.innerWidth;
    activeWord = {
      text: word.text, transliteration: word.transliteration, translation: word.translation,
      x: e.clientX, y: e.clientY,
    };
  }

  function handleWordClick(e: MouseEvent | TouchEvent, word: Word) {
    const clientX = 'touches' in e ? e.touches[0]?.clientX ?? 0 : e.clientX;
    const clientY = 'touches' in e ? e.touches[0]?.clientY ?? 0 : e.clientY;

    // Play word audio with tracked instance
    if (word.audio_url) {
      if (!wordAudioEl) wordAudioEl = new Audio();
      wordAudioEl.src = word.audio_url;
      wordAudioEl.play().catch(() => {});
      // Find current verse number from context
      const verseNum = verses.find(v => v.words?.some(w => w === word))?.number ?? 0;
      playingWord = { verseNum, wordPos: word.position };
      // Signal main audio player to duck volume
      window.dispatchEvent(new CustomEvent('quran-word-audio-start'));
      wordAudioEl.onended = () => {
        playingWord = null;
        window.dispatchEvent(new CustomEvent('quran-word-audio-end'));
      };
    }

    // Show tooltip
    activeWord = { text: word.text, transliteration: word.transliteration, translation: word.translation, x: clientX, y: clientY };

    // Auto-dismiss after 3s
    if (wordDismissTimeout) clearTimeout(wordDismissTimeout);
    wordDismissTimeout = setTimeout(() => { activeWord = null; }, 3000);
  }

  // Audio control callbacks
  function togglePlay(verseNum: number) {
    const verse = verses.find((v) => v.number === verseNum);
    if (!verse?.audio?.url) return;
    if (audioState.playing && audioState.currentVerse === verseNum) {
      audioState = { ...audioState, playing: false };
      playingWord = null;
    } else {
      audioState = { ...audioState, playing: true, currentVerse: verseNum };
    }
  }

  function handleAudioPause() {
    audioState = { ...audioState, playing: false };
    playingWord = null;
  }

  function handleAudioStop() {
    audioState = { ...audioState, playing: false, currentVerse: 0 };
    playingWord = null;
  }

  function handleAudioClose() {
    audioState = { ...audioState, playing: false, currentVerse: 0 };
    playingWord = null;
  }

  function handleAudioNext() {
    playingWord = null;
    const idx = verses.findIndex((v) => v.number === audioState.currentVerse);
    const next = verses[idx + 1];
    if (next?.audio?.url) {
      audioState = { ...audioState, currentVerse: next.number, playing: true };
    } else {
      audioState = { ...audioState, playing: false };
    }
  }

  function handleAudioPrev() {
    const idx = verses.findIndex((v) => v.number === audioState.currentVerse);
    const prev = verses[idx - 1];
    if (prev?.audio?.url) {
      audioState = { ...audioState, currentVerse: prev.number, playing: true };
    }
  }

  function toggleAutoAdvance() {
    audioState = { ...audioState, autoAdvance: !audioState.autoAdvance };
    saveAudioPrefs();
  }

  function toggleRepeat() {
    audioState = { ...audioState, repeatVerse: !audioState.repeatVerse };
    saveAudioPrefs();
  }

  function playAll() {
    stopWbw();
    const firstWithAudio = verses.find(v => v.audio?.url);
    if (!firstWithAudio) return;
    audioState = {
      ...audioState,
      playing: true,
      currentVerse: firstWithAudio.number,
      autoAdvance: true,
    };
  }

  function playWordByWord() {
    if (wbwMode) { stopWbw(); return; }
    // Pause verse audio if playing
    if (audioState.playing) audioState = { ...audioState, playing: false };
    wbwMode = true;
    wbwVerseIdx = 0;
    wbwWordIdx = 0;
    playCurrentWord();
  }

  function playCurrentWord() {
    if (!wbwMode) return;
    const verse = verses[wbwVerseIdx];
    if (!verse?.words?.length) { stopWbw(); return; }
    const word = verse.words[wbwWordIdx];
    if (!word?.audio_url) {
      // Skip words without audio
      advanceWbw();
      return;
    }
    if (!wordAudioEl) wordAudioEl = new Audio();
    wordAudioEl.src = word.audio_url;
    wordAudioEl.play().catch(() => {});
    playingWord = { verseNum: verse.number, wordPos: word.position };
    wordAudioEl.onended = () => { advanceWbw(); };
    // Auto-scroll to verse
    const el = document.getElementById(`verse-${verse.number}`);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 120;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }

  function advanceWbw() {
    if (!wbwMode) return;
    const verse = verses[wbwVerseIdx];
    if (!verse?.words) { stopWbw(); return; }
    if (wbwWordIdx < verse.words.length - 1) {
      wbwWordIdx++;
      playCurrentWord();
    } else if (wbwVerseIdx < verses.length - 1) {
      wbwVerseIdx++;
      wbwWordIdx = 0;
      // Small delay between verses
      setTimeout(() => playCurrentWord(), 300);
    } else {
      stopWbw();
    }
  }

  function stopWbw() {
    wbwMode = false;
    wbwVerseIdx = 0;
    wbwWordIdx = 0;
    playingWord = null;
    if (wordAudioEl) { wordAudioEl.pause(); wordAudioEl.onended = null; }
  }

  function saveAudioPrefs() {
    localStorage.setItem(LS_AUDIO_PREFS, JSON.stringify({ speed: audioState.speed, autoAdvance: audioState.autoAdvance }));
  }

  function toggleNightMode() {
    nightMode = !nightMode;
    localStorage.setItem(LS_NIGHT_MODE, String(nightMode));
  }

  function handleAudioProgress(e: CustomEvent<{ verseNum: number; progress: number }>) {
    if (e.detail.verseNum === audioState.currentVerse) {
      verseProgress = e.detail.progress;
      // Sync word highlighting with verse audio playback (karaoke-style)
      if (!wbwMode && audioState.playing && e.detail.progress >= 0 && e.detail.progress <= 100) {
        const verse = verses.find(v => v.number === e.detail.verseNum);
        if (verse?.words?.length) {
          const wordIdx = Math.min(
            Math.floor((e.detail.progress / 100) * verse.words.length),
            verse.words.length - 1
          );
          const word = verse.words[wordIdx];
          if (word) {
            playingWord = { verseNum: verse.number, wordPos: word.position };
          }
        }
      }
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    const target = e.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return;

    switch (e.key) {
      case ' ':
        e.preventDefault();
        if (audioState.playing) {
          audioState = { ...audioState, playing: false };
        } else if (audioState.currentVerse > 0) {
          audioState = { ...audioState, playing: true };
        } else {
          playAll();
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        handleAudioNext();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        handleAudioPrev();
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (fontSize < FONT_SIZE_MAX) {
          fontSize = Math.min(fontSize + FONT_SIZE_STEP, FONT_SIZE_MAX);
          localStorage.setItem(LS_FONT_SIZE, String(fontSize));
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (fontSize > FONT_SIZE_MIN) {
          fontSize = Math.max(fontSize - FONT_SIZE_STEP, FONT_SIZE_MIN);
          localStorage.setItem(LS_FONT_SIZE, String(fontSize));
        }
        break;
      case 'm':
      case 'M':
        e.preventDefault();
        const modes: VerseDisplayMode[] = ['standard', 'word-by-word', 'mushaf'];
        const idx = modes.indexOf(displayMode);
        displayMode = modes[(idx + 1) % modes.length];
        localStorage.setItem(LS_DISPLAY_MODE, displayMode);
        break;
      case 'n':
      case 'N':
        e.preventDefault();
        toggleNightMode();
        break;
      case 'Escape':
        e.preventDefault();
        if (wbwMode) stopWbw();
        else if (showShortcuts) showShortcuts = false;
        else if (searchOpen) { searchOpen = false; verseSearch = ''; }
        break;
      case '?':
        e.preventDefault();
        showShortcuts = !showShortcuts;
        break;
    }
  }

  function showToast(msg: string) {
    toast = msg;
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => { toast = null; }, 2000);
  }

  async function copyVerse(verse: Verse) {
    const arabic = getScriptText(verse);
    const translation = verse.translations?.[0]?.text ?? '';
    const transliteration = verseTransliteration(verse);
    const ref = surahInfo ? `${surahInfo.englishName} (${surahInfo.name}) ${verse.number}` : `Verse ${verse.number}`;
    const url = typeof window !== 'undefined' ? `${window.location.origin}/quran/${chapter}#verse-${verse.number}` : '';
    const sections = [arabic];
    if (transliteration) sections.push(`\n${transliteration}`);
    if (translation) sections.push(`\n${translation}`);
    sections.push(`\n— ${ref}`);
    if (url) sections.push(`\n📖 ${url}`);
    const text = sections.join('\n');
    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied to clipboard!');
    } catch {
      showToast('Failed to copy');
    }
  }

  async function shareVerse(verse: Verse) {
    const ref = surahInfo ? `${surahInfo.englishName} ${verse.number}` : `Verse ${verse.number}`;
    const url = typeof window !== 'undefined' ? `${window.location.origin}/quran/${chapter}#verse-${verse.number}` : '';
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: ref, url });
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(url);
        showToast('Link copied!');
      } catch {
        showToast('Failed to share');
      }
    }
  }

  function handleScrollProgress() {
    if (!verseContainer) return;
    const rect = verseContainer.getBoundingClientRect();
    const totalHeight = rect.height;
    if (totalHeight <= 0) return;
    const scrolled = Math.max(0, -rect.top + 100);
    scrollProgress = Math.min(100, Math.round((scrolled / totalHeight) * 100));
  }

  function handleVerseRepeat(e: CustomEvent<{ verseNum: number }>) {
    if (e.detail.verseNum === lastRepeatedVerse) {
      repeatCount++;
    } else {
      lastRepeatedVerse = e.detail.verseNum;
      repeatCount = 1;
    }
  }

  function isPlaying(verseNum: number): boolean {
    return audioState.playing && audioState.currentVerse === verseNum;
  }

  // Auto-scroll to playing verse (with offset for sticky controls)
  $effect(() => {
    if (audioState.currentVerse > 0 && audioState.playing) {
      const el = document.getElementById(`verse-${audioState.currentVerse}`)
        ?? document.getElementById(`mushaf-verse-${audioState.currentVerse}`);
      if (el) {
        const y = el.getBoundingClientRect().top + window.scrollY - 120;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  });

  function verseTransliteration(v: Verse): string {
    return v.words?.map((w) => w.transliteration).filter(Boolean).join(' ') ?? '';
  }

  function getScriptText(v: Verse): string {
    switch (scriptType) {
      case 'indopak': return v.text_indopak ?? v.text;
      case 'tajweed': return v.text; // tajweed uses text_tajweed with @html
      default: return v.text;
    }
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
</script>

<div class="flex flex-col gap-4 {nightMode ? 'quran-night' : ''}">
  <!-- Controls bar -->
  <div class="controls-bar flex flex-col gap-2 sticky top-14 py-3 z-10 border-b-4 border-ink mb-2 bg-canvas/95 backdrop-blur-sm">
    <!-- Row 1: Primary (display mode + audio + info) -->
    <div class="flex items-center gap-2 overflow-x-auto">
      <!-- Display mode toggle -->
      <div class="flex border-2 border-ink shadow-[2px_2px_0px_0px_#0D0D0D] shrink-0">
        <button
          onclick={() => (displayMode = 'standard')}
          class="px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider transition-colors duration-75
                 {displayMode === 'standard' ? 'bg-ink text-white' : 'bg-white text-ink hover:bg-canvas'}"
        >Standard</button>
        <button
          onclick={() => (displayMode = 'word-by-word')}
          class="px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider border-l-2 border-ink transition-colors duration-75
                 {displayMode === 'word-by-word' ? 'bg-ink text-white' : 'bg-white text-ink hover:bg-canvas'}"
        >Perkataan</button>
        <button
          onclick={() => (displayMode = 'mushaf')}
          class="px-2.5 py-1.5 text-[10px] font-black uppercase tracking-wider border-l-2 border-ink transition-colors duration-75
                 {displayMode === 'mushaf' ? 'bg-ink text-white' : 'bg-white text-ink hover:bg-canvas'}"
        >Mushaf</button>
      </div>

      <div class="w-px h-6 bg-ink/20 shrink-0"></div>

      <!-- Audio controls -->
      <div class="flex items-center gap-1.5 shrink-0">
        <button
          onclick={playAll}
          class="chip-brutal bg-accent-green text-white hover:brightness-110 transition-colors
                 flex items-center gap-1"
        >{@html playIcon} Main Semua</button>
        <button
          onclick={playWordByWord}
          class="chip-brutal {wbwMode ? 'bg-accent-yellow' : 'bg-white'} transition-colors flex items-center gap-1"
        >{wbwMode ? '⏹ Stop WBW' : '🔤 WBW'}</button>
      </div>

      <!-- Spacer -->
      <div class="flex-1 min-w-[1rem]"></div>

      <!-- Info badge -->
      <span class="text-[10px] font-black uppercase tracking-wider text-ink/40 shrink-0">
        {#if isShortSurah}
          {verses.length} ayat
        {:else}
          Halaman {currentPage}/{totalPages}
        {/if}
        {#if scrollProgress > 0}
          · {scrollProgress}%
        {/if}
      </span>
    </div>

    <!-- Row 2: Secondary (toggles + settings + search) -->
    <div class="flex items-center gap-2 overflow-x-auto">
      <!-- Translation + Rumi -->
      <div class="flex items-center gap-1.5 shrink-0">
        <button
          onclick={() => (showTranslation = !showTranslation)}
          class="chip-brutal {showTranslation ? 'bg-accent-blue text-white' : 'bg-white'} transition-colors"
        >{showTranslation ? '✓ Terjemahan' : 'Terjemahan'}</button>
        <button
          onclick={() => (showTransliteration = !showTransliteration)}
          class="chip-brutal {showTransliteration ? 'bg-accent-blue text-white' : 'bg-white'} transition-colors"
        >{showTransliteration ? '✓ Rumi' : 'Rumi'}</button>
      </div>

      <div class="w-px h-6 bg-ink/20 shrink-0"></div>

      <!-- Night mode -->
      <button
        onclick={toggleNightMode}
        class="chip-brutal shrink-0 {nightMode ? 'bg-night-bg text-night-accent border-night-border' : 'bg-white'} transition-colors"
      >{nightMode ? '☀️ Day' : '🌙 Night'}</button>

      <!-- Search toggle -->
      <button
        onclick={() => (searchOpen = !searchOpen)}
        class="chip-brutal shrink-0 {searchOpen ? 'bg-accent-blue text-white' : 'bg-white'} transition-colors"
      >🔍 Cari</button>

      <!-- Settings -->
      <QuranSettings
        currentReciter={reciter}
        currentTranslation={translation}
        currentScriptType={scriptType}
        currentFontSize={fontSize}
        currentWordBelow={wordBelowDisplay}
      />

      <!-- Shortcuts help -->
      <button
        onclick={() => (showShortcuts = !showShortcuts)}
        class="chip-brutal shrink-0 {showShortcuts ? 'bg-ink text-white' : 'bg-white'} transition-colors"
        title="Keyboard shortcuts"
      >?</button>
    </div>
  </div>

  <!-- Search bar -->
  {#if searchOpen}
    <div class="flex items-center gap-2 px-2 py-2 border-2 border-ink bg-white animate-slide-up">
      <input
        type="text"
        bind:value={verseSearch}
        placeholder="Cari dalam surah ini..."
        class="input-brutal flex-1 text-xs !py-1 !shadow-none"
      />
      {#if verseSearch}
        <span class="text-[10px] font-black text-ink/40 shrink-0">{matchingVerseNums.length} ayat</span>
      {/if}
      <button onclick={() => { searchOpen = false; verseSearch = ''; }} class="btn-brutal-sm text-[10px]">✕</button>
    </div>
  {/if}

  <!-- Reading progress bar -->
  {#if scrollProgress > 0}
    <div class="sticky top-[7.5rem] z-[9] h-1 bg-ink/5" style="margin-top: -4px;">
      <div class="h-full bg-accent-green transition-[width] duration-200" style="width: {scrollProgress}%"></div>
    </div>
  {/if}

  <!-- Loading state -->
  {#if loading}
    <div class="flex flex-col gap-4">
      {#each Array(5) as _, i}
        <div class="skeleton-verse" style="animation-delay: {i * 0.1}s">
          <div class="flex items-center gap-2 mb-3 border-b-2 border-ink/10 pb-2">
            <div class="skeleton" style="width: 2rem; height: 2rem; border-radius: 50%;"></div>
            <div class="skeleton" style="width: 2rem; height: 2rem;"></div>
          </div>
          <div class="skeleton" style="height: 2rem; width: 80%; margin-bottom: 0.75rem; margin-left: auto;"></div>
          <div class="skeleton" style="height: 2rem; width: 65%; margin-bottom: 0.75rem; margin-left: auto;"></div>
          <div class="skeleton" style="height: 1rem; width: 55%; margin-top: 1rem;"></div>
        </div>
      {/each}
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
      {#key displayMode}
      <div class="animate-slide-up">

      <!-- === MUSHAF MODE === -->
      {#if displayMode === 'mushaf'}
        <!-- Mushaf audio controls -->
        <div class="flex items-center gap-2 mb-4 pb-3 border-b-2 border-ink/10" dir="ltr">
          <button
            onclick={playAll}
            class="chip-brutal bg-accent-green text-white flex items-center gap-1"
          >{@html playIcon} Main Semua</button>
          {#if audioState.currentVerse > 0}
            <span class="text-[10px] font-black uppercase tracking-wider text-ink/40">
              Sedang main: Ayat {audioState.currentVerse}
            </span>
            <button
              onclick={() => audioState = { ...audioState, playing: !audioState.playing }}
              class="chip-brutal bg-accent-yellow flex items-center gap-1"
            >{@html audioState.playing ? pauseIcon : playIcon} {audioState.playing ? 'Jeda' : 'Sambung'}</button>
            <button
              onclick={handleAudioStop}
              class="chip-brutal bg-white flex items-center gap-1"
            >Henti</button>
          {/if}
        </div>

        <div class="mushaf-container">
          <!-- Surah header ornament -->
          {#if surahInfo}
            <div class="mushaf-surah-header" dir="ltr" style="text-align: center; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 2px solid var(--color-ink, #0D0D0D);">
              <div style="display: flex; align-items: center; gap: 0.75rem;">
                <div style="flex: 1; height: 2px; background: var(--color-ink, #0D0D0D); opacity: 0.3;"></div>
                <div style="text-align: center;">
                  <p class="arabic-text" dir="rtl" style="font-size: 1.75rem; line-height: 1.8; margin: 0;">{surahInfo.name}</p>
                  <p style="font-family: var(--font-ui); font-size: 0.625rem; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; color: var(--color-ink, #0D0D0D); opacity: 0.5; margin-top: 0.25rem;">{surahInfo.englishName}</p>
                </div>
                <div style="flex: 1; height: 2px; background: var(--color-ink, #0D0D0D); opacity: 0.3;"></div>
              </div>
              {#if chapter !== 1 && chapter !== 9}
                <p class="arabic-text" dir="rtl" style="font-size: 1.25rem; margin-top: 0.75rem; opacity: 0.7;">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</p>
              {/if}
            </div>
          {/if}

          <div class="mushaf-corners" style="position: relative;">
            <div class="arabic-text mushaf-text" style="font-size: {fontSize}rem;">
              {#each verses as verse (verse.number)}
                <span id="mushaf-verse-{verse.number}">
                  {#if scriptType === 'tajweed' && verse.text_tajweed}
                    {@html verse.text_tajweed}
                  {:else if verse.words?.length}
                    {#each verse.words as word}
                      <button
                        class="quran-word-inline {playingWord?.verseNum === verse.number && playingWord?.wordPos === word.position ? 'quran-word-playing' : ''}"
                        onclick={(e) => handleWordClick(e, word)}
                        onmouseenter={(e) => handleWordHover(e, word)}
                        onmouseleave={() => (activeWord = null)}
                        aria-label={word.translation}
                      >{word.text}</button>
                    {/each}
                  {:else}
                    {getScriptText(verse)}
                  {/if}
                  <AyahMarker number={verse.number} variant="inline" playing={isPlaying(verse.number)} />
                </span>
                {' '}
              {/each}
            </div>

            {#if showTranslation}
              <div class="mt-6 pt-4 border-t-4 border-ink/10" dir="ltr">
                <h3 class="font-black text-xs uppercase tracking-wider text-ink/40 mb-3">Translation</h3>
                {#each verses as verse}
                  {#if verse.translations?.length}
                    <p class="text-sm text-ink/70 leading-relaxed mb-2">
                      <span class="font-black text-ink/40 mr-1">{verse.number}.</span>
                      {@html verse.translations[0].text}
                    </p>
                  {/if}
                {/each}
              </div>
            {/if}
          </div>
        </div>

      <!-- === STANDARD & WORD-BY-WORD MODES === -->
      {:else}
        {#each verses as verse (verse.number)}
          <div
            id="verse-{verse.number}"
            class="verse-card {isPlaying(verse.number) ? 'verse-playing' : ''} {matchingVerseNums.includes(verse.number) ? '!border-accent-blue bg-accent-blue/5' : ''}"
            role="article"
            aria-label="Verse {verse.number}"
            onmouseenter={() => handleVerseVisible(verse.number)}
          >
            <!-- Verse header -->
            <div class="flex items-center gap-2 mb-3 border-b-2 border-ink/10 pb-2">
              <AyahMarker number={verse.number} variant="badge" playing={isPlaying(verse.number)} />

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
                <span class="text-xs font-bold text-ink/40">{verse.verse_key}</span>
              {/if}

              <!-- Copy & Share -->
              <div class="flex items-center gap-1 ml-auto">
                <button
                  onclick={() => copyVerse(verse)}
                  class="w-7 h-7 border-2 border-ink/20 flex items-center justify-center shrink-0 bg-white hover:bg-canvas transition-colors"
                  title="Copy verse"
                >
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="5" width="9" height="9" rx="1"/><path d="M3 11V3a1 1 0 011-1h8"/></svg>
                </button>
                <button
                  onclick={() => (shareModalVerse = verse)}
                  class="w-7 h-7 border-2 border-ink/20 flex items-center justify-center shrink-0 bg-white hover:bg-canvas transition-colors"
                  title="Share verse"
                >
                  <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="3" r="2"/><circle cx="4" cy="8" r="2"/><circle cx="12" cy="13" r="2"/><line x1="5.7" y1="9" x2="10.3" y2="12"/><line x1="10.3" y1="4" x2="5.7" y2="7"/></svg>
                </button>
              </div>
            </div>

            <!-- Repeat counter chip -->
            {#if isPlaying(verse.number) && repeatCount > 0 && lastRepeatedVerse === verse.number}
              <div class="inline-flex items-center gap-1 px-2 py-0.5 border-2 border-accent-pink bg-accent-pink/10 text-[10px] font-black uppercase tracking-wider mb-2">
                <span>🔁 x{repeatCount}</span>
              </div>
            {/if}
            {#if isPlaying(verse.number) && verseProgress > 0}
              <div class="verse-progress-bar" style="width: {verseProgress}%"></div>
            {/if}

            <!-- === Standard Mode === -->
            {#if displayMode === 'standard'}
              <div class="arabic-text" dir="rtl" lang="ar" style="font-size: {fontSize}rem;">
                {#if scriptType === 'tajweed' && verse.text_tajweed}
                  {@html verse.text_tajweed}
                {:else if verse.words?.length}
                  {#each verse.words as word}
                    <button
                      class="quran-word-inline {playingWord?.verseNum === verse.number && playingWord?.wordPos === word.position ? 'quran-word-playing' : ''}"
                      onclick={(e) => handleWordClick(e, word)}
                      onmouseenter={(e) => handleWordHover(e, word)}
                      onmouseleave={() => (activeWord = null)}
                      aria-label={word.translation}
                    >{word.text}</button>
                  {/each}
                {:else}
                  {getScriptText(verse)}
                {/if}
                <AyahMarker number={verse.number} variant="inline" playing={isPlaying(verse.number)} />
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
              {:else if showTranslation}
                <div class="mt-3 pt-3 border-t-2 border-ink/10">
                  <p class="text-xs text-ink/30 font-bold italic">No translation available</p>
                </div>
              {/if}

            <!-- === Word-by-Word Mode === -->
            {:else if verse.words?.length}
              <div class="flex flex-wrap gap-3 justify-end" dir="rtl" lang="ar">
                {#each verse.words as word}
                  <button
                    class="quran-word flex flex-col items-center min-w-[3rem] {playingWord?.verseNum === verse.number && playingWord?.wordPos === word.position ? 'quran-word-playing' : ''}"
                    onmouseenter={(e) => handleWordHover(e, word)}
                    onmouseleave={() => (activeWord = null)}
                    onclick={(e) => handleWordClick(e, word)}
                    aria-label={word.translation}
                  >
                    <span class="arabic-text leading-normal" style="font-size: {Math.max(fontSize * 0.8, 1.25)}rem;">{word.text}</span>
                    {#if wordBelowDisplay === 'transliteration' || wordBelowDisplay === 'both'}
                      {#if word.transliteration}
                        <span class="transliteration-text mt-1">{word.transliteration}</span>
                      {/if}
                    {/if}
                    {#if wordBelowDisplay === 'translation' || wordBelowDisplay === 'both'}
                      {#if word.translation}
                        <span class="text-[10px] text-ink/60 font-bold mt-0.5 leading-tight text-center" style="font-family: var(--font-ui); direction: ltr;">
                          {word.translation}
                        </span>
                      {/if}
                    {/if}
                  </button>
                {/each}
              </div>
            {/if}
          </div>
        {/each}
      {/if}

      </div>
      {/key}
    </div>

    <!-- Pagination controls -->
    {#if !isShortSurah && totalPages > 1 && displayMode !== 'mushaf'}
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

  <!-- Toast notification -->
  {#if toast}
    <div class="fixed bottom-20 left-1/2 -translate-x-1/2 z-[9999] border-4 border-ink bg-accent-yellow px-4 py-2 shadow-[4px_4px_0px_0px_#0D0D0D] animate-slide-up">
      <p class="font-black text-xs uppercase tracking-wider">{toast}</p>
    </div>
  {/if}

  <!-- Keyboard shortcuts help modal -->
  {#if showShortcuts}
    <div class="fixed inset-0 z-[9999] flex items-center justify-center bg-ink/40 backdrop-blur-sm"
         onclick={() => (showShortcuts = false)}>
      <div class="border-4 border-ink bg-white p-6 shadow-[8px_8px_0px_0px_#0D0D0D] max-w-md w-full mx-4 animate-brutal-pop"
           onclick={(e) => e.stopPropagation()}>
        <h3 class="font-black text-sm uppercase tracking-wider mb-4">⌨️ Keyboard Shortcuts</h3>
        <div class="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
          <div class="flex justify-between items-center gap-2"><span class="kbd">Space</span><span class="text-ink/60 font-bold">Play / Pause</span></div>
          <div class="flex justify-between items-center gap-2"><span class="kbd">→</span><span class="text-ink/60 font-bold">Next verse</span></div>
          <div class="flex justify-between items-center gap-2"><span class="kbd">←</span><span class="text-ink/60 font-bold">Prev verse</span></div>
          <div class="flex justify-between items-center gap-2"><span class="kbd">↑</span><span class="text-ink/60 font-bold">Font larger</span></div>
          <div class="flex justify-between items-center gap-2"><span class="kbd">↓</span><span class="text-ink/60 font-bold">Font smaller</span></div>
          <div class="flex justify-between items-center gap-2"><span class="kbd">M</span><span class="text-ink/60 font-bold">Display mode</span></div>
          <div class="flex justify-between items-center gap-2"><span class="kbd">N</span><span class="text-ink/60 font-bold">Night mode</span></div>
          <div class="flex justify-between items-center gap-2"><span class="kbd">Esc</span><span class="text-ink/60 font-bold">Stop / Close</span></div>
          <div class="flex justify-between items-center gap-2"><span class="kbd">?</span><span class="text-ink/60 font-bold">This help</span></div>
        </div>
        <button onclick={() => (showShortcuts = false)} class="btn-brutal-sm mt-4 w-full text-xs">Tutup</button>
      </div>
    </div>
  {/if}
</div>

<!-- Share Modal -->
{#if shareModalVerse}
  <ShareModal
    verse={shareModalVerse}
    surahName={surahInfo?.englishName ?? ''}
    surahArabicName={surahInfo?.name ?? ''}
    chapterNum={chapter}
    allVerses={verses}
    onClose={() => (shareModalVerse = null)}
  />
{/if}

<!-- Audio Player -->
<AudioPlayer
  verses={verses}
  currentVerse={audioState.currentVerse}
  playing={audioState.playing}
  autoAdvance={audioState.autoAdvance}
  repeatVerse={audioState.repeatVerse}
  nightMode={nightMode}
  onPlay={togglePlay}
  onPause={handleAudioPause}
  onStop={handleAudioStop}
  onNext={handleAudioNext}
  onPrev={handleAudioPrev}
  onAutoAdvanceToggle={toggleAutoAdvance}
  onRepeatToggle={toggleRepeat}
  onClose={handleAudioClose}
/>
