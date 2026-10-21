import { useEffect } from 'react';
import { useCaseFile } from '../app/CaseContext';
import { dueDrops } from '../engine/drops';
import { useProgress } from '../stores/progressStore';
import { releaseDrop } from './releaseDrop';

/** Releases evidence drops when their triggers fire, and announces them. */
export function DropWatcher() {
  const c = useCaseFile();

  useEffect(() => {
    const tick = () => {
      const progress = useProgress.getState().cases[c.meta.id];
      if (!progress || progress.locked) return;
      for (const drop of dueDrops(c, progress)) releaseDrop(c, drop);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [c]);

  return null;
}
