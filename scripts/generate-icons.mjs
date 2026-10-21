// Makes the PWA and apple-touch icons from the crest in src/brand/haileybury-logo.jpg.
// Run: node scripts/generate-icons.mjs
//
// The crest box matches `crest` in src/brand/brand.ts. The logo is a 300 px JPEG, so the 512 px
// icons are upscaled; regenerate from a larger or vector logo when one is available.
import { readFileSync, writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import jpeg from 'jpeg-js';

const crest = { x: 75, y: 28, width: 150, height: 192 };
const logo = jpeg.decode(readFileSync('src/brand/haileybury-logo.jpg'), { useTArray: true });
const SS = 4; // samples per pixel along each axis

/** Bilinear sample of the logo at (x, y) in image pixels; white outside the image. */
function sample(x, y) {
  const x0 = Math.floor(x - 0.5);
  const y0 = Math.floor(y - 0.5);
  const fx = x - 0.5 - x0;
  const fy = y - 0.5 - y0;
  const out = [0, 0, 0];
  for (const [dx, dy, w] of [
    [0, 0, (1 - fx) * (1 - fy)],
    [1, 0, fx * (1 - fy)],
    [0, 1, (1 - fx) * fy],
    [1, 1, fx * fy],
  ]) {
    const px = x0 + dx;
    const py = y0 + dy;
    const inside = px >= 0 && py >= 0 && px < logo.width && py < logo.height;
    const i = (py * logo.width + px) * 4;
    for (let c = 0; c < 3; c++) out[c] += w * (inside ? logo.data[i + c] : 255);
  }
  return out;
}

/** A square icon: white, with the crest centred at `crestHeight` of the icon's height. */
function icon(size, crestHeight) {
  const h = size * crestHeight;
  const w = (h * crest.width) / crest.height;
  const left = (size - w) / 2;
  const top = (size - h) / 2;
  const scale = crest.height / h; // image pixels per icon pixel
  const raw = Buffer.alloc((size * 3 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0; // PNG filter: none
    for (let x = 0; x < size; x++) {
      const sum = [0, 0, 0];
      for (let sy = 0; sy < SS; sy++)
        for (let sx = 0; sx < SS; sx++) {
          const u = x + (sx + 0.5) / SS - left;
          const v = y + (sy + 0.5) / SS - top;
          const inBox = u >= 0 && v >= 0 && u < w && v < h;
          const rgb = inBox ? sample(crest.x + u * scale, crest.y + v * scale) : [255, 255, 255];
          for (let c = 0; c < 3; c++) sum[c] += rgb[c];
        }
      const o = y * (size * 3 + 1) + 1 + x * 3;
      for (let c = 0; c < 3; c++) raw[o + c] = Math.round(sum[c] / (SS * SS));
    }
  }
  return png(size, raw);
}

function png(size, raw) {
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body));
    return Buffer.concat([len, body, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type: RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function crc32(buf) {
  let c = ~0;
  for (const b of buf) {
    c ^= b;
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

const icons = [
  ['pwa-192.png', 192, 0.8],
  ['pwa-512.png', 512, 0.8],
  // Maskable: the crest stays inside the central safe circle (80% of the icon).
  ['pwa-maskable-512.png', 512, 0.6],
  ['apple-touch-icon.png', 180, 0.76],
];
for (const [name, size, crestHeight] of icons) {
  writeFileSync(`public/${name}`, icon(size, crestHeight));
  console.log(`public/${name} (${size} px)`);
}
