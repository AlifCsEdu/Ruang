<script lang="ts">
  import { onMount } from 'svelte';
  import SolatSettings from '../solat/SolatSettings.svelte';
  import { RECITERS, TRANSLATIONS } from '../../lib/quran/constants';

  type Tab = 'solat' | 'quran' | 'notifications' | 'display';
  let activeTab = $state<Tab>('solat');

  // Quran settings state
  let quranReciter = $state(7);
  let quranTranslation = $state(131);

  // Notification settings
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

  // Display settings
  let use24h = $state(true);
  let showSeconds = $state(true);
  let sidebarCollapsed = $state(false);

  const NOTIF_KEY = 'ruang_notif_prefs_v2';
  const CLOCK_KEY = 'ruang_clock_24h';
  const SIDEBAR_KEY = 'ruang_sidebar_collapsed';

  const TABS: { key: Tab; label: string; icon: string }[] = [
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

  onMount(() => {
    // Load Quran settings
    const sr = localStorage.getItem('ruang_quran_reciter');
    const st = localStorage.getItem('ruang_quran_translation');
    if (sr) quranReciter = parseInt(sr, 10);
    if (st) quranTranslation = parseInt(st, 10);

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

    // Notification permission
    if ('Notification' in window) notifPermission = Notification.permission;
  });

  function saveQuranSettings() {
    localStorage.setItem('ruang_quran_reciter', String(quranReciter));
    localStorage.setItem('ruang_quran_translation', String(quranTranslation));
    window.dispatchEvent(new CustomEvent('quran-settings-changed', {
      detail: { reciter: quranReciter, translation: quranTranslation },
    }));
  }

  function resetQuranDefaults() {
    quranReciter = 7;
    quranTranslation = 131;
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
    // Dispatch event so sidebar can react
    window.dispatchEvent(new CustomEvent('sidebar-toggle-external'));
  }
</script>

<div class="flex flex-col gap-6">
  <!-- Tab navigation -->
  <div class="flex border-4 border-ink bg-white shadow-[8px_8px_0px_0px_#0D0D0D] overflow-x-auto">
    {#each TABS as tab}
      <button
        onclick={() => (activeTab = tab.key)}
        class="flex-1 min-w-[7rem] px-4 py-3 text-xs font-black uppercase tracking-wider transition-all duration-75 flex items-center justify-center gap-2 border-r-2 border-r-ink last:border-r-0
               {activeTab === tab.key ? 'bg-ink text-white' : 'bg-white text-ink hover:bg-canvas'}"
      >
        <span>{tab.icon}</span>
        <span>{tab.label}</span>
      </button>
    {/each}
  </div>

  <!-- Tab content -->
  <div class="animate-slide-up">
    <!-- === SOLAT TAB === -->
    {#if activeTab === 'solat'}
      <div class="card-brutal">
        <div class="mb-4">
          <h2 class="text-lg font-black uppercase tracking-wider">🕌 Tetapan Waktu Solat</h2>
          <p class="text-xs text-ink/50 font-bold mt-1">Zon, offset, waktu sunnah, dan pilihan lanjutan.</p>
        </div>
        <SolatSettings client:load />
      </div>

    <!-- === QURAN TAB === -->
    {:else if activeTab === 'quran'}
      <div class="card-brutal">
        <div class="mb-4">
          <h2 class="text-lg font-black uppercase tracking-wider">📖 Tetapan Al-Quran</h2>
          <p class="text-xs text-ink/50 font-bold mt-1">Qari, terjemahan, dan pilihan paparan.</p>
        </div>

        <div class="flex flex-col gap-6">
          <!-- Reciter -->
          <div>
            <p class="text-[10px] font-black uppercase tracking-wider text-ink/60 mb-2">Qari (Reciter)</p>
            <div class="flex flex-col gap-1.5">
              {#each RECITERS as r}
                <button
                  onclick={() => { quranReciter = r.id; saveQuranSettings(); }}
                  class="text-left px-4 py-2.5 border-2 text-sm font-bold transition-all duration-75
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
                  class="text-left px-4 py-2.5 border-2 text-sm font-bold transition-all duration-75
                         {quranTranslation === t.id ? 'border-ink bg-accent-blue/10 shadow-[4px_4px_0px_0px_#0D0D0D]' : 'border-ink/20 hover:border-ink/40 bg-white'}"
                >
                  <span>{t.name}</span>
                  <span class="text-xs text-ink/40 ml-1 uppercase">({t.language})</span>
                </button>
              {/each}
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
              {#each [{k:'chime',l:'Chime'},{k:'bell',l:'Bell'},{k:'adhan',l:'Adhan'}] as snd}
                <button
                  onclick={() => { notifSoundType = snd.k as typeof notifSoundType; saveNotifPrefs(); }}
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
          <h2 class="text-lg font-black uppercase tracking-wider">🎨 Paparan</h2>
          <p class="text-xs text-ink/50 font-bold mt-1">Jam, sidebar, dan pilihan visual.</p>
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
        </div>
      </div>
    {/if}
  </div>
</div>
