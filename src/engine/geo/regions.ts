import type { CaseFile } from '../types';
import { darwin } from './darwin';
import { litchfield } from './litchfield';
import type { MapRegion, MapRegionId } from './region';

export const regions: Record<MapRegionId, MapRegion> = { darwin, litchfield };

/** The map a case uses (the Darwin region unless the case says otherwise). */
export function regionFor(c: Pick<CaseFile, 'map'>): MapRegion {
  return regions[c.map ?? 'darwin'];
}
