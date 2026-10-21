import { useEffect, useId, useState } from 'react';
import { createPortal } from 'react-dom';
import { useCaseFile } from '../app/CaseContext';
import type { CaseProgress } from '../engine/progressTypes';
import { topWindowId, useCaseWindows, type WindowState } from '../stores/desktopStore';
import { useCaseProgress } from '../stores/progressStore';
import { useSettings } from '../stores/settingsStore';
import { useTour } from '../stores/tourStore';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { tourSteps, type TourSnapshot } from './tourSteps';
import s from './tour.module.css';

function snapshot(progress: CaseProgress, windows: WindowState[]): TourSnapshot {
  return {
    top: topWindowId(windows),
    pins: Object.keys(progress.board).length,
    links: progress.links.length,
    verdicts: Object.values(progress.judgements).filter((j) => j.verdict).length,
  };
}

/**
 * First-run walkthrough of the desktop: a welcome, then a small coach card that moves on as
 * the student opens the locker, pins, links and judges. Not modal, so they do the real thing.
 */
export function Tour() {
  const c = useCaseFile();
  const step = useTour((st) => st.step);
  const baseline = useTour((st) => st.baseline);
  const progress = useCaseProgress(c.meta.id);
  const windows = useCaseWindows(c.meta.id);
  const now = snapshot(progress, windows);
  const titleId = useId();

  const current = step ? tourSteps[step - 1] : undefined;
  const target = useTargetRect(current?.highlight ?? []);
  // The card sits on the opposite side to the highlighted thing, so it never covers it.
  const cardOnLeft = !!target && target.left + target.width / 2 > window.innerWidth / 2;
  const isDone = !!(current?.done && baseline && current.done(now, baseline));

  const next = () => {
    if (step === null) return;
    if (step >= tourSteps.length) finish();
    else useTour.getState().goTo(step + 1, now);
  };
  const finish = () => {
    useTour.getState().stop();
    useSettings.getState().setTourDone(true);
  };

  useEffect(() => {
    if (isDone && step !== null) useTour.getState().goTo(step + 1, now);
    // `now` is derived from the same render as isDone.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDone, step]);

  if (step === null) return null;

  if (step === 0)
    return (
      <Dialog
        title="Welcome to your workstation"
        onClose={finish}
        actions={
          <>
            <Button onClick={finish}>Skip the tour</Button>
            <Button variant="primary" icon="arrowRight" onClick={next} data-autofocus>
              Start the tour
            </Button>
          </>
        }
      >
        <p>
          This is where you investigate. A quick tour shows you the four things you will do in every
          case: open evidence, pin it, link it to a claim, and make a judgement.
        </p>
        <p className={s.small}>About two minutes. You can replay it any time from the top bar.</p>
      </Dialog>
    );

  if (!current) return null;
  const last = step === tourSteps.length;

  return (
    <>
      <section className={`${s.card} ${cardOnLeft ? s.cardLeft : ''}`} aria-labelledby={titleId}>
        <div aria-live="polite">
          {!last && (
            <p className={s.count}>
              Step {step} of {tourSteps.length - 1}
            </p>
          )}
          <h2 id={titleId} className={s.title}>
            {current.title}
          </h2>
          <p className={s.body}>{current.body({ assessment: !!c.meta.assessment })}</p>
        </div>
        <div className={s.actions}>
          {last ? (
            <Button variant="primary" icon="check" onClick={finish}>
              Finish
            </Button>
          ) : (
            <>
              <Button size="small" variant="ghost" onClick={finish}>
                End tour
              </Button>
              <Button size="small" icon="arrowRight" onClick={next}>
                Next
              </Button>
            </>
          )}
        </div>
      </section>
      {target &&
        createPortal(
          <div
            className={s.ring}
            style={{
              left: target.left - 4,
              top: target.top - 4,
              width: target.width + 8,
              height: target.height + 8,
            }}
            aria-hidden="true"
          />,
          document.body,
        )}
    </>
  );
}

/** Where the thing to use next is on screen, followed as windows move. */
function useTargetRect(selectors: string[]): DOMRect | null {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const key = selectors.join(',');

  useEffect(() => {
    const find = () => {
      for (const sel of key ? key.split(',') : []) {
        const el = Array.from(document.querySelectorAll<HTMLElement>(sel)).find(
          (e) => e.getClientRects().length > 0,
        );
        if (el) return el.getBoundingClientRect();
      }
      return null;
    };
    const update = () =>
      setRect((old) => {
        const r = find();
        const same =
          old &&
          r &&
          old.x === r.x &&
          old.y === r.y &&
          old.width === r.width &&
          old.height === r.height;
        return same ? old : r;
      });
    update();
    const timer = setInterval(update, 200);
    return () => clearInterval(timer);
  }, [key]);

  return rect;
}
