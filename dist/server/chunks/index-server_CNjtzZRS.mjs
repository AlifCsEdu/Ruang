globalThis.process ??= {};
globalThis.process.env ??= {};
import { P as ssr_context } from "./worker-entry_C-jIstQk.mjs";
function onDestroy(fn) {
  /** @type {SSRContext} */
  ssr_context.r.on_destroy(fn);
}
export {
  onDestroy as o
};
