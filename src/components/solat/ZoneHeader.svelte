<script lang="ts">
  import { onMount } from 'svelte';
  import { loadSettings, setZone, type SolatSettings } from '../../lib/solat/settings';
  import ZoneSelector from './ZoneSelector.svelte';
  import { detectZone } from '../../lib/solat/geolocation';
  import { renderFlagSvg } from '../../lib/solat/stateFlags';

  let zone = $state('SGR01');
  let zoneName = $state('');
  let zoneState = $state('');
  let zones = $state<{ id: string; name: string; state: string }[]>([]);
  let autoDetect = $state(false);
  let detecting = $state(false);
  let imsakTime = $state<string | null>(null);
  let showAutoToast = $state<{ message: string; type: 'info' | 'success' | 'error' } | null>(null);

  onMount(async () => {
    const settings = loadSettings();
    zone = settings.zone;
    autoDetect = settings.autoDetectLocation ?? false;

    // Load zones list for name display
    try {
      const res = await fetch('/api/zones');
      if (res.ok) {
        const data = await res.json();
        zones = data.zones ?? [];
        updateZoneInfo();
      }
    } catch {}

    // Listen for prayer data updates (imsak time)
    window.addEventListener('solat-prayer-data', ((e: CustomEvent<{ imsak?: string }>) => {
      if (e.detail.imsak) imsakTime = e.detail.imsak;
    }) as EventListener);

    // Auto-detect on mount if enabled
    if (autoDetect) {
      runAutoDetect();
    }
  });

  function updateZoneInfo() {
    const z = zones.find(zz => zz.id === zone);
    if (z) {
      zoneName = `${z.name}`;
      zoneState = z.state;
    } else {
      zoneName = zone;
      zoneState = '';
    }
  }

  function handleZoneChange(newZone: string) {
    zone = newZone;
    setZone(newZone);
    updateZoneInfo();
  }

  async function runAutoDetect() {
    detecting = true;
    try {
      const result = await detectZone();
      if (result.ok) {
        if (result.zone !== zone) {
          handleZoneChange(result.zone);
          showAutoToast = { message: `📍 Zon dikesan: ${result.zone} (${result.distanceKm}km)`, type: 'success' };
          setTimeout(() => showAutoToast = null, 5000);
        }
      } else {
        showAutoToast = { message: `Auto-detect gagal: ${result.message}`, type: 'error' };
        setTimeout(() => showAutoToast = null, 5000);
      }
    } catch {
      showAutoToast = { message: 'Auto-detect gagal', type: 'error' };
      setTimeout(() => showAutoToast = null, 5000);
    } finally {
      detecting = false;
    }
  }

  function flagHtml(state: string): string {
    return renderFlagSvg(state, 28, 20);
  }
</script>

<div class="card-brutal-sm mb-4">
  <div class="flex items-center justify-between gap-3 flex-wrap">
    <!-- Zone info with flag -->
    <div class="flex items-center gap-3 min-w-0 flex-1">
      {#if zoneState}
        <span class="shrink-0 w-7 h-5 border-2 border-ink overflow-hidden bg-white flex items-center justify-center" aria-hidden="true">
          {@html flagHtml(zoneState)}
        </span>
      {:else}
        <span class="text-2xl">📍</span>
      {/if}
      <div class="min-w-0 flex-1">
        <p class="text-[10px] font-black uppercase tracking-wider text-ink/40">Zon Semasa</p>
        <p class="text-sm font-black truncate">{zoneName || 'Loading...'}</p>
        {#if zoneState}
          <p class="text-[10px] font-bold text-ink/40">{zoneState}</p>
        {/if}
      </div>
      <span class="chip-brutal bg-accent-yellow shrink-0">{zone}</span>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-2 shrink-0">
      {#if imsakTime}
        <span class="text-[10px] font-bold text-ink/40">Imsak: {imsakTime}</span>
      {/if}
      <a
        href="/solat/tv?zone={zone}"
        class="btn-brutal-sm text-[10px] bg-accent-green text-white border-ink flex items-center gap-1"
        aria-label="Open full screen mode"
      >⛶ Skrin Penuh</a>
      <button
        onclick={runAutoDetect}
        disabled={detecting}
        class="btn-brutal-sm text-[10px] bg-accent-blue text-white border-ink flex items-center gap-1
               disabled:opacity-50 disabled:cursor-wait"
        aria-label="Auto-detect location"
      >
        {#if detecting}
          <span class="animate-spin">⟳</span> Mengesan...
        {:else}
          <span class="relative flex h-2.5 w-2.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
          </span>
          Auto-Lokasi
        {/if}
      </button>
    </div>
  </div>

  <!-- Zone selector dropdown -->
  <div class="mt-3">
    <ZoneSelector currentZone={zone} onZoneChange={handleZoneChange} />
  </div>

  <!-- Auto-detect toast -->
  {#if showAutoToast}
    <div class="mt-2 px-3 py-2 text-[10px] font-bold border-2 border-ink
                {showAutoToast.type === 'success' ? 'bg-accent-green/10 text-accent-green' :
                 showAutoToast.type === 'error' ? 'bg-accent-pink/10 text-accent-pink' :
                 'bg-accent-blue/10 text-accent-blue'}"
         role="alert">
      {showAutoToast.message}
    </div>
  {/if}
</div>
