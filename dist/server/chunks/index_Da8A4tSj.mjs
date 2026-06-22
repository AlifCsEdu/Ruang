globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_BecWgU-U.mjs";
import { o as attr_class, p as escape_html, n as attr, y as attr_style, z as stringify, q as ensure_array_like, t as derived, v as renderComponent, h as renderTemplate, m as maybeRenderHead } from "./worker-entry_DPx-0duo.mjs";
import { $ as $$BaseLayout } from "./BaseLayout_D1fa7tmu.mjs";
import { o as onDestroy } from "./index-server_C4CFU-iE.mjs";
import { h as html } from "./html_BMy9tuiB.mjs";
function PrayerDashboard($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let hijriMonth = "";
    let trackerData = {};
    const TRACKER_PRAYERS = [
      {
        key: "fajr",
        label: "Subuh",
        color: "bg-accent-blue",
        textColor: "text-accent-blue"
      },
      {
        key: "dhuhr",
        label: "Zohor",
        color: "bg-accent-yellow",
        textColor: "text-accent-yellow"
      },
      {
        key: "asr",
        label: "Asar",
        color: "bg-accent-pink",
        textColor: "text-accent-pink"
      },
      {
        key: "maghrib",
        label: "Maghrib",
        color: "bg-accent-green",
        textColor: "text-accent-green"
      },
      {
        key: "isha",
        label: "Isyak",
        color: "bg-indigo-500",
        textColor: "text-indigo-500"
      }
    ];
    function todayStr() {
      const d = new Date((/* @__PURE__ */ new Date()).toLocaleString("en-US", { timeZone: "Asia/Kuala_Lumpur" }));
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    }
    let todayRecord = derived(() => trackerData[todayStr()] ?? {
      fajr: false,
      dhuhr: false,
      asr: false,
      maghrib: false,
      isha: false
    });
    let completedCount = derived(() => TRACKER_PRAYERS.filter((p) => todayRecord()[p.key]).length);
    let streak = derived(() => {
      let count = 0;
      const now = new Date((/* @__PURE__ */ new Date()).toLocaleString("en-US", { timeZone: "Asia/Kuala_Lumpur" }));
      for (let i = 0; i < 365; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        const record = trackerData[key];
        if (record && record.fajr && record.dhuhr && record.asr && record.maghrib && record.isha) {
          count++;
        } else if (i > 0) {
          break;
        }
      }
      return count;
    });
    let isRamadan = derived(() => hijriMonth === "رمضان");
    onDestroy(() => {
    });
    $$renderer2.push(`<div class="flex items-center gap-4 mb-3 border-b-2 border-ink/10"><button${attr_class(`pb-2 text-xs font-black uppercase tracking-wider transition-colors border-b-4 -mb-[2px] ${"border-accent-blue text-accent-blue"}`)}>📅 Hari Ini</button> <button${attr_class(`pb-2 text-xs font-black uppercase tracking-wider transition-colors border-b-4 -mb-[2px] ${"border-transparent text-ink/40 hover:text-ink/70"}`)}>📊 Minggu Ini</button></div> `);
    {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div class="flex flex-col gap-4 animate-[fadeSlideUp_0.3s_ease-out]">`);
      {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> <div class="card-hero bg-white relative overflow-hidden animate-[fadeSlideUp_0.3s_ease-out_0.05s_both]"><div class="absolute top-0 left-0 right-0 h-2 bg-accent-blue"></div> `);
      {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> <div class="flex items-center justify-center gap-2 mt-4 pt-3 border-t-2 border-ink/10"><button${attr_class(`text-[9px] font-black uppercase tracking-wider px-2 py-1 border-2 border-ink/20 hover:border-ink transition-colors shadow-[2px_2px_0px_0px_#0D0D0D] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none min-h-[2.75rem] flex items-center ${"bg-accent-yellow"}`)} title="Toggle 24h/12h">${escape_html("24H")}</button> <p class="font-mono font-black text-4xl sm:text-5xl lg:text-6xl tabular-nums tracking-tight leading-none select-none text-ink/60">${escape_html("--:--")}</p> <button${attr_class(`text-[9px] font-black uppercase tracking-wider px-2 py-1 border-2 border-ink/20 hover:border-ink transition-colors shadow-[2px_2px_0px_0px_#0D0D0D] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none min-h-[2.75rem] flex items-center ${"bg-accent-yellow"}`)} title="Toggle seconds">${escape_html("SEC")}</button></div> <div class="flex items-center justify-center gap-3 mt-2 flex-wrap"><p class="text-xs font-bold text-ink/50 tracking-wide">${escape_html("Loading...")}</p> `);
      {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div> `);
      if (isRamadan()) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<p class="mt-2 text-center text-xs font-black text-accent-pink animate-pulse">🌙 Ramadan Mubarak! Semoga ibadat diterima.</p>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> <div class="flex items-center gap-2 mt-3 pt-3 border-t-2 border-ink/10"><button class="text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 border-2 border-ink/20 hover:border-ink hover:bg-canvas transition-colors shadow-[2px_2px_0px_0px_#0D0D0D] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none min-h-[2.75rem] flex items-center"${attr("disabled", true, true)}>Kongsi `);
      {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></button> <button class="text-[9px] font-black uppercase tracking-wider px-2.5 py-1.5 border-2 border-ink/20 hover:border-ink hover:bg-canvas transition-colors shadow-[2px_2px_0px_0px_#0D0D0D] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none min-h-[2.75rem] flex items-center">🔔 Pemberitahuan `);
      {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></button> `);
      {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div></div> `);
      {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="flex items-center justify-center py-8"><div class="font-black text-ink/40 uppercase tracking-wider animate-pulse">Loading prayer times...</div></div>`);
      }
      $$renderer2.push(`<!--]--> `);
      {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> `);
      {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> <div class="border-t-4 border-ink pt-4 mt-1 animate-[fadeSlideUp_0.3s_ease-out_0.25s_both]"><div class="flex items-center justify-between mb-2"><p class="text-[10px] font-black uppercase tracking-wider text-ink/40">Tracker Hari Ini</p> <div class="flex items-center gap-2"><span class="font-black text-lg tabular-nums">${escape_html(completedCount())}<span class="text-ink/30 text-xs">/5</span></span> `);
      if (streak() > 0) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<span class="badge-brutal bg-accent-green text-white text-[10px]">${escape_html(streak())}🔥</span>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div></div> <div class="h-3 border-4 border-ink bg-white overflow-hidden mb-2"><div${attr_class(`h-full transition-all duration-300 ${completedCount() === 5 ? "bg-accent-green" : "bg-accent-blue"}`)}${attr_style(`width: ${stringify(completedCount() / 5 * 100)}%`)}></div></div> <div class="grid grid-cols-5 gap-1.5"><!--[-->`);
      const each_array_7 = ensure_array_like(TRACKER_PRAYERS);
      for (let $$index_7 = 0, $$length = each_array_7.length; $$index_7 < $$length; $$index_7++) {
        let prayer = each_array_7[$$index_7];
        const checked = todayRecord()[prayer.key];
        $$renderer2.push(`<button${attr_class(`flex flex-col items-center justify-center gap-1 p-1.5 sm:p-2.5 border-4 transition-all duration-75 min-h-[3.5rem] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${checked ? `${prayer.color} text-white border-ink shadow-[4px_4px_0px_0px_#0D0D0D]` : "bg-white text-ink border-ink/30 hover:border-ink shadow-[2px_2px_0px_0px_#0D0D0D] hover:shadow-[4px_4px_0px_0px_#0D0D0D]"}`)}${attr("aria-label", `Toggle ${stringify(prayer.label)}`)}${attr("aria-pressed", checked)}>`);
        if (checked) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><path d="M20 6L9 17l-5-5"></path></svg>`);
        } else {
          $$renderer2.push("<!--[-1-->");
          $$renderer2.push(`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="opacity-30"><circle cx="12" cy="12" r="10"></circle></svg>`);
        }
        $$renderer2.push(`<!--]--> <span class="text-[8px] sm:text-[9px] font-black uppercase tracking-wider leading-none">${escape_html(prayer.label)}</span></button>`);
      }
      $$renderer2.push(`<!--]--></div></div></div>`);
    }
    $$renderer2.push(`<!--]-->`);
  });
}
function svg(inner, bg = "") {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 300">${bg ? `<rect width="600" height="300" fill="${bg}"/>` : ""}${inner}</svg>`;
}
function stripes(colors, h = 300) {
  const sh = h / colors.length;
  return colors.map((c, i) => `<rect y="${i * sh}" width="600" height="${sh}" fill="${c}"/>`).join("");
}
const RED = "#CC0001";
const WHITE = "#FFFFFF";
const BLUE = "#010066";
const YELLOW = "#FFCC00";
const BLACK = "#000000";
const GREEN = "#006847";
const STATE_FLAGS = [
  {
    state: "Johor",
    emoji: "🏠",
    color: "#010066",
    // Blue field with red-white-blue-white stripes in canton, crescent+star
    svgPath: svg(
      `${stripes([BLUE, BLUE, BLUE, BLUE])}<rect width="300" height="150" fill="${BLUE}"/><rect x="0" y="0" width="300" height="37.5" fill="${RED}"/><rect x="0" y="75" width="300" height="37.5" fill="${RED}"/><path d="M380,150 a60,60 0 1,1 0.1,0" fill="${YELLOW}" opacity="0.9"/><path d="M400,150 a45,45 0 1,1 0.1,0" fill="${BLUE}"/><polygon points="460,130 467,148 486,148 471,159 477,177 460,167 443,177 449,159 434,148 453,148" fill="${YELLOW}"/>`,
      BLUE
    )
  },
  {
    state: "Kedah",
    emoji: "🌾",
    color: "#CC0001",
    // Red field with yellow crescent, star, and wreath
    svgPath: svg(
      `<path d="M240,150 a80,80 0 1,1 0.1,0" fill="${YELLOW}" opacity="0.85"/><path d="M265,150 a60,60 0 1,1 0.1,0" fill="${RED}"/><polygon points="370,120 380,148 410,148 387,165 395,193 370,177 345,193 353,165 330,148 360,148" fill="${YELLOW}"/>`,
      RED
    )
  },
  {
    state: "Kelantan",
    emoji: "🌙",
    color: "#CC0001",
    // Red field with white crescent, star, and two kris daggers
    svgPath: svg(
      `<path d="M250,150 a80,80 0 1,1 0.1,0" fill="${WHITE}" opacity="0.9"/><path d="M275,150 a58,58 0 1,1 0.1,0" fill="${RED}"/><polygon points="380,120 390,148 420,148 396,165 404,193 380,177 356,193 364,165 340,148 370,148" fill="${WHITE}"/><line x1="120" y1="80" x2="160" y2="220" stroke="${WHITE}" stroke-width="8"/><line x1="480" y1="80" x2="440" y2="220" stroke="${WHITE}" stroke-width="8"/>`,
      RED
    )
  },
  {
    state: "Melaka",
    emoji: "⚓",
    color: "#010066",
    // Blue-white-red-white stripes with yellow crescent+star in canton
    svgPath: svg(
      `${stripes([BLUE, WHITE, RED, WHITE])}<rect width="250" height="150" fill="${BLUE}"/><path d="M100,75 a40,40 0 1,1 0.1,0" fill="${YELLOW}" opacity="0.9"/><path d="M115,75 a28,28 0 1,1 0.1,0" fill="${BLUE}"/><polygon points="170,55 176,72 194,72 180,82 185,99 170,90 155,99 160,82 146,72 164,72" fill="${YELLOW}"/>`,
      BLUE
    )
  },
  {
    state: "Negeri Sembilan",
    emoji: "🛡️",
    color: "#FFCC00",
    // Yellow field with black triangle, red diagonal, white and black stripes
    svgPath: svg(
      `<rect width="600" height="100" fill="${YELLOW}"/><rect y="100" width="600" height="100" fill="${RED}"/><rect y="200" width="600" height="100" fill="${BLACK}"/><rect width="200" height="100" fill="${YELLOW}"/><polygon points="0,0 200,0 100,150" fill="${BLACK}"/><polygon points="30,20 170,20 100,120" fill="${RED}"/><circle cx="100" cy="55" r="15" fill="${YELLOW}"/><circle cx="80" cy="80" r="8" fill="${YELLOW}"/><circle cx="120" cy="80" r="8" fill="${YELLOW}"/>`,
      YELLOW
    )
  },
  {
    state: "Pahang",
    emoji: "🏔️",
    color: "#000000",
    // Black over white horizontal stripes
    svgPath: svg(
      `<rect width="600" height="150" fill="${BLACK}"/><rect y="150" width="600" height="150" fill="${WHITE}"/>`,
      BLACK
    )
  },
  {
    state: "Perak",
    emoji: "👑",
    color: "#FFCC00",
    // White-yellow-black horizontal stripes
    svgPath: svg(
      `<rect width="600" height="100" fill="${WHITE}"/><rect y="100" width="600" height="100" fill="${YELLOW}"/><rect y="200" width="600" height="100" fill="${BLACK}"/>`,
      WHITE
    )
  },
  {
    state: "Perlis",
    emoji: "🌿",
    color: "#FFCC00",
    // Yellow over green horizontal stripes
    svgPath: svg(
      `<rect width="600" height="150" fill="${YELLOW}"/><rect y="150" width="600" height="150" fill="${GREEN}"/>`,
      YELLOW
    )
  },
  {
    state: "Pulau Pinang",
    emoji: "🌴",
    color: "#010066",
    // Blue-white-yellow vertical stripes with tree
    svgPath: svg(
      `<rect width="200" height="300" fill="${BLUE}"/><rect x="200" width="200" height="300" fill="${WHITE}"/><rect x="400" width="200" height="300" fill="${YELLOW}"/><rect x="275" y="140" width="10" height="100" fill="#8B4513"/><ellipse cx="280" cy="130" rx="40" ry="30" fill="${GREEN}"/>`,
      BLUE
    )
  },
  {
    state: "Sabah",
    emoji: "🏝️",
    color: "#0038FF",
    // Blue-white-red triangle design with crescent
    svgPath: svg(
      `${stripes([BLUE, WHITE, RED])}<polygon points="0,0 250,150 0,300" fill="${BLUE}"/><path d="M100,150 a40,40 0 1,1 0.1,0" fill="${YELLOW}" opacity="0.9"/><path d="M115,150 a28,28 0 1,1 0.1,0" fill="${BLUE}"/>`,
      BLUE
    )
  },
  {
    state: "Sarawak",
    emoji: "🦜",
    color: "#FFCC00",
    // Yellow field with black-blue diagonal, red-yellow crescent+star
    svgPath: svg(
      `<rect width="600" height="300" fill="${YELLOW}"/><polygon points="0,0 600,0 600,300" fill="${BLACK}"/><polygon points="0,0 600,0 600,150" fill="${BLUE}"/><path d="M270,150 a55,55 0 1,1 0.1,0" fill="${YELLOW}" opacity="0.9"/><path d="M290,150 a38,38 0 1,1 0.1,0" fill="${BLUE}"/><polygon points="360,130 367,148 386,148 371,159 377,177 360,167 343,177 349,159 334,148 353,148" fill="${YELLOW}"/>`,
      YELLOW
    )
  },
  {
    state: "Selangor",
    emoji: "🏙️",
    color: "#CC0001",
    // Red-yellow quarters with white crescent+star in canton
    svgPath: svg(
      `<rect width="300" height="150" fill="${RED}"/><rect x="300" width="300" height="150" fill="${YELLOW}"/><rect y="150" width="300" height="150" fill="${YELLOW}"/><rect x="300" y="150" width="300" height="150" fill="${RED}"/><path d="M120,75 a40,40 0 1,1 0.1,0" fill="${WHITE}" opacity="0.9"/><path d="M135,75 a28,28 0 1,1 0.1,0" fill="${RED}"/><polygon points="185,55 191,72 209,72 195,82 200,99 185,90 170,99 175,82 161,72 179,72" fill="${WHITE}"/>`,
      RED
    )
  },
  {
    state: "Terengganu",
    emoji: "☪️",
    color: "#000000",
    // Black field with white border stripe, crescent+star
    svgPath: svg(
      `<rect x="20" y="20" width="560" height="260" fill="${BLACK}" stroke="${WHITE}" stroke-width="20"/><path d="M250,150 a65,65 0 1,1 0.1,0" fill="${WHITE}" opacity="0.9"/><path d="M275,150 a48,48 0 1,1 0.1,0" fill="${BLACK}"/><polygon points="370,120 380,148 410,148 387,165 395,193 370,177 345,193 353,165 330,148 360,148" fill="${WHITE}"/>`,
      BLACK
    )
  },
  {
    state: "Wilayah Persekutuan",
    emoji: "🏛️",
    color: "#010066",
    // Blue-white-red-yellow stripes with crescent+star
    svgPath: svg(
      `${stripes([RED, WHITE, BLUE, YELLOW])}<rect width="200" height="150" fill="${BLUE}"/><path d="M80,75 a35,35 0 1,1 0.1,0" fill="${YELLOW}" opacity="0.9"/><path d="M93,75 a24,24 0 1,1 0.1,0" fill="${BLUE}"/><polygon points="130,55 136,72 154,72 140,82 145,99 130,90 115,99 120,82 106,72 124,72" fill="${YELLOW}"/>`,
      BLUE
    )
  }
];
function getFlagByState(state) {
  return STATE_FLAGS.find((f) => f.state.toLowerCase() === state.toLowerCase());
}
function renderFlagSvg(state, width = 24, height = 16) {
  const flag = getFlagByState(state);
  if (!flag) return "";
  return flag.svgPath.replace("<svg ", `<svg width="${width}" height="${height}" `);
}
function ZoneSelector($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { currentZone } = $$props;
    let zones = [];
    let isOpen = false;
    let selectedZone = derived(() => zones.find((z) => z.id === currentZone));
    let selectedLabel = derived(() => selectedZone()?.name ?? currentZone);
    let selectedState = derived(() => selectedZone()?.state ?? "");
    function flagHtml(state) {
      return renderFlagSvg(state, 20, 14);
    }
    $$renderer2.push(`<div class="relative" data-zone-selector=""><button class="btn-brutal-sm flex items-center gap-2 w-full text-left"${attr("aria-expanded", isOpen)} aria-haspopup="listbox"${attr("aria-label", `Select prayer zone, currently ${stringify(selectedLabel())}`)}>`);
    if (selectedState()) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<span class="shrink-0 w-5 h-3.5 border border-ink/30 overflow-hidden" aria-hidden="true">${html(flagHtml(selectedState()))}</span>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <span class="truncate flex-1">${escape_html(selectedLabel())}</span> <span class="shrink-0 text-xs font-mono bg-accent-yellow px-1.5 py-0.5 border border-ink">${escape_html(currentZone)}</span> <span class="shrink-0">${escape_html("▼")}</span></button> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
function ZoneHeader($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let zone = "SGR01";
    let detecting = false;
    $$renderer2.push(`<div class="card-brutal-sm mb-4"><div class="flex items-center justify-between gap-3 flex-wrap"><div class="flex items-center gap-3 min-w-0 flex-1">`);
    {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<span class="text-2xl">📍</span>`);
    }
    $$renderer2.push(`<!--]--> <div class="min-w-0 flex-1"><p class="text-[10px] font-black uppercase tracking-wider text-ink/40">Zon Semasa</p> <p class="text-sm font-black truncate">${escape_html("Loading...")}</p> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> <span class="chip-brutal bg-accent-yellow shrink-0">${escape_html(zone)}</span></div> <div class="flex items-center gap-2 shrink-0">`);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <a${attr("href", `/solat/tv?zone=${stringify(zone)}`)} class="btn-brutal-sm text-[10px] bg-accent-green text-white border-ink flex items-center gap-1" aria-label="Open full screen mode">⛶ Skrin Penuh</a> <button${attr("disabled", detecting, true)} class="btn-brutal-sm text-[10px] bg-accent-blue text-white border-ink flex items-center gap-1 disabled:opacity-50 disabled:cursor-wait" aria-label="Auto-detect location">`);
    {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<span class="relative flex h-2.5 w-2.5"><span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span> <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span></span> Auto-Lokasi`);
    }
    $$renderer2.push(`<!--]--></button></div></div> <div class="mt-3">`);
    ZoneSelector($$renderer2, { currentZone: zone });
    $$renderer2.push(`<!----></div> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Waktu Solat — Ruang" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-4xl mx-auto px-4 py-8"> <!-- Page header --> <div class="flex items-center justify-between mb-2"> <h1 class="text-3xl font-black uppercase tracking-wider">Waktu Solat</h1> <div class="flex items-center gap-2"> <a href="/solat/tracker" class="btn-brutal-sm text-xs">📊 Tracker</a> <a href="/solat/tetapan" class="btn-brutal-sm text-xs">⚙️ Tetapan</a> </div> </div> <div class="h-1 w-16 bg-accent-yellow border-2 border-ink mb-6"></div> <!-- Zone header --> ${renderComponent($$result2, "ZoneHeader", ZoneHeader, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/components/solat/ZoneHeader.svelte", "client:component-export": "default" })} <!-- Prayer dashboard --> ${renderComponent($$result2, "PrayerDashboard", PrayerDashboard, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/components/solat/PrayerDashboard.svelte", "client:component-export": "default" })} <!-- Quick links --> <div class="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3"> <a href="/quran" class="card-brutal-sm text-center py-4 hover:bg-accent-yellow/10 transition-colors"> <p class="text-2xl mb-1">📖</p> <p class="text-xs font-black uppercase tracking-wider">Al-Quran</p> </a> <a href="/duas" class="card-brutal-sm text-center py-4 hover:bg-accent-yellow/10 transition-colors"> <p class="text-2xl mb-1">🤲</p> <p class="text-xs font-black uppercase tracking-wider">Doa</p> </a> <a href="/tasbih" class="card-brutal-sm text-center py-4 hover:bg-accent-yellow/10 transition-colors"> <p class="text-2xl mb-1">📿</p> <p class="text-xs font-black uppercase tracking-wider">Tasbih</p> </a> <a href="/hijri" class="card-brutal-sm text-center py-4 hover:bg-accent-yellow/10 transition-colors"> <p class="text-2xl mb-1">📅</p> <p class="text-xs font-black uppercase tracking-wider">Takwim</p> </a> </div> </div> ` })}`;
}, "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/pages/solat/index.astro", void 0);
const $$file = "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/pages/solat/index.astro";
const $$url = "/solat";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
