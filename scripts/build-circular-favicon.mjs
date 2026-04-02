/**
 * Build public/favicon-leaves-rounded.png: white circular badge + leaves (matches footer),
 * with transparent pixels outside the circle so the tab icon reads as a circle.
 */
import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const src = path.join(root, "public/favicon-leaves.png");
const out = path.join(root, "public/favicon-leaves-rounded.png");
const size = 512;
const cx = (size - 1) / 2;
const cy = (size - 1) / 2;
const radius = size / 2 - 2;
const rim = 1.5;

// Leaves scaled to sit comfortably inside the disk (matches footer ~72% feel)
const maxSide = Math.floor(radius * 2 * 0.72);

const leafBuf = await sharp(src)
  .resize(maxSide, maxSide, { fit: "inside", withoutEnlargement: false })
  .ensureAlpha()
  .toBuffer();

const w = size;
const h = size;
const base = Buffer.alloc(w * h * 4);

for (let y = 0; y < h; y++) {
  for (let x = 0; x < w; x++) {
    const dx = x - cx;
    const dy = y - cy;
    const dist = Math.hypot(dx, dy);
    const i = (y * w + x) * 4;
    if (dist > radius) {
      base[i + 3] = 0;
      continue;
    }
    let a = 255;
    if (dist > radius - rim) {
      a = Math.round(255 * Math.min(1, (radius - dist) / rim));
    }
    base[i] = 255;
    base[i + 1] = 255;
    base[i + 2] = 255;
    base[i + 3] = a;
  }
}

await sharp(base, {
  raw: { width: w, height: h, channels: 4 },
})
  .composite([{ input: leafBuf, gravity: "center" }])
  .png()
  .toFile(out);

const check = await sharp(out).raw().toBuffer({ resolveWithObject: true });
let opaque = 0;
for (let j = 3; j < check.data.length; j += 4) {
  if (check.data[j] > 0) opaque++;
}
console.log("Wrote", out, "opaque pixels", opaque);
