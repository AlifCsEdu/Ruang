globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_BecWgU-U.mjs";
import { q as ensure_array_like, o as attr_class, p as escape_html, n as attr, v as renderComponent, h as renderTemplate, m as maybeRenderHead } from "./worker-entry_DPx-0duo.mjs";
import { $ as $$BaseLayout } from "./BaseLayout_D1fa7tmu.mjs";
function SettingsPage($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let activeTab = "umum";
    let startupPage = "solat";
    let reducedMotion = false;
    let autoDetectLocation = false;
    const TABS = [
      { key: "umum", label: "Umum", icon: "⚙️" },
      { key: "solat", label: "Solat", icon: "🕌" },
      { key: "quran", label: "Al-Quran", icon: "📖" },
      { key: "notifications", label: "Pemberitahuan", icon: "🔔" },
      { key: "display", label: "Paparan", icon: "🎨" }
    ];
    $$renderer2.push(`<div class="flex flex-col gap-6"><div class="flex border-4 border-ink bg-white shadow-[8px_8px_0px_0px_#0D0D0D] overflow-x-auto"><!--[-->`);
    const each_array = ensure_array_like(TABS);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let tab = each_array[$$index];
      $$renderer2.push(`<button${attr_class(`flex-1 min-w-[5.5rem] px-3 py-3 text-[10px] sm:text-xs font-black uppercase tracking-wider transition-all duration-75 flex items-center justify-center gap-1.5 border-r-2 border-r-ink last:border-r-0 ${activeTab === tab.key ? "bg-ink text-white" : "bg-white text-ink hover:bg-canvas"}`)}><span>${escape_html(tab.icon)}</span> <span class="hidden sm:inline">${escape_html(tab.label)}</span></button>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="animate-slide-up">`);
    {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="card-brutal"><div class="mb-4"><h2 class="text-lg font-black uppercase tracking-wider">⚙️ Tetapan Umum</h2> <p class="text-xs text-ink/50 font-bold mt-1">Halaman permulaan, kebolehcapaian, dan lokasi.</p></div> <div class="flex flex-col gap-5"><div><p class="text-[10px] font-black uppercase tracking-wider text-ink/60 mb-2">Halaman Permulaan</p> <p class="text-xs text-ink/40 font-bold mb-2">Halaman yang dibuka apabila aplikasi dimulakan.</p> <div class="grid grid-cols-3 gap-2"><!--[-->`);
      const each_array_1 = ensure_array_like([
        { k: "solat", l: "🕌 Waktu Solat" },
        { k: "quran", l: "📖 Al-Quran" },
        { k: "dashboard", l: "🏠 Dashboard" }
      ]);
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let pg = each_array_1[$$index_1];
        $$renderer2.push(`<button${attr_class(`px-3 py-3 border-2 border-ink text-xs font-black uppercase tracking-wider transition-all duration-75 ${startupPage === pg.k ? "bg-accent-blue text-white shadow-[4px_4px_0px_0px_#0D0D0D]" : "bg-white hover:bg-canvas"}`)}>${escape_html(pg.l)}</button>`);
      }
      $$renderer2.push(`<!--]--></div></div> <div class="flex items-center justify-between border-t-2 border-ink/20 pt-4"><div><span class="text-sm font-bold block">Kurangkan Animasi</span> <span class="text-xs text-ink/40 font-bold">Kurangkan pergerakan untuk keselesaan</span></div> <button class="toggle-brutal"${attr("data-checked", reducedMotion)} role="switch"${attr("aria-checked", reducedMotion)} aria-label="Toggle reduced motion"></button></div> <div class="flex items-center justify-between border-t-2 border-ink/20 pt-4"><div><span class="text-sm font-bold block">Auto-Kesan Lokasi</span> <span class="text-xs text-ink/40 font-bold">Kesan zon solat secara automatik (GPS)</span></div> <button class="toggle-brutal"${attr("data-checked", autoDetectLocation)} role="switch"${attr("aria-checked", autoDetectLocation)} aria-label="Toggle auto-detect location"></button></div> <div class="border-t-2 border-ink/20 pt-4"><div class="card-brutal-sm bg-accent-yellow/10"><div class="flex items-center gap-2 mb-1"><span class="text-lg">📱</span> <span class="font-black text-sm">Ruang</span> <span class="chip-brutal bg-accent-yellow text-[10px]">v3.0</span></div> <p class="text-xs text-ink/50 font-bold">Teman Muslim harian anda — Waktu Solat, Al-Quran, dan banyak lagi.</p> <p class="text-[10px] text-ink/30 font-bold mt-2">Dibina dengan Astro 5, Svelte 5, dan Tailwind CSS v4.</p></div></div></div></div>`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
  });
}
const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Tetapan — Ruang" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-3xl mx-auto px-4 py-8"> <!-- Header --> <div class="mb-6"> <h1 class="text-3xl font-black uppercase tracking-wider">Tetapan</h1> <p class="text-sm font-bold text-ink/60 mt-1">Kawal semua pilihan aplikasi anda di satu tempat.</p> </div> <!-- Accent bar --> <div class="accent-bar mb-6"></div> <!-- Settings component (Svelte 5 island) --> ${renderComponent($$result2, "SettingsPage", SettingsPage, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/components/settings/SettingsPage.svelte", "client:component-export": "default" }, { "default": ($$result3) => renderTemplate` <div class="text-center py-12 animate-pulse"> <p class="font-black text-ink/40 uppercase tracking-wider">Loading settings...</p> </div> ` })} </div> ` })}`;
}, "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/pages/settings/index.astro", void 0);
const $$file = "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/pages/settings/index.astro";
const $$url = "/settings";
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
