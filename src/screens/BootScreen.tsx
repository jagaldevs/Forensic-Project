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

/** A short "secure terminal" start-up. Skippable by click, tap or any key. */
export function BootScreen({ onDone }: { onDone: () => void }) {
  const reduced = usePrefersReducedMotion();
  const [shown, setShown] = useState(reduced ? lines.length : 0);
  const finished = shown >= lines.length;
  const doneRef = useRef(onDone);
  useEffect(() => {
    doneRef.current = onDone;
  });

  useEffect(() => {
    if (finished) return;
    const t = setTimeout(() => setShown((n) => n + 1), LINE_MS);
    return () => clearTimeout(t);
  }, [shown, finished]);

  // Auto-continue shortly after the title appears (not with reduced motion: wait for the student).
  useEffect(() => {
    if (!finished || reduced) return;
    const t = setTimeout(() => doneRef.current(), 1600);
    return () => clearTimeout(t);
  }, [finished, reduced]);

  useEffect(() => {
    const skip = (e: KeyboardEvent) => {
      if (e.key === 'Tab') return;
      doneRef.current();
    };
    window.addEventListener('keydown', skip);
    return () => window.removeEventListener('keydown', skip);
  }, []);

  return (
    <div className={s.stage} onClick={() => doneRef.current()}>
      <div className={s.scanline} aria-hidden="true" />
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
            <Button variant="primary" icon="arrowRight" onClick={() => doneRef.current()}>
              Enter the lab
            </Button>
          </div>
        )}
      </div>
      {!finished && (
        <Button className={s.skip} variant="ghost" onClick={() => doneRef.current()}>
          Skip intro
        </Button>
      )}
    </div>
  );
}
