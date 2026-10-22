import { useState } from 'react';
import { warrantsRemaining } from '../../engine/availability';
import { accessWording } from '../../engine/accessWording';
import { formatLocalDateTime } from '../../engine/format';
import type { DropTrigger } from '../../engine/types';
import { releaseDrop } from '../../desktop/releaseDrop';
import { useDesktop } from '../../stores/desktopStore';
import { useProgress } from '../../stores/progressStore';
import { Button } from '../../ui/Button';
import { Dialog } from '../../ui/Dialog';
import { Icon } from '../../ui/Icon';
import { Badge } from '../../ui/StatusBadge';
import { onTabListKeyDown } from '../../ui/tabKeys';
import type { AppProps } from '../registry';
import { useCaseState } from '../shared/hooks';
import { QuestionKey } from './QuestionKey';
import { PresenterView } from './PresenterView';
import t from './teacher.module.css';

const tabs = [
  { id: 'key', label: 'Answer key' },
  { id: 'drops', label: 'Evidence drops' },
  { id: 'controls', label: 'Case controls' },
] as const;
type TabId = (typeof tabs)[number]['id'];

/**
 * Teacher mode only. Answer key, drop controls and resets. NOT secure: a student who knows
 * the code (or reads the app's code) can open this.
 */
export default function TeacherApp({ params }: AppProps) {
  const tab: TabId = tabs.some((x) => x.id === params.tab) ? (params.tab as TabId) : 'key';
  const setTab = (id: TabId) => useDesktop.getState().setParams('teacher', { tab: id });

  return (
    <div className={t.app}>
      <p className={t.banner}>
        <Icon name="shield" size={16} />
        <span>
          Teacher mode is on. It is <strong>not secure</strong>: turn it off before handing the
          device to a student.
        </span>
      </p>
      <div
        className={t.tabs}
        role="tablist"
        aria-label="Teacher tools"
        onKeyDown={onTabListKeyDown}
      >
        {tabs.map((x) => (
          <button
            key={x.id}
            type="button"
            role="tab"
            id={`teacher-tab-${x.id}`}
            aria-selected={tab === x.id}
            tabIndex={tab === x.id ? 0 : -1}
            aria-controls="teacher-panel"
            className={t.tab}
            onClick={() => setTab(x.id)}
          >
            {x.label}
          </button>
        ))}
      </div>
      <div
        id="teacher-panel"
        role="tabpanel"
        aria-labelledby={`teacher-tab-${tab}`}
        className={t.panel}
      >
        {tab === 'key' && <AnswerKey />}
        {tab === 'drops' && <Drops />}
        {tab === 'controls' && <Controls />}
      </div>
    </div>
  );
}

function AnswerKey() {
  const { c } = useCaseState();
  const [presenting, setPresenting] = useState<number | null>(null);

  return (
    <div className={t.stack}>
      <div className={t.row}>
        <p className={t.muted}>
          {c.meta.assessment
            ? 'Assessment case: students see no hints and submit once.'
            : 'Students see the hints after each check; they never see model answers.'}
        </p>
        <Button icon="present" onClick={() => setPresenting(0)}>
          Present full screen
        </Button>
      </div>
      {c.questions.map((q, i) => (
        <article key={q.id} className={t.card}>
          <div className={t.row}>
            <h3 className={t.qTitle}>
              Q{i + 1}. {q.prompt}
            </h3>
            <Button size="small" variant="ghost" icon="present" onClick={() => setPresenting(i)}>
              Present
            </Button>
          </div>
          <QuestionKey q={q} />
        </article>
      ))}
      {presenting !== null && (
        <PresenterView start={presenting} onClose={() => setPresenting(null)} />
      )}
    </div>
  );
}

function describeTrigger(
  tr: DropTrigger,
  titleOf: (id: string) => string,
  questionOf: (id: string) => string,
): string {
  switch (tr.type) {
    case 'manual':
      return 'Only when you release it';
    case 'afterEvidenceViewed':
      return `After the student views "${titleOf(tr.evidenceId)}"`;
    case 'afterQuestionChecked':
      return `After the student checks ${questionOf(tr.questionId)}`;
    case 'afterMinutes':
      return `${tr.minutes} minutes after the case starts`;
  }
}

function Drops() {
  const { c, progress } = useCaseState();
  const titleOf = (id: string) => c.evidence.find((e) => e.id === id)?.title ?? id;
  const questionOf = (id: string) => {
    const i = c.questions.findIndex((q) => q.id === id);
    return i < 0 ? id : `Q${i + 1}`;
  };
  if (!c.drops.length) return <p className={t.muted}>This case has no evidence drops.</p>;

  return (
    <div className={t.stack}>
      <p className={t.muted}>
        Drops release new evidence part-way through a case. Release one early to move a group on, or
        to show the class how new evidence can overturn a theory.
      </p>
      {c.drops.map((d) => {
        const at = progress.releasedDrops[d.id];
        return (
          <article key={d.id} className={t.card}>
            <div className={t.row}>
              <h3 className={t.qTitle}>{d.title}</h3>
              {at !== undefined ? (
                <Badge tone="supports" icon="check">
                  Released {formatLocalDateTime(at)}
                </Badge>
              ) : (
                <Button icon="bell" disabled={progress.locked} onClick={() => releaseDrop(c, d)}>
                  Release now
                </Button>
              )}
            </div>
            <p className={t.muted}>{d.notification}</p>
            <ul className={t.small}>
              {d.triggers.map((tr, i) => (
                <li key={i}>{describeTrigger(tr, titleOf, questionOf)}</li>
              ))}
              <li>
                Contains:{' '}
                {c.evidence
                  .filter((e) => e.releasedBy === d.id)
                  .map((e) => e.title)
                  .join(', ')}
              </li>
            </ul>
          </article>
        );
      })}
    </div>
  );
}

function Controls() {
  const { c, progress, caseId } = useCaseState();
  const [confirm, setConfirm] = useState(false);
  const used = c.warrants.available - warrantsRemaining(c, progress);
  const access = accessWording(c);

  return (
    <div className={t.stack}>
      <article className={t.card}>
        <h3 className={t.qTitle}>{access.heading}</h3>
        <p className={t.muted}>
          {used} of {c.warrants.available} used. {progress.warrants.length} request
          {progress.warrants.length === 1 ? '' : 's'} so far. Giving them back clears every request,
          so the locked evidence locks again.
        </p>
        <div>
          <Button
            icon="refresh"
            disabled={!progress.warrants.length}
            onClick={() => useProgress.getState().resetWarrants(caseId)}
          >
            {access.giveBack}
          </Button>
        </div>
      </article>

      {c.meta.assessment && (
        <article className={t.card}>
          <h3 className={t.qTitle}>Assessment submission</h3>
          <p className={t.muted}>
            {progress.locked && progress.submittedAt
              ? `Submitted ${formatLocalDateTime(progress.submittedAt)}. The student can no longer change it.`
              : 'Not submitted yet.'}
          </p>
          <div>
            <Button
              icon="unlock"
              disabled={!progress.locked}
              onClick={() => useProgress.getState().unlock(caseId)}
            >
              Re-open for editing
            </Button>
          </div>
        </article>
      )}

      <article className={t.card}>
        <h3 className={t.qTitle}>Reset this case</h3>
        <p className={t.muted}>
          Clears everything for this case on this device: board, judgements,{' '}
          {access.heading.toLowerCase()}, drops and the custody log. Useful before a demonstration.
        </p>
        <div>
          <Button variant="danger" icon="trash" onClick={() => setConfirm(true)}>
            Reset case
          </Button>
        </div>
      </article>

      {confirm && (
        <Dialog
          title="Reset this case on this device?"
          onClose={() => setConfirm(false)}
          actions={
            <>
              <Button onClick={() => setConfirm(false)}>Cancel</Button>
              <Button
                variant="danger"
                icon="trash"
                onClick={() => {
                  useProgress.getState().resetCase(caseId);
                  setConfirm(false);
                }}
              >
                Reset
              </Button>
            </>
          }
        >
          <p>This can&rsquo;t be undone unless you have a progress code backup.</p>
        </Dialog>
      )}
    </div>
  );
}
