globalThis.process ??= {};
globalThis.process.env ??= {};
import { S as SURAHS } from "./surahs_C-icQo2j.mjs";
const prerender = false;
const GET = async () => {
  return new Response(JSON.stringify({ chapters: SURAHS }), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=604800, stale-while-revalidate=86400"
    }
  });
};
const _page = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  GET,
  prerender
}, Symbol.toStringTag, { value: "Module" }));
const page = () => _page;
export {
  page
};
