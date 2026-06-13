<script lang="ts">
  import { onMount } from 'svelte';
  import { RECITERS, TRANSLATIONS } from '../../lib/quran/constants';

  interface Props {
    currentReciter: number;
    currentTranslation: number;
  }

  let { currentReciter, currentTranslation }: Props = $props();

  let reciter = $state(currentReciter);
  let translation = $state(currentTranslation);
  let open = $state(false);

  onMount(() => {
    // Load saved preferences
    const savedReciter = localStorage.getItem('ruang_quran_reciter');
    const savedTranslation = localStorage.getItem('ruang_quran_translation');
    if (savedReciter) reciter = parseInt(savedReciter, 10);
    if (savedTranslation) translation = parseInt(savedTranslation, 10);
  });

  function applySettings() {
    localStorage.setItem('ruang_quran_reciter', String(reciter));
    localStorage.setItem('ruang_quran_translation', String(translation));
    window.dispatchEvent(new CustomEvent('quran-settings-changed', {
      detail: { reciter, translation },
    }));
    open = false;
  }

  function resetDefaults() {
    reciter = 7;
    translation = 131;
  }
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

  <!-- Dropdown panel -->
  {#if open}
    <div class="absolute top-full mt-2 right-0 z-30 w-[calc(100vw-2rem)] max-w-72 sm:w-72 border-4 border-ink bg-white shadow-[8px_8px_0px_0px_#0D0D0D]">
      <div class="p-4 flex flex-col gap-4">
        <h3 class="font-black text-xs uppercase tracking-wider border-b-2 border-ink pb-2">Quran Settings</h3>

        <!-- Reciter -->
        <div role="group" aria-labelledby="reciter-label">
          <div id="reciter-label" class="text-[10px] font-black uppercase tracking-wider text-ink/60 mb-1.5">Reciter</div>
          <div class="flex flex-col gap-1">
            {#each RECITERS as r}
              <button
                onclick={() => (reciter = r.id)}
                class="text-left px-2 py-1.5 border-2 text-xs font-bold transition-all duration-75
                       {reciter === r.id ? 'border-ink bg-accent-yellow/20' : 'border-ink/20 hover:border-ink/40 bg-white'}"
              >
                <span>{r.name}</span>
                {#if r.style}
                  <span class="text-[10px] text-ink/40 ml-1">({r.style})</span>
                {/if}
              </button>
            {/each}
          </div>
        </div>

        <!-- Translation -->
        <div role="group" aria-labelledby="translation-label">
          <div id="translation-label" class="text-[10px] font-black uppercase tracking-wider text-ink/60 mb-1.5">Translation</div>
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
        </div>

        <!-- Actions -->
        <div class="flex gap-2">
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
