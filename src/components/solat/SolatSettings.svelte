<script lang="ts">
  import { onMount } from 'svelte';
  import type { SolatSettings as SolatSettingsType, HijriMethod, MidnightMode, AsrEndTime, Madhab, SunnahTimes, SunnahToggles, SolatDay, SolatResponse } from '../../lib/solat/types';
  import { loadSettings, updateSetting } from '../../lib/solat/settings';
  import { getCachedPrayerTimes, getTodayPrayers, getTomorrowPrayers } from '../../lib/solat/storage';
  import { calculateSunnahTimes } from '../../lib/solat/sunnah';

  let settings = $state<SolatSettingsType | null>(null);
  let expanded = $state(false);

  type SettingsTab = 'sunnah' | 'advanced' | 'zone';
  let activeTab = $state<SettingsTab>('sunnah');

  // Sunnah times state
  let sunnah = $state<SunnahTimes | null>(null);
  let toggles = $state<SunnahToggles | null>(null);

  type SunnahItem = { key: keyof SunnahToggles; labelMs: string; time?: string; range?: string; type: 'recommended' | 'forbidden' | 'info' };

  let sunnahItems = $derived.by((): SunnahItem[] => {
    if (!sunnah || !toggles) return [];
    return [
      { key: 'suhoor', labelMs: 'Akhir Sahur', time: sunnah.suhoor, type: 'recommended' },
      { key: 'sunrise', labelMs: 'Syuruk (Larangan)', time: sunnah.sunrise, type: 'forbidden' },
      { key: 'duha', labelMs: 'Waktu Dhuha', range: sunnah.duhaStart ? `${sunnah.duhaStart} – ${sunnah.duhaEnd}` : undefined, type: 'recommended' },
      { key: 'zawal', labelMs: 'Zawal (Larangan)', range: sunnah.zawalStart ? `${sunnah.zawalStart} – ${sunnah.sunrise || '12:00'}` : undefined, type: 'forbidden' },
      { key: 'evening', labelMs: 'Petang (Larangan)', time: sunnah.eveningForbidden, type: 'forbidden' },
      { key: 'firstThird', labelMs: 'Sepertiga Malam Pertama', time: sunnah.firstThird, type: 'recommended' },
      { key: 'midnight', labelMs: 'Tengah Malam Islam', time: sunnah.midnight, type: 'recommended' },
      { key: 'tahajjud', labelMs: 'Tahajjud (Sepertiga Akhir)', time: sunnah.tahajjud, type: 'recommended' },
      { key: 'jumuah', labelMs: 'Jumaat', time: sunnah.isJumuah ? 'Ya' : undefined, type: 'info' },
    ];
  });

  // Advanced settings state
  type Section = 'calc' | 'offsets' | 'madhab' | 'hijri';
  let openSections = $state<Record<Section, boolean>>({ calc: false, offsets: false, madhab: false, hijri: false });

  function toggle(s: Section) { openSections[s] = !openSections[s]; }

  function onSettingChange<K extends keyof SolatSettingsType>(key: K, value: SolatSettingsType[K]) {
    if (!settings) return;
    settings = { ...settings, [key]: value };
    updateSetting(key, value);
  }

  function setSuhoorOffset(v: number) { onSettingChange('suhoorOffset', v as any); }
  function setImsakOffset(v: number) { onSettingChange('imsakOffset', v as any); }
  function setMidnightMode(v: string) { onSettingChange('midnightMode', v as any); }
  function setAsrEndTime(v: string) { onSettingChange('asrEndTime', v as any); }
  function setMadhab(v: string) { onSettingChange('madhab', v as any); }
  function setHijriDayAdjust(v: number) { onSettingChange('hijriDayAdjust', v as any); }

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

  onMount(async () => {
    const s = loadSettings();
    settings = s;
    toggles = s.sunnahToggles;

    window.addEventListener('solat-settings-changed', ((e: CustomEvent<SolatSettingsType>) => {
      settings = e.detail;
      toggles = e.detail.sunnahToggles;
    }) as EventListener);

    // Calculate sunnah times
    await calculateSunnah();
  });

  async function calculateSunnah() {
    const s = settings ?? loadSettings();
    const cached = getCachedPrayerTimes();
    if (cached) {
      const todayDay = getTodayPrayers(cached.data);
      const tomorrow = getTomorrowPrayers(cached.data);
      if (todayDay) {
        sunnah = calculateSunnahTimes(todayDay, tomorrow, {
          sunnahToggles: s.sunnahToggles, suhoorOffset: s.suhoorOffset,
          midnightMode: s.midnightMode, asrEndTime: s.asrEndTime, madhab: s.madhab,
        });
        return;
      }
    }
    // Fallback: fetch
    try {
      const res = await fetch(`/api/solat/${s.zone}`);
      if (res.ok) {
        const data: SolatResponse = await res.json();
        const todayDay = getTodayPrayers(data);
        const tomorrow = getTomorrowPrayers(data);
        if (todayDay) {
          sunnah = calculateSunnahTimes(todayDay, tomorrow, {
            sunnahToggles: s.sunnahToggles, suhoorOffset: s.suhoorOffset,
            midnightMode: s.midnightMode, asrEndTime: s.asrEndTime, madhab: s.madhab,
          });
        }
      }
    } catch {}
  }

  function handleSunnahToggle(key: keyof SunnahToggles, value: boolean) {
    if (!toggles) return;
    toggles = { ...toggles, [key]: value };
    updateSetting('sunnahToggles', toggles);
  }
</script>

<div class="flex flex-col gap-2">
  <!-- Expand/collapse header -->
  <button
    onclick={() => expanded = !expanded}
    class="flex items-center justify-between w-full px-4 py-3 border-4 border-ink bg-accent-yellow/20
           font-black text-sm uppercase tracking-wider cursor-pointer hover:bg-accent-yellow/30 transition-colors"
  >
    <span>Tetapan</span>
    <span class="text-lg">{expanded ? '▲' : '▼'}</span>
  </button>

  {#if expanded}
    <!-- Tab buttons -->
    <div class="flex border-2 border-ink">
      <button
        onclick={() => activeTab = 'sunnah'}
        class="flex-1 px-2 py-2 text-[10px] sm:text-xs font-black uppercase tracking-wider transition-colors duration-75
               {activeTab === 'sunnah' ? 'bg-ink text-white' : 'bg-white text-ink hover:bg-canvas'}"
      >Waktu Sunnah</button>
      <button
        onclick={() => activeTab = 'advanced'}
        class="flex-1 px-2 py-2 text-[10px] sm:text-xs font-black uppercase tracking-wider border-l-2 border-ink transition-colors duration-75
               {activeTab === 'advanced' ? 'bg-ink text-white' : 'bg-white text-ink hover:bg-canvas'}"
      >Lanjutan</button>
    </div>

    <!-- Tab content -->
    <div class="border-2 border-ink bg-white p-3">

      <!-- === SUNNAH TAB === -->
      {#if activeTab === 'sunnah'}
        <div class="flex items-center justify-between mb-2">
          <h4 class="font-black text-xs uppercase tracking-wider">Waktu Sunnah</h4>
          {#if sunnah?.isJumuah && toggles?.jumuah}
            <span class="badge-brutal bg-accent-green text-white text-[10px]">JUMAAT</span>
          {/if}
        </div>

        {#if !sunnah || !toggles}
          <p class="text-xs text-ink/40 font-bold text-center py-4">Memuatkan waktu sunnah...</p>
        {:else}
          <div class="flex flex-col gap-1">
            {#each sunnahItems as item}
              <div
                class="flex items-center justify-between px-3 py-2 border-2 border-ink transition-all duration-75
                       {item.type === 'recommended' && toggles[item.key] ? 'bg-accent-green/10' : ''}
                       {item.type === 'forbidden' && toggles[item.key] ? 'bg-accent-pink/10' : ''}
                       {item.type === 'info' && toggles[item.key] ? 'bg-accent-blue/10' : ''}
                       {!toggles[item.key] ? 'opacity-40' : ''}"
              >
                <div class="flex items-center gap-2 flex-1 min-w-0">
                  <button
                    onclick={() => handleSunnahToggle(item.key, !toggles[item.key])}
                    class="w-5 h-5 border-2 border-ink shrink-0 cursor-pointer flex items-center justify-center transition-all duration-75
                           {toggles[item.key]
                             ? item.type === 'forbidden' ? 'bg-accent-pink' : item.type === 'info' ? 'bg-accent-blue' : 'bg-accent-green'
                             : 'bg-white hover:bg-ink/10'}"
                    aria-label="Toggle {item.labelMs}"
                  >
                    {#if toggles[item.key]}<span class="text-white text-xs font-black">✓</span>{/if}
                  </button>
                  <div class="min-w-0">
                    <span class="text-xs font-bold block truncate">{item.labelMs}</span>
                    {#if item.type === 'forbidden'}<span class="text-[10px] font-bold text-accent-pink">LARANGAN</span>{/if}
                  </div>
                </div>
                <span class="font-mono font-black text-xs tabular-nums shrink-0 ml-2">{item.range ?? item.time ?? '—'}</span>
              </div>
            {/each}
          </div>
        {/if}

      <!-- === ADVANCED TAB === -->
      {:else if activeTab === 'advanced' && settings}
        <div class="flex flex-col gap-2">
          <!-- Calculation Rules -->
          <div class="border-2 border-ink">
            <button onclick={() => toggle('calc')}
              class="w-full flex items-center justify-between px-3 py-2 bg-accent-yellow/30 font-bold text-xs uppercase tracking-wider cursor-pointer hover:bg-accent-yellow/50 transition-colors">
              <span>Peraturan Pengiraan</span><span>{openSections.calc ? '▲' : '▼'}</span>
            </button>
            {#if openSections.calc}
              <div class="px-3 py-2 flex flex-col gap-3 border-t-2 border-ink">
                <div>
                  <label class="text-[10px] font-bold uppercase tracking-wider text-ink/60 block mb-1">Suhoor Offset (min sebelum Subuh)</label>
                  <div class="flex gap-1">
                    {#each SUHOOR_OFFSETS as v}
                      <button onclick={() => setSuhoorOffset(v)}
                        class="flex-1 text-xs font-bold py-1 border-2 border-ink cursor-pointer transition-all {settings.suhoorOffset === v ? 'bg-accent-blue text-white' : 'bg-white hover:bg-canvas'}">{v}</button>
                    {/each}
                  </div>
                </div>
                <div>
                  <label class="text-[10px] font-bold uppercase tracking-wider text-ink/60 block mb-1">Imsak Offset (min sebelum Subuh)</label>
                  <div class="flex gap-1">
                    {#each IMSAK_OFFSETS as v}
                      <button onclick={() => setImsakOffset(v)}
                        class="flex-1 text-xs font-bold py-1 border-2 border-ink cursor-pointer transition-all {settings.imsakOffset === v ? 'bg-accent-blue text-white' : 'bg-white hover:bg-canvas'}">{v}</button>
                    {/each}
                  </div>
                </div>
                <div>
                  <label class="text-[10px] font-bold uppercase tracking-wider text-ink/60 block mb-1">Kaedah Tengah Malam</label>
                  <div class="flex gap-1">
                    <button onclick={() => setMidnightMode('maghrib-to-fajr')}
                      class="flex-1 text-xs font-bold py-1 px-1 border-2 border-ink cursor-pointer transition-all {settings.midnightMode === 'maghrib-to-fajr' ? 'bg-accent-blue text-white' : 'bg-white hover:bg-canvas'}">Maghrib → Subuh</button>
                    <button onclick={() => setMidnightMode('maghrib-to-sunrise')}
                      class="flex-1 text-xs font-bold py-1 px-1 border-2 border-ink cursor-pointer transition-all {settings.midnightMode === 'maghrib-to-sunrise' ? 'bg-accent-blue text-white' : 'bg-white hover:bg-canvas'}">Maghrib → Syuruk</button>
                  </div>
                </div>
                <div>
                  <label class="text-[10px] font-bold uppercase tracking-wider text-ink/60 block mb-1">Asar Tamat</label>
                  <div class="flex gap-1">
                    <button onclick={() => setAsrEndTime('maghrib')}
                      class="flex-1 text-xs font-bold py-1 border-2 border-ink cursor-pointer transition-all {settings.asrEndTime === 'maghrib' ? 'bg-accent-blue text-white' : 'bg-white hover:bg-canvas'}">Tepat Maghrib</button>
                    <button onclick={() => setAsrEndTime('yellow-sun')}
                      class="flex-1 text-xs font-bold py-1 border-2 border-ink cursor-pointer transition-all {settings.asrEndTime === 'yellow-sun' ? 'bg-accent-blue text-white' : 'bg-white hover:bg-canvas'}">Matahari Kuning</button>
                  </div>
                </div>
              </div>
            {/if}
          </div>

          <!-- Prayer Offsets -->
          <div class="border-2 border-ink">
            <button onclick={() => toggle('offsets')}
              class="w-full flex items-center justify-between px-3 py-2 bg-accent-yellow/30 font-bold text-xs uppercase tracking-wider cursor-pointer hover:bg-accent-yellow/50 transition-colors">
              <span>Offset Solat (minit)</span><span>{openSections.offsets ? '▲' : '▼'}</span>
            </button>
            {#if openSections.offsets}
              <div class="px-3 py-2 grid grid-cols-2 gap-2 border-t-2 border-ink">
                {#each PRAYER_OFFSET_LABELS as po}
                  <div>
                    <label class="text-[10px] font-bold uppercase tracking-wider text-ink/60 block mb-0.5">{po.label}</label>
                    <input type="number" min="-30" max="30" value={settings.prayerOffsets[po.key]}
                      onchange={(e) => { const val = Number((e.target as HTMLInputElement).value); onSettingChange('prayerOffsets', { ...settings.prayerOffsets, [po.key]: val }); }}
                      class="w-full border-2 border-ink px-2 py-1 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-accent-blue" />
                  </div>
                {/each}
              </div>
            {/if}
          </div>

          <!-- Madhab -->
          <div class="border-2 border-ink">
            <button onclick={() => toggle('madhab')}
              class="w-full flex items-center justify-between px-3 py-2 bg-accent-yellow/30 font-bold text-xs uppercase tracking-wider cursor-pointer hover:bg-accent-yellow/50 transition-colors">
              <span>Mazhab</span><span>{openSections.madhab ? '▲' : '▼'}</span>
            </button>
            {#if openSections.madhab}
              <div class="px-3 py-2 flex gap-2 border-t-2 border-ink">
                <button onclick={() => setMadhab('shafii')}
                  class="flex-1 text-xs font-bold py-2 border-2 border-ink cursor-pointer transition-all {settings.madhab === 'shafii' ? 'bg-accent-blue text-white' : 'bg-white hover:bg-canvas'}">
                  Shafi'i<br /><span class="text-[10px] opacity-70">Maliki · Hanbali</span>
                </button>
                <button onclick={() => setMadhab('hanafi')}
                  class="flex-1 text-xs font-bold py-2 border-2 border-ink cursor-pointer transition-all {settings.madhab === 'hanafi' ? 'bg-accent-blue text-white' : 'bg-white hover:bg-canvas'}">
                  Hanafi
                </button>
              </div>
            {/if}
          </div>

          <!-- Hijri Calendar -->
          <div class="border-2 border-ink">
            <button onclick={() => toggle('hijri')}
              class="w-full flex items-center justify-between px-3 py-2 bg-accent-yellow/30 font-bold text-xs uppercase tracking-wider cursor-pointer hover:bg-accent-yellow/50 transition-colors">
              <span>Kalender Hijri</span><span>{openSections.hijri ? '▲' : '▼'}</span>
            </button>
            {#if openSections.hijri}
              <div class="px-3 py-2 flex flex-col gap-3 border-t-2 border-ink">
                <div>
                  <label class="text-[10px] font-bold uppercase tracking-wider text-ink/60 block mb-1">Kaedah</label>
                  <div class="flex flex-col gap-1">
                    {#each HIJRI_METHODS as method}
                      <button onclick={() => onSettingChange('hijriMethod', method.value)}
                        class="text-xs font-bold py-1 px-2 border-2 border-ink text-left cursor-pointer transition-all {settings.hijriMethod === method.value ? 'bg-accent-blue text-white' : 'bg-white hover:bg-canvas'}">{method.label}</button>
                    {/each}
                  </div>
                </div>
                <div>
                  <label class="text-[10px] font-bold uppercase tracking-wider text-ink/60 block mb-1">Pelarasan Hari ({settings.hijriDayAdjust > 0 ? '+' : ''}{settings.hijriDayAdjust})</label>
                  <div class="flex gap-1">
                    {#each DAY_ADJUSTS as v}
                      <button onclick={() => setHijriDayAdjust(v)}
                        class="flex-1 text-xs font-bold py-1 border-2 border-ink cursor-pointer transition-all {settings.hijriDayAdjust === v ? 'bg-accent-blue text-white' : 'bg-white hover:bg-canvas'}">{v > 0 ? `+${v}` : v}</button>
                    {/each}
                  </div>
                </div>
              </div>
            {/if}
          </div>
        </div>
      {/if}
    </div>
  {/if}
</div>
