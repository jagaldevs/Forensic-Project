/**
 * The shared illustrated map of a Darwin-inspired region, used by IP Lookup (and later the
 * Map app). Custom-drawn, so no external map tiles are needed.
 *
 * Coordinates are kilometres from the top-left corner, so distances and accuracy radii are
 * drawn to scale. Geography is simplified and illustrative, not survey-accurate.
 */
import type { MapPoint } from '../types';

export const MAP_WIDTH_KM = 72;
export const MAP_HEIGHT_KM = 52;

export interface MapPlace {
  id: string;
  name: string;
  at: MapPoint;
  size: 'major' | 'minor';
}

export const places: MapPlace[] = [
  { id: 'darwin-city', name: 'Darwin City', at: { x: 18.4, y: 27.2 }, size: 'major' },
  { id: 'waterfront', name: 'Waterfront', at: { x: 19.8, y: 29.4 }, size: 'minor' },
  { id: 'cullen-bay', name: 'Cullen Bay', at: { x: 15.6, y: 24.6 }, size: 'minor' },
  { id: 'fannie-bay', name: 'Fannie Bay', at: { x: 14.4, y: 19.4 }, size: 'minor' },
  { id: 'nightcliff', name: 'Nightcliff', at: { x: 15.4, y: 13.2 }, size: 'minor' },
  { id: 'casuarina', name: 'Casuarina', at: { x: 18.6, y: 8.8 }, size: 'major' },
  { id: 'airport', name: 'Airport', at: { x: 20.4, y: 16.6 }, size: 'minor' },
  { id: 'winnellie', name: 'Winnellie', at: { x: 22.2, y: 21.4 }, size: 'minor' },
  { id: 'berrimah', name: 'Berrimah', at: { x: 27.4, y: 22.4 }, size: 'minor' },
  { id: 'east-arm', name: 'East Arm', at: { x: 26.6, y: 31.8 }, size: 'minor' },
  { id: 'palmerston', name: 'Palmerston', at: { x: 35.2, y: 34.4 }, size: 'major' },
  { id: 'howard-springs', name: 'Howard Springs', at: { x: 43.4, y: 27.6 }, size: 'minor' },
  { id: 'humpty-doo', name: 'Humpty Doo', at: { x: 56, y: 36 }, size: 'minor' },
];

/** Land outline (sea is everything else). Points are smoothed into curves when drawn. */
export const coastline: MapPoint[] = [
  { x: 23, y: 0 },
  { x: 72, y: 0 },
  { x: 72, y: 52 },
  { x: 9, y: 52 },
  { x: 12, y: 45 },
  { x: 18, y: 39.5 },
  { x: 26, y: 36.6 },
  { x: 31.5, y: 34.6 },
  { x: 33.2, y: 32.4 },
  { x: 31, y: 30.6 },
  { x: 26, y: 30.2 },
  { x: 21.5, y: 30.8 },
  { x: 19, y: 30.2 },
  { x: 17, y: 27.4 },
  { x: 15, y: 25.2 },
  { x: 13.6, y: 22.6 },
  { x: 12.8, y: 19.2 },
  { x: 13.6, y: 15.2 },
  { x: 14.6, y: 11 },
  { x: 16.6, y: 6.2 },
  { x: 19.6, y: 2.4 },
];

export interface MapRoad {
  name: string;
  major: boolean;
  points: MapPoint[];
}

export const roads: MapRoad[] = [
  {
    name: 'Stuart Highway',
    major: true,
    points: [
      { x: 18.8, y: 28.4 },
      { x: 20.4, y: 24.2 },
      { x: 23.6, y: 21.2 },
      { x: 28.6, y: 23.6 },
      { x: 33.4, y: 29.4 },
      { x: 36.4, y: 34.6 },
      { x: 42, y: 41 },
      { x: 50, y: 52 },
    ],
  },
  {
    name: 'Harbour Drive',
    major: true,
    points: [
      { x: 19.4, y: 29.2 },
      { x: 24.4, y: 28.4 },
      { x: 29.8, y: 28.6 },
      { x: 33.4, y: 29.4 },
    ],
  },
  {
    name: 'Coast Road',
    major: false,
    points: [
      { x: 16.6, y: 25.6 },
      { x: 15.2, y: 20.4 },
      { x: 16, y: 13.6 },
      { x: 18, y: 7.4 },
      { x: 21, y: 3 },
    ],
  },
  {
    name: 'Airport Link',
    major: false,
    points: [
      { x: 18.6, y: 9.2 },
      { x: 20.6, y: 15.4 },
      { x: 23.6, y: 21.2 },
    ],
  },
  {
    name: 'Arnhem Road',
    major: true,
    points: [
      { x: 39.8, y: 38.6 },
      { x: 46, y: 36.6 },
      { x: 56, y: 36.4 },
      { x: 72, y: 33 },
    ],
  },
  {
    name: 'Springs Road',
    major: false,
    points: [
      { x: 30.4, y: 25.4 },
      { x: 37, y: 26.4 },
      { x: 43.4, y: 27.6 },
      { x: 50, y: 30.6 },
    ],
  },
];

export function distanceKm(a: MapPoint, b: MapPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Places that fall inside a circle, nearest first. */
export function placesWithin(centre: MapPoint, radiusKm: number): MapPlace[] {
  return places
    .filter((p) => distanceKm(p.at, centre) <= radiusKm)
    .sort((a, b) => distanceKm(a.at, centre) - distanceKm(b.at, centre));
}

/** Smooth closed or open path through points (Catmull-Rom converted to cubic Béziers). */
export function smoothPath(points: MapPoint[], closed: boolean): string {
  if (points.length < 2) return '';
  const pts = closed
    ? [points.at(-1)!, ...points, points[0]!, points[1]!]
    : [points[0]!, ...points, points.at(-1)!];
  let d = `M${points[0]!.x},${points[0]!.y}`;
  const segments = closed ? points.length : points.length - 1;
  for (let i = 1; i <= segments; i++) {
    const p0 = pts[i - 1]!;
    const p1 = pts[i]!;
    const p2 = pts[i + 1]!;
    const p3 = pts[i + 2]!;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C${r(c1.x)},${r(c1.y)} ${r(c2.x)},${r(c2.y)} ${r(p2.x)},${r(p2.y)}`;
  }
  return closed ? `${d} Z` : d;
}

const r = (n: number) => Math.round(n * 100) / 100;
