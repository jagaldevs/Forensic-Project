/**
 * Facts the cases' answers depend on. If the map is redrawn, these say which model answers,
 * hints and teacher notes need rechecking.
 */
import { describe, expect, test } from 'vitest';
import waterfront from '../../cases/waterfront-alibi/case';
import jamie from '../../cases/where-was-jamie/case';
import ipMission from '../../missions/ip-networks/mission';
import { darwin } from './darwin';
import { distanceKm, onLand, placesWithin } from './region';
import { travelEstimate } from './travel';

const marker = (c: { mapMarkers: { id: string; at: { x: number; y: number } }[] }, id: string) =>
  c.mapMarkers.find((m) => m.id === id)!.at;
const place = (id: string) => darwin.places.find((p) => p.id === id)!.at;

test('every place and case pin is on land and on the map', () => {
  for (const p of [
    ...darwin.places.map((x) => x.at),
    ...waterfront.mapMarkers.map((m) => m.at),
    ...jamie.mapMarkers.map((m) => m.at),
  ]) {
    expect(onLand(darwin, p)).toBe(true);
    expect(p.x).toBeGreaterThan(0);
    expect(p.x).toBeLessThan(darwin.widthKm);
    expect(p.y).toBeGreaterThan(0);
    expect(p.y).toBeLessThan(darwin.heightKm);
  }
});

test('distances between well-known places are realistic', () => {
  // Straight-line distances, rounded, from general knowledge of Darwin.
  expect(distanceKm(place('darwin-city'), place('palmerston'))).toBeCloseTo(15.5, 0);
  expect(distanceKm(place('darwin-city'), place('casuarina'))).toBeCloseTo(10.5, 0);
  expect(distanceKm(place('darwin-city'), place('airport'))).toBeCloseTo(7, 0);
  expect(distanceKm(place('cullen-bay'), place('mindil-beach'))).toBeLessThan(1.6);
});

describe('The Waterfront Alibi', () => {
  const ip = waterfront.evidence.find((e) => e.type === 'ipRecord')!;
  if (ip.type !== 'ipRecord') throw new Error('no IP record');

  test('the 25 km circle covers the scene and the Okafor home, which are about 15 km apart', () => {
    const scene = marker(waterfront, 'scene');
    const home = marker(waterfront, 'okafor-home');
    expect(distanceKm(ip.centre, scene)).toBeLessThan(ip.accuracyRadiusKm);
    expect(distanceKm(ip.centre, home)).toBeLessThan(ip.accuracyRadiusKm);
    expect(Math.round(distanceKm(scene, home))).toBe(15);
  });

  test('only Humpty Doo is outside the circle; Howard Springs is near the edge', () => {
    const outside = darwin.places.filter((p) => distanceKm(p.at, ip.centre) > ip.accuracyRadiusKm);
    expect(outside.map((p) => p.id)).toEqual(['humpty-doo']);
    expect(distanceKm(place('howard-springs'), ip.centre)).toBeGreaterThan(21);
  });
});

describe('Where was Jamie?', () => {
  const lagoon = marker(jamie, 'lagoon');
  const cullen = marker(jamie, 'cullen-boardwalk');
  const mindil = marker(jamie, 'mindil');
  const sasha = marker(jamie, 'sasha-home');

  test('lagoon gate to Cullen Bay on foot fits in 47 minutes (18:05 to 18:52)', () => {
    const t = travelEstimate(lagoon, cullen, 'walk');
    expect(t.minMinutes).toBeLessThanOrEqual(47);
    expect([t.minMinutes, t.maxMinutes]).toEqual([38, 46]);
  });

  test('a walk from Cullen Bay to Mindil and back does not fit in 10 or 22 minutes', () => {
    const t = travelEstimate(cullen, mindil, 'walk');
    expect([t.minMinutes, t.maxMinutes]).toEqual([16, 20]);
    expect(t.minMinutes * 2).toBeGreaterThan(22);
  });

  test('the bus to Parap takes roughly 15 to 30 minutes, including waiting', () => {
    const t = travelEstimate(cullen, sasha, 'bus');
    expect(t.minMinutes).toBeGreaterThanOrEqual(12);
    expect(t.maxMinutes).toBeLessThanOrEqual(31);
    expect(Math.round(t.roadKm)).toBe(4);
  });
});

test('IP mission: the Quinn home is about 9 km from the pin, inside the 20 km circle', () => {
  const step = ipMission.steps.find((s) => s.id === 'geolocation')!;
  const media = step.media?.[0];
  if (media?.kind !== 'map' || !media.circle) throw new Error('no map');
  const home = media.markers![0]!.at;
  expect(Math.round(distanceKm(home, media.circle.centre))).toBe(9);
  const inside = placesWithin(darwin, media.circle.centre, media.circle.radiusKm).map((p) => p.id);
  expect(inside).toEqual(
    expect.arrayContaining(['nightcliff', 'casuarina', 'airport', 'berrimah', 'palmerston']),
  );
});
