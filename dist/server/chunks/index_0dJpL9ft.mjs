globalThis.process ??= {};
globalThis.process.env ??= {};
import { c as createComponent } from "./astro-component_CJsCsXD8.mjs";
import { n as generateCspDigest, s as spreadAttributes, u as unescapeHTML, h as renderTemplate, o as removeBase, a as isRemotePath, p as unflatten, q as object, t as date, v as array, A as AstroError, w as UnknownContentCollectionError, x as string, y as attr, z as attr_class, B as ensure_array_like, C as escape_html, D as renderComponent, m as maybeRenderHead, g as addAttribute } from "./worker-entry_C-jIstQk.mjs";
import { S as SearchIcon, $ as $$BaseLayout } from "./BaseLayout_UTZfyRfD.mjs";
import { b as VALID_INPUT_FORMATS } from "./consts_DGyPhplw.mjs";
import { h as html } from "./html_BMy9tuiB.mjs";
var e = (e2) => Object.prototype.toString.call(e2), t = (e2) => ArrayBuffer.isView(e2) && !(e2 instanceof DataView), o = (t2) => "[object Date]" === e(t2), n = (t2) => "[object RegExp]" === e(t2), r = (t2) => "[object Error]" === e(t2), s = (t2) => "[object Boolean]" === e(t2), l = (t2) => "[object Number]" === e(t2), i = (t2) => "[object String]" === e(t2), c = Array.isArray, u = Object.getOwnPropertyDescriptor, a = Object.prototype.propertyIsEnumerable, f = Object.getOwnPropertySymbols, p = Object.prototype.hasOwnProperty, h = Object.keys;
function d(e2) {
  const t2 = h(e2), o2 = f(e2);
  for (let n2 = 0; n2 < o2.length; n2++) a.call(e2, o2[n2]) && t2.push(o2[n2]);
  return t2;
}
function b(e2, t2) {
  return !u(e2, t2)?.writable;
}
function y(e2, u2) {
  if ("object" == typeof e2 && null !== e2) {
    let a2;
    if (c(e2)) a2 = [];
    else if (o(e2)) a2 = new Date(e2.getTime ? e2.getTime() : e2);
    else if (n(e2)) a2 = new RegExp(e2);
    else if (r(e2)) a2 = { message: e2.message };
    else if (s(e2) || l(e2) || i(e2)) a2 = Object(e2);
    else {
      if (t(e2)) return e2.slice();
      a2 = Object.create(Object.getPrototypeOf(e2));
    }
    const f2 = u2.includeSymbols ? d : h;
    for (const t2 of f2(e2)) a2[t2] = e2[t2];
    return a2;
  }
  return e2;
}
var g = { includeSymbols: false, immutable: false };
function m(e2, t2, o2 = g) {
  const n2 = [], r2 = [];
  let s2 = true;
  const l2 = o2.includeSymbols ? d : h, i2 = !!o2.immutable;
  return (function e3(u2) {
    const a2 = i2 ? y(u2, o2) : u2, f2 = {};
    let h2 = true;
    const d2 = { node: a2, node_: u2, path: [].concat(n2), parent: r2[r2.length - 1], parents: r2, key: n2[n2.length - 1], isRoot: 0 === n2.length, level: n2.length, circular: void 0, isLeaf: false, notLeaf: true, notRoot: true, isFirst: false, isLast: false, update: function(e4, t3 = false) {
      d2.isRoot || (d2.parent.node[d2.key] = e4), d2.node = e4, t3 && (h2 = false);
    }, delete: function(e4) {
      delete d2.parent.node[d2.key], e4 && (h2 = false);
    }, remove: function(e4) {
      c(d2.parent.node) ? d2.parent.node.splice(d2.key, 1) : delete d2.parent.node[d2.key], e4 && (h2 = false);
    }, keys: null, before: function(e4) {
      f2.before = e4;
    }, after: function(e4) {
      f2.after = e4;
    }, pre: function(e4) {
      f2.pre = e4;
    }, post: function(e4) {
      f2.post = e4;
    }, stop: function() {
      s2 = false;
    }, block: function() {
      h2 = false;
    } };
    if (!s2) return d2;
    function g2() {
      if ("object" == typeof d2.node && null !== d2.node) {
        d2.keys && d2.node_ === d2.node || (d2.keys = l2(d2.node)), d2.isLeaf = 0 === d2.keys.length;
        for (let e4 = 0; e4 < r2.length; e4++) if (r2[e4].node_ === u2) {
          d2.circular = r2[e4];
          break;
        }
      } else d2.isLeaf = true, d2.keys = null;
      d2.notLeaf = !d2.isLeaf, d2.notRoot = !d2.isRoot;
    }
    g2();
    const m2 = t2(d2, d2.node);
    if (void 0 !== m2 && d2.update && d2.update(m2), f2.before && f2.before(d2, d2.node), !h2) return d2;
    if ("object" == typeof d2.node && null !== d2.node && !d2.circular) {
      r2.push(d2), g2();
      for (const [t3, o3] of Object.entries(d2.keys ?? [])) {
        n2.push(o3), f2.pre && f2.pre(d2, d2.node[o3], o3);
        const r3 = e3(d2.node[o3]);
        i2 && p.call(d2.node, o3) && !b(d2.node, o3) && (d2.node[o3] = r3.node), r3.isLast = !!d2.keys?.length && +t3 == d2.keys.length - 1, r3.isFirst = 0 == +t3, f2.post && f2.post(d2, r3), n2.pop();
      }
      r2.pop();
    }
    return f2.after && f2.after(d2, d2.node), d2;
  })(e2).node;
}
var j = class {
  #e;
  #t;
  constructor(e2, t2 = g) {
    this.#e = e2, this.#t = t2;
  }
  get(e2) {
    let t2 = this.#e;
    for (let o2 = 0; t2 && o2 < e2.length; o2++) {
      const n2 = e2[o2];
      if (!p.call(t2, n2) || !this.#t.includeSymbols && "symbol" == typeof n2) return;
      t2 = t2[n2];
    }
    return t2;
  }
  has(e2) {
    let t2 = this.#e;
    for (let o2 = 0; t2 && o2 < e2.length; o2++) {
      const n2 = e2[o2];
      if (!p.call(t2, n2) || !this.#t.includeSymbols && "symbol" == typeof n2) return false;
      t2 = t2[n2];
    }
    return true;
  }
  set(e2, t2) {
    let o2 = this.#e, n2 = 0;
    for (n2 = 0; n2 < e2.length - 1; n2++) {
      const t3 = e2[n2];
      p.call(o2, t3) || (o2[t3] = {}), o2 = o2[t3];
    }
    return o2[e2[n2]] = t2, t2;
  }
  map(e2) {
    return m(this.#e, e2, { immutable: true, includeSymbols: !!this.#t.includeSymbols });
  }
  forEach(e2) {
    return this.#e = m(this.#e, e2, this.#t), this.#e;
  }
  reduce(e2, t2) {
    const o2 = 1 === arguments.length;
    let n2 = o2 ? this.#e : t2;
    return this.forEach(((t3, r2) => {
      t3.isRoot && o2 || (n2 = e2(t3, n2, r2));
    })), n2;
  }
  paths() {
    const e2 = [];
    return this.forEach(((t2) => {
      e2.push(t2.path);
    })), e2;
  }
  nodes() {
    const e2 = [];
    return this.forEach(((t2) => {
      e2.push(t2.node);
    })), e2;
  }
  clone() {
    const e2 = [], o2 = [], n2 = this.#t;
    return t(this.#e) ? this.#e.slice() : (function t2(r2) {
      for (let t3 = 0; t3 < e2.length; t3++) if (e2[t3] === r2) return o2[t3];
      if ("object" == typeof r2 && null !== r2) {
        const s2 = y(r2, n2);
        e2.push(r2), o2.push(s2);
        const l2 = n2.includeSymbols ? d : h;
        for (const e3 of l2(r2)) s2[e3] = t2(r2[e3]);
        return e2.pop(), o2.pop(), s2;
      }
      return r2;
    })(this.#e);
  }
};
function createSvgComponent({ meta, attributes, children, styles }) {
  const hasStyles = styles.length > 0;
  const Component = createComponent({
    async factory(result, props) {
      const normalizedProps = normalizeProps(attributes, props);
      if (hasStyles && result.cspDestination) {
        for (const style of styles) {
          const hash = await generateCspDigest(style, result.cspAlgorithm);
          result._metadata.extraStyleHashes.push(hash);
        }
      }
      return renderTemplate`<svg${spreadAttributes(normalizedProps)}>${unescapeHTML(children)}</svg>`;
    },
    propagation: hasStyles ? "self" : "none"
  });
  Object.defineProperty(Component, "toJSON", {
    value: () => meta,
    enumerable: false
  });
  return Object.assign(Component, meta);
}
const ATTRS_TO_DROP = ["xmlns", "xmlns:xlink", "version"];
const DEFAULT_ATTRS = {};
function dropAttributes(attributes) {
  for (const attr2 of ATTRS_TO_DROP) {
    delete attributes[attr2];
  }
  return attributes;
}
function normalizeProps(attributes, props) {
  return dropAttributes({ ...DEFAULT_ATTRS, ...attributes, ...props });
}
const CONTENT_IMAGE_FLAG = "astroContentImageFlag";
const IMAGE_IMPORT_PREFIX = "__ASTRO_IMAGE_";
function imageSrcToImportId(imageSrc, filePath) {
  imageSrc = removeBase(imageSrc, IMAGE_IMPORT_PREFIX);
  if (isRemotePath(imageSrc)) {
    return;
  }
  const ext = imageSrc.split(".").at(-1)?.toLowerCase();
  if (!ext || !VALID_INPUT_FORMATS.includes(ext)) {
    return;
  }
  const params = new URLSearchParams(CONTENT_IMAGE_FLAG);
  if (filePath) {
    params.set("importer", filePath);
  }
  return `${imageSrc}?${params.toString()}`;
}
class ImmutableDataStore {
  _collections = /* @__PURE__ */ new Map();
  constructor() {
    this._collections = /* @__PURE__ */ new Map();
  }
  get(collectionName, key) {
    return this._collections.get(collectionName)?.get(String(key));
  }
  entries(collectionName) {
    const collection = this._collections.get(collectionName) ?? /* @__PURE__ */ new Map();
    return [...collection.entries()];
  }
  values(collectionName) {
    const collection = this._collections.get(collectionName) ?? /* @__PURE__ */ new Map();
    return [...collection.values()];
  }
  keys(collectionName) {
    const collection = this._collections.get(collectionName) ?? /* @__PURE__ */ new Map();
    return [...collection.keys()];
  }
  has(collectionName, key) {
    const collection = this._collections.get(collectionName);
    if (collection) {
      return collection.has(String(key));
    }
    return false;
  }
  hasCollection(collectionName) {
    return this._collections.has(collectionName);
  }
  collections() {
    return this._collections;
  }
  /**
   * Attempts to load a DataStore from the virtual module.
   * This only works in Vite.
   */
  static async fromModule() {
    try {
      const data = await import("./_astro_data-layer-content_CovA-IF0.mjs");
      if (data.default instanceof Map) {
        return ImmutableDataStore.fromMap(data.default);
      }
      const map = unflatten(data.default);
      return ImmutableDataStore.fromMap(map);
    } catch {
    }
    return new ImmutableDataStore();
  }
  static async fromMap(data) {
    const store = new ImmutableDataStore();
    store._collections = data;
    return store;
  }
}
function dataStoreSingleton() {
  let instance = void 0;
  return {
    get: async () => {
      if (!instance) {
        instance = ImmutableDataStore.fromModule();
      }
      return instance;
    },
    set: (store) => {
      instance = store;
    }
  };
}
const globalDataStore = dataStoreSingleton();
object({
  tags: array(string()).optional(),
  lastModified: date().optional()
});
function createGetCollection({
  liveCollections: liveCollections2
}) {
  return async function getCollection2(collection, filter) {
    if (collection in liveCollections2) {
      throw new AstroError({
        ...UnknownContentCollectionError,
        message: `Collection "${collection}" is a live collection. Use getLiveCollection() instead of getCollection().`
      });
    }
    const hasFilter = typeof filter === "function";
    const store = await globalDataStore.get();
    if (store.hasCollection(collection)) {
      const { default: imageAssetMap } = await import("./content-assets_udJCSOal.mjs");
      const result = [];
      for (const rawEntry of store.values(collection)) {
        const data = updateImageReferencesInData(rawEntry.data, rawEntry.filePath, imageAssetMap);
        let entry = {
          ...rawEntry,
          data,
          collection
        };
        if (hasFilter && !filter(entry)) {
          continue;
        }
        result.push(entry);
      }
      return result;
    } else {
      console.warn(
        `The collection ${JSON.stringify(
          collection
        )} does not exist or is empty. Please check your content config file for errors.`
      );
      return [];
    }
  };
}
function updateImageReferencesInData(data, fileName, imageAssetMap) {
  const copy = structuredClone(data);
  new j(copy).forEach(function(ctx, val) {
    if (typeof val === "string" && val.startsWith(IMAGE_IMPORT_PREFIX)) {
      const src = val.replace(IMAGE_IMPORT_PREFIX, "");
      const id = imageSrcToImportId(src, fileName);
      if (!id) {
        ctx.update(src);
        return;
      }
      const imported = imageAssetMap?.get(id);
      if (imported) {
        if (imported.__svgData) {
          const { __svgData: svgData, ...meta } = imported;
          ctx.update(createSvgComponent({ meta, ...svgData }));
        } else {
          ctx.update(imported);
        }
      } else {
        ctx.update(src);
      }
    }
  });
  return copy;
}
const liveCollections = {};
const getCollection = createGetCollection({
  liveCollections
});
function DuaSearch($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let { categories } = $$props;
    let search = "";
    let activeCategory = "";
    $$renderer2.push(`<div class="flex flex-col gap-3"><div class="relative"><span class="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40">${html(SearchIcon(18))}</span> <input type="text"${attr("value", search)} placeholder="Search duas..." class="input-brutal w-full pl-10" aria-label="Search duas"/></div> <div class="flex flex-wrap gap-2"><button${attr_class(`btn-brutal-sm text-xs ${"bg-ink text-white"}`)}>All</button> <!--[-->`);
    const each_array = ensure_array_like(categories);
    for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
      let cat = each_array[$$index];
      $$renderer2.push(`<button${attr_class(`btn-brutal-sm text-xs ${activeCategory === cat ? "bg-accent-pink text-white" : "bg-white hover:bg-canvas"}`)}>${escape_html(cat)}</button>`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
  });
}
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const duas = await getCollection("duas").catch(() => []);
  const categories = [...new Set(duas.map((d2) => d2.data.category))].sort();
  return renderTemplate`${renderComponent($$result, "BaseLayout", $$BaseLayout, { "title": "Duas — Ruang" }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="max-w-3xl mx-auto px-4 py-8"> <!-- Header --> <div class="mb-8"> <h1 class="text-3xl font-black uppercase tracking-wider">Duas</h1> <p class="text-sm font-bold text-ink/60 mt-1">Daily supplications from Hisnul Muslim</p> </div> <!-- Client-side search (Svelte 5 island) --> ${renderComponent($$result2, "DuaSearch", DuaSearch, { "client:load": true, "categories": categories, "client:component-hydration": "load", "client:component-path": "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/components/duas/DuaSearch.svelte", "client:component-export": "default" }, { "default": async ($$result3) => renderTemplate` <div class="animate-pulse py-4"> <div class="h-12 bg-ink/10 border-4 border-ink"></div> </div> ` })} <!-- Duas List (server-rendered, zero JS) --> <div class="flex flex-col gap-4 mt-6" id="duas-list"> ${duas.map((dua) => renderTemplate`<div class="card-brutal"${addAttribute(dua.data.category, "data-category")}${addAttribute(dua.id, "data-id")}> <!-- Header --> <div class="flex items-center justify-between mb-3 border-b-2 border-ink/10 pb-2"> <div> <h2 class="font-black text-sm uppercase tracking-wider">${dua.data.title}</h2> <span class="badge-brutal bg-accent-pink/20 text-xs mt-1">${dua.data.category}</span> </div> <span class="arabic-text text-lg leading-none" dir="rtl" style="line-height: 1.5;">${dua.data.titleAr}</span> </div> <!-- Arabic --> <div class="arabic-text mb-4 bg-canvas/50 p-4 border-2 border-ink/10" dir="rtl"> ${dua.data.arabic} </div> <!-- Transliteration --> <p class="text-sm font-bold text-ink/60 italic mb-2">${dua.data.transliteration}</p> <!-- Translation --> <p class="text-sm text-ink/80 mb-3">${dua.data.translation}</p> <!-- Reference --> <div class="text-xs text-ink/40 font-bold border-t border-ink/10 pt-2">
Reference: ${dua.data.reference} </div> </div>`)} </div> </div> ` })}`;
}, "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/pages/duas/index.astro", void 0);
const $$file = "C:/Users/alif325/Documents/WIndsurf projeks/Ruang/src/pages/duas/index.astro";
const $$url = "/duas";
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
