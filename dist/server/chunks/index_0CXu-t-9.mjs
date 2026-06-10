globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_D7kXc7QO.mjs";
import { y as attr, z as attr_class, C as escape_html, B as ensure_array_like, H as derived, D as renderComponent, h as renderTemplate, m as maybeRenderHead, g as addAttribute, G as renderTransition } from "./worker-entry_BueQH5e0.mjs";
import { $ as $$BaseLayout } from "./viewtransitions_4cCgKLLa.mjs";
import { S as SURAHS } from "./surahs_C-icQo2j.mjs";
function QuranBrowser($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let search = "";
    let bookmarks = [];
    const filtered = derived(() => SURAHS.filter((s) => {
      return true;
    }));
    $$renderer2.push(`<div class="flex flex-col gap-6"><div class="flex flex-col sm:flex-row gap-3"><div class="flex-1"><input type="text"${attr("value", search)} placeholder="Search surahs..." class="input-brutal w-full text-sm"/></div> <div class="flex border-4 border-ink shrink-0"><button${attr_class(`px-3 py-2 text-xs font-black uppercase tracking-wider transition-colors duration-75 ${"bg-ink text-white"}`)}>All</button> <button${attr_class(`px-3 py-2 text-xs font-black uppercase tracking-wider border-l-4 border-ink transition-colors duration-75 ${"bg-white text-ink hover:bg-canvas"}`)}>Makkah</button> <button${attr_class(`px-3 py-2 text-xs font-black uppercase tracking-wider border-l-4 border-ink transition-colors duration-75 ${"bg-white text-ink hover:bg-canvas"}`)}>Madinah</button></div></div> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div class="flex items-center gap-3"><button${attr_class(`btn-brutal-sm text-[10px] ${""}`)}>${escape_html("Browse by Juz")}</button> `);
    if (bookmarks.length > 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<span class="text-[10px] font-bold text-ink/40">${escape_html(bookmarks.length)} bookmark${escape_html(bookmarks.length !== 1 ? "s" : "")}</span>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">`);
    const each_array_1 = ensure_array_like(filtered());
    if (each_array_1.length !== 0) {
      $$renderer2.push("<!--[-->");
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let surah = each_array_1[$$index_1];
        $$renderer2.push(`<a${attr("href", `/quran/${surah.number}`)} class="card-brutal-sm flex items-center gap-3 hover:bg-accent-yellow/20 transition-colors duration-75 group active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"><div class="w-10 h-10 bg-ink text-white flex items-center justify-center font-black text-sm shrink-0">${escape_html(surah.number)}</div> <div class="flex-1 min-w-0"><div class="flex items-center justify-between gap-2"><span class="font-black text-sm truncate">${escape_html(surah.englishName)}</span> <span class="arabic-text text-lg leading-none shrink-0" dir="rtl" style="line-height: 1.5;">${escape_html(surah.name)}</span></div> <div class="flex items-center gap-2 mt-0.5"><span class="text-xs text-ink/50 font-bold">${escape_html(surah.englishMeaning)}</span> <span class="text-xs text-ink/30">·</span> <span class="text-xs text-ink/50 font-bold">${escape_html(surah.versesCount)} ayat</span> <span class="text-xs text-ink/30">·</span> <span${attr_class(`text-xs font-bold px-1.5 py-0 border border-ink/30 ${surah.revelationType === "Meccan" ? "bg-accent-yellow/30" : "bg-accent-blue/10"}`)}>${escape_html(surah.revelationType === "Meccan" ? "Makkah" : "Madinah")}</span></div></div></a>`);
      }
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="col-span-full text-center py-8"><p class="font-bold text-ink/40 text-sm">No surahs found for "${escape_html(search)}"</p></div>`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
  });
}
const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Al-Quran — Ruang" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-4xl mx-auto px-4 py-8"${addAttribute(renderTransition($$result2, "jxc5seng", "", "page-quran"), "data-astro-transition-scope")}> <!-- Header --> <div class="mb-8"> <h1 class="text-3xl font-black uppercase tracking-wider">Al-Quran</h1> <p class="text-sm font-bold text-ink/60 mt-1">114 Surahs — The Noble Quran</p> </div> <!-- Bismillah --> <div class="card-brutal text-center mb-8 bg-accent-green/10"> <p class="arabic-text text-2xl" dir="rtl">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</p> <p class="text-sm text-ink/60 mt-2">In the name of Allah, the Most Gracious, the Most Merciful</p> </div> <!-- Interactive Browser (search, filter, last-read, juz) --> ${renderComponent($$result2, "QuranBrowser", QuranBrowser, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/components/quran/QuranBrowser.svelte", "client:component-export": "default" }, { "default": ($$result3) => renderTemplate` <div class="text-center py-12 animate-pulse"> <p class="font-black text-ink/40 uppercase tracking-wider">Loading surahs...</p> </div> ` })} </div> ` })}`;
}, "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/pages/quran/index.astro", "self");
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
