/**
 * Removes a flat mat color (from corner average) from public/logo.png.
 * Run: node scripts/make-logo-transparent.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const logoPath = path.join(root, "public", "logo.png");
const backupPath = path.join(root, "public", "logo-backup-before-transparency.png");

function dist(a, b) {
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

const img = sharp(logoPath).ensureAlpha();
const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;
if (channels !== 4) {
  console.error("Expected RGBA");
  process.exit(1);
}

const idx = (x, y) => (y * width + x) * 4;
const rgb = (x, y) => [data[idx(x, y)], data[idx(x, y) + 1], data[idx(x, y) + 2]];

const corners = [
  rgb(0, 0),
  rgb(width - 1, 0),
  rgb(0, height - 1),
  rgb(width - 1, height - 1),
];
const bg = [
  Math.round(corners.reduce((s, c) => s + c[0], 0) / 4),
  Math.round(corners.reduce((s, c) => s + c[1], 0) / 4),
  Math.round(corners.reduce((s, c) => s + c[2], 0) / 4),
];

const tol = 42;
for (let y = 0; y < height; y++) {
  for (let x = 0; x < width; x++) {
    const i = idx(x, y);
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (dist([r, g, b], bg) <= tol) {
      data[i + 3] = 0;
    }
  }
}

if (!fs.existsSync(backupPath)) {
  fs.copyFileSync(logoPath, backupPath);
  console.log("Backup saved:", path.relative(root, backupPath));
}

await sharp(data, { raw: { width, height, channels: 4 } })
  .png({ compressionLevel: 9 })
  .toFile(logoPath + ".tmp");

fs.renameSync(logoPath + ".tmp", logoPath);
console.log("Updated", path.relative(root, logoPath), "mat RGB ~", bg.join(","));
