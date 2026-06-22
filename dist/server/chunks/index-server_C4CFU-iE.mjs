globalThis.process ??= {};
globalThis.process.env ??= {};
import { B as ssr_context } from "./worker-entry_DPx-0duo.mjs";
function onDestroy(fn) {
  /** @type {SSRContext} */
  ssr_context.r.on_destroy(fn);
}
export {
  onDestroy as o
};
