<script lang="ts">
  interface NotifPrefs {
    enabled: boolean;
    browser: boolean;
    sound: boolean;
    visual: boolean;
    volume: number;
    preMinutes: number;
    soundType: 'chime' | 'bell' | 'adhan';
    perPrayer: Record<string, boolean>;
  }

  interface Props {
    show: boolean;
    notifPrefs: NotifPrefs;
    notifPermission: NotificationPermission;
  }

  let { show, notifPrefs = $bindable(), notifPermission }: Props = $props();

  const TRACKER_PRAYERS = [
    { key: 'fajr', label: 'Subuh' },
    { key: 'dhuhr', label: 'Zohor' },
    { key: 'asr', label: 'Asar' },
    { key: 'maghrib', label: 'Maghrib' },
    { key: 'isha', label: 'Isyak' },
  ] as const;

  const SOUND_TYPES = [
    { k: 'chime' as const, l: 'Chime' },
    { k: 'bell' as const, l: 'Bell' },
    { k: 'adhan' as const, l: 'Adhan' },
  ];

  function updatePrefs(patch: Partial<NotifPrefs>) {
    notifPrefs = { ...notifPrefs, ...patch };
  }

  function togglePrayer(key: string) {
    notifPrefs = {
      ...notifPrefs,
      perPrayer: { ...notifPrefs.perPrayer, [key]: !notifPrefs.perPrayer[key] },
    };
  }
</script>

{#if show}
  <div class="border-4 border-ink bg-white p-4 shadow-[8px_8px_0px_0px_#0D0D0D] flex flex-col gap-4" role="region" aria-label="Notification settings">
    <div class="flex items-center justify-between">
      <p class="text-xs font-black uppercase tracking-wider">Tetapan Pemberitahuan</p>
      <button
        onclick={() => dispatchEvent(new CustomEvent('solat-notif-close'))}
        class="text-sm font-black text-ink/40 hover:text-ink"
        aria-label="Close notification settings"
      >✕</button>
    </div>

    {#if notifPermission === 'default'}
      <p class="text-xs font-bold text-ink/60">Benarkan pemberitahuan pelayar untuk amaran waktu solat.</p>
      <button
        onclick={() => dispatchEvent(new CustomEvent('solat-notif-request'))}
        class="btn-brutal-sm text-xs bg-accent-blue text-white border-ink"
      >Benarkan Pemberitahuan</button>
    {:else if notifPermission === 'denied'}
      <p class="text-xs font-bold text-accent-pink">Pemberitahuan pelayar telah disekat. Sila benarkan dalam tetapan pelayar.</p>
    {:else}
      <!-- Master toggle -->
      <div class="flex items-center justify-between">
        <span class="text-xs font-black uppercase tracking-wider">Pemberitahuan Utama</span>
        <button
          onclick={() => updatePrefs({ enabled: !notifPrefs.enabled })}
          class="w-12 h-6 border-2 border-ink transition-colors duration-75 relative {notifPrefs.enabled ? 'bg-accent-green' : 'bg-white'}"
          role="switch"
          aria-checked={notifPrefs.enabled}
          aria-label="Toggle master notifications"
        ><span class="absolute top-0.5 w-4 h-4 bg-white border-2 border-ink transition-transform duration-75 {notifPrefs.enabled ? 'left-6' : 'left-0.5'}"></span></button>
      </div>

      <!-- Notification types -->
      <div class="grid grid-cols-3 gap-2">
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={notifPrefs.browser} onchange={() => updatePrefs({ browser: !notifPrefs.browser })} class="w-4 h-4 accent-accent-blue" />
          <span class="text-[10px] font-bold">Pelayar</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={notifPrefs.sound} onchange={() => updatePrefs({ sound: !notifPrefs.sound })} class="w-4 h-4 accent-accent-blue" />
          <span class="text-[10px] font-bold">Bunyi</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={notifPrefs.visual} onchange={() => updatePrefs({ visual: !notifPrefs.visual })} class="w-4 h-4 accent-accent-blue" />
          <span class="text-[10px] font-bold">Visual</span>
        </label>
      </div>

      <!-- Sound type -->
      <div>
        <p class="text-[10px] font-black uppercase tracking-wider text-ink/40 mb-1">Jenis Bunyi</p>
        <div class="flex gap-2">
          {#each SOUND_TYPES as snd}
            <button
              onclick={() => updatePrefs({ soundType: snd.k })}
              class="px-3 py-1 border-2 text-[10px] font-black uppercase tracking-wider transition-all {notifPrefs.soundType === snd.k ? 'border-ink bg-accent-blue text-white' : 'border-ink/30 bg-white hover:border-ink'}"
            >{snd.l}</button>
          {/each}
        </div>
      </div>

      <!-- Volume -->
      <div>
        <div class="flex items-center justify-between mb-1">
          <p class="text-[10px] font-black uppercase tracking-wider text-ink/40">Volume</p>
          <span class="text-[10px] font-bold text-ink/40">{notifPrefs.volume}%</span>
        </div>
        <input type="range" min="0" max="100" step="5" bind:value={notifPrefs.volume} class="w-full accent-accent-blue" aria-label="Notification volume" />
      </div>

      <!-- Per-prayer toggles -->
      <div class="border-t border-ink/20 pt-3">
        <p class="text-[10px] font-black uppercase tracking-wider text-ink/40 mb-2">Solat Tertentu</p>
        <div class="flex flex-wrap gap-2">
          {#each TRACKER_PRAYERS as prayer}
            <button
              onclick={() => togglePrayer(prayer.key)}
              class="px-2 py-1 border-2 text-[10px] font-black uppercase tracking-wider transition-all duration-75
                     {notifPrefs.perPrayer[prayer.key] ? 'border-ink bg-accent-blue text-white' : 'border-ink/30 bg-white text-ink/50'}"
            >{prayer.label}</button>
          {/each}
        </div>
      </div>

      <!-- Test button -->
      <button
        onclick={() => dispatchEvent(new CustomEvent('solat-notif-test'))}
        class="btn-brutal-sm text-xs bg-accent-yellow border-ink w-full"
      >🔔 Uji Pemberitahuan</button>
    {/if}
  </div>
{/if}
