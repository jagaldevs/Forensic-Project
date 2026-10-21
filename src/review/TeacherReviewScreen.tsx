import { useState } from 'react';
import { Logo } from '../brand/Logo';
import { codeMatches, teacherConfig } from '../config/teacher';
import { findCaseMeta } from '../cases';
import { formatLocalDateTime } from '../engine/format';
import { decodeProgress, type ProgressBackup } from '../lib/progressCode';
import { CodeDialog } from '../screens/CodeDialog';
import { useNav } from '../stores/navStore';
import { useSettings } from '../stores/settingsStore';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { onTabListKeyDown } from '../ui/tabKeys';
import ui from '../ui/ui.module.css';
import s from '../screens/screens.module.css';
import { AcademyReview } from './AcademyReview';
import { CaseReview } from './CaseReview';
import { ClassSummary } from './ClassSummary';
import r from './review.module.css';

/**
 * Teacher Review: paste one student's progress code to see their case reports (with the
 * objective parts auto-scored) and Training Academy work, or paste a whole class's codes for a
 * summary table. Everything is decoded on this device; nothing is uploaded or saved.
 */
export default function TeacherReviewScreen() {
  const go = useNav((st) => st.go);
  const teacherMode = useSettings((st) => st.teacherMode);
  const [askCode, setAskCode] = useState(false);
  const [text, setText] = useState('');
  const [backup, setBackup] = useState<ProgressBackup | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [reviewedAt, setReviewedAt] = useState(0);
  const [mode, setMode] = useState<'one' | 'class'>('one');

  const review = async () => {
    setBusy(true);
    setError(null);
    try {
      setBackup(await decodeProgress(text));
      setReviewedAt(Date.now());
    } catch (e) {
      setBackup(null);
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (!teacherMode)
    return (
      <main className={s.stage}>
        <div className={r.locked}>
          <Icon name="shield" size={40} />
          <h1 className={s.title}>Teacher Review</h1>
          <p>Teacher Review needs teacher mode. Enter the teacher code to continue.</p>
          <div className={s.row}>
            <Button icon="arrowLeft" onClick={() => go('cases')}>
              Back to cases
            </Button>
            <Button variant="primary" icon="unlock" onClick={() => setAskCode(true)}>
              Enter teacher code
            </Button>
          </div>
        </div>
        {askCode && (
          <CodeDialog
            title="Teacher mode"
            label="Teacher code"
            submitLabel="Turn on teacher mode"
            onClose={() => setAskCode(false)}
            onSubmit={(code) => {
              if (!codeMatches(code, teacherConfig.teacherCode)) return false;
              useSettings.getState().setTeacherMode(true);
              return true;
            }}
          />
        )}
      </main>
    );

  const caseIds = backup ? Object.keys(backup.cases) : [];
  const modes = [
    { id: 'one', label: 'One student' },
    { id: 'class', label: 'Whole class' },
  ] as const;

  return (
    <div className={r.page}>
      <div className={r.toolbar}>
        <Button icon="arrowLeft" onClick={() => go('cases')}>
          Back to cases
        </Button>
        {(mode === 'class' || backup) && (
          <Button variant="primary" icon="print" onClick={() => window.print()}>
            Print or save as PDF
          </Button>
        )}
      </div>

      <div className={r.modeTabs} role="tablist" aria-label="Review" onKeyDown={onTabListKeyDown}>
        {modes.map((m) => (
          <button
            key={m.id}
            type="button"
            role="tab"
            id={`review-tab-${m.id}`}
            aria-selected={mode === m.id}
            tabIndex={mode === m.id ? 0 : -1}
            aria-controls="review-panel"
            className={r.modeTab}
            onClick={() => setMode(m.id)}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div id="review-panel" role="tabpanel" aria-labelledby={`review-tab-${mode}`}>
        {/* Kept mounted while hidden, so the class table survives opening one student. */}
        <div hidden={mode !== 'class'}>
          <ClassSummary
            onOpen={(b) => {
              setBackup(b);
              setText('');
              setError(null);
              setReviewedAt(Date.now());
              setMode('one');
            }}
          />
        </div>
        {mode === 'one' && (
          <>
            <section className={r.intake} aria-labelledby="review-title">
              <div className={s.row}>
                <Logo />
                <span className={s.eyebrow}>Teacher Review</span>
              </div>
              <h1 id="review-title" className={s.title}>
                Review a student&rsquo;s work
              </h1>
              <p className={s.small}>
                Paste one student&rsquo;s progress code (from <strong>Back up progress</strong>). It
                is read on this device only: nothing is uploaded, and it doesn&rsquo;t change
                anything saved here.
              </p>
              <label className={ui.label} htmlFor="review-code">
                Student&rsquo;s progress code
              </label>
              <textarea
                id="review-code"
                className={`${ui.textarea} ${ui.mono}`}
                rows={4}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="HRSFL1.…"
              />
              <div className={s.row}>
                <Button
                  variant="primary"
                  icon="search"
                  onClick={review}
                  disabled={!text.trim() || busy}
                >
                  {busy ? 'Reading…' : 'Review this code'}
                </Button>
                {backup && (
                  <Button
                    icon="close"
                    onClick={() => {
                      setBackup(null);
                      setText('');
                    }}
                  >
                    Clear
                  </Button>
                )}
              </div>
              {error && (
                <p role="alert" className={r.error}>
                  <Icon name="alert" size={16} /> {error}
                </p>
              )}
            </section>

            {backup && (
              <article
                className={r.sheet}
                aria-label={`Work by ${backup.agentName || 'a student'}`}
              >
                <header className={r.sheetHeader}>
                  <h2>{backup.agentName || 'Unnamed agent'}</h2>
                  <p className={s.small}>Reviewed {formatLocalDateTime(reviewedAt)}</p>
                  {backup.teacherModeUsedAt && (
                    <p className={r.warning}>
                      <Icon name="alert" size={18} />
                      <span>
                        Teacher mode was turned on on this student&rsquo;s device on{' '}
                        {formatLocalDateTime(backup.teacherModeUsedAt)}. They may have seen answer
                        keys.
                      </span>
                    </p>
                  )}
                </header>

                {caseIds.length === 0 && <p className={r.empty}>No cases started.</p>}
                {caseIds.map((id) =>
                  findCaseMeta(id) ? (
                    <CaseReview key={id} caseId={id} progress={backup.cases[id]!} />
                  ) : (
                    <p key={id} className={r.empty}>
                      Progress for a case this version of the lab doesn&rsquo;t have ({id}).
                    </p>
                  ),
                )}

                <AcademyReview academy={backup.academy} />
              </article>
            )}
          </>
        )}
      </div>
    </div>
  );
}
