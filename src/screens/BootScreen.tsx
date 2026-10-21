import { useEffect, useRef, useState } from 'react';
import { Logo } from '../brand/Logo';
import { brand } from '../brand/brand';
import { caseCatalogue } from '../cases';
import { usePrefersReducedMotion } from '../lib/usePrefersReducedMotion';
import { Button } from '../ui/Button';
import s from './screens.module.css';

interface Line {
  text: string;
  status?: 'OK' | string;
  accent?: boolean;
}

const lines: Line[] = [
  { text: `${brand.shortName}-FORENSICS SECURE TERMINAL v1.0`, accent: true },
  { text: 'Initialising evidence vault ............', status: 'OK' },
  { text: 'Verifying chain-of-custody keys .........', status: 'OK' },
  {
    text: 'Loading case index ......................',
    status: `OK (${caseCatalogue.length} case${caseCatalogue.length === 1 ? '' : 's'})`,
  },
  { text: 'Privacy mode: all data stays on this device' },
  { text: 'Access level: TRAINEE INVESTIGATOR', accent: true },
];

const LINE_MS = 380;

/**
 * A short "secure terminal" start-up. Click, tap or a key fast-forwards the animation; the
 * student then presses "Enter the lab" to go in (it never moves on by itself).
 */
export function BootScreen({ onDone }: { onDone: () => void }) {
  const reduced = usePrefersReducedMotion();
  const [shown, setShown] = useState(reduced ? lines.length : 0);
  const finished = shown >= lines.length;
  const enterRef = useRef<HTMLButtonElement>(null);
  const skip = () => setShown(lines.length);

  useEffect(() => {
    if (finished) return;
    const t = setTimeout(() => setShown((n) => n + 1), LINE_MS);
    return () => clearTimeout(t);
  }, [shown, finished]);

  // When the title appears, put keyboard focus on "Enter the lab".
  useEffect(() => {
    if (finished) enterRef.current?.focus();
  }, [finished]);

  // Any key fast-forwards (except Tab and Space: Space would then also press the button).
  useEffect(() => {
    if (finished) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab' || e.key === ' ' || e.repeat) return;
      e.preventDefault();
      skip();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [finished]);

  return (
    <div className={s.stage} onClick={finished ? undefined : skip}>
      <div className={s.boot} role="log" aria-live="polite" aria-label="Lab start-up">
        {lines.slice(0, shown).map((l, i) => (
          <div key={i} className={s.bootLine}>
            <span className={l.accent ? s.bootAccent : undefined}>{l.text}</span>
            {l.status && <span className={s.bootOk}> {l.status}</span>}
          </div>
        ))}
        {!finished && <span className={s.cursor} aria-hidden="true" />}
        {finished && (
          <div className={s.bootTitle}>
            <Logo size="large" />
            <h1>
              {brand.shortName} <span>{brand.labName}</span>
            </h1>
            <Button ref={enterRef} variant="primary" icon="arrowRight" onClick={onDone}>
              Enter the lab
            </Button>
          </div>
        )}
      </div>
      {!finished && (
        <Button className={s.skip} variant="ghost" onClick={skip}>
          Skip intro
        </Button>
      )}
    </div>
  );
}
