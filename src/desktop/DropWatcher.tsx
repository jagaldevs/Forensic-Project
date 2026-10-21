import { useEffect } from 'react';
import { useCaseFile } from '../app/CaseContext';
import { dueDrops } from '../engine/drops';
import { playSound } from '../lib/sound';
import { useProgress } from '../stores/progressStore';
import { useToasts } from '../stores/toastStore';
import type { DesktopAppId } from './appMeta';
import { desktopAppIds } from './appMeta';

/** Releases evidence drops when their triggers fire, and announces them. */
export function DropWatcher() {
  const c = useCaseFile();

  useEffect(() => {
    const tick = () => {
      const progress = useProgress.getState().cases[c.meta.id];
      if (!progress) return;
      for (const drop of dueDrops(c, progress)) {
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
        playSound('notify');
      }
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [c]);

  return null;
}
