import { useState } from 'react';
import { useCaseFile } from '../app/CaseContext';
import { Logo } from '../brand/Logo';
import { brand } from '../brand/brand';
import { accessWording } from '../engine/accessWording';
import { warrantsRemaining } from '../engine/availability';
import { supportLevelOf } from '../engine/progressTypes';
import { playSound } from '../lib/sound';
import { BackupDialog } from '../screens/BackupDialog';
import { useNav } from '../stores/navStore';
import { useCaseProgress, useProgress } from '../stores/progressStore';
import { useSettings } from '../stores/settingsStore';
import { useTour } from '../stores/tourStore';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { supportLevelInfo } from '../ui/labels';
import { SupportLevelPicker } from '../ui/SupportLevelPicker';
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
  const [showLevel, setShowLevel] = useState(false);
  const level = supportLevelOf(progress);
  const levelInfo = supportLevelInfo(level, !!c.meta.assessment);
  const warrants = warrantsRemaining(c, progress);
  const access = accessWording(c);

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
      <button
        type="button"
        className={`${s.chip} ${s.chipButton}`}
        onClick={() => setShowLevel(true)}
        aria-label={`Support level: ${levelInfo.label}. Change`}
      >
        <Icon name={levelInfo.icon} size={14} />
        <strong className={s.hideNarrow}>{levelInfo.label}</strong>
      </button>
      <span className={s.chip} title={access.chipTitle}>
        <Icon name="warrant" size={14} />
        {access.chip}: <strong>{warrants}</strong>
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
          icon="question"
          label="Show the desktop tour"
          onClick={() => useTour.getState().start()}
        />
        <Button
          size="small"
          variant="ghost"
          icon="download"
          label="Back up progress"
          onClick={() => setShowBackup(true)}
        />
        <Button
          size="small"
          variant="ghost"
          icon="report"
          aria-label="Report"
          onClick={() => go('report')}
        >
          <span className={s.hideNarrow}>Report</span>
        </Button>
        <Button size="small" variant="ghost" icon="exit" label="Leave case" onClick={exitCase} />
      </div>
      {showBackup && <BackupDialog onClose={() => setShowBackup(false)} />}
      {showLevel && (
        <Dialog
          title="Support level"
          onClose={() => setShowLevel(false)}
          actions={
            <Button variant="primary" onClick={() => setShowLevel(false)} data-autofocus>
              Done
            </Button>
          }
        >
          <SupportLevelPicker
            value={level}
            onChange={(l) => useProgress.getState().setSupportLevel(c.meta.id, l)}
            assessment={!!c.meta.assessment}
            disabled={!!progress.locked}
          />
        </Dialog>
      )}
    </header>
  );
}
