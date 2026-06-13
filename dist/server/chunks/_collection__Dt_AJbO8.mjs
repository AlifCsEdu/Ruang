globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_CJsCsXD8.mjs";
import { y as attr, z as attr_class, C as escape_html, B as ensure_array_like, G as derived, D as renderComponent, h as renderTemplate, m as maybeRenderHead } from "./worker-entry_C-jIstQk.mjs";
import { $ as $$BaseLayout } from "./BaseLayout_UTZfyRfD.mjs";
function HadithList($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { collection } = $$props;
    let hadiths = [];
    let search = "";
    let filteredHadiths = derived(() => search.trim() ? hadiths.filter((h) => h.english.toLowerCase().includes(search.toLowerCase()) || h.arabic.includes(search) || h.narrator?.toLowerCase().includes(search.toLowerCase())) : hadiths);
    let displayHadiths = derived(() => filteredHadiths());
    $$renderer2.push(`<div class="flex flex-col gap-4"><div class="flex items-center gap-2"><input type="text"${attr("value", search)} placeholder="Cari hadith..." class="input-brutal flex-1 text-sm !shadow-none !border-2"/> <button${attr_class(`btn-brutal-sm text-xs shrink-0 ${""}`)}>${escape_html("📄")}</button></div> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (hadiths.length === 0) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="text-center py-12"><div class="font-black text-ink/40 uppercase tracking-wider animate-pulse">Memuatkan hadith...</div></div>`);
    } else if (displayHadiths().length === 0) {
      $$renderer2.push("<!--[2-->");
      $$renderer2.push(`<div class="text-center py-12"><p class="font-black text-ink/40 uppercase tracking-wider">Tiada hadith dijumpai</p></div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
      $$renderer2.push(`<div class="flex flex-col gap-4"><!--[-->`);
      const each_array = ensure_array_like(displayHadiths());
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let hadith = each_array[$$index];
        $$renderer2.push(`<div class="card-brutal"><div class="flex items-center gap-2 mb-3 border-b-2 border-ink/10 pb-2"><span class="badge-brutal bg-accent-yellow text-xs">#${escape_html(hadith.number)}</span> `);
        if (hadith.reference) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<span class="text-xs text-ink/40 font-bold">${escape_html(hadith.reference)}</span>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--> `);
        if (hadith.grade) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<span class="ml-auto badge-brutal bg-accent-green/20 text-[10px]">${escape_html(hadith.grade)}</span>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--></div> <p class="arabic-text mb-4" dir="rtl" lang="ar">${escape_html(hadith.arabic)}</p> <p class="text-sm text-ink/80 leading-relaxed mb-3">${escape_html(hadith.english)}</p> `);
        if (hadith.narrator) {
          $$renderer2.push("<!--[0-->");
          $$renderer2.push(`<p class="text-xs text-ink/50 font-bold">Diriwayatkan: ${escape_html(hadith.narrator)}</p>`);
        } else {
          $$renderer2.push("<!--[-1-->");
        }
        $$renderer2.push(`<!--]--></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
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
const $$collection = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$collection;
  const { collection } = Astro2.params;
  const COLLECTION_NAMES = {
    bukhari: "Sahih al-Bukhari",
    muslim: "Sahih Muslim",
    abudawud: "Sunan Abu Dawud",
    tirmidhi: "Jami' at-Tirmidhi",
    nasai: "Sunan an-Nasa'i",
    ibnmajah: "Sunan Ibn Majah",
    malik: "Muwatta Malik"
  };
  const title = COLLECTION_NAMES[collection ?? ""] ?? "Hadith";
  const isValid = collection && collection in COLLECTION_NAMES;
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": `${title} — Hadith` }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-3xl mx-auto px-4 py-8 pb-20"> <!-- Navigation --> <div class="flex items-center justify-between mb-6"> <a href="/hadith" class="btn-brutal-sm text-sm">← Koleksi</a> </div> <!-- Header --> <div class="card-brutal mb-8"> <h1 class="text-2xl font-black uppercase tracking-wider">${title}</h1> <p class="text-sm font-bold text-ink/60 mt-2"> ${isValid ? "Browse hadiths with search, pagination, and infinite scroll." : "Collection not found."} </p> </div> ${isValid ? renderTemplate`${renderComponent($$result2, "HadithList", HadithList, { "client:load": true, "collection": collection, "client:component-hydration": "load", "client:component-path": "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/components/hadith/HadithList.svelte", "client:component-export": "default" }, { "default": ($$result3) => renderTemplate` <div class="text-center py-12 animate-pulse"> <p class="font-black text-ink/40 uppercase tracking-wider">Loading hadiths...</p> </div> ` })}` : renderTemplate`<div class="card-brutal text-center py-8"> <p class="font-black text-ink/40 uppercase tracking-wider">
Koleksi tidak dijumpai
</p> <a href="/hadith" class="btn-brutal-sm mt-4 inline-block">← Kembali</a> </div>`} </div> ` })}`;
}, "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/pages/hadith/[collection].astro", void 0);
const $$file = "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/pages/hadith/[collection].astro";
const $$url = "/hadith/[collection]";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$collection,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
