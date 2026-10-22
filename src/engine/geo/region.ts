/**
 * Illustrated maps, drawn in SVG with kilometre units so distances, travel times and accuracy
 * radii are to scale. No map tiles or external requests.
 *
 * Each region is plain data (see `darwin.ts`, `litchfield.ts`). Shapes are written as latitude
 * and longitude from general geographic knowledge, simplified and hand-placed: good enough to
 * be recognisable and to keep distances right to within a few hundred metres, not survey data.
 */
import type { MapPoint } from '../types';

export type MapRegionId = 'darwin' | 'litchfield';

export interface MapPlace {
  id: string;
  name: string;
  at: MapPoint;
  size: 'major' | 'minor';
  /** Only labelled when zoomed in (the whole-region view would be too crowded). */
  detail?: boolean;
  /** Which side of the dot the name goes. Default: right. */
  labelSide?: 'left' | 'right';
}

export interface MapRoad {
  name: string;
  major: boolean;
  points: MapPoint[];
}

export interface MapArea {
  name: string;
  points: MapPoint[];
}

export interface MapLabel {
  text: string;
  at: MapPoint;
  /** Degrees, for labels that follow a river or an arm of the sea. */
  rotate?: number;
  /** A name on land (a range, a park) rather than on water. Default: water. */
  onLand?: boolean;
}

export interface MapRegion {
  id: MapRegionId;
  /** e.g. "the Darwin region", used in descriptions. */
  name: string;
  widthKm: number;
  heightKm: number;
  /** Closed land shapes (the sea is everything else). Smoothed into curves when drawn. */
  land: MapPoint[][];
  /** Water drawn over land: marinas, lakes, plunge pools. */
  water: MapPoint[][];
  /** National parks and reserves (pale green). */
  parks: MapArea[];
  /** Rivers and creeks, drawn as blue lines. */
  rivers: MapRoad[];
  roads: MapRoad[];
  /** Airport runways, drawn as straight bars. */
  runways: [MapPoint, MapPoint][];
  places: MapPlace[];
  /** Names of bays, harbours and parks. Only shown on the whole-region view. */
  labels: MapLabel[];
}

/** A window onto a map, in kilometres. */
export interface MapView {
  x: number;
  y: number;
  w: number;
  h: number;
}

const KM_PER_DEGREE_LAT = 110.6;

/**
 * Converts latitude and longitude (degrees, south negative) into map kilometres measured from
 * the region's top-left corner. An equirectangular projection is accurate to well under 1%
 * across a region this small.
 */
export function projection(topLat: number, leftLon: number, midLat: number) {
  const kmPerDegreeLon = 111.32 * Math.cos((midLat * Math.PI) / 180);
  return (lat: number, lon: number): MapPoint => ({
    x: round((lon - leftLon) * kmPerDegreeLon),
    y: round((topLat - lat) * KM_PER_DEGREE_LAT),
  });
}

export function fullView(region: MapRegion): MapView {
  return { x: 0, y: 0, w: region.widthKm, h: region.heightKm };
}

/** The smallest view (keeping the map's shape) that shows every point with some margin. */
export function viewAround(
  region: MapRegion,
  points: MapPoint[],
  marginKm = 1.5,
  minWidthKm = 8,
): MapView {
  if (!points.length) return fullView(region);
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const aspect = region.heightKm / region.widthKm;
  let w = Math.max(minWidthKm, Math.max(...xs) - Math.min(...xs) + marginKm * 2);
  const h0 = Math.max(...ys) - Math.min(...ys) + marginKm * 2;
  if (h0 > w * aspect) w = h0 / aspect;
  const h = w * aspect;
  const cx = (Math.max(...xs) + Math.min(...xs)) / 2;
  const cy = (Math.max(...ys) + Math.min(...ys)) / 2;
  return { x: cx - w / 2, y: cy - h / 2, w, h };
}

export function distanceKm(a: MapPoint, b: MapPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Places that fall inside a circle, nearest first. */
export function placesWithin(region: MapRegion, centre: MapPoint, radiusKm: number): MapPlace[] {
  return region.places
    .filter((p) => distanceKm(p.at, centre) <= radiusKm)
    .sort((a, b) => distanceKm(a.at, centre) - distanceKm(b.at, centre));
}

/** Is a point inside a closed shape? (Ray casting on the unsmoothed points.) */
export function insideShape(p: MapPoint, shape: MapPoint[]): boolean {
  let inside = false;
  for (let i = 0, j = shape.length - 1; i < shape.length; j = i++) {
    const a = shape[i]!;
    const b = shape[j]!;
    if (a.y > p.y !== b.y > p.y && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x)
      inside = !inside;
  }
  return inside;
}

/** On land: inside a land shape and not in water drawn over it. */
export function onLand(region: MapRegion, p: MapPoint): boolean {
  return region.land.some((s) => insideShape(p, s)) && !region.water.some((s) => insideShape(p, s));
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
    d += ` C${round(c1.x)},${round(c1.y)} ${round(c2.x)},${round(c2.y)} ${round(p2.x)},${round(p2.y)}`;
  }
  return closed ? `${d} Z` : d;
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}
