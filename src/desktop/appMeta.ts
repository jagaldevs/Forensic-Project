import type { IconName } from '../ui/Icon';

/** Apps available on the desktop dock. Components are registered in src/apps/registry.tsx. */
export const desktopAppIds = [
  'brief',
  'locker',
  'photos',
  'iplookup',
  'netlog',
  'board',
  'judgements',
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
  photos: { title: 'Photos', dockLabel: 'Photos', icon: 'photos', width: 900, height: 600 },
  iplookup: { title: 'IP Lookup', dockLabel: 'IP Lookup', icon: 'globe', width: 900, height: 620 },
  netlog: { title: 'Network Log', dockLabel: 'Network', icon: 'router', width: 860, height: 560 },
  board: { title: 'Evidence Board', dockLabel: 'Board', icon: 'board', width: 1080, height: 680 },
  judgements: {
    title: 'Judgements',
    dockLabel: 'Judgements',
    icon: 'gavel',
    width: 760,
    height: 640,
  },
};
