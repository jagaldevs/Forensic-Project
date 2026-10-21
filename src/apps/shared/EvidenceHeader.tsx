import type { ReactNode } from 'react';
import type { Evidence } from '../../engine/types';
import { Icon } from '../../ui/Icon';
import { HashLine } from './HashLine';
import { PinButton } from './PinButton';
import s from './shared.module.css';

/** Title, source, hash and pin button shared by every evidence view. */
export function EvidenceHeader({ item, children }: { item: Evidence; children?: ReactNode }) {
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
    </div>
  );
}
