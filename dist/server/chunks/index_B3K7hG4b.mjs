globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_D7kXc7QO.mjs";
import { D as renderComponent, h as renderTemplate, m as maybeRenderHead, g as addAttribute, G as renderTransition } from "./worker-entry_BueQH5e0.mjs";
import { $ as $$BaseLayout } from "./viewtransitions_4cCgKLLa.mjs";
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const res = await fetch("http://localhost:4321/api/hadith/collections").catch(() => null);
  let collections = [];
  if (res?.ok) {
    const data = await res.json();
    collections = data.collections ?? [];
  }
  if (collections.length === 0) {
    collections = [
      { name: "bukhari", title: "Sahih al-Bukhari", arabicTitle: "صحيح البخاري", hadithCount: 7563, description: "The most authentic collection of hadith compiled by Imam Bukhari" },
      { name: "muslim", title: "Sahih Muslim", arabicTitle: "صحيح مسلم", hadithCount: 7500, description: "Second most authentic collection compiled by Imam Muslim" },
      { name: "abudawud", title: "Sunan Abu Dawud", arabicTitle: "سنن أبي داود", hadithCount: 5274, description: "One of the six major collections compiled by Abu Dawud" },
      { name: "tirmidhi", title: "Jami' at-Tirmidhi", arabicTitle: "جامع الترمذي", hadithCount: 3956, description: "One of the six major collections compiled by Imam Tirmidhi" },
      { name: "nasai", title: "Sunan an-Nasa'i", arabicTitle: "سنن النسائي", hadithCount: 5758, description: "One of the six major collections compiled by Imam Nasa'i" },
      { name: "ibnmajah", title: "Sunan Ibn Majah", arabicTitle: "سنن ابن ماجه", hadithCount: 4341, description: "One of the six major collections compiled by Ibn Majah" },
      { name: "malik", title: "Muwatta Malik", arabicTitle: "موطأ مالك", hadithCount: 1594, description: "The earliest collection compiled by Imam Malik" }
    ];
  }
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Hadith — Ruang" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-3xl mx-auto px-4 py-8"${addAttribute(renderTransition($$result2, "wv4gzmvl", "", "page-hadith"), "data-astro-transition-scope")}> <!-- Header --> <div class="mb-8"> <h1 class="text-3xl font-black uppercase tracking-wider">Hadith Collections</h1> <p class="text-sm font-bold text-ink/60 mt-1">The six major collections of prophetic traditions</p> </div> <!-- Collections Grid --> <div class="grid grid-cols-1 sm:grid-cols-2 gap-4"> ${collections.map((col) => renderTemplate`<a${addAttribute(`/hadith/${col.name}`, "href")} class="card-brutal hover:bg-accent-yellow/20 transition-colors duration-75 group
                 active:translate-x-1 active:translate-y-1 active:shadow-none"> <div class="flex items-start justify-between gap-3 mb-3"> <h2 class="font-black text-sm uppercase tracking-wider group-hover:underline"> ${col.title} </h2> <span class="arabic-text text-lg leading-none shrink-0" dir="rtl" style="line-height: 1.5;"> ${col.arabicTitle} </span> </div> <p class="text-sm text-ink/60 mb-4">${col.description}</p> <div class="flex items-center justify-between"> <span class="badge-brutal bg-accent-green/20 text-xs"> ${col.hadithCount.toLocaleString()} hadith
</span> <span class="text-xs font-bold text-ink/40 group-hover:text-ink transition-colors">
Browse →
</span> </div> </a>`)} </div> </div> ` })}`;
}, "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/pages/hadith/index.astro", "self");
const $$file = "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/pages/hadith/index.astro";
const $$url = "/hadith";
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
