<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { Verse } from '../../lib/quran/types';
  import { PLAYBACK_SPEEDS } from '../../lib/quran/constants';

  interface Props {
    verses: Verse[];
    currentVerse: number;
    playing: boolean;
    autoAdvance: boolean;
    repeatVerse: boolean;
    nightMode?: boolean;
    onPlay: (verseNum: number) => void;
    onPause: () => void;
    onStop: () => void;
    onNext: () => void;
    onPrev: () => void;
    onAutoAdvanceToggle: () => void;
    onRepeatToggle: () => void;
    onClose: () => void;
  }

  let {
    verses, currentVerse, playing, autoAdvance, repeatVerse, nightMode = false,
    onPlay, onPause, onStop, onNext, onPrev,
    onAutoAdvanceToggle, onRepeatToggle, onClose,
  }: Props = $props();

  let audioEl: HTMLAudioElement | null = $state(null);
  let currentTime = $state(0);
  let duration = $state(0);
  let volume = $state(1);
  let speed = $state(1);
  let showVolume = $state(false);
  let seeking = $state(false);
  let duckedVolume = $state<number | null>(null); // null = not ducked
  let showMobileExtras = $state(false);

  onMount(() => {
    // Load saved prefs
    const savedVol = localStorage.getItem('ruang_quran_volume');
    const savedSpeed = localStorage.getItem('ruang_quran_speed');
    if (savedVol) volume = parseFloat(savedVol);
    if (savedSpeed) speed = parseFloat(savedSpeed);
    if (audioEl) {
      audioEl.volume = volume;
      audioEl.playbackRate = speed;
    }

    // Word audio ducking: lower main volume when word audio plays
    window.addEventListener('quran-word-audio-start', () => {
      if (audioEl && audioEl.volume > 0.3) {
        duckedVolume = audioEl.volume;
        audioEl.volume = 0.15; // Duck to 15%
      }
    });
    window.addEventListener('quran-word-audio-end', () => {
      if (audioEl && duckedVolume !== null) {
        audioEl.volume = duckedVolume;
        duckedVolume = null;
      }
    });
  });

  onDestroy(() => {
    audioEl?.pause();
  });

  // When currentVerse changes, load and play audio
  $effect(() => {
    if (!audioEl || currentVerse <= 0) return;
    const verse = verses.find(v => v.number === currentVerse);
    if (!verse?.audio?.url) return;
    if (audioEl.src !== verse.audio.url) {
      audioEl.src = verse.audio.url;
    }
    if (playing) {
      audioEl.play().catch(() => {});
    }
  });

  // Sync playing state
  $effect(() => {
    if (!audioEl) return;
    if (playing) {
      audioEl.play().catch(() => {});
    } else {
      audioEl.pause();
    }
  });

  function handleTimeUpdate() {
    if (!audioEl || seeking) return;
    currentTime = audioEl.currentTime;
    duration = audioEl.duration || 0;
    // Dispatch progress event for per-verse progress bar
    if (duration > 0 && currentVerse > 0) {
      const progress = (currentTime / duration) * 100;
      window.dispatchEvent(new CustomEvent('quran-audio-progress', {
        detail: { verseNum: currentVerse, progress }
      }));
    }
  }

  function handleLoadedMetadata() {
    if (!audioEl) return;
    duration = audioEl.duration || 0;
  }

  function handleEnded() {
    if (repeatVerse) {
      if (audioEl) {
        audioEl.currentTime = 0;
        audioEl.play().catch(() => {});
      }
      // Dispatch repeat event for counter
      window.dispatchEvent(new CustomEvent('quran-verse-repeat', {
        detail: { verseNum: currentVerse }
      }));
      return;
    }
    if (autoAdvance) {
      onNext();
    } else {
      onStop();
    }
  }

  function handleSeek(e: Event) {
    const target = e.target as HTMLInputElement;
    const fraction = parseFloat(target.value) / 100;
    if (audioEl && duration > 0) {
      audioEl.currentTime = fraction * duration;
    }
    seeking = false;
  }

  function handleSeekStart() {
    seeking = true;
  }

  function handleVolumeChange(e: Event) {
    const target = e.target as HTMLInputElement;
    volume = parseFloat(target.value) / 100;
    if (audioEl) audioEl.volume = volume;
    localStorage.setItem('ruang_quran_volume', String(volume));
  }

  function cycleSpeed() {
    const idx = PLAYBACK_SPEEDS.indexOf(speed);
    const nextIdx = (idx + 1) % PLAYBACK_SPEEDS.length;
    speed = PLAYBACK_SPEEDS[nextIdx];
    if (audioEl) audioEl.playbackRate = speed;
    localStorage.setItem('ruang_quran_speed', String(speed));
  }

  function formatTime(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  }

  const progress = $derived(duration > 0 ? (currentTime / duration) * 100 : 0);

  // Expose audio element for parent to use (word audio uses separate Audio instances)
  export function getAudioEl() { return audioEl; }

  // SVG icons
  const playIcon = '<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><polygon points="3,1 14,8 3,15"/></svg>';
  const pauseIcon = '<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><rect x="2" y="1" width="4" height="14"/><rect x="10" y="1" width="4" height="14"/></svg>';
  const stopIcon = '<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><rect x="2" y="2" width="12" height="12"/></svg>';
  const prevIcon = '<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="2" width="2" height="12"/><polygon points="14,2 5,8 14,14"/></svg>';
  const nextIcon = '<svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><polygon points="2,2 11,8 2,14"/><rect x="13" y="2" width="2" height="12"/></svg>';
</script>

{#if currentVerse > 0}
  <div class="fixed bottom-16 lg:bottom-0 left-0 right-0 z-50 bg-white border-t-4 border-ink shadow-[0_-4px_0px_0px_#0D0D0D] {nightMode ? 'quran-night-player' : ''}">
    <!-- Progress bar -->
    <div class="px-4 pt-2">
      <input
        type="range"
        min="0"
        max="100"
        step="0.5"
        value={progress}
        onmousedown={handleSeekStart}
        ontouchstart={handleSeekStart}
        onchange={handleSeek}
        class="audio-range w-full"
        aria-label="Seek audio position"
      />
      <div class="flex justify-between text-[9px] font-mono font-bold text-ink/40 mt-0.5">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>

    <!-- Controls row -->
    <div class="px-4 pb-3 flex items-center gap-2">
      <!-- Transport controls -->
      <div class="flex items-center gap-1">
        <button
          onclick={onPrev}
          class="w-8 h-8 border-2 border-ink bg-white flex items-center justify-center
                 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none
                 shadow-[2px_2px_0px_0px_#0D0D0D] hover:bg-canvas transition-all"
          aria-label="Previous verse"
        >{@html prevIcon}</button>

        <button
          onclick={() => playing ? onPause() : onPlay(currentVerse)}
          class="w-10 h-10 border-2 border-ink flex items-center justify-center
                 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none
                 shadow-[2px_2px_0px_0px_#0D0D0D] transition-all
                 {playing ? 'bg-accent-yellow' : 'bg-white hover:bg-canvas'}"
          aria-label={playing ? 'Pause' : 'Play'}
        >{@html playing ? pauseIcon : playIcon}</button>

        <button
          onclick={onStop}
          class="w-8 h-8 border-2 border-ink bg-white flex items-center justify-center
                 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none
                 shadow-[2px_2px_0px_0px_#0D0D0D] hover:bg-canvas transition-all"
          aria-label="Stop"
        >{@html stopIcon}</button>

        <button
          onclick={onNext}
          class="w-8 h-8 border-2 border-ink bg-white flex items-center justify-center
                 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none
                 shadow-[2px_2px_0px_0px_#0D0D0D] hover:bg-canvas transition-all"
          aria-label="Next verse"
        >{@html nextIcon}</button>
      </div>

      <!-- Verse info -->
      <div class="flex items-center gap-1.5 ml-2">
        <span class="text-[10px] font-black uppercase tracking-wider text-ink/40 hidden sm:inline">Ayat</span>
        <span class="font-black text-lg tabular-nums">{currentVerse}</span>
      </div>

      <!-- Spacer -->
      <div class="flex-1"></div>

      <!-- Mobile extras toggle (visible only on mobile) -->
      <button
        onclick={() => (showMobileExtras = !showMobileExtras)}
        class="sm:hidden btn-brutal-sm text-[10px] {showMobileExtras ? 'bg-accent-yellow border-ink' : ''}"
        aria-label="More controls"
      >⚙</button>

      <!-- Secondary controls (visible on desktop, toggleable on mobile) -->
      <div class="relative {showMobileExtras ? 'flex' : 'hidden'} sm:flex items-center gap-1.5
                  {showMobileExtras ? 'absolute bottom-full left-0 right-0 mb-0 p-2 bg-white border-b-2 border-ink shadow-[0_-2px_0px_0px_#0D0D0D]' : ''}">
        <!-- Speed button -->
        <button
          onclick={cycleSpeed}
          class="btn-brutal-sm text-[10px] min-w-[2.5rem] text-center
                 {speed !== 1 ? 'bg-accent-blue text-white border-ink' : ''}"
        >{speed}x</button>

        <!-- Volume -->
        <div class="relative">
          <button
            onclick={() => (showVolume = !showVolume)}
            class="btn-brutal-sm text-[10px] {showVolume ? 'bg-accent-yellow border-ink' : ''}"
            aria-label="Volume"
          >🔊</button>
          {#if showVolume}
            <div class="absolute bottom-full mb-2 right-0 bg-white border-2 border-ink p-2 shadow-[4px_4px_0px_0px_#0D0D0D] w-28">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={volume * 100}
                oninput={handleVolumeChange}
                class="audio-range w-full"
                aria-label="Volume"
              />
              <p class="text-[9px] font-bold text-ink/40 text-center mt-1">{Math.round(volume * 100)}%</p>
            </div>
          {/if}
        </div>

        <!-- Repeat toggle -->
        <button
          onclick={onRepeatToggle}
          class="btn-brutal-sm text-[10px] {repeatVerse ? 'bg-accent-pink text-white border-ink' : ''}"
          title="Repeat verse"
        >🔁</button>

        <!-- Auto-advance toggle -->
        <button
          onclick={onAutoAdvanceToggle}
          class="btn-brutal-sm text-[10px] {autoAdvance ? 'bg-accent-green text-white border-ink' : ''}"
        >{autoAdvance ? '✓ Auto' : 'Auto'}</button>
      </div>

      <!-- Close button -->
      <button
        onclick={onClose}
        class="btn-brutal-sm text-[10px] bg-accent-pink text-white border-ink"
        aria-label="Close audio player"
      >✕</button>
    </div>
  </div>
{/if}

<!-- Hidden audio element -->
<audio
  bind:this={audioEl}
  ontimeupdate={handleTimeUpdate}
  onloadedmetadata={handleLoadedMetadata}
  onended={handleEnded}
  preload="none"
></audio>
