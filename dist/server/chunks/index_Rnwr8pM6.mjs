globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_BecWgU-U.mjs";
import { p as escape_html, o as attr_class, q as ensure_array_like, t as derived, v as renderComponent, h as renderTemplate, m as maybeRenderHead } from "./worker-entry_DPx-0duo.mjs";
import { $ as $$BaseLayout } from "./BaseLayout_D1fa7tmu.mjs";
import { h as hijriToGregorian, g as gregorianToHijri } from "./hijri_Cwf40bc_.mjs";
const GREGORIAN_HOLIDAYS = {
  "1-1": { name: "New Year's Day", nameMs: "Tahun Baru", type: "national" },
  "2-1": { name: "Federal Territory Day", nameMs: "Hari Wilayah Persekutuan", type: "national" },
  "5-1": { name: "Labour Day", nameMs: "Hari Pekerja", type: "national" },
  "5-13": { name: "His Majesty's Birthday", nameMs: "Hari Keputeraan YDP Agong", type: "national" },
  "8-31": { name: "National Day", nameMs: "Hari Kebangsaan", type: "national" },
  "9-16": { name: "Malaysia Day", nameMs: "Hari Malaysia", type: "national" },
  "12-25": { name: "Christmas Day", nameMs: "Hari Krismas", type: "national" }
};
const ISLAMIC_HOLIDAYS = {
  "1-1": { name: "Awal Muharram", nameMs: "Awal Muharram", type: "islamic" },
  "1-10": { name: "Hari Asyura", nameMs: "Hari Asyura", type: "islamic" },
  "3-12": { name: "Maulidur Rasul", nameMs: "Maulidur Rasul", type: "islamic" },
  "7-27": { name: "Israk & Mikraj", nameMs: "Israk & Mikraj", type: "islamic" },
  "8-15": { name: "Nisfu Syaaban", nameMs: "Nisfu Syaaban", type: "observance" },
  "9-1": { name: "Awal Ramadan", nameMs: "Awal Ramadan", type: "islamic" },
  "9-17": { name: "Nuzul Al-Quran", nameMs: "Nuzul Al-Quran", type: "islamic" },
  "10-1": { name: "Hari Raya Aidilfitri", nameMs: "Hari Raya Aidilfitri", type: "islamic" },
  "10-2": { name: "Hari Raya Aidilfitri (2nd day)", nameMs: "Hari Raya Aidilfitri (Hari Kedua)", type: "islamic" },
  "12-9": { name: "Hari Arafah", nameMs: "Hari Arafah", type: "observance" },
  "12-10": { name: "Hari Raya Aidiladha", nameMs: "Hari Raya Aidiladha", type: "islamic" },
  "12-11": { name: "Hari Raya Aidiladha (2nd day)", nameMs: "Hari Raya Aidiladha (Hari Kedua)", type: "islamic" }
};
function getIslamicHolidaysForYear(gYear) {
  const results = [];
  for (const [key, event] of Object.entries(ISLAMIC_HOLIDAYS)) {
    const [hMonth, hDay] = key.split("-").map(Number);
    const estimatedHYear = gYear - 578;
    for (const hYear of [estimatedHYear, estimatedHYear + 1]) {
      try {
        const g = hijriToGregorian(hYear, hMonth, hDay);
        if (g.year === gYear) {
          results.push({
            date: new Date(g.year, g.month - 1, g.day),
            event
          });
        }
      } catch {
      }
    }
  }
  results.sort((a, b) => a.date.getTime() - b.date.getTime());
  return results;
}
function getGregorianHolidaysForYear(year) {
  return Object.entries(GREGORIAN_HOLIDAYS).map(([key, event]) => {
    const [month, day] = key.split("-").map(Number);
    return { date: new Date(year, month - 1, day), event };
  });
}
const DAY_NAMES = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
];
function getMonthName(month) {
  return MONTH_NAMES[month - 1] ?? "";
}
function CalendarGrid($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const today = /* @__PURE__ */ new Date();
    let year = today.getFullYear();
    let month = today.getMonth() + 1;
    let grid = [];
    let selectedDay = null;
    let todayHijri = gregorianToHijri(today.getFullYear(), today.getMonth() + 1, today.getDate());
    let upcomingHolidays = derived(() => {
      const now = /* @__PURE__ */ new Date();
      now.setHours(0, 0, 0, 0);
      const allHolidays = [];
      for (const y of [now.getFullYear(), now.getFullYear() + 1]) {
        allHolidays.push(...getGregorianHolidaysForYear(y));
      }
      for (const y of [now.getFullYear(), now.getFullYear() + 1]) {
        allHolidays.push(...getIslamicHolidaysForYear(y));
      }
      const past = new Date(now);
      past.setDate(past.getDate() - 7);
      const future = new Date(now);
      future.setDate(future.getDate() + 90);
      return allHolidays.filter((h) => h.date >= past && h.date <= future).sort((a, b) => a.date.getTime() - b.date.getTime());
    });
    function formatHolidayDate(d) {
      return d.toLocaleDateString("en-MY", { weekday: "short", day: "numeric", month: "short" });
    }
    function isPast(d) {
      const now = /* @__PURE__ */ new Date();
      now.setHours(0, 0, 0, 0);
      return d < now;
    }
    function isTodayDate(d) {
      return d.toDateString() === (/* @__PURE__ */ new Date()).toDateString();
    }
    $$renderer2.push(`<div class="flex flex-col gap-4"><div class="card-brutal text-center bg-accent-green/10"><p class="text-sm font-bold text-ink/60 uppercase tracking-wider">Today</p> <p class="font-black text-2xl sm:text-3xl my-1">${escape_html(todayHijri.day)} ${escape_html(todayHijri.monthName)}</p> <p class="arabic-text text-lg sm:text-xl" dir="rtl" style="line-height: 1.8;">${escape_html(todayHijri.day)} ${escape_html(todayHijri.monthNameAr)} ${escape_html(todayHijri.year)}هـ</p> <p class="text-xs text-ink/50 font-bold mt-1">${escape_html(today.toLocaleDateString("en-MY", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    }))}</p></div> <div class="card-brutal"><div class="flex items-center justify-between mb-4 border-b-4 border-ink pb-3"><button class="btn-brutal-sm text-xs" aria-label="Previous month"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M15 18l-6-6 6-6"></path></svg></button> <div class="text-center"><h2 class="font-black text-lg sm:text-xl uppercase tracking-wider">${escape_html(getMonthName(month))} ${escape_html(year)}</h2> <button class="text-[10px] font-bold text-accent-blue underline mt-0.5">Today</button></div> <button class="btn-brutal-sm text-xs" aria-label="Next month"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M9 18l6-6-6-6"></path></svg></button></div> <div class="flex border-2 border-ink mb-3"><button${attr_class(`flex-1 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider transition-colors duration-75 ${"bg-ink text-white"}`)}>Gregorian</button> <button${attr_class(`flex-1 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider border-l-2 border-ink transition-colors duration-75 ${"bg-white text-ink hover:bg-canvas"}`)}>Hijri Primary</button></div> <div class="grid grid-cols-7 gap-0.5 mb-1"><!--[-->`);
    const each_array = ensure_array_like(DAY_NAMES);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let day = each_array[$$index];
      $$renderer2.push(`<div${attr_class(`text-center text-[10px] font-black uppercase tracking-wider text-ink/40 py-1.5 ${day === "Fri" ? "text-accent-yellow" : ""}`)}>${escape_html(day)}</div>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="grid grid-cols-7 gap-0.5"><!--[-->`);
    const each_array_1 = ensure_array_like(grid);
    for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
      let day = each_array_1[$$index_1];
      $$renderer2.push(`<button${attr_class(`calendar-day relative text-left p-1 sm:p-1.5 min-h-[3.5rem] sm:min-h-[4.5rem] md:min-h-[5rem] transition-all duration-75 ${day.isToday ? "calendar-day-today" : ""} ${day.events.length > 0 ? "calendar-day-holiday" : ""} ${!day.inMonth ? "opacity-30" : ""} ${selectedDay?.gDay === day.gDay && selectedDay?.gMonth === day.gMonth && selectedDay?.gYear === day.gYear ? "border-ink bg-accent-blue/5" : ""} ${day.isFriday && day.inMonth ? "border-accent-yellow/40" : ""}`)}>`);
      {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<span class="text-[10px] sm:text-xs font-black block">${escape_html(day.gDay)}</span> <span class="text-[8px] sm:text-[9px] font-bold text-ink/40 block leading-tight">${escape_html(day.hijri.day)} ${escape_html(day.hijri.monthName.slice(0, 3))}</span>`);
      }
      $$renderer2.push(`<!--]--> `);
      if (day.events.length > 0) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="absolute bottom-0.5 left-0.5 right-0.5"><span class="hidden sm:block text-[7px] sm:text-[8px] font-bold bg-accent-pink text-white px-0.5 py-px truncate leading-tight text-center">${escape_html(day.events[0].name.split(" ")[0])}</span> <span class="sm:hidden block w-1.5 h-1.5 bg-accent-pink rounded-full mx-auto"></span></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (day.isFriday && day.inMonth) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-accent-yellow rounded-full"></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></button>`);
    }
    $$renderer2.push(`<!--]--></div></div> <div class="flex flex-wrap items-center gap-3 text-[10px] font-bold"><div class="flex items-center gap-1"><div class="w-3 h-3 border-2 border-ink bg-accent-yellow/20"></div> <span>Today</span></div> <div class="flex items-center gap-1"><div class="w-3 h-3 bg-accent-pink/20 border border-ink/30"></div> <span>Holiday</span></div> <div class="flex items-center gap-1"><div class="w-2 h-2 bg-accent-yellow rounded-full"></div> <span>Jumu'ah</span></div></div> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (upcomingHolidays().length > 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="card-brutal-sm"><p class="text-[10px] font-black uppercase tracking-wider text-ink/40 mb-3 border-b-2 border-ink/10 pb-2">Upcoming Holidays &amp; Observances</p> <div class="flex flex-col gap-2"><!--[-->`);
      const each_array_2 = ensure_array_like(upcomingHolidays());
      for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
        let hol = each_array_2[$$index_2];
        $$renderer2.push(`<div${attr_class(`flex items-center gap-3 p-2 border-2 transition-colors duration-75 ${isTodayDate(hol.date) ? "border-ink bg-accent-yellow/10" : ""} ${isPast(hol.date) ? "border-ink/10 opacity-50" : "border-ink/20 hover:border-ink/40"}`)}><div class="w-12 text-center shrink-0"><p class="font-black text-sm tabular-nums">${escape_html(hol.date.getDate())}</p> <p class="text-[9px] font-bold text-ink/40 uppercase">${escape_html(hol.date.toLocaleDateString("en-MY", { month: "short" }))}</p></div> <div${attr_class(`w-1 self-stretch shrink-0 ${hol.event.type === "national" ? "bg-accent-blue" : ""} ${hol.event.type === "islamic" ? "bg-accent-pink" : ""} ${hol.event.type === "observance" ? "bg-accent-yellow" : ""}`)}></div> <div class="flex-1 min-w-0"><p class="font-bold text-xs sm:text-sm truncate">${escape_html(hol.event.name)}</p> `);
        if (hol.event.nameMs && hol.event.nameMs !== hol.event.name) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<p class="text-[10px] text-ink/50 font-bold truncate">${escape_html(hol.event.nameMs)}</p>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--> <div class="flex items-center gap-2 mt-0.5"><span${attr_class(`text-[9px] font-bold uppercase tracking-wider ${hol.event.type === "national" ? "text-accent-blue" : ""} ${hol.event.type === "islamic" ? "text-accent-pink" : ""} ${hol.event.type === "observance" ? "text-ink/40" : ""}`)}>${escape_html(hol.event.type)}</span> <span class="text-[9px] font-bold text-ink/30">${escape_html(formatHolidayDate(hol.date))}</span> `);
        if (isPast(hol.date)) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<span class="text-[8px] font-bold text-ink/30 uppercase">passed</span>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--> `);
        if (isTodayDate(hol.date)) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<span class="text-[8px] font-black text-accent-green uppercase">today!</span>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--></div></div></div>`);
      }
      $$renderer2.push(`<!--]--></div></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Calendar — Ruang" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-3xl mx-auto px-4 py-8"> <!-- Header --> <div class="mb-8"> <h1 class="text-3xl font-black uppercase tracking-wider">Calendar</h1> <p class="text-sm font-bold text-ink/60 mt-1">Gregorian + Hijri calendar with Malaysian holidays</p> </div> <!-- Interactive Calendar --> ${renderComponent($$result2, "CalendarGrid", CalendarGrid, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/components/hijri/CalendarGrid.svelte", "client:component-export": "default" }, { "default": ($$result3) => renderTemplate` <div class="text-center py-12 animate-pulse"> <p class="font-black text-ink/40 uppercase tracking-wider">Loading calendar...</p> </div> ` })} </div> ` })}`;
}, "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/pages/hijri/index.astro", void 0);
const $$file = "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/pages/hijri/index.astro";
const $$url = "/hijri";
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
