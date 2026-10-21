import type { ReactNode } from 'react';
import type { Evidence } from '../../engine/types';
import { supportLevelOf } from '../../engine/progressTypes';
import { useSettings } from '../../stores/settingsStore';
import { Icon } from '../../ui/Icon';
import { HashLine } from './HashLine';
import { useCaseState } from './hooks';
import { PinButton } from './PinButton';
import s from './shared.module.css';

/**
 * Title, source, hash and pin button shared by every evidence view, plus the Guided level's
 * "What this means" note and teacher notes.
 */
export function EvidenceHeader({ item, children }: { item: Evidence; children?: ReactNode }) {
  const teacherMode = useSettings((st) => st.teacherMode);
  const { progress } = useCaseState();
  // Teachers see Guided notes too, so they know what Guided students are told.
  const showGuided = !!item.guided && (supportLevelOf(progress) === 'guided' || teacherMode);
  return (
    <div className={s.evHeader}>
      <div className={s.evTitleRow}>
        <div>
          <h3 className={s.evTitle}>{item.title}</h3>
          <p className={s.evSource}>
            <Icon name="info" size={14} /> {item.source}
          </p>
        </div>
        <div className={s.evActions}>
          {children}
          <PinButton evidenceId={item.id} />
        </div>
      </div>
      <HashLine item={item} />
      {showGuided && (
        <aside className={s.guided} aria-label="What this means">
          <Icon name="info" size={16} />
          <p>
            <span className={s.guidedLabel}>What this means: </span>
            {item.guided}
          </p>
        </aside>
      )}
      {teacherMode && item.teacherNote && (
        <aside className={s.teacherNote} aria-label="Teacher note">
          <Icon name="shield" size={16} />
          <p>
            <span className={s.teacherNoteLabel}>Teacher note: </span>
            {item.teacherNote}
          </p>
        </aside>
      )}
    </div>
  );
}
