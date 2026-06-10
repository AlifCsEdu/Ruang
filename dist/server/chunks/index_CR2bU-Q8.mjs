globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_D7kXc7QO.mjs";
import { D as renderComponent, h as renderTemplate, m as maybeRenderHead, g as addAttribute, G as renderTransition, u as unescapeHTML } from "./worker-entry_BueQH5e0.mjs";
import { N as NAV_LINKS, $ as $$BaseLayout } from "./viewtransitions_4cCgKLLa.mjs";
import { o as onDestroy } from "./index-server_CjumFrIu.mjs";
import { g as gregorianToHijri, H as HIJRI_MONTHS, a as HIJRI_MONTHS_AR } from "./hijri_Cwf40bc_.mjs";
function DashboardPrayerCard($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    onDestroy(() => {
    });
    $$renderer2.push(`<div class="flex flex-col gap-3">`);
    {
      $$renderer2.push("<!--[1-->");
      $$renderer2.push(`<div class="text-center py-6"><div class="font-black text-ink/40 uppercase tracking-wider animate-pulse text-sm">Loading...</div></div>`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
const $$Index = createComponent(($$result, $$props, $$slots) => {
  const today = /* @__PURE__ */ new Date();
  const hijriToday = gregorianToHijri(today.getFullYear(), today.getMonth() + 1, today.getDate());
  const hijriDateStr = `${hijriToday.day} ${HIJRI_MONTHS[hijriToday.month - 1]} ${hijriToday.year} AH`;
  const hijriDateAr = `${hijriToday.day} ${HIJRI_MONTHS_AR[hijriToday.month - 1]} ${hijriToday.year}`;
  const features = NAV_LINKS.filter((l) => l.href !== "/").map((link) => ({
    ...link,
    descriptions: {
      "/solat": "JAKIM prayer times with live countdown",
      "/quran": "Read the Noble Quran with translations",
      "/duas": "Daily supplications from Hisnul Muslim",
      "/hadith": "Prophetic traditions & teachings",
      "/tasbih": "Digital counter with haptic feedback",
      "/tracker": "Track your daily prayer streaks",
      "/hijri": "Islamic calendar with key dates"
    }
  }));
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Ruang — Your Muslim Companion" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-4xl mx-auto px-4 py-8"${addAttribute(renderTransition($$result2, "wwdvwa7n", "", "page-home"), "data-astro-transition-scope")}> <!-- Hero --> <div class="mb-8"> <h1 class="text-4xl md:text-5xl font-black uppercase tracking-wider">
Assalamualaikum
</h1> <p class="text-lg font-bold text-ink/60 mt-2" dir="rtl" lang="ar">${hijriDateAr}</p> <p class="text-sm font-bold text-ink/40 mt-0.5">${hijriDateStr}</p> </div> <!-- Next Prayer Card (Svelte island) --> <section class="mb-8"> <div class="card-brutal"${addAttribute(renderTransition($$result2, "np4g3e25", "", "page-solat"), "data-astro-transition-scope")}> ${renderComponent($$result2, "DashboardPrayerCard", DashboardPrayerCard, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/components/solat/DashboardPrayerCard.svelte", "client:component-export": "default" })} </div> </section> <!-- Feature Cards Grid --> <section> <h2 class="text-xl font-black uppercase tracking-wider mb-4">Features</h2> <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"> ${features.map((f) => renderTemplate`<a${addAttribute(f.href, "href")}${addAttribute([
    "card-brutal-sm group flex flex-col gap-3 transition-all duration-75",
    "hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_#0D0D0D]",
    "focus:outline-none focus:ring-4 focus:ring-accent-blue",
    f.color
  ], "class:list")}${addAttribute(renderTransition($$result2, "eahnefy6", "", `page-${f.href.replace("/", "")}`), "data-astro-transition-scope")}> <div class="flex items-center gap-3"> <span class="text-ink shrink-0">${unescapeHTML(f.icon(24))}</span> <span class="font-black text-base uppercase tracking-wider">${f.label}</span> </div> <p class="text-sm font-bold text-ink/60">${f.descriptions[f.href]}</p> </a>`)} </div> </section> </div> ` })}`;
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
