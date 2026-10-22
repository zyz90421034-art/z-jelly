const Callable$1 = (
  /** @type {any} */
  class Callable {
    /**
     * Creates a new instance of the Callable class.
     */
    constructor() {
      let closure = function(...args) {
        return closure._call(...args);
      };
      return Object.setPrototypeOf(closure, new.target.prototype);
    }
    /**
     * This method should be implemented in subclasses to provide the
     * functionality of the callable object.
     *
     * @param {any[]} args
     * @throws {Error} If the subclass does not implement the `_call` method.
     */
    _call(...args) {
      throw Error("Must implement _call method in subclass");
    }
  }
);
var sharp = Object.freeze({});
const Readable = null;
const pipeline = null;
const VERSION = "4.3.1";
const HAS_SELF = typeof self !== "undefined";
const IS_FS_AVAILABLE = !isEmpty(sharp);
const IS_PATH_AVAILABLE = !isEmpty(sharp);
const IS_WEB_CACHE_AVAILABLE = HAS_SELF && "caches" in self;
const IS_DENO_RUNTIME = typeof globalThis.Deno !== "undefined";
const IS_DENO_WEB_RUNTIME = IS_DENO_RUNTIME && IS_WEB_CACHE_AVAILABLE && !IS_FS_AVAILABLE;
const IS_PROCESS_AVAILABLE = typeof process !== "undefined";
const IS_NODE_ENV = IS_PROCESS_AVAILABLE && process?.release?.name === "node" && !IS_DENO_WEB_RUNTIME;
const IS_BROWSER_ENV = typeof window !== "undefined" && typeof window.document !== "undefined";
const IS_WEBWORKER_ENV = HAS_SELF && ["DedicatedWorkerGlobalScope", "ServiceWorkerGlobalScope", "SharedWorkerGlobalScope"].includes(
  self.constructor?.name
);
const IS_WEB_ENV = IS_BROWSER_ENV || IS_WEBWORKER_ENV || IS_DENO_WEB_RUNTIME;
const IS_WEBGPU_AVAILABLE = IS_NODE_ENV || typeof navigator !== "undefined" && "gpu" in navigator;
const IS_WEBNN_AVAILABLE = typeof navigator !== "undefined" && "ml" in navigator;
const IS_CRYPTO_AVAILABLE = typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function";
const IS_CHROME_AVAILABLE = (
  // @ts-ignore - chrome may not exist in all environments
  typeof chrome !== "undefined" && typeof chrome.runtime !== "undefined" && typeof chrome.runtime.id === "string"
);
const IS_SERVICE_WORKER_ENV = (
  // @ts-ignore - ServiceWorkerGlobalScope may not exist in all environments
  typeof ServiceWorkerGlobalScope !== "undefined" && HAS_SELF && self instanceof ServiceWorkerGlobalScope
);
const isSafariBelow26 = () => {
  if (typeof navigator === "undefined") {
    return false;
  }
  const userAgent = navigator.userAgent;
  const isSafari = (navigator.vendor || "").indexOf("Apple") > -1 && !userAgent.match(/CriOS|FxiOS|EdgiOS|OPiOS|mercury|brave/i) && !userAgent.includes("Chrome") && !userAgent.includes("Android");
  if (!isSafari) {
    return false;
  }
  const match = userAgent.match(/Version\/(\d+)/);
  return match ? parseInt(match[1], 10) < 26 : false;
};
const IS_SAFARI_BELOW_26 = isSafariBelow26();
const apis = Object.freeze({
  /** Whether we are running in a browser environment (and not a web worker) */
  IS_BROWSER_ENV,
  /** Whether we are running in a web worker environment */
  IS_WEBWORKER_ENV,
  /** Whether we are running in a web-like environment (browser, web worker, or Deno web runtime) */
  IS_WEB_ENV,
  /** Whether we are running in a service worker environment */
  IS_SERVICE_WORKER_ENV,
  /** Whether we are running in Deno's web runtime (CDN imports, Cache API available, no filesystem) */
  IS_DENO_WEB_RUNTIME,
  /** Whether the Cache API is available */
  IS_WEB_CACHE_AVAILABLE,
  /** Whether the WebGPU API is available */
  IS_WEBGPU_AVAILABLE,
  /** Whether the WebNN API is available */
  IS_WEBNN_AVAILABLE,
  /** Whether we are running in a Safari browser older than version 26. */
  IS_SAFARI_BELOW_26,
  /** Whether the Node.js process API is available */
  IS_PROCESS_AVAILABLE,
  /** Whether we are running in a Node.js-like environment (node, deno, bun) */
  IS_NODE_ENV,
  /** Whether the filesystem API is available */
  IS_FS_AVAILABLE,
  /** Whether the path API is available */
  IS_PATH_AVAILABLE,
  /** Whether the crypto API is available */
  IS_CRYPTO_AVAILABLE,
  /** Whether the Chrome runtime API is available */
  IS_CHROME_AVAILABLE
});
const RUNNING_LOCALLY = IS_FS_AVAILABLE && IS_PATH_AVAILABLE;
let dirname__ = "./";
if (RUNNING_LOCALLY) {
  const _import_meta_url = import.meta.url;
  if (_import_meta_url) {
    dirname__ = sharp.dirname(sharp.dirname(sharp.fileURLToPath(_import_meta_url)));
  } else if (typeof __dirname !== "undefined") {
    dirname__ = sharp.dirname(__dirname);
  }
}
const DEFAULT_CACHE_DIR = RUNNING_LOCALLY ? sharp.join(dirname__, "/.cache/") : null;
const DEFAULT_LOCAL_MODEL_PATH = "/models/";
const localModelPath = RUNNING_LOCALLY ? sharp.join(dirname__, DEFAULT_LOCAL_MODEL_PATH) : DEFAULT_LOCAL_MODEL_PATH;
const DEFAULT_FETCH = typeof globalThis.fetch === "function" ? globalThis.fetch.bind(globalThis) : void 0;
const LogLevel = Object.freeze({
  /** All messages including debug output (value: 10) */
  DEBUG: 10,
  /** Errors, warnings, and info messages (value: 20) */
  INFO: 20,
  /** Errors and warnings (value: 30) */
  WARNING: 30,
  /** Only error messages (value: 40) */
  ERROR: 40,
  /** No logging output (value: 50) */
  NONE: 50
});
let logLevel = LogLevel.WARNING;
const env = {
  version: VERSION,
  /////////////////// Backends settings ///////////////////
  // NOTE: These will be populated later by the backends themselves.
  backends: {
    // onnxruntime-web/onnxruntime-node
    onnx: {}
  },
  /////////////////// Logging settings ///////////////////
  get logLevel() {
    return logLevel;
  },
  set logLevel(level) {
    logLevel = level;
    env.backends.onnx?.setLogLevel?.(level);
  },
  /////////////////// Model settings ///////////////////
  allowRemoteModels: true,
  remoteHost: "https://huggingface.co/",
  remotePathTemplate: "{model}/resolve/{revision}/",
  allowLocalModels: !(IS_BROWSER_ENV || IS_WEBWORKER_ENV || IS_DENO_WEB_RUNTIME),
  // Default to true for non-web environments, false for web environments
  localModelPath,
  useFS: IS_FS_AVAILABLE,
  /////////////////// Cache settings ///////////////////
  useBrowserCache: IS_WEB_CACHE_AVAILABLE,
  useFSCache: IS_FS_AVAILABLE,
  cacheDir: DEFAULT_CACHE_DIR,
  useCustomCache: false,
  customCache: null,
  useWasmCache: IS_WEB_CACHE_AVAILABLE || IS_FS_AVAILABLE,
  cacheKey: "transformers-cache",
  experimental_useCrossOriginStorage: false,
  /////////////////// Custom fetch /////////////////////
  fetch: DEFAULT_FETCH
  //////////////////////////////////////////////////////
};
function isEmpty(obj) {
  return Object.keys(obj).length === 0;
}
/*!
 * ONNX Runtime Web v1.31.0-dev.20260914-8d85527a0
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
var qt = Object.defineProperty;
var Qa = Object.getOwnPropertyDescriptor;
var Ka = Object.getOwnPropertyNames;
var es = Object.prototype.hasOwnProperty;
var Jt = ((n) => typeof require < "u" ? require : typeof Proxy < "u" ? new Proxy(n, { get: (t, a) => (typeof require < "u" ? require : t)[a] }) : n)(function(n) {
  if (typeof require < "u") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + n + '" is not supported');
});
var N = (n, t, a) => () => {
  if (a) throw a[0];
  try {
    return n && (t = n(n = 0)), t;
  } catch (u) {
    throw a = [u], u;
  }
};
var ut = (n, t) => {
  for (var a in t) qt(n, a, { get: t[a], enumerable: true });
}, ts = (n, t, a, u) => {
  if (t && typeof t == "object" || typeof t == "function") for (let o of Ka(t)) !es.call(n, o) && o !== a && qt(n, o, { get: () => t[o], enumerable: !(u = Qa(t, o)) || u.enumerable });
  return n;
};
var Xt = (n) => ts(qt({}, "__esModule", { value: true }), n);
var ft, Be, Je, ns, pr, Zt = N(() => {
  "use strict";
  ft = /* @__PURE__ */ new Map(), Be = [], Je = (n, t, a) => {
    if (t && typeof t.init == "function" && typeof t.createInferenceSessionHandler == "function") {
      let u = ft.get(n);
      if (u === void 0) ft.set(n, { backend: t, priority: a });
      else {
        if (u.priority > a) return;
        if (u.priority === a && u.backend !== t) throw new Error(`cannot register backend "${n}" using priority ${a}`);
      }
      if (a >= 0) {
        let o = Be.indexOf(n);
        o !== -1 && Be.splice(o, 1);
        for (let d = 0; d < Be.length; d++) if (ft.get(Be[d]).priority <= a) {
          Be.splice(d, 0, n);
          return;
        }
        Be.push(n);
      }
      return;
    }
    throw new TypeError("not a valid backend");
  }, ns = async (n) => {
    let t = ft.get(n);
    if (!t) return "backend not found.";
    if (t.initialized) return t.backend;
    if (t.aborted) return t.error;
    {
      let a = !!t.initPromise;
      try {
        return a || (t.initPromise = t.backend.init(n)), await t.initPromise, t.initialized = true, t.backend;
      } catch (u) {
        return a || (t.error = `${u}`, t.aborted = true), t.error;
      } finally {
        delete t.initPromise;
      }
    }
  }, pr = async (n) => {
    let t = n.executionProviders || [], a = t.map((m) => typeof m == "string" ? m : m.name), u = a.length === 0 ? Be : a, o, d = [], c = /* @__PURE__ */ new Set();
    for (let m of u) {
      let h = await ns(m);
      typeof h == "string" ? d.push({ name: m, err: h }) : (o || (o = h), o === h && c.add(m));
    }
    if (!o) throw new Error(`no available backend found. ERR: ${d.map((m) => `[${m.name}] ${m.err}`).join(", ")}`);
    for (let { name: m, err: h } of d) a.includes(m) && console.warn(`removing requested execution provider "${m}" from session options because it is not available: ${h}`);
    let l = t.filter((m) => c.has(typeof m == "string" ? m : m.name));
    return [o, new Proxy(n, { get: (m, h) => h === "executionProviders" ? l : Reflect.get(m, h) })];
  };
});
var mr = N(() => {
  "use strict";
  Zt();
});
var hr, wr = N(() => {
  "use strict";
  hr = "1.31.0-dev.20260911-2a43ec07e";
});
var br, q, Qt = N(() => {
  "use strict";
  wr();
  br = "warning", q = { wasm: {}, webgl: {}, webgpu: {}, versions: { common: hr }, set logLevel(n) {
    if (n !== void 0) {
      if (typeof n != "string" || ["verbose", "info", "warning", "error", "fatal"].indexOf(n) === -1) throw new Error(`Unsupported logging level: ${n}`);
      br = n;
    }
  }, get logLevel() {
    return br;
  } };
  Object.defineProperty(q, "logLevel", { enumerable: true });
});
var Y, yr = N(() => {
  "use strict";
  Qt();
  Y = q;
});
var gr, Er, Tr = N(() => {
  "use strict";
  gr = (n, t) => {
    let a = typeof document < "u" ? document.createElement("canvas") : new OffscreenCanvas(1, 1);
    a.width = n.dims[3], a.height = n.dims[2];
    let u = a.getContext("2d");
    if (u != null) {
      let o, d;
      t?.tensorLayout !== void 0 && t.tensorLayout === "NHWC" ? (o = n.dims[2], d = n.dims[3]) : (o = n.dims[3], d = n.dims[2]);
      let c = t?.format !== void 0 ? t.format : "RGB", l = t?.norm, m, h;
      l === void 0 || l.mean === void 0 ? m = [255, 255, 255, 255] : typeof l.mean == "number" ? m = [l.mean, l.mean, l.mean, l.mean] : (m = [l.mean[0], l.mean[1], l.mean[2], 0], l.mean[3] !== void 0 && (m[3] = l.mean[3])), l === void 0 || l.bias === void 0 ? h = [0, 0, 0, 0] : typeof l.bias == "number" ? h = [l.bias, l.bias, l.bias, l.bias] : (h = [l.bias[0], l.bias[1], l.bias[2], 0], l.bias[3] !== void 0 && (h[3] = l.bias[3]));
      let g = d * o, b = 0, y = g, T = g * 2, I = -1;
      c === "RGBA" ? (b = 0, y = g, T = g * 2, I = g * 3) : c === "RGB" ? (b = 0, y = g, T = g * 2) : c === "RBG" && (b = 0, T = g, y = g * 2);
      for (let D = 0; D < d; D++) for (let $ = 0; $ < o; $++) {
        let v = (n.data[b++] - h[0]) * m[0], A = (n.data[y++] - h[1]) * m[1], F = (n.data[T++] - h[2]) * m[2], P = I === -1 ? 255 : (n.data[I++] - h[3]) * m[3];
        u.fillStyle = "rgba(" + v + "," + A + "," + F + "," + P + ")", u.fillRect($, D, 1, 1);
      }
      if ("toDataURL" in a) return a.toDataURL();
      throw new Error("toDataURL is not supported");
    } else throw new Error("Can not access image data");
  }, Er = (n, t) => {
    let a = typeof document < "u" ? document.createElement("canvas").getContext("2d") : new OffscreenCanvas(1, 1).getContext("2d"), u;
    if (a != null) {
      let o, d, c;
      t?.tensorLayout !== void 0 && t.tensorLayout === "NHWC" ? (o = n.dims[2], d = n.dims[1], c = n.dims[3]) : (o = n.dims[3], d = n.dims[2], c = n.dims[1]);
      let l = t !== void 0 && t.format !== void 0 ? t.format : "RGB", m = t?.norm, h, g;
      m === void 0 || m.mean === void 0 ? h = [255, 255, 255, 255] : typeof m.mean == "number" ? h = [m.mean, m.mean, m.mean, m.mean] : (h = [m.mean[0], m.mean[1], m.mean[2], 255], m.mean[3] !== void 0 && (h[3] = m.mean[3])), m === void 0 || m.bias === void 0 ? g = [0, 0, 0, 0] : typeof m.bias == "number" ? g = [m.bias, m.bias, m.bias, m.bias] : (g = [m.bias[0], m.bias[1], m.bias[2], 0], m.bias[3] !== void 0 && (g[3] = m.bias[3]));
      let b = d * o;
      if (t !== void 0 && (t.format !== void 0 && c === 4 && t.format !== "RGBA" || c === 3 && t.format !== "RGB" && t.format !== "BGR")) throw new Error("Tensor format doesn't match input tensor dims");
      let y = 4, T = 0, I = 1, D = 2, $ = 3, v = 0, A = b, F = b * 2, P = -1;
      l === "RGBA" ? (v = 0, A = b, F = b * 2, P = b * 3) : l === "RGB" ? (v = 0, A = b, F = b * 2) : l === "RBG" && (v = 0, F = b, A = b * 2), u = a.createImageData(o, d);
      for (let k = 0; k < d * o; T += y, I += y, D += y, $ += y, k++) u.data[T] = (n.data[v++] - g[0]) * h[0], u.data[I] = (n.data[A++] - g[1]) * h[1], u.data[D] = (n.data[F++] - g[2]) * h[2], u.data[$] = P === -1 ? 255 : (n.data[P++] - g[3]) * h[3];
    } else throw new Error("Can not access image data");
    return u;
  };
});
var Kt, Sr, vr, Ar, Or, Ir, Br = N(() => {
  "use strict";
  ct();
  Kt = (n, t) => {
    if (n === void 0) throw new Error("Image buffer must be defined");
    if (t.height === void 0 || t.width === void 0) throw new Error("Image height and width must be defined");
    if (t.tensorLayout === "NHWC") throw new Error("NHWC Tensor layout is not supported yet");
    let { height: a, width: u } = t, o = t.norm ?? { mean: 255, bias: 0 }, d, c;
    typeof o.mean == "number" ? d = [o.mean, o.mean, o.mean, o.mean] : d = [o.mean[0], o.mean[1], o.mean[2], o.mean[3] ?? 255], typeof o.bias == "number" ? c = [o.bias, o.bias, o.bias, o.bias] : c = [o.bias[0], o.bias[1], o.bias[2], o.bias[3] ?? 0];
    let l = t.format !== void 0 ? t.format : "RGBA", m = t.tensorFormat !== void 0 && t.tensorFormat !== void 0 ? t.tensorFormat : "RGB", h = a * u, g = m === "RGBA" ? new Float32Array(h * 4) : new Float32Array(h * 3), b = 4, y = 0, T = 1, I = 2, D = 3, $ = 0, v = h, A = h * 2, F = -1;
    l === "RGB" && (b = 3, y = 0, T = 1, I = 2, D = -1), m === "RGBA" ? F = h * 3 : m === "RBG" ? ($ = 0, A = h, v = h * 2) : m === "BGR" && (A = 0, v = h, $ = h * 2);
    for (let k = 0; k < h; k++, y += b, I += b, T += b, D += b) g[$++] = (n[y] + c[0]) / d[0], g[v++] = (n[T] + c[1]) / d[1], g[A++] = (n[I] + c[2]) / d[2], F !== -1 && D !== -1 && (g[F++] = (n[D] + c[3]) / d[3]);
    return m === "RGBA" ? new Z("float32", g, [1, 4, a, u]) : new Z("float32", g, [1, 3, a, u]);
  }, Sr = async (n, t) => {
    let a = typeof HTMLImageElement < "u" && n instanceof HTMLImageElement, u = typeof ImageData < "u" && n instanceof ImageData, o = typeof ImageBitmap < "u" && n instanceof ImageBitmap, d = typeof n == "string", c, l = t ?? {}, m = () => {
      if (typeof document < "u") return document.createElement("canvas");
      if (typeof OffscreenCanvas < "u") return new OffscreenCanvas(1, 1);
      throw new Error("Canvas is not supported");
    }, h = (g) => typeof HTMLCanvasElement < "u" && g instanceof HTMLCanvasElement || g instanceof OffscreenCanvas ? g.getContext("2d") : null;
    if (a) {
      let g = m();
      g.width = n.width, g.height = n.height;
      let b = h(g);
      if (b != null) {
        let y = n.height, T = n.width;
        if (t !== void 0 && t.resizedHeight !== void 0 && t.resizedWidth !== void 0 && (y = t.resizedHeight, T = t.resizedWidth), t !== void 0) {
          if (l = t, t.tensorFormat !== void 0) throw new Error("Image input config format must be RGBA for HTMLImageElement");
          l.tensorFormat = "RGBA", l.height = y, l.width = T;
        } else l.tensorFormat = "RGBA", l.height = y, l.width = T;
        b.drawImage(n, 0, 0), c = b.getImageData(0, 0, T, y).data;
      } else throw new Error("Can not access image data");
    } else if (u) {
      let g, b;
      if (t !== void 0 && t.resizedWidth !== void 0 && t.resizedHeight !== void 0 ? (g = t.resizedHeight, b = t.resizedWidth) : (g = n.height, b = n.width), t !== void 0 && (l = t), l.format = "RGBA", l.height = g, l.width = b, t !== void 0) {
        let y = m();
        y.width = b, y.height = g;
        let T = h(y);
        if (T != null) T.putImageData(n, 0, 0), c = T.getImageData(0, 0, b, g).data;
        else throw new Error("Can not access image data");
      } else c = n.data;
    } else if (o) {
      if (t === void 0) throw new Error("Please provide image config with format for Imagebitmap");
      let g = m();
      g.width = n.width, g.height = n.height;
      let b = h(g);
      if (b != null) {
        let y = n.height, T = n.width;
        return b.drawImage(n, 0, 0, T, y), c = b.getImageData(0, 0, T, y).data, l.height = y, l.width = T, Kt(c, l);
      } else throw new Error("Can not access image data");
    } else {
      if (d) return new Promise((g, b) => {
        let y = m(), T = h(y);
        if (!n || !T) return b();
        let I = new Image();
        I.crossOrigin = "Anonymous", I.src = n, I.onload = () => {
          y.width = I.width, y.height = I.height, T.drawImage(I, 0, 0, y.width, y.height);
          let D = T.getImageData(0, 0, y.width, y.height);
          l.height = y.height, l.width = y.width, g(Kt(D.data, l));
        };
      });
      throw new Error("Input data provided is not supported - aborted tensor creation");
    }
    if (c !== void 0) return Kt(c, l);
    throw new Error("Input data provided is not supported - aborted tensor creation");
  }, vr = (n, t) => {
    let { width: a, height: u, download: o, dispose: d } = t, c = [1, u, a, 4];
    return new Z({ location: "texture", type: "float32", texture: n, dims: c, download: o, dispose: d });
  }, Ar = (n, t) => {
    let { dataType: a, dims: u, download: o, dispose: d } = t;
    return new Z({ location: "gpu-buffer", type: a ?? "float32", gpuBuffer: n, dims: u, download: o, dispose: d });
  }, Or = (n, t) => {
    let { dataType: a, dims: u, download: o, dispose: d } = t;
    return new Z({ location: "ml-tensor", type: a ?? "float32", mlTensor: n, dims: u, download: o, dispose: d });
  }, Ir = (n, t, a) => new Z({ location: "cpu-pinned", type: n, data: t, dims: a ?? [t.length] });
});
var Le, Xe, Lr, _r, Dr = N(() => {
  "use strict";
  Le = /* @__PURE__ */ new Map([["float32", Float32Array], ["uint8", Uint8Array], ["int8", Int8Array], ["uint16", Uint16Array], ["int16", Int16Array], ["int32", Int32Array], ["bool", Uint8Array], ["float64", Float64Array], ["uint32", Uint32Array], ["int4", Uint8Array], ["uint4", Uint8Array]]), Xe = /* @__PURE__ */ new Map([[Float32Array, "float32"], [Uint8Array, "uint8"], [Int8Array, "int8"], [Uint16Array, "uint16"], [Int16Array, "int16"], [Int32Array, "int32"], [Float64Array, "float64"], [Uint32Array, "uint32"]]), Lr = false, _r = () => {
    if (!Lr) {
      Lr = true;
      let n = typeof BigInt64Array < "u" && BigInt64Array.from, t = typeof BigUint64Array < "u" && BigUint64Array.from, a = globalThis.Float16Array, u = typeof a < "u" && a.from;
      n && (Le.set("int64", BigInt64Array), Xe.set(BigInt64Array, "int64")), t && (Le.set("uint64", BigUint64Array), Xe.set(BigUint64Array, "uint64")), u ? (Le.set("float16", a), Xe.set(a, "float16")) : Le.set("float16", Uint16Array);
    }
  };
});
var Pr, Ur, xr = N(() => {
  "use strict";
  ct();
  Pr = (n) => {
    let t = 1;
    for (let a = 0; a < n.length; a++) {
      let u = n[a];
      if (typeof u != "number" || !Number.isSafeInteger(u)) throw new TypeError(`dims[${a}] must be an integer, got: ${u}`);
      if (u < 0) throw new RangeError(`dims[${a}] must be a non-negative integer, got: ${u}`);
      t *= u;
    }
    return t;
  }, Ur = (n, t) => {
    switch (n.location) {
      case "cpu":
        return new Z(n.type, n.data, t);
      case "cpu-pinned":
        return new Z({ location: "cpu-pinned", data: n.data, type: n.type, dims: t });
      case "texture":
        return new Z({ location: "texture", texture: n.texture, type: n.type, dims: t });
      case "gpu-buffer":
        return new Z({ location: "gpu-buffer", gpuBuffer: n.gpuBuffer, type: n.type, dims: t });
      case "ml-tensor":
        return new Z({ location: "ml-tensor", mlTensor: n.mlTensor, type: n.type, dims: t });
      default:
        throw new Error(`tensorReshape: tensor location ${n.location} is not supported`);
    }
  };
});
var Z, ct = N(() => {
  "use strict";
  Tr();
  Br();
  Dr();
  xr();
  Z = class {
    constructor(t, a, u) {
      _r();
      let o, d;
      if (typeof t == "object" && "location" in t) switch (this.dataLocation = t.location, o = t.type, d = t.dims, t.location) {
        case "cpu-pinned": {
          let l = Le.get(o);
          if (!l) throw new TypeError(`unsupported type "${o}" to create tensor from pinned buffer`);
          if (!(t.data instanceof l)) throw new TypeError(`buffer should be of type ${l.name}`);
          this.cpuData = t.data;
          break;
        }
        case "texture": {
          if (o !== "float32") throw new TypeError(`unsupported type "${o}" to create tensor from texture`);
          this.gpuTextureData = t.texture, this.downloader = t.download, this.disposer = t.dispose;
          break;
        }
        case "gpu-buffer": {
          if (o !== "float32" && o !== "float16" && o !== "int32" && o !== "int64" && o !== "uint32" && o !== "uint8" && o !== "bool" && o !== "uint4" && o !== "int4") throw new TypeError(`unsupported type "${o}" to create tensor from gpu buffer`);
          this.gpuBufferData = t.gpuBuffer, this.downloader = t.download, this.disposer = t.dispose;
          break;
        }
        case "ml-tensor": {
          if (o !== "float32" && o !== "float16" && o !== "int32" && o !== "int64" && o !== "uint32" && o !== "uint64" && o !== "int8" && o !== "uint8" && o !== "bool" && o !== "uint4" && o !== "int4") throw new TypeError(`unsupported type "${o}" to create tensor from MLTensor`);
          this.mlTensorData = t.mlTensor, this.downloader = t.download, this.disposer = t.dispose;
          break;
        }
        default:
          throw new Error(`Tensor constructor: unsupported location '${this.dataLocation}'`);
      }
      else {
        let l, m;
        if (typeof t == "string") if (o = t, m = u, t === "string") {
          if (!Array.isArray(a)) throw new TypeError("A string tensor's data must be a string array.");
          l = a;
        } else {
          let h = Le.get(t);
          if (h === void 0) throw new TypeError(`Unsupported tensor type: ${t}.`);
          if (Array.isArray(a)) {
            if (t === "float16" && h === Uint16Array || t === "uint4" || t === "int4") throw new TypeError(`Creating a ${t} tensor from number array is not supported. Please use ${h.name} as data.`);
            t === "uint64" || t === "int64" ? l = h.from(a, BigInt) : l = h.from(a);
          } else if (a instanceof h) l = a;
          else if (a instanceof Uint8ClampedArray) if (t === "uint8") l = Uint8Array.from(a);
          else throw new TypeError("A Uint8ClampedArray tensor's data must be type of uint8");
          else if (t === "float16" && a instanceof Uint16Array && h !== Uint16Array) l = new globalThis.Float16Array(a.buffer, a.byteOffset, a.length);
          else throw new TypeError(`A ${o} tensor's data must be type of ${h}`);
        }
        else if (m = a, Array.isArray(t)) {
          if (t.length === 0) throw new TypeError("Tensor type cannot be inferred from an empty array.");
          let h = typeof t[0];
          if (h === "string") o = "string", l = t;
          else if (h === "boolean") o = "bool", l = Uint8Array.from(t);
          else throw new TypeError(`Invalid element type of data array: ${h}.`);
        } else if (t instanceof Uint8ClampedArray) o = "uint8", l = Uint8Array.from(t);
        else {
          let h = Xe.get(t.constructor);
          if (h === void 0) throw new TypeError(`Unsupported type for tensor data: ${t.constructor}.`);
          o = h, l = t;
        }
        if (m === void 0) m = [l.length];
        else if (!Array.isArray(m)) throw new TypeError("A tensor's dims must be a number array");
        d = m, this.cpuData = l, this.dataLocation = "cpu";
      }
      let c = Pr(d);
      if (this.cpuData && c !== this.cpuData.length && !((o === "uint4" || o === "int4") && Math.ceil(c / 2) === this.cpuData.length)) throw new Error(`Tensor's size(${c}) does not match data length(${this.cpuData.length}).`);
      this.type = o, this.dims = d, this.size = c;
    }
    static async fromImage(t, a) {
      return Sr(t, a);
    }
    static fromTexture(t, a) {
      return vr(t, a);
    }
    static fromGpuBuffer(t, a) {
      return Ar(t, a);
    }
    static fromMLTensor(t, a) {
      return Or(t, a);
    }
    static fromPinnedBuffer(t, a, u) {
      return Ir(t, a, u);
    }
    toDataURL(t) {
      return gr(this, t);
    }
    toImageData(t) {
      return Er(this, t);
    }
    get data() {
      if (this.ensureValid(), !this.cpuData) throw new Error("The data is not on CPU. Use `getData()` to download GPU data to CPU, or use `texture` or `gpuBuffer` property to access the GPU data directly.");
      return this.cpuData;
    }
    get location() {
      return this.dataLocation;
    }
    get texture() {
      if (this.ensureValid(), !this.gpuTextureData) throw new Error("The data is not stored as a WebGL texture.");
      return this.gpuTextureData;
    }
    get gpuBuffer() {
      if (this.ensureValid(), !this.gpuBufferData) throw new Error("The data is not stored as a WebGPU buffer.");
      return this.gpuBufferData;
    }
    get mlTensor() {
      if (this.ensureValid(), !this.mlTensorData) throw new Error("The data is not stored as a WebNN MLTensor.");
      return this.mlTensorData;
    }
    async getData(t) {
      switch (this.ensureValid(), this.dataLocation) {
        case "cpu":
        case "cpu-pinned":
          return this.data;
        case "texture":
        case "gpu-buffer":
        case "ml-tensor": {
          if (!this.downloader) throw new Error("The current tensor is not created with a specified data downloader.");
          if (this.isDownloading) throw new Error("The current tensor is being downloaded.");
          try {
            this.isDownloading = true;
            let a = await this.downloader();
            return this.downloader = void 0, this.dataLocation = "cpu", this.cpuData = a, t && this.disposer && (this.disposer(), this.disposer = void 0), a;
          } finally {
            this.isDownloading = false;
          }
        }
        default:
          throw new Error(`cannot get data from location: ${this.dataLocation}`);
      }
    }
    dispose() {
      if (this.isDownloading) throw new Error("The current tensor is being downloaded.");
      this.disposer && (this.disposer(), this.disposer = void 0), this.cpuData = void 0, this.gpuTextureData = void 0, this.gpuBufferData = void 0, this.mlTensorData = void 0, this.downloader = void 0, this.isDownloading = void 0, this.dataLocation = "none";
    }
    ensureValid() {
      if (this.dataLocation === "none") throw new Error("The tensor is disposed.");
    }
    reshape(t) {
      if (this.ensureValid(), this.downloader || this.disposer) throw new Error("Cannot reshape a tensor that owns GPU resource.");
      return Ur(this, t);
    }
  };
});
var de, en = N(() => {
  "use strict";
  ct();
  de = Z;
});
var Cr, Mr, _e, De, Pe, Ue, tn = N(() => {
  "use strict";
  Qt();
  Cr = (n, t) => {
    (typeof q.trace > "u" ? !q.wasm.trace : !q.trace) || console.timeStamp(`${n}::ORT::${t}`);
  }, Mr = (n, t) => {
    let a = new Error().stack?.split(/\r\n|\r|\n/g) || [], u = false;
    for (let o = 0; o < a.length; o++) {
      if (u && !a[o].includes("TRACE_FUNC")) {
        let d = `FUNC_${n}::${a[o].trim().split(" ")[1]}`;
        t && (d += `::${t}`), Cr("CPU", d);
        return;
      }
      a[o].includes("TRACE_FUNC") && (u = true);
    }
  }, _e = (n) => {
    (typeof q.trace > "u" ? !q.wasm.trace : !q.trace) || Mr("BEGIN", n);
  }, De = (n) => {
    (typeof q.trace > "u" ? !q.wasm.trace : !q.trace) || Mr("END", n);
  }, Pe = (n) => {
    (typeof q.trace > "u" ? !q.wasm.trace : !q.trace) || console.time(`ORT::${n}`);
  }, Ue = (n) => {
    (typeof q.trace > "u" ? !q.wasm.trace : !q.trace) || console.timeEnd(`ORT::${n}`);
  };
});
var lt, Rr = N(() => {
  "use strict";
  Zt();
  en();
  tn();
  lt = class n {
    constructor(t) {
      this.handler = t;
    }
    async run(t, a, u) {
      _e(), Pe("InferenceSession.run");
      let o = {}, d = {};
      if (typeof t != "object" || t === null || t instanceof de || Array.isArray(t)) throw new TypeError("'feeds' must be an object that use input names as keys and OnnxValue as corresponding values.");
      let c = true;
      if (typeof a == "object") {
        if (a === null) throw new TypeError("Unexpected argument[1]: cannot be null.");
        if (a instanceof de) throw new TypeError("'fetches' cannot be a Tensor");
        if (Array.isArray(a)) {
          if (a.length === 0) throw new TypeError("'fetches' cannot be an empty array.");
          c = false;
          for (let h of a) {
            if (typeof h != "string") throw new TypeError("'fetches' must be a string array or an object.");
            if (this.outputNames.indexOf(h) === -1) throw new RangeError(`'fetches' contains invalid output name: ${h}.`);
            o[h] = null;
          }
          if (typeof u == "object" && u !== null) d = u;
          else if (typeof u < "u") throw new TypeError("'options' must be an object.");
        } else {
          let h = false, g = Object.getOwnPropertyNames(a);
          for (let b of this.outputNames) if (g.indexOf(b) !== -1) {
            let y = a[b];
            (y === null || y instanceof de) && (h = true, c = false, o[b] = y);
          }
          if (h) {
            if (typeof u == "object" && u !== null) d = u;
            else if (typeof u < "u") throw new TypeError("'options' must be an object.");
          } else d = a;
        }
      } else if (typeof a < "u") throw new TypeError("Unexpected argument[1]: must be 'fetches' or 'options'.");
      for (let h of this.inputNames) if (typeof t[h] > "u") throw new Error(`input '${h}' is missing in 'feeds'.`);
      if (c) for (let h of this.outputNames) o[h] = null;
      let l = await this.handler.run(t, o, d), m = {};
      for (let h in l) if (Object.hasOwnProperty.call(l, h)) {
        let g = l[h];
        g instanceof de ? m[h] = g : m[h] = new de(g.type, g.data, g.dims);
      }
      return Ue("InferenceSession.run"), De(), m;
    }
    async release() {
      return this.handler.dispose();
    }
    static async create(t, a, u, o) {
      _e(), Pe("InferenceSession.create");
      let d, c = {};
      if (typeof t == "string") {
        if (d = t, typeof a == "object" && a !== null) c = a;
        else if (typeof a < "u") throw new TypeError("'options' must be an object.");
      } else if (t instanceof Uint8Array) {
        if (d = t, typeof a == "object" && a !== null) c = a;
        else if (typeof a < "u") throw new TypeError("'options' must be an object.");
      } else if (t instanceof ArrayBuffer || typeof SharedArrayBuffer < "u" && t instanceof SharedArrayBuffer) {
        let g = t, b = 0, y = t.byteLength;
        if (typeof a == "object" && a !== null) c = a;
        else if (typeof a == "number") {
          if (b = a, !Number.isSafeInteger(b)) throw new RangeError("'byteOffset' must be an integer.");
          if (b < 0 || b >= g.byteLength) throw new RangeError(`'byteOffset' is out of range [0, ${g.byteLength}).`);
          if (y = t.byteLength - b, typeof u == "number") {
            if (y = u, !Number.isSafeInteger(y)) throw new RangeError("'byteLength' must be an integer.");
            if (y <= 0 || b + y > g.byteLength) throw new RangeError(`'byteLength' is out of range (0, ${g.byteLength - b}].`);
            if (typeof o == "object" && o !== null) c = o;
            else if (typeof o < "u") throw new TypeError("'options' must be an object.");
          } else if (typeof u < "u") throw new TypeError("'byteLength' must be a number.");
        } else if (typeof a < "u") throw new TypeError("'options' must be an object.");
        d = new Uint8Array(g, b, y);
      } else throw new TypeError("Unexpected argument[0]: must be 'path' or 'buffer'.");
      let [l, m] = await pr(c), h = await l.createInferenceSessionHandler(d, m);
      return Ue("InferenceSession.create"), De(), new n(h);
    }
    startProfiling() {
      this.handler.startProfiling();
    }
    endProfiling() {
      this.handler.endProfiling();
    }
    get inputNames() {
      return this.handler.inputNames;
    }
    get outputNames() {
      return this.handler.outputNames;
    }
    get inputMetadata() {
      return this.handler.inputMetadata;
    }
    get outputMetadata() {
      return this.handler.outputMetadata;
    }
  };
});
var rs, Fr = N(() => {
  "use strict";
  Rr();
  rs = lt;
});
var Nr = N(() => {
  "use strict";
});
var kr = N(() => {
  "use strict";
});
var Wr = N(() => {
  "use strict";
});
var Gr = N(() => {
  "use strict";
});
var nn = {};
ut(nn, { InferenceSession: () => rs, TRACE: () => Cr, TRACE_EVENT_BEGIN: () => Pe, TRACE_EVENT_END: () => Ue, TRACE_FUNC_BEGIN: () => _e, TRACE_FUNC_END: () => De, Tensor: () => de, env: () => Y, registerBackend: () => Je });
var Te = N(() => {
  "use strict";
  mr();
  yr();
  Fr();
  en();
  Nr();
  kr();
  tn();
  Wr();
  Gr();
});
var dt = N(() => {
  "use strict";
});
var jr = {};
ut(jr, { default: () => os });
var zr, Hr, os, Vr = N(() => {
  "use strict";
  rn();
  xe();
  pt();
  zr = "ort-wasm-proxy-worker", Hr = globalThis.self?.name === zr;
  Hr && (self.onmessage = (n) => {
    let { type: t, in: a } = n.data;
    try {
      switch (t) {
        case "init-wasm":
          mt(a.wasm).then(() => {
            ht(a).then(() => {
              postMessage({ type: t });
            }, (u) => {
              postMessage({ type: t, err: u });
            });
          }, (u) => {
            postMessage({ type: t, err: u });
          });
          break;
        case "init-ep": {
          let { epName: u, env: o } = a;
          wt(o, u).then(() => {
            postMessage({ type: t });
          }, (d) => {
            postMessage({ type: t, err: d });
          });
          break;
        }
        case "copy-from": {
          let { buffer: u } = a, o = Ze(u);
          postMessage({ type: t, out: o });
          break;
        }
        case "create": {
          let { model: u, options: o } = a;
          bt(u, o).then((d) => {
            postMessage({ type: t, out: d });
          }, (d) => {
            postMessage({ type: t, err: d });
          });
          break;
        }
        case "release":
          yt(a), postMessage({ type: t });
          break;
        case "run": {
          let { sessionId: u, inputIndices: o, inputs: d, outputIndices: c, options: l } = a;
          gt(u, o, d, c, new Array(c.length).fill(null), l).then((m) => {
            m.some((h) => h[3] !== "cpu") ? postMessage({ type: t, err: "Proxy does not support non-cpu tensor location." }) : postMessage({ type: t, out: m }, Tt([...d, ...m]));
          }, (m) => {
            postMessage({ type: t, err: m });
          });
          break;
        }
        case "end-profiling":
          Et(a), postMessage({ type: t });
          break;
        default:
      }
    } catch (u) {
      postMessage({ type: t, err: u });
    }
  });
  os = Hr ? null : (n) => new Worker(n ?? oe, { type: "module", name: zr });
});
var qr = {};
ut(qr, { default: () => as });
async function Yr(n = {}) {
  var t = n, a = !!globalThis.window, u = !!globalThis.WorkerGlobalScope, o = u && self.name?.startsWith("em-pthread");
  t.mountExternalData = (e, r) => {
    e.startsWith("./") && (e = e.substring(2)), (t.Tb || (t.Tb = /* @__PURE__ */ new Map())).set(e, r);
  }, t.unmountExternalData = () => {
    delete t.Tb, delete t.mc, delete t.lc, delete t.nc;
  }, globalThis.SharedArrayBuffer ?? new WebAssembly.Memory({ initial: 0, maximum: 0, shared: true }).buffer.constructor;
  var d, c, l = (e, r) => {
    throw r;
  }, m = import.meta.url, h = "";
  if (a || u) {
    try {
      h = new URL(".", m).href;
    } catch {
    }
    u && (c = (e) => {
      var r = new XMLHttpRequest();
      return r.open("GET", e, false), r.responseType = "arraybuffer", r.send(null), new Uint8Array(r.response);
    }), d = async (e) => {
      if (k(e)) return new Promise((i, s) => {
        var f = new XMLHttpRequest();
        f.open("GET", e, true), f.responseType = "arraybuffer", f.onload = () => {
          f.status == 200 || f.status == 0 && f.response ? i(f.response) : s(f.status);
        }, f.onerror = s, f.send(null);
      });
      var r = await fetch(e, { credentials: "same-origin" });
      if (r.ok) return r.arrayBuffer();
      throw Error(r.status + " : " + r.url);
    };
  }
  var g, b, y, T, I, D, $ = console.log.bind(console), v = console.error.bind(console), A = $, F = v, P = false, k = (e) => e.startsWith("file://");
  function w() {
    ge.buffer != H.buffer && ee();
  }
  if (o) {
    let e = function(r) {
      try {
        var i = r.data, s = i.Rb;
        if (s === "load") {
          let f = [];
          self.onmessage = (p) => f.push(p), D = () => {
            postMessage({ Rb: "loaded" });
            for (let p of f) e(p);
            self.onmessage = e;
          };
          for (let p of i.ac) t[p] && !t[p].proxy || (t[p] = (...E) => {
            postMessage({ Rb: "callHandler", $b: p, args: E });
          }, p == "print" && (A = t[p]), p == "printErr" && (F = t[p]));
          ge = i.fc, ee(), b = i.hc, Ut(), it();
        } else if (s === "run") {
          (function(f) {
            var p = (w(), W)[f + 52 >>> 2 >>> 0];
            f = (w(), W)[f + 56 >>> 2 >>> 0], ir(p, p - f), _(p);
          })(i.Qb), zt(i.Qb, 0, 0, 1, 0, 0), wn(), Ft(i.Qb), Q ||= true;
          try {
            Io(i.dc, i.Vb);
          } catch (f) {
            if (f != "unwind") throw f;
          }
        } else i.target !== "setimmediate" && (s === "checkMailbox" ? Q && rt() : s && (F(`worker: received unknown command ${s}`), F(i)));
      } catch (f) {
        throw nr(), f;
      }
    };
    var Q = false;
    self.onunhandledrejection = (r) => {
      throw r.reason || r;
    }, self.onmessage = e;
  }
  var H, ne, pe, B, W, re, me, O, K, je = false;
  function ee() {
    var e = ge.buffer;
    t.HEAP8 = H = new Int8Array(e), pe = new Int16Array(e), t.HEAPU8 = ne = new Uint8Array(e), t.HEAP32 = B = new Int32Array(e), t.HEAPU32 = W = new Uint32Array(e), re = new Float32Array(e), me = new Float64Array(e), O = new BigInt64Array(e), new BigUint64Array(e);
  }
  function he() {
    je = true, o ? D() : Ee.Va();
  }
  function j(e) {
    throw F(e = "Aborted(" + e + ")"), P = true, e = new WebAssembly.RuntimeError(e + ". Build with -sASSERTIONS for more info."), I?.(e), e;
  }
  function J() {
    return { a: { T: ca, f: Bo, w: Lo, e: _o, k: Do, h: Po, L: Uo, b: xo, G: Co, ua: vn, j: Mo, M: In, La: Bn, qa: Ln, sa: _n, Ma: Dn, Ja: Pn, Ca: Un, Ia: xn, Z: Cn, ra: Mn, oa: Rn, Ka: Fn, pa: Nn, Ra: Ro, Fa: Fo, ma: ko, va: Wo, ja: Go, U: $o, Ea: Ft, Oa: zo, za: Ho, Aa: jo, Ba: Vo, xa: $n, ya: zn, ka: Hn, Ta: qo, Qa: Zo, W: Qo, V: Ko, Pa: Jo, F: ea, Na: ta, na, u: Yo, H: ra, S: at, la: aa, ba: oa, Ua: sa, Ga: Yn, Ha: qn, ta: ye, I: Jn, wa: Xn, Y: Zn, Da: Qn, X: Kn, $: Ya, N: $a, aa: Va, O: Ga, v: Da, d: ma, m: da, n: la, r: Aa, ca: Na, E: Fa, o: ba, P: ka, C: za, J: Ra, da: Ma, ea: Ca, z: Oa, fa: Ua, Q: xa, ga: Pa, y: La, D: Wa, c: pa, q: wa, i: ha, _: qa, l: ga, p: Ea, s: ya, t: Ta, x: Ia, R: _a, A: Ha, K: Ba, B: ja, ha: va, ia: Sa, g: ua, a: ge, Sa: V } };
  }
  async function Ut() {
    function e(s, f) {
      return Ee = s.exports, Ee = (function() {
        var p = Ee, E = (C) => () => C() >>> 0, S = (C) => (R) => C(R) >>> 0;
        return (p = Object.assign({}, p)).ub = E(p.ub), p.wb = S(p.wb), p.Kb = S(p.Kb), p.Lb = E(p.Lb), p.Pb = S(p.Pb), p;
      })(), mn.push(Ee.xb), s = Ee, t._OrtInit = s.Wa, t._OrtGetLastError = s.Xa, t._OrtCreateSessionOptions = s.Ya, t._OrtAppendExecutionProvider = s.Za, t._OrtAddFreeDimensionOverride = s._a, t._OrtAddSessionConfigEntry = s.$a, t._OrtReleaseSessionOptions = s.ab, t._OrtCreateSession = s.bb, t._OrtReleaseSession = s.cb, t._OrtGetInputOutputCount = s.db, t._OrtGetInputOutputMetadata = s.eb, t._OrtFree = s.fb, t._OrtCreateTensor = s.gb, t._OrtGetTensorData = s.hb, t._OrtReleaseTensor = s.ib, t._OrtCreateRunOptions = s.jb, t._OrtAddRunConfigEntry = s.kb, t._OrtReleaseRunOptions = s.lb, t._OrtCreateBinding = s.mb, t._OrtBindInput = s.nb, t._OrtBindOutput = s.ob, t._OrtClearBoundOutputs = s.pb, t._OrtReleaseBinding = s.qb, t._OrtRunWithBinding = s.rb, t._OrtRun = s.sb, t._OrtEndProfiling = s.tb, st = s.ub, er = t._free = s.vb, tr = t._malloc = s.wb, zt = s.zb, nr = s.Ab, rr = s.Bb, or = s.Cb, Ht = s.Db, ar = s.Eb, sr = s.Fb, x = s.Gb, qe = s.Hb, ir = s.Ib, _ = s.Jb, jt = s.Kb, U = s.Lb, ur = s.Mb, Vt = s.Nb, fr = s.Ob, cr = s.Pb, lr = s.yb, b = f, Ee;
    }
    var r, i = J();
    return t.instantiateWasm ? new Promise((s) => {
      t.instantiateWasm(i, (f, p) => {
        s(e(f, p));
      });
    }) : o ? e(new WebAssembly.Instance(b, J()), b) : (K ??= t.locateFile ? t.locateFile ? t.locateFile("ort-wasm-simd-threaded.wasm", h) : h + "ort-wasm-simd-threaded.wasm" : new URL("" + new URL("ort-wasm-simd-threaded-4byDm7i3.wasm", import.meta.url).href, import.meta.url).href, r = await (async function(s) {
      var f = K;
      if (!g && !k(f)) try {
        var p = fetch(f, { credentials: "same-origin" });
        return await WebAssembly.instantiateStreaming(p, s);
      } catch (E) {
        F(`wasm streaming compile failed: ${E}`), F("falling back to ArrayBuffer instantiation");
      }
      return (async function(E, S) {
        try {
          var C = await (async function(R) {
            if (!g) try {
              var X = await d(R);
              return new Uint8Array(X);
            } catch {
            }
            if (R == K && g) R = new Uint8Array(g);
            else {
              if (!c) throw "both async and sync fetching of the wasm failed";
              R = c(R);
            }
            return R;
          })(E);
          return await WebAssembly.instantiate(C, S);
        } catch (R) {
          F(`failed to asynchronously prepare wasm: ${R}`), j(R);
        }
      })(f, s);
    })(i), e(r.instance, r.module));
  }
  class Se {
    name = "ExitStatus";
    constructor(r) {
      this.message = `Program terminated with exit(${r})`, this.status = r;
    }
  }
  var ve = (e) => {
    e.terminate(), e.onmessage = () => {
    };
  }, Ve = [], Re = 0, te = null, ue = (e) => {
    ce.length == 0 && (yn(), bn(ce[0]));
    var r = ce.pop();
    if (!r) return 6;
    Fe.push(r), Ae[e.Qb] = r, r.Qb = e.Qb;
    var i = { Rb: "run", dc: e.cc, Vb: e.Vb, Qb: e.Qb };
    return r.postMessage(i, e.Zb), 0;
  }, se = 0, L = (e, r, ...i) => {
    var s, f = 16 * i.length, p = U(), E = jt(f), S = E >>> 3;
    for (s of i) typeof s == "bigint" ? ((w(), O)[S++ >>> 0] = 1n, (w(), O)[S++ >>> 0] = s) : ((w(), O)[S++ >>> 0] = 0n, (w(), me)[S++ >>> 0] = s);
    return e = rr(e, 0, f, E, r), _(p), e;
  };
  function V(e) {
    if (o) return L(0, 1, e);
    if (y = e, !(0 < se)) {
      for (var r of Fe) ve(r);
      for (r of ce) ve(r);
      ce = [], Fe = [], Ae = {}, P = true;
    }
    l(0, new Se(e));
  }
  function fe(e) {
    if (o) return L(1, 0, e);
    ye(e);
  }
  var ye = (e) => {
    if (y = e, o) throw fe(e), "unwind";
    V(e);
  }, ce = [], Fe = [], mn = [], Ae = {}, hn = (e) => {
    var r = e.Qb;
    delete Ae[r], ce.push(e), Fe.splice(Fe.indexOf(e), 1), e.Qb = 0, or(r);
  };
  function wn() {
    mn.forEach((e) => e());
  }
  var bn = (e) => new Promise((r) => {
    e.onmessage = (f) => {
      var p = f.data;
      if (f = p.Rb, p.Ub && p.Ub != st()) {
        var E = Ae[p.Ub];
        E ? E.postMessage(p, p.Zb) : F(`Internal error! Worker sent a message "${f}" to target pthread ${p.Ub}, but that thread no longer exists!`);
      } else f === "checkMailbox" ? rt() : f === "spawnThread" ? ue(p) : f === "cleanupThread" ? Rt(() => {
        hn(Ae[p.ec]);
      }) : f === "loaded" ? (e.loaded = true, r(e)) : p.target === "setimmediate" ? e.postMessage(p) : f === "uncaughtException" ? e.onerror(p.error) : f === "callHandler" ? t[p.$b](...p.args) : f && F(`worker sent an unknown command ${f}`);
    }, e.onerror = (f) => {
      throw F(`worker sent an error! ${f.filename}:${f.lineno}: ${f.message}`), f;
    };
    var i, s = [];
    for (i of []) t.propertyIsEnumerable(i) && s.push(i);
    e.postMessage({ Rb: "load", ac: s, fc: ge, hc: b });
  });
  function yn() {
    var e = new Worker((() => {
      let r = URL;
      return import.meta.url > "file:" && import.meta.url < "file;" ? new r("ort.wasm.bundle.min.mjs", import.meta.url) : new URL(import.meta.url);
    })(), { type: "module", workerData: "em-pthread", name: "em-pthread" });
    ce.push(e);
  }
  var ge, gn = [], M = (e) => {
    var r = gn[e];
    return r || (gn[e] = r = lr.get(e)), r;
  }, Io = (e, r) => {
    se = 0, e = M(e)(r), 0 < se ? y = e : Ht(e);
  }, tt = [], nt = 0;
  function Bo(e) {
    var r = new xt(e >>>= 0);
    return (w(), H)[r.Sb + 12 >>> 0] == 0 && (En(r, true), nt--), Tn(r, false), tt.push(r), cr(e);
  }
  var Ne = 0, Lo = () => {
    x(0, 0);
    var e = tt.pop();
    ur(e.Wb), Ne = 0;
  };
  function En(e, r) {
    r = r ? 1 : 0, (w(), H)[e.Sb + 12 >>> 0] = r;
  }
  function Tn(e, r) {
    r = r ? 1 : 0, (w(), H)[e.Sb + 13 >>> 0] = r;
  }
  class xt {
    constructor(r) {
      this.Wb = r, this.Sb = r - 24;
    }
  }
  var Ct = (e) => {
    var r = Ne;
    if (!r) return qe(0), 0;
    var i = new xt(r);
    (w(), W)[i.Sb + 16 >>> 2 >>> 0] = r;
    var s = (w(), W)[i.Sb + 4 >>> 2 >>> 0];
    if (!s) return qe(0), r;
    for (var f of e) {
      if (f === 0 || f === s) break;
      if (fr(f, s, i.Sb + 16)) return qe(f), r;
    }
    return qe(s), r;
  };
  function _o() {
    return Ct([]);
  }
  function Do(e) {
    return Ct([e >>> 0]);
  }
  function Po(e, r, i, s) {
    return Ct([e >>> 0, r >>> 0, i >>> 0, s >>> 0]);
  }
  var Uo = () => {
    var e = tt.pop();
    e || j("no exception to throw");
    var r = e.Wb;
    throw (w(), H)[e.Sb + 13 >>> 0] == 0 && (tt.push(e), Tn(e, true), En(e, false), nt++), Vt(r), Ne = r;
  };
  function xo(e, r, i) {
    var s = new xt(e >>>= 0);
    throw r >>>= 0, i >>>= 0, (w(), W)[s.Sb + 16 >>> 2 >>> 0] = 0, (w(), W)[s.Sb + 4 >>> 2 >>> 0] = r, (w(), W)[s.Sb + 8 >>> 2 >>> 0] = i, Vt(e), nt++, Ne = e;
  }
  var Co = () => nt;
  function Sn(e, r, i, s) {
    return o ? L(2, 1, e, r, i, s) : vn(e, r, i, s);
  }
  function vn(e, r, i, s) {
    if (e >>>= 0, r >>>= 0, i >>>= 0, s >>>= 0, !globalThis.SharedArrayBuffer) return 6;
    var f = [];
    return o && f.length === 0 ? Sn(e, r, i, s) : (e = { cc: i, Qb: e, Vb: s, Zb: f }, o ? (e.Rb = "spawnThread", postMessage(e, f), 0) : ue(e));
  }
  function Mo(e) {
    throw Ne ||= e >>> 0, Ne;
  }
  var An = globalThis.TextDecoder && new TextDecoder(), On = (e, r = 0, i, s) => {
    var f = r >>>= 0;
    if (i = f + i, s) s = i;
    else {
      for (; e[f] && !(f >= i); ) ++f;
      s = f;
    }
    if (16 < s - r && e.buffer && An) return An.decode(e.buffer instanceof ArrayBuffer ? e.subarray(r, s) : e.slice(r, s));
    for (f = ""; r < s; ) if (128 & (i = e[r++])) {
      var p = 63 & e[r++];
      if ((224 & i) == 192) f += String.fromCharCode((31 & i) << 6 | p);
      else {
        var E = 63 & e[r++];
        65536 > (i = (240 & i) == 224 ? (15 & i) << 12 | p << 6 | E : (7 & i) << 18 | p << 12 | E << 6 | 63 & e[r++]) ? f += String.fromCharCode(i) : (i -= 65536, f += String.fromCharCode(55296 | i >> 10, 56320 | 1023 & i));
      }
    } else f += String.fromCharCode(i);
    return f;
  }, Mt = (e, r, i) => (e >>>= 0) ? On((w(), ne), e, r, i) : "";
  function In(e, r, i) {
    return o ? L(3, 1, e, r, i) : 0;
  }
  function Bn(e, r) {
    if (o) return L(4, 1, e, r);
  }
  function Ln(e, r) {
    if (o) return L(5, 1, e, r);
  }
  function _n(e, r, i) {
    if (o) return L(6, 1, e, r, i);
  }
  function Dn(e, r, i) {
    return o ? L(7, 1, e, r, i) : 0;
  }
  function Pn(e, r) {
    if (o) return L(8, 1, e, r);
  }
  function Un(e, r, i) {
    if (o) return L(9, 1, e, r, i);
  }
  function xn(e, r, i, s) {
    if (o) return L(10, 1, e, r, i, s);
  }
  function Cn(e, r, i, s) {
    if (o) return L(11, 1, e, r, i, s);
  }
  function Mn(e, r, i, s) {
    if (o) return L(12, 1, e, r, i, s);
  }
  function Rn(e) {
    if (o) return L(13, 1, e);
  }
  function Fn(e, r) {
    if (o) return L(14, 1, e, r);
  }
  function Nn(e, r, i) {
    if (o) return L(15, 1, e, r, i);
  }
  var Ro = () => j("");
  function Fo(e) {
    zt(e >>> 0, !u, 1, !a, 131072, false), wn();
  }
  var Rt = (e) => {
    if (!P) try {
      if (e(), !(0 < se)) try {
        o ? st() && Ht(y) : ye(y);
      } catch (r) {
        r instanceof Se || r == "unwind" || l(0, r);
      }
    } catch (r) {
      r instanceof Se || r == "unwind" || l(0, r);
    }
  }, No = !Atomics.waitAsync || globalThis.navigator?.userAgent && 91 > Number((navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./) || [])[2]);
  function Ft(e) {
    e >>>= 0, No || (Atomics.waitAsync((w(), B), e >>> 2, e).value.then(rt), e += 128, Atomics.store((w(), B), e >>> 2, 1));
  }
  var rt = () => Rt(() => {
    var e = st();
    e && (Ft(e), sr());
  });
  function ko(e, r) {
    (e >>>= 0) == r >>> 0 ? setTimeout(rt) : o ? postMessage({ Ub: e, Rb: "checkMailbox" }) : (e = Ae[e]) && e.postMessage({ Rb: "checkMailbox" });
  }
  var Nt = [];
  function Wo(e, r, i, s, f) {
    for (r >>>= 0, f >>>= 0, Nt.length = 0, i = f >>> 3, s = f + s >>> 3; i < s; ) {
      var p;
      p = (w(), O)[i++ >>> 0] ? (w(), O)[i++ >>> 0] : (w(), me)[i++ >>> 0], Nt.push(p);
    }
    return (r ? dr[r] : fa[e])(...Nt);
  }
  var Go = () => {
    se = 0;
  };
  function $o(e) {
    e >>>= 0, o ? postMessage({ Rb: "cleanupThread", ec: e }) : hn(Ae[e]);
  }
  function zo(e) {
  }
  function Ho(e, r) {
    e = -9007199254740992 > e || 9007199254740992 < e ? NaN : Number(e), r >>>= 0, e = new Date(1e3 * e), (w(), B)[r >>> 2 >>> 0] = e.getUTCSeconds(), (w(), B)[r + 4 >>> 2 >>> 0] = e.getUTCMinutes(), (w(), B)[r + 8 >>> 2 >>> 0] = e.getUTCHours(), (w(), B)[r + 12 >>> 2 >>> 0] = e.getUTCDate(), (w(), B)[r + 16 >>> 2 >>> 0] = e.getUTCMonth(), (w(), B)[r + 20 >>> 2 >>> 0] = e.getUTCFullYear() - 1900, (w(), B)[r + 24 >>> 2 >>> 0] = e.getUTCDay(), e = (e.getTime() - Date.UTC(e.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) / 864e5 | 0, (w(), B)[r + 28 >>> 2 >>> 0] = e;
  }
  var kn = (e) => e % 4 == 0 && (e % 100 != 0 || e % 400 == 0), Wn = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], Gn = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  function jo(e, r) {
    e = -9007199254740992 > e || 9007199254740992 < e ? NaN : Number(e), r >>>= 0, e = new Date(1e3 * e), (w(), B)[r >>> 2 >>> 0] = e.getSeconds(), (w(), B)[r + 4 >>> 2 >>> 0] = e.getMinutes(), (w(), B)[r + 8 >>> 2 >>> 0] = e.getHours(), (w(), B)[r + 12 >>> 2 >>> 0] = e.getDate(), (w(), B)[r + 16 >>> 2 >>> 0] = e.getMonth(), (w(), B)[r + 20 >>> 2 >>> 0] = e.getFullYear() - 1900, (w(), B)[r + 24 >>> 2 >>> 0] = e.getDay();
    var i = (kn(e.getFullYear()) ? Wn : Gn)[e.getMonth()] + e.getDate() - 1 | 0;
    (w(), B)[r + 28 >>> 2 >>> 0] = i, (w(), B)[r + 36 >>> 2 >>> 0] = -60 * e.getTimezoneOffset(), i = new Date(e.getFullYear(), 6, 1).getTimezoneOffset();
    var s = new Date(e.getFullYear(), 0, 1).getTimezoneOffset();
    e = 0 | (i != s && e.getTimezoneOffset() == Math.min(s, i)), (w(), B)[r + 32 >>> 2 >>> 0] = e;
  }
  function Vo(e) {
    e >>>= 0;
    var r = new Date((w(), B)[e + 20 >>> 2 >>> 0] + 1900, (w(), B)[e + 16 >>> 2 >>> 0], (w(), B)[e + 12 >>> 2 >>> 0], (w(), B)[e + 8 >>> 2 >>> 0], (w(), B)[e + 4 >>> 2 >>> 0], (w(), B)[e >>> 2 >>> 0], 0), i = (w(), B)[e + 32 >>> 2 >>> 0], s = r.getTimezoneOffset(), f = new Date(r.getFullYear(), 6, 1).getTimezoneOffset(), p = new Date(r.getFullYear(), 0, 1).getTimezoneOffset(), E = Math.min(p, f);
    return 0 > i ? (w(), B)[e + 32 >>> 2 >>> 0] = +(f != p && E == s) : 0 < i != (E == s) && (f = Math.max(p, f), r.setTime(r.getTime() + 6e4 * ((0 < i ? E : f) - s))), (w(), B)[e + 24 >>> 2 >>> 0] = r.getDay(), i = (kn(r.getFullYear()) ? Wn : Gn)[r.getMonth()] + r.getDate() - 1 | 0, (w(), B)[e + 28 >>> 2 >>> 0] = i, (w(), B)[e >>> 2 >>> 0] = r.getSeconds(), (w(), B)[e + 4 >>> 2 >>> 0] = r.getMinutes(), (w(), B)[e + 8 >>> 2 >>> 0] = r.getHours(), (w(), B)[e + 12 >>> 2 >>> 0] = r.getDate(), (w(), B)[e + 16 >>> 2 >>> 0] = r.getMonth(), (w(), B)[e + 20 >>> 2 >>> 0] = r.getYear(), e = r.getTime(), BigInt(isNaN(e) ? -1 : e / 1e3);
  }
  function $n(e, r, i, s, f, p, E) {
    return o ? L(16, 1, e, r, i, s, f, p, E) : -52;
  }
  function zn(e, r, i, s, f, p) {
    if (o) return L(17, 1, e, r, i, s, f, p);
  }
  var Ye = {}, Yo = () => performance.timeOrigin + performance.now();
  function Hn(e, r) {
    if (o) return L(18, 1, e, r);
    if (Ye[e] && (clearTimeout(Ye[e].id), delete Ye[e]), !r) return 0;
    var i = setTimeout(() => {
      delete Ye[e], Rt(() => ar(e, performance.timeOrigin + performance.now()));
    }, r);
    return Ye[e] = { id: i, oc: r }, 0;
  }
  var Oe = (e, r, i) => {
    var s = (w(), ne);
    if (r >>>= 0, 0 < i) {
      var f = r;
      i = r + i - 1;
      for (var p = 0; p < e.length; ++p) {
        var E = e.codePointAt(p);
        if (127 >= E) {
          if (r >= i) break;
          s[r++ >>> 0] = E;
        } else if (2047 >= E) {
          if (r + 1 >= i) break;
          s[r++ >>> 0] = 192 | E >> 6, s[r++ >>> 0] = 128 | 63 & E;
        } else if (65535 >= E) {
          if (r + 2 >= i) break;
          s[r++ >>> 0] = 224 | E >> 12, s[r++ >>> 0] = 128 | E >> 6 & 63, s[r++ >>> 0] = 128 | 63 & E;
        } else {
          if (r + 3 >= i) break;
          s[r++ >>> 0] = 240 | E >> 18, s[r++ >>> 0] = 128 | E >> 12 & 63, s[r++ >>> 0] = 128 | E >> 6 & 63, s[r++ >>> 0] = 128 | 63 & E, p++;
        }
      }
      s[r >>> 0] = 0, e = r - f;
    } else e = 0;
    return e;
  };
  function qo(e, r, i, s) {
    e >>>= 0, r >>>= 0, i >>>= 0, s >>>= 0;
    var f = (/* @__PURE__ */ new Date()).getFullYear(), p = new Date(f, 0, 1).getTimezoneOffset();
    f = new Date(f, 6, 1).getTimezoneOffset();
    var E = Math.max(p, f);
    (w(), W)[e >>> 2 >>> 0] = 60 * E, (w(), B)[r >>> 2 >>> 0] = +(p != f), e = (r = (S) => {
      var C = Math.abs(S);
      return `UTC${0 <= S ? "-" : "+"}${String(Math.floor(C / 60)).padStart(2, "0")}${String(C % 60).padStart(2, "0")}`;
    })(p), r = r(f), f < p ? (Oe(e, i, 17), Oe(r, s, 17)) : (Oe(e, s, 17), Oe(r, i, 17));
  }
  var Jo = () => Date.now();
  function Zo(e, r, i) {
    if (i >>>= 0, !(0 <= e && 3 >= e)) return 28;
    if (e === 0) e = Date.now();
    else {
      e = performance.timeOrigin + performance.now();
    }
    return e = Math.round(1e6 * e), (w(), O)[i >>> 3 >>> 0] = BigInt(e), 0;
  }
  var kt = [];
  function Qo(e, r, i) {
    e >>>= 0, r >>>= 0, i >>>= 0, kt.length = 0;
    for (var s; s = (w(), ne)[r++ >>> 0]; ) {
      var f = s != 105;
      i += (f &= s != 112) && i % 8 ? 4 : 0, kt.push(s == 112 ? (w(), W)[i >>> 2 >>> 0] : s == 106 ? (w(), O)[i >>> 3 >>> 0] : s == 105 ? (w(), B)[i >>> 2 >>> 0] : (w(), me)[i >>> 3 >>> 0]), i += f ? 8 : 4;
    }
    return dr[e](...kt);
  }
  var Ko = () => {
  };
  function ea(e, r) {
    return F(Mt(e >>> 0, r >>> 0));
  }
  var ta = () => {
    throw se += 1, "unwind";
  };
  function na() {
    return 4294901760;
  }
  var ra = () => navigator.hardwareConcurrency, Ie = {}, Wt = (e) => {
    for (var r = 0, i = 0; i < e.length; ++i) {
      var s = e.charCodeAt(i);
      127 >= s ? r++ : 2047 >= s ? r += 2 : 55296 <= s && 57343 >= s ? (r += 4, ++i) : r += 3;
    }
    return r;
  }, ot = (e) => {
    var r;
    return (r = /\bwasm-function\[\d+\]:(0x[0-9a-f]+)/.exec(e)) ? +r[1] : (r = /:(\d+):\d+(?:\)|$)/.exec(e)) ? 2147483648 | +r[1] : 0;
  }, jn = (e) => {
    for (var r of e) (e = ot(r)) && (Ie[e] = r);
  };
  function oa() {
    var e = Error().stack.toString().split(`
`);
    return e[0] == "Error" && e.shift(), jn(e), Ie.Xb = ot(e[3]), Ie.bc = e, Ie.Xb;
  }
  function at(e) {
    if (!(e = Ie[e >>> 0])) return 0;
    var r;
    if (r = /^\s+at .*\.wasm\.(.*) \(.*\)$/.exec(e)) e = r[1];
    else if (r = /^\s+at (.*) \(.*\)$/.exec(e)) e = r[1];
    else {
      if (!(r = /^(.+?)@/.exec(e))) return 0;
      e = r[1];
    }
    er(at.Yb ?? 0), r = Wt(e) + 1;
    var i = tr(r);
    return i && Oe(e, i, r), at.Yb = i, at.Yb;
  }
  function aa(e) {
    e >>>= 0;
    var r = (w(), ne).length;
    if (e <= r || 4294901760 < e) return false;
    for (var i = 1; 4 >= i; i *= 2) {
      var s = r * (1 + 0.2 / i);
      s = Math.min(s, e + 100663296);
      e: {
        s = (Math.min(4294901760, 65536 * Math.ceil(Math.max(e, s) / 65536)) - ge.buffer.byteLength + 65535) / 65536 | 0;
        try {
          ge.grow(s), ee();
          var f = 1;
          break e;
        } catch {
        }
        f = void 0;
      }
      if (f) return true;
    }
    return false;
  }
  function sa(e, r, i) {
    if (e >>>= 0, r >>>= 0, Ie.Xb == e) var s = Ie.bc;
    else (s = Error().stack.toString().split(`
`))[0] == "Error" && s.shift(), jn(s);
    for (var f = 3; s[f] && ot(s[f]) != e; ) ++f;
    for (e = 0; e < i && s[e + f]; ++e) (w(), B)[r + 4 * e >>> 2 >>> 0] = ot(s[e + f]);
    return e;
  }
  var Gt, $t = {}, Vn = () => {
    if (!Gt) {
      var e, r = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: (globalThis.navigator?.language ?? "C").replace("-", "_") + ".UTF-8", _: "./this.program" };
      for (e in $t) $t[e] === void 0 ? delete r[e] : r[e] = $t[e];
      var i = [];
      for (e in r) i.push(`${e}=${r[e]}`);
      Gt = i;
    }
    return Gt;
  };
  function Yn(e, r) {
    if (o) return L(19, 1, e, r);
    e >>>= 0, r >>>= 0;
    var i, s = 0, f = 0;
    for (i of Vn()) {
      var p = r + s;
      (w(), W)[e + f >>> 2 >>> 0] = p, s += Oe(i, p, 1 / 0) + 1, f += 4;
    }
    return 0;
  }
  function qn(e, r) {
    if (o) return L(20, 1, e, r);
    e >>>= 0, r >>>= 0;
    var i = Vn();
    for (var s of ((w(), W)[e >>> 2 >>> 0] = i.length, e = 0, i)) e += Wt(s) + 1;
    return (w(), W)[r >>> 2 >>> 0] = e, 0;
  }
  function Jn(e) {
    return o ? L(21, 1, e) : 52;
  }
  function Xn(e, r, i, s, f) {
    return o ? L(22, 1, e, r, i, s, f) : 52;
  }
  function Zn(e, r, i, s) {
    return o ? L(23, 1, e, r, i, s) : 52;
  }
  function Qn(e, r, i, s) {
    return o ? L(24, 1, e, r, i, s) : 70;
  }
  var ia = [null, [], []];
  function Kn(e, r, i, s) {
    if (o) return L(25, 1, e, r, i, s);
    r >>>= 0, i >>>= 0, s >>>= 0;
    for (var f = 0, p = 0; p < i; p++) {
      var E = (w(), W)[r >>> 2 >>> 0], S = (w(), W)[r + 4 >>> 2 >>> 0];
      r += 8;
      for (var C = 0; C < S; C++) {
        var R = e, X = (w(), ne)[E + C >>> 0], le = ia[R];
        X === 0 || X === 10 ? ((R === 1 ? A : F)(On(le)), le.length = 0) : le.push(X);
      }
      f += S;
    }
    return (w(), W)[s >>> 2 >>> 0] = f, 0;
  }
  function ua(e) {
    return e >>> 0;
  }
  o || (function() {
    for (var e = t.numThreads - 1; e--; ) yn();
    Ve.push(async () => {
      var r = (async function() {
        if (!o) return Promise.all(ce.map(bn));
      })();
      Re++, await r, --Re == 0 && te && (r = te, te = null, r());
    });
  })(), o || (ge = new WebAssembly.Memory({ initial: 256, maximum: 65536, shared: true }), ee()), t.wasmBinary && (g = t.wasmBinary), t.stackSave = () => U(), t.stackRestore = (e) => _(e), t.stackAlloc = (e) => jt(e), t.setValue = function(e, r, i = "i8") {
    switch (i.endsWith("*") && (i = "*"), i) {
      case "i1":
      case "i8":
        (w(), H)[e >>> 0] = r;
        break;
      case "i16":
        (w(), pe)[e >>> 1 >>> 0] = r;
        break;
      case "i32":
        (w(), B)[e >>> 2 >>> 0] = r;
        break;
      case "i64":
        (w(), O)[e >>> 3 >>> 0] = BigInt(r);
        break;
      case "float":
        (w(), re)[e >>> 2 >>> 0] = r;
        break;
      case "double":
        (w(), me)[e >>> 3 >>> 0] = r;
        break;
      case "*":
        (w(), W)[e >>> 2 >>> 0] = r;
        break;
      default:
        j(`invalid type for setValue: ${i}`);
    }
  }, t.getValue = function(e, r = "i8") {
    switch (r.endsWith("*") && (r = "*"), r) {
      case "i1":
      case "i8":
        return (w(), H)[e >>> 0];
      case "i16":
        return (w(), pe)[e >>> 1 >>> 0];
      case "i32":
        return (w(), B)[e >>> 2 >>> 0];
      case "i64":
        return (w(), O)[e >>> 3 >>> 0];
      case "float":
        return (w(), re)[e >>> 2 >>> 0];
      case "double":
        return (w(), me)[e >>> 3 >>> 0];
      case "*":
        return (w(), W)[e >>> 2 >>> 0];
      default:
        j(`invalid type for getValue: ${r}`);
    }
  }, t.UTF8ToString = Mt, t.stringToUTF8 = Oe, t.lengthBytesUTF8 = Wt;
  var st, er, tr, zt, nr, rr, or, Ht, ar, sr, x, qe, ir, _, jt, U, ur, Vt, fr, cr, lr, Ee, fa = [V, fe, Sn, In, Bn, Ln, _n, Dn, Pn, Un, xn, Cn, Mn, Rn, Fn, Nn, $n, zn, Hn, Yn, qn, Jn, Xn, Zn, Qn, Kn], dr = { 1043436: (e, r, i, s, f) => {
    if (t === void 0 || !t.Tb) return 1;
    if ((e = Mt(Number(e >>> 0))).startsWith("./") && (e = e.substring(2)), !(e = t.Tb.get(e))) return 2;
    if (r = Number(r >>> 0), i = Number(i >>> 0), s = Number(s >>> 0), r + i > e.byteLength) return 3;
    try {
      let p = e.subarray(r, r + i);
      switch (f) {
        case 0:
          (w(), ne).set(p, s >>> 0);
          break;
        case 1:
          t.ic ? t.ic(s, p) : t.kc(s, p);
          break;
        default:
          return 4;
      }
      return 0;
    } catch {
      return 4;
    }
  }, 1044260: () => typeof wasmOffsetConverter < "u" };
  function ca() {
    return typeof wasmOffsetConverter < "u";
  }
  function la(e, r, i, s) {
    var f = U();
    try {
      return M(e)(r, i, s);
    } catch (p) {
      if (_(f), p !== p + 0) throw p;
      x(1, 0);
    }
  }
  function da(e, r, i) {
    var s = U();
    try {
      return M(e)(r, i);
    } catch (f) {
      if (_(s), f !== f + 0) throw f;
      x(1, 0);
    }
  }
  function pa(e) {
    var r = U();
    try {
      M(e)();
    } catch (i) {
      if (_(r), i !== i + 0) throw i;
      x(1, 0);
    }
  }
  function ma(e, r) {
    var i = U();
    try {
      return M(e)(r);
    } catch (s) {
      if (_(i), s !== s + 0) throw s;
      x(1, 0);
    }
  }
  function ha(e, r, i) {
    var s = U();
    try {
      M(e)(r, i);
    } catch (f) {
      if (_(s), f !== f + 0) throw f;
      x(1, 0);
    }
  }
  function wa(e, r) {
    var i = U();
    try {
      M(e)(r);
    } catch (s) {
      if (_(i), s !== s + 0) throw s;
      x(1, 0);
    }
  }
  function ba(e, r, i, s, f, p, E) {
    var S = U();
    try {
      return M(e)(r, i, s, f, p, E);
    } catch (C) {
      if (_(S), C !== C + 0) throw C;
      x(1, 0);
    }
  }
  function ya(e, r, i, s, f, p) {
    var E = U();
    try {
      M(e)(r, i, s, f, p);
    } catch (S) {
      if (_(E), S !== S + 0) throw S;
      x(1, 0);
    }
  }
  function ga(e, r, i, s) {
    var f = U();
    try {
      M(e)(r, i, s);
    } catch (p) {
      if (_(f), p !== p + 0) throw p;
      x(1, 0);
    }
  }
  function Ea(e, r, i, s, f) {
    var p = U();
    try {
      M(e)(r, i, s, f);
    } catch (E) {
      if (_(p), E !== E + 0) throw E;
      x(1, 0);
    }
  }
  function Ta(e, r, i, s, f, p, E) {
    var S = U();
    try {
      M(e)(r, i, s, f, p, E);
    } catch (C) {
      if (_(S), C !== C + 0) throw C;
      x(1, 0);
    }
  }
  function Sa(e, r, i, s, f, p, E) {
    var S = U();
    try {
      M(e)(r, i, s, f, p, E);
    } catch (C) {
      if (_(S), C !== C + 0) throw C;
      x(1, 0);
    }
  }
  function va(e, r, i, s, f, p, E, S) {
    var C = U();
    try {
      M(e)(r, i, s, f, p, E, S);
    } catch (R) {
      if (_(C), R !== R + 0) throw R;
      x(1, 0);
    }
  }
  function Aa(e, r, i, s, f) {
    var p = U();
    try {
      return M(e)(r, i, s, f);
    } catch (E) {
      if (_(p), E !== E + 0) throw E;
      x(1, 0);
    }
  }
  function Oa(e, r, i) {
    var s = U();
    try {
      return M(e)(r, i);
    } catch (f) {
      if (_(s), f !== f + 0) throw f;
      x(1, 0);
    }
  }
  function Ia(e, r, i, s, f, p, E, S) {
    var C = U();
    try {
      M(e)(r, i, s, f, p, E, S);
    } catch (R) {
      if (_(C), R !== R + 0) throw R;
      x(1, 0);
    }
  }
  function Ba(e, r, i, s, f, p, E, S, C, R, X, le) {
    var we = U();
    try {
      M(e)(r, i, s, f, p, E, S, C, R, X, le);
    } catch (be) {
      if (_(we), be !== be + 0) throw be;
      x(1, 0);
    }
  }
  function La(e, r, i) {
    var s = U();
    try {
      return M(e)(r, i);
    } catch (f) {
      if (_(s), f !== f + 0) throw f;
      return x(1, 0), 0n;
    }
  }
  function _a(e, r, i, s, f, p, E, S, C) {
    var R = U();
    try {
      M(e)(r, i, s, f, p, E, S, C);
    } catch (X) {
      if (_(R), X !== X + 0) throw X;
      x(1, 0);
    }
  }
  function Da(e) {
    var r = U();
    try {
      return M(e)();
    } catch (i) {
      if (_(r), i !== i + 0) throw i;
      x(1, 0);
    }
  }
  function Pa(e, r) {
    var i = U();
    try {
      return M(e)(r);
    } catch (s) {
      if (_(i), s !== s + 0) throw s;
      return x(1, 0), 0n;
    }
  }
  function Ua(e, r, i, s) {
    var f = U();
    try {
      return M(e)(r, i, s);
    } catch (p) {
      if (_(f), p !== p + 0) throw p;
      x(1, 0);
    }
  }
  function xa(e) {
    var r = U();
    try {
      return M(e)();
    } catch (i) {
      if (_(r), i !== i + 0) throw i;
      return x(1, 0), 0n;
    }
  }
  function Ca(e, r, i, s) {
    var f = U();
    try {
      return M(e)(r, i, s);
    } catch (p) {
      if (_(f), p !== p + 0) throw p;
      x(1, 0);
    }
  }
  function Ma(e, r, i, s, f) {
    var p = U();
    try {
      return M(e)(r, i, s, f);
    } catch (E) {
      if (_(p), E !== E + 0) throw E;
      x(1, 0);
    }
  }
  function Ra(e, r, i, s, f, p) {
    var E = U();
    try {
      return M(e)(r, i, s, f, p);
    } catch (S) {
      if (_(E), S !== S + 0) throw S;
      x(1, 0);
    }
  }
  function Fa(e, r, i, s, f, p) {
    var E = U();
    try {
      return M(e)(r, i, s, f, p);
    } catch (S) {
      if (_(E), S !== S + 0) throw S;
      x(1, 0);
    }
  }
  function Na(e, r, i, s, f, p) {
    var E = U();
    try {
      return M(e)(r, i, s, f, p);
    } catch (S) {
      if (_(E), S !== S + 0) throw S;
      x(1, 0);
    }
  }
  function ka(e, r, i, s, f, p, E, S) {
    var C = U();
    try {
      return M(e)(r, i, s, f, p, E, S);
    } catch (R) {
      if (_(C), R !== R + 0) throw R;
      x(1, 0);
    }
  }
  function Wa(e, r, i, s, f) {
    var p = U();
    try {
      return M(e)(r, i, s, f);
    } catch (E) {
      if (_(p), E !== E + 0) throw E;
      return x(1, 0), 0n;
    }
  }
  function Ga(e, r, i, s) {
    var f = U();
    try {
      return M(e)(r, i, s);
    } catch (p) {
      if (_(f), p !== p + 0) throw p;
      x(1, 0);
    }
  }
  function $a(e, r, i, s) {
    var f = U();
    try {
      return M(e)(r, i, s);
    } catch (p) {
      if (_(f), p !== p + 0) throw p;
      x(1, 0);
    }
  }
  function za(e, r, i, s, f, p, E, S, C, R, X, le) {
    var we = U();
    try {
      return M(e)(r, i, s, f, p, E, S, C, R, X, le);
    } catch (be) {
      if (_(we), be !== be + 0) throw be;
      x(1, 0);
    }
  }
  function Ha(e, r, i, s, f, p, E, S, C, R, X) {
    var le = U();
    try {
      M(e)(r, i, s, f, p, E, S, C, R, X);
    } catch (we) {
      if (_(le), we !== we + 0) throw we;
      x(1, 0);
    }
  }
  function ja(e, r, i, s, f, p, E, S, C, R, X, le, we, be, Ja, Xa) {
    var Za = U();
    try {
      M(e)(r, i, s, f, p, E, S, C, R, X, le, we, be, Ja, Xa);
    } catch (Yt) {
      if (_(Za), Yt !== Yt + 0) throw Yt;
      x(1, 0);
    }
  }
  function Va(e, r, i) {
    var s = U();
    try {
      return M(e)(r, i);
    } catch (f) {
      if (_(s), f !== f + 0) throw f;
      x(1, 0);
    }
  }
  function Ya(e, r, i) {
    var s = U();
    try {
      return M(e)(r, i);
    } catch (f) {
      if (_(s), f !== f + 0) throw f;
      x(1, 0);
    }
  }
  function qa(e, r, i, s) {
    var f = U();
    try {
      M(e)(r, i, s);
    } catch (p) {
      if (_(f), p !== p + 0) throw p;
      x(1, 0);
    }
  }
  function it() {
    if (0 < Re) te = it;
    else if (o) T?.(t), he();
    else {
      for (var e = Ve; 0 < e.length; ) e.shift()(t);
      0 < Re ? te = it : (t.calledRun = true, P || (he(), T?.(t)));
    }
  }
  return o || (Ee = await Ut(), it()), t.PTR_SIZE = 4, je ? t : new Promise((e, r) => {
    T = e, I = r;
  });
}
var as, ss, Jr = N(() => {
  "use strict";
  as = Yr, ss = globalThis.self?.name?.startsWith("em-pthread");
  ss && Yr();
});
var Qr, an, is, oe, Kr, on, us, fs, eo, cs, Xr, to, Zr, no, pt = N(() => {
  "use strict";
  dt();
  Qr = typeof location > "u" ? void 0 : location.origin, an = import.meta.url > "file:" && import.meta.url < "file;", is = () => {
    if (true) {
      if (an) {
        let n = URL;
        return new URL(new n("ort.wasm.bundle.min.mjs", import.meta.url).href, Qr).href;
      }
      return import.meta.url;
    }
  }, oe = is(), Kr = () => {
    if (oe && !oe.startsWith("blob:")) return oe.substring(0, oe.lastIndexOf("/") + 1);
  }, on = (n, t) => {
    try {
      let a = t ?? oe;
      return (a ? new URL(n, a) : new URL(n)).origin === Qr;
    } catch {
      return false;
    }
  }, us = (n, t) => {
    let a = t ?? oe;
    try {
      return (a ? new URL(n, a) : new URL(n)).href;
    } catch {
      return;
    }
  }, fs = (n, t) => `${t ?? "./"}${n}`, eo = async (n) => {
    let a = await (await fetch(n, { credentials: "same-origin" })).blob();
    return URL.createObjectURL(a);
  }, cs = async (n) => (await import(
    /*webpackIgnore:true*/
    /*@vite-ignore*/
    n
  )).default, Xr = (Vr(), Xt(jr)).default, to = async () => {
    if (!oe) throw new Error("Failed to load proxy worker: cannot determine the script source URL.");
    if (on(oe)) return [void 0, Xr()];
    let n = await eo(oe);
    return [n, Xr(n)];
  }, Zr = (Jr(), Xt(qr)).default, no = async (n, t, a, u) => {
    let o = Zr && !(n || t);
    if (o) if (oe) o = on(oe) || u && !a;
    else if (u && !a) o = true;
    else throw new Error("cannot determine the script source URL.");
    if (o) return [void 0, Zr];
    {
      let d = "ort-wasm-simd-threaded.mjs", c = n ?? us(d, t), l = a && c && !on(c, t), m = l ? await eo(c) : c ?? fs(d, t);
      return [l ? m : void 0, await cs(m)];
    }
  };
});
var sn, un, St, ro, ls, ds, ps, mt, z, xe = N(() => {
  "use strict";
  pt();
  un = false, St = false, ro = false, ls = () => {
    if (typeof SharedArrayBuffer > "u") return false;
    try {
      return typeof MessageChannel < "u" && new MessageChannel().port1.postMessage(new SharedArrayBuffer(1)), WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 4, 1, 96, 0, 0, 3, 2, 1, 0, 5, 4, 1, 3, 1, 1, 10, 11, 1, 9, 0, 65, 0, 254, 16, 2, 0, 26, 11]));
    } catch {
      return false;
    }
  }, ds = () => {
    try {
      return WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 4, 1, 96, 0, 0, 3, 2, 1, 0, 10, 30, 1, 28, 0, 65, 0, 253, 15, 253, 12, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 253, 186, 1, 26, 11]));
    } catch {
      return false;
    }
  }, ps = () => {
    try {
      return WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 19, 1, 17, 0, 65, 1, 253, 15, 65, 2, 253, 15, 65, 3, 253, 15, 253, 147, 2, 11]));
    } catch {
      return false;
    }
  }, mt = async (n) => {
    if (un) return Promise.resolve();
    if (St) throw new Error("multiple calls to 'initializeWebAssembly()' detected.");
    if (ro) throw new Error("previous call to 'initializeWebAssembly()' failed.");
    St = true;
    let t = n.initTimeout, a = n.numThreads;
    if (n.simd !== false) {
      if (n.simd === "relaxed") {
        if (!ps()) throw new Error("Relaxed WebAssembly SIMD is not supported in the current environment.");
      } else if (!ds()) throw new Error("WebAssembly SIMD is not supported in the current environment.");
    }
    let u = ls();
    a > 1 && !u && (typeof self < "u" && !self.crossOriginIsolated && console.warn("env.wasm.numThreads is set to " + a + ", but this will not work unless you enable crossOriginIsolated mode. See https://web.dev/cross-origin-isolation-guide/ for more info."), console.warn("WebAssembly multi-threading is not supported in the current environment. Falling back to single-threading."), n.numThreads = a = 1);
    let o = n.wasmPaths, d = typeof o == "string" ? o : void 0, c = o?.mjs, l = c?.href ?? c, m = o?.wasm, h = m?.href ?? m, g = n.wasmBinary, [b, y] = await no(l, d, a > 1, !!g || !!h), T = false, I = [];
    if (t > 0 && I.push(new Promise((D) => {
      setTimeout(() => {
        T = true, D();
      }, t);
    })), I.push(new Promise((D, $) => {
      let v = { numThreads: a };
      if (g) v.wasmBinary = g, v.locateFile = (A) => A;
      else if (h || d) v.locateFile = (A) => h ?? d + A;
      else if (l && l.indexOf("blob:") !== 0) v.locateFile = (A) => new URL(A, l).href;
      else if (b) {
        let A = Kr();
        A && (v.locateFile = (F) => A + F);
      }
      y(v).then((A) => {
        St = false, un = true, sn = A, D(), b && URL.revokeObjectURL(b);
      }, (A) => {
        St = false, ro = true, $(A);
      });
    })), await Promise.race(I), T) throw new Error(`WebAssembly backend initializing failed due to timeout: ${t}ms`);
  }, z = () => {
    if (un && sn) return sn;
    throw new Error("WebAssembly is not initialized yet.");
  };
});
var ae, Qe, G, vt = N(() => {
  "use strict";
  xe();
  ae = (n, t) => {
    let a = z(), u = a.lengthBytesUTF8(n) + 1, o = a._malloc(u);
    return a.stringToUTF8(n, o, u), t.push(o), o;
  }, Qe = (n, t, a, u) => {
    if (typeof n == "object" && n !== null) {
      if (a.has(n)) throw new Error("Circular reference in options");
      a.add(n);
    }
    Object.entries(n).forEach(([o, d]) => {
      let c = t ? t + o : o;
      if (typeof d == "object") Qe(d, c + ".", a, u);
      else if (typeof d == "string" || typeof d == "number") u(c, d.toString());
      else if (typeof d == "boolean") u(c, d ? "1" : "0");
      else throw new Error(`Can't handle extra config type: ${typeof d}`);
    });
  }, G = (n) => {
    let t = z(), a = t.stackSave();
    try {
      let u = t.PTR_SIZE, o = t.stackAlloc(2 * u);
      t._OrtGetLastError(o, o + u);
      let d = Number(t.getValue(o, u === 4 ? "i32" : "i64")), c = t.getValue(o + u, "*"), l = c ? t.UTF8ToString(c) : "";
      throw new Error(`${n} ERROR_CODE: ${d}, ERROR_MESSAGE: ${l}`);
    } finally {
      t.stackRestore(a);
    }
  };
});
var oo, ao = N(() => {
  "use strict";
  xe();
  vt();
  oo = (n) => {
    let t = z(), a = 0, u = [], o = n || {};
    try {
      if (n?.logSeverityLevel === void 0) o.logSeverityLevel = 2;
      else if (typeof n.logSeverityLevel != "number" || !Number.isInteger(n.logSeverityLevel) || n.logSeverityLevel < 0 || n.logSeverityLevel > 4) throw new Error(`log severity level is not valid: ${n.logSeverityLevel}`);
      if (n?.logVerbosityLevel === void 0) o.logVerbosityLevel = 0;
      else if (typeof n.logVerbosityLevel != "number" || !Number.isInteger(n.logVerbosityLevel)) throw new Error(`log verbosity level is not valid: ${n.logVerbosityLevel}`);
      n?.terminate === void 0 && (o.terminate = false);
      let d = 0;
      return n?.tag !== void 0 && (d = ae(n.tag, u)), a = t._OrtCreateRunOptions(o.logSeverityLevel, o.logVerbosityLevel, !!o.terminate, d), a === 0 && G("Can't create run options."), n?.extra !== void 0 && Qe(n.extra, "", /* @__PURE__ */ new WeakSet(), (c, l) => {
        let m = ae(c, u), h = ae(l, u);
        t._OrtAddRunConfigEntry(a, m, h) !== 0 && G(`Can't set a run config entry: ${c} - ${l}.`);
      }), [a, u];
    } catch (d) {
      throw a !== 0 && t._OrtReleaseRunOptions(a), u.forEach((c) => t._free(c)), d;
    }
  };
});
var ms, hs, ws, ke, bs, so, io = N(() => {
  "use strict";
  xe();
  vt();
  ms = (n) => {
    switch (n) {
      case "disabled":
        return 0;
      case "basic":
        return 1;
      case "extended":
        return 2;
      case "layout":
        return 3;
      case "all":
        return 99;
      default:
        throw new Error(`unsupported graph optimization level: ${n}`);
    }
  }, hs = (n) => {
    switch (n) {
      case "sequential":
        return 0;
      case "parallel":
        return 1;
      default:
        throw new Error(`unsupported execution mode: ${n}`);
    }
  }, ws = (n) => {
    n.extra || (n.extra = {}), n.extra.session || (n.extra.session = {});
    let t = n.extra.session;
    t.use_ort_model_bytes_directly || (t.use_ort_model_bytes_directly = "1"), n.executionProviders && n.executionProviders.some((a) => (typeof a == "string" ? a : a.name) === "webgpu") && (n.enableMemPattern = false);
  }, ke = (n, t, a, u) => {
    let o = ae(t, u), d = ae(a, u);
    z()._OrtAddSessionConfigEntry(n, o, d) !== 0 && G(`Can't set a session config entry: ${t} - ${a}.`);
  }, bs = async (n, t, a) => {
    let u = t.executionProviders;
    for (let o of u) {
      let d = typeof o == "string" ? o : o.name, c = [];
      switch (d) {
        case "webnn":
          if (d = "WEBNN", ke(n, "session.disable_quant_qdq", "1", a), ke(n, "session.disable_qdq_constant_folding", "1", a), typeof o != "string") {
            let y = o?.deviceType;
            y && ke(n, "deviceType", y, a);
          }
          break;
        case "webgpu":
          if (d = "JS", typeof o != "string") {
            let b = o;
            if (b?.preferredLayout) {
              if (b.preferredLayout !== "NCHW" && b.preferredLayout !== "NHWC") throw new Error(`preferredLayout must be either 'NCHW' or 'NHWC': ${b.preferredLayout}`);
              ke(n, "preferredLayout", b.preferredLayout, a);
            }
          }
          break;
        case "wasm":
        case "cpu":
          continue;
        default:
          throw new Error(`not supported execution provider: ${d}`);
      }
      let l = ae(d, a), m = c.length, h = 0, g = 0;
      if (m > 0) {
        h = z()._malloc(m * z().PTR_SIZE), a.push(h), g = z()._malloc(m * z().PTR_SIZE), a.push(g);
        for (let b = 0; b < m; b++) z().setValue(h + b * z().PTR_SIZE, c[b][0], "*"), z().setValue(g + b * z().PTR_SIZE, c[b][1], "*");
      }
      await z()._OrtAppendExecutionProvider(n, l, h, g, m) !== 0 && G(`Can't append execution provider: ${d}.`);
    }
  }, so = async (n) => {
    let t = z(), a = 0, u = [], o = n || {};
    ws(o);
    try {
      let d = ms(o.graphOptimizationLevel ?? "all"), c = hs(o.executionMode ?? "sequential"), l = typeof o.logId == "string" ? ae(o.logId, u) : 0, m = o.logSeverityLevel ?? 2;
      if (!Number.isInteger(m) || m < 0 || m > 4) throw new Error(`log severity level is not valid: ${m}`);
      let h = o.logVerbosityLevel ?? 0;
      if (!Number.isInteger(h) || h < 0 || h > 4) throw new Error(`log verbosity level is not valid: ${h}`);
      let g = typeof o.optimizedModelFilePath == "string" ? ae(o.optimizedModelFilePath, u) : 0;
      if (a = t._OrtCreateSessionOptions(d, !!o.enableCpuMemArena, !!o.enableMemPattern, c, !!o.enableProfiling, 0, l, m, h, g), a === 0 && G("Can't create session options."), o.executionProviders && await bs(a, o, u), o.enableGraphCapture !== void 0) {
        if (typeof o.enableGraphCapture != "boolean") throw new Error(`enableGraphCapture must be a boolean value: ${o.enableGraphCapture}`);
        ke(a, "enableGraphCapture", o.enableGraphCapture.toString(), u);
      }
      if (o.freeDimensionOverrides) for (let [b, y] of Object.entries(o.freeDimensionOverrides)) {
        if (typeof b != "string") throw new Error(`free dimension override name must be a string: ${b}`);
        if (typeof y != "number" || !Number.isInteger(y) || y < 0) throw new Error(`free dimension override value must be a non-negative integer: ${y}`);
        let T = ae(b, u);
        t._OrtAddFreeDimensionOverride(a, T, y) !== 0 && G(`Can't set a free dimension override: ${b} - ${y}.`);
      }
      return o.extra !== void 0 && Qe(o.extra, "", /* @__PURE__ */ new WeakSet(), (b, y) => {
        ke(a, b, y, u);
      }), [a, u];
    } catch (d) {
      throw a !== 0 && t._OrtReleaseSessionOptions(a) !== 0 && G("Can't release session options."), u.forEach((c) => t._free(c)), d;
    }
  };
});
var We, At, Ge, uo, fo, Ot, It, co, fn = N(() => {
  "use strict";
  We = (n) => {
    switch (n) {
      case "int8":
        return 3;
      case "uint8":
        return 2;
      case "bool":
        return 9;
      case "int16":
        return 5;
      case "uint16":
        return 4;
      case "int32":
        return 6;
      case "uint32":
        return 12;
      case "float16":
        return 10;
      case "float32":
        return 1;
      case "float64":
        return 11;
      case "string":
        return 8;
      case "int64":
        return 7;
      case "uint64":
        return 13;
      case "int4":
        return 22;
      case "uint4":
        return 21;
      default:
        throw new Error(`unsupported data type: ${n}`);
    }
  }, At = (n) => {
    switch (n) {
      case 3:
        return "int8";
      case 2:
        return "uint8";
      case 9:
        return "bool";
      case 5:
        return "int16";
      case 4:
        return "uint16";
      case 6:
        return "int32";
      case 12:
        return "uint32";
      case 10:
        return "float16";
      case 1:
        return "float32";
      case 11:
        return "float64";
      case 8:
        return "string";
      case 7:
        return "int64";
      case 13:
        return "uint64";
      case 22:
        return "int4";
      case 21:
        return "uint4";
      default:
        throw new Error(`unsupported data type: ${n}`);
    }
  }, Ge = (n, t) => {
    let a = [-1, 4, 1, 1, 2, 2, 4, 8, -1, 1, 2, 8, 4, 8, -1, -1, -1, -1, -1, -1, -1, 0.5, 0.5][n], u = typeof t == "number" ? t : t.reduce((o, d) => o * d, 1);
    return a > 0 ? Math.ceil(u * a) : void 0;
  }, uo = (n) => {
    switch (n) {
      case "float16":
        return typeof Float16Array < "u" ? Float16Array : Uint16Array;
      case "float32":
        return Float32Array;
      case "uint8":
        return Uint8Array;
      case "int8":
        return Int8Array;
      case "uint16":
        return Uint16Array;
      case "int16":
        return Int16Array;
      case "int32":
        return Int32Array;
      case "bool":
        return Uint8Array;
      case "float64":
        return Float64Array;
      case "uint32":
        return Uint32Array;
      case "int64":
        return BigInt64Array;
      case "uint64":
        return BigUint64Array;
      default:
        throw new Error(`unsupported type: ${n}`);
    }
  }, fo = (n) => {
    switch (n) {
      case "verbose":
        return 0;
      case "info":
        return 1;
      case "warning":
        return 2;
      case "error":
        return 3;
      case "fatal":
        return 4;
      default:
        throw new Error(`unsupported logging level: ${n}`);
    }
  }, Ot = (n) => n === "float32" || n === "float16" || n === "int32" || n === "int64" || n === "uint32" || n === "uint8" || n === "bool" || n === "uint4" || n === "int4", It = (n) => n === "float32" || n === "float16" || n === "int32" || n === "int64" || n === "uint32" || n === "uint64" || n === "int8" || n === "uint8" || n === "bool" || n === "uint4" || n === "int4", co = (n) => {
    switch (n) {
      case "none":
        return 0;
      case "cpu":
        return 1;
      case "cpu-pinned":
        return 2;
      case "texture":
        return 3;
      case "gpu-buffer":
        return 4;
      case "ml-tensor":
        return 5;
      default:
        throw new Error(`unsupported data location: ${n}`);
    }
  };
});
var Ke, cn = N(() => {
  "use strict";
  dt();
  Ke = async (n) => {
    if (typeof n == "string") if (false) ;
    else {
      let t = await fetch(n);
      if (!t.ok) throw new Error(`failed to load external data file: ${n}`);
      let a = t.headers.get("Content-Length"), u = a ? parseInt(a, 10) : 0;
      if (u < 1073741824) return new Uint8Array(await t.arrayBuffer());
      {
        if (!t.body) throw new Error(`failed to load external data file: ${n}, no response body.`);
        let o = t.body.getReader(), d;
        try {
          d = new ArrayBuffer(u);
        } catch (l) {
          if (l instanceof RangeError) {
            let m = Math.ceil(u / 65536);
            d = new WebAssembly.Memory({ initial: m, maximum: m }).buffer;
          } else throw l;
        }
        let c = 0;
        for (; ; ) {
          let { done: l, value: m } = await o.read();
          if (l) break;
          let h = m.byteLength;
          new Uint8Array(d, c, h).set(m), c += h;
        }
        return new Uint8Array(d, 0, u);
      }
    }
    else return n instanceof Blob ? new Uint8Array(await n.arrayBuffer()) : n instanceof Uint8Array ? n : new Uint8Array(n);
  };
});
var ys, ht, wt, $e, gs, lo, Ze, bt, yt, po, gt, Et, Tt, rn = N(() => {
  "use strict";
  Te();
  ao();
  io();
  fn();
  xe();
  vt();
  cn();
  ys = (n, t) => {
    z()._OrtInit(n, t) !== 0 && G("Can't initialize onnxruntime.");
  }, ht = async (n) => {
    ys(n.wasm.numThreads, fo(n.logLevel));
  }, wt = async (n, t) => {
    z().asyncInit?.();
    let a = n.webgpu.adapter;
    if (t === "webgpu") {
      if (typeof navigator > "u" || !navigator.gpu) throw new Error("WebGPU is not supported in current environment");
      if (a) {
        if (typeof a.limits != "object" || typeof a.features != "object" || typeof a.requestDevice != "function") throw new Error("Invalid GPU adapter set in `env.webgpu.adapter`. It must be a GPUAdapter object.");
      } else {
        let u = n.webgpu.powerPreference;
        if (u !== void 0 && u !== "low-power" && u !== "high-performance") throw new Error(`Invalid powerPreference setting: "${u}"`);
        let o = n.webgpu.forceFallbackAdapter;
        if (o !== void 0 && typeof o != "boolean") throw new Error(`Invalid forceFallbackAdapter setting: "${o}"`);
        if (a = await navigator.gpu.requestAdapter({ powerPreference: u, forceFallbackAdapter: o }), !a) throw new Error('Failed to get GPU adapter. You may need to enable flag "--enable-unsafe-webgpu" if you are using Chrome.');
      }
    }
    if (t === "webnn" && (typeof navigator > "u" || !navigator.ml)) throw new Error("WebNN is not supported in current environment");
  }, $e = /* @__PURE__ */ new Map(), gs = (n) => {
    let t = z(), a = t.stackSave();
    try {
      let u = t.PTR_SIZE, o = t.stackAlloc(2 * u);
      t._OrtGetInputOutputCount(n, o, o + u) !== 0 && G("Can't get session input/output count.");
      let c = u === 4 ? "i32" : "i64";
      return [Number(t.getValue(o, c)), Number(t.getValue(o + u, c))];
    } finally {
      t.stackRestore(a);
    }
  }, lo = (n, t) => {
    let a = z(), u = a.stackSave(), o = 0;
    try {
      let d = a.PTR_SIZE, c = a.stackAlloc(2 * d);
      a._OrtGetInputOutputMetadata(n, t, c, c + d) !== 0 && G("Can't get session input/output metadata.");
      let m = Number(a.getValue(c, "*"));
      o = Number(a.getValue(c + d, "*"));
      let h = a.HEAP32[o / 4];
      if (h === 0) return [m, 0];
      let g = a.HEAPU32[o / 4 + 1], b = [];
      for (let y = 0; y < g; y++) {
        let T = Number(a.getValue(o + 8 + y * d, "*"));
        b.push(T !== 0 ? a.UTF8ToString(T) : Number(a.getValue(o + 8 + (y + g) * d, "*")));
      }
      return [m, h, b];
    } finally {
      a.stackRestore(u), o !== 0 && a._OrtFree(o);
    }
  }, Ze = (n) => {
    let t = z(), a = t._malloc(n.byteLength);
    if (a === 0) throw new Error(`Can't create a session. failed to allocate a buffer of size ${n.byteLength}.`);
    return t.HEAPU8.set(n, a), [a, n.byteLength];
  }, bt = async (n, t) => {
    let a, u, o = z();
    Array.isArray(n) ? [a, u] = n : n.buffer === o.HEAPU8.buffer ? [a, u] = [n.byteOffset, n.byteLength] : [a, u] = Ze(n);
    let d = 0, c = 0, l = 0, m = [], h = [], g = [];
    try {
      if ([c, m] = await so(t), t?.externalData && o.mountExternalData) {
        let P = [];
        for (let k of t.externalData) {
          let w = typeof k == "string" ? k : k.path, Q = typeof k == "string" ? k : k.data;
          P.push(Ke(Q).then((H) => {
            o.mountExternalData(w, H);
          }));
        }
        await Promise.all(P);
      }
      for (let P of t?.executionProviders ?? []) if ((typeof P == "string" ? P : P.name) === "webnn") {
        if (o.shouldTransferToMLTensor = false, typeof P != "string") {
          let w = P, Q = w?.context, H = w?.gpuDevice, ne = w?.deviceType, pe = w?.powerPreference;
          Q ? o.currentContext = Q : H ? o.currentContext = await o.webnnCreateMLContext(H) : o.currentContext = await o.webnnCreateMLContext({ deviceType: ne, powerPreference: pe });
        } else o.currentContext = await o.webnnCreateMLContext();
        break;
      }
      d = await o._OrtCreateSession(a, u, c), o.webgpuOnCreateSession?.(d), d === 0 && G("Can't create a session."), o.jsepOnCreateSession?.(), o.currentContext && (o.webnnRegisterMLContext(d, o.currentContext), o.currentContext = void 0, o.shouldTransferToMLTensor = true);
      let [b, y] = gs(d), T = !!t?.enableGraphCapture, I = [], D = [], $ = [], v = [], A = [];
      for (let P = 0; P < b; P++) {
        let [k, w, Q] = lo(d, P);
        k === 0 && G("Can't get an input name."), h.push(k);
        let H = o.UTF8ToString(k);
        I.push(H), $.push(w === 0 ? { name: H, isTensor: false } : { name: H, isTensor: true, type: At(w), shape: Q });
      }
      for (let P = 0; P < y; P++) {
        let [k, w, Q] = lo(d, P + b);
        k === 0 && G("Can't get an output name."), g.push(k);
        let H = o.UTF8ToString(k);
        D.push(H), v.push(w === 0 ? { name: H, isTensor: false } : { name: H, isTensor: true, type: At(w), shape: Q });
      }
      return $e.set(d, [d, h, g, null, T, false]), [d, I, D, $, v];
    } catch (b) {
      throw h.forEach((y) => o._OrtFree(y)), g.forEach((y) => o._OrtFree(y)), l !== 0 && o._OrtReleaseBinding(l) !== 0 && G("Can't release IO binding."), d !== 0 && o._OrtReleaseSession(d) !== 0 && G("Can't release session."), b;
    } finally {
      o._free(a), c !== 0 && o._OrtReleaseSessionOptions(c) !== 0 && G("Can't release session options."), m.forEach((b) => o._free(b)), o.unmountExternalData?.();
    }
  }, yt = (n) => {
    let t = z(), a = $e.get(n);
    if (!a) throw new Error(`cannot release session. invalid session id: ${n}`);
    let [u, o, d, c, l] = a;
    c && (l && t._OrtClearBoundOutputs(c.handle) !== 0 && G("Can't clear bound outputs."), t._OrtReleaseBinding(c.handle) !== 0 && G("Can't release IO binding.")), t.jsepOnReleaseSession?.(n), t.webnnOnReleaseSession?.(n), t.webgpuOnReleaseSession?.(n), o.forEach((m) => t._OrtFree(m)), d.forEach((m) => t._OrtFree(m)), t._OrtReleaseSession(u) !== 0 && G("Can't release session."), $e.delete(n);
  }, po = async (n, t, a, u, o, d, c = false) => {
    if (!n) {
      t.push(0);
      return;
    }
    let l = z(), m = l.PTR_SIZE, h = n[0], g = n[1], b = n[3], y = b, T, I;
    if (h === "string" && (b === "gpu-buffer" || b === "ml-tensor")) throw new Error("String tensor is not supported on GPU.");
    if (c && b !== "gpu-buffer") throw new Error(`External buffer must be provided for input/output index ${d} when enableGraphCapture is true.`);
    if (b === "gpu-buffer") {
      let v = n[2].gpuBuffer;
      I = Ge(We(h), g);
      {
        let A = l.jsepRegisterBuffer;
        if (!A) throw new Error('Tensor location "gpu-buffer" is not supported without using WebGPU.');
        T = A(u, d, v, I);
      }
    } else if (b === "ml-tensor") {
      let v = n[2].mlTensor;
      I = Ge(We(h), g);
      let A = l.webnnRegisterMLTensor;
      if (!A) throw new Error('Tensor location "ml-tensor" is not supported without using WebNN.');
      T = A(u, v, We(h), g);
    } else {
      let v = n[2];
      if (Array.isArray(v)) {
        I = m * v.length, T = l._malloc(I), a.push(T);
        for (let A = 0; A < v.length; A++) {
          if (typeof v[A] != "string") throw new TypeError(`tensor data at index ${A} is not a string`);
          l.setValue(T + A * m, ae(v[A], a), "*");
        }
      } else {
        let A = l.webnnIsGraphInput, F = l.webnnIsGraphOutput;
        if (h !== "string" && A && F) {
          let P = l.UTF8ToString(o);
          if (A(u, P) || F(u, P)) {
            let k = We(h);
            I = Ge(k, g), y = "ml-tensor";
            let w = l.webnnCreateTemporaryTensor, Q = l.webnnUploadTensor;
            if (!w || !Q) throw new Error('Tensor location "ml-tensor" is not supported without using WebNN.');
            let H = await w(u, k, g);
            Q(H, new Uint8Array(v.buffer, v.byteOffset, v.byteLength)), T = H;
          } else I = v.byteLength, T = l._malloc(I), a.push(T), l.HEAPU8.set(new Uint8Array(v.buffer, v.byteOffset, I), T);
        } else I = v.byteLength, T = l._malloc(I), a.push(T), l.HEAPU8.set(new Uint8Array(v.buffer, v.byteOffset, I), T);
      }
    }
    let D = l.stackSave(), $ = l.stackAlloc(4 * g.length);
    try {
      g.forEach((A, F) => l.setValue($ + F * m, A, m === 4 ? "i32" : "i64"));
      let v = l._OrtCreateTensor(We(h), T, I, $, g.length, co(y));
      v === 0 && G(`Can't create tensor for input/output. session=${u}, index=${d}.`), t.push(v);
    } finally {
      l.stackRestore(D);
    }
  }, gt = async (n, t, a, u, o, d) => {
    let c = z(), l = c.PTR_SIZE, m = $e.get(n);
    if (!m) throw new Error(`cannot run inference. invalid session id: ${n}`);
    let h = m[0], g = m[1], b = m[2], y = m[3], T = m[4], I = m[5], D = t.length, $ = u.length, v = 0, A = [], F = [], P = [], k = [], w = [], Q = c.stackSave(), H = c.stackAlloc(D * l), ne = c.stackAlloc(D * l), pe = c.stackAlloc($ * l), B = c.stackAlloc($ * l);
    try {
      [v, A] = oo(d), Pe("wasm prepareInputOutputTensor");
      for (let O = 0; O < D; O++) await po(a[O], F, k, n, g[t[O]], t[O], T);
      for (let O = 0; O < $; O++) await po(o[O], P, k, n, b[u[O]], D + u[O], T);
      Ue("wasm prepareInputOutputTensor");
      for (let O = 0; O < D; O++) c.setValue(H + O * l, F[O], "*"), c.setValue(ne + O * l, g[t[O]], "*");
      for (let O = 0; O < $; O++) c.setValue(pe + O * l, P[O], "*"), c.setValue(B + O * l, b[u[O]], "*");
      c.jsepOnRunStart?.(h), c.webnnOnRunStart?.(h);
      let W;
      W = await c._OrtRun(h, ne, H, D, B, $, pe, v), W !== 0 && G("failed to call OrtRun().");
      let re = [], me = [];
      Pe("wasm ProcessOutputTensor");
      for (let O = 0; O < $; O++) {
        let K = Number(c.getValue(pe + O * l, "*"));
        if (K === P[O] || w.includes(P[O])) {
          re.push(o[O]), K !== P[O] && c._OrtReleaseTensor(K) !== 0 && G("Can't release tensor.");
          continue;
        }
        let je = c.stackSave(), ee = c.stackAlloc(4 * l), he = false, j, J = 0;
        try {
          c._OrtGetTensorData(K, ee, ee + l, ee + 2 * l, ee + 3 * l) !== 0 && G(`Can't access output tensor data on index ${O}.`);
          let Se = l === 4 ? "i32" : "i64", ve = Number(c.getValue(ee, Se));
          J = c.getValue(ee + l, "*");
          let Ve = c.getValue(ee + l * 2, "*"), Re = Number(c.getValue(ee + l * 3, Se)), te = [];
          for (let L = 0; L < Re; L++) te.push(Number(c.getValue(Ve + L * l, Se)));
          c._OrtFree(Ve) !== 0 && G("Can't free memory for tensor dims.");
          let ue = te.reduce((L, V) => L * V, 1);
          j = At(ve);
          let se = y?.outputPreferredLocations[u[O]];
          if (j === "string") {
            if (se === "gpu-buffer" || se === "ml-tensor") throw new Error("String tensor is not supported on GPU.");
            let L = [];
            for (let V = 0; V < ue; V++) {
              let fe = c.getValue(J + V * l, "*"), ye = c.getValue(J + (V + 1) * l, "*"), ce = V === ue - 1 ? void 0 : ye - fe;
              L.push(c.UTF8ToString(fe, ce));
            }
            re.push([j, te, L, "cpu"]);
          } else if (se === "gpu-buffer" && ue > 0) {
            let L = c.jsepGetBuffer;
            if (!L) throw new Error('preferredLocation "gpu-buffer" is not supported without using WebGPU.');
            let V = L(J), fe = Ge(ve, ue);
            if (fe === void 0 || !Ot(j)) throw new Error(`Unsupported data type: ${j}`);
            he = true, re.push([j, te, { gpuBuffer: V, download: c.jsepCreateDownloader(V, fe, j), dispose: () => {
              c._OrtReleaseTensor(K) !== 0 && G("Can't release tensor.");
            } }, "gpu-buffer"]);
          } else if (se === "ml-tensor" && ue > 0) {
            let L = c.webnnEnsureTensor, V = c.webnnIsGraphInputOutputTypeSupported;
            if (!L || !V) throw new Error('preferredLocation "ml-tensor" is not supported without using WebNN.');
            if (Ge(ve, ue) === void 0 || !It(j)) throw new Error(`Unsupported data type: ${j}`);
            if (!V(n, j, false)) throw new Error(`preferredLocation "ml-tensor" for ${j} output is not supported by current WebNN Context.`);
            let ye = await L(n, J, ve, te, false);
            he = true, re.push([j, te, { mlTensor: ye, download: c.webnnCreateMLTensorDownloader(J, j), dispose: () => {
              c.webnnReleaseTensorId(J), c._OrtReleaseTensor(K);
            } }, "ml-tensor"]);
          } else if (se === "ml-tensor-cpu-output" && ue > 0) {
            let L = c.webnnCreateMLTensorDownloader(J, j)(), V = re.length;
            he = true, me.push((async () => {
              let fe = [V, await L];
              return c.webnnReleaseTensorId(J), c._OrtReleaseTensor(K), fe;
            })()), re.push([j, te, [], "cpu"]);
          } else {
            let L = uo(j), V = new L(ue);
            new Uint8Array(V.buffer, V.byteOffset, V.byteLength).set(c.HEAPU8.subarray(J, J + V.byteLength)), re.push([j, te, V, "cpu"]);
          }
        } finally {
          c.stackRestore(je), j === "string" && J && c._free(J), he || c._OrtReleaseTensor(K);
        }
      }
      y && !T && (c._OrtClearBoundOutputs(y.handle) !== 0 && G("Can't clear bound outputs."), $e.set(n, [h, g, b, y, T, false]));
      for (let [O, K] of await Promise.all(me)) re[O][2] = K;
      return Ue("wasm ProcessOutputTensor"), re;
    } finally {
      c.webnnOnRunEnd?.(h), c.stackRestore(Q), F.forEach((W) => c._OrtReleaseTensor(W)), P.forEach((W) => c._OrtReleaseTensor(W)), k.forEach((W) => c._free(W)), v !== 0 && c._OrtReleaseRunOptions(v), A.forEach((W) => c._free(W));
    }
  }, Et = (n) => {
    let t = z(), a = $e.get(n);
    if (!a) throw new Error("invalid session id");
    let u = a[0], o = t._OrtEndProfiling(u);
    o === 0 && G("Can't get an profile file name."), t._OrtFree(o);
  }, Tt = (n) => {
    let t = [];
    for (let a of n) {
      let u = a[2];
      !Array.isArray(u) && "buffer" in u && t.push(u.buffer);
    }
    return t;
  };
});
var Me, ie, et, Lt, _t, Bt, ln, dn, ze, He, Ts, mo, ho, wo, bo, yo, go, Eo, pn = N(() => {
  "use strict";
  Te();
  rn();
  xe();
  pt();
  Me = () => !!Y.wasm.proxy && typeof document < "u", et = false, Lt = false, _t = false, dn = /* @__PURE__ */ new Map(), ze = (n, t) => {
    let a = dn.get(n);
    a ? a.push(t) : dn.set(n, [t]);
  }, He = () => {
    if (et || !Lt || _t || !ie) throw new Error("worker not ready");
  }, Ts = (n) => {
    switch (n.data.type) {
      case "init-wasm":
        et = false, n.data.err ? (_t = true, ln[1](n.data.err)) : (Lt = true, ln[0]()), Bt && (URL.revokeObjectURL(Bt), Bt = void 0);
        break;
      case "init-ep":
      case "copy-from":
      case "create":
      case "release":
      case "run":
      case "end-profiling": {
        let t = dn.get(n.data.type);
        n.data.err ? t.shift()[1](n.data.err) : t.shift()[0](n.data.out);
        break;
      }
      default:
    }
  }, mo = async () => {
    if (!Lt) {
      if (et) throw new Error("multiple calls to 'initWasm()' detected.");
      if (_t) throw new Error("previous call to 'initWasm()' failed.");
      if (et = true, Me()) return new Promise((n, t) => {
        ie?.terminate(), to().then(([a, u]) => {
          try {
            ie = u, ie.onerror = (d) => t(d), ie.onmessage = Ts, ln = [n, t];
            let o = { type: "init-wasm", in: Y };
            !o.in.wasm.wasmPaths && (a || an) && (o.in.wasm.wasmPaths = { wasm: new URL("" + new URL("ort-wasm-simd-threaded-4byDm7i3.wasm", import.meta.url).href, import.meta.url).href }), ie.postMessage(o), Bt = a;
          } catch (o) {
            t(o);
          }
        }, t);
      });
      try {
        await mt(Y.wasm), await ht(Y), Lt = true;
      } catch (n) {
        throw _t = true, n;
      } finally {
        et = false;
      }
    }
  }, ho = async (n) => {
    if (Me()) return He(), new Promise((t, a) => {
      ze("init-ep", [t, a]);
      let u = { type: "init-ep", in: { epName: n, env: Y } };
      ie.postMessage(u);
    });
    await wt(Y, n);
  }, wo = async (n) => Me() ? (He(), new Promise((t, a) => {
    ze("copy-from", [t, a]);
    let u = { type: "copy-from", in: { buffer: n } };
    ie.postMessage(u, [n.buffer]);
  })) : Ze(n), bo = async (n, t) => {
    if (Me()) {
      if (t?.preferredOutputLocation) throw new Error('session option "preferredOutputLocation" is not supported for proxy.');
      return He(), new Promise((a, u) => {
        ze("create", [a, u]);
        let o = { type: "create", in: { model: n, options: { ...t } } }, d = [];
        n instanceof Uint8Array && d.push(n.buffer), ie.postMessage(o, d);
      });
    } else return bt(n, t);
  }, yo = async (n) => {
    if (Me()) return He(), new Promise((t, a) => {
      ze("release", [t, a]);
      let u = { type: "release", in: n };
      ie.postMessage(u);
    });
    yt(n);
  }, go = async (n, t, a, u, o, d) => {
    if (Me()) {
      if (a.some((c) => c[3] !== "cpu")) throw new Error("input tensor on GPU is not supported for proxy.");
      if (o.some((c) => c)) throw new Error("pre-allocated output tensor is not supported for proxy.");
      return He(), new Promise((c, l) => {
        ze("run", [c, l]);
        let m = a, h = { type: "run", in: { sessionId: n, inputIndices: t, inputs: m, outputIndices: u, options: d } };
        ie.postMessage(h, Tt(m));
      });
    } else return gt(n, t, a, u, o, d);
  }, Eo = async (n) => {
    if (Me()) return He(), new Promise((t, a) => {
      ze("end-profiling", [t, a]);
      let u = { type: "end-profiling", in: n };
      ie.postMessage(u);
    });
    Et(n);
  };
});
var To, Ss, Dt, So = N(() => {
  "use strict";
  Te();
  pn();
  fn();
  dt();
  cn();
  To = (n, t) => {
    switch (n.location) {
      case "cpu":
        return [n.type, n.dims, n.data, "cpu"];
      case "gpu-buffer":
        return [n.type, n.dims, { gpuBuffer: n.gpuBuffer }, "gpu-buffer"];
      case "ml-tensor":
        return [n.type, n.dims, { mlTensor: n.mlTensor }, "ml-tensor"];
      default:
        throw new Error(`invalid data location: ${n.location} for ${t()}`);
    }
  }, Ss = (n) => {
    switch (n[3]) {
      case "cpu":
        return new de(n[0], n[2], n[1]);
      case "gpu-buffer": {
        let t = n[0];
        if (!Ot(t)) throw new Error(`not supported data type: ${t} for deserializing GPU tensor`);
        let { gpuBuffer: a, download: u, dispose: o } = n[2];
        return de.fromGpuBuffer(a, { dataType: t, dims: n[1], download: u, dispose: o });
      }
      case "ml-tensor": {
        let t = n[0];
        if (!It(t)) throw new Error(`not supported data type: ${t} for deserializing MLTensor tensor`);
        let { mlTensor: a, download: u, dispose: o } = n[2];
        return de.fromMLTensor(a, { dataType: t, dims: n[1], download: u, dispose: o });
      }
      default:
        throw new Error(`invalid data location: ${n[3]}`);
    }
  }, Dt = class {
    async fetchModelAndCopyToWasmMemory(t) {
      return wo(await Ke(t));
    }
    async loadModel(t, a) {
      _e();
      let u;
      typeof t == "string" ? u = await this.fetchModelAndCopyToWasmMemory(t) : u = t, [this.sessionId, this.inputNames, this.outputNames, this.inputMetadata, this.outputMetadata] = await bo(u, a), De();
    }
    async dispose() {
      return yo(this.sessionId);
    }
    async run(t, a, u) {
      _e();
      let o = [], d = [];
      Object.entries(t).forEach((y) => {
        let T = y[0], I = y[1], D = this.inputNames.indexOf(T);
        if (D === -1) throw new Error(`invalid input '${T}'`);
        o.push(I), d.push(D);
      });
      let c = [], l = [];
      Object.entries(a).forEach((y) => {
        let T = y[0], I = y[1], D = this.outputNames.indexOf(T);
        if (D === -1) throw new Error(`invalid output '${T}'`);
        c.push(I), l.push(D);
      });
      let m = o.map((y, T) => To(y, () => `input "${this.inputNames[d[T]]}"`)), h = c.map((y, T) => y ? To(y, () => `output "${this.outputNames[l[T]]}"`) : null), g = await go(this.sessionId, d, m, l, h, u), b = {};
      for (let y = 0; y < g.length; y++) b[this.outputNames[l[y]]] = c[y] ?? Ss(g[y]);
      return De(), b;
    }
    startProfiling() {
    }
    endProfiling() {
      Eo(this.sessionId);
    }
  };
});
var Ao = {};
ut(Ao, { OnnxruntimeWebAssemblyBackend: () => Pt, initializeFlags: () => vo, wasmBackend: () => vs });
var vo, Pt, vs, Oo = N(() => {
  "use strict";
  Te();
  pn();
  So();
  vo = () => {
    (typeof Y.wasm.initTimeout != "number" || Y.wasm.initTimeout < 0) && (Y.wasm.initTimeout = 0);
    let n = Y.wasm.simd;
    if (typeof n != "boolean" && n !== void 0 && n !== "fixed" && n !== "relaxed" && (console.warn(`Property "env.wasm.simd" is set to unknown value "${n}". Reset it to \`false\` and ignore SIMD feature checking.`), Y.wasm.simd = false), typeof Y.wasm.proxy != "boolean" && (Y.wasm.proxy = false), typeof Y.wasm.trace != "boolean" && (Y.wasm.trace = false), typeof Y.wasm.numThreads != "number" || !Number.isInteger(Y.wasm.numThreads) || Y.wasm.numThreads <= 0) if (typeof self < "u" && !self.crossOriginIsolated) Y.wasm.numThreads = 1;
    else {
      let t = typeof navigator > "u" ? Jt("node:os").cpus().length : navigator.hardwareConcurrency;
      Y.wasm.numThreads = Math.min(4, Math.ceil((t || 1) / 2));
    }
  }, Pt = class {
    async init(t) {
      vo(), await mo(), await ho(t);
    }
    async createInferenceSessionHandler(t, a) {
      let u = new Dt();
      return await u.loadModel(t, a), u;
    }
  }, vs = new Pt();
});
Te();
Te();
Te();
var $r = "1.31.0-dev.20260914-8d85527a0";
var iu = nn;
{
  let n = (Oo(), Xt(Ao)).wasmBackend;
  Je("cpu", n, 10), Je("wasm", n, 10);
}
Object.defineProperty(Y.versions, "web", { value: $r, enumerable: true });
var ONNX_WEB = /* @__PURE__ */ Object.freeze({
  __proto__: null,
  get InferenceSession() {
    return rs;
  },
  get TRACE() {
    return Cr;
  },
  get TRACE_EVENT_BEGIN() {
    return Pe;
  },
  get TRACE_EVENT_END() {
    return Ue;
  },
  get TRACE_FUNC_BEGIN() {
    return _e;
  },
  get TRACE_FUNC_END() {
    return De;
  },
  get Tensor() {
    return de;
  },
  default: iu,
  get env() {
    return Y;
  },
  get registerBackend() {
    return Je;
  }
});
const CONTENT_TYPE_MAP$1 = {
  txt: "text/plain",
  html: "text/html",
  css: "text/css",
  js: "text/javascript",
  json: "application/json",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif"
};
class FileResponse {
  /**
   * Creates a new `FileResponse` object.
   * @param {string} filePath
   */
  constructor(filePath) {
    this.filePath = filePath;
    this.headers = new Headers();
    this.exists = sharp.existsSync(filePath);
    if (this.exists) {
      this.status = 200;
      this.statusText = "OK";
      let stats = sharp.statSync(filePath);
      this.headers.set("content-length", stats.size.toString());
      this.updateContentType();
      const stream = sharp.createReadStream(filePath);
      this.body = new ReadableStream({
        start(controller) {
          stream.on("data", (chunk) => controller.enqueue(chunk));
          stream.on("end", () => controller.close());
          stream.on("error", (err) => controller.error(err));
        },
        cancel() {
          stream.destroy();
        }
      });
    } else {
      this.status = 404;
      this.statusText = "Not Found";
      this.body = null;
    }
  }
  /**
   * Updates the 'content-type' header property of the response based on the extension of
   * the file specified by the filePath property of the current object.
   * @returns {void}
   */
  updateContentType() {
    const extension = this.filePath.toString().split(".").pop().toLowerCase();
    this.headers.set("content-type", CONTENT_TYPE_MAP$1[extension] ?? "application/octet-stream");
  }
  /**
   * Clone the current FileResponse object.
   * @returns {FileResponse} A new FileResponse object with the same properties as the current object.
   */
  clone() {
    let response = new FileResponse(this.filePath);
    response.exists = this.exists;
    response.status = this.status;
    response.statusText = this.statusText;
    response.headers = new Headers(this.headers);
    return response;
  }
  /**
   * Reads the contents of the file specified by the filePath property and returns a Promise that
   * resolves with an ArrayBuffer containing the file's contents.
   * @returns {Promise<ArrayBuffer>} A Promise that resolves with an ArrayBuffer containing the file's contents.
   * @throws {Error} If the file cannot be read.
   */
  async arrayBuffer() {
    const data = await sharp.promises.readFile(this.filePath);
    return (
      /** @type {ArrayBuffer} */
      data.buffer
    );
  }
  /**
   * Reads the contents of the file specified by the filePath property and returns a Promise that
   * resolves with a Blob containing the file's contents.
   * @returns {Promise<Blob>} A Promise that resolves with a Blob containing the file's contents.
   * @throws {Error} If the file cannot be read.
   */
  async blob() {
    const data = await sharp.promises.readFile(this.filePath);
    return new Blob([
      /** @type {any} */
      data
    ], { type: this.headers.get("content-type") });
  }
  /**
   * Reads the contents of the file specified by the filePath property and returns a Promise that
   * resolves with a string containing the file's contents.
   * @returns {Promise<string>} A Promise that resolves with a string containing the file's contents.
   * @throws {Error} If the file cannot be read.
   */
  async text() {
    return await sharp.promises.readFile(this.filePath, "utf8");
  }
  /**
   * Reads the contents of the file specified by the filePath property and returns a Promise that
   * resolves with a parsed JavaScript object containing the file's contents.
   *
   * @returns {Promise<Object>} A Promise that resolves with a parsed JavaScript object containing the file's contents.
   * @throws {Error} If the file cannot be read.
   */
  async json() {
    return JSON.parse(await this.text());
  }
}
class Random {
  constructor(seed) {
    this._mt = new Uint32Array(624);
    this._idx = 625;
    this._gauss_next = null;
    this._random_fn = this.random.bind(this);
    this.seed(seed);
  }
  /**
   * Seeds this instance's PRNG.
   *
   * When called with a number, initializes the state deterministically from that value.
   * When called with no arguments (or `undefined`/`null`), seeds from OS entropy
   * via `crypto.getRandomValues`, matching Python's `random.seed()` behavior.
   *
   * @param {number} [n] The seed value. Omit to seed from OS entropy.
   */
  seed(n) {
    if (n === void 0 || n === null) {
      if (apis.IS_CRYPTO_AVAILABLE) {
        const buf = new Uint32Array(1);
        crypto.getRandomValues(buf);
        n = buf[0];
      } else {
        n = Date.now() >>> 0;
      }
    }
    const mt2 = this._mt;
    const u = (a, b) => Math.imul(a, b) >>> 0, key = [];
    for (let v = n || 0; v > 0; v = Math.floor(v / 4294967296)) key.push(v & 4294967295);
    if (!key.length) key.push(0);
    mt2[0] = 19650218;
    for (let k = 1; k < 624; ++k) mt2[k] = u(1812433253, mt2[k - 1] ^ mt2[k - 1] >>> 30) + k >>> 0;
    let i = 1, j = 0;
    for (let k = Math.max(624, key.length); k > 0; --k, ++i, ++j) {
      if (i >= 624) {
        mt2[0] = mt2[623];
        i = 1;
      }
      if (j >= key.length) j = 0;
      mt2[i] = (mt2[i] ^ u(mt2[i - 1] ^ mt2[i - 1] >>> 30, 1664525)) + key[j] + j >>> 0;
    }
    for (let k = 623; k > 0; --k, ++i) {
      if (i >= 624) {
        mt2[0] = mt2[623];
        i = 1;
      }
      mt2[i] = (mt2[i] ^ u(mt2[i - 1] ^ mt2[i - 1] >>> 30, 1566083941)) - i >>> 0;
    }
    mt2[0] = 2147483648;
    this._idx = 624;
    this._gauss_next = null;
  }
  /**
   * Generates a random unsigned 32-bit integer.
   *
   * Performs the "twist" step when the state buffer is exhausted,
   * then applies the standard MT19937 tempering transform.
   *
   * @returns {number} A random integer in the range [0, 2^32 - 1].
   * @internal
   */
  _int32() {
    const mt2 = this._mt;
    if (this._idx >= 624) {
      for (let k = 0; k < 624; ++k) {
        const y2 = mt2[k] & 2147483648 | mt2[(k + 1) % 624] & 2147483647;
        mt2[k] = (mt2[(k + 397) % 624] ^ y2 >>> 1 ^ (y2 & 1 ? 2567483615 : 0)) >>> 0;
      }
      this._idx = 0;
    }
    let y = mt2[this._idx++];
    y ^= y >>> 11;
    y ^= y << 7 & 2636928640;
    y ^= y << 15 & 4022730752;
    y ^= y >>> 18;
    return y >>> 0;
  }
  /**
   * Generates a random floating-point number in the half-open interval [0, 1).
   *
   * Combines two 32-bit integers (using 53 bits of precision) to produce
   * a uniformly distributed double, matching Python's `random.random()`.
   *
   * @returns {number} A random float in [0, 1).
   */
  random() {
    return ((this._int32() >>> 5) * 67108864 + (this._int32() >>> 6)) / 9007199254740992;
  }
  /**
   * Generates a random number from a Gaussian (normal) distribution.
   *
   * Uses the Box-Muller transform with a cached spare value,
   * matching Python's `random.gauss()` output for the same seed.
   *
   * @param {number} [mu=0] The mean of the distribution.
   * @param {number} [sigma=1] The standard deviation of the distribution.
   * @returns {number} A normally distributed random value.
   */
  gauss(mu = 0, sigma = 1) {
    let z2 = this._gauss_next;
    this._gauss_next = null;
    if (z2 === null) {
      const x2pi = this.random() * 2 * Math.PI, g2rad = Math.sqrt(-2 * Math.log(1 - this.random()));
      z2 = Math.cos(x2pi) * g2rad;
      this._gauss_next = Math.sin(x2pi) * g2rad;
    }
    return mu + z2 * sigma;
  }
  /**
   * Shuffles an array in-place using the Fisher-Yates algorithm.
   *
   * Uses rejection sampling via `getrandbits`-style bit masking to ensure
   * a uniform distribution, matching Python's `random.shuffle()`.
   *
   * @param {any[]} arr The array to shuffle in-place.
   */
  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; --i) {
      const k = 32 - Math.clz32(i + 1);
      let r = this._int32() >>> 32 - k;
      while (r > i) r = this._int32() >>> 32 - k;
      const t = arr[i];
      arr[i] = arr[r];
      arr[r] = t;
    }
  }
  /**
   * Selects a single element from a weighted population.
   *
   * Matches Python's `random.choices(population, weights=weights, k=1)[0]`
   *
   * @param {any[]} population The array of items to choose from.
   * @param {number[]} weights An array of non-negative weights, one per population element.
   * @returns {*} A single randomly selected element from the population.
   */
  choices(population, weights) {
    return population[_weightedIndexWith(this._random_fn, weights)];
  }
}
function _weightedIndexWith(randomFn, weights) {
  let sum = 0;
  for (let i = 0; i < weights.length; ++i) sum += weights[i];
  let x = randomFn() * sum;
  for (let i = 0; i < weights.length; ++i) {
    x -= weights[i];
    if (x < 0) return i;
  }
  return weights.length - 1;
}
const _default = new Random();
const random = Object.freeze({
  Random,
  seed: _default.seed.bind(_default),
  random: _default.random.bind(_default),
  gauss: _default.gauss.bind(_default),
  shuffle: _default.shuffle.bind(_default),
  choices: _default.choices.bind(_default)
});
const _weightedIndex = (weights) => _weightedIndexWith(random.random, weights);
const rng = new Random();
class FileCache {
  /**
   * Instantiate a `FileCache` object.
   * @param {string} path
   */
  constructor(path) {
    this.path = path;
  }
  /**
   * Checks whether the given request is in the cache.
   * @param {string} request
   * @returns {Promise<FileResponse | undefined>}
   */
  async match(request) {
    let filePath = sharp.join(this.path, request);
    let file = new FileResponse(filePath);
    if (file.exists) {
      return file;
    } else {
      return void 0;
    }
  }
  /**
   * Adds the given response to the cache.
   * @param {string} request
   * @param {Response} response
   * @param {(data: {progress: number, loaded: number, total: number}) => void} [progress_callback] Optional.
   * The function to call with progress updates
   * @returns {Promise<void>}
   */
  async put(request, response, progress_callback = void 0) {
    const filePath = sharp.join(this.path, request);
    const id = apis.IS_PROCESS_AVAILABLE ? process.pid : Date.now();
    const randomSuffix = rng._int32().toString(36);
    const tmpPath = filePath + `.tmp.${id}.${randomSuffix}`;
    try {
      const contentLength = response.headers.get("Content-Length");
      const total = parseInt(contentLength ?? "0");
      let loaded = 0;
      await sharp.promises.mkdir(sharp.dirname(filePath), { recursive: true });
      const fileStream = sharp.createWriteStream(tmpPath);
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        await new Promise((resolve, reject) => {
          fileStream.write(value, (err) => {
            if (err) {
              reject(err);
              return;
            }
            resolve();
          });
        });
        loaded += value.length;
        const progress2 = total ? loaded / total * 100 : 0;
        progress_callback?.({ progress: progress2, loaded, total });
      }
      await new Promise((resolve, reject) => {
        fileStream.close((err) => err ? reject(err) : resolve());
      });
      await sharp.promises.rename(tmpPath, filePath);
    } catch (error) {
      try {
        await sharp.promises.unlink(tmpPath);
      } catch {
      }
      throw error;
    }
  }
  /**
   * Deletes the cache entry for the given request.
   * @param {string} request
   * @returns {Promise<boolean>} A Promise that resolves to `true` if the cache entry was deleted, `false` otherwise.
   */
  async delete(request) {
    let filePath = sharp.join(this.path, request);
    try {
      await sharp.promises.unlink(filePath);
      return true;
    } catch (error) {
      return false;
    }
  }
  // TODO add the rest?
  // addAll(requests: RequestInfo[]): Promise<void>;
  // keys(request?: RequestInfo | URL, options?: CacheQueryOptions): Promise<ReadonlyArray<Request>>;
  // match(request: RequestInfo | URL, options?: CacheQueryOptions): Promise<Response | undefined>;
  // matchAll(request?: RequestInfo | URL, options?: CacheQueryOptions): Promise<ReadonlyArray<Response>>;
}
const logger = {
  /**
   * Log an error message. Only suppressed when logLevel is NONE.
   * @param  {...any} args - Arguments to log
   */
  error(...args) {
    if (env.logLevel <= LogLevel.ERROR) {
      console.error(...args);
    }
  },
  /**
   * Log a warning message. Shown when logLevel <= WARNING.
   * @param  {...any} args - Arguments to log
   */
  warn(...args) {
    if (env.logLevel <= LogLevel.WARNING) {
      console.warn(...args);
    }
  },
  /**
   * Log an info message. Shown when logLevel <= INFO.
   * @param  {...any} args - Arguments to log
   */
  info(...args) {
    if (env.logLevel <= LogLevel.INFO) {
      console.log(...args);
    }
  },
  /**
   * Log a debug message. Only shown when logLevel is DEBUG.
   * @param  {...any} args - Arguments to log
   */
  debug(...args) {
    if (env.logLevel <= LogLevel.DEBUG) {
      console.log(...args);
    }
  },
  /**
   * Log a message (alias for info). Shown when logLevel <= INFO.
   * @param  {...any} args - Arguments to log
   */
  log(...args) {
    this.info(...args);
  }
};
const HASH_ALGORITHM = "SHA-256";
const HASH_CACHE_NAME = "experimental_transformers-hash-cache";
const makeHashDescriptor = (value) => ({ algorithm: HASH_ALGORITHM, value });
class CrossOriginStorage {
  /** @type {Promise<Cache> | null} */
  #hashCache = null;
  /**
   * Returns (and lazily opens) the hash cache, reusing the same promise across concurrent callers.
   * @returns {Promise<Cache>}
   */
  _getHashCache = () => {
    this.#hashCache ??= caches.open(HASH_CACHE_NAME);
    return this.#hashCache;
  };
  /**
   * Returns whether the `navigator.crossOriginStorage` API is available in the current environment.
   * @returns {boolean}
   */
  static isAvailable = () => typeof navigator !== "undefined" && "crossOriginStorage" in navigator;
  /**
   * Looks up a cached response for the given URL by resolving its SHA-256 hash and requesting
   * the corresponding file handle from cross-origin storage.
   *
   * Implements `CacheInterface.match`.
   *
   * @param {string} request The URL of the resource to look up.
   * @returns {Promise<Response|undefined>} The cached `Response`, or `undefined` if not found.
   */
  match = async (request) => {
    const hashValue = await this._getFileHash(request);
    if (!hashValue) {
      return void 0;
    }
    try {
      const handle = await navigator.crossOriginStorage.requestFileHandle(makeHashDescriptor(hashValue));
      const blob = await handle.getFile();
      return new Response(blob, {
        headers: {
          "Content-Length": String(blob.size)
        }
      });
    } catch {
      return void 0;
    }
  };
  /**
   * Stores a response in cross-origin storage, keyed by its SHA-256 hash.
   *
   * For LFS-backed URLs the hash is resolved cheaply via `_getFileHash` (which checks
   * `HASH_CACHE_NAME` first, then falls back to fetching the Git LFS pointer file)
   * without reading the response body a second time.
   *
   * For non-LFS resources the hash is unknown upfront.  In that case the body is consumed
   * in the background: the stream is read to compute the content hash, the file is written
   * into cross-origin storage, and the computed hash is persisted to `HASH_CACHE_NAME`
   * so that future `match` calls can resolve the file without a network round-trip.
   *
   * Implements `CacheInterface.put`.
   *
   * @param {string} request The URL of the resource (used as the hash-cache key).
   * @param {Response} response The response whose body will be written to the cache.
   * @returns {Promise<void>}
   */
  put = async (request, response) => {
    const hashValue = await this._getFileHash(request);
    if (hashValue) {
      const blob = await response.blob();
      await this._storeBlobInCOS(blob, hashValue);
    } else {
      this._processAndStore(request, response.body);
    }
  };
  /**
   * Writes a blob into cross-origin storage using the given pre-computed hex hash string.
   *
   * @param {Blob} blob
   * @param {string} hashHex Hex-encoded SHA-256 hash of `blob`.
   * @returns {Promise<void>}
   */
  _storeBlobInCOS = async (blob, hashHex) => {
    const handle = await navigator.crossOriginStorage.requestFileHandle(makeHashDescriptor(hashHex), {
      create: true,
      origins: "*"
    });
    const writableStream = await handle.createWritable();
    await writableStream.write(blob);
    await writableStream.close();
  };
  /**
   * Background task for non-LFS resources: consumes `stream`, computes the SHA-256 hash
   * of the resulting blob, stores it in cross-origin storage, and persists the computed
   * hash to `HASH_CACHE_NAME` keyed by `request` so future `match` calls can resolve the
   * file without a network round-trip.
   *
   * Called fire-and-forget from `put` — errors are swallowed so failures never surface to
   * the caller.
   *
   * @param {string} request The original resource URL.
   * @param {ReadableStream} stream The response body stream to consume.
   * @returns {Promise<void>}
   */
  _processAndStore = async (request, stream) => {
    try {
      const chunks = [];
      for await (const chunk of stream) {
        chunks.push(chunk);
      }
      const blob = new Blob(chunks);
      const hashHex = await this._getBlobHash(blob);
      await this._storeBlobInCOS(blob, hashHex);
      try {
        const hashCache = await this._getHashCache();
        await hashCache.put(request, new Response(hashHex));
      } catch {
      }
    } catch {
    }
  };
  /**
   * Deletes the cache entry for the given request.
   *
   * Removes the hash entry from `HASH_CACHE_NAME`. Note: cross-origin storage itself does not
   * expose a delete API, so only the local hash mapping is removed. For non-LFS URLs this
   * permanently prevents `match` from resolving the file. For LFS-backed URLs, `match` will
   * re-fetch the LFS pointer file on the next call and repopulate the hash cache automatically.
   *
   * Implements `CacheInterface.delete`.
   *
   * @param {string} request
   * @returns {Promise<boolean>} Resolves to `true` if the hash entry was deleted, `false` otherwise.
   */
  delete = async (request) => {
    try {
      const hashCache = await this._getHashCache();
      return await hashCache.delete(request);
    } catch {
      return false;
    }
  };
  /**
   * Resolves the SHA-256 hash for a given URL.
   *
   * Returns the cached hash immediately if one has been persisted to `HASH_CACHE_NAME`.
   * Otherwise falls back to `_getLfsFileHash` to retrieve the hash from the Hugging Face
   * LFS pointer file, persisting the result to `HASH_CACHE_NAME` for future lookups.
   *
   * Returns `null` if the hash cannot be determined (e.g. non-LFS URL with no cached entry).
   *
   * @param {string} url The resource URL to resolve a hash for.
   * @returns {Promise<string|null>} The hex-encoded SHA-256 hash, or `null` if unavailable.
   */
  _getFileHash = async (url) => {
    try {
      const hashCache = await this._getHashCache();
      const cached = await hashCache.match(url);
      if (cached) {
        return cached.text();
      }
      const hash = await this._getLfsFileHash(url);
      if (hash) {
        await hashCache.put(url, new Response(hash));
        return hash;
      }
      return null;
    } catch {
      return null;
    }
  };
  /**
   * Attempts to retrieve the SHA-256 hash for a Hugging Face resource URL from its raw
   * Git LFS pointer file.
   *
   * Only applicable to URLs containing `/resolve/` (i.e. Hugging Face resolved file URLs).
   * The `/resolve/` segment is rewritten to `/raw/` to fetch the LFS pointer directly.
   * Returns `null` for non-LFS URLs or when the network request fails.
   *
   * @see https://huggingface.co/docs/hub/en/storage-backends#xet
   * @param {string} url The resolved Hugging Face URL of the resource.
   * @returns {Promise<string|null>} The hex-encoded SHA-256 hash, or `null` if unavailable.
   */
  _getLfsFileHash = async (url) => {
    if (!url.includes("/resolve/")) {
      return null;
    }
    const rawUrl = url.replace("/resolve/", "/raw/");
    try {
      const text = await fetch(rawUrl).then((r) => r.text());
      const match = text.match(/^oid sha256:([0-9a-f]+)$/m);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  };
  /**
   * Computes the SHA-256 hash of a `Blob`'s contents.
   *
   * @param {Blob} blob The blob to hash.
   * @returns {Promise<string>} The lowercase hex-encoded SHA-256 hash.
   */
  _getBlobHash = async (blob) => {
    const arrayBuffer = await blob.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest(HASH_ALGORITHM, arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((byte) => byte.toString(16).padStart(2, "0")).join("");
  };
}
async function getCache(file_cache_dir = null) {
  let cache2 = null;
  if (env.useCustomCache) {
    if (!env.customCache) {
      throw Error("`env.useCustomCache=true`, but `env.customCache` is not defined.");
    }
    if (!env.customCache.match || !env.customCache.put) {
      throw new Error(
        "`env.customCache` must be an object which implements the `match` and `put` functions of the Web Cache API. For more information, see https://developer.mozilla.org/en-US/docs/Web/API/Cache"
      );
    }
    cache2 = env.customCache;
  }
  if (!cache2 && env.experimental_useCrossOriginStorage && CrossOriginStorage.isAvailable()) {
    cache2 = new CrossOriginStorage();
  }
  if (!cache2 && env.useBrowserCache) {
    if (typeof caches === "undefined") {
      throw Error("Browser cache is not available in this environment.");
    }
    try {
      cache2 = await caches.open(env.cacheKey);
    } catch (e) {
      logger.warn("An error occurred while opening the browser cache:", e);
    }
  }
  if (!cache2 && env.useFSCache) {
    if (!apis.IS_FS_AVAILABLE) {
      throw Error("File System Cache is not available in this environment.");
    }
    cache2 = new FileCache(file_cache_dir ?? env.cacheDir);
  }
  return cache2;
}
async function tryCache(cache2, ...names) {
  for (let name2 of names) {
    try {
      let result = await cache2.match(name2);
      if (result) return result;
    } catch (e) {
      continue;
    }
  }
  return void 0;
}
async function loadAndCacheFile(url) {
  const fileName = url.split("/").pop();
  let cache2;
  try {
    cache2 = await getCache();
    if (cache2) {
      const result = await cache2.match(url);
      if (result) {
        return result;
      }
    }
  } catch (error) {
    logger.warn(`Failed to load ${fileName} from cache:`, error);
  }
  const response = await env.fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${fileName}: ${response.status} ${response.statusText}`);
  }
  if (cache2) {
    try {
      await cache2.put(url, response.clone());
    } catch (e) {
      logger.warn(`Failed to cache ${fileName}:`, e);
    }
  }
  return response;
}
async function loadWasmBinary(wasmURL) {
  const response = await loadAndCacheFile(wasmURL);
  if (!response || typeof response === "string") return null;
  try {
    return await response.arrayBuffer();
  } catch (error) {
    logger.warn("Failed to read WASM binary:", error);
    return null;
  }
}
async function loadWasmFactory(libURL) {
  if (apis.IS_SERVICE_WORKER_ENV || apis.IS_CHROME_AVAILABLE) {
    return libURL;
  }
  const response = await loadAndCacheFile(libURL);
  if (!response || typeof response === "string") return null;
  try {
    let code = await response.text();
    code = code.replaceAll("globalThis.process?.versions?.node", "false");
    const blob = new Blob([code], { type: "text/javascript" });
    return URL.createObjectURL(blob);
  } catch (error) {
    logger.warn("Failed to read WASM factory:", error);
    return null;
  }
}
const ERROR_MAPPING = {
  // 4xx errors (https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#client_error_responses)
  400: "Bad request error occurred while trying to load file",
  401: "Unauthorized access to file",
  403: "Forbidden access to file",
  404: "Could not locate file",
  408: "Request timeout error occurred while trying to load file",
  // 5xx errors (https://developer.mozilla.org/en-US/docs/Web/HTTP/Status#server_error_responses)
  500: "Internal server error error occurred while trying to load file",
  502: "Bad gateway error occurred while trying to load file",
  503: "Service unavailable error occurred while trying to load file",
  504: "Gateway timeout error occurred while trying to load file"
};
const MAX_EXTERNAL_DATA_CHUNKS = 100;
const REPO_ID_REGEX = /^(\b[\w\-.]+\b\/)?\b[\w\-.]{1,96}\b$/;
function pathJoin(...parts) {
  parts = parts.map((part, index) => {
    if (index) {
      part = part.replace(new RegExp("^/"), "");
    }
    if (index !== parts.length - 1) {
      part = part.replace(new RegExp("/$"), "");
    }
    return part;
  });
  return parts.join("/");
}
function isValidUrl(string, protocols = null, validHosts = null) {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  if (protocols && !protocols.includes(url.protocol)) {
    return false;
  }
  if (validHosts && !validHosts.includes(url.hostname)) {
    return false;
  }
  return true;
}
function isValidHfModelId(string) {
  if (!REPO_ID_REGEX.test(string)) return false;
  if (string.includes("..") || string.includes("--")) return false;
  if (string.endsWith(".git") || string.endsWith(".ipynb")) return false;
  return true;
}
function makePretrainedOptionsKey(model_id, options = {}, ...parts) {
  return JSON.stringify([
    model_id,
    options.revision ?? "main",
    options.cache_dir ?? null,
    options.local_files_only ?? false,
    ...parts
  ]);
}
class ModelFileNotFoundError extends Error {
  /**
   * @param {string} message The error message.
   * @param {Object} [options] Additional error information.
   * @param {number|null} [options.status=null] The HTTP status code, when the failure came from a Hub response.
   */
  constructor(message, { status = null } = {}) {
    super(message);
    this.name = "ModelFileNotFoundError";
    this.status = status;
  }
}
const NOT_FOUND_STATUSES = /* @__PURE__ */ new Set([401, 403, 404]);
function handleError(status, remoteURL, fatal) {
  if (!fatal) {
    return null;
  }
  const message = ERROR_MAPPING[status] ?? `Error (${status}) occurred while trying to load file`;
  const fullMessage = `${message}: "${remoteURL}".`;
  if (NOT_FOUND_STATUSES.has(status)) {
    throw new ModelFileNotFoundError(fullMessage, { status });
  }
  throw Error(fullMessage);
}
async function readResponse(response, progress_callback, expectedSize) {
  const contentLength = response.headers.get("Content-Length");
  let total = contentLength ? parseInt(contentLength, 10) : expectedSize ?? 0;
  if (contentLength === null && !expectedSize) {
    logger.warn("Unable to determine content-length from response headers. Will expand buffer when needed.");
  }
  let buffer = new Uint8Array(total);
  let loaded = 0;
  const reader = response.body.getReader();
  async function read() {
    const { done, value } = await reader.read();
    if (done) return;
    const newLoaded = loaded + value.length;
    if (newLoaded > total) {
      total = newLoaded;
      const newBuffer = new Uint8Array(total);
      newBuffer.set(buffer);
      buffer = newBuffer;
    }
    buffer.set(value, loaded);
    loaded = newLoaded;
    const progress2 = loaded / total * 100;
    progress_callback({ progress: progress2, loaded, total });
    return read();
  }
  await read();
  return buffer;
}
function isBlobURL(url) {
  return isValidUrl(url, ["blob:"]);
}
function toAbsoluteURL(url, { allowUnresolved = false } = {}) {
  let baseURL;
  if (typeof location !== "undefined" && location.href) {
    baseURL = location.href;
  } else if (typeof import.meta !== "undefined" && import.meta.url) {
    baseURL = import.meta.url;
  } else {
    return url;
  }
  try {
    return new URL(url, baseURL).href;
  } catch (error) {
    if (!allowUnresolved) {
      throw error;
    }
    return url;
  }
}
const DEVICE_TO_EXECUTION_PROVIDER_MAPPING = Object.freeze({
  auto: null,
  // Auto-detect based on device and environment
  gpu: null,
  // Auto-detect GPU
  cpu: "cpu",
  // CPU
  wasm: "wasm",
  // WebAssembly
  webgpu: "webgpu",
  // WebGPU
  cuda: "cuda",
  // CUDA
  dml: "dml",
  // DirectML
  coreml: "coreml",
  // CoreML
  webnn: { name: "webnn", deviceType: "cpu" },
  // WebNN (default)
  "webnn-npu": { name: "webnn", deviceType: "npu" },
  // WebNN NPU
  "webnn-gpu": { name: "webnn", deviceType: "gpu" },
  // WebNN GPU
  "webnn-cpu": { name: "webnn", deviceType: "cpu" }
  // WebNN CPU
});
function getOnnxLogSeverityLevel(logLevel2) {
  if (logLevel2 <= LogLevel.DEBUG) {
    return 0;
  } else if (logLevel2 <= LogLevel.INFO) {
    return 2;
  } else if (logLevel2 <= LogLevel.WARNING) {
    return 3;
  } else if (logLevel2 <= LogLevel.ERROR) {
    return 3;
  } else {
    return 4;
  }
}
const ONNX_LOG_LEVEL_NAMES = {
  0: "verbose",
  1: "info",
  2: "warning",
  3: "error",
  4: "fatal"
};
const supportedDevices = [];
let defaultDevices;
let ONNX;
const ORT_SYMBOL = Symbol.for("onnxruntime");
if (ORT_SYMBOL in globalThis) {
  ONNX = globalThis[ORT_SYMBOL];
} else if (apis.IS_NODE_ENV) {
  ONNX = sharp;
  switch (process.platform) {
    case "win32":
      supportedDevices.push("dml");
      break;
    case "linux":
      if (process.arch === "x64") {
        supportedDevices.push("cuda");
      }
      break;
    case "darwin":
      supportedDevices.push("coreml");
      break;
  }
  supportedDevices.push("webgpu");
  supportedDevices.push("cpu");
  defaultDevices = ["cpu"];
} else {
  ONNX = ONNX_WEB;
  if (apis.IS_WEBNN_AVAILABLE) {
    supportedDevices.push("webnn-npu", "webnn-gpu", "webnn-cpu", "webnn");
  }
  if (apis.IS_WEBGPU_AVAILABLE) {
    supportedDevices.push("webgpu");
  }
  supportedDevices.push("wasm");
  defaultDevices = ["wasm"];
}
const InferenceSession = ONNX.InferenceSession;
function deviceToExecutionProviders(device = null) {
  if (!device) return defaultDevices;
  switch (device) {
    case "auto":
      return supportedDevices;
    case "gpu":
      return supportedDevices.filter((x) => ["webgpu", "cuda", "dml", "webnn-gpu"].includes(x));
  }
  if (supportedDevices.includes(device)) {
    return [DEVICE_TO_EXECUTION_PROVIDER_MAPPING[device] ?? device];
  }
  throw new Error(`Unsupported device: "${device}". Should be one of: ${supportedDevices.join(", ")}.`);
}
let webInitChain = Promise.resolve();
let wasmLoadPromise = null;
async function ensureWasmLoaded() {
  if (wasmLoadPromise) {
    return wasmLoadPromise;
  }
  const shouldUseWasmCache = env.useWasmCache && typeof ONNX_ENV?.wasm?.wasmPaths === "object" && ONNX_ENV?.wasm?.wasmPaths?.wasm && ONNX_ENV?.wasm?.wasmPaths?.mjs;
  if (!shouldUseWasmCache) {
    if (apis.IS_DENO_WEB_RUNTIME) {
      throw new Error(
        "env.useWasmCache=false is not supported in Deno's web runtime. Remove the useWasmCache override."
      );
    }
    wasmLoadPromise = Promise.resolve();
    return wasmLoadPromise;
  }
  wasmLoadPromise = (async () => {
    const urls = (
      /** @type {{ wasm: string, mjs: string }} */
      ONNX_ENV.wasm.wasmPaths
    );
    let wasmBinaryLoaded = false;
    await Promise.all([
      // Load and cache the WASM binary
      urls.wasm && !isBlobURL(urls.wasm) ? (async () => {
        try {
          const wasmBinary = await loadWasmBinary(toAbsoluteURL(urls.wasm));
          if (wasmBinary) {
            ONNX_ENV.wasm.wasmBinary = wasmBinary;
            wasmBinaryLoaded = true;
          }
        } catch (err) {
          logger.warn("Failed to pre-load WASM binary:", err);
        }
      })() : Promise.resolve(),
      // Load and cache the WASM factory as a blob URL
      urls.mjs && !isBlobURL(urls.mjs) ? (async () => {
        try {
          const wasmFactoryBlob = await loadWasmFactory(toAbsoluteURL(urls.mjs));
          if (wasmFactoryBlob) {
            ONNX_ENV.wasm.wasmPaths.mjs = wasmFactoryBlob;
          }
        } catch (err) {
          logger.warn("Failed to pre-load WASM factory:", err);
        }
      })() : Promise.resolve()
    ]);
    if (!wasmBinaryLoaded) {
      ONNX_ENV.wasm.wasmPaths.mjs = urls.mjs;
    }
  })();
  return wasmLoadPromise;
}
async function createInferenceSession(buffer_or_path, session_options, session_config) {
  await ensureWasmLoaded();
  const logSeverityLevel = getOnnxLogSeverityLevel(env.logLevel ?? LogLevel.WARNING);
  const load = () => InferenceSession.create(buffer_or_path, {
    // Set default log severity level, but allow overriding through session options
    logSeverityLevel,
    ...session_options
  });
  const session = await (apis.IS_WEB_ENV ? webInitChain = webInitChain.then(load) : load());
  session.config = session_config;
  return session;
}
let webInferenceChain = Promise.resolve();
async function runInferenceSession(session, ortFeed) {
  const run = () => session.run(ortFeed);
  return apis.IS_WEB_ENV ? webInferenceChain = webInferenceChain.then(run) : run();
}
function isONNXTensor(x) {
  return x instanceof ONNX.Tensor;
}
const ONNX_ENV = ONNX?.env;
function isONNXProxy() {
  return ONNX_ENV?.wasm?.proxy;
}
if (ONNX_ENV) {
  let setLogLevel = function(logLevel2) {
    const severityLevel = getOnnxLogSeverityLevel(logLevel2);
    ONNX_ENV.logLevel = ONNX_LOG_LEVEL_NAMES[severityLevel];
  };
  if (ONNX_ENV.wasm) {
    if (
      // @ts-ignore Cannot find name 'ServiceWorkerGlobalScope'.ts(2304)
      !(typeof ServiceWorkerGlobalScope !== "undefined" && self instanceof ServiceWorkerGlobalScope) && ONNX_ENV.versions?.web && !ONNX_ENV.wasm.wasmPaths
    ) {
      const wasmPathPrefix = `https://cdn.jsdelivr.net/npm/onnxruntime-web@${ONNX_ENV.versions.web}/dist/`;
      let wasmPathSuffix = ".asyncify";
      if (apis.IS_SAFARI_BELOW_26 && !apis.IS_WEBGPU_AVAILABLE) {
        wasmPathSuffix = "";
      }
      ONNX_ENV.wasm.wasmPaths = {
        mjs: `${wasmPathPrefix}ort-wasm-simd-threaded${wasmPathSuffix}.mjs`,
        wasm: `${wasmPathPrefix}ort-wasm-simd-threaded${wasmPathSuffix}.wasm`
      };
    }
    ONNX_ENV.wasm.proxy = false;
  }
  if (ONNX_ENV.webgpu) {
    ONNX_ENV.webgpu.powerPreference = "high-performance";
  }
  setLogLevel(env.logLevel ?? LogLevel.WARNING);
  env.backends.onnx = {
    ...ONNX_ENV,
    setLogLevel
  };
}
function dispatchCallback(progress_callback, data) {
  if (progress_callback) progress_callback(data);
}
class DefaultProgressCallback extends Callable$1 {
  /**
   * @param {ProgressCallback} callback The original callback.
   * @param {FilesLoadingMap} files_loading Mutable map storing per-file progress.
   */
  constructor(callback, files_loading) {
    super();
    this.callback = callback;
    this.files_loading = files_loading;
    this.loads = /* @__PURE__ */ new Map();
  }
  /**
   * @param {ProgressInfo} info
   */
  _call(info) {
    if (info.status === "progress") {
      this.files_loading[info.file] = {
        loaded: info.loaded,
        total: info.total
      };
      const loaded = Object.values(this.files_loading).reduce((acc, curr) => acc + curr.loaded, 0);
      const total = Object.values(this.files_loading).reduce((acc, curr) => acc + curr.total, 0);
      const progress2 = total > 0 ? loaded / total * 100 : 0;
      this.callback({
        status: "progress_total",
        name: info.name,
        progress: progress2,
        loaded,
        total,
        files: structuredClone(this.files_loading)
      });
    }
    this.callback(info);
  }
}
function isIntegralNumber(x) {
  return Number.isInteger(x) || typeof x === "bigint";
}
function isNullishDimension(x) {
  return x === null || x === void 0 || x === -1;
}
function mergeArrays(...arrs) {
  return Array.prototype.concat.apply([], arrs);
}
function calculateReflectOffset(i, w) {
  return Math.abs((i + w) % (2 * w) - w);
}
function pick(o, props) {
  return Object.assign(
    {},
    ...props.map((prop) => {
      if (o[prop] !== void 0) {
        return { [prop]: o[prop] };
      }
    })
  );
}
function count(arr, value) {
  let count2 = 0;
  for (const v of arr) {
    if (v === value) ++count2;
  }
  return count2;
}
let LRUCache$1 = class LRUCache {
  /** @type {number} */
  #capacity;
  /** @type {Map<any, any>} */
  #cache;
  /**
   * Creates an LRUCache instance.
   * @param {number} capacity The maximum number of items the cache can hold.
   */
  constructor(capacity) {
    this.#capacity = capacity;
    this.#cache = /* @__PURE__ */ new Map();
  }
  /**
   * Retrieves the value associated with the given key and marks the key as recently used.
   * @param {any} key The key to retrieve.
   * @returns {any} The value associated with the key, or undefined if the key does not exist.
   */
  get(key) {
    if (!this.#cache.has(key)) return void 0;
    const value = this.#cache.get(key);
    this.#cache.delete(key);
    this.#cache.set(key, value);
    return value;
  }
  /**
   * Inserts or updates the key-value pair in the cache.
   * If the key already exists, it is updated and marked as recently used.
   * If the cache exceeds its capacity, the least recently used item is evicted.
   * @param {any} key The key to add or update.
   * @param {any} value The value to associate with the key.
   */
  put(key, value) {
    if (this.#cache.has(key)) {
      this.#cache.delete(key);
    }
    this.#cache.set(key, value);
    if (this.#cache.size > this.#capacity) {
      this.#cache.delete(this.#cache.keys().next().value);
    }
  }
  /**
   * Removes the entry for the given key from the cache.
   * @param {any} key The key to delete.
   * @returns {boolean} `true` if the entry existed and was removed, `false` otherwise.
   */
  delete(key) {
    return this.#cache.delete(key);
  }
  /**
   * Clears the cache.
   */
  clear() {
    this.#cache.clear();
  }
};
const MAX_CACHE_SIZE = 100;
const cache = new LRUCache$1(MAX_CACHE_SIZE);
function memoizePromise(key, factory) {
  const cached = cache.get(key);
  if (cached !== void 0) {
    return cached;
  }
  const promise = factory().then(
    (value) => value,
    (err) => {
      cache.delete(key);
      return Promise.reject(err);
    }
  );
  cache.put(key, promise);
  return promise;
}
async function fetch_file_head(urlOrPath) {
  if (!isValidUrl(urlOrPath, ["http:", "https:"])) {
    return null;
  }
  const headers = getFetchHeaders(urlOrPath);
  headers.set("Range", "bytes=0-0");
  return env.fetch(urlOrPath, { method: "GET", headers, cache: "no-store" });
}
function get_file_metadata(path_or_repo_id, filename, options = {}) {
  const key = makePretrainedOptionsKey(path_or_repo_id, options, filename);
  return memoizePromise(key, () => _get_file_metadata(path_or_repo_id, filename, options));
}
async function _get_file_metadata(path_or_repo_id, filename, options) {
  const cache2 = await getCache(options?.cache_dir);
  const { localPath, remoteURL, proposedCacheKey, validModelId } = buildResourcePaths(
    path_or_repo_id,
    filename,
    options,
    cache2
  );
  const cachedResponse = await checkCachedResource(cache2, localPath, proposedCacheKey);
  if (cachedResponse !== void 0 && typeof cachedResponse !== "string") {
    const size = cachedResponse.headers.get("content-length");
    const contentType = cachedResponse.headers.get("content-type");
    return {
      exists: true,
      size: size ? parseInt(size, 10) : void 0,
      contentType: contentType || void 0,
      fromCache: true
    };
  }
  if (env.allowLocalModels) {
    const isURL = isValidUrl(localPath, ["http:", "https:"]);
    if (!isURL) {
      try {
        const response = await getFile(localPath);
        if (typeof response !== "string" && response.status !== 404) {
          const size = response.headers.get("content-length");
          const contentType = response.headers.get("content-type");
          return {
            exists: true,
            size: size ? parseInt(size, 10) : void 0,
            contentType: contentType || void 0,
            fromCache: false
          };
        }
      } catch (e) {
      }
    }
  }
  if (env.allowRemoteModels && !options.local_files_only && validModelId) {
    const rangeResponse = await fetch_file_head(remoteURL);
    if (rangeResponse && rangeResponse.status >= 200 && rangeResponse.status < 300) {
      let size;
      const contentType = rangeResponse.headers.get("content-type");
      if (rangeResponse.status === 206) {
        const contentRange = rangeResponse.headers.get("content-range");
        if (contentRange) {
          const match = contentRange.match(/bytes \d+-\d+\/(\d+)/);
          if (match) {
            size = parseInt(match[1], 10);
          }
        }
      } else if (rangeResponse.status === 200) {
        try {
          await rangeResponse.body?.cancel();
        } catch (cancelError) {
        }
      }
      if (size === void 0) {
        const contentLength = rangeResponse.headers.get("content-length");
        size = contentLength ? parseInt(contentLength, 10) : void 0;
      }
      return {
        exists: true,
        size,
        contentType: contentType || void 0,
        fromCache: false
      };
    }
    if (rangeResponse && rangeResponse.status !== 404 && rangeResponse.status !== 416) {
      handleError(rangeResponse.status, remoteURL, true);
    }
  }
  return { exists: false, fromCache: false };
}
var define_process_env_default = {};
async function getFile(urlOrPath) {
  if (env.useFS && !isValidUrl(urlOrPath, ["http:", "https:", "blob:"])) {
    return new FileResponse(
      urlOrPath instanceof URL ? urlOrPath.protocol === "file:" ? urlOrPath.pathname : urlOrPath.toString() : urlOrPath
    );
  } else {
    return env.fetch(urlOrPath, {
      headers: getFetchHeaders(urlOrPath)
    });
  }
}
function getFetchHeaders(urlOrPath) {
  const isNode = typeof process !== "undefined" && process?.release?.name === "node";
  const headers = new Headers();
  if (isNode) {
    const IS_CI = !!define_process_env_default?.TESTING_REMOTELY;
    const version = env.version;
    headers.set("User-Agent", `transformers.js/${version}; is_ci/${IS_CI};`);
    const isHFURL = isValidUrl(urlOrPath, ["http:", "https:"], ["huggingface.co", "hf.co"]);
    if (isHFURL) {
      const token = define_process_env_default?.HF_TOKEN ?? define_process_env_default?.HF_ACCESS_TOKEN;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
    }
  }
  return headers;
}
function buildResourcePaths(path_or_repo_id, filename, options = {}, cache2 = null) {
  const revision = options.revision ?? "main";
  const requestURL = pathJoin(path_or_repo_id, filename);
  const validModelId = isValidHfModelId(path_or_repo_id);
  const localPath = validModelId ? pathJoin(env.localModelPath, requestURL) : requestURL;
  const remoteURL = pathJoin(
    env.remoteHost,
    env.remotePathTemplate.replaceAll("{model}", path_or_repo_id).replaceAll("{revision}", encodeURIComponent(revision)),
    filename
  );
  const proposedCacheKey = cache2 instanceof FileCache ? (
    // Choose cache key for filesystem cache
    // When using the main revision (default), we use the request URL as the cache key.
    // If a specific revision is requested, we account for this in the cache key.
    revision === "main" ? requestURL : pathJoin(path_or_repo_id, revision, filename)
  ) : remoteURL;
  return {
    requestURL,
    localPath,
    remoteURL,
    proposedCacheKey,
    validModelId
  };
}
async function checkCachedResource(cache2, localPath, proposedCacheKey) {
  if (!cache2) {
    return void 0;
  }
  return await tryCache(cache2, localPath, proposedCacheKey);
}
async function storeCachedResource(path_or_repo_id, filename, cache2, cacheKey, response, result, options = {}) {
  if (await cache2.match(cacheKey) !== void 0) {
    return;
  }
  if (typeof Cache !== "undefined" && cache2 instanceof Cache && !isValidUrl(toAbsoluteURL(cacheKey, { allowUnresolved: true }), ["http:", "https:"])) {
    return;
  }
  if (!result) {
    const wrapped_progress = options.progress_callback ? (data) => dispatchCallback(options.progress_callback, {
      status: "progress",
      name: path_or_repo_id,
      file: filename,
      ...data
    }) : void 0;
    await cache2.put(
      cacheKey,
      /** @type {Response} */
      response,
      wrapped_progress
    );
  } else if (typeof response !== "string") {
    const headers = new Headers(response.headers);
    headers.set("content-length", result.byteLength.toString());
    await cache2.put(
      cacheKey,
      new Response(
        /** @type {any} */
        result,
        {
          headers
        }
      )
    ).catch((err) => {
      logger.warn(`Unable to add response to browser cache: ${err}.`);
    });
  }
}
async function loadResourceFile(path_or_repo_id, filename, fatal = true, options = {}, return_path = false, cache2 = null) {
  const { requestURL, localPath, remoteURL, proposedCacheKey, validModelId } = buildResourcePaths(
    path_or_repo_id,
    filename,
    options,
    cache2
  );
  let cacheKey;
  let toCacheResponse = false;
  let response;
  response = await checkCachedResource(cache2, localPath, proposedCacheKey);
  const cacheHit = response !== void 0;
  if (cacheHit) {
    cacheKey = proposedCacheKey;
  } else {
    if (env.allowLocalModels) {
      const isURL = isValidUrl(requestURL, ["http:", "https:"]);
      if (!isURL) {
        try {
          response = await getFile(localPath);
          cacheKey = localPath;
        } catch (e) {
          logger.warn(`Unable to load from local path "${localPath}": "${e}"`);
        }
      } else if (options.local_files_only) {
        throw new Error(`\`local_files_only=true\`, but attempted to load a remote file from: ${requestURL}.`);
      } else if (!env.allowRemoteModels) {
        throw new Error(
          `\`env.allowRemoteModels=false\`, but attempted to load a remote file from: ${requestURL}.`
        );
      }
    }
    if (response === void 0 || typeof response !== "string" && response.status === 404) {
      if (options.local_files_only || !env.allowRemoteModels) {
        if (fatal) {
          throw new ModelFileNotFoundError(
            `\`local_files_only=true\` or \`env.allowRemoteModels=false\` and file was not found locally at "${localPath}".`
          );
        } else {
          return null;
        }
      }
      if (!validModelId) {
        throw new ModelFileNotFoundError(
          `Local file missing at "${localPath}" and download aborted due to invalid model ID "${path_or_repo_id}".`
        );
      }
      response = await getFile(remoteURL);
      if (response.status !== 200) {
        return handleError(response.status, remoteURL, fatal);
      }
      cacheKey = proposedCacheKey;
    }
    toCacheResponse = cache2 && // 1. A caching system is available
    typeof Response !== "undefined" && // 2. `Response` is defined (i.e., we are in a browser-like environment)
    response instanceof Response && // 3. result is a `Response` object (i.e., not a `FileResponse`)
    response.status === 200;
  }
  dispatchCallback(options.progress_callback, {
    status: "download",
    name: path_or_repo_id,
    file: filename
  });
  let result;
  if (apis.IS_NODE_ENV && return_path) ;
  else {
    let buffer;
    if (typeof response !== "string") {
      if (!options.progress_callback) {
        buffer = new Uint8Array(await response.arrayBuffer());
      } else if (cacheHit && // The item is being read from the cache
      typeof navigator !== "undefined" && /firefox/i.test(navigator.userAgent)) {
        buffer = new Uint8Array(await response.arrayBuffer());
        dispatchCallback(options.progress_callback, {
          status: "progress",
          name: path_or_repo_id,
          file: filename,
          progress: 100,
          loaded: buffer.length,
          total: buffer.length
        });
      } else {
        let expectedSize;
        const contentLength = response.headers.get("content-length");
        if (contentLength) {
          expectedSize = parseInt(contentLength, 10);
        } else {
          try {
            const metadata = await get_file_metadata(path_or_repo_id, filename, options);
            if (metadata.size) {
              expectedSize = metadata.size;
            }
          } catch (e) {
          }
        }
        buffer = await readResponse(
          response,
          (data) => {
            dispatchCallback(options.progress_callback, {
              status: "progress",
              name: path_or_repo_id,
              file: filename,
              ...data
            });
          },
          expectedSize
        );
      }
    }
    result = buffer;
  }
  if (
    // Only cache web responses
    // i.e., do not cache FileResponses (prevents duplication)
    toCacheResponse && cacheKey && typeof response !== "string"
  ) {
    await storeCachedResource(path_or_repo_id, filename, cache2, cacheKey, response, result, options);
  }
  if (apis.IS_NODE_ENV && return_path && options.progress_callback && typeof response !== "string") {
    const size = parseInt(response.headers.get("content-length"), 10) || 0;
    dispatchCallback(options.progress_callback, {
      status: "progress",
      name: path_or_repo_id,
      file: filename,
      progress: 100,
      loaded: size,
      total: size
    });
  }
  dispatchCallback(options.progress_callback, {
    status: "done",
    name: path_or_repo_id,
    file: filename
  });
  if (result) {
    if (!apis.IS_NODE_ENV && return_path) {
      throw new Error("Cannot return path in a browser environment.");
    }
    return result;
  }
  if (response instanceof FileResponse) {
    return response.filePath;
  }
  const cachedResponse = await cache2?.match(cacheKey);
  if (cachedResponse instanceof FileResponse) {
    return cachedResponse.filePath;
  } else if (cachedResponse instanceof Response) {
    return new Uint8Array(await cachedResponse.arrayBuffer());
  } else if (typeof cachedResponse === "string") {
    return cachedResponse;
  }
  throw new Error("Unable to get model file path or buffer.");
}
const INFLIGHT_LOADS = /* @__PURE__ */ new Map();
async function getModelFile(path_or_repo_id, filename, fatal = true, options = {}, return_path = false) {
  if (!env.allowLocalModels) {
    if (options.local_files_only) {
      throw Error(
        "Invalid configuration detected: local models are disabled (`env.allowLocalModels=false`) but you have requested to only use local models (`local_files_only=true`)."
      );
    } else if (!env.allowRemoteModels) {
      throw Error(
        "Invalid configuration detected: both local and remote models are disabled. Fix by setting `env.allowLocalModels` or `env.allowRemoteModels` to `true`."
      );
    }
  }
  const key = makePretrainedOptionsKey(path_or_repo_id, options, filename, fatal, return_path);
  const { progress_callback } = options;
  const loads = progress_callback instanceof DefaultProgressCallback ? progress_callback.loads : INFLIGHT_LOADS;
  let pending = loads.get(key);
  if (!pending) {
    dispatchCallback(progress_callback, {
      status: "initiate",
      name: path_or_repo_id,
      file: filename
    });
    pending = getCache(options.cache_dir).then(
      (cache2) => loadResourceFile(path_or_repo_id, filename, fatal, options, return_path, cache2)
    );
    if (loads === INFLIGHT_LOADS) {
      pending = pending.finally(() => INFLIGHT_LOADS.delete(key));
    }
    loads.set(key, pending);
  }
  return await pending;
}
async function getModelText(modelPath, fileName, fatal = true, options = {}) {
  const buffer = await getModelFile(modelPath, fileName, fatal, options, false);
  if (buffer === null) {
    return null;
  }
  const decoder = new TextDecoder("utf-8");
  return decoder.decode(
    /** @type {Uint8Array} */
    buffer
  );
}
async function getModelJSON(modelPath, fileName, fatal = true, options = {}) {
  const text = await getModelText(modelPath, fileName, fatal, options);
  if (text === null) {
    return {};
  }
  return JSON.parse(text);
}
async function loadConfig(pretrained_model_name_or_path, options) {
  return await getModelJSON(pretrained_model_name_or_path, "config.json", true, options);
}
function getNormalizedConfig(config) {
  const mapping = {};
  let init_normalized_config = {};
  switch (config.model_type) {
    // Sub-configs
    case "llava":
    case "paligemma":
    case "gemma3":
    case "florence2":
    case "llava_onevision":
    case "idefics3":
    case "granite_speech":
    case "ultravox":
    case "voxtral":
    case "voxtral_realtime":
    case "smolvlm":
    case "gemma3n":
    case "gemma4":
    case "lfm2_vl":
    case "chatterbox":
    case "lighton_ocr":
    case "glm_ocr":
    case "mistral3":
    case "qwen2_5_vl":
    case "qwen3_vl":
    case "qwen3_vl_moe":
      init_normalized_config = getNormalizedConfig(config.text_config);
      break;
    case "moondream1":
      init_normalized_config = getNormalizedConfig(config.phi_config);
      break;
    case "musicgen":
      init_normalized_config = getNormalizedConfig(config.decoder);
      break;
    case "multi_modality":
      init_normalized_config = getNormalizedConfig(config.language_config);
      break;
    // Decoder-only models
    case "gpt2":
    case "gptj":
    case "jais":
    case "codegen":
    case "gpt_bigcode":
      mapping["num_heads"] = "n_head";
      mapping["num_layers"] = "n_layer";
      mapping["hidden_size"] = "n_embd";
      break;
    case "gpt_neox":
    case "stablelm":
    case "opt":
    case "falcon":
    case "modernbert-decoder":
      mapping["num_heads"] = "num_attention_heads";
      mapping["num_layers"] = "num_hidden_layers";
      mapping["hidden_size"] = "hidden_size";
      break;
    case "gpt_oss":
    case "llama":
    case "llama4_text":
    case "nanochat":
    case "apertus":
    case "arcee":
    case "afmoe":
    case "lfm2":
    case "lfm2_moe":
    case "smollm3":
    case "olmo":
    case "olmo2":
    case "olmo3":
    case "mobilellm":
    case "granite":
    case "granitemoehybrid":
    case "cohere":
    case "cohere2":
    case "mistral":
    case "voxtral_realtime_text":
    case "voxtral_realtime_encoder":
    case "starcoder2":
    case "qwen2":
    case "qwen2_moe":
    case "qwen2_vl":
    case "qwen2_vl_text":
    case "qwen2_5_vl_text":
    case "qwen3_moe":
    case "qwen3_vl_text":
    case "qwen3_vl_moe_text":
    case "phi":
    case "phi3":
    case "phi3_v":
    case "llava_qwen2":
      mapping["num_heads"] = "num_key_value_heads";
      mapping["num_layers"] = "num_hidden_layers";
      mapping["hidden_size"] = "hidden_size";
      mapping["num_attention_heads"] = "num_attention_heads";
      mapping["dim_kv"] = "head_dim";
      break;
    case "qwen3":
    case "solar_open":
    case "glm_ocr_text":
    case "gemma":
    case "gemma2":
    case "vaultgemma":
    case "gemma3_text":
    case "gemma3n_text":
    case "gemma4_text":
    case "glm":
    case "helium":
    case "ernie4_5":
    case "hunyuan_v1_dense":
    case "falcon_h1":
    case "nemotron_h":
    case "ministral":
    case "ministral3":
      mapping["num_heads"] = "num_key_value_heads";
      mapping["num_layers"] = "num_hidden_layers";
      mapping["dim_kv"] = "head_dim";
      break;
    case "openelm":
      mapping["num_heads"] = "num_kv_heads";
      mapping["num_layers"] = "num_transformer_layers";
      mapping["dim_kv"] = "head_dim";
      break;
    case "gpt_neo":
    case "donut-swin":
      mapping["num_heads"] = "num_heads";
      mapping["num_layers"] = "num_layers";
      mapping["hidden_size"] = "hidden_size";
      break;
    case "bloom":
      mapping["num_heads"] = "n_head";
      mapping["num_layers"] = "n_layer";
      mapping["hidden_size"] = "hidden_size";
      break;
    case "mpt":
      mapping["num_heads"] = "n_heads";
      mapping["num_layers"] = "n_layers";
      mapping["hidden_size"] = "d_model";
      break;
    case "exaone":
      mapping["num_heads"] = "num_key_value_heads";
      mapping["num_layers"] = "num_layers";
      mapping["dim_kv"] = "head_dim";
      mapping["num_attention_heads"] = "num_attention_heads";
      break;
    case "youtu":
    case "deepseek_v3":
    case "deepseek_v4":
    case "glm_moe_dsa":
    case "mistral4":
      mapping["num_heads"] = "num_key_value_heads";
      mapping["num_layers"] = "num_hidden_layers";
      mapping["dim_kv"] = config.model_type === "deepseek_v4" ? "head_dim" : "qk_head_dim";
      mapping["num_attention_heads"] = "num_attention_heads";
      break;
    case "zaya":
      mapping["num_heads"] = "num_key_value_heads";
      mapping["num_layers"] = "num_hidden_layers";
      mapping["hidden_size"] = "hidden_size";
      mapping["dim_kv"] = "head_dim";
      mapping["num_attention_heads"] = "num_attention_heads";
      break;
    case "hrm_text":
      mapping["num_heads"] = "num_key_value_heads";
      mapping["num_layers"] = "num_hidden_layers";
      mapping["hidden_size"] = "hidden_size";
      mapping["dim_kv"] = "head_dim";
      mapping["num_attention_heads"] = "num_attention_heads";
      break;
    // Encoder-decoder models
    case "t5":
    case "mt5":
    case "longt5":
      mapping["num_decoder_layers"] = "num_decoder_layers";
      mapping["num_decoder_heads"] = "num_heads";
      mapping["decoder_dim_kv"] = "d_kv";
      mapping["num_encoder_layers"] = "num_layers";
      mapping["num_encoder_heads"] = "num_heads";
      mapping["encoder_dim_kv"] = "d_kv";
      break;
    case "bart":
    case "mbart":
    case "marian":
    case "whisper":
    case "lite-whisper":
    case "m2m_100":
    case "blenderbot":
    case "blenderbot-small":
    case "florence2_language":
      mapping["num_decoder_layers"] = "decoder_layers";
      mapping["num_decoder_heads"] = "decoder_attention_heads";
      mapping["decoder_hidden_size"] = "d_model";
      mapping["num_encoder_layers"] = "encoder_layers";
      mapping["num_encoder_heads"] = "encoder_attention_heads";
      mapping["encoder_hidden_size"] = "d_model";
      break;
    case "speecht5":
      mapping["num_decoder_layers"] = "decoder_layers";
      mapping["num_decoder_heads"] = "decoder_attention_heads";
      mapping["decoder_hidden_size"] = "hidden_size";
      mapping["num_encoder_layers"] = "encoder_layers";
      mapping["num_encoder_heads"] = "encoder_attention_heads";
      mapping["encoder_hidden_size"] = "hidden_size";
      break;
    case "trocr":
      mapping["num_encoder_layers"] = mapping["num_decoder_layers"] = "decoder_layers";
      mapping["num_encoder_heads"] = mapping["num_decoder_heads"] = "decoder_attention_heads";
      mapping["encoder_hidden_size"] = mapping["decoder_hidden_size"] = "d_model";
      break;
    case "musicgen_decoder":
      mapping["num_encoder_layers"] = mapping["num_decoder_layers"] = "num_hidden_layers";
      mapping["num_encoder_heads"] = mapping["num_decoder_heads"] = "num_attention_heads";
      mapping["encoder_hidden_size"] = mapping["decoder_hidden_size"] = "hidden_size";
      break;
    case "moonshine":
      mapping["num_decoder_layers"] = "decoder_num_hidden_layers";
      mapping["num_decoder_heads"] = "decoder_num_key_value_heads";
      mapping["num_encoder_layers"] = "encoder_num_hidden_layers";
      mapping["num_encoder_heads"] = "encoder_num_key_value_heads";
      mapping["encoder_hidden_size"] = mapping["decoder_hidden_size"] = "hidden_size";
      break;
    case "cohere_asr":
      mapping["num_decoder_layers"] = "num_hidden_layers";
      mapping["num_decoder_heads"] = "num_key_value_heads";
      mapping["decoder_hidden_size"] = "hidden_size";
      mapping["decoder_dim_kv"] = "head_dim";
      const {
        num_hidden_layers: num_encoder_layers,
        num_attention_heads: num_encoder_heads,
        hidden_size: encoder_hidden_size
      } = (
        /** @type {any} */
        config.encoder_config
      );
      init_normalized_config = {
        num_encoder_layers,
        num_encoder_heads,
        encoder_hidden_size,
        // @ts-expect-error TS2339
        encoder_dim_kv: config.head_dim
      };
      break;
    case "vision-encoder-decoder":
      const decoderConfig = getNormalizedConfig(config.decoder);
      const add_encoder_pkv = "num_decoder_layers" in decoderConfig;
      const result = pick(config, ["model_type", "is_encoder_decoder"]);
      if (add_encoder_pkv) {
        result.num_decoder_layers = decoderConfig.num_decoder_layers;
        result.num_decoder_heads = decoderConfig.num_decoder_heads;
        result.decoder_hidden_size = decoderConfig.decoder_hidden_size;
        result.num_encoder_layers = decoderConfig.num_encoder_layers;
        result.num_encoder_heads = decoderConfig.num_encoder_heads;
        result.encoder_hidden_size = decoderConfig.encoder_hidden_size;
      } else {
        result.num_layers = decoderConfig.num_layers;
        result.num_heads = decoderConfig.num_heads;
        result.hidden_size = decoderConfig.hidden_size;
      }
      return result;
  }
  const normalized_config = {
    ...init_normalized_config,
    ...pick(config, ["model_type", "multi_query", "is_encoder_decoder"])
  };
  for (const key in mapping) {
    normalized_config[key] = config[mapping[key]];
  }
  return normalized_config;
}
function getCacheNames(config, options) {
  if (!(config instanceof PretrainedConfig)) {
    config = new PretrainedConfig(config);
  }
  const pkv_prefix = options?.prefix ?? "past_key_values";
  const cache_prefix = pkv_prefix === "present" ? "present" : "past";
  const names = /* @__PURE__ */ new Set();
  if (["lfm2", "lfm2_moe"].includes(config.model_type)) {
    const { layer_types } = (
      /** @type {any} */
      config
    );
    for (let i = 0; i < layer_types.length; ++i) {
      if (layer_types[i] === "full_attention") {
        names.add(`${pkv_prefix}.${i}.key`);
        names.add(`${pkv_prefix}.${i}.value`);
      } else if (layer_types[i] === "conv") {
        names.add(`${cache_prefix}_conv.${i}`);
      } else {
        throw new Error(`Unsupported layer type: ${layer_types[i]}`);
      }
    }
    return names;
  } else if (["granitemoehybrid", "falcon_h1", "nemotron_h"].includes(config.model_type)) {
    const c = (
      /** @type {any} */
      config
    );
    const layer_types = c.layer_types ?? c.layers_block_type;
    const num_layers = c.num_hidden_layers ?? layer_types?.length;
    for (let i = 0; i < num_layers; ++i) {
      if (!layer_types || layer_types[i] === "mamba") {
        names.add(`${cache_prefix}_conv.${i}`);
        names.add(`${cache_prefix}_ssm.${i}`);
      }
      if (!layer_types || layer_types[i] === "attention") {
        names.add(`${pkv_prefix}.${i}.key`);
        names.add(`${pkv_prefix}.${i}.value`);
      }
    }
    return names;
  } else if (["qwen3_next", "qwen3_5_text", "qwen3_5_moe_text", "olmo_hybrid"].includes(config.model_type)) {
    const { layer_types } = (
      /** @type {any} */
      config
    );
    for (let i = 0; i < layer_types.length; ++i) {
      if (layer_types[i] === "full_attention") {
        names.add(`${pkv_prefix}.${i}.key`);
        names.add(`${pkv_prefix}.${i}.value`);
      } else if (layer_types[i] === "linear_attention") {
        if (config.model_type === "olmo_hybrid") {
          names.add(`${cache_prefix}_conv.${i}.key`);
          names.add(`${cache_prefix}_conv.${i}.value`);
          names.add(`${cache_prefix}_conv.${i}.query`);
        } else {
          names.add(`${cache_prefix}_conv.${i}`);
        }
        names.add(`${cache_prefix}_recurrent.${i}`);
      } else {
        throw new Error(`Unsupported layer type: ${layer_types[i]}`);
      }
    }
    return names;
  } else if (["gemma4", "gemma4_text"].includes(config.model_type)) {
    const c = (
      /** @type {any} */
      config.model_type === "gemma4" ? (
        /** @type {any} */
        config.text_config
      ) : config
    );
    const num_hidden_layers = c.num_hidden_layers;
    const num_kv_shared_layers = c.num_kv_shared_layers ?? 0;
    const num_kv_layers = num_hidden_layers - num_kv_shared_layers;
    for (let i = 0; i < num_kv_layers; ++i) {
      names.add(`${pkv_prefix}.${i}.key`);
      names.add(`${pkv_prefix}.${i}.value`);
    }
    return names;
  } else if (config.model_type === "deepseek_v4") {
    const { layer_types, num_hidden_layers } = (
      /** @type {any} */
      config
    );
    for (let i = 0; i < num_hidden_layers; ++i) {
      names.add(`${pkv_prefix}.${i}.key`);
      names.add(`${pkv_prefix}.${i}.value`);
      const layer_type = layer_types[i];
      if (layer_type === "compressed_sparse_attention") {
        names.add(`${cache_prefix}_compressor.${i}.kv`);
        names.add(`${cache_prefix}_compressor.${i}.gate`);
        names.add(`${cache_prefix}_indexer.${i}.kv`);
        names.add(`${cache_prefix}_indexer.${i}.gate`);
      } else if (layer_type === "heavily_compressed_attention") {
        names.add(`${cache_prefix}_compressor.${i}.kv`);
        names.add(`${cache_prefix}_compressor.${i}.gate`);
      } else if (layer_type && layer_type !== "sliding_attention") {
        throw new Error(`Unsupported layer type: ${layer_type}`);
      }
    }
    return names;
  } else if (config.model_type === "zaya") {
    const { num_hidden_layers, cca_time1 } = (
      /** @type {any} */
      config
    );
    const stride = cca_time1 ?? 1;
    for (let i = 0; i < num_hidden_layers; i += stride) {
      names.add(`${pkv_prefix}.${i}.key`);
      names.add(`${pkv_prefix}.${i}.value`);
      names.add(`${pkv_prefix}.${i}.conv_state`);
      names.add(`${pkv_prefix}.${i}.shift_state`);
    }
    return names;
  } else if (["lfm2_vl", "qwen3_5", "qwen3_5_moe", "voxtral_realtime"].includes(config.model_type)) {
    let subConfig;
    if (config.model_type === "voxtral_realtime" && options?.session_name === "audio_encoder") {
      subConfig = /** @type {any} */
      config.audio_config;
    } else {
      subConfig = /** @type {any} */
      config.text_config;
    }
    return getCacheNames(subConfig, options);
  }
  return getKeyValueNames(config, { prefix: pkv_prefix });
}
function getKeyValueNames(config, { prefix = "past_key_values" } = {}) {
  const names = /* @__PURE__ */ new Set();
  const normalized_config = config.normalized_config;
  if (normalized_config.is_encoder_decoder && "num_encoder_heads" in normalized_config && "num_decoder_heads" in normalized_config) {
    for (let i = 0; i < normalized_config.num_decoder_layers; ++i) {
      names.add(`${prefix}.${i}.encoder.key`);
      names.add(`${prefix}.${i}.encoder.value`);
      names.add(`${prefix}.${i}.decoder.key`);
      names.add(`${prefix}.${i}.decoder.value`);
    }
  } else if (normalized_config.multi_query) {
    for (let i = 0; i < normalized_config.num_layers; ++i) {
      names.add(`${prefix}.${i}.key_value`);
    }
  } else {
    for (let i = 0; i < normalized_config.num_layers; ++i) {
      names.add(`${prefix}.${i}.key`);
      names.add(`${prefix}.${i}.value`);
    }
  }
  return names;
}
class PretrainedConfig {
  // NOTE: Typo in original
  /** @type {string|null} */
  model_type = null;
  /** @type {boolean} */
  is_encoder_decoder = false;
  /** @type {number} */
  max_position_embeddings;
  /** @type {TransformersJSConfig} */
  "transformers.js_config";
  /**
   * Create a new `PretrainedConfig` from a parsed `config.json` object.
   * @param {Object} configJSON The JSON of the config.
   */
  constructor(configJSON) {
    Object.assign(this, configJSON);
    this.normalized_config = getNormalizedConfig(this);
  }
  /**
   * Loads a pretrained config from the given `pretrained_model_name_or_path`.
   *
   * @param {string} pretrained_model_name_or_path The path to the pretrained config.
   * @param {PretrainedOptions} options Additional options for loading the config.
   * @throws {Error} Throws an error if the config.json is not found in the `pretrained_model_name_or_path`.
   *
   * @returns {Promise<PretrainedConfig>} A new instance of the `PretrainedConfig` class.
   */
  static async from_pretrained(pretrained_model_name_or_path, { progress_callback = null, config = null, cache_dir = null, local_files_only = false, revision = "main" } = {}) {
    if (config && !(config instanceof PretrainedConfig)) {
      config = new PretrainedConfig(config);
    }
    const data = config ?? await loadConfig(pretrained_model_name_or_path, {
      progress_callback,
      config,
      cache_dir,
      local_files_only,
      revision
    });
    return new this(data);
  }
}
class AutoConfig {
  /** @type {typeof PretrainedConfig.from_pretrained} */
  static async from_pretrained(...args) {
    return PretrainedConfig.from_pretrained(...args);
  }
}
const DEVICE_TYPES = Object.freeze({
  auto: "auto",
  // Auto-detect based on device and environment
  gpu: "gpu",
  // Auto-detect GPU
  cpu: "cpu",
  // CPU
  wasm: "wasm",
  // WebAssembly
  webgpu: "webgpu",
  // WebGPU
  cuda: "cuda",
  // CUDA
  dml: "dml",
  // DirectML
  coreml: "coreml",
  // CoreML
  webnn: "webnn",
  // WebNN (default)
  "webnn-npu": "webnn-npu",
  // WebNN NPU
  "webnn-gpu": "webnn-gpu",
  // WebNN GPU
  "webnn-cpu": "webnn-cpu"
  // WebNN CPU
});
const DEFAULT_DEVICE = apis.IS_NODE_ENV ? "cpu" : "wasm";
function selectDevice(deviceConfig, fileName, { warn } = {}) {
  if (!deviceConfig) return DEFAULT_DEVICE;
  if (typeof deviceConfig === "string") return deviceConfig;
  if (deviceConfig.hasOwnProperty(fileName)) return deviceConfig[fileName];
  if (warn) {
    warn(`device not specified for "${fileName}". Using the default device (${DEFAULT_DEVICE}).`);
  }
  return DEFAULT_DEVICE;
}
const isWebGpuFp16Supported = /* @__PURE__ */ (function() {
  let cachedResult;
  return async function() {
    if (cachedResult === void 0) {
      if (!apis.IS_WEBGPU_AVAILABLE) {
        cachedResult = false;
      } else {
        try {
          const adapter = await navigator.gpu.requestAdapter();
          cachedResult = adapter.features.has("shader-f16");
        } catch (e) {
          cachedResult = false;
        }
      }
    }
    return cachedResult;
  };
})();
const DATA_TYPES = Object.freeze({
  auto: "auto",
  // Auto-detect based on environment
  fp32: "fp32",
  fp16: "fp16",
  q8: "q8",
  int8: "int8",
  uint8: "uint8",
  q4: "q4",
  bnb4: "bnb4",
  q4f16: "q4f16",
  // fp16 model with 4-bit block weight quantization
  q2: "q2",
  q2f16: "q2f16",
  // fp16 model with 2-bit block weight quantization
  q1: "q1",
  q1f16: "q1f16"
  // fp16 model with 1-bit block weight quantization
});
const DEFAULT_DEVICE_DTYPE = DATA_TYPES.fp32;
const DEFAULT_DEVICE_DTYPE_MAPPING = Object.freeze({
  // NOTE: If not specified, will default to fp32
  [DEVICE_TYPES.wasm]: DATA_TYPES.q8
});
const DEFAULT_DTYPE_SUFFIX_MAPPING = Object.freeze({
  [DATA_TYPES.fp32]: "",
  [DATA_TYPES.fp16]: "_fp16",
  [DATA_TYPES.int8]: "_int8",
  [DATA_TYPES.uint8]: "_uint8",
  [DATA_TYPES.q8]: "_quantized",
  [DATA_TYPES.q4]: "_q4",
  [DATA_TYPES.q2]: "_q2",
  [DATA_TYPES.q1]: "_q1",
  [DATA_TYPES.q4f16]: "_q4f16",
  [DATA_TYPES.q2f16]: "_q2f16",
  [DATA_TYPES.q1f16]: "_q1f16",
  [DATA_TYPES.bnb4]: "_bnb4"
});
function selectDtype(dtype, fileName, selectedDevice, { configDtype = null, warn } = {}) {
  let resolved;
  let needsWarn = false;
  if (dtype && typeof dtype !== "string") {
    if (dtype.hasOwnProperty(fileName)) {
      resolved = dtype[fileName];
    } else {
      resolved = null;
      needsWarn = true;
    }
  } else {
    resolved = /** @type {string|null|undefined} */
    dtype;
  }
  let result;
  if (resolved === DATA_TYPES.auto) {
    if (configDtype) {
      const fallback = typeof configDtype === "string" ? configDtype : configDtype?.[fileName];
      if (fallback && fallback !== DATA_TYPES.auto && DATA_TYPES.hasOwnProperty(fallback)) {
        return (
          /** @type {DataType} */
          fallback
        );
      }
    }
    result = DEFAULT_DEVICE_DTYPE_MAPPING[selectedDevice] ?? DEFAULT_DEVICE_DTYPE;
  } else if (resolved && DATA_TYPES.hasOwnProperty(resolved)) {
    result = /** @type {DataType} */
    resolved;
  } else {
    result = DEFAULT_DEVICE_DTYPE_MAPPING[selectedDevice] ?? DEFAULT_DEVICE_DTYPE;
  }
  if (needsWarn && warn) {
    warn(
      `dtype not specified for "${fileName}". Using the default dtype (${result}) for this device (${selectedDevice}).`
    );
  }
  return result;
}
const DataTypeMap = Object.freeze({
  float32: Float32Array,
  // @ts-ignore ts(2552) Limited availability of Float16Array across browsers:
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Float16Array
  float16: typeof Float16Array !== "undefined" ? Float16Array : Uint16Array,
  float64: Float64Array,
  string: Array,
  // string[]
  int8: Int8Array,
  uint8: Uint8Array,
  int16: Int16Array,
  uint16: Uint16Array,
  int32: Int32Array,
  uint32: Uint32Array,
  int64: BigInt64Array,
  uint64: BigUint64Array,
  bool: Uint8Array,
  uint4: Uint8Array,
  int4: Int8Array
});
function resolveExternalDataFormat(config, fullName, fileName) {
  if (!config) return 0;
  if (typeof config === "object" && config !== null) {
    if (config.hasOwnProperty(fullName)) return +config[fullName];
    if (config.hasOwnProperty(fileName)) return +config[fileName];
    return 0;
  }
  return +config;
}
function getExternalDataChunkNames(fullName, numChunks) {
  const names = [];
  for (let i = 0; i < numChunks; ++i) {
    names.push(`${fullName}_data${i === 0 ? "" : "_" + i}`);
  }
  return names;
}
async function getCoreModelFile(pretrained_model_name_or_path, fileName, options, suffix) {
  const baseName = `${fileName}${suffix}.onnx`;
  const fullPath = `${options.subfolder ?? ""}/${baseName}`;
  return await getModelFile(pretrained_model_name_or_path, fullPath, true, options, apis.IS_NODE_ENV);
}
async function getModelDataFiles(pretrained_model_name_or_path, fileName, suffix, options, use_external_data_format, session_options = {}) {
  const baseName = `${fileName}${suffix}.onnx`;
  const return_path = apis.IS_NODE_ENV;
  let externalDataPromises = [];
  const num_chunks = resolveExternalDataFormat(use_external_data_format, baseName, fileName);
  if (num_chunks > 0) {
    if (num_chunks > MAX_EXTERNAL_DATA_CHUNKS) {
      throw new Error(
        `The number of external data chunks (${num_chunks}) exceeds the maximum allowed value (${MAX_EXTERNAL_DATA_CHUNKS}).`
      );
    }
    const chunkNames = getExternalDataChunkNames(baseName, num_chunks);
    for (const path of chunkNames) {
      const fullPath = `${options.subfolder ?? ""}/${path}`;
      externalDataPromises.push(
        new Promise(async (resolve, reject) => {
          const data = await getModelFile(
            pretrained_model_name_or_path,
            fullPath,
            true,
            options,
            return_path
          );
          resolve(data instanceof Uint8Array ? { path, data } : path);
        })
      );
    }
  } else if (session_options.externalData !== void 0) {
    externalDataPromises = session_options.externalData.map(async (ext) => {
      if (typeof ext.data === "string") {
        const ext_buffer = await getModelFile(pretrained_model_name_or_path, ext.data, true, options);
        return { ...ext, data: ext_buffer };
      }
      return ext;
    });
  }
  return Promise.all(externalDataPromises);
}
function permute_data(array, dims, axes) {
  const shape = new Array(axes.length);
  const stride = new Array(axes.length);
  for (let i = axes.length - 1, s = 1; i >= 0; --i) {
    stride[i] = s;
    shape[i] = dims[axes[i]];
    s *= shape[i];
  }
  const invStride = axes.map((_, i) => stride[axes.indexOf(i)]);
  const permutedData = new array.constructor(array.length);
  for (let i = 0; i < array.length; ++i) {
    let newIndex = 0;
    for (let j = dims.length - 1, k = i; j >= 0; --j) {
      newIndex += k % dims[j] * invStride[j];
      k = Math.floor(k / dims[j]);
    }
    permutedData[newIndex] = array[i];
  }
  return [permutedData, shape];
}
function softmax(arr) {
  const maxVal = max(arr)[0];
  const exps = arr.map((x) => Math.exp(x - maxVal));
  const sumExps = exps.reduce((acc, val) => acc + val, 0);
  const softmaxArr = exps.map((x) => x / sumExps);
  return (
    /** @type {T} */
    softmaxArr
  );
}
function min$1(arr) {
  if (arr.length === 0) throw Error("Array must not be empty");
  let min2 = arr[0];
  let indexOfMin = 0;
  for (let i = 1; i < arr.length; ++i) {
    if (arr[i] < min2) {
      min2 = arr[i];
      indexOfMin = i;
    }
  }
  return (
    /** @type {T extends bigint[]|BigTypedArray ? [bigint, number] : [number, number]} */
    [min2, indexOfMin]
  );
}
function max(arr) {
  if (arr.length === 0) throw Error("Array must not be empty");
  let max2 = arr[0];
  let indexOfMax = 0;
  for (let i = 1; i < arr.length; ++i) {
    if (arr[i] > max2) {
      max2 = arr[i];
      indexOfMax = i;
    }
  }
  return (
    /** @type {T extends bigint[]|BigTypedArray ? [bigint, number] : [number, number]} */
    [max2, indexOfMax]
  );
}
function bankers_round(x) {
  const r = Math.round(x);
  const br2 = Math.abs(x) % 1 === 0.5 ? r % 2 === 0 ? r : r - 1 : r;
  return br2;
}
const uint16_to_float32 = /* @__PURE__ */ (function() {
  let float16LUT = null;
  return function(u16Array) {
    if (!float16LUT) {
      float16LUT = new Float32Array(65536);
      const buffer = new ArrayBuffer(4);
      const u32 = new Uint32Array(buffer);
      const f32 = new Float32Array(buffer);
      for (let i = 0; i < float16LUT.length; ++i) {
        let outBits = 0;
        const sign = (i & 32768) << 16;
        const exp = (i & 31744) >> 10;
        let mantissa = i & 1023;
        if (exp === 31) {
          outBits = sign | 2139095040 | mantissa << 13;
        } else if (exp === 0) {
          if (mantissa === 0) {
            outBits = sign;
          } else {
            let renormExp = 113;
            while ((mantissa & 1024) === 0) {
              mantissa <<= 1;
              --renormExp;
            }
            mantissa &= -1025;
            outBits = sign | renormExp << 23 | mantissa << 13;
          }
        } else {
          outBits = sign | exp + 112 << 23 | mantissa << 13;
        }
        u32[0] = outBits;
        float16LUT[i] = f32[0];
      }
    }
    const length = u16Array.length;
    const lut = float16LUT;
    const out = new Float32Array(length);
    for (let i = 0; i < length; ++i) {
      out[i] = lut[u16Array[i]];
    }
    return out;
  };
})();
const wrap = async (session_bytes, session_options, names) => {
  const session = await createInferenceSession(new Uint8Array(session_bytes), session_options);
  return (
    /** @type {any} */
    (async (inputs) => {
      const proxied = isONNXProxy();
      const ortFeed = Object.fromEntries(
        Object.entries(inputs).map(([k, v]) => [k, (proxied ? v.clone() : v).ort_tensor])
      );
      const outputs = await runInferenceSession(session, ortFeed);
      if (Array.isArray(names)) {
        return names.map((n) => new Tensor(outputs[n]));
      } else {
        return new Tensor(outputs[
          /** @type {string} */
          names
        ]);
      }
    })
  );
};
class TensorOpRegistry {
  static session_options = {
    // TODO: Allow for multiple execution providers
    // executionProviders: ['webgpu'],
  };
  static get nearest_interpolate_4d() {
    if (!this._nearest_interpolate_4d) {
      this._nearest_interpolate_4d = wrap(
        [
          8,
          10,
          18,
          0,
          58,
          129,
          1,
          10,
          41,
          10,
          1,
          120,
          10,
          0,
          10,
          0,
          10,
          1,
          115,
          18,
          1,
          121,
          34,
          6,
          82,
          101,
          115,
          105,
          122,
          101,
          42,
          18,
          10,
          4,
          109,
          111,
          100,
          101,
          34,
          7,
          110,
          101,
          97,
          114,
          101,
          115,
          116,
          160,
          1,
          3,
          18,
          1,
          114,
          90,
          31,
          10,
          1,
          120,
          18,
          26,
          10,
          24,
          8,
          1,
          18,
          20,
          10,
          3,
          18,
          1,
          98,
          10,
          3,
          18,
          1,
          99,
          10,
          3,
          18,
          1,
          104,
          10,
          3,
          18,
          1,
          119,
          90,
          15,
          10,
          1,
          115,
          18,
          10,
          10,
          8,
          8,
          7,
          18,
          4,
          10,
          2,
          8,
          4,
          98,
          31,
          10,
          1,
          121,
          18,
          26,
          10,
          24,
          8,
          1,
          18,
          20,
          10,
          3,
          18,
          1,
          98,
          10,
          3,
          18,
          1,
          99,
          10,
          3,
          18,
          1,
          104,
          10,
          3,
          18,
          1,
          119,
          66,
          2,
          16,
          21
        ],
        this.session_options,
        "y"
      );
    }
    return this._nearest_interpolate_4d;
  }
  static get bilinear_interpolate_4d() {
    if (!this._bilinear_interpolate_4d) {
      this._bilinear_interpolate_4d = wrap(
        [
          8,
          9,
          18,
          0,
          58,
          128,
          1,
          10,
          40,
          10,
          1,
          120,
          10,
          0,
          10,
          0,
          10,
          1,
          115,
          18,
          1,
          121,
          34,
          6,
          82,
          101,
          115,
          105,
          122,
          101,
          42,
          17,
          10,
          4,
          109,
          111,
          100,
          101,
          34,
          6,
          108,
          105,
          110,
          101,
          97,
          114,
          160,
          1,
          3,
          18,
          1,
          114,
          90,
          31,
          10,
          1,
          120,
          18,
          26,
          10,
          24,
          8,
          1,
          18,
          20,
          10,
          3,
          18,
          1,
          98,
          10,
          3,
          18,
          1,
          99,
          10,
          3,
          18,
          1,
          104,
          10,
          3,
          18,
          1,
          119,
          90,
          15,
          10,
          1,
          115,
          18,
          10,
          10,
          8,
          8,
          7,
          18,
          4,
          10,
          2,
          8,
          4,
          98,
          31,
          10,
          1,
          121,
          18,
          26,
          10,
          24,
          8,
          1,
          18,
          20,
          10,
          3,
          18,
          1,
          98,
          10,
          3,
          18,
          1,
          99,
          10,
          3,
          18,
          1,
          104,
          10,
          3,
          18,
          1,
          119,
          66,
          2,
          16,
          20
        ],
        this.session_options,
        "y"
      );
    }
    return this._bilinear_interpolate_4d;
  }
  static get bicubic_interpolate_4d() {
    if (!this._bicubic_interpolate_4d) {
      this._bicubic_interpolate_4d = wrap(
        [
          8,
          9,
          18,
          0,
          58,
          127,
          10,
          39,
          10,
          1,
          120,
          10,
          0,
          10,
          0,
          10,
          1,
          115,
          18,
          1,
          121,
          34,
          6,
          82,
          101,
          115,
          105,
          122,
          101,
          42,
          16,
          10,
          4,
          109,
          111,
          100,
          101,
          34,
          5,
          99,
          117,
          98,
          105,
          99,
          160,
          1,
          3,
          18,
          1,
          114,
          90,
          31,
          10,
          1,
          120,
          18,
          26,
          10,
          24,
          8,
          1,
          18,
          20,
          10,
          3,
          18,
          1,
          98,
          10,
          3,
          18,
          1,
          99,
          10,
          3,
          18,
          1,
          104,
          10,
          3,
          18,
          1,
          119,
          90,
          15,
          10,
          1,
          115,
          18,
          10,
          10,
          8,
          8,
          7,
          18,
          4,
          10,
          2,
          8,
          4,
          98,
          31,
          10,
          1,
          121,
          18,
          26,
          10,
          24,
          8,
          1,
          18,
          20,
          10,
          3,
          18,
          1,
          98,
          10,
          3,
          18,
          1,
          99,
          10,
          3,
          18,
          1,
          104,
          10,
          3,
          18,
          1,
          119,
          66,
          2,
          16,
          20
        ],
        this.session_options,
        "y"
      );
    }
    return this._bicubic_interpolate_4d;
  }
  static get matmul() {
    if (!this._matmul) {
      this._matmul = wrap(
        [
          8,
          9,
          18,
          0,
          58,
          55,
          10,
          17,
          10,
          1,
          97,
          10,
          1,
          98,
          18,
          1,
          99,
          34,
          6,
          77,
          97,
          116,
          77,
          117,
          108,
          18,
          1,
          114,
          90,
          9,
          10,
          1,
          97,
          18,
          4,
          10,
          2,
          8,
          1,
          90,
          9,
          10,
          1,
          98,
          18,
          4,
          10,
          2,
          8,
          1,
          98,
          9,
          10,
          1,
          99,
          18,
          4,
          10,
          2,
          8,
          1,
          66,
          2,
          16,
          20
        ],
        this.session_options,
        "c"
      );
    }
    return this._matmul;
  }
  static get stft() {
    if (!this._stft) {
      this._stft = wrap(
        [
          8,
          7,
          18,
          0,
          58,
          148,
          1,
          10,
          38,
          10,
          1,
          115,
          10,
          1,
          106,
          10,
          1,
          119,
          10,
          1,
          108,
          18,
          1,
          111,
          34,
          4,
          83,
          84,
          70,
          84,
          42,
          15,
          10,
          8,
          111,
          110,
          101,
          115,
          105,
          100,
          101,
          100,
          24,
          1,
          160,
          1,
          2,
          18,
          1,
          115,
          90,
          26,
          10,
          1,
          115,
          18,
          21,
          10,
          19,
          8,
          1,
          18,
          15,
          10,
          3,
          18,
          1,
          98,
          10,
          3,
          18,
          1,
          115,
          10,
          3,
          18,
          1,
          99,
          90,
          11,
          10,
          1,
          106,
          18,
          6,
          10,
          4,
          8,
          7,
          18,
          0,
          90,
          16,
          10,
          1,
          119,
          18,
          11,
          10,
          9,
          8,
          1,
          18,
          5,
          10,
          3,
          18,
          1,
          119,
          90,
          11,
          10,
          1,
          108,
          18,
          6,
          10,
          4,
          8,
          7,
          18,
          0,
          98,
          31,
          10,
          1,
          111,
          18,
          26,
          10,
          24,
          8,
          1,
          18,
          20,
          10,
          3,
          18,
          1,
          98,
          10,
          3,
          18,
          1,
          102,
          10,
          3,
          18,
          1,
          100,
          10,
          3,
          18,
          1,
          99,
          66,
          2,
          16,
          17
        ],
        this.session_options,
        "o"
      );
    }
    return this._stft;
  }
  static get rfft() {
    if (!this._rfft) {
      this._rfft = wrap(
        [
          8,
          9,
          58,
          93,
          10,
          33,
          10,
          1,
          120,
          10,
          0,
          10,
          1,
          97,
          18,
          1,
          121,
          34,
          3,
          68,
          70,
          84,
          42,
          15,
          10,
          8,
          111,
          110,
          101,
          115,
          105,
          100,
          101,
          100,
          24,
          1,
          160,
          1,
          2,
          18,
          1,
          100,
          90,
          19,
          10,
          1,
          120,
          18,
          14,
          10,
          12,
          8,
          1,
          18,
          8,
          10,
          0,
          10,
          0,
          10,
          2,
          8,
          1,
          90,
          11,
          10,
          1,
          97,
          18,
          6,
          10,
          4,
          8,
          7,
          18,
          0,
          98,
          19,
          10,
          1,
          121,
          18,
          14,
          10,
          12,
          8,
          1,
          18,
          8,
          10,
          0,
          10,
          0,
          10,
          2,
          8,
          2,
          66,
          2,
          16,
          20
        ],
        this.session_options,
        "y"
      );
    }
    return this._rfft;
  }
  static get top_k() {
    if (!this._top_k) {
      this._top_k = wrap(
        [
          8,
          10,
          18,
          0,
          58,
          73,
          10,
          18,
          10,
          1,
          120,
          10,
          1,
          107,
          18,
          1,
          118,
          18,
          1,
          105,
          34,
          4,
          84,
          111,
          112,
          75,
          18,
          1,
          116,
          90,
          9,
          10,
          1,
          120,
          18,
          4,
          10,
          2,
          8,
          1,
          90,
          15,
          10,
          1,
          107,
          18,
          10,
          10,
          8,
          8,
          7,
          18,
          4,
          10,
          2,
          8,
          1,
          98,
          9,
          10,
          1,
          118,
          18,
          4,
          10,
          2,
          8,
          1,
          98,
          9,
          10,
          1,
          105,
          18,
          4,
          10,
          2,
          8,
          7,
          66,
          2,
          16,
          21
        ],
        this.session_options,
        [
          /* Values */
          "v",
          /* Indices */
          "i"
        ]
      );
    }
    return this._top_k;
  }
  static get slice() {
    if (!this._slice) {
      this._slice = wrap(
        [
          8,
          7,
          18,
          0,
          58,
          96,
          10,
          25,
          10,
          1,
          120,
          10,
          1,
          115,
          10,
          1,
          101,
          10,
          1,
          97,
          10,
          1,
          116,
          18,
          1,
          121,
          34,
          5,
          83,
          108,
          105,
          99,
          101,
          18,
          1,
          114,
          90,
          9,
          10,
          1,
          120,
          18,
          4,
          10,
          2,
          8,
          1,
          90,
          9,
          10,
          1,
          115,
          18,
          4,
          10,
          2,
          8,
          7,
          90,
          9,
          10,
          1,
          101,
          18,
          4,
          10,
          2,
          8,
          7,
          90,
          9,
          10,
          1,
          97,
          18,
          4,
          10,
          2,
          8,
          7,
          90,
          9,
          10,
          1,
          116,
          18,
          4,
          10,
          2,
          8,
          7,
          98,
          9,
          10,
          1,
          121,
          18,
          4,
          10,
          2,
          8,
          1,
          66,
          2,
          16,
          13
        ],
        this.session_options,
        "y"
      );
    }
    return this._slice;
  }
}
class Tensor {
  /**
   * Dimensions of the tensor.
   * @type {number[]}
   */
  get dims() {
    return this.ort_tensor.dims;
  }
  set dims(value) {
    this.ort_tensor.dims = value;
  }
  /**
   * Type of the tensor.
   * @type {DataType}
   */
  get type() {
    return this.ort_tensor.type;
  }
  /**
   * The data stored in the tensor.
   * @type {DataArray}
   */
  get data() {
    return this.ort_tensor.data;
  }
  /**
   * The number of elements in the tensor.
   * @type {number}
   */
  get size() {
    return this.ort_tensor.size;
  }
  /**
   * The location of the tensor data.
   * @type {string}
   */
  get location() {
    return this.ort_tensor.location;
  }
  ort_tensor;
  /**
   * Create a new Tensor, either from raw data or by wrapping an `onnxruntime` tensor:
   * - `new Tensor(dataType, data, dims)`, e.g. `new Tensor('float32', new Float32Array([1, 2, 3]), [3])`.
   * - `new Tensor(ortTensor)`.
   *
   * @param {[DataType, DataArray, number[]]|[ONNXTensor]} args
   */
  constructor(...args) {
    if (isONNXTensor(args[0])) {
      this.ort_tensor = /** @type {ONNXTensor} */
      args[0];
    } else {
      this.ort_tensor = new de(
        /** @type {DataType} */
        args[0],
        // @ts-expect-error ts(2769) Type 'number' is not assignable to type 'bigint'.
        /** @type {Exclude<import('./maths.js').AnyTypedArray, Uint8ClampedArray>} */
        args[1],
        args[2]
      );
    }
    return new Proxy(this, {
      get: (obj, key) => {
        if (typeof key === "string") {
          let index = Number(key);
          if (Number.isInteger(index)) {
            return obj._getitem(index);
          }
        }
        return obj[key];
      },
      set: (obj, key, value) => {
        return obj[key] = value;
      }
    });
  }
  /**
   * Releases the underlying ONNX Runtime tensor (e.g., GPU buffers). Do not use the tensor afterwards.
   */
  dispose() {
    this.ort_tensor.dispose();
  }
  /**
   * Returns an iterator object for iterating over the tensor data in row-major order.
   * If the tensor has more than one dimension, the iterator will yield subarrays.
   * @returns {Iterator<any>} An iterator object for iterating over the tensor data in row-major order.
   */
  *[Symbol.iterator]() {
    const [iterLength, ...iterDims] = this.dims;
    if (iterDims.length > 0) {
      const iterSize = iterDims.reduce((a, b) => a * b);
      for (let i = 0; i < iterLength; ++i) {
        yield this._subarray(i, iterSize, iterDims);
      }
    } else {
      yield* this.data;
    }
  }
  /**
   * Index into a Tensor object.
   * @param {number} index The index to access.
   * @returns {Tensor} The data at the specified index.
   * @private
   */
  _getitem(index) {
    const [iterLength, ...iterDims] = this.dims;
    index = safeIndex(index, iterLength);
    if (iterDims.length > 0) {
      const iterSize = iterDims.reduce((a, b) => a * b);
      return this._subarray(index, iterSize, iterDims);
    } else {
      return new Tensor(this.type, [this.data[index]], iterDims);
    }
  }
  /**
   * @param {number} index
   * @param {number} iterSize
   * @param {any} iterDims
   * @returns {Tensor}
   */
  _subarray(index, iterSize, iterDims) {
    const o1 = index * iterSize;
    const o2 = (index + 1) * iterSize;
    const data = "subarray" in this.data ? this.data.subarray(o1, o2) : this.data.slice(o1, o2);
    return new Tensor(this.type, data, iterDims);
  }
  /**
   * Returns the value of this tensor as a standard JavaScript Number. This only works
   * for tensors with one element. For other cases, see `Tensor.tolist()`.
   * @returns {number|bigint} The value of this tensor as a standard JavaScript Number.
   * @throws {Error} If the tensor has more than one element.
   */
  item() {
    const this_data = this.data;
    if (this_data.length !== 1) {
      throw new Error(`a Tensor with ${this_data.length} elements cannot be converted to Scalar`);
    }
    return this_data[0];
  }
  /**
   * Convert tensor data to a n-dimensional JS list
   * @returns {any[]}
   */
  tolist() {
    return reshape(this.data, this.dims);
  }
  /**
   * Return a new Tensor with the sigmoid function applied to each element.
   * @returns {Tensor} The tensor with the sigmoid function applied.
   */
  sigmoid() {
    return this.clone().sigmoid_();
  }
  /**
   * Applies the sigmoid function to the tensor in place.
   * @returns {Tensor} Returns `this`.
   */
  sigmoid_() {
    const this_data = this.data;
    for (let i = 0; i < this_data.length; ++i) {
      this_data[i] = 1 / (1 + Math.exp(-this_data[i]));
    }
    return this;
  }
  /**
   * Return a new Tensor with a callback function applied to each element.
   * @param {Function} callback - The function to apply to each element. It should take three arguments:
   *                              the current element, its index, and the tensor's data array.
   * @returns {Tensor} A new Tensor with the callback function applied to each element.
   */
  map(callback) {
    return this.clone().map_(callback);
  }
  /**
   * Apply a callback function to each element of the tensor in place.
   * @param {Function} callback - The function to apply to each element. It should take three arguments:
   *                              the current element, its index, and the tensor's data array.
   * @returns {Tensor} Returns `this`.
   */
  map_(callback) {
    const this_data = this.data;
    for (let i = 0; i < this_data.length; ++i) {
      this_data[i] = callback(this_data[i], i, this_data);
    }
    return this;
  }
  /**
   * Return a new Tensor with every element multiplied by a constant.
   * @param {number} val The value to multiply by.
   * @returns {Tensor} The new tensor.
   */
  mul(val) {
    return this.clone().mul_(val);
  }
  /**
   * Multiply the tensor by a constant in place.
   * @param {number} val The value to multiply by.
   * @returns {Tensor} Returns `this`.
   */
  mul_(val) {
    const this_data = this.data;
    for (let i = 0; i < this_data.length; ++i) {
      this_data[i] *= val;
    }
    return this;
  }
  /**
   * Return a new Tensor with every element divided by a constant.
   * @param {number} val The value to divide by.
   * @returns {Tensor} The new tensor.
   */
  div(val) {
    return this.clone().div_(val);
  }
  /**
   * Divide the tensor by a constant in place.
   * @param {number} val The value to divide by.
   * @returns {Tensor} Returns `this`.
   */
  div_(val) {
    const this_data = this.data;
    for (let i = 0; i < this_data.length; ++i) {
      this_data[i] /= val;
    }
    return this;
  }
  /**
   * Return a new Tensor with every element added by a constant.
   * @param {number} val The value to add by.
   * @returns {Tensor} The new tensor.
   */
  add(val) {
    return this.clone().add_(val);
  }
  /**
   * Add the tensor by a constant in place.
   * @param {number} val The value to add by.
   * @returns {Tensor} Returns `this`.
   */
  add_(val) {
    const this_data = this.data;
    for (let i = 0; i < this_data.length; ++i) {
      this_data[i] += val;
    }
    return this;
  }
  /**
   * Return a new Tensor with every element subtracted by a constant.
   * @param {number} val The value to subtract by.
   * @returns {Tensor} The new tensor.
   */
  sub(val) {
    return this.clone().sub_(val);
  }
  /**
   * Subtract the tensor by a constant in place.
   * @param {number} val The value to subtract by.
   * @returns {Tensor} Returns `this`.
   */
  sub_(val) {
    const this_data = this.data;
    for (let i = 0; i < this_data.length; ++i) {
      this_data[i] -= val;
    }
    return this;
  }
  /**
   * Return a new Tensor with the element-wise remainder of division by a constant.
   * Uses Python-style modulo signs (e.g. `-1 mod 2 = 1`) while preserving the tensor's dtype.
   * Negative divisors are unsupported for unsigned and boolean tensors.
   * This operation does not implement PyTorch's dtype promotion or scalar casting rules.
   * @param {number|bigint} val The divisor.
   * @returns {Tensor} The new tensor.
   */
  remainder(val) {
    return this.clone().remainder_(val);
  }
  /**
   * In-place version of @see {@link Tensor.remainder}
   * @param {number|bigint} val The divisor.
   * @returns {Tensor} Returns `this`.
   */
  remainder_(val) {
    const this_data = this.data;
    const is_bigint = this_data instanceof BigInt64Array || this_data instanceof BigUint64Array;
    const divisor = (
      /** @type {any} */
      is_bigint ? BigInt(val) : Number(val)
    );
    if ((divisor === 0 || divisor === 0n) && (this.type.includes("int") || this.type === "bool")) {
      throw new RangeError("Division by zero");
    }
    if (divisor < 0 && (this.type.startsWith("uint") || this.type === "bool")) {
      throw new RangeError("Negative divisors are not supported for unsigned or boolean tensors");
    }
    for (let i = 0; i < this_data.length; ++i) {
      const remainder = this_data[i] % divisor;
      const needs_shift = remainder < 0 && divisor > 0 || remainder > 0 && divisor < 0;
      this_data[i] = needs_shift ? remainder + divisor : remainder;
    }
    return this;
  }
  /**
   * Creates a deep copy of the current Tensor.
   * @returns {Tensor} A new Tensor with the same type, data, and dimensions as the original.
   */
  clone() {
    return new Tensor(this.type, this.data.slice(), this.dims.slice());
  }
  /**
   * Performs a slice operation on the Tensor along specified dimensions.
   *
   * Consider a Tensor that has a dimension of [4, 7]:
   * ```
   * [ 1,  2,  3,  4,  5,  6,  7]
   * [ 8,  9, 10, 11, 12, 13, 14]
   * [15, 16, 17, 18, 19, 20, 21]
   * [22, 23, 24, 25, 26, 27, 28]
   * ```
   * We can slice against the two dims of row and column, for instance in this
   * case we can start at the second element, and return to the second last,
   * like this:
   * ```
   * tensor.slice([1, -1], [1, -1]);
   * ```
   * which would return:
   * ```
   * [  9, 10, 11, 12, 13 ]
   * [ 16, 17, 18, 19, 20 ]
   * ```
   *
   * @param {...(number|number[]|null)} slices The slice specifications for each dimension.
   * - If a number is given, then a single element is selected.
   * - If an array of two numbers is given, then a range of elements [start, end (exclusive)] is selected.
   * - If null is given, then the entire dimension is selected.
   * @returns {Tensor} A new Tensor containing the selected elements.
   * @throws {Error} If the slice input is invalid.
   */
  slice(...slices) {
    const newTensorDims = [];
    const newOffsets = [];
    for (let sliceIndex = 0; sliceIndex < this.dims.length; ++sliceIndex) {
      let slice2 = slices[sliceIndex];
      if (slice2 === null || slice2 === void 0) {
        newOffsets.push([0, this.dims[sliceIndex]]);
        newTensorDims.push(this.dims[sliceIndex]);
      } else if (typeof slice2 === "number") {
        slice2 = safeIndex(slice2, this.dims[sliceIndex], sliceIndex);
        newOffsets.push([slice2, slice2 + 1]);
      } else if (Array.isArray(slice2) && slice2.length === 2) {
        let [start, end] = slice2;
        start = start === null ? 0 : safeIndex(start, this.dims[sliceIndex], sliceIndex, false);
        end = end === null ? this.dims[sliceIndex] : safeIndex(end, this.dims[sliceIndex], sliceIndex, false);
        if (start > end) {
          throw new Error(`Invalid slice: ${slice2}`);
        }
        const offsets = [Math.max(start, 0), Math.min(end, this.dims[sliceIndex])];
        newOffsets.push(offsets);
        newTensorDims.push(offsets[1] - offsets[0]);
      } else {
        throw new Error(`Invalid slice: ${slice2}`);
      }
    }
    const newDims = newOffsets.map(([start, end]) => end - start);
    const newBufferSize = newDims.reduce((a, b) => a * b);
    const this_data = this.data;
    const data = new this_data.constructor(newBufferSize);
    const stride = this.stride();
    let isContiguous = true;
    for (let i = 1; i < newDims.length; ++i) {
      if (newOffsets[i][0] !== 0 || newOffsets[i][1] !== this.dims[i]) {
        isContiguous = false;
        break;
      }
    }
    if (isContiguous) {
      const start = newOffsets[0][0] * stride[0];
      const end = newOffsets[0][1] * stride[0];
      if (ArrayBuffer.isView(this_data)) {
        data.set(this_data.subarray(start, end));
      } else if (Array.isArray(this_data)) {
        const slicedData = this_data.slice(start, end);
        for (let i = 0; i < slicedData.length; ++i) {
          data[i] = slicedData[i];
        }
      } else {
        throw new Error("Unsupported data type for slicing");
      }
    } else {
      for (let i = 0; i < newBufferSize; ++i) {
        let originalIndex = 0;
        for (let j = newDims.length - 1, num = i; j >= 0; --j) {
          const size = newDims[j];
          originalIndex += (num % size + newOffsets[j][0]) * stride[j];
          num = Math.floor(num / size);
        }
        data[i] = this_data[originalIndex];
      }
    }
    return new Tensor(this.type, data, newTensorDims);
  }
  /**
   * Return a permuted version of this Tensor, according to the provided dimensions.
   * @param  {...number} dims Dimensions to permute.
   * @returns {Tensor} The permuted tensor.
   */
  permute(...dims) {
    return permute(this, dims);
  }
  // TODO: implement transpose. For now (backwards compatibility), it's just an alias for permute()
  /** @type {Tensor['permute']} */
  transpose(...dims) {
    return this.permute(...dims);
  }
  /**
   * Returns the sum of each row of the input tensor in the given dimension dim.
   *
   * @param {number|null} [dim=null] The dimension or dimensions to reduce. If `null`, all dimensions are reduced.
   * @param {boolean} keepdim Whether the output tensor has `dim` retained or not.
   * @returns The summed tensor
   */
  sum(dim = null, keepdim = false) {
    return this.norm(1, dim, keepdim);
  }
  /**
   * Returns the matrix norm or vector norm of a given tensor.
   * @param {number|string} [p='fro'] The order of norm
   * @param {number|null} [dim=null] Specifies which dimension of the tensor to calculate the norm across.
   * If dim is None, the norm will be calculated across all dimensions of input.
   * @param {boolean} [keepdim=false] Whether the output tensors have dim retained or not.
   * @returns {Tensor} The norm of the tensor.
   */
  norm(p = "fro", dim = null, keepdim = false) {
    if (p === "fro") {
      p = 2;
    } else if (typeof p === "string") {
      throw Error(`Unsupported norm: ${p}`);
    }
    const this_data = this.data;
    const is_bigint = this_data instanceof BigInt64Array || this_data instanceof BigUint64Array;
    if (is_bigint && p !== 1) {
      throw Error(`Expected a floating point tensor as input. Got ${this.type}`);
    }
    let fn2, zero;
    if (is_bigint) {
      fn2 = (a, b) => a + b;
      zero = 0n;
    } else {
      fn2 = (a, b) => a + b ** p;
      zero = 0;
    }
    if (dim === null) {
      let val = this_data.reduce(fn2, zero);
      if (p !== 1) {
        val = val ** (1 / p);
      }
      return new Tensor(this.type, [val], []);
    }
    const [type, result, resultDims] = reduce_helper(fn2, this, dim, keepdim);
    if (p !== 1) {
      for (let i = 0; i < result.length; ++i) {
        result[i] = result[i] ** (1 / p);
      }
    }
    return new Tensor(type, result, resultDims);
  }
  /**
   * Performs `L_p` normalization of inputs over specified dimension. Operates in place.
   * @param {number} [p=2] The exponent value in the norm formulation
   * @param {number} [dim=1] The dimension to reduce
   * @returns {Tensor} `this` for operation chaining.
   */
  normalize_(p = 2, dim = 1) {
    dim = safeIndex(dim, this.dims.length);
    const norm = this.norm(p, dim, true);
    const this_data = this.data;
    const norm_data = norm.data;
    for (let i = 0; i < this_data.length; ++i) {
      let resultIndex = 0;
      for (let j = this.dims.length - 1, num = i, resultMultiplier = 1; j >= 0; --j) {
        const size = this.dims[j];
        if (j !== dim) {
          const index = num % size;
          resultIndex += index * resultMultiplier;
          resultMultiplier *= this.dims[j];
        }
        num = Math.floor(num / size);
      }
      this_data[i] /= norm_data[resultIndex];
    }
    return this;
  }
  /**
   * Performs `L_p` normalization of inputs over specified dimension.
   * @param {number} [p=2] The exponent value in the norm formulation
   * @param {number} [dim=1] The dimension to reduce
   * @returns {Tensor} The normalized tensor.
   */
  normalize(p = 2, dim = 1) {
    return this.clone().normalize_(p, dim);
  }
  /**
   * Compute and return the stride of this tensor.
   * Stride is the jump necessary to go from one element to the next one in the specified dimension dim.
   * @returns {number[]} The stride of this tensor.
   */
  stride() {
    return dimsToStride(this.dims);
  }
  /**
   * Returns a tensor with all specified dimensions of input of size 1 removed.
   *
   * NOTE: The returned tensor shares the storage with the input tensor, so changing the contents of one will change the contents of the other.
   * If you would like a copy, use `tensor.clone()` before squeezing.
   *
   * @param {number|number[]|null} [dim=null] If given, the input will be squeezed only in the specified dimensions.
   * @returns {Tensor} The squeezed tensor
   */
  squeeze(dim = null) {
    return new Tensor(this.type, this.data, calc_squeeze_dims(this.dims, dim));
  }
  /**
   * In-place version of @see {@link Tensor.squeeze}
   * @param {number|number[]|null} [dim=null] If given, the input will be squeezed only in the specified dimensions.
   * @returns {Tensor} `this`, with the specified dimensions of size 1 removed.
   */
  squeeze_(dim = null) {
    this.dims = calc_squeeze_dims(this.dims, dim);
    return this;
  }
  /**
   * Returns a new tensor with a dimension of size one inserted at the specified position.
   *
   * NOTE: The returned tensor shares the same underlying data with this tensor.
   *
   * @param {number} dim The index at which to insert the singleton dimension
   * @returns {Tensor} The unsqueezed tensor
   */
  unsqueeze(dim) {
    return new Tensor(this.type, this.data, calc_unsqueeze_dims(this.dims, dim));
  }
  /**
   * In-place version of @see {@link Tensor.unsqueeze}
   * @type {Tensor['unsqueeze']}
   */
  unsqueeze_(dim) {
    this.dims = calc_unsqueeze_dims(this.dims, dim);
    return this;
  }
  /**
   * In-place version of @see {@link Tensor.flatten}
   * @param {number} [start_dim=0] the first dim to flatten
   * @param {number} [end_dim=-1] the last dim to flatten
   * @returns {Tensor} `this`, flattened along the specified dimensions.
   */
  flatten_(start_dim = 0, end_dim = -1) {
    end_dim = (end_dim + this.dims.length) % this.dims.length;
    let dimsToKeepBefore = this.dims.slice(0, start_dim);
    let dimsToFlatten = this.dims.slice(start_dim, end_dim + 1);
    let dimsToKeepAfter = this.dims.slice(end_dim + 1);
    this.dims = [...dimsToKeepBefore, dimsToFlatten.reduce((a, b) => a * b, 1), ...dimsToKeepAfter];
    return this;
  }
  /**
   * Flattens input by reshaping it into a one-dimensional tensor.
   * If `start_dim` or `end_dim` are passed, only dimensions starting with `start_dim`
   * and ending with `end_dim` are flattened. The order of elements in input is unchanged.
   * @param {number} start_dim the first dim to flatten
   * @param {number} end_dim the last dim to flatten
   * @returns {Tensor} The flattened tensor.
   */
  flatten(start_dim = 0, end_dim = -1) {
    return this.clone().flatten_(start_dim, end_dim);
  }
  /**
   * Returns a new tensor with the same data as the `self` tensor but of a different `shape`.
   * @param  {...number} dims the desired size
   * @returns {Tensor} The tensor with the same data but different shape
   */
  view(...dims) {
    let inferredIndex = -1;
    for (let i = 0; i < dims.length; ++i) {
      if (dims[i] === -1) {
        if (inferredIndex !== -1) {
          throw new Error("Only one dimension can be inferred");
        }
        inferredIndex = i;
      }
    }
    const this_data = this.data;
    if (inferredIndex !== -1) {
      const productOther = dims.reduce((product, curr, index) => {
        return index !== inferredIndex ? product * curr : product;
      }, 1);
      dims[inferredIndex] = this_data.length / productOther;
    }
    return new Tensor(this.type, this_data, dims);
  }
  /**
   * In-place version of @see {@link Tensor.neg}
   * @returns {Tensor} `this`, with every element negated.
   */
  neg_() {
    const this_data = this.data;
    for (let i = 0; i < this_data.length; ++i) {
      this_data[i] = -this_data[i];
    }
    return this;
  }
  /**
   * Returns a new tensor with the negative of the elements of this tensor.
   * @returns {Tensor} the output tensor.
   */
  neg() {
    return this.clone().neg_();
  }
  /**
   * Computes input > val element-wise.
   * @param {number} val The value to compare with.
   * @returns {Tensor} A boolean tensor that is `true` where input is greater than other and `false` elsewhere.
   */
  gt(val) {
    const mask = new Uint8Array(this.data.length);
    const this_data = this.data;
    for (let i = 0; i < this_data.length; ++i) {
      mask[i] = this_data[i] > val ? 1 : 0;
    }
    return new Tensor("bool", mask, this.dims);
  }
  /**
   * Computes input < val element-wise.
   * @param {number} val The value to compare with.
   * @returns {Tensor} A boolean tensor that is `true` where input is less than other and `false` elsewhere.
   */
  lt(val) {
    const mask = new Uint8Array(this.data.length);
    const this_data = this.data;
    for (let i = 0; i < this_data.length; ++i) {
      mask[i] = this_data[i] < val ? 1 : 0;
    }
    return new Tensor("bool", mask, this.dims);
  }
  /**
   * In-place version of @see {@link Tensor.clamp}
   * @type {Tensor['clamp']}
   */
  clamp_(min2, max2) {
    const this_data = this.data;
    for (let i = 0; i < this_data.length; ++i) {
      this_data[i] = Math.min(Math.max(this_data[i], min2), max2);
    }
    return this;
  }
  /**
   * Clamps all elements in input into the range [ min, max ]
   * @param {number} min lower-bound of the range to be clamped to
   * @param {number} max upper-bound of the range to be clamped to
   * @returns {Tensor} the output tensor.
   */
  clamp(min2, max2) {
    return this.clone().clamp_(min2, max2);
  }
  /**
   * In-place version of @see {@link Tensor.round}
   */
  round_() {
    const this_data = this.data;
    for (let i = 0; i < this_data.length; ++i) {
      this_data[i] = Math.round(this_data[i]);
    }
    return this;
  }
  /**
   * Rounds elements of input to the nearest integer.
   * @returns {Tensor} the output tensor.
   */
  round() {
    return this.clone().round_();
  }
  /**
   * Returns the mean value of each row of this tensor in the given dimension `dim`.
   * @param {number|null} [dim=null] the dimension to reduce. If `null`, the mean of all elements is computed.
   * @param {boolean} [keepdim=false] whether the output tensor has `dim` retained or not.
   * @returns {Tensor} A new tensor with means taken along the specified dimension.
   */
  mean(dim = null, keepdim = false) {
    return mean(this, dim, keepdim);
  }
  /**
   * Returns the minimum value of each row of this tensor in the given dimension `dim`.
   * @param {number|null} [dim=null] the dimension to reduce. If `null`, the minimum of all elements is computed.
   * @param {boolean} [keepdim=false] whether the output tensor has `dim` retained or not.
   * @returns {Tensor} A new tensor with minimum values taken along the specified dimension.
   */
  min(dim = null, keepdim = false) {
    if (dim === null) {
      const val = min$1(this.data)[0];
      return new Tensor(
        this.type,
        [val],
        [
          /* scalar */
        ]
      );
    }
    const [type, result, resultDims] = reduce_helper((a, b) => Math.min(a, b), this, dim, keepdim, Infinity);
    return new Tensor(type, result, resultDims);
  }
  /**
   * Returns the maximum value of each row of this tensor in the given dimension `dim`.
   * @param {number|null} [dim=null] the dimension to reduce. If `null`, the maximum of all elements is computed.
   * @param {boolean} [keepdim=false] whether the output tensor has `dim` retained or not.
   * @returns {Tensor} A new tensor with maximum values taken along the specified dimension.
   */
  max(dim = null, keepdim = false) {
    if (dim === null) {
      const val = max(this.data)[0];
      return new Tensor(
        this.type,
        [val],
        [
          /* scalar */
        ]
      );
    }
    const [type, result, resultDims] = reduce_helper((a, b) => Math.max(a, b), this, dim, keepdim, -Infinity);
    return new Tensor(type, result, resultDims);
  }
  /**
   * Returns the index of the minimum value of all elements in this tensor.
   * @param {number|null} [dim=null] the dimension to reduce. Only `null` (reduce over all elements) is currently supported.
   * @param {boolean} [keepdim=false] whether the output tensor has `dim` retained or not.
   * @returns {Tensor} An `int64` scalar tensor containing the index of the minimum value.
   * @throws {Error} If `dim` is not `null`.
   */
  argmin(dim = null, keepdim = false) {
    if (dim !== null) {
      throw new Error("`dim !== null` not yet implemented.");
    }
    const index = min$1(this.data)[1];
    return new Tensor("int64", [BigInt(index)], []);
  }
  /**
   * Returns the index of the maximum value of all elements in this tensor.
   * @param {number|null} [dim=null] the dimension to reduce. Only `null` (reduce over all elements) is currently supported.
   * @param {boolean} [keepdim=false] whether the output tensor has `dim` retained or not.
   * @returns {Tensor} An `int64` scalar tensor containing the index of the maximum value.
   * @throws {Error} If `dim` is not `null`.
   */
  argmax(dim = null, keepdim = false) {
    if (dim !== null) {
      throw new Error("`dim !== null` not yet implemented.");
    }
    const index = max(this.data)[1];
    return new Tensor("int64", [BigInt(index)], []);
  }
  /**
   * Repeats this tensor along the specified dimensions.
   * @param {...number} repeats The number of times to repeat this tensor along each dimension.
   * @returns {Tensor} The repeated tensor.
   * @throws {Error} If the number of repeats is less than the number of dimensions.
   */
  repeat(...repeats) {
    if (repeats.length < this.dims.length) {
      throw new Error(
        `Number of dimensions of repeat dims (${repeats.length}) cannot be smaller than number of dimensions of tensor (${this.dims.length})`
      );
    }
    if (repeats.every((r) => r === 1)) {
      if (repeats.length === this.dims.length) {
        return this.clone();
      }
      const numPrependedDims2 = repeats.length - this.dims.length;
      const newDims = Array(numPrependedDims2).fill(1).concat(this.dims);
      return new Tensor(this.type, this.data.slice(), newDims);
    }
    const numPrependedDims = repeats.length - this.dims.length;
    const expandedDims = Array(numPrependedDims).fill(1).concat(this.dims);
    const outputDims = expandedDims.map((dim, i) => dim * repeats[i]);
    const outputSize = outputDims.reduce((a, b) => a * b, 1);
    const this_data = this.data;
    const data = new this_data.constructor(outputSize);
    const inputStrides = dimsToStride(expandedDims);
    const outputStrides = dimsToStride(outputDims);
    for (let i = 0; i < outputSize; ++i) {
      let remaining = i;
      let inputIndex = 0;
      for (let d = 0; d < outputDims.length; ++d) {
        const outputCoord = Math.floor(remaining / outputStrides[d]);
        remaining = remaining % outputStrides[d];
        const inputCoord = outputCoord % expandedDims[d];
        inputIndex += inputCoord * inputStrides[d];
      }
      data[i] = this_data[inputIndex];
    }
    return new Tensor(this.type, data, outputDims);
  }
  /**
   * Constructs a tensor by repeating the elements of input. The dims argument specifies the number of repetitions in each dimension.
   * @param  {...number} dims The number of repetitions per dimension.
   * @returns {Tensor} The tiled tensor.
   */
  tile(...dims) {
    if (dims.length < this.dims.length) {
      const numPrependedRepeats = this.dims.length - dims.length;
      dims = Array(numPrependedRepeats).fill(1).concat(dims);
    }
    return this.repeat(...dims);
  }
  /**
   * Performs Tensor dtype conversion.
   * @param {DataType} type The desired data type.
   * @returns {Tensor} The converted tensor.
   */
  to(type) {
    if (this.type === type) return this;
    if (!DataTypeMap.hasOwnProperty(type)) {
      throw new Error(`Unsupported type: ${type}`);
    }
    let map_fn;
    const is_source_bigint = ["int64", "uint64"].includes(this.type);
    const is_dest_bigint = ["int64", "uint64"].includes(type);
    if (is_source_bigint && !is_dest_bigint) {
      map_fn = Number;
    } else if (!is_source_bigint && is_dest_bigint) {
      if (["float16", "float32", "float64"].includes(this.type)) {
        map_fn = (x) => BigInt(Math.floor(x));
      } else {
        map_fn = BigInt;
      }
    } else if (this.type === "float16" && type == "float32" && this.data instanceof Uint16Array) {
      return new Tensor(type, uint16_to_float32(this.data), this.dims);
    }
    return new Tensor(
      type,
      // @ts-ignore - TypeScript can't verify .from() across union of TypedArray constructors
      DataTypeMap[type].from(this.data, map_fn),
      this.dims
    );
  }
}
function reshape(data, dimensions) {
  const totalElements = data.length;
  const dimensionSize = dimensions.length === 0 ? 1 : dimensions.reduce((a, b) => a * b);
  if (totalElements !== dimensionSize) {
    throw Error(`cannot reshape array of size ${totalElements} into shape (${dimensions})`);
  }
  let reshapedArray = data;
  for (let i = dimensions.length - 1; i >= 0; i--) {
    reshapedArray = reshapedArray.reduce(
      (acc, val) => {
        let lastArray = acc[acc.length - 1];
        if (lastArray.length < dimensions[i]) {
          lastArray.push(val);
        } else {
          acc.push([val]);
        }
        return acc;
      },
      [[]]
    );
  }
  return reshapedArray[0];
}
function permute(tensor, axes) {
  const [permutedData, shape] = permute_data(tensor.data, tensor.dims, axes);
  return new Tensor(tensor.type, permutedData, shape);
}
async function interpolate_4d(input, { size = null, mode = "bilinear" } = {}) {
  if (input.dims.length !== 4) {
    throw new Error("`interpolate_4d` currently only supports 4D input.");
  }
  if (!size) {
    throw new Error("`interpolate_4d` requires a `size` argument.");
  }
  let targetDims;
  if (size.length === 2) {
    targetDims = [...input.dims.slice(0, 2), ...size];
  } else if (size.length === 3) {
    targetDims = [input.dims[0], ...size];
  } else if (size.length === 4) {
    targetDims = size;
  } else {
    throw new Error("`size` must be of length 2, 3, or 4.");
  }
  let op;
  if (mode === "nearest") {
    op = await TensorOpRegistry.nearest_interpolate_4d;
  } else if (mode === "bilinear") {
    op = await TensorOpRegistry.bilinear_interpolate_4d;
  } else if (mode === "bicubic") {
    op = await TensorOpRegistry.bicubic_interpolate_4d;
  } else {
    throw new Error(`Unsupported mode: ${mode}`);
  }
  const sizeTensor = new Tensor("int64", new BigInt64Array(targetDims.map(BigInt)), [targetDims.length]);
  return await op({ x: input, s: sizeTensor });
}
async function topk(x, k) {
  const op = await TensorOpRegistry.top_k;
  if (k == null) {
    k = x.dims.at(-1);
  } else {
    k = Math.min(k, x.dims.at(-1));
  }
  return await op({
    x,
    k: new Tensor("int64", [BigInt(k)], [1])
  });
}
const arrayToIndexTensor = (array) => new Tensor("int64", array, [array.length]);
async function slice$1(data, starts, ends, axes, steps) {
  const op = await TensorOpRegistry.slice;
  return await op({
    x: data,
    s: arrayToIndexTensor(starts),
    e: arrayToIndexTensor(ends),
    a: arrayToIndexTensor(axes),
    t: arrayToIndexTensor(new Array(axes.length).fill(1))
  });
}
function calc_squeeze_dims(dims, dim) {
  dims = dims.slice();
  if (dim === null) {
    dims = dims.filter((d) => d !== 1);
  } else if (typeof dim === "number") {
    if (dims[dim] === 1) {
      dims.splice(dim, 1);
    }
  } else if (Array.isArray(dim)) {
    dims = dims.filter((x, i) => {
      return x !== 1 || !dim.includes(i);
    });
  }
  return dims;
}
function calc_unsqueeze_dims(dims, dim) {
  dim = safeIndex(dim, dims.length + 1);
  dims = dims.slice();
  dims.splice(dim, 0, 1);
  return dims;
}
function safeIndex(index, size, dimension = null, boundsCheck = true) {
  if (index < -size || index >= size) {
    if (boundsCheck) {
      throw new Error(
        `IndexError: index ${index} is out of bounds for dimension${dimension === null ? "" : " " + dimension} with size ${size}`
      );
    } else {
      return index < -size ? 0 : size;
    }
  }
  if (index < 0) {
    index = (index % size + size) % size;
  }
  return index;
}
function cat(tensors, dim = 0) {
  dim = safeIndex(dim, tensors[0].dims.length);
  const resultDims = tensors[0].dims.slice();
  resultDims[dim] = tensors.reduce((a, b) => a + b.dims[dim], 0);
  const resultSize = resultDims.reduce((a, b) => a * b, 1);
  const result = new tensors[0].data.constructor(resultSize);
  const resultType = tensors[0].type;
  if (dim === 0) {
    let offset = 0;
    for (const tensor of tensors) {
      const tensorData = tensor.data;
      result.set(tensorData, offset);
      offset += tensorData.length;
    }
  } else {
    let currentDim = 0;
    for (let t = 0; t < tensors.length; ++t) {
      const { data, dims } = tensors[t];
      for (let i = 0; i < data.length; ++i) {
        let resultIndex = 0;
        for (let j = dims.length - 1, num = i, resultMultiplier = 1; j >= 0; --j) {
          const size = dims[j];
          let index = num % size;
          if (j === dim) {
            index += currentDim;
          }
          resultIndex += index * resultMultiplier;
          resultMultiplier *= resultDims[j];
          num = Math.floor(num / size);
        }
        result[resultIndex] = data[i];
      }
      currentDim += dims[dim];
    }
  }
  return new Tensor(resultType, result, resultDims);
}
function stack(tensors, dim = 0) {
  return cat(
    tensors.map((t) => t.unsqueeze(dim)),
    dim
  );
}
function reduce_helper(callbackfn, input, dim, keepdim = false, initialValue = null) {
  const inputData = input.data;
  const inputDims = input.dims;
  dim = safeIndex(dim, inputDims.length);
  const resultDims = inputDims.slice();
  resultDims[dim] = 1;
  const result = new inputData.constructor(inputData.length / inputDims[dim]);
  if (initialValue !== null) {
    result.fill(initialValue);
  }
  for (let i = 0; i < inputData.length; ++i) {
    let resultIndex = 0;
    for (let j = inputDims.length - 1, num = i, resultMultiplier = 1; j >= 0; --j) {
      const size = inputDims[j];
      if (j !== dim) {
        const index = num % size;
        resultIndex += index * resultMultiplier;
        resultMultiplier *= resultDims[j];
      }
      num = Math.floor(num / size);
    }
    result[resultIndex] = callbackfn(result[resultIndex], inputData[i], i, resultIndex);
  }
  if (!keepdim) resultDims.splice(dim, 1);
  return [input.type, result, resultDims];
}
function mean(input, dim = null, keepdim = false) {
  const inputDims = input.dims;
  const inputData = (
    /** @type {Float32Array} */
    input.data
  );
  if (dim === null) {
    const val = inputData.reduce((a, b) => a + b, 0);
    return new Tensor(
      input.type,
      [val / inputData.length],
      [
        /* scalar */
      ]
    );
  }
  dim = safeIndex(dim, inputDims.length);
  const [type, result, resultDims] = reduce_helper((a, b) => a + b, input, dim, keepdim);
  if (inputDims[dim] !== 1) {
    for (let i = 0; i < result.length; ++i) {
      result[i] /= inputDims[dim];
    }
  }
  return new Tensor(type, result, resultDims);
}
function dimsToStride(dims) {
  const stride = new Array(dims.length);
  for (let i = dims.length - 1, s2 = 1; i >= 0; --i) {
    stride[i] = s2;
    s2 *= dims[i];
  }
  return stride;
}
function fullHelper(size, fill_value, dtype, cls) {
  const numElements = size.reduce((a, b) => a * b, 1);
  return new Tensor(dtype, new cls(numElements).fill(fill_value), size);
}
function full(size, fill_value) {
  let dtype;
  let typedArrayCls;
  if (typeof fill_value === "number") {
    dtype = "float32";
    typedArrayCls = Float32Array;
  } else if (typeof fill_value === "bigint") {
    dtype = "int64";
    typedArrayCls = BigInt64Array;
  } else if (typeof fill_value === "boolean") {
    dtype = "bool";
    typedArrayCls = Uint8Array;
  } else {
    throw new Error(`Unsupported data type: ${typeof fill_value}`);
  }
  return fullHelper(size, fill_value, dtype, typedArrayCls);
}
function full_like(tensor, fill_value) {
  return full(tensor.dims, fill_value);
}
function ones(size) {
  return fullHelper(size, 1n, "int64", BigInt64Array);
}
function ones_like(tensor) {
  return ones(tensor.dims);
}
function zeros(size) {
  return fullHelper(size, 0n, "int64", BigInt64Array);
}
function zeros_like(tensor) {
  return zeros(tensor.dims);
}
async function getSession(pretrained_model_name_or_path, fileName, options, cache_config = false, session_name = void 0) {
  let custom_config = options.config?.["transformers.js_config"] ?? {};
  const selectedDevice = (
    /** @type {import("../utils/devices.js").DeviceType} */
    selectDevice(options.device ?? custom_config.device, fileName, {
      warn: (msg) => logger.info(msg)
    })
  );
  const executionProviders = deviceToExecutionProviders(selectedDevice);
  const device_config = custom_config.device_config ?? {};
  if (device_config.hasOwnProperty(selectedDevice)) {
    custom_config = {
      ...custom_config,
      ...device_config[selectedDevice]
    };
  }
  const selectedDtype = (
    /** @type {import("../utils/dtypes.js").DataType} */
    selectDtype(options.dtype ?? custom_config.dtype, fileName, selectedDevice, {
      configDtype: custom_config.dtype,
      warn: (msg) => logger.info(msg)
    })
  );
  if (!DEFAULT_DTYPE_SUFFIX_MAPPING.hasOwnProperty(selectedDtype)) {
    throw new Error(`Invalid dtype: ${selectedDtype}. Should be one of: ${Object.keys(DATA_TYPES).join(", ")}`);
  } else if (selectedDevice === "webgpu" && // NOTE: Currently, we assume that the Native WebGPU EP always supports fp16. In future, we will add a check for this.
  !apis.IS_NODE_ENV && selectedDtype === DATA_TYPES.fp16 && !await isWebGpuFp16Supported()) {
    throw new Error(`The device (${selectedDevice}) does not support fp16.`);
  }
  const suffix = DEFAULT_DTYPE_SUFFIX_MAPPING[selectedDtype];
  const session_options = { ...options.session_options };
  session_options.executionProviders ??= executionProviders;
  const free_dimension_overrides = custom_config.free_dimension_overrides;
  if (free_dimension_overrides) {
    session_options.freeDimensionOverrides ??= free_dimension_overrides;
  } else if (selectedDevice.startsWith("webnn") && !session_options.freeDimensionOverrides) {
    logger.warn(
      `WebNN does not currently support dynamic shapes and requires 'free_dimension_overrides' to be set in config.json, preferably as a field within config["transformers.js_config"]["device_config"]["${selectedDevice}"]. When 'free_dimension_overrides' is not set, you may experience significant performance degradation.`
    );
  }
  const bufferOrPathPromise = getCoreModelFile(pretrained_model_name_or_path, fileName, options, suffix);
  const use_external_data_format = options.use_external_data_format ?? custom_config.use_external_data_format;
  const externalData = await getModelDataFiles(
    pretrained_model_name_or_path,
    fileName,
    suffix,
    options,
    use_external_data_format,
    session_options
  );
  if (externalData.length > 0 && (!apis.IS_NODE_ENV || externalData.some((data) => typeof data !== "string"))) {
    session_options.externalData = externalData;
  }
  if (cache_config && selectedDevice === "webgpu") {
    const names = getCacheNames(options.config, {
      prefix: "present",
      session_name
    });
    if (names.size > 0 && !isONNXProxy()) {
      const preferredOutputLocation = {};
      for (const key of names) {
        preferredOutputLocation[key] = "gpu-buffer";
      }
      session_options.preferredOutputLocation = preferredOutputLocation;
    }
  }
  const buffer_or_path = await bufferOrPathPromise;
  const session_config = {
    dtype: selectedDtype,
    device: selectedDevice
  };
  return { buffer_or_path, session_options, session_config };
}
async function constructSessions(pretrained_model_name_or_path, names, options, cache_sessions = void 0) {
  return Object.fromEntries(
    await Promise.all(
      Object.keys(names).map(async (name2) => {
        const cache_config = cache_sessions?.[name2] ?? false;
        const { buffer_or_path, session_options, session_config } = await getSession(
          pretrained_model_name_or_path,
          names[name2],
          options,
          cache_config,
          name2
        );
        const session = await createInferenceSession(buffer_or_path, session_options, session_config);
        return [name2, session];
      })
    )
  );
}
function replaceTensors(obj) {
  for (let prop in obj) {
    if (isONNXTensor(obj[prop])) {
      obj[prop] = new Tensor(obj[prop]);
    } else if (typeof obj[prop] === "object") {
      replaceTensors(obj[prop]);
    }
  }
  return obj;
}
async function sessionRun(session, inputs) {
  const checkedInputs = validateInputs(session, inputs);
  try {
    const ortFeed = Object.fromEntries(
      Object.entries(checkedInputs).map(([k, v]) => {
        const tensor = (
          /** @type {any} */
          v.ort_tensor
        );
        if (apis.IS_NODE_ENV) {
          if (typeof Float16Array !== "undefined" && tensor.cpuData instanceof Float16Array) {
            tensor.cpuData = new Uint16Array(tensor.cpuData.buffer);
          }
        }
        return [k, tensor];
      })
    );
    const output = await runInferenceSession(session, ortFeed);
    return replaceTensors(output);
  } catch (e) {
    const formatted = Object.fromEntries(
      Object.entries(checkedInputs).map(([k, tensor]) => {
        const unpacked = {
          type: tensor.type,
          dims: tensor.dims,
          location: tensor.location
        };
        if (unpacked.location !== "gpu-buffer") {
          unpacked.data = tensor.data;
        }
        return [k, unpacked];
      })
    );
    logger.error(`An error occurred during model execution: "${e}".`);
    logger.error("Inputs given to model:", formatted);
    throw e;
  }
}
function validateInputs(session, inputs) {
  const checkedInputs = /* @__PURE__ */ Object.create(null);
  const missingInputs = [];
  for (const inputName of session.inputNames) {
    const tensor = inputs[inputName];
    if (!(tensor instanceof Tensor)) {
      missingInputs.push(inputName);
      continue;
    }
    checkedInputs[inputName] = isONNXProxy() ? tensor.clone() : tensor;
  }
  if (missingInputs.length > 0) {
    throw new Error(
      `An error occurred during model execution: "Missing the following inputs: ${missingInputs.join(", ")}.`
    );
  }
  const numInputsProvided = Object.keys(inputs).length;
  const numInputsNeeded = session.inputNames.length;
  if (numInputsProvided > numInputsNeeded) {
    let ignored = Object.keys(inputs).filter((inputName) => !session.inputNames.includes(inputName));
    logger.warn(
      `WARNING: Too many inputs were provided (${numInputsProvided} > ${numInputsNeeded}). The following inputs will be ignored: "${ignored.join(", ")}".`
    );
  }
  return checkedInputs;
}
const GITHUB_ISSUE_URL = "https://github.com/huggingface/transformers.js/issues/new/choose";
const IMAGE_PROCESSOR_NAME = "preprocessor_config.json";
const PROCESSOR_NAME = "processor_config.json";
const CHAT_TEMPLATE_NAME = "chat_template.jinja";
class LogitsProcessor extends Callable$1 {
  /**
   * Apply the processor to the input logits.
   *
   * @abstract
   * @param {bigint[][]} input_ids The input IDs.
   * @param {Tensor} logits The logits to process.
   * @throws {Error} Throws an error if `_call` is not implemented in the subclass.
   */
  _call(input_ids, logits) {
    throw Error("`_call` should be implemented in a subclass");
  }
}
class LogitsWarper extends Callable$1 {
  /**
   * Apply the processor to the input logits.
   *
   * @abstract
   * @param {bigint[][]} input_ids The input IDs.
   * @param {Tensor} logits The logits to process.
   * @throws {Error} Throws an error if `_call` is not implemented in the subclass.
   */
  _call(input_ids, logits) {
    throw Error("`_call` should be implemented in a subclass");
  }
}
class LogitsProcessorList extends Callable$1 {
  /**
   * Constructs a new instance of `LogitsProcessorList`.
   */
  constructor() {
    super();
    this.processors = [];
  }
  /**
   * Adds a new logits processor to the list.
   *
   * @param {LogitsProcessor} item The logits processor function to add.
   */
  push(item) {
    this.processors.push(item);
  }
  /**
   * Adds multiple logits processors to the list.
   *
   * @param {LogitsProcessor[]} items The logits processor functions to add.
   */
  extend(items) {
    this.processors.push(...items);
  }
  /**
   * Applies all logits processors in the list to a batch of logits, modifying them in-place.
   *
   * @param {bigint[][]} input_ids The input IDs for the language model.
   * @param {Tensor} logits
   */
  _call(input_ids, logits) {
    let toReturn = logits;
    for (const processor of this.processors) {
      toReturn = processor(input_ids, toReturn);
    }
    return toReturn;
  }
  [Symbol.iterator]() {
    return this.processors.values();
  }
}
class ForcedBOSTokenLogitsProcessor extends LogitsProcessor {
  /**
   * Create a ForcedBOSTokenLogitsProcessor.
   * @param {number} bos_token_id The ID of the beginning-of-sequence token to be forced.
   */
  constructor(bos_token_id) {
    super();
    this.bos_token_id = bos_token_id;
  }
  /**
   * Apply the BOS token forcing to the logits.
   * @param {bigint[][]} input_ids The input IDs.
   * @param {Tensor} logits The logits.
   * @returns {Tensor} The logits with BOS token forcing.
   */
  _call(input_ids, logits) {
    for (let i = 0; i < input_ids.length; ++i) {
      if (input_ids[i].length === 1) {
        const batch_logits_data = (
          /** @type {Float32Array} */
          logits[i].data
        );
        batch_logits_data.fill(-Infinity);
        batch_logits_data[this.bos_token_id] = 0;
      }
    }
    return logits;
  }
}
class ForcedEOSTokenLogitsProcessor extends LogitsProcessor {
  /**
   * Create a ForcedEOSTokenLogitsProcessor.
   * @param {number} max_length The maximum length of the sequence to be generated.
   * @param {number|number[]} eos_token_id The ID or IDs of the *end-of-sequence* token.
   */
  constructor(max_length, eos_token_id) {
    super();
    this.max_length = max_length;
    this.eos_token_id = Array.isArray(eos_token_id) ? eos_token_id : [eos_token_id];
  }
  /**
   * Apply the processor to input_ids and logits.
   *
   * @param {bigint[][]} input_ids The input IDs.
   * @param {Tensor} logits The logits tensor.
   */
  _call(input_ids, logits) {
    for (let i = 0; i < input_ids.length; ++i) {
      if (input_ids[i].length === this.max_length - 1) {
        const batch_logits_data = (
          /** @type {Float32Array} */
          logits[i].data
        );
        batch_logits_data.fill(-Infinity);
        for (const eos_token of this.eos_token_id) {
          batch_logits_data[eos_token] = 0;
        }
      }
    }
    return logits;
  }
}
class SuppressTokensLogitsProcessor extends LogitsProcessor {
  /**
   * Create a SuppressTokensLogitsProcessor.
   * @param {number[]} suppress_tokens The IDs of the tokens to suppress.
   */
  constructor(suppress_tokens) {
    super();
    this.suppress_tokens = suppress_tokens;
  }
  /**
   * Suppress the specified tokens by setting their logits to -Infinity.
   * @param {bigint[][]} input_ids The input IDs.
   * @param {Tensor} logits The logits.
   * @returns {Tensor} The modified logits.
   */
  _call(input_ids, logits) {
    for (let i = 0; i < input_ids.length; ++i) {
      const batch_logits_data = (
        /** @type {Float32Array} */
        logits[i].data
      );
      for (const token_id of this.suppress_tokens) {
        batch_logits_data[token_id] = -Infinity;
      }
    }
    return logits;
  }
}
class SuppressTokensAtBeginLogitsProcessor extends LogitsProcessor {
  /**
   * Create a SuppressTokensAtBeginLogitsProcessor.
   * @param {number[]} begin_suppress_tokens The IDs of the tokens to suppress.
   * @param {number} begin_index The number of tokens to generate before suppressing tokens.
   */
  constructor(begin_suppress_tokens, begin_index) {
    super();
    this.begin_suppress_tokens = begin_suppress_tokens;
    this.begin_index = begin_index;
  }
  /**
   * Apply the BOS token forcing to the logits.
   * @param {bigint[][]} input_ids The input IDs.
   * @param {Tensor} logits The logits.
   * @returns {Tensor} The logits with BOS token forcing.
   */
  _call(input_ids, logits) {
    for (let i = 0; i < input_ids.length; ++i) {
      if (input_ids[i].length === this.begin_index) {
        const batch_logits_data = (
          /** @type {Float32Array} */
          logits[i].data
        );
        for (const token_id of this.begin_suppress_tokens) {
          batch_logits_data[token_id] = -Infinity;
        }
      }
    }
    return logits;
  }
}
class NoRepeatNGramLogitsProcessor extends LogitsProcessor {
  /**
   * Create a NoRepeatNGramLogitsProcessor.
   * @param {number} no_repeat_ngram_size The no-repeat n-gram size. All n-grams of this size can only occur once.
   */
  constructor(no_repeat_ngram_size) {
    super();
    this.no_repeat_ngram_size = no_repeat_ngram_size;
  }
  /**
   * Generate n-grams from a sequence of token IDs.
   * @param {bigint[]} prevInputIds List of previous input IDs.
   * @returns {Map<string, number[]>} Map of generated n-grams
   */
  getNgrams(prevInputIds) {
    const curLen = prevInputIds.length;
    const ngrams = [];
    for (let j = 0; j < curLen + 1 - this.no_repeat_ngram_size; ++j) {
      const ngram = [];
      for (let k = 0; k < this.no_repeat_ngram_size; ++k) {
        ngram.push(prevInputIds[j + k]);
      }
      ngrams.push(ngram.map(Number));
    }
    const generatedNgram = /* @__PURE__ */ new Map();
    for (const ngram of ngrams) {
      const prevNgram = ngram.slice(0, ngram.length - 1);
      const prevNgramKey = JSON.stringify(prevNgram);
      const prevNgramValue = generatedNgram.get(prevNgramKey) ?? [];
      prevNgramValue.push(ngram[ngram.length - 1]);
      generatedNgram.set(prevNgramKey, prevNgramValue);
    }
    return generatedNgram;
  }
  /**
   * Generate n-grams from a sequence of token IDs.
   * @param {Map<string, number[]>} bannedNgrams Map of banned n-grams
   * @param {bigint[]} prevInputIds List of previous input IDs.
   * @returns {number[]} Map of generated n-grams
   */
  getGeneratedNgrams(bannedNgrams, prevInputIds) {
    const ngramIdx = prevInputIds.slice(prevInputIds.length + 1 - this.no_repeat_ngram_size, prevInputIds.length);
    const banned = bannedNgrams.get(JSON.stringify(ngramIdx.map(Number))) ?? [];
    return banned;
  }
  /**
   * Calculate banned n-gram tokens
   * @param {bigint[]} prevInputIds List of previous input IDs.
   * @returns {number[]} Map of generated n-grams
   */
  calcBannedNgramTokens(prevInputIds) {
    const bannedTokens = [];
    if (prevInputIds.length + 1 < this.no_repeat_ngram_size) {
      return bannedTokens;
    } else {
      const generatedNgrams = this.getNgrams(prevInputIds);
      const bannedTokens2 = this.getGeneratedNgrams(generatedNgrams, prevInputIds);
      return bannedTokens2;
    }
  }
  /**
   * Apply the no-repeat n-gram processor to the logits.
   * @param {bigint[][]} input_ids The input IDs.
   * @param {Tensor} logits The logits.
   * @returns {Tensor} The logits with no-repeat n-gram processing.
   */
  _call(input_ids, logits) {
    for (let i = 0; i < input_ids.length; ++i) {
      const batch_logits_data = (
        /** @type {Float32Array} */
        logits[i].data
      );
      const bannedTokens = this.calcBannedNgramTokens(input_ids[i]);
      for (const token of bannedTokens) {
        batch_logits_data[token] = -Infinity;
      }
    }
    return logits;
  }
}
class RepetitionPenaltyLogitsProcessor extends LogitsProcessor {
  /**
   * Create a RepetitionPenaltyLogitsProcessor.
   * @param {number} penalty Penalty applied to repeated tokens.
   * - 1.0 means no penalty. Above 1.0 penalizes previously generated tokens.
   * - Between 0.0 and 1.0 rewards previously generated tokens.
   */
  constructor(penalty) {
    super();
    this.penalty = penalty;
  }
  /**
   * Apply the repetition penalty to the logits.
   * @param {bigint[][]} input_ids The input IDs.
   * @param {Tensor} logits The logits.
   * @returns {Tensor} The logits with repetition penalty processing.
   */
  _call(input_ids, logits) {
    for (let i = 0; i < input_ids.length; ++i) {
      const batch_logits_data = (
        /** @type {Float32Array} */
        logits[i].data
      );
      for (const input_id of new Set(input_ids[i])) {
        const token = Number(input_id);
        if (batch_logits_data[token] < 0) {
          batch_logits_data[token] *= this.penalty;
        } else {
          batch_logits_data[token] /= this.penalty;
        }
      }
    }
    return logits;
  }
}
class MinLengthLogitsProcessor extends LogitsProcessor {
  /**
   * Create a MinLengthLogitsProcessor.
   * @param {number} min_length The minimum length below which the score of `eos_token_id` is set to negative infinity.
   * @param {number|number[]} eos_token_id The ID or IDs of the end-of-sequence token.
   */
  constructor(min_length, eos_token_id) {
    super();
    this.min_length = min_length;
    this.eos_token_id = Array.isArray(eos_token_id) ? eos_token_id : [eos_token_id];
  }
  /**
   * Apply logit processor.
   * @param {bigint[][]} input_ids The input IDs.
   * @param {Tensor} logits The logits.
   * @returns {Tensor} The processed logits.
   */
  _call(input_ids, logits) {
    for (let i = 0; i < input_ids.length; ++i) {
      if (input_ids[i].length < this.min_length) {
        const batch_logits_data = (
          /** @type {Float32Array} */
          logits[i].data
        );
        for (const eos_token of this.eos_token_id) {
          batch_logits_data[eos_token] = -Infinity;
        }
      }
    }
    return logits;
  }
}
class MinNewTokensLengthLogitsProcessor extends LogitsProcessor {
  /**
   * Create a MinNewTokensLengthLogitsProcessor.
   * @param {number} prompt_length_to_skip The input tokens length.
   * @param {number} min_new_tokens The minimum *new* tokens length below which the score of `eos_token_id` is set to negative infinity.
   * @param {number|number[]} eos_token_id The ID or IDs of the end-of-sequence token.
   */
  constructor(prompt_length_to_skip, min_new_tokens, eos_token_id) {
    super();
    this.prompt_length_to_skip = prompt_length_to_skip;
    this.min_new_tokens = min_new_tokens;
    this.eos_token_id = Array.isArray(eos_token_id) ? eos_token_id : [eos_token_id];
  }
  /**
   * Apply logit processor.
   * @param {bigint[][]} input_ids The input IDs.
   * @param {Tensor} logits The logits.
   * @returns {Tensor} The processed logits.
   */
  _call(input_ids, logits) {
    for (let i = 0; i < input_ids.length; ++i) {
      const new_tokens_length = input_ids[i].length - this.prompt_length_to_skip;
      if (new_tokens_length < this.min_new_tokens) {
        const batch_logits_data = (
          /** @type {Float32Array} */
          logits[i].data
        );
        for (const eos_token of this.eos_token_id) {
          batch_logits_data[eos_token] = -Infinity;
        }
      }
    }
    return logits;
  }
}
class NoBadWordsLogitsProcessor extends LogitsProcessor {
  /**
   * Create a `NoBadWordsLogitsProcessor`.
   * @param {number[][]} bad_words_ids List of token ID sequences that are not allowed to be generated.
   * @param {number|number[]} eos_token_id The ID of the *end-of-sequence* token. Optionally, use a list to set multiple *end-of-sequence* tokens.
   */
  constructor(bad_words_ids, eos_token_id) {
    super();
    this.bad_words_ids = bad_words_ids;
    this.eos_token_id = Array.isArray(eos_token_id) ? eos_token_id : [eos_token_id];
  }
  /**
   * Apply logit processor.
   * @param {bigint[][]} input_ids The input IDs.
   * @param {Tensor} logits The logits.
   * @returns {Tensor} The processed logits.
   */
  _call(input_ids, logits) {
    for (let i = 0; i < input_ids.length; ++i) {
      const batch_logits_data = (
        /** @type {Float32Array} */
        logits[i].data
      );
      const ids = input_ids[i];
      for (const bad_word_ids of this.bad_words_ids) {
        if (ids.length < bad_word_ids.length - 1) continue;
        let mark = true;
        for (let j = 1; j <= bad_word_ids.length - 1; ++j) {
          if (bad_word_ids.at(-j - 1) != ids.at(-j)) {
            mark = false;
            break;
          }
        }
        if (mark) {
          batch_logits_data[bad_word_ids.at(-1)] = -Infinity;
        }
      }
    }
    return logits;
  }
}
class ClassifierFreeGuidanceLogitsProcessor extends LogitsProcessor {
  /**
   * Create a `ClassifierFreeGuidanceLogitsProcessor`.
   * @param {number} guidance_scale The guidance scale for classifier-free guidance (CFG). CFG is enabled by setting `guidance_scale > 1`.
   * Higher guidance scale encourages the model to generate samples that are more closely tied to the input
   * prompt, usually at the expense of poorer quality.
   */
  constructor(guidance_scale) {
    super();
    if (guidance_scale <= 1) {
      throw new Error(
        `Require guidance scale >1 to use the classifier-free guidance processor, got guidance scale ${guidance_scale}.`
      );
    }
    this.guidance_scale = guidance_scale;
  }
  /**
   * Apply logit processor.
   * @param {bigint[][]} input_ids The input IDs.
   * @param {Tensor} logits The logits.
   * @returns {Tensor} The processed logits.
   */
  _call(input_ids, logits) {
    if (logits.dims[0] !== 2 * input_ids.length) {
      throw new Error(
        `Logits should have twice the batch size of the input ids, the first half of batches corresponding to the conditional inputs, and the second half of batches corresponding to the unconditional inputs. Got batch size ${logits.dims[0]} for the logits and ${input_ids.length} for the input ids.`
      );
    }
    const unguided_bsz = input_ids.length;
    const cond_logits = logits.slice([0, unguided_bsz], null);
    const uncond_logits = logits.slice([unguided_bsz, logits.dims[0]], null);
    for (let i = 0; i < uncond_logits.data.length; ++i) {
      uncond_logits.data[i] += (cond_logits.data[i] - uncond_logits.data[i]) * this.guidance_scale;
    }
    return uncond_logits;
  }
}
class TemperatureLogitsWarper extends LogitsWarper {
  /**
   * Create a `TemperatureLogitsWarper`.
   * @param {number} temperature Strictly positive float value used to modulate the logits distribution.
   * A value smaller than `1` decreases randomness (and vice versa), with `0` being equivalent to shifting
   * all probability mass to the most likely token.
   */
  constructor(temperature) {
    super();
    this.temperature = temperature;
  }
  /**
   * Apply logit warper.
   * @param {bigint[][]} input_ids The input IDs.
   * @param {Tensor} logits The logits.
   * @returns {Tensor} The processed logits.
   */
  _call(input_ids, logits) {
    const batch_logits_data = (
      /** @type {Float32Array} */
      logits.data
    );
    for (let i = 0; i < batch_logits_data.length; ++i) {
      batch_logits_data[i] /= this.temperature;
    }
    return logits;
  }
}
class GenerationConfig {
  // Parameters that control the length of the output
  /**
   * The maximum length the generated tokens can have.
   * Corresponds to the length of the input prompt + `max_new_tokens`.
   * Its effect is overridden by `max_new_tokens`, if also set.
   * @type {number}
   * @default 20
   */
  max_length = 20;
  /**
   * The maximum number of tokens to generate, ignoring the number of tokens in the prompt.
   * @type {number}
   * @default null
   */
  max_new_tokens = null;
  /**
   * The minimum length of the sequence to be generated.
   * Corresponds to the length of the input prompt + `min_new_tokens`.
   * Its effect is overridden by `min_new_tokens`, if also set.
   * @type {number}
   * @default 0
   */
  min_length = 0;
  /**
   * The minimum number of tokens to generate, ignoring the number of tokens in the prompt.
   * @type {number}
   * @default null
   */
  min_new_tokens = null;
  /**
   * Controls the stopping condition for beam-based methods, like beam-search. It accepts the following values:
   * - `true`, where the generation stops as soon as there are `num_beams` complete candidates;
   * - `false`, where a heuristic is applied and the generation stops when it is very unlikely to find better candidates;
   * - `"never"`, where the beam search procedure only stops when there cannot be better candidates (canonical beam search algorithm).
   * @type {boolean|"never"}
   * @default false
   */
  early_stopping = false;
  /**
   * The maximum time, in seconds, allowed for generation.
   * Generation will still finish the current pass after the allocated time has passed.
   * @type {number}
   * @default null
   */
  max_time = null;
  // Parameters that control the generation strategy used
  /**
   * Whether to use sampling; use greedy decoding otherwise.
   * @type {boolean}
   * @default false
   */
  do_sample = false;
  /**
   * Number of beams for beam search. 1 means no beam search.
   * @type {number}
   * @default 1
   */
  num_beams = 1;
  /**
   * Number of groups to divide `num_beams` into to encourage diversity among different groups of beams.
   * See [this paper](https://huggingface.co/papers/1610.02424) for more details.
   * @type {number}
   * @default 1
   */
  num_beam_groups = 1;
  /**
   * Balance model confidence against the degeneration penalty during contrastive search decoding.
   * @type {number}
   * @default null
   */
  penalty_alpha = null;
  /**
   * Whether the model should reuse past key/value states, when supported, to speed up decoding.
   * @type {boolean}
   * @default true
   */
  use_cache = true;
  // Parameters for manipulation of the model output logits
  /**
   * The value used to modulate the next token probabilities.
   * @type {number}
   * @default 1.0
   */
  temperature = 1;
  /**
   * The number of highest-probability vocabulary tokens to keep for top-k filtering.
   * @type {number}
   * @default 50
   */
  top_k = 50;
  /**
   * If set to a float below 1, only the smallest set of most probable tokens with probabilities that add up to `top_p` or higher are kept for generation.
   * @type {number}
   * @default 1.0
   */
  top_p = 1;
  /**
   * Local typicality measures how similar the conditional probability of predicting a target token next is to the expected conditional probability of predicting a random token next, given the partial text already generated.
   * If set to a float below 1, the smallest set of the most locally typical tokens with probabilities that add up to `typical_p` or higher are kept for generation.
   * See [this paper](https://huggingface.co/papers/2202.00666) for more details.
   * @type {number}
   * @default 1.0
   */
  typical_p = 1;
  /**
   * If set to a float strictly between 0 and 1, only tokens with a conditional probability greater than `epsilon_cutoff` will be sampled.
   * In the paper, suggested values range from 3e-4 to 9e-4, depending on the size of the model.
   * See [Truncation Sampling as Language Model Desmoothing](https://huggingface.co/papers/2210.15191) for more details.
   * @type {number}
   * @default 0.0
   */
  epsilon_cutoff = 0;
  /**
   * Eta sampling is a hybrid of locally typical sampling and epsilon sampling.
   * If set to a float strictly between 0 and 1, a token is only considered if it is greater than either `eta_cutoff` or `sqrt(eta_cutoff) * exp(-entropy(softmax(next_token_logits)))`.
   * The latter term is intuitively the expected next token probability, scaled by `sqrt(eta_cutoff)`. In the paper, suggested values range from 3e-4 to 2e-3, depending on the size of the model.
   * See [Truncation Sampling as Language Model Desmoothing](https://huggingface.co/papers/2210.15191) for more details.
   * @type {number}
   * @default 0.0
   */
  eta_cutoff = 0;
  /**
   * This value is subtracted from a beam's score if it generates the same token as any beam from another group at a particular time.
   * Note that `diversity_penalty` is only effective if `group beam search` is enabled.
   * @type {number}
   * @default 0.0
   */
  diversity_penalty = 0;
  /**
   * Penalty applied to repeated tokens. 1.0 means no penalty.
   * See [this paper](https://huggingface.co/papers/1909.05858) for more details.
   * @type {number}
   * @default 1.0
   */
  repetition_penalty = 1;
  /**
   * Penalty applied to sequences that are not in the original input.
   * 1.0 means no penalty.
   * @type {number}
   * @default 1.0
   */
  encoder_repetition_penalty = 1;
  /**
   * Exponential penalty applied to sequence length during beam-based generation.
   * It is applied as an exponent to the sequence length, which in turn is used to divide the score of the sequence.
   * Since the score is the log likelihood of the sequence (i.e. negative), `length_penalty` > 0.0 promotes longer sequences, while `length_penalty` < 0.0 encourages shorter sequences.
   * @type {number}
   * @default 1.0
   */
  length_penalty = 1;
  /**
   * If set to an integer greater than 0, all n-grams of that size can only occur once.
   * @type {number}
   * @default 0
   */
  no_repeat_ngram_size = 0;
  /**
   * List of token IDs that are not allowed to be generated.
   * In order to get the token IDs of the words that should not appear in the generated text, use
   * `tokenizer(bad_words, { add_prefix_space: true, add_special_tokens: false }).input_ids`.
   * @type {number[][]}
   * @default null
   */
  bad_words_ids = null;
  /**
   * List of token IDs that must be generated.
   * If given a `number[][]`, this is treated as a simple list of words that must be included, the opposite of `bad_words_ids`.
   * If given `number[][][]`, this triggers a [disjunctive constraint](https://github.com/huggingface/transformers/issues/14081), which allows different forms of each word.
   * @type {number[][]|number[][][]}
   * @default null
   */
  force_words_ids = null;
  /**
   * Whether to renormalize the logits after applying all the logits processors or warpers (including the custom ones).
   * It's highly recommended to set this flag to `true` because search algorithms assume the score logits are normalized, but some logit processors or warpers break the normalization.
   * @type {boolean}
   * @default false
   */
  renormalize_logits = false;
  /**
   * Custom constraints that guide generation to include certain tokens as defined by `Constraint` objects.
   * @type {Object[]}
   * @default null
   */
  constraints = null;
  /**
   * The ID of the token to force as the first generated token after the `decoder_start_token_id`.
   * Useful for multilingual models like mBART where the first generated token needs to be the target language token.
   * @type {number}
   * @default null
   */
  forced_bos_token_id = null;
  /**
   * The ID of the token to force as the last generated token when `max_length` is reached.
   * Optionally, use a list to set multiple *end-of-sequence* tokens.
   * @type {number|number[]}
   * @default null
   */
  forced_eos_token_id = null;
  /**
   * Whether to remove possible *nan* and *inf* outputs of the model to prevent the generation method from crashing. Note that using `remove_invalid_values` can slow down generation.
   * @type {boolean}
   */
  remove_invalid_values = false;
  /**
   * This tuple adds an exponentially increasing length penalty after a certain number of tokens have been generated.
   * The tuple consists of: `(start_index, decay_factor)` where `start_index` indicates where the penalty starts and `decay_factor` represents the factor of exponential decay.
   * @type {[number, number]}
   * @default null
   */
  exponential_decay_length_penalty = null;
  /**
   * A list of tokens to suppress during generation.
   * The `SuppressTokens` logit processor sets their log probabilities to `-inf` so that they are not sampled.
   * @type {number[]}
   * @default null
   */
  suppress_tokens = null;
  /**
   * Streamer used to yield generated text incrementally.
   * @type {import('./streamers.js').TextStreamer}
   * @default null
   */
  streamer = null;
  /**
   * A list of tokens to suppress at the beginning of the generation.
   * The `SuppressBeginTokens` logit processor sets their log probabilities to `-inf` so that they are not sampled.
   * @type {number[]}
   * @default null
   */
  begin_suppress_tokens = null;
  /**
   * A list of integer pairs that maps generation indices to token indices that will be forced before sampling.
   * For example, `[[1, 123]]` means the second generated token will always be a token of index 123.
   * @type {[number, number][]}
   * @default null
   */
  forced_decoder_ids = null;
  /**
   * The guidance scale for classifier-free guidance (CFG). CFG is enabled by setting `guidance_scale > 1`.
   * Higher guidance scale encourages the model to generate samples that are more closely tied to the input
   * prompt, usually at the expense of poorer quality.
   * @type {number}
   * @default null
   */
  guidance_scale = null;
  // Parameters that define the output variables of `generate`
  /**
   * The number of independently computed returned sequences for each element in the batch.
   * @type {number}
   * @default 1
   */
  num_return_sequences = 1;
  /**
   * Whether to return attention tensors from all attention layers.
   * See `attentions` under returned tensors for more details.
   * @type {boolean}
   * @default false
   */
  output_attentions = false;
  /**
   * Whether to return the hidden states of all layers.
   * See `hidden_states` under returned tensors for more details.
   * @type {boolean}
   * @default false
   */
  output_hidden_states = false;
  /**
   * Whether to return the prediction scores.
   * See `scores` under returned tensors for more details.
   * @type {boolean}
   * @default false
   */
  output_scores = false;
  /**
   * Whether to return a `ModelOutput` instead of a plain tuple.
   * @type {boolean}
   * @default false
   */
  return_dict_in_generate = false;
  // Special tokens that can be used at generation time
  /**
   * The ID of the *padding* token.
   * @type {number}
   * @default null
   */
  pad_token_id = null;
  /**
   * The ID of the *beginning-of-sequence* token.
   * @type {number}
   * @default null
   */
  bos_token_id = null;
  /**
   * The ID of the *end-of-sequence* token.
   * Optionally, use a list to set multiple *end-of-sequence* tokens.
   * @type {number|number[]}
   * @default null
   */
  eos_token_id = null;
  // Generation parameters exclusive to encoder-decoder models
  /**
   * If set to an integer greater than 0, all n-grams of that size that occur in the `encoder_input_ids` cannot occur in the `decoder_input_ids`.
   * @type {number}
   * @default 0
   */
  encoder_no_repeat_ngram_size = 0;
  /**
   * If an encoder-decoder model starts decoding with a token other than *bos*, the ID of that token.
   * @type {number}
   * @default null
   */
  decoder_start_token_id = null;
  // Wild card
  /**
   * Additional generation kwargs forwarded to the model's `generate` function.
   * Kwargs that are not present in `generate`'s signature are used in the model forward pass.
   * @type {Object}
   * @default {}
   */
  generation_kwargs = {};
  /**
   *
   * @param {GenerationConfig|import('../configs.js').PretrainedConfig} config
   */
  constructor(config) {
    Object.assign(this, pick(config, Object.getOwnPropertyNames(this)));
  }
}
class StoppingCriteria extends Callable$1 {
  /**
   *
   * @param {number[][]} input_ids (`number[][]` of shape `(batch_size, sequence_length)`):
   * Indices of input sequence tokens in the vocabulary.
   * @param {number[][]} scores (`number[][]` of shape `(batch_size, config.vocab_size)`):
   * Prediction scores of a language modeling head. These can be scores for each vocabulary token before SoftMax
   * or scores for each vocabulary token after SoftMax.
   * @returns {boolean[]} A list of booleans indicating whether each sequence should be stopped.
   */
  _call(input_ids, scores) {
    throw Error("StoppingCriteria needs to be subclassed");
  }
}
class StoppingCriteriaList extends Callable$1 {
  /**
   * Constructs a new instance of `StoppingCriteriaList`.
   */
  constructor() {
    super();
    this.criteria = [];
  }
  /**
   * Adds a new stopping criterion to the list.
   *
   * @param {StoppingCriteria} item The stopping criterion to add.
   */
  push(item) {
    this.criteria.push(item);
  }
  /**
   * Adds multiple stopping criteria to the list.
   *
   * @param {StoppingCriteria|StoppingCriteriaList|StoppingCriteria[]} items The stopping criteria to add.
   */
  extend(items) {
    if (items instanceof StoppingCriteriaList) {
      items = items.criteria;
    } else if (items instanceof StoppingCriteria) {
      items = [items];
    }
    this.criteria.push(...items);
  }
  _call(input_ids, scores) {
    const is_done = new Array(input_ids.length).fill(false);
    for (const criterion of this.criteria) {
      const criterion_done = criterion(input_ids, scores);
      for (let i = 0; i < is_done.length; ++i) {
        is_done[i] ||= criterion_done[i];
      }
    }
    return is_done;
  }
  [Symbol.iterator]() {
    return this.criteria.values();
  }
}
class MaxLengthCriteria extends StoppingCriteria {
  /**
   *
   * @param {number} max_length The maximum length that the output sequence can have in number of tokens.
   * @param {number} [max_position_embeddings=null] The maximum model length, as defined by the model's `config.max_position_embeddings` attribute.
   */
  constructor(max_length, max_position_embeddings = null) {
    super();
    this.max_length = max_length;
    this.max_position_embeddings = max_position_embeddings;
  }
  _call(input_ids) {
    return input_ids.map((ids) => ids.length >= this.max_length);
  }
}
class EosTokenCriteria extends StoppingCriteria {
  /**
   *
   * @param {number|number[]} eos_token_id The ID of the *end-of-sequence* token.
   * Optionally, use a list to set multiple *end-of-sequence* tokens.
   */
  constructor(eos_token_id) {
    super();
    if (!Array.isArray(eos_token_id)) {
      eos_token_id = [eos_token_id];
    }
    this.eos_token_id = eos_token_id;
  }
  /**
   *
   * @param {number[][]} input_ids
   * @param {number[][]} scores
   * @returns {boolean[]}
   */
  _call(input_ids, scores) {
    return input_ids.map((ids) => {
      const last = ids.at(-1);
      return this.eos_token_id.some((eos_id) => last == eos_id);
    });
  }
}
class LogitsSampler extends Callable$1 {
  /**
   * Creates a new Sampler object with the specified generation config.
   * @param {GenerationConfig} generation_config The generation config.
   */
  constructor(generation_config) {
    super();
    this.generation_config = generation_config;
  }
  /**
   * Executes the sampler, using the specified logits.
   * @param {Tensor} logits
   * @returns {Promise<[bigint, number][]>}
   */
  async _call(logits) {
    return this.sample(logits);
  }
  /**
   * Abstract method for sampling the logits.
   * @param {Tensor} logits
   * @throws {Error} If not implemented in subclass.
   * @returns {Promise<[bigint, number][]>}
   */
  async sample(logits) {
    throw Error("sample should be implemented in subclasses.");
  }
  /**
   * Returns the specified logits as an array, with temperature applied.
   * @param {Tensor} logits
   * @param {number} index
   * @returns {Float32Array}
   */
  getLogits(logits, index) {
    let vocabSize = logits.dims.at(-1);
    let logs = (
      /** @type {Float32Array} */
      logits.data
    );
    if (index === -1) {
      logs = logs.slice(-vocabSize);
    } else {
      let startIndex = index * vocabSize;
      logs = logs.slice(startIndex, startIndex + vocabSize);
    }
    return logs;
  }
  /**
   * Selects an item randomly based on the specified probabilities.
   * @param {Float32Array} probabilities An array of probabilities to use for selection.
   * @returns {number} The index of the selected item.
   */
  randomSelect(probabilities) {
    return _weightedIndex(probabilities);
  }
  /**
   * Returns a Sampler object based on the specified options.
   * @param {GenerationConfig} generation_config An object containing options for the sampler.
   * @returns {LogitsSampler} A Sampler object.
   */
  static getSampler(generation_config) {
    if (generation_config.do_sample) {
      return new MultinomialSampler(generation_config);
    } else if (generation_config.num_beams > 1) {
      return new BeamSearchSampler(generation_config);
    } else {
      if (generation_config.num_return_sequences > 1) {
        throw Error(
          `num_return_sequences has to be 1 when doing greedy search, but is ${generation_config.num_return_sequences}.`
        );
      }
      return new GreedySampler(generation_config);
    }
  }
}
class GreedySampler extends LogitsSampler {
  /**
   * Sample the maximum probability of a given logits tensor.
   * @param {Tensor} logits
   * @returns {Promise<[bigint, number][]>} An array with a single tuple, containing the index of the maximum value and a meaningless score (since this is a greedy search).
   */
  async sample(logits) {
    const argmax = max(logits.data)[1];
    return [[BigInt(argmax), 0]];
  }
}
class MultinomialSampler extends LogitsSampler {
  /**
   * Sample from the logits.
   * @param {Tensor} logits
   * @returns {Promise<[bigint, number][]>}
   */
  async sample(logits) {
    let k = logits.dims.at(-1);
    if (this.generation_config.top_k > 0) {
      k = Math.min(this.generation_config.top_k, k);
    }
    const [v, i] = await topk(logits, k);
    const probabilities = softmax(
      /** @type {Float32Array} */
      v.data
    );
    return Array.from({ length: this.generation_config.num_beams }, () => {
      const sampledIndex = this.randomSelect(probabilities);
      return [
        i.data[sampledIndex],
        // token id
        Math.log(probabilities[sampledIndex])
        // score
      ];
    });
  }
}
class BeamSearchSampler extends LogitsSampler {
  /**
   * Sample from the logits.
   * @param {Tensor} logits
   * @returns {Promise<[bigint, number][]>}
   */
  async sample(logits) {
    let k = logits.dims.at(-1);
    if (this.generation_config.top_k > 0) {
      k = Math.min(this.generation_config.top_k, k);
    }
    const [v, i] = await topk(logits, k);
    const probabilities = softmax(
      /** @type {Float32Array} */
      v.data
    );
    return Array.from({ length: this.generation_config.num_beams }, (_, x) => {
      return [
        i.data[x],
        // token id
        Math.log(probabilities[x])
        // score
      ];
    });
  }
}
class _DynamicCache {
  /**
   * Create a DynamicCache, optionally pre-populated with entries.
   * @param {Record<string, Tensor>} [entries] Initial name→Tensor mappings.
   */
  constructor(entries) {
    if (!entries) return;
    for (const key in entries) {
      if (key in this) {
        throw new TypeError(`Key "${key}" conflicts with an existing property on DynamicCache`);
      }
      const value = entries[key];
      if (!(value instanceof Tensor)) {
        throw new TypeError(`Expected a Tensor for key "${key}", got ${typeof value}`);
      }
      this[key] = value;
    }
  }
  /**
   * Get the cached sequence length. This requires at least one attention cache entry to be present.
   * @returns {number} The past sequence length.
   */
  get_seq_length() {
    const self2 = (
      /** @type {any} */
      this
    );
    if (Object.keys(self2).length === 0) {
      return 0;
    }
    for (const name2 in self2) {
      if (name2.startsWith("past_key_values.")) {
        return self2[name2].dims.at(-2);
      }
    }
    throw new Error("Unable to determine sequence length from the cache.");
  }
  /**
   * Update the cache in-place with new entries, disposing replaced GPU tensors.
   * @param {Record<string, Tensor>} newEntries The new name → Tensor mappings.
   */
  update(newEntries) {
    for (const key in newEntries) {
      const oldValue = this[key];
      const newValue = newEntries[key];
      if (oldValue && oldValue !== newValue && oldValue.location === "gpu-buffer") {
        oldValue.dispose();
      }
      this[key] = newValue;
    }
  }
  /**
   * Dispose all contained tensors whose data resides on the GPU.
   * Returns a promise that resolves when all disposals are complete.
   * @returns {Promise<void>} Promise that resolves when all GPU tensors are disposed.
   */
  async dispose() {
    const promises = [];
    for (
      const t of
      /** @type {Tensor[]} */
      Object.values(this)
    ) {
      if (t.location === "gpu-buffer") {
        promises.push(t.dispose());
      }
    }
    await Promise.all(promises);
  }
}
const DynamicCache = (
  /** @type {new (entries?: Record<string, Tensor>) => DynamicCache} */
  /** @type {unknown} */
  _DynamicCache
);
const MODEL_TYPES = {
  EncoderOnly: 0,
  EncoderDecoder: 1,
  Seq2Seq: 2,
  Vision2Seq: 3,
  DecoderOnly: 4,
  DecoderOnlyWithoutHead: 5,
  MaskGeneration: 6,
  ImageTextToText: 7,
  Musicgen: 8,
  MultiModality: 9,
  Phi3V: 10,
  AudioTextToText: 11,
  AutoEncoder: 12,
  ImageAudioTextToText: 13,
  Supertonic: 14,
  Chatterbox: 15,
  VoxtralRealtime: 16,
  MultimodalEncoder: 17
};
const MODEL_SESSION_CONFIG = {
  [MODEL_TYPES.DecoderOnly]: {
    sessions: (config, options) => ({ model: options.model_file_name ?? "model" }),
    cache_sessions: { model: true },
    optional_configs: { generation_config: "generation_config.json" }
  },
  [MODEL_TYPES.DecoderOnlyWithoutHead]: {
    sessions: (config, options) => ({ model: options.model_file_name ?? "model" })
  },
  [MODEL_TYPES.Seq2Seq]: {
    sessions: () => ({ model: "encoder_model", decoder_model_merged: "decoder_model_merged" }),
    cache_sessions: { decoder_model_merged: true },
    optional_configs: { generation_config: "generation_config.json" }
  },
  [MODEL_TYPES.Vision2Seq]: {
    sessions: () => ({ model: "encoder_model", decoder_model_merged: "decoder_model_merged" }),
    cache_sessions: { decoder_model_merged: true },
    optional_configs: { generation_config: "generation_config.json" }
  },
  [MODEL_TYPES.Musicgen]: {
    sessions: () => ({
      model: "text_encoder",
      decoder_model_merged: "decoder_model_merged",
      encodec_decode: "encodec_decode"
    }),
    cache_sessions: { decoder_model_merged: true },
    optional_configs: { generation_config: "generation_config.json" }
  },
  [MODEL_TYPES.EncoderDecoder]: {
    sessions: () => ({ model: "encoder_model", decoder_model_merged: "decoder_model_merged" }),
    cache_sessions: { decoder_model_merged: true }
  },
  [MODEL_TYPES.MaskGeneration]: {
    sessions: () => ({ model: "vision_encoder", prompt_encoder_mask_decoder: "prompt_encoder_mask_decoder" })
  },
  [MODEL_TYPES.ImageTextToText]: {
    text_only_sessions: { embed_tokens: "embed_tokens", decoder_model_merged: "decoder_model_merged" },
    sessions: (config, options, textOnly) => {
      const s = { ...MODEL_SESSION_CONFIG[MODEL_TYPES.ImageTextToText].text_only_sessions };
      if (!textOnly) s["vision_encoder"] = "vision_encoder";
      if (config.is_encoder_decoder) s["model"] = "encoder_model";
      return s;
    },
    cache_sessions: { decoder_model_merged: true },
    optional_configs: { generation_config: "generation_config.json" }
  },
  [MODEL_TYPES.AudioTextToText]: {
    text_only_sessions: { embed_tokens: "embed_tokens", decoder_model_merged: "decoder_model_merged" },
    sessions: (config, options, textOnly) => {
      const s = { ...MODEL_SESSION_CONFIG[MODEL_TYPES.AudioTextToText].text_only_sessions };
      if (!textOnly) s["audio_encoder"] = "audio_encoder";
      return s;
    },
    cache_sessions: { decoder_model_merged: true },
    optional_configs: { generation_config: "generation_config.json" }
  },
  [MODEL_TYPES.ImageAudioTextToText]: {
    text_only_sessions: { embed_tokens: "embed_tokens", decoder_model_merged: "decoder_model_merged" },
    sessions: (config, options, textOnly) => {
      const s = { ...MODEL_SESSION_CONFIG[MODEL_TYPES.ImageAudioTextToText].text_only_sessions };
      if (!textOnly) {
        s["audio_encoder"] = "audio_encoder";
        s["vision_encoder"] = "vision_encoder";
      }
      return s;
    },
    cache_sessions: { decoder_model_merged: true },
    optional_configs: { generation_config: "generation_config.json" }
  },
  [MODEL_TYPES.Phi3V]: {
    sessions: () => ({
      prepare_inputs_embeds: "prepare_inputs_embeds",
      model: "model",
      vision_encoder: "vision_encoder"
    }),
    cache_sessions: { model: true },
    optional_configs: { generation_config: "generation_config.json" }
  },
  [MODEL_TYPES.MultiModality]: {
    sessions: () => ({
      prepare_inputs_embeds: "prepare_inputs_embeds",
      model: "language_model",
      lm_head: "lm_head",
      gen_head: "gen_head",
      gen_img_embeds: "gen_img_embeds",
      image_decode: "image_decode"
    }),
    cache_sessions: { model: true },
    optional_configs: { generation_config: "generation_config.json" }
  },
  [MODEL_TYPES.AutoEncoder]: {
    sessions: () => ({ encoder_model: "encoder_model", decoder_model: "decoder_model" })
  },
  [MODEL_TYPES.Supertonic]: {
    sessions: () => ({
      text_encoder: "text_encoder",
      latent_denoiser: "latent_denoiser",
      voice_decoder: "voice_decoder"
    })
  },
  [MODEL_TYPES.Chatterbox]: {
    sessions: () => ({
      embed_tokens: "embed_tokens",
      speech_encoder: "speech_encoder",
      model: "language_model",
      conditional_decoder: "conditional_decoder"
    }),
    cache_sessions: { model: true },
    optional_configs: { generation_config: "generation_config.json" }
  },
  [MODEL_TYPES.VoxtralRealtime]: {
    text_only_sessions: { embed_tokens: "embed_tokens", decoder_model_merged: "decoder_model_merged" },
    sessions: (config, options, textOnly) => {
      const s = { ...MODEL_SESSION_CONFIG[MODEL_TYPES.VoxtralRealtime].text_only_sessions };
      if (!textOnly) s["audio_encoder"] = "audio_encoder";
      return s;
    },
    cache_sessions: { decoder_model_merged: true, audio_encoder: true },
    optional_configs: { generation_config: "generation_config.json" }
  },
  [MODEL_TYPES.MultimodalEncoder]: {
    // The vision and audio encoders are only loaded when the config has their `vision_config` / `audio_config`
    sessions: (config, options) => ({
      model: options.model_file_name ?? "model",
      ...config.vision_config && { vision_encoder: "vision_encoder" },
      ...config.audio_config && { audio_encoder: "audio_encoder" }
    })
  },
  default: {
    sessions: (config, options) => ({ model: options.model_file_name ?? "model" })
  }
};
function getSessionsConfig(modelType, config, options = {}) {
  const typeConfig = MODEL_SESSION_CONFIG[modelType] ?? MODEL_SESSION_CONFIG.default;
  return {
    sessions: typeConfig.sessions(config, options, options.textOnly ?? false),
    cache_sessions: typeConfig.cache_sessions,
    optional_configs: typeConfig.optional_configs
  };
}
function resolve_model_type(config, { warn = true } = {}) {
  const architectures = (
    /** @type {string[]} */
    config.architectures || []
  );
  for (const arch of architectures) {
    const mappedType = MODEL_TYPE_MAPPING.get(arch);
    if (mappedType !== void 0) {
      return mappedType;
    }
  }
  if (config.model_type) {
    const mappedType = MODEL_TYPE_MAPPING.get(config.model_type);
    if (mappedType !== void 0) {
      return mappedType;
    }
    for (const mapping of Object.values(MODEL_MAPPING_NAMES)) {
      if (mapping.has(config.model_type)) {
        const resolved = MODEL_TYPE_MAPPING.get(mapping.get(config.model_type));
        if (resolved !== void 0) {
          return resolved;
        }
      }
    }
  }
  if (warn) {
    const archList = architectures.length > 0 ? architectures.join(", ") : "(none)";
    logger.warn(
      `[resolve_model_type] Architecture(s) not found in MODEL_TYPE_MAPPING: [${archList}] for model type '${config.model_type}'. Falling back to EncoderOnly (single model.onnx file). If you encounter issues, please report at: ${GITHUB_ISSUE_URL}`
    );
  }
  return MODEL_TYPES.EncoderOnly;
}
function get_config(modelId, { config = null, cache_dir = null, local_files_only = false, revision = "main" } = {}) {
  if (config !== null) {
    return AutoConfig.from_pretrained(modelId, { config, cache_dir, local_files_only, revision });
  }
  const key = makePretrainedOptionsKey(modelId, { cache_dir, local_files_only, revision });
  return memoizePromise(
    key,
    () => AutoConfig.from_pretrained(modelId, { config, cache_dir, local_files_only, revision })
  );
}
async function get_model_files(modelId, { config = null, dtype: overrideDtype = null, device: overrideDevice = null, model_file_name = null } = {}) {
  config = await get_config(modelId, { config });
  const files = [
    // Add config.json (always loaded)
    "config.json"
  ];
  const custom_config = config["transformers.js_config"] ?? {};
  const use_external_data_format = custom_config.use_external_data_format;
  const subfolder = "onnx";
  const rawDevice = overrideDevice ?? custom_config.device;
  let dtype = overrideDtype ?? custom_config.dtype;
  const modelType = resolve_model_type(config);
  const add_model_file = (fileName, baseName = null) => {
    baseName = baseName ?? fileName;
    const selectedDevice = selectDevice(rawDevice, fileName);
    const selectedDtype = selectDtype(dtype, fileName, selectedDevice);
    const suffix = DEFAULT_DTYPE_SUFFIX_MAPPING[selectedDtype] ?? "";
    const fullName = `${baseName}${suffix}.onnx`;
    const fullPath = `${subfolder}/${fullName}`;
    files.push(fullPath);
    const num_chunks = resolveExternalDataFormat(use_external_data_format, fullName, fileName);
    for (const dataFileName of getExternalDataChunkNames(fullName, num_chunks)) {
      const dataFilePath = `${subfolder}/${dataFileName}`;
      files.push(dataFilePath);
    }
  };
  const { sessions, optional_configs } = getSessionsConfig(modelType, config, { model_file_name });
  for (const [sessionKey, baseName] of Object.entries(sessions)) {
    add_model_file(sessionKey, baseName);
  }
  if (optional_configs) {
    for (const configFile of Object.values(optional_configs)) {
      files.push(configFile);
    }
  }
  return files;
}
let MODEL_MAPPING_NAMES = null;
function registerTaskMappings(mappings) {
  MODEL_MAPPING_NAMES = mappings;
}
function toI64Tensor(items) {
  if (items instanceof Tensor) {
    return items;
  }
  if (items.length === 0) {
    throw Error("items must be non-empty");
  }
  if (Array.isArray(items[0])) {
    if (items.some((x) => x.length !== items[0].length)) {
      throw Error(
        "Unable to create tensor, you should probably activate truncation and/or padding with 'padding=True' and/or 'truncation=True' to have batched tensors with the same length."
      );
    }
    return new Tensor("int64", BigInt64Array.from(items.flat().map((x) => BigInt(x))), [
      items.length,
      items[0].length
    ]);
  } else {
    return new Tensor("int64", BigInt64Array.from(items.map((x) => BigInt(x))), [1, items.length]);
  }
}
function boolTensor(value) {
  return new Tensor("bool", [value], [1]);
}
const MODEL_RUNTIME_CONFIG = {
  [MODEL_TYPES.DecoderOnly]: {
    can_generate: true,
    forward: decoder_forward,
    prepare_inputs: decoder_prepare_inputs_for_generation
  },
  [MODEL_TYPES.DecoderOnlyWithoutHead]: {
    can_generate: false,
    forward: decoder_forward,
    prepare_inputs: decoder_prepare_inputs_for_generation
  },
  [MODEL_TYPES.Seq2Seq]: {
    can_generate: true,
    forward: seq2seq_forward,
    prepare_inputs: encoder_decoder_prepare_inputs_for_generation
  },
  [MODEL_TYPES.Vision2Seq]: {
    can_generate: true,
    forward: seq2seq_forward,
    prepare_inputs: encoder_decoder_prepare_inputs_for_generation
  },
  [MODEL_TYPES.Musicgen]: {
    can_generate: true,
    forward: seq2seq_forward
  },
  [MODEL_TYPES.EncoderDecoder]: {
    can_generate: false,
    forward: seq2seq_forward
  },
  [MODEL_TYPES.ImageTextToText]: {
    can_generate: true,
    forward: image_text_to_text_forward,
    prepare_inputs: multimodal_text_to_text_prepare_inputs_for_generation
  },
  [MODEL_TYPES.AudioTextToText]: {
    can_generate: true,
    forward: audio_text_to_text_forward,
    prepare_inputs: multimodal_text_to_text_prepare_inputs_for_generation
  },
  [MODEL_TYPES.ImageAudioTextToText]: {
    can_generate: true,
    prepare_inputs: multimodal_text_to_text_prepare_inputs_for_generation
  },
  [MODEL_TYPES.Phi3V]: {
    can_generate: true,
    prepare_inputs: multimodal_text_to_text_prepare_inputs_for_generation
  },
  [MODEL_TYPES.MultiModality]: {
    can_generate: true
  },
  [MODEL_TYPES.AutoEncoder]: {
    can_generate: false,
    forward: auto_encoder_forward
  },
  [MODEL_TYPES.Chatterbox]: {
    can_generate: true,
    forward: encoder_forward
  },
  [MODEL_TYPES.VoxtralRealtime]: {
    can_generate: true,
    prepare_inputs: decoder_prepare_inputs_for_generation
  },
  default: {
    can_generate: false,
    forward: encoder_forward
  }
};
function resolveTypeConfig(modelName, config) {
  let modelType = MODEL_TYPE_MAPPING.get(modelName);
  let textOnly = false;
  const nativeArch = config?.architectures?.[0];
  if (nativeArch && nativeArch !== modelName && modelName?.endsWith("ForCausalLM") && nativeArch.endsWith("ForConditionalGeneration")) {
    const nativeType = MODEL_TYPE_MAPPING.get(nativeArch);
    if (nativeType !== void 0) {
      modelType = nativeType;
      textOnly = true;
    }
  }
  const runtimeConfig = MODEL_RUNTIME_CONFIG[modelType] ?? MODEL_RUNTIME_CONFIG.default;
  const sessionConfig = MODEL_SESSION_CONFIG[modelType] ?? MODEL_SESSION_CONFIG.default;
  return { typeConfig: { ...runtimeConfig, ...sessionConfig }, textOnly, modelType };
}
const MODEL_TYPE_MAPPING = /* @__PURE__ */ new Map();
const MODEL_NAME_TO_CLASS_MAPPING = /* @__PURE__ */ new Map();
const MODEL_CLASS_TO_NAME_MAPPING = /* @__PURE__ */ new Map();
class PreTrainedModel extends Callable$1 {
  main_input_name = "input_ids";
  forward_params = ["input_ids", "attention_mask"];
  _return_dict_in_generate_keys = null;
  /**
   * Create a model from configuration and inference sessions.
   * @param {import('../configs.js').PretrainedConfig} config The model configuration.
   * @param {Record<string, any>} sessions The inference sessions for the model.
   * @param {Record<string, Object>} configs Additional configuration files (e.g., generation_config.json).
   */
  constructor(config, sessions, configs) {
    super();
    this.config = config;
    this.sessions = sessions;
    this.configs = configs;
    const modelName = MODEL_CLASS_TO_NAME_MAPPING.get(this.constructor);
    const { typeConfig } = resolveTypeConfig(modelName, config);
    this.can_generate = typeConfig.can_generate;
    this._forward = typeConfig.forward;
    this._prepare_inputs_for_generation = typeConfig.prepare_inputs;
    if (this.can_generate) {
      this.forward_params.push("past_key_values");
    }
    this.custom_config = this.config["transformers.js_config"] ?? {};
  }
  /**
   * Disposes of all the ONNX sessions that were created during inference.
   * @returns {Promise<void[]>} Resolves after each session has been released.
   * @todo Use https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/FinalizationRegistry
   */
  async dispose() {
    const promises = [];
    for (const session of Object.values(this.sessions)) {
      promises.push(session.release?.());
    }
    return await Promise.all(promises);
  }
  /**
   * Instantiate one of the model classes of the library from a pretrained model.
   *
   * The model class to instantiate is selected based on the `model_type` property of the config object
   * (either passed as an argument or loaded from `pretrained_model_name_or_path` if possible)
   *
   * @param {string} pretrained_model_name_or_path The name or path of the pretrained model. Can be either:
   * - A string, the *model ID* of a pretrained model hosted inside a model repo on huggingface.co.
   *   Valid model IDs can be located at the root level, like `bert-base-uncased`, or namespaced under a
   *   user or organization name, like `dbmdz/bert-base-german-cased`.
   * - A path to a *directory* containing model weights, e.g., `./my_model_directory/`.
   * @param {import('../utils/hub.js').PretrainedModelOptions} options Additional options for loading the model.
   *
   * @returns {Promise<PreTrainedModel>} A model instance with ready inference sessions.
   */
  static async from_pretrained(pretrained_model_name_or_path, {
    progress_callback = null,
    config = null,
    cache_dir = null,
    local_files_only = false,
    revision = "main",
    model_file_name = null,
    subfolder = "onnx",
    device = null,
    dtype = null,
    use_external_data_format = null,
    session_options = {}
  } = {}) {
    const options = {
      progress_callback,
      config,
      cache_dir,
      local_files_only,
      revision,
      model_file_name,
      subfolder,
      device,
      dtype,
      use_external_data_format,
      session_options
    };
    const modelName = MODEL_CLASS_TO_NAME_MAPPING.get(this);
    config = options.config = await AutoConfig.from_pretrained(pretrained_model_name_or_path, options);
    const { typeConfig, textOnly, modelType } = resolveTypeConfig(modelName, config);
    if (modelType === void 0) {
      const type = modelName ?? config?.model_type;
      if (type !== "custom") {
        logger.warn(
          `Model type for '${type}' not found, assuming encoder-only architecture. Please report this at ${GITHUB_ISSUE_URL}.`
        );
      }
    }
    if (progress_callback && !(progress_callback instanceof DefaultProgressCallback)) {
      const files_loading = {};
      try {
        const expected_files = await get_model_files(pretrained_model_name_or_path, {
          config,
          dtype,
          device,
          model_file_name
        });
        const metadata = await Promise.all(
          expected_files.map((file) => get_file_metadata(pretrained_model_name_or_path, file, options))
        );
        metadata.forEach((m, i) => {
          if (m.exists) {
            const isAlreadyLoaded = expected_files[i] === "config.json";
            files_loading[expected_files[i]] = {
              loaded: isAlreadyLoaded ? m.size ?? 0 : 0,
              total: m.size ?? 0
            };
          }
        });
      } catch (e) {
        logger.warn(`Unable to fetch model file metadata for total progress tracking: ${e}`);
      }
      if (Object.keys(files_loading).length > 0) {
        options.progress_callback = new DefaultProgressCallback(progress_callback, files_loading);
      }
    }
    const sessions = typeConfig.sessions(config, options, textOnly);
    const promises = [
      constructSessions(pretrained_model_name_or_path, sessions, options, typeConfig.cache_sessions)
    ];
    if (typeConfig.optional_configs) {
      promises.push(get_optional_configs(pretrained_model_name_or_path, typeConfig.optional_configs, options));
    }
    const info = await Promise.all(promises);
    return new this(config, ...info);
  }
  /**
   * Runs the model with the provided inputs.
   * @param {Object} model_inputs Object containing input tensors.
   * @returns {Promise<Object>} Object containing output tensors.
   */
  async _call(model_inputs) {
    return await this.forward(model_inputs);
  }
  /**
   * Run the model's forward pass.
   * @param {Object} model_inputs The input data to the model in the format specified in the ONNX model.
   * @returns {Promise<Object>} The output data from the model in the format specified in the ONNX model.
   */
  async forward(model_inputs) {
    return await this._forward(this, model_inputs);
  }
  /**
   * Get the model's generation config, if it exists.
   * @returns {GenerationConfig|null} The model's generation config if it exists, otherwise `null`.
   */
  get generation_config() {
    return this.configs?.generation_config ?? null;
  }
  /**
   * @param {GenerationConfig} generation_config
   * @param {number} input_ids_seq_length The starting sequence length for the input ids.
   * @returns {LogitsProcessorList}
   * @private
   */
  _get_logits_processor(generation_config, input_ids_seq_length, logits_processor = null) {
    const processors = new LogitsProcessorList();
    if (generation_config.repetition_penalty !== null && generation_config.repetition_penalty !== 1) {
      processors.push(new RepetitionPenaltyLogitsProcessor(generation_config.repetition_penalty));
    }
    if (generation_config.no_repeat_ngram_size !== null && generation_config.no_repeat_ngram_size > 0) {
      processors.push(new NoRepeatNGramLogitsProcessor(generation_config.no_repeat_ngram_size));
    }
    if (generation_config.bad_words_ids !== null) {
      processors.push(
        new NoBadWordsLogitsProcessor(generation_config.bad_words_ids, generation_config.eos_token_id)
      );
    }
    if (generation_config.min_length !== null && generation_config.eos_token_id !== null && generation_config.min_length > 0) {
      processors.push(new MinLengthLogitsProcessor(generation_config.min_length, generation_config.eos_token_id));
    }
    if (generation_config.min_new_tokens !== null && generation_config.eos_token_id !== null && generation_config.min_new_tokens > 0) {
      processors.push(
        new MinNewTokensLengthLogitsProcessor(
          input_ids_seq_length,
          generation_config.min_new_tokens,
          generation_config.eos_token_id
        )
      );
    }
    if (generation_config.forced_bos_token_id !== null) {
      processors.push(new ForcedBOSTokenLogitsProcessor(generation_config.forced_bos_token_id));
    }
    if (generation_config.forced_eos_token_id !== null) {
      processors.push(
        new ForcedEOSTokenLogitsProcessor(generation_config.max_length, generation_config.forced_eos_token_id)
      );
    }
    if (generation_config.suppress_tokens !== null) {
      processors.push(new SuppressTokensLogitsProcessor(generation_config.suppress_tokens));
    }
    if (generation_config.begin_suppress_tokens !== null) {
      const begin_index = input_ids_seq_length > 1 || generation_config.forced_bos_token_id === null ? input_ids_seq_length : input_ids_seq_length + 1;
      processors.push(
        new SuppressTokensAtBeginLogitsProcessor(generation_config.begin_suppress_tokens, begin_index)
      );
    }
    if (generation_config.guidance_scale !== null && generation_config.guidance_scale > 1) {
      processors.push(new ClassifierFreeGuidanceLogitsProcessor(generation_config.guidance_scale));
    }
    if (generation_config.temperature === 0 && generation_config.do_sample) {
      logger.warn(
        "`do_sample` changed to false because `temperature: 0` implies greedy sampling (always selecting the most likely token), which is incompatible with `do_sample: true`."
      );
      generation_config.do_sample = false;
    }
    if (generation_config.do_sample) {
      if (generation_config.temperature !== null && generation_config.temperature !== 1) {
        processors.push(new TemperatureLogitsWarper(generation_config.temperature));
      }
    }
    if (logits_processor !== null) {
      processors.extend(logits_processor);
    }
    return processors;
  }
  /**
   * This function merges multiple generation configs together to form a final generation config to be used by the model for text generation.
   * It first creates an empty `GenerationConfig` object, then it applies the model's own `generation_config` property to it. Finally, if a `generation_config` object was passed in the arguments, it overwrites the corresponding properties in the final config with those of the passed config object.
   * @param {GenerationConfig|null} generation_config A `GenerationConfig` object containing generation parameters.
   * @param {Object} kwargs Additional generation parameters to be used in place of those in the `generation_config` object.
   * @returns {GenerationConfig} The final generation config object to be used by the model for text generation.
   */
  _prepare_generation_config(generation_config, kwargs, cls = GenerationConfig) {
    const config = { ...this.config };
    for (const key of ["decoder", "generator", "text_config"]) {
      if (key in config) {
        Object.assign(config, config[key]);
      }
    }
    const gen_config = new cls(config);
    Object.assign(gen_config, this.generation_config ?? {});
    if (generation_config) {
      Object.assign(gen_config, generation_config);
    }
    if (kwargs) {
      Object.assign(gen_config, pick(kwargs, Object.getOwnPropertyNames(gen_config)));
    }
    return gen_config;
  }
  /**
   *
   * @param {GenerationConfig} generation_config
   * @param {import('../generation/stopping_criteria.js').StoppingCriteria|import('../generation/stopping_criteria.js').StoppingCriteria[]|StoppingCriteriaList} [stopping_criteria=null]
   */
  _get_stopping_criteria(generation_config, stopping_criteria = null) {
    const criteria = new StoppingCriteriaList();
    if (generation_config.max_length !== null) {
      criteria.push(
        new MaxLengthCriteria(generation_config.max_length, this.config.max_position_embeddings ?? null)
      );
    }
    if (generation_config.eos_token_id !== null) {
      criteria.push(new EosTokenCriteria(generation_config.eos_token_id));
    }
    if (stopping_criteria) {
      criteria.extend(stopping_criteria);
    }
    return criteria;
  }
  /**
   * Confirms that the model class is compatible with generation.
   * If not, raises an exception that points to the right class to use.
   */
  _validate_model_class() {
    if (!this.can_generate) {
      const generate_compatible_mappings = [
        MODEL_MAPPING_NAMES.MODEL_FOR_CAUSAL_LM_MAPPING_NAMES,
        // MODEL_MAPPING_NAMES.MODEL_FOR_CAUSAL_IMAGE_MODELING_MAPPING, // TODO
        MODEL_MAPPING_NAMES.MODEL_FOR_VISION_2_SEQ_MAPPING_NAMES,
        MODEL_MAPPING_NAMES.MODEL_FOR_SEQ_TO_SEQ_CAUSAL_LM_MAPPING_NAMES,
        MODEL_MAPPING_NAMES.MODEL_FOR_SPEECH_SEQ_2_SEQ_MAPPING_NAMES
      ].filter(Boolean);
      const modelName = MODEL_CLASS_TO_NAME_MAPPING.get(this.constructor);
      const generate_compatible_classes = /* @__PURE__ */ new Set();
      const modelType = this.config.model_type;
      for (const model_mapping of generate_compatible_mappings) {
        const supported_models = model_mapping?.get(modelType);
        if (supported_models) {
          generate_compatible_classes.add(supported_models);
        }
      }
      let errorMessage = `The current model class (${modelName}) is not compatible with \`.generate()\`, as it doesn't have a language model head.`;
      if (generate_compatible_classes.size > 0) {
        errorMessage += ` Please use the following class instead: ${[...generate_compatible_classes].join(", ")}`;
      }
      throw Error(errorMessage);
    }
  }
  prepare_inputs_for_generation(...args) {
    if (!this._prepare_inputs_for_generation) {
      throw new Error("prepare_inputs_for_generation is not implemented for this model.");
    }
    return this._prepare_inputs_for_generation(this, ...args);
  }
  /**
   *
   * @param {Object} inputs
   * @param {bigint[][]} inputs.generated_input_ids
   * @param {Object} inputs.outputs
   * @param {Object} inputs.model_inputs
   * @param {boolean} inputs.is_encoder_decoder
   * @returns {Object} The updated model inputs for the next generation iteration.
   */
  _update_model_kwargs_for_generation({ generated_input_ids, outputs, model_inputs, is_encoder_decoder }) {
    model_inputs["past_key_values"] = getPastKeyValues(outputs, model_inputs.past_key_values);
    model_inputs["input_ids"] = new Tensor("int64", generated_input_ids.flat(), [generated_input_ids.length, 1]);
    if (!is_encoder_decoder) {
      model_inputs.attention_mask = cat(
        [model_inputs.attention_mask, ones([model_inputs.attention_mask.dims[0], 1])],
        1
      );
    } else if ("decoder_attention_mask" in model_inputs) {
      model_inputs.decoder_attention_mask = cat(
        [model_inputs.decoder_attention_mask, ones([model_inputs.decoder_attention_mask.dims[0], 1])],
        1
      );
    }
    model_inputs["position_ids"] = null;
    return model_inputs;
  }
  /**
   * This function extracts the model-specific `inputs` for generation.
   * @param {Object} params
   * @param {Tensor} [params.inputs=null]
   * @param {number} [params.bos_token_id=null]
   * @param {Record<string, Tensor|number[]>} [params.model_kwargs]
   * @returns {{inputs_tensor: Tensor, model_inputs: Record<string, Tensor> & {past_key_values?: DynamicCache}, model_input_name: string}} The model-specific inputs for generation.
   */
  _prepare_model_inputs({ inputs, bos_token_id, model_kwargs }) {
    const model_inputs = pick(model_kwargs, this.forward_params);
    const input_name = this.main_input_name;
    if (input_name in model_inputs) {
      if (inputs) {
        throw new Error(
          "`inputs`: {inputs}` were passed alongside {input_name} which is not allowed. Make sure to either pass {inputs} or {input_name}=..."
        );
      }
    } else {
      model_inputs[input_name] = inputs;
    }
    const inputs_tensor = model_inputs[input_name];
    return { inputs_tensor, model_inputs, model_input_name: input_name };
  }
  async _prepare_encoder_decoder_kwargs_for_generation({
    inputs_tensor,
    model_inputs,
    model_input_name,
    generation_config
  }) {
    if (this.sessions["model"].inputNames.includes("inputs_embeds") && !model_inputs.inputs_embeds && "_prepare_inputs_embeds" in this) {
      const { input_ids, pixel_values, attention_mask, ...kwargs } = model_inputs;
      const prepared_inputs = await this._prepare_inputs_embeds(model_inputs);
      model_inputs = {
        ...kwargs,
        ...pick(prepared_inputs, ["inputs_embeds", "attention_mask"])
      };
    }
    let { last_hidden_state } = await encoder_forward(this, model_inputs);
    if (generation_config.guidance_scale !== null && generation_config.guidance_scale > 1) {
      last_hidden_state = cat([last_hidden_state, full_like(last_hidden_state, 0)], 0);
      if ("attention_mask" in model_inputs) {
        model_inputs["attention_mask"] = cat(
          [model_inputs["attention_mask"], zeros_like(model_inputs["attention_mask"])],
          0
        );
      }
    } else if (model_inputs.decoder_input_ids) {
      const decoder_input_ids_batch_size = toI64Tensor(model_inputs.decoder_input_ids).dims[0];
      if (decoder_input_ids_batch_size !== last_hidden_state.dims[0]) {
        if (last_hidden_state.dims[0] !== 1) {
          throw new Error(
            `The encoder outputs have a different batch size (${last_hidden_state.dims[0]}) than the decoder inputs (${decoder_input_ids_batch_size}).`
          );
        }
        last_hidden_state = cat(
          Array.from({ length: decoder_input_ids_batch_size }, () => last_hidden_state),
          0
        );
      }
    }
    model_inputs["encoder_outputs"] = last_hidden_state;
    return model_inputs;
  }
  /**
   * Prepares `decoder_input_ids` for generation with encoder-decoder models
   * @param {*} param0
   */
  _prepare_decoder_input_ids_for_generation({
    batch_size,
    model_input_name,
    model_kwargs,
    decoder_start_token_id,
    bos_token_id,
    generation_config
  }) {
    let { decoder_input_ids, ...model_inputs } = model_kwargs;
    if (!(decoder_input_ids instanceof Tensor)) {
      if (!decoder_input_ids) {
        decoder_start_token_id ??= bos_token_id;
        if (this.config.model_type === "musicgen") {
          decoder_input_ids = Array.from(
            {
              // @ts-expect-error TS2339
              length: batch_size * this.config.decoder.num_codebooks
            },
            () => [decoder_start_token_id]
          );
        } else if (Array.isArray(decoder_start_token_id)) {
          if (decoder_start_token_id.length !== batch_size) {
            throw new Error(
              `\`decoder_start_token_id\` expected to have length ${batch_size} but got ${decoder_start_token_id.length}`
            );
          }
          decoder_input_ids = decoder_start_token_id;
        } else {
          decoder_input_ids = Array.from(
            {
              length: batch_size
            },
            () => [decoder_start_token_id]
          );
        }
      } else if (!Array.isArray(decoder_input_ids[0])) {
        decoder_input_ids = Array.from(
          {
            length: batch_size
          },
          () => decoder_input_ids
        );
      }
      decoder_input_ids = toI64Tensor(decoder_input_ids);
    }
    model_inputs["decoder_attention_mask"] = ones_like(decoder_input_ids);
    return { input_ids: decoder_input_ids, model_inputs };
  }
  /**
   * Generate token sequences with a language-modeling head.
   * @param {import('../generation/parameters.js').GenerationFunctionParameters} options
   * @returns {Promise<ModelOutput|Tensor>} The output of the model, which can contain the generated token ids, attentions, and scores.
   */
  async generate({
    inputs = null,
    generation_config = null,
    logits_processor = null,
    stopping_criteria = null,
    streamer = null,
    // inputs_attention_mask = null,
    ...kwargs
  }) {
    this._validate_model_class();
    generation_config = this._prepare_generation_config(generation_config, kwargs);
    let { inputs_tensor, model_inputs, model_input_name } = this._prepare_model_inputs({
      inputs,
      model_kwargs: (
        /** @type {Record<string, Tensor|number[]>} */
        kwargs
      )
    });
    const is_encoder_decoder = this.config.is_encoder_decoder;
    if (!is_encoder_decoder) ;
    else if (!("encoder_outputs" in model_inputs)) {
      model_inputs = await this._prepare_encoder_decoder_kwargs_for_generation({
        inputs_tensor,
        model_inputs,
        model_input_name,
        generation_config
      });
    }
    let input_ids;
    if (is_encoder_decoder) {
      ({ input_ids, model_inputs } = this._prepare_decoder_input_ids_for_generation({
        batch_size: model_inputs[model_input_name].dims.at(0),
        model_input_name,
        model_kwargs: model_inputs,
        decoder_start_token_id: generation_config.decoder_start_token_id,
        bos_token_id: generation_config.bos_token_id,
        generation_config
      }));
    } else {
      input_ids = model_inputs[model_input_name];
    }
    let input_ids_length = input_ids.dims.at(-1);
    if (generation_config.max_new_tokens !== null) {
      generation_config.max_length = input_ids_length + generation_config.max_new_tokens;
    }
    const prepared_logits_processor = this._get_logits_processor(
      generation_config,
      input_ids_length,
      logits_processor
    );
    const prepared_stopping_criteria = this._get_stopping_criteria(generation_config, stopping_criteria);
    const numInputs = model_inputs[model_input_name].dims.at(0);
    const sampler = LogitsSampler.getSampler(generation_config);
    const scores = new Array(numInputs).fill(0);
    const all_input_ids = input_ids.tolist();
    if (streamer) {
      streamer.put(all_input_ids);
    }
    let outputs;
    let attentions = {};
    let return_dict_items = {};
    while (true) {
      model_inputs = this.prepare_inputs_for_generation(all_input_ids, model_inputs, generation_config);
      outputs = await this.forward(model_inputs);
      if (generation_config.return_dict_in_generate) {
        if (generation_config.output_attentions) {
          const token_attentions = getAttentions(outputs);
          for (const key in token_attentions) {
            if (!(key in attentions)) {
              attentions[key] = [];
            }
            attentions[key].push(token_attentions[key]);
          }
        } else if (this._return_dict_in_generate_keys) {
          Object.assign(return_dict_items, pick(outputs, this._return_dict_in_generate_keys));
        }
      }
      const logits = outputs.logits.slice(null, -1, null).to("float32");
      const next_tokens_scores = prepared_logits_processor(all_input_ids, logits);
      const generated_input_ids = [];
      for (let batch_idx = 0; batch_idx < next_tokens_scores.dims.at(0); ++batch_idx) {
        const logs = next_tokens_scores[batch_idx];
        const sampledTokens = await sampler(logs);
        for (const [newTokenId, logProb] of sampledTokens) {
          const bigint = BigInt(newTokenId);
          scores[batch_idx] += logProb;
          all_input_ids[batch_idx].push(bigint);
          generated_input_ids.push([bigint]);
          break;
        }
      }
      if (streamer) {
        streamer.put(generated_input_ids);
      }
      const stop = prepared_stopping_criteria(all_input_ids);
      if (stop.every((x) => x)) {
        break;
      }
      model_inputs = this._update_model_kwargs_for_generation({
        generated_input_ids,
        outputs,
        model_inputs,
        is_encoder_decoder
      });
    }
    if (streamer) {
      streamer.end();
    }
    const sequences = new Tensor("int64", all_input_ids.flat(), [all_input_ids.length, all_input_ids[0].length]);
    const past_key_values = getPastKeyValues(outputs, model_inputs.past_key_values);
    const cachedTensors = new Set(Object.values(past_key_values));
    for (const tensor of Object.values(outputs)) {
      if (tensor.location === "gpu-buffer" && !cachedTensors.has(tensor)) {
        tensor.dispose();
      }
    }
    const keepCacheAlive = "past_key_values" in kwargs || generation_config.return_dict_in_generate;
    if (!keepCacheAlive) {
      await past_key_values.dispose();
    }
    if (generation_config.return_dict_in_generate) {
      return {
        sequences,
        past_key_values,
        ...attentions,
        ...return_dict_items
        // TODO:
        // scores,
        // logits,
      };
    }
    return sequences;
  }
  /**
   * Helper function to select valid inputs and run through the appropriate encoder (vision, text, audio) based on the input type.
   * @param {string} sessionName
   * @param {Record<string, Tensor>} inputs
   * @param {string} outputName
   * @private
   */
  async _encode_input(sessionName, inputs, outputName) {
    if (!Object.hasOwn(this.sessions, sessionName)) {
      throw new Error(`Model does not have a ${sessionName} session.`);
    }
    const session = this.sessions[sessionName];
    const output = await sessionRun(session, pick(inputs, session.inputNames));
    return output[outputName];
  }
  /**
   * Encode image inputs into features for multimodal generation.
   * @param {any} inputs Vision encoder inputs.
   * @returns {Promise<any>} Image features.
   * @internal
   */
  async encode_image(inputs) {
    return this._encode_input("vision_encoder", inputs, "image_features");
  }
  /**
   * Encode token ids into embeddings for multimodal generation.
   * @param {any} inputs Text encoder inputs.
   * @returns {Promise<any>} Text embeddings.
   * @internal
   */
  async encode_text(inputs) {
    return this._encode_input("embed_tokens", inputs, "inputs_embeds");
  }
  /**
   * Encode audio inputs into features for multimodal generation.
   * @param {any} inputs Audio encoder inputs.
   * @returns {Promise<any>} Audio features.
   * @internal
   */
  async encode_audio(inputs) {
    return this._encode_input("audio_encoder", inputs, "audio_features");
  }
}
async function seq2seq_forward(self2, model_inputs) {
  let { encoder_outputs, input_ids, decoder_input_ids, decoder_attention_mask, ...other_decoder_inputs } = model_inputs;
  if (!encoder_outputs) {
    const encoder_inputs = pick(model_inputs, self2.sessions["model"].inputNames);
    encoder_outputs = (await encoder_forward(self2, encoder_inputs)).last_hidden_state;
  }
  other_decoder_inputs.input_ids = decoder_input_ids;
  other_decoder_inputs.encoder_hidden_states = encoder_outputs;
  if (self2.sessions["decoder_model_merged"].inputNames.includes("encoder_attention_mask")) {
    other_decoder_inputs.encoder_attention_mask = model_inputs.attention_mask;
  }
  if (decoder_attention_mask && !other_decoder_inputs.attention_mask) {
    other_decoder_inputs.attention_mask = decoder_attention_mask;
  }
  return await decoder_forward(self2, other_decoder_inputs, true);
}
async function encoder_forward(self2, model_inputs) {
  const session = self2.sessions["model"];
  const encoderFeeds = pick(model_inputs, session.inputNames);
  if (session.inputNames.includes("inputs_embeds") && !encoderFeeds.inputs_embeds) {
    if (!model_inputs.input_ids) {
      throw new Error("Both `input_ids` and `inputs_embeds` are missing in the model inputs.");
    }
    encoderFeeds.inputs_embeds = await self2.encode_text({ input_ids: model_inputs.input_ids });
  }
  if (session.inputNames.includes("token_type_ids") && !encoderFeeds.token_type_ids) {
    if (!encoderFeeds.input_ids) {
      throw new Error("Both `input_ids` and `token_type_ids` are missing in the model inputs.");
    }
    encoderFeeds.token_type_ids = zeros_like(encoderFeeds.input_ids);
  }
  if (session.inputNames.includes("pixel_mask") && !encoderFeeds.pixel_mask) {
    if (!encoderFeeds.pixel_values) {
      throw new Error("Both `pixel_values` and `pixel_mask` are missing in the model inputs.");
    }
    const dims = encoderFeeds.pixel_values.dims;
    encoderFeeds.pixel_mask = ones([dims[0], dims[2], dims[3]]);
  }
  return await sessionRun(session, encoderFeeds);
}
async function auto_encoder_forward(self2, model_inputs) {
  const encoded = await self2.encode(model_inputs);
  const decoded = await self2.decode(encoded);
  return decoded;
}
function getPastKeyValues(decoderResults, pastKeyValues) {
  const pkvs = /* @__PURE__ */ Object.create(null);
  for (const name2 in decoderResults) {
    if (name2.startsWith("present")) {
      const newName = name2.replace("present_ssm", "past_ssm").replace("present_conv", "past_conv").replace("present_recurrent", "past_recurrent").replace("present_compressor", "past_compressor").replace("present_indexer", "past_indexer").replace("present", "past_key_values");
      const is_encoder_pkv = name2.includes("encoder");
      if (is_encoder_pkv && pastKeyValues) {
        pkvs[newName] = pastKeyValues[newName];
      } else {
        pkvs[newName] = decoderResults[name2];
      }
    }
  }
  if (pastKeyValues) {
    pastKeyValues.update(pkvs);
    return pastKeyValues;
  }
  return new DynamicCache(pkvs);
}
function getAttentions(model_output) {
  const attentions = {};
  for (const attnName of ["cross_attentions", "encoder_attentions", "decoder_attentions"]) {
    for (const name2 in model_output) {
      if (name2.startsWith(attnName)) {
        if (!(attnName in attentions)) {
          attentions[attnName] = [];
        }
        attentions[attnName].push(model_output[name2]);
      }
    }
  }
  return attentions;
}
function resolveCacheShape(metadataShape, symbols) {
  return metadataShape.map((d) => {
    if (typeof d === "number") return d;
    return symbols[d] ?? 0;
  });
}
function addPastKeyValues(self2, decoderFeeds, pastKeyValues) {
  if (pastKeyValues && Object.keys(pastKeyValues).length > 0) {
    Object.assign(decoderFeeds, pastKeyValues);
    return pastKeyValues;
  }
  const session = self2.sessions["decoder_model_merged"] ?? self2.sessions["model"];
  const batch_size = (decoderFeeds[self2.main_input_name] ?? decoderFeeds.attention_mask)?.dims?.[0] ?? 1;
  const names = getCacheNames(self2.config);
  const num_heads = self2.config?.normalized_config?.num_heads;
  const symbols = { batch_size };
  if (typeof num_heads === "number") {
    symbols["batch_size x num_heads"] = batch_size * num_heads;
  }
  const entries = /* @__PURE__ */ Object.create(null);
  for (const meta of session.inputMetadata) {
    if (!names.has(meta.name)) continue;
    const shape = resolveCacheShape(meta.shape, symbols);
    const size = shape.reduce((a, b) => a * b, 1);
    const cls = DataTypeMap[meta.type];
    const t = new Tensor(meta.type, new cls(size), shape);
    decoderFeeds[meta.name] = t;
    entries[meta.name] = t;
  }
  if (pastKeyValues) {
    pastKeyValues.update(entries);
    return pastKeyValues;
  }
  return new DynamicCache(entries);
}
function setNumLogitsToKeep(self2, model_inputs, value) {
  if (model_inputs.num_logits_to_keep) return;
  const session = self2.sessions["decoder_model_merged"] ?? self2.sessions["model"];
  if (session?.inputNames.includes("num_logits_to_keep")) {
    model_inputs.num_logits_to_keep = new Tensor("int64", [value], []);
  }
}
async function decoder_forward(self2, model_inputs, is_encoder_decoder = false) {
  const session = self2.sessions[is_encoder_decoder ? "decoder_model_merged" : "model"];
  const { past_key_values, ...new_model_inputs } = model_inputs;
  if (session.inputNames.includes("use_cache_branch")) {
    new_model_inputs.use_cache_branch = boolTensor(
      past_key_values != null && Object.keys(past_key_values).length > 0
    );
  }
  if (session.inputNames.includes("position_ids") && new_model_inputs.attention_mask && !new_model_inputs.position_ids) {
    const start_index = ["paligemma", "gemma3_text", "gemma3"].includes(self2.config.model_type) ? 1 : 0;
    new_model_inputs.position_ids = create_position_ids(new_model_inputs, past_key_values, start_index);
  }
  setNumLogitsToKeep(self2, new_model_inputs, 0n);
  addPastKeyValues(self2, new_model_inputs, past_key_values);
  const fixed = pick(new_model_inputs, session.inputNames);
  return await sessionRun(session, fixed);
}
async function generic_text_to_text_forward(self2, {
  // Generic parameters:
  encode_function,
  merge_function,
  modality_input_names,
  modality_output_name,
  // Produced by the tokenizer/processor:
  input_ids = null,
  attention_mask = null,
  // Used during generation:
  position_ids = null,
  inputs_embeds = null,
  past_key_values = null,
  // Generic generation parameters
  generation_config = null,
  logits_processor = null,
  num_logits_to_keep = null,
  // Additional parameters
  ...kwargs
}) {
  if (!inputs_embeds) {
    inputs_embeds = await self2.encode_text({ input_ids, ...kwargs });
    const modality_values = pick(kwargs, modality_input_names);
    if (Object.keys(modality_values).length > 0) {
      if (input_ids.dims[1] !== 1) {
        const modality_features = await encode_function({
          // Pass the modality values under its expected key.
          // The caller knows whether this is audio or image.
          ...modality_values,
          ...kwargs
        });
        ({ inputs_embeds, attention_mask } = merge_function({
          [modality_output_name]: modality_features,
          inputs_embeds,
          input_ids,
          attention_mask
        }));
      } else if (past_key_values && input_ids.dims[1] === 1) {
        const target_length = input_ids.dims[1];
        const past_length = past_key_values.get_seq_length();
        attention_mask = cat(
          [
            ones([input_ids.dims[0], past_length]),
            attention_mask.slice(null, [attention_mask.dims[1] - target_length, attention_mask.dims[1]])
          ],
          1
        );
      }
    }
  }
  if (!position_ids) {
    if (
      // Handle special case for qwen vl models
      [
        "qwen2_vl",
        "qwen2_vl_text",
        "qwen2_5_vl",
        "qwen2_5_vl_text",
        "qwen3_vl",
        "qwen3_vl_text",
        "qwen3_vl_moe",
        "qwen3_vl_moe_text",
        "qwen3_5",
        "qwen3_5_text",
        "qwen3_5_moe",
        "qwen3_5_moe_text",
        "glm_ocr",
        "glm_ocr_text"
      ].includes(self2.config.model_type)
    ) {
      const { image_grid_thw, video_grid_thw } = kwargs;
      [position_ids] = self2.get_rope_index(input_ids, image_grid_thw, video_grid_thw, attention_mask);
    }
  }
  const outputs = await decoder_forward(
    self2,
    {
      inputs_embeds,
      past_key_values,
      attention_mask,
      position_ids,
      generation_config,
      logits_processor,
      num_logits_to_keep
    },
    true
  );
  return outputs;
}
async function audio_text_to_text_forward(self2, params) {
  return await generic_text_to_text_forward(self2, {
    ...params,
    modality_input_names: ["audio_values", "input_features"],
    modality_output_name: "audio_features",
    encode_function: self2.encode_audio.bind(self2),
    merge_function: self2._merge_input_ids_with_audio_features.bind(self2)
  });
}
async function image_text_to_text_forward(self2, params) {
  return await generic_text_to_text_forward(self2, {
    ...params,
    modality_input_names: ["pixel_values"],
    modality_output_name: "image_features",
    encode_function: self2.encode_image.bind(self2),
    merge_function: self2._merge_input_ids_with_image_features.bind(self2)
  });
}
function cumsum_masked_fill(attention_mask, start_index = 0) {
  const [bz, seq_len] = attention_mask.dims;
  const attn_mask_data = attention_mask.data;
  const data = new BigInt64Array(attn_mask_data.length);
  for (let i = 0; i < bz; ++i) {
    const start = i * seq_len;
    let sum = BigInt(start_index);
    for (let j = 0; j < seq_len; ++j) {
      const index = start + j;
      if (attn_mask_data[index] === 0n) {
        data[index] = BigInt(1);
      } else {
        data[index] = sum;
        sum += attn_mask_data[index];
      }
    }
  }
  return { data, dims: attention_mask.dims };
}
function create_position_ids(model_inputs, past_key_values = null, start_index = 0) {
  const { input_ids, inputs_embeds, attention_mask } = model_inputs;
  const { data, dims } = cumsum_masked_fill(attention_mask, start_index);
  let position_ids = new Tensor("int64", data, dims);
  if (past_key_values) {
    const offset = -(input_ids ?? inputs_embeds).dims.at(1);
    position_ids = position_ids.slice(null, [offset, null]);
  }
  return position_ids;
}
function decoder_prepare_inputs_for_generation(self2, input_ids, model_inputs, generation_config) {
  const past_length = model_inputs.past_key_values ? model_inputs.past_key_values.get_seq_length() : 0;
  setNumLogitsToKeep(self2, model_inputs, 1n);
  if (!model_inputs.attention_mask) {
    let dims;
    for (const key of ["input_ids", "inputs_embeds", "position_ids"]) {
      if (model_inputs[key]) {
        dims = model_inputs[key].dims;
        break;
      }
    }
    if (!dims) {
      throw new Error("attention_mask is not provided, and unable to infer its shape from model inputs.");
    }
    model_inputs.attention_mask = ones([dims[0], past_length + dims[1]]);
  }
  if (model_inputs.past_key_values) {
    const { input_ids: input_ids2, attention_mask } = model_inputs;
    if (attention_mask && attention_mask.dims[1] > input_ids2.dims[1]) ;
    else if (past_length < input_ids2.dims[1]) {
      model_inputs.input_ids = input_ids2.slice(null, [past_length, null]);
    } else ;
  }
  return model_inputs;
}
function encoder_decoder_prepare_inputs_for_generation(self2, input_ids, model_inputs, generation_config) {
  if (model_inputs.past_key_values) {
    input_ids = input_ids.map((x) => [x.at(-1)]);
  }
  setNumLogitsToKeep(self2, model_inputs, 1n);
  return {
    ...model_inputs,
    decoder_input_ids: toI64Tensor(input_ids)
  };
}
function multimodal_text_to_text_prepare_inputs_for_generation(self2, ...args) {
  if (self2.config.is_encoder_decoder) {
    return encoder_decoder_prepare_inputs_for_generation(self2, ...args);
  } else {
    return decoder_prepare_inputs_for_generation(self2, ...args);
  }
}
function default_merge_input_ids_with_features({
  modality_token_id,
  inputs_embeds,
  modality_features,
  input_ids,
  attention_mask
}) {
  const token_positions = input_ids.tolist().map(
    (ids) => ids.reduce((acc, x, idx) => {
      if (x == modality_token_id) acc.push(idx);
      return acc;
    }, [])
  );
  const n_tokens = token_positions.reduce((acc, x) => acc + x.length, 0);
  const n_features = modality_features.dims[0];
  if (n_tokens !== n_features) {
    throw new Error(`Number of tokens and features do not match: tokens: ${n_tokens}, features ${n_features}`);
  }
  let img = 0;
  for (let i = 0; i < token_positions.length; ++i) {
    const tokens = token_positions[i];
    const embeds = inputs_embeds[i];
    for (let j = 0; j < tokens.length; ++j) {
      embeds[tokens[j]].data.set(modality_features[img++].data);
    }
  }
  return { inputs_embeds, attention_mask };
}
function default_merge_input_ids_with_image_features({
  image_token_id,
  inputs_embeds,
  image_features,
  input_ids,
  attention_mask
}) {
  return default_merge_input_ids_with_features({
    modality_token_id: image_token_id,
    inputs_embeds,
    modality_features: image_features,
    input_ids,
    attention_mask
  });
}
async function get_optional_configs(pretrained_model_name_or_path, names, options) {
  return Object.fromEntries(
    await Promise.all(
      Object.keys(names).map(async (name2) => {
        const config = await getModelJSON(pretrained_model_name_or_path, names[name2], false, options);
        return [name2, config];
      })
    )
  );
}
class LlavaPreTrainedModel extends PreTrainedModel {
  forward_params = ["input_ids", "attention_mask", "pixel_values", "position_ids", "past_key_values"];
}
class LlavaForConditionalGeneration extends LlavaPreTrainedModel {
  _merge_input_ids_with_image_features(kwargs) {
    const vision_hidden_size = kwargs.image_features.dims.at(-1);
    const reshaped_image_hidden_states = kwargs.image_features.view(-1, vision_hidden_size);
    return default_merge_input_ids_with_image_features({
      // @ts-ignore
      image_token_id: this.config.image_token_index ?? this.config.image_token_id,
      ...kwargs,
      image_features: reshaped_image_hidden_states
    });
  }
}
class Idefics3ForConditionalGeneration extends LlavaForConditionalGeneration {
  forward_params = [
    "input_ids",
    "attention_mask",
    "pixel_values",
    "pixel_attention_mask",
    "position_ids",
    "past_key_values"
  ];
}
class Processor extends Callable$1 {
  static classes = ["image_processor_class", "tokenizer_class", "feature_extractor_class"];
  static uses_processor_config = false;
  static uses_chat_template_file = false;
  /**
   * Create a processor from parsed config and its component preprocessors.
   * @param {Object} config Processor configuration.
   * @param {Record<string, Object>} components Loaded tokenizer, image processor, and/or feature extractor.
   * @param {string|null} chat_template Optional chat template loaded from the model repo.
   */
  constructor(config, components, chat_template) {
    super();
    this.config = config;
    this.components = components;
    this.chat_template = chat_template;
  }
  /**
   * The image processor used by this processor, if any.
   * @returns {import('./image_processors_utils.js').ImageProcessor|undefined} The image processor of the processor, if it exists.
   */
  get image_processor() {
    return this.components.image_processor;
  }
  /**
   * The tokenizer used by this processor, if any.
   * @returns {PreTrainedTokenizer|undefined} The tokenizer of the processor, if it exists.
   */
  get tokenizer() {
    return this.components.tokenizer;
  }
  /**
   * The feature extractor used by this processor, if any.
   * @returns {import('./feature_extraction_utils.js').FeatureExtractor|undefined} The feature extractor of the processor, if it exists.
   */
  get feature_extractor() {
    return this.components.feature_extractor;
  }
  /**
   * Delegates to the underlying tokenizer's `apply_chat_template`.
   * @param {Parameters<PreTrainedTokenizer['apply_chat_template']>[0]} messages
   * @param {Parameters<PreTrainedTokenizer['apply_chat_template']>[1]} options
   * @returns {ReturnType<PreTrainedTokenizer['apply_chat_template']>}
   */
  apply_chat_template(messages, options = {}) {
    if (!this.tokenizer) {
      throw new Error("Unable to apply chat template without a tokenizer.");
    }
    return this.tokenizer.apply_chat_template(messages, {
      tokenize: false,
      // default to false
      chat_template: this.chat_template ?? void 0,
      ...options
    });
  }
  /**
   * Decode a batch of tokenized sequences via the underlying tokenizer.
   * @param {Parameters<PreTrainedTokenizer['batch_decode']>} args
   * @returns {ReturnType<PreTrainedTokenizer['batch_decode']>}
   */
  batch_decode(...args) {
    if (!this.tokenizer) {
      throw new Error("Unable to decode without a tokenizer.");
    }
    return this.tokenizer.batch_decode(...args);
  }
  /**
   * Decode a single tokenized sequence via the underlying tokenizer.
   * @param {Parameters<PreTrainedTokenizer['decode']>} args
   * @returns {ReturnType<PreTrainedTokenizer['decode']>}
   */
  decode(...args) {
    if (!this.tokenizer) {
      throw new Error("Unable to decode without a tokenizer.");
    }
    return this.tokenizer.decode(...args);
  }
  /**
   * Calls the feature_extractor function with the given input.
   * @param {any} input The input to extract features from.
   * @param {...any} args Additional arguments.
   * @returns {Promise<any>} A Promise that resolves with the extracted features.
   */
  async _call(input, ...args) {
    for (const item of [this.image_processor, this.feature_extractor, this.tokenizer]) {
      if (item) {
        return item(input, ...args);
      }
    }
    throw new Error("No image processor, feature extractor, or tokenizer found.");
  }
  /**
   * Instantiate one of the processor classes of the library from a pretrained model.
   *
   * The processor class to instantiate is selected based on the `image_processor_type` (or `feature_extractor_type`; legacy)
   * property of the config object (either passed as an argument or loaded from `pretrained_model_name_or_path` if possible)
   *
   * @param {string} pretrained_model_name_or_path The name or path of the pretrained model. Can be either:
   * - A string, the *model ID* of a pretrained processor hosted inside a model repo on huggingface.co.
   *   Valid model IDs can be located at the root level, like `bert-base-uncased`, or namespaced under a
   *   user or organization name, like `dbmdz/bert-base-german-cased`.
   * - A path to a *directory* containing processor files, e.g., `./my_model_directory/`.
   * @param {PretrainedProcessorOptions} options Additional options for loading the processor.
   *
   * @returns {Promise<Processor>} A new processor instance.
   */
  static async from_pretrained(pretrained_model_name_or_path, options = {}) {
    const [config, components, chat_template] = await Promise.all([
      // TODO:
      this.uses_processor_config ? getModelJSON(pretrained_model_name_or_path, PROCESSOR_NAME, true, options) : {},
      Promise.all(
        this.classes.filter((cls) => cls in this).map(async (cls) => {
          const component = await this[cls].from_pretrained(pretrained_model_name_or_path, options);
          return [cls.replace(/_class$/, ""), component];
        })
      ).then(Object.fromEntries),
      this.uses_chat_template_file ? getModelText(pretrained_model_name_or_path, CHAT_TEMPLATE_NAME, true, options) : null
    ]);
    return new this(config, components, chat_template);
  }
}
var DictionarySplitter = class {
  /**
   * @param dictionary The dictionary of words to use for splitting.
   */
  constructor(dictionary) {
    this.trie = this._build_trie(dictionary);
  }
  /**
   * Builds a trie from the given dictionary.
   * @param dictionary The dictionary of words to build the trie from.
   * @returns The root node of the trie.
   * @private
   */
  _build_trie(dictionary) {
    const trie = /* @__PURE__ */ Object.create(null);
    for (const word of dictionary) {
      let node = trie;
      for (let i = 0; i < word.length; ++i) {
        const char = word[i];
        node = node[char] ??= /* @__PURE__ */ Object.create(null);
      }
      node.end = word;
    }
    return trie;
  }
  /**
   * Splits the input text into tokens based on the dictionary.
   * @param text The input text to split.
   * @returns An array of tokens.
   */
  split(text) {
    const result = [];
    const n = text.length;
    let start = 0;
    let i = 0;
    while (i < n) {
      let node = this.trie;
      let match = null;
      let j = i;
      while (j < n && (node = node[text[j]])) {
        if (node.end) {
          match = node.end;
        }
        ++j;
      }
      if (match) {
        if (i > start) {
          result.push(text.slice(start, i));
        }
        result.push(match);
        i += match.length;
        start = i;
      } else {
        ++i;
      }
    }
    if (start < n) {
      result.push(text.slice(start));
    }
    return result;
  }
};
var DictionarySplitter_default = DictionarySplitter;
var AddedToken = class {
  /**
   * Creates a new instance of AddedToken.
   * @param config Added token configuration object.
   */
  constructor(config) {
    this.content = config.content;
    this.id = config.id;
    this.single_word = config.single_word ?? false;
    this.lstrip = config.lstrip ?? false;
    this.rstrip = config.rstrip ?? false;
    this.special = config.special ?? false;
    this.normalized = config.normalized ?? !this.special;
  }
};
var AddedToken_default = AddedToken;
var compile_unicode_regexp = (source, flags) => {
  try {
    return new RegExp(source, flags);
  } catch (error) {
    if (!(error instanceof SyntaxError)) throw error;
    const property_names = /* @__PURE__ */ new Map();
    const rewritten = source.replace(
      /(\\[pP])\{([^}=]+)\}/g,
      (text, p, n, offset) => {
        let preceding_backslashes = 0;
        for (let i = offset - 1; i >= 0 && source[i] === "\\"; --i) {
          ++preceding_backslashes;
        }
        if (preceding_backslashes % 2 === 1) return text;
        let property_name = property_names.get(n);
        if (property_name === void 0) {
          try {
            new RegExp(`\\p{${n}}`, "u");
            property_name = n;
          } catch {
            property_name = `Script=${n}`;
          }
          property_names.set(n, property_name);
        }
        return `${p}{${property_name}}`;
      }
    );
    if (rewritten === source) throw error;
    try {
      return new RegExp(rewritten, flags);
    } catch {
      throw error;
    }
  }
};
var clean_up_tokenization = (text) => text.replace(/ \./g, ".").replace(/ \?/g, "?").replace(/ \!/g, "!").replace(/ ,/g, ",").replace(/ \' /g, "'").replace(/ n't/g, "n't").replace(/ 'm/g, "'m").replace(/ 's/g, "'s").replace(/ 've/g, "'ve").replace(/ 're/g, "'re");
var create_pattern = (pattern, invert = true) => {
  if (pattern.Regex !== void 0) {
    const regex = rewrite_oniguruma_to_js(
      normalize_bloom_split_char_class(pattern.Regex)
    );
    return compile_unicode_regexp(regex, "gu");
  } else if (pattern.String !== void 0) {
    const escaped = escape_reg_exp(pattern.String);
    return new RegExp(invert ? escaped : `(${escaped})`, "gu");
  } else {
    console.warn("Unknown pattern type:", pattern);
    return null;
  }
};
var UNICODE_WORD_CHARS_IN_CLASS = "\\p{Alphabetic}\\p{M}\\p{Nd}\\p{Pc}";
var UNICODE_WORD_CHARS = `${UNICODE_WORD_CHARS_IN_CLASS}\\u00B2\\u00B3\\u00B9\\u00BC-\\u00BE`;
var UNICODE_WORD_CLASS = `[${UNICODE_WORD_CHARS}]`;
var UNICODE_NON_WORD_CLASS = `[^${UNICODE_WORD_CHARS}]`;
var UNICODE_WORD_BOUNDARY = `(?:(?<!${UNICODE_WORD_CLASS})(?=${UNICODE_WORD_CLASS})|(?<=${UNICODE_WORD_CLASS})(?!${UNICODE_WORD_CLASS}))`;
var UNICODE_NON_WORD_BOUNDARY = `(?:(?<!${UNICODE_WORD_CLASS})(?!${UNICODE_WORD_CLASS})|(?<=${UNICODE_WORD_CLASS})(?=${UNICODE_WORD_CLASS}))`;
var LINE_START_ANCHOR = "(?:(?<![\\s\\S])|(?<=\\n))";
var LINE_END_ANCHOR = "(?:(?=\\n)|(?![\\s\\S]))";
var HEX_DIGIT_CHARS = "0-9A-Fa-f";
var ESCAPE_REWRITES = /* @__PURE__ */ new Map([
  ["A", "(?<![\\s\\S])"],
  ["z", "(?![\\s\\S])"],
  ["Z", "(?=\\n?(?![\\s\\S]))"],
  // \Z permits a single optional final \n (not \r\n)
  ["h", `[${HEX_DIGIT_CHARS}]`],
  ["H", `[^${HEX_DIGIT_CHARS}]`],
  ["w", UNICODE_WORD_CLASS],
  ["W", UNICODE_NON_WORD_CLASS],
  ["d", "\\p{Nd}"],
  ["D", "\\P{Nd}"],
  ["s", "\\p{White_Space}"],
  // JS \s wrongly adds U+FEFF and misses \x85
  ["S", "\\P{White_Space}"],
  ["b", UNICODE_WORD_BOUNDARY],
  ["B", UNICODE_NON_WORD_BOUNDARY],
  ["a", "\\x07"],
  ["e", "\\x1B"]
]);
var CLASS_ESCAPE_REWRITES = /* @__PURE__ */ new Map([
  ["h", HEX_DIGIT_CHARS],
  ["w", UNICODE_WORD_CHARS_IN_CLASS],
  ["d", "\\p{Nd}"],
  ["D", "\\P{Nd}"],
  ["s", "\\p{White_Space}"],
  ["S", "\\P{White_Space}"],
  ["a", "\\x07"],
  ["e", "\\x1B"]
]);
var CLASS_COMPLEMENT_ALTERNATIVES = /* @__PURE__ */ new Map([
  ["W", `[^${UNICODE_WORD_CHARS_IN_CLASS}]`],
  ["H", `[^${HEX_DIGIT_CHARS}]`]
]);
var RAW_WHITESPACE_ESCAPES = /* @__PURE__ */ new Map([
  ["\n", "\\n"],
  ["\r", "\\r"],
  ["	", "\\t"],
  ["\f", "\\f"],
  ["\v", "\\v"]
]);
var POSIX_CLASS_FRAGMENTS = /* @__PURE__ */ new Map([
  ["alpha", "\\p{Alphabetic}"],
  ["alnum", "\\p{Alphabetic}\\p{Nd}"],
  ["digit", "\\p{Nd}"],
  ["lower", "\\p{Lowercase}"],
  ["upper", "\\p{Uppercase}"],
  ["space", "\\p{White_Space}"],
  ["blank", "\\t\\p{Zs}"],
  ["punct", "\\p{P}\\p{S}"],
  ["cntrl", "\\p{Cc}"],
  ["word", UNICODE_WORD_CHARS_IN_CLASS],
  ["xdigit", HEX_DIGIT_CHARS]
]);
var JS_SYNTAX_CHARS = "^$\\.*+?()[]{}|/";
var GROUP_PREFIX_RE = /^\(\?(?:<[=!]|<[A-Za-z_][A-Za-z0-9_]*>|[:=!>])/;
var BRACED_ESCAPE_RE = /^\\([pPxu])\{([^}]*)\}/;
var QUANTIFIER_BRACE_RE = /^\{(\d+(?:,\d*)?|,\d+)\}/;
var POSIX_BRACKET_RE = new RegExp("^\\[:(\\^?)(\\p{Alphabetic}+):\\]", "u");
var EMPTY_NEGATED_POSIX_BRACKET_RE = /^\[:\^:\]/;
var UNSUPPORTED_POSIX_BRACKET_RE = /^\[(?:\.[^\]]*\.\]|=[^\]]*=\])/;
var FIXED_WIDTH_ESCAPE_RE = /^(?:\\x[0-9A-Fa-f]{2}|\\u[0-9A-Fa-f]{4}|\\c[A-Za-z])/;
var is_ascii_letter = (char) => char >= "A" && char <= "Z" || char >= "a" && char <= "z";
var character_at = (text, index) => String.fromCodePoint(text.codePointAt(index));
var get_ascii_folded_hex_atom = (hex) => {
  if (!/^[0-9A-Fa-f]{1,8}$/.test(hex)) return null;
  const code_point = Number.parseInt(hex, 16);
  if (code_point > 127) return null;
  const letter = String.fromCharCode(code_point);
  return is_ascii_letter(letter) ? `[${letter.toLowerCase()}${letter.toUpperCase()}]` : null;
};
var normalize_bloom_split_char_class = (regex) => regex.replace(/\[\^\(\\s\|\[([^\]]+)\]\)\]/g, "[^()|\\s$1]");
var ANY_CODE_POINT = "[\\s\\S]";
var MAX_CHARACTER_CLASS_NESTING_DEPTH = 256;
var create_character_class_operand = () => ({
  fragment: "",
  alternatives: [],
  tail: null,
  contains_complex_set: false
});
var throw_character_class_range_error = (index) => {
  throw new SyntaxError(
    `Unsupported range with a set-valued character-class operand at index ${index}`
  );
};
var add_character_class_atom = (operand, atom, index, contains_complex_set = true) => {
  if (operand.tail === "range") throw_character_class_range_error(index);
  operand.alternatives.push(atom);
  operand.tail = "set";
  operand.contains_complex_set = operand.contains_complex_set || contains_complex_set;
};
var append_character_class_fragment = (operand, fragment, set_valued = false, index = -1) => {
  if (set_valued && operand.tail === "range") {
    throw_character_class_range_error(index);
  }
  if (operand.tail === "range") {
    operand.fragment += fragment;
    operand.tail = "complete_range";
    return;
  }
  operand.fragment += fragment;
  operand.tail = set_valued ? "set" : "scalar";
  operand.contains_complex_set = operand.contains_complex_set || set_valued;
};
var rewrite_character_class_escape = (regex, index, operand) => {
  const braced = BRACED_ESCAPE_RE.exec(regex.slice(index));
  if (braced) {
    const [text, kind, body] = braced;
    if (kind === "P" && body === "Word") {
      add_character_class_atom(
        operand,
        `[^${UNICODE_WORD_CHARS_IN_CLASS}]`,
        index
      );
    } else {
      const replacement2 = kind === "x" ? `\\u{${body}}` : kind === "p" && body === "Word" ? UNICODE_WORD_CHARS_IN_CLASS : text;
      append_character_class_fragment(
        operand,
        replacement2,
        kind === "p" || kind === "P",
        index
      );
    }
    return index + text.length;
  }
  const fixed_width = FIXED_WIDTH_ESCAPE_RE.exec(regex.slice(index));
  if (fixed_width) {
    append_character_class_fragment(operand, fixed_width[0]);
    return index + fixed_width[0].length;
  }
  if (index + 1 >= regex.length) {
    throw new SyntaxError(
      `Unterminated escape in character class at index ${index}`
    );
  }
  const next = character_at(regex, index + 1);
  const next_end = index + 1 + next.length;
  const raw_whitespace = RAW_WHITESPACE_ESCAPES.get(next);
  if (raw_whitespace !== void 0) {
    append_character_class_fragment(operand, raw_whitespace);
    return next_end;
  }
  const complement = CLASS_COMPLEMENT_ALTERNATIVES.get(next);
  if (complement !== void 0) {
    add_character_class_atom(operand, complement, index);
    return next_end;
  }
  const rewrite = CLASS_ESCAPE_REWRITES.get(next);
  let replacement;
  let set_valued = false;
  if (rewrite !== void 0) {
    replacement = rewrite;
    set_valued = next !== "a" && next !== "e";
  } else if (/[A-Za-z0-9]/.test(next)) {
    replacement = `\\${next}`;
  } else if (JS_SYNTAX_CHARS.includes(next) || next === "-") {
    replacement = `\\${next}`;
  } else {
    replacement = next;
  }
  append_character_class_fragment(operand, replacement, set_valued, index);
  return next_end;
};
var compile_character_set_union = (pieces) => {
  if (pieces.length === 1) return pieces[0];
  return `(?:(?=(?:${pieces.join("|")}))${ANY_CODE_POINT})`;
};
var compile_character_class_operand = (operand) => {
  const pieces = operand.fragment.length === 0 ? operand.alternatives : [`[${operand.fragment}]`, ...operand.alternatives];
  return compile_character_set_union(pieces);
};
var get_ascii_fold_additions = (positive_atom) => {
  const membership = compile_unicode_regexp(`^(?:${positive_atom})$`, "u");
  let additions = "";
  for (let offset = 0; offset < 26; ++offset) {
    const upper = String.fromCharCode(65 + offset);
    const lower = String.fromCharCode(97 + offset);
    const has_upper = membership.test(upper);
    const has_lower = membership.test(lower);
    if (has_upper !== has_lower) additions += has_upper ? lower : upper;
  }
  return additions;
};
var parse_character_class = (regex, start, ascii_fold, apply_ascii_fold = true, nesting_depth = 1) => {
  if (nesting_depth > MAX_CHARACTER_CLASS_NESTING_DEPTH) {
    throw new SyntaxError(
      `Maximum character-class nesting depth of ${MAX_CHARACTER_CLASS_NESTING_DEPTH} exceeded at index ${start}`
    );
  }
  let i = start + 1;
  const negated = regex[i] === "^";
  if (negated) ++i;
  const first_content_index = i;
  const operands = [create_character_class_operand()];
  let operand = operands[0];
  let contains_nested_negated_complex_set = false;
  while (i < regex.length) {
    const char = character_at(regex, i);
    if (char === "\\") {
      i = rewrite_character_class_escape(regex, i, operand);
      continue;
    }
    if (char === "]") {
      if (i === first_content_index) {
        append_character_class_fragment(operand, "\\]");
        ++i;
        continue;
      }
      if (operand.tail === null) {
        if (operands.length > 1) {
          throw new SyntaxError(
            `Malformed character-class intersection with an empty operand at index ${i}`
          );
        }
        throw new SyntaxError(`Empty character class at index ${start}`);
      }
      const contains_complex_set = operands.some(
        (candidate) => candidate.contains_complex_set
      );
      if (negated && operands.length > 1 && contains_nested_negated_complex_set) {
        throw new SyntaxError(
          `Unsupported outer-negated character-class intersection with a nested negated class containing a Unicode property, POSIX class, or shorthand at index ${start}`
        );
      }
      const first_atom = compile_character_class_operand(operands[0]);
      let positive_atom = first_atom;
      if (operands.length > 1) {
        let lookaheads = "";
        for (let j = 1; j < operands.length; ++j) {
          lookaheads += `(?=${compile_character_class_operand(operands[j])})`;
        }
        positive_atom = `(?:${lookaheads}${first_atom})`;
      }
      const is_direct_class = operands.length === 1 && operand.alternatives.length === 0;
      let direct_fragment = operand.fragment;
      if (ascii_fold && apply_ascii_fold) {
        const additions = get_ascii_fold_additions(positive_atom);
        if (additions.length > 0) {
          if (is_direct_class) {
            direct_fragment += additions;
            positive_atom = `[${direct_fragment}]`;
          } else {
            positive_atom = compile_character_set_union([
              positive_atom,
              `[${additions}]`
            ]);
          }
        }
      }
      const atom = negated ? is_direct_class ? `[^${direct_fragment}]` : `(?:(?!${positive_atom})${ANY_CODE_POINT})` : positive_atom;
      return {
        atom,
        end: i + 1,
        negated,
        contains_complex_set,
        contains_nested_negated_complex_set
      };
    }
    if (regex.startsWith("&&", i)) {
      if (operand.tail === null) {
        throw new SyntaxError(
          `Malformed character-class intersection with an empty operand at index ${i}`
        );
      }
      operand = create_character_class_operand();
      operands.push(operand);
      i += 2;
      continue;
    }
    if (char === "[") {
      const suffix = regex.slice(i);
      if (EMPTY_NEGATED_POSIX_BRACKET_RE.test(suffix)) {
        throw new SyntaxError(
          `Malformed empty negated POSIX character class at index ${i}`
        );
      }
      const posix = POSIX_BRACKET_RE.exec(suffix);
      if (posix) {
        const [, posix_negated, name2] = posix;
        const fragment = POSIX_CLASS_FRAGMENTS.get(name2);
        if (fragment === void 0) {
          throw new SyntaxError(
            `Unsupported POSIX character class "${name2}" at index ${i}`
          );
        }
        if (ascii_fold && posix_negated && (name2 === "lower" || name2 === "upper")) {
          throw new SyntaxError(
            `Unsupported negated POSIX ${name2} class inside an inline case-insensitive group`
          );
        }
        if (posix_negated) {
          add_character_class_atom(operand, `[^${fragment}]`, i);
        } else {
          append_character_class_fragment(operand, fragment, true, i);
        }
        i += posix[0].length;
        continue;
      }
      if (UNSUPPORTED_POSIX_BRACKET_RE.test(suffix)) {
        throw new SyntaxError(
          `Unsupported POSIX collating or equivalence bracket expression at index ${i}`
        );
      }
      const nested = parse_character_class(
        regex,
        i,
        ascii_fold,
        false,
        nesting_depth + 1
      );
      add_character_class_atom(
        operand,
        nested.atom,
        i,
        nested.contains_complex_set
      );
      contains_nested_negated_complex_set ||= nested.contains_nested_negated_complex_set || nested.negated && nested.contains_complex_set;
      i = nested.end;
      continue;
    }
    if (char === "-") {
      const is_terminal_literal = regex[i + 1] === "]" || regex.startsWith("&&", i + 1);
      if (operand.tail === "set" && !is_terminal_literal) {
        throw_character_class_range_error(i);
      }
      if (operand.tail === null || operand.tail === "range" || operand.tail === "complete_range" || is_terminal_literal) {
        append_character_class_fragment(operand, "\\-");
      } else {
        operand.fragment += "-";
        operand.tail = "range";
      }
      ++i;
      continue;
    }
    append_character_class_fragment(
      operand,
      char === "^" && operand.fragment.length === 0 ? "\\^" : char
    );
    i += char.length;
  }
  throw new SyntaxError(
    `${operands.length > 1 ? "Unterminated character-class intersection" : "Unterminated character class"} at index ${start}`
  );
};
var rewrite_oniguruma_to_js = (regex) => {
  let out = "";
  let atom_start = -1;
  let last_was_quantifier = false;
  let ascii_fold = false;
  const group_states = [];
  const emit_atom = (text) => {
    atom_start = out.length;
    out += text;
    last_was_quantifier = false;
  };
  for (let i = 0; i < regex.length; ) {
    const char = character_at(regex, i);
    if (char === "\\") {
      const braced = BRACED_ESCAPE_RE.exec(regex.slice(i));
      if (braced) {
        const [text, kind, body] = braced;
        let replacement2 = text;
        if (kind === "x") {
          const code_point_escape = `\\u{${body}}`;
          replacement2 = ascii_fold ? get_ascii_folded_hex_atom(body) ?? code_point_escape : code_point_escape;
        } else if (body === "Word") {
          replacement2 = kind === "p" ? UNICODE_WORD_CLASS : UNICODE_NON_WORD_CLASS;
        }
        emit_atom(replacement2);
        i += text.length;
        continue;
      }
      const fixed_width = FIXED_WIDTH_ESCAPE_RE.exec(regex.slice(i));
      if (fixed_width) {
        const text = fixed_width[0];
        const replacement2 = ascii_fold && text[1] !== "c" ? get_ascii_folded_hex_atom(text.slice(2)) ?? text : text;
        emit_atom(replacement2);
        i += text.length;
        continue;
      }
      if (i + 1 >= regex.length) {
        out += char;
        break;
      }
      const next = character_at(regex, i + 1);
      i += 1 + next.length;
      if (next === "G") {
        continue;
      }
      const raw_whitespace = RAW_WHITESPACE_ESCAPES.get(next);
      if (raw_whitespace !== void 0) {
        emit_atom(raw_whitespace);
        continue;
      }
      const rewrite = ESCAPE_REWRITES.get(next);
      let replacement;
      if (rewrite !== void 0) {
        replacement = rewrite;
      } else if (/[A-Za-z0-9]/.test(next)) {
        replacement = `\\${next}`;
      } else if (JS_SYNTAX_CHARS.includes(next)) {
        replacement = `\\${next}`;
      } else {
        replacement = next;
      }
      emit_atom(replacement);
      continue;
    }
    switch (char) {
      case "[": {
        const parsed = parse_character_class(regex, i, ascii_fold);
        emit_atom(parsed.atom);
        i = parsed.end;
        continue;
      }
      case "]":
        emit_atom("\\]");
        ++i;
        continue;
      case ".":
        emit_atom("[^\\n]");
        ++i;
        continue;
      case "^":
        emit_atom(LINE_START_ANCHOR);
        ++i;
        continue;
      case "$":
        emit_atom(LINE_END_ANCHOR);
        ++i;
        continue;
      case "(": {
        const inline_case_insensitive = regex.startsWith("(?i:", i);
        const source_prefix = inline_case_insensitive ? "(?i:" : GROUP_PREFIX_RE.exec(regex.slice(i))?.[0] ?? "(";
        const output_prefix = inline_case_insensitive ? "(?:" : source_prefix === "(?>" ? "(?:" : source_prefix;
        group_states.push([out.length, ascii_fold]);
        if (inline_case_insensitive) ascii_fold = true;
        out += output_prefix;
        last_was_quantifier = false;
        i += source_prefix.length;
        continue;
      }
      case ")":
        out += char;
        [atom_start, ascii_fold] = group_states.pop() ?? [-1, false];
        last_was_quantifier = false;
        ++i;
        continue;
      case "|":
        out += char;
        atom_start = -1;
        last_was_quantifier = false;
        ++i;
        continue;
      case "{": {
        const quant = QUANTIFIER_BRACE_RE.exec(regex.slice(i));
        if (!quant || atom_start < 0) {
          emit_atom("\\{");
          ++i;
          continue;
        }
        const body = quant[1].startsWith(",") ? `0${quant[1]}` : quant[1];
        i += quant[0].length;
        const following = regex[i];
        if (following === "+" || following === "*") {
          out = `${out.slice(0, atom_start)}(?:${out.slice(atom_start)}{${body}})${following}`;
          ++i;
        } else {
          out += `{${body}}`;
        }
        last_was_quantifier = true;
        continue;
      }
      case "}":
        emit_atom("\\}");
        ++i;
        continue;
      case "+":
        if (last_was_quantifier) {
          ++i;
          continue;
        }
        out += char;
        last_was_quantifier = true;
        ++i;
        continue;
      case "*":
      case "?":
        out += char;
        last_was_quantifier = true;
        ++i;
        continue;
      default:
        emit_atom(
          ascii_fold && is_ascii_letter(char) ? `[${char.toLowerCase()}${char.toUpperCase()}]` : char
        );
        i += char.length;
        continue;
    }
  }
  return out;
};
var escape_reg_exp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
var fuse_unk = (arr, tokens_to_ids, unk_token_id) => {
  const fused = [];
  let i = 0;
  while (i < arr.length) {
    fused.push(arr[i]);
    const token_id = tokens_to_ids.get(arr[i]) ?? unk_token_id;
    if (token_id !== unk_token_id) {
      ++i;
      continue;
    }
    while (++i < arr.length && (tokens_to_ids.get(arr[i]) ?? unk_token_id) === unk_token_id) {
      if (tokens_to_ids.get(fused.at(-1)) !== unk_token_id) {
        fused[fused.length - 1] += arr[i];
      }
    }
  }
  return fused;
};
var is_chinese_char$1 = (cp) => cp >= 19968 && cp <= 40959 || cp >= 13312 && cp <= 19903 || cp >= 131072 && cp <= 173791 || cp >= 173824 && cp <= 177983 || cp >= 177984 && cp <= 178207 || cp >= 178208 && cp <= 183983 || cp >= 63744 && cp <= 64255 || cp >= 194560 && cp <= 195103;
var is_integral_number = (x) => Number.isInteger(x) || typeof x === "bigint";
var len = (s) => {
  let length = 0;
  for (const c of s) ++length;
  return length;
};
var lowercase_and_remove_accents = (text) => remove_accents(text.toLowerCase());
var merge_arrays = (...arrs) => Array.prototype.concat.apply([], arrs);
var object_to_map = (obj) => new Map(Object.entries(obj));
var regex_split = (text, regex) => {
  const result = [];
  let prev = 0;
  for (const match of text.matchAll(regex)) {
    const full_match = match[0];
    if (prev < match.index) {
      result.push(text.slice(prev, match.index));
    }
    if (full_match.length > 0) {
      result.push(full_match);
    }
    prev = match.index + full_match.length;
  }
  if (prev < text.length) {
    result.push(text.slice(prev));
  }
  return result;
};
var remove_accents = (text) => text.replace(new RegExp("\\p{M}", "gu"), "");
var validate_object = (obj, name2, required_keys = []) => {
  if (!obj || Array.isArray(obj) || typeof obj !== "object") {
    return `${name2} must be a valid object`;
  }
  for (const key of required_keys) {
    if (!(key in obj)) {
      return `${name2} must contain a "${key}" property`;
    }
  }
  return null;
};
var whitespace_split = (text) => text.match(/\S+/g) || [];
var Callable2 = class {
  /**
   * Creates a new instance of the Callable class.
   */
  constructor() {
    const closure = function(...args) {
      return closure._call(...args);
    };
    return Object.setPrototypeOf(closure, new.target.prototype);
  }
};
var Callable_default = Callable2;
var Normalizer = class extends Callable_default {
  /**
   * @param config The configuration object for the normalizer.
   */
  constructor(config) {
    super();
    this.config = config;
  }
  /**
   * Alias for {@link Normalizer#normalize}.
   * @param text The text to normalize.
   * @returns The normalized text.
   */
  _call(text) {
    return this.normalize(text);
  }
};
var Normalizer_default = Normalizer;
var BertNormalizer = class extends Normalizer_default {
  /**
   * Adds whitespace around any CJK (Chinese, Japanese, or Korean) character in the input text.
   *
   * @param text The input text to tokenize.
   * @returns The tokenized text with whitespace added around CJK characters.
   */
  tokenize_chinese_chars(text) {
    const output = [];
    for (let i = 0; i < text.length; ++i) {
      const char = text[i];
      const cp = char.charCodeAt(0);
      if (is_chinese_char$1(cp)) {
        output.push(" ");
        output.push(char);
        output.push(" ");
      } else {
        output.push(char);
      }
    }
    return output.join("");
  }
  /**
   * Strips accents from the given text.
   * @param text The text to strip accents from.
   * @returns The text with accents removed.
   */
  strip_accents(text) {
    return text.normalize("NFD").replace(new RegExp("\\p{Mn}", "gu"), "");
  }
  /**
   * Checks whether `char` is a control character.
   * @param char The character to check.
   * @returns Whether `char` is a control character.
   */
  is_control(char) {
    switch (char) {
      case "	":
      case "\n":
      case "\r":
        return false;
      default:
        return new RegExp("^\\p{Cc}|\\p{Cf}|\\p{Co}|\\p{Cs}$", "u").test(char);
    }
  }
  /**
   * Performs invalid character removal and whitespace cleanup on text.
   * @param text The text to clean.
   * @returns The cleaned text.
   */
  clean_text(text) {
    const output = [];
    for (const char of text) {
      const cp = char.charCodeAt(0);
      if (cp === 0 || cp === 65533 || this.is_control(char)) {
        continue;
      }
      if (/^\s$/.test(char)) {
        output.push(" ");
      } else {
        output.push(char);
      }
    }
    return output.join("");
  }
  /**
   * Normalizes the given text based on the configuration.
   * @param text The text to normalize.
   * @returns The normalized text.
   */
  normalize(text) {
    if (this.config.clean_text) {
      text = this.clean_text(text);
    }
    if (this.config.handle_chinese_chars) {
      text = this.tokenize_chinese_chars(text);
    }
    if (this.config.lowercase) {
      text = text.toLowerCase();
      if (this.config.strip_accents !== false) {
        text = this.strip_accents(text);
      }
    } else if (this.config.strip_accents) {
      text = this.strip_accents(text);
    }
    return text;
  }
};
var BertNormalizer_default = BertNormalizer;
var Precompiled = class extends Normalizer_default {
  /**
   * Create a new instance of Precompiled normalizer.
   * @param config The configuration object.
   */
  constructor(config) {
    super(config);
    this.charsmap = config.precompiled_charsmap ?? null;
  }
  /**
   * Normalizes the given text by applying the precompiled charsmap.
   * @param text The text to normalize.
   * @returns The normalized text.
   */
  normalize(text) {
    text = text.replace(
      /[\u0001-\u0008\u000B\u000E-\u001F\u007F\u008F\u009F]/gm,
      ""
    );
    text = text.replace(
      /[\u0009\u000A\u000C\u000D\u00A0\u1680\u2000-\u200F\u2028\u2029\u202F\u205F\u2581\u3000\uFEFF\uFFFD]/gm,
      " "
    );
    if (text.includes("～")) {
      const parts = text.split("～");
      text = parts.map((part) => part.normalize("NFKC")).join("～");
    } else {
      text = text.normalize("NFKC");
    }
    return text;
  }
};
var Precompiled_default = Precompiled;
var Sequence = class extends Normalizer_default {
  /**
   * Create a new instance of NormalizerSequence.
   * @param config The configuration object.
   */
  constructor(config) {
    super(config);
    this.normalizers = (config.normalizers ?? []).map(
      (x) => create_normalizer_default(x)
    );
  }
  /**
   * Apply a sequence of Normalizers to the input text.
   * @param text The text to normalize.
   * @returns The normalized text.
   */
  normalize(text) {
    return this.normalizers.reduce((t, normalizer) => {
      return normalizer ? normalizer.normalize(t) : t;
    }, text);
  }
};
var Sequence_default = Sequence;
var Replace = class extends Normalizer_default {
  /**
   * @param config The configuration object for the normalizer.
   */
  constructor(config) {
    super(config);
    this.pattern = create_pattern(this.config.pattern ?? {});
  }
  /**
   * Normalize the input text by replacing the pattern with the content.
   * @param text The input text to be normalized.
   * @returns The normalized text after replacing the pattern with the content.
   */
  normalize(text) {
    return this.pattern === null ? text : text.replaceAll(this.pattern, this.config.content ?? "");
  }
};
var Replace_default = Replace;
var UnicodeNormalizer = class extends Normalizer_default {
  constructor() {
    super(...arguments);
    this.form = "NFC";
  }
  /**
   * Normalize the input text by applying Unicode normalization.
   * @param text The input text to be normalized.
   * @returns The normalized text.
   */
  normalize(text) {
    text = text.normalize(this.form);
    return text;
  }
};
var UnicodeNormalizer_default = UnicodeNormalizer;
var NFC = class extends UnicodeNormalizer_default {
  constructor() {
    super(...arguments);
    this.form = "NFC";
  }
};
var NFC_default = NFC;
var NFD = class extends UnicodeNormalizer_default {
  constructor() {
    super(...arguments);
    this.form = "NFD";
  }
};
var NFD_default = NFD;
var NFKC = class extends UnicodeNormalizer_default {
  constructor() {
    super(...arguments);
    this.form = "NFKC";
  }
};
var NFKC_default = NFKC;
var NFKD = class extends UnicodeNormalizer_default {
  constructor() {
    super(...arguments);
    this.form = "NFKD";
  }
};
var NFKD_default = NFKD;
var Strip = class extends Normalizer_default {
  /**
   * Strip leading and/or trailing whitespace from the input text.
   * @param text The input text.
   * @returns The normalized text.
   */
  normalize(text) {
    if (this.config.strip_left && this.config.strip_right) {
      text = text.trim();
    } else {
      if (this.config.strip_left) {
        text = text.trimStart();
      }
      if (this.config.strip_right) {
        text = text.trimEnd();
      }
    }
    return text;
  }
};
var Strip_default = Strip;
var StripAccents = class extends Normalizer_default {
  /**
   * Remove all accents from the text.
   * @param text The input text.
   * @returns The normalized text without accents.
   */
  normalize(text) {
    return remove_accents(text);
  }
};
var StripAccents_default = StripAccents;
var Lowercase = class extends Normalizer_default {
  /**
   * Lowercases the input string.
   * @param {string} text The text to normalize.
   * @returns {string} The normalized text.
   */
  normalize(text) {
    return text.toLowerCase();
  }
};
var Lowercase_default = Lowercase;
var Prepend = class extends Normalizer_default {
  /**
   * Prepends the input string.
   * @param text The text to normalize.
   * @returns The normalized text.
   */
  normalize(text) {
    text = this.config.prepend + text;
    return text;
  }
};
var Prepend_default = Prepend;
function create_normalizer(config) {
  if (config === null) return null;
  switch (config.type) {
    case "BertNormalizer":
      return new BertNormalizer_default(config);
    case "Precompiled":
      return new Precompiled_default(config);
    case "Sequence":
      return new Sequence_default(config);
    case "Replace":
      return new Replace_default(config);
    case "NFC":
      return new NFC_default(config);
    case "NFD":
      return new NFD_default(config);
    case "NFKC":
      return new NFKC_default(config);
    case "NFKD":
      return new NFKD_default(config);
    case "Strip":
      return new Strip_default(config);
    case "StripAccents":
      return new StripAccents_default(config);
    case "Lowercase":
      return new Lowercase_default(config);
    case "Prepend":
      return new Prepend_default(config);
    default:
      throw new Error(`Unknown Normalizer type: ${config.type}`);
  }
}
var create_normalizer_default = create_normalizer;
var PreTokenizer = class extends Callable_default {
  /**
   * Tokenizes the given text into pre-tokens.
   * @param text The text or array of texts to pre-tokenize.
   * @param options Additional options for the pre-tokenization logic.
   * @returns An array of pre-tokens.
   */
  pre_tokenize(text, options) {
    return (Array.isArray(text) ? text.map((x) => this.pre_tokenize_text(x, options)) : this.pre_tokenize_text(text, options)).flat();
  }
  /**
   * Alias for {@link PreTokenizer#pre_tokenize}.
   * @param text The text or array of texts to pre-tokenize.
   * @param options Additional options for the pre-tokenization logic.
   * @returns An array of pre-tokens.
   */
  _call(text, options) {
    return this.pre_tokenize(text, options);
  }
};
var PreTokenizer_default = PreTokenizer;
var BYTES_TO_UNICODE = (() => {
  const bs2 = [
    ...Array.from(
      { length: "~".charCodeAt(0) - "!".charCodeAt(0) + 1 },
      (_, i) => i + "!".charCodeAt(0)
    ),
    ...Array.from(
      { length: "¬".charCodeAt(0) - "¡".charCodeAt(0) + 1 },
      (_, i) => i + "¡".charCodeAt(0)
    ),
    ...Array.from(
      { length: "ÿ".charCodeAt(0) - "®".charCodeAt(0) + 1 },
      (_, i) => i + "®".charCodeAt(0)
    )
  ];
  const cs2 = bs2.slice();
  let n = 0;
  for (let b = 0; b < 256; ++b) {
    if (!bs2.includes(b)) {
      bs2.push(b);
      cs2.push(256 + n);
      n += 1;
    }
  }
  const ccs = cs2.map((n2) => String.fromCharCode(n2));
  return Object.fromEntries(bs2.map((b, i) => [b, ccs[i]]));
})();
var reverse_dictionary = (data) => Object.fromEntries(Object.entries(data).map(([key, value]) => [value, key]));
var UNICODE_TO_BYTES = reverse_dictionary(BYTES_TO_UNICODE);
var PUNCTUATION_REGEX = "\\p{P}\\u0021-\\u002F\\u003A-\\u0040\\u005B-\\u0060\\u007B-\\u007E";
var ByteLevel = class extends PreTokenizer_default {
  /**
   * Creates a new instance of the `ByteLevelPreTokenizer` class.
   * @param config The configuration object.
   */
  constructor(config) {
    super();
    this.config = config;
    this.add_prefix_space = this.config.add_prefix_space ?? false;
    this.trim_offsets = this.config.trim_offsets ?? false;
    this.use_regex = this.config.use_regex ?? true;
    this.pattern = new RegExp("'s|'t|'re|'ve|'m|'ll|'d| ?\\p{L}+| ?\\p{N}+| ?[^\\s\\p{L}\\p{N}]+|\\s+(?!\\S)|\\s+", "gu");
    this.byte_encoder = BYTES_TO_UNICODE;
    this.text_encoder = new TextEncoder();
  }
  /**
   * Tokenizes a single piece of text using byte-level tokenization.
   * @param text The text to tokenize.
   * @param options Additional options for the pre-tokenization logic.
   * @returns An array of tokens.
   */
  pre_tokenize_text(text, options) {
    if (this.add_prefix_space && !text.startsWith(" ")) {
      text = " " + text;
    }
    const tokens = this.use_regex ? text.match(this.pattern) || [] : [text];
    return tokens.map(
      (token) => Array.from(
        this.text_encoder.encode(token),
        (byte) => this.byte_encoder[byte]
      ).join("")
    );
  }
};
var ByteLevel_default = ByteLevel;
var Whitespace = class extends PreTokenizer_default {
  /**
   * Pre-tokenizes the input text by splitting it on word boundaries.
   * @param text The text to be pre-tokenized.
   * @param options Additional options for the pre-tokenization logic.
   * @returns An array of tokens produced by splitting the input text on whitespace.
   */
  pre_tokenize_text(text, options) {
    return text.match(/\w+|[^\w\s]+/g) || [];
  }
};
var Whitespace_default = Whitespace;
var Metaspace = class extends PreTokenizer_default {
  /**
   * @param config The configuration object for the MetaspacePreTokenizer.
   */
  constructor(config) {
    super();
    this.replacement = config.replacement ?? "▁";
    this.str_rep = config.str_rep || this.replacement;
    this.prepend_scheme = config.prepend_scheme ?? "always";
  }
  /**
   * This method takes a string, replaces spaces with the replacement character,
   * adds a prefix space if requested, and returns a new list of tokens.
   * @param text The text to pre-tokenize.
   * @param options The options for the pre-tokenization.
   * @returns A new list of pre-tokenized tokens.
   */
  pre_tokenize_text(text, options) {
    const { section_index = void 0 } = options ?? {};
    let normalized = text.replaceAll(" ", this.str_rep);
    if (
      // We add a prefix space if:
      //  (1) The normalized token does not already start with the replacement character.
      !normalized.startsWith(this.replacement) && // and (2) either:
      //  (a) prepend_scheme is 'always'
      //  (b) prepend_scheme is 'first' and this is the first section
      (this.prepend_scheme === "always" || this.prepend_scheme === "first" && section_index === 0)
    ) {
      normalized = this.str_rep + normalized;
    }
    return [normalized];
  }
};
var Metaspace_default = Metaspace;
var Split = class extends PreTokenizer_default {
  /**
   * @param config The configuration options for the pre-tokenizer.
   */
  constructor(config) {
    super();
    this.config = config;
    this.pattern = create_pattern(
      this.config.pattern ?? {},
      this.config.invert ?? true
    );
  }
  /**
   * Tokenizes text by splitting it using the given pattern.
   * @param text The text to tokenize.
   * @returns An array of tokens.
   */
  pre_tokenize_text(text) {
    if (this.pattern === null) {
      return [];
    }
    if (this.config.invert) {
      return (text.match(this.pattern) || []).filter((x) => x);
    } else if (this.config.behavior?.toLowerCase() === "removed") {
      return text.split(this.pattern).filter((x) => x);
    } else {
      return regex_split(text, this.pattern);
    }
  }
};
var Split_default = Split;
var Punctuation = class extends PreTokenizer_default {
  /**
   * @param config The configuration options for the pre-tokenizer.
   */
  constructor(config) {
    super();
    this.config = config;
    this.pattern = new RegExp(
      `[^${PUNCTUATION_REGEX}]+|[${PUNCTUATION_REGEX}]+`,
      "gu"
    );
  }
  /**
   * Tokenizes text by splitting it using the given pattern.
   * @param text The text to tokenize.
   * @returns An array of tokens.
   */
  pre_tokenize_text(text) {
    return text.match(this.pattern) || [];
  }
};
var Punctuation_default = Punctuation;
var Digits = class extends PreTokenizer_default {
  /**
   * @param config The configuration options for the pre-tokenizer.
   */
  constructor(config) {
    super();
    this.config = config;
    const digit_pattern = `[^\\d]+|\\d${this.config.individual_digits ? "" : "+"}`;
    this.pattern = new RegExp(digit_pattern, "gu");
  }
  /**
   * Tokenizes text by splitting it using the given pattern.
   * @param text The text to tokenize.
   * @returns An array of tokens.
   */
  pre_tokenize_text(text) {
    return text.match(this.pattern) || [];
  }
};
var Digits_default = Digits;
var BertPreTokenizer = class extends PreTokenizer_default {
  /**
   * A PreTokenizer that splits text into wordpieces using a basic tokenization scheme
   * similar to that used in the original implementation of BERT.
   */
  constructor() {
    super();
    this.pattern = new RegExp(
      `[^\\s${PUNCTUATION_REGEX}]+|[${PUNCTUATION_REGEX}]`,
      "gu"
    );
  }
  /**
   * Tokenizes a single text using the BERT pre-tokenization scheme.
   *
   * @param text The text to tokenize.
   * @param options Additional options for the pre-tokenization logic.
   * @returns An array of tokens.
   */
  pre_tokenize_text(text, options) {
    return text.trim().match(this.pattern) || [];
  }
};
var BertPreTokenizer_default = BertPreTokenizer;
var Replace2 = class extends PreTokenizer_default {
  /**
   * @param config The configuration options for the pre-tokenizer.
   */
  constructor(config) {
    super();
    this.config = config;
    this.pattern = create_pattern(this.config.pattern ?? {});
    this.content = this.config.content ?? "";
  }
  /**
   * Pre-tokenizes the input text by replacing certain characters.
   * @param text The text to be pre-tokenized.
   * @returns An array of tokens produced by replacing certain characters.
   */
  pre_tokenize_text(text) {
    if (this.pattern === null) {
      return [text];
    }
    return [text.replaceAll(this.pattern, this.config.content ?? "")];
  }
};
var Replace_default2 = Replace2;
var Sequence2 = class extends PreTokenizer_default {
  /**
   * Creates an instance of PreTokenizerSequence.
   * @param config The configuration object for the pre-tokenizer sequence.
   */
  constructor(config) {
    super();
    this.tokenizers = (config.pretokenizers ?? []).map(
      (x) => create_pre_tokenizer_default(x)
    );
  }
  /**
   * Applies each pre-tokenizer in the sequence to the input text in turn.
   * @param text The text to pre-tokenize.
   * @param options Additional options for the pre-tokenization logic.
   * @returns The pre-tokenized text.
   */
  pre_tokenize_text(text, options) {
    return this.tokenizers.reduce(
      (pre_tokenized_text, tokenizer) => {
        return tokenizer ? tokenizer.pre_tokenize(pre_tokenized_text, options) : pre_tokenized_text;
      },
      [text]
    );
  }
};
var Sequence_default2 = Sequence2;
var WhitespaceSplit = class extends PreTokenizer_default {
  /**
   * Pre-tokenizes the input text by splitting it on whitespace characters.
   * @param text The text to be pre-tokenized.
   * @returns An array of tokens produced by splitting the input text on whitespace.
   */
  pre_tokenize_text(text) {
    return whitespace_split(text);
  }
};
var WhitespaceSplit_default = WhitespaceSplit;
var FixedLength = class extends PreTokenizer_default {
  /**
   * @param config The configuration options for the pre-tokenizer.
   */
  constructor(config) {
    super();
    this.config = config;
    this._length = config.length;
  }
  /**
   * Pre-tokenizes the input text by splitting it into fixed-length tokens.
   * @param text The text to be pre-tokenized.
   * @returns An array of tokens produced by splitting the input text into fixed-length tokens.
   */
  pre_tokenize_text(text) {
    const tokens = [];
    for (let i = 0; i < text.length; i += this._length) {
      tokens.push(text.slice(i, i + this._length));
    }
    return tokens;
  }
};
var FixedLength_default = FixedLength;
function create_pre_tokenizer(config) {
  if (config === null) return null;
  switch (config.type) {
    case "BertPreTokenizer":
      return new BertPreTokenizer_default();
    case "Sequence":
      return new Sequence_default2(config);
    case "Whitespace":
      return new Whitespace_default();
    case "WhitespaceSplit":
      return new WhitespaceSplit_default();
    case "Metaspace":
      return new Metaspace_default(config);
    case "ByteLevel":
      return new ByteLevel_default(config);
    case "Split":
      return new Split_default(config);
    case "Punctuation":
      return new Punctuation_default(config);
    case "Digits":
      return new Digits_default(config);
    case "Replace":
      return new Replace_default2(config);
    case "FixedLength":
      return new FixedLength_default(config);
    default:
      throw new Error(`Unknown PreTokenizer type: ${config.type}`);
  }
}
var create_pre_tokenizer_default = create_pre_tokenizer;
var TokenizerModel = class extends Callable_default {
  /**
   * Creates a new instance of TokenizerModel.
   * @param config The configuration object for the TokenizerModel.
   */
  constructor(config) {
    super();
    this.config = config;
    this.vocab = [];
    this.tokens_to_ids = /* @__PURE__ */ new Map();
    this.unk_token_id = void 0;
    this.unk_token = void 0;
    this.end_of_word_suffix = void 0;
    this.fuse_unk = this.config.fuse_unk ?? false;
  }
  /**
   * Internal function to call the TokenizerModel instance.
   * @param tokens The tokens to encode.
   * @returns The encoded tokens.
   */
  _call(tokens) {
    let result = this.encode(tokens);
    if (this.fuse_unk) {
      result = fuse_unk(result, this.tokens_to_ids, this.unk_token_id);
    }
    return result;
  }
};
var TokenizerModel_default = TokenizerModel;
var WordPieceTokenizer = class extends TokenizerModel_default {
  /**
   * @param config The configuration object.
   */
  constructor(config) {
    super(config);
    this.max_input_chars_per_word = 100;
    this.tokens_to_ids = object_to_map(config.vocab);
    this.unk_token_id = this.tokens_to_ids.get(config.unk_token);
    this.unk_token = config.unk_token;
    this.max_input_chars_per_word = config.max_input_chars_per_word ?? 100;
    this.vocab = new Array(this.tokens_to_ids.size);
    for (const [key, value] of this.tokens_to_ids) {
      this.vocab[value] = key;
    }
  }
  /**
   * Encodes an array of tokens using WordPiece encoding.
   * @param tokens The tokens to encode.
   * @returns An array of encoded tokens.
   */
  encode(tokens) {
    const output_tokens = [];
    for (const token of tokens) {
      const chars = [...token];
      if (chars.length > this.max_input_chars_per_word) {
        output_tokens.push(this.unk_token);
        continue;
      }
      let is_unknown = false;
      let start = 0;
      const sub_tokens = [];
      while (start < chars.length) {
        let end = chars.length;
        let current_substring = null;
        while (start < end) {
          let substr = chars.slice(start, end).join("");
          if (start > 0) {
            substr = this.config.continuing_subword_prefix + substr;
          }
          if (this.tokens_to_ids.has(substr)) {
            current_substring = substr;
            break;
          }
          --end;
        }
        if (current_substring === null) {
          is_unknown = true;
          break;
        }
        sub_tokens.push(current_substring);
        start = end;
      }
      if (is_unknown) {
        output_tokens.push(this.unk_token);
      } else {
        output_tokens.push(...sub_tokens);
      }
    }
    return output_tokens;
  }
};
var WordPiece_default = WordPieceTokenizer;
var CharTrieNode = class _CharTrieNode {
  /**
   * Create a new CharTrieNode.
   * @param is_leaf Whether the node is a leaf node or not.
   * @param children A map containing the node's children, where the key is a character and the value is a `CharTrieNode`.
   */
  constructor(is_leaf, children) {
    this.is_leaf = is_leaf;
    this.children = children;
  }
  /**
   * Returns a new `CharTrieNode` instance with default values.
   * @returns A new `CharTrieNode` instance with `is_leaf` set to `false` and an empty `children` map.
   */
  static default() {
    return new _CharTrieNode(false, /* @__PURE__ */ new Map());
  }
};
var CharTrie = class {
  constructor() {
    this.root = CharTrieNode.default();
  }
  /**
   * Adds one or more `texts` to the trie.
   * @param texts The strings to add to the trie.
   */
  extend(texts) {
    for (const text of texts) {
      this.push(text);
    }
  }
  /**
   * Adds text to the trie.
   * @param text The string to add to the trie.
   */
  push(text) {
    let node = this.root;
    for (const ch of text) {
      let child = node.children.get(ch);
      if (child === void 0) {
        child = CharTrieNode.default();
        node.children.set(ch, child);
      }
      node = child;
    }
    node.is_leaf = true;
  }
  /**
   * Searches the trie for stored strings that match `chars` starting at `start`.
   * @param chars The input characters to search.
   * @param start The index to start searching from.
   * @yields Each stored string that is a prefix of `chars` starting at `start`.
   */
  *common_prefix_search(chars, start = 0) {
    let node = this.root;
    if (node === void 0) return;
    let prefix = "";
    for (let i = start; i < chars.length; ++i) {
      const ch = chars[i];
      prefix += ch;
      node = node.children.get(ch);
      if (node === void 0) return;
      if (node.is_leaf) {
        yield prefix;
      }
    }
  }
};
var CharTrie_default = CharTrie;
var TokenLatticeNode = class _TokenLatticeNode {
  /**
   * Represents a node in a token lattice for a given sentence.
   * @param token_id The ID of the token associated with this node.
   * @param node_id The ID of this node.
   * @param pos The starting position of the token in the sentence.
   * @param length The length of the token.
   * @param score The score associated with the token.
   */
  constructor(token_id, node_id, pos, length, score) {
    this.token_id = token_id;
    this.node_id = node_id;
    this.pos = pos;
    this.length = length;
    this.score = score;
    this.prev = null;
    this.backtrace_score = 0;
  }
  /**
   * Returns a clone of this node.
   * @returns A clone of this node.
   */
  clone() {
    const n = new _TokenLatticeNode(
      this.token_id,
      this.node_id,
      this.pos,
      this.length,
      this.score
    );
    n.prev = this.prev;
    n.backtrace_score = this.backtrace_score;
    return n;
  }
};
var TokenLattice = class {
  /**
   * Creates a new TokenLattice instance.
   *
   * @param sentence The input sentence to be tokenized.
   * @param bos_token_id The beginning-of-sequence token ID.
   * @param eos_token_id The end-of-sequence token ID.
   */
  constructor(sentence, bos_token_id, eos_token_id) {
    this.chars = Array.from(sentence);
    this.len = this.chars.length;
    this.bos_token_id = bos_token_id;
    this.eos_token_id = eos_token_id;
    this.nodes = [];
    this.begin_nodes = Array.from(
      { length: this.len + 1 },
      () => []
    );
    this.end_nodes = Array.from({ length: this.len + 1 }, () => []);
    const bos = new TokenLatticeNode(this.bos_token_id ?? 0, 0, 0, 0, 0);
    const eos = new TokenLatticeNode(
      this.eos_token_id ?? 0,
      1,
      this.len,
      0,
      0
    );
    this.nodes.push(bos.clone());
    this.nodes.push(eos.clone());
    this.begin_nodes[this.len].push(eos);
    this.end_nodes[0].push(bos);
  }
  /**
   * Inserts a new token node into the token lattice.
   *
   * @param pos The starting position of the token.
   * @param length The length of the token.
   * @param score The score of the token.
   * @param token_id The token ID of the token.
   */
  insert(pos, length, score, token_id) {
    const node_id = this.nodes.length;
    const node = new TokenLatticeNode(token_id, node_id, pos, length, score);
    this.begin_nodes[pos].push(node);
    this.end_nodes[pos + length].push(node);
    this.nodes.push(node);
  }
  /**
   * Implements the Viterbi algorithm to compute the most likely sequence of tokens.
   *
   * @returns The most likely sequence of tokens.
   */
  viterbi() {
    const len2 = this.len;
    let pos = 0;
    while (pos <= len2) {
      if (this.begin_nodes[pos].length == 0) {
        return [];
      }
      for (let rnode of this.begin_nodes[pos]) {
        rnode.prev = null;
        let best_score = 0;
        let best_node = null;
        for (let lnode of this.end_nodes[pos]) {
          const score = lnode.backtrace_score + rnode.score;
          if (best_node === null || score > best_score) {
            best_node = lnode.clone();
            best_score = score;
          }
        }
        if (best_node !== null) {
          rnode.prev = best_node;
          rnode.backtrace_score = best_score;
        } else {
          return [];
        }
      }
      ++pos;
    }
    const results = [];
    const root = this.begin_nodes[len2][0];
    const prev = root.prev;
    if (prev === null) {
      return [];
    }
    let node = prev.clone();
    while (node.prev !== null) {
      results.push(node.clone());
      const n = node.clone();
      node = n.prev.clone();
    }
    results.reverse();
    return results;
  }
  /**
   * Get the text piece for a given node.
   * @param node The node to get the piece for.
   * @returns The array of nodes representing the most likely sequence of tokens.
   */
  piece(node) {
    return this.chars.slice(node.pos, node.pos + node.length).join("");
  }
  /**
   * @returns The most likely sequence of tokens.
   */
  tokens() {
    const nodes = this.viterbi();
    return nodes.map((x) => this.piece(x));
  }
  /**
   * @returns The most likely sequence of token ids.
   */
  token_ids() {
    const nodes = this.viterbi();
    return nodes.map((x) => x.token_id);
  }
};
var TokenLattice_default = TokenLattice;
function min(arr) {
  if (arr.length === 0) throw new Error("Array must not be empty");
  let min_value = arr[0];
  let index_of_min = 0;
  for (let i = 1; i < arr.length; ++i) {
    if (arr[i] < min_value) {
      min_value = arr[i];
      index_of_min = i;
    }
  }
  return [min_value, index_of_min];
}
var Unigram = class extends TokenizerModel_default {
  /**
   * Create a new Unigram tokenizer model.
   * @param config The configuration object for the Unigram model.
   * @param eos_token
   */
  constructor(config, eos_token) {
    super(config);
    const vocab_size = config.vocab.length;
    this.vocab = new Array(vocab_size);
    this.scores = new Array(vocab_size);
    for (let i = 0; i < vocab_size; ++i) {
      [this.vocab[i], this.scores[i]] = config.vocab[i];
    }
    this.unk_token_id = config.unk_id;
    this.unk_token = this.vocab[config.unk_id];
    this.tokens_to_ids = new Map(this.vocab.map((x, i) => [x, i]));
    this.bos_token = " ";
    this.bos_token_id = this.tokens_to_ids.get(this.bos_token);
    this.eos_token = eos_token;
    this.eos_token_id = this.tokens_to_ids.get(this.eos_token);
    this.unk_token = this.vocab[this.unk_token_id];
    this.min_score = min(this.scores)[0];
    this.unk_score = this.min_score - 10;
    this.scores[this.unk_token_id] = this.unk_score;
    this.trie = new CharTrie_default();
    this.trie.extend(this.vocab);
    this.fuse_unk = true;
  }
  /**
   * Populates lattice nodes.
   * @param lattice The token lattice to populate with nodes.
   */
  populate_nodes(lattice) {
    const chars = lattice.chars;
    const mblen = 1;
    let begin_pos = 0;
    while (begin_pos < chars.length) {
      let has_single_node = false;
      const prefixed_tokens = this.trie.common_prefix_search(chars, begin_pos);
      for (const token of prefixed_tokens) {
        const token_id = this.tokens_to_ids.get(token);
        const token_score = this.scores[token_id];
        const n = len(token);
        lattice.insert(begin_pos, n, token_score, token_id);
        if (!has_single_node && n === mblen) {
          has_single_node = true;
        }
      }
      if (!has_single_node) {
        lattice.insert(begin_pos, mblen, this.unk_score, this.unk_token_id);
      }
      begin_pos += mblen;
    }
  }
  /**
   * Encodes an array of tokens into an array of subtokens using the unigram model.
   *
   * @param normalized The normalized string.
   * @returns An array of subtokens obtained by encoding the input tokens using the unigram model.
   */
  tokenize(normalized) {
    const lattice = new TokenLattice_default(
      normalized,
      this.bos_token_id,
      this.eos_token_id
    );
    this.populate_nodes(lattice);
    return lattice.tokens();
  }
  /**
   * Encodes an array of tokens using Unigram encoding.
   * @param tokens The tokens to encode.
   * @returns An array of encoded tokens.
   */
  encode(tokens) {
    const to_return = [];
    for (const token of tokens) {
      const tokenized = this.tokenize(token);
      to_return.push(...tokenized);
    }
    return to_return;
  }
};
var Unigram_default = Unigram;
var PriorityQueue = class {
  /**
   * Create a new PriorityQueue.
   * @param comparator Comparator function to determine priority. Defaults to a MaxHeap.
   * @param max_size Maximum size of the queue. Defaults to Infinity.
   */
  constructor(comparator = (a, b) => a > b, max_size = Infinity) {
    this._heap = [];
    this._comparator = comparator;
    this._max_size = max_size;
  }
  /**
   * The size of the queue
   */
  get size() {
    return this._heap.length;
  }
  /**
   * Check if the queue is empty.
   * @returns `true` if the queue is empty, `false` otherwise.
   */
  is_empty() {
    return this.size === 0;
  }
  /**
   * Return the element with the highest priority in the queue.
   * @returns The highest priority element in the queue.
   */
  peek() {
    return this._heap[0];
  }
  /**
   * Add one or more elements to the queue.
   * @param values The values to push into the queue.
   * @returns The new size of the queue.
   */
  push(...values) {
    return this.extend(values);
  }
  /**
   * Add multiple elements to the queue.
   * @param values The values to push into the queue.
   * @returns The new size of the queue.
   */
  extend(values) {
    for (const value of values) {
      if (this.size < this._max_size) {
        this._heap.push(value);
        this._sift_up();
      } else {
        const smallest = this._smallest();
        if (this._comparator(value, this._heap[smallest])) {
          this._heap[smallest] = value;
          this._sift_up_from(smallest);
        }
      }
    }
    return this.size;
  }
  /**
   * Remove and return the element with the highest priority in the queue.
   * @returns The element with the highest priority in the queue.
   */
  pop() {
    const popped_value = this.peek();
    const bottom = this.size - 1;
    if (bottom > 0) {
      this._swap(0, bottom);
    }
    this._heap.pop();
    this._sift_down();
    return popped_value;
  }
  /**
   * Replace the element with the highest priority in the queue with a new value.
   * @param value The new value.
   * @returns The replaced value.
   */
  replace(value) {
    const replaced_value = this.peek();
    this._heap[0] = value;
    this._sift_down();
    return replaced_value;
  }
  /**
   * Compute the index for the parent of the node at index `i`.
   * @param i The index of the node to get the parent of.
   * @returns The index of the parent node.
   * @private
   */
  _parent(i) {
    return (i + 1 >>> 1) - 1;
  }
  /**
   * Compute the index for the left child of the node at index `i`.
   * @param i The index of the node to get the left child of.
   * @returns The index of the left child.
   * @private
   */
  _left(i) {
    return (i << 1) + 1;
  }
  /**
   * Compute the index for the right child of the node at index `i`.
   * @param i The index of the node to get the right child of.
   * @returns The index of the right child.
   * @private
   */
  _right(i) {
    return i + 1 << 1;
  }
  /**
   * Check if the element at index `i` is greater than the element at index `j`.
   * @param i The index of the first element to compare.
   * @param j The index of the second element to compare.
   * @returns `true` if the element at index `i` is greater than the element at index `j`, `false` otherwise.
   * @private
   */
  _greater(i, j) {
    return this._comparator(this._heap[i], this._heap[j]);
  }
  /**
   * Swap the elements at indices `i` and `j`.
   * @param i The index of the first element to swap.
   * @param j The index of the second element to swap.
   * @private
   */
  _swap(i, j) {
    const temp = this._heap[i];
    this._heap[i] = this._heap[j];
    this._heap[j] = temp;
  }
  /**
   * Maintain the heap property by updating positions in the heap,
   * starting at the last element and moving up the heap.
   * @private
   */
  _sift_up() {
    this._sift_up_from(this.size - 1);
  }
  /**
   * Helper function to sift up from a given node.
   * @param node The index of the node to start sifting up from.
   */
  _sift_up_from(node) {
    while (node > 0 && this._greater(node, this._parent(node))) {
      this._swap(node, this._parent(node));
      node = this._parent(node);
    }
  }
  /**
   * Maintain the heap property by updating positions in the heap,
   * starting at the first element and moving down the heap.
   * @private
   */
  _sift_down() {
    let node = 0;
    while (this._left(node) < this.size && this._greater(this._left(node), node) || this._right(node) < this.size && this._greater(this._right(node), node)) {
      const max_child = this._right(node) < this.size && this._greater(this._right(node), this._left(node)) ? this._right(node) : this._left(node);
      this._swap(node, max_child);
      node = max_child;
    }
  }
  /**
   * Get the index of the smallest element in the heap. Since we use an array-based heap,
   * the index can be computed without needing to traverse the heap.
   * @private
   */
  _smallest() {
    return 2 ** Math.floor(Math.log2(this.size)) - 1;
  }
};
var PriorityQueue_default = PriorityQueue;
var LRUCache2 = class {
  /**
   * Creates an LRUCache instance.
   * @param capacity The maximum number of items the cache can hold.
   */
  constructor(capacity) {
    this.capacity = capacity;
    this.cache = /* @__PURE__ */ new Map();
  }
  /**
   * Retrieves the value associated with the given key and marks the key as recently used.
   * @param key The key to retrieve.
   * @returns The value associated with the key, or undefined if the key does not exist.
   */
  get(key) {
    if (!this.cache.has(key)) return void 0;
    const value = this.cache.get(key);
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }
  /**
   * Inserts or updates the key-value pair in the cache.
   * If the key already exists, it is updated and marked as recently used.
   * If the cache exceeds its capacity, the least recently used item is evicted.
   * @param key The key to add or update.
   * @param value The value to associate with the key.
   */
  put(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    this.cache.set(key, value);
    if (this.cache.size > this.capacity) {
      this.cache.delete(this.cache.keys().next().value);
    }
  }
  /**
   * Clears the cache.
   */
  clear() {
    this.cache.clear();
  }
};
var LRUCache_default = LRUCache2;
var BPE = class extends TokenizerModel_default {
  /**
   * Create a BPE instance.
   * @param config The configuration object for BPE.
   */
  constructor(config) {
    super(config);
    this.tokens_to_ids = object_to_map(config.vocab);
    this.unk_token_id = this.tokens_to_ids.get(config.unk_token);
    this.unk_token = config.unk_token;
    this.vocab = new Array(this.tokens_to_ids.size);
    for (const [key, value] of this.tokens_to_ids) {
      this.vocab[value] = key;
    }
    const use_new_merge_format = Array.isArray(config.merges[0]);
    this.merges = use_new_merge_format ? config.merges : config.merges.map(
      (x) => x.split(" ", 2)
    );
    this.bpe_ranks = new Map(this.merges.map((x, i) => [JSON.stringify(x), i]));
    this.end_of_word_suffix = config.end_of_word_suffix;
    this.continuing_subword_suffix = config.continuing_subword_suffix ?? null;
    this.byte_fallback = this.config.byte_fallback ?? false;
    if (this.byte_fallback) {
      this.text_encoder = new TextEncoder();
    }
    this.ignore_merges = this.config.ignore_merges ?? false;
    this.max_length_to_cache = 256;
    this.cache_capacity = 1e4;
    this.cache = new LRUCache_default(this.cache_capacity);
  }
  /**
   * Clears the cache.
   */
  clear_cache() {
    this.cache.clear();
  }
  /**
   * Apply Byte-Pair-Encoding (BPE) to a given token. Efficient heap-based priority
   * queue implementation adapted from https://github.com/belladoreai/llama-tokenizer-js.
   * @param token The token to encode.
   * @returns The BPE encoded tokens.
   */
  bpe(token) {
    if (token.length === 0) {
      return [];
    }
    const cached = this.cache.get(token);
    if (cached !== void 0) {
      return cached;
    }
    const word = Array.from(token);
    if (this.end_of_word_suffix) {
      word[word.length - 1] += this.end_of_word_suffix;
    }
    let result = [];
    if (word.length > 1) {
      const queue = new PriorityQueue_default((a, b) => a.score < b.score);
      let starting_node = {
        token: word[0],
        bias: 0,
        prev: null,
        next: null
      };
      let previous_node = starting_node;
      for (let i = 1; i < word.length; ++i) {
        const current_node = {
          bias: i / word.length,
          // Add fractional component to break ties
          token: word[i],
          prev: previous_node,
          next: null
        };
        previous_node.next = current_node;
        this.add_node(queue, previous_node);
        previous_node = current_node;
      }
      while (!queue.is_empty()) {
        const node = queue.pop();
        if (node.deleted || !node.next || node.next.deleted) continue;
        node.deleted = true;
        node.next.deleted = true;
        if (node.prev) {
          const new_previous_node = { ...node.prev };
          node.prev.deleted = true;
          node.prev = new_previous_node;
          if (new_previous_node.prev) {
            new_previous_node.prev.next = new_previous_node;
          } else {
            starting_node = new_previous_node;
          }
        }
        const merged = {
          token: node.token + node.next.token,
          bias: node.bias,
          prev: node.prev,
          next: node.next.next
        };
        if (merged.prev) {
          merged.prev.next = merged;
          this.add_node(queue, merged.prev);
        } else {
          starting_node = merged;
        }
        if (merged.next) {
          merged.next.prev = merged;
          this.add_node(queue, merged);
        }
      }
      for (let current_node = starting_node; current_node !== null; current_node = current_node.next) {
        result.push(current_node.token);
      }
    } else {
      result = word;
    }
    if (this.continuing_subword_suffix) {
      for (let i = 0; i < result.length - 1; ++i) {
        result[i] += this.continuing_subword_suffix;
      }
    }
    if (token.length < this.max_length_to_cache) {
      this.cache.put(token, result);
    }
    return result;
  }
  /**
   * Helper function to add a node to the priority queue.
   * @param queue
   * @param node
   */
  add_node(queue, node) {
    const rank = this.bpe_ranks.get(
      JSON.stringify([node.token, node.next.token])
    );
    if (rank !== void 0) {
      node.score = rank + node.bias;
      queue.push(node);
    }
  }
  /**
   * Encodes the input sequence of tokens using the BPE algorithm and returns the resulting subword tokens.
   * @param tokens The input sequence of tokens to encode.
   * @returns The resulting subword tokens after applying the BPE algorithm to the input sequence of tokens.
   */
  encode(tokens) {
    const output_tokens = [];
    for (const token of tokens) {
      if (this.ignore_merges && this.tokens_to_ids.has(token)) {
        output_tokens.push(token);
        continue;
      }
      const bpe_token_list = this.bpe(token);
      for (const t of bpe_token_list) {
        if (this.tokens_to_ids.has(t)) {
          output_tokens.push(t);
        } else if (this.byte_fallback) {
          const byte_tokens = Array.from(this.text_encoder.encode(t)).map(
            (x) => `<0x${x.toString(16).toUpperCase().padStart(2, "0")}>`
          );
          if (byte_tokens.every((x) => this.tokens_to_ids.has(x))) {
            output_tokens.push(...byte_tokens);
          } else if (this.unk_token != null) {
            output_tokens.push(this.unk_token);
          }
        } else if (this.unk_token != null) {
          output_tokens.push(this.unk_token);
        }
      }
    }
    return output_tokens;
  }
};
var BPE_default = BPE;
var Legacy = class extends TokenizerModel_default {
  /**
   * Create a Legacy tokenizer model instance.
   * @param config The configuration object for Legacy tokenizer model.
   * @param more_config Additional configuration object for the Legacy tokenizer model.
   */
  constructor(config, more_config) {
    super(config);
    const vocab = config.vocab;
    this.tokens_to_ids = object_to_map(
      more_config.target_lang ? vocab[more_config.target_lang] : vocab
    );
    this.bos_token = more_config.bos_token;
    this.bos_token_id = this.tokens_to_ids.get(this.bos_token);
    this.eos_token = more_config.eos_token;
    this.eos_token_id = this.tokens_to_ids.get(this.eos_token);
    this.pad_token = more_config.pad_token;
    this.pad_token_id = this.tokens_to_ids.get(this.pad_token);
    this.unk_token = more_config.unk_token;
    this.unk_token_id = this.tokens_to_ids.get(this.unk_token);
    this.vocab = new Array(this.tokens_to_ids.size);
    for (const [key, value] of this.tokens_to_ids) {
      this.vocab[value] = key;
    }
  }
  encode(tokens) {
    return tokens;
  }
};
var Legacy_default = Legacy;
function create_tokenizer_model(model_config, config) {
  switch (model_config.type) {
    case "WordPiece":
      return new WordPiece_default(model_config);
    case "Unigram":
      return new Unigram_default(model_config, config.eos_token);
    case "BPE":
      return new BPE_default(model_config);
    default:
      if (model_config.vocab) {
        if (Array.isArray(model_config.vocab)) {
          return new Unigram_default(model_config, config.eos_token);
        } else if (Object.hasOwn(model_config, "continuing_subword_prefix") && Object.hasOwn(model_config, "unk_token")) {
          if (Object.hasOwn(model_config, "merges")) {
            return new BPE_default(model_config);
          } else {
            return new WordPiece_default(model_config);
          }
        } else {
          return new Legacy_default(model_config, {
            target_lang: config.target_lang,
            bos_token: config.bos_token,
            eos_token: config.eos_token,
            pad_token: config.pad_token,
            unk_token: config.unk_token
          });
        }
      }
      throw new Error(
        `Unknown TokenizerModel type: ${model_config?.type}`
      );
  }
}
var create_tokenizer_model_default = create_tokenizer_model;
var PostProcessor = class extends Callable_default {
  /**
   * @param config The configuration for the post-processor.
   */
  constructor(config) {
    super();
    this.config = config;
  }
  /**
   * Alias for {@link PostProcessor#post_process}.
   * @param tokens The text or array of texts to post-process.
   * @param args Additional arguments required by the post-processing logic.
   * @returns The post-processed tokens.
   */
  _call(tokens, ...args) {
    return this.post_process(tokens, ...args);
  }
};
var PostProcessor_default = PostProcessor;
var TemplateProcessing = class extends PostProcessor_default {
  /**
   * Replaces special tokens in the template with actual tokens.
   * @param tokens The list of tokens for the first sequence.
   * @param tokens_pair The list of tokens for the second sequence (optional).
   * @param add_special_tokens Whether to add the special tokens to the beginning and end of the input.
   * @returns An object containing the list of tokens with the special tokens replaced with actual tokens.
   */
  post_process(tokens, tokens_pair = null, add_special_tokens = true) {
    const type = tokens_pair === null ? this.config.single : this.config.pair;
    let processed_tokens = [];
    let types = [];
    for (const item of type) {
      if ("SpecialToken" in item) {
        if (add_special_tokens) {
          processed_tokens.push(item.SpecialToken.id);
          types.push(item.SpecialToken.type_id);
        }
      } else if ("Sequence" in item) {
        if (item.Sequence.id === "A") {
          processed_tokens = merge_arrays(processed_tokens, tokens);
          types = merge_arrays(
            types,
            new Array(tokens.length).fill(item.Sequence.type_id)
          );
        } else if (item.Sequence.id === "B") {
          processed_tokens = merge_arrays(processed_tokens, tokens_pair);
          types = merge_arrays(
            types,
            new Array(tokens_pair.length).fill(item.Sequence.type_id)
          );
        }
      }
    }
    return { tokens: processed_tokens, token_type_ids: types };
  }
};
var TemplateProcessing_default = TemplateProcessing;
var ByteLevel2 = class extends PostProcessor_default {
  /**
   * Post process the given tokens.
   * @param tokens The list of tokens for the first sequence.
   * @param tokens_pair The list of tokens for the second sequence (optional).
   * @returns An object containing the post-processed tokens.
   */
  post_process(tokens, tokens_pair = null) {
    return { tokens, tokens_pair };
  }
};
var ByteLevel_default2 = ByteLevel2;
var BertProcessing = class extends PostProcessor_default {
  /**
   * @param config The configuration for the post-processor.
   * @param config.cls The special tokens to add to the beginning of the input.
   * @param config.sep The special tokens to add to the end of the input.
   */
  constructor(config) {
    super(config);
    this.sep = config.sep;
    this.cls = config.cls;
  }
  /**
   * Adds the special tokens to the beginning and end of the input.
   * @param tokens The input tokens.
   * @param tokens_pair An optional second set of input tokens.
   * @param add_special_tokens Whether to add the special tokens to the beginning and end of the input.
   * @returns The post-processed tokens with the special tokens added to the beginning and end.
   */
  post_process(tokens, tokens_pair = null, add_special_tokens = true) {
    if (add_special_tokens) {
      tokens = merge_arrays([this.cls[0]], tokens, [this.sep[0]]);
    }
    let token_type_ids = new Array(tokens.length).fill(0);
    if (tokens_pair) {
      const middle = [];
      const after = add_special_tokens ? [this.sep[0]] : [];
      tokens = merge_arrays(tokens, middle, tokens_pair, after);
      token_type_ids = merge_arrays(
        token_type_ids,
        new Array(tokens_pair.length + middle.length + after.length).fill(1)
      );
    }
    return { tokens, token_type_ids };
  }
};
var BertProcessing_default = BertProcessing;
var RobertaProcessing = class extends PostProcessor_default {
  /**
   * @param config The configuration for the post-processor.
   * @param config.cls The special tokens to add to the beginning of the input.
   * @param config.sep The special tokens to add to the end of the input.
   */
  constructor(config) {
    super(config);
    this.sep = config.sep;
    this.cls = config.cls;
  }
  /**
   * Adds the special tokens to the beginning and end of the input.
   * @param tokens The input tokens.
   * @param tokens_pair An optional second set of input tokens.
   * @param add_special_tokens Whether to add the special tokens to the beginning and end of the input.
   * @returns The post-processed tokens with the special tokens added to the beginning and end.
   */
  post_process(tokens, tokens_pair, add_special_tokens = true) {
    if (add_special_tokens) {
      tokens = merge_arrays([this.cls[0]], tokens, [this.sep[0]]);
    }
    let token_type_ids = new Array(tokens.length).fill(0);
    if (tokens_pair) {
      const middle = add_special_tokens ? [this.sep[0]] : [];
      const after = add_special_tokens ? [this.sep[0]] : [];
      tokens = merge_arrays(tokens, middle, tokens_pair, after);
      token_type_ids = merge_arrays(
        token_type_ids,
        new Array(tokens_pair.length + middle.length + after.length).fill(1)
      );
    }
    return { tokens, token_type_ids };
  }
};
var RobertaProcessing_default = RobertaProcessing;
var Sequence3 = class extends PostProcessor_default {
  /**
   * Creates a new instance of Sequence post-processor.
   * @param config The configuration object.
   */
  constructor(config) {
    super(config);
    this.processors = (config.processors ?? []).map((x) => create_post_processor_default(x));
  }
  /**
   * Post process the given tokens.
   * @param tokens The list of tokens for the first sequence.
   * @param tokens_pair The list of tokens for the second sequence (optional).
   * @param add_special_tokens Whether to add the special tokens to the beginning and end of the input.
   * @returns An object containing the post-processed tokens.
   */
  post_process(tokens, tokens_pair = null, add_special_tokens = true) {
    let processed_tokens = { tokens, tokens_pair };
    for (const processor of this.processors) {
      processed_tokens = processor.post_process(
        processed_tokens.tokens,
        processed_tokens.tokens_pair,
        add_special_tokens
      );
    }
    return processed_tokens;
  }
};
var Sequence_default3 = Sequence3;
function create_post_processor(config) {
  if (config === null) return null;
  switch (config.type) {
    case "TemplateProcessing":
      return new TemplateProcessing_default(config);
    case "ByteLevel":
      return new ByteLevel_default2(config);
    case "BertProcessing":
      return new BertProcessing_default(config);
    case "RobertaProcessing":
      return new RobertaProcessing_default(config);
    case "Sequence":
      return new Sequence_default3(config);
    default:
      throw new Error(`Unknown PostProcessor type: ${config.type}`);
  }
}
var create_post_processor_default = create_post_processor;
var Decoder = class extends Callable_default {
  /**
   * Creates an instance of `Decoder`.
   * @param config The configuration object.
   **/
  constructor(config) {
    super();
    this.config = config;
    this.added_tokens = [];
    this.end_of_word_suffix = null;
    this.trim_offsets = "trim_offsets" in config ? config.trim_offsets : false;
  }
  /**
   * Calls the `decode` method.
   *
   * @param tokens The list of tokens.
   * @returns The decoded string.
   */
  _call(tokens) {
    return this.decode(tokens);
  }
  /**
   * Decodes a list of tokens.
   * @param tokens The list of tokens.
   * @returns The decoded string.
   */
  decode(tokens) {
    return this.decode_chain(tokens).join("");
  }
};
var Decoder_default = Decoder;
var ByteLevel3 = class extends Decoder_default {
  /**
   * Create a `ByteLevelDecoder` object.
   */
  constructor(config) {
    super(config);
    this.byte_decoder = UNICODE_TO_BYTES;
    this.text_decoder = new TextDecoder("utf-8", {
      fatal: false,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      ignoreBOM: true
    });
    this.end_of_word_suffix = null;
  }
  /**
   * Convert an array of tokens to string by decoding each byte.
   * @param tokens Array of tokens to be decoded.
   * @returns The decoded string.
   */
  convert_tokens_to_string(tokens) {
    const text = tokens.join("");
    const byte_array = new Uint8Array(
      [...text].map((c) => this.byte_decoder[c])
    );
    return this.text_decoder.decode(byte_array);
  }
  decode_chain(tokens) {
    const sub_texts = [];
    let current_sub_text = [];
    for (const token of tokens) {
      if (this.added_tokens.find((x) => x.content === token) !== void 0) {
        if (current_sub_text.length > 0) {
          sub_texts.push(this.convert_tokens_to_string(current_sub_text));
          current_sub_text = [];
        }
        sub_texts.push(token);
      } else {
        current_sub_text.push(token);
      }
    }
    if (current_sub_text.length > 0) {
      sub_texts.push(this.convert_tokens_to_string(current_sub_text));
    }
    return sub_texts;
  }
};
var ByteLevel_default3 = ByteLevel3;
var WordPiece = class extends Decoder_default {
  /**
   * Creates a new instance of WordPieceDecoder.
   * @param config The configuration object.
   */
  constructor(config) {
    super(config);
    this.cleanup = config.cleanup;
  }
  decode_chain(tokens) {
    return tokens.map((token, i) => {
      if (i !== 0) {
        const prefix = this.config.prefix;
        if (prefix && token.startsWith(prefix)) {
          token = token.replace(prefix, "");
        } else {
          token = " " + token;
        }
      }
      if (this.cleanup) {
        token = clean_up_tokenization(token);
      }
      return token;
    });
  }
};
var WordPiece_default2 = WordPiece;
var Metaspace2 = class extends Decoder_default {
  /**
   * Constructs a new MetaspaceDecoder object.
   * @param config The configuration object for the MetaspaceDecoder.
   */
  constructor(config) {
    super(config);
    this.replacement = config.replacement ?? "▁";
  }
  decode_chain(tokens) {
    const result = [];
    for (let i = 0; i < tokens.length; ++i) {
      let normalized = tokens[i].replaceAll(this.replacement, " ");
      if (i == 0 && normalized.startsWith(" ")) {
        normalized = normalized.substring(1);
      }
      result.push(normalized);
    }
    return result;
  }
};
var Metaspace_default2 = Metaspace2;
var BPE2 = class extends Decoder_default {
  constructor(config) {
    super(config);
    this.suffix = config.suffix ?? "";
  }
  decode_chain(tokens) {
    return tokens.map((token, i) => {
      return token.replaceAll(this.suffix, i === tokens.length - 1 ? "" : " ");
    });
  }
};
var BPE_default2 = BPE2;
var CTC = class extends Decoder_default {
  constructor(config) {
    super(config);
    this.pad_token = config.pad_token ?? "";
    this.word_delimiter_token = config.word_delimiter_token ?? "";
    this.cleanup = config.cleanup;
  }
  /**
   * Converts a connectionist-temporal-classification (CTC) output tokens into a single string.
   * @param tokens Array of tokens to be decoded.
   * @returns The decoded string.
   */
  convert_tokens_to_string(tokens) {
    if (tokens.length === 0) return "";
    const grouped_tokens = [tokens[0]];
    for (let i = 1; i < tokens.length; ++i) {
      if (tokens[i] !== grouped_tokens.at(-1)) {
        grouped_tokens.push(tokens[i]);
      }
    }
    const filtered_tokens = grouped_tokens.filter(
      (token) => token !== this.pad_token
    );
    let text = filtered_tokens.join("");
    if (this.cleanup) {
      text = clean_up_tokenization(text).replaceAll(this.word_delimiter_token, " ").trim();
    }
    return text;
  }
  decode_chain(tokens) {
    return [this.convert_tokens_to_string(tokens)];
  }
};
var CTC_default = CTC;
var Sequence4 = class extends Decoder_default {
  /**
   * Creates a new instance of DecoderSequence.
   * @param config The configuration object.
   */
  constructor(config) {
    super(config);
    this.decoders = (config.decoders ?? []).map((x) => create_decoder_default(x));
  }
  decode_chain(tokens) {
    return this.decoders.reduce((toks, decoder) => {
      return decoder.decode_chain(toks);
    }, tokens);
  }
};
var Sequence_default4 = Sequence4;
var Replace3 = class extends Decoder_default {
  /**
   * @param config The configuration object for the decoder.
   */
  constructor(config) {
    super(config);
    this.pattern = create_pattern(this.config.pattern);
  }
  decode_chain(tokens) {
    const content = this.config.content ?? "";
    const pattern = this.pattern;
    return pattern === null ? tokens : tokens.map((token) => token.replaceAll(pattern, content));
  }
};
var Replace_default3 = Replace3;
var Fuse = class extends Decoder_default {
  decode_chain(tokens) {
    return [tokens.join("")];
  }
};
var Fuse_default = Fuse;
var Strip2 = class extends Decoder_default {
  constructor(config) {
    super(config);
    this.content = config.content ?? "";
    this.start = config.start ?? 0;
    this.stop = config.stop ?? 0;
  }
  decode_chain(tokens) {
    return tokens.map((token) => {
      let start_cut = 0;
      for (let i = 0; i < this.start; ++i) {
        if (token[i] === this.content) {
          start_cut = i + 1;
          continue;
        } else {
          break;
        }
      }
      let stop_cut = token.length;
      for (let i = 0; i < this.stop; ++i) {
        const index = token.length - i - 1;
        if (token[index] === this.content) {
          stop_cut = index;
          continue;
        } else {
          break;
        }
      }
      return token.slice(start_cut, stop_cut);
    });
  }
};
var Strip_default2 = Strip2;
var ByteFallback = class extends Decoder_default {
  constructor(config) {
    super(config);
    this.text_decoder = new TextDecoder();
  }
  decode_chain(tokens) {
    const new_tokens = [];
    let previous_byte_tokens = [];
    for (const token of tokens) {
      let bytes = null;
      if (token.length === 6 && token.startsWith("<0x") && token.endsWith(">")) {
        const byte = parseInt(token.slice(3, 5), 16);
        if (!isNaN(byte)) {
          bytes = byte;
        }
      }
      if (bytes !== null) {
        previous_byte_tokens.push(bytes);
      } else {
        if (previous_byte_tokens.length > 0) {
          const string = this.text_decoder.decode(
            Uint8Array.from(previous_byte_tokens)
          );
          new_tokens.push(string);
          previous_byte_tokens = [];
        }
        new_tokens.push(token);
      }
    }
    if (previous_byte_tokens.length > 0) {
      const string = this.text_decoder.decode(
        Uint8Array.from(previous_byte_tokens)
      );
      new_tokens.push(string);
      previous_byte_tokens = [];
    }
    return new_tokens;
  }
};
var ByteFallback_default = ByteFallback;
function create_decoder(config) {
  if (config === null) return null;
  switch (config.type) {
    case "ByteLevel":
      return new ByteLevel_default3(config);
    case "WordPiece":
      return new WordPiece_default2(config);
    case "Metaspace":
      return new Metaspace_default2(config);
    case "BPEDecoder":
      return new BPE_default2(config);
    case "CTC":
      return new CTC_default(config);
    case "Sequence":
      return new Sequence_default4(config);
    case "Replace":
      return new Replace_default3(config);
    case "Fuse":
      return new Fuse_default(config);
    case "Strip":
      return new Strip_default2(config);
    case "ByteFallback":
      return new ByteFallback_default(config);
    default:
      throw new Error(`Unknown Decoder type: ${config.type}`);
  }
}
var create_decoder_default = create_decoder;
var Tokenizer = class {
  constructor(tokenizer, config) {
    const tokenizer_error = validate_object(tokenizer, "Tokenizer", [
      "model",
      "decoder",
      "post_processor",
      "pre_tokenizer",
      "normalizer"
    ]);
    if (tokenizer_error) {
      throw new Error(tokenizer_error);
    }
    const config_error = validate_object(config, "Config");
    if (config_error) {
      throw new Error(config_error);
    }
    this.tokenizer = tokenizer;
    this.config = config;
    this.normalizer = create_normalizer_default(this.tokenizer.normalizer);
    this.pre_tokenizer = create_pre_tokenizer_default(this.tokenizer.pre_tokenizer);
    this.model = create_tokenizer_model_default(this.tokenizer.model, this.config);
    this.post_processor = create_post_processor_default(this.tokenizer.post_processor);
    this.decoder = create_decoder_default(this.tokenizer.decoder);
    this.special_tokens = [];
    this.all_special_ids = [];
    this.added_tokens = [];
    const unnormalized_contents = [];
    const normalized_contents = [];
    this.added_tokens_map = /* @__PURE__ */ new Map();
    for (const added_token of this.tokenizer.added_tokens) {
      const token = new AddedToken_default(added_token);
      this.added_tokens.push(token);
      this.model.tokens_to_ids.set(token.content, token.id);
      this.model.vocab[token.id] = token.content;
      if (token.special) {
        this.special_tokens.push(token.content);
        this.all_special_ids.push(token.id);
      }
      this.added_tokens_map.set(token.content, token);
      if (token.normalized && this.normalizer !== null) {
        const normalized_content = this.normalizer(token.content);
        normalized_contents.push(normalized_content);
        this.added_tokens_map.set(normalized_content, token);
      } else {
        unnormalized_contents.push(token.content);
      }
    }
    (this.config.additional_special_tokens ?? []).forEach((token) => {
      if (!this.special_tokens.includes(token)) this.special_tokens.push(token);
    });
    if (this.decoder) {
      this.decoder.added_tokens = this.added_tokens;
      this.decoder.end_of_word_suffix = this.model.end_of_word_suffix;
    }
    this.splitter_unnormalized = new DictionarySplitter_default(unnormalized_contents);
    this.splitter_normalized = new DictionarySplitter_default(normalized_contents);
    this.remove_space = this.config.remove_space;
    this.clean_up_tokenization_spaces = this.config.clean_up_tokenization_spaces ?? true;
    this.do_lowercase_and_remove_accent = this.config.do_lowercase_and_remove_accent ?? false;
  }
  // Implementation
  encode(text, {
    text_pair = null,
    add_special_tokens = true,
    return_token_type_ids = null
  } = {}) {
    const { tokens, token_type_ids } = this.tokenize_helper(text, {
      text_pair,
      add_special_tokens
    });
    const input_ids = tokens.map(
      (t) => this.added_tokens_map.get(t)?.id ?? this.model.tokens_to_ids.get(t) ?? this.model.unk_token_id
    );
    const result = {
      ids: input_ids,
      tokens,
      attention_mask: new Array(input_ids.length).fill(1)
    };
    if (return_token_type_ids && token_type_ids) {
      result.token_type_ids = token_type_ids;
    }
    return result;
  }
  decode(token_ids, options = {}) {
    if (!Array.isArray(token_ids) || token_ids.length === 0 || !is_integral_number(token_ids[0])) {
      throw Error("token_ids must be a non-empty array of integers.");
    }
    let tokens = token_ids.map(
      (i) => this.model.vocab[Number(i)] ?? this.model.unk_token
    );
    if (options.skip_special_tokens) {
      tokens = tokens.filter((x) => !this.special_tokens.includes(x));
    }
    let decoded = this.decoder ? this.decoder(tokens) : tokens.join(" ");
    if (this.decoder && this.decoder.end_of_word_suffix) {
      decoded = decoded.replaceAll(this.decoder.end_of_word_suffix, " ");
      if (options.skip_special_tokens) {
        decoded = decoded.trim();
      }
    }
    if (options.clean_up_tokenization_spaces ?? this.clean_up_tokenization_spaces) {
      decoded = clean_up_tokenization(decoded);
    }
    return decoded;
  }
  /**
   * Converts a string into a sequence of tokens.
   * @param text The sequence to be encoded.
   * @param options An optional object containing the following properties:
   * @returns The list of tokens.
   */
  tokenize(text, { text_pair = null, add_special_tokens = false } = {}) {
    return this.tokenize_helper(text, { text_pair, add_special_tokens }).tokens;
  }
  encode_text(text) {
    if (text === null) {
      return null;
    }
    const sections = this.splitter_unnormalized.split(text);
    sections.forEach((section, i) => {
      const added_token = this.added_tokens_map.get(section);
      if (added_token) {
        if (added_token.lstrip && i > 0) {
          sections[i - 1] = sections[i - 1].trimEnd();
        }
        if (added_token.rstrip && i < sections.length - 1) {
          sections[i + 1] = sections[i + 1].trimStart();
        }
      }
    });
    return sections.flatMap((processed_text, section_index) => {
      if (processed_text.length === 0) {
        return [];
      }
      if (this.added_tokens_map.has(processed_text)) {
        return [processed_text];
      }
      if (this.remove_space === true) {
        processed_text = processed_text.trim().split(/\s+/).join(" ");
      }
      if (this.do_lowercase_and_remove_accent) {
        processed_text = lowercase_and_remove_accents(processed_text);
      }
      if (this.normalizer !== null) {
        processed_text = this.normalizer(processed_text);
      }
      if (processed_text.length === 0) {
        return [];
      }
      const subsections = this.splitter_normalized.split(processed_text);
      subsections.forEach((subsection, j) => {
        const added_token = this.added_tokens_map.get(subsection);
        if (added_token) {
          if (added_token.lstrip && j > 0) {
            subsections[j - 1] = subsections[j - 1].trimEnd();
          }
          if (added_token.rstrip && j < subsections.length - 1) {
            subsections[j + 1] = subsections[j + 1].trimStart();
          }
        }
      });
      return subsections.flatMap((subsection) => {
        if (subsection.length === 0) {
          return [];
        }
        if (this.added_tokens_map.has(subsection)) {
          return [subsection];
        }
        const section_tokens = this.pre_tokenizer !== null ? this.pre_tokenizer(subsection, {
          section_index
        }) : [subsection];
        return this.model(section_tokens);
      });
    });
  }
  tokenize_helper(text, { text_pair = null, add_special_tokens = true }) {
    const tokens1 = this.encode_text(text);
    const tokens2 = this.encode_text(text_pair || null);
    return this.post_processor ? this.post_processor(tokens1, tokens2, add_special_tokens) : { tokens: merge_arrays(tokens1 ?? [], tokens2 ?? []) };
  }
  /**
   * Converts a token string to its corresponding token ID.
   * @param token The token string to convert.
   * @returns The token ID, or undefined if the token is not in the vocabulary.
   */
  token_to_id(token) {
    return this.model.tokens_to_ids.get(token);
  }
  /**
   * Converts a token ID to its corresponding token string.
   * @param id The token ID to convert.
   * @returns The token string, or undefined if the ID is not in the vocabulary.
   */
  id_to_token(id) {
    return this.model.vocab[id];
  }
  /**
   * Returns a mapping of token IDs to AddedToken objects for all added tokens.
   * @returns A Map where keys are token IDs and values are AddedToken objects.
   */
  get_added_tokens_decoder() {
    const decoder = /* @__PURE__ */ new Map();
    for (const token of this.added_tokens) {
      decoder.set(token.id, token);
    }
    return decoder;
  }
  /**
   * Get the underlying vocabulary
   * @param with_added_tokens Whether to include the added tokens
   * @returns The vocabulary
   */
  get_vocab(with_added_tokens = true) {
    const vocab = /* @__PURE__ */ new Map();
    for (let i = 0; i < this.model.vocab.length; ++i) {
      const token = this.model.vocab[i];
      if (with_added_tokens || !this.added_tokens_map.has(token)) {
        vocab.set(token, i);
      }
    }
    return vocab;
  }
};
var Tokenizer_default = Tokenizer;
var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, key + "", value);
  return value;
};
var TOKEN_TYPES = Object.freeze({
  Text: "Text",
  // The text between Jinja statements or expressions
  NumericLiteral: "NumericLiteral",
  // e.g., 123, 1.0
  StringLiteral: "StringLiteral",
  // 'string'
  Identifier: "Identifier",
  // Variables, functions, statements, booleans, etc.
  Equals: "Equals",
  // =
  OpenParen: "OpenParen",
  // (
  CloseParen: "CloseParen",
  // )
  OpenStatement: "OpenStatement",
  // {%
  CloseStatement: "CloseStatement",
  // %}
  OpenExpression: "OpenExpression",
  // {{
  CloseExpression: "CloseExpression",
  // }}
  OpenSquareBracket: "OpenSquareBracket",
  // [
  CloseSquareBracket: "CloseSquareBracket",
  // ]
  OpenCurlyBracket: "OpenCurlyBracket",
  // {
  CloseCurlyBracket: "CloseCurlyBracket",
  // }
  Comma: "Comma",
  // ,
  Dot: "Dot",
  // .
  Colon: "Colon",
  // :
  Pipe: "Pipe",
  // |
  CallOperator: "CallOperator",
  // ()
  AdditiveBinaryOperator: "AdditiveBinaryOperator",
  // + - ~
  MultiplicativeBinaryOperator: "MultiplicativeBinaryOperator",
  // * / // %
  ExponentiationBinaryOperator: "ExponentiationBinaryOperator",
  // **
  ComparisonBinaryOperator: "ComparisonBinaryOperator",
  // < > <= >= == !=
  UnaryOperator: "UnaryOperator",
  // ! - +
  Comment: "Comment"
  // {# ... #}
});
var Token = class {
  /**
   * Constructs a new Token.
   * @param {string} value The raw value as seen inside the source code.
   * @param {TokenType} type The type of token.
   */
  constructor(value, type) {
    this.value = value;
    this.type = type;
  }
};
function isWord(char) {
  return /\w/.test(char);
}
function isInteger(char) {
  return /[0-9]/.test(char);
}
function isWhitespace(char) {
  return /\s/.test(char);
}
var ORDERED_MAPPING_TABLE = [
  // Control sequences
  ["{%", TOKEN_TYPES.OpenStatement],
  ["%}", TOKEN_TYPES.CloseStatement],
  ["{{", TOKEN_TYPES.OpenExpression],
  ["}}", TOKEN_TYPES.CloseExpression],
  // Single character tokens
  ["(", TOKEN_TYPES.OpenParen],
  [")", TOKEN_TYPES.CloseParen],
  ["{", TOKEN_TYPES.OpenCurlyBracket],
  ["}", TOKEN_TYPES.CloseCurlyBracket],
  ["[", TOKEN_TYPES.OpenSquareBracket],
  ["]", TOKEN_TYPES.CloseSquareBracket],
  [",", TOKEN_TYPES.Comma],
  [".", TOKEN_TYPES.Dot],
  [":", TOKEN_TYPES.Colon],
  ["|", TOKEN_TYPES.Pipe],
  // Comparison operators
  ["<=", TOKEN_TYPES.ComparisonBinaryOperator],
  [">=", TOKEN_TYPES.ComparisonBinaryOperator],
  ["==", TOKEN_TYPES.ComparisonBinaryOperator],
  ["!=", TOKEN_TYPES.ComparisonBinaryOperator],
  ["<", TOKEN_TYPES.ComparisonBinaryOperator],
  [">", TOKEN_TYPES.ComparisonBinaryOperator],
  // Arithmetic operators
  ["+", TOKEN_TYPES.AdditiveBinaryOperator],
  ["-", TOKEN_TYPES.AdditiveBinaryOperator],
  ["~", TOKEN_TYPES.AdditiveBinaryOperator],
  ["**", TOKEN_TYPES.ExponentiationBinaryOperator],
  // NOTE: must come before "*" so that "**" is matched first
  ["*", TOKEN_TYPES.MultiplicativeBinaryOperator],
  ["//", TOKEN_TYPES.MultiplicativeBinaryOperator],
  // NOTE: must come before "/" so that "//" is matched first
  ["/", TOKEN_TYPES.MultiplicativeBinaryOperator],
  ["%", TOKEN_TYPES.MultiplicativeBinaryOperator],
  // Assignment operator
  ["=", TOKEN_TYPES.Equals]
];
var ESCAPE_CHARACTERS = /* @__PURE__ */ new Map([
  ["n", "\n"],
  // New line
  ["t", "	"],
  // Horizontal tab
  ["r", "\r"],
  // Carriage return
  ["b", "\b"],
  // Backspace
  ["f", "\f"],
  // Form feed
  ["v", "\v"],
  // Vertical tab
  ["'", "'"],
  // Single quote
  ['"', '"'],
  // Double quote
  ["\\", "\\"]
  // Backslash
]);
function preprocess(template, options = {}) {
  if (template.endsWith("\n")) {
    template = template.slice(0, -1);
  }
  if (options.lstrip_blocks) {
    template = template.replace(/^[ \t]*({[#%-])/gm, "$1");
  }
  if (options.trim_blocks) {
    template = template.replace(/([#%-]})\n/g, "$1");
  }
  return template.replace(
    /(\s*){%(-?)\s*(?:end)?generation\s*(-?)%}(\s*)/gs,
    (_, before, lstrip, rstrip, after) => (lstrip ? "" : before) + (rstrip ? "" : after)
  );
}
function tokenize(source, options = {}) {
  const tokens = [];
  const src = preprocess(source, options);
  let cursorPosition = 0;
  let curlyBracketDepth = 0;
  const consumeWhile = (predicate) => {
    let str = "";
    while (predicate(src[cursorPosition])) {
      if (src[cursorPosition] === "\\") {
        ++cursorPosition;
        if (cursorPosition >= src.length) {
          throw new SyntaxError("Unexpected end of input");
        }
        const escaped = src[cursorPosition++];
        const unescaped = ESCAPE_CHARACTERS.get(escaped);
        if (unescaped === void 0) {
          throw new SyntaxError(`Unexpected escaped character: ${escaped}`);
        }
        str += unescaped;
        continue;
      }
      str += src[cursorPosition++];
      if (cursorPosition >= src.length) {
        throw new SyntaxError("Unexpected end of input");
      }
    }
    return str;
  };
  const stripTrailingWhitespace = () => {
    const lastToken = tokens.at(-1);
    if (lastToken && lastToken.type === TOKEN_TYPES.Text) {
      lastToken.value = lastToken.value.trimEnd();
      if (lastToken.value === "") {
        tokens.pop();
      }
    }
  };
  const skipLeadingWhitespace = () => {
    while (cursorPosition < src.length && isWhitespace(src[cursorPosition])) {
      ++cursorPosition;
    }
  };
  main:
    while (cursorPosition < src.length) {
      const lastTokenType = tokens.at(-1)?.type;
      if (lastTokenType === void 0 || lastTokenType === TOKEN_TYPES.CloseStatement || lastTokenType === TOKEN_TYPES.CloseExpression || lastTokenType === TOKEN_TYPES.Comment) {
        let text = "";
        while (cursorPosition < src.length && // Keep going until we hit the next Jinja statement or expression
        !(src[cursorPosition] === "{" && (src[cursorPosition + 1] === "%" || src[cursorPosition + 1] === "{" || src[cursorPosition + 1] === "#"))) {
          text += src[cursorPosition++];
        }
        if (text.length > 0) {
          tokens.push(new Token(text, TOKEN_TYPES.Text));
          continue;
        }
      }
      if (src[cursorPosition] === "{" && src[cursorPosition + 1] === "#") {
        cursorPosition += 2;
        const stripBefore = src[cursorPosition] === "-";
        if (stripBefore) {
          ++cursorPosition;
        }
        let comment = "";
        while (src[cursorPosition] !== "#" || src[cursorPosition + 1] !== "}") {
          if (cursorPosition + 2 >= src.length) {
            throw new SyntaxError("Missing end of comment tag");
          }
          comment += src[cursorPosition++];
        }
        const stripAfter = comment.endsWith("-");
        if (stripAfter) {
          comment = comment.slice(0, -1);
        }
        if (stripBefore) {
          stripTrailingWhitespace();
        }
        tokens.push(new Token(comment, TOKEN_TYPES.Comment));
        cursorPosition += 2;
        if (stripAfter) {
          skipLeadingWhitespace();
        }
        continue;
      }
      if (src.slice(cursorPosition, cursorPosition + 3) === "{%-") {
        stripTrailingWhitespace();
        tokens.push(new Token("{%", TOKEN_TYPES.OpenStatement));
        cursorPosition += 3;
        continue;
      }
      if (src.slice(cursorPosition, cursorPosition + 3) === "{{-") {
        stripTrailingWhitespace();
        tokens.push(new Token("{{", TOKEN_TYPES.OpenExpression));
        curlyBracketDepth = 0;
        cursorPosition += 3;
        continue;
      }
      consumeWhile(isWhitespace);
      if (src.slice(cursorPosition, cursorPosition + 3) === "-%}") {
        tokens.push(new Token("%}", TOKEN_TYPES.CloseStatement));
        cursorPosition += 3;
        skipLeadingWhitespace();
        continue;
      }
      if (src.slice(cursorPosition, cursorPosition + 3) === "-}}") {
        tokens.push(new Token("}}", TOKEN_TYPES.CloseExpression));
        cursorPosition += 3;
        skipLeadingWhitespace();
        continue;
      }
      const char = src[cursorPosition];
      if (char === "-" || char === "+") {
        const lastTokenType2 = tokens.at(-1)?.type;
        if (lastTokenType2 === TOKEN_TYPES.Text || lastTokenType2 === void 0) {
          throw new SyntaxError(`Unexpected character: ${char}`);
        }
        switch (lastTokenType2) {
          case TOKEN_TYPES.Identifier:
          case TOKEN_TYPES.NumericLiteral:
          case TOKEN_TYPES.StringLiteral:
          case TOKEN_TYPES.CloseParen:
          case TOKEN_TYPES.CloseSquareBracket:
            break;
          default: {
            ++cursorPosition;
            let num = consumeWhile(isInteger);
            if (num.length > 0 && src[cursorPosition] === "." && isInteger(src[cursorPosition + 1])) {
              ++cursorPosition;
              const frac = consumeWhile(isInteger);
              num = `${num}.${frac}`;
            }
            tokens.push(
              new Token(`${char}${num}`, num.length > 0 ? TOKEN_TYPES.NumericLiteral : TOKEN_TYPES.UnaryOperator)
            );
            continue;
          }
        }
      }
      for (const [seq, type] of ORDERED_MAPPING_TABLE) {
        if (seq === "}}" && curlyBracketDepth > 0) {
          continue;
        }
        const slice2 = src.slice(cursorPosition, cursorPosition + seq.length);
        if (slice2 === seq) {
          tokens.push(new Token(seq, type));
          if (type === TOKEN_TYPES.OpenExpression) {
            curlyBracketDepth = 0;
          } else if (type === TOKEN_TYPES.OpenCurlyBracket) {
            ++curlyBracketDepth;
          } else if (type === TOKEN_TYPES.CloseCurlyBracket) {
            --curlyBracketDepth;
          }
          cursorPosition += seq.length;
          continue main;
        }
      }
      if (char === "'" || char === '"') {
        ++cursorPosition;
        const str = consumeWhile((c) => c !== char);
        tokens.push(new Token(str, TOKEN_TYPES.StringLiteral));
        ++cursorPosition;
        continue;
      }
      if (isInteger(char)) {
        let num = consumeWhile(isInteger);
        if (tokens.at(-1)?.type !== TOKEN_TYPES.Dot && src[cursorPosition] === "." && isInteger(src[cursorPosition + 1])) {
          ++cursorPosition;
          const frac = consumeWhile(isInteger);
          num = `${num}.${frac}`;
        }
        tokens.push(new Token(num, TOKEN_TYPES.NumericLiteral));
        continue;
      }
      if (isWord(char)) {
        const word = consumeWhile(isWord);
        tokens.push(new Token(word, TOKEN_TYPES.Identifier));
        continue;
      }
      throw new SyntaxError(`Unexpected character: ${char}`);
    }
  return tokens;
}
var Statement = class {
  type = "Statement";
};
var Program = class extends Statement {
  constructor(body) {
    super();
    this.body = body;
  }
  type = "Program";
};
var If = class extends Statement {
  constructor(test, body, alternate) {
    super();
    this.test = test;
    this.body = body;
    this.alternate = alternate;
  }
  type = "If";
};
var For = class extends Statement {
  constructor(loopvar, iterable, body, defaultBlock) {
    super();
    this.loopvar = loopvar;
    this.iterable = iterable;
    this.body = body;
    this.defaultBlock = defaultBlock;
  }
  type = "For";
};
var Break = class extends Statement {
  type = "Break";
};
var Continue = class extends Statement {
  type = "Continue";
};
var SetStatement = class extends Statement {
  constructor(assignee, value, body) {
    super();
    this.assignee = assignee;
    this.value = value;
    this.body = body;
  }
  type = "Set";
};
var Macro = class extends Statement {
  constructor(name2, args, body) {
    super();
    this.name = name2;
    this.args = args;
    this.body = body;
  }
  type = "Macro";
};
var Comment = class extends Statement {
  constructor(value) {
    super();
    this.value = value;
  }
  type = "Comment";
};
var Expression = class extends Statement {
  type = "Expression";
};
var MemberExpression = class extends Expression {
  constructor(object, property, computed) {
    super();
    this.object = object;
    this.property = property;
    this.computed = computed;
  }
  type = "MemberExpression";
};
var CallExpression = class extends Expression {
  constructor(callee, args) {
    super();
    this.callee = callee;
    this.args = args;
  }
  type = "CallExpression";
};
var Identifier = class extends Expression {
  /**
   * @param {string} value The name of the identifier
   */
  constructor(value) {
    super();
    this.value = value;
  }
  type = "Identifier";
};
var Literal = class extends Expression {
  constructor(value) {
    super();
    this.value = value;
  }
  type = "Literal";
};
var IntegerLiteral = class extends Literal {
  type = "IntegerLiteral";
};
var FloatLiteral = class extends Literal {
  type = "FloatLiteral";
};
var StringLiteral = class extends Literal {
  type = "StringLiteral";
};
var ArrayLiteral = class extends Literal {
  type = "ArrayLiteral";
};
var TupleLiteral = class extends Literal {
  type = "TupleLiteral";
};
var ObjectLiteral = class extends Literal {
  type = "ObjectLiteral";
};
var BinaryExpression = class extends Expression {
  constructor(operator, left, right) {
    super();
    this.operator = operator;
    this.left = left;
    this.right = right;
  }
  type = "BinaryExpression";
};
var FilterExpression = class extends Expression {
  constructor(operand, filter) {
    super();
    this.operand = operand;
    this.filter = filter;
  }
  type = "FilterExpression";
};
var FilterStatement = class extends Statement {
  constructor(filter, body) {
    super();
    this.filter = filter;
    this.body = body;
  }
  type = "FilterStatement";
};
var SelectExpression = class extends Expression {
  constructor(lhs, test) {
    super();
    this.lhs = lhs;
    this.test = test;
  }
  type = "SelectExpression";
};
var TestExpression = class extends Expression {
  constructor(operand, negate, test) {
    super();
    this.operand = operand;
    this.negate = negate;
    this.test = test;
  }
  type = "TestExpression";
};
var UnaryExpression = class extends Expression {
  constructor(operator, argument) {
    super();
    this.operator = operator;
    this.argument = argument;
  }
  type = "UnaryExpression";
};
var SliceExpression = class extends Expression {
  constructor(start = void 0, stop = void 0, step = void 0) {
    super();
    this.start = start;
    this.stop = stop;
    this.step = step;
  }
  type = "SliceExpression";
};
var KeywordArgumentExpression = class extends Expression {
  constructor(key, value) {
    super();
    this.key = key;
    this.value = value;
  }
  type = "KeywordArgumentExpression";
};
var SpreadExpression = class extends Expression {
  constructor(argument) {
    super();
    this.argument = argument;
  }
  type = "SpreadExpression";
};
var KeywordSpreadExpression = class extends Expression {
  constructor(argument) {
    super();
    this.argument = argument;
  }
  type = "KeywordSpreadExpression";
};
var CallStatement = class extends Statement {
  constructor(call, callerArgs, body) {
    super();
    this.call = call;
    this.callerArgs = callerArgs;
    this.body = body;
  }
  type = "CallStatement";
};
var Ternary = class extends Expression {
  constructor(condition, trueExpr, falseExpr) {
    super();
    this.condition = condition;
    this.trueExpr = trueExpr;
    this.falseExpr = falseExpr;
  }
  type = "Ternary";
};
function parse(tokens) {
  const program = new Program([]);
  let current = 0;
  function expect(type, error) {
    const prev = tokens[current++];
    if (!prev || prev.type !== type) {
      throw new Error(`Parser Error: ${error}. ${prev.type} !== ${type}.`);
    }
    return prev;
  }
  function expectIdentifier(name2) {
    if (!isIdentifier(name2)) {
      throw new SyntaxError(`Expected ${name2}`);
    }
    ++current;
  }
  function parseAny() {
    switch (tokens[current].type) {
      case TOKEN_TYPES.Comment:
        return new Comment(tokens[current++].value);
      case TOKEN_TYPES.Text:
        return parseText();
      case TOKEN_TYPES.OpenStatement:
        return parseJinjaStatement();
      case TOKEN_TYPES.OpenExpression:
        return parseJinjaExpression();
      default:
        throw new SyntaxError(`Unexpected token type: ${tokens[current].type}`);
    }
  }
  function is2(...types) {
    return current + types.length <= tokens.length && types.every((type, i) => type === tokens[current + i].type);
  }
  function isStatement(...names) {
    return tokens[current]?.type === TOKEN_TYPES.OpenStatement && tokens[current + 1]?.type === TOKEN_TYPES.Identifier && names.includes(tokens[current + 1]?.value);
  }
  function isIdentifier(...names) {
    return current + names.length <= tokens.length && names.every((name2, i) => tokens[current + i].type === "Identifier" && name2 === tokens[current + i].value);
  }
  function parseText() {
    return new StringLiteral(expect(TOKEN_TYPES.Text, "Expected text token").value);
  }
  function parseJinjaStatement() {
    expect(TOKEN_TYPES.OpenStatement, "Expected opening statement token");
    if (tokens[current].type !== TOKEN_TYPES.Identifier) {
      throw new SyntaxError(`Unknown statement, got ${tokens[current].type}`);
    }
    const name2 = tokens[current].value;
    let result;
    switch (name2) {
      case "set":
        ++current;
        result = parseSetStatement();
        break;
      case "if":
        ++current;
        result = parseIfStatement();
        expect(TOKEN_TYPES.OpenStatement, "Expected {% token");
        expectIdentifier("endif");
        expect(TOKEN_TYPES.CloseStatement, "Expected %} token");
        break;
      case "macro":
        ++current;
        result = parseMacroStatement();
        expect(TOKEN_TYPES.OpenStatement, "Expected {% token");
        expectIdentifier("endmacro");
        expect(TOKEN_TYPES.CloseStatement, "Expected %} token");
        break;
      case "for":
        ++current;
        result = parseForStatement();
        expect(TOKEN_TYPES.OpenStatement, "Expected {% token");
        expectIdentifier("endfor");
        expect(TOKEN_TYPES.CloseStatement, "Expected %} token");
        break;
      case "call": {
        ++current;
        let callerArgs = null;
        if (is2(TOKEN_TYPES.OpenParen)) {
          callerArgs = parseArgs("parameters");
        }
        const callee = parsePrimaryExpression();
        if (callee.type !== "Identifier") {
          throw new SyntaxError(`Expected identifier following call statement`);
        }
        const callArgs = parseArgs("call");
        expect(TOKEN_TYPES.CloseStatement, "Expected closing statement token");
        const body = [];
        while (!isStatement("endcall")) {
          body.push(parseAny());
        }
        expect(TOKEN_TYPES.OpenStatement, "Expected '{%'");
        expectIdentifier("endcall");
        expect(TOKEN_TYPES.CloseStatement, "Expected closing statement token");
        const callExpr = new CallExpression(callee, callArgs);
        result = new CallStatement(callExpr, callerArgs, body);
        break;
      }
      case "break":
        ++current;
        expect(TOKEN_TYPES.CloseStatement, "Expected closing statement token");
        result = new Break();
        break;
      case "continue":
        ++current;
        expect(TOKEN_TYPES.CloseStatement, "Expected closing statement token");
        result = new Continue();
        break;
      case "filter": {
        ++current;
        let filterNode = parsePrimaryExpression();
        if (filterNode instanceof Identifier && is2(TOKEN_TYPES.OpenParen)) {
          filterNode = parseCallExpression(filterNode);
        }
        expect(TOKEN_TYPES.CloseStatement, "Expected closing statement token");
        const filterBody = [];
        while (!isStatement("endfilter")) {
          filterBody.push(parseAny());
        }
        expect(TOKEN_TYPES.OpenStatement, "Expected '{%'");
        expectIdentifier("endfilter");
        expect(TOKEN_TYPES.CloseStatement, "Expected '%}'");
        result = new FilterStatement(filterNode, filterBody);
        break;
      }
      default:
        throw new SyntaxError(`Unknown statement type: ${name2}`);
    }
    return result;
  }
  function parseJinjaExpression() {
    expect(TOKEN_TYPES.OpenExpression, "Expected opening expression token");
    const result = parseExpression();
    expect(TOKEN_TYPES.CloseExpression, "Expected closing expression token");
    return result;
  }
  function parseSetStatement() {
    const left = parseExpressionSequence();
    let value = null;
    const body = [];
    if (is2(TOKEN_TYPES.Equals)) {
      ++current;
      value = parseExpressionSequence();
    } else {
      expect(TOKEN_TYPES.CloseStatement, "Expected %} token");
      while (!isStatement("endset")) {
        body.push(parseAny());
      }
      expect(TOKEN_TYPES.OpenStatement, "Expected {% token");
      expectIdentifier("endset");
    }
    expect(TOKEN_TYPES.CloseStatement, "Expected closing statement token");
    return new SetStatement(left, value, body);
  }
  function parseIfStatement() {
    const test = parseExpression();
    expect(TOKEN_TYPES.CloseStatement, "Expected closing statement token");
    const body = [];
    const alternate = [];
    while (!isStatement("elif", "else", "endif")) {
      body.push(parseAny());
    }
    if (isStatement("elif")) {
      ++current;
      ++current;
      const result = parseIfStatement();
      alternate.push(result);
    } else if (isStatement("else")) {
      ++current;
      ++current;
      expect(TOKEN_TYPES.CloseStatement, "Expected closing statement token");
      while (!isStatement("endif")) {
        alternate.push(parseAny());
      }
    }
    return new If(test, body, alternate);
  }
  function parseMacroStatement() {
    const name2 = parsePrimaryExpression();
    if (name2.type !== "Identifier") {
      throw new SyntaxError(`Expected identifier following macro statement`);
    }
    const args = parseArgs("parameters");
    expect(TOKEN_TYPES.CloseStatement, "Expected closing statement token");
    const body = [];
    while (!isStatement("endmacro")) {
      body.push(parseAny());
    }
    return new Macro(name2, args, body);
  }
  function parseExpressionSequence(primary = false) {
    const fn2 = primary ? parsePrimaryExpression : parseExpression;
    const expressions = [fn2()];
    const isTuple = is2(TOKEN_TYPES.Comma);
    while (isTuple) {
      ++current;
      expressions.push(fn2());
      if (!is2(TOKEN_TYPES.Comma)) {
        break;
      }
    }
    return isTuple ? new TupleLiteral(expressions) : expressions[0];
  }
  function parseForStatement() {
    const loopVariable = parseExpressionSequence(true);
    if (!(loopVariable instanceof Identifier || loopVariable instanceof TupleLiteral)) {
      throw new SyntaxError(`Expected identifier/tuple for the loop variable, got ${loopVariable.type} instead`);
    }
    if (!isIdentifier("in")) {
      throw new SyntaxError("Expected `in` keyword following loop variable");
    }
    ++current;
    const iterable = parseExpression();
    expect(TOKEN_TYPES.CloseStatement, "Expected closing statement token");
    const body = [];
    while (!isStatement("endfor", "else")) {
      body.push(parseAny());
    }
    const alternative = [];
    if (isStatement("else")) {
      ++current;
      ++current;
      expect(TOKEN_TYPES.CloseStatement, "Expected closing statement token");
      while (!isStatement("endfor")) {
        alternative.push(parseAny());
      }
    }
    return new For(loopVariable, iterable, body, alternative);
  }
  function parseExpression() {
    return parseIfExpression();
  }
  function parseIfExpression() {
    const a = parseLogicalOrExpression();
    if (isIdentifier("if")) {
      ++current;
      const test = parseLogicalOrExpression();
      if (isIdentifier("else")) {
        ++current;
        const falseExpr = parseIfExpression();
        return new Ternary(test, a, falseExpr);
      } else {
        return new SelectExpression(a, test);
      }
    }
    return a;
  }
  function parseLogicalOrExpression() {
    let left = parseLogicalAndExpression();
    while (isIdentifier("or")) {
      const operator = tokens[current];
      ++current;
      const right = parseLogicalAndExpression();
      left = new BinaryExpression(operator, left, right);
    }
    return left;
  }
  function parseLogicalAndExpression() {
    let left = parseLogicalNegationExpression();
    while (isIdentifier("and")) {
      const operator = tokens[current];
      ++current;
      const right = parseLogicalNegationExpression();
      left = new BinaryExpression(operator, left, right);
    }
    return left;
  }
  function parseLogicalNegationExpression() {
    let right;
    while (isIdentifier("not")) {
      const operator = tokens[current];
      ++current;
      const arg = parseLogicalNegationExpression();
      right = new UnaryExpression(operator, arg);
    }
    return right ?? parseComparisonExpression();
  }
  function parseComparisonExpression() {
    let left = parseAdditiveExpression();
    while (true) {
      let operator;
      if (isIdentifier("not", "in")) {
        operator = new Token("not in", TOKEN_TYPES.Identifier);
        current += 2;
      } else if (isIdentifier("in")) {
        operator = tokens[current++];
      } else if (is2(TOKEN_TYPES.ComparisonBinaryOperator)) {
        operator = tokens[current++];
      } else {
        break;
      }
      const right = parseAdditiveExpression();
      left = new BinaryExpression(operator, left, right);
    }
    return left;
  }
  function parseAdditiveExpression() {
    let left = parseMultiplicativeExpression();
    while (is2(TOKEN_TYPES.AdditiveBinaryOperator)) {
      const operator = tokens[current];
      ++current;
      const right = parseMultiplicativeExpression();
      left = new BinaryExpression(operator, left, right);
    }
    return left;
  }
  function parseCallMemberExpression() {
    const member = parseMemberExpression(parsePrimaryExpression());
    if (is2(TOKEN_TYPES.OpenParen)) {
      return parseCallExpression(member);
    }
    return member;
  }
  function parseCallExpression(callee) {
    let expression = new CallExpression(callee, parseArgs("call"));
    expression = parseMemberExpression(expression);
    if (is2(TOKEN_TYPES.OpenParen)) {
      expression = parseCallExpression(expression);
    }
    return expression;
  }
  function parseArgs(mode) {
    expect(TOKEN_TYPES.OpenParen, "Expected opening parenthesis for arguments list");
    const args = parseArgumentsList(mode);
    expect(TOKEN_TYPES.CloseParen, "Expected closing parenthesis for arguments list");
    return args;
  }
  function parseArgumentsList(mode) {
    const args = [];
    const parameterNames = /* @__PURE__ */ new Set();
    let sawKeywordOrDefault = false;
    let sawSpreadArgument = false;
    while (!is2(TOKEN_TYPES.CloseParen)) {
      const isKeywordSpread = is2(TOKEN_TYPES.ExponentiationBinaryOperator);
      const isPositionalSpread = is2(TOKEN_TYPES.MultiplicativeBinaryOperator) && tokens[current].value === "*";
      if (mode === "parameters" && (isKeywordSpread || isPositionalSpread)) {
        throw new SyntaxError("Argument unpacking is not allowed in parameter declarations");
      }
      if (isKeywordSpread) {
        ++current;
        args.push(new KeywordSpreadExpression(parseExpression()));
        if (is2(TOKEN_TYPES.Comma)) {
          ++current;
        }
        if (!is2(TOKEN_TYPES.CloseParen)) {
          throw new SyntaxError("Expected closing parenthesis: `**` must be applied to the final argument");
        }
        break;
      }
      let argument;
      if (isPositionalSpread) {
        if (sawSpreadArgument) {
          throw new SyntaxError("Only one `*` argument unpacking is allowed");
        }
        sawSpreadArgument = true;
        ++current;
        const expr = parseExpression();
        argument = new SpreadExpression(expr);
      } else {
        argument = parseExpression();
        if (is2(TOKEN_TYPES.Equals)) {
          ++current;
          if (!(argument instanceof Identifier)) {
            throw new SyntaxError(
              mode === "parameters" ? "Expected identifier for parameter declaration" : "Expected identifier for keyword argument"
            );
          }
          const value = parseExpression();
          argument = new KeywordArgumentExpression(argument, value);
        }
        if (mode === "parameters") {
          if (!(argument instanceof Identifier || argument instanceof KeywordArgumentExpression)) {
            throw new SyntaxError("Expected identifier for parameter declaration");
          }
          const parameterName = argument instanceof Identifier ? argument.value : argument.key.value;
          if (parameterNames.has(parameterName)) {
            throw new SyntaxError(`Duplicate parameter name: ${parameterName}`);
          }
          parameterNames.add(parameterName);
        }
        if (argument instanceof KeywordArgumentExpression) {
          sawKeywordOrDefault = true;
        } else if (sawKeywordOrDefault) {
          throw new SyntaxError(
            mode === "call" ? "Positional arguments must come before keyword arguments" : "Non-default argument follows default argument"
          );
        } else if (sawSpreadArgument) {
          throw new SyntaxError("Positional arguments must not follow `*` argument unpacking");
        }
      }
      args.push(argument);
      if (is2(TOKEN_TYPES.Comma)) {
        ++current;
      }
    }
    return args;
  }
  function parseMemberExpressionArgumentsList() {
    const slices = [];
    let isSlice = false;
    while (!is2(TOKEN_TYPES.CloseSquareBracket)) {
      if (is2(TOKEN_TYPES.Colon)) {
        slices.push(void 0);
        ++current;
        isSlice = true;
      } else {
        slices.push(parseExpression());
        if (is2(TOKEN_TYPES.Colon)) {
          ++current;
          isSlice = true;
        }
      }
    }
    if (slices.length === 0) {
      throw new SyntaxError(`Expected at least one argument for member/slice expression`);
    }
    if (isSlice) {
      if (slices.length > 3) {
        throw new SyntaxError(`Expected 0-3 arguments for slice expression`);
      }
      return new SliceExpression(...slices);
    }
    return slices[0];
  }
  function parseMemberExpression(object) {
    while (is2(TOKEN_TYPES.Dot) || is2(TOKEN_TYPES.OpenSquareBracket)) {
      const operator = tokens[current];
      ++current;
      let property;
      const computed = operator.type === TOKEN_TYPES.OpenSquareBracket;
      if (computed) {
        property = parseMemberExpressionArgumentsList();
        expect(TOKEN_TYPES.CloseSquareBracket, "Expected closing square bracket");
      } else {
        property = parsePrimaryExpression();
        if (property.type !== "Identifier" && property.type !== "IntegerLiteral") {
          throw new SyntaxError(`Expected identifier or integer following dot operator`);
        }
      }
      object = new MemberExpression(object, property, computed);
    }
    return object;
  }
  function parseMultiplicativeExpression() {
    let left = parsePowerExpression();
    while (is2(TOKEN_TYPES.MultiplicativeBinaryOperator)) {
      const operator = tokens[current++];
      const right = parsePowerExpression();
      left = new BinaryExpression(operator, left, right);
    }
    return left;
  }
  function parsePowerExpression() {
    let left = parseTestExpression();
    while (is2(TOKEN_TYPES.ExponentiationBinaryOperator)) {
      const operator = tokens[current++];
      const right = parseTestExpression();
      left = new BinaryExpression(operator, left, right);
    }
    return left;
  }
  function parseTestExpression() {
    let operand = parseFilterExpression();
    while (isIdentifier("is")) {
      ++current;
      const negate = isIdentifier("not");
      if (negate) {
        ++current;
      }
      const filter = parsePrimaryExpression();
      if (!(filter instanceof Identifier)) {
        throw new SyntaxError(`Expected identifier for the test`);
      }
      operand = new TestExpression(operand, negate, filter);
    }
    return operand;
  }
  function parseFilterExpression() {
    let operand = parseUnarySignExpression();
    while (is2(TOKEN_TYPES.Pipe)) {
      ++current;
      let filter = parsePrimaryExpression();
      if (!(filter instanceof Identifier)) {
        throw new SyntaxError(`Expected identifier for the filter`);
      }
      if (is2(TOKEN_TYPES.OpenParen)) {
        filter = parseCallExpression(filter);
      }
      operand = new FilterExpression(operand, filter);
    }
    return operand;
  }
  function parseUnarySignExpression() {
    const token = tokens[current];
    if (token && (token.type === TOKEN_TYPES.UnaryOperator || token.type === TOKEN_TYPES.AdditiveBinaryOperator) && (token.value === "-" || token.value === "+")) {
      const operator = tokens[current++];
      const argument = parseUnarySignExpression();
      return new UnaryExpression(operator, argument);
    }
    return parseCallMemberExpression();
  }
  function parsePrimaryExpression() {
    const token = tokens[current++];
    switch (token.type) {
      case TOKEN_TYPES.NumericLiteral: {
        const num = token.value;
        return num.includes(".") ? new FloatLiteral(Number(num)) : new IntegerLiteral(Number(num));
      }
      case TOKEN_TYPES.StringLiteral: {
        let value = token.value;
        while (is2(TOKEN_TYPES.StringLiteral)) {
          value += tokens[current++].value;
        }
        return new StringLiteral(value);
      }
      case TOKEN_TYPES.Identifier:
        return new Identifier(token.value);
      case TOKEN_TYPES.OpenParen: {
        const expression = parseExpressionSequence();
        expect(TOKEN_TYPES.CloseParen, "Expected closing parenthesis, got ${tokens[current].type} instead.");
        return expression;
      }
      case TOKEN_TYPES.OpenSquareBracket: {
        const values = [];
        while (!is2(TOKEN_TYPES.CloseSquareBracket)) {
          values.push(parseExpression());
          if (is2(TOKEN_TYPES.Comma)) {
            ++current;
          }
        }
        ++current;
        return new ArrayLiteral(values);
      }
      case TOKEN_TYPES.OpenCurlyBracket: {
        const values = /* @__PURE__ */ new Map();
        while (!is2(TOKEN_TYPES.CloseCurlyBracket)) {
          const key = parseExpression();
          expect(TOKEN_TYPES.Colon, "Expected colon between key and value in object literal");
          const value = parseExpression();
          values.set(key, value);
          if (is2(TOKEN_TYPES.Comma)) {
            ++current;
          }
        }
        ++current;
        return new ObjectLiteral(values);
      }
      default:
        throw new SyntaxError(`Unexpected token: ${token.type}`);
    }
  }
  while (current < tokens.length) {
    program.body.push(parseAny());
  }
  return program;
}
function range(start, stop, step = 1) {
  if (stop === void 0) {
    stop = start;
    start = 0;
  }
  if (step === 0) {
    throw new Error("range() step must not be zero");
  }
  const result = [];
  if (step > 0) {
    for (let i = start; i < stop; i += step) {
      result.push(i);
    }
  } else {
    for (let i = start; i > stop; i += step) {
      result.push(i);
    }
  }
  return result;
}
function slice(array, start, stop, step = 1) {
  const direction = Math.sign(step);
  if (direction >= 0) {
    start = (start ??= 0) < 0 ? Math.max(array.length + start, 0) : Math.min(start, array.length);
    stop = (stop ??= array.length) < 0 ? Math.max(array.length + stop, 0) : Math.min(stop, array.length);
  } else {
    start = (start ??= array.length - 1) < 0 ? Math.max(array.length + start, -1) : Math.min(start, array.length - 1);
    stop = (stop ??= -1) < -1 ? Math.max(array.length + stop, -1) : Math.min(stop, array.length - 1);
  }
  const result = [];
  for (let i = start; direction * i < direction * stop; i += step) {
    result.push(array[i]);
  }
  return result;
}
function titleCase(value) {
  return value.replace(/\b\w/g, (c) => c.toUpperCase());
}
function strftime_now(format2) {
  return strftime(/* @__PURE__ */ new Date(), format2);
}
function strftime(date, format2) {
  const monthFormatterLong = new Intl.DateTimeFormat(void 0, { month: "long" });
  const monthFormatterShort = new Intl.DateTimeFormat(void 0, { month: "short" });
  const pad2 = (n) => n < 10 ? "0" + n : n.toString();
  return format2.replace(/%[YmdbBHM%]/g, (token) => {
    switch (token) {
      case "%Y":
        return date.getFullYear().toString();
      case "%m":
        return pad2(date.getMonth() + 1);
      case "%d":
        return pad2(date.getDate());
      case "%b":
        return monthFormatterShort.format(date);
      case "%B":
        return monthFormatterLong.format(date);
      case "%H":
        return pad2(date.getHours());
      case "%M":
        return pad2(date.getMinutes());
      case "%%":
        return "%";
      default:
        return token;
    }
  });
}
function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function replace(str, oldvalue, newvalue, count2) {
  if (count2 === 0) {
    return str;
  }
  let remaining = count2 == null || count2 < 0 ? Infinity : count2;
  const pattern = oldvalue.length === 0 ? new RegExp("(?=)", "gu") : new RegExp(escapeRegExp(oldvalue), "gu");
  return str.replaceAll(pattern, (match) => {
    if (remaining > 0) {
      --remaining;
      return newvalue;
    }
    return match;
  });
}
var BreakControl = class extends Error {
};
var ContinueControl = class extends Error {
};
var EMPTY_BUILTINS = /* @__PURE__ */ new Map();
var RuntimeValue = class {
  type = "RuntimeValue";
  value;
  /**
   * A collection of built-in functions for this type.
   */
  get builtins() {
    return EMPTY_BUILTINS;
  }
  /**
   * Creates a new RuntimeValue.
   */
  constructor(value = void 0) {
    this.value = value;
  }
  /**
   * Determines truthiness or falsiness of the runtime value.
   * This function should be overridden by subclasses if it has custom truthiness criteria.
   * @returns {BooleanValue} BooleanValue(true) if the value is truthy, BooleanValue(false) otherwise.
   */
  __bool__() {
    return new BooleanValue(!!this.value);
  }
  toString() {
    return String(this.value);
  }
};
var IntegerValue = class extends RuntimeValue {
  type = "IntegerValue";
};
var FloatValue = class extends RuntimeValue {
  type = "FloatValue";
  toString() {
    if (Object.is(this.value, -0)) {
      return "-0.0";
    }
    return this.value % 1 === 0 ? this.value.toFixed(1) : this.value.toString();
  }
};
var StringValue = class extends RuntimeValue {
  type = "StringValue";
  _builtins;
  get builtins() {
    return this._builtins ??= /* @__PURE__ */ new Map([
      [
        "upper",
        new FunctionValue(() => {
          return new StringValue(this.value.toUpperCase());
        })
      ],
      [
        "lower",
        new FunctionValue(() => {
          return new StringValue(this.value.toLowerCase());
        })
      ],
      [
        "strip",
        new FunctionValue(() => {
          return new StringValue(this.value.trim());
        })
      ],
      [
        "title",
        new FunctionValue(() => {
          return new StringValue(titleCase(this.value));
        })
      ],
      [
        "capitalize",
        new FunctionValue(() => {
          return new StringValue(this.value.charAt(0).toUpperCase() + this.value.slice(1));
        })
      ],
      ["length", new IntegerValue(this.value.length)],
      [
        "rstrip",
        new FunctionValue(() => {
          return new StringValue(this.value.trimEnd());
        })
      ],
      [
        "lstrip",
        new FunctionValue(() => {
          return new StringValue(this.value.trimStart());
        })
      ],
      [
        "startswith",
        new FunctionValue((args) => {
          if (args.length === 0) {
            throw new Error("startswith() requires at least one argument");
          }
          const pattern = args[0];
          if (pattern instanceof StringValue) {
            return new BooleanValue(this.value.startsWith(pattern.value));
          } else if (pattern instanceof ArrayValue) {
            for (const item of pattern.value) {
              if (!(item instanceof StringValue)) {
                throw new Error("startswith() tuple elements must be strings");
              }
              if (this.value.startsWith(item.value)) {
                return new BooleanValue(true);
              }
            }
            return new BooleanValue(false);
          }
          throw new Error("startswith() argument must be a string or tuple of strings");
        })
      ],
      [
        "endswith",
        new FunctionValue((args) => {
          if (args.length === 0) {
            throw new Error("endswith() requires at least one argument");
          }
          const pattern = args[0];
          if (pattern instanceof StringValue) {
            return new BooleanValue(this.value.endsWith(pattern.value));
          } else if (pattern instanceof ArrayValue) {
            for (const item of pattern.value) {
              if (!(item instanceof StringValue)) {
                throw new Error("endswith() tuple elements must be strings");
              }
              if (this.value.endsWith(item.value)) {
                return new BooleanValue(true);
              }
            }
            return new BooleanValue(false);
          }
          throw new Error("endswith() argument must be a string or tuple of strings");
        })
      ],
      [
        "split",
        // follows Python's `str.split(sep=None, maxsplit=-1)` function behavior
        // https://docs.python.org/3.13/library/stdtypes.html#str.split
        new FunctionValue((args) => {
          const sep = args[0] ?? new NullValue();
          if (!(sep instanceof StringValue || sep instanceof NullValue)) {
            throw new Error("sep argument must be a string or null");
          }
          const maxsplit = args[1] ?? new IntegerValue(-1);
          if (!(maxsplit instanceof IntegerValue)) {
            throw new Error("maxsplit argument must be a number");
          }
          let result = [];
          if (sep instanceof NullValue) {
            const text = this.value.trimStart();
            for (const { 0: match, index } of text.matchAll(/\S+/g)) {
              if (maxsplit.value !== -1 && result.length >= maxsplit.value && index !== void 0) {
                result.push(match + text.slice(index + match.length));
                break;
              }
              result.push(match);
            }
          } else {
            if (sep.value === "") {
              throw new Error("empty separator");
            }
            result = this.value.split(sep.value);
            if (maxsplit.value !== -1 && result.length > maxsplit.value) {
              result.push(result.splice(maxsplit.value).join(sep.value));
            }
          }
          return new ArrayValue(result.map((part) => new StringValue(part)));
        })
      ],
      [
        "replace",
        new FunctionValue((args) => {
          if (args.length < 2) {
            throw new Error("replace() requires at least two arguments");
          }
          const oldValue = args[0];
          const newValue = args[1];
          if (!(oldValue instanceof StringValue && newValue instanceof StringValue)) {
            throw new Error("replace() arguments must be strings");
          }
          let count2;
          if (args.length > 2) {
            if (args[2].type === "KeywordArgumentsValue") {
              count2 = args[2].value.get("count") ?? new NullValue();
            } else {
              count2 = args[2];
            }
          } else {
            count2 = new NullValue();
          }
          if (!(count2 instanceof IntegerValue || count2 instanceof NullValue)) {
            throw new Error("replace() count argument must be a number or null");
          }
          return new StringValue(replace(this.value, oldValue.value, newValue.value, count2.value));
        })
      ]
    ]);
  }
};
var BooleanValue = class extends RuntimeValue {
  type = "BooleanValue";
};
var NON_ASCII_CHARS = /[\x7f-\uffff]/g;
function makeAsciiSafe(str) {
  return str.replace(NON_ASCII_CHARS, (char) => "\\u" + char.charCodeAt(0).toString(16).padStart(4, "0"));
}
function toJSON(input, options = {}, depth = 0, convertUndefinedToNull = true) {
  const { indent = null, ensureAscii = false, separators = null, sortKeys = false } = options;
  let itemSeparator;
  let keySeparator;
  if (separators) {
    [itemSeparator, keySeparator] = separators;
  } else if (indent) {
    itemSeparator = ",";
    keySeparator = ": ";
  } else {
    itemSeparator = ", ";
    keySeparator = ": ";
  }
  switch (input.type) {
    case "NullValue":
      return "null";
    case "UndefinedValue":
      return convertUndefinedToNull ? "null" : "undefined";
    case "IntegerValue":
    case "FloatValue":
    case "BooleanValue":
      return JSON.stringify(input.value);
    case "StringValue": {
      let result = JSON.stringify(input.value);
      if (ensureAscii) {
        result = makeAsciiSafe(result);
      }
      return result;
    }
    case "ArrayValue":
    case "NamespaceValue":
    case "ObjectValue": {
      const indentValue = indent ? " ".repeat(indent) : "";
      const basePadding = "\n" + indentValue.repeat(depth);
      const childrenPadding = basePadding + indentValue;
      if (input.type === "ArrayValue") {
        const core = input.value.map((x) => toJSON(x, options, depth + 1, convertUndefinedToNull));
        return indent ? `[${childrenPadding}${core.join(`${itemSeparator}${childrenPadding}`)}${basePadding}]` : `[${core.join(itemSeparator)}]`;
      } else {
        let entries = Array.from(input.value.entries());
        if (sortKeys) {
          entries = entries.sort(([a], [b]) => a.localeCompare(b));
        }
        const core = entries.map(([key, value]) => {
          let keyStr = JSON.stringify(key);
          if (ensureAscii) {
            keyStr = makeAsciiSafe(keyStr);
          }
          const v = `${keyStr}${keySeparator}${toJSON(value, options, depth + 1, convertUndefinedToNull)}`;
          return indent ? `${childrenPadding}${v}` : v;
        });
        return indent ? `{${core.join(itemSeparator)}${basePadding}}` : `{${core.join(itemSeparator)}}`;
      }
    }
    default:
      throw new Error(`Cannot convert to JSON: ${input.type}`);
  }
}
var ObjectValue = class extends RuntimeValue {
  type = "ObjectValue";
  _builtins;
  /**
   * NOTE: necessary to override since all JavaScript arrays are considered truthy,
   * while only non-empty Python arrays are consider truthy.
   *
   * e.g.,
   *  - JavaScript:  {} && 5 -> 5
   *  - Python:      {} and 5 -> {}
   */
  __bool__() {
    return new BooleanValue(this.value.size > 0);
  }
  get builtins() {
    return this._builtins ??= /* @__PURE__ */ new Map([
      [
        "get",
        new FunctionValue(([key, defaultValue]) => {
          if (!(key instanceof StringValue)) {
            throw new Error(`Object key must be a string: got ${key.type}`);
          }
          return this.value.get(key.value) ?? defaultValue ?? new NullValue();
        })
      ],
      ["items", new FunctionValue(() => this.items())],
      ["keys", new FunctionValue(() => this.keys())],
      ["values", new FunctionValue(() => this.values())],
      [
        "dictsort",
        new FunctionValue((args) => {
          let kwargs = /* @__PURE__ */ new Map();
          const positionalArgs = args.filter((arg) => {
            if (arg instanceof KeywordArgumentsValue) {
              kwargs = arg.value;
              return false;
            }
            return true;
          });
          const caseSensitive = positionalArgs.at(0) ?? kwargs.get("case_sensitive") ?? new BooleanValue(false);
          if (!(caseSensitive instanceof BooleanValue)) {
            throw new Error("case_sensitive must be a boolean");
          }
          const by = positionalArgs.at(1) ?? kwargs.get("by") ?? new StringValue("key");
          if (!(by instanceof StringValue)) {
            throw new Error("by must be a string");
          }
          if (!["key", "value"].includes(by.value)) {
            throw new Error("by must be either 'key' or 'value'");
          }
          const reverse = positionalArgs.at(2) ?? kwargs.get("reverse") ?? new BooleanValue(false);
          if (!(reverse instanceof BooleanValue)) {
            throw new Error("reverse must be a boolean");
          }
          const items = Array.from(this.value.entries()).map(([key, value]) => new ArrayValue([new StringValue(key), value])).sort((a, b) => {
            const index = by.value === "key" ? 0 : 1;
            const aVal = a.value[index];
            const bVal = b.value[index];
            const result = compareRuntimeValues(aVal, bVal, caseSensitive.value);
            return reverse.value ? -result : result;
          });
          return new ArrayValue(items);
        })
      ]
    ]);
  }
  items() {
    return new ArrayValue(
      Array.from(this.value.entries()).map(([key, value]) => new ArrayValue([new StringValue(key), value]))
    );
  }
  keys() {
    return new ArrayValue(Array.from(this.value.keys()).map((key) => new StringValue(key)));
  }
  values() {
    return new ArrayValue(Array.from(this.value.values()));
  }
  toString() {
    return toJSON(this, {}, 0, false);
  }
};
var KeywordArgumentsValue = class extends ObjectValue {
  type = "KeywordArgumentsValue";
};
var NamespaceValue = class extends RuntimeValue {
  type = "NamespaceValue";
  toString() {
    return toJSON(this, {}, 0, false);
  }
};
var ArrayValue = class extends RuntimeValue {
  type = "ArrayValue";
  _builtins;
  get builtins() {
    return this._builtins ??= /* @__PURE__ */ new Map([["length", new IntegerValue(this.value.length)]]);
  }
  /**
   * NOTE: necessary to override since all JavaScript arrays are considered truthy,
   * while only non-empty Python arrays are consider truthy.
   *
   * e.g.,
   *  - JavaScript:  [] && 5 -> 5
   *  - Python:      [] and 5 -> []
   */
  __bool__() {
    return new BooleanValue(this.value.length > 0);
  }
  toString() {
    return toJSON(this, {}, 0, false);
  }
};
var TupleValue = class extends ArrayValue {
  type = "TupleValue";
};
var FunctionValue = class extends RuntimeValue {
  type = "FunctionValue";
};
var NullValue = class extends RuntimeValue {
  type = "NullValue";
};
var UndefinedValue = class extends RuntimeValue {
  type = "UndefinedValue";
};
function normalizeNamespaceEntry(pair) {
  let values;
  if (pair instanceof ArrayValue) {
    values = pair.value;
  } else if (pair instanceof StringValue) {
    values = Array.from(pair.value, (char) => new StringValue(char));
  }
  if (!values || values.length !== 2) {
    throw new Error("namespace expected an object or an iterable of [key, value] pairs");
  }
  const [key, value] = values;
  if (!(key instanceof StringValue)) {
    throw new Error("namespace keys must be strings");
  }
  return [key, value];
}
var _Environment = class {
  constructor(parent) {
    this.parent = parent;
  }
  /**
   * The variables declared in this environment.
   */
  variables = /* @__PURE__ */ new Map([
    [
      "namespace",
      new FunctionValue((args) => {
        const positional = args.slice();
        let kwargs;
        if (positional.at(-1) instanceof KeywordArgumentsValue) {
          kwargs = positional.pop();
        }
        if (positional.length > 1) {
          throw new Error(`namespace expected at most 1 argument, got ${positional.length}`);
        }
        const entries = /* @__PURE__ */ new Map();
        if (positional.length === 1) {
          const source = positional[0];
          if (source instanceof ObjectValue) {
            for (const [key, value] of source.value) {
              entries.set(key, value);
            }
          } else if (source instanceof ArrayValue) {
            for (const pair of source.value) {
              const [key, value] = normalizeNamespaceEntry(pair);
              entries.set(key.value, value);
            }
          } else {
            throw new Error(`'${source.type}' object is not iterable`);
          }
        }
        if (kwargs) {
          for (const [key, value] of kwargs.value) {
            entries.set(key, value);
          }
        }
        return new NamespaceValue(entries);
      })
    ]
  ]);
  tests = _Environment.TESTS;
  /**
   * Set the value of a variable in the current environment.
   */
  set(name2, value) {
    return this.declareVariable(name2, convertToRuntimeValues(value));
  }
  declareVariable(name2, value) {
    if (this.variables.has(name2)) {
      throw new SyntaxError(`Variable already declared: ${name2}`);
    }
    this.variables.set(name2, value);
    return value;
  }
  // private assignVariable(name: string, value: AnyRuntimeValue): AnyRuntimeValue {
  // 	const env = this.resolve(name);
  // 	env.variables.set(name, value);
  // 	return value;
  // }
  /**
   * Set variable in the current scope.
   * See https://jinja.palletsprojects.com/en/3.0.x/templates/#assignments for more information.
   */
  setVariable(name2, value) {
    this.variables.set(name2, value);
    return value;
  }
  /**
   * Resolve the environment in which the variable is declared.
   * @param {string} name The name of the variable.
   * @returns {Environment} The environment in which the variable is declared.
   */
  resolve(name2) {
    if (this.variables.has(name2)) {
      return this;
    }
    if (this.parent) {
      return this.parent.resolve(name2);
    }
    throw new Error(`Unknown variable: ${name2}`);
  }
  lookupVariable(name2) {
    try {
      return this.resolve(name2).variables.get(name2) ?? new UndefinedValue();
    } catch {
      return new UndefinedValue();
    }
  }
};
var Environment = _Environment;
__publicField(Environment, "TESTS", /* @__PURE__ */ new Map([
  ["boolean", (operand) => operand.type === "BooleanValue"],
  ["callable", (operand) => operand instanceof FunctionValue],
  [
    "odd",
    (operand) => {
      if (!(operand instanceof IntegerValue)) {
        throw new Error(`cannot odd on ${operand.type}`);
      }
      return operand.value % 2 !== 0;
    }
  ],
  [
    "even",
    (operand) => {
      if (!(operand instanceof IntegerValue)) {
        throw new Error(`cannot even on ${operand.type}`);
      }
      return operand.value % 2 === 0;
    }
  ],
  ["false", (operand) => operand.type === "BooleanValue" && !operand.value],
  ["true", (operand) => operand.type === "BooleanValue" && operand.value],
  ["none", (operand) => operand.type === "NullValue"],
  ["string", (operand) => operand.type === "StringValue"],
  ["number", (operand) => operand instanceof IntegerValue || operand instanceof FloatValue],
  ["integer", (operand) => operand instanceof IntegerValue],
  ["iterable", (operand) => operand.type === "ArrayValue" || operand.type === "StringValue"],
  ["mapping", (operand) => operand instanceof ObjectValue],
  [
    "sequence",
    (operand) => operand instanceof ArrayValue || operand instanceof ObjectValue || operand instanceof StringValue
  ],
  [
    "lower",
    (operand) => {
      const str = operand.value;
      return operand.type === "StringValue" && str === str.toLowerCase();
    }
  ],
  [
    "upper",
    (operand) => {
      const str = operand.value;
      return operand.type === "StringValue" && str === str.toUpperCase();
    }
  ],
  ["none", (operand) => operand.type === "NullValue"],
  ["defined", (operand) => operand.type !== "UndefinedValue"],
  ["undefined", (operand) => operand.type === "UndefinedValue"],
  ["equalto", (a, b) => a.value === b.value],
  ["eq", (a, b) => a.value === b.value]
]));
function setupGlobals(env2) {
  env2.set("false", false);
  env2.set("true", true);
  env2.set("none", null);
  env2.set("raise_exception", (args) => {
    throw new Error(args);
  });
  env2.set("range", range);
  env2.set("strftime_now", strftime_now);
  env2.set("True", true);
  env2.set("False", false);
  env2.set("None", null);
}
function isAttributeContainer(value) {
  return value instanceof ObjectValue || value instanceof NamespaceValue;
}
function isNumericLikeValue(value) {
  return value instanceof IntegerValue || value instanceof FloatValue || value instanceof BooleanValue;
}
function getNumericValue(value) {
  return value instanceof BooleanValue ? Number(value.value) : value.value;
}
function getAttributeValue(item, attributePath) {
  const parts = attributePath.split(".");
  let value = item;
  for (const part of parts) {
    if (isAttributeContainer(value)) {
      value = value.value.get(part) ?? new UndefinedValue();
    } else if (value instanceof ArrayValue) {
      const index = parseInt(part, 10);
      if (!isNaN(index) && index >= 0 && index < value.value.length) {
        value = value.value[index];
      } else {
        return new UndefinedValue();
      }
    } else {
      return new UndefinedValue();
    }
  }
  return value;
}
function compareRuntimeValues(a, b, caseSensitive = false) {
  if (a instanceof NullValue && b instanceof NullValue) {
    return 0;
  }
  if (a instanceof NullValue || b instanceof NullValue) {
    throw new Error(`Cannot compare ${a.type} with ${b.type}`);
  }
  if (a instanceof UndefinedValue && b instanceof UndefinedValue) {
    return 0;
  }
  if (a instanceof UndefinedValue || b instanceof UndefinedValue) {
    throw new Error(`Cannot compare ${a.type} with ${b.type}`);
  }
  if (isNumericLikeValue(a) && isNumericLikeValue(b)) {
    const aNum = getNumericValue(a);
    const bNum = getNumericValue(b);
    return aNum < bNum ? -1 : aNum > bNum ? 1 : 0;
  }
  if (a.type !== b.type) {
    throw new Error(`Cannot compare different types: ${a.type} and ${b.type}`);
  }
  switch (a.type) {
    case "StringValue": {
      let aStr = a.value;
      let bStr = b.value;
      if (!caseSensitive) {
        aStr = aStr.toLowerCase();
        bStr = bStr.toLowerCase();
      }
      return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
    }
    default:
      throw new Error(`Cannot compare type: ${a.type}`);
  }
}
function getParameterDescriptor(argument) {
  if (argument.type === "Identifier") {
    return { name: argument.value };
  }
  const keywordArgument = argument;
  return { name: keywordArgument.key.value, defaultValue: keywordArgument.value };
}
function isSpecialMacroArgument(name2) {
  return name2 === "kwargs" || name2 === "varargs";
}
function findAccessedSpecialMacroArguments(parameters, body) {
  const declared = /* @__PURE__ */ new Set();
  const accessed = /* @__PURE__ */ new Set();
  const declareName = (name2) => {
    if (isSpecialMacroArgument(name2)) {
      declared.add(name2);
    }
  };
  const declareTarget = (target) => {
    if (target.type === "Identifier") {
      declareName(target.value);
    } else if (target.type === "TupleLiteral") {
      for (const item of target.value) {
        declareTarget(item);
      }
    }
  };
  const declareArgument = (argument) => {
    declareName(getParameterDescriptor(argument).name);
  };
  const visitArgumentDefaults = (args) => {
    for (const argument of args) {
      const parameter = getParameterDescriptor(argument);
      if (parameter.defaultValue) {
        visit(parameter.defaultValue);
      }
    }
  };
  const visitFilter = (filter) => {
    if (filter.type === "CallExpression") {
      visit(filter.args);
    }
  };
  const visit = (node) => {
    if (Array.isArray(node)) {
      for (const item of node) {
        visit(item);
      }
      return;
    }
    if (node instanceof Map) {
      for (const [key, value] of node) {
        visit(key);
        visit(value);
      }
      return;
    }
    if (!(node instanceof Statement)) {
      return;
    }
    switch (node.type) {
      case "For": {
        const statement = node;
        declareTarget(statement.loopvar);
        if (statement.iterable.type === "SelectExpression") {
          const iterable = statement.iterable;
          visit(iterable.lhs);
          visit(statement.body);
          visit(statement.defaultBlock);
          visit(iterable.test);
          return;
        }
        visit(statement.iterable);
        visit(statement.body);
        visit(statement.defaultBlock);
        return;
      }
      case "Set": {
        const statement = node;
        declareTarget(statement.assignee);
        visit(statement.value);
        visit(statement.body);
        return;
      }
      case "Macro": {
        const statement = node;
        for (const argument of statement.args) {
          declareArgument(argument);
        }
        visitArgumentDefaults(statement.args);
        visit(statement.body);
        return;
      }
      case "CallStatement": {
        const statement = node;
        visit(statement.call);
        for (const argument of statement.callerArgs ?? []) {
          declareArgument(argument);
        }
        visitArgumentDefaults(statement.callerArgs ?? []);
        visit(statement.body);
        return;
      }
      case "FilterStatement": {
        const statement = node;
        visit(statement.body);
        visitFilter(statement.filter);
        return;
      }
      case "Identifier": {
        const name2 = node.value;
        if (isSpecialMacroArgument(name2) && !declared.has(name2)) {
          accessed.add(name2);
        }
        return;
      }
      case "MemberExpression": {
        const expression = node;
        visit(expression.object);
        if (expression.computed) {
          visit(expression.property);
        }
        return;
      }
      case "FilterExpression": {
        const expression = node;
        visit(expression.operand);
        visitFilter(expression.filter);
        return;
      }
      case "TestExpression":
        visit(node.operand);
        return;
      case "SelectExpression": {
        const expression = node;
        visit(expression.test);
        visit(expression.lhs);
        return;
      }
      case "KeywordArgumentExpression":
        visit(node.value);
        return;
      default:
        for (const child of Object.values(node)) {
          visit(child);
        }
    }
  };
  for (const parameter of parameters) {
    declareArgument(parameter);
  }
  visit(body);
  return accessed;
}
var Interpreter = class {
  global;
  constructor(env2) {
    this.global = env2 ?? new Environment();
  }
  /**
   * Run the program.
   */
  run(program) {
    return this.evaluate(program, this.global);
  }
  /**
   * Evaluates expressions following the binary operation type.
   */
  evaluateBinaryExpression(node, environment) {
    const left = this.evaluate(node.left, environment);
    switch (node.operator.value) {
      case "and":
        return left.__bool__().value ? this.evaluate(node.right, environment) : left;
      case "or":
        return left.__bool__().value ? left : this.evaluate(node.right, environment);
    }
    const right = this.evaluate(node.right, environment);
    switch (node.operator.value) {
      case "==":
        return new BooleanValue(left.value == right.value);
      case "!=":
        return new BooleanValue(left.value != right.value);
    }
    if (left instanceof UndefinedValue || right instanceof UndefinedValue) {
      if (right instanceof UndefinedValue && ["in", "not in"].includes(node.operator.value)) {
        return new BooleanValue(node.operator.value === "not in");
      }
      throw new Error(`Cannot perform operation ${node.operator.value} on undefined values`);
    } else if (left instanceof NullValue || right instanceof NullValue) {
      throw new Error("Cannot perform operation on null values");
    } else if (node.operator.value === "~") {
      return new StringValue(left.value.toString() + right.value.toString());
    } else if (node.operator.value === "**" && isNumericLikeValue(left) && isNumericLikeValue(right)) {
      const a = getNumericValue(left);
      const b = getNumericValue(right);
      if (a === 0 && b < 0) {
        throw new Error("0.0 cannot be raised to a negative power");
      }
      const result = a ** b;
      if (!Number.isFinite(result)) {
        throw new Error("Exponentiation result is not a finite real number");
      }
      const isFloat = left instanceof FloatValue || right instanceof FloatValue || b < 0;
      return isFloat ? new FloatValue(result) : new IntegerValue(result);
    } else if ((left instanceof IntegerValue || left instanceof FloatValue) && (right instanceof IntegerValue || right instanceof FloatValue)) {
      const a = left.value, b = right.value;
      switch (node.operator.value) {
        case "+":
        case "-":
        case "*": {
          const res = node.operator.value === "+" ? a + b : node.operator.value === "-" ? a - b : a * b;
          const isFloat = left instanceof FloatValue || right instanceof FloatValue;
          return isFloat ? new FloatValue(res) : new IntegerValue(res);
        }
        case "/":
          return new FloatValue(a / b);
        case "//": {
          const res = Math.floor(a / b);
          const isFloat = left instanceof FloatValue || right instanceof FloatValue;
          return isFloat ? new FloatValue(res) : new IntegerValue(res);
        }
        case "%": {
          const rem = a % b;
          const isFloat = left instanceof FloatValue || right instanceof FloatValue;
          return isFloat ? new FloatValue(rem) : new IntegerValue(rem);
        }
        case "<":
          return new BooleanValue(a < b);
        case ">":
          return new BooleanValue(a > b);
        case ">=":
          return new BooleanValue(a >= b);
        case "<=":
          return new BooleanValue(a <= b);
      }
    } else if (left instanceof ArrayValue && right instanceof ArrayValue) {
      switch (node.operator.value) {
        case "+":
          return new ArrayValue(left.value.concat(right.value));
      }
    } else if (right instanceof ArrayValue) {
      const member = right.value.find((x) => x.value === left.value) !== void 0;
      switch (node.operator.value) {
        case "in":
          return new BooleanValue(member);
        case "not in":
          return new BooleanValue(!member);
      }
    }
    if (left instanceof StringValue || right instanceof StringValue) {
      switch (node.operator.value) {
        case "+":
          return new StringValue(left.value.toString() + right.value.toString());
      }
    }
    if (left instanceof StringValue && right instanceof StringValue) {
      switch (node.operator.value) {
        case "in":
          return new BooleanValue(right.value.includes(left.value));
        case "not in":
          return new BooleanValue(!right.value.includes(left.value));
      }
    }
    if (left instanceof StringValue && right instanceof ObjectValue) {
      switch (node.operator.value) {
        case "in":
          return new BooleanValue(right.value.has(left.value));
        case "not in":
          return new BooleanValue(!right.value.has(left.value));
      }
    }
    throw new SyntaxError(`Unknown operator "${node.operator.value}" between ${left.type} and ${right.type}`);
  }
  evaluateArguments(args, environment) {
    const positionalArguments = [];
    const keywordArguments = /* @__PURE__ */ new Map();
    const addKeywordArgument = (key, value) => {
      if (keywordArguments.has(key)) {
        throw new Error(`Got multiple values for keyword argument '${key}'`);
      }
      keywordArguments.set(key, value);
    };
    for (const argument of args) {
      if (argument.type === "SpreadExpression") {
        const spreadNode = argument;
        const val = this.evaluate(spreadNode.argument, environment);
        if (!(val instanceof ArrayValue)) {
          throw new Error(`Cannot unpack non-iterable type: ${val.type}`);
        }
        for (const item of val.value) {
          positionalArguments.push(item);
        }
      } else if (argument.type !== "KeywordArgumentExpression" && argument.type !== "KeywordSpreadExpression") {
        positionalArguments.push(this.evaluate(argument, environment));
      }
    }
    for (const argument of args) {
      if (argument.type === "KeywordArgumentExpression") {
        const kwarg = argument;
        addKeywordArgument(kwarg.key.value, this.evaluate(kwarg.value, environment));
      } else if (argument.type === "KeywordSpreadExpression") {
        const spreadNode = argument;
        const val = this.evaluate(spreadNode.argument, environment);
        if (!(val instanceof ObjectValue)) {
          throw new Error(`Argument after ** must be a mapping, not ${val.type}`);
        }
        for (const [key, value] of val.value) {
          addKeywordArgument(key, value);
        }
      }
    }
    return [positionalArguments, keywordArguments];
  }
  applyFilter(operand, filterNode, environment) {
    if (filterNode.type === "Identifier") {
      const filter = filterNode;
      if (filter.value === "safe") {
        return operand;
      }
      if (filter.value === "tojson") {
        return new StringValue(toJSON(operand, {}));
      }
      if (operand instanceof ArrayValue) {
        switch (filter.value) {
          case "list":
            return operand;
          case "first":
            return operand.value[0];
          case "last":
            return operand.value[operand.value.length - 1];
          case "length":
            return new IntegerValue(operand.value.length);
          case "reverse":
            return new ArrayValue(operand.value.slice().reverse());
          case "sort": {
            return new ArrayValue(operand.value.slice().sort((a, b) => compareRuntimeValues(a, b, false)));
          }
          case "join":
            return new StringValue(operand.value.map((x) => x.value).join(""));
          case "string":
            return new StringValue(toJSON(operand, {}, 0, false));
          case "unique": {
            const seen = /* @__PURE__ */ new Set();
            const output = [];
            for (const item of operand.value) {
              if (!seen.has(item.value)) {
                seen.add(item.value);
                output.push(item);
              }
            }
            return new ArrayValue(output);
          }
          default:
            throw new Error(`Unknown ArrayValue filter: ${filter.value}`);
        }
      } else if (operand instanceof StringValue) {
        switch (filter.value) {
          case "length":
          case "upper":
          case "lower":
          case "title":
          case "capitalize": {
            const builtin = operand.builtins.get(filter.value);
            if (builtin instanceof FunctionValue) {
              return builtin.value(
                /* no arguments */
                [],
                environment
              );
            } else if (builtin instanceof IntegerValue) {
              return builtin;
            } else {
              throw new Error(`Unknown StringValue filter: ${filter.value}`);
            }
          }
          case "trim":
            return new StringValue(operand.value.trim());
          case "indent":
            return new StringValue(
              operand.value.split("\n").map(
                (x, i) => (
                  // By default, don't indent the first line or empty lines
                  i === 0 || x.length === 0 ? x : "    " + x
                )
              ).join("\n")
            );
          case "join":
          case "string":
            return operand;
          case "int": {
            const val = parseInt(operand.value, 10);
            return new IntegerValue(isNaN(val) ? 0 : val);
          }
          case "float": {
            const val = parseFloat(operand.value);
            return new FloatValue(isNaN(val) ? 0 : val);
          }
          default:
            throw new Error(`Unknown StringValue filter: ${filter.value}`);
        }
      } else if (operand instanceof IntegerValue || operand instanceof FloatValue) {
        switch (filter.value) {
          case "abs":
            return operand instanceof IntegerValue ? new IntegerValue(Math.abs(operand.value)) : new FloatValue(Math.abs(operand.value));
          case "int":
            return new IntegerValue(Math.floor(operand.value));
          case "float":
            return new FloatValue(operand.value);
          case "string":
            return new StringValue(operand.toString());
          default:
            throw new Error(`Unknown NumericValue filter: ${filter.value}`);
        }
      } else if (operand instanceof ObjectValue) {
        switch (filter.value) {
          case "items":
            return new ArrayValue(
              Array.from(operand.value.entries()).map(([key, value]) => new ArrayValue([new StringValue(key), value]))
            );
          case "length":
            return new IntegerValue(operand.value.size);
          default: {
            const builtin = operand.builtins.get(filter.value);
            if (builtin) {
              if (builtin instanceof FunctionValue) {
                return builtin.value([], environment);
              }
              return builtin;
            }
            throw new Error(`Unknown ObjectValue filter: ${filter.value}`);
          }
        }
      } else if (operand instanceof BooleanValue) {
        switch (filter.value) {
          case "bool":
            return new BooleanValue(operand.value);
          case "int":
            return new IntegerValue(operand.value ? 1 : 0);
          case "float":
            return new FloatValue(operand.value ? 1 : 0);
          case "string":
            return new StringValue(operand.value ? "true" : "false");
          default:
            throw new Error(`Unknown BooleanValue filter: ${filter.value}`);
        }
      }
      throw new Error(`Cannot apply filter "${filter.value}" to type: ${operand.type}`);
    } else if (filterNode.type === "CallExpression") {
      const filter = filterNode;
      if (filter.callee.type !== "Identifier") {
        throw new Error(`Unknown filter: ${filter.callee.type}`);
      }
      const filterName = filter.callee.value;
      if (filterName === "tojson") {
        const [, kwargs] = this.evaluateArguments(filter.args, environment);
        const indent = kwargs.get("indent") ?? new NullValue();
        if (!(indent instanceof IntegerValue || indent instanceof NullValue)) {
          throw new Error("If set, indent must be a number");
        }
        const ensureAscii = kwargs.get("ensure_ascii") ?? new BooleanValue(false);
        if (!(ensureAscii instanceof BooleanValue)) {
          throw new Error("If set, ensure_ascii must be a boolean");
        }
        const sortKeys = kwargs.get("sort_keys") ?? new BooleanValue(false);
        if (!(sortKeys instanceof BooleanValue)) {
          throw new Error("If set, sort_keys must be a boolean");
        }
        const separatorsArg = kwargs.get("separators") ?? new NullValue();
        let separators = null;
        if (separatorsArg instanceof ArrayValue || separatorsArg instanceof TupleValue) {
          if (separatorsArg.value.length !== 2) {
            throw new Error("separators must be a tuple of two strings");
          }
          const [itemSep, keySep] = separatorsArg.value;
          if (!(itemSep instanceof StringValue) || !(keySep instanceof StringValue)) {
            throw new Error("separators must be a tuple of two strings");
          }
          separators = [itemSep.value, keySep.value];
        } else if (!(separatorsArg instanceof NullValue)) {
          throw new Error("If set, separators must be a tuple of two strings");
        }
        return new StringValue(
          toJSON(operand, {
            indent: indent.value,
            ensureAscii: ensureAscii.value,
            sortKeys: sortKeys.value,
            separators
          })
        );
      } else if (filterName === "join") {
        let value;
        if (operand instanceof StringValue) {
          value = Array.from(operand.value);
        } else if (operand instanceof ArrayValue) {
          value = operand.value.map((x) => x.value);
        } else {
          throw new Error(`Cannot apply filter "${filterName}" to type: ${operand.type}`);
        }
        const [args, kwargs] = this.evaluateArguments(filter.args, environment);
        const separator = args.at(0) ?? kwargs.get("separator") ?? new StringValue("");
        if (!(separator instanceof StringValue)) {
          throw new Error("separator must be a string");
        }
        return new StringValue(value.join(separator.value));
      } else if (filterName === "int" || filterName === "float") {
        const [args, kwargs] = this.evaluateArguments(filter.args, environment);
        const defaultValue = args.at(0) ?? kwargs.get("default") ?? (filterName === "int" ? new IntegerValue(0) : new FloatValue(0));
        if (operand instanceof StringValue) {
          const val = filterName === "int" ? parseInt(operand.value, 10) : parseFloat(operand.value);
          return isNaN(val) ? defaultValue : filterName === "int" ? new IntegerValue(val) : new FloatValue(val);
        } else if (operand instanceof IntegerValue || operand instanceof FloatValue) {
          return operand;
        } else if (operand instanceof BooleanValue) {
          return filterName === "int" ? new IntegerValue(operand.value ? 1 : 0) : new FloatValue(operand.value ? 1 : 0);
        } else {
          throw new Error(`Cannot apply filter "${filterName}" to type: ${operand.type}`);
        }
      } else if (filterName === "default") {
        const [args, kwargs] = this.evaluateArguments(filter.args, environment);
        const defaultValue = args[0] ?? new StringValue("");
        const booleanValue = args[1] ?? kwargs.get("boolean") ?? new BooleanValue(false);
        if (!(booleanValue instanceof BooleanValue)) {
          throw new Error("`default` filter flag must be a boolean");
        }
        if (operand instanceof UndefinedValue || booleanValue.value && !operand.__bool__().value) {
          return defaultValue;
        }
        return operand;
      }
      if (operand instanceof ArrayValue) {
        switch (filterName) {
          case "sort": {
            const [args, kwargs] = this.evaluateArguments(filter.args, environment);
            const reverse = args.at(0) ?? kwargs.get("reverse") ?? new BooleanValue(false);
            if (!(reverse instanceof BooleanValue)) {
              throw new Error("reverse must be a boolean");
            }
            const caseSensitive = args.at(1) ?? kwargs.get("case_sensitive") ?? new BooleanValue(false);
            if (!(caseSensitive instanceof BooleanValue)) {
              throw new Error("case_sensitive must be a boolean");
            }
            const attribute = args.at(2) ?? kwargs.get("attribute") ?? new NullValue();
            if (!(attribute instanceof StringValue || attribute instanceof IntegerValue || attribute instanceof NullValue)) {
              throw new Error("attribute must be a string, integer, or null");
            }
            const getSortValue = (item) => {
              if (attribute instanceof NullValue) {
                return item;
              }
              const attrPath = attribute instanceof IntegerValue ? String(attribute.value) : attribute.value;
              return getAttributeValue(item, attrPath);
            };
            return new ArrayValue(
              operand.value.slice().sort((a, b) => {
                const aVal = getSortValue(a);
                const bVal = getSortValue(b);
                const result = compareRuntimeValues(aVal, bVal, caseSensitive.value);
                return reverse.value ? -result : result;
              })
            );
          }
          case "selectattr":
          case "rejectattr": {
            const select = filterName === "selectattr";
            if (operand.value.some((item) => !isAttributeContainer(item))) {
              throw new Error(`\`${filterName}\` can only be applied to array of objects`);
            }
            if (filter.args.some((x) => x.type !== "StringLiteral")) {
              throw new Error(`arguments of \`${filterName}\` must be strings`);
            }
            const [attr, testName, value] = filter.args.map((x) => this.evaluate(x, environment));
            let testFunction;
            if (testName) {
              const test = environment.tests.get(testName.value);
              if (!test) {
                throw new Error(`Unknown test: ${testName.value}`);
              }
              testFunction = test;
            } else {
              testFunction = (...x) => x[0].__bool__().value;
            }
            const filtered = operand.value.filter((item) => {
              const a = item.value.get(attr.value);
              const result = a ? testFunction(a, value) : false;
              return select ? result : !result;
            });
            return new ArrayValue(filtered);
          }
          case "map": {
            const [, kwargs] = this.evaluateArguments(filter.args, environment);
            if (kwargs.has("attribute")) {
              const attr = kwargs.get("attribute");
              if (!(attr instanceof StringValue)) {
                throw new Error("attribute must be a string");
              }
              const defaultValue = kwargs.get("default");
              const mapped = operand.value.map((item) => {
                if (!isAttributeContainer(item)) {
                  throw new Error("items in map must be an object");
                }
                const value = getAttributeValue(item, attr.value);
                return value instanceof UndefinedValue ? defaultValue ?? new UndefinedValue() : value;
              });
              return new ArrayValue(mapped);
            } else {
              throw new Error("`map` expressions without `attribute` set are not currently supported.");
            }
          }
        }
        throw new Error(`Unknown ArrayValue filter: ${filterName}`);
      } else if (operand instanceof StringValue) {
        switch (filterName) {
          case "indent": {
            const [args, kwargs] = this.evaluateArguments(filter.args, environment);
            const width = args.at(0) ?? kwargs.get("width") ?? new IntegerValue(4);
            if (!(width instanceof IntegerValue)) {
              throw new Error("width must be a number");
            }
            const first = args.at(1) ?? kwargs.get("first") ?? new BooleanValue(false);
            const blank = args.at(2) ?? kwargs.get("blank") ?? new BooleanValue(false);
            const lines = operand.value.split("\n");
            const indent = " ".repeat(width.value);
            const indented = lines.map(
              (x, i) => !first.value && i === 0 || !blank.value && x.length === 0 ? x : indent + x
            );
            return new StringValue(indented.join("\n"));
          }
          case "replace": {
            const replaceFn = operand.builtins.get("replace");
            if (!(replaceFn instanceof FunctionValue)) {
              throw new Error("replace filter not available");
            }
            const [args, kwargs] = this.evaluateArguments(filter.args, environment);
            return replaceFn.value([...args, new KeywordArgumentsValue(kwargs)], environment);
          }
        }
        throw new Error(`Unknown StringValue filter: ${filterName}`);
      } else if (operand instanceof ObjectValue) {
        const builtin = operand.builtins.get(filterName);
        if (builtin && builtin instanceof FunctionValue) {
          const [args, kwargs] = this.evaluateArguments(filter.args, environment);
          if (kwargs.size > 0) {
            args.push(new KeywordArgumentsValue(kwargs));
          }
          return builtin.value(args, environment);
        }
        throw new Error(`Unknown ObjectValue filter: ${filterName}`);
      } else {
        throw new Error(`Cannot apply filter "${filterName}" to type: ${operand.type}`);
      }
    }
    throw new Error(`Unknown filter: ${filterNode.type}`);
  }
  /**
   * Evaluates expressions following the filter operation type.
   */
  evaluateFilterExpression(node, environment) {
    const operand = this.evaluate(node.operand, environment);
    return this.applyFilter(operand, node.filter, environment);
  }
  /**
   * Evaluates expressions following the test operation type.
   */
  evaluateTestExpression(node, environment) {
    const operand = this.evaluate(node.operand, environment);
    const test = environment.tests.get(node.test.value);
    if (!test) {
      throw new Error(`Unknown test: ${node.test.value}`);
    }
    const result = test(operand);
    return new BooleanValue(node.negate ? !result : result);
  }
  /**
   * Evaluates expressions following the select operation type.
   */
  evaluateSelectExpression(node, environment) {
    const predicate = this.evaluate(node.test, environment);
    if (!predicate.__bool__().value) {
      return new UndefinedValue();
    }
    return this.evaluate(node.lhs, environment);
  }
  /**
   * Evaluates expressions following the unary operation type.
   */
  evaluateUnaryExpression(node, environment) {
    const argument = this.evaluate(node.argument, environment);
    switch (node.operator.value) {
      case "not":
        return new BooleanValue(!argument.value);
      case "+":
      case "-": {
        const sign = node.operator.value === "-" ? -1 : 1;
        if (argument instanceof IntegerValue || argument instanceof FloatValue || argument instanceof BooleanValue) {
          const value = argument instanceof BooleanValue ? argument.value ? 1 : 0 : argument.value;
          const result = sign * value;
          return argument instanceof FloatValue ? new FloatValue(result) : new IntegerValue(result);
        }
        throw new SyntaxError(`Unknown operator "${node.operator.value}" for ${argument.type}`);
      }
      default:
        throw new SyntaxError(`Unknown operator: ${node.operator.value}`);
    }
  }
  evaluateTernaryExpression(node, environment) {
    const cond = this.evaluate(node.condition, environment);
    return cond.__bool__().value ? this.evaluate(node.trueExpr, environment) : this.evaluate(node.falseExpr, environment);
  }
  evalProgram(program, environment) {
    return this.evaluateBlock(program.body, environment);
  }
  evaluateBlock(statements, environment) {
    let result = "";
    for (const statement of statements) {
      const lastEvaluated = this.evaluate(statement, environment);
      if (lastEvaluated.type !== "NullValue" && lastEvaluated.type !== "UndefinedValue") {
        result += lastEvaluated.toString();
      }
    }
    return new StringValue(result);
  }
  evaluateIdentifier(node, environment) {
    return environment.lookupVariable(node.value);
  }
  evaluateCallExpression(expr, environment) {
    const [args, kwargs] = this.evaluateArguments(expr.args, environment);
    if (kwargs.size > 0) {
      args.push(new KeywordArgumentsValue(kwargs));
    }
    const fn2 = this.evaluate(expr.callee, environment);
    if (fn2.type !== "FunctionValue") {
      throw new Error(`Cannot call something that is not a function: got ${fn2.type}`);
    }
    return fn2.value(args, environment);
  }
  evaluateSliceExpression(object, expr, environment) {
    if (!(object instanceof ArrayValue || object instanceof StringValue)) {
      throw new Error("Slice object must be an array or string");
    }
    const start = this.evaluate(expr.start, environment);
    const stop = this.evaluate(expr.stop, environment);
    const step = this.evaluate(expr.step, environment);
    if (!(start instanceof IntegerValue || start instanceof UndefinedValue)) {
      throw new Error("Slice start must be numeric or undefined");
    }
    if (!(stop instanceof IntegerValue || stop instanceof UndefinedValue)) {
      throw new Error("Slice stop must be numeric or undefined");
    }
    if (!(step instanceof IntegerValue || step instanceof UndefinedValue)) {
      throw new Error("Slice step must be numeric or undefined");
    }
    if (object instanceof ArrayValue) {
      return new ArrayValue(slice(object.value, start.value, stop.value, step.value));
    } else {
      return new StringValue(slice(Array.from(object.value), start.value, stop.value, step.value).join(""));
    }
  }
  evaluateMemberExpression(expr, environment) {
    const object = this.evaluate(expr.object, environment);
    let property;
    if (expr.computed) {
      if (expr.property.type === "SliceExpression") {
        return this.evaluateSliceExpression(object, expr.property, environment);
      } else {
        property = this.evaluate(expr.property, environment);
      }
    } else if (expr.property.type === "IntegerLiteral") {
      property = new IntegerValue(expr.property.value);
    } else {
      property = new StringValue(expr.property.value);
    }
    let value;
    if (isAttributeContainer(object)) {
      if (!(property instanceof StringValue)) {
        throw new Error(`Cannot access property with non-string: got ${property.type}`);
      }
      value = object.value.get(property.value) ?? (object instanceof ObjectValue ? object.builtins.get(property.value) : void 0);
    } else if (object instanceof ArrayValue || object instanceof StringValue) {
      if (property instanceof IntegerValue) {
        value = object.value.at(property.value);
        if (object instanceof StringValue) {
          value = new StringValue(object.value.at(property.value));
        }
      } else if (property instanceof StringValue) {
        value = object.builtins.get(property.value);
      } else {
        throw new Error(`Cannot access property with non-string/non-number: got ${property.type}`);
      }
    } else {
      if (!(property instanceof StringValue)) {
        throw new Error(`Cannot access property with non-string: got ${property.type}`);
      }
      value = object.builtins.get(property.value);
    }
    return value instanceof RuntimeValue ? value : new UndefinedValue();
  }
  evaluateSet(node, environment) {
    const rhs = node.value ? this.evaluate(node.value, environment) : this.evaluateBlock(node.body, environment);
    if (node.assignee.type === "Identifier") {
      const variableName = node.assignee.value;
      environment.setVariable(variableName, rhs);
    } else if (node.assignee.type === "TupleLiteral") {
      const tuple = node.assignee;
      if (!(rhs instanceof ArrayValue)) {
        throw new Error(`Cannot unpack non-iterable type in set: ${rhs.type}`);
      }
      const arr = rhs.value;
      if (arr.length !== tuple.value.length) {
        throw new Error(`Too ${tuple.value.length > arr.length ? "few" : "many"} items to unpack in set`);
      }
      for (let i = 0; i < tuple.value.length; ++i) {
        const elem = tuple.value[i];
        if (elem.type !== "Identifier") {
          throw new Error(`Cannot unpack to non-identifier in set: ${elem.type}`);
        }
        environment.setVariable(elem.value, arr[i]);
      }
    } else if (node.assignee.type === "MemberExpression") {
      const member = node.assignee;
      const object = this.evaluate(member.object, environment);
      if (!(object instanceof NamespaceValue)) {
        throw new Error("cannot assign attribute on non-namespace object");
      }
      if (member.property.type !== "Identifier") {
        throw new Error("Cannot assign to member with non-identifier property");
      }
      object.value.set(member.property.value, rhs);
    } else {
      throw new Error(`Invalid LHS inside assignment expression: ${JSON.stringify(node.assignee)}`);
    }
    return new NullValue();
  }
  evaluateIf(node, environment) {
    const test = this.evaluate(node.test, environment);
    return this.evaluateBlock(test.__bool__().value ? node.body : node.alternate, environment);
  }
  evaluateFor(node, environment) {
    const scope = new Environment(environment);
    let test, iterable;
    if (node.iterable.type === "SelectExpression") {
      const select = node.iterable;
      iterable = this.evaluate(select.lhs, scope);
      test = select.test;
    } else {
      iterable = this.evaluate(node.iterable, scope);
    }
    if (!(iterable instanceof ArrayValue || iterable instanceof ObjectValue)) {
      throw new Error(`Expected iterable or object type in for loop: got ${iterable.type}`);
    }
    if (iterable instanceof ObjectValue) {
      iterable = iterable.keys();
    }
    const items = [];
    const scopeUpdateFunctions = [];
    for (let i = 0; i < iterable.value.length; ++i) {
      const loopScope = new Environment(scope);
      const current = iterable.value[i];
      let scopeUpdateFunction;
      if (node.loopvar.type === "Identifier") {
        scopeUpdateFunction = (scope2) => scope2.setVariable(node.loopvar.value, current);
      } else if (node.loopvar.type === "TupleLiteral") {
        const loopvar = node.loopvar;
        if (current.type !== "ArrayValue") {
          throw new Error(`Cannot unpack non-iterable type: ${current.type}`);
        }
        const c = current;
        if (loopvar.value.length !== c.value.length) {
          throw new Error(`Too ${loopvar.value.length > c.value.length ? "few" : "many"} items to unpack`);
        }
        scopeUpdateFunction = (scope2) => {
          for (let j = 0; j < loopvar.value.length; ++j) {
            if (loopvar.value[j].type !== "Identifier") {
              throw new Error(`Cannot unpack non-identifier type: ${loopvar.value[j].type}`);
            }
            scope2.setVariable(loopvar.value[j].value, c.value[j]);
          }
        };
      } else {
        throw new Error(`Invalid loop variable(s): ${node.loopvar.type}`);
      }
      if (test) {
        scopeUpdateFunction(loopScope);
        const testValue = this.evaluate(test, loopScope);
        if (!testValue.__bool__().value) {
          continue;
        }
      }
      items.push(current);
      scopeUpdateFunctions.push(scopeUpdateFunction);
    }
    let result = "";
    let noIteration = true;
    for (let i = 0; i < items.length; ++i) {
      const loop = /* @__PURE__ */ new Map([
        ["index", new IntegerValue(i + 1)],
        ["index0", new IntegerValue(i)],
        ["revindex", new IntegerValue(items.length - i)],
        ["revindex0", new IntegerValue(items.length - i - 1)],
        ["first", new BooleanValue(i === 0)],
        ["last", new BooleanValue(i === items.length - 1)],
        ["length", new IntegerValue(items.length)],
        ["previtem", i > 0 ? items[i - 1] : new UndefinedValue()],
        ["nextitem", i < items.length - 1 ? items[i + 1] : new UndefinedValue()]
      ]);
      scope.setVariable("loop", new ObjectValue(loop));
      scopeUpdateFunctions[i](scope);
      try {
        const evaluated = this.evaluateBlock(node.body, scope);
        result += evaluated.value;
      } catch (err) {
        if (err instanceof ContinueControl) {
          continue;
        }
        if (err instanceof BreakControl) {
          break;
        }
        throw err;
      }
      noIteration = false;
    }
    if (noIteration) {
      const defaultEvaluated = this.evaluateBlock(node.defaultBlock, scope);
      result += defaultEvaluated.value;
    }
    return new StringValue(result);
  }
  /**
   * Bind every parameter name and special argument before evaluating defaults,
   * preventing unbound parameters from resolving in an outer scope.
   */
  bindMacroArguments(displayName, parameters, specialArguments, args, scope) {
    const positionalArguments = args.slice();
    let keywordArguments = /* @__PURE__ */ new Map();
    if (positionalArguments.at(-1) instanceof KeywordArgumentsValue) {
      keywordArguments = new Map(positionalArguments.pop().value);
    }
    const pendingDefaults = [];
    for (let i = 0; i < parameters.length; ++i) {
      const { name: name2, defaultValue } = getParameterDescriptor(parameters[i]);
      let value = positionalArguments[i];
      if (value === void 0 && keywordArguments.has(name2)) {
        value = keywordArguments.get(name2);
        keywordArguments.delete(name2);
      }
      if (value === void 0 && defaultValue !== void 0) {
        pendingDefaults.push([name2, defaultValue]);
      }
      scope.setVariable(name2, value ?? new UndefinedValue());
    }
    if (specialArguments.has("kwargs")) {
      scope.setVariable("kwargs", new ObjectValue(keywordArguments));
    } else if (keywordArguments.size > 0) {
      throw new Error(`macro ${displayName} takes no keyword argument '${keywordArguments.keys().next().value}'`);
    }
    if (specialArguments.has("varargs")) {
      scope.setVariable("varargs", new ArrayValue(positionalArguments.slice(parameters.length)));
    } else if (positionalArguments.length > parameters.length) {
      throw new Error(`macro ${displayName} takes not more than ${parameters.length} argument(s)`);
    }
    for (const [name2, defaultValue] of pendingDefaults) {
      scope.setVariable(name2, this.evaluate(defaultValue, scope));
    }
  }
  /**
   * See https://jinja.palletsprojects.com/en/3.1.x/templates/#macros for more information.
   */
  evaluateMacro(node, environment) {
    const specialArguments = findAccessedSpecialMacroArguments(node.args, node.body);
    environment.setVariable(
      node.name.value,
      new FunctionValue((args, scope) => {
        const macroScope = new Environment(scope);
        this.bindMacroArguments(`'${node.name.value}'`, node.args, specialArguments, args, macroScope);
        return this.evaluateBlock(node.body, macroScope);
      })
    );
    return new NullValue();
  }
  evaluateCallStatement(node, environment) {
    const parameters = node.callerArgs ?? [];
    const specialArguments = findAccessedSpecialMacroArguments(parameters, node.body);
    const callerFn = new FunctionValue((callerArguments) => {
      const callBlockEnv = new Environment(environment);
      this.bindMacroArguments("None", parameters, specialArguments, callerArguments, callBlockEnv);
      return this.evaluateBlock(node.body, callBlockEnv);
    });
    const [macroArgs, macroKwargs] = this.evaluateArguments(node.call.args, environment);
    macroArgs.push(new KeywordArgumentsValue(macroKwargs));
    const fn2 = this.evaluate(node.call.callee, environment);
    if (fn2.type !== "FunctionValue") {
      throw new Error(`Cannot call something that is not a function: got ${fn2.type}`);
    }
    const newEnv = new Environment(environment);
    newEnv.setVariable("caller", callerFn);
    return fn2.value(macroArgs, newEnv);
  }
  evaluateFilterStatement(node, environment) {
    const rendered = this.evaluateBlock(node.body, environment);
    return this.applyFilter(rendered, node.filter, environment);
  }
  evaluate(statement, environment) {
    if (!statement) {
      return new UndefinedValue();
    }
    switch (statement.type) {
      case "Program":
        return this.evalProgram(statement, environment);
      case "Set":
        return this.evaluateSet(statement, environment);
      case "If":
        return this.evaluateIf(statement, environment);
      case "For":
        return this.evaluateFor(statement, environment);
      case "Macro":
        return this.evaluateMacro(statement, environment);
      case "CallStatement":
        return this.evaluateCallStatement(statement, environment);
      case "Break":
        throw new BreakControl();
      case "Continue":
        throw new ContinueControl();
      case "IntegerLiteral":
        return new IntegerValue(statement.value);
      case "FloatLiteral":
        return new FloatValue(statement.value);
      case "StringLiteral":
        return new StringValue(statement.value);
      case "ArrayLiteral":
        return new ArrayValue(statement.value.map((x) => this.evaluate(x, environment)));
      case "TupleLiteral":
        return new TupleValue(statement.value.map((x) => this.evaluate(x, environment)));
      case "ObjectLiteral": {
        const mapping = /* @__PURE__ */ new Map();
        for (const [key, value] of statement.value) {
          const evaluatedKey = this.evaluate(key, environment);
          if (!(evaluatedKey instanceof StringValue)) {
            throw new Error(`Object keys must be strings: got ${evaluatedKey.type}`);
          }
          mapping.set(evaluatedKey.value, this.evaluate(value, environment));
        }
        return new ObjectValue(mapping);
      }
      case "Identifier":
        return this.evaluateIdentifier(statement, environment);
      case "CallExpression":
        return this.evaluateCallExpression(statement, environment);
      case "MemberExpression":
        return this.evaluateMemberExpression(statement, environment);
      case "UnaryExpression":
        return this.evaluateUnaryExpression(statement, environment);
      case "BinaryExpression":
        return this.evaluateBinaryExpression(statement, environment);
      case "FilterExpression":
        return this.evaluateFilterExpression(statement, environment);
      case "FilterStatement":
        return this.evaluateFilterStatement(statement, environment);
      case "TestExpression":
        return this.evaluateTestExpression(statement, environment);
      case "SelectExpression":
        return this.evaluateSelectExpression(statement, environment);
      case "Ternary":
        return this.evaluateTernaryExpression(statement, environment);
      case "Comment":
        return new NullValue();
      default:
        throw new SyntaxError(`Unknown node type: ${statement.type}`);
    }
  }
};
function convertToRuntimeValues(input) {
  switch (typeof input) {
    case "number":
      return Number.isInteger(input) ? new IntegerValue(input) : new FloatValue(input);
    case "string":
      return new StringValue(input);
    case "boolean":
      return new BooleanValue(input);
    case "undefined":
      return new UndefinedValue();
    case "object":
      if (input === null) {
        return new NullValue();
      } else if (Array.isArray(input)) {
        return new ArrayValue(input.map(convertToRuntimeValues));
      } else {
        return new ObjectValue(
          new Map(Object.entries(input).map(([key, value]) => [key, convertToRuntimeValues(value)]))
        );
      }
    case "function":
      return new FunctionValue((args, _scope) => {
        const result = input(...args.map((x) => x.value)) ?? null;
        return convertToRuntimeValues(result);
      });
    default:
      throw new Error(`Cannot convert to runtime value: ${input}`);
  }
}
var NEWLINE = "\n";
var OPEN_STATEMENT = "{%- ";
var CLOSE_STATEMENT = " -%}";
var PRECEDENCE = Object.freeze({
  CONDITIONAL: 0,
  // a if b else c
  LOGICAL_OR: 1,
  // or
  LOGICAL_AND: 2,
  // and
  LOGICAL_NOT: 3,
  // not a
  COMPARISON: 4,
  // == != < <= > >= in, not in
  ADDITIVE: 5,
  // + -
  MULTIPLICATIVE: 6,
  // * / // %
  EXPONENTIATION: 7,
  // **
  TEST: 8,
  // is
  FILTER: 9,
  // |
  UNARY_SIGN: 10,
  // -a +a
  ATOM: 11
  // literals, identifiers, calls, member accesses
});
function getBinaryOperatorPrecedence(expr) {
  switch (expr.operator.type) {
    case "ExponentiationBinaryOperator":
      return PRECEDENCE.EXPONENTIATION;
    case "MultiplicativeBinaryOperator":
      return PRECEDENCE.MULTIPLICATIVE;
    case "AdditiveBinaryOperator":
      return PRECEDENCE.ADDITIVE;
    case "ComparisonBinaryOperator":
      return PRECEDENCE.COMPARISON;
    case "Identifier":
      if (expr.operator.value === "and") {
        return PRECEDENCE.LOGICAL_AND;
      }
      if (expr.operator.value === "in" || expr.operator.value === "not in") {
        return PRECEDENCE.COMPARISON;
      }
      return PRECEDENCE.LOGICAL_OR;
  }
  return PRECEDENCE.LOGICAL_OR;
}
function getPrecedence(node) {
  switch (node.type) {
    case "SelectExpression":
    case "Ternary":
      return PRECEDENCE.CONDITIONAL;
    case "BinaryExpression":
      return getBinaryOperatorPrecedence(node);
    case "UnaryExpression":
      return node.operator.value === "not" ? PRECEDENCE.LOGICAL_NOT : PRECEDENCE.UNARY_SIGN;
    case "TestExpression":
      return PRECEDENCE.TEST;
    case "FilterExpression":
      return PRECEDENCE.FILTER;
    default:
      return PRECEDENCE.ATOM;
  }
}
function formatOperand(node, minPrecedence) {
  const expr = formatExpression(node);
  return getPrecedence(node) < minPrecedence ? `(${expr})` : expr;
}
function format(program, indent = "	") {
  const indentStr = typeof indent === "number" ? " ".repeat(indent) : indent;
  const body = formatStatements(program.body, 0, indentStr);
  return body.replace(/\n$/, "");
}
function createStatement(...text) {
  return OPEN_STATEMENT + text.join(" ") + CLOSE_STATEMENT;
}
function formatStatements(stmts, depth, indentStr) {
  return stmts.map((stmt) => formatStatement(stmt, depth, indentStr)).join(NEWLINE);
}
function formatExpressionList(expressions) {
  return expressions.map((expression) => formatExpression(expression)).join(", ");
}
function formatStatement(node, depth, indentStr) {
  const pad = indentStr.repeat(depth);
  switch (node.type) {
    case "Program":
      return formatStatements(node.body, depth, indentStr);
    case "If":
      return formatIf(node, depth, indentStr);
    case "For":
      return formatFor(node, depth, indentStr);
    case "Set":
      return formatSet(node, depth, indentStr);
    case "Macro":
      return formatMacro(node, depth, indentStr);
    case "Break":
      return pad + createStatement("break");
    case "Continue":
      return pad + createStatement("continue");
    case "CallStatement":
      return formatCallStatement(node, depth, indentStr);
    case "FilterStatement":
      return formatFilterStatement(node, depth, indentStr);
    case "Comment":
      return pad + "{# " + node.value + " #}";
    default:
      return pad + "{{- " + formatExpression(node) + " -}}";
  }
}
function formatIf(node, depth, indentStr) {
  const pad = indentStr.repeat(depth);
  const clauses = [];
  let current = node;
  while (current) {
    clauses.push({ test: current.test, body: current.body });
    if (current.alternate.length === 1 && current.alternate[0].type === "If") {
      current = current.alternate[0];
    } else {
      break;
    }
  }
  let out = pad + createStatement("if", formatExpression(clauses[0].test)) + NEWLINE + formatStatements(clauses[0].body, depth + 1, indentStr);
  for (let i = 1; i < clauses.length; ++i) {
    out += NEWLINE + pad + createStatement("elif", formatExpression(clauses[i].test)) + NEWLINE + formatStatements(clauses[i].body, depth + 1, indentStr);
  }
  if (current && current.alternate.length > 0) {
    out += NEWLINE + pad + createStatement("else") + NEWLINE + formatStatements(current.alternate, depth + 1, indentStr);
  }
  out += NEWLINE + pad + createStatement("endif");
  return out;
}
function formatFor(node, depth, indentStr) {
  const pad = indentStr.repeat(depth);
  let formattedIterable = "";
  if (node.iterable.type === "SelectExpression") {
    const n = node.iterable;
    formattedIterable = `${formatExpression(n.lhs)} if ${formatExpression(n.test)}`;
  } else {
    formattedIterable = formatExpression(node.iterable);
  }
  let out = pad + createStatement("for", formatExpression(node.loopvar), "in", formattedIterable) + NEWLINE + formatStatements(node.body, depth + 1, indentStr);
  if (node.defaultBlock.length > 0) {
    out += NEWLINE + pad + createStatement("else") + NEWLINE + formatStatements(node.defaultBlock, depth + 1, indentStr);
  }
  out += NEWLINE + pad + createStatement("endfor");
  return out;
}
function formatSet(node, depth, indentStr) {
  const pad = indentStr.repeat(depth);
  const left = formatExpression(node.assignee);
  const right = node.value ? formatExpression(node.value) : "";
  const value = pad + createStatement("set", `${left}${node.value ? " = " + right : ""}`);
  if (node.body.length === 0) {
    return value;
  }
  return value + NEWLINE + formatStatements(node.body, depth + 1, indentStr) + NEWLINE + pad + createStatement("endset");
}
function formatMacro(node, depth, indentStr) {
  const pad = indentStr.repeat(depth);
  const args = formatExpressionList(node.args);
  return pad + createStatement("macro", `${node.name.value}(${args})`) + NEWLINE + formatStatements(node.body, depth + 1, indentStr) + NEWLINE + pad + createStatement("endmacro");
}
function formatCallStatement(node, depth, indentStr) {
  const pad = indentStr.repeat(depth);
  const params = node.callerArgs && node.callerArgs.length > 0 ? `(${formatExpressionList(node.callerArgs)})` : "";
  const callExpr = formatExpression(node.call);
  let out = pad + createStatement(`call${params}`, callExpr) + NEWLINE;
  out += formatStatements(node.body, depth + 1, indentStr) + NEWLINE;
  out += pad + createStatement("endcall");
  return out;
}
function formatFilterStatement(node, depth, indentStr) {
  const pad = indentStr.repeat(depth);
  const spec = node.filter.type === "Identifier" ? node.filter.value : formatExpression(node.filter);
  let out = pad + createStatement("filter", spec) + NEWLINE;
  out += formatStatements(node.body, depth + 1, indentStr) + NEWLINE;
  out += pad + createStatement("endfilter");
  return out;
}
function formatExpression(node) {
  switch (node.type) {
    case "SpreadExpression": {
      const n = node;
      return `*${formatExpression(n.argument)}`;
    }
    case "KeywordSpreadExpression": {
      const n = node;
      return `**${formatExpression(n.argument)}`;
    }
    case "Identifier":
      return node.value;
    case "IntegerLiteral":
      return `${node.value}`;
    case "FloatLiteral": {
      const value = node.value;
      if (Object.is(value, -0)) {
        return "-0.0";
      }
      return value % 1 === 0 ? value.toFixed(1) : value.toString();
    }
    case "StringLiteral":
      return JSON.stringify(node.value);
    case "BinaryExpression": {
      const n = node;
      const thisPrecedence = getBinaryOperatorPrecedence(n);
      const left = formatOperand(n.left, thisPrecedence);
      const right = formatOperand(n.right, thisPrecedence + 1);
      return `${left} ${n.operator.value} ${right}`;
    }
    case "UnaryExpression": {
      const n = node;
      const operandPrecedence = n.argument.type === "UnaryExpression" ? getPrecedence(n) : PRECEDENCE.ATOM;
      return n.operator.value + (n.operator.value === "not" ? " " : "") + formatOperand(n.argument, operandPrecedence);
    }
    case "CallExpression": {
      const n = node;
      const args = formatExpressionList(n.args);
      return `${formatExpression(n.callee)}(${args})`;
    }
    case "MemberExpression": {
      const n = node;
      const obj = formatOperand(n.object, PRECEDENCE.ATOM);
      let prop = formatExpression(n.property);
      if (!n.computed && n.property.type !== "Identifier" && n.property.type !== "IntegerLiteral") {
        prop = `(${prop})`;
      }
      return n.computed ? `${obj}[${prop}]` : `${obj}.${prop}`;
    }
    case "FilterExpression": {
      const n = node;
      const operand = formatOperand(n.operand, PRECEDENCE.FILTER);
      if (n.filter.type === "CallExpression") {
        return `${operand} | ${formatExpression(n.filter)}`;
      }
      return `${operand} | ${n.filter.value}`;
    }
    case "SelectExpression": {
      const n = node;
      return `${formatOperand(n.lhs, PRECEDENCE.LOGICAL_OR)} if ${formatOperand(n.test, PRECEDENCE.LOGICAL_OR)}`;
    }
    case "TestExpression": {
      const n = node;
      return `${formatOperand(n.operand, PRECEDENCE.TEST)} is${n.negate ? " not" : ""} ${n.test.value}`;
    }
    case "ArrayLiteral":
    case "TupleLiteral": {
      const elems = formatExpressionList(node.value);
      const brackets = node.type === "ArrayLiteral" ? "[]" : "()";
      return `${brackets[0]}${elems}${brackets[1]}`;
    }
    case "ObjectLiteral": {
      const entries = Array.from(node.value.entries()).map(
        ([k, v]) => `${formatExpression(k)}: ${formatExpression(v)}`
      );
      return `{${entries.join(", ")}}`;
    }
    case "SliceExpression": {
      const n = node;
      const s = n.start ? formatExpression(n.start) : "";
      const t = n.stop ? formatExpression(n.stop) : "";
      const st = n.step ? `:${formatExpression(n.step)}` : "";
      return `${s}:${t}${st}`;
    }
    case "KeywordArgumentExpression": {
      const n = node;
      return `${n.key.value}=${formatExpression(n.value)}`;
    }
    case "Ternary": {
      const n = node;
      return `${formatOperand(n.trueExpr, PRECEDENCE.LOGICAL_OR)} if ${formatOperand(
        n.condition,
        PRECEDENCE.LOGICAL_OR
      )} else ${formatOperand(n.falseExpr, PRECEDENCE.CONDITIONAL)}`;
    }
    default:
      throw new Error(`Unknown expression type: ${node.type}`);
  }
}
var Template = class {
  parsed;
  /**
   * @param {string} template The template string
   */
  constructor(template) {
    const tokens = tokenize(template, {
      lstrip_blocks: true,
      trim_blocks: true
    });
    this.parsed = parse(tokens);
  }
  render(items) {
    const env2 = new Environment();
    setupGlobals(env2);
    if (items) {
      for (const [key, value] of Object.entries(items)) {
        env2.set(key, value);
      }
    }
    const interpreter = new Interpreter(env2);
    const result = interpreter.run(this.parsed);
    return result.value;
  }
  format(options) {
    return format(this.parsed, options?.indent || "	");
  }
};
async function get_tokenizer_files(modelId) {
  if (!modelId) {
    throw new Error("modelId is required for get_tokenizer_files");
  }
  const metadata = await get_file_metadata(modelId, "tokenizer_config.json", {});
  if (metadata.exists) {
    return ["tokenizer.json", "tokenizer_config.json"];
  }
  return [];
}
async function loadTokenizer(pretrained_model_name_or_path, options) {
  const tokenizerFiles = await get_tokenizer_files(pretrained_model_name_or_path);
  return await Promise.all(
    tokenizerFiles.map((file) => getModelJSON(pretrained_model_name_or_path, file, true, options))
  );
}
function prepareTensorForDecode(tensor) {
  const dims = tensor.dims;
  switch (dims.length) {
    case 1:
      return tensor.tolist();
    case 2:
      if (dims[0] !== 1) {
        throw new Error(
          "Unable to decode tensor with `batch size !== 1`. Use `tokenizer.batch_decode(...)` for batched inputs."
        );
      }
      return tensor.tolist()[0];
    default:
      throw new Error(`Expected tensor to have 1-2 dimensions, got ${dims.length}.`);
  }
}
const SPECIAL_TOKEN_ATTRIBUTES = [
  "bos_token",
  "eos_token",
  "unk_token",
  "sep_token",
  "pad_token",
  "cls_token",
  "mask_token"
  // additional_special_tokens (TODO)
];
function padHelper(item, length, value_fn, side) {
  for (const key of Object.keys(item)) {
    const diff = length - item[key].length;
    const value = value_fn(key);
    const padData = new Array(diff).fill(value);
    item[key] = side === "right" ? mergeArrays(item[key], padData) : mergeArrays(padData, item[key]);
  }
}
function truncateHelper(item, length) {
  for (const key of Object.keys(item)) {
    item[key].length = length;
  }
}
function getTokenFromConfig(config, ...keys) {
  for (const key of keys) {
    if (!Object.hasOwn(config, key)) continue;
    const item = config[key];
    if (!item) continue;
    if (typeof item === "object") {
      if (item.__type === "AddedToken") {
        return item.content;
      } else {
        throw Error(`Unknown token: ${item}`);
      }
    } else {
      return item;
    }
  }
  return null;
}
function getSpecialTokens(tokenizer) {
  const special = [];
  for (const value of tokenizer.get_added_tokens_decoder().values()) {
    if (value.special) special.push(value);
  }
  return special;
}
class PreTrainedTokenizer extends /** @type {new (tokenizerJSON: Object, tokenizerConfig: Object) => PreTrainedTokenizerCallback} */
Callable$1 {
  return_token_type_ids = false;
  padding_side = "right";
  /**
   * Create a new PreTrainedTokenizer instance.
   * @param {Object} tokenizerJSON The JSON of the tokenizer.
   * @param {Object} tokenizerConfig The config of the tokenizer.
   */
  constructor(tokenizerJSON, tokenizerConfig) {
    super();
    this._tokenizerJSON = tokenizerJSON;
    this._tokenizerConfig = tokenizerConfig;
    this._tokenizer = new Tokenizer_default(tokenizerJSON, tokenizerConfig);
    this.config = tokenizerConfig;
    this.padding_side = tokenizerConfig.padding_side ?? this.padding_side;
    this.mask_token = getTokenFromConfig(tokenizerConfig, "mask_token");
    this.mask_token_id = this._tokenizer.token_to_id(this.mask_token);
    this.pad_token = getTokenFromConfig(tokenizerConfig, "pad_token", "eos_token");
    this.pad_token_id = this._tokenizer.token_to_id(this.pad_token);
    this.sep_token = getTokenFromConfig(tokenizerConfig, "sep_token");
    this.sep_token_id = this._tokenizer.token_to_id(this.sep_token);
    this.unk_token = getTokenFromConfig(tokenizerConfig, "unk_token");
    this.unk_token_id = this._tokenizer.token_to_id(this.unk_token);
    this.bos_token = getTokenFromConfig(tokenizerConfig, "bos_token");
    this.bos_token_id = this._tokenizer.token_to_id(this.bos_token);
    this.eos_token = getTokenFromConfig(tokenizerConfig, "eos_token");
    this.eos_token_id = this._tokenizer.token_to_id(this.eos_token);
    this.chat_template = tokenizerConfig.chat_template ?? null;
    if (Array.isArray(this.chat_template)) {
      const chat_template = /* @__PURE__ */ Object.create(null);
      for (const { name: name2, template } of this.chat_template) {
        if (typeof name2 !== "string" || typeof template !== "string") {
          throw new Error('Chat template must be a list of objects with "name" and "template" properties');
        }
        chat_template[name2] = template;
      }
      this.chat_template = chat_template;
    }
    this._compiled_template_cache = /* @__PURE__ */ new Map();
    const special_tokens = getSpecialTokens(this._tokenizer);
    this.all_special_ids = special_tokens.map((t) => t.id);
    this.all_special_tokens = special_tokens.map((t) => t.content);
  }
  /**
   * Loads a pretrained tokenizer from the given `pretrained_model_name_or_path`.
   *
   * @param {string} pretrained_model_name_or_path The path to the pretrained tokenizer.
   * @param {PretrainedTokenizerOptions} options Additional options for loading the tokenizer.
   *
   * @throws {Error} Throws an error if the tokenizer.json or tokenizer_config.json files are not found in the `pretrained_model_name_or_path`.
   * @returns {Promise<PreTrainedTokenizer>} A new instance of the `PreTrainedTokenizer` class.
   */
  static async from_pretrained(pretrained_model_name_or_path, { progress_callback = null, config = null, cache_dir = null, local_files_only = false, revision = "main" } = {}) {
    const info = await loadTokenizer(pretrained_model_name_or_path, {
      progress_callback,
      config,
      cache_dir,
      local_files_only,
      revision
    });
    return new this(...info);
  }
  get_vocab() {
    return this._tokenizer.get_vocab();
  }
  get model_max_length() {
    return this._tokenizerConfig.model_max_length ?? Infinity;
  }
  get add_eos_token() {
    return this._tokenizerConfig.add_eos_token;
  }
  get add_bos_token() {
    return this._tokenizerConfig.add_bos_token;
  }
  /**
   * Converts a token string (or a sequence of tokens) into a single integer id (or a sequence of ids), using the vocabulary.
   *
   * @template {string|string[]} T
   * @param {T} tokens One or several token(s) to convert to token id(s).
   * @returns {T extends string ? number : number[]} The token id or list of token ids.
   */
  convert_tokens_to_ids(tokens) {
    if (typeof tokens === "string") {
      return (
        /** @type {any} */
        this._tokenizer.token_to_id(tokens)
      );
    } else {
      return (
        /** @type {any} */
        tokens.map((token) => this._tokenizer.token_to_id(token))
      );
    }
  }
  /**
   * Encode/tokenize the given text(s).
   * @template {string|string[]} TText
   * @template {boolean} [TReturnTensor=true]
   * @param {TText} text The text to tokenize.
   * @param {TokenizerCallOptions<TText, TReturnTensor>} [options] Additional tokenization options.
   * @returns {BatchEncoding<BatchEncodingItem<TText, TReturnTensor>>} Object to be passed to the model.
   */
  _call(text, options = {}) {
    const { text_pair = null, add_special_tokens = true, padding = false, return_token_type_ids = null } = options;
    let { truncation = null, max_length = null } = options;
    const return_tensor = (
      /** @type {TReturnTensor} */
      options.return_tensor ?? true
    );
    const isBatched = Array.isArray(text);
    let encodedTokens;
    if (isBatched) {
      if (text.length === 0) {
        throw Error("text array must be non-empty");
      }
      if (text_pair !== null) {
        if (!Array.isArray(text_pair)) {
          throw Error("text_pair must also be an array");
        } else if (text.length !== text_pair.length) {
          throw Error("text and text_pair must have the same length");
        }
        encodedTokens = text.map(
          (t, i) => this._encode_plus(t, { text_pair: text_pair[i], add_special_tokens, return_token_type_ids })
        );
      } else {
        encodedTokens = text.map((x) => this._encode_plus(x, { add_special_tokens, return_token_type_ids }));
      }
    } else {
      if (text === null || text === void 0) {
        throw Error("text may not be null or undefined");
      }
      if (Array.isArray(text_pair)) {
        throw Error(
          "When specifying `text_pair`, since `text` is a string, `text_pair` must also be a string (i.e., not an array)."
        );
      }
      encodedTokens = [this._encode_plus(text, { text_pair, add_special_tokens, return_token_type_ids })];
    }
    if (max_length === null) {
      max_length = this.model_max_length;
    } else if (truncation === null) {
      if (padding === true) {
        logger.warn(
          "`max_length` is ignored when `padding: true` and there is no truncation strategy. To pad to max length, use `padding: 'max_length'`."
        );
        max_length = this.model_max_length;
      } else if (padding === false) {
        logger.warn(
          "Truncation was not explicitly activated but `max_length` is provided a specific value, please use `truncation: true` to explicitly truncate examples to max length."
        );
        truncation = true;
      }
    }
    if (padding === true) {
      max_length = Math.min(max(encodedTokens.map((x) => x.input_ids.length))[0], max_length ?? Infinity);
    }
    max_length = Math.min(max_length, this.model_max_length ?? Infinity);
    if (padding || truncation) {
      for (let i = 0; i < encodedTokens.length; ++i) {
        if (encodedTokens[i].input_ids.length === max_length) {
          continue;
        } else if (encodedTokens[i].input_ids.length > max_length) {
          if (truncation) {
            truncateHelper(encodedTokens[i], max_length);
          }
        } else {
          if (padding) {
            padHelper(
              encodedTokens[i],
              max_length,
              (key) => key === "input_ids" ? this.pad_token_id : 0,
              this.padding_side
            );
          }
        }
      }
    }
    const result = {};
    if (return_tensor) {
      if (!(padding && truncation)) {
        if (encodedTokens.some((x) => {
          for (const key of Object.keys(x)) {
            if (x[key].length !== encodedTokens[0][key]?.length) {
              return true;
            }
          }
          return false;
        })) {
          throw Error(
            "Unable to create tensor, you should probably activate truncation and/or padding with 'padding=true' and 'truncation=true' to have batched tensors with the same length."
          );
        }
      }
      const dims = [encodedTokens.length, encodedTokens[0].input_ids.length];
      for (const key of Object.keys(encodedTokens[0])) {
        result[key] = new Tensor(
          "int64",
          BigInt64Array.from(encodedTokens.flatMap((x) => x[key]).map(BigInt)),
          dims
        );
      }
    } else {
      for (const key of Object.keys(encodedTokens[0])) {
        result[key] = encodedTokens.map((x) => x[key]);
      }
      if (!isBatched) {
        for (const key of Object.keys(result)) {
          result[key] = result[key][0];
        }
      }
    }
    return (
      /** @type {BatchEncoding<BatchEncodingItem<TText, TReturnTensor>>} */
      result
    );
  }
  /**
   * Encodes a single text using the preprocessor pipeline of the tokenizer.
   *
   * @param {string|null} text The text to encode.
   * @returns {string[]|null} The encoded tokens.
   */
  _encode_text(text) {
    if (text === null) return null;
    return this._tokenizer.encode(text).tokens;
  }
  /**
   * Encodes a single text or a pair of texts using the model's tokenizer.
   *
   * @param {string} text The text to encode.
   * @param {Object} options An optional object containing the following properties:
   * @param {string|null} [options.text_pair=null] The optional second text to encode.
   * @param {boolean} [options.add_special_tokens=true] Whether or not to add the special tokens associated with the corresponding model.
   * @param {boolean|null} [options.return_token_type_ids=null] Whether to return token_type_ids.
   * @returns {{input_ids: number[], attention_mask: number[], token_type_ids?: number[]}} An object containing the encoded text.
   * @private
   */
  _encode_plus(text, { text_pair = null, add_special_tokens = true, return_token_type_ids = null } = {}) {
    const { ids, attention_mask, token_type_ids } = this._tokenizer.encode(text, {
      text_pair,
      add_special_tokens,
      return_token_type_ids: return_token_type_ids ?? this.return_token_type_ids
    });
    return {
      input_ids: ids,
      attention_mask,
      ...token_type_ids ? { token_type_ids } : {}
    };
  }
  /**
   * Converts a string into a sequence of tokens.
   * @param {string} text The sequence to be encoded.
   * @param {Object} options An optional object containing the following properties:
   * @param {string|null} [options.pair] A second sequence to be encoded with the first.
   * @param {boolean} [options.add_special_tokens=false] Whether or not to add the special tokens associated with the corresponding model.
   * @returns {string[]} The list of tokens.
   */
  tokenize(text, { pair = null, add_special_tokens = false } = {}) {
    return this._tokenizer.tokenize(text, { text_pair: pair, add_special_tokens });
  }
  /**
   * Encodes a single text or a pair of texts using the model's tokenizer.
   *
   * @param {string} text The text to encode.
   * @param {Object} options An optional object containing the following properties:
   * @param {string|null} [options.text_pair=null] The optional second text to encode.
   * @param {boolean} [options.add_special_tokens=true] Whether or not to add the special tokens associated with the corresponding model.
   * @param {boolean|null} [options.return_token_type_ids=null] Whether to return token_type_ids.
   * @returns {number[]} An array of token IDs representing the encoded text(s).
   */
  encode(text, { text_pair = null, add_special_tokens = true, return_token_type_ids = null } = {}) {
    return this._tokenizer.encode(text, {
      text_pair,
      add_special_tokens,
      return_token_type_ids
    }).ids;
  }
  /**
   * Decode a batch of tokenized sequences.
   * @param {number[][]|Tensor} batch List/Tensor of tokenized input sequences.
   * @param {Object} decode_args (Optional) Object with decoding arguments.
   * @returns {string[]} List of decoded sequences.
   */
  batch_decode(batch, decode_args = {}) {
    if (batch instanceof Tensor) {
      batch = batch.tolist();
    }
    return batch.map((x) => this.decode(x, decode_args));
  }
  /**
   * Decodes a sequence of token IDs back to a string.
   *
   * @param {number[]|bigint[]|Tensor} token_ids List/Tensor of token IDs to decode.
   * @param {Object} [decode_args={}]
   * @param {boolean} [decode_args.skip_special_tokens=false] If true, special tokens are removed from the output string.
   * @param {boolean} [decode_args.clean_up_tokenization_spaces=true] If true, spaces before punctuation and abbreviated forms are removed.
   *
   * @returns {string} The decoded string.
   * @throws {Error} If `token_ids` is not a non-empty array of integers.
   */
  decode(token_ids, decode_args = {}) {
    if (token_ids instanceof Tensor) {
      token_ids = prepareTensorForDecode(token_ids);
    }
    if (!Array.isArray(token_ids) || token_ids.length === 0 || !isIntegralNumber(token_ids[0])) {
      throw Error("token_ids must be a non-empty array of integers.");
    }
    return this.decode_single(token_ids, decode_args);
  }
  /**
   * Decode a single list of token ids to a string.
   * @param {number[]|bigint[]} token_ids List of token ids to decode
   * @param {Object} decode_args Optional arguments for decoding
   * @param {boolean} [decode_args.skip_special_tokens=false] Whether to skip special tokens during decoding
   * @param {boolean|null} [decode_args.clean_up_tokenization_spaces=null] Whether to clean up tokenization spaces during decoding.
   * If null, the value is set to `this.decoder.cleanup` if it exists, falling back to `this.clean_up_tokenization_spaces` if it exists, falling back to `true`.
   * @returns {string} The decoded string
   */
  decode_single(token_ids, { skip_special_tokens = false, clean_up_tokenization_spaces = null }) {
    return this._tokenizer.decode(token_ids, {
      skip_special_tokens,
      clean_up_tokenization_spaces
    });
  }
  /**
   * Retrieve the chat template string used for tokenizing chat messages. This template is used
   * internally by the `apply_chat_template` method and can also be used externally to retrieve the model's chat
   * template for better generation tracking.
   *
   * @param {Object} options An optional object containing the following properties:
   * @param {string|null} [options.chat_template=null]
   * A Jinja template or the name of a template to use for this conversion.
   * It is usually not necessary to pass anything to this argument,
   * as the model's template will be used by default.
   * @param {Object[]} [options.tools=null]
   * A list of tools (callable functions) that will be accessible to the model. If the template does not
   * support function calling, this argument will have no effect. Each tool should be passed as a JSON Schema,
   * giving the name, description and argument types for the tool. See our
   * [chat templating guide](https://huggingface.co/docs/transformers/main/en/chat_templating#automated-function-conversion-for-tool-use)
   * for more information.
   * @returns {string} The chat template string.
   */
  get_chat_template({ chat_template = null, tools = null } = {}) {
    if (this.chat_template && typeof this.chat_template === "object") {
      const template_dict = this.chat_template;
      if (chat_template !== null && Object.hasOwn(template_dict, chat_template)) {
        chat_template = template_dict[chat_template];
      } else if (chat_template === null) {
        if (tools !== null && "tool_use" in template_dict) {
          chat_template = template_dict["tool_use"];
        } else if ("default" in template_dict) {
          chat_template = template_dict["default"];
        } else {
          throw Error(
            `This model has multiple chat templates with no default specified! Please either pass a chat template or the name of the template you wish to use to the 'chat_template' argument. Available template names are ${Object.keys(template_dict).sort()}.`
          );
        }
      }
    } else if (chat_template === null) {
      if (this.chat_template) {
        chat_template = this.chat_template;
      } else {
        throw Error(
          "Cannot use apply_chat_template() because tokenizer.chat_template is not set and no template argument was passed! For information about writing templates and setting the tokenizer.chat_template attribute, please see the documentation at https://huggingface.co/docs/transformers/main/en/chat_templating"
        );
      }
    }
    return chat_template;
  }
  /**
   * Converts a list of message objects with `"role"` and `"content"` keys to a list of token
   * ids. This method is intended for use with chat models, and will read the tokenizer's chat_template attribute to
   * determine the format and control tokens to use when converting.
   *
   * See the [chat templating guide](https://huggingface.co/docs/transformers/chat_templating) for more information.
   *
   * **Example:** Applying a chat template to a conversation.
   *
   * ```javascript
   * import { AutoTokenizer } from "@huggingface/transformers";
   *
   * const tokenizer = await AutoTokenizer.from_pretrained("Xenova/mistral-tokenizer-v1");
   *
   * const chat = [
   *   { "role": "user", "content": "Hello, how are you?" },
   *   { "role": "assistant", "content": "I'm doing great. How can I help you today?" },
   *   { "role": "user", "content": "I'd like to show off how chat templating works!" },
   * ]
   *
   * const text = tokenizer.apply_chat_template(chat, { tokenize: false });
   * // "<s>[INST] Hello, how are you? [/INST]I'm doing great. How can I help you today?</s> [INST] I'd like to show off how chat templating works! [/INST]"
   *
   * const input_ids = tokenizer.apply_chat_template(chat, { tokenize: true, return_tensor: false });
   * // [1, 733, 16289, 28793, 22557, 28725, 910, 460, 368, 28804, 733, 28748, 16289, 28793, 28737, 28742, 28719, 2548, 1598, 28723, 1602, 541, 315, 1316, 368, 3154, 28804, 2, 28705, 733, 16289, 28793, 315, 28742, 28715, 737, 298, 1347, 805, 910, 10706, 5752, 1077, 3791, 28808, 733, 28748, 16289, 28793]
   * ```
   *
   * @param {Message[]} conversation A list of message objects with `"role"` and `"content"` keys,
   * representing the chat history so far.
   * @template {boolean} [TTokenize=true]
   * @template {boolean} [TReturnTensor=true]
   * @template {boolean} [TReturnDict=true]
   * @param {ApplyChatTemplateOptions<TTokenize, TReturnTensor, TReturnDict>} [options] Options controlling
   * template rendering and tokenization.
   * @returns {ApplyChatTemplateReturn<TTokenize, TReturnTensor, TReturnDict>} The tokenized output.
   */
  apply_chat_template(conversation, options = (
    /** @type {ApplyChatTemplateOptions<TTokenize, TReturnTensor, TReturnDict>} */
    {}
  )) {
    let {
      tools = null,
      documents = null,
      chat_template = null,
      add_generation_prompt = false,
      tokenize: tokenize2 = (
        /** @type {TTokenize} */
        true
      ),
      padding = false,
      truncation = false,
      max_length = null,
      return_tensor = (
        /** @type {TReturnTensor} */
        true
      ),
      return_dict = (
        /** @type {TReturnDict} */
        true
      ),
      tokenizer_kwargs = {},
      ...kwargs
    } = options;
    chat_template = this.get_chat_template({ chat_template, tools });
    if (typeof chat_template !== "string") {
      throw Error(`chat_template must be a string, but got ${typeof chat_template}`);
    }
    let compiledTemplate = this._compiled_template_cache.get(chat_template);
    if (compiledTemplate === void 0) {
      compiledTemplate = new Template(chat_template);
      this._compiled_template_cache.set(chat_template, compiledTemplate);
    }
    const special_tokens_map = /* @__PURE__ */ Object.create(null);
    for (const key of SPECIAL_TOKEN_ATTRIBUTES) {
      const value = getTokenFromConfig(this.config, key);
      if (value) {
        special_tokens_map[key] = value;
      }
    }
    const rendered = compiledTemplate.render({
      messages: conversation,
      add_generation_prompt,
      tools,
      documents,
      ...special_tokens_map,
      ...kwargs
    });
    if (tokenize2) {
      const out = this._call(rendered, {
        add_special_tokens: false,
        padding,
        truncation,
        max_length,
        return_tensor,
        ...tokenizer_kwargs
      });
      return (
        /** @type {ApplyChatTemplateReturn<TTokenize, TReturnTensor, TReturnDict>} */
        return_dict ? out : out.input_ids
      );
    }
    return (
      /** @type {ApplyChatTemplateReturn<TTokenize, TReturnTensor, TReturnDict>} */
      rendered
    );
  }
}
class GPT2Tokenizer extends PreTrainedTokenizer {
}
async function saveBlob(path, blob) {
  if (apis.IS_BROWSER_ENV) {
    if (apis.IS_WEBWORKER_ENV) {
      throw new Error("Unable to save a file from a Web Worker.");
    }
    const dataURL = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = dataURL;
    downloadLink.download = path;
    downloadLink.click();
    downloadLink.remove();
    URL.revokeObjectURL(dataURL);
  } else if (apis.IS_FS_AVAILABLE) {
    const webStream = blob.stream();
    const nodeStream = Readable.fromWeb(webStream);
    const fileStream = sharp.createWriteStream(path);
    await pipeline(nodeStream, fileStream);
  } else {
    throw new Error("Unable to save because filesystem is disabled in this environment.");
  }
}
let createCanvasFunction;
let ImageDataClass;
let loadImageFunction;
if (apis.IS_WEB_ENV) {
  createCanvasFunction = (width, height) => {
    if (!self.OffscreenCanvas) {
      throw new Error("OffscreenCanvas not supported by this environment.");
    }
    return new self.OffscreenCanvas(width, height);
  };
  loadImageFunction = self.createImageBitmap;
  ImageDataClass = self.ImageData;
} else if (sharp) {
  loadImageFunction = async (img) => {
    const metadata = await img.metadata();
    const rawChannels = metadata.channels;
    const { data, info } = await img.rotate().raw().toBuffer({ resolveWithObject: true });
    const newImage = new RawImage(new Uint8ClampedArray(data), info.width, info.height, info.channels);
    if (rawChannels !== void 0 && rawChannels !== info.channels) {
      newImage.convert(rawChannels);
    }
    return newImage;
  };
} else {
  throw new Error("Unable to load image processing library.");
}
const RESAMPLING_MAPPING = {
  0: "nearest",
  1: "lanczos",
  2: "bilinear",
  3: "bicubic",
  4: "box",
  5: "hamming"
};
const CONTENT_TYPE_MAP = /* @__PURE__ */ new Map([
  ["png", "image/png"],
  ["jpg", "image/jpeg"],
  ["jpeg", "image/jpeg"],
  ["gif", "image/gif"]
]);
class RawImage {
  /**
   * Create a new `RawImage` object.
   * @param {Uint8ClampedArray|Uint8Array} data The pixel data.
   * @param {number} width The width of the image.
   * @param {number} height The height of the image.
   * @param {1|2|3|4} channels The number of channels.
   */
  constructor(data, width, height, channels) {
    this.data = data;
    this.width = width;
    this.height = height;
    this.channels = channels;
  }
  /**
   * Returns the size of the image (width, height).
   * @returns {[number, number]} The size of the image (width, height).
   */
  get size() {
    return [this.width, this.height];
  }
  /**
   * Helper method for reading an image from a variety of input types.
   * @param {RawImage|string|URL|Blob|HTMLCanvasElement|OffscreenCanvas} input
   * @returns {Promise<RawImage>} The image object.
   *
   * **Example:** Read image from a URL.
   * ```javascript
   * let image = await RawImage.read('https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/football-match.jpg');
   * // RawImage {
   * //   "data": Uint8ClampedArray [ 25, 25, 25, 19, 19, 19, ... ],
   * //   "width": 800,
   * //   "height": 533,
   * //   "channels": 3
   * // }
   * ```
   */
  static async read(input) {
    if (input instanceof RawImage) {
      return input;
    } else if (typeof input === "string" || input instanceof URL) {
      return await this.fromURL(input);
    } else if (input instanceof Blob) {
      return await this.fromBlob(input);
    } else if (typeof HTMLCanvasElement !== "undefined" && input instanceof HTMLCanvasElement || typeof OffscreenCanvas !== "undefined" && input instanceof OffscreenCanvas) {
      return this.fromCanvas(input);
    } else {
      throw new Error(`Unsupported input type: ${typeof input}`);
    }
  }
  /**
   * Read an image from a canvas.
   * @param {HTMLCanvasElement|OffscreenCanvas} canvas The canvas to read the image from.
   * @returns {RawImage} The image object.
   */
  static fromCanvas(canvas) {
    if (!apis.IS_WEB_ENV) {
      throw new Error("fromCanvas() is only supported in browser environments.");
    }
    const ctx = (
      /** @type {CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D} */
      canvas.getContext("2d")
    );
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    return new RawImage(data, canvas.width, canvas.height, 4);
  }
  /**
   * Read an image from a URL or file path.
   * @param {string|URL} url The URL or file path to read the image from.
   * @returns {Promise<RawImage>} The image object.
   */
  static async fromURL(url) {
    const response = await getFile(url);
    if (response.status !== 200) {
      throw new Error(`Unable to read image from "${url}" (${response.status} ${response.statusText})`);
    }
    const blob = await response.blob();
    return this.fromBlob(blob);
  }
  /**
   * Helper method to create a new Image from a blob.
   * @param {Blob} blob The blob to read the image from.
   * @returns {Promise<RawImage>} The image object.
   */
  static async fromBlob(blob) {
    if (apis.IS_WEB_ENV) {
      const img = await loadImageFunction(blob);
      const ctx = createCanvasFunction(img.width, img.height).getContext("2d");
      ctx.drawImage(img, 0, 0);
      return new this(ctx.getImageData(0, 0, img.width, img.height).data, img.width, img.height, 4);
    } else {
      const img = sharp(await blob.arrayBuffer());
      return await loadImageFunction(img);
    }
  }
  /**
   * Helper method to create a new Image from a tensor
   * @param {Tensor} tensor The 3D tensor containing the image data. Must be of type `uint8`.
   * @param {'CHW'|'HWC'} [channel_format='CHW'] The dimension ordering of the tensor.
   * @returns {RawImage} The image created from the tensor.
   * @throws {Error} If the tensor does not have 3 dimensions, or the channel format,
   * tensor type, or number of channels is unsupported.
   */
  static fromTensor(tensor, channel_format = "CHW") {
    if (tensor.dims.length !== 3) {
      throw new Error(`Tensor should have 3 dimensions, but has ${tensor.dims.length} dimensions.`);
    }
    if (channel_format === "CHW") {
      tensor = tensor.permute(1, 2, 0);
    } else if (channel_format === "HWC") ;
    else {
      throw new Error(`Unsupported channel format: ${channel_format}`);
    }
    if (!(tensor.data instanceof Uint8ClampedArray || tensor.data instanceof Uint8Array)) {
      throw new Error(`Unsupported tensor type: ${tensor.type}`);
    }
    switch (tensor.dims[2]) {
      case 1:
      case 2:
      case 3:
      case 4:
        return new RawImage(tensor.data, tensor.dims[1], tensor.dims[0], tensor.dims[2]);
      default:
        throw new Error(`Unsupported number of channels: ${tensor.dims[2]}`);
    }
  }
  /**
   * Convert the image to grayscale format.
   * @returns {RawImage} `this` to support chaining.
   */
  grayscale() {
    if (this.channels === 1) {
      return this;
    }
    const newData = new Uint8ClampedArray(this.width * this.height * 1);
    switch (this.channels) {
      case 3:
      // rgb to grayscale
      case 4:
        for (let i = 0, offset = 0; i < this.data.length; i += this.channels) {
          const red = this.data[i];
          const green = this.data[i + 1];
          const blue = this.data[i + 2];
          newData[offset++] = Math.round(0.2989 * red + 0.587 * green + 0.114 * blue);
        }
        break;
      default:
        throw new Error(`Conversion failed due to unsupported number of channels: ${this.channels}`);
    }
    return this._update(newData, this.width, this.height, 1);
  }
  /**
   * Convert the image to RGB format.
   * @returns {RawImage} `this` to support chaining.
   */
  rgb() {
    if (this.channels === 3) {
      return this;
    }
    const newData = new Uint8ClampedArray(this.width * this.height * 3);
    switch (this.channels) {
      case 1:
        for (let i = 0, offset = 0; i < this.data.length; ++i) {
          newData[offset++] = this.data[i];
          newData[offset++] = this.data[i];
          newData[offset++] = this.data[i];
        }
        break;
      case 4:
        for (let i = 0, offset = 0; i < this.data.length; i += 4) {
          newData[offset++] = this.data[i];
          newData[offset++] = this.data[i + 1];
          newData[offset++] = this.data[i + 2];
        }
        break;
      default:
        throw new Error(`Conversion failed due to unsupported number of channels: ${this.channels}`);
    }
    return this._update(newData, this.width, this.height, 3);
  }
  /**
   * Convert the image to RGBA format.
   * @returns {RawImage} `this` to support chaining.
   */
  rgba() {
    if (this.channels === 4) {
      return this;
    }
    const newData = new Uint8ClampedArray(this.width * this.height * 4);
    switch (this.channels) {
      case 1:
        for (let i = 0, offset = 0; i < this.data.length; ++i) {
          newData[offset++] = this.data[i];
          newData[offset++] = this.data[i];
          newData[offset++] = this.data[i];
          newData[offset++] = 255;
        }
        break;
      case 3:
        for (let i = 0, offset = 0; i < this.data.length; i += 3) {
          newData[offset++] = this.data[i];
          newData[offset++] = this.data[i + 1];
          newData[offset++] = this.data[i + 2];
          newData[offset++] = 255;
        }
        break;
      default:
        throw new Error(`Conversion failed due to unsupported number of channels: ${this.channels}`);
    }
    return this._update(newData, this.width, this.height, 4);
  }
  /**
   * Apply an alpha mask to the image. Operates in place.
   * @param {RawImage} mask The mask to apply. It should have a single channel.
   * @returns {RawImage} The masked image.
   * @throws {Error} If the mask is not the same size as the image.
   * @throws {Error} If the image does not have 4 channels.
   * @throws {Error} If the mask is not a single channel.
   */
  putAlpha(mask) {
    if (mask.width !== this.width || mask.height !== this.height) {
      throw new Error(
        `Expected mask size to be ${this.width}x${this.height}, but got ${mask.width}x${mask.height}`
      );
    }
    if (mask.channels !== 1) {
      throw new Error(`Expected mask to have 1 channel, but got ${mask.channels}`);
    }
    const this_data = this.data;
    const mask_data = mask.data;
    const num_pixels = this.width * this.height;
    if (this.channels === 3) {
      const newData = new Uint8ClampedArray(num_pixels * 4);
      for (let i = 0, in_offset = 0, out_offset = 0; i < num_pixels; ++i) {
        newData[out_offset++] = this_data[in_offset++];
        newData[out_offset++] = this_data[in_offset++];
        newData[out_offset++] = this_data[in_offset++];
        newData[out_offset++] = mask_data[i];
      }
      return this._update(newData, this.width, this.height, 4);
    } else if (this.channels === 4) {
      for (let i = 0; i < num_pixels; ++i) {
        this_data[4 * i + 3] = mask_data[i];
      }
      return this;
    }
    throw new Error(`Expected image to have 3 or 4 channels, but got ${this.channels}`);
  }
  /**
   * Resize the image to the given dimensions. This method uses the canvas API to perform the resizing.
   * @param {number} width The width of the new image. `null` or `-1` will preserve the aspect ratio.
   * @param {number} height The height of the new image. `null` or `-1` will preserve the aspect ratio.
   * @param {Object} options Additional options for resizing.
   * @param {0|1|2|3|4|5|string} [options.resample] The resampling method to use.
   * @returns {Promise<RawImage>} `this` to support chaining.
   */
  async resize(width, height, { resample = 2 } = {}) {
    if (this.width === width && this.height === height) {
      return this;
    }
    let resampleMethod = RESAMPLING_MAPPING[resample] ?? resample;
    const nullish_width = isNullishDimension(width);
    const nullish_height = isNullishDimension(height);
    if (nullish_width && nullish_height) {
      return this;
    } else if (nullish_width) {
      width = height / this.height * this.width;
    } else if (nullish_height) {
      height = width / this.width * this.height;
    }
    if (apis.IS_WEB_ENV) {
      const numChannels = this.channels;
      const canvas = this.toCanvas();
      const ctx = createCanvasFunction(width, height).getContext("2d");
      ctx.drawImage(canvas, 0, 0, width, height);
      const resizedImage = new RawImage(ctx.getImageData(0, 0, width, height).data, width, height, 4);
      return resizedImage.convert(numChannels);
    } else {
      let img = this.toSharp();
      switch (resampleMethod) {
        case "box":
        case "hamming":
          if (resampleMethod === "box" || resampleMethod === "hamming") {
            logger.warn(
              `Resampling method ${resampleMethod} is not yet supported. Using bilinear instead.`
            );
            resampleMethod = "bilinear";
          }
        case "nearest":
        case "bilinear":
        case "bicubic":
          img = img.affine([width / this.width, 0, 0, height / this.height], {
            interpolator: resampleMethod
          });
          break;
        case "lanczos":
          img = img.resize({
            width,
            height,
            fit: "fill",
            kernel: "lanczos3"
            // PIL Lanczos uses a kernel size of 3
          });
          break;
        default:
          throw new Error(`Resampling method ${resampleMethod} is not supported.`);
      }
      return await loadImageFunction(img);
    }
  }
  async pad([left, right, top, bottom]) {
    left = Math.max(left, 0);
    right = Math.max(right, 0);
    top = Math.max(top, 0);
    bottom = Math.max(bottom, 0);
    if (left === 0 && right === 0 && top === 0 && bottom === 0) {
      return this;
    }
    if (apis.IS_WEB_ENV) {
      const numChannels = this.channels;
      const canvas = this.toCanvas();
      const newWidth = this.width + left + right;
      const newHeight = this.height + top + bottom;
      const ctx = createCanvasFunction(newWidth, newHeight).getContext("2d");
      ctx.drawImage(canvas, 0, 0, this.width, this.height, left, top, this.width, this.height);
      const paddedImage = new RawImage(ctx.getImageData(0, 0, newWidth, newHeight).data, newWidth, newHeight, 4);
      return paddedImage.convert(numChannels);
    } else {
      const img = this.toSharp().extend({ left, right, top, bottom });
      return await loadImageFunction(img);
    }
  }
  async crop([x_min, y_min, x_max, y_max]) {
    x_min = Math.max(x_min, 0);
    y_min = Math.max(y_min, 0);
    x_max = Math.min(x_max, this.width - 1);
    y_max = Math.min(y_max, this.height - 1);
    if (x_min === 0 && y_min === 0 && x_max === this.width - 1 && y_max === this.height - 1) {
      return this;
    }
    const crop_width = x_max - x_min + 1;
    const crop_height = y_max - y_min + 1;
    if (apis.IS_WEB_ENV) {
      const numChannels = this.channels;
      const canvas = this.toCanvas();
      const ctx = createCanvasFunction(crop_width, crop_height).getContext("2d");
      ctx.drawImage(canvas, x_min, y_min, crop_width, crop_height, 0, 0, crop_width, crop_height);
      const resizedImage = new RawImage(
        ctx.getImageData(0, 0, crop_width, crop_height).data,
        crop_width,
        crop_height,
        4
      );
      return resizedImage.convert(numChannels);
    } else {
      const img = this.toSharp().extract({
        left: x_min,
        top: y_min,
        width: crop_width,
        height: crop_height
      });
      return await loadImageFunction(img);
    }
  }
  async center_crop(crop_width, crop_height) {
    if (this.width === crop_width && this.height === crop_height) {
      return this;
    }
    const width_offset = (this.width - crop_width) / 2;
    const height_offset = (this.height - crop_height) / 2;
    if (apis.IS_WEB_ENV) {
      const numChannels = this.channels;
      const canvas = this.toCanvas();
      const ctx = createCanvasFunction(crop_width, crop_height).getContext("2d");
      let sourceX = 0;
      let sourceY = 0;
      let destX = 0;
      let destY = 0;
      if (width_offset >= 0) {
        sourceX = width_offset;
      } else {
        destX = -width_offset;
      }
      if (height_offset >= 0) {
        sourceY = height_offset;
      } else {
        destY = -height_offset;
      }
      ctx.drawImage(canvas, sourceX, sourceY, crop_width, crop_height, destX, destY, crop_width, crop_height);
      const resizedImage = new RawImage(
        ctx.getImageData(0, 0, crop_width, crop_height).data,
        crop_width,
        crop_height,
        4
      );
      return resizedImage.convert(numChannels);
    } else {
      let img = this.toSharp();
      if (width_offset >= 0 && height_offset >= 0) {
        img = img.extract({
          left: Math.floor(width_offset),
          top: Math.floor(height_offset),
          width: crop_width,
          height: crop_height
        });
      } else if (width_offset <= 0 && height_offset <= 0) {
        const top = Math.floor(-height_offset);
        const left = Math.floor(-width_offset);
        img = img.extend({
          top,
          left,
          // Ensures the resulting image has the desired dimensions
          right: crop_width - this.width - left,
          bottom: crop_height - this.height - top
        });
      } else {
        let y_padding = [0, 0];
        let y_extract = 0;
        if (height_offset < 0) {
          y_padding[0] = Math.floor(-height_offset);
          y_padding[1] = crop_height - this.height - y_padding[0];
        } else {
          y_extract = Math.floor(height_offset);
        }
        let x_padding = [0, 0];
        let x_extract = 0;
        if (width_offset < 0) {
          x_padding[0] = Math.floor(-width_offset);
          x_padding[1] = crop_width - this.width - x_padding[0];
        } else {
          x_extract = Math.floor(width_offset);
        }
        img = img.extend({
          top: y_padding[0],
          bottom: y_padding[1],
          left: x_padding[0],
          right: x_padding[1]
        }).extract({
          left: x_extract,
          top: y_extract,
          width: crop_width,
          height: crop_height
        });
      }
      return await loadImageFunction(img);
    }
  }
  async toBlob(type = "image/png", quality = 1) {
    if (!apis.IS_WEB_ENV) {
      throw new Error("toBlob() is only supported in browser environments.");
    }
    const canvas = this.toCanvas();
    return await canvas.convertToBlob({ type, quality });
  }
  toTensor(channel_format = "CHW") {
    let tensor = new Tensor("uint8", new Uint8Array(this.data), [this.height, this.width, this.channels]);
    if (channel_format === "HWC") ;
    else if (channel_format === "CHW") {
      tensor = tensor.permute(2, 0, 1);
    } else {
      throw new Error(`Unsupported channel format: ${channel_format}`);
    }
    return tensor;
  }
  toCanvas() {
    if (!apis.IS_WEB_ENV) {
      throw new Error("toCanvas() is only supported in browser environments.");
    }
    const cloned = this.clone().rgba();
    const clonedCanvas = createCanvasFunction(cloned.width, cloned.height);
    const data = new ImageDataClass(cloned.data, cloned.width, cloned.height);
    clonedCanvas.getContext("2d").putImageData(data, 0, 0);
    return clonedCanvas;
  }
  /**
   * Split this image into individual bands. This method returns an array of individual image bands from an image.
   * For example, splitting an "RGB" image creates three new images each containing a copy of one of the original bands (red, green, blue).
   *
   * Inspired by PIL's `Image.split()` [function](https://pillow.readthedocs.io/en/latest/reference/Image.html#PIL.Image.Image.split).
   * @returns {RawImage[]} An array containing bands.
   */
  split() {
    const { data, width, height, channels } = this;
    const data_type = (
      /** @type {any} */
      data.constructor
    );
    const per_channel_length = data.length / channels;
    const split_data = Array.from({ length: channels }, () => new data_type(per_channel_length));
    for (let i = 0; i < per_channel_length; ++i) {
      const data_offset = channels * i;
      for (let j = 0; j < channels; ++j) {
        split_data[j][i] = data[data_offset + j];
      }
    }
    return split_data.map((data2) => new RawImage(data2, width, height, 1));
  }
  /**
   * Helper method to update the image data.
   * @param {Uint8ClampedArray} data The new image data.
   * @param {number} width The new width of the image.
   * @param {number} height The new height of the image.
   * @param {1|2|3|4|null} [channels] The new number of channels of the image.
   * @private
   */
  _update(data, width, height, channels = null) {
    this.data = data;
    this.width = width;
    this.height = height;
    if (channels !== null) {
      this.channels = channels;
    }
    return this;
  }
  /**
   * Clone the image
   * @returns {RawImage} The cloned image
   */
  clone() {
    return new RawImage(this.data.slice(), this.width, this.height, this.channels);
  }
  /**
   * Helper method for converting image to have a certain number of channels
   * @param {number} numChannels The number of channels. Must be 1, 3, or 4.
   * @returns {RawImage} `this` to support chaining.
   */
  convert(numChannels) {
    if (this.channels === numChannels) return this;
    switch (numChannels) {
      case 1:
        this.grayscale();
        break;
      case 3:
        this.rgb();
        break;
      case 4:
        this.rgba();
        break;
      default:
        throw new Error(`Conversion failed due to unsupported number of channels: ${this.channels}`);
    }
    return this;
  }
  /**
   * Save the image to the given path.
   * @param {string} path The path to save the image to.
   * @returns {Promise<void>}
   */
  async save(path) {
    if (apis.IS_WEB_ENV) {
      if (apis.IS_WEBWORKER_ENV) {
        throw new Error("Unable to save an image from a Web Worker.");
      }
      const extension = path.split(".").pop().toLowerCase();
      const mime = CONTENT_TYPE_MAP.get(extension) ?? "image/png";
      const blob = await this.toBlob(mime);
      return saveBlob(path, blob);
    } else if (apis.IS_FS_AVAILABLE) {
      const img = this.toSharp();
      await img.toFile(path);
    } else {
      throw new Error("Unable to save the image because filesystem is disabled in this environment.");
    }
  }
  /**
   * Convert the image to a Sharp instance.
   * @returns {import('sharp').Sharp} The Sharp instance.
   */
  toSharp() {
    if (apis.IS_WEB_ENV) {
      throw new Error("toSharp() is only supported in server-side environments.");
    }
    return sharp(this.data, {
      raw: {
        width: this.width,
        height: this.height,
        channels: this.channels
      }
    });
  }
}
RawImage.read.bind(RawImage);
function constraint_to_multiple_of(val, multiple, minVal = 0, maxVal = null) {
  const a = val / multiple;
  let x = bankers_round(a) * multiple;
  if (maxVal !== null && x > maxVal) {
    x = Math.floor(a) * multiple;
  }
  if (x < minVal) {
    x = Math.ceil(a) * multiple;
  }
  return x;
}
function enforce_size_divisibility([width, height], divisor) {
  return [Math.max(Math.floor(width / divisor), 1) * divisor, Math.max(Math.floor(height / divisor), 1) * divisor];
}
class ImageProcessor extends Callable$1 {
  /**
   * Create an image processor from a parsed `preprocessor_config.json`.
   * @param {ImageProcessorConfig} config The configuration object.
   */
  constructor(config) {
    super();
    this.image_mean = config.image_mean ?? config.mean;
    this.image_std = config.image_std ?? config.std;
    this.resample = config.resample ?? 2;
    this.do_rescale = config.do_rescale ?? true;
    this.rescale_factor = config.rescale_factor ?? 1 / 255;
    this.do_normalize = config.do_normalize;
    this.do_thumbnail = config.do_thumbnail;
    this.size = config.size ?? config.image_size;
    this.do_resize = config.do_resize ?? this.size !== void 0;
    this.size_divisibility = config.size_divisibility ?? config.size_divisor;
    this.do_center_crop = config.do_center_crop;
    this.crop_size = config.crop_size;
    this.do_convert_rgb = config.do_convert_rgb ?? true;
    this.do_crop_margin = config.do_crop_margin;
    this.pad_size = config.pad_size;
    this.do_pad = config.do_pad;
    this.min_pixels = config.min_pixels;
    this.max_pixels = config.max_pixels;
    if (this.do_pad && !this.pad_size && !this.size_divisibility && this.size && this.size.width !== void 0 && this.size.height !== void 0) {
      this.pad_size = this.size;
    }
    this.do_flip_channel_order = config.do_flip_channel_order ?? false;
    this.config = config;
  }
  /**
   * Resize the image to make a thumbnail. The image is resized so that no dimension is larger than any
   * corresponding dimension of the specified size.
   * @param {RawImage} image The image to be resized.
   * @param {{height:number, width:number}} size The size `{"height": h, "width": w}` to resize the image to.
   * @param {string | 0 | 1 | 2 | 3 | 4 | 5} [resample=2] The resampling filter to use.
   * @returns {Promise<RawImage>} The resized image.
   */
  async thumbnail(image, size, resample = 2) {
    const input_height = image.height;
    const input_width = image.width;
    const output_height = size.height;
    const output_width = size.width;
    let height = Math.min(input_height, output_height);
    let width = Math.min(input_width, output_width);
    if (height === input_height && width === input_width) {
      return image;
    }
    if (input_height > input_width) {
      width = Math.floor(input_width * height / input_height);
    } else if (input_width > input_height) {
      height = Math.floor(input_height * width / input_width);
    }
    return await image.resize(width, height, { resample });
  }
  /**
   * Crops the margin of the image. Gray pixels are considered margin (i.e., pixels with a value below the threshold).
   * @param {RawImage} image The image to be cropped.
   * @param {number} gray_threshold Value below which pixels are considered to be gray.
   * @returns {Promise<RawImage>} The cropped image.
   */
  async crop_margin(image, gray_threshold = 200) {
    const gray_image = image.clone().grayscale();
    const minValue = min$1(gray_image.data)[0];
    const maxValue = max(gray_image.data)[0];
    const diff = maxValue - minValue;
    if (diff === 0) {
      return image;
    }
    const threshold = gray_threshold / 255;
    let x_min = gray_image.width, y_min = gray_image.height, x_max = 0, y_max = 0;
    const gray_image_data = gray_image.data;
    for (let j = 0; j < gray_image.height; ++j) {
      const row = j * gray_image.width;
      for (let i = 0; i < gray_image.width; ++i) {
        if ((gray_image_data[row + i] - minValue) / diff < threshold) {
          x_min = Math.min(x_min, i);
          y_min = Math.min(y_min, j);
          x_max = Math.max(x_max, i);
          y_max = Math.max(y_max, j);
        }
      }
    }
    image = await image.crop([x_min, y_min, x_max, y_max]);
    return image;
  }
  /**
   * Pad the image by a certain amount.
   * @param {Float32Array} pixelData The pixel data to pad.
   * @param {number[]} imgDims The dimensions of the image (height, width, channels).
   * @param {{width:number; height:number}|number|'square'} padSize The dimensions of the padded image.
   * @param {Object} options The options for padding.
   * @param {'constant'|'symmetric'} [options.mode='constant'] The type of padding to add.
   * @param {boolean} [options.center=false] Whether to center the image.
   * @param {number|number[]} [options.constant_values=0] The constant value to use for padding.
   * @returns {[Float32Array, number[]]} The padded pixel data and image dimensions.
   */
  pad_image(pixelData, imgDims, padSize, { mode = "constant", center = false, constant_values = 0 } = {}) {
    const [imageHeight, imageWidth, imageChannels] = imgDims;
    let paddedImageWidth, paddedImageHeight;
    if (typeof padSize === "number") {
      paddedImageWidth = padSize;
      paddedImageHeight = padSize;
    } else if (padSize === "square") {
      paddedImageWidth = paddedImageHeight = Math.max(imageHeight, imageWidth);
    } else {
      paddedImageWidth = padSize.width;
      paddedImageHeight = padSize.height;
    }
    if (paddedImageWidth !== imageWidth || paddedImageHeight !== imageHeight) {
      const paddedPixelData = new Float32Array(paddedImageWidth * paddedImageHeight * imageChannels);
      if (Array.isArray(constant_values)) {
        for (let i = 0; i < paddedPixelData.length; ++i) {
          paddedPixelData[i] = constant_values[i % imageChannels];
        }
      } else if (constant_values !== 0) {
        paddedPixelData.fill(constant_values);
      }
      const [left, top] = center ? [Math.floor((paddedImageWidth - imageWidth) / 2), Math.floor((paddedImageHeight - imageHeight) / 2)] : [0, 0];
      for (let i = 0; i < imageHeight; ++i) {
        const a = (i + top) * paddedImageWidth;
        const b = i * imageWidth;
        for (let j = 0; j < imageWidth; ++j) {
          const c = (a + j + left) * imageChannels;
          const d = (b + j) * imageChannels;
          for (let k = 0; k < imageChannels; ++k) {
            paddedPixelData[c + k] = pixelData[d + k];
          }
        }
      }
      if (mode === "symmetric") {
        if (center) {
          throw new Error("`center` padding is not supported when `mode` is set to `symmetric`.");
        }
        const h1 = imageHeight - 1;
        const w1 = imageWidth - 1;
        for (let i = 0; i < paddedImageHeight; ++i) {
          const a = i * paddedImageWidth;
          const b = calculateReflectOffset(i, h1) * imageWidth;
          for (let j = 0; j < paddedImageWidth; ++j) {
            if (i < imageHeight && j < imageWidth) continue;
            const c = (a + j) * imageChannels;
            const d = (b + calculateReflectOffset(j, w1)) * imageChannels;
            for (let k = 0; k < imageChannels; ++k) {
              paddedPixelData[c + k] = pixelData[d + k];
            }
          }
        }
      }
      pixelData = paddedPixelData;
      imgDims = [paddedImageHeight, paddedImageWidth, imageChannels];
    }
    return [pixelData, imgDims];
  }
  /**
   * Rescale the image pixel values by `this.rescale_factor`.
   * @param {Float32Array} pixelData The pixel data to rescale.
   * @returns {void}
   */
  rescale(pixelData) {
    for (let i = 0; i < pixelData.length; ++i) {
      pixelData[i] = this.rescale_factor * pixelData[i];
    }
  }
  /**
   * Find the target (width, height) dimension of the output image after
   * resizing given the input image and the desired size.
   * @param {RawImage} image The image to resize.
   * @param {any} size The size to use for resizing the image.
   * @returns {[number, number]} The target (width, height) dimension of the output image after resizing.
   */
  get_resize_output_image_size(image, size) {
    const [srcWidth, srcHeight] = image.size;
    let shortest_edge;
    let longest_edge;
    if (this.do_thumbnail) {
      const { height, width } = size;
      shortest_edge = Math.min(height, width);
    } else if (Number.isInteger(size)) {
      shortest_edge = size;
      longest_edge = this.config.max_size ?? shortest_edge;
    } else if (size !== void 0) {
      shortest_edge = size.shortest_edge;
      longest_edge = size.longest_edge;
    }
    if (shortest_edge !== void 0 || longest_edge !== void 0) {
      const shortResizeFactor = shortest_edge === void 0 ? 1 : Math.max(shortest_edge / srcWidth, shortest_edge / srcHeight);
      const newWidth = srcWidth * shortResizeFactor;
      const newHeight = srcHeight * shortResizeFactor;
      const longResizeFactor = longest_edge === void 0 ? 1 : Math.min(longest_edge / newWidth, longest_edge / newHeight);
      let finalWidth = Math.floor(Number((newWidth * longResizeFactor).toFixed(2)));
      let finalHeight = Math.floor(Number((newHeight * longResizeFactor).toFixed(2)));
      if (this.size_divisibility !== void 0) {
        [finalWidth, finalHeight] = enforce_size_divisibility(
          [finalWidth, finalHeight],
          this.size_divisibility
        );
      }
      return [finalWidth, finalHeight];
    } else if (size !== void 0 && size.width !== void 0 && size.height !== void 0) {
      let newWidth = size.width;
      let newHeight = size.height;
      if (this.config.keep_aspect_ratio && this.config.ensure_multiple_of) {
        let scale_height = newHeight / srcHeight;
        let scale_width = newWidth / srcWidth;
        if (Math.abs(1 - scale_width) < Math.abs(1 - scale_height)) {
          scale_height = scale_width;
        } else {
          scale_width = scale_height;
        }
        newHeight = constraint_to_multiple_of(scale_height * srcHeight, this.config.ensure_multiple_of);
        newWidth = constraint_to_multiple_of(scale_width * srcWidth, this.config.ensure_multiple_of);
      }
      return [newWidth, newHeight];
    } else if (this.size_divisibility !== void 0) {
      return enforce_size_divisibility([srcWidth, srcHeight], this.size_divisibility);
    } else {
      throw new Error(
        `Could not resize image due to unsupported \`this.size\` option in config: ${JSON.stringify(size)}`
      );
    }
  }
  /**
   * Resizes the image.
   * @param {RawImage} image The image to resize.
   * @returns {Promise<RawImage>} The resized image.
   */
  async resize(image) {
    const [newWidth, newHeight] = this.get_resize_output_image_size(image, this.size);
    return await image.resize(newWidth, newHeight, {
      // @ts-expect-error TS2322
      resample: this.resample
    });
  }
  /**
   * @typedef {Object} PreprocessedImage
   * @property {HeightWidth} original_size The original size of the image.
   * @property {HeightWidth} reshaped_input_size The reshaped input size of the image.
   * @property {Tensor} pixel_values The pixel values of the preprocessed image.
   */
  /**
   * Preprocesses the given image.
   *
   * @param {RawImage} image The image to preprocess.
   * @param {Object} overrides The overrides for the preprocessing options.
   * @returns {Promise<PreprocessedImage>} The preprocessed image.
   */
  async preprocess(image, {
    do_normalize = null,
    do_pad = null,
    do_convert_rgb = null,
    do_convert_grayscale = null,
    do_flip_channel_order = null
  } = {}) {
    if (this.do_crop_margin) {
      image = await this.crop_margin(image);
    }
    const [srcWidth, srcHeight] = image.size;
    if (do_convert_rgb ?? this.do_convert_rgb) {
      image = image.rgb();
    } else if (do_convert_grayscale) {
      image = image.grayscale();
    }
    if (this.do_resize) {
      image = await this.resize(image);
    }
    if (this.do_thumbnail) {
      image = await this.thumbnail(image, this.size, this.resample);
    }
    if (this.do_center_crop) {
      let crop_width;
      let crop_height;
      if (Number.isInteger(this.crop_size)) {
        crop_width = this.crop_size;
        crop_height = this.crop_size;
      } else {
        crop_width = this.crop_size.width;
        crop_height = this.crop_size.height;
      }
      image = await image.center_crop(crop_width, crop_height);
    }
    const reshaped_input_size = [image.height, image.width];
    let pixelData = Float32Array.from(image.data);
    let imgDims = [image.height, image.width, image.channels];
    if (this.do_rescale) {
      this.rescale(pixelData);
    }
    if (do_normalize ?? this.do_normalize) {
      let image_mean = this.image_mean;
      if (!Array.isArray(this.image_mean)) {
        image_mean = new Array(image.channels).fill(image_mean);
      }
      let image_std = this.image_std;
      if (!Array.isArray(this.image_std)) {
        image_std = new Array(image.channels).fill(image_std);
      }
      if (image_mean.length !== image.channels || image_std.length !== image.channels) {
        throw new Error(
          `When set to arrays, the length of \`image_mean\` (${image_mean.length}) and \`image_std\` (${image_std.length}) must match the number of channels in the image (${image.channels}).`
        );
      }
      for (let i = 0; i < pixelData.length; i += image.channels) {
        for (let j = 0; j < image.channels; ++j) {
          pixelData[i + j] = (pixelData[i + j] - image_mean[j]) / image_std[j];
        }
      }
    }
    if (do_pad ?? this.do_pad) {
      if (this.pad_size) {
        const padded = this.pad_image(pixelData, [image.height, image.width, image.channels], this.pad_size);
        [pixelData, imgDims] = padded;
      } else if (this.size_divisibility) {
        const paddedWidth = Math.ceil(imgDims[1] / this.size_divisibility) * this.size_divisibility;
        const paddedHeight = Math.ceil(imgDims[0] / this.size_divisibility) * this.size_divisibility;
        [pixelData, imgDims] = this.pad_image(pixelData, imgDims, { width: paddedWidth, height: paddedHeight });
      }
    }
    if (do_flip_channel_order ?? this.do_flip_channel_order) {
      if (imgDims[2] !== 3) {
        throw new Error("Flipping channel order is only supported for RGB images.");
      }
      for (let i = 0; i < pixelData.length; i += 3) {
        const temp = pixelData[i];
        pixelData[i] = pixelData[i + 2];
        pixelData[i + 2] = temp;
      }
    }
    const pixel_values = new Tensor("float32", pixelData, imgDims).permute(2, 0, 1);
    return {
      original_size: [srcHeight, srcWidth],
      reshaped_input_size,
      pixel_values
    };
  }
  /**
   * Preprocess one or more images and batch the result into `pixel_values`.
   * @param {RawImage|RawImage[]} images The image or images to preprocess.
   * @param {...any} args Additional arguments.
   * @returns {Promise<ImageProcessorResult>} An object containing the concatenated pixel values (and other metadata) of the preprocessed images.
   */
  async _call(images, ...args) {
    if (!Array.isArray(images)) {
      images = [images];
    }
    const imageData = await Promise.all(images.map((x) => this.preprocess(x)));
    const pixel_values = stack(
      imageData.map((x) => x.pixel_values),
      0
    );
    return {
      pixel_values,
      // Original sizes of images
      original_sizes: imageData.map((x) => x.original_size),
      // Reshaped sizes of images, before padding or cropping
      reshaped_input_sizes: imageData.map((x) => x.reshaped_input_size)
    };
  }
  /**
   * Instantiate one of the processor classes of the library from a pretrained model.
   *
   * The processor class to instantiate is selected based on the `image_processor_type` (or `feature_extractor_type`; legacy)
   * property of the config object (either passed as an argument or loaded from `pretrained_model_name_or_path` if possible)
   *
   * @param {string} pretrained_model_name_or_path The name or path of the pretrained model. Can be either:
   * - A string, the *model id* of a pretrained processor hosted inside a model repo on huggingface.co.
   *   Valid model ids can be located at the root-level, like `bert-base-uncased`, or namespaced under a
   *   user or organization name, like `dbmdz/bert-base-german-cased`.
   * - A path to a *directory* containing processor files, e.g., `./my_model_directory/`.
   * @param {import('./utils/hub.js').PretrainedOptions} options Additional options for loading the processor.
   *
   * @returns {Promise<ImageProcessor>} A new image processor instance.
   */
  static async from_pretrained(pretrained_model_name_or_path, options = {}) {
    const preprocessorConfig = await getModelJSON(
      pretrained_model_name_or_path,
      IMAGE_PROCESSOR_NAME,
      true,
      options
    );
    return new this(preprocessorConfig);
  }
}
class Idefics3ImageProcessor extends ImageProcessor {
  constructor(config) {
    super(config);
    this.do_image_splitting = config.do_image_splitting ?? true;
    this.max_image_size = config.max_image_size;
  }
  /**
   * @typedef {import('../../utils/image.js').RawImage} RawImage
   * @typedef {import('../../utils/tensor.js').Tensor} Tensor
   */
  /**
   * Calculate size to resize images to, to be multiples of `vision_encoder_max_size` while preserving the aspect ratio.
   * @param {Tensor} pixel_values Tensor of the image to resize.
   * @param {number} vision_encoder_max_size Maximum size of the output image. If the image is larger than this size,
   * it will be split into patches of this size, and the original image will be concatenated with the patches, resized to max_size.
   */
  get_resize_for_vision_encoder(pixel_values, vision_encoder_max_size) {
    let [height, width] = pixel_values.dims.slice(-2);
    const aspect_ratio = width / height;
    if (width >= height) {
      width = Math.ceil(width / vision_encoder_max_size) * vision_encoder_max_size;
      height = Math.floor(width / aspect_ratio);
      height = Math.ceil(height / vision_encoder_max_size) * vision_encoder_max_size;
    } else {
      height = Math.ceil(height / vision_encoder_max_size) * vision_encoder_max_size;
      width = Math.floor(height * aspect_ratio);
      width = Math.ceil(width / vision_encoder_max_size) * vision_encoder_max_size;
    }
    return { height, width };
  }
  /** @param {RawImage|RawImage[]|RawImage[][]} images */
  async _call(images, { do_image_splitting = null, return_row_col_info = false } = {}) {
    let batched_2d_images;
    if (!Array.isArray(images)) {
      batched_2d_images = [[images]];
    } else {
      if (images.length === 0 || !images[0]) {
        throw new Error("No images provided.");
      }
      if (!Array.isArray(images[0])) {
        batched_2d_images = [
          /** @type {RawImage[]} */
          images
        ];
      } else {
        batched_2d_images = /** @type {RawImage[][]} */
        images;
      }
    }
    let all_pixel_values = [];
    let images_list_rows = [];
    let images_list_cols = [];
    const original_sizes = [];
    const reshaped_input_sizes = [];
    for (const image_batch of batched_2d_images) {
      let images_list = await Promise.all(image_batch.map((x) => this.preprocess(x)));
      original_sizes.push(...images_list.map((x) => x.original_size));
      reshaped_input_sizes.push(...images_list.map((x) => x.reshaped_input_size));
      images_list.forEach((x) => x.pixel_values.unsqueeze_(0));
      const { longest_edge } = this.max_image_size;
      let images_tensor;
      if (do_image_splitting ?? this.do_image_splitting) {
        let image_rows = new Array(images_list.length);
        let image_cols = new Array(images_list.length);
        images_tensor = await Promise.all(
          images_list.map(async (x, i) => {
            const new_size = this.get_resize_for_vision_encoder(x.pixel_values, longest_edge);
            const resized = await interpolate_4d(x.pixel_values, {
              size: [new_size.height, new_size.width]
            });
            const { frames, num_splits_h, num_splits_w } = await this.split_image(
              resized,
              this.max_image_size
            );
            image_rows[i] = num_splits_h;
            image_cols[i] = num_splits_w;
            return cat(frames, 0);
          })
        );
        images_list_rows.push(image_rows);
        images_list_cols.push(image_cols);
      } else {
        const size = [longest_edge, longest_edge];
        images_tensor = await Promise.all(images_list.map((x) => interpolate_4d(x.pixel_values, { size })));
        images_list_rows.push(new Array(images_list.length).fill(0));
        images_list_cols.push(new Array(images_list.length).fill(0));
      }
      all_pixel_values.push(cat(images_tensor, 0));
    }
    const batch_size = all_pixel_values.length;
    const [n, c, h, w] = all_pixel_values[0].dims;
    let pixel_values;
    let pixel_attention_mask;
    if (batch_size === 1) {
      pixel_values = all_pixel_values[0].unsqueeze_(0);
      pixel_attention_mask = full([batch_size, n, h, w], true);
    } else {
      const max_num_patches = Math.max(...all_pixel_values.map((x) => x.dims.at(0)));
      pixel_attention_mask = full([batch_size, max_num_patches, h, w], true);
      const pixel_attention_mask_data = pixel_attention_mask.data;
      const pixel_attention_mask_stride = max_num_patches * h * w;
      for (let i = 0; i < batch_size; ++i) {
        const num_patches = all_pixel_values[i].dims[0];
        if (num_patches < max_num_patches) {
          all_pixel_values[i] = cat(
            [all_pixel_values[i], full([max_num_patches - num_patches, c, h, w], 0)],
            0
          );
          const start_offset = i * pixel_attention_mask_stride + num_patches * h * w;
          const end_offset = (i + 1) * pixel_attention_mask_stride;
          pixel_attention_mask_data.fill(false, start_offset, end_offset);
        }
      }
      pixel_values = stack(all_pixel_values, 0);
    }
    return {
      pixel_values,
      pixel_attention_mask,
      original_sizes,
      reshaped_input_sizes,
      ...return_row_col_info ? { rows: images_list_rows, cols: images_list_cols } : {}
    };
  }
  async split_image(pixel_values, { longest_edge }) {
    const max_height = longest_edge;
    const max_width = longest_edge;
    const frames = [];
    const [height, width] = pixel_values.dims.slice(-2);
    let num_splits_h = 0, num_splits_w = 0;
    if (height > max_height || width > max_width) {
      num_splits_h = Math.ceil(height / max_height);
      num_splits_w = Math.ceil(width / max_width);
      const optimal_height = Math.ceil(height / num_splits_h);
      const optimal_width = Math.ceil(width / num_splits_w);
      for (let r = 0; r < num_splits_h; ++r) {
        for (let c = 0; c < num_splits_w; ++c) {
          let start_x, start_y, end_x, end_y;
          if (r === num_splits_h - 1) {
            start_y = height - optimal_height;
            end_y = height;
          } else {
            start_y = r * optimal_height;
            end_y = (r + 1) * optimal_height;
          }
          if (c === num_splits_w - 1) {
            start_x = width - optimal_width;
            end_x = width;
          } else {
            start_x = c * optimal_width;
            end_x = (c + 1) * optimal_width;
          }
          const starts = [start_y, start_x];
          const ends = [end_y, end_x];
          const patch = await slice$1(pixel_values, starts, ends, [2, 3]);
          frames.push(patch);
        }
      }
      const global_image_height = max_height;
      const global_image_width = max_width;
      if (height !== global_image_height || width !== global_image_width) {
        pixel_values = await interpolate_4d(pixel_values, {
          size: [global_image_height, global_image_width]
        });
      }
    }
    frames.push(pixel_values);
    return { frames, num_splits_h, num_splits_w };
  }
}
function _prompt_split_image(image_seq_len, image_rows, image_cols, fake_token_around_image, image_token, global_img_token) {
  let text_split_images = "";
  for (let n_h = 0; n_h < image_rows; ++n_h) {
    for (let n_w = 0; n_w < image_cols; ++n_w) {
      text_split_images += fake_token_around_image + `<row_${n_h + 1}_col_${n_w + 1}>` + image_token.repeat(image_seq_len);
    }
    text_split_images += "\n";
  }
  text_split_images += `
${fake_token_around_image}${global_img_token}` + image_token.repeat(image_seq_len) + `${fake_token_around_image}`;
  return text_split_images;
}
function _prompt_single_image(image_seq_len, fake_token_around_image, image_token, global_img_token) {
  return `${fake_token_around_image}${global_img_token}` + image_token.repeat(image_seq_len) + `${fake_token_around_image}`;
}
function get_image_prompt_string(image_rows, image_cols, image_seq_len, fake_token_around_image, image_token, global_img_token) {
  if (image_rows === 0 && image_cols === 0) {
    return _prompt_single_image(image_seq_len, fake_token_around_image, image_token, global_img_token);
  }
  return _prompt_split_image(
    image_seq_len,
    image_rows,
    image_cols,
    fake_token_around_image,
    image_token,
    global_img_token
  );
}
class Idefics3Processor extends Processor {
  static image_processor_class = Idefics3ImageProcessor;
  static tokenizer_class = GPT2Tokenizer;
  static uses_processor_config = true;
  fake_image_token = "<fake_token_around_image>";
  image_token = "<image>";
  global_img_token = "<global-img>";
  /**
   *
   * @param {string|string[]} text
   * @param {RawImage|RawImage[]|RawImage[][]} images
   * @returns {Promise<any>}
   */
  async _call(text, images = null, options = {}) {
    options.return_row_col_info ??= true;
    let image_inputs;
    if (images) {
      image_inputs = await this.image_processor(images, options);
    }
    if (!Array.isArray(text)) {
      text = [text];
    }
    const image_rows = image_inputs.rows ?? [new Array(text.length).fill(0)];
    const image_cols = image_inputs.cols ?? [new Array(text.length).fill(0)];
    const image_seq_len = this.config.image_seq_len;
    const n_images_in_text = [];
    const prompt_strings = [];
    for (let i = 0; i < text.length; ++i) {
      const sample = text[i];
      const sample_rows = image_rows[i];
      const sample_cols = image_cols[i];
      n_images_in_text.push(count(sample, this.image_token));
      const image_prompt_strings = sample_rows.map(
        (n_rows, j) => get_image_prompt_string(
          n_rows,
          sample_cols[j],
          image_seq_len,
          this.fake_image_token,
          this.image_token,
          this.global_img_token
        )
      );
      const split_sample = sample.split(this.image_token);
      if (split_sample.length === 0) {
        throw new Error("The image token should be present in the text.");
      }
      let new_sample = split_sample[0];
      for (let j = 0; j < image_prompt_strings.length; ++j) {
        new_sample += image_prompt_strings[j] + split_sample[j + 1];
      }
      prompt_strings.push(new_sample);
    }
    const text_inputs = this.tokenizer(prompt_strings);
    return {
      ...text_inputs,
      ...image_inputs
    };
  }
}
const is_chinese_char = (cp) => cp >= 19968 && cp <= 40959 || cp >= 13312 && cp <= 19903 || cp >= 131072 && cp <= 173791 || cp >= 173824 && cp <= 177983 || cp >= 177984 && cp <= 178207 || cp >= 178208 && cp <= 183983 || cp >= 63744 && cp <= 64255 || cp >= 194560 && cp <= 195103;
class BaseStreamer {
  /**
   * Function that is called by `.generate()` to push new tokens
   * @param {bigint[][]} value
   */
  put(value) {
    throw Error("Not implemented");
  }
  /**
   * Function that is called by `.generate()` to signal the end of generation
   */
  end() {
    throw Error("Not implemented");
  }
}
const stdout_write = apis.IS_PROCESS_AVAILABLE ? (x) => process.stdout.write(x) : (x) => console.log(x);
class TextStreamer extends BaseStreamer {
  /**
   *
   * @param {import('../tokenization_utils.js').PreTrainedTokenizer} tokenizer
   * @param {Object} options
   * @param {boolean} [options.skip_prompt=false] Whether to skip the prompt tokens
   * @param {boolean} [options.skip_special_tokens=true] Whether to skip special tokens when decoding
   * @param {function(string): void} [options.callback_function=null] Function to call when a piece of text is ready to display
   * @param {function(bigint[]): void} [options.token_callback_function=null] Function to call when a new token is generated
   * @param {Object} [options.decode_kwargs={}] Additional keyword arguments to pass to the tokenizer's decode method
   */
  constructor(tokenizer, {
    skip_prompt = false,
    callback_function = null,
    token_callback_function = null,
    skip_special_tokens = true,
    decode_kwargs = {},
    ...kwargs
  } = {}) {
    super();
    this.tokenizer = tokenizer;
    this.skip_prompt = skip_prompt;
    this.callback_function = callback_function ?? stdout_write;
    this.token_callback_function = token_callback_function;
    this.decode_kwargs = { skip_special_tokens, ...decode_kwargs, ...kwargs };
    this.token_cache = [];
    this.print_len = 0;
    this.next_tokens_are_prompt = true;
    this.special_ids = new Set(this.tokenizer.all_special_ids.map(BigInt));
  }
  /**
   * Receives tokens, decodes them, and prints them to stdout as soon as they form entire words.
   * @param {bigint[][]} value
   */
  put(value) {
    if (value.length > 1) {
      throw Error("TextStreamer only supports batch size of 1");
    }
    const is_prompt = this.next_tokens_are_prompt;
    if (is_prompt) {
      this.next_tokens_are_prompt = false;
      if (this.skip_prompt) return;
    }
    const tokens = value[0];
    this.token_callback_function?.(tokens);
    if (tokens.length === 1 && this.special_ids.has(tokens[0])) {
      if (this.decode_kwargs.skip_special_tokens) return;
      if (this.token_cache.length > 0) {
        const text2 = this.tokenizer.decode(this.token_cache, this.decode_kwargs);
        const printable_text2 = text2.slice(this.print_len);
        this.on_finalized_text(printable_text2, false);
        this.token_cache = [];
        this.print_len = 0;
      }
      const special_text = this.tokenizer.decode(tokens, this.decode_kwargs);
      this.on_finalized_text(special_text, false);
      return;
    }
    this.token_cache = mergeArrays(this.token_cache, tokens);
    const text = this.tokenizer.decode(this.token_cache, this.decode_kwargs);
    let printable_text;
    if (is_prompt || text.endsWith("\n")) {
      printable_text = text.slice(this.print_len);
      this.token_cache = [];
      this.print_len = 0;
    } else if (text.length > 0 && is_chinese_char(text.charCodeAt(text.length - 1))) {
      printable_text = text.slice(this.print_len);
      this.print_len += printable_text.length;
    } else {
      printable_text = text.slice(this.print_len, text.lastIndexOf(" ") + 1);
      this.print_len += printable_text.length;
    }
    this.on_finalized_text(printable_text, false);
  }
  /**
   * Flushes any remaining cache and prints a newline to stdout.
   */
  end() {
    let printable_text;
    if (this.token_cache.length > 0) {
      const text = this.tokenizer.decode(this.token_cache, this.decode_kwargs);
      printable_text = text.slice(this.print_len);
      this.token_cache = [];
      this.print_len = 0;
    } else {
      printable_text = "";
    }
    this.next_tokens_are_prompt = true;
    this.on_finalized_text(printable_text, true);
  }
  /**
   * Prints the new text to stdout. If the stream is ending, also prints a newline.
   * @param {string} text
   * @param {boolean} stream_end
   */
  on_finalized_text(text, stream_end) {
    if (text.length > 0) {
      this.callback_function?.(text);
    }
    if (stream_end && this.callback_function === stdout_write && apis.IS_PROCESS_AVAILABLE) {
      this.callback_function?.("\n");
    }
  }
}
const name = "Idefics3ForConditionalGeneration";
MODEL_TYPE_MAPPING.set(name, MODEL_TYPES.ImageTextToText);
MODEL_TYPE_MAPPING.set("idefics3", MODEL_TYPES.ImageTextToText);
MODEL_NAME_TO_CLASS_MAPPING.set(name, Idefics3ForConditionalGeneration);
MODEL_CLASS_TO_NAME_MAPPING.set(Idefics3ForConditionalGeneration, name);
registerTaskMappings({ MODEL_FOR_VISION_2_SEQ_MAPPING_NAMES: /* @__PURE__ */ new Map([["idefics3", name]]) });
async function installModelFiles(base, onProgress) {
  const nativeFetch = self.fetch.bind(self), response = await nativeFetch(new URL("manifest.json", base));
  if (!response.ok) throw Error("本地模型清单加载失败，请检查网络。");
  const manifest = await response.json();
  let cache2;
  try {
    cache2 = await caches.open("jelly-local-models-v1");
  } catch {
  }
  const complete = /* @__PURE__ */ new Map();
  self.fetch = async (input, options) => {
    const url = new URL(typeof input === "string" ? input : input instanceof URL ? input.href : input.url, self.location.href);
    const key = url.href.startsWith(base.href) ? decodeURIComponent(url.href.slice(base.href.length)) : null;
    const file = manifest.files[key];
    if (!file) return nativeFetch(input, options);
    const range2 = new Headers(options?.headers || (input instanceof Request ? input.headers : void 0)).get("Range");
    if (range2 === "bytes=0-0") return new Response(new Uint8Array([0]), { status: 206, headers: { "Content-Type": "application/octet-stream", "Content-Length": "1", "Content-Range": `bytes 0-0/${file.bytes}` } });
    return new Response(new ReadableStream({ async start(controller) {
      try {
        for (const part of file.chunks) {
          const partURL = new URL(part.path, base).href;
          let stored = await cache2?.match(partURL), bytes;
          if (stored) bytes = await stored.arrayBuffer();
          else {
            const r = await nativeFetch(partURL);
            if (!r.ok) throw Error("模型分片下载失败，请检查网络后重试。");
            bytes = await r.arrayBuffer();
          }
          if (bytes.byteLength !== part.bytes) throw Error("模型分片大小错误，请重试。");
          const digest = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)), (b) => b.toString(16).padStart(2, "0")).join("");
          if (digest !== part.sha256) {
            await cache2?.delete(partURL);
            throw Error("模型分片校验失败，请重试。");
          }
          if (!stored && cache2) try {
            await cache2.put(partURL, new Response(bytes));
          } catch {
          }
          complete.set(partURL, part.bytes);
          onProgress([...complete.values()].reduce((a, b) => a + b, 0));
          controller.enqueue(new Uint8Array(bytes));
        }
        controller.close();
      } catch (error) {
        controller.error(error);
      }
    } }), { headers: { "Content-Type": "application/octet-stream", "Content-Length": String(file.bytes) } });
  };
  return manifest;
}
/**
 * @license
 * Copyright 2010-2025 Three.js Authors
 * SPDX-License-Identifier: MIT
 */
const REVISION = "180";
const NoColorSpace = "";
const SRGBColorSpace = "srgb";
const LinearSRGBColorSpace = "srgb-linear";
const LinearTransfer = "linear";
const SRGBTransfer = "srgb";
const _lut = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "0a", "0b", "0c", "0d", "0e", "0f", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "1a", "1b", "1c", "1d", "1e", "1f", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "2a", "2b", "2c", "2d", "2e", "2f", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "3a", "3b", "3c", "3d", "3e", "3f", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "4a", "4b", "4c", "4d", "4e", "4f", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "5a", "5b", "5c", "5d", "5e", "5f", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "6a", "6b", "6c", "6d", "6e", "6f", "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "7a", "7b", "7c", "7d", "7e", "7f", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "8a", "8b", "8c", "8d", "8e", "8f", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99", "9a", "9b", "9c", "9d", "9e", "9f", "a0", "a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9", "aa", "ab", "ac", "ad", "ae", "af", "b0", "b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8", "b9", "ba", "bb", "bc", "bd", "be", "bf", "c0", "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "ca", "cb", "cc", "cd", "ce", "cf", "d0", "d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9", "da", "db", "dc", "dd", "de", "df", "e0", "e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8", "e9", "ea", "eb", "ec", "ed", "ee", "ef", "f0", "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "fa", "fb", "fc", "fd", "fe", "ff"];
let _seed = 1234567;
const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;
function generateUUID() {
  const d0 = Math.random() * 4294967295 | 0;
  const d1 = Math.random() * 4294967295 | 0;
  const d2 = Math.random() * 4294967295 | 0;
  const d3 = Math.random() * 4294967295 | 0;
  const uuid = _lut[d0 & 255] + _lut[d0 >> 8 & 255] + _lut[d0 >> 16 & 255] + _lut[d0 >> 24 & 255] + "-" + _lut[d1 & 255] + _lut[d1 >> 8 & 255] + "-" + _lut[d1 >> 16 & 15 | 64] + _lut[d1 >> 24 & 255] + "-" + _lut[d2 & 63 | 128] + _lut[d2 >> 8 & 255] + "-" + _lut[d2 >> 16 & 255] + _lut[d2 >> 24 & 255] + _lut[d3 & 255] + _lut[d3 >> 8 & 255] + _lut[d3 >> 16 & 255] + _lut[d3 >> 24 & 255];
  return uuid.toLowerCase();
}
function clamp$1(value, min2, max2) {
  return Math.max(min2, Math.min(max2, value));
}
function euclideanModulo(n, m) {
  return (n % m + m) % m;
}
function mapLinear(x, a1, a2, b1, b2) {
  return b1 + (x - a1) * (b2 - b1) / (a2 - a1);
}
function inverseLerp(x, y, value) {
  if (x !== y) {
    return (value - x) / (y - x);
  } else {
    return 0;
  }
}
function lerp(x, y, t) {
  return (1 - t) * x + t * y;
}
function damp(x, y, lambda, dt2) {
  return lerp(x, y, 1 - Math.exp(-lambda * dt2));
}
function pingpong(x, length = 1) {
  return length - Math.abs(euclideanModulo(x, length * 2) - length);
}
function smoothstep(x, min2, max2) {
  if (x <= min2) return 0;
  if (x >= max2) return 1;
  x = (x - min2) / (max2 - min2);
  return x * x * (3 - 2 * x);
}
function smootherstep(x, min2, max2) {
  if (x <= min2) return 0;
  if (x >= max2) return 1;
  x = (x - min2) / (max2 - min2);
  return x * x * x * (x * (x * 6 - 15) + 10);
}
function randInt(low, high) {
  return low + Math.floor(Math.random() * (high - low + 1));
}
function randFloat(low, high) {
  return low + Math.random() * (high - low);
}
function randFloatSpread(range2) {
  return range2 * (0.5 - Math.random());
}
function seededRandom(s) {
  if (s !== void 0) _seed = s;
  let t = _seed += 1831565813;
  t = Math.imul(t ^ t >>> 15, t | 1);
  t ^= t + Math.imul(t ^ t >>> 7, t | 61);
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
}
function degToRad(degrees) {
  return degrees * DEG2RAD;
}
function radToDeg(radians) {
  return radians * RAD2DEG;
}
function isPowerOfTwo(value) {
  return (value & value - 1) === 0 && value !== 0;
}
function ceilPowerOfTwo(value) {
  return Math.pow(2, Math.ceil(Math.log(value) / Math.LN2));
}
function floorPowerOfTwo(value) {
  return Math.pow(2, Math.floor(Math.log(value) / Math.LN2));
}
function setQuaternionFromProperEuler(q2, a, b, c, order) {
  const cos = Math.cos;
  const sin = Math.sin;
  const c2 = cos(b / 2);
  const s2 = sin(b / 2);
  const c13 = cos((a + c) / 2);
  const s13 = sin((a + c) / 2);
  const c1_3 = cos((a - c) / 2);
  const s1_3 = sin((a - c) / 2);
  const c3_1 = cos((c - a) / 2);
  const s3_1 = sin((c - a) / 2);
  switch (order) {
    case "XYX":
      q2.set(c2 * s13, s2 * c1_3, s2 * s1_3, c2 * c13);
      break;
    case "YZY":
      q2.set(s2 * s1_3, c2 * s13, s2 * c1_3, c2 * c13);
      break;
    case "ZXZ":
      q2.set(s2 * c1_3, s2 * s1_3, c2 * s13, c2 * c13);
      break;
    case "XZX":
      q2.set(c2 * s13, s2 * s3_1, s2 * c3_1, c2 * c13);
      break;
    case "YXY":
      q2.set(s2 * c3_1, c2 * s13, s2 * s3_1, c2 * c13);
      break;
    case "ZYZ":
      q2.set(s2 * s3_1, s2 * c3_1, c2 * s13, c2 * c13);
      break;
    default:
      console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: " + order);
  }
}
function denormalize(value, array) {
  switch (array.constructor) {
    case Float32Array:
      return value;
    case Uint32Array:
      return value / 4294967295;
    case Uint16Array:
      return value / 65535;
    case Uint8Array:
      return value / 255;
    case Int32Array:
      return Math.max(value / 2147483647, -1);
    case Int16Array:
      return Math.max(value / 32767, -1);
    case Int8Array:
      return Math.max(value / 127, -1);
    default:
      throw new Error("Invalid component type.");
  }
}
function normalize(value, array) {
  switch (array.constructor) {
    case Float32Array:
      return value;
    case Uint32Array:
      return Math.round(value * 4294967295);
    case Uint16Array:
      return Math.round(value * 65535);
    case Uint8Array:
      return Math.round(value * 255);
    case Int32Array:
      return Math.round(value * 2147483647);
    case Int16Array:
      return Math.round(value * 32767);
    case Int8Array:
      return Math.round(value * 127);
    default:
      throw new Error("Invalid component type.");
  }
}
const MathUtils = {
  DEG2RAD,
  RAD2DEG,
  /**
   * Generate a [UUID]{@link https://en.wikipedia.org/wiki/Universally_unique_identifier}
   * (universally unique identifier).
   *
   * @static
   * @method
   * @return {string} The UUID.
   */
  generateUUID,
  /**
   * Clamps the given value between min and max.
   *
   * @static
   * @method
   * @param {number} value - The value to clamp.
   * @param {number} min - The min value.
   * @param {number} max - The max value.
   * @return {number} The clamped value.
   */
  clamp: clamp$1,
  /**
   * Computes the Euclidean modulo of the given parameters that
   * is `( ( n % m ) + m ) % m`.
   *
   * @static
   * @method
   * @param {number} n - The first parameter.
   * @param {number} m - The second parameter.
   * @return {number} The Euclidean modulo.
   */
  euclideanModulo,
  /**
   * Performs a linear mapping from range `<a1, a2>` to range `<b1, b2>`
   * for the given value.
   *
   * @static
   * @method
   * @param {number} x - The value to be mapped.
   * @param {number} a1 - Minimum value for range A.
   * @param {number} a2 - Maximum value for range A.
   * @param {number} b1 - Minimum value for range B.
   * @param {number} b2 - Maximum value for range B.
   * @return {number} The mapped value.
   */
  mapLinear,
  /**
   * Returns the percentage in the closed interval `[0, 1]` of the given value
   * between the start and end point.
   *
   * @static
   * @method
   * @param {number} x - The start point
   * @param {number} y - The end point.
   * @param {number} value - A value between start and end.
   * @return {number} The interpolation factor.
   */
  inverseLerp,
  /**
   * Returns a value linearly interpolated from two known points based on the given interval -
   * `t = 0` will return `x` and `t = 1` will return `y`.
   *
   * @static
   * @method
   * @param {number} x - The start point
   * @param {number} y - The end point.
   * @param {number} t - The interpolation factor in the closed interval `[0, 1]`.
   * @return {number} The interpolated value.
   */
  lerp,
  /**
   * Smoothly interpolate a number from `x` to `y` in  a spring-like manner using a delta
   * time to maintain frame rate independent movement. For details, see
   * [Frame rate independent damping using lerp]{@link http://www.rorydriscoll.com/2016/03/07/frame-rate-independent-damping-using-lerp/}.
   *
   * @static
   * @method
   * @param {number} x - The current point.
   * @param {number} y - The target point.
   * @param {number} lambda - A higher lambda value will make the movement more sudden,
   * and a lower value will make the movement more gradual.
   * @param {number} dt - Delta time in seconds.
   * @return {number} The interpolated value.
   */
  damp,
  /**
   * Returns a value that alternates between `0` and the given `length` parameter.
   *
   * @static
   * @method
   * @param {number} x - The value to pingpong.
   * @param {number} [length=1] - The positive value the function will pingpong to.
   * @return {number} The alternated value.
   */
  pingpong,
  /**
   * Returns a value in the range `[0,1]` that represents the percentage that `x` has
   * moved between `min` and `max`, but smoothed or slowed down the closer `x` is to
   * the `min` and `max`.
   *
   * See [Smoothstep]{@link http://en.wikipedia.org/wiki/Smoothstep} for more details.
   *
   * @static
   * @method
   * @param {number} x - The value to evaluate based on its position between min and max.
   * @param {number} min - The min value. Any x value below min will be `0`.
   * @param {number} max - The max value. Any x value above max will be `1`.
   * @return {number} The alternated value.
   */
  smoothstep,
  /**
   * A [variation on smoothstep]{@link https://en.wikipedia.org/wiki/Smoothstep#Variations}
   * that has zero 1st and 2nd order derivatives at x=0 and x=1.
   *
   * @static
   * @method
   * @param {number} x - The value to evaluate based on its position between min and max.
   * @param {number} min - The min value. Any x value below min will be `0`.
   * @param {number} max - The max value. Any x value above max will be `1`.
   * @return {number} The alternated value.
   */
  smootherstep,
  /**
   * Returns a random integer from `<low, high>` interval.
   *
   * @static
   * @method
   * @param {number} low - The lower value boundary.
   * @param {number} high - The upper value boundary
   * @return {number} A random integer.
   */
  randInt,
  /**
   * Returns a random float from `<low, high>` interval.
   *
   * @static
   * @method
   * @param {number} low - The lower value boundary.
   * @param {number} high - The upper value boundary
   * @return {number} A random float.
   */
  randFloat,
  /**
   * Returns a random integer from `<-range/2, range/2>` interval.
   *
   * @static
   * @method
   * @param {number} range - Defines the value range.
   * @return {number} A random float.
   */
  randFloatSpread,
  /**
   * Returns a deterministic pseudo-random float in the interval `[0, 1]`.
   *
   * @static
   * @method
   * @param {number} [s] - The integer seed.
   * @return {number} A random float.
   */
  seededRandom,
  /**
   * Converts degrees to radians.
   *
   * @static
   * @method
   * @param {number} degrees - A value in degrees.
   * @return {number} The converted value in radians.
   */
  degToRad,
  /**
   * Converts radians to degrees.
   *
   * @static
   * @method
   * @param {number} radians - A value in radians.
   * @return {number} The converted value in degrees.
   */
  radToDeg,
  /**
   * Returns `true` if the given number is a power of two.
   *
   * @static
   * @method
   * @param {number} value - The value to check.
   * @return {boolean} Whether the given number is a power of two or not.
   */
  isPowerOfTwo,
  /**
   * Returns the smallest power of two that is greater than or equal to the given number.
   *
   * @static
   * @method
   * @param {number} value - The value to find a POT for.
   * @return {number} The smallest power of two that is greater than or equal to the given number.
   */
  ceilPowerOfTwo,
  /**
   * Returns the largest power of two that is less than or equal to the given number.
   *
   * @static
   * @method
   * @param {number} value - The value to find a POT for.
   * @return {number} The largest power of two that is less than or equal to the given number.
   */
  floorPowerOfTwo,
  /**
   * Sets the given quaternion from the [Intrinsic Proper Euler Angles]{@link https://en.wikipedia.org/wiki/Euler_angles}
   * defined by the given angles and order.
   *
   * Rotations are applied to the axes in the order specified by order:
   * rotation by angle `a` is applied first, then by angle `b`, then by angle `c`.
   *
   * @static
   * @method
   * @param {Quaternion} q - The quaternion to set.
   * @param {number} a - The rotation applied to the first axis, in radians.
   * @param {number} b - The rotation applied to the second axis, in radians.
   * @param {number} c - The rotation applied to the third axis, in radians.
   * @param {('XYX'|'XZX'|'YXY'|'YZY'|'ZXZ'|'ZYZ')} order - A string specifying the axes order.
   */
  setQuaternionFromProperEuler,
  /**
   * Normalizes the given value according to the given typed array.
   *
   * @static
   * @method
   * @param {number} value - The float value in the range `[0,1]` to normalize.
   * @param {TypedArray} array - The typed array that defines the data type of the value.
   * @return {number} The normalize value.
   */
  normalize,
  /**
   * Denormalizes the given value according to the given typed array.
   *
   * @static
   * @method
   * @param {number} value - The value to denormalize.
   * @param {TypedArray} array - The typed array that defines the data type of the value.
   * @return {number} The denormalize (float) value in the range `[0,1]`.
   */
  denormalize
};
class Matrix3 {
  /**
   * Constructs a new 3x3 matrix. The arguments are supposed to be
   * in row-major order. If no arguments are provided, the constructor
   * initializes the matrix as an identity matrix.
   *
   * @param {number} [n11] - 1-1 matrix element.
   * @param {number} [n12] - 1-2 matrix element.
   * @param {number} [n13] - 1-3 matrix element.
   * @param {number} [n21] - 2-1 matrix element.
   * @param {number} [n22] - 2-2 matrix element.
   * @param {number} [n23] - 2-3 matrix element.
   * @param {number} [n31] - 3-1 matrix element.
   * @param {number} [n32] - 3-2 matrix element.
   * @param {number} [n33] - 3-3 matrix element.
   */
  constructor(n11, n12, n13, n21, n22, n23, n31, n32, n33) {
    Matrix3.prototype.isMatrix3 = true;
    this.elements = [
      1,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      1
    ];
    if (n11 !== void 0) {
      this.set(n11, n12, n13, n21, n22, n23, n31, n32, n33);
    }
  }
  /**
   * Sets the elements of the matrix.The arguments are supposed to be
   * in row-major order.
   *
   * @param {number} [n11] - 1-1 matrix element.
   * @param {number} [n12] - 1-2 matrix element.
   * @param {number} [n13] - 1-3 matrix element.
   * @param {number} [n21] - 2-1 matrix element.
   * @param {number} [n22] - 2-2 matrix element.
   * @param {number} [n23] - 2-3 matrix element.
   * @param {number} [n31] - 3-1 matrix element.
   * @param {number} [n32] - 3-2 matrix element.
   * @param {number} [n33] - 3-3 matrix element.
   * @return {Matrix3} A reference to this matrix.
   */
  set(n11, n12, n13, n21, n22, n23, n31, n32, n33) {
    const te = this.elements;
    te[0] = n11;
    te[1] = n21;
    te[2] = n31;
    te[3] = n12;
    te[4] = n22;
    te[5] = n32;
    te[6] = n13;
    te[7] = n23;
    te[8] = n33;
    return this;
  }
  /**
   * Sets this matrix to the 3x3 identity matrix.
   *
   * @return {Matrix3} A reference to this matrix.
   */
  identity() {
    this.set(
      1,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      1
    );
    return this;
  }
  /**
   * Copies the values of the given matrix to this instance.
   *
   * @param {Matrix3} m - The matrix to copy.
   * @return {Matrix3} A reference to this matrix.
   */
  copy(m) {
    const te = this.elements;
    const me = m.elements;
    te[0] = me[0];
    te[1] = me[1];
    te[2] = me[2];
    te[3] = me[3];
    te[4] = me[4];
    te[5] = me[5];
    te[6] = me[6];
    te[7] = me[7];
    te[8] = me[8];
    return this;
  }
  /**
   * Extracts the basis of this matrix into the three axis vectors provided.
   *
   * @param {Vector3} xAxis - The basis's x axis.
   * @param {Vector3} yAxis - The basis's y axis.
   * @param {Vector3} zAxis - The basis's z axis.
   * @return {Matrix3} A reference to this matrix.
   */
  extractBasis(xAxis, yAxis, zAxis) {
    xAxis.setFromMatrix3Column(this, 0);
    yAxis.setFromMatrix3Column(this, 1);
    zAxis.setFromMatrix3Column(this, 2);
    return this;
  }
  /**
   * Set this matrix to the upper 3x3 matrix of the given 4x4 matrix.
   *
   * @param {Matrix4} m - The 4x4 matrix.
   * @return {Matrix3} A reference to this matrix.
   */
  setFromMatrix4(m) {
    const me = m.elements;
    this.set(
      me[0],
      me[4],
      me[8],
      me[1],
      me[5],
      me[9],
      me[2],
      me[6],
      me[10]
    );
    return this;
  }
  /**
   * Post-multiplies this matrix by the given 3x3 matrix.
   *
   * @param {Matrix3} m - The matrix to multiply with.
   * @return {Matrix3} A reference to this matrix.
   */
  multiply(m) {
    return this.multiplyMatrices(this, m);
  }
  /**
   * Pre-multiplies this matrix by the given 3x3 matrix.
   *
   * @param {Matrix3} m - The matrix to multiply with.
   * @return {Matrix3} A reference to this matrix.
   */
  premultiply(m) {
    return this.multiplyMatrices(m, this);
  }
  /**
   * Multiples the given 3x3 matrices and stores the result
   * in this matrix.
   *
   * @param {Matrix3} a - The first matrix.
   * @param {Matrix3} b - The second matrix.
   * @return {Matrix3} A reference to this matrix.
   */
  multiplyMatrices(a, b) {
    const ae2 = a.elements;
    const be = b.elements;
    const te = this.elements;
    const a11 = ae2[0], a12 = ae2[3], a13 = ae2[6];
    const a21 = ae2[1], a22 = ae2[4], a23 = ae2[7];
    const a31 = ae2[2], a32 = ae2[5], a33 = ae2[8];
    const b11 = be[0], b12 = be[3], b13 = be[6];
    const b21 = be[1], b22 = be[4], b23 = be[7];
    const b31 = be[2], b32 = be[5], b33 = be[8];
    te[0] = a11 * b11 + a12 * b21 + a13 * b31;
    te[3] = a11 * b12 + a12 * b22 + a13 * b32;
    te[6] = a11 * b13 + a12 * b23 + a13 * b33;
    te[1] = a21 * b11 + a22 * b21 + a23 * b31;
    te[4] = a21 * b12 + a22 * b22 + a23 * b32;
    te[7] = a21 * b13 + a22 * b23 + a23 * b33;
    te[2] = a31 * b11 + a32 * b21 + a33 * b31;
    te[5] = a31 * b12 + a32 * b22 + a33 * b32;
    te[8] = a31 * b13 + a32 * b23 + a33 * b33;
    return this;
  }
  /**
   * Multiplies every component of the matrix by the given scalar.
   *
   * @param {number} s - The scalar.
   * @return {Matrix3} A reference to this matrix.
   */
  multiplyScalar(s) {
    const te = this.elements;
    te[0] *= s;
    te[3] *= s;
    te[6] *= s;
    te[1] *= s;
    te[4] *= s;
    te[7] *= s;
    te[2] *= s;
    te[5] *= s;
    te[8] *= s;
    return this;
  }
  /**
   * Computes and returns the determinant of this matrix.
   *
   * @return {number} The determinant.
   */
  determinant() {
    const te = this.elements;
    const a = te[0], b = te[1], c = te[2], d = te[3], e = te[4], f = te[5], g = te[6], h = te[7], i = te[8];
    return a * e * i - a * f * h - b * d * i + b * f * g + c * d * h - c * e * g;
  }
  /**
   * Inverts this matrix, using the [analytic method]{@link https://en.wikipedia.org/wiki/Invertible_matrix#Analytic_solution}.
   * You can not invert with a determinant of zero. If you attempt this, the method produces
   * a zero matrix instead.
   *
   * @return {Matrix3} A reference to this matrix.
   */
  invert() {
    const te = this.elements, n11 = te[0], n21 = te[1], n31 = te[2], n12 = te[3], n22 = te[4], n32 = te[5], n13 = te[6], n23 = te[7], n33 = te[8], t11 = n33 * n22 - n32 * n23, t12 = n32 * n13 - n33 * n12, t13 = n23 * n12 - n22 * n13, det = n11 * t11 + n21 * t12 + n31 * t13;
    if (det === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0);
    const detInv = 1 / det;
    te[0] = t11 * detInv;
    te[1] = (n31 * n23 - n33 * n21) * detInv;
    te[2] = (n32 * n21 - n31 * n22) * detInv;
    te[3] = t12 * detInv;
    te[4] = (n33 * n11 - n31 * n13) * detInv;
    te[5] = (n31 * n12 - n32 * n11) * detInv;
    te[6] = t13 * detInv;
    te[7] = (n21 * n13 - n23 * n11) * detInv;
    te[8] = (n22 * n11 - n21 * n12) * detInv;
    return this;
  }
  /**
   * Transposes this matrix in place.
   *
   * @return {Matrix3} A reference to this matrix.
   */
  transpose() {
    let tmp;
    const m = this.elements;
    tmp = m[1];
    m[1] = m[3];
    m[3] = tmp;
    tmp = m[2];
    m[2] = m[6];
    m[6] = tmp;
    tmp = m[5];
    m[5] = m[7];
    m[7] = tmp;
    return this;
  }
  /**
   * Computes the normal matrix which is the inverse transpose of the upper
   * left 3x3 portion of the given 4x4 matrix.
   *
   * @param {Matrix4} matrix4 - The 4x4 matrix.
   * @return {Matrix3} A reference to this matrix.
   */
  getNormalMatrix(matrix4) {
    return this.setFromMatrix4(matrix4).invert().transpose();
  }
  /**
   * Transposes this matrix into the supplied array, and returns itself unchanged.
   *
   * @param {Array<number>} r - An array to store the transposed matrix elements.
   * @return {Matrix3} A reference to this matrix.
   */
  transposeIntoArray(r) {
    const m = this.elements;
    r[0] = m[0];
    r[1] = m[3];
    r[2] = m[6];
    r[3] = m[1];
    r[4] = m[4];
    r[5] = m[7];
    r[6] = m[2];
    r[7] = m[5];
    r[8] = m[8];
    return this;
  }
  /**
   * Sets the UV transform matrix from offset, repeat, rotation, and center.
   *
   * @param {number} tx - Offset x.
   * @param {number} ty - Offset y.
   * @param {number} sx - Repeat x.
   * @param {number} sy - Repeat y.
   * @param {number} rotation - Rotation, in radians. Positive values rotate counterclockwise.
   * @param {number} cx - Center x of rotation.
   * @param {number} cy - Center y of rotation
   * @return {Matrix3} A reference to this matrix.
   */
  setUvTransform(tx, ty, sx, sy, rotation, cx, cy) {
    const c = Math.cos(rotation);
    const s = Math.sin(rotation);
    this.set(
      sx * c,
      sx * s,
      -sx * (c * cx + s * cy) + cx + tx,
      -sy * s,
      sy * c,
      -sy * (-s * cx + c * cy) + cy + ty,
      0,
      0,
      1
    );
    return this;
  }
  /**
   * Scales this matrix with the given scalar values.
   *
   * @param {number} sx - The amount to scale in the X axis.
   * @param {number} sy - The amount to scale in the Y axis.
   * @return {Matrix3} A reference to this matrix.
   */
  scale(sx, sy) {
    this.premultiply(_m3.makeScale(sx, sy));
    return this;
  }
  /**
   * Rotates this matrix by the given angle.
   *
   * @param {number} theta - The rotation in radians.
   * @return {Matrix3} A reference to this matrix.
   */
  rotate(theta) {
    this.premultiply(_m3.makeRotation(-theta));
    return this;
  }
  /**
   * Translates this matrix by the given scalar values.
   *
   * @param {number} tx - The amount to translate in the X axis.
   * @param {number} ty - The amount to translate in the Y axis.
   * @return {Matrix3} A reference to this matrix.
   */
  translate(tx, ty) {
    this.premultiply(_m3.makeTranslation(tx, ty));
    return this;
  }
  // for 2D Transforms
  /**
   * Sets this matrix as a 2D translation transform.
   *
   * @param {number|Vector2} x - The amount to translate in the X axis or alternatively a translation vector.
   * @param {number} y - The amount to translate in the Y axis.
   * @return {Matrix3} A reference to this matrix.
   */
  makeTranslation(x, y) {
    if (x.isVector2) {
      this.set(
        1,
        0,
        x.x,
        0,
        1,
        x.y,
        0,
        0,
        1
      );
    } else {
      this.set(
        1,
        0,
        x,
        0,
        1,
        y,
        0,
        0,
        1
      );
    }
    return this;
  }
  /**
   * Sets this matrix as a 2D rotational transformation.
   *
   * @param {number} theta - The rotation in radians.
   * @return {Matrix3} A reference to this matrix.
   */
  makeRotation(theta) {
    const c = Math.cos(theta);
    const s = Math.sin(theta);
    this.set(
      c,
      -s,
      0,
      s,
      c,
      0,
      0,
      0,
      1
    );
    return this;
  }
  /**
   * Sets this matrix as a 2D scale transform.
   *
   * @param {number} x - The amount to scale in the X axis.
   * @param {number} y - The amount to scale in the Y axis.
   * @return {Matrix3} A reference to this matrix.
   */
  makeScale(x, y) {
    this.set(
      x,
      0,
      0,
      0,
      y,
      0,
      0,
      0,
      1
    );
    return this;
  }
  /**
   * Returns `true` if this matrix is equal with the given one.
   *
   * @param {Matrix3} matrix - The matrix to test for equality.
   * @return {boolean} Whether this matrix is equal with the given one.
   */
  equals(matrix) {
    const te = this.elements;
    const me = matrix.elements;
    for (let i = 0; i < 9; i++) {
      if (te[i] !== me[i]) return false;
    }
    return true;
  }
  /**
   * Sets the elements of the matrix from the given array.
   *
   * @param {Array<number>} array - The matrix elements in column-major order.
   * @param {number} [offset=0] - Index of the first element in the array.
   * @return {Matrix3} A reference to this matrix.
   */
  fromArray(array, offset = 0) {
    for (let i = 0; i < 9; i++) {
      this.elements[i] = array[i + offset];
    }
    return this;
  }
  /**
   * Writes the elements of this matrix to the given array. If no array is provided,
   * the method returns a new instance.
   *
   * @param {Array<number>} [array=[]] - The target array holding the matrix elements in column-major order.
   * @param {number} [offset=0] - Index of the first element in the array.
   * @return {Array<number>} The matrix elements in column-major order.
   */
  toArray(array = [], offset = 0) {
    const te = this.elements;
    array[offset] = te[0];
    array[offset + 1] = te[1];
    array[offset + 2] = te[2];
    array[offset + 3] = te[3];
    array[offset + 4] = te[4];
    array[offset + 5] = te[5];
    array[offset + 6] = te[6];
    array[offset + 7] = te[7];
    array[offset + 8] = te[8];
    return array;
  }
  /**
   * Returns a matrix with copied values from this instance.
   *
   * @return {Matrix3} A clone of this instance.
   */
  clone() {
    return new this.constructor().fromArray(this.elements);
  }
}
const _m3 = /* @__PURE__ */ new Matrix3();
const _cache = {};
function warnOnce(message) {
  if (message in _cache) return;
  _cache[message] = true;
  console.warn(message);
}
const LINEAR_REC709_TO_XYZ = /* @__PURE__ */ new Matrix3().set(
  0.4123908,
  0.3575843,
  0.1804808,
  0.212639,
  0.7151687,
  0.0721923,
  0.0193308,
  0.1191948,
  0.9505322
);
const XYZ_TO_LINEAR_REC709 = /* @__PURE__ */ new Matrix3().set(
  3.2409699,
  -1.5373832,
  -0.4986108,
  -0.9692436,
  1.8759675,
  0.0415551,
  0.0556301,
  -0.203977,
  1.0569715
);
function createColorManagement() {
  const ColorManagement2 = {
    enabled: true,
    workingColorSpace: LinearSRGBColorSpace,
    /**
     * Implementations of supported color spaces.
     *
     * Required:
     *	- primaries: chromaticity coordinates [ rx ry gx gy bx by ]
     *	- whitePoint: reference white [ x y ]
     *	- transfer: transfer function (pre-defined)
     *	- toXYZ: Matrix3 RGB to XYZ transform
     *	- fromXYZ: Matrix3 XYZ to RGB transform
     *	- luminanceCoefficients: RGB luminance coefficients
     *
     * Optional:
     *  - outputColorSpaceConfig: { drawingBufferColorSpace: ColorSpace, toneMappingMode: 'extended' | 'standard' }
     *  - workingColorSpaceConfig: { unpackColorSpace: ColorSpace }
     *
     * Reference:
     * - https://www.russellcottrell.com/photo/matrixCalculator.htm
     */
    spaces: {},
    convert: function(color, sourceColorSpace, targetColorSpace) {
      if (this.enabled === false || sourceColorSpace === targetColorSpace || !sourceColorSpace || !targetColorSpace) {
        return color;
      }
      if (this.spaces[sourceColorSpace].transfer === SRGBTransfer) {
        color.r = SRGBToLinear(color.r);
        color.g = SRGBToLinear(color.g);
        color.b = SRGBToLinear(color.b);
      }
      if (this.spaces[sourceColorSpace].primaries !== this.spaces[targetColorSpace].primaries) {
        color.applyMatrix3(this.spaces[sourceColorSpace].toXYZ);
        color.applyMatrix3(this.spaces[targetColorSpace].fromXYZ);
      }
      if (this.spaces[targetColorSpace].transfer === SRGBTransfer) {
        color.r = LinearToSRGB(color.r);
        color.g = LinearToSRGB(color.g);
        color.b = LinearToSRGB(color.b);
      }
      return color;
    },
    workingToColorSpace: function(color, targetColorSpace) {
      return this.convert(color, this.workingColorSpace, targetColorSpace);
    },
    colorSpaceToWorking: function(color, sourceColorSpace) {
      return this.convert(color, sourceColorSpace, this.workingColorSpace);
    },
    getPrimaries: function(colorSpace) {
      return this.spaces[colorSpace].primaries;
    },
    getTransfer: function(colorSpace) {
      if (colorSpace === NoColorSpace) return LinearTransfer;
      return this.spaces[colorSpace].transfer;
    },
    getToneMappingMode: function(colorSpace) {
      return this.spaces[colorSpace].outputColorSpaceConfig.toneMappingMode || "standard";
    },
    getLuminanceCoefficients: function(target, colorSpace = this.workingColorSpace) {
      return target.fromArray(this.spaces[colorSpace].luminanceCoefficients);
    },
    define: function(colorSpaces) {
      Object.assign(this.spaces, colorSpaces);
    },
    // Internal APIs
    _getMatrix: function(targetMatrix, sourceColorSpace, targetColorSpace) {
      return targetMatrix.copy(this.spaces[sourceColorSpace].toXYZ).multiply(this.spaces[targetColorSpace].fromXYZ);
    },
    _getDrawingBufferColorSpace: function(colorSpace) {
      return this.spaces[colorSpace].outputColorSpaceConfig.drawingBufferColorSpace;
    },
    _getUnpackColorSpace: function(colorSpace = this.workingColorSpace) {
      return this.spaces[colorSpace].workingColorSpaceConfig.unpackColorSpace;
    },
    // Deprecated
    fromWorkingColorSpace: function(color, targetColorSpace) {
      warnOnce("THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace().");
      return ColorManagement2.workingToColorSpace(color, targetColorSpace);
    },
    toWorkingColorSpace: function(color, sourceColorSpace) {
      warnOnce("THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking().");
      return ColorManagement2.colorSpaceToWorking(color, sourceColorSpace);
    }
  };
  const REC709_PRIMARIES = [0.64, 0.33, 0.3, 0.6, 0.15, 0.06];
  const REC709_LUMINANCE_COEFFICIENTS = [0.2126, 0.7152, 0.0722];
  const D65 = [0.3127, 0.329];
  ColorManagement2.define({
    [LinearSRGBColorSpace]: {
      primaries: REC709_PRIMARIES,
      whitePoint: D65,
      transfer: LinearTransfer,
      toXYZ: LINEAR_REC709_TO_XYZ,
      fromXYZ: XYZ_TO_LINEAR_REC709,
      luminanceCoefficients: REC709_LUMINANCE_COEFFICIENTS,
      workingColorSpaceConfig: { unpackColorSpace: SRGBColorSpace },
      outputColorSpaceConfig: { drawingBufferColorSpace: SRGBColorSpace }
    },
    [SRGBColorSpace]: {
      primaries: REC709_PRIMARIES,
      whitePoint: D65,
      transfer: SRGBTransfer,
      toXYZ: LINEAR_REC709_TO_XYZ,
      fromXYZ: XYZ_TO_LINEAR_REC709,
      luminanceCoefficients: REC709_LUMINANCE_COEFFICIENTS,
      outputColorSpaceConfig: { drawingBufferColorSpace: SRGBColorSpace }
    }
  });
  return ColorManagement2;
}
const ColorManagement = /* @__PURE__ */ createColorManagement();
function SRGBToLinear(c) {
  return c < 0.04045 ? c * 0.0773993808 : Math.pow(c * 0.9478672986 + 0.0521327014, 2.4);
}
function LinearToSRGB(c) {
  return c < 31308e-7 ? c * 12.92 : 1.055 * Math.pow(c, 0.41666) - 0.055;
}
const _colorKeywords = {
  "aliceblue": 15792383,
  "antiquewhite": 16444375,
  "aqua": 65535,
  "aquamarine": 8388564,
  "azure": 15794175,
  "beige": 16119260,
  "bisque": 16770244,
  "black": 0,
  "blanchedalmond": 16772045,
  "blue": 255,
  "blueviolet": 9055202,
  "brown": 10824234,
  "burlywood": 14596231,
  "cadetblue": 6266528,
  "chartreuse": 8388352,
  "chocolate": 13789470,
  "coral": 16744272,
  "cornflowerblue": 6591981,
  "cornsilk": 16775388,
  "crimson": 14423100,
  "cyan": 65535,
  "darkblue": 139,
  "darkcyan": 35723,
  "darkgoldenrod": 12092939,
  "darkgray": 11119017,
  "darkgreen": 25600,
  "darkgrey": 11119017,
  "darkkhaki": 12433259,
  "darkmagenta": 9109643,
  "darkolivegreen": 5597999,
  "darkorange": 16747520,
  "darkorchid": 10040012,
  "darkred": 9109504,
  "darksalmon": 15308410,
  "darkseagreen": 9419919,
  "darkslateblue": 4734347,
  "darkslategray": 3100495,
  "darkslategrey": 3100495,
  "darkturquoise": 52945,
  "darkviolet": 9699539,
  "deeppink": 16716947,
  "deepskyblue": 49151,
  "dimgray": 6908265,
  "dimgrey": 6908265,
  "dodgerblue": 2003199,
  "firebrick": 11674146,
  "floralwhite": 16775920,
  "forestgreen": 2263842,
  "fuchsia": 16711935,
  "gainsboro": 14474460,
  "ghostwhite": 16316671,
  "gold": 16766720,
  "goldenrod": 14329120,
  "gray": 8421504,
  "green": 32768,
  "greenyellow": 11403055,
  "grey": 8421504,
  "honeydew": 15794160,
  "hotpink": 16738740,
  "indianred": 13458524,
  "indigo": 4915330,
  "ivory": 16777200,
  "khaki": 15787660,
  "lavender": 15132410,
  "lavenderblush": 16773365,
  "lawngreen": 8190976,
  "lemonchiffon": 16775885,
  "lightblue": 11393254,
  "lightcoral": 15761536,
  "lightcyan": 14745599,
  "lightgoldenrodyellow": 16448210,
  "lightgray": 13882323,
  "lightgreen": 9498256,
  "lightgrey": 13882323,
  "lightpink": 16758465,
  "lightsalmon": 16752762,
  "lightseagreen": 2142890,
  "lightskyblue": 8900346,
  "lightslategray": 7833753,
  "lightslategrey": 7833753,
  "lightsteelblue": 11584734,
  "lightyellow": 16777184,
  "lime": 65280,
  "limegreen": 3329330,
  "linen": 16445670,
  "magenta": 16711935,
  "maroon": 8388608,
  "mediumaquamarine": 6737322,
  "mediumblue": 205,
  "mediumorchid": 12211667,
  "mediumpurple": 9662683,
  "mediumseagreen": 3978097,
  "mediumslateblue": 8087790,
  "mediumspringgreen": 64154,
  "mediumturquoise": 4772300,
  "mediumvioletred": 13047173,
  "midnightblue": 1644912,
  "mintcream": 16121850,
  "mistyrose": 16770273,
  "moccasin": 16770229,
  "navajowhite": 16768685,
  "navy": 128,
  "oldlace": 16643558,
  "olive": 8421376,
  "olivedrab": 7048739,
  "orange": 16753920,
  "orangered": 16729344,
  "orchid": 14315734,
  "palegoldenrod": 15657130,
  "palegreen": 10025880,
  "paleturquoise": 11529966,
  "palevioletred": 14381203,
  "papayawhip": 16773077,
  "peachpuff": 16767673,
  "peru": 13468991,
  "pink": 16761035,
  "plum": 14524637,
  "powderblue": 11591910,
  "purple": 8388736,
  "rebeccapurple": 6697881,
  "red": 16711680,
  "rosybrown": 12357519,
  "royalblue": 4286945,
  "saddlebrown": 9127187,
  "salmon": 16416882,
  "sandybrown": 16032864,
  "seagreen": 3050327,
  "seashell": 16774638,
  "sienna": 10506797,
  "silver": 12632256,
  "skyblue": 8900331,
  "slateblue": 6970061,
  "slategray": 7372944,
  "slategrey": 7372944,
  "snow": 16775930,
  "springgreen": 65407,
  "steelblue": 4620980,
  "tan": 13808780,
  "teal": 32896,
  "thistle": 14204888,
  "tomato": 16737095,
  "turquoise": 4251856,
  "violet": 15631086,
  "wheat": 16113331,
  "white": 16777215,
  "whitesmoke": 16119285,
  "yellow": 16776960,
  "yellowgreen": 10145074
};
const _hslA = { h: 0, s: 0, l: 0 };
const _hslB = { h: 0, s: 0, l: 0 };
function hue2rgb(p, q2, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q2 - p) * 6 * t;
  if (t < 1 / 2) return q2;
  if (t < 2 / 3) return p + (q2 - p) * 6 * (2 / 3 - t);
  return p;
}
class Color {
  /**
   * Constructs a new color.
   *
   * Note that standard method of specifying color in three.js is with a hexadecimal triplet,
   * and that method is used throughout the rest of the documentation.
   *
   * @param {(number|string|Color)} [r] - The red component of the color. If `g` and `b` are
   * not provided, it can be hexadecimal triplet, a CSS-style string or another `Color` instance.
   * @param {number} [g] - The green component.
   * @param {number} [b] - The blue component.
   */
  constructor(r, g, b) {
    this.isColor = true;
    this.r = 1;
    this.g = 1;
    this.b = 1;
    return this.set(r, g, b);
  }
  /**
   * Sets the colors's components from the given values.
   *
   * @param {(number|string|Color)} [r] - The red component of the color. If `g` and `b` are
   * not provided, it can be hexadecimal triplet, a CSS-style string or another `Color` instance.
   * @param {number} [g] - The green component.
   * @param {number} [b] - The blue component.
   * @return {Color} A reference to this color.
   */
  set(r, g, b) {
    if (g === void 0 && b === void 0) {
      const value = r;
      if (value && value.isColor) {
        this.copy(value);
      } else if (typeof value === "number") {
        this.setHex(value);
      } else if (typeof value === "string") {
        this.setStyle(value);
      }
    } else {
      this.setRGB(r, g, b);
    }
    return this;
  }
  /**
   * Sets the colors's components to the given scalar value.
   *
   * @param {number} scalar - The scalar value.
   * @return {Color} A reference to this color.
   */
  setScalar(scalar) {
    this.r = scalar;
    this.g = scalar;
    this.b = scalar;
    return this;
  }
  /**
   * Sets this color from a hexadecimal value.
   *
   * @param {number} hex - The hexadecimal value.
   * @param {string} [colorSpace=SRGBColorSpace] - The color space.
   * @return {Color} A reference to this color.
   */
  setHex(hex, colorSpace = SRGBColorSpace) {
    hex = Math.floor(hex);
    this.r = (hex >> 16 & 255) / 255;
    this.g = (hex >> 8 & 255) / 255;
    this.b = (hex & 255) / 255;
    ColorManagement.colorSpaceToWorking(this, colorSpace);
    return this;
  }
  /**
   * Sets this color from RGB values.
   *
   * @param {number} r - Red channel value between `0.0` and `1.0`.
   * @param {number} g - Green channel value between `0.0` and `1.0`.
   * @param {number} b - Blue channel value between `0.0` and `1.0`.
   * @param {string} [colorSpace=ColorManagement.workingColorSpace] - The color space.
   * @return {Color} A reference to this color.
   */
  setRGB(r, g, b, colorSpace = ColorManagement.workingColorSpace) {
    this.r = r;
    this.g = g;
    this.b = b;
    ColorManagement.colorSpaceToWorking(this, colorSpace);
    return this;
  }
  /**
   * Sets this color from RGB values.
   *
   * @param {number} h - Hue value between `0.0` and `1.0`.
   * @param {number} s - Saturation value between `0.0` and `1.0`.
   * @param {number} l - Lightness value between `0.0` and `1.0`.
   * @param {string} [colorSpace=ColorManagement.workingColorSpace] - The color space.
   * @return {Color} A reference to this color.
   */
  setHSL(h, s, l, colorSpace = ColorManagement.workingColorSpace) {
    h = euclideanModulo(h, 1);
    s = clamp$1(s, 0, 1);
    l = clamp$1(l, 0, 1);
    if (s === 0) {
      this.r = this.g = this.b = l;
    } else {
      const p = l <= 0.5 ? l * (1 + s) : l + s - l * s;
      const q2 = 2 * l - p;
      this.r = hue2rgb(q2, p, h + 1 / 3);
      this.g = hue2rgb(q2, p, h);
      this.b = hue2rgb(q2, p, h - 1 / 3);
    }
    ColorManagement.colorSpaceToWorking(this, colorSpace);
    return this;
  }
  /**
   * Sets this color from a CSS-style string. For example, `rgb(250, 0,0)`,
   * `rgb(100%, 0%, 0%)`, `hsl(0, 100%, 50%)`, `#ff0000`, `#f00`, or `red` ( or
   * any [X11 color name]{@link https://en.wikipedia.org/wiki/X11_color_names#Color_name_chart} -
   * all 140 color names are supported).
   *
   * @param {string} style - Color as a CSS-style string.
   * @param {string} [colorSpace=SRGBColorSpace] - The color space.
   * @return {Color} A reference to this color.
   */
  setStyle(style, colorSpace = SRGBColorSpace) {
    function handleAlpha(string) {
      if (string === void 0) return;
      if (parseFloat(string) < 1) {
        console.warn("THREE.Color: Alpha component of " + style + " will be ignored.");
      }
    }
    let m;
    if (m = /^(\w+)\(([^\)]*)\)/.exec(style)) {
      let color;
      const name2 = m[1];
      const components = m[2];
      switch (name2) {
        case "rgb":
        case "rgba":
          if (color = /^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(components)) {
            handleAlpha(color[4]);
            return this.setRGB(
              Math.min(255, parseInt(color[1], 10)) / 255,
              Math.min(255, parseInt(color[2], 10)) / 255,
              Math.min(255, parseInt(color[3], 10)) / 255,
              colorSpace
            );
          }
          if (color = /^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(components)) {
            handleAlpha(color[4]);
            return this.setRGB(
              Math.min(100, parseInt(color[1], 10)) / 100,
              Math.min(100, parseInt(color[2], 10)) / 100,
              Math.min(100, parseInt(color[3], 10)) / 100,
              colorSpace
            );
          }
          break;
        case "hsl":
        case "hsla":
          if (color = /^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(components)) {
            handleAlpha(color[4]);
            return this.setHSL(
              parseFloat(color[1]) / 360,
              parseFloat(color[2]) / 100,
              parseFloat(color[3]) / 100,
              colorSpace
            );
          }
          break;
        default:
          console.warn("THREE.Color: Unknown color model " + style);
      }
    } else if (m = /^\#([A-Fa-f\d]+)$/.exec(style)) {
      const hex = m[1];
      const size = hex.length;
      if (size === 3) {
        return this.setRGB(
          parseInt(hex.charAt(0), 16) / 15,
          parseInt(hex.charAt(1), 16) / 15,
          parseInt(hex.charAt(2), 16) / 15,
          colorSpace
        );
      } else if (size === 6) {
        return this.setHex(parseInt(hex, 16), colorSpace);
      } else {
        console.warn("THREE.Color: Invalid hex color " + style);
      }
    } else if (style && style.length > 0) {
      return this.setColorName(style, colorSpace);
    }
    return this;
  }
  /**
   * Sets this color from a color name. Faster than {@link Color#setStyle} if
   * you don't need the other CSS-style formats.
   *
   * For convenience, the list of names is exposed in `Color.NAMES` as a hash.
   * ```js
   * Color.NAMES.aliceblue // returns 0xF0F8FF
   * ```
   *
   * @param {string} style - The color name.
   * @param {string} [colorSpace=SRGBColorSpace] - The color space.
   * @return {Color} A reference to this color.
   */
  setColorName(style, colorSpace = SRGBColorSpace) {
    const hex = _colorKeywords[style.toLowerCase()];
    if (hex !== void 0) {
      this.setHex(hex, colorSpace);
    } else {
      console.warn("THREE.Color: Unknown color " + style);
    }
    return this;
  }
  /**
   * Returns a new color with copied values from this instance.
   *
   * @return {Color} A clone of this instance.
   */
  clone() {
    return new this.constructor(this.r, this.g, this.b);
  }
  /**
   * Copies the values of the given color to this instance.
   *
   * @param {Color} color - The color to copy.
   * @return {Color} A reference to this color.
   */
  copy(color) {
    this.r = color.r;
    this.g = color.g;
    this.b = color.b;
    return this;
  }
  /**
   * Copies the given color into this color, and then converts this color from
   * `SRGBColorSpace` to `LinearSRGBColorSpace`.
   *
   * @param {Color} color - The color to copy/convert.
   * @return {Color} A reference to this color.
   */
  copySRGBToLinear(color) {
    this.r = SRGBToLinear(color.r);
    this.g = SRGBToLinear(color.g);
    this.b = SRGBToLinear(color.b);
    return this;
  }
  /**
   * Copies the given color into this color, and then converts this color from
   * `LinearSRGBColorSpace` to `SRGBColorSpace`.
   *
   * @param {Color} color - The color to copy/convert.
   * @return {Color} A reference to this color.
   */
  copyLinearToSRGB(color) {
    this.r = LinearToSRGB(color.r);
    this.g = LinearToSRGB(color.g);
    this.b = LinearToSRGB(color.b);
    return this;
  }
  /**
   * Converts this color from `SRGBColorSpace` to `LinearSRGBColorSpace`.
   *
   * @return {Color} A reference to this color.
   */
  convertSRGBToLinear() {
    this.copySRGBToLinear(this);
    return this;
  }
  /**
   * Converts this color from `LinearSRGBColorSpace` to `SRGBColorSpace`.
   *
   * @return {Color} A reference to this color.
   */
  convertLinearToSRGB() {
    this.copyLinearToSRGB(this);
    return this;
  }
  /**
   * Returns the hexadecimal value of this color.
   *
   * @param {string} [colorSpace=SRGBColorSpace] - The color space.
   * @return {number} The hexadecimal value.
   */
  getHex(colorSpace = SRGBColorSpace) {
    ColorManagement.workingToColorSpace(_color.copy(this), colorSpace);
    return Math.round(clamp$1(_color.r * 255, 0, 255)) * 65536 + Math.round(clamp$1(_color.g * 255, 0, 255)) * 256 + Math.round(clamp$1(_color.b * 255, 0, 255));
  }
  /**
   * Returns the hexadecimal value of this color as a string (for example, 'FFFFFF').
   *
   * @param {string} [colorSpace=SRGBColorSpace] - The color space.
   * @return {string} The hexadecimal value as a string.
   */
  getHexString(colorSpace = SRGBColorSpace) {
    return ("000000" + this.getHex(colorSpace).toString(16)).slice(-6);
  }
  /**
   * Converts the colors RGB values into the HSL format and stores them into the
   * given target object.
   *
   * @param {{h:number,s:number,l:number}} target - The target object that is used to store the method's result.
   * @param {string} [colorSpace=ColorManagement.workingColorSpace] - The color space.
   * @return {{h:number,s:number,l:number}} The HSL representation of this color.
   */
  getHSL(target, colorSpace = ColorManagement.workingColorSpace) {
    ColorManagement.workingToColorSpace(_color.copy(this), colorSpace);
    const r = _color.r, g = _color.g, b = _color.b;
    const max2 = Math.max(r, g, b);
    const min2 = Math.min(r, g, b);
    let hue, saturation;
    const lightness = (min2 + max2) / 2;
    if (min2 === max2) {
      hue = 0;
      saturation = 0;
    } else {
      const delta = max2 - min2;
      saturation = lightness <= 0.5 ? delta / (max2 + min2) : delta / (2 - max2 - min2);
      switch (max2) {
        case r:
          hue = (g - b) / delta + (g < b ? 6 : 0);
          break;
        case g:
          hue = (b - r) / delta + 2;
          break;
        case b:
          hue = (r - g) / delta + 4;
          break;
      }
      hue /= 6;
    }
    target.h = hue;
    target.s = saturation;
    target.l = lightness;
    return target;
  }
  /**
   * Returns the RGB values of this color and stores them into the given target object.
   *
   * @param {Color} target - The target color that is used to store the method's result.
   * @param {string} [colorSpace=ColorManagement.workingColorSpace] - The color space.
   * @return {Color} The RGB representation of this color.
   */
  getRGB(target, colorSpace = ColorManagement.workingColorSpace) {
    ColorManagement.workingToColorSpace(_color.copy(this), colorSpace);
    target.r = _color.r;
    target.g = _color.g;
    target.b = _color.b;
    return target;
  }
  /**
   * Returns the value of this color as a CSS style string. Example: `rgb(255,0,0)`.
   *
   * @param {string} [colorSpace=SRGBColorSpace] - The color space.
   * @return {string} The CSS representation of this color.
   */
  getStyle(colorSpace = SRGBColorSpace) {
    ColorManagement.workingToColorSpace(_color.copy(this), colorSpace);
    const r = _color.r, g = _color.g, b = _color.b;
    if (colorSpace !== SRGBColorSpace) {
      return `color(${colorSpace} ${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)})`;
    }
    return `rgb(${Math.round(r * 255)},${Math.round(g * 255)},${Math.round(b * 255)})`;
  }
  /**
   * Adds the given HSL values to this color's values.
   * Internally, this converts the color's RGB values to HSL, adds HSL
   * and then converts the color back to RGB.
   *
   * @param {number} h - Hue value between `0.0` and `1.0`.
   * @param {number} s - Saturation value between `0.0` and `1.0`.
   * @param {number} l - Lightness value between `0.0` and `1.0`.
   * @return {Color} A reference to this color.
   */
  offsetHSL(h, s, l) {
    this.getHSL(_hslA);
    return this.setHSL(_hslA.h + h, _hslA.s + s, _hslA.l + l);
  }
  /**
   * Adds the RGB values of the given color to the RGB values of this color.
   *
   * @param {Color} color - The color to add.
   * @return {Color} A reference to this color.
   */
  add(color) {
    this.r += color.r;
    this.g += color.g;
    this.b += color.b;
    return this;
  }
  /**
   * Adds the RGB values of the given colors and stores the result in this instance.
   *
   * @param {Color} color1 - The first color.
   * @param {Color} color2 - The second color.
   * @return {Color} A reference to this color.
   */
  addColors(color1, color2) {
    this.r = color1.r + color2.r;
    this.g = color1.g + color2.g;
    this.b = color1.b + color2.b;
    return this;
  }
  /**
   * Adds the given scalar value to the RGB values of this color.
   *
   * @param {number} s - The scalar to add.
   * @return {Color} A reference to this color.
   */
  addScalar(s) {
    this.r += s;
    this.g += s;
    this.b += s;
    return this;
  }
  /**
   * Subtracts the RGB values of the given color from the RGB values of this color.
   *
   * @param {Color} color - The color to subtract.
   * @return {Color} A reference to this color.
   */
  sub(color) {
    this.r = Math.max(0, this.r - color.r);
    this.g = Math.max(0, this.g - color.g);
    this.b = Math.max(0, this.b - color.b);
    return this;
  }
  /**
   * Multiplies the RGB values of the given color with the RGB values of this color.
   *
   * @param {Color} color - The color to multiply.
   * @return {Color} A reference to this color.
   */
  multiply(color) {
    this.r *= color.r;
    this.g *= color.g;
    this.b *= color.b;
    return this;
  }
  /**
   * Multiplies the given scalar value with the RGB values of this color.
   *
   * @param {number} s - The scalar to multiply.
   * @return {Color} A reference to this color.
   */
  multiplyScalar(s) {
    this.r *= s;
    this.g *= s;
    this.b *= s;
    return this;
  }
  /**
   * Linearly interpolates this color's RGB values toward the RGB values of the
   * given color. The alpha argument can be thought of as the ratio between
   * the two colors, where `0.0` is this color and `1.0` is the first argument.
   *
   * @param {Color} color - The color to converge on.
   * @param {number} alpha - The interpolation factor in the closed interval `[0,1]`.
   * @return {Color} A reference to this color.
   */
  lerp(color, alpha) {
    this.r += (color.r - this.r) * alpha;
    this.g += (color.g - this.g) * alpha;
    this.b += (color.b - this.b) * alpha;
    return this;
  }
  /**
   * Linearly interpolates between the given colors and stores the result in this instance.
   * The alpha argument can be thought of as the ratio between the two colors, where `0.0`
   * is the first and `1.0` is the second color.
   *
   * @param {Color} color1 - The first color.
   * @param {Color} color2 - The second color.
   * @param {number} alpha - The interpolation factor in the closed interval `[0,1]`.
   * @return {Color} A reference to this color.
   */
  lerpColors(color1, color2, alpha) {
    this.r = color1.r + (color2.r - color1.r) * alpha;
    this.g = color1.g + (color2.g - color1.g) * alpha;
    this.b = color1.b + (color2.b - color1.b) * alpha;
    return this;
  }
  /**
   * Linearly interpolates this color's HSL values toward the HSL values of the
   * given color. It differs from {@link Color#lerp} by not interpolating straight
   * from one color to the other, but instead going through all the hues in between
   * those two colors. The alpha argument can be thought of as the ratio between
   * the two colors, where 0.0 is this color and 1.0 is the first argument.
   *
   * @param {Color} color - The color to converge on.
   * @param {number} alpha - The interpolation factor in the closed interval `[0,1]`.
   * @return {Color} A reference to this color.
   */
  lerpHSL(color, alpha) {
    this.getHSL(_hslA);
    color.getHSL(_hslB);
    const h = lerp(_hslA.h, _hslB.h, alpha);
    const s = lerp(_hslA.s, _hslB.s, alpha);
    const l = lerp(_hslA.l, _hslB.l, alpha);
    this.setHSL(h, s, l);
    return this;
  }
  /**
   * Sets the color's RGB components from the given 3D vector.
   *
   * @param {Vector3} v - The vector to set.
   * @return {Color} A reference to this color.
   */
  setFromVector3(v) {
    this.r = v.x;
    this.g = v.y;
    this.b = v.z;
    return this;
  }
  /**
   * Transforms this color with the given 3x3 matrix.
   *
   * @param {Matrix3} m - The matrix.
   * @return {Color} A reference to this color.
   */
  applyMatrix3(m) {
    const r = this.r, g = this.g, b = this.b;
    const e = m.elements;
    this.r = e[0] * r + e[3] * g + e[6] * b;
    this.g = e[1] * r + e[4] * g + e[7] * b;
    this.b = e[2] * r + e[5] * g + e[8] * b;
    return this;
  }
  /**
   * Returns `true` if this color is equal with the given one.
   *
   * @param {Color} c - The color to test for equality.
   * @return {boolean} Whether this bounding color is equal with the given one.
   */
  equals(c) {
    return c.r === this.r && c.g === this.g && c.b === this.b;
  }
  /**
   * Sets this color's RGB components from the given array.
   *
   * @param {Array<number>} array - An array holding the RGB values.
   * @param {number} [offset=0] - The offset into the array.
   * @return {Color} A reference to this color.
   */
  fromArray(array, offset = 0) {
    this.r = array[offset];
    this.g = array[offset + 1];
    this.b = array[offset + 2];
    return this;
  }
  /**
   * Writes the RGB components of this color to the given array. If no array is provided,
   * the method returns a new instance.
   *
   * @param {Array<number>} [array=[]] - The target array holding the color components.
   * @param {number} [offset=0] - Index of the first element in the array.
   * @return {Array<number>} The color components.
   */
  toArray(array = [], offset = 0) {
    array[offset] = this.r;
    array[offset + 1] = this.g;
    array[offset + 2] = this.b;
    return array;
  }
  /**
   * Sets the components of this color from the given buffer attribute.
   *
   * @param {BufferAttribute} attribute - The buffer attribute holding color data.
   * @param {number} index - The index into the attribute.
   * @return {Color} A reference to this color.
   */
  fromBufferAttribute(attribute, index) {
    this.r = attribute.getX(index);
    this.g = attribute.getY(index);
    this.b = attribute.getZ(index);
    return this;
  }
  /**
   * This methods defines the serialization result of this class. Returns the color
   * as a hexadecimal value.
   *
   * @return {number} The hexadecimal value.
   */
  toJSON() {
    return this.getHex();
  }
  *[Symbol.iterator]() {
    yield this.r;
    yield this.g;
    yield this.b;
  }
}
const _color = /* @__PURE__ */ new Color();
Color.NAMES = _colorKeywords;
if (typeof __THREE_DEVTOOLS__ !== "undefined") {
  __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register", { detail: {
    revision: REVISION
  } }));
}
if (typeof window !== "undefined") {
  if (window.__THREE__) {
    console.warn("WARNING: Multiple instances of Three.js being imported.");
  } else {
    window.__THREE__ = REVISION;
  }
}
const RULES = [
  ["burger", /hamburger|cheeseburger/],
  ["dessert", /ice cream|icecream|trifle|pudding|custard|cake/],
  ["fruit", /apple|orange|lemon|banana|pineapple|strawberry|fig|pomegranate|jackfruit|pear|cucumber|acorn|cherry/],
  ["plant", /flower|daisy|sunflower|rapeseed|\bpot\b|vase|bouquet/],
  ["bottle", /bottle|jug|pitcher|coffee mug|cup|goblet|beaker|wine glass|vessel/],
  ["bird", /bird|penguin|duck|goose|hen|rooster|chick|parrot|macaw|toucan|owl|eagle|sparrow|finch|robin|flamingo|ostrich/],
  ["fish", /\b\w*fish\b|\bshark\b|\bray\b|\bstingray\b|\btench\b|\beel\b/],
  ["animal", /fox|wolf|coyote|dingo|dog|cat|tabby|kitten|terrier|hound|retriever|spaniel|poodle|collie|shepherd|pug|corgi|husky|malamute|chihuahua|beagle|pinscher|dachshund|pomeranian|dalmatian|setter|schnauzer|bulldog|shih|basset|labrador|borzoi|kuvasz|mastiff|leonberg|newfoundland|samoyed|schipperke|basenji|vizsla|whippet|weimaraner|pekinese|papillon|briard|bouvier|kelpie|tiger|lion|leopard|panda|bear|rabbit|hare|squirrel|hamster|koala|pig|elephant|horse|sorrel|zebra|deer|giraffe|sheep|ram|goat|cow|ox|bison|teddy/],
  ["vehicle", /\bcar\b|\bcab\b|taxi|\bbus\b|\bvan\b|truck|tractor|jeep|limousine|ambulance|fire engine|minivan|minibus|wagon|racer/],
  ["chair", /chair|throne|bench|sofa|couch/],
  ["shoe", /shoe|sneaker|sandal|boot|loafer|clog/],
  ["bag", /backpack|bag|purse|wallet|satchel/],
  ["camera", /camera|reflex|polaroid/],
  ["house", /house|church|palace|castle|monastery|barn|cottage/]
];
function pastel(rgb, { s = 0.6, l = 0.56 } = {}) {
  const color = new Color(`rgb(${rgb.join(",")})`), h = {};
  color.getHSL(h, SRGBColorSpace);
  color.setHSL(h.h, MathUtils.clamp(h.s, 0.26, s), MathUtils.clamp(h.l, 0.3, l + 0.14), SRGBColorSpace);
  return "#" + color.getHexString();
}
function objectRecipe(semantic, analysis) {
  const { kind, variant } = semantic, palette = analysis.palette;
  const main = pastel(palette[0] || [219, 155, 105]), accent = pastel(palette[1] || [237, 177, 135]);
  const cream = "#f3dcb9", dark = "#785c55", leaf = "#9fc56d";
  const parts = [];
  const add = (name2, type, color, position, size, rotation = [0, 0, 0]) => parts.push({ name: name2, type, color, position, size, rotation });
  const ball = (name2, color, p, s) => add(name2, "ellipsoid", color, p, s);
  const box = (name2, color, p, s) => add(name2, "box", color, p, s);
  const cylinder = (name2, color, p, s, r) => add(name2, "cylinder", color, p, s, r);
  const cone = (name2, color, p, s, r) => add(name2, "cone", color, p, s, r);
  const eyes = (y, z2, spacing = 0.13) => {
    for (const side of [-1, 1]) ball("eye", dark, [side * spacing, y, z2], [0.045, 0.055, 0.035]);
  };
  if (kind === "animal" && /horse|sorrel|zebra/.test(variant)) {
    const coat = /zebra/.test(variant) ? cream : main, legColor = /white.{0,25}(legs?|feet)|(?:legs?|feet).{0,25}white/.test(variant) ? cream : coat;
    ball("body", coat, [0, 0.52, 0], [0.43, 0.45, 0.76]);
    add("neck", "capsule", coat, [0, 0.83, 0.23], [0.23, 0.45, 0.25], [0.15, 0, 0]);
    ball("head", coat, [0, 1.05, 0.35], [0.32, 0.33, 0.44]);
    ball("muzzle", accent, [0, 0.98, 0.59], [0.27, 0.2, 0.26]);
    ball("mane", dark, [0, 0.88, 0.075], [0.13, 0.43, 0.18]);
    ball("tail", dark, [0, 0.44, -0.48], [0.13, 0.48, 0.17]);
    for (const side of [-1, 1]) {
      cone("ear", coat, [side * 0.09, 1.29, 0.32], [0.1, 0.22, 0.12]);
      ball("eye", dark, [side * 0.15, 1.08, 0.48], [0.04, 0.05, 0.035]);
      for (const z2 of [-0.25, 0.25]) {
        add("leg", "capsule", legColor, [side * 0.16, 0.23, z2], [0.13, 0.43, 0.14]);
        ball("hoof", dark, [side * 0.16, 0.035, z2 + 0.02], [0.15, 0.08, 0.19]);
      }
    }
  } else if (kind === "animal") {
    const bunny = /rabbit|hare/.test(variant), elephant = /elephant/.test(variant), long = /giraffe/.test(variant), horse = /horse|sorrel|zebra/.test(variant), fox = /fox|wolf|coyote|dingo/.test(variant), bear = /bear|panda|koala|teddy/.test(variant);
    ball("body", main, [0, 0.39, 0], [0.62, 0.57, 0.5]);
    ball("chest", horse ? main : cream, [0, 0.45, 0.2], [0.3, 0.36, 0.15]);
    ball("head", main, [0, long ? 1.02 : horse ? 0.92 : 0.78, 0.09], horse ? [0.45, 0.49, 0.61] : [0.61, 0.53, 0.49]);
    if (horse) {
      cylinder("neck", main, [0, 0.64, 0.04], [0.28, 0.42, 0.29]);
      ball("mane", dark, [0, 0.84, -0.2], [0.2, 0.51, 0.15]);
    }
    if (long) cylinder("neck", main, [0, 0.7, 0.02], [0.22, 0.63, 0.23]);
    for (const side of [-1, 1]) {
      if (bunny) ball("ear", main, [side * 0.17, 1.15, 0.04], [0.17, 0.56, 0.17]);
      else if (bear || elephant) ball("ear", accent, [side * 0.32, 0.94, 0.03], [elephant ? 0.36 : 0.2, elephant ? 0.38 : 0.22, 0.14]);
      else cone("ear", main, [side * (horse ? 0.15 : 0.22), horse ? 1.2 : 1.05, 0.06], [horse ? 0.15 : 0.23, 0.29, 0.2], [0, 0, -side * 0.2]);
      ball("front-leg", main, [side * 0.22, 0.14, 0.22], [0.19, 0.28, 0.24]);
      ball("back-leg", main, [side * 0.23, 0.14, -0.19], [0.23, 0.28, 0.25]);
    }
    ball("muzzle", cream, [0, horse ? 0.82 : 0.7, horse ? 0.4 : 0.32], horse ? [0.33, 0.25, 0.28] : [0.35, 0.23, 0.2]);
    ball("nose", dark, [0, horse ? 0.82 : 0.74, horse ? 0.55 : 0.43], [0.075, 0.055, 0.045]);
    eyes(horse ? 0.98 : 0.84, 0.32);
    if (elephant) {
      cylinder("trunk", main, [0, 0.55, 0.39], [0.16, 0.45, 0.16]);
    } else {
      ball("tail", fox ? main : accent, [0.39, 0.39, -0.13], [fox ? 0.66 : 0.38, 0.25, 0.25]);
      ball("tail-tip", cream, [fox ? 0.66 : 0.54, 0.47, -0.13], [0.22, 0.22, 0.22]);
    }
  } else if (kind === "person") {
    const skin = pastel(analysis.skin || [231, 175, 139], { s: 0.52, l: 0.68 }), hair = pastel(analysis.hair || [111, 76, 56], { s: 0.5, l: 0.42 }), shirt = pastel(analysis.shirt || palette[0] || [133, 176, 205]);
    ball("torso", shirt, [0, 0.45, 0], [0.48, 0.47, 0.3]);
    ball("head", skin, [0, 0.88, 0], [0.57, 0.56, 0.46]);
    ball("hair", hair, [0, 1.06, -0.03], [0.59, 0.29, 0.48]);
    for (const side of [-1, 1]) {
      ball("ear", skin, [side * 0.29, 0.88, 0], [0.09, 0.13, 0.1]);
      ball("arm", shirt, [side * 0.3, 0.44, 0], [0.17, 0.38, 0.2]);
      ball("hand", skin, [side * 0.32, 0.27, 0.02], [0.15, 0.15, 0.15]);
      cylinder("leg", accent, [side * 0.14, 0.17, 0], [0.18, 0.29, 0.2]);
      ball("shoe", dark, [side * 0.14, 0.035, 0.06], [0.22, 0.11, 0.3]);
    }
    eyes(0.9, 0.22, 0.11);
    ball("nose", skin, [0, 0.84, 0.25], [0.07, 0.08, 0.07]);
    ball("smile", "#bf7e80", [0, 0.77, 0.21], [0.11, 0.025, 0.025]);
    if (/\b(hat|cap|helmet)\b/.test(variant)) {
      cylinder("hat", accent, [0, 1.18, -0.02], [0.59, 0.12, 0.47]);
      box("hat-brim", accent, [0, 1.14, 0.25], [0.47, 0.05, 0.27]);
    }
    if (/glasses|spectacles/.test(variant)) for (const side of [-1, 1]) add("glasses", "torus", dark, [side * 0.11, 0.9, 0.245], [0.17, 0.14, 0.08]);
  } else if (kind === "burger") {
    cylinder("lower-bun", "#e9b979", [0, 0.16, 0], [0.88, 0.2, 0.74]);
    ball("top-bun", "#edbd7c", [0, 0.64, 0], [0.92, 0.39, 0.79]);
    cylinder("patty", "#9a6951", [0, 0.34, 0], [0.91, 0.17, 0.77]);
    cylinder("tomato", "#da8877", [0, 0.45, 0], [0.91, 0.075, 0.78]);
    box("cheese", "#eed275", [0, 0.4, 0], [0.96, 0.055, 0.81]);
    for (let i = 0; i < 7; i++) {
      const a = i / 7 * Math.PI * 2;
      ball("lettuce", leaf, [Math.sin(a) * 0.35, 0.5, Math.cos(a) * 0.3], [0.3, 0.075, 0.23]);
    }
    for (let i = 0; i < 7; i++) {
      const a = i * 2.4;
      ball("sesame", cream, [Math.sin(a) * 0.27, 0.81 - Math.abs(Math.sin(a)) * 0.035, Math.cos(a) * 0.2], [0.028, 0.018, 0.065]);
    }
    if (/onion/.test(variant)) add("onion", "torus", "#dfbfdb", [0, 0.545, 0], [0.58, 0.52, 0.22], [Math.PI / 2, 0, 0]);
    if (/pickle|cucumber/.test(variant)) for (let i = 0; i < 3; i++) ball("pickle", "#86ac65", [(i - 1) * 0.18, 0.54, 0.12], [0.23, 0.055, 0.25]);
  } else if (kind === "fruit") {
    if (/banana/.test(variant)) {
      for (let i = 0; i < 4; i++) ball("banana", "#e6d477", [(i - 1.5) * 0.15, 0.27 + Math.abs(i - 1.5) * 0.075, 0], [0.32, 0.28, 0.32]);
    } else if (/pineapple/.test(variant)) {
      ball("fruit", main, [0, 0.46, 0], [0.65, 0.78, 0.65]);
      for (let i = 0; i < 5; i++) cone("crown", leaf, [(i - 2) * 0.09, 0.99, 0], [0.17, 0.5, 0.16], [0, 0, (i - 2) * -0.25]);
    } else {
      ball("fruit", main, [0, 0.44, 0], [0.75, 0.78, 0.7]);
      cylinder("stem", dark, [0, 0.88, 0], [0.055, 0.18, 0.055]);
      ball("leaf", leaf, [0.16, 0.9, 0], [0.28, 0.08, 0.13]);
      if (/strawberry/.test(variant)) for (let i = 0; i < 7; i++) ball("seed", cream, [Math.sin(i * 2.4) * 0.24, 0.3 + i * 0.045, 0.3], [0.025, 0.04, 0.02]);
    }
  } else if (kind === "bottle") {
    const cup = /cup|mug|goblet|beaker|glass/.test(variant);
    if (cup) add("body", "cup", main, [0, 0.37, 0], [0.62, 0.69, 0.62]);
    else cylinder("body", main, [0, 0.37, 0], [0.62, 0.69, 0.62]);
    if (cup) {
      add("rim", "torus", cream, [0, 0.72, 0], [0.62, 0.62, 0.62], [Math.PI / 2, 0, 0]);
      if (/mug|handle|coffee|teacup/.test(variant)) add("handle", "torus", accent, [0.4, 0.42, 0], [0.35, 0.44, 0.27], [0, 0, 0]);
      cylinder("drink", accent, [0, 0.65, 0], [0.48, 0.035, 0.48]);
    } else {
      ball("shoulder", main, [0, 0.7, 0], [0.61, 0.27, 0.61]);
      cylinder("neck", main, [0, 0.91, 0], [0.24, 0.36, 0.24]);
      cylinder("cap", accent, [0, 1.12, 0], [0.29, 0.12, 0.29]);
      box("label", cream, [0, 0.41, 0.315], [0.36, 0.29, 0.025]);
    }
  } else if (kind === "plant") {
    cylinder("pot", accent, [0, 0.2, 0], [0.51, 0.38, 0.51]);
    cylinder("soil", dark, [0, 0.4, 0], [0.45, 0.04, 0.45]);
    for (let i = 0; i < 3; i++) {
      const x = (i - 1) * 0.21, y = 0.8 + i % 2 * 0.18;
      cylinder("stem", leaf, [x, 0.59, 0], [0.035, 0.41, 0.035]);
      for (let j = 0; j < 5; j++) {
        const a = j / 5 * Math.PI * 2;
        ball("petal", main, [x + Math.sin(a) * 0.13, y + Math.cos(a) * 0.13, 0.02], [0.2, 0.2, 0.12]);
      }
      ball("flower-center", cream, [x, y, 0.08], [0.16, 0.16, 0.12]);
    }
  } else if (kind === "bird" || kind === "fish") {
    if (kind === "fish") {
      ball("body", main, [0, 0.45, 0], [0.78, 0.52, 0.35]);
      cone("tail", accent, [-0.52, 0.45, 0], [0.43, 0.41, 0.12], [0, 0, -Math.PI / 2]);
      ball("eye", dark, [0.25, 0.52, 0.16], [0.05, 0.06, 0.035]);
      cone("fin", accent, [0, 0.79, 0], [0.27, 0.25, 0.1]);
    } else {
      ball("body", main, [0, 0.36, 0], [0.61, 0.61, 0.52]);
      ball("chest", cream, [0, 0.36, 0.22], [0.38, 0.4, 0.12]);
      ball("head", main, [0, 0.79, 0.07], [0.46, 0.46, 0.41]);
      cone("beak", accent, [0, 0.73, 0.33], [0.18, 0.27, 0.16], [Math.PI / 2, 0, 0]);
      eyes(0.84, 0.25, 0.12);
      for (const side of [-1, 1]) {
        ball("wing", accent, [side * 0.29, 0.42, 0], [0.17, 0.43, 0.32]);
        ball("foot", "#dfb277", [side * 0.13, 0.035, 0.1], [0.2, 0.07, 0.24]);
      }
    }
  } else if (kind === "vehicle") {
    box("body", main, [0, 0.3, 0], [0.96, 0.35, 0.53]);
    box("cabin", main, [0, 0.56, 0], [0.56, 0.31, 0.49]);
    box("windshield", "#b4d7da", [0.04, 0.58, 0.253], [0.4, 0.2, 0.025]);
    for (const x of [-0.3, 0.3]) for (const z2 of [-0.27, 0.27]) {
      cylinder("wheel", dark, [x, 0.16, z2], [0.28, 0.13, 0.28], [Math.PI / 2, 0, 0]);
      ball("hub", cream, [x, 0.16, z2 * 1.23], [0.13, 0.13, 0.025]);
    }
    for (const z2 of [-0.17, 0.17]) ball("headlight", cream, [0.49, 0.31, z2], [0.025, 0.11, 0.1]);
  } else if (kind === "chair") {
    box("seat", main, [0, 0.42, 0], [0.69, 0.15, 0.6]);
    box("back", main, [0, 0.78, -0.24], [0.69, 0.65, 0.16]);
    for (const x of [-0.25, 0.25]) for (const z2 of [-0.2, 0.2]) cylinder("leg", accent, [x, 0.19, z2], [0.09, 0.37, 0.09]);
  } else if (kind === "shoe") {
    box("sole", cream, [0, 0.09, 0], [0.87, 0.13, 0.43]);
    ball("toe", main, [0.23, 0.23, 0], [0.48, 0.35, 0.43]);
    box("heel", main, [-0.2, 0.31, 0], [0.37, 0.45, 0.43]);
    for (let i = 0; i < 3; i++) box("lace", cream, [-0.07 + i * 0.095, 0.42 - i * 0.035, 0], [0.035, 0.03, 0.33]);
  } else if (kind === "bag") {
    box("body", main, [0, 0.46, 0], [0.63, 0.79, 0.32]);
    box("pocket", accent, [0, 0.35, 0.19], [0.46, 0.31, 0.11]);
    add("handle", "torus", accent, [0, 0.91, 0], [0.31, 0.27, 0.15]);
  } else if (kind === "camera") {
    box("body", main, [0, 0.4, 0], [0.83, 0.55, 0.3]);
    cylinder("lens", accent, [0.04, 0.39, 0.24], [0.39, 0.25, 0.39], [Math.PI / 2, 0, 0]);
    ball("glass", "#a3c7d3", [0.04, 0.39, 0.38], [0.27, 0.27, 0.04]);
    box("viewfinder", cream, [-0.26, 0.54, 0.17], [0.14, 0.12, 0.04]);
    box("shutter", accent, [0.28, 0.73, 0], [0.13, 0.09, 0.12]);
  } else if (kind === "house") {
    box("walls", main, [0, 0.36, 0], [0.73, 0.7, 0.59]);
    cone("roof", accent, [0, 0.91, 0], [1, 0.47, 0.89], [0, Math.PI / 4, 0]);
    box("door", dark, [0, 0.23, 0.305], [0.19, 0.4, 0.035]);
    for (const side of [-1, 1]) box("window", cream, [side * 0.24, 0.48, 0.31], [0.15, 0.19, 0.035]);
  } else if (kind === "dessert") {
    cylinder("cup", accent, [0, 0.22, 0], [0.59, 0.42, 0.59]);
    for (let i = 0; i < 3; i++) {
      const a = i * 2.1;
      ball("scoop", i === 1 ? cream : main, [Math.sin(a) * 0.12, 0.54 + i * 0.11, Math.cos(a) * 0.09], [0.47, 0.41, 0.47]);
    }
    ball("cherry", "#d8888c", [0, 0.99, 0], [0.17, 0.17, 0.17]);
  } else throw Error("这个物体暂时还没有对应的几何组合规则。");
  return { version: 1, ...semantic, palette, parts };
}
const COLORS = { white: "#f6e6cb", cream: "#f5dcb3", brown: "#a76c49", chocolate: "#865847", pink: "#e98fa8", red: "#dc6883", green: "#9caf69", blue: "#94c8d4", yellow: "#f1cc75", purple: "#b496c9", orange: "#eeb079", black: "#785966" };
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
function affirmative(text) {
  return text.toLowerCase().replace(/\b(?:does not have|doesn't have|has no|without)\s+(?:a |any )?(?:handle|plate|saucer|cream|fruit|foam)/g, "").replace(/\b(?:no|without|not|absent)\s+(?:(?:a|any|visible)\s+)?[\w-]+(?:\s+(?:handle|plate|saucer|cream|fruit|foam))?/g, "");
}
function colorNear(text, nouns, fallback) {
  text = text.replace(/\b(pink|red|green|blue|yellow|brown|purple|orange)ish\b/gi, "$1").replace(/\b(pink|red|green|blue|yellow|brown|purple|orange)-(pink|red|green|blue|yellow|brown|purple|orange)\b/gi, "$1");
  const terms = Object.keys(COLORS).join("|");
  const modifiers = "ceramic|glass|coffee|sponge|frosted|iced|plastic|paper|chocolate|colored|coloured|light|dark";
  const match = text.match(new RegExp(`\\b(${terms})\\s+(?:(?:${modifiers})\\s+){0,2}(?:${nouns})\\b`, "i"));
  const reverse = text.match(new RegExp(`\\b(?:${nouns})\\s+(?:is|looks|appears|are|being)\\s+(?:to be\\s+)?(?:light |dark )?(${terms})\\b`, "i"));
  return match ? COLORS[match[1].toLowerCase()] : reverse ? COLORS[reverse[1].toLowerCase()] : fallback;
}
function countNear(text, noun, fallback, max2 = 8) {
  const m = text.match(new RegExp(`\\b(one|two|three|four|five|six|seven|eight|[1-8])\\s+(?:[\\w-]+\\s+){0,1}(?:${noun})\\b`, "i"));
  return m ? clamp(Number(m[1]) || { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8 }[m[1].toLowerCase()], 1, max2) : fallback;
}
function foodKind(subject, description = "") {
  description = String(description).toLowerCase();
  const label = subject.toLowerCase(), all = (subject + " " + description).toLowerCase();
  if (/cake|torte|gateau|cheesecake/.test(label)) return /slice|piece|wedge|triang/.test(all) ? "cake-slice" : "cake";
  if (/parfait|sundae|trifle|pudding|custard|gelatin|jelly|ice.?cream/.test(label)) return "dessert-cup";
  const specific = /\b(person|woman|man|child|cat|dog|horse|bird|car|camera|house|bottle|carton|sculpture|figurine|statue)\b/.test(label);
  const drink = /\b(coffee|espresso|cappuccino|latte|mocha|macchiato|cocoa|chocolate drink|hot chocolate|tea|milk|mug|teacup|cup|tumbler|beaker|goblet|beverage|drink|smoothie|milkshake|frappe|frappuccino)\b/;
  if (!specific && (drink.test(label) || /\b(?:a|the|one) glass[.!]?$|^glass[.!]?$|\b(?:plastic|drinking|disposable|wine) glass\b/.test(label))) return "coffee-cup";
  const generic = /\b(object|item|container|vessel|food|dessert|something|image|picture|photo)\b/.test(label);
  const mainVessel = /^(?:(?:the |this )?(?:image|picture|photo) (?:shows|depicts|contains) |there is |this is )?(?:a |an |the )?(?:(?:clear|transparent|plastic|disposable|tall|short|wide|small|large|single|brown|white|blue|green|red|pink|yellow|ceramic|paper|iced|cold|hot|coffee|tea|drinking)\s+){0,6}(?:cup|mug|tumbler|goblet|beaker|glass)\b/.test(description.trim());
  if (!specific && mainVessel) return "coffee-cup";
  if (generic && !specific) {
    if (/\b(cake|torte|gateau|cheesecake)\b/.test(description)) return /slice|piece|wedge|triang/.test(description) ? "cake-slice" : "cake";
    if (/\b(parfait|sundae|trifle|pudding|custard|gelatin|jelly|ice.?cream)\b/.test(description)) return "dessert-cup";
    if (drink.test(description) || /\bglass\s+(?:of|filled with)\b/.test(description)) return "coffee-cup";
  }
  return null;
}
function buildFoodBlueprint(subject, description, palette) {
  const kind = foodKind(subject, description);
  if (!kind) return null;
  const text = affirmative(subject + " " + description), raw = (subject + " " + description).toLowerCase();
  const parts = [], observations = [], uncertainties = [];
  const add = (id, type, color, position, size, role = "soft", extra = {}) => {
    parts.push({ name: id, type, color, position, size, rotation: [0, 0, 0], role, ...extra });
  };
  const evidence = (feature, present) => {
    if (present) observations.push({ feature, source: description });
    return present;
  };
  const plate = evidence("plate", /saucer|plate|dish/.test(text));
  const cream = colorNear(text, "cream|frosting|icing|glaze", COLORS.cream);
  const fruitColor = colorNear(text, "berries|berry|cherries|cherry|strawberries|strawberry", COLORS.red);
  const berry = evidence("fruit topping", /strawberr|blueberr|raspberr|cherr|berr/.test(text));
  const isBlue = /blueberr/.test(text), isCherry = /cherr/.test(text);
  const fruitCount = berry ? countNear(text, "strawberries|blueberries|raspberries|cherries|berries|strawberry|cherry", 3) : 0;
  if (berry && !/\b(one|two|three|four|five|six|seven|eight|[1-8])\s/.test(text)) uncertainties.push("Fruit count is approximate; the caption did not establish a count.");
  let floor = plate ? 0.085 : 0, bodyTop = 0;
  if (plate) add("plate", "lathe", colorNear(text, "plate|saucer|dish", COLORS.white), [0, 0.045, 0], [1.18, 0.09, 1.18], "ceramic", { profile: [[0, -0.5], [0.35, -0.5], [0.5, 0], [0.5, 0.35], [0.34, -0.18], [0, -0.18]] });
  if (plate && evidence("spoon", /spoon/.test(text))) {
    add("spoon-bowl", "ellipsoid", "#bac7d8", [0.42, 0.105, 0.05], [0.16, 0.035, 0.23], "soft");
    add("spoon-handle", "box", "#bac7d8", [0.42, 0.1, 0.28], [0.045, 0.025, 0.36], "soft");
  }
  if (kind === "coffee-cup" || kind === "dessert-cup") {
    const dessert = kind === "dessert-cup", tall = /tall|glass|tumbler|goblet|parfait|plastic cup|disposable cup/.test(text) && !/short|wide|shallow/.test(text);
    const shallow = /wide|shallow|bowl/.test(text), h = tall ? 1.05 : shallow ? 0.52 : 0.7, w = tall ? 0.7 : shallow ? 1 : 0.86, y = floor + h / 2;
    const glass = /glass|transparent|clear/.test(text) || dessert;
    const cupColor = colorNear(text, "cup|mug|glass|bowl", glass ? "#c6dce3" : COLORS.white);
    add("vessel", "lathe", cupColor, [0, y, 0], [w, h, w], glass ? "glass" : "ceramic", { profile: [[0, -0.5], [0.32, -0.5], [0.36, -0.44], [0.5, 0.46], [0.5, 0.5], [0.455, 0.5], [0.32, -0.39], [0, -0.39]] });
    add("rim", "torus", cupColor, [0, floor + h, 0], [w, w, w], glass ? "glass" : "ceramic", { rotation: [Math.PI / 2, 0, 0] });
    const handle = evidence("handle", /handle|mug|teacup/.test(text) && !/(?:no|without|does not have|doesn't have)\s+(?:a\s+)?handle/.test(raw));
    if (handle) {
      const side = /left/.test(text) ? -1 : 1;
      add("handle", "arc", cupColor, [side * w * 0.46, floor + h * 0.52, 0], [w * 0.5, h * 0.65, 0.13], glass ? "glass" : "ceramic", { side });
      if (!/left|right/.test(text)) uncertainties.push("Handle side was not established; right-side design placement used.");
    }
    if (dessert) {
      const layers = countNear(text, "layers?", /layer/.test(text) ? 3 : 2, 5), start = floor + h * 0.17, end = floor + h * 0.82, dh = (end - start) / layers;
      if (!/\b(one|two|three|four|five|[1-5])\s+(?:\w+\s+)?layers?/.test(text)) uncertainties.push("Dessert layer count uses a design estimate.");
      for (let i = 0; i < layers; i++) {
        const color = i % 2 === 0 ? colorNear(text, "pudding|custard|jelly|gelatin|ice.?cream", COLORS.pink) : cream;
        const bottom = 0.32 + 0.1 * i / layers, top2 = 0.32 + 0.1 * (i + 1) / layers;
        add("dessert-layer-" + i, "lathe", color, [0, start + dh * (i + 0.5), 0], [w, dh, w], i % 2 === 0 ? "liquid" : "soft", { profile: [[0, -0.5], [bottom, -0.5], [top2, 0.5], [0, 0.5]] });
      }
      bodyTop = end;
      if (/whip|cream|scoop/.test(text)) add("cream-swirl", "swirl", cream, [0, bodyTop + 0.1, 0], [w * 0.65, 0.24, w * 0.65]);
    } else {
      const drinkColor = /matcha|green tea/.test(text) ? COLORS.green : /milk|latte|cappuccino|light brown/.test(text) ? "#c58b61" : COLORS.brown;
      bodyTop = floor + h * 0.85;
      add("drink", "lathe", drinkColor, [0, floor + h * 0.5, 0], [w * 0.84, h * 0.68, w * 0.84], "liquid", { profile: [[0, -0.5], [0.36, -0.5], [0.5, 0.5], [0, 0.5]] });
      if (evidence("foam", /foam|froth|latte art|cappuccino/.test(text))) {
        add("foam", "cylinder", cream, [0, bodyTop + 9e-3, 0], [w * 0.78, 0.018, w * 0.78], "soft");
        if (/art|heart|rosetta|pattern|swirl/.test(text)) add("latte-art", "swirl", drinkColor, [0, bodyTop + 0.027, 0], [w * 0.42, 0.012, w * 0.42], "soft");
      }
      if (evidence("whipped cream", /whipped cream|whipping cream|cream topping|cream on top/.test(text))) {
        add("cream-swirl", "swirl", cream, [0, bodyTop + 0.15, 0], [w * 0.7, 0.32, w * 0.7]);
      }
    }
    observations.push({ feature: tall ? "tall vessel" : "short vessel", source: description });
  } else {
    const slice2 = kind === "cake-slice", layers = countNear(text, "layers?", 2, 5), h = /tall|high/.test(text) ? 1 : 0.65;
    if (!/\b(one|two|three|four|five|[1-5])\s+(?:\w+\s+)?layers?/.test(text)) uncertainties.push("Cake layer count uses a design estimate.");
    const sponge = colorNear(text, "sponge|cake|layers?", /chocolate|cocoa/.test(text) ? COLORS.chocolate : /strawberry.flavored/.test(text) ? COLORS.pink : COLORS.yellow);
    const filling = colorNear(text, "filling|jam", /strawberr|raspberr/.test(text) ? COLORS.pink : cream);
    const type = slice2 ? "wedge" : /square|rectangular|rectangle/.test(text) ? "box" : "cylinder", width = slice2 ? 0.95 : 0.98, depth = slice2 ? 1.05 : 0.98, band = 0.055;
    const spongeH = (h - band * (layers - 1)) / layers;
    let y = floor;
    for (let i = 0; i < layers; i++) {
      add("sponge-" + i, type, sponge, [0, y + spongeH / 2, 0], [width, spongeH, depth], "soft");
      y += spongeH;
      if (i < layers - 1) {
        add("filling-" + i, type, filling, [0, y + band / 2, 0], [width * 1.01, band, depth * 1.01], "soft");
        y += band;
      }
    }
    bodyTop = y;
    if (evidence("icing", /icing|frosting|cream|ganache|glaze/.test(text))) {
      add("icing", type, cream, [0, y + 0.035, 0], [width * 1.02, 0.07, depth * 1.02]);
      bodyTop += 0.07;
    }
    if (evidence("piped cream", /whip|piped|rosette|dollop/.test(text))) {
      const n = slice2 ? 2 : 6;
      for (let i = 0; i < n; i++) {
        const a = i / n * Math.PI * 2;
        add("cream-rosette-" + i, "swirl", cream, [slice2 ? 0 : Math.sin(a) * 0.32, bodyTop + 0.065, slice2 ? -0.22 + i * 0.27 : Math.cos(a) * 0.32], [0.18, 0.15, 0.18]);
      }
    }
    observations.push({ feature: layers + " sponge layers", source: description });
  }
  if (berry) {
    for (let i = 0; i < fruitCount; i++) {
      const a = i / fruitCount * Math.PI * 2, r = kind === "cake-slice" ? 0.12 : 0.23, x = Math.sin(a) * r, z2 = Math.cos(a) * r;
      add("fruit-" + i, "ellipsoid", isBlue ? "#8c8bbf" : fruitColor, [x, bodyTop + 0.12, z2], [0.19, isCherry ? 0.19 : 0.25, 0.19], "fruit");
      if (isCherry) add("stem-" + i, "arc", COLORS.green, [x + 0.025, bodyTop + 0.27, z2], [0.025, 0.18, 0.025], "soft");
      else if (!isBlue) add("leaf-" + i, "ellipsoid", COLORS.green, [x, bodyTop + 0.245, z2], [0.17, 0.025, 0.1], "soft");
    }
  }
  const colors = [...new Set(parts.filter((p) => p.role !== "glass" && p.name !== "plate" && !p.name.startsWith("spoon")).map((p) => p.color))];
  const subjectPalette = colors.map((c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)));
  const has = (name2) => parts.some((p) => p.name === name2), last = (prefix) => parts.filter((p) => p.name.startsWith(prefix)).at(-1)?.name;
  const top = has("cream-swirl") ? "cream-swirl" : has("icing") ? "icing" : last("dessert-layer-") || last("sponge-") || "drink";
  const relations = parts.map((p) => {
    let target = "root", relation = "above";
    if (p.name === "vessel") target = has("plate") ? "plate" : "root";
    else if (p.name === "handle" || p.name === "rim") {
      target = "vessel";
      relation = "attached-to";
    } else if (/^(drink|dessert-layer)/.test(p.name)) {
      target = "vessel";
      relation = "inside";
    } else if (p.name === "foam") target = "drink";
    else if (p.name === "latte-art") target = "foam";
    else if (p.name === "cream-swirl") target = last("dessert-layer-") || "drink";
    else if (p.name.startsWith("fruit-") || p.name.startsWith("cream-rosette-")) target = top;
    else if (/^(leaf|stem)-/.test(p.name)) {
      target = "fruit-" + p.name.split("-").at(-1);
      relation = "attached-to";
    } else if (p.name.startsWith("sponge-")) {
      const i = Number(p.name.split("-")[1]);
      target = i ? "filling-" + (i - 1) : has("plate") ? "plate" : "root";
    } else if (p.name.startsWith("filling-")) target = "sponge-" + p.name.split("-")[1];
    else if (p.name === "icing") target = last("sponge-");
    else if (p.name === "spoon-bowl") target = "plate";
    else if (p.name === "spoon-handle") {
      target = "spoon-bowl";
      relation = "attached-to";
    }
    return { part: p.name, relation, target };
  });
  const blueprint = { version: 3, engine: "local-vlm+scene-blueprint", kind, subject, description, palette: subjectPalette.length ? subjectPalette : palette, parts, relations, observations, uncertainties, construction: parts.map((p) => p.name) };
  validateBlueprint(blueprint);
  blueprint.audit = { status: "passed", checks: ["finite dimensions", "unique components", "liquid inside vessel", "bounded part count"], visualSimilarity: "not automatically scored" };
  return blueprint;
}
function validateBlueprint(blueprint) {
  if (blueprint.version !== 3 || !["coffee-cup", "cake", "cake-slice", "dessert-cup"].includes(blueprint.kind)) throw Error("不支持的建模蓝图。");
  if (!Array.isArray(blueprint.parts) || !blueprint.parts.length || blueprint.parts.length > 96) throw Error("建模蓝图的部件数量无效。");
  const names = /* @__PURE__ */ new Set();
  for (const p of blueprint.parts) {
    if (typeof p.name !== "string" || !["lathe", "wedge", "arc", "swirl", "ellipsoid", "cylinder", "torus", "box"].includes(p.type) || !["glass", "ceramic", "liquid", "soft", "fruit"].includes(p.role)) throw Error("不支持的建模部件。");
    if (names.has(p.name)) throw Error("建模蓝图含重复部件。");
    names.add(p.name);
    if (!/^#[\da-f]{6}$/i.test(p.color) || ![p.position, p.size, p.rotation].every((v) => Array.isArray(v) && v.length === 3 && v.every(Number.isFinite)) || p.size.some((n) => n <= 0 || n > 4) || p.position.some((n) => Math.abs(n) > 4)) throw Error("建模蓝图的尺寸或颜色无效。");
    if (p.type === "lathe" && (!Array.isArray(p.profile) || p.profile.length < 3 || p.profile.length > 32 || !p.profile.every((v) => Array.isArray(v) && v.length === 2 && v.every((n) => Number.isFinite(n) && Math.abs(n) <= 1) && v[0] >= 0))) throw Error("容器截面无效。");
  }
  const vessel = blueprint.parts.find((p) => p.name === "vessel"), drink = blueprint.parts.find((p) => p.name === "drink");
  if (!Array.isArray(blueprint.relations) || blueprint.relations.some((r) => !names.has(r.part) || r.target !== "root" && !names.has(r.target) || r.target === r.part)) throw Error("部件连接关系无效。");
  if (vessel && drink && (drink.size[0] >= vessel.size[0] || drink.position[1] + drink.size[1] / 2 > vessel.position[1] + vessel.size[1] / 2)) throw Error("液体超出容器。");
  return blueprint;
}
function identifySubject(label, description = "") {
  const text = String(label).toLowerCase().trim();
  if (foodKind(text, description)) return { kind: foodKind(text, description), variant: text + " " + description.toLowerCase(), confidence: 1 };
  if (/\b(person|woman|man|girl|boy|child|portrait|human|officer|astronaut|chef|doctor)\b/.test(text)) return { kind: "person", variant: text + " " + description.toLowerCase(), confidence: 1 };
  const matches = RULES.filter(([, pattern]) => pattern.test(text));
  const preferred = ["animal", "bird", "fish", "vehicle", "camera", "chair", "shoe", "bag", "house", "bottle", "plant"];
  const kind = preferred.find((k) => matches.some(([key]) => key === k)) || matches[0]?.[0];
  if (kind) return { kind, variant: text + " " + description.toLowerCase(), confidence: 1 };
  if (/\b(dessert|jelly|gelatin|parfait)\b/.test(text)) return { kind: "dessert", variant: text + " " + description.toLowerCase(), confidence: 1 };
  throw Error("已分析照片，但这个主体的几何部件暂不受支持。请试试动物、人物、水果、甜品或常见物品。");
}
function buildModelingPrompt(subject, description, palette) {
  const clean = (text) => String(text).replace(/[\r\n]+/g, " ").trim();
  const blueprint = buildFoodBlueprint(clean(subject), clean(description), palette);
  return `Subject: ${clean(subject)}
Appearance: ${clean(description)}
Palette: ${JSON.stringify(palette)}
Create a rounded low-poly cartoon study. Build separate simple volumes for the recognizable components. Preserve their colors and relative placement. Use substantial rounded shapes and cute proportions. Apply the website's colored translucent jelly material, soft highlights and elastic movement. Match the pastel painted background to the subject. No floor, pedestal or background objects.${blueprint ? "\nBlueprint: " + JSON.stringify(blueprint) : ""}`;
}
function compileModelingPrompt(prompt) {
  const subject = prompt.match(/^Subject: (.*)$/m)?.[1], description = prompt.match(/^Appearance: (.*)$/m)?.[1];
  let palette;
  try {
    palette = JSON.parse(prompt.match(/^Palette: (.*)$/m)?.[1]);
  } catch {
    throw Error("建模提示词中的配色无效。");
  }
  if (!subject || !description || !Array.isArray(palette) || palette.length > 16 || !palette.every((rgb) => Array.isArray(rgb) && rgb.length === 3 && rgb.every((v) => Number.isFinite(v) && v >= 0 && v <= 255))) throw Error("建模提示词不完整。");
  let food;
  const serialized = prompt.match(/^Blueprint: (.*)$/m)?.[1];
  if (serialized) {
    try {
      food = validateBlueprint(JSON.parse(serialized));
    } catch {
      throw Error("建模蓝图无效。");
    }
  } else food = buildFoodBlueprint(subject, description, palette);
  if (food) return { ...food, modelingPrompt: prompt };
  const semantic = identifySubject(subject, description);
  const recipe = objectRecipe(semantic, { palette });
  return { ...recipe, version: 2, engine: "local-vlm+part-grammar", subject, description, modelingPrompt: prompt };
}
let lastProgress = 0;
const progress = (stage, value) => self.postMessage({ type: "progress", stage, value: lastProgress = Math.max(lastProgress, value) });
async function generateText(model, processor, image, question, limit, from, to2) {
  const text = processor.apply_chat_template([{ role: "user", content: [{ type: "image" }, { type: "text", text: question }] }], { add_generation_prompt: true });
  const inputs = await processor(text, [image], { do_image_splitting: false });
  let tokens = 0;
  const streamer = new TextStreamer(processor.tokenizer, { skip_prompt: true, skip_special_tokens: true, callback_function: () => {
  }, token_callback_function: () => {
    if (++tokens % 8 === 0) progress("理解主体与部件…", Math.min(to2 - 1, from + tokens / limit * (to2 - from)));
  } });
  let output;
  try {
    output = await model.generate({ ...inputs, max_new_tokens: limit, do_sample: false, repetition_penalty: 1.08, streamer });
    return processor.tokenizer.batch_decode(output.slice(null, [inputs.input_ids.dims.at(-1), null]), { skip_special_tokens: true })[0].trim();
  } finally {
    output?.dispose?.();
    for (const value of Object.values(inputs)) value?.dispose?.();
  }
}
self.onmessage = async ({ data }) => {
  if (data.type !== "analyze") return;
  let model;
  try {
    const base = new URL(data.assetsBase);
    env.allowRemoteModels = true;
    env.allowLocalModels = false;
    env.remoteHost = base.href;
    env.remotePathTemplate = "{model}/";
    env.useBrowserCache = false;
    env.backends.onnx.wasm.wasmPaths = { mjs: new URL("runtime/ort-wasm-simd-threaded.mjs", base).href, wasm: new URL("runtime/ort-wasm-simd-threaded.wasm", base).href };
    env.backends.onnx.wasm.numThreads = 1;
    env.backends.onnx.wasm.proxy = false;
    await installModelFiles(base, (bytes) => progress(`载入设备端模型 · ${Math.round(bytes / 1048576)} MB`, Math.min(44, 5 + bytes / 343162591 * 39)));
    env.fetch = self.fetch;
    const id = "vision-500m-a7da5b9", processor = await Idefics3Processor.from_pretrained(id);
    model = await Idefics3ForConditionalGeneration.from_pretrained(id, { device: "wasm", dtype: { embed_tokens: "q8", vision_encoder: "q4", decoder_model_merged: "q4" } });
    const image = await RawImage.fromBlob(data.file);
    const subject = await generateText(model, processor, image, "What is the main object in this image? Answer with only its name.", 20, 46, 56);
    let kind = foodKind(subject);
    const isCake = kind === "cake" || kind === "cake-slice", isDrink = kind === "coffee-cup", isDessert = kind === "dessert-cup";
    let description = await generateText(model, processor, image, isDrink ? "Describe the cup and what is inside it." : isCake || isDessert ? "Describe this image." : "Describe the main object, its visible parts, colors and pose in two sentences. Ignore the background.", isCake || isDessert ? 150 : 120, 56, 80);
    const resolvedKind = foodKind(subject, description);
    if (!kind && resolvedKind) {
      description += " " + await generateText(model, processor, image, resolvedKind === "coffee-cup" ? "Describe the cup and what is inside it." : "Describe this image.", 100, 80, 88);
    }
    kind = resolvedKind;
    if (kind) {
      const detail = await generateText(model, processor, image, kind === "cake" || kind === "cake-slice" ? "How many cake layers are visible?" : kind === "coffee-cup" ? "Does the cup have a handle?" : "Describe the dessert layers.", kind === "dessert-cup" ? 80 : 25, 88, 92);
      description += " " + detail;
    }
    if (subject.length < 2 || description.length < 12) throw Error("没有看清照片中的主体，请换一张主体清楚的图片。");
    progress("编写建模提示词与组合部件…", 94);
    if (data.debug) self.postMessage({ type: "diagnostic", subject, description });
    let recipe;
    try {
      recipe = compileModelingPrompt(buildModelingPrompt(subject, description, data.palette));
    } catch (error) {
      throw Error(error.message + "（识别名称：" + subject.slice(0, 100) + "）");
    }
    await model.dispose();
    model = null;
    self.postMessage({ type: "complete", recipe });
  } catch (error) {
    self.postMessage({ type: "error", message: error.message || "设备端建模失败，请重试。" });
  } finally {
    await model?.dispose();
  }
};
