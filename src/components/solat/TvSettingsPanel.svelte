<script lang="ts">
  import type { TvDisplaySettings, IqamahConfig } from '../../lib/solat/types';
  import { buildTvShareUrl } from '../../lib/solat/tvSettings';

  interface Props {
    settings: TvDisplaySettings;
    onApply: (settings: TvDisplaySettings) => void;
    onClose: () => void;
  }

  let { settings, onApply, onClose }: Props = $props();

  let local = $state<TvDisplaySettings>({ ...settings, iqamah: { ...settings.iqamah } });
  let shareUrl = $state('');
  let copied = $state(false);

  function handleApply() {
    onApply(local);
  }

  function handleCopyShareUrl() {
    shareUrl = buildTvShareUrl(local, window.location.origin);
    navigator.clipboard.writeText(shareUrl).then(() => {
      copied = true;
      setTimeout(() => { copied = false; }, 3000);
    }).catch(() => {
      // Fallback: show URL for manual copy
    });
  }

  function updateIqamah(key: keyof IqamahConfig, value: number) {
    local.iqamah = { ...local.iqamah, [key]: Math.max(0, Math.min(60, value)) };
  }
</script>

<!-- Backdrop -->
<div class="fixed inset-0 z-[90] bg-black/50" onclick={onClose} role="presentation"></div>

<!-- Panel -->
<div class="fixed top-0 right-0 bottom-0 z-[91] w-full max-w-sm overflow-y-auto border-l-4 border-ink p-6 flex flex-col gap-5
            {settings.darkMode ? 'bg-[#1A1A1A] text-[#F8F5F2]' : 'bg-white text-[#0D0D0D]'}"
     role="dialog" aria-label="Full Screen Display Settings">

  <!-- Header -->
  <div class="flex items-center justify-between">
    <h2 class="text-lg font-black uppercase tracking-wider">⚙️ Tetapan Skrin Penuh</h2>
    <button onclick={onClose} class="w-8 h-8 flex items-center justify-center border-2 border-current/30 hover:bg-current/10 transition-colors font-black" aria-label="Close settings">✕</button>
  </div>

  <!-- Mosque Name -->
  <div>
    <label class="text-xs font-black uppercase tracking-wider opacity-60 block mb-1">Nama Masjid</label>
    <input
      type="text"
      bind:value={local.mosqueName}
      placeholder="Masjid Al-Rahman"
      class="w-full px-3 py-2 border-2 border-current/30 bg-transparent font-bold text-sm focus:outline-none focus:border-current"
    />
  </div>

  <!-- Zone -->
  <div>
    <label class="text-xs font-black uppercase tracking-wider opacity-60 block mb-1">Zon</label>
    <input
      type="text"
      bind:value={local.zone}
      placeholder="SGR01"
      class="w-full px-3 py-2 border-2 border-current/30 bg-transparent font-mono font-bold text-sm focus:outline-none focus:border-current"
    />
  </div>

  <!-- Dark Mode -->
  <div class="flex items-center justify-between">
    <span class="text-sm font-bold">Mod Gelap</span>
    <button
      onclick={() => { local.darkMode = !local.darkMode; }}
      class="w-12 h-6 relative border-2 border-current/30 transition-colors {local.darkMode ? 'bg-accent-green' : 'bg-transparent'}"
      role="switch"
      aria-checked={local.darkMode}
    >
      <span class="absolute top-0.5 w-4 h-4 bg-current border-2 border-current/30 transition-transform {local.darkMode ? 'left-[26px]' : 'left-0.5'}"></span>
    </button>
  </div>

  <!-- Font Size -->
  <div>
    <label class="text-xs font-black uppercase tracking-wider opacity-60 block mb-1">Saiz Fon</label>
    <div class="flex gap-2">
      {#each ['normal', 'large', 'xlarge', 'xxlarge'] as size}
        <button
          onclick={() => { local.fontSize = size as TvDisplaySettings['fontSize']; }}
          class="flex-1 py-2 text-xs font-black uppercase border-2 transition-colors
                 {local.fontSize === size ? 'border-current bg-current/20' : 'border-current/20 hover:border-current/50'}"
        >{size}</button>
      {/each}
    </div>
  </div>

  <!-- Show Seconds -->
  <div class="flex items-center justify-between">
    <span class="text-sm font-bold">Papar Saat</span>
    <button
      onclick={() => { local.showSeconds = !local.showSeconds; }}
      class="w-12 h-6 relative border-2 border-current/30 transition-colors {local.showSeconds ? 'bg-accent-green' : 'bg-transparent'}"
      role="switch"
      aria-checked={local.showSeconds}
    >
      <span class="absolute top-0.5 w-4 h-4 bg-current border-2 border-current/30 transition-transform {local.showSeconds ? 'left-[26px]' : 'left-0.5'}"></span>
    </button>
  </div>

  <!-- 24h Clock -->
  <div class="flex items-center justify-between">
    <span class="text-sm font-bold">Jam 24 Jam</span>
    <button
      onclick={() => { local.use24h = !local.use24h; }}
      class="w-12 h-6 relative border-2 border-current/30 transition-colors {local.use24h ? 'bg-accent-green' : 'bg-transparent'}"
      role="switch"
      aria-checked={local.use24h}
    >
      <span class="absolute top-0.5 w-4 h-4 bg-current border-2 border-current/30 transition-transform {local.use24h ? 'left-[26px]' : 'left-0.5'}"></span>
    </button>
  </div>

  <!-- Show Hijri -->
  <div class="flex items-center justify-between">
    <span class="text-sm font-bold">Papar Tarikh Hijri</span>
    <button
      onclick={() => { local.showHijri = !local.showHijri; }}
      class="w-12 h-6 relative border-2 border-current/30 transition-colors {local.showHijri ? 'bg-accent-green' : 'bg-transparent'}"
      role="switch"
      aria-checked={local.showHijri}
    >
      <span class="absolute top-0.5 w-4 h-4 bg-current border-2 border-current/30 transition-transform {local.showHijri ? 'left-[26px]' : 'left-0.5'}"></span>
    </button>
  </div>

  <!-- Adhan Reminder -->
  <div class="flex items-center justify-between">
    <span class="text-sm font-bold">Peringatan Azan</span>
    <button
      onclick={() => { local.adhanReminder = !local.adhanReminder; }}
      class="w-12 h-6 relative border-2 border-current/30 transition-colors {local.adhanReminder ? 'bg-accent-green' : 'bg-transparent'}"
      role="switch"
      aria-checked={local.adhanReminder}
    >
      <span class="absolute top-0.5 w-4 h-4 bg-current border-2 border-current/30 transition-transform {local.adhanReminder ? 'left-[26px]' : 'left-0.5'}"></span>
    </button>
  </div>

  <!-- Screensaver Prevention -->
  <div class="flex items-center justify-between">
    <span class="text-sm font-bold">Halang Screensaver</span>
    <button
      onclick={() => { local.screensaverPrevention = !local.screensaverPrevention; }}
      class="w-12 h-6 relative border-2 border-current/30 transition-colors {local.screensaverPrevention ? 'bg-accent-green' : 'bg-transparent'}"
      role="switch"
      aria-checked={local.screensaverPrevention}
    >
      <span class="absolute top-0.5 w-4 h-4 bg-current border-2 border-current/30 transition-transform {local.screensaverPrevention ? 'left-[26px]' : 'left-0.5'}"></span>
    </button>
  </div>

  <!-- Iqamah Delays -->
  <div>
    <label class="text-xs font-black uppercase tracking-wider opacity-60 block mb-2">Minit Iqamah</label>
    <div class="grid grid-cols-2 gap-2">
      {#each ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as key}
        {@const labels: Record<string, string> = { fajr: 'Subuh', dhuhr: 'Zohor', asr: 'Asar', maghrib: 'Maghrib', isha: 'Isyak' }}
        <div class="flex items-center gap-2">
          <span class="text-xs font-bold w-14">{labels[key]}</span>
          <input
            type="number"
            min="0"
            max="60"
            value={local.iqamah[key as keyof IqamahConfig]}
            oninput={(e) => updateIqamah(key as keyof IqamahConfig, parseInt((e.target as HTMLInputElement).value) || 0)}
            class="w-16 px-2 py-1 border-2 border-current/30 bg-transparent font-mono text-sm text-center focus:outline-none focus:border-current"
          />
          <span class="text-xs opacity-40">min</span>
        </div>
      {/each}
    </div>
  </div>

  <!-- Jumua Khutbah -->
  <div>
    <label class="text-xs font-black uppercase tracking-wider opacity-60 block mb-1">Waktu Khutbah Jumaat</label>
    <input
      type="text"
      bind:value={local.jumuaKhutbah}
      placeholder="13:00"
      class="w-full px-3 py-2 border-2 border-current/30 bg-transparent font-mono font-bold text-sm focus:outline-none focus:border-current"
    />
  </div>

  <!-- Action buttons -->
  <div class="flex flex-col gap-2 mt-auto pt-4 border-t border-current/10">
    <button
      onclick={handleApply}
      class="w-full py-3 font-black uppercase tracking-wider border-2 border-current bg-accent-green text-white hover:opacity-80 transition-opacity text-sm"
    >Simpan & Guna</button>

    <button
      onclick={handleCopyShareUrl}
      class="w-full py-2 font-bold uppercase tracking-wider border-2 border-current/30 hover:bg-current/10 transition-colors text-xs"
    >
      {copied ? '✓ Disalin!' : '📋 Salin URL Kongsi'}
    </button>

    <a
      href="/solat"
      class="w-full py-2 font-bold uppercase tracking-wider border-2 border-current/30 hover:bg-current/10 transition-colors text-xs text-center block"
    >← Keluar Skrin Penuh</a>
  </div>
</div>
