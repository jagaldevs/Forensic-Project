/**
 * Rough travel-time estimates on the shared map. Deliberately simple and transparent, so
 * students can see how the estimate is made: straight-line distance × a road factor, at a
 * range of typical speeds, plus waiting time for buses.
 */
import type { MapPoint } from '../types';
import { distanceKm } from './region';

export type TravelMode = 'walk' | 'cycle' | 'bus' | 'car';

/** Roads are never straight: real routes are usually about 30% longer than a straight line. */
export const ROAD_FACTOR = 1.3;

export const travelModes: Record<
  TravelMode,
  { label: string; speedKmh: [number, number]; extraMinutes: [number, number]; extraNote?: string }
> = {
  walk: { label: 'Walking', speedKmh: [4.5, 5.5], extraMinutes: [0, 0] },
  cycle: { label: 'Bike or scooter', speedKmh: [12, 18], extraMinutes: [0, 0] },
  bus: {
    label: 'Bus',
    speedKmh: [18, 25],
    extraMinutes: [3, 15],
    extraNote: 'includes waiting at the stop',
  },
  car: { label: 'Car', speedKmh: [30, 45], extraMinutes: [1, 4], extraNote: 'includes parking' },
};

export interface TravelEstimate {
  straightKm: number;
  roadKm: number;
  /** Fastest and slowest likely times, in whole minutes. */
  minMinutes: number;
  maxMinutes: number;
}

export function travelEstimate(from: MapPoint, to: MapPoint, mode: TravelMode): TravelEstimate {
  const straightKm = distanceKm(from, to);
  const roadKm = straightKm * ROAD_FACTOR;
  const { speedKmh, extraMinutes } = travelModes[mode];
  return {
    straightKm,
    roadKm,
    minMinutes: Math.round((roadKm / speedKmh[1]) * 60 + extraMinutes[0]),
    maxMinutes: Math.round((roadKm / speedKmh[0]) * 60 + extraMinutes[1]),
  };
}
