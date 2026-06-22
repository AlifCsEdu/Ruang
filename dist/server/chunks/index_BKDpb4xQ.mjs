globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_BecWgU-U.mjs";
import { v as renderComponent, h as renderTemplate, m as maybeRenderHead } from "./worker-entry_DPx-0duo.mjs";
import { $ as $$BaseLayout } from "./BaseLayout_D1fa7tmu.mjs";
const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Al-Quran — Ruang" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-5xl mx-auto px-4 py-8"> <!-- Header --> <div class="flex items-center justify-between mb-4"> <div> <h1 class="text-3xl font-black uppercase tracking-wider">Al-Quran</h1> <p class="text-sm font-bold text-ink/60 mt-1">114 Surah · 30 Juz · 6,236 Ayat</p> </div> <a href="/settings" class="btn-brutal-sm text-xs">⚙️ Tetapan</a> </div> <!-- Accent bar --> <div class="accent-bar mb-6"></div> <!-- Bismillah hero --> <div class="card-hero text-center mb-8 bg-accent-green/5 relative overflow-hidden"> <p class="arabic-text text-3xl" dir="rtl">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</p> <p class="text-sm text-ink/50 mt-3 font-bold">Dengan nama Allah, Yang Maha Pemurah, lagi Maha Mengasihani</p> </div> <!-- Interactive Browser (search, filter, last-read, juz) --> ${renderComponent($$result2, "QuranBrowser", null, { "client:only": "svelte", "client:component-hydration": "only", "client:component-path": "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/components/quran/QuranBrowser.svelte", "client:component-export": "default" }, { "default": ($$result3) => renderTemplate` <div class="text-center py-12 animate-pulse"> <p class="font-black text-ink/40 uppercase tracking-wider">Memuatkan senarai surah...</p> </div> ` })} </div> ` })}`;
}, "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/pages/quran/index.astro", void 0);
const $$file = "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/pages/quran/index.astro";
const $$url = "/quran";
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
