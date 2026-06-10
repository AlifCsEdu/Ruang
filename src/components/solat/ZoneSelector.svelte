<script lang="ts">
  import { onMount } from 'svelte';
  import type { Zone } from '../../lib/solat/types';
  import { getRecentZones } from '../../lib/solat/settings';
  import { detectZone } from '../../lib/solat/geolocation';

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

  let selectedLabel = $derived(
    zones.find((z) => z.id === currentZone)?.name ?? currentZone
  );

  let recentZoneLabels = $derived(
    recentZones
      .filter((id) => id !== currentZone)
      .map((id) => ({ id, name: zones.find((z) => z.id === id)?.name ?? id }))
  );

  onMount(async () => {
    loading = true;
    recentZones = getRecentZones();
    try {
      const res = await fetch('/api/zones');
      if (res.ok) {
        const data = await res.json();
        zones = data.zones ?? [];
      }
    } catch {
      // Fail silently — zones will just be empty
    } finally {
      loading = false;
    }
  });

  function toggleDropdown() {
    isOpen = !isOpen;
    if (isOpen) {
      search = '';
      geoError = '';
      recentZones = getRecentZones();
    }
  }

  function selectZone(id: string) {
    onZoneChange(id);
    isOpen = false;
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

  function handleClickOutside(e: MouseEvent) {
    const target = e.target as HTMLElement;
    if (!target.closest('[data-zone-selector]')) {
      isOpen = false;
    }
  }
</script>

<svelte:document onclick={handleClickOutside}></svelte:document>

<div class="relative" data-zone-selector>
  <button
    onclick={toggleDropdown}
    class="btn-brutal-sm flex items-center gap-2 w-full text-left"
    aria-expanded={isOpen}
    aria-haspopup="listbox"
  >
    <span class="truncate flex-1">{selectedLabel}</span>
    <span class="shrink-0 text-xs font-mono bg-accent-yellow px-1.5 py-0.5 border border-ink">
      {currentZone}
    </span>
    <span class="shrink-0">{isOpen ? '▲' : '▼'}</span>
  </button>

  {#if isOpen}
    <div class="absolute top-full left-0 right-0 mt-1 z-50 border-4 border-ink bg-white shadow-[8px_8px_0px_0px_#0D0D0D]">
      <!-- Auto-detect button -->
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
            <span>📍</span>
            <span>Auto-Kesan Lokasi</span>
          {/if}
        </button>
        {#if geoError}
          <p class="text-xs text-accent-pink font-bold mt-1 text-center">{geoError}</p>
        {/if}
      </div>

      {#if recentZoneLabels.length > 0}
        <div class="px-2 py-2 border-b-2 border-ink">
          <span class="text-xs font-black uppercase tracking-wider text-ink/60 block mb-1">Zon Terkini</span>
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
      <div class="p-2 border-b-2 border-ink">
        <input
          type="text"
          bind:value={search}
          placeholder="Cari zon..."
          class="input-brutal w-full text-sm !shadow-none"
          aria-label="Search zones"
        />
      </div>

      <!-- Zone list -->
      <div class="max-h-64 overflow-y-auto" role="listbox">
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
            <div class="px-2 py-1 bg-canvas border-b border-ink/20 sticky top-0">
              <span class="text-xs font-black uppercase tracking-wider text-ink/60">{state}</span>
            </div>
            {#each stateZones as zone}
              <button
                onclick={() => selectZone(zone.id)}
                class="w-full text-left px-3 py-2 text-sm border-b border-ink/10
                       hover:bg-accent-yellow/30 transition-colors duration-75
                       flex items-center gap-2 cursor-pointer
                       {zone.id === currentZone ? 'bg-accent-blue/10 font-bold' : ''}"
                role="option"
                aria-selected={zone.id === currentZone}
              >
                <span class="font-mono text-xs bg-ink text-white px-1.5 py-0.5 shrink-0">
                  {zone.id}
                </span>
                <span class="truncate">{zone.name}</span>
              </button>
            {/each}
          {/each}
        {/if}
      </div>
    </div>
  {/if}
</div>
