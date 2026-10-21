import { useEffect, useMemo, useRef, useState } from 'react';
import { Logo } from '../brand/Logo';
import { isAnswerComplete, seededShuffle, type StepAnswer } from '../engine/checkStep';
import type { Mission, Step } from '../engine/missionTypes';
import { playSound } from '../lib/sound';
import { loadMission, missionCatalogue } from '../missions';
import { Loading } from '../screens/Loading';
import { useAcademy, type StepProgress } from '../stores/academyStore';
import { useNav } from '../stores/navStore';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { Paragraphs } from '../ui/Paragraphs';
import { MediaView } from './MediaView';
import {
  ChoiceInput,
  ClassifyInput,
  OrderInput,
  ReflectInput,
  ShortAnswerInput,
  SpotInput,
} from './StepInputs';
import a from './academy.module.css';

/** Loads a mission, then plays it one step at a time. */
export default function MissionScreen({ missionId }: { missionId: string }) {
  const [mission, setMission] = useState<Mission | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let live = true;
    loadMission(missionId)
      .then((m) => {
        if (!live) return;
        useAcademy.getState().start(missionId);
        setMission(m);
      })
      .catch(() => live && setError(true));
    return () => {
      live = false;
    };
  }, [missionId]);

  if (error)
    return (
      <Loading label="This mission could not be opened">
        <Button onClick={() => useNav.getState().go('academy')}>Back to the academy</Button>
      </Loading>
    );
  if (!mission || mission.meta.id !== missionId) return <Loading label="Loading mission" />;
  return <Player mission={mission} />;
}

function Player({ mission }: { mission: Mission }) {
  const id = mission.meta.id;
  const progress = useAcademy((s) => s.missions[id]);
  const go = useNav((s) => s.go);
  const total = mission.steps.length;
  const index = Math.min(progress?.stepIndex ?? 0, total);
  const finished = index >= total;

  return (
    <div className={a.player}>
      <header className={a.bar}>
        <Logo />
        <div className={a.barTitle}>
          <strong>
            Mission {mission.meta.order}: {mission.meta.title}
          </strong>
          <span className={a.stepCount}>
            {finished ? 'Complete' : `Step ${index + 1} of ${total}`}
          </span>
        </div>
        <Button size="small" variant="ghost" icon="exit" onClick={() => go('academy')}>
          Academy
        </Button>
      </header>
      <div
        className={a.progress}
        role="progressbar"
        aria-label="Mission progress"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={index}
      >
        <div className={a.progressFill} style={{ width: `${(index / total) * 100}%` }} />
      </div>
      {finished ? (
        <Finish mission={mission} />
      ) : (
        <StepView
          key={mission.steps[index]!.id}
          mission={mission}
          step={mission.steps[index]!}
          index={index}
          state={progress?.steps[mission.steps[index]!.id]}
        />
      )}
    </div>
  );
}

function StepView({
  mission,
  step,
  index,
  state,
}: {
  mission: Mission;
  step: Step;
  index: number;
  state: StepProgress | undefined;
}) {
  const id = mission.meta.id;
  const headingRef = useRef<HTMLHeadingElement>(null);
  const store = useAcademy.getState();
  const done = !!state?.done;
  const isLast = index === mission.steps.length - 1;

  // Move focus to the new step's heading so screen readers announce it.
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  // Order steps start shuffled (stable per step) until the student moves something.
  const defaultOrder = useMemo(
    () => (step.type === 'order' ? seededShuffle(step.items, step.id).map((i) => i.id) : []),
    [step],
  );
  const answer: StepAnswer | undefined =
    state?.answer ?? (step.type === 'order' ? { type: 'order', order: defaultOrder } : undefined);

  const setAnswer = (next: StepAnswer) => store.setAnswer(id, step.id, next);

  const next = () => {
    if (isLast) {
      store.complete(id);
      playSound('success');
    }
    store.goToStep(id, index + 1);
    window.scrollTo({ top: 0 });
  };

  const check = () => {
    if (answer) setAnswer(answer);
    const result = store.submit(mission, step.id);
    playSound(result.correct ? 'success' : 'hint');
  };

  const continueExplain = () => {
    store.submit(mission, step.id);
    next();
  };

  const canCheck = isAnswerComplete(step, answer);

  return (
    <main className={a.content}>
      <h1 ref={headingRef} tabIndex={-1} className={a.stepTitle}>
        {step.title}
      </h1>
      {step.body && (
        <div className={a.body}>
          <Paragraphs text={step.body} />
        </div>
      )}
      {step.media && <MediaView items={step.media} />}

      {step.type !== 'explain' && <p className={a.question}>{step.question}</p>}
      {step.type === 'choice' && (
        <ChoiceInput
          step={step}
          answer={answer?.type === 'choice' ? answer : undefined}
          onChange={setAnswer}
          done={done}
        />
      )}
      {step.type === 'spot' && (
        <SpotInput
          step={step}
          answer={answer?.type === 'spot' ? answer : undefined}
          onChange={setAnswer}
          done={done}
        />
      )}
      {step.type === 'classify' && (
        <ClassifyInput
          step={step}
          answer={answer?.type === 'classify' ? answer : undefined}
          onChange={setAnswer}
          done={done}
        />
      )}
      {step.type === 'order' && (
        <OrderInput
          step={step}
          order={answer?.type === 'order' ? answer.order : defaultOrder}
          onChange={setAnswer}
          done={done}
        />
      )}
      {step.type === 'shortAnswer' && (
        <ShortAnswerInput
          step={step}
          answer={answer?.type === 'shortAnswer' ? answer : undefined}
          onChange={setAnswer}
          done={done}
        />
      )}
      {step.type === 'reflect' && (
        <ReflectInput
          step={step}
          answer={answer?.type === 'reflect' ? answer : undefined}
          onChange={setAnswer}
          done={done}
        />
      )}

      <Feedback step={step} state={state} />

      <div className={a.actions}>
        <Button
          variant="ghost"
          icon="arrowLeft"
          disabled={index === 0}
          onClick={() => store.goToStep(id, index - 1)}
        >
          Back
        </Button>
        {step.type === 'explain' ? (
          <Button variant="primary" icon="arrowRight" onClick={continueExplain}>
            {isLast ? 'Finish mission' : 'Continue'}
          </Button>
        ) : done ? (
          <Button variant="primary" icon="arrowRight" onClick={next}>
            {isLast ? 'Finish mission' : 'Continue'}
          </Button>
        ) : step.type === 'reflect' ? (
          <Button variant="primary" icon="check" disabled={!canCheck} onClick={check}>
            Save my answer
          </Button>
        ) : (
          <Button variant="primary" icon="check" disabled={!canCheck} onClick={check}>
            {state?.attempts ? 'Check again' : 'Check'}
          </Button>
        )}
      </div>
    </main>
  );
}

function Feedback({ step, state }: { step: Step; state: StepProgress | undefined }) {
  if (!state?.attempts || step.type === 'explain') return null;
  if (step.type === 'reflect')
    return state.done ? (
      <div className={a.feedbackGood} role="status">
        <strong>Saved.</strong> Your teacher can read this in your progress backup.
      </div>
    ) : null;

  if (!state.done)
    return (
      <div className={a.feedbackHint} role="status">
        <strong>
          <Icon name="question" size={16} className="inline-icon" /> Not quite. Have another go.
        </strong>
        <ul>
          {state.hints.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      </div>
    );

  return (
    <div className={state.correct ? a.feedbackGood : a.feedbackReveal} role="status">
      <strong>
        <Icon name={state.correct ? 'supports' : 'info'} size={16} className="inline-icon" />{' '}
        {state.correct ? 'Correct!' : "Here's the answer"}
      </strong>
      <p>{step.explanation}</p>
    </div>
  );
}

function Finish({ mission }: { mission: Mission }) {
  const nav = useNav.getState();
  const missions = useAcademy((s) => s.missions);
  const nextMission = missionCatalogue.find(
    (m) => m.id !== mission.meta.id && !missions[m.id]?.completedAt,
  );

  return (
    <main className={`${a.content} ${a.finish}`}>
      <div className={a.medal} aria-hidden="true">
        <Icon name="medal" size={64} />
      </div>
      <h1 className={a.stepTitle}>Badge earned: {mission.meta.badge.name}</h1>
      <p className={a.body}>{mission.meta.badge.description}</p>
      <div className={a.actions} style={{ justifyContent: 'center' }}>
        <Button onClick={() => nav.go('academy')} icon="academy">
          Back to the academy
        </Button>
        {nextMission ? (
          <Button
            variant="primary"
            icon="arrowRight"
            onClick={() => nav.openMission(nextMission.id)}
          >
            Next: {nextMission.title}
          </Button>
        ) : (
          <Button variant="primary" icon="arrowRight" onClick={() => nav.go('cases')}>
            Go to the case files
          </Button>
        )}
      </div>
    </main>
  );
}
