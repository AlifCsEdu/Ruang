globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_D7kXc7QO.mjs";
import { C as escape_html, B as ensure_array_like, z as attr_class, y as attr, O as stringify, K as attr_style, H as derived, D as renderComponent, h as renderTemplate, m as maybeRenderHead, g as addAttribute, G as renderTransition, J as createTransitionScope } from "./worker-entry_BueQH5e0.mjs";
import { $ as $$BaseLayout } from "./viewtransitions_4cCgKLLa.mjs";
function PrayerTracker($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const PRAYERS = [
      {
        key: "fajr",
        label: "Subuh",
        shortLabel: "Sub",
        color: "bg-accent-blue",
        textColor: "text-accent-blue",
        borderColor: "border-accent-blue"
      },
      {
        key: "dhuhr",
        label: "Zohor",
        shortLabel: "Zoh",
        color: "bg-accent-yellow",
        textColor: "text-accent-yellow",
        borderColor: "border-accent-yellow"
      },
      {
        key: "asr",
        label: "Asar",
        shortLabel: "Asr",
        color: "bg-accent-pink",
        textColor: "text-accent-pink",
        borderColor: "border-accent-pink"
      },
      {
        key: "maghrib",
        label: "Maghrib",
        shortLabel: "Mag",
        color: "bg-accent-green",
        textColor: "text-accent-green",
        borderColor: "border-accent-green"
      },
      {
        key: "isha",
        label: "Isyak",
        shortLabel: "Isy",
        color: "bg-indigo-500",
        textColor: "text-indigo-500",
        borderColor: "border-indigo-500"
      }
    ];
    const DAYS_TO_SHOW = 28;
    let trackerData = {};
    function todayStr() {
      const d = /* @__PURE__ */ new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    }
    function formatDateStr(d) {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    }
    let todayRecord = derived(() => {
      const rec = trackerData[todayStr()];
      return rec ?? {
        fajr: false,
        dhuhr: false,
        asr: false,
        maghrib: false,
        isha: false
      };
    });
    let todayDone = derived(() => PRAYERS.filter((p) => todayRecord()[p.key]).length);
    let days = derived(() => {
      const result = [];
      const today = /* @__PURE__ */ new Date();
      for (let i = DAYS_TO_SHOW - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        result.push({
          date: formatDateStr(d),
          dayNum: d.getDate(),
          dayName: d.toLocaleDateString("en-MY", { weekday: "short" }),
          month: d.toLocaleDateString("en-MY", { month: "short" }),
          isFri: d.getDay() === 5
        });
      }
      return result;
    });
    let streak = derived(() => {
      let count = 0;
      const today = /* @__PURE__ */ new Date();
      for (let i = 0; i < 365; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const ds = formatDateStr(d);
        const record = trackerData[ds];
        if (record && record.fajr && record.dhuhr && record.asr && record.maghrib && record.isha) {
          count++;
        } else if (i > 0) {
          break;
        }
      }
      return count;
    });
    let weeklyRate = derived(() => {
      const last7 = days().slice(-7);
      let total = 0;
      let checked = 0;
      for (const day of last7) {
        const record = trackerData[day.date];
        for (const prayer of PRAYERS) {
          total++;
          if (record?.[prayer.key]) checked++;
        }
      }
      return total > 0 ? Math.round(checked / total * 100) : 0;
    });
    let prayerStats = derived(() => {
      const last7 = days().slice(-7);
      return PRAYERS.map((p) => {
        let done = 0;
        for (const day of last7) {
          if (trackerData[day.date]?.[p.key]) done++;
        }
        return { ...p, done, total: 7, pct: Math.round(done / 7 * 100) };
      });
    });
    function isChecked(date, prayer) {
      return trackerData[date]?.[prayer] ?? false;
    }
    function isToday(date) {
      return date === todayStr();
    }
    const todayDisplay = (/* @__PURE__ */ new Date()).toLocaleDateString("en-MY", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric"
    });
    $$renderer2.push(`<div class="flex flex-col gap-5"><div class="card-brutal bg-white"><div class="flex items-center justify-between mb-4 border-b-4 border-ink pb-3"><div><p class="text-[10px] font-black uppercase tracking-wider text-ink/40">Today</p> <p class="font-black text-sm uppercase">${escape_html(todayDisplay)}</p></div> <div class="text-right"><p class="font-black text-2xl tabular-nums">${escape_html(todayDone())}<span class="text-ink/30 text-lg">/5</span></p> <p class="text-[10px] font-bold text-ink/40 uppercase">Complete</p></div></div> <div class="grid grid-cols-5 gap-2"><!--[-->`);
    const each_array = ensure_array_like(PRAYERS);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let prayer = each_array[$$index];
      const checked = todayRecord()[prayer.key];
      $$renderer2.push(`<button${attr_class(`flex flex-col items-center justify-center gap-1.5 p-3 border-4 transition-all duration-75 min-h-[5rem] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${checked ? `${prayer.color} text-white border-ink shadow-[4px_4px_0px_0px_#0D0D0D]` : "bg-white text-ink border-ink/30 hover:border-ink shadow-[2px_2px_0px_0px_#0D0D0D] hover:shadow-[4px_4px_0px_0px_#0D0D0D]"}`)}${attr("aria-label", `Toggle ${stringify(prayer.label)}`)}${attr("aria-pressed", checked)}>`);
      if (checked) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5"><path d="M20 6L9 17l-5-5"></path></svg>`);
      } else {
        $$renderer2.push("<!--[-1-->");
        $$renderer2.push(`<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="opacity-30"><circle cx="12" cy="12" r="10"></circle></svg>`);
      }
      $$renderer2.push(`<!--]--> <span class="text-[10px] font-black uppercase tracking-wider leading-none">${escape_html(prayer.label)}</span></button>`);
    }
    $$renderer2.push(`<!--]--></div></div> <div class="grid grid-cols-2 gap-2"><div class="card-brutal-sm text-center bg-accent-green/10"><p class="font-black text-3xl tabular-nums">${escape_html(streak())}</p> <p class="text-[10px] font-bold text-ink/60 uppercase tracking-wider">Day Streak</p></div> <div class="card-brutal-sm text-center bg-accent-blue/10"><p class="font-black text-3xl tabular-nums">${escape_html(weeklyRate())}<span class="text-lg">%</span></p> <p class="text-[10px] font-bold text-ink/60 uppercase tracking-wider">This Week</p></div></div> <div class="card-brutal-sm"><p class="text-[10px] font-black uppercase tracking-wider text-ink/40 mb-3 border-b-2 border-ink/10 pb-2">Weekly Breakdown</p> <div class="flex flex-col gap-2"><!--[-->`);
    const each_array_1 = ensure_array_like(prayerStats());
    for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
      let stat = each_array_1[$$index_1];
      $$renderer2.push(`<div class="flex items-center gap-2"><span class="text-xs font-black uppercase tracking-wider w-16 shrink-0">${escape_html(stat.label)}</span> <div class="flex-1 h-5 bg-ink/5 border border-ink/20 overflow-hidden"><div${attr_class(`h-full ${stringify(stat.color)} transition-all duration-300`)}${attr_style(`width: ${stringify(stat.pct)}%`)}></div></div> <span class="text-xs font-black tabular-nums w-10 text-right">${escape_html(stat.done)}/7</span></div>`);
    }
    $$renderer2.push(`<!--]--></div></div> <div class="card-brutal-sm"><p class="text-[10px] font-black uppercase tracking-wider text-ink/40 mb-3 border-b-2 border-ink/10 pb-2">Last 4 Weeks</p> <div class="overflow-x-auto -mx-1 px-1"><div class="grid grid-cols-7 gap-1 min-w-[340px]"><!--[-->`);
    const each_array_2 = ensure_array_like(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]);
    for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
      let day = each_array_2[$$index_2];
      $$renderer2.push(`<div class="text-center text-[9px] font-black uppercase tracking-wider text-ink/40 py-1">${escape_html(day)}</div>`);
    }
    $$renderer2.push(`<!--]--> <!--[-->`);
    const each_array_3 = ensure_array_like(days());
    for (let $$index_4 = 0, $$length = each_array_3.length; $$index_4 < $$length; $$index_4++) {
      let day = each_array_3[$$index_4];
      $$renderer2.push(`<div${attr_class(`border-2 p-1 flex flex-col gap-0.5 ${isToday(day.date) ? "border-ink bg-accent-yellow/20 shadow-[2px_2px_0px_0px_#0D0D0D]" : "border-ink/20 bg-white"} ${day.isFri && !isToday(day.date) ? "border-accent-yellow/40" : ""}`)}><div class="text-center text-[10px] font-black mb-0.5">${escape_html(day.dayNum)}</div> <!--[-->`);
      const each_array_4 = ensure_array_like(PRAYERS);
      for (let $$index_3 = 0, $$length2 = each_array_4.length; $$index_3 < $$length2; $$index_3++) {
        let prayer = each_array_4[$$index_3];
        $$renderer2.push(`<button${attr_class(`w-full h-5 border transition-all duration-75 cursor-pointer ${isChecked(day.date, prayer.key) ? `${prayer.color} border-ink` : "bg-white border-ink/20 hover:bg-ink/10 hover:border-ink/40"}`)}${attr("aria-label", `${stringify(prayer.label)} on day ${stringify(day.dayNum)}`)}></button>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]--></div></div></div> <div class="flex flex-wrap gap-3 justify-center"><!--[-->`);
    const each_array_5 = ensure_array_like(PRAYERS);
    for (let $$index_5 = 0, $$length = each_array_5.length; $$index_5 < $$length; $$index_5++) {
      let prayer = each_array_5[$$index_5];
      $$renderer2.push(`<span class="flex items-center gap-1.5 text-[10px] font-bold"><span${attr_class(`w-3 h-3 ${stringify(prayer.color)} border border-ink`)}></span> ${escape_html(prayer.label)}</span>`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
  });
}
const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Prayer Tracker — Ruang" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-2xl mx-auto px-4 py-8"${addAttribute(renderTransition($$result2, "h6q3fsjn", "", "page-tracker"), "data-astro-transition-scope")}> <h1 class="text-3xl font-black uppercase tracking-wider mb-6">Prayer Tracker</h1> ${renderComponent($$result2, "PrayerTracker", PrayerTracker, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/components/tracker/PrayerTracker.svelte", "client:component-export": "default", "data-astro-transition-persist": createTransitionScope($$result2, "an4amx5r") })} </div> ` })}`;
}, "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/pages/tracker/index.astro", "self");
const $$file = "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/pages/tracker/index.astro";
const $$url = "/tracker";
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
