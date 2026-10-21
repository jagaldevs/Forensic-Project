import type { Question } from '../../engine/types';
import { Badge } from '../../ui/StatusBadge';
import { verdictInfo } from '../../ui/labels';
import { openEvidence, useCaseState } from '../shared/hooks';
import t from './teacher.module.css';

/** The answer key for one question (also used by the presenter view). */
export function QuestionKey({ q, large }: { q: Question; large?: boolean }) {
  const { c } = useCaseState();
  const title = (id: string) => c.evidence.find((e) => e.id === id)?.title ?? id;
  const evidenceButton = (id: string) => {
    const item = c.evidence.find((e) => e.id === id);
    return item && !large ? (
      <button type="button" className={t.linkish} onClick={() => openEvidence(item)}>
        {item.title}
      </button>
    ) : (
      title(id)
    );
  };

  return (
    <dl className={large ? `${t.key} ${t.keyLarge}` : t.key}>
      {q.kind === 'verdict' ? (
        <>
          <dt>Claim</dt>
          <dd>{q.claim}</dd>
          <dt>Accepted verdict</dt>
          <dd>
            {q.acceptedVerdicts.map((v) => (
              <Badge key={v} tone="supports" icon={verdictInfo[v].icon}>
                {verdictInfo[v].label}
              </Badge>
            ))}
          </dd>
          <dt>Key evidence</dt>
          <dd>
            <ul>
              {q.keyEvidenceIds.map((id) => (
                <li key={id}>{evidenceButton(id)}</li>
              ))}
            </ul>
          </dd>
          {q.distractorEvidenceIds.length > 0 && (
            <>
              <dt>Distractors</dt>
              <dd>
                <ul>
                  {q.distractorEvidenceIds.map((id) => (
                    <li key={id}>{evidenceButton(id)}</li>
                  ))}
                </ul>
              </dd>
            </>
          )}
          <dt>Model answer</dt>
          <dd>{q.modelAnswer}</dd>
          <dt>Limitations students might name</dt>
          <dd>
            <ul>
              {q.limitationExamples.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </dd>
        </>
      ) : (
        <>
          <dt>Model answer</dt>
          <dd>{q.modelAnswer}</dd>
          <dt>Look for</dt>
          <dd>
            <ul>
              {q.keyPoints.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </dd>
        </>
      )}
    </dl>
  );
}
