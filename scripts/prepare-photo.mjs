// Prepares a supplied photo for a case or mission: shrinks it to at most 1200 px wide and
// re-encodes it as a JPEG. Re-encoding drops every metadata block (EXIF, GPS, camera serials),
// so the real location and phone details of the photographer never ship in the app.
//
// Run: npm run photo -- <input.jpg> <output.jpg> [--width 1200] [--quality 78] [--rotate 90|180|270]
//
// Only JPEG input is supported (that is what phones export). Phones often store photos
// sideways with an "orientation" flag, which is dropped here: pass --rotate if the result is
// sideways. Check the result is under the 160 KB photo budget (src/assets.test.ts).
import { readFileSync, statSync, writeFileSync } from 'node:fs';
import jpeg from 'jpeg-js';

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? Number(args.splice(i, 2)[1]) : fallback;
};
const maxWidth = flag('width', 1200);
const quality = flag('quality', 78);
const rotate = flag('rotate', 0);
const [input, output] = args;
if (!input || !output) {
  console.error(
    'Usage: npm run photo -- <input.jpg> <output.jpg> [--width 1200] [--quality 78] [--rotate 90]',
  );
  process.exit(1);
}

let img = jpeg.decode(readFileSync(input), {
  useTArray: true,
  maxMemoryUsageInMB: 1024,
  maxResolutionInMP: 200,
});

/** Rotates clockwise by 90, 180 or 270 degrees. */
function rotated({ width, height, data }, degrees) {
  const turns = (((degrees / 90) % 4) + 4) % 4;
  if (!turns) return { width, height, data };
  const w = turns % 2 ? height : width;
  const h = turns % 2 ? width : height;
  const out = new Uint8Array(w * h * 4);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const [nx, ny] =
        turns === 1
          ? [height - 1 - y, x]
          : turns === 2
            ? [width - 1 - x, height - 1 - y]
            : [y, width - 1 - x];
      out.set(data.subarray((y * width + x) * 4, (y * width + x) * 4 + 4), (ny * w + nx) * 4);
    }
  return { width: w, height: h, data: out };
}

/** Area-average downscale, so fine detail doesn't shimmer or alias. */
function shrunk({ width, height, data }, targetWidth) {
  if (width <= targetWidth) return { width, height, data };
  const w = targetWidth;
  const h = Math.round((height * w) / width);
  const sx = width / w;
  const sy = height / h;
  const out = new Uint8Array(w * h * 4);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const x0 = Math.floor(x * sx);
      const x1 = Math.min(width, Math.floor((x + 1) * sx));
      const y0 = Math.floor(y * sy);
      const y1 = Math.min(height, Math.floor((y + 1) * sy));
      let r = 0,
        g = 0,
        b = 0,
        n = 0;
      for (let yy = y0; yy < y1; yy++)
        for (let xx = x0; xx < x1; xx++) {
          const i = (yy * width + xx) * 4;
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          n++;
        }
      const o = (y * w + x) * 4;
      out[o] = r / n;
      out[o + 1] = g / n;
      out[o + 2] = b / n;
      out[o + 3] = 255;
    }
  return { width: w, height: h, data: out };
}

img = shrunk(rotated(img, rotate), maxWidth);
writeFileSync(output, jpeg.encode(img, quality).data);
console.log(
  `${output}: ${img.width} × ${img.height}, ${Math.round(statSync(output).size / 1024)} KB, metadata removed`,
);
