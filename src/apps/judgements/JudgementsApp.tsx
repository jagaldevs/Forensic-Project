import { useState } from 'react';
import {
  checkOpenJudgement,
  checkVerdictJudgement,
  missingBeforeCheck,
} from '../../engine/checkJudgement';
import {
  attachedEvidenceIds,
  emptyJudgement,
  isQuestionDone,
  supportLevelOf,
  type Judgement,
} from '../../engine/progressTypes';
import { usableEvidence } from '../../engine/availability';
import type {
  Extension,
  OpenQuestion,
  Question,
  Relation,
  VerdictQuestion,
} from '../../engine/types';
import { playSound } from '../../lib/sound';
import { useDesktop } from '../../stores/desktopStore';
import { useProgress } from '../../stores/progressStore';
import { useSettings } from '../../stores/settingsStore';
import { Button } from '../../ui/Button';
import { Icon } from '../../ui/Icon';
import { Badge, StatusBadge } from '../../ui/StatusBadge';
import { statusInfo, verdictInfo, verdictOrder } from '../../ui/labels';
import ui from '../../ui/ui.module.css';
import { onTabListKeyDown } from '../../ui/tabKeys';
import type { AppProps } from '../registry';
import { openEvidence, useCaseState } from '../shared/hooks';
import j from './judgements.module.css';

/** Tab id for the Deep dive extension tasks (questions use their own ids). */
const DEEP_TAB = 'deep-dive';

/** For each case question: verdict, attached evidence, explanation and a limitation. */
export default function JudgementsApp({ params }: AppProps) {
  const { c, progress } = useCaseState();
  const extensions = c.extensions ?? [];
  // Deep dive tasks get their own tab, at the Deep dive level only (in teacher mode too, so a
  // teacher can preview each level).
  const showDeep = extensions.length > 0 && supportLevelOf(progress) === 'deep';
  const deep = showDeep && params.q === DEEP_TAB;
  const current = c.questions.find((q) => q.id === params.q) ?? c.questions[0]!;
  const selectedTab = deep ? DEEP_TAB : current.id;

  return (
    <div className={j.app}>
      <div
        className={j.tabs}
        role="tablist"
        aria-label="Case questions"
        onKeyDown={onTabListKeyDown}
      >
        {c.questions.map((q, i) => {
          const done = isQuestionDone(progress, q);
          const tried = !!progress.judgements[q.id]?.lastResult;
          return (
            <button
              key={q.id}
              type="button"
              role="tab"
              id={`tab-${q.id}`}
              aria-selected={q.id === selectedTab}
              tabIndex={q.id === selectedTab ? 0 : -1}
              aria-controls="judgement-panel"
              className={j.tab}
              onClick={() => useDesktop.getState().setParams('judgements', { q: q.id })}
            >
              <span>Q{i + 1}</span>
              <Icon name={done ? 'supports' : tried ? 'alert' : 'unassessed'} size={16} />
              <span className="visually-hidden">
                {done ? 'done' : tried ? 'needs another look' : 'not started'}
              </span>
            </button>
          );
        })}
        {showDeep && (
          <button
            type="button"
            role="tab"
            id={`tab-${DEEP_TAB}`}
            aria-selected={deep}
            tabIndex={deep ? 0 : -1}
            aria-controls="judgement-panel"
            className={`${j.tab} ${j.tabDeep}`}
            onClick={() => useDesktop.getState().setParams('judgements', { q: DEEP_TAB })}
          >
            <Icon name="search" size={16} />
            <span>Deep dive</span>
          </button>
        )}
      </div>
      {progress.locked && (
        <p className={j.lockedNote} role="status">
          <Icon name="lock" size={16} /> This assessment has been submitted. Your answers are
          locked.
        </p>
      )}
      <div
        id="judgement-panel"
        role="tabpanel"
        aria-labelledby={`tab-${selectedTab}`}
        className={j.panel}
      >
        {deep ? (
          <DeepDive extensions={extensions} />
        ) : current.kind === 'verdict' ? (
          <VerdictForm key={current.id} q={current} />
        ) : (
          <OpenForm key={current.id} q={current} />
        )}
      </div>
    </div>
  );
}

function useJudgement(q: Question) {
  const { c, progress, caseId } = useCaseState();
  const judgement: Judgement = progress.judgements[q.id] ?? emptyJudgement();
  const assessment = !!c.meta.assessment;
  const locked = !!progress.locked;
  // In an assessment, any change after saving needs saving again.
  const update = (patch: Partial<Judgement>) =>
    useProgress
      .getState()
      .updateJudgement(caseId, q.id, assessment ? { ...patch, savedAt: null } : patch);
  const saveAnswer = () => {
    useProgress.getState().saveJudgement(caseId, q.id);
    playSound('pin');
  };
  return { c, progress, caseId, judgement, update, assessment, locked, saveAnswer };
}

function VerdictForm({ q }: { q: VerdictQuestion }) {
  const { c, progress, caseId, judgement, update, assessment, locked, saveAnswer } =
    useJudgement(q);
  const attached = attachedEvidenceIds(progress, q.id);
  const usable = usableEvidence(c, progress);
  const missing = missingBeforeCheck(q, judgement, attached);

  const check = () => {
    const result = checkVerdictJudgement(q, judgement, attached, c);
    useProgress.getState().recordCheck(caseId, q.id, result);
    playSound(result.correct ? 'success' : 'hint');
  };

  return (
    <form className={j.form} onSubmit={(e) => e.preventDefault()}>
      <fieldset className={j.plain} disabled={locked}>
        <h3 className={j.prompt}>{q.prompt}</h3>
        {!assessment && supportLevelOf(progress) === 'guided' && <Nudge q={q} />}

        <fieldset className={j.fieldset}>
          <legend className={j.legend}>1. Your verdict on the claim</legend>
          <div className={j.verdicts} data-tour="verdicts">
            {verdictOrder.map((v) => {
              const info = verdictInfo[v];
              return (
                <label key={v} className={j.verdict}>
                  <input
                    type="radio"
                    name={`verdict-${q.id}`}
                    value={v}
                    checked={judgement.verdict === v}
                    onChange={() => update({ verdict: v })}
                  />
                  <span className={j.verdictBody}>
                    <span className={j.verdictLabel}>
                      <Icon name={info.icon} size={18} />
                      {info.label}
                    </span>
                    <span className={j.verdictDesc}>{info.description}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <fieldset className={j.fieldset}>
          <legend className={j.legend}>2. Evidence that justifies it</legend>
          <p className={ui.hint}>
            Attach evidence here or by linking cards on the Evidence Board. Both stay in sync.
          </p>
          <AttachedList questionId={q.id} />
          <AttachControl
            questionId={q.id}
            options={usable.filter((e) => !attached.includes(e.id))}
          />
        </fieldset>

        <div className={j.fieldset}>
          <label className={j.legend} htmlFor={`explain-${q.id}`}>
            3. Explain your reasoning
          </label>
          <span className={ui.hint} id={`explain-hint-${q.id}`}>
            What does the evidence show? What does it <strong>not</strong> show?
          </span>
          <textarea
            id={`explain-${q.id}`}
            className={ui.textarea}
            aria-describedby={`explain-hint-${q.id}`}
            value={judgement.explanation}
            onChange={(e) => update({ explanation: e.target.value })}
            rows={4}
          />
        </div>

        <div className={j.fieldset}>
          <label className={j.legend} htmlFor={`limit-${q.id}`}>
            4. One limitation
          </label>
          <span className={ui.hint} id={`limit-hint-${q.id}`}>
            What can&rsquo;t this evidence tell us, or what could make it misleading?
          </span>
          <textarea
            id={`limit-${q.id}`}
            className={ui.textarea}
            aria-describedby={`limit-hint-${q.id}`}
            value={judgement.limitation}
            onChange={(e) => update({ limitation: e.target.value })}
            rows={2}
          />
        </div>

        <div className={j.checkRow}>
          {assessment ? (
            <SaveButton judgement={judgement} onSave={saveAnswer} disabled={missing.length > 0} />
          ) : (
            <Button variant="primary" icon="check" onClick={check} disabled={missing.length > 0}>
              Check my judgement
            </Button>
          )}
          {missing.length > 0 && (
            <ul className={j.missing} aria-label="Still to do">
              {missing.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          )}
        </div>

        {!assessment && <Feedback judgement={judgement} />}
      </fieldset>
    </form>
  );
}

/** Assessment cases: answers are saved, never checked, and no hints are shown. */
function SaveButton({
  judgement,
  onSave,
  disabled,
}: {
  judgement: Judgement;
  onSave: () => void;
  disabled: boolean;
}) {
  return (
    <>
      <Button variant="primary" icon="check" onClick={onSave} disabled={disabled}>
        {judgement.savedAt ? 'Saved' : 'Save my answer'}
      </Button>
      {judgement.savedAt ? (
        <span className={j.saved} role="status">
          <Icon name="supports" size={16} /> Saved. You can change it until you submit your report.
        </span>
      ) : null}
    </>
  );
}

function AttachedList({ questionId }: { questionId: string }) {
  const { c, progress, caseId } = useCaseState();
  const links = progress.links.filter((l) => l.questionId === questionId);
  if (!links.length) return <p className={j.none}>No evidence attached yet.</p>;
  return (
    <ul className={j.attached}>
      {links.map((l) => {
        const item = c.evidence.find((e) => e.id === l.evidenceId);
        if (!item) return null;
        return (
          <li key={l.id}>
            <StatusBadge status={l.relation} />
            <button type="button" className={j.linkish} onClick={() => openEvidence(item)}>
              {item.title}
            </button>
            <Button
              size="small"
              variant="ghost"
              icon="close"
              label={`Remove ${item.title}`}
              onClick={() => useProgress.getState().unlink(caseId, l.evidenceId, questionId)}
            />
          </li>
        );
      })}
    </ul>
  );
}

function AttachControl({
  questionId,
  options,
}: {
  questionId: string;
  options: { id: string; title: string }[];
}) {
  const { caseId } = useCaseState();
  const [evidenceId, setEvidenceId] = useState('');
  const [relation, setRelation] = useState<Relation>('supports');
  if (!options.length) return null;
  const chosen = options.some((o) => o.id === evidenceId) ? evidenceId : '';

  return (
    <div className={j.attachRow}>
      <label className="visually-hidden" htmlFor={`attach-${questionId}`}>
        Evidence to attach
      </label>
      <select
        id={`attach-${questionId}`}
        className={ui.select}
        value={chosen}
        onChange={(e) => setEvidenceId(e.target.value)}
      >
        <option value="">Choose evidence…</option>
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.title}
          </option>
        ))}
      </select>
      <label className="visually-hidden" htmlFor={`relation-${questionId}`}>
        How it relates to the claim
      </label>
      <select
        id={`relation-${questionId}`}
        className={ui.select}
        value={relation}
        onChange={(e) => setRelation(e.target.value as Relation)}
      >
        {(['supports', 'contradicts', 'inconclusive'] as const).map((r) => (
          <option key={r} value={r}>
            {statusInfo[r].label}
          </option>
        ))}
      </select>
      <Button
        icon="plus"
        disabled={!chosen}
        onClick={() => {
          useProgress.getState().link(caseId, chosen, questionId, relation);
          setEvidenceId('');
        }}
      >
        Attach
      </Button>
    </div>
  );
}

/** `open`: an unmarked open answer, so no verdict badge and no check count. */
function Feedback({ judgement, open = false }: { judgement: Judgement; open?: boolean }) {
  const r = judgement.lastResult;
  if (!r) return null;
  return (
    <section
      className={r.correct ? j.feedbackGood : j.feedbackHint}
      aria-live="polite"
      aria-label="Feedback"
    >
      <div className={j.feedbackHead}>
        {open ? (
          <Badge icon="check">Saved for your teacher</Badge>
        ) : r.correct ? (
          <Badge tone="supports" icon="supports">
            Well reasoned
          </Badge>
        ) : (
          <Badge tone="inconclusive" icon="question">
            Worth another look
          </Badge>
        )}
        {!open && <span className={j.attempts}>Check {judgement.attempts}</span>}
      </div>
      <ul>
        {r.messages.map((m, i) => (
          <li key={i} className={m.tone === 'good' ? j.msgGood : j.msgHint}>
            <Icon name={m.tone === 'good' ? 'check' : 'info'} size={16} />
            <span>{m.text}</span>
          </li>
        ))}
      </ul>
      {r.correct && !open && (
        <p className={j.teacherNote}>Your written reasoning will be read by your teacher.</p>
      )}
    </section>
  );
}

function OpenForm({ q }: { q: OpenQuestion }) {
  const { caseId, judgement, update, assessment, locked, saveAnswer } = useJudgement(q);
  const missing = missingBeforeCheck(q, judgement, []);

  const save = () => {
    useProgress.getState().recordCheck(caseId, q.id, checkOpenJudgement());
    playSound('success');
  };

  return (
    <form className={j.form} onSubmit={(e) => e.preventDefault()}>
      <fieldset className={j.plain} disabled={locked}>
        <h3 className={j.prompt}>{q.prompt}</h3>
        <ul className={j.guidance}>
          {q.guidance.map((g) => (
            <li key={g}>{g}</li>
          ))}
        </ul>
        <label className={j.legend} htmlFor={`open-${q.id}`}>
          Your answer
        </label>
        <textarea
          id={`open-${q.id}`}
          className={ui.textarea}
          value={judgement.explanation}
          onChange={(e) => update({ explanation: e.target.value })}
          rows={8}
        />
        <div className={j.checkRow}>
          {assessment ? (
            <SaveButton judgement={judgement} onSave={saveAnswer} disabled={missing.length > 0} />
          ) : (
            <Button variant="primary" icon="check" onClick={save} disabled={missing.length > 0}>
              {judgement.lastResult ? 'Save changes' : 'Save my answer'}
            </Button>
          )}
          {missing.length > 0 && (
            <ul className={j.missing}>
              {missing.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          )}
        </div>
        {!assessment && <Feedback judgement={judgement} open />}
      </fieldset>
    </form>
  );
}

/** Guided level: a nudge on what to look at, before the first check. */
function Nudge({ q }: { q: VerdictQuestion }) {
  const { caseId, progress } = useCaseState();
  const text = q.nudge ?? q.hints?.verdict;
  const [open, setOpen] = useState(() => !!progress.nudgesUsed?.includes(q.id));
  if (!text) return null;
  return (
    <div className={j.nudge}>
      <Button
        size="small"
        icon="info"
        aria-expanded={open}
        onClick={() => {
          setOpen(!open);
          if (!open) useProgress.getState().recordNudge(caseId, q.id);
        }}
      >
        {open ? 'Hide the nudge' : 'Need a nudge?'}
      </Button>
      {open && <p className={j.nudgeText}>{text}</p>}
    </div>
  );
}

/**
 * Deep dive level: optional, more technical tasks. Answers save as the student types and go to
 * the teacher; they are never marked and never change the case result.
 */
function DeepDive({ extensions }: { extensions: Extension[] }) {
  const { c, progress, caseId } = useCaseState();
  const teacherMode = useSettings((st) => st.teacherMode);
  const usable = new Map(usableEvidence(c, progress).map((e) => [e.id, e]));

  return (
    <div className={j.form}>
      <p className={ui.hint}>
        Optional challenges for investigators who want to go further. Your answers are saved for
        your teacher. They don&rsquo;t change your case result.
      </p>
      {extensions.map((x, i) => (
        <fieldset key={x.id} className={j.extension} disabled={!!progress.locked}>
          <legend className={j.extensionTitle}>
            Challenge {i + 1}: {x.title}
          </legend>
          <p>{x.prompt}</p>
          {x.evidenceIds.length > 0 && (
            <div className={j.extensionEvidence}>
              <span className={ui.hint}>Look at:</span>
              {x.evidenceIds.map((id) => {
                const item = usable.get(id);
                return item ? (
                  <Button key={id} size="small" icon="eye" onClick={() => openEvidence(item)}>
                    {item.title}
                  </Button>
                ) : (
                  <span key={id} className={ui.hint}>
                    (an item you haven&rsquo;t collected yet)
                  </span>
                );
              })}
            </div>
          )}
          {x.guidance && (
            <ul className={j.guidance}>
              {x.guidance.map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          )}
          <label className={j.legend} htmlFor={`ext-${x.id}`}>
            Your answer
          </label>
          <textarea
            id={`ext-${x.id}`}
            className={ui.textarea}
            value={progress.extensionAnswers?.[x.id] ?? ''}
            onChange={(e) =>
              useProgress.getState().setExtensionAnswer(caseId, x.id, e.target.value)
            }
            rows={5}
          />
          {teacherMode && (
            <p className={j.teacherNote}>
              <strong>Teacher: model answer.</strong> {x.modelAnswer}
            </p>
          )}
        </fieldset>
      ))}
    </div>
  );
}
