import { useCaseFile } from '../app/CaseContext';
import { collectedEvidence, isLocked } from '../engine/availability';
import { isQuestionDone } from '../engine/progressTypes';
import { playSound } from '../lib/sound';
import { topWindowId, useCaseWindows, useDesktop } from '../stores/desktopStore';
import { useNav } from '../stores/navStore';
import { useCaseProgress } from '../stores/progressStore';
import { useSettings } from '../stores/settingsStore';
import { Icon } from '../ui/Icon';
import { appMeta, appsForCase, type DesktopAppId } from './appMeta';
import s from './desktop.module.css';

export function Dock() {
  const c = useCaseFile();
  const progress = useCaseProgress(c.meta.id);
  const windows = useCaseWindows(c.meta.id);
  const go = useNav((st) => st.go);
  const activeId = topWindowId(windows);
  const teacherMode = useSettings((st) => st.teacherMode);
  const apps: DesktopAppId[] = [...appsForCase(c), ...(teacherMode ? ['teacher' as const] : [])];

  const visible = collectedEvidence(c, progress);
  const badgeFor = (
    id: DesktopAppId,
  ): { text: string; lock?: boolean; muted?: boolean; label: string } | null => {
    if (id === 'judgements') {
      const done = c.questions.filter((q) => isQuestionDone(progress, q)).length;
      return {
        text: `${done}/${c.questions.length}`,
        muted: true,
        label: `${done} of ${c.questions.length} done`,
      };
    }
    if (id === 'board') {
      const n = Object.keys(progress.board).length;
      return n ? { text: String(n), muted: true, label: `${n} pinned` } : null;
    }
    const items = visible.filter((e) => e.app === id);
    if (items.length && items.every((e) => isLocked(e, c, progress)))
      return { text: '', lock: true, muted: true, label: 'locked' };
    const unseen = items.filter((e) => !progress.viewed[e.id] && !isLocked(e, c, progress)).length;
    return unseen ? { text: String(unseen), label: `${unseen} new` } : null;
  };

  const launch = (id: DesktopAppId) => {
    const st = useDesktop.getState();
    const win = st.windows.find((w) => w.id === id);
    // Clicking the front window's icon minimises it, like a real dock.
    if (win && !win.minimised && activeId === id) {
      st.minimise(id);
      playSound('close');
    } else {
      st.open(id);
      playSound('open');
    }
  };

  return (
    <nav className={s.dock} aria-label="Evidence apps">
      <div className={s.dockInner}>
        {apps.map((id) => {
          const meta = appMeta[id];
          const win = windows.find((w) => w.id === id);
          const badge = badgeFor(id);
          return (
            <button
              key={id}
              type="button"
              className={`${s.dockButton} ${win ? s.dockOpen : ''} ${activeId === id ? s.dockActive : ''}`}
              onClick={() => launch(id)}
              data-dock-app={id}
              aria-label={`${meta.title}${badge ? `, ${badge.label}` : ''}${win ? ', open' : ''}`}
            >
              <Icon name={meta.icon} />
              <span>{meta.dockLabel}</span>
              {badge && (
                <span
                  className={`${s.dockBadge} ${badge.muted ? s.dockBadgeMuted : ''}`}
                  aria-hidden="true"
                >
                  {badge.lock ? <Icon name="lock" size={12} /> : badge.text}
                </span>
              )}
            </button>
          );
        })}
        <span className={s.dockDivider} aria-hidden="true" />
        <button
          type="button"
          className={`${s.dockButton} ${s.dockReport}`}
          onClick={() => go('report')}
        >
          <Icon name="report" />
          <span>Report</span>
        </button>
      </div>
    </nav>
  );
}
