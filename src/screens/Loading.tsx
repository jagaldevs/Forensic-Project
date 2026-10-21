import type { ReactNode } from 'react';
import s from './screens.module.css';

export function Loading({ label, children }: { label: string; children?: ReactNode }) {
  return (
    <div className={s.stage}>
      <div className={s.loading} role="status" aria-live="polite">
        <span className={s.spinner} aria-hidden="true" />
        <span>{label}…</span>
        {children}
      </div>
    </div>
  );
}
