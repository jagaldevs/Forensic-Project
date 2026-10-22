import { expect, test } from 'vitest';
import { loadCase, caseCatalogue } from '../../cases';
import raid from '../../cases/midnight-raid/case';
import { distanceKm, onLand } from './region';
import { regionFor, regions } from './regions';

test('every case pin is on land inside its own map', async () => {
  for (const meta of caseCatalogue) {
    const c = await loadCase(meta.id);
    const region = regionFor(c);
    for (const m of c.mapMarkers) {
      expect(onLand(region, m.at), `${c.meta.id}: ${m.id}`).toBe(true);
      expect(m.at.x).toBeGreaterThan(0);
      expect(m.at.x).toBeLessThan(region.widthKm);
      expect(m.at.y).toBeGreaterThan(0);
      expect(m.at.y).toBeLessThan(region.heightKm);
    }
  }
});

test('every named place is on land inside its map', () => {
  for (const region of Object.values(regions))
    for (const p of region.places) {
      expect(onLand(region, p.at), `${region.id}: ${p.id}`).toBe(true);
      expect(p.at.x).toBeGreaterThan(0);
      expect(p.at.x).toBeLessThan(region.widthKm);
    }
});

test('The Midnight Raid: Batchelor weather station is about 40 km from camp', () => {
  const at = (id: string) => raid.mapMarkers.find((m) => m.id === id)!.at;
  expect(Math.round(distanceKm(at('camp'), at('weather-station')) / 5) * 5).toBe(40);
  const wangi = regions.litchfield.places.find((p) => p.id === 'wangi-falls')!.at;
  expect(distanceKm(at('camp'), wangi)).toBeLessThan(2.5);
});
