import type { SelfRating } from '../../engine/progressTypes';
import { SELF_RATING_LABELS, type ReportData } from '../../engine/report';
import r from '../report.module.css';

const ratings: SelfRating[] = ['yes', 'partly', 'not-yet'];

/** Students rate themselves against the case's success criteria. Saved with their progress. */
export function SelfAssessment({
  report,
  locked,
  onRate,
}: {
  report: ReportData;
  locked: boolean;
  onRate: (index: number, rating: SelfRating) => void;
}) {
  return (
    <section className={r.section}>
      <h2>Success criteria: how did I go?</h2>
      <p className={r.small}>Be honest: your teacher will compare this with your answers.</p>
      <div className={r.criteria}>
        {report.selfAssessment.map((s, i) => (
          <fieldset key={s.criterion} className={r.criterion} disabled={locked}>
            <legend>{s.criterion}</legend>
            <div className={r.ratings}>
              {ratings.map((rating) => (
                <label key={rating} className={s.rating === rating ? r.ratingOn : r.rating}>
                  <input
                    type="radio"
                    name={`criterion-${i}`}
                    checked={s.rating === rating}
                    onChange={() => onRate(i, rating)}
                  />
                  {SELF_RATING_LABELS[rating]}
                </label>
              ))}
            </div>
          </fieldset>
        ))}
      </div>
    </section>
  );
}
