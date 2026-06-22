<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { RECITERS, TRANSLATIONS, SCRIPT_TYPES, WORD_BELOW_OPTIONS, PLAYBACK_SPEEDS, FONT_SIZE_MIN, FONT_SIZE_MAX, FONT_SIZE_DEFAULT, LS_FONT_SIZE, LS_SCRIPT_TYPE, LS_WORD_BELOW } from '../../lib/quran/constants';
  import type { ScriptType, WordBelowDisplay } from '../../lib/quran/types';

  interface Props {
    currentReciter: number;
    currentTranslation: number;
    currentScriptType?: ScriptType;
    currentFontSize?: number;
    currentWordBelow?: WordBelowDisplay;
  }

  let { currentReciter, currentTranslation, currentScriptType = 'uthmani', currentFontSize = FONT_SIZE_DEFAULT, currentWordBelow = 'translation' }: Props = $props();

  let reciter = $state(currentReciter);
  let translation = $state(currentTranslation);
  let scriptType = $state<ScriptType>(currentScriptType);
  let fontSize = $state(currentFontSize);
  let wordBelow = $state<WordBelowDisplay>(currentWordBelow);
  let open = $state(false);
  let activeSection = $state<'reciter' | 'translation' | 'display' | 'audio'>('reciter');

  function handleSettingsKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape' && open) {
      e.preventDefault();
      e.stopPropagation();
      open = false;
    }
  }

  onMount(() => {
    const savedReciter = localStorage.getItem('ruang_quran_reciter');
    const savedTranslation = localStorage.getItem('ruang_quran_translation');
    const savedFontSize = localStorage.getItem(LS_FONT_SIZE);
    const savedScript = localStorage.getItem(LS_SCRIPT_TYPE);
    const savedWordBelow = localStorage.getItem(LS_WORD_BELOW);
    if (savedReciter) reciter = parseInt(savedReciter, 10);
    if (savedTranslation) translation = parseInt(savedTranslation, 10);
    if (savedFontSize) fontSize = parseFloat(savedFontSize);
    if (savedScript) scriptType = savedScript as ScriptType;
    if (savedWordBelow) wordBelow = savedWordBelow as WordBelowDisplay;
    window.addEventListener('keydown', handleSettingsKeydown);
  });

  onDestroy(() => {
    window.removeEventListener('keydown', handleSettingsKeydown);
  });

  function applySettings() {
    localStorage.setItem('ruang_quran_reciter', String(reciter));
    localStorage.setItem('ruang_quran_translation', String(translation));
    localStorage.setItem(LS_FONT_SIZE, String(fontSize));
    localStorage.setItem(LS_SCRIPT_TYPE, scriptType);
    localStorage.setItem(LS_WORD_BELOW, wordBelow);
    window.dispatchEvent(new CustomEvent('quran-settings-changed', {
      detail: { reciter, translation, scriptType, fontSize, wordBelowDisplay: wordBelow },
    }));
    open = false;
  }

  function resetDefaults() {
    reciter = 7;
    translation = 20;
    scriptType = 'uthmani';
    fontSize = FONT_SIZE_DEFAULT;
    wordBelow = 'translation';
  }

  const SECTIONS = [
    { key: 'reciter' as const, label: 'Qari', icon: '🎤' },
    { key: 'translation' as const, label: 'Terjemahan', icon: '📝' },
    { key: 'display' as const, label: 'Paparan', icon: '🔤' },
    { key: 'audio' as const, label: 'Audio', icon: '🔊' },
  ];
</script>

<div class="relative">
  <!-- Toggle button -->
  <button
    onclick={() => (open = !open)}
    class="btn-brutal-sm text-[10px] flex items-center gap-1.5
           {open ? 'bg-accent-blue text-white border-ink' : ''}"
  >
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
      <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
    Settings
  </button>

  <!-- Modal overlay -->
  {#if open}
    <!-- Backdrop -->
    <div
      class="fixed inset-0 z-[9998] bg-ink/20 backdrop-blur-sm"
      onclick={() => (open = false)}
      role="presentation"
    ></div>

    <!-- Modal panel -->
    <div class="fixed inset-x-4 top-1/2 -translate-y-1/2 sm:inset-x-auto sm:right-4 sm:top-16 sm:translate-y-0 sm:w-80 z-[9999] border-4 border-ink bg-white shadow-[8px_8px_0px_0px_#0D0D0D] animate-brutal-pop max-h-[85vh] flex flex-col">
      <!-- Close button -->
      <button
        onclick={() => (open = false)}
        class="absolute top-2 right-2 w-6 h-6 border-2 border-ink flex items-center justify-center text-[10px] font-black hover:bg-accent-pink hover:text-white transition-colors z-10"
        aria-label="Close settings"
      >✕</button>
      <!-- Section tabs -->
      <div class="flex border-b-2 border-ink overflow-x-auto">
        {#each SECTIONS as sec}
          <button
            onclick={() => (activeSection = sec.key)}
            class="flex-1 min-w-[4rem] px-2 py-2 text-[9px] font-black uppercase tracking-wider transition-colors duration-75
                   {activeSection === sec.key ? 'bg-ink text-white' : 'bg-white text-ink hover:bg-canvas'}"
          >{sec.icon}</button>
        {/each}
      </div>

      <div class="p-3 flex flex-col gap-3 overflow-y-auto flex-1">
        <h3 class="font-black text-xs uppercase tracking-wider border-b-2 border-ink pb-2">
          {SECTIONS.find(s => s.key === activeSection)?.label ?? 'Settings'}
        </h3>

        <!-- Reciter section -->
        {#if activeSection === 'reciter'}
          <div class="flex flex-col gap-1 max-h-48 overflow-y-auto">
            {#each RECITERS as r}
              <button
                onclick={() => (reciter = r.id)}
                class="text-left px-2 py-1.5 border-2 text-xs font-bold transition-all duration-75
                       {reciter === r.id ? 'border-ink bg-accent-yellow/20' : 'border-ink/20 hover:border-ink/40 bg-white'}"
              >
                <span>{r.name}</span>
                {#if r.style}<span class="text-[10px] text-ink/40 ml-1">({r.style})</span>{/if}
              </button>
            {/each}
          </div>

        <!-- Translation section -->
        {:else if activeSection === 'translation'}
          <div class="flex flex-col gap-1">
            {#each TRANSLATIONS as t}
              <button
                onclick={() => (translation = t.id)}
                class="text-left px-2 py-1.5 border-2 text-xs font-bold transition-all duration-75
                       {translation === t.id ? 'border-ink bg-accent-blue/10' : 'border-ink/20 hover:border-ink/40 bg-white'}"
              >
                <span>{t.name}</span>
                <span class="text-[10px] text-ink/40 ml-1 uppercase">({t.language})</span>
              </button>
            {/each}
          </div>

        <!-- Display section (script, font size, word below) -->
        {:else if activeSection === 'display'}
          <!-- Script type -->
          <div>
            <p class="text-[10px] font-black uppercase tracking-wider text-ink/60 mb-1">Script Style</p>
            <div class="flex gap-1">
              {#each SCRIPT_TYPES as st}
                <button
                  onclick={() => (scriptType = st.id)}
                  class="flex-1 px-2 py-1.5 border-2 text-[10px] font-black uppercase tracking-wider transition-all duration-75
                         {scriptType === st.id ? 'border-ink bg-accent-green/20 shadow-[2px_2px_0px_0px_#0D0D0D]' : 'border-ink/20 hover:border-ink/40 bg-white'}"
                >{st.name}</button>
              {/each}
            </div>
            <p class="text-[9px] text-ink/40 mt-0.5">{SCRIPT_TYPES.find(s => s.id === scriptType)?.description}</p>
          </div>

          <!-- Font size -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <p class="text-[10px] font-black uppercase tracking-wider text-ink/60">Font Size</p>
              <span class="text-[10px] font-bold text-ink/50">{fontSize}rem</span>
            </div>
            <input
              type="range"
              min={FONT_SIZE_MIN}
              max={FONT_SIZE_MAX}
              step="0.25"
              bind:value={fontSize}
              class="w-full accent-accent-blue"
            />
          </div>

          <!-- Word below display -->
          <div>
            <p class="text-[10px] font-black uppercase tracking-wider text-ink/60 mb-1">Below Word (Perkataan)</p>
            <div class="flex gap-1">
              {#each WORD_BELOW_OPTIONS as opt}
                <button
                  onclick={() => (wordBelow = opt.id)}
                  class="flex-1 px-1.5 py-1.5 border-2 text-[9px] font-black uppercase tracking-wider transition-all duration-75
                         {wordBelow === opt.id ? 'border-ink bg-accent-blue/10 shadow-[2px_2px_0px_0px_#0D0D0D]' : 'border-ink/20 hover:border-ink/40 bg-white'}"
                >{opt.label}</button>
              {/each}
            </div>
          </div>

        <!-- Audio section -->
        {:else if activeSection === 'audio'}
          <p class="text-[10px] text-ink/40 font-bold">Audio settings are controlled from the player bar during playback. Use the speed and volume buttons on the audio player.</p>
        {/if}

        <!-- Actions -->
        <div class="flex gap-2 border-t-2 border-ink/10 pt-2">
          <button
            onclick={applySettings}
            class="flex-1 btn-brutal-sm text-xs bg-accent-green text-white border-ink"
          >Apply</button>
          <button
            onclick={resetDefaults}
            class="btn-brutal-sm text-[10px]"
          >Reset</button>
        </div>
      </div>
    </div>
  {/if}
</div>
