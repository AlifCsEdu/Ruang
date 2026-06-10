globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_D7kXc7QO.mjs";
import { y as attr, C as escape_html, H as derived, z as attr_class, K as attr_style, O as stringify, B as ensure_array_like, D as renderComponent, h as renderTemplate, m as maybeRenderHead, g as addAttribute, G as renderTransition } from "./worker-entry_BueQH5e0.mjs";
import { $ as $$BaseLayout } from "./viewtransitions_4cCgKLLa.mjs";
import { o as onDestroy } from "./index-server_CjumFrIu.mjs";
function ZoneSelector($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { currentZone } = $$props;
    let zones = [];
    let isOpen = false;
    let selectedLabel = derived(() => zones.find((z) => z.id === currentZone)?.name ?? currentZone);
    $$renderer2.push(`<div class="relative" data-zone-selector=""><button class="btn-brutal-sm flex items-center gap-2 w-full text-left"${attr("aria-expanded", isOpen)} aria-haspopup="listbox"><span class="truncate flex-1">${escape_html(selectedLabel())}</span> <span class="shrink-0 text-xs font-mono bg-accent-yellow px-1.5 py-0.5 border border-ink">${escape_html(currentZone)}</span> <span class="shrink-0">${escape_html("▼")}</span></button> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
function SolatWindow($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let zone = "SGR01";
    let { showZoneSelector = true } = $$props;
    onDestroy(() => {
    });
    $$renderer2.push(`<div class="flex flex-col gap-4">`);
    if (showZoneSelector) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div><label class="text-xs font-black uppercase tracking-wider text-ink/60 block mb-1">Zon</label> `);
      ZoneSelector($$renderer2, { currentZone: zone });
      $$renderer2.push(`<!----></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="flex items-center justify-center py-8"><div class="font-black text-ink/40 uppercase tracking-wider animate-pulse">Loading prayer times...</div></div>`);
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
function SunnahTimesPanel($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    $$renderer2.push(`<div class="flex flex-col gap-2"><div class="flex items-center justify-between mb-1"><h3 class="font-black text-sm uppercase tracking-wider">Waktu Sunnah</h3> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> `);
    {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<p class="text-xs text-ink/40 font-bold text-center py-4">Memuatkan waktu sunnah...</p>`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
function SolatSettingsPanel($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    $$renderer2.push(`<div class="flex flex-col gap-2"><h3 class="font-black text-sm uppercase tracking-wider mb-1">Tetapan Lanjutan</h3> `);
    {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<p class="text-xs text-ink/40 font-bold text-center py-4">Memuatkan tetapan...</p>`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
function PrayerTrackerWidget($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const PRAYERS = [
      { key: "fajr", label: "Subuh", color: "bg-accent-blue" },
      { key: "dhuhr", label: "Zohor", color: "bg-accent-yellow" },
      { key: "asr", label: "Asar", color: "bg-accent-pink" },
      { key: "maghrib", label: "Maghrib", color: "bg-accent-green" },
      { key: "isha", label: "Isyak", color: "bg-accent-blue/70" }
    ];
    let trackerData = {};
    let todayKey = derived(() => {
      const now = new Date((/* @__PURE__ */ new Date()).toLocaleString("en-US", { timeZone: "Asia/Kuala_Lumpur" }));
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    });
    let todayRecord = derived(() => trackerData[todayKey()] ?? {
      fajr: false,
      dhuhr: false,
      asr: false,
      maghrib: false,
      isha: false
    });
    let completedCount = derived(() => PRAYERS.filter((p) => todayRecord()[p.key]).length);
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
    $$renderer2.push(`<div class="flex flex-col gap-2"><div class="flex items-center justify-between mb-1"><h3 class="font-black text-sm uppercase tracking-wider">Tracker Hari Ini</h3> <div class="flex items-center gap-2"><span class="text-xs font-bold text-ink/60">${escape_html(completedCount())}/5</span> `);
    if (streak() > 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<span class="badge-brutal bg-accent-green text-white text-[10px]">${escape_html(streak())}🔥</span>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div></div> <div class="h-3 border-2 border-ink bg-white overflow-hidden"><div${attr_class(`h-full transition-all duration-200 ${completedCount() === 5 ? "bg-accent-green" : "bg-accent-blue"}`)}${attr_style(`width: ${stringify(completedCount() / 5 * 100)}%`)}></div></div> <div class="flex flex-col gap-1"><!--[-->`);
    const each_array = ensure_array_like(PRAYERS);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let prayer = each_array[$$index];
      $$renderer2.push(`<button${attr_class(`flex items-center gap-3 px-3 py-2.5 border-2 border-ink cursor-pointer transition-all duration-75 ${todayRecord()[prayer.key] ? "bg-accent-green/20" : "bg-white hover:bg-canvas"}`)}><div${attr_class(`w-6 h-6 border-2 border-ink shrink-0 flex items-center justify-center transition-all duration-75 ${todayRecord()[prayer.key] ? "bg-accent-green" : "bg-white"}`)}>`);
      if (todayRecord()[prayer.key]) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<span class="text-white font-black text-sm">✓</span>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]--></div> <span class="font-bold text-sm">${escape_html(prayer.label)}</span> <div${attr_class(`ml-auto w-3 h-3 ${stringify(prayer.color)} border border-ink shrink-0`)}></div></button>`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
  });
}
const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Waktu Solat — Ruang" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-6xl mx-auto px-4 py-8"${addAttribute(renderTransition($$result2, "f7q6u7up", "", "page-solat"), "data-astro-transition-scope")}> <h1 class="text-3xl font-black uppercase tracking-wider mb-6">Waktu Solat</h1> <!-- Mobile: single column stack --> <div class="lg:grid lg:grid-cols-[1fr_340px] lg:gap-6"> <!-- Main panel --> <div class="flex flex-col gap-6"> <div class="card-brutal"> ${renderComponent($$result2, "SolatWindow", SolatWindow, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/components/solat/SolatWindow.svelte", "client:component-export": "default" })} </div> <!-- Sunnah panel (below on mobile, side on desktop) --> <div class="card-brutal-sm lg:hidden"> ${renderComponent($$result2, "SunnahTimesPanel", SunnahTimesPanel, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/components/solat/SunnahTimesPanel.svelte", "client:component-export": "default" })} </div> </div> <!-- Side panel (desktop) --> <aside class="hidden lg:flex lg:flex-col lg:gap-4"> <div class="card-brutal-sm"> ${renderComponent($$result2, "SunnahTimesPanel", SunnahTimesPanel, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/components/solat/SunnahTimesPanel.svelte", "client:component-export": "default" })} </div> <div class="card-brutal-sm"> ${renderComponent($$result2, "PrayerTrackerWidget", PrayerTrackerWidget, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/components/solat/PrayerTrackerWidget.svelte", "client:component-export": "default" })} </div> <div class="card-brutal-sm"> ${renderComponent($$result2, "SolatSettingsPanel", SolatSettingsPanel, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/components/solat/SolatSettingsPanel.svelte", "client:component-export": "default" })} </div> </aside> <!-- Mobile-only: tracker + settings below main --> <div class="flex flex-col gap-4 lg:hidden mt-6"> <div class="card-brutal-sm"> ${renderComponent($$result2, "PrayerTrackerWidget", PrayerTrackerWidget, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/components/solat/PrayerTrackerWidget.svelte", "client:component-export": "default" })} </div> <div class="card-brutal-sm"> ${renderComponent($$result2, "SolatSettingsPanel", SolatSettingsPanel, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/components/solat/SolatSettingsPanel.svelte", "client:component-export": "default" })} </div> </div> </div> </div> ` })}`;
}, "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/pages/solat/index.astro", "self");
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
