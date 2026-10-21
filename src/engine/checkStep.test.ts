import { describe, expect, test } from 'vitest';
import { checkStep, isAnswerComplete, normaliseAnswer, seededShuffle } from './checkStep';
import type { StepOfType } from './missionTypes';

const choice: StepOfType<'choice'> = {
  id: 'c',
  type: 'choice',
  title: 't',
  question: 'q',
  explanation: 'e',
  options: [
    { id: 'a', text: 'A', feedback: 'A is not it' },
    { id: 'b', text: 'B', feedback: 'B fb' },
    { id: 'c', text: 'C', feedback: 'C fb' },
  ],
  correct: ['b', 'c'],
};

const classify: StepOfType<'classify'> = {
  id: 'k',
  type: 'classify',
  title: 't',
  question: 'q',
  explanation: 'e',
  buckets: [
    { id: 'yes', label: 'Yes' },
    { id: 'no', label: 'No' },
  ],
  items: [
    { id: 'i1', text: 'one', bucket: 'yes', why: 'w' },
    { id: 'i2', text: 'two', bucket: 'no', why: 'w' },
  ],
};

describe('checkStep', () => {
  test('choice needs exactly the correct set, with feedback for wrong picks', () => {
    expect(checkStep(choice, { type: 'choice', selected: ['b', 'c'] }).correct).toBe(true);
    const wrong = checkStep(choice, { type: 'choice', selected: ['a', 'b'] });
    expect(wrong.correct).toBe(false);
    expect(wrong.hints).toEqual(['A is not it']);
    expect(checkStep(choice, { type: 'choice', selected: ['b'] }).hints[0]).toMatch(
      /another option/,
    );
  });

  test('classify names each misplaced item', () => {
    const r = checkStep(classify, { type: 'classify', placements: { i1: 'yes', i2: 'yes' } });
    expect(r.correct).toBe(false);
    expect(r.hints).toHaveLength(1);
    expect(r.hints[0]).toContain('two');
  });

  test('classify is only complete when every item is placed', () => {
    expect(isAnswerComplete(classify, { type: 'classify', placements: { i1: 'yes' } })).toBe(false);
  });

  test('short answers ignore case, spaces and full stops', () => {
    expect(normaliseAnswer(' 7:52 P.M. ')).toBe('7:52pm');
  });

  test('seeded shuffle is stable and never returns the original order', () => {
    const items = ['a', 'b', 'c', 'd'];
    expect(seededShuffle(items, 'x')).toEqual(seededShuffle(items, 'x'));
    for (const seed of ['a', 'b', 'c', 'd', 'e', 'f'])
      expect(seededShuffle(items, seed)).not.toEqual(items);
  });
});
