globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_BecWgU-U.mjs";
import { v as renderComponent, h as renderTemplate, m as maybeRenderHead, g as addAttribute } from "./worker-entry_DPx-0duo.mjs";
import { $ as $$BaseLayout, r as renderScript } from "./BaseLayout_D1fa7tmu.mjs";
import { S as SURAHS } from "./surahs_C-icQo2j.mjs";
const $$surah = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$surah;
  const { surah: surahNum } = Astro2.params;
  const num = Number(surahNum);
  if (!num || num < 1 || num > 114) {
    return Astro2.redirect("/quran");
  }
  const surah = SURAHS.find((s) => s.number === num);
  if (!surah) {
    return Astro2.redirect("/quran");
  }
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": `${surah.englishName} — Al-Quran` }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-4xl mx-auto px-4 py-8 pb-32"> <!-- Navigation --> <div class="flex items-center justify-between mb-4 gap-2 flex-wrap"> <a href="/quran" class="btn-brutal-sm text-sm shrink-0">← Semua Surah</a> <!-- Quick-jump dropdown --> <label class="relative inline-flex items-center gap-1.5"> <span class="text-xs font-black uppercase tracking-wider text-ink/50 hidden sm:inline">Surah:</span> <select class="btn-brutal-sm text-sm bg-white border-ink cursor-pointer w-40 sm:w-48" aria-label="Jump to surah" data-surah-select> ${SURAHS.map((s) => renderTemplate`<option${addAttribute(s.number, "value")}${addAttribute(s.number === num, "selected")}> ${s.number}. ${s.englishName} </option>`)} </select> </label> ${renderScript($$result2, "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/pages/quran/[surah].astro?astro&type=script&index=0&lang.ts")} <div class="flex items-center gap-2 shrink-0"> ${num > 1 && renderTemplate`<a${addAttribute(`/quran/${num - 1}`, "href")} class="btn-brutal-sm text-sm" title="Surah sebelumnya">← ${SURAHS[num - 2]?.englishName ?? "Prev"}</a>`} ${num < 114 && renderTemplate`<a${addAttribute(`/quran/${num + 1}`, "href")} class="btn-brutal-sm text-sm" title="Surah seterusnya">${SURAHS[num]?.englishName ?? "Next"} →</a>`} </div> </div> <!-- Surah Hero Header --> <div class="card-hero mb-6 text-center relative overflow-hidden"> <!-- Revelation type badge --> <div class="absolute top-4 right-4"> <span class="chip-brutal {surah.revelationType === 'Meccan' ? 'bg-accent-yellow' : 'bg-accent-blue text-white'}"> ${surah.revelationType === "Meccan" ? "🕋 Makkah" : "🕌 Madinah"} </span> </div> <div class="flex flex-col items-center gap-3"> <!-- Surah number (ornamental circular badge) --> <div class="relative flex items-center justify-center" style="width: 4rem; height: 4rem;"> <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style="position: absolute; inset: 0;"> <circle cx="32" cy="32" r="30" stroke="currentColor" stroke-width="2.5" fill="var(--color-ink, #0D0D0D)"></circle> <circle cx="32" cy="32" r="24" stroke="var(--color-accent-yellow, #FFD500)" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.6" fill="none"></circle> <circle cx="32" cy="4" r="2" fill="var(--color-accent-yellow, #FFD500)" opacity="0.7"></circle> <circle cx="32" cy="60" r="2" fill="var(--color-accent-yellow, #FFD500)" opacity="0.7"></circle> <circle cx="4" cy="32" r="2" fill="var(--color-accent-yellow, #FFD500)" opacity="0.7"></circle> <circle cx="60" cy="32" r="2" fill="var(--color-accent-yellow, #FFD500)" opacity="0.7"></circle> </svg> <span class="relative text-white font-black text-2xl">${num}</span> </div> <div> <h1 class="text-3xl font-black uppercase tracking-wider">${surah.englishName}</h1> <p class="text-sm text-ink/60 font-bold mt-1">${surah.englishMeaning} · ${surah.versesCount} ayat</p> </div> <!-- Arabic name --> <p class="arabic-text text-3xl" dir="rtl" style="line-height: 1.8;">${surah.name}</p> </div> <!-- Bismillah --> ${num !== 1 && num !== 9 && renderTemplate`<div class="mt-6"> <div class="flex items-center gap-3 mb-4"> <div class="flex-1 h-0.5 bg-accent-blue/30"></div> <div class="w-2 h-2 bg-accent-blue rotate-45"></div> <div class="flex-1 h-0.5 bg-accent-blue/30"></div> </div> <p class="arabic-text text-2xl" dir="rtl" style="line-height: 2.2;">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</p> <p class="text-xs text-ink/50 font-bold italic mt-2">In the name of Allah, the Most Gracious, the Most Merciful</p> </div>`} </div> <!-- Surah Reader (Svelte 5 island) --> ${renderComponent($$result2, "SurahReader", null, { "chapter": num, "client:only": "svelte", "client:component-hydration": "only", "client:component-path": "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/components/quran/SurahReader.svelte", "client:component-export": "default" }, { "default": ($$result3) => renderTemplate` <div class="text-center py-16 animate-pulse"> <p class="font-black text-ink/40 uppercase tracking-wider">Memuatkan ayat-ayat...</p> </div> ` })} </div> ` })}`;
}, "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/pages/quran/[surah].astro", void 0);
const $$file = "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/pages/quran/[surah].astro";
const $$url = "/quran/[surah]";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$surah,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
