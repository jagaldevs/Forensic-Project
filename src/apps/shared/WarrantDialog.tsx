import { useState } from 'react';
import { accessWording } from '../../engine/accessWording';
import { warrantsRemaining } from '../../engine/availability';
import type { WarrantApplication } from '../../engine/progressTypes';
import type { WarrantRequest } from '../../engine/types';
import { playSound } from '../../lib/sound';
import { useProgress } from '../../stores/progressStore';
import { useToasts } from '../../stores/toastStore';
import { Button } from '../../ui/Button';
import { Dialog } from '../../ui/Dialog';
import { Icon } from '../../ui/Icon';
import ui from '../../ui/ui.module.css';
import { useCaseState } from './hooks';
import s from './shared.module.css';

const MIN_JUSTIFICATION = 25;

/**
 * Apply to a magistrate for a warrant. The student must justify the request in a sentence.
 * Proportionate requests are granted (using a warrant); disproportionate ones are refused
 * with an explanation, and no warrant is used.
 */
export function WarrantDialog({
  request,
  onClose,
}: {
  request: WarrantRequest;
  onClose: () => void;
}) {
  const { c, progress } = useCaseState();
  const previous = progress.warrants.find((w) => w.requestId === request.id);
  const [result, setResult] = useState<WarrantApplication | null>(previous ?? null);
  const [text, setText] = useState('');
  const remaining = warrantsRemaining(c, progress);
  const w = accessWording(c);
  const tooShort = text.trim().length < MIN_JUSTIFICATION;

  const apply = () => {
    const outcome = useProgress.getState().applyWarrant(c, request.id, text);
    if (!outcome) return;
    setResult(outcome);
    playSound(outcome.granted ? 'granted' : 'refused');
    if (outcome.granted)
      useToasts.getState().push({
        title: w.granted,
        body: request.outcome,
        icon: 'warrant',
      });
  };

  return (
    <Dialog
      title={w.dialogTitle}
      onClose={onClose}
      actions={
        result ? (
          <Button variant="primary" onClick={onClose}>
            Done
          </Button>
        ) : (
          <>
            <Button onClick={onClose}>Not now</Button>
            <Button
              variant="primary"
              icon="warrant"
              onClick={apply}
              disabled={tooShort || remaining <= 0}
            >
              {w.submit}
            </Button>
          </>
        )
      }
    >
      <div className={s.warrantScope}>
        <p className={s.warrantLabel}>You are asking for</p>
        <p className={s.warrantTitle}>{request.title}</p>
        <p>{request.scope}</p>
      </div>

      {result ? (
        <div className={result.granted ? s.outcomeGranted : s.outcomeRefused} role="status">
          <span className={s.outcomeStamp}>
            <Icon name={result.granted ? 'supports' : 'contradicts'} size={18} />
            {result.granted ? 'Granted' : 'Refused'}
          </span>
          <p>{request.outcome}</p>
          {result.justification && (
            <p className={s.outcomeJustification}>
              Your justification: &ldquo;{result.justification}&rdquo;
            </p>
          )}
        </div>
      ) : (
        <>
          <p className={s.warrantNote}>
            <Icon name="warrant" size={16} /> {w.left}: <strong>{remaining}</strong>. {w.decider} a
            request that is <strong>necessary</strong> (it would help answer a real question) and{' '}
            <strong>proportionate</strong> (it doesn&rsquo;t intrude on more privacy than it needs
            to). {w.refusedFree}
          </p>
          <label className={ui.label} htmlFor="justification">
            Why do you need this? (one sentence)
          </label>
          <span className={ui.hint} id="justification-hint">
            Say which question it would help answer, and why you can&rsquo;t answer it without it.
          </span>
          <textarea
            id="justification"
            className={ui.textarea}
            value={text}
            onChange={(e) => setText(e.target.value)}
            aria-describedby="justification-hint"
            data-autofocus
            rows={3}
          />
          {remaining <= 0 && (
            <p
              role="alert"
              style={{ color: 'var(--status-inconclusive)', marginTop: 'var(--space-2)' }}
            >
              {w.noneLeft}
            </p>
          )}
        </>
      )}
    </Dialog>
  );
}
