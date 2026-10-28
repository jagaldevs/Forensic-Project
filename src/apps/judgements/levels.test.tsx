/** Support levels in the apps: Guided notes and nudges, Deep dive challenges. */
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, test } from 'vitest';
import { CaseContext } from '../../app/CaseContext';
import waterfront from '../../cases/waterfront-alibi/case';
import type { SupportLevel } from '../../engine/progressTypes';
import { useProgress } from '../../stores/progressStore';
import { useSettings } from '../../stores/settingsStore';
import { EvidenceHeader } from '../shared/EvidenceHeader';
import JudgementsApp from './JudgementsApp';

const id = waterfront.meta.id;
const login = waterfront.evidence.find((e) => e.id === 'login-streamcloud')!;
const q1 = waterfront.questions[0]!;

beforeEach(() => {
  useSettings.getState().setTeacherMode(false);
  useProgress.getState().resetCase(id);
});
afterEach(cleanup);

const inCase = (ui: React.ReactNode, level: SupportLevel) => {
  useProgress.getState().setSupportLevel(id, level);
  return render(<CaseContext.Provider value={waterfront}>{ui}</CaseContext.Provider>);
};

test('Guided: evidence shows "What this means"; Standard does not', () => {
  const { unmount } = inCase(<EvidenceHeader item={login} />, 'guided');
  expect(screen.getByRole('complementary', { name: 'What this means' })).toHaveTextContent(
    login.guided!,
  );
  unmount();
  inCase(<EvidenceHeader item={login} />, 'standard');
  expect(screen.queryByRole('complementary', { name: 'What this means' })).toBeNull();
});

test('Guided: the nudge opens on request and is recorded for the teacher', async () => {
  const user = userEvent.setup();
  inCase(<JudgementsApp params={{ q: q1.id }} />, 'guided');
  await user.click(screen.getByRole('button', { name: 'Need a nudge?' }));
  expect(q1.kind === 'verdict' && screen.getByText(q1.nudge!)).toBeTruthy();
  expect(useProgress.getState().cases[id]!.nudgesUsed).toEqual([q1.id]);
  expect(screen.queryByRole('tab', { name: /Deep dive/ })).toBeNull();
});

test('Deep dive: challenges get their own tab, and answers are saved', async () => {
  const user = userEvent.setup();
  inCase(<JudgementsApp params={{ q: 'deep-dive' }} />, 'deep');
  expect(screen.getByRole('tab', { name: /Deep dive/ })).toHaveAttribute('aria-selected', 'true');
  expect(screen.queryByRole('button', { name: 'Need a nudge?' })).toBeNull();
  const [first] = waterfront.extensions!;
  await user.type(screen.getAllByLabelText('Your answer')[0]!, 'Both are inside');
  expect(useProgress.getState().cases[id]!.extensionAnswers).toEqual({
    [first!.id]: 'Both are inside',
  });
});

test('teacher mode previews the chosen level, keeping teacher notes', () => {
  useSettings.getState().setTeacherMode(true);
  const { unmount } = inCase(<EvidenceHeader item={login} />, 'standard');
  expect(screen.queryByRole('complementary', { name: 'What this means' })).toBeNull();
  expect(screen.getByRole('complementary', { name: 'Teacher note' })).toBeTruthy();
  unmount();
  const judgements = inCase(<JudgementsApp params={{ q: q1.id }} />, 'standard');
  expect(screen.queryByRole('tab', { name: /Deep dive/ })).toBeNull();
  judgements.unmount();
  inCase(<JudgementsApp params={{ q: q1.id }} />, 'deep');
  expect(screen.getByRole('tab', { name: /Deep dive/ })).toBeTruthy();
});

test('every case offers Deep dive challenges and some Guided notes', async () => {
  const modules = import.meta.glob<{ default: typeof waterfront }>('../../cases/*/case.ts', {
    eager: true,
  });
  for (const { default: c } of Object.values(modules)) {
    expect(c.extensions?.length, c.meta.id).toBeGreaterThan(0);
    expect(c.evidence.filter((e) => e.guided).length, c.meta.id).toBeGreaterThan(2);
  }
});
