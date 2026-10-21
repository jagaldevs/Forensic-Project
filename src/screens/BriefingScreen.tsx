import { useCaseFile } from '../app/CaseContext';
import { clockTo12, formatLongDate } from '../engine/format';
import { playSound } from '../lib/sound';
import { useNav } from '../stores/navStore';
import { supportLevelLabels } from '../engine/progressTypes';
import { useCaseProgress, useProgress } from '../stores/progressStore';
import { useSettings } from '../stores/settingsStore';
import { Button } from '../ui/Button';
import { Paragraphs } from '../ui/Paragraphs';
import { SupportLevelPicker } from '../ui/SupportLevelPicker';
import s from './screens.module.css';

/** The case briefing: a message from the lead detective with the case questions. */
export function BriefingScreen() {
  const c = useCaseFile();
  const go = useNav((st) => st.go);
  const exitCase = useNav((st) => st.exitCase);
  const progress = useCaseProgress(c.meta.id);
  const classLevel = useSettings((st) => st.classLevel);
  // The class's suggested level (from the shared link) is preselected until the student chooses.
  const level = progress.supportLevel ?? classLevel ?? 'standard';

  const accept = () => {
    // Record the level even if the student kept the default or the class suggestion.
    if (!progress.supportLevel) useProgress.getState().setSupportLevel(c.meta.id, level);
    useProgress.getState().markBriefingRead(c.meta.id);
    playSound('open');
    go('desktop');
  };

  const questions = c.briefing.questionIds.map((id) => c.questions.find((q) => q.id === id)!);

  return (
    <main className={s.stage}>
      <div className={s.briefing}>
        <div className={s.spread}>
          <span className={s.eyebrow}>Secure message · 1 unread</span>
          <span className={s.stamp}>Confidential</span>
        </div>
        <article className={s.message} aria-labelledby="briefing-subject">
          <dl className={s.messageHead}>
            <dt>From</dt>
            <dd>
              <strong>{c.briefing.from.name}</strong>, {c.briefing.from.role}
            </dd>
            <dt>Subject</dt>
            <dd id="briefing-subject">{c.briefing.subject}</dd>
            <dt>Incident</dt>
            <dd>
              {formatLongDate(c.incident.date)}, {clockTo12(c.incident.windowStart)} to{' '}
              {clockTo12(c.incident.windowEnd)} ({c.timeZone.label})
            </dd>
          </dl>
          <div className={s.messageBody}>
            <Paragraphs text={c.briefing.message} />
            <h2 style={{ fontSize: 'var(--text-lg)', marginTop: 'var(--space-3)' }}>
              Your questions
            </h2>
            <ol className={s.questionList}>
              {questions.map((q) => (
                <li key={q.id}>{q.prompt}</li>
              ))}
            </ol>
            <p className={s.small}>
              For each question, decide what the evidence shows, what it does not show, and what
              further evidence would help.
            </p>
          </div>
        </article>
        <SupportLevelPicker
          value={level}
          onChange={(l) => useProgress.getState().setSupportLevel(c.meta.id, l)}
          assessment={!!c.meta.assessment}
          disabled={!!progress.locked}
        />
        {classLevel && !progress.supportLevel && (
          <p className={s.small}>
            Your teacher suggested <strong>{supportLevelLabels[classLevel]}</strong> for this class.
            You can choose a different level if it suits you better.
          </p>
        )}
        <div className={s.spread}>
          <Button variant="ghost" icon="arrowLeft" onClick={exitCase}>
            Back to cases
          </Button>
          <Button variant="primary" icon="arrowRight" onClick={accept}>
            Accept case and open workstation
          </Button>
        </div>
      </div>
    </main>
  );
}
