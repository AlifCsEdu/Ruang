<script lang="ts">
  import { onMount } from 'svelte';
  import SolatSettings from '../solat/SolatSettings.svelte';
  import { RECITERS, TRANSLATIONS, SCRIPT_TYPES, WORD_BELOW_OPTIONS, PLAYBACK_SPEEDS, FONT_SIZE_MIN, FONT_SIZE_MAX, FONT_SIZE_DEFAULT, FONT_SIZE_STEP, LS_FONT_SIZE, LS_SCRIPT_TYPE, LS_WORD_BELOW, LS_DISPLAY_MODE, LS_AUDIO_PREFS } from '../../lib/quran/constants';
  import type { ScriptType, VerseDisplayMode, WordBelowDisplay } from '../../lib/quran/types';

  type Tab = 'umum' | 'solat' | 'quran' | 'notifications' | 'display';
  let activeTab = $state<Tab>('umum');

  // === UMUM (General) settings ===
  const STARTUP_KEY = 'ruang_startup_page';
  const REDUCED_MOTION_KEY = 'ruang_reduced_motion';
  const AUTO_DETECT_KEY = 'ruang_auto_detect_location';
  let startupPage = $state<'solat' | 'quran' | 'dashboard'>('solat');
  let reducedMotion = $state(false);

  // === QURAN settings ===
  let quranReciter = $state(7);
  let quranTranslation = $state(20);
  let fontSize = $state(FONT_SIZE_DEFAULT);
  let scriptType = $state<ScriptType>('uthmani');
  let wordBelow = $state<WordBelowDisplay>('none');
  let displayMode = $state<VerseDisplayMode>('standard');
  let audioSpeed = $state(1);
  let audioVolume = $state(80);
  let audioAutoAdvance = $state(true);

  // === NOTIFICATION settings ===
  let notifEnabled = $state(false);
  let notifBrowser = $state(true);
  let notifSound = $state(true);
  let notifVisual = $state(true);
  let notifVolume = $state(60);
  let notifPreMinutes = $state(5);
  let notifSoundType = $state<'chime' | 'bell' | 'adhan'>('chime');
  let notifPermission = $state<NotificationPermission>('default');
  let notifPerPrayer = $state<Record<string, boolean>>({
    fajr: true, dhuhr: true, asr: true, maghrib: true, isha: true,
  });

  // === DISPLAY settings ===
  let use24h = $state(true);
  let showSeconds = $state(true);
  let sidebarCollapsed = $state(false);
  let autoDetectLocation = $state(false);

  // === DATA MANAGEMENT ===
  let exportStatus = $state('');
  let importStatus = $state('');

  const NOTIF_KEY = 'ruang_notif_prefs_v2';
  const CLOCK_KEY = 'ruang_clock_24h';
  const SIDEBAR_KEY = 'ruang_sidebar_collapsed';

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: 'umum', label: 'Umum', icon: '⚙️' },
    { key: 'solat', label: 'Solat', icon: '🕌' },
    { key: 'quran', label: 'Al-Quran', icon: '📖' },
    { key: 'notifications', label: 'Pemberitahuan', icon: '🔔' },
    { key: 'display', label: 'Paparan', icon: '🎨' },
  ];

  const PRAYER_LABELS = [
    { key: 'fajr', label: 'Subuh' },
    { key: 'dhuhr', label: 'Zohor' },
    { key: 'asr', label: 'Asar' },
    { key: 'maghrib', label: 'Maghrib' },
    { key: 'isha', label: 'Isyak' },
  ];

  const DISPLAY_MODES: { id: VerseDisplayMode; label: string; desc: string }[] = [
    { id: 'standard', label: 'Standard', desc: 'Ayat demi ayat dengan terjemahan' },
    { id: 'word-by-word', label: 'Perkataan', desc: 'Satu perkataan demi satu perkataan' },
    { id: 'mushaf', label: 'Mushaf', desc: 'Bacaan berterusan seperti Quran fizikal' },
  ];

  onMount(() => {
    // Load Umum settings
    const sp = localStorage.getItem(STARTUP_KEY);
    if (sp === 'solat' || sp === 'quran' || sp === 'dashboard') startupPage = sp;
    reducedMotion = localStorage.getItem(REDUCED_MOTION_KEY) === 'true';

    // Load Quran settings
    const sr = localStorage.getItem('ruang_quran_reciter');
    const st = localStorage.getItem('ruang_quran_translation');
    if (sr) quranReciter = parseInt(sr, 10);
    if (st) quranTranslation = parseInt(st, 10);

    const fs = localStorage.getItem(LS_FONT_SIZE);
    if (fs) fontSize = parseFloat(fs);
    const sc = localStorage.getItem(LS_SCRIPT_TYPE);
    if (sc === 'uthmani' || sc === 'indopak' || sc === 'tajweed') scriptType = sc;
    const wb = localStorage.getItem(LS_WORD_BELOW);
    if (wb === 'none' || wb === 'translation' || wb === 'transliteration' || wb === 'both') wordBelow = wb;
    const dm = localStorage.getItem(LS_DISPLAY_MODE);
    if (dm === 'standard' || dm === 'word-by-word' || dm === 'mushaf') displayMode = dm;

    try {
      const ap = localStorage.getItem(LS_AUDIO_PREFS);
      if (ap) {
        const parsed = JSON.parse(ap);
        audioSpeed = parsed.speed ?? 1;
        audioVolume = parsed.volume ?? 80;
        audioAutoAdvance = parsed.autoAdvance ?? true;
      }
    } catch { /* empty */ }

    // Load notification prefs
    try {
      const raw = localStorage.getItem(NOTIF_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        notifEnabled = p.enabled ?? false;
        notifBrowser = p.browser ?? true;
        notifSound = p.sound ?? true;
        notifVisual = p.visual ?? true;
        notifVolume = p.volume ?? 60;
        notifPreMinutes = p.preMinutes ?? 5;
        notifSoundType = p.soundType ?? 'chime';
        notifPerPrayer = p.perPrayer ?? notifPerPrayer;
      }
    } catch { /* empty */ }

    // Load clock prefs
    try {
      const raw = localStorage.getItem(CLOCK_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        use24h = p.use24h ?? true;
        showSeconds = p.showSeconds ?? true;
      }
    } catch { /* empty */ }

    // Load sidebar pref
    sidebarCollapsed = localStorage.getItem(SIDEBAR_KEY) === 'true';

    // Load auto-detect pref
    autoDetectLocation = localStorage.getItem(AUTO_DETECT_KEY) === 'true';

    // Notification permission
    if ('Notification' in window) notifPermission = Notification.permission;

    // Apply reduced motion on mount
    if (reducedMotion) document.documentElement.setAttribute('data-reduced-motion', 'true');
  });

  // === SAVE FUNCTIONS ===
  function saveStartupPage(page: typeof startupPage) {
    startupPage = page;
    localStorage.setItem(STARTUP_KEY, page);
  }

  function saveReducedMotion(val: boolean) {
    reducedMotion = val;
    localStorage.setItem(REDUCED_MOTION_KEY, String(val));
    if (val) document.documentElement.setAttribute('data-reduced-motion', 'true');
    else document.documentElement.removeAttribute('data-reduced-motion');
  }

  function saveAutoDetect(val: boolean) {
    autoDetectLocation = val;
    localStorage.setItem(AUTO_DETECT_KEY, String(val));
    // Also update solat settings autoDetectLocation field
    try {
      const raw = localStorage.getItem('ruang_solat_settings');
      if (raw) {
        const s = JSON.parse(raw);
        s.autoDetectLocation = val;
        localStorage.setItem('ruang_solat_settings', JSON.stringify(s));
      }
    } catch { /* empty */ }
    window.dispatchEvent(new CustomEvent('solat-settings-changed', {
      detail: { autoDetectLocation: val },
    }));
  }

  function saveQuranSettings() {
    localStorage.setItem('ruang_quran_reciter', String(quranReciter));
    localStorage.setItem('ruang_quran_translation', String(quranTranslation));
    localStorage.setItem(LS_FONT_SIZE, String(fontSize));
    localStorage.setItem(LS_SCRIPT_TYPE, scriptType);
    localStorage.setItem(LS_WORD_BELOW, wordBelow);
    localStorage.setItem(LS_DISPLAY_MODE, displayMode);
    localStorage.setItem(LS_AUDIO_PREFS, JSON.stringify({ speed: audioSpeed, volume: audioVolume, autoAdvance: audioAutoAdvance }));
    window.dispatchEvent(new CustomEvent('quran-settings-changed', {
      detail: { reciter: quranReciter, translation: quranTranslation },
    }));
  }

  function resetQuranDefaults() {
    quranReciter = 7;
    quranTranslation = 20;
    fontSize = FONT_SIZE_DEFAULT;
    scriptType = 'uthmani';
    wordBelow = 'none';
    displayMode = 'standard';
    audioSpeed = 1;
    audioVolume = 80;
    audioAutoAdvance = true;
    saveQuranSettings();
  }

  function saveNotifPrefs() {
    const prefs = {
      enabled: notifEnabled, browser: notifBrowser, sound: notifSound,
      visual: notifVisual, volume: notifVolume, preMinutes: notifPreMinutes,
      soundType: notifSoundType, perPrayer: notifPerPrayer,
    };
    try { localStorage.setItem(NOTIF_KEY, JSON.stringify(prefs)); } catch { /* empty */ }
    window.dispatchEvent(new CustomEvent('notification-settings-changed', { detail: prefs }));
  }

  function toggleNotifPrayer(key: string) {
    notifPerPrayer = { ...notifPerPrayer, [key]: !notifPerPrayer[key] };
    saveNotifPrefs();
  }

  async function requestNotifPermission() {
    if (!('Notification' in window)) return;
    const result = await Notification.requestPermission();
    notifPermission = result;
    if (result === 'granted') { notifEnabled = true; saveNotifPrefs(); }
  }

  function testNotification() {
    try {
      const ctx = new AudioContext();
      const vol = notifVolume / 100;
      if (notifSoundType === 'adhan') {
        [293.66, 329.63, 349.23, 392.00, 440.00, 493.88].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.4);
          gain.gain.setValueAtTime(vol * 0.3, ctx.currentTime + i * 0.4);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.4 + 0.35);
          osc.start(ctx.currentTime + i * 0.4);
          osc.stop(ctx.currentTime + i * 0.4 + 0.4);
        });
      } else if (notifSoundType === 'bell') {
        [523.25, 659.25].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.6);
          gain.gain.setValueAtTime(vol * 0.4, ctx.currentTime + i * 0.6);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.6 + 2);
          osc.start(ctx.currentTime + i * 0.6);
          osc.stop(ctx.currentTime + i * 0.6 + 2);
        });
      } else {
        [587.33, 440].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain); gain.connect(ctx.destination);
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.5);
          gain.gain.setValueAtTime(vol * 0.3, ctx.currentTime + i * 0.5);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.5 + 1.5);
          osc.start(ctx.currentTime + i * 0.5);
          osc.stop(ctx.currentTime + i * 0.5 + 1.5);
        });
      }
    } catch { /* empty */ }
    if (notifPermission === 'granted') {
      try { new Notification('🔔 Ruang — Uji', { body: 'Pemberitahuan berfungsi!', icon: '/icon-192.svg' }); } catch { /* empty */ }
    }
  }

  function saveClockPrefs() {
    try { localStorage.setItem(CLOCK_KEY, JSON.stringify({ use24h, showSeconds })); } catch { /* empty */ }
    window.dispatchEvent(new CustomEvent('display-settings-changed'));
  }

  function toggleSidebar() {
    sidebarCollapsed = !sidebarCollapsed;
    localStorage.setItem(SIDEBAR_KEY, String(sidebarCollapsed));
    window.dispatchEvent(new CustomEvent('sidebar-toggle-external'));
  }

  // === DATA MANAGEMENT ===
  const ALL_KEYS = [
    'ruang_quran_reciter', 'ruang_quran_translation', LS_FONT_SIZE, LS_SCRIPT_TYPE,
    LS_WORD_BELOW, LS_DISPLAY_MODE, LS_AUDIO_PREFS, 'ruang_quran_bookmarks',
    'ruang_quran_last_read', 'ruang_quran_volume', 'ruang_quran_speed',
    NOTIF_KEY, CLOCK_KEY, SIDEBAR_KEY, STARTUP_KEY, REDUCED_MOTION_KEY,
    AUTO_DETECT_KEY, 'ruang_prayer_tracker', 'ruang_solat_settings',
  ];

  function exportPreferences() {
    const data: Record<string, string> = {};
    for (const key of ALL_KEYS) {
      const val = localStorage.getItem(key);
      if (val !== null) data[key] = val;
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ruang-preferences-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    exportStatus = 'Berjaya dieksport!';
    setTimeout(() => exportStatus = '', 3000);
  }

  function importPreferences() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (typeof data !== 'object') throw new Error('Invalid format');
        let count = 0;
        for (const [key, val] of Object.entries(data)) {
          if (typeof val === 'string' && ALL_KEYS.includes(key)) {
            localStorage.setItem(key, val);
            count++;
          }
        }
        importStatus = `Berjaya diimport! (${count} tetapan)`;
        // Reload page to apply
        setTimeout(() => window.location.reload(), 1500);
      } catch {
        importStatus = 'Gagal import — fail tidak sah.';
      }
      setTimeout(() => importStatus = '', 4000);
    };
    input.click();
  }

  function clearCache() {
    if (!confirm('Padam cache prayer times? Waktu solat akan dimuat semula.')) return;
    localStorage.removeItem('ruang_solat_cache');
    localStorage.removeItem('ruang_solat_cache_date');
    exportStatus = 'Cache dibersihkan!';
    setTimeout(() => exportStatus = '', 3000);
  }

  function resetAllSettings() {
    if (!confirm('Reset SEMUA tetapan ke lalai? Tindakan ini tidak boleh dibatalkan.')) return;
    for (const key of ALL_KEYS) {
      localStorage.removeItem(key);
    }
    window.location.reload();
  }
</script>

<div class="flex flex-col gap-6">
  <!-- Tab navigation -->
  <div class="flex border-4 border-ink bg-white shadow-[8px_8px_0px_0px_#0D0D0D] overflow-x-auto">
    {#each TABS as tab}
      <button
        onclick={() => (activeTab = tab.key)}
        class="flex-1 min-w-[5.5rem] px-3 py-3 text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all duration-75 flex items-center justify-center gap-1.5 border-r-2 border-r-ink last:border-r-0
               {activeTab === tab.key ? 'bg-ink text-white' : 'bg-white text-ink hover:bg-canvas'}"
      >
        <span>{tab.icon}</span>
        <span class="hidden sm:inline">{tab.label}</span>
      </button>
    {/each}
  </div>

  <!-- Tab content -->
  <div class="animate-slide-up">

    <!-- === UMUM (General) TAB === -->
    {#if activeTab === 'umum'}
      <div class="card-brutal">
        <div class="mb-4">
          <h2 class="text-lg font-black uppercase tracking-wider">⚙️ Tetapan Umum</h2>
          <p class="text-xs text-ink/50 font-bold mt-1">Halaman permulaan, kebolehcapaian, dan lokasi.</p>
        </div>

        <div class="flex flex-col gap-5">
          <!-- Startup page -->
          <div>
            <p class="text-[10px] font-black uppercase tracking-wider text-ink/60 mb-2">Halaman Permulaan</p>
            <p class="text-xs text-ink/40 font-bold mb-2">Halaman yang dibuka apabila aplikasi dimulakan.</p>
            <div class="grid grid-cols-3 gap-2">
              {#each [{k:'solat' as const,l:'🕌 Waktu Solat'},{k:'quran' as const,l:'📖 Al-Quran'},{k:'dashboard' as const,l:'🏠 Dashboard'}] as pg}
                <button
                  onclick={() => saveStartupPage(pg.k)}
                  class="px-3 py-3 border-2 border-ink text-xs font-black uppercase tracking-wider transition-all duration-75
                         {startupPage === pg.k ? 'bg-accent-blue text-white shadow-[4px_4px_0px_0px_#0D0D0D]' : 'bg-white hover:bg-canvas'}"
                >{pg.l}</button>
              {/each}
            </div>
          </div>

          <!-- Reduced motion -->
          <div class="flex items-center justify-between border-t-2 border-ink/20 pt-4">
            <div>
              <span class="text-sm font-bold block">Kurangkan Animasi</span>
              <span class="text-xs text-ink/40 font-bold">Kurangkan pergerakan untuk keselesaan</span>
            </div>
            <button
              onclick={() => saveReducedMotion(!reducedMotion)}
              class="toggle-brutal"
              data-checked={reducedMotion}
              role="switch"
              aria-checked={reducedMotion}
              aria-label="Toggle reduced motion"
            ></button>
          </div>

          <!-- Auto-detect location -->
          <div class="flex items-center justify-between border-t-2 border-ink/20 pt-4">
            <div>
              <span class="text-sm font-bold block">Auto-Kesan Lokasi</span>
              <span class="text-xs text-ink/40 font-bold">Kesan zon solat secara automatik (GPS)</span>
            </div>
            <button
              onclick={() => saveAutoDetect(!autoDetectLocation)}
              class="toggle-brutal"
              data-checked={autoDetectLocation}
              role="switch"
              aria-checked={autoDetectLocation}
              aria-label="Toggle auto-detect location"
            ></button>
          </div>

          <!-- App info -->
          <div class="border-t-2 border-ink/20 pt-4">
            <div class="card-brutal-sm bg-accent-yellow/10">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-lg">📱</span>
                <span class="font-black text-sm">Ruang</span>
                <span class="chip-brutal bg-accent-yellow text-[10px]">v3.0</span>
              </div>
              <p class="text-xs text-ink/50 font-bold">Teman Muslim harian anda — Waktu Solat, Al-Quran, dan banyak lagi.</p>
              <p class="text-[10px] text-ink/30 font-bold mt-2">Dibina dengan Astro 5, Svelte 5, dan Tailwind CSS v4.</p>
            </div>
          </div>
        </div>
      </div>

    <!-- === SOLAT TAB === -->
    {:else if activeTab === 'solat'}
      <div class="card-brutal">
        <div class="mb-4">
          <h2 class="text-lg font-black uppercase tracking-wider">🕌 Tetapan Waktu Solat</h2>
          <p class="text-xs text-ink/50 font-bold mt-1">Zon, offset, waktu sunnah, dan pilihan lanjutan.</p>
        </div>
        <SolatSettings embedded={true} />
      </div>

    <!-- === QURAN TAB === -->
    {:else if activeTab === 'quran'}
      <div class="card-brutal">
        <div class="mb-4">
          <h2 class="text-lg font-black uppercase tracking-wider">📖 Tetapan Al-Quran</h2>
          <p class="text-xs text-ink/50 font-bold mt-1">Qari, terjemahan, fon, audio, dan mod paparan.</p>
        </div>

        <div class="flex flex-col gap-6">
          <!-- Reciter -->
          <div>
            <p class="text-[10px] font-black uppercase tracking-wider text-ink/60 mb-2">Qari (Reciter)</p>
            <div class="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
              {#each RECITERS as r}
                <button
                  onclick={() => { quranReciter = r.id; saveQuranSettings(); }}
                  class="text-left px-4 py-2 border-2 text-sm font-bold transition-all duration-75
                         {quranReciter === r.id ? 'border-ink bg-accent-yellow/20 shadow-[4px_4px_0px_0px_#0D0D0D]' : 'border-ink/20 hover:border-ink/40 bg-white'}"
                >
                  <span>{r.name}</span>
                  {#if r.style}<span class="text-xs text-ink/40 ml-1">({r.style})</span>{/if}
                  <span class="text-xs text-ink/30 ml-2" dir="rtl">{r.arabicName}</span>
                </button>
              {/each}
            </div>
          </div>

          <!-- Translation -->
          <div>
            <p class="text-[10px] font-black uppercase tracking-wider text-ink/60 mb-2">Terjemahan</p>
            <div class="flex flex-col gap-1.5">
              {#each TRANSLATIONS as t}
                <button
                  onclick={() => { quranTranslation = t.id; saveQuranSettings(); }}
                  class="text-left px-4 py-2 border-2 text-sm font-bold transition-all duration-75
                         {quranTranslation === t.id ? 'border-ink bg-accent-blue/10 shadow-[4px_4px_0px_0px_#0D0D0D]' : 'border-ink/20 hover:border-ink/40 bg-white'}"
                >
                  <span>{t.name}</span>
                  <span class="text-xs text-ink/40 ml-1 uppercase">({t.language})</span>
                </button>
              {/each}
            </div>
          </div>

          <!-- Font Script -->
          <div class="border-t-2 border-ink/20 pt-4">
            <p class="text-[10px] font-black uppercase tracking-wider text-ink/60 mb-2">Gaya Fon (Script)</p>
            <div class="grid grid-cols-3 gap-2">
              {#each SCRIPT_TYPES as sc}
                <button
                  onclick={() => { scriptType = sc.id; saveQuranSettings(); }}
                  class="px-3 py-2.5 border-2 border-ink text-xs font-bold transition-all duration-75 flex flex-col items-center gap-0.5
                         {scriptType === sc.id ? 'bg-accent-green text-white shadow-[4px_4px_0px_0px_#0D0D0D]' : 'bg-white hover:bg-canvas'}"
                >
                  <span class="font-black">{sc.name}</span>
                  <span class="text-[9px] opacity-70 text-center">{sc.description}</span>
                </button>
              {/each}
            </div>
          </div>

          <!-- Font Size -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <p class="text-[10px] font-black uppercase tracking-wider text-ink/60">Saiz Fon Arab</p>
              <span class="text-xs font-bold text-ink/50">{fontSize.toFixed(2)}rem</span>
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-ink/40">A</span>
              <input type="range" min={FONT_SIZE_MIN} max={FONT_SIZE_MAX} step={FONT_SIZE_STEP} bind:value={fontSize} oninput={saveQuranSettings} class="flex-1 accent-accent-blue" />
              <span class="text-lg font-bold text-ink/40">A</span>
            </div>
          </div>

          <!-- Display Mode -->
          <div class="border-t-2 border-ink/20 pt-4">
            <p class="text-[10px] font-black uppercase tracking-wider text-ink/60 mb-2">Mod Paparan Lalai</p>
            <div class="grid grid-cols-3 gap-2">
              {#each DISPLAY_MODES as dm}
                <button
                  onclick={() => { displayMode = dm.id; saveQuranSettings(); }}
                  class="px-3 py-2.5 border-2 border-ink text-xs font-bold transition-all duration-75 flex flex-col items-center gap-0.5
                         {displayMode === dm.id ? 'bg-accent-blue text-white shadow-[4px_4px_0px_0px_#0D0D0D]' : 'bg-white hover:bg-canvas'}"
                >
                  <span class="font-black">{dm.label}</span>
                  <span class="text-[9px] opacity-70 text-center">{dm.desc}</span>
                </button>
              {/each}
            </div>
          </div>

          <!-- Word-by-word below display -->
          <div>
            <p class="text-[10px] font-black uppercase tracking-wider text-ink/60 mb-2">Di Bawah Perkataan (Word-by-Word)</p>
            <div class="grid grid-cols-4 gap-1.5">
              {#each WORD_BELOW_OPTIONS as opt}
                <button
                  onclick={() => { wordBelow = opt.id; saveQuranSettings(); }}
                  class="px-2 py-2 border-2 border-ink text-[10px] font-black uppercase tracking-wider transition-all duration-75
                         {wordBelow === opt.id ? 'bg-accent-pink text-white shadow-[2px_2px_0px_0px_#0D0D0D]' : 'bg-white hover:bg-canvas'}"
                >{opt.label}</button>
              {/each}
            </div>
          </div>

          <!-- Audio defaults -->
          <div class="border-t-2 border-ink/20 pt-4">
            <p class="text-[10px] font-black uppercase tracking-wider text-ink/60 mb-3">Lalai Audio</p>

            <!-- Speed -->
            <div class="mb-3">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs font-bold">Kelajuan</span>
                <span class="text-xs font-bold text-ink/50">{audioSpeed}x</span>
              </div>
              <div class="flex gap-1.5">
                {#each PLAYBACK_SPEEDS as spd}
                  <button
                    onclick={() => { audioSpeed = spd; saveQuranSettings(); }}
                    class="flex-1 px-1 py-1.5 border-2 border-ink text-[10px] font-black transition-all duration-75
                           {audioSpeed === spd ? 'bg-accent-blue text-white shadow-[2px_2px_0px_0px_#0D0D0D]' : 'bg-white hover:bg-canvas'}"
                  >{spd}x</button>
                {/each}
              </div>
            </div>

            <!-- Volume -->
            <div class="mb-3">
              <div class="flex items-center justify-between mb-1">
                <span class="text-xs font-bold">Volume</span>
                <span class="text-xs font-bold text-ink/50">{audioVolume}%</span>
              </div>
              <input type="range" min="0" max="100" step="5" bind:value={audioVolume} oninput={saveQuranSettings} class="w-full accent-accent-blue" />
            </div>

            <!-- Auto-advance -->
            <div class="flex items-center justify-between">
              <div>
                <span class="text-sm font-bold block">Auto-Seterusnya</span>
                <span class="text-xs text-ink/40 font-bold">Main ayat seterusnya secara automatik</span>
              </div>
              <button
                onclick={() => { audioAutoAdvance = !audioAutoAdvance; saveQuranSettings(); }}
                class="toggle-brutal"
                data-checked={audioAutoAdvance}
                role="switch"
                aria-checked={audioAutoAdvance}
                aria-label="Toggle auto-advance"
              ></button>
            </div>
          </div>

          <button onclick={resetQuranDefaults} class="btn-brutal-sm text-xs self-start">Reset ke Lalai</button>
        </div>
      </div>

    <!-- === NOTIFICATIONS TAB === -->
    {:else if activeTab === 'notifications'}
      <div class="card-brutal">
        <div class="mb-4">
          <h2 class="text-lg font-black uppercase tracking-wider">🔔 Pemberitahuan</h2>
          <p class="text-xs text-ink/50 font-bold mt-1">Kawal amaran waktu solat dan bunyi.</p>
        </div>

        {#if notifPermission === 'default'}
          <div class="card-brutal-sm bg-accent-blue/10 mb-4">
            <p class="text-sm font-bold mb-2">Benarkan pemberitahuan pelayar untuk menerima amaran waktu solat.</p>
            <button onclick={requestNotifPermission} class="btn-brutal-sm text-xs bg-accent-blue text-white border-ink">Benarkan Pemberitahuan</button>
          </div>
        {:else if notifPermission === 'denied'}
          <div class="card-brutal-sm bg-accent-pink/10 mb-4">
            <p class="text-sm font-bold text-accent-pink">Pemberitahuan pelayar telah disekat. Sila benarkan dalam tetapan pelayar.</p>
          </div>
        {/if}

        <div class="flex flex-col gap-5">
          <!-- Master toggle -->
          <div class="flex items-center justify-between">
            <span class="text-sm font-black uppercase tracking-wider">Pemberitahuan Utama</span>
            <button
              onclick={() => { notifEnabled = !notifEnabled; saveNotifPrefs(); }}
              class="toggle-brutal"
              data-checked={notifEnabled}
              role="switch"
              aria-checked={notifEnabled}
              aria-label="Toggle notifications"
            ></button>
          </div>

          <!-- Types -->
          <div>
            <p class="text-[10px] font-black uppercase tracking-wider text-ink/60 mb-2">Jenis Amaran</p>
            <div class="grid grid-cols-3 gap-2">
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" bind:checked={notifBrowser} onchange={saveNotifPrefs} class="w-4 h-4 accent-accent-blue" />
                <span class="text-xs font-bold">Pelayar</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" bind:checked={notifSound} onchange={saveNotifPrefs} class="w-4 h-4 accent-accent-blue" />
                <span class="text-xs font-bold">Bunyi</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" bind:checked={notifVisual} onchange={saveNotifPrefs} class="w-4 h-4 accent-accent-blue" />
                <span class="text-xs font-bold">Visual</span>
              </label>
            </div>
          </div>

          <!-- Sound type -->
          <div>
            <p class="text-[10px] font-black uppercase tracking-wider text-ink/60 mb-2">Jenis Bunyi</p>
            <div class="flex gap-2">
              {#each [{k:'chime' as const,l:'Chime'},{k:'bell' as const,l:'Bell'},{k:'adhan' as const,l:'Adhan'}] as snd}
                <button
                  onclick={() => { notifSoundType = snd.k; saveNotifPrefs(); }}
                  class="px-4 py-2 border-2 border-ink text-xs font-black uppercase tracking-wider transition-all duration-75
                         {notifSoundType === snd.k ? 'bg-accent-blue text-white shadow-[4px_4px_0px_0px_#0D0D0D]' : 'bg-white hover:bg-canvas'}"
                >{snd.l}</button>
              {/each}
            </div>
          </div>

          <!-- Volume -->
          <div>
            <div class="flex items-center justify-between mb-1">
              <p class="text-[10px] font-black uppercase tracking-wider text-ink/60">Volume</p>
              <span class="text-xs font-bold text-ink/50">{notifVolume}%</span>
            </div>
            <input type="range" min="0" max="100" step="5" bind:value={notifVolume} oninput={saveNotifPrefs} class="w-full accent-accent-blue" />
          </div>

          <!-- Pre-minutes -->
          <div>
            <p class="text-[10px] font-black uppercase tracking-wider text-ink/60 mb-2">Amaran Awal (minit sebelum)</p>
            <div class="flex gap-2">
              {#each [0, 1, 3, 5, 10, 15] as m}
                <button
                  onclick={() => { notifPreMinutes = m; saveNotifPrefs(); }}
                  class="px-3 py-1.5 border-2 border-ink text-xs font-black transition-all duration-75
                         {notifPreMinutes === m ? 'bg-accent-green text-white shadow-[2px_2px_0px_0px_#0D0D0D]' : 'bg-white hover:bg-canvas'}"
                >{m}</button>
              {/each}
            </div>
          </div>

          <!-- Per-prayer toggles -->
          <div class="border-t-2 border-ink/20 pt-4">
            <p class="text-[10px] font-black uppercase tracking-wider text-ink/60 mb-2">Solat Tertentu</p>
            <div class="flex flex-wrap gap-2">
              {#each PRAYER_LABELS as prayer}
                <button
                  onclick={() => toggleNotifPrayer(prayer.key)}
                  class="px-3 py-2 border-2 border-ink text-xs font-black uppercase tracking-wider transition-all duration-75
                         {notifPerPrayer[prayer.key] ? 'bg-accent-blue text-white shadow-[4px_4px_0px_0px_#0D0D0D]' : 'bg-white text-ink/50 hover:border-ink/60'}"
                >{prayer.label}</button>
              {/each}
            </div>
          </div>

          <!-- Test -->
          <button onclick={testNotification} class="btn-brutal-sm text-sm bg-accent-yellow border-ink w-full sm:w-auto self-start">
            🔔 Uji Pemberitahuan
          </button>
        </div>
      </div>

    <!-- === DISPLAY TAB === -->
    {:else if activeTab === 'display'}
      <div class="card-brutal">
        <div class="mb-4">
          <h2 class="text-lg font-black uppercase tracking-wider">🎨 Paparan & Data</h2>
          <p class="text-xs text-ink/50 font-bold mt-1">Jam, sidebar, dan pengurusan data.</p>
        </div>

        <div class="flex flex-col gap-5">
          <!-- Clock format -->
          <div>
            <p class="text-[10px] font-black uppercase tracking-wider text-ink/60 mb-2">Format Jam</p>
            <div class="flex gap-2">
              <button
                onclick={() => { use24h = true; saveClockPrefs(); }}
                class="px-4 py-2 border-2 border-ink text-xs font-black uppercase tracking-wider transition-all duration-75
                       {use24h ? 'bg-accent-blue text-white shadow-[4px_4px_0px_0px_#0D0D0D]' : 'bg-white hover:bg-canvas'}"
              >24 Jam</button>
              <button
                onclick={() => { use24h = false; saveClockPrefs(); }}
                class="px-4 py-2 border-2 border-ink text-xs font-black uppercase tracking-wider transition-all duration-75
                       {!use24h ? 'bg-accent-blue text-white shadow-[4px_4px_0px_0px_#0D0D0D]' : 'bg-white hover:bg-canvas'}"
              >12 Jam (AM/PM)</button>
            </div>
          </div>

          <!-- Seconds toggle -->
          <div class="flex items-center justify-between">
            <span class="text-sm font-bold">Tunjuk Saat</span>
            <button
              onclick={() => { showSeconds = !showSeconds; saveClockPrefs(); }}
              class="toggle-brutal"
              data-checked={showSeconds}
              role="switch"
              aria-checked={showSeconds}
              aria-label="Toggle seconds"
            ></button>
          </div>

          <!-- Sidebar toggle -->
          <div class="flex items-center justify-between border-t-2 border-ink/20 pt-4">
            <div>
              <span class="text-sm font-bold block">Sidebar Kuncup</span>
              <span class="text-xs text-ink/40 font-bold">Mulakan sidebar dalam mod icon sahaja</span>
            </div>
            <button
              onclick={toggleSidebar}
              class="toggle-brutal"
              data-checked={sidebarCollapsed}
              role="switch"
              aria-checked={sidebarCollapsed}
              aria-label="Toggle sidebar collapsed"
            ></button>
          </div>

          <!-- Keyboard shortcut hint -->
          <div class="card-brutal-sm bg-accent-yellow/10">
            <p class="text-xs font-bold">Petua: Tekan <kbd class="px-1.5 py-0.5 bg-white border-2 border-ink font-mono text-xs">[</kbd> untuk toggle sidebar.</p>
          </div>

          <!-- Data Management -->
          <div class="border-t-4 border-ink pt-5">
            <p class="text-[10px] font-black uppercase tracking-wider text-ink/60 mb-3">Pengurusan Data</p>

            <div class="flex flex-col gap-2">
              <!-- Export -->
              <button onclick={exportPreferences} class="btn-brutal-sm text-xs bg-accent-green text-white border-ink w-full sm:w-auto self-start">
                📤 Eksport Tetapan
              </button>
              {#if exportStatus}
                <p class="text-xs font-bold text-accent-green">{exportStatus}</p>
              {/if}

              <!-- Import -->
              <button onclick={importPreferences} class="btn-brutal-sm text-xs bg-accent-blue text-white border-ink w-full sm:w-auto self-start">
                📥 Import Tetapan
              </button>
              {#if importStatus}
                <p class="text-xs font-bold text-accent-blue">{importStatus}</p>
              {/if}

              <!-- Clear cache -->
              <button onclick={clearCache} class="btn-brutal-sm text-xs w-full sm:w-auto self-start">
                🗑️ Bersihkan Cache
              </button>

              <!-- Reset all -->
              <div class="border-t-2 border-ink/20 pt-3 mt-2">
                <p class="text-xs text-ink/40 font-bold mb-2">Reset semua tetapan dan data ke lalai kilang.</p>
                <button onclick={resetAllSettings} class="btn-brutal-sm text-xs bg-accent-pink text-white border-ink w-full sm:w-auto self-start">
                  ⚠️ Reset Semua Tetapan
                </button>
              </div>
            </div>
          </div>

          <!-- About -->
          <div class="border-t-2 border-ink/20 pt-4">
            <p class="text-[10px] font-black uppercase tracking-wider text-ink/60 mb-2">Tentang</p>
            <div class="card-brutal-sm bg-white">
              <div class="flex items-center justify-between mb-1">
                <span class="font-black text-sm">Ruang</span>
                <span class="chip-brutal bg-accent-yellow text-[10px]">v3.0.0</span>
              </div>
              <p class="text-xs text-ink/50 font-bold">Teman Muslim harian anda.</p>
              <p class="text-[10px] text-ink/30 font-bold mt-1">Astro 5 · Svelte 5 · Tailwind v4 · Cloudflare Pages</p>
              <p class="text-[10px] text-ink/30 font-bold mt-1">Data waktu solat: JAKIM · Al-Quran: Quran.com API</p>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
