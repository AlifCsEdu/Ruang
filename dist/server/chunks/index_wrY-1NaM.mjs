globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_CJsCsXD8.mjs";
import { z as attr_class, C as escape_html, B as ensure_array_like, O as attr_style, J as stringify, y as attr, G as derived, D as renderComponent, h as renderTemplate, m as maybeRenderHead } from "./worker-entry_C-jIstQk.mjs";
import { $ as $$BaseLayout } from "./BaseLayout_UTZfyRfD.mjs";
import { o as onDestroy } from "./index-server_CNjtzZRS.mjs";
function PrayerDashboard($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let hijriDateStr = "";
    let hijriDateAr = "";
    let hijriMonth = "";
    let trackerData = {};
    let weekStats = [];
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
    $$renderer2.push(`<div class="flex flex-col gap-6">`);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div class="text-center py-4"><div class="flex items-center justify-center gap-3 mb-2"><button${attr_class(`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border-2 border-ink/20 hover:border-ink transition-colors ${"bg-accent-yellow"}`)} title="Toggle 24h/12h format">${escape_html("24H")}</button> <p class="font-mono font-black text-5xl sm:text-6xl lg:text-7xl tabular-nums tracking-tight leading-none select-none">${escape_html("--:--")}</p> <button${attr_class(`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 border-2 border-ink/20 hover:border-ink transition-colors ${"bg-accent-yellow"}`)} title="Toggle seconds">${escape_html("SEC")}</button></div> <p class="text-sm font-bold text-ink/60">${escape_html("Loading...")}</p> <div class="mt-1 inline-flex items-center gap-2 px-3 py-1 border-2 border-ink bg-white"><span class="text-xs font-black text-accent-blue" dir="rtl" lang="ar">${escape_html(hijriDateAr)}</span> <span class="text-ink/20">|</span> <span class="text-xs font-bold text-ink/60">${escape_html(hijriDateStr)}</span></div> `);
    if (isRamadan()) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<p class="mt-2 text-xs font-black text-accent-pink animate-pulse">🌙 Ramadan Mubarak! Semoga ibadat diterima.</p>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="flex items-center justify-center py-12"><div class="font-black text-ink/40 uppercase tracking-wider animate-pulse">Loading prayer times...</div></div>`);
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div class="border-t-2 border-ink/20 pt-4"><p class="text-[10px] font-black uppercase tracking-wider text-ink/40 mb-2">Minggu Ini</p> <div class="flex items-end gap-1 h-16"><!--[-->`);
    const each_array_1 = ensure_array_like(weekStats);
    for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
      let stat = each_array_1[$$index_1];
      $$renderer2.push(`<div class="flex-1 flex flex-col items-center gap-0.5"><div class="w-full bg-accent-blue/80 transition-all duration-300 min-h-[2px]"${attr_style(`height: ${stringify(stat.count / 5 * 48)}px`)}></div> <span class="text-[8px] font-black text-ink/50">${escape_html(stat.count)}/5</span> <span class="text-[8px] font-black text-ink/30">${escape_html(stat.day)}</span></div>`);
    }
    $$renderer2.push(`<!--]--></div></div> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div class="border-t-4 border-ink pt-5 mt-1"><div class="flex items-center justify-between mb-3"><div><p class="text-[10px] font-black uppercase tracking-wider text-ink/40">Tracker Hari Ini</p></div> <div class="flex items-center gap-2"><span class="font-black text-lg tabular-nums">${escape_html(completedCount())}<span class="text-ink/30 text-sm">/5</span></span> `);
    if (streak() > 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<span class="badge-brutal bg-accent-green text-white text-[10px]">${escape_html(streak())}🔥</span>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div></div> <div class="h-3 border-2 border-ink bg-white overflow-hidden mb-3"><div${attr_class(`h-full transition-all duration-300 ${completedCount() === 5 ? "bg-accent-green" : "bg-accent-blue"}`)}${attr_style(`width: ${stringify(completedCount() / 5 * 100)}%`)}></div></div> <div class="grid grid-cols-5 gap-2"><!--[-->`);
    const each_array_4 = ensure_array_like(TRACKER_PRAYERS);
    for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
      let prayer = each_array_4[$$index_4];
      const checked = todayRecord()[prayer.key];
      $$renderer2.push(`<button${attr_class(`flex flex-col items-center justify-center gap-1.5 p-2 sm:p-3 border-4 transition-all duration-75 min-h-[4rem] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${checked ? `${prayer.color} text-white border-ink shadow-[4px_4px_0px_0px_#0D0D0D]` : "bg-white text-ink border-ink/30 hover:border-ink shadow-[2px_2px_0px_0px_#0D0D0D] hover:shadow-[4px_4px_0px_0px_#0D0D0D]"}`)}${attr("aria-label", `Toggle ${stringify(prayer.label)}`)}${attr("aria-pressed", checked)}>`);
      if (checked) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><path d="M20 6L9 17l-5-5"></path></svg>`);
      } else {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="opacity-30"><circle cx="12" cy="12" r="10"></circle></svg>`);
      }
      $$renderer2.push(`<!--]--> <span class="text-[9px] sm:text-[10px] font-black uppercase tracking-wider leading-none">${escape_html(prayer.label)}</span></button>`);
    }
    $$renderer2.push(`<!--]--></div></div></div>`);
  });
}
const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Waktu Solat — Ruang" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-4xl mx-auto px-4 py-8"> <!-- Page header with accent bar --> <div class="mb-6"> <div class="flex items-center justify-between mb-2"> <h1 class="text-3xl font-black uppercase tracking-wider">Waktu Solat</h1> <div class="flex items-center gap-2"> <a href="/tracker" class="btn-brutal-sm text-xs">📊 Tracker</a> <a href="/settings" class="btn-brutal-sm text-xs">⚙️ Tetapan</a> </div> </div> <p class="text-sm font-bold text-ink/60">Jadual solat harian, countdown, dan tracker untuk Malaysia.</p> </div> <div class="accent-bar mb-6"></div> <!-- Main prayer dashboard --> <div class="card-hero"> ${renderComponent($$result2, "PrayerDashboard", PrayerDashboard, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/components/solat/PrayerDashboard.svelte", "client:component-export": "default" }, { "default": ($$result3) => renderTemplate` <div class="text-center py-16 animate-pulse"> <p class="font-black text-ink/40 uppercase tracking-wider">Loading prayer times...</p> </div> ` })} </div> <!-- Quick links footer --> <div class="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-2"> <a href="/quran" class="card-brutal-sm text-center hover:bg-accent-green/10 transition-colors duration-75 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"> <p class="text-lg mb-1">📖</p> <p class="text-[10px] font-black uppercase tracking-wider">Al-Quran</p> </a> <a href="/duas" class="card-brutal-sm text-center hover:bg-accent-pink/10 transition-colors duration-75 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"> <p class="text-lg mb-1">🤲</p> <p class="text-[10px] font-black uppercase tracking-wider">Doa</p> </a> <a href="/tasbih" class="card-brutal-sm text-center hover:bg-accent-blue/10 transition-colors duration-75 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"> <p class="text-lg mb-1">📿</p> <p class="text-[10px] font-black uppercase tracking-wider">Tasbih</p> </a> <a href="/hijri" class="card-brutal-sm text-center hover:bg-accent-yellow/20 transition-colors duration-75 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"> <p class="text-lg mb-1">📅</p> <p class="text-[10px] font-black uppercase tracking-wider">Kalendar</p> </a> </div> </div> ` })}`;
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
