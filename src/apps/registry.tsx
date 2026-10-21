import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import type { DesktopAppId } from '../desktop/appMeta';

export interface AppProps {
  /** Window params, e.g. { selected: 'photo-foyer-witness' }. */
  params: Record<string, string>;
}

/** Each app is its own chunk, loaded the first time its window opens. */
export const appComponents: Record<DesktopAppId, LazyExoticComponent<ComponentType<AppProps>>> = {
  brief: lazy(() => import('./brief/BriefApp')),
  locker: lazy(() => import('./locker/LockerApp')),
  photos: lazy(() => import('./photos/PhotosApp')),
  iplookup: lazy(() => import('./iplookup/IpLookupApp')),
  netlog: lazy(() => import('./netlog/NetworkLogApp')),
  board: lazy(() => import('./board/EvidenceBoardApp')),
  judgements: lazy(() => import('./judgements/JudgementsApp')),
};
