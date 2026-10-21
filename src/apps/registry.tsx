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
  messages: lazy(() => import('./messages/MessagesApp')),
  email: lazy(() => import('./email/EmailApp')),
  browser: lazy(() => import('./browser/BrowserApp')),
  drive: lazy(() => import('./drive/DriveApp')),
  wearables: lazy(() => import('./wearables/WearablesApp')),
  social: lazy(() => import('./social/SocialApp')),
  photos: lazy(() => import('./photos/PhotosApp')),
  cctv: lazy(() => import('./cctv/CctvApp')),
  iplookup: lazy(() => import('./iplookup/IpLookupApp')),
  netlog: lazy(() => import('./netlog/NetworkLogApp')),
  map: lazy(() => import('./map/MapApp')),
  timeline: lazy(() => import('./timeline/TimelineApp')),
  board: lazy(() => import('./board/EvidenceBoardApp')),
  judgements: lazy(() => import('./judgements/JudgementsApp')),
  teacher: lazy(() => import('./teacher/TeacherApp')),
};
