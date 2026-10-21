import type { CaseFile } from '../engine/types';
import type { IconName } from '../ui/Icon';

/** Apps available on the desktop dock. Components are registered in src/apps/registry.tsx. */
export const desktopAppIds = [
  'brief',
  'locker',
  'messages',
  'email',
  'social',
  'browser',
  'drive',
  'photos',
  'wearables',
  'cctv',
  'iplookup',
  'netlog',
  'map',
  'timeline',
  'board',
  'judgements',
  'teacher',
] as const;
export type DesktopAppId = (typeof desktopAppIds)[number];

export interface DesktopAppMeta {
  title: string;
  /** Short label under the dock icon. */
  dockLabel: string;
  icon: IconName;
  width: number;
  height: number;
}

export const appMeta: Record<DesktopAppId, DesktopAppMeta> = {
  brief: { title: 'Case Brief', dockLabel: 'Brief', icon: 'brief', width: 620, height: 560 },
  locker: {
    title: 'Evidence Locker',
    dockLabel: 'Locker',
    icon: 'locker',
    width: 760,
    height: 560,
  },
  messages: { title: 'Messages', dockLabel: 'Messages', icon: 'chat', width: 760, height: 600 },
  email: { title: 'Email', dockLabel: 'Email', icon: 'mail', width: 900, height: 620 },
  browser: {
    title: 'Browser & Search History',
    dockLabel: 'History',
    icon: 'search',
    width: 860,
    height: 600,
  },
  drive: { title: 'Cloud Drive', dockLabel: 'Drive', icon: 'folder', width: 940, height: 640 },
  wearables: {
    title: 'Wearables & Smart Home',
    dockLabel: 'Devices',
    icon: 'pulse',
    width: 940,
    height: 640,
  },
  social: { title: 'Social Feed', dockLabel: 'Social', icon: 'feed', width: 820, height: 640 },
  photos: { title: 'Photos', dockLabel: 'Photos', icon: 'photos', width: 900, height: 600 },
  cctv: { title: 'CCTV Viewer', dockLabel: 'CCTV', icon: 'camera', width: 860, height: 600 },
  iplookup: { title: 'IP Lookup', dockLabel: 'IP Lookup', icon: 'globe', width: 900, height: 620 },
  netlog: { title: 'Network Log', dockLabel: 'Network', icon: 'router', width: 860, height: 560 },
  map: { title: 'Map', dockLabel: 'Map', icon: 'map', width: 960, height: 640 },
  timeline: {
    title: 'Timeline',
    dockLabel: 'Timeline',
    icon: 'timeline',
    width: 900,
    height: 640,
  },
  board: { title: 'Evidence Board', dockLabel: 'Board', icon: 'board', width: 1080, height: 680 },
  judgements: {
    title: 'Judgements',
    dockLabel: 'Judgements',
    icon: 'gavel',
    width: 760,
    height: 640,
  },
  teacher: {
    title: 'Teacher Panel',
    dockLabel: 'Teacher',
    icon: 'shield',
    width: 820,
    height: 640,
  },
};

const alwaysShown: DesktopAppId[] = ['brief', 'locker', 'board', 'judgements'];

/**
 * The apps a case needs: the core four, plus any app that shows one of its evidence items,
 * the Map if it has map pins, and the Timeline if any evidence is timed. Cases never list
 * apps by hand, so a new case automatically gets the right dock.
 */
export function appsForCase(c: CaseFile): DesktopAppId[] {
  const needed = new Set<DesktopAppId>(alwaysShown);
  for (const e of c.evidence) {
    // The Teacher Panel is added by the dock in teacher mode, never by a case.
    if ((desktopAppIds as readonly string[]).includes(e.app)) needed.add(e.app as DesktopAppId);
    if (e.timeline?.length) needed.add('timeline');
  }
  if (c.mapMarkers.length) needed.add('map');
  return desktopAppIds.filter((id) => needed.has(id));
}
