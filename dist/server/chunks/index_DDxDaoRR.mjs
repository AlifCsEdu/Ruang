globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_CJsCsXD8.mjs";
import { C as escape_html, z as attr_class, O as attr_style, J as stringify, B as ensure_array_like, y as attr, G as derived, D as renderComponent, h as renderTemplate, m as maybeRenderHead, g as addAttribute, H as renderTransition } from "./worker-entry_C-jIstQk.mjs";
import { $ as $$BaseLayout } from "./BaseLayout_UTZfyRfD.mjs";
import { o as onDestroy } from "./index-server_CNjtzZRS.mjs";
import { g as gregorianToHijri, H as HIJRI_MONTHS, a as HIJRI_MONTHS_AR } from "./hijri_Cwf40bc_.mjs";
/* empty css                          */
function DashboardEnhanced($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { hijriDateStr, hijriDateAr } = $$props;
    let gregDateStr = "";
    let trackerData = {};
    const TRACKER_PRAYERS = [
      { key: "fajr", label: "Subuh", color: "bg-accent-blue" },
      { key: "dhuhr", label: "Zohor", color: "bg-accent-yellow" },
      { key: "asr", label: "Asar", color: "bg-accent-pink" },
      { key: "maghrib", label: "Maghrib", color: "bg-accent-green" },
      { key: "isha", label: "Isyak", color: "bg-indigo-500" }
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
    onDestroy(() => {
    });
    $$renderer2.push(`<div class="flex flex-col gap-6"><div><div class="flex items-end justify-between flex-wrap gap-2"><div><p class="text-sm font-bold text-ink/40 uppercase tracking-wider">${escape_html("...")}</p> <h1 class="text-3xl sm:text-4xl md:text-5xl font-black uppercase tracking-wider leading-tight">Assalamualaikum</h1></div> <div class="text-right"><p class="font-mono font-black text-2xl sm:text-3xl tabular-nums tracking-tight">${escape_html("--:--:--")}</p></div></div> <div class="mt-2 flex flex-wrap gap-x-4 gap-y-0.5"><p class="text-sm font-bold text-ink/40">${escape_html(gregDateStr)}</p> <p class="text-sm font-bold text-accent-blue" dir="rtl" lang="ar">${escape_html(hijriDateAr)}</p> <p class="text-sm font-bold text-ink/40">${escape_html(hijriDateStr)}</p></div></div> `);
    {
      $$renderer2.push("<!--[1-->");
      $$renderer2.push(`<div class="card-brutal bg-ink/5 animate-pulse"><div class="h-24 flex items-center justify-center"><span class="font-black text-ink/30 uppercase tracking-wider text-sm">Memuatkan waktu solat...</span></div></div>`);
    }
    $$renderer2.push(`<!--]--> <div class="card-brutal-sm"><div class="flex items-center justify-between mb-3"><div><p class="text-[10px] font-black uppercase tracking-wider text-ink/40">Solat Hari Ini</p></div> <div class="flex items-center gap-2"><span class="font-black text-xl tabular-nums">${escape_html(completedCount())}<span class="text-ink/30 text-sm">/5</span></span> `);
    if (streak() > 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<span class="badge-brutal bg-accent-green text-white text-[10px]">${escape_html(streak())}🔥</span>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div></div> <div class="h-3 border-2 border-ink bg-white overflow-hidden mb-3"><div${attr_class(`h-full transition-all duration-300 ${completedCount() === 5 ? "bg-accent-green" : "bg-accent-blue"}`)}${attr_style(`width: ${stringify(completedCount() / 5 * 100)}%`)}></div></div> <div class="grid grid-cols-5 gap-1.5"><!--[-->`);
    const each_array_1 = ensure_array_like(TRACKER_PRAYERS);
    for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
      let prayer = each_array_1[$$index_1];
      const checked = todayRecord()[prayer.key];
      $$renderer2.push(`<button${attr_class(`flex flex-col items-center justify-center gap-1 p-2 border-2 transition-all duration-75 min-h-[3rem] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer ${checked ? `${prayer.color} text-white border-ink shadow-[3px_3px_0px_0px_#0D0D0D]` : "bg-white text-ink/40 border-ink/20 hover:border-ink hover:text-ink"}`)}${attr("aria-label", `Toggle ${stringify(prayer.label)}`)}${attr("aria-pressed", checked)}>`);
      if (checked) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><path d="M20 6L9 17l-5-5"></path></svg>`);
      } else {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="opacity-40"><circle cx="12" cy="12" r="10"></circle></svg>`);
      }
      $$renderer2.push(`<!--]--> <span class="text-[8px] sm:text-[9px] font-black uppercase tracking-wider leading-none">${escape_html(prayer.label)}</span></button>`);
    }
    $$renderer2.push(`<!--]--></div></div> <div><p class="text-[10px] font-black uppercase tracking-wider text-ink/40 mb-2">Aksi Pantas</p> <div class="grid grid-cols-3 gap-2"><a href="/tasbih" class="card-brutal-sm flex flex-col items-center gap-2 text-center group hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#0D0D0D] transition-all duration-75 bg-accent-blue/5"><span class="text-2xl">📿</span> <span class="text-[10px] font-black uppercase tracking-wider">Tasbih</span></a> <a href="/duas" class="card-brutal-sm flex flex-col items-center gap-2 text-center group hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#0D0D0D] transition-all duration-75 bg-accent-pink/5"><span class="text-2xl">🤲</span> <span class="text-[10px] font-black uppercase tracking-wider">Dua Harian</span></a> <a href="/solat" class="card-brutal-sm flex flex-col items-center gap-2 text-center group hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#0D0D0D] transition-all duration-75 bg-accent-green/5"><span class="text-2xl">🕌</span> <span class="text-[10px] font-black uppercase tracking-wider">Waktu Solat</span></a></div></div> <div><p class="text-[10px] font-black uppercase tracking-wider text-ink/40 mb-2">Terokai</p> <div class="grid grid-cols-1 sm:grid-cols-2 gap-3"><a href="/quran" class="card-brutal-sm group hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#0D0D0D] transition-all duration-75 bg-accent-green/5 flex items-start gap-4"><div class="w-12 h-12 shrink-0 bg-accent-green/20 border-2 border-ink flex items-center justify-center"><span class="text-xl">📖</span></div> <div class="min-w-0"><p class="font-black text-sm uppercase tracking-wider">Al-Quran</p> <p class="text-xs font-bold text-ink/50 mt-0.5">Baca dengan terjemahan &amp; audio. 114 surah, 30 juzuk.</p></div></a> <a href="/duas" class="card-brutal-sm group hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#0D0D0D] transition-all duration-75 bg-accent-pink/5 flex items-start gap-4"><div class="w-12 h-12 shrink-0 bg-accent-pink/20 border-2 border-ink flex items-center justify-center"><span class="text-xl">🤲</span></div> <div class="min-w-0"><p class="font-black text-sm uppercase tracking-wider">Doa Pilihan</p> <p class="text-xs font-bold text-ink/50 mt-0.5">Himpunan doa harian dari Hisnul Muslim.</p></div></a> <a href="/hadith" class="card-brutal-sm group hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#0D0D0D] transition-all duration-75 bg-accent-yellow/10 flex items-start gap-4"><div class="w-12 h-12 shrink-0 bg-accent-yellow/20 border-2 border-ink flex items-center justify-center"><span class="text-xl">📜</span></div> <div class="min-w-0"><p class="font-black text-sm uppercase tracking-wider">Hadis</p> <p class="text-xs font-bold text-ink/50 mt-0.5">Tradisi &amp; ajaran Nabi Muhammad ﷺ.</p></div></a> <a href="/tracker" class="card-brutal-sm group hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#0D0D0D] transition-all duration-75 bg-accent-blue/5 flex items-start gap-4"><div class="w-12 h-12 shrink-0 bg-accent-blue/20 border-2 border-ink flex items-center justify-center"><span class="text-xl">✅</span></div> <div class="min-w-0"><p class="font-black text-sm uppercase tracking-wider">Tracker</p> <p class="text-xs font-bold text-ink/50 mt-0.5">`);
    if (streak() > 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`Streak semasa: ${escape_html(streak())} hari 🔥`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`Jejak solat harian anda. Bina streak!`);
    }
    $$renderer2.push(`<!--]--></p></div></a> <a href="/hijri" class="card-brutal-sm group hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#0D0D0D] transition-all duration-75 bg-accent-yellow/10 flex items-start gap-4"><div class="w-12 h-12 shrink-0 bg-accent-yellow/20 border-2 border-ink flex items-center justify-center"><span class="text-xl">📅</span></div> <div class="min-w-0"><p class="font-black text-sm uppercase tracking-wider">Kalendar Hijri</p> <p class="text-xs font-bold text-ink/50 mt-0.5">Takwim Islam &amp; tarikh-tarikh penting.</p></div></a> <a href="/tasbih" class="card-brutal-sm group hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#0D0D0D] transition-all duration-75 bg-indigo-50 flex items-start gap-4"><div class="w-12 h-12 shrink-0 bg-indigo-100 border-2 border-ink flex items-center justify-center"><span class="text-xl">📿</span></div> <div class="min-w-0"><p class="font-black text-sm uppercase tracking-wider">Tasbih Digital</p> <p class="text-xs font-bold text-ink/50 mt-0.5">Pembentang zikir dengan getaran haptik.</p></div></a></div></div></div>`);
  });
}
const $$Index = createComponent(($$result, $$props, $$slots) => {
  const today = /* @__PURE__ */ new Date();
  const hijriToday = gregorianToHijri(today.getFullYear(), today.getMonth() + 1, today.getDate());
  const hijriDateStr = `${hijriToday.day} ${HIJRI_MONTHS[hijriToday.month - 1]} ${hijriToday.year} AH`;
  const hijriDateAr = `${hijriToday.day} ${HIJRI_MONTHS_AR[hijriToday.month - 1]} ${hijriToday.year}`;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Ruang — Your Muslim Companion" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-4xl mx-auto px-4 py-6 sm:py-8"${addAttribute(renderTransition($$result2, "wwdvwa7n", "", "page-home"), "data-astro-transition-scope")}> ${renderComponent($$result2, "DashboardEnhanced", DashboardEnhanced, { "client:load": true, "hijriDateStr": hijriDateStr, "hijriDateAr": hijriDateAr, "client:component-hydration": "load", "client:component-path": "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/components/solat/DashboardEnhanced.svelte", "client:component-export": "default" })} </div> ` })}`;
}, "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/pages/index.astro", "self");
const $$file = "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/pages/index.astro";
const $$url = "";
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
