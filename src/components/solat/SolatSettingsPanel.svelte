<script lang="ts">
  import { onMount } from 'svelte';
  import type { SolatSettings, HijriMethod, MidnightMode, AsrEndTime, Madhab } from '../../lib/solat/types';
  import { loadSettings, updateSetting } from '../../lib/solat/settings';

  let settings = $state<SolatSettings | null>(null);

  type Section = 'calc' | 'offsets' | 'madhab' | 'hijri';
  let openSections = $state<Record<Section, boolean>>({
    calc: false, offsets: false, madhab: false, hijri: false,
  });

  function toggle(s: Section) {
    openSections[s] = !openSections[s];
  }

  function onSettingChange<K extends keyof SolatSettings>(key: K, value: SolatSettings[K]) {
    if (!settings) return;
    settings = { ...settings, [key]: value };
    updateSetting(key, value);
  }

  // Wrapper functions to avoid `as` type assertions in templates
  function setSuhoorOffset(v: number) { onSettingChange('suhoorOffset', v as any); }
  function setImsakOffset(v: number) { onSettingChange('imsakOffset', v as any); }
  function setMidnightMode(v: string) { onSettingChange('midnightMode', v as any); }
  function setAsrEndTime(v: string) { onSettingChange('asrEndTime', v as any); }
  function setMadhab(v: string) { onSettingChange('madhab', v as any); }
  function setHijriDayAdjust(v: number) { onSettingChange('hijriDayAdjust', v as any); }

  onMount(() => {
    settings = loadSettings();
    window.addEventListener('solat-settings-changed', ((e: CustomEvent<SolatSettings>) => {
      settings = e.detail;
    }) as EventListener);
  });

  const SUHOOR_OFFSETS = [15, 30, 45, 60];
  const IMSAK_OFFSETS = [2, 5, 10, 15];
  const DAY_ADJUSTS = [-2, -1, 0, 1, 2];

  const HIJRI_METHODS: { value: HijriMethod; label: string }[] = [
    { value: 'local-official', label: 'Rasmi JAKIM' },
    { value: 'umm-al-qura', label: 'Umm al-Qura (Saudi)' },
    { value: 'tabular', label: 'Tabular (Standard)' },
    { value: 'civil', label: 'Civil (Kuwaiti)' },
    { value: 'sighting', label: 'Sighting (Pencerapan)' },
  ];

  const PRAYER_OFFSET_LABELS = [
    { key: 'fajr', label: 'Subuh' },
    { key: 'syuruk', label: 'Syuruk' },
    { key: 'dhuhr', label: 'Zohor' },
    { key: 'asr', label: 'Asar' },
    { key: 'maghrib', label: 'Maghrib' },
    { key: 'isha', label: 'Isyak' },
  ] as const;
</script>

<div class="flex flex-col gap-2">
  <h3 class="font-black text-sm uppercase tracking-wider mb-1">Tetapan Lanjutan</h3>

  {#if !settings}
    <p class="text-xs text-ink/40 font-bold text-center py-4">Memuatkan tetapan...</p>
  {:else}

  <!-- Calculation Rules -->
  <div class="border-2 border-ink">
    <button
      onclick={() => toggle('calc')}
      class="w-full flex items-center justify-between px-3 py-2 bg-accent-yellow/30
             font-bold text-xs uppercase tracking-wider cursor-pointer hover:bg-accent-yellow/50 transition-colors"
    >
      <span>Peraturan Pengiraan</span>
      <span>{openSections.calc ? '▲' : '▼'}</span>
    </button>
    {#if openSections.calc}
      <div class="px-3 py-2 flex flex-col gap-3 border-t-2 border-ink">
        <!-- Suhoor Offset -->
        <div>
          <label class="text-[10px] font-bold uppercase tracking-wider text-ink/60 block mb-1">
            Suhoor Offset (min sebelum Subuh)
          </label>
          <div class="flex gap-1">
            {#each SUHOOR_OFFSETS as v}
              <button
                onclick={() => setSuhoorOffset(v)}
                class="flex-1 text-xs font-bold py-1 border-2 border-ink cursor-pointer transition-all
                       {settings.suhoorOffset === v ? 'bg-accent-blue text-white' : 'bg-white hover:bg-canvas'}"
              >{v}</button>
            {/each}
          </div>
        </div>

        <!-- Imsak Offset -->
        <div>
          <label class="text-[10px] font-bold uppercase tracking-wider text-ink/60 block mb-1">
            Imsak Offset (min sebelum Subuh)
          </label>
          <div class="flex gap-1">
            {#each IMSAK_OFFSETS as v}
              <button
                onclick={() => setImsakOffset(v)}
                class="flex-1 text-xs font-bold py-1 border-2 border-ink cursor-pointer transition-all
                       {settings.imsakOffset === v ? 'bg-accent-blue text-white' : 'bg-white hover:bg-canvas'}"
              >{v}</button>
            {/each}
          </div>
        </div>

        <!-- Midnight Mode -->
        <div>
          <label class="text-[10px] font-bold uppercase tracking-wider text-ink/60 block mb-1">
            Kaedah Tengah Malam
          </label>
          <div class="flex gap-1">
            <button
              onclick={() => setMidnightMode('maghrib-to-fajr')}
              class="flex-1 text-xs font-bold py-1 px-1 border-2 border-ink cursor-pointer transition-all
                     {settings.midnightMode === 'maghrib-to-fajr' ? 'bg-accent-blue text-white' : 'bg-white hover:bg-canvas'}"
            >Maghrib → Subuh</button>
            <button
              onclick={() => setMidnightMode('maghrib-to-sunrise')}
              class="flex-1 text-xs font-bold py-1 px-1 border-2 border-ink cursor-pointer transition-all
                     {settings.midnightMode === 'maghrib-to-sunrise' ? 'bg-accent-blue text-white' : 'bg-white hover:bg-canvas'}"
            >Maghrib → Syuruk</button>
          </div>
        </div>

        <!-- Asr End Time -->
        <div>
          <label class="text-[10px] font-bold uppercase tracking-wider text-ink/60 block mb-1">
            Asar Tamat
          </label>
          <div class="flex gap-1">
            <button
              onclick={() => setAsrEndTime('maghrib')}
              class="flex-1 text-xs font-bold py-1 border-2 border-ink cursor-pointer transition-all
                     {settings.asrEndTime === 'maghrib' ? 'bg-accent-blue text-white' : 'bg-white hover:bg-canvas'}"
            >Tepat Maghrib</button>
            <button
              onclick={() => setAsrEndTime('yellow-sun')}
              class="flex-1 text-xs font-bold py-1 border-2 border-ink cursor-pointer transition-all
                     {settings.asrEndTime === 'yellow-sun' ? 'bg-accent-blue text-white' : 'bg-white hover:bg-canvas'}"
            >Matahari Kuning</button>
          </div>
        </div>
      </div>
    {/if}
  </div>

  <!-- Prayer Offsets -->
  <div class="border-2 border-ink">
    <button
      onclick={() => toggle('offsets')}
      class="w-full flex items-center justify-between px-3 py-2 bg-accent-yellow/30
             font-bold text-xs uppercase tracking-wider cursor-pointer hover:bg-accent-yellow/50 transition-colors"
    >
      <span>Offset Solat (minit)</span>
      <span>{openSections.offsets ? '▲' : '▼'}</span>
    </button>
    {#if openSections.offsets}
      <div class="px-3 py-2 grid grid-cols-2 gap-2 border-t-2 border-ink">
        {#each PRAYER_OFFSET_LABELS as po}
          <div>
            <label class="text-[10px] font-bold uppercase tracking-wider text-ink/60 block mb-0.5">
              {po.label}
            </label>
            <input
              type="number"
              min="-30"
              max="30"
              value={settings.prayerOffsets[po.key]}
              onchange={(e) => {
                const val = Number((e.target as HTMLInputElement).value);
                onSettingChange('prayerOffsets', { ...settings.prayerOffsets, [po.key]: val });
              }}
              class="w-full border-2 border-ink px-2 py-1 text-xs font-mono font-bold
                     focus:outline-none focus:ring-2 focus:ring-accent-blue"
            />
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Madhab -->
  <div class="border-2 border-ink">
    <button
      onclick={() => toggle('madhab')}
      class="w-full flex items-center justify-between px-3 py-2 bg-accent-yellow/30
             font-bold text-xs uppercase tracking-wider cursor-pointer hover:bg-accent-yellow/50 transition-colors"
    >
      <span>Mazhab</span>
      <span>{openSections.madhab ? '▲' : '▼'}</span>
    </button>
    {#if openSections.madhab}
      <div class="px-3 py-2 flex gap-2 border-t-2 border-ink">
        <button
          onclick={() => setMadhab('shafii')}
          class="flex-1 text-xs font-bold py-2 border-2 border-ink cursor-pointer transition-all
                 {settings.madhab === 'shafii' ? 'bg-accent-blue text-white' : 'bg-white hover:bg-canvas'}"
        >
          Shafi'i<br /><span class="text-[10px] opacity-70">Maliki · Hanbali</span>
        </button>
        <button
          onclick={() => setMadhab('hanafi')}
          class="flex-1 text-xs font-bold py-2 border-2 border-ink cursor-pointer transition-all
                 {settings.madhab === 'hanafi' ? 'bg-accent-blue text-white' : 'bg-white hover:bg-canvas'}"
        >
          Hanafi
        </button>
      </div>
    {/if}
  </div>

  <!-- Hijri Calendar -->
  <div class="border-2 border-ink">
    <button
      onclick={() => toggle('hijri')}
      class="w-full flex items-center justify-between px-3 py-2 bg-accent-yellow/30
             font-bold text-xs uppercase tracking-wider cursor-pointer hover:bg-accent-yellow/50 transition-colors"
    >
      <span>Kalender Hijri</span>
      <span>{openSections.hijri ? '▲' : '▼'}</span>
    </button>
    {#if openSections.hijri}
      <div class="px-3 py-2 flex flex-col gap-3 border-t-2 border-ink">
        <div>
          <label class="text-[10px] font-bold uppercase tracking-wider text-ink/60 block mb-1">
            Kaedah
          </label>
          <div class="flex flex-col gap-1">
            {#each HIJRI_METHODS as method}
              <button
                onclick={() => onSettingChange('hijriMethod', method.value)}
                class="text-xs font-bold py-1 px-2 border-2 border-ink text-left cursor-pointer transition-all
                       {settings.hijriMethod === method.value ? 'bg-accent-blue text-white' : 'bg-white hover:bg-canvas'}"
              >{method.label}</button>
            {/each}
          </div>
        </div>

        <div>
          <label class="text-[10px] font-bold uppercase tracking-wider text-ink/60 block mb-1">
            Pelarasan Hari ({settings.hijriDayAdjust > 0 ? '+' : ''}{settings.hijriDayAdjust})
          </label>
          <div class="flex gap-1">
            {#each DAY_ADJUSTS as v}
              <button
                onclick={() => setHijriDayAdjust(v)}
                class="flex-1 text-xs font-bold py-1 border-2 border-ink cursor-pointer transition-all
                       {settings.hijriDayAdjust === v ? 'bg-accent-blue text-white' : 'bg-white hover:bg-canvas'}"
              >{v > 0 ? `+${v}` : v}</button>
            {/each}
          </div>
        </div>
      </div>
    {/if}
  </div>
  {/if}
</div>
