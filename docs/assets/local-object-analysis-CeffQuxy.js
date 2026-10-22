function analyzeColors(data, width, height) {
  const n = width * height, background = new Uint8Array(n), queue = new Int32Array(n), border = [];
  for (let x = 0; x < width; x++) {
    border.push(x, (height - 1) * width + x);
  }
  for (let y = 0; y < height; y++) border.push(y * width, y * width + width - 1);
  const bins = /* @__PURE__ */ new Map();
  for (const i of border) {
    const p = i * 4;
    if (data[p + 3] < 160) continue;
    const key = (data[p] >> 5) * 64 + (data[p + 1] >> 5) * 8 + (data[p + 2] >> 5);
    const v = bins.get(key) || [0, 0, 0, 0];
    v[0] += data[p];
    v[1] += data[p + 1];
    v[2] += data[p + 2];
    v[3]++;
    bins.set(key, v);
  }
  const edge = [...bins.values()].sort((a, b) => b[3] - a[3]).slice(0, 3).map((v) => v.slice(0, 3).map((x) => x / v[3]));
  let head = 0, tail = 0;
  const isBackground = (i) => {
    const p = i * 4;
    return data[p + 3] < 160 || edge.some((c) => (data[p] - c[0]) ** 2 + (data[p + 1] - c[1]) ** 2 + (data[p + 2] - c[2]) ** 2 < 34 ** 2);
  };
  for (const i of border) if (!background[i] && isBackground(i)) {
    background[i] = 1;
    queue[tail++] = i;
  }
  while (head < tail) {
    const i = queue[head++], x = i % width, y = Math.floor(i / width);
    for (const j of [x ? i - 1 : -1, x < width - 1 ? i + 1 : -1, y ? i - width : -1, y < height - 1 ? i + width : -1]) if (j >= 0 && !background[j] && isBackground(j)) {
      background[j] = 1;
      queue[tail++] = j;
    }
  }
  let minX = width, minY = height, maxX = 0, maxY = 0, count = 0;
  for (let i = 0; i < n; i++) if (!background[i] && data[i * 4 + 3] > 160) {
    const x = i % width, y = Math.floor(i / width);
    minX = Math.min(minX, x);
    maxX = Math.max(maxX, x);
    minY = Math.min(minY, y);
    maxY = Math.max(maxY, y);
    count++;
  }
  if (count < n * 0.025) {
    minX = Math.floor(width * 0.12);
    maxX = Math.ceil(width * 0.88);
    minY = Math.floor(height * 0.08);
    maxY = Math.ceil(height * 0.92);
    background.fill(0);
  }
  const colors = /* @__PURE__ */ new Map();
  for (let y = minY; y <= maxY; y++) for (let x = minX; x <= maxX; x++) {
    const i = y * width + x, p = i * 4;
    if (background[i] || data[p + 3] < 160) continue;
    const r = data[p], g = data[p + 1], b = data[p + 2], high = Math.max(r, g, b), low = Math.min(r, g, b);
    if (high < 100 || (high - low) / high < 0.2 || low > 220) continue;
    const key = (r >> 5) * 64 + (g >> 5) * 8 + (b >> 5), v = colors.get(key) || [0, 0, 0, 0];
    v[0] += r;
    v[1] += g;
    v[2] += b;
    v[3]++;
    colors.set(key, v);
  }
  const ranked = [...colors.values()].filter((v) => v[3] > 3).sort((a, b) => b[3] - a[3]), palette = [];
  for (const c of ranked) {
    const rgb = c.slice(0, 3).map((v) => Math.round(v / c[3]));
    if (palette.every((old) => old.reduce((sum, v, k) => sum + (v - rgb[k]) ** 2, 0) > 45 ** 2)) palette.push(rgb);
    if (palette.length === 5) break;
  }
  if (!palette.length) palette.push([139, 187, 201], [217, 166, 157]);
  return { palette, bounds: [minX, minY, maxX - minX + 1, maxY - minY + 1] };
}
async function analyzeObject(file, onProgress = () => {
}, signal) {
  signal?.throwIfAborted();
  const bitmap = await createImageBitmap(file), canvas = document.createElement("canvas");
  const scale = Math.min(1, 320 / Math.max(bitmap.width, bitmap.height));
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height), { palette } = analyzeColors(pixels.data, canvas.width, canvas.height);
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL(
      /* @vite-ignore */
      "" + new URL("local-vlm.worker-B1kA-_om.js", import.meta.url).href,
      import.meta.url
    ), { type: "module" });
    const stop = () => {
      worker.terminate();
      signal?.removeEventListener("abort", abort);
    };
    const abort = () => {
      stop();
      reject(new DOMException("已取消", "AbortError"));
    };
    signal?.addEventListener("abort", abort, { once: true });
    if (signal?.aborted) return abort();
    worker.onmessage = ({ data }) => {
      if (data.type === "progress") onProgress(data.stage, data.value);
      else if (data.type === "diagnostic") console.info("Local modeling diagnostic", JSON.stringify(data));
      else if (data.type === "complete") {
        stop();
        if (location.hostname === "127.0.0.1") console.info("Local VLM modeling plan", JSON.stringify(data.recipe));
        resolve(data.recipe);
      } else if (data.type === "error") {
        stop();
        reject(Error(data.message));
      }
    };
    worker.onerror = (event) => {
      stop();
      reject(Error(event.message || "浏览器无法启动设备端建模。"));
    };
    worker.postMessage({ type: "analyze", file, palette, debug: location.hostname === "127.0.0.1", assetsBase: new URL("./local-models/", document.baseURI).href });
  });
}
export {
  analyzeObject
};
