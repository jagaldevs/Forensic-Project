import { useState } from 'react';
import { Logo } from '../brand/Logo';
import { caseCatalogue } from '../cases';
import { useNav } from '../stores/navStore';
import { useProgress } from '../stores/progressStore';
import { useDesktop } from '../stores/desktopStore';
import { useAcademy } from '../stores/academyStore';
import { findMissionMeta, missionCatalogue } from '../missions';
import { useSettings } from '../stores/settingsStore';
import { Button } from '../ui/Button';
import { Badge } from '../ui/StatusBadge';
import { Dialog } from '../ui/Dialog';
import { BackupDialog } from './BackupDialog';
import s from './screens.module.css';

export function CaseSelectScreen() {
  const agentName = useSettings((st) => st.agentName);
  const go = useNav((st) => st.go);
  const openCase = useNav((st) => st.openCase);
  const cases = useProgress((st) => st.cases);
  const [showBackup, setShowBackup] = useState(false);
  const [confirmReset, setConfirmReset] = useState<string | null>(null);
  const academy = useAcademy((st) => st.missions);
  const earned = missionCatalogue.filter((m) => academy[m.id]?.completedAt).length;

  return (
    <main className={s.stage}>
      <div className={s.casesWrap}>
        <header className={s.casesHeader}>
          <div>
            <div className={s.row}>
              <Logo />
              <span className={s.eyebrow}>Case files</span>
            </div>
            <h1 className={s.title}>Welcome, {agentName}</h1>
            <p className={s.small}>Pick a case. Your progress is saved on this device.</p>
          </div>
          <div className={s.row}>
            <Button icon="user" onClick={() => go('agent')}>
              Change codename
            </Button>
            <Button icon="download" onClick={() => setShowBackup(true)}>
              Back up progress
            </Button>
          </div>
        </header>

        <div className={s.caseGrid}>
          {caseCatalogue.map((meta) => {
            const progress = cases[meta.id];
            const status = progress?.submittedAt
              ? 'Report submitted'
              : progress
                ? 'In progress'
                : 'New case';
            return (
              <article key={meta.id} className={s.caseCard} aria-labelledby={`case-${meta.id}`}>
                <div className={s.row}>
                  <Badge tone="accent" icon="clock">
                    About {meta.estimatedMinutes} min
                  </Badge>
                  <Badge tone="info">Year {meta.yearLevel}</Badge>
                  <Badge
                    tone={progress ? 'supports' : 'unassessed'}
                    icon={progress ? 'check' : 'info'}
                  >
                    {status}
                  </Badge>
                </div>
                <h2 id={`case-${meta.id}`}>{meta.title}</h2>
                <p>{meta.tagline}</p>
                <div>
                  <p
                    className={s.small}
                    style={{ fontWeight: 600, marginBottom: 'var(--space-1)' }}
                  >
                    In this case you will learn to:
                  </p>
                  <ul>
                    {meta.learningIntentions.map((li) => (
                      <li key={li}>{li}</li>
                    ))}
                  </ul>
                </div>
                {meta.recommendedMissions?.length ? (
                  <p className={s.small}>
                    <strong>Recommended training:</strong>{' '}
                    {meta.recommendedMissions
                      .map((id) => findMissionMeta(id))
                      .filter((m) => m !== undefined)
                      .map((m) => `${m.title}${academy[m.id]?.completedAt ? ' ✓' : ''}`)
                      .join(', ')}
                  </p>
                ) : null}
                <div className={s.caseFooter}>
                  <Button
                    variant="primary"
                    icon="arrowRight"
                    onClick={() =>
                      openCase(meta.id, progress?.briefingRead ? 'desktop' : 'briefing')
                    }
                  >
                    {progress ? 'Resume case' : 'Open case'}
                  </Button>
                  {progress && (
                    <Button variant="ghost" icon="trash" onClick={() => setConfirmReset(meta.id)}>
                      Start again
                    </Button>
                  )}
                </div>
              </article>
            );
          })}
          <article className={`${s.caseCard} ${s.academyCard}`} aria-labelledby="academy-title">
            <div className={s.row}>
              <Badge tone="accent" icon="academy">
                {missionCatalogue.length} short missions
              </Badge>
              <Badge tone={earned ? 'supports' : 'unassessed'} icon="medal">
                {earned} of {missionCatalogue.length} badges
              </Badge>
            </div>
            <h2 id="academy-title">Training Academy</h2>
            <p>
              New to digital forensics? Learn the tools first: metadata, digital footprints, search
              history, IP addresses, time zones, and privacy.
            </p>
            <div className={s.caseFooter}>
              <Button variant="primary" icon="academy" onClick={() => go('academy')}>
                Enter the academy
              </Button>
            </div>
          </article>
        </div>
      </div>

      {showBackup && <BackupDialog onClose={() => setShowBackup(false)} />}
      {confirmReset && (
        <Dialog
          title="Start this case again?"
          onClose={() => setConfirmReset(null)}
          actions={
            <>
              <Button onClick={() => setConfirmReset(null)}>Keep my work</Button>
              <Button
                variant="primary"
                icon="trash"
                onClick={() => {
                  useProgress.getState().resetCase(confirmReset);
                  if (useDesktop.getState().caseId === confirmReset)
                    useDesktop.setState({ caseId: null, windows: [] });
                  setConfirmReset(null);
                }}
              >
                Start again
              </Button>
            </>
          }
        >
          <p>
            This clears your evidence board, judgements and warrants for this case. Back up your
            progress first if you might want it later.
          </p>
        </Dialog>
      )}
    </main>
  );
}
