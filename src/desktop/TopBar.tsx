import { useState } from 'react';
import { useCaseFile } from '../app/CaseContext';
import { Logo } from '../brand/Logo';
import { brand } from '../brand/brand';
import { warrantsRemaining } from '../engine/availability';
import { playSound } from '../lib/sound';
import { BackupDialog } from '../screens/BackupDialog';
import { useNav } from '../stores/navStore';
import { useCaseProgress } from '../stores/progressStore';
import { useSettings } from '../stores/settingsStore';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import s from './desktop.module.css';

const scaleLabels: Record<number, string> = { 1: 'normal', 1.125: 'large', 1.25: 'larger' };

export function TopBar() {
  const c = useCaseFile();
  const progress = useCaseProgress(c.meta.id);
  const { agentName, muted, textScale, toggleMuted, cycleTextScale, teacherMode } = useSettings();
  const go = useNav((st) => st.go);
  const exitCase = useNav((st) => st.exitCase);
  const [showBackup, setShowBackup] = useState(false);
  const warrants = warrantsRemaining(c, progress);

  return (
    <header className={s.topbar}>
      <Logo />
      <div className={s.topbarTitle}>
        <strong className={s.hideNarrow}>{brand.labName}</strong>
        <span className={s.topbarCase}>{c.meta.title}</span>
      </div>
      <div className={s.topbarSpacer} />
      <span className={`${s.chip} ${s.hideNarrow}`}>
        <Icon name="user" size={14} />
        <strong>{agentName}</strong>
      </span>
      {teacherMode && (
        <span
          className={`${s.chip} ${s.teacherChip}`}
          title="Teacher mode is on. It is not secure."
        >
          <Icon name="shield" size={14} />
          <strong>Teacher mode</strong>
          <span className={s.hideNarrow}>· not secure</span>
        </span>
      )}
      {progress.locked && (
        <span className={s.chip} title="This assessment has been submitted and can't be changed.">
          <Icon name="lock" size={14} />
          <strong>Submitted</strong>
        </span>
      )}
      <span className={s.chip} title="Warrants you can still use in this case">
        <Icon name="warrant" size={14} />
        Warrants: <strong>{warrants}</strong>
      </span>
      <div className={s.topbarTools}>
        <Button
          size="small"
          variant="ghost"
          icon="textsize"
          label={`Text size: ${scaleLabels[textScale]}. Change text size`}
          onClick={cycleTextScale}
        />
        <Button
          size="small"
          variant="ghost"
          icon={muted ? 'mute' : 'volume'}
          label={muted ? 'Sound is off. Turn sound on' : 'Sound is on. Turn sound off'}
          aria-pressed={!muted}
          onClick={() => {
            toggleMuted();
            playSound('pin'); // a quiet click to confirm sound is on (silent when muting)
          }}
        />
        <Button
          size="small"
          variant="ghost"
          icon="download"
          label="Back up progress"
          onClick={() => setShowBackup(true)}
        />
        <Button size="small" variant="ghost" icon="report" onClick={() => go('report')}>
          <span className={s.hideNarrow}>Report</span>
        </Button>
        <Button size="small" variant="ghost" icon="exit" label="Leave case" onClick={exitCase} />
      </div>
      {showBackup && <BackupDialog onClose={() => setShowBackup(false)} />}
    </header>
  );
}
