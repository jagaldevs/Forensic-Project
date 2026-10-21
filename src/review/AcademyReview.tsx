import { useEffect, useState } from 'react';
import { formatLocalDateTime } from '../engine/format';
import type { Mission } from '../engine/missionTypes';
import { loadMission, missionCatalogue } from '../missions';
import type { MissionProgress } from '../stores/academyStore';
import { Icon } from '../ui/Icon';
import { Badge } from '../ui/StatusBadge';
import r from './review.module.css';

/** A student's Training Academy work: badges, attempts per step, and reflections. */
export function AcademyReview({ academy }: { academy: Record<string, MissionProgress> }) {
  const [missions, setMissions] = useState<Record<string, Mission>>({});
  const startedIds = missionCatalogue.map((m) => m.id).filter((id) => academy[id]);
  const startedKey = startedIds.join(',');

  useEffect(() => {
    let live = true;
    const ids = startedKey.split(',').filter(Boolean);
    Promise.all(ids.map(async (id) => [id, await loadMission(id)] as const))
      .then((pairs) => live && setMissions(Object.fromEntries(pairs)))
      .catch(() => {});
    return () => {
      live = false;
    };
  }, [startedKey]);

  const earned = missionCatalogue.filter((m) => academy[m.id]?.completedAt).length;

  return (
    <section className={r.case} aria-labelledby="review-academy">
      <header className={r.caseHeader}>
        <h3 id="review-academy">Training Academy</h3>
        <div className={r.badges}>
          <Badge tone="accent" icon="medal">
            {earned} of {missionCatalogue.length} badges
          </Badge>
        </div>
      </header>

      <div className={r.tableWrap}>
        <table className={r.table}>
          <thead>
            <tr>
              <th scope="col">Mission</th>
              <th scope="col">Badge</th>
              <th scope="col">Steps first-try right</th>
              <th scope="col">Total tries</th>
            </tr>
          </thead>
          <tbody>
            {missionCatalogue.map((meta) => {
              const p = academy[meta.id];
              const steps = Object.values(p?.steps ?? {}).filter((st) => st.attempts > 0);
              const firstTry = steps.filter((st) => st.correct && st.attempts === 1).length;
              return (
                <tr key={meta.id}>
                  <td>{meta.title}</td>
                  <td>
                    {p?.completedAt ? (
                      <span className={r.ok}>
                        <Icon name="medal" size={14} /> {meta.badge.name} (
                        {formatLocalDateTime(p.completedAt)})
                      </span>
                    ) : p ? (
                      'In progress'
                    ) : (
                      'Not started'
                    )}
                  </td>
                  <td>{p ? `${firstTry} of ${steps.length}` : ''}</td>
                  <td>{p ? steps.reduce((n, st) => n + st.attempts, 0) : ''}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <h4 className={r.subhead}>Reflections</h4>
      {startedIds.flatMap((id) => {
        const mission = missions[id];
        if (!mission) return [];
        return mission.steps
          .filter((st) => st.type === 'reflect')
          .map((st) => {
            const answer = academy[id]?.steps[st.id]?.answer;
            const text = answer?.type === 'reflect' ? answer.text.trim() : '';
            return (
              <div key={`${id}-${st.id}`} className={r.question}>
                <p className={r.label}>
                  {mission.meta.title}: {st.type === 'reflect' ? st.question : st.title}
                </p>
                <p className={r.answer}>{text || <em>Not written.</em>}</p>
              </div>
            );
          });
      })}
      {startedIds.length === 0 && <p className={r.empty}>No missions started.</p>}
    </section>
  );
}
