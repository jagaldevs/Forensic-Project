// Generates the placeholder PWA icons (magenta magnifier on near-black) with no dependencies.
// Replace public/pwa-*.png and public/apple-touch-icon.png with official artwork when available.
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const BG = [0x0b, 0x0b, 0x0f];
const FG = [0xf0, 0x47, 0x9e];
const SS = 4; // supersampling factor for smooth edges

function coverage(u, v) {
  // u, v in 0..1. Ring centred at (0.44, 0.44), plus a handle towards the bottom right.
  const dx = u - 0.44;
  const dy = v - 0.44;
  const d = Math.hypot(dx, dy);
  if (d > 0.17 && d < 0.23) return 1;
  // Handle: thick segment from (0.6, 0.6) to (0.72, 0.72)
  const t = Math.max(0, Math.min(1, (u - 0.6 + (v - 0.6)) / (2 * 0.12)));
  const px = 0.6 + t * 0.12;
  const py = 0.6 + t * 0.12;
  if (Math.hypot(u - px, v - py) < 0.045) return 1;
  // Small "data" dots inside the lens.
  for (const [cx, cy] of [
    [0.38, 0.44],
    [0.44, 0.44],
    [0.5, 0.44],
  ]) {
    if (Math.hypot(u - cx, v - cy) < 0.022) return 1;
  }
  return 0;
}

function png(size) {
  const raw = Buffer.alloc((size * 3 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      let c = 0;
      for (let sy = 0; sy < SS; sy++)
        for (let sx = 0; sx < SS; sx++)
          c += coverage((x + (sx + 0.5) / SS) / size, (y + (sy + 0.5) / SS) / size);
      c /= SS * SS;
      const o = y * (size * 3 + 1) + 1 + x * 3;
      for (let i = 0; i < 3; i++) raw[o + i] = Math.round(BG[i] * (1 - c) + FG[i] * c);
    }
  }
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type), data]);
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crc32(body) >>> 0);
    return Buffer.concat([len, body, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // truecolour
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const table = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = table[(c ^ b) & 0xff] ^ (c >>> 8);
  return c ^ 0xffffffff;
}

writeFileSync('public/pwa-192.png', png(192));
writeFileSync('public/pwa-512.png', png(512));
writeFileSync('public/apple-touch-icon.png', png(180));
console.log('Icons written to public/');
