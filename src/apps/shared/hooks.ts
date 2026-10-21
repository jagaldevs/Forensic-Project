import { useCaseFile } from '../../app/CaseContext';
import { useCaseProgress } from '../../stores/progressStore';
import { useDesktop } from '../../stores/desktopStore';
import { desktopAppIds, type DesktopAppId } from '../../desktop/appMeta';
import type { Evidence } from '../../engine/types';

/** The current case and the student's progress in it. */
export function useCaseState() {
  const c = useCaseFile();
  const progress = useCaseProgress(c.meta.id);
  return { c, progress, caseId: c.meta.id };
}

/** The desktop app that displays an evidence item (falls back to the Evidence Locker). */
export function appFor(item: Evidence): DesktopAppId {
  return (desktopAppIds as readonly string[]).includes(item.app)
    ? (item.app as DesktopAppId)
    : 'locker';
}

/** Opens the right app with the item selected. */
export function openEvidence(item: Evidence) {
  useDesktop.getState().open(appFor(item), { selected: item.id });
}
