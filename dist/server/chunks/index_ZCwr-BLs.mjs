globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_CJsCsXD8.mjs";
import { C as escape_html, B as ensure_array_like, z as attr_class, D as renderComponent, h as renderTemplate, m as maybeRenderHead } from "./worker-entry_C-jIstQk.mjs";
import { $ as $$BaseLayout } from "./BaseLayout_UTZfyRfD.mjs";
function SolatSettings($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    $$renderer2.push(`<div class="flex flex-col gap-2"><button class="flex items-center justify-between w-full px-4 py-3 border-4 border-ink bg-accent-yellow/20 font-black text-sm uppercase tracking-wider cursor-pointer hover:bg-accent-yellow/30 transition-colors"><span>Tetapan</span> <span class="text-lg">${escape_html("▼")}</span></button> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
function SettingsPage($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let activeTab = "solat";
    const TABS = [
      { key: "solat", label: "Solat", icon: "🕌" },
      { key: "quran", label: "Al-Quran", icon: "📖" },
      { key: "notifications", label: "Pemberitahuan", icon: "🔔" },
      { key: "display", label: "Paparan", icon: "🎨" }
    ];
    $$renderer2.push(`<div class="flex flex-col gap-6"><div class="flex border-4 border-ink bg-white shadow-[8px_8px_0px_0px_#0D0D0D] overflow-x-auto"><!--[-->`);
    const each_array = ensure_array_like(TABS);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let tab = each_array[$$index];
      $$renderer2.push(`<button${attr_class(`flex-1 min-w-[7rem] px-4 py-3 text-xs font-black uppercase tracking-wider transition-all duration-75 flex items-center justify-center gap-2 border-r-2 border-r-ink last:border-r-0 ${activeTab === tab.key ? "bg-ink text-white" : "bg-white text-ink hover:bg-canvas"}`)}><span>${escape_html(tab.icon)}</span> <span>${escape_html(tab.label)}</span></button>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="animate-slide-up">`);
    {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="card-brutal"><div class="mb-4"><h2 class="text-lg font-black uppercase tracking-wider">🕌 Tetapan Waktu Solat</h2> <p class="text-xs text-ink/50 font-bold mt-1">Zon, offset, waktu sunnah, dan pilihan lanjutan.</p></div> `);
      SolatSettings($$renderer2);
      $$renderer2.push(`<!----></div>`);
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
