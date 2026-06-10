globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_D7kXc7QO.mjs";
import { B as ensure_array_like, z as attr_class, C as escape_html, K as attr_style, O as stringify, y as attr, H as derived, D as renderComponent, h as renderTemplate, m as maybeRenderHead, g as addAttribute, G as renderTransition, J as createTransitionScope } from "./worker-entry_BueQH5e0.mjs";
import { B as BeadsIcon, $ as $$BaseLayout } from "./viewtransitions_4cCgKLLa.mjs";
import { h as html } from "./html_BMy9tuiB.mjs";
function Tasbih($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    const PRESETS = [33, 99, 100, 500];
    let count = 0;
    let target = 33;
    let totalCount = 0;
    let progress = derived(() => Math.min(count / target * 100, 100));
    let isComplete = derived(() => count >= target);
    $$renderer2.push(`<div class="flex flex-col gap-4"><div class="flex items-center gap-2 flex-wrap"><span class="text-xs font-black uppercase tracking-wider text-ink/60 shrink-0">Target:</span> <!--[-->`);
    const each_array = ensure_array_like(PRESETS);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let preset = each_array[$$index];
      $$renderer2.push(`<button${attr_class(`btn-brutal-sm text-xs ${target === preset ? "bg-accent-blue text-white" : "bg-white hover:bg-canvas"}`)}>${escape_html(preset)}</button>`);
    }
    $$renderer2.push(`<!--]--></div> <div class="h-4 border-2 border-ink bg-white overflow-hidden"><div${attr_class(`h-full transition-all duration-150 ${isComplete() ? "bg-accent-green" : "bg-accent-yellow"}`)}${attr_style(`width: ${stringify(progress())}%`)}></div></div> <div class="text-center py-4"><div class="font-black text-6xl tabular-nums tracking-tight">${escape_html(count)}</div> <div class="text-sm font-bold text-ink/50 mt-1">/ ${escape_html(target)}</div> `);
    if (isComplete()) {
      $$renderer2.push("<!--[0-->");
      $$renderer2.push(`<div class="badge-brutal bg-accent-green text-white text-xs mt-3 inline-block">TARGET ACHIEVED!</div>`);
    } else {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div> <button class="w-full aspect-square max-h-[180px] border-4 border-ink bg-accent-yellow shadow-[8px_8px_0px_0px_#0D0D0D] active:translate-x-2 active:translate-y-2 active:shadow-none transition-all duration-75 flex flex-col items-center justify-center gap-2 cursor-pointer select-none" aria-label="Count tasbih"><span class="text-5xl">${html(BeadsIcon(56))}</span> <span class="font-black text-lg uppercase tracking-wider">Tap</span></button> <div class="flex items-center gap-2"><button class="btn-brutal-sm flex-1 text-sm"${attr("disabled", count <= 0, true)}>- Undo</button> <button class="btn-brutal-sm flex-1 text-sm bg-accent-pink text-white hover:bg-accent-pink/80">Reset</button> <button class="btn-brutal-sm text-sm">${escape_html("History")}</button></div> <div class="text-center text-xs text-ink/40 font-bold">Lifetime total: ${escape_html(totalCount.toLocaleString())}</div> `);
    {
      $$renderer2.push("<!--[-1-->");
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Tasbih — Ruang" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-md mx-auto px-4 py-8"${addAttribute(renderTransition($$result2, "yjtqgox3", "", "page-tasbih"), "data-astro-transition-scope")}> <h1 class="text-3xl font-black uppercase tracking-wider mb-6">Tasbih Counter</h1> ${renderComponent($$result2, "Tasbih", Tasbih, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/components/tasbih/Tasbih.svelte", "client:component-export": "default", "data-astro-transition-persist": createTransitionScope($$result2, "wxc4n5tx") })} </div> ` })}`;
}, "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/pages/tasbih/index.astro", "self");
const $$file = "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/pages/tasbih/index.astro";
const $$url = "/tasbih";
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
