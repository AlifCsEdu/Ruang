globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_BecWgU-U.mjs";
import { x as renderHead, v as renderComponent, h as renderTemplate } from "./worker-entry_DPx-0duo.mjs";
/* empty css                 */
const $$Tv = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Tv;
  const rawUrl = Astro2.url;
  const params = rawUrl.searchParams;
  const initConfig = JSON.stringify({
    zone: params.get("zone") ?? "",
    mosque: params.get("mosque") ?? "",
    dark: params.get("dark") ?? "",
    "24h": params.get("24h") ?? "",
    seconds: params.get("seconds") ?? "",
    font: params.get("font") ?? "",
    hijri: params.get("hijri") ?? "",
    sunnah: params.get("sunnah") ?? "",
    adhan: params.get("adhan") ?? "",
    jumua: params.get("jumua") ?? ""
  });
  return renderTemplate`<html lang="ms" data-astro-cid-o6egdrey> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="robots" content="noindex"><title>Waktu Solat — Skrin Penuh</title><link rel="preconnect" href="https://api.waktusolat.app"><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet">${renderHead()}</head> <body data-astro-cid-o6egdrey> ${renderComponent($$result, "TvDashboard", null, { "client:only": "svelte", "data-init-config": initConfig, "client:component-hydration": "only", "data-astro-cid-o6egdrey": true, "client:component-path": "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/components/solat/TvDashboard.svelte", "client:component-export": "default" })} </body></html>`;
}, "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/pages/solat/tv.astro", void 0);
const $$file = "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/pages/solat/tv.astro";
const $$url = "/solat/tv";
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  default: $$Tv,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
