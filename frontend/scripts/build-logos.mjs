// Rebuilds the six ShaktiPath logo lockups in public/images/logos from the client's 1254px master.
//
//   node scripts/build-logos.mjs [master.jpeg] [outDir]      (run from frontend/)
//
// The master is "Documetns of Tantrik/logo.jpeg" (stacked lockup on near-white paper). Each cut keeps the
// master's native pixels (nothing is upscaled): the stacked lockup is the trimmed master, the mark is the
// trishul-and-lotus region, and the horizontal lockup places the mark beside the wordmark in the same
// proportions as the original site cut (mark 97/663 of the width, wordmark from x = 115/663, y = 42/240).
// The paper is keyed out into real transparency, the full-colour versions are darkened by DARKEN, and the
// "-gold" versions reuse the same alpha filled with --gold-500 for dark grounds. Output is lossless WebP.
//
// Uses sharp, which ships with Next.js (frontend/node_modules/sharp).
import sharp from 'sharp';
import path from 'node:path';
import fs from 'node:fs';

const here = import.meta.dirname;
const MASTER = process.argv[2] || path.resolve(here, '../../Documetns of Tantrik/logo.jpeg');
const OUT = process.argv[3] || path.resolve(here, '../public/images/logos');

const DARKEN = 0.95; // full-colour lockups: 5% darker than the master (1 = as drawn)
const GOLD = [212, 175, 55]; // --gold-500 #D4AF37, fill for the reversed (dark-ground) lockups
const PAPER = [253, 254, 248]; // the master's background colour
// Background keying: T0 = ink threshold (JPEG noise floor); faint pixels survive only within SUPPORT_R px of
// solid ink (> SUPPORT); a pixel within SOLID of the strongest ink in its WIN neighbourhood (never read as less
// than FLOOR) counts as fully covered; alpha below MIN_A is dropped.
const T0 = 14, FLOOR = 110, WIN = 3, SUPPORT = 60, SUPPORT_R = 3, SOLID = 0.85, MIN_A = 8 / 255;
// Layout of the original horizontal cut (663x240), reproduced at the master's scale.
const H_CANVAS = { w: 663, h: 240, markW: 97, wordX: 115, wordY: 42, wordW: 548 };

fs.mkdirSync(OUT, { recursive: true });
const { data, info } = await sharp(MASTER).raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;
const idx = (x, y) => (y * W + x) * C;

// Distance from paper, per pixel.
const dist = new Float32Array(W * H);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = idx(x, y);
    dist[y * W + x] = Math.max(0, PAPER[0] - data[i], PAPER[1] - data[i + 1], PAPER[2] - data[i + 2]);
  }
}

// Support mask: within SUPPORT_R px of solid ink (drops isolated JPEG specks, keeps edge anti-aliasing).
const solid = new Uint8Array(W * H);
for (let k = 0; k < W * H; k++) solid[k] = dist[k] > SUPPORT ? 1 : 0;
const support = new Uint8Array(W * H);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    let s = 0;
    for (let dy = -SUPPORT_R; dy <= SUPPORT_R && !s; dy++) {
      for (let dx = -SUPPORT_R; dx <= SUPPORT_R; dx++) {
        const yy = y + dy, xx = x + dx;
        if (yy < 0 || yy >= H || xx < 0 || xx >= W) continue;
        if (solid[yy * W + xx]) { s = 1; break; }
      }
    }
    support[y * W + x] = s;
  }
}

// Alpha: coverage relative to the strongest ink nearby (so gold edges are not read as half-transparent maroon).
const alpha = new Float32Array(W * H);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const k = y * W + x;
    const d = dist[k];
    if (!support[k] || d <= T0) { alpha[k] = 0; continue; }
    let m = FLOOR;
    for (let dy = -WIN; dy <= WIN; dy++) {
      for (let dx = -WIN; dx <= WIN; dx++) {
        const yy = y + dy, xx = x + dx;
        if (yy < 0 || yy >= H || xx < 0 || xx >= W) continue;
        const v = dist[yy * W + xx];
        if (v > m) m = v;
      }
    }
    const a = Math.min(1, (d - T0) / (SOLID * m - T0));
    alpha[k] = a < MIN_A ? 0 : a;
  }
}

// Un-matte: recover the ink colour behind the paper blend.
const rgba = Buffer.alloc(W * H * 4);
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const k = y * W + x, i = idx(x, y), a = alpha[k], o = k * 4;
    if (a <= 0) { rgba[o] = rgba[o + 1] = rgba[o + 2] = rgba[o + 3] = 0; continue; }
    for (let c = 0; c < 3; c++) {
      const fg = (data[i + c] - (1 - a) * PAPER[c]) / a;
      rgba[o + c] = Math.max(0, Math.min(255, Math.round(fg)));
    }
    rgba[o + 3] = Math.round(a * 255);
  }
}

// Split the mark (with the drop hanging under the lotus) from the wordmark: they overlap in rows, not in columns.
const inkRow = (y, x0, x1) => { for (let x = x0; x < x1; x++) if (alpha[y * W + x] > 0) return true; return false; };
let sTop = -1;
for (let y = 800; y < 900; y++) if (inkRow(y, 100, 400)) { sTop = y; break; }
let dropBottom = -1;
{ let seen = false; for (let y = 800; y < 900; y++) { const hit = inkRow(y, 560, 700); if (hit) { seen = true; dropBottom = y; } else if (seen) break; } }
let wordTop = -1;
for (let y = 860; y < 960; y++) if (inkRow(y, 560, 800)) { wordTop = y; break; }
if (!(sTop > 0 && dropBottom > 0 && dropBottom < wordTop)) {
  throw new Error(`cannot separate the mark from the wordmark (S top ${sTop}, drop bottom ${dropBottom}, wordmark top ${wordTop})`);
}
const inMark = (x, y) => y < sTop || (y <= dropBottom && x >= 400);
function bbox(test) {
  let x0 = W, y0 = H, x1 = -1, y1 = -1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (alpha[y * W + x] > 0 && test(x, y)) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  return { left: x0, top: y0, width: x1 - x0 + 1, height: y1 - y0 + 1 };
}
const markBox = bbox(inMark), wordBox = bbox((x, y) => !inMark(x, y)), allBox = bbox(() => true);

function layer(test) {
  const b = Buffer.from(rgba);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (!test(x, y)) { const o = (y * W + x) * 4; b[o] = b[o + 1] = b[o + 2] = b[o + 3] = 0; }
  return b;
}
const img = (buf) => sharp(buf, { raw: { width: W, height: H, channels: 4 } });
const markPng = await img(layer(inMark)).extract(markBox).png().toBuffer();
const wordPng = await img(layer((x, y) => !inMark(x, y))).extract(wordBox).png().toBuffer();
const stackedPng = await img(rgba).extract(allBox).png().toBuffer();

// Horizontal lockup.
const S = wordBox.width / H_CANVAS.wordW;
const hH = Math.round(H_CANVAS.h * S);
const markW = Math.round((markBox.width * hH) / markBox.height);
const wordX = Math.round(H_CANVAS.wordX * S), wordY = Math.round(H_CANVAS.wordY * S);
const markScaled = await sharp(markPng).resize({ width: markW, height: hH, fit: 'fill', kernel: 'lanczos3' }).png().toBuffer();
const horizontalPng = await sharp({ create: { width: wordX + wordBox.width, height: hH, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite([{ input: markScaled, left: 0, top: 0 }, { input: wordPng, left: wordX, top: wordY }])
  .png()
  .toBuffer();

async function tinted(png, fn) {
  const { data: d, info: m } = await sharp(png).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < d.length; i += 4) if (d[i + 3]) fn(d, i);
  return sharp(d, { raw: { width: m.width, height: m.height, channels: 4 } });
}
const darken = (d, i) => { d[i] = Math.round(d[i] * DARKEN); d[i + 1] = Math.round(d[i + 1] * DARKEN); d[i + 2] = Math.round(d[i + 2] * DARKEN); };
const gold = (d, i) => { d[i] = GOLD[0]; d[i + 1] = GOLD[1]; d[i + 2] = GOLD[2]; };

for (const [name, png] of [['shaktipath-horizontal', horizontalPng], ['shaktipath-stacked', stackedPng], ['shaktipath-mark', markPng]]) {
  const a = await (await tinted(png, darken)).webp({ lossless: true }).toFile(path.join(OUT, `${name}.webp`));
  const b = await (await tinted(png, gold)).webp({ lossless: true }).toFile(path.join(OUT, `${name}-gold.webp`));
  console.log(`${name}.webp`.padEnd(30), `${a.width}x${a.height}`, `${(a.size / 1024).toFixed(0)} KB  | ${name}-gold.webp ${(b.size / 1024).toFixed(0)} KB`);
}
console.log('Update the sizes in components/ui/Logo.js if the dimensions above changed.');
