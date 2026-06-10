globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_D7kXc7QO.mjs";
import { z as attr_class, y as attr, C as escape_html, B as ensure_array_like, D as renderComponent, h as renderTemplate, m as maybeRenderHead, g as addAttribute, J as createTransitionScope, G as renderTransition } from "./worker-entry_BueQH5e0.mjs";
import { $ as $$BaseLayout } from "./viewtransitions_4cCgKLLa.mjs";
import { S as SURAHS } from "./surahs_C-icQo2j.mjs";
import { o as onDestroy } from "./index-server_CjumFrIu.mjs";
import { h as html } from "./html_BMy9tuiB.mjs";
function QuranSettings($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    $$renderer2.push(`<div class="relative"><button${attr_class(`btn-brutal-sm text-[10px] flex items-center gap-1.5 ${""}`)}><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg> Settings</button> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
function VerseBookmark($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    $$renderer2.push(`<button${attr_class(`w-7 h-7 flex items-center justify-center transition-all duration-75 shrink-0 ${"text-ink/30 hover:text-accent-pink/60"}`)}${attr("aria-label", "Add bookmark")}${attr("title", "Bookmark this verse")}><svg width="16" height="16" viewBox="0 0 24 24"${attr("fill", "none")} stroke="currentColor" stroke-width="2.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg></button>`);
  });
}
function SurahReader($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { chapter } = $$props;
    const surahInfo = SURAHS.find((s) => s.number === chapter);
    let verses = [];
    let loading = true;
    let error = null;
    let audioState = { playing: false };
    let currentPage = 1;
    let totalPages = 1;
    let isShortSurah = true;
    let reciter = 7;
    let translation = 131;
    onDestroy(() => {
      window.removeEventListener("quran-settings-changed", handleSettingsChange);
    });
    function handleSettingsChange(e) {
      const { reciter: newReciter, translation: newTranslation } = e.detail;
      const changed = newReciter !== reciter || newTranslation !== translation;
      reciter = newReciter;
      translation = newTranslation;
      if (changed) {
        currentPage = 1;
        fetchVerses();
      }
    }
    async function fetchVerses() {
      loading = true;
      error = null;
      try {
        const params = new URLSearchParams({
          reciter: String(reciter),
          translation: String(translation),
          page: String(currentPage),
          perPage: "50"
        });
        const res = await fetch(`/api/quran/${chapter}?${params}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        verses = data.verses ?? [];
        if (data.pagination) {
          totalPages = data.pagination.totalPages ?? 1;
          isShortSurah = data.pagination.isShortSurah ?? true;
        }
      } catch {
        error = "Failed to load verses. Check your connection.";
      } finally {
        loading = false;
      }
    }
    function isPlaying(verseNum) {
      return audioState.playing;
    }
    function getPageNumbers() {
      const pages = [];
      if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        if (currentPage > 3) pages.push("...");
        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
          pages.push(i);
        }
        if (currentPage < totalPages - 2) pages.push("...");
        pages.push(totalPages);
      }
      return pages;
    }
    const playIcon = '<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><polygon points="3,1 14,8 3,15"/></svg>';
    $$renderer2.push(`<div class="flex flex-col gap-4"><audio preload="none"></audio> <div class="flex flex-wrap items-center gap-2 sticky top-14 bg-canvas/95 py-2 z-10 border-b-2 border-ink"><div class="flex border-2 border-ink"><button${attr_class(`px-3 py-1 text-xs font-black uppercase tracking-wider transition-colors duration-75 ${"bg-ink text-white"}`)}>Standard</button> <button${attr_class(`px-3 py-1 text-xs font-black uppercase tracking-wider border-l-2 border-ink transition-colors duration-75 ${"bg-white text-ink hover:bg-canvas"}`)}>Word-by-Word</button></div> <button${attr_class(`btn-brutal-sm text-[10px] ${"bg-accent-blue text-white border-ink"}`)}>${escape_html("✓ Translation")}</button> <button${attr_class(`btn-brutal-sm text-[10px] ${""}`)}>${escape_html("Transliteration")}</button> `);
    QuranSettings($$renderer2);
    $$renderer2.push(`<!----> <span class="text-xs font-black uppercase tracking-wider text-ink/40 ml-auto">`);
    if (isShortSurah) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`${escape_html(verses.length)} verses`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`Page ${escape_html(currentPage)}/${escape_html(totalPages)}`);
    }
    $$renderer2.push(`<!--]--></span></div> `);
    if (loading) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="flex items-center justify-center py-16"><div class="card-brutal-sm text-center"><p class="font-black text-ink/40 uppercase tracking-wider animate-pulse">Loading verses...</p></div></div>`);
    } else if (error) {
      $$renderer2.push("<!--[1-->");
      $$renderer2.push(`<div class="card-brutal-sm bg-accent-pink text-white text-center"><p class="font-bold text-sm">${escape_html(error)}</p> <button class="btn-brutal-sm mt-2 bg-white text-ink text-xs">Retry</button></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div class="flex flex-col gap-4"><!--[-->`);
      const each_array = ensure_array_like(verses);
      for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
        let verse = each_array[$$index_1];
        isPlaying(verse.number);
        $$renderer2.push(`<div${attr_class(`card-brutal-sm ${""}`)}><div class="flex items-center gap-2 mb-3 border-b-2 border-ink/10 pb-2"><span class="w-8 h-8 bg-ink text-white flex items-center justify-center font-black text-xs shrink-0">${escape_html(verse.number)}</span> `);
        if (verse.audio?.url) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<button${attr_class(`w-8 h-8 border-2 border-ink flex items-center justify-center shrink-0 transition-all duration-75 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${"bg-white hover:bg-canvas"}`)}${attr("aria-label", "Play verse {verse.number}")}>${html(playIcon)}</button>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--> `);
        if (surahInfo) {
          $$renderer2.push("<!--[0-->");
          VerseBookmark($$renderer2, {
            ayah: verse.number,
            surahName: surahInfo.englishName
          });
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--> `);
        if (verse.verse_key) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<span class="text-xs font-bold text-ink/40 ml-auto">${escape_html(verse.verse_key)}</span>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--></div> `);
        {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<div class="arabic-text" dir="rtl" lang="ar">${escape_html(verse.text)} <span class="text-accent-blue font-bold text-sm mx-2" style="font-family: var(--font-ui);">﴿${escape_html(verse.number)}﴾</span></div> `);
          {
            $$renderer2.push("<!--[-1-->");
          }
          $$renderer2.push(`<!--]--> `);
          if (verse.translations?.length) {
            $$renderer2.push("<!--[0-->");
            $$renderer2.push(`<div class="mt-3 pt-3 border-t-2 border-ink/10"><p class="text-sm text-ink/70 leading-relaxed">${html(verse.translations[0].text)}</p></div>`);
          } else {
            $$renderer2.push("<!--[-1-->");
          }
          $$renderer2.push(`<!--]-->`);
        }
        $$renderer2.push(`<!--]--></div>`);
      }
      $$renderer2.push(`<!--]--></div> `);
      if (!isShortSurah && totalPages > 1) {
        $$renderer2.push("<!--[0-->");
        $$renderer2.push(`<div class="flex items-center justify-center gap-1.5 py-4"><button${attr("disabled", currentPage <= 1, true)} class="btn-brutal-sm text-xs disabled:opacity-30 disabled:cursor-not-allowed">Prev</button> <!--[-->`);
        const each_array_2 = ensure_array_like(getPageNumbers());
        for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
          let p = each_array_2[$$index_2];
          if (p === "...") {
            $$renderer2.push("<!--[0-->");
            $$renderer2.push(`<span class="px-2 text-xs font-bold text-ink/40">...</span>`);
          } else {
            $$renderer2.push("<!--[-1-->");
            $$renderer2.push(`<button${attr_class(`w-8 h-8 border-2 border-ink font-black text-xs transition-all duration-75 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none ${currentPage === p ? "bg-ink text-white shadow-[2px_2px_0px_0px_#0D0D0D]" : "bg-white hover:bg-canvas"}`)}>${escape_html(p)}</button>`);
          }
          $$renderer2.push(`<!--]-->`);
        }
        $$renderer2.push(`<!--]--> <button${attr("disabled", currentPage >= totalPages, true)} class="btn-brutal-sm text-xs disabled:opacity-30 disabled:cursor-not-allowed">Next</button></div>`);
      } else {
        $$renderer2.push("<!--[-1-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
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
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": `${surah.englishName} — Al-Quran` }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-3xl mx-auto px-4 py-8 pb-32"> <!-- Navigation --> <div class="flex items-center justify-between mb-6"> <a href="/quran" class="btn-brutal-sm text-sm">← All Surahs</a> <div class="flex items-center gap-2"> ${num > 1 && renderTemplate`<a${addAttribute(`/quran/${num - 1}`, "href")} class="btn-brutal-sm text-sm"${addAttribute(createTransitionScope($$result2, "y3ttokdp"), "data-astro-transition-persist")}>← Prev</a>`} ${num < 114 && renderTemplate`<a${addAttribute(`/quran/${num + 1}`, "href")} class="btn-brutal-sm text-sm"${addAttribute(createTransitionScope($$result2, "woayv5me"), "data-astro-transition-persist")}>Next →</a>`} </div> </div> <!-- Surah Header --> <div class="card-brutal mb-6 text-center"${addAttribute(renderTransition($$result2, "37wagy6a", "", `surah-${num}`), "data-astro-transition-scope")}> <div class="flex items-center justify-center gap-4 mb-2"> <span class="w-12 h-12 bg-ink text-white flex items-center justify-center font-black text-lg">${num}</span> <div> <h1 class="text-2xl font-black uppercase tracking-wider">${surah.englishName}</h1> <p class="text-sm text-ink/60 font-bold">${surah.englishMeaning} • ${surah.versesCount} ayat • ${surah.revelationType === "Meccan" ? "Makkah" : "Madinah"}</p> </div> </div> ${num !== 1 && num !== 9 && renderTemplate`<p class="arabic-text text-xl mt-4" dir="rtl">بِسْمِ ٱللَّهِ ٱلرَّحْمَـٰنِ ٱلرَّحِيمِ</p>`} </div> <!-- Surah Reader (Svelte 5 island) --> ${renderComponent($$result2, "SurahReader", SurahReader, { "chapter": num, "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/components/quran/SurahReader.svelte", "client:component-export": "default" }, { "default": ($$result3) => renderTemplate` <div class="text-center py-16 animate-pulse"> <p class="font-black text-ink/40 uppercase tracking-wider">Loading verses...</p> </div> ` })} </div> ` })}`;
}, "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/pages/quran/[surah].astro", "self");
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
