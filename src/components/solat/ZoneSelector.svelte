<script lang="ts">
  import { onMount } from 'svelte';
  import type { Zone } from '../../lib/solat/types';
  import { getRecentZones, getFavoriteZones, addFavoriteZone, removeFavoriteZone } from '../../lib/solat/settings';
  import { detectZone } from '../../lib/solat/geolocation';
  import { renderFlagSvg } from '../../lib/solat/stateFlags';

  interface Props {
    currentZone: string;
    onZoneChange: (zone: string) => void;
  }

  let { currentZone, onZoneChange }: Props = $props();

  let zones = $state<Zone[]>([]);
  let isOpen = $state(false);
  let search = $state('');
  let loading = $state(false);
  let detecting = $state(false);
  let geoError = $state('');
  let recentZones = $state<string[]>([]);
  let favoriteZones = $state<string[]>([]);
  let highlightIndex = $state(-1);
  let listEl: HTMLDivElement | undefined = $state();

  let filteredZones = $derived(
    zones.filter(
      (z) =>
        z.id.toLowerCase().includes(search.toLowerCase()) ||
        z.name.toLowerCase().includes(search.toLowerCase()) ||
        z.state.toLowerCase().includes(search.toLowerCase())
    )
  );

  // Group zones by state
  let groupedZones = $derived(
    filteredZones.reduce<Record<string, Zone[]>>((acc, zone) => {
      if (!acc[zone.state]) acc[zone.state] = [];
      acc[zone.state].push(zone);
      return acc;
    }, {})
  );

  // Flat list for keyboard navigation
  let flatList = $derived(filteredZones);

  let selectedZone = $derived(zones.find((z) => z.id === currentZone));
  let selectedLabel = $derived(selectedZone?.name ?? currentZone);
  let selectedState = $derived(selectedZone?.state ?? '');

  let recentZoneLabels = $derived(
    recentZones
      .filter((id) => id !== currentZone)
      .map((id) => ({ id, name: zones.find((z) => z.id === id)?.name ?? id, state: zones.find((z) => z.id === id)?.state ?? '' }))
  );

  let favoriteZoneLabels = $derived(
    favoriteZones
      .filter((id) => id !== currentZone)
      .map((id) => ({ id, name: zones.find((z) => z.id === id)?.name ?? id, state: zones.find((z) => z.id === id)?.state ?? '' }))
  );

  onMount(async () => {
    loading = true;
    recentZones = getRecentZones();
    favoriteZones = getFavoriteZones();
    try {
      const res = await fetch('/api/zones');
      if (res.ok) {
        const data = await res.json();
        zones = data.zones ?? [];
      }
    } catch {
      // Fail silently
    } finally {
      loading = false;
    }
  });

  function toggleDropdown() {
    isOpen = !isOpen;
    if (isOpen) {
      search = '';
      geoError = '';
      highlightIndex = -1;
      recentZones = getRecentZones();
      favoriteZones = getFavoriteZones();
    }
  }

  function selectZone(id: string) {
    onZoneChange(id);
    isOpen = false;
    highlightIndex = -1;
  }

  function toggleFavorite(id: string, e: MouseEvent) {
    e.stopPropagation();
    if (favoriteZones.includes(id)) {
      removeFavoriteZone(id);
      favoriteZones = favoriteZones.filter((z) => z !== id);
    } else {
      addFavoriteZone(id);
      favoriteZones = [...favoriteZones, id].slice(0, 5);
    }
  }

  async function handleAutoDetect() {
    detecting = true;
    geoError = '';
    try {
      const result = await detectZone();
      if (result.ok) {
        selectZone(result.zone);
      } else {
        geoError = result.message;
      }
    } catch {
      geoError = 'Gagal mengesan lokasi';
    } finally {
      detecting = false;
    }
  }

  function handleKeydown(e: KeyboardEvent) {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        toggleDropdown();
      }
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        highlightIndex = Math.min(highlightIndex + 1, flatList.length - 1);
        scrollHighlight();
        break;
      case 'ArrowUp':
        e.preventDefault();
        highlightIndex = Math.max(highlightIndex - 1, 0);
        scrollHighlight();
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightIndex >= 0 && highlightIndex < flatList.length) {
          selectZone(flatList[highlightIndex].id);
        }
        break;
      case 'Escape':
        e.preventDefault();
        isOpen = false;
        break;
    }
  }

  function scrollHighlight() {
    if (!listEl) return;
    const items = listEl.querySelectorAll('[data-zone-item]');
    const target = items[highlightIndex] as HTMLElement;
    if (target) target.scrollIntoView({ block: 'nearest' });
  }

  function handleClickOutside(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target.closest('[data-zone-selector]')) {
      isOpen = false;
    }
  }

  function flagHtml(state: string): string {
    return renderFlagSvg(state, 20, 14);
  }
</script>

<svelte:document onclick={handleClickOutside}></svelte:document>

<div class="relative" data-zone-selector>
  <button
    onclick={toggleDropdown}
    onkeydown={handleKeydown}
    class="btn-brutal-sm flex items-center gap-2 w-full text-left"
    aria-expanded={isOpen}
    aria-haspopup="listbox"
    aria-label="Select prayer zone, currently {selectedLabel}"
  >
    {#if selectedState}
      <span class="shrink-0 w-5 h-3.5 border border-ink/30 overflow-hidden" aria-hidden="true">
        {@html flagHtml(selectedState)}
      </span>
    {/if}
    <span class="truncate flex-1">{selectedLabel}</span>
    <span class="shrink-0 text-xs font-mono bg-accent-yellow px-1.5 py-0.5 border border-ink">
      {currentZone}
    </span>
    <span class="shrink-0">{isOpen ? '▲' : '▼'}</span>
  </button>

  {#if isOpen}
    <div class="absolute top-full left-0 right-0 mt-1 z-50 border-4 border-ink bg-white shadow-[8px_8px_0px_0px_#0D0D0D]" role="dialog" aria-label="Zone selector">
      <!-- Auto-detect button (prominent) -->
      <div class="p-2 border-b-2 border-ink">
        <button
          onclick={handleAutoDetect}
          disabled={detecting}
          class="btn-brutal-sm w-full flex items-center justify-center gap-2 !bg-accent-blue !text-white
                 hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[4px_4px_0px_0px_#0D0D0D]
                 disabled:opacity-50 disabled:cursor-wait transition-all"
        >
          {#if detecting}
            <span class="animate-spin">⟳</span>
            <span>Mengesan lokasi...</span>
          {:else}
            <span class="relative flex h-3 w-3">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            <span>📍 Auto-Lokasi</span>
          {/if}
        </button>
        {#if geoError}
          <p class="text-xs text-accent-pink font-bold mt-1 text-center">{geoError}</p>
        {/if}
      </div>

      <!-- Favorite zones -->
      {#if favoriteZoneLabels.length > 0}
        <div class="px-2 py-2 border-b-2 border-ink">
          <span class="text-xs font-black uppercase tracking-wider text-ink/60 block mb-1">⭐ Kegemaran</span>
          <div class="flex flex-wrap gap-1">
            {#each favoriteZoneLabels as fz}
              <button
                onclick={() => selectZone(fz.id)}
                class="text-xs font-bold px-2 py-1 border-2 border-ink bg-accent-green/20
                       hover:bg-accent-green/40 transition-colors cursor-pointer flex items-center gap-1"
              >
                <span class="w-4 h-3 border border-ink/20 overflow-hidden" aria-hidden="true">
                  {@html flagHtml(fz.state)}
                </span>
                <span class="font-mono">{fz.id}</span>
              </button>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Recent zones -->
      {#if recentZoneLabels.length > 0}
        <div class="px-2 py-2 border-b-2 border-ink">
          <span class="text-xs font-black uppercase tracking-wider text-ink/60 block mb-1">🕐 Terkini</span>
          <div class="flex flex-wrap gap-1">
            {#each recentZoneLabels as rz}
              <button
                onclick={() => selectZone(rz.id)}
                class="text-xs font-bold px-2 py-1 border-2 border-ink bg-accent-yellow/50
                       hover:bg-accent-yellow transition-colors cursor-pointer"
              >
                <span class="font-mono">{rz.id}</span>
                <span class="ml-1 truncate max-w-[100px] inline-block align-middle">{rz.name}</span>
              </button>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Search input -->
      <div class="p-2 border-b-2 border-ink relative">
        <input
          type="text"
          bind:value={search}
          onkeydown={handleKeydown}
          placeholder="Cari zon atau negeri..."
          class="input-brutal w-full text-sm !shadow-none pr-8"
          aria-label="Search zones"
        />
        {#if search}
          <button
            onclick={() => { search = ''; }}
            class="absolute right-4 top-1/2 -translate-y-1/2 text-ink/40 hover:text-ink font-black text-sm"
            aria-label="Clear search"
          >✕</button>
        {/if}
      </div>

      <!-- Zone list -->
      <div class="max-h-64 overflow-y-auto" role="listbox" bind:this={listEl}>
        {#if loading}
          <div class="p-4 text-center text-ink/50 font-bold text-sm">
            Loading zones...
          </div>
        {:else if filteredZones.length === 0}
          <div class="p-4 text-center text-ink/50 font-bold text-sm">
            No zones found
          </div>
        {:else}
          {#each Object.entries(groupedZones) as [state, stateZones]}
            <div class="px-2 py-1.5 bg-canvas border-b border-ink/20 sticky top-0 flex items-center gap-2" style="border-left: 4px solid #0038FF;">
              <span class="w-5 h-3.5 border border-ink/30 overflow-hidden shrink-0" aria-hidden="true">
                {@html flagHtml(state)}
              </span>
              <span class="text-xs font-black uppercase tracking-wider text-ink/60">{state}</span>
            </div>
            {#each stateZones as zone, i}
              {@const flatIdx = flatList.indexOf(zone)}
              <div
                data-zone-item
                role="option"
                tabindex="0"
                onclick={() => selectZone(zone.id)}
                onkeydown={handleKeydown}
                class="w-full text-left px-3 py-2 text-sm border-b border-ink/10
                       hover:bg-accent-yellow/30 transition-colors duration-75
                       flex items-center gap-2 cursor-pointer
                       {zone.id === currentZone ? 'bg-accent-blue/10 font-bold' : ''}
                       {flatIdx === highlightIndex ? 'bg-accent-yellow/50' : ''}"
                aria-selected={zone.id === currentZone}
              >
                <span class="font-mono text-xs bg-ink text-white px-1.5 py-0.5 shrink-0">
                  {zone.id}
                </span>
                <span class="truncate flex-1">{zone.name}</span>
                <button
                  onclick={(e) => toggleFavorite(zone.id, e)}
                  class="shrink-0 w-6 h-6 flex items-center justify-center hover:bg-accent-yellow/50 transition-colors text-sm"
                  aria-label="{favoriteZones.includes(zone.id) ? 'Remove from' : 'Add to'} favorites"
                  title="{favoriteZones.includes(zone.id) ? 'Buang dari kegemaran' : 'Tambah ke kegemaran'}"
                >
                  {favoriteZones.includes(zone.id) ? '⭐' : '☆'}
                </button>
              </div>
            {/each}
          {/each}
        {/if}
      </div>
    </div>
  {/if}
</div>
