globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_D7kXc7QO.mjs";
import { Q as createRenderInstruction, m as maybeRenderHead, g as addAttribute, h as renderTemplate, u as unescapeHTML, S as renderHead, D as renderComponent, T as renderSlot } from "./worker-entry_BueQH5e0.mjs";
async function renderScript(result, id) {
  const inlined = result.inlinedScripts.get(id);
  let content = "";
  if (inlined != null) {
    if (inlined) {
      content = `<script type="module">${inlined}<\/script>`;
    }
  } else {
    const resolved = await result.resolve(id);
    content = `<script type="module" src="${result.userAssetsBase ? (result.base === "/" ? "" : result.base) + result.userAssetsBase : ""}${resolved}"><\/script>`;
  }
  return createRenderInstruction({ type: "script", id, content });
}
const MosqueIcon = (size = 24) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2C9 5 7 7 7 10v4H4v6h16v-6h-3v-4c0-3-2-5-5-8z"/><path d="M12 2v4"/><path d="M10 20v-4a2 2 0 0 1 4 0v4"/></svg>`;
const BookIcon = (size = 24) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>`;
const ScrollIcon = (size = 24) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4"/><path d="M19 7V5a2 2 0 0 0-2-2H6"/></svg>`;
const HandsIcon = (size = 24) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2"/><path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2"/><path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8"/><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15"/></svg>`;
const BeadsIcon = (size = 24) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="4" r="2"/><circle cx="18" cy="7" r="2"/><circle cx="20" cy="13" r="2"/><circle cx="18" cy="19" r="2"/><circle cx="12" cy="22" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="4" cy="13" r="2"/><circle cx="6" cy="7" r="2"/></svg>`;
const CheckCircleIcon = (size = 24) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>`;
const CalendarIcon = (size = 24) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/></svg>`;
const HomeIcon = (size = 24) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>`;
const SearchIcon = (size = 20) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>`;
const NAV_LINKS = [
  { href: "/", label: "Dashboard", icon: HomeIcon, color: "bg-canvas" },
  { href: "/solat", label: "Waktu Solat", icon: MosqueIcon, color: "bg-accent-blue/10" },
  { href: "/quran", label: "Al-Quran", icon: BookIcon, color: "bg-accent-green/10" },
  { href: "/duas", label: "Duas", icon: HandsIcon, color: "bg-accent-pink/10" },
  { href: "/hadith", label: "Hadith", icon: ScrollIcon, color: "bg-accent-yellow/20" },
  { href: "/tasbih", label: "Tasbih", icon: BeadsIcon, color: "bg-accent-blue/10" },
  { href: "/tracker", label: "Tracker", icon: CheckCircleIcon, color: "bg-accent-green/10" },
  { href: "/hijri", label: "Calendar", icon: CalendarIcon, color: "bg-accent-yellow/20" }
];
const BOTTOM_NAV_LINKS = [
  NAV_LINKS[1],
  // Solat
  NAV_LINKS[2],
  // Quran
  NAV_LINKS[5],
  // Tasbih
  NAV_LINKS[6],
  // Tracker
  NAV_LINKS[0]
  // Home
];
function isActive(currentPath, linkHref) {
  if (linkHref === "/") return currentPath === "/";
  return currentPath.startsWith(linkHref);
}
const $$Navbar = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Navbar;
  const currentPath = Astro2.url.pathname;
  const desktopLinks = NAV_LINKS.filter((l) => l.href !== "/");
  return renderTemplate`${maybeRenderHead()}<nav class="sticky top-0 z-50 flex items-center h-14 px-4 border-b-4 border-ink bg-canvas"> <!-- Brand --> <a href="/" class="inline-flex items-center px-3 py-1 border-4 border-ink bg-accent-yellow font-black text-sm uppercase tracking-widest shadow-[4px_4px_0px_0px_#0D0D0D] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all duration-75 focus:outline-none focus:ring-4 focus:ring-accent-blue">
RUANG
</a> <!-- Desktop nav links --> <div class="hidden md:flex items-center gap-1 ml-6"> ${desktopLinks.map((link) => {
    const active = isActive(currentPath, link.href);
    return renderTemplate`<a${addAttribute(link.href, "href")}${addAttribute([
      "px-3 py-1.5 text-xs font-bold uppercase tracking-wider border-2 transition-all duration-75",
      "focus:outline-none focus:ring-3 focus:ring-accent-blue",
      active ? "border-ink bg-accent-yellow shadow-[3px_3px_0px_0px_#0D0D0D]" : "border-transparent hover:border-ink hover:bg-white"
    ], "class:list")}> ${link.label} </a>`;
  })} </div> </nav>`;
}, "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/components/layout/Navbar.astro", void 0);
const $$Sidebar = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$Sidebar;
  const currentPath = Astro2.url.pathname;
  return renderTemplate`${maybeRenderHead()}<aside class="hidden lg:flex flex-col sticky top-14 w-56 h-[calc(100vh-3.5rem)] border-r-4 border-ink bg-canvas overflow-y-auto shrink-0"> <div class="flex flex-col gap-1 p-3"> ${NAV_LINKS.map((link) => {
    const active = isActive(currentPath, link.href);
    return renderTemplate`<a${addAttribute(link.href, "href")}${addAttribute([
      "flex items-center gap-3 px-3 py-2.5 font-bold text-sm border-2 transition-all duration-75",
      "focus:outline-none focus:ring-3 focus:ring-accent-blue",
      active ? "border-ink bg-accent-yellow shadow-[4px_4px_0px_0px_#0D0D0D]" : "border-transparent hover:border-ink/30 hover:bg-white"
    ], "class:list")}> <span class="shrink-0 text-ink">${unescapeHTML(link.icon(18))}</span> <span class="uppercase tracking-wider truncate">${link.label}</span> </a>`;
  })} </div> </aside>`;
}, "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/components/layout/Sidebar.astro", void 0);
const $$BottomNav = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$BottomNav;
  const currentPath = Astro2.url.pathname;
  return renderTemplate`${maybeRenderHead()}<nav class="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around h-16 border-t-4 border-ink bg-white"> ${BOTTOM_NAV_LINKS.map((link) => {
    const active = isActive(currentPath, link.href);
    return renderTemplate`<a${addAttribute(link.href, "href")}${addAttribute([
      "flex flex-col items-center justify-center gap-0.5 w-full h-full transition-all duration-75",
      "focus:outline-none focus:ring-3 focus:ring-accent-blue focus:ring-inset",
      active ? "text-accent-blue" : "text-ink/60 hover:text-ink"
    ], "class:list")}${addAttribute(link.label, "aria-label")}${addAttribute(active ? "page" : void 0, "aria-current")}> <span>${unescapeHTML(link.icon(20))}</span> <span class="text-[10px] font-bold uppercase tracking-wider">${link.label}</span> </a>`;
  })} </nav>`;
}, "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/components/layout/BottomNav.astro", void 0);
const $$BaseLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$props, $$slots);
  Astro2.self = $$BaseLayout;
  const { title = "Ruang — Your Muslim Companion" } = Astro2.props;
  return renderTemplate`<html lang="en" dir="ltr"> <head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="generator"${addAttribute(Astro2.generator, "content")}><meta name="description" content="Ruang — An all-in-one Muslim web app for Malaysian users. Prayer times, Al-Quran, Hadith, Duas, and more."><meta name="theme-color" content="#F8F5F2"><!-- PWA --><link rel="manifest" href="/manifest.webmanifest"><link rel="icon" href="/icon-192.svg" type="image/svg+xml"><link rel="apple-touch-icon" href="/icon-192.svg"><title>${title}</title><!-- Preconnect for Google Fonts --><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><!-- Inter font for UI (subset latin) --><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet"><!-- Amiri font for Arabic text (subset) --><link href="https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap" rel="stylesheet">${renderHead()}</head> <body class="bg-canvas text-ink font-[family-name:var(--font-ui)] min-h-screen flex flex-col"> <!-- Sticky top navbar --> ${renderComponent($$result, "Navbar", $$Navbar, {})} <div class="flex flex-1"> <!-- Desktop sidebar --> ${renderComponent($$result, "Sidebar", $$Sidebar, {})} <!-- Main content area --> <main class="flex-1 pb-20 lg:pb-8"> ${renderSlot($$result, $$slots["default"])} </main> </div> <!-- Mobile bottom nav --> ${renderComponent($$result, "BottomNav", $$BottomNav, {})} ${renderScript($$result, "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/layouts/BaseLayout.astro?astro&type=script&index=0&lang.ts")} </body> </html>`;
}, "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/layouts/BaseLayout.astro", void 0);
export {
  $$BaseLayout as $,
  BeadsIcon as B,
  NAV_LINKS as N,
  SearchIcon as S
};
