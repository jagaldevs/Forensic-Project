import { useState, type ReactNode } from 'react';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import ui from '../ui/ui.module.css';

interface CodeDialogProps {
  title: string;
  label: string;
  children?: ReactNode;
  submitLabel: string;
  /** Return true if the code was accepted (the dialog then closes). */
  onSubmit: (code: string) => boolean;
  onClose: () => void;
}

/** Asks for a code (teacher code, assessment access code). */
export function CodeDialog({
  title,
  label,
  children,
  submitLabel,
  onSubmit,
  onClose,
}: CodeDialogProps) {
  const [code, setCode] = useState('');
  const [wrong, setWrong] = useState(false);

  const submit = () => {
    if (onSubmit(code)) onClose();
    else setWrong(true);
  };

  return (
    <Dialog
      title={title}
      onClose={onClose}
      actions={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button variant="primary" icon="unlock" onClick={submit} disabled={!code.trim()}>
            {submitLabel}
          </Button>
        </>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        {children}
        <label className={ui.label} htmlFor="access-code">
          {label}
        </label>
        <input
          id="access-code"
          data-autofocus
          className={`${ui.input} ${ui.mono}`}
          value={code}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          aria-invalid={wrong}
          aria-describedby={wrong ? 'access-code-error' : undefined}
          onChange={(e) => {
            setCode(e.target.value);
            setWrong(false);
          }}
        />
        {wrong && (
          <p
            id="access-code-error"
            role="alert"
            className={ui.hint}
            style={{ color: 'var(--status-contradicts)' }}
          >
            That code didn&rsquo;t work. Check it with your teacher.
          </p>
        )}
      </form>
    </Dialog>
  );
}
