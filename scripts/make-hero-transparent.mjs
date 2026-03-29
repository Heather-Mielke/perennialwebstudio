/**
 * Remove solid background from a PNG.
 *
 * Modes:
 *   edge   — flood-fill from image borders (default). Good for hero art on a solid field;
 *            keeps interior islands the same color as the bg (e.g. old approach).
 *   global — every pixel near the sampled background becomes transparent. Use for logos
 *            so letter counters (P, O, R, …) and any same-color holes become clear.
 *
 * Usage:
 *   node scripts/make-hero-transparent.mjs <input.png> <output.png> [edge|global]
 */
import sharp from "sharp";

const inputPath = process.argv[2];
const outputPath = process.argv[3];
const mode = (process.argv[4] || "edge").toLowerCase();

if (!inputPath || !outputPath) {
  console.error(
    "Usage: node scripts/make-hero-transparent.mjs <input.png> <output.png> [edge|global]",
  );
  process.exit(1);
}

if (mode !== "edge" && mode !== "global") {
  console.error("Mode must be 'edge' or 'global'");
  process.exit(1);
}

const { data, info } = await sharp(inputPath)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });

const w = info.width;
const h = info.height;
const idx = (x, y) => (y * w + x) * 4;

const samples = [];
for (const [x, y] of [
  [0, 0],
  [w - 1, 0],
  [0, h - 1],
  [w - 1, h - 1],
  [Math.floor(w / 2), 0],
  [0, Math.floor(h / 2)],
  [w - 1, Math.floor(h / 2)],
  [Math.floor(w / 2), h - 1],
]) {
  const i = idx(x, y);
  samples.push([data[i], data[i + 1], data[i + 2]]);
}

const bg = [
  Math.round(samples.reduce((s, p) => s + p[0], 0) / samples.length),
  Math.round(samples.reduce((s, p) => s + p[1], 0) / samples.length),
  Math.round(samples.reduce((s, p) => s + p[2], 0) / samples.length),
];

const fuzz = 40;
const feather = 24;

function distRgb(r, g, b) {
  const dr = r - bg[0];
  const dg = g - bg[1];
  const db = b - bg[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

if (mode === "global") {
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = idx(x, y);
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const d = distRgb(r, g, b);
      if (d <= fuzz) {
        data[i + 3] = 0;
      } else if (d <= fuzz + feather) {
        const t = (d - fuzz) / feather;
        data[i + 3] = Math.round(Math.min(255, Math.max(0, t * 255)));
      }
    }
  }
} else {
  function colorMatch(r, g, b) {
    return distRgb(r, g, b) <= fuzz;
  }

  const n = w * h;
  const match = new Uint8Array(n);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = idx(x, y);
      match[y * w + x] = colorMatch(data[i], data[i + 1], data[i + 2]) ? 1 : 0;
    }
  }

  const visited = new Uint8Array(n);
  const qx = new Int32Array(n);
  const qy = new Int32Array(n);
  let qt = 0;

  function push(x, y) {
    const p = y * w + x;
    if (visited[p]) return;
    visited[p] = 1;
    qx[qt] = x;
    qy[qt] = y;
    qt++;
  }

  for (let x = 0; x < w; x++) {
    if (match[x]) push(x, 0);
    if (match[(h - 1) * w + x]) push(x, h - 1);
  }
  for (let y = 0; y < h; y++) {
    if (match[y * w]) push(0, y);
    if (match[y * w + w - 1]) push(w - 1, y);
  }

  let qh = 0;
  while (qh < qt) {
    const x = qx[qh];
    const y = qy[qh];
    qh++;
    const neigh = [
      [x + 1, y],
      [x - 1, y],
      [x, y + 1],
      [x, y - 1],
    ];
    for (const [nx, ny] of neigh) {
      if (nx < 0 || nx >= w || ny < 0 || ny >= h) continue;
      const p = ny * w + nx;
      if (visited[p] || !match[p]) continue;
      visited[p] = 1;
      qx[qt] = nx;
      qy[qt] = ny;
      qt++;
    }
  }

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const p = y * w + x;
      const i = idx(x, y);
      if (visited[p]) {
        data[i + 3] = 0;
      }
    }
  }
}

await sharp(data, { raw: { width: w, height: h, channels: 4 } })
  .png()
  .toFile(outputPath);

console.log("Wrote", outputPath, `${w}x${h}`, "key", bg, `(${mode})`);
