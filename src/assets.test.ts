/**
 * Evidence images: small enough for school Wi-Fi, self-contained (no runtime requests) and
 * labelled. See docs/illustration-style.md.
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const BUDGET_BYTES = 24 * 1024;
const PHOTO_BUDGET_BYTES = 160 * 1024;

function assetFiles(root: string): string[] {
  return readdirSync(root).flatMap((dir) => {
    const assets = join(root, dir, 'assets');
    try {
      return readdirSync(assets).map((f) => join(assets, f));
    } catch {
      return [];
    }
  });
}

const files = [...assetFiles('src/cases'), ...assetFiles('src/missions')];

test('there are evidence images to check', () => {
  expect(files.length).toBeGreaterThan(10);
});

describe.each(files.map((f) => [f.replace(/\\/g, '/')]))('%s', (file) => {
  const isSvg = file.endsWith('.svg');

  test('is within its size budget', () => {
    expect(statSync(file).size).toBeLessThanOrEqual(isSvg ? BUDGET_BYTES : PHOTO_BUDGET_BYTES);
  });

  if (isSvg) {
    const svg = readFileSync(file, 'utf8');

    test('has no external references', () => {
      const withoutNamespace = svg.replace(/xmlns(:\w+)?="http:\/\/www\.w3\.org\/[^"]*"/g, '');
      expect(withoutNamespace).not.toMatch(/https?:\/\//);
      expect(svg).not.toMatch(/<image\b|<script\b|<foreignObject\b|@import|url\((?!#)/);
    });

    test('is labelled as an image', () => {
      expect(svg).toMatch(/<svg[^>]*role="img"/);
      expect(svg).toMatch(/<svg[^>]*aria-label="[^"]+"/);
    });
  } else {
    test('is a web image format', () => {
      expect(file).toMatch(/\.(jpe?g|webp|png)$/);
    });
  }
});
