import { useEffect, useState } from 'react';
import { loadCase } from '../cases';
import { formatLocalDateTime } from '../engine/format';
import type { CaseProgress } from '../engine/progressTypes';
import { scoreCase, type QuestionScore } from '../engine/score';
import type { CaseFile } from '../engine/types';
import { Icon } from '../ui/Icon';
import { Badge, StatusBadge } from '../ui/StatusBadge';
import { verdictInfo } from '../ui/labels';
import r from './review.module.css';

/** One case from a student's progress code: auto-scored objective parts plus their writing. */
export function CaseReview({ caseId, progress }: { caseId: string; progress: CaseProgress }) {
  const [c, setC] = useState<CaseFile | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let live = true;
    loadCase(caseId)
      .then((data) => live && setC(data))
      .catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, [caseId]);

  if (failed)
    return <p className={r.empty}>Couldn&rsquo;t open the case &ldquo;{caseId}&rdquo;.</p>;
  if (!c) return <p className={r.empty}>Loading {caseId}…</p>;

  const score = scoreCase(c, progress);
  const verified = (progress.custody ?? []).filter((e) => e.action === 'verified');
  const corrections = Object.entries(progress.clockCorrections ?? {});

  return (
    <section className={r.case} aria-labelledby={`review-${caseId}`}>
      <header className={r.caseHeader}>
        <h3 id={`review-${caseId}`}>{c.meta.title}</h3>
        <div className={r.badges}>
          {c.meta.assessment && (
            <Badge tone="inconclusive" icon="warrant">
              Assessment
            </Badge>
          )}
          {progress.submittedAt ? (
            <Badge tone="supports" icon="check">
              {c.meta.assessment ? 'Submitted' : 'Marked complete'}{' '}
              {formatLocalDateTime(progress.submittedAt)}
            </Badge>
          ) : (
            <Badge tone="unassessed" icon="unassessed">
              Not submitted
            </Badge>
          )}
          <Badge tone="accent" icon="gavel">
            Auto-scored: {score.correct} of {score.total}
          </Badge>
        </div>
        <p className={r.muted}>
          Started {formatLocalDateTime(progress.startedAt)}. Auto-scoring checks the verdict and the
          attached evidence only; read the reasoning yourself.
        </p>
      </header>

      {score.questions.map((qs) => (
        <QuestionReview key={qs.question.id} qs={qs} c={c} progress={progress} />
      ))}

      <div className={r.process}>
        <h4>Investigation process</h4>
        <ul>
          <li>
            Examined {Object.keys(progress.viewed).length} of {c.evidence.length} items.
          </li>
          <li>
            Hash checks run: {verified.length ? verified.length : 'none'}
            {verified.some((v) => !v.ok) && ' (found a mismatch)'}.
          </li>
          {corrections.length > 0 && (
            <li>
              Clock corrections:{' '}
              {corrections
                .map(([deviceId, offset]) => {
                  const device = c.devices.find((d) => d.id === deviceId);
                  const right = device?.clock?.utcOffset === offset;
                  return `${device?.name ?? deviceId} → UTC${offset} (${right ? 'correct' : 'not correct'})`;
                })
                .join('; ')}
            </li>
          )}
        </ul>
        <h4>Warrant applications</h4>
        {progress.warrants.length ? (
          <ul className={r.warrants}>
            {progress.warrants.map((w) => {
              const req = c.warrants.requests.find((x) => x.id === w.requestId);
              return (
                <li key={w.requestId}>
                  <Badge
                    tone={w.granted ? 'supports' : 'contradicts'}
                    icon={w.granted ? 'supports' : 'contradicts'}
                  >
                    {w.granted ? 'Granted' : 'Refused'}
                  </Badge>{' '}
                  <strong>{req?.title ?? w.requestId}</strong>
                  {req && !req.proportionate && ' (disproportionate request)'}
                  <br />
                  <em>&ldquo;{w.justification}&rdquo;</em>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className={r.empty}>None.</p>
        )}
      </div>
    </section>
  );
}

function QuestionReview({
  qs,
  c,
  progress,
}: {
  qs: QuestionScore;
  c: CaseFile;
  progress: CaseProgress;
}) {
  const q = qs.question;
  const j = progress.judgements[q.id];
  const titleOf = (id: string) => c.evidence.find((e) => e.id === id)?.title ?? id;
  const links = progress.links.filter((l) => l.questionId === q.id);

  return (
    <div className={r.question}>
      <div className={r.qHead}>
        <h4>
          Q{qs.number}. {q.prompt}
        </h4>
        {qs.correct === null ? (
          <Badge tone="info" icon="report">
            Teacher to read
          </Badge>
        ) : qs.correct ? (
          <Badge tone="supports" icon="supports">
            Matches the key
          </Badge>
        ) : (
          <Badge tone="contradicts" icon="contradicts">
            {qs.answered ? 'Does not match the key' : 'Not answered'}
          </Badge>
        )}
      </div>

      {q.kind === 'verdict' ? (
        <>
          <dl className={r.facts}>
            <dt>Verdict</dt>
            <dd>
              {j?.verdict ? verdictInfo[j.verdict].label : 'none'}{' '}
              {j?.verdict && (
                <span className={qs.verdictOk ? r.ok : r.bad}>
                  <Icon name={qs.verdictOk ? 'check' : 'close'} size={14} />
                  {qs.verdictOk
                    ? 'accepted'
                    : `key: ${q.acceptedVerdicts.map((v) => verdictInfo[v].label).join(' or ')}`}
                </span>
              )}
            </dd>
            <dt>Evidence</dt>
            <dd>
              {links.length ? (
                <ul className={r.evidence}>
                  {links.map((l) => (
                    <li key={l.id}>
                      <StatusBadge status={l.relation} /> {titleOf(l.evidenceId)}
                      {q.keyEvidenceIds.includes(l.evidenceId) && (
                        <span className={r.ok}>
                          <Icon name="check" size={14} /> key
                        </span>
                      )}
                      {qs.distractors.includes(l.evidenceId) && (
                        <span className={r.bad}>
                          <Icon name="alert" size={14} /> distractor
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                'none attached'
              )}
            </dd>
            {qs.missingKey.length > 0 && (
              <>
                <dt>Missing key evidence</dt>
                <dd>{qs.missingKey.map(titleOf).join('; ')}</dd>
              </>
            )}
            {!c.meta.assessment && (
              <>
                <dt>Checks</dt>
                <dd>{j?.attempts ?? 0}</dd>
              </>
            )}
          </dl>
          <p className={r.label}>Reasoning</p>
          <p className={r.answer}>{j?.explanation.trim() || <em>Not written.</em>}</p>
          <p className={r.label}>Limitation</p>
          <p className={r.answer}>{j?.limitation.trim() || <em>Not written.</em>}</p>
        </>
      ) : (
        <>
          <p className={r.answer}>{j?.explanation.trim() || <em>Not written.</em>}</p>
          <details className={r.keyPoints}>
            <summary>Points to look for</summary>
            <ul>
              {q.keyPoints.map((k) => (
                <li key={k}>{k}</li>
              ))}
            </ul>
          </details>
        </>
      )}
    </div>
  );
}
