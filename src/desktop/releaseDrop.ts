import type { CaseFile, Drop } from '../engine/types';
import { playSound } from '../lib/sound';
import { useProgress } from '../stores/progressStore';
import { useToasts } from '../stores/toastStore';
import { desktopAppIds, type DesktopAppId } from './appMeta';

/** Releases a drop and announces it (used by the drop watcher and the teacher's controls). */
export function releaseDrop(c: CaseFile, drop: Drop) {
  useProgress.getState().releaseDrop(c.meta.id, drop.id);
  const first = c.evidence.find((e) => e.releasedBy === drop.id);
  const appId = desktopAppIds.find((a) => a === first?.app) as DesktopAppId | undefined;
  useToasts.getState().push({
    title: drop.title,
    body: drop.notification,
    icon: 'bell',
    action: first
      ? { label: 'Take a look', appId: appId ?? 'locker', params: { selected: first.id } }
      : undefined,
  });
  playSound('drop');
}
