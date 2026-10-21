import { clockTo12, formatLongDate } from '../../engine/format';
import { isQuestionDone } from '../../engine/progressTypes';
import { useDesktop } from '../../stores/desktopStore';
import { Button } from '../../ui/Button';
import { Paragraphs } from '../../ui/Paragraphs';
import { Badge } from '../../ui/StatusBadge';
import { useCaseState } from '../shared/hooks';
import s from '../shared/shared.module.css';
import b from './brief.module.css';

/** The case brief, always available: the detective's message, questions and people. */
export default function BriefApp() {
  const { c, progress } = useCaseState();

  return (
    <div className={`${s.main} ${b.brief}`}>
      <section aria-labelledby="brief-incident">
        <h3 id="brief-incident" className={b.heading}>
          Incident
        </h3>
        <p>{c.incident.summary}</p>
        <dl className={b.facts}>
          <dt>Where</dt>
          <dd>{c.incident.location}</dd>
          <dt>When</dt>
          <dd>
            {formatLongDate(c.incident.date)}, between {clockTo12(c.incident.windowStart)} and{' '}
            {clockTo12(c.incident.windowEnd)} ({c.timeZone.label})
          </dd>
        </dl>
      </section>

      <section aria-labelledby="brief-questions">
        <div className={b.headingRow}>
          <h3 id="brief-questions" className={b.heading}>
            Case questions
          </h3>
          <Button
            size="small"
            icon="gavel"
            onClick={() => useDesktop.getState().open('judgements')}
          >
            Open Judgements
          </Button>
        </div>
        <ol className={b.questions}>
          {c.questions.map((q) => (
            <li key={q.id}>
              <span>{q.prompt}</span>
              {isQuestionDone(progress, q) ? (
                <Badge tone="supports" icon="check">
                  Done
                </Badge>
              ) : (
                <Badge tone="unassessed" icon="unassessed">
                  To do
                </Badge>
              )}
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="brief-message">
        <h3 id="brief-message" className={b.heading}>
          Message from {c.briefing.from.name}
        </h3>
        <div className={b.message}>
          <Paragraphs text={c.briefing.message} />
        </div>
      </section>

      <section aria-labelledby="brief-people">
        <h3 id="brief-people" className={b.heading}>
          People in this case
        </h3>
        <ul className={b.people}>
          {c.people.map((p) => (
            <li key={p.id}>
              <span className={b.avatar} aria-hidden="true">
                {p.name
                  .split(' ')
                  .map((w) => w[0])
                  .join('')}
              </span>
              <div>
                <strong>{p.name}</strong>
                {p.age ? `, ${p.age}` : ''}
                <div className={b.role}>{p.role}</div>
                <div className={b.summary}>{p.summary}</div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
