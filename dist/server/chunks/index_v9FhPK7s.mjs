globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_CJsCsXD8.mjs";
import { y as attr, z as attr_class, C as escape_html, K as clsx, B as ensure_array_like, G as derived, D as renderComponent, h as renderTemplate, m as maybeRenderHead } from "./worker-entry_C-jIstQk.mjs";
import { $ as $$BaseLayout } from "./BaseLayout_UTZfyRfD.mjs";
import { S as SURAHS } from "./surahs_C-icQo2j.mjs";
function QuranBrowser($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let search = "";
    let bookmarks = [];
    const filtered = derived(() => SURAHS.filter((s) => {
      return true;
    }));
    $$renderer2.push(`<div class="flex flex-col gap-6"><div class="flex flex-col sm:flex-row gap-3"><div class="flex-1"><input type="text"${attr("value", search)} placeholder="Cari surah... (nama, nombor, makna)" class="input-brutal w-full text-sm"/></div> <div class="flex border-4 border-ink shrink-0"><button${attr_class(`px-3 py-2 text-xs font-black uppercase tracking-wider transition-colors duration-75 ${"bg-ink text-white"}`)}>Semua</button> <button${attr_class(`px-3 py-2 text-xs font-black uppercase tracking-wider border-l-4 border-ink transition-colors duration-75 ${"bg-white text-ink hover:bg-canvas"}`)}>Makkah</button> <button${attr_class(`px-3 py-2 text-xs font-black uppercase tracking-wider border-l-4 border-ink transition-colors duration-75 ${"bg-white text-ink hover:bg-canvas"}`)}>Madinah</button></div></div> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div class="flex items-center gap-2 flex-wrap"><button${attr_class(`chip-brutal ${"bg-white"} transition-colors`)}>${escape_html("Juz 1-30")}</button> <button${attr_class(`chip-brutal ${"bg-white"} transition-colors`)}>${escape_html(`♥ ${bookmarks.length}`)}</button> <span class="ml-auto flex items-center gap-1"><button${attr_class(`w-8 h-8 border-2 border-ink flex items-center justify-center transition-colors ${"bg-ink text-white"}`)} title="Grid view"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="8" height="8"></rect><rect x="13" y="3" width="8" height="8"></rect><rect x="3" y="13" width="8" height="8"></rect><rect x="13" y="13" width="8" height="8"></rect></svg></button> <button${attr_class(`w-8 h-8 border-2 border-ink border-l-0 flex items-center justify-center transition-colors ${"bg-white hover:bg-canvas"}`)} title="List view"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="4" width="18" height="3"></rect><rect x="3" y="10.5" width="18" height="3"></rect><rect x="3" y="17" width="18" height="3"></rect></svg></button></span></div> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> <div${attr_class(clsx(
      "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
    ))}>`);
    const each_array_2 = ensure_array_like(filtered());
    if (each_array_2.length !== 0) {
      $$renderer2.push("<!--[-->");
      for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
        let surah = each_array_2[$$index_2];
        $$renderer2.push(`<a${attr("href", `/quran/${surah.number}`)}${attr_class(`flex items-center gap-3 hover:bg-accent-yellow/20 transition-all duration-75 group active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${`card-brutal-sm ${surah.revelationType === "Meccan" ? "surah-card-meccan" : "surah-card-medinan"}`}`)}><div${attr_class(`w-10 h-10 flex items-center justify-center font-black text-sm shrink-0 border-2 border-ink ${surah.revelationType === "Meccan" ? "bg-accent-yellow text-ink" : "bg-accent-blue text-white"}`)}>${escape_html(surah.number)}</div> <div class="flex-1 min-w-0"><div class="flex items-center justify-between gap-2"><span class="font-black text-sm truncate">${escape_html(surah.englishName)}</span> <span class="arabic-text text-lg leading-none shrink-0" dir="rtl" style="line-height: 1.5;">${escape_html(surah.name)}</span></div> <div class="flex items-center gap-2 mt-0.5"><span class="text-xs text-ink/50 font-bold">${escape_html(surah.englishMeaning)}</span> <span class="text-xs text-ink/30">·</span> <span class="text-xs text-ink/50 font-bold">${escape_html(surah.versesCount)} ayat</span></div></div></a>`);
      }
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div class="col-span-full text-center py-8"><p class="font-bold text-ink/40 text-sm">Tiada surah dijumpai untuk "${escape_html(search)}"</p></div>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="flex items-center justify-between text-[10px] font-bold text-ink/40 border-t-2 border-ink/20 pt-3"><span>${escape_html(filtered().length)} surah ditunjukkan</span> <span>114 surah keseluruhan</span></div></div>`);
  });
}
const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Al-Quran — Ruang" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-5xl mx-auto px-4 py-8"> <!-- Header --> <div class="flex items-center justify-between mb-4"> <div> <h1 class="text-3xl font-black uppercase tracking-wider">Al-Quran</h1> <p class="text-sm font-bold text-ink/60 mt-1">114 Surah · 30 Juz · 6,236 Ayat</p> </div> <a href="/settings" class="btn-brutal-sm text-xs">⚙️ Tetapan</a> </div> <!-- Accent bar --> <div class="accent-bar mb-6"></div> <!-- Bismillah hero --> <div class="card-hero text-center mb-8 bg-accent-green/5 relative overflow-hidden"> <p class="arabic-text text-3xl" dir="rtl">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</p> <p class="text-sm text-ink/50 mt-3 font-bold">Dengan nama Allah, Yang Maha Pemurah, lagi Maha Mengasihani</p> </div> <!-- Interactive Browser (search, filter, last-read, juz) --> ${renderComponent($$result2, "QuranBrowser", QuranBrowser, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/components/quran/QuranBrowser.svelte", "client:component-export": "default" }, { "default": ($$result3) => renderTemplate` <div class="text-center py-12 animate-pulse"> <p class="font-black text-ink/40 uppercase tracking-wider">Memuatkan senarai surah...</p> </div> ` })} </div> ` })}`;
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
