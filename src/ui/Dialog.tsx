import { useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useFocusTrap } from '../lib/useFocusTrap';
import { Button } from './Button';
import s from './ui.module.css';

interface DialogProps {
  title: string;
  onClose: () => void;
  children: ReactNode;
  actions?: ReactNode;
  /** Wider dialog for richer content. */
  wide?: boolean;
}

/** Modal dialog with focus trap, Escape to close, and focus returned on close. */
export function Dialog({ title, onClose, children, actions, wide }: DialogProps) {
  const titleId = useId();
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, onClose);

  return createPortal(
    <div
      className={s.backdrop}
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={ref}
        className={s.dialog}
        style={wide ? { width: 'min(760px, 100%)' } : undefined}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div className={s.dialogHeader}>
          <h2 id={titleId} className={s.dialogTitle}>
            {title}
          </h2>
          <Button variant="ghost" icon="close" label="Close" onClick={onClose} />
        </div>
        {children}
        {actions && <div className={s.dialogActions}>{actions}</div>}
      </div>
    </div>,
    document.body,
  );
}
