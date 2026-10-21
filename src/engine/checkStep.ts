import type { Step } from './missionTypes';

/** What a student has entered for a step. Saved as they work, so a reload keeps it. */
export type StepAnswer =
  | { type: 'choice'; selected: string[] }
  | { type: 'classify'; placements: Record<string, string> }
  | { type: 'order'; order: string[] }
  | { type: 'spot'; selected: string[] }
  | { type: 'shortAnswer'; text: string }
  | { type: 'reflect'; text: string };

export interface StepResult {
  correct: boolean;
  /** Targeted hints for a wrong answer. Empty when correct. */
  hints: string[];
}

/** A step is finished when it is right, or after this many tries (then the answer is explained). */
export const MAX_TRIES = 2;

const sameSet = (a: string[], b: string[]) =>
  a.length === b.length && a.every((x) => b.includes(x));

export function normaliseAnswer(text: string): string {
  return text.toLowerCase().replace(/[\s.]+/g, '');
}

/** Can the Check button be pressed yet? */
export function isAnswerComplete(step: Step, answer: StepAnswer | undefined): boolean {
  if (step.type === 'explain') return true;
  if (!answer || answer.type !== step.type) return false;
  switch (answer.type) {
    case 'choice':
    case 'spot':
      return answer.selected.length > 0;
    case 'classify':
      return step.type === 'classify' && step.items.every((i) => answer.placements[i.id]);
    case 'order':
      return answer.order.length > 0;
    case 'shortAnswer':
      return answer.text.trim().length > 0;
    case 'reflect':
      return step.type === 'reflect' && answer.text.trim().length >= step.minLength;
  }
}

export function checkStep(step: Step, answer: StepAnswer | undefined): StepResult {
  switch (step.type) {
    case 'explain':
      return { correct: true, hints: [] };

    case 'reflect':
      return { correct: isAnswerComplete(step, answer), hints: [] };

    case 'choice': {
      const selected = answer?.type === 'choice' ? answer.selected : [];
      const correct = sameSet(selected, step.correct);
      const hints = correct
        ? []
        : step.options
            .filter((o) => selected.includes(o.id) && !step.correct.includes(o.id))
            .map((o) => o.feedback);
      if (!correct && hints.length === 0)
        hints.push(
          'Some of your choices are right, but not all. Is there another option that fits?',
        );
      return { correct, hints };
    }

    case 'classify': {
      const placements = answer?.type === 'classify' ? answer.placements : {};
      const wrong = step.items.filter((i) => placements[i.id] !== i.bucket);
      return {
        correct: wrong.length === 0,
        hints: wrong.map((i) => `“${i.text}”: have another think about where this belongs.`),
      };
    }

    case 'order': {
      const order = answer?.type === 'order' ? answer.order : [];
      const target = step.items.map((i) => i.id);
      const inPlace = target.filter((id, i) => order[i] === id).length;
      const correct = inPlace === target.length && order.length === target.length;
      return {
        correct,
        hints: correct
          ? []
          : [`${inPlace} of ${target.length} are in the right place. Check the times carefully.`],
      };
    }

    case 'spot': {
      const selected = answer?.type === 'spot' ? answer.selected : [];
      const correct = sameSet(selected, step.correct);
      return { correct, hints: correct ? [] : [step.hint] };
    }

    case 'shortAnswer': {
      const text = answer?.type === 'shortAnswer' ? normaliseAnswer(answer.text) : '';
      const correct = step.accept.some((a) => normaliseAnswer(a) === text);
      return { correct, hints: correct ? [] : [step.hint] };
    }
  }
}

/** The answer key as an answer, used by tests to prove every step is solvable. */
export function correctAnswer(step: Step): StepAnswer | undefined {
  switch (step.type) {
    case 'explain':
      return undefined;
    case 'choice':
      return { type: 'choice', selected: [...step.correct] };
    case 'classify':
      return {
        type: 'classify',
        placements: Object.fromEntries(step.items.map((i) => [i.id, i.bucket])),
      };
    case 'order':
      return { type: 'order', order: step.items.map((i) => i.id) };
    case 'spot':
      return { type: 'spot', selected: [...step.correct] };
    case 'shortAnswer':
      return { type: 'shortAnswer', text: step.accept[0]! };
    case 'reflect':
      return { type: 'reflect', text: 'x'.repeat(step.minLength) };
  }
}

/** Deterministic shuffle (same seed, same order), never returning the original order. */
export function seededShuffle<T>(items: T[], seed: string): T[] {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  const random = () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  if (out.length > 1 && out.every((x, i) => x === items[i])) out.push(out.shift()!);
  return out;
}
