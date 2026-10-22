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
const clamp$1 = (x, a, b) => Math.max(a, Math.min(b, x));
function hsv(r, g, b) {
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = d === 0 ? 0 : max === r ? ((g - b) / d + 6) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, max ? d / max : 0, max / 255];
}
const hex = (rgb) => "#" + rgb.map((n) => Math.round(n).toString(16).padStart(2, "0")).join("");
function splitSkins(points, w, h, data) {
  const light = points.filter((i) => data[i * 4] > 235 && data[i * 4 + 1] > 108), dark = points.filter((i) => data[i * 4 + 1] < 95);
  const center = (ps) => [ps.reduce((s, i) => s + i % w, 0) / ps.length, ps.reduce((s, i) => s + Math.floor(i / w), 0) / ps.length];
  if (light.length > points.length * 0.12 && dark.length > points.length * 0.23) {
    const a = center(light), b = center(dark);
    if (Math.hypot(a[0] - b[0], a[1] - b[1]) > Math.sqrt(points.length) * 0.33) {
      const groups2 = [[], []];
      for (const i of points) {
        const x = i % w, y = Math.floor(i / w);
        groups2[(x - a[0]) ** 2 + (y - a[1]) ** 2 < (x - b[0]) ** 2 + (y - b[1]) ** 2 ? 0 : 1].push(i);
      }
      return groups2;
    }
  }
  const d = new Float32Array(w * h), mask = new Set(points);
  for (const i of points) d[i] = w + h;
  for (const i of points.slice().sort((a, b) => a - b)) d[i] = Math.min(d[i], (i % w ? d[i - 1] : 0) + 1, (i >= w ? d[i - w] : 0) + 1);
  for (const i of points.slice().sort((a, b) => b - a)) d[i] = Math.min(d[i], (i % w < w - 1 ? d[i + 1] : 0) + 1, (i + w < w * h ? d[i + w] : 0) + 1);
  const ranked = points.slice().sort((a, b) => d[b] - d[a]), max = d[ranked[0]], seeds = [];
  for (const i of ranked) {
    if (d[i] < Math.max(5, max * 0.64)) break;
    const x = i % w, y = Math.floor(i / w);
    if (seeds.every((k) => Math.hypot(x - k % w, y - Math.floor(k / w)) > max * 2.5)) seeds.push(i);
    if (seeds.length === 3) break;
  }
  if (seeds.length < 2) return [points];
  const groups = seeds.map(() => []);
  for (const i of mask) {
    let best = 0, dist = Infinity;
    for (let k = 0; k < seeds.length; k++) {
      const dd = (i % w - seeds[k] % w) ** 2 + (Math.floor(i / w) - Math.floor(seeds[k] / w)) ** 2;
      if (dd < dist) {
        dist = dd;
        best = k;
      }
    }
    groups[best].push(i);
  }
  return groups.every((g) => g.length > points.length * 0.18) ? groups : [points];
}
function analyzeDrinkPixels(data, width, height) {
  const labels = new Uint8Array(width * height), pink = [], colored = [];
  for (let y = 0; y < height; y++) for (let x = 0; x < width; x++) {
    const i = y * width + x, j = i * 4, [r, g, b] = data.slice(j, j + 3), [h, s, v] = hsv(r, g, b);
    if (x < width * 0.08 || x > width * 0.92 || y < height * 0.08 || y > height * 0.91) continue;
    if (s > 0.18 && v > 0.28) colored.push(i);
    if (r > 160 && g > 95 && b > 85 && r > g * 1.2 && g > b * 1.03 && s > 0.2 && s < 0.52) pink.push(i);
    labels[i] = s > 0.48 && v > 0.38 && r > g * 1.4 && g < b * 1.8 && (h < 25 || h > 345) ? 1 : s > 0.55 && v > 0.86 && h >= 25 && h < 48 ? 2 : s > 0.35 && v > 0.25 && (h >= 28 && h < 55 && v < 0.84 || h >= 48 && h < 165) ? 3 : v < 0.48 && s > 0.1 && b >= r * 0.77 ? 4 : 0;
  }
  if (colored.length < width * height * 0.02) return { reliable: false, fruits: [] };
  const bounds = (indices) => {
    let x0 = width, y0 = height, x1 = 0, y1 = 0;
    for (const i of indices) {
      const x = i % width, y = Math.floor(i / width);
      x0 = Math.min(x0, x);
      x1 = Math.max(x1, x);
      y0 = Math.min(y0, y);
      y1 = Math.max(y1, y);
    }
    return [x0, y0, x1 - x0 + 1, y1 - y0 + 1];
  };
  const rows = new Uint32Array(height);
  for (const i of pink) rows[Math.floor(i / width)]++;
  const rowThreshold = Math.max(...rows) * 0.3;
  let bodyStart = 0;
  for (let y = 0; y < height - 7; y++) if (Array.from(rows.slice(y, y + 8)).every((n) => n >= rowThreshold)) {
    bodyStart = y;
    break;
  }
  const body = pink.filter((i) => Math.floor(i / width) >= bodyStart && rows[Math.floor(i / width)] >= rowThreshold);
  const liquidBox = bounds(body.length > width * height * 0.02 ? body : colored), [lx, ly, lw, lh] = liquidBox;
  const vessel = [Math.max(0, lx - lw * 0.025), Math.max(0, ly - lh * 0.25), lw * 1.05, lh * 1.27];
  const original = labels.slice();
  for (let y = 2; y < height - 2; y++) for (let x = 2; x < width - 2; x++) {
    const i = y * width + x;
    if (original[i] !== 1) continue;
    for (const [dx, dy] of [[2, 0], [-2, 0], [0, 2], [0, -2]]) if (original[i + dy * width + dx] !== 1) {
      labels[i] = 0;
      break;
    }
  }
  const seen = new Uint8Array(labels.length), fruits = [];
  for (let i = 0; i < labels.length; i++) if (labels[i] && !seen[i]) {
    const label = labels[i], queue = [i], component = [];
    seen[i] = 1;
    for (let q = 0; q < queue.length; q++) {
      const k = queue[q], x2 = k % width, y2 = Math.floor(k / width);
      component.push(k);
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const xx = x2 + dx, yy = y2 + dy, n = yy * width + xx;
        if (xx >= 0 && xx < width && yy >= 0 && yy < height && !seen[n] && labels[n] === label) {
          seen[n] = 1;
          queue.push(n);
        }
      }
    }
    if (component.length < width * height * 13e-4) continue;
    const box = bounds(component), [x, y, w, h] = box, cx = x + w / 2, cy = y + h / 2;
    if (cx < lx || cx > lx + lw || cy < ly - lh * 0.08 || cy > ly + lh || w > lw * 0.75 || h > lh * 0.75) continue;
    if (label === 1 && (w / h < 0.38 || w / h > 1.8)) continue;
    if (label === 4 && (w / h < 0.45 || w / h > 2 || component.length / (w * h) < 0.35)) continue;
    const regions = label === 1 && w > lw * 0.35 ? splitSkins(component, width, height, data) : [component];
    for (const region of regions) {
      const b = bounds(region), rgb2 = [0, 0, 0];
      for (const k of region) for (let c = 0; c < 3; c++) rgb2[c] += data[k * 4 + c] / region.length;
      fruits.push({ family: ["", "red", "citrus", "green", "dark-berry"][label], box: b, color: hex(rgb2), cut: label === 1 && rgb2[1] > 100, area: region.length, center: [b[0] + b[2] / 2, b[1] + b[3] / 2] });
    }
  }
  for (let i = fruits.length - 1; i >= 0; i--) {
    const f = fruits[i];
    if (f.family === "red" && fruits.some((g) => g.family === "green" && f.center[0] >= g.box[0] && f.center[0] <= g.box[0] + g.box[2] && f.center[1] >= g.box[1] && f.center[1] <= g.box[1] + g.box[3])) fruits.splice(i, 1);
  }
  fruits.sort((a, b) => b.area - a.area);
  fruits.splice(8);
  fruits.sort((a, b) => a.center[1] - b.center[1] || a.center[0] - b.center[0]);
  const samples = pink.filter((i) => !labels[i] && Math.floor(i / width) >= ly && Math.floor(i / width) < ly + lh * 0.28), rgb = [0, 0, 0];
  for (const i of samples) for (let c = 0; c < 3; c++) rgb[c] += data[i * 4 + c] / Math.max(1, samples.length);
  const families = new Set(fruits.map((f) => f.family));
  return { version: 1, reliable: fruits.length >= 2 && families.size >= 2, vessel, liquidBox, liquidColor: samples.length ? hex(rgb) : null, fill: clamp$1(lh / vessel[3], 0.55, 0.94), fruits, width, height, crop: [lx, Math.max(0, ly - lh * 0.08), lw, lh * 1.08], uncertainty: "Depth and occluded surfaces are design estimates from a single view." };
}
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
function components(mask, w, h, minArea = 12) {
  const seen = new Uint8Array(mask.length), queue = new Int32Array(mask.length), out = [];
  for (let start = 0; start < mask.length; start++) {
    if (!mask[start] || seen[start]) continue;
    let head = 0, tail = 1, area = 0, x0 = w, y0 = h, x1 = 0, y1 = 0, sx = 0, sy = 0;
    queue[0] = start;
    seen[start] = 1;
    while (head < tail) {
      const i = queue[head++], x = i % w, y = i / w | 0;
      area++;
      sx += x;
      sy += y;
      x0 = Math.min(x0, x);
      x1 = Math.max(x1, x);
      y0 = Math.min(y0, y);
      y1 = Math.max(y1, y);
      for (const j of [x ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y ? i - w : -1, y < h - 1 ? i + w : -1]) if (j >= 0 && mask[j] && !seen[j]) {
        seen[j] = 1;
        queue[tail++] = j;
      }
    }
    if (area >= minArea) out.push({ area, bounds: [x0, y0, x1 - x0 + 1, y1 - y0 + 1], center: [sx / area, sy / area] });
  }
  return out.sort((a, b) => b.area - a.area);
}
function close(mask, w, h) {
  const dilated = new Uint8Array(mask.length), out = new Uint8Array(mask.length);
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x;
    let any = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) any |= mask[i + dy * w + dx];
    dilated[i] = any;
  }
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
    const i = y * w + x;
    let all = 1;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) all &= dilated[i + dy * w + dx];
    out[i] = all;
  }
  return out;
}
function colorOf(data, w, box, channels = 4, mask = null) {
  const colors = [];
  const [x, y, bw, bh] = box;
  for (let j = Math.max(0, y | 0); j < Math.min(data.length / channels / w, y + bh); j += 2) for (let i = Math.max(0, x | 0); i < Math.min(w, x + bw); i += 2) {
    if (mask && !mask[j * w + i]) continue;
    const p = (j * w + i) * channels;
    colors.push([data[p], data[p + 1], data[p + 2]]);
  }
  if (!colors.length) return [220, 180, 160];
  return [0, 1, 2].map((c) => colors.map((v) => v[c]).sort((a, b) => a - b)[colors.length >> 1]);
}
function analyzeCakePixels(data, w, h, { channels = 4 } = {}) {
  const n = w * h, crumb = new Uint8Array(n), pink = new Uint8Array(n), red = new Uint8Array(n), dark = new Uint8Array(n), green = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const p = i * channels, r = data[p], g = data[p + 1], b = data[p + 2];
    if (channels === 4 && data[p + 3] < 180) continue;
    crumb[i] = r > 145 && g > 100 && r - g < 75 && r - g > 3 && g - b > 28 && g - b > (r - g) * 0.8 && r - b > 60 ? 1 : 0;
    pink[i] = r > 165 && g > 105 && r - g > 12 && r - b > 8 && g - b < 35 && r - g < 80 ? 1 : 0;
    red[i] = r > 110 && r - g > 60 && r - b > 45 && g < r * 0.72 && g < b * 1.7 ? 1 : 0;
    dark[i] = r < 130 && g < 140 && b < 155 && b > r * 0.9 && b > g * 0.95 && Math.max(r, g, b) - Math.min(r, g, b) < 65 ? 1 : 0;
    green[i] = g > r * 1.04 && g > b * 1.18 && g > 45 && r < 195 ? 1 : 0;
  }
  const crumbRegions = components(close(crumb, w, h), w, h, Math.max(30, n * 8e-4));
  const widest = Math.max(0, ...crumbRegions.map((c) => c.bounds[2]));
  const candidates = crumbRegions.filter((c) => c.bounds[2] > widest * 0.42 && c.bounds[3] > h * 0.015 && c.center[1] > h * 0.25 && c.bounds[2] > w * 0.12 && c.bounds[2] < w * 0.88);
  const bands = candidates.sort((a, b) => a.center[1] - b.center[1]).slice(0, 6);
  const layers = [];
  for (const c of bands) {
    const previous = layers.at(-1);
    if (previous && c.bounds[1] < previous.bounds[1] + previous.bounds[3] * 0.6) {
      const a = previous.bounds, b = c.bounds;
      previous.bounds = [Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.max(a[0] + a[2], b[0] + b[2]) - Math.min(a[0], b[0]), Math.max(a[1] + a[3], b[1] + b[3]) - Math.min(a[1], b[1])];
      previous.area += c.area;
    } else layers.push({ ...c });
  }
  const reliable = layers.length >= 1 && layers.length <= 5 && layers.every((c) => c.area > n * 15e-4) && layers.length === candidates.length;
  if (!layers.length) return { version: 1, reliable: false, layers: [], fruits: [], reason: "No separated warm sponge bands found." };
  const body = [Math.min(...layers.map((c) => c.bounds[0])), Math.min(...layers.map((c) => c.bounds[1])), 0, 0];
  body[2] = Math.max(...layers.map((c) => c.bounds[0] + c.bounds[2])) - body[0];
  body[3] = Math.max(...layers.map((c) => c.bounds[1] + c.bounds[3])) - body[1];
  const profiles = [];
  for (let k = 0; k < 9; k++) {
    const x = Math.round(body[0] + body[2] * (0.12 + k * 0.055)), runs = [];
    let start = -1;
    for (let y = body[1]; y <= body[1] + body[3]; y++) {
      let sum = 0;
      for (let dy = -2; dy <= 2; dy++) if (y + dy >= 0 && y + dy < h) sum += crumb[(y + dy) * w + x];
      const on = y < body[1] + body[3] && sum >= 3;
      if (on && start < 0) start = y;
      if (!on && start >= 0) {
        if (y - start > body[3] * 0.045) runs.push({ start, end: y });
        start = -1;
      }
    }
    if (runs.length === layers.length) profiles.push(runs);
  }
  const median = (values) => values.sort((a, b) => a - b)[values.length >> 1];
  const topLimit = body[1] + body[3] * 0.06, topMasks = [red, dark, green].map((mask) => mask.map((v, i) => v && (i / w | 0) < topLimit && i % w > body[0] - body[2] * 0.12 && i % w < body[0] + body[2] * 1.2 ? 1 : 0));
  const fruitRegions = components(close(topMasks[0], w, h), w, h, Math.max(20, n * 3e-4));
  const fruits = [];
  for (const region of fruitRegions) {
    const [x, y, bw, bh] = region.bounds;
    if (bw > body[2] * 0.95 || bh > body[3] * 0.8 || bw < body[2] * 0.07 || bh < body[3] * 0.1 || bw / bh > 2) continue;
    const bins = Array.from({ length: bw }, () => ({ count: 0, light: 0 }));
    for (let yy = y; yy < y + bh; yy++) for (let xx = x; xx < x + bw; xx++) {
      const i = yy * w + xx, p = i * channels;
      if (!red[i]) continue;
      bins[xx - x].count++;
      if (data[p + 1] > 95) bins[xx - x].light++;
    }
    const sections = [];
    let start = 0, wasLight = null;
    for (let xx = 0; xx < bw; xx++) {
      const from = Math.max(0, xx - 3), to = Math.min(bw, xx + 4);
      let a = 0, b = 0;
      for (let k = from; k < to; k++) {
        a += bins[k].light;
        b += bins[k].count;
      }
      const light = b > 0 && a / b > 0.48;
      if (wasLight !== null && light !== wasLight && xx - start > bw * 0.22) {
        sections.push([start, xx, wasLight]);
        start = xx;
      }
      wasLight = light;
    }
    sections.push([start, bw, wasLight]);
    const split = bw / bh > 1.3 && sections.length === 2 && sections.every(([a, b]) => b - a > bw * 0.25) ? sections : [[0, bw, null]];
    for (const [a, b, isCut] of split) {
      const bounds = [x + a, y, b - a, bh], rgb = colorOf(data, w, bounds, channels);
      const cut = isCut ?? (rgb[1] > 100 && rgb[0] - rgb[1] < 145);
      fruits.push({ type: "strawberry", cut: !!cut, bounds, center: [x + (a + b) / 2, region.center[1]], color: rgb, confidence: split.length === 2 ? 0.78 : 0.67 });
    }
  }
  const darkRegions = components(close(topMasks[1], w, h), w, h, Math.max(20, n * 25e-5));
  for (const c of darkRegions) {
    const [x, y, bw, bh] = c.bounds;
    if (bw < body[2] * 0.07 || bw > body[2] * 0.32 || bh > body[3] * 0.38 || bw / bh < 0.55 || bw / bh > 1.6) continue;
    if (fruits.some((f) => Math.abs(f.center[0] - c.center[0]) < f.bounds[2] * 0.35 && Math.abs(f.center[1] - c.center[1]) < f.bounds[3] * 0.3)) continue;
    fruits.push({ type: "blueberry", cut: false, ...c, color: colorOf(data, w, c.bounds, channels), confidence: 0.72 });
  }
  const leaves = components(close(topMasks[2], w, h), w, h, Math.max(12, n * 12e-5)).filter((c) => c.bounds[2] > body[2] * 0.04);
  const pinkRegions = components(close(pink, w, h), w, h, Math.max(50, n * 1e-3));
  const frosting = pinkRegions.filter((c) => c.bounds[0] < body[0] + body[2] && c.bounds[0] + c.bounds[2] > body[0] && c.bounds[1] < body[1] + body[3]);
  const sideRegion = frosting.find((c) => c.bounds[0] + c.bounds[2] > body[0] + body[2] * 0.88 && c.bounds[3] > body[3] * 0.45);
  const gaps = layers.slice(0, -1).map((l, i) => {
    const next = layers[i + 1], y = profiles.length ? median(profiles.map((p) => p[i].end)) : l.bounds[1] + l.bounds[3], gap = profiles.length ? median(profiles.map((p) => p[i + 1].start - p[i].end)) : next.bounds[1] - y;
    return { bounds: [body[0] + body[2] * 0.12, y, body[2] * 0.3, Math.max(2, gap)], height: Math.max(2, gap) };
  });
  const layerData = layers.map((l, i) => ({ bounds: l.bounds, height: profiles.length ? median(profiles.map((p) => p[i].end - p[i].start)) : l.bounds[3], color: colorOf(data, w, l.bounds, channels, crumb) }));
  const creamColor = frosting.length ? colorOf(data, w, frosting[0].bounds, channels, pink) : null;
  const frame = [Math.max(body[0] - body[2] * 0.2, Math.min(body[0], ...frosting.map((c) => c.bounds[0]))), body[1], 0, body[3]];
  frame[2] = Math.min(body[0] + body[2] * 1.45, Math.max(body[0] + body[2], ...frosting.map((c) => c.bounds[0] + c.bounds[2]))) - frame[0];
  const confidence = reliable && layers.length > 1 ? 0.82 : 0.4;
  return { version: 1, reliable: confidence > 0.7, confidence, body, frame, layers: layerData, fillings: gaps.map((g) => ({ ...g, color: colorOf(data, w, g.bounds, channels) })), fruits: fruits.slice(0, 10), leaves: leaves.slice(0, 6), frosting: { color: creamColor, side: sideRegion ? sideRegion.center[0] > body[0] + body[2] / 2 ? "right" : "left" : null }, crops: { cutFace: [clamp(frame[0] - frame[2] * 0.05, 0, w), clamp(body[1] - body[3] * 0.03, 0, h), frame[2] * 1.1, body[3] * 1.08], toppings: [clamp(frame[0] - frame[2] * 0.05, 0, w), clamp(Math.min(...fruits.map((f) => f.bounds[1]), body[1] - body[3] * 0.6) - h * 0.03, 0, h), frame[2] * 1.15, body[3] * 0.83] }, width: w, height: h };
}
let warmWorker = null, warmTimer = null;
addEventListener("pagehide", () => {
  warmWorker?.terminate();
  warmWorker = null;
  clearTimeout(warmTimer);
});
async function analyzeObject(file, onProgress = () => {
}, signal) {
  signal?.throwIfAborted();
  const bitmap = await createImageBitmap(file), canvas = document.createElement("canvas");
  const scale = Math.min(1, 512 / Math.max(bitmap.width, bitmap.height));
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height), { palette } = analyzeColors(pixels.data, canvas.width, canvas.height);
  const drinkAnalysis = analyzeDrinkPixels(pixels.data, canvas.width, canvas.height);
  const cakeAnalysis = analyzeCakePixels(pixels.data, canvas.width, canvas.height), crops = {};
  if (cakeAnalysis.reliable) for (const [name, bounds] of Object.entries(cakeAnalysis.crops)) {
    const [x, y, w, h] = bounds, part = document.createElement("canvas");
    part.width = Math.max(1, Math.round(Math.min(w, canvas.width - x)));
    part.height = Math.max(1, Math.round(Math.min(h, canvas.height - y)));
    part.getContext("2d").drawImage(canvas, x, y, part.width, part.height, 0, 0, part.width, part.height);
    crops[name] = await new Promise((resolve) => part.toBlob(resolve, "image/png"));
  }
  return new Promise((resolve, reject) => {
    clearTimeout(warmTimer);
    const worker = warmWorker || new Worker(new URL(
      /* @vite-ignore */
      "" + new URL("local-vlm.worker-DTQDKYIw.js", import.meta.url).href,
      import.meta.url
    ), { type: "module" });
    warmWorker = worker;
    const stop = (dispose = false) => {
      if (dispose) {
        worker.terminate();
        if (warmWorker === worker) warmWorker = null;
      }
      worker.onmessage = null;
      worker.onerror = null;
      signal?.removeEventListener("abort", abort);
    };
    const abort = () => {
      stop(true);
      reject(new DOMException("已取消", "AbortError"));
    };
    signal?.addEventListener("abort", abort, { once: true });
    if (signal?.aborted) return abort();
    worker.onmessage = ({ data }) => {
      if (data.type === "progress") onProgress(data.stage, data.value);
      else if (data.type === "diagnostic") console.info("Local modeling diagnostic", JSON.stringify(data));
      else if (data.type === "complete") {
        stop();
        warmTimer = setTimeout(() => {
          worker.terminate();
          if (warmWorker === worker) warmWorker = null;
        }, 9e4);
        if (location.hostname === "127.0.0.1") console.info("Local VLM modeling plan", JSON.stringify(data.recipe));
        resolve(data.recipe);
      } else if (data.type === "error") {
        stop(true);
        reject(Error(data.message));
      }
    };
    worker.onerror = (event) => {
      stop(true);
      reject(Error(event.message || "浏览器无法启动设备端建模。"));
    };
    worker.postMessage({ type: "analyze", file, palette, cakeAnalysis, drinkAnalysis, crops, debug: location.hostname === "127.0.0.1", assetsBase: new URL("./local-models/", document.baseURI).href });
  });
}
export {
  analyzeObject
};
