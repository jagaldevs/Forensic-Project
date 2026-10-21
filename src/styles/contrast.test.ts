/**
 * WCAG AA contrast of the design tokens. Reads tokens.css directly, so swapping in the official
 * brand colours re-runs these checks. Text needs 4.5:1; UI parts that must be seen to be used
 * (field borders, focus rings, chart lines, the board string) need 3:1.
 */
// @vitest-environment node
/// <reference types="node" />
import { readFileSync } from 'node:fs';
import { describe, expect, test } from 'vitest';

// Read from disk: Vitest replaces imported plain CSS with an empty string.
const css = readFileSync(new URL('./tokens.css', import.meta.url), 'utf8');
const rootBlock = css.slice(css.indexOf(':root'), css.indexOf('@media'));
const tokens = new Map<string, string>();
for (const m of rootBlock.matchAll(/--([\w-]+):\s*([^;]+);/g)) tokens.set(m[1]!, m[2]!.trim());

type Rgba = [number, number, number, number];

function resolve(name: string): string {
  const raw = tokens.get(name);
  if (raw === undefined) throw new Error(`Unknown token --${name}`);
  const ref = /^var\(--([\w-]+)\)$/.exec(raw);
  return ref ? resolve(ref[1]!) : raw;
}

function parse(value: string): Rgba {
  const hex = /^#([0-9a-f]{6})$/i.exec(value);
  if (hex) {
    const n = parseInt(hex[1]!, 16);
    return [n >> 16, (n >> 8) & 255, n & 255, 1];
  }
  const rgb = /^rgb\((\d+) (\d+) (\d+)(?: \/ (\d+)%)?\)$/.exec(value);
  if (rgb) return [+rgb[1]!, +rgb[2]!, +rgb[3]!, rgb[4] === undefined ? 1 : +rgb[4] / 100];
  throw new Error(`Can't parse colour ${value}`);
}

/** A translucent colour composited over an opaque one. */
function over([r, g, b, a]: Rgba, [br, bg, bb]: Rgba): Rgba {
  return [r * a + br * (1 - a), g * a + bg * (1 - a), b * a + bb * (1 - a), 1];
}

function luminance([r, g, b]: Rgba) {
  const lin = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

function ratio(fg: string, bg: string) {
  const back = parse(resolve(bg));
  const front = over(parse(resolve(fg)), back);
  const [a, b] = [luminance(front), luminance(back)];
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

const panels = ['bg-0', 'bg-1', 'bg-2', 'bg-3', 'surface-raised', 'accent-soft'];

/** [foreground, backgrounds it is used on]. */
const textPairs: [string, string[]][] = [
  ['text', panels],
  ['text-muted', panels],
  ['text-faint', panels],
  ['accent', ['bg-1', 'bg-2', 'accent-soft']],
  ['accent-strong', ['bg-1', 'bg-2', 'accent-soft']],
  ['on-brand', ['brand-magenta', 'accent', 'accent-strong']],
  ['tag-text', ['tag-bg', 'bg-1']],
  ['terminal-text', ['bg-1', 'bg-2']],
  ['terminal-ok', ['bg-1', 'bg-2']],
  ['on-bubble-mine', ['bubble-mine']],
  ['text', ['bg-3']],
  ['status-supports', ['status-supports-bg', 'bg-1']],
  ['status-contradicts', ['status-contradicts-bg', 'bg-1']],
  ['status-inconclusive', ['status-inconclusive-bg', 'bg-1']],
  ['status-unassessed', ['status-unassessed-bg', 'bg-1']],
  ['status-info', ['status-info-bg', 'bg-1']],
  ['card-ink', ['card-paper']],
  ['card-ink-muted', ['card-paper']],
  ['card-paper', ['cork']],
  ['map-label', ['map-land']],
  ['map-sea-label', ['map-sea']],
  ['chart-axis', ['bg-1']],
];

const uiPairs: [string, string[]][] = [
  ['field-border', ['bg-1', 'bg-2']],
  // The ring sits 2px outside the element, on whatever surrounds it.
  ['focus-ring', ['bg-0', 'bg-1', 'bg-2', 'bg-3', 'accent-soft', 'card-paper']],
  ['chart-steps', ['bg-1']],
  ['chart-heart', ['bg-1']],
  // The string is drawn over a pale halo; the halo carries it against the cork.
  ['string', ['string-halo']],
  ['string-halo', ['cork']],
  ['pin', ['card-paper', 'bg-1']],
  ['accent', ['bg-1']],
];

describe('design token contrast (WCAG AA)', () => {
  for (const [fg, bgs] of textPairs) {
    for (const bg of bgs) {
      test(`text --${fg} on --${bg} is at least 4.5:1`, () => {
        expect(ratio(fg, bg)).toBeGreaterThanOrEqual(4.5);
      });
    }
  }
  for (const [fg, bgs] of uiPairs) {
    for (const bg of bgs) {
      test(`UI --${fg} on --${bg} is at least 3:1`, () => {
        expect(ratio(fg, bg)).toBeGreaterThanOrEqual(3);
      });
    }
  }
});
