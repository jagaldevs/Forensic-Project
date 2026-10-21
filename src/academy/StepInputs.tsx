/**
 * The interactive part of each mission step. Every input works with mouse, touch and
 * keyboard: no drag-and-drop is required (classify is tap-a-card, then tap-a-bucket).
 */
import { useState } from 'react';
import type { StepAnswer } from '../engine/checkStep';
import type { StepOfType } from '../engine/missionTypes';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import ui from '../ui/ui.module.css';
import a from './academy.module.css';

interface InputProps<T extends StepAnswer['type']> {
  step: StepOfType<T>;
  answer: Extract<StepAnswer, { type: T }> | undefined;
  onChange: (answer: Extract<StepAnswer, { type: T }>) => void;
  /** The step is finished: show the answer key instead of accepting input. */
  done: boolean;
}

export function ChoiceInput({ step, answer, onChange, done }: InputProps<'choice'>) {
  const multi = step.correct.length > 1;
  const selected = answer?.selected ?? [];
  const toggle = (id: string) =>
    onChange({
      type: 'choice',
      selected: multi
        ? selected.includes(id)
          ? selected.filter((x) => x !== id)
          : [...selected, id]
        : [id],
    });

  return (
    <div className={a.choiceList} role={multi ? 'group' : 'radiogroup'} aria-label={step.question}>
      {multi && <p className={a.instruction}>Choose all that apply.</p>}
      {step.options.map((o) => {
        const on = selected.includes(o.id);
        const isCorrect = step.correct.includes(o.id);
        return (
          <button
            key={o.id}
            type="button"
            className={a.choice}
            role={multi ? 'checkbox' : 'radio'}
            aria-checked={on}
            disabled={done}
            onClick={() => toggle(o.id)}
          >
            <span className={`${a.choiceMark} ${multi ? a.square : ''}`} aria-hidden="true">
              {on && <Icon name="check" size={14} />}
            </span>
            <span>
              {o.text}
              {done && isCorrect && <AnswerTag />}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function SpotInput({ step, answer, onChange, done }: InputProps<'spot'>) {
  const selected = answer?.selected ?? [];
  const toggle = (id: string) =>
    onChange({
      type: 'spot',
      selected: selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id],
    });
  return (
    <div className={a.choiceList} role="group" aria-label={step.question}>
      <p className={a.instruction}>Select the row or rows that answer the question.</p>
      {step.rows.map((r) => (
        <button
          key={r.id}
          type="button"
          className={a.choice}
          aria-pressed={selected.includes(r.id)}
          disabled={done}
          onClick={() => toggle(r.id)}
        >
          <span className={a.rowLabel}>{r.label}</span>
          <span className={a.rowValue}>
            {r.value}
            {done && step.correct.includes(r.id) && <AnswerTag />}
          </span>
        </button>
      ))}
    </div>
  );
}

export function ClassifyInput({ step, answer, onChange, done }: InputProps<'classify'>) {
  const placements = answer?.placements ?? {};
  const [picked, setPicked] = useState<string | null>(null);
  const unplaced = step.items.filter((i) => !placements[i.id]);

  const place = (bucket: string) => {
    if (!picked) return;
    onChange({ type: 'classify', placements: { ...placements, [picked]: bucket } });
    setPicked(null);
  };
  const unplace = (id: string) => {
    const next = { ...placements };
    delete next[id];
    onChange({ type: 'classify', placements: next });
    setPicked(id);
  };

  return (
    <div className={a.choiceList}>
      {!done && (
        <>
          <p className={a.instruction} aria-live="polite">
            {picked
              ? `Now choose a box for “${step.items.find((i) => i.id === picked)?.text}”.`
              : unplaced.length
                ? 'Select a card, then select the box it belongs in.'
                : 'All sorted. Select a placed card to move it.'}
          </p>
          {unplaced.length > 0 && (
            <div className={a.pool} aria-label="Cards to sort">
              {unplaced.map((i) => (
                <button
                  key={i.id}
                  type="button"
                  className={a.chip}
                  aria-pressed={picked === i.id}
                  onClick={() => setPicked(picked === i.id ? null : i.id)}
                >
                  {i.text}
                </button>
              ))}
            </div>
          )}
        </>
      )}
      <div className={a.buckets}>
        {step.buckets.map((b) => {
          const inside = step.items.filter((i) => (done ? i.bucket : placements[i.id]) === b.id);
          return (
            <section
              key={b.id}
              className={`${a.bucket} ${picked ? a.bucketReady : ''}`}
              aria-label={b.label}
            >
              <div className={a.bucketHead}>
                <span>{b.label}</span>
                {picked && !done && (
                  <Button size="small" variant="primary" onClick={() => place(b.id)}>
                    Put here
                  </Button>
                )}
              </div>
              {inside.map((i) =>
                done ? (
                  <div key={i.id} className={a.chip}>
                    <strong>{i.text}</strong>
                    <div className={a.instruction}>{i.why}</div>
                  </div>
                ) : (
                  <button key={i.id} type="button" className={a.chip} onClick={() => unplace(i.id)}>
                    {i.text}
                  </button>
                ),
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

export function OrderInput({
  step,
  order,
  onChange,
  done,
}: {
  step: StepOfType<'order'>;
  order: string[];
  onChange: (a: Extract<StepAnswer, { type: 'order' }>) => void;
  done: boolean;
}) {
  const shown = done ? step.items.map((i) => i.id) : order;
  const move = (index: number, delta: number) => {
    const next = [...order];
    const [item] = next.splice(index, 1);
    next.splice(index + delta, 0, item!);
    onChange({ type: 'order', order: next });
  };
  return (
    <ol className={a.orderList} aria-label={step.question}>
      {shown.map((id, index) => {
        const item = step.items.find((i) => i.id === id)!;
        return (
          <li key={id} className={a.orderItem}>
            <span>{item.text}</span>
            {!done && (
              <>
                <Button
                  size="small"
                  variant="ghost"
                  icon="arrowUp"
                  label={`Move “${item.text}” up`}
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                />
                <Button
                  size="small"
                  variant="ghost"
                  icon="arrowDown"
                  label={`Move “${item.text}” down`}
                  disabled={index === shown.length - 1}
                  onClick={() => move(index, 1)}
                />
              </>
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function ShortAnswerInput({ step, answer, onChange, done }: InputProps<'shortAnswer'>) {
  return (
    <div>
      <label className="visually-hidden" htmlFor={`sa-${step.id}`}>
        {step.question}
      </label>
      <input
        id={`sa-${step.id}`}
        className={`${ui.input} ${ui.mono}`}
        style={{ maxWidth: 320 }}
        value={done ? (answer?.text ?? step.accept[0]) : (answer?.text ?? '')}
        placeholder={step.placeholder}
        disabled={done}
        autoComplete="off"
        onChange={(e) => onChange({ type: 'shortAnswer', text: e.target.value })}
      />
    </div>
  );
}

export function ReflectInput({ step, answer, onChange, done }: InputProps<'reflect'>) {
  const text = answer?.text ?? '';
  return (
    <div>
      <label className="visually-hidden" htmlFor={`rf-${step.id}`}>
        {step.question}
      </label>
      <textarea
        id={`rf-${step.id}`}
        className={ui.textarea}
        rows={5}
        value={text}
        readOnly={done}
        onChange={(e) => onChange({ type: 'reflect', text: e.target.value })}
      />
      {!done && text.trim().length < step.minLength && (
        <p className={a.instruction}>
          Write at least a sentence or two. Only your teacher sees this.
        </p>
      )}
    </div>
  );
}

function AnswerTag() {
  return (
    <span
      style={{
        marginLeft: 8,
        color: 'var(--status-supports)',
        fontWeight: 700,
        whiteSpace: 'nowrap',
      }}
    >
      <Icon name="check" size={14} className="inline-icon" /> Answer
    </span>
  );
}
