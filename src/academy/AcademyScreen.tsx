import { Logo } from '../brand/Logo';
import { local } from '../brand/local';
import type { MissionMeta } from '../engine/missionTypes';
import { missionCatalogue } from '../missions';
import { useAcademy } from '../stores/academyStore';
import { useNav } from '../stores/navStore';
import { Button } from '../ui/Button';
import { Icon, type IconName } from '../ui/Icon';
import { Badge } from '../ui/StatusBadge';
import s from '../screens/screens.module.css';
import a from './academy.module.css';

const missionIcon = (meta: MissionMeta) => meta.icon as IconName;

/** Training Academy hub: six short missions, in any order, each earning a badge. */
export default function AcademyScreen() {
  const go = useNav((st) => st.go);
  const openMission = useNav((st) => st.openMission);
  const progress = useAcademy((st) => st.missions);
  const earned = missionCatalogue.filter((m) => progress[m.id]?.completedAt).length;

  return (
    <main className={s.stage}>
      <div className={s.casesWrap}>
        <header className={s.casesHeader}>
          <div>
            <div className={s.row}>
              <Logo />
              <span className={s.eyebrow}>Training Academy</span>
            </div>
            <h1 className={s.title}>Learn the tools of the trade</h1>
            <p className={s.small}>
              {local.scienceTeacher} has signed you up for investigator training. Six short
              missions: do them in any order (the numbers are a suggested path). Each one earns a
              badge.
            </p>
          </div>
          <div className={s.row}>
            <span className={a.badgeCount}>
              <Icon name="medal" size={18} /> {earned} of {missionCatalogue.length} badges
            </span>
            <Button icon="arrowLeft" onClick={() => go('cases')}>
              Back to cases
            </Button>
          </div>
        </header>

        <div className={s.caseGrid}>
          {missionCatalogue.map((m) => {
            const p = progress[m.id];
            const done = !!p?.completedAt;
            return (
              <article
                key={m.id}
                className={`${s.caseCard} ${done ? a.cardDone : ''}`}
                aria-labelledby={`mission-${m.id}`}
              >
                <div className={a.cardTop}>
                  <span className={a.missionNumber} aria-hidden="true">
                    {m.order}
                  </span>
                  <span className={a.missionIcon} aria-hidden="true">
                    <Icon name={missionIcon(m)} size={26} />
                  </span>
                </div>
                <div className={s.row}>
                  <Badge tone="accent" icon="clock">
                    {m.estimatedMinutes} min
                  </Badge>
                  <Badge tone="info">{m.concept}</Badge>
                  {done ? (
                    <Badge tone="supports" icon="medal">
                      {m.badge.name}
                    </Badge>
                  ) : p ? (
                    <Badge tone="inconclusive" icon="clock">
                      In progress
                    </Badge>
                  ) : null}
                </div>
                <h2 id={`mission-${m.id}`}>
                  <span className="visually-hidden">Mission {m.order}: </span>
                  {m.title}
                </h2>
                <p>{m.summary}</p>
                <div className={s.caseFooter}>
                  <Button
                    variant="secondary"
                    icon="arrowRight"
                    onClick={() => {
                      if (done) useAcademy.getState().replay(m.id);
                      openMission(m.id);
                    }}
                  >
                    {done ? 'Play again' : p ? 'Continue' : 'Start mission'}
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}
