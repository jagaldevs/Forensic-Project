import { useId } from 'react';
import { supportLevels, type SupportLevel } from '../engine/progressTypes';
import { Icon } from './Icon';
import { supportLevelInfo } from './labels';
import s from './ui.module.css';

interface SupportLevelPickerProps {
  value: SupportLevel;
  onChange: (level: SupportLevel) => void;
  assessment?: boolean;
  disabled?: boolean;
}

/** Guided / Standard / Deep dive. Same case and questions at every level; only support differs. */
export function SupportLevelPicker({
  value,
  onChange,
  assessment,
  disabled,
}: SupportLevelPickerProps) {
  const name = useId();
  return (
    <fieldset className={s.levels} disabled={disabled}>
      <legend className={s.label}>How much support would you like?</legend>
      <div className={s.levelChoices}>
        {supportLevels.map((level) => {
          const info = supportLevelInfo(level, assessment);
          return (
            <label key={level} className={s.levelChoice}>
              <input
                type="radio"
                name={name}
                value={level}
                checked={value === level}
                onChange={() => onChange(level)}
              />
              <span className={s.levelBody}>
                <span className={s.levelLabel}>
                  <Icon name={info.icon} size={18} />
                  {info.label}
                </span>
                <span className={s.levelDesc}>{info.description}</span>
              </span>
            </label>
          );
        })}
      </div>
      <p className={s.levelNote}>
        Everyone gets the same evidence and questions. You can change this at any time from the top
        bar.
      </p>
    </fieldset>
  );
}
