import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from '../../lib/useFocusTrap';
import { Button } from '../../ui/Button';
import { useCaseState } from '../shared/hooks';
import { QuestionKey } from './QuestionKey';
import t from './teacher.module.css';

/** Full-screen answer key for the projector: one question at a time, arrow keys to move. */
export function PresenterView({ start, onClose }: { start: number; onClose: () => void }) {
  const { c } = useCaseState();
  const [index, setIndex] = useState(start);
  const ref = useRef<HTMLDivElement>(null);
  const q = c.questions[index]!;
  const last = c.questions.length - 1;

  useFocusTrap(ref, onClose);

  // Previous/Next become disabled at the ends; keep focus in the view when that happens.
  useEffect(() => {
    const active = document.activeElement as HTMLButtonElement | null;
    if (!ref.current?.contains(active) || active?.disabled) ref.current?.focus();
  }, [index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setIndex((i) => Math.min(last, i + 1));
      if (e.key === 'ArrowLeft') setIndex((i) => Math.max(0, i - 1));
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [last]);

  return createPortal(
    <div
      ref={ref}
      className={t.presenter}
      role="dialog"
      aria-modal="true"
      aria-labelledby="presenter-title"
      tabIndex={-1}
    >
      <header className={t.presenterBar}>
        <span className={t.presenterCase}>{c.meta.title} · Answer key</span>
        <span className={t.muted}>
          {index + 1} / {c.questions.length}
        </span>
        <Button icon="arrowLeft" disabled={index === 0} onClick={() => setIndex(index - 1)}>
          Previous
        </Button>
        <Button icon="arrowRight" disabled={index === last} onClick={() => setIndex(index + 1)}>
          Next
        </Button>
        <Button variant="ghost" icon="close" label="Close presenter view" onClick={onClose} />
      </header>
      <div className={t.presenterBody}>
        <h2 id="presenter-title" className={t.presenterQuestion}>
          Q{index + 1}. {q.prompt}
        </h2>
        <QuestionKey q={q} large />
      </div>
    </div>,
    document.body,
  );
}
