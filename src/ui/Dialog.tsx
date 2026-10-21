import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
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

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** Modal dialog with focus trap, Escape to close, and focus returned on close. */
export function Dialog({ title, onClose, children, actions, wide }: DialogProps) {
  const titleId = useId();
  const ref = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const node = ref.current;
    const first = node?.querySelector<HTMLElement>('[data-autofocus]') ?? node;
    first?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current();
      }
      if (e.key !== 'Tab' || !node) return;
      const items = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!items.length) return;
      const firstItem = items[0]!;
      const lastItem = items.at(-1)!;
      if (e.shiftKey && document.activeElement === firstItem) {
        e.preventDefault();
        lastItem.focus();
      } else if (!e.shiftKey && document.activeElement === lastItem) {
        e.preventDefault();
        firstItem.focus();
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      previouslyFocused?.focus?.();
    };
  }, []);

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
