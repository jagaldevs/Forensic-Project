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
import { CodeDialog } from './CodeDialog';
import { codeMatches, teacherConfig } from '../config/teacher';
import { Icon } from '../ui/Icon';
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
  const teacherMode = useSettings((st) => st.teacherMode);
  const assessmentAccess = useSettings((st) => st.assessmentAccess);
  const [askTeacherCode, setAskTeacherCode] = useState(false);
  const [askAccessFor, setAskAccessFor] = useState<string | null>(null);

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
            {!teacherMode && (
              <Button variant="ghost" icon="shield" onClick={() => setAskTeacherCode(true)}>
                Teacher
              </Button>
            )}
          </div>
        </header>

        {teacherMode && (
          <section className={s.teacherBar} aria-label="Teacher tools">
            <p>
              <Icon name="shield" size={18} />
              <span>
                <strong>Teacher mode is on.</strong> It is not secure: turn it off before a student
                uses this device.
              </span>
            </p>
            <div className={s.row}>
              <Button variant="primary" icon="report" onClick={() => go('review')}>
                Teacher Review
              </Button>
              <Button icon="close" onClick={() => useSettings.getState().setTeacherMode(false)}>
                Turn off teacher mode
              </Button>
            </div>
          </section>
        )}

        <section className={s.academyBanner} aria-labelledby="academy-title">
          <Icon name="academy" size={22} />
          <div className={s.academyText}>
            <h2 id="academy-title">Training Academy</h2>
            <p>
              New to digital forensics? Short missions on metadata, digital footprints, search
              history, IP addresses, time zones, privacy, and emails and cloud files. Each case
              lists the ones that help.
            </p>
          </div>
          <span className={earned ? s.cardStatusOn : s.small}>
            {earned > 0 && <Icon name="medal" size={14} />}
            {earned} of {missionCatalogue.length} badges
          </span>
          <Button icon="academy" onClick={() => go('academy')}>
            Enter the academy
          </Button>
        </section>

        <div className={s.caseGrid}>
          {caseCatalogue.map((meta) => {
            const progress = cases[meta.id];
            const status = progress?.submittedAt
              ? meta.assessment
                ? 'Submitted'
                : 'Complete'
              : progress
                ? 'In progress'
                : 'New case';
            const needsCode = meta.assessment && !assessmentAccess && !teacherMode;
            const open = () => openCase(meta.id, progress?.briefingRead ? 'desktop' : 'briefing');
            return (
              <article key={meta.id} className={s.caseCard} aria-labelledby={`case-${meta.id}`}>
                <p className={s.cardMeta}>
                  {meta.assessment && <Badge>Assessment</Badge>}
                  <span>
                    {meta.estimatedMinutes} min · Year {meta.yearLevel}
                  </span>
                  <span className={progress ? s.cardStatusOn : undefined}>
                    {progress && <Icon name="check" size={14} />}
                    {status}
                  </span>
                </p>
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
                      .map((m) => `${m.title}${academy[m.id]?.completedAt ? ' (done)' : ''}`)
                      .join(', ')}
                  </p>
                ) : null}
                {meta.assessment && (
                  <p className={s.small}>
                    Work on your own. There are no hints, and you submit your report once.
                  </p>
                )}
                <div className={s.caseFooter}>
                  {needsCode ? (
                    <Button
                      icon="lock"
                      onClick={() => setAskAccessFor(meta.id)}
                      aria-describedby={`case-${meta.id}`}
                    >
                      Enter access code
                    </Button>
                  ) : (
                    <Button icon="arrowRight" onClick={open} aria-describedby={`case-${meta.id}`}>
                      {progress ? 'Resume case' : 'Open case'}
                    </Button>
                  )}
                  {progress && (!meta.assessment || teacherMode) && (
                    <Button
                      variant="ghost"
                      icon="trash"
                      onClick={() => setConfirmReset(meta.id)}
                      aria-describedby={`case-${meta.id}`}
                    >
                      Start again
                    </Button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {showBackup && <BackupDialog onClose={() => setShowBackup(false)} />}
      {askTeacherCode && (
        <CodeDialog
          title="Teacher mode"
          label="Teacher code"
          submitLabel="Turn on teacher mode"
          onClose={() => setAskTeacherCode(false)}
          onSubmit={(code) => {
            if (!codeMatches(code, teacherConfig.teacherCode)) return false;
            useSettings.getState().setTeacherMode(true);
            return true;
          }}
        >
          <p className={s.small} style={{ marginBottom: 'var(--space-4)' }}>
            Teacher mode shows answer keys, teacher notes and drop controls, and opens Teacher
            Review. It is <strong>not secure</strong>, and this device&rsquo;s progress code will
            record that it was used.
          </p>
        </CodeDialog>
      )}
      {askAccessFor && (
        <CodeDialog
          title="Assessment access"
          label="Access code (from your teacher)"
          submitLabel="Unlock assessment"
          onClose={() => setAskAccessFor(null)}
          onSubmit={(code) => {
            if (!codeMatches(code, teacherConfig.assessmentCode)) return false;
            useSettings.getState().grantAssessmentAccess();
            const progress = cases[askAccessFor];
            openCase(askAccessFor, progress?.briefingRead ? 'desktop' : 'briefing');
            return true;
          }}
        />
      )}
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
            This clears your evidence board, judgements and everything else you have done in this
            case. Back up your progress first if you might want it later.
          </p>
        </Dialog>
      )}
    </main>
  );
}
