import { useEffect } from 'react';
import { useDesktop } from '../stores/desktopStore';
import { useToasts, type Toast } from '../stores/toastStore';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import s from './desktop.module.css';

const LIFETIME_MS = 12_000;

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useToasts((st) => st.dismiss);
  useEffect(() => {
    const t = setTimeout(() => dismiss(toast.id), LIFETIME_MS);
    return () => clearTimeout(t);
  }, [toast.id, dismiss]);

  return (
    <div className={s.toast}>
      <Icon name={toast.icon ?? 'bell'} />
      <div>
        <div className={s.toastTitle}>{toast.title}</div>
        {toast.body && <div className={s.toastBody}>{toast.body}</div>}
        {toast.action && (
          <Button
            className={s.toastAction}
            size="small"
            variant="primary"
            onClick={() => {
              useDesktop.getState().open(toast.action!.appId, toast.action!.params);
              dismiss(toast.id);
            }}
          >
            {toast.action.label}
          </Button>
        )}
      </div>
      <Button
        size="small"
        variant="ghost"
        icon="close"
        label="Dismiss notification"
        onClick={() => dismiss(toast.id)}
      />
    </div>
  );
}

/** Notifications. Announced to screen readers via a polite live region. */
export function Toasts() {
  const toasts = useToasts((st) => st.toasts);
  return (
    <div className={s.toasts} role="status" aria-live="polite">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}
