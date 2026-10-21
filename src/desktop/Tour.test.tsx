/** The desktop tour moves on when the student does each thing, and is remembered once done. */
import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, test } from 'vitest';
import { CaseContext } from '../app/CaseContext';
import waterfront from '../cases/waterfront-alibi/case';
import { useDesktop } from '../stores/desktopStore';
import { useProgress } from '../stores/progressStore';
import { useSettings } from '../stores/settingsStore';
import { useTour } from '../stores/tourStore';
import { axeViolations } from '../test/axe';
import { Tour } from './Tour';

const id = waterfront.meta.id;
const item = waterfront.evidence.find(
  (e) => !e.lockedBy && !e.releasedBy && e.type !== 'ipRecord',
)!;
const question = waterfront.questions[0]!;

beforeEach(() => {
  useSettings.getState().setTourDone(false);
  useProgress.getState().resetCase(id);
  useProgress.getState().startCase(id);
  useDesktop.getState().switchCase(id);
  for (const w of [...useDesktop.getState().windows]) useDesktop.getState().close(w.id);
  useDesktop.getState().open('brief');
  useTour.getState().start();
});
afterEach(cleanup);

const renderTour = () =>
  render(
    <CaseContext.Provider value={waterfront}>
      <Tour />
    </CaseContext.Provider>,
  );
const heading = (name: string | RegExp) => screen.findByRole('heading', { name });

test('each step moves on when the student does it', async () => {
  const user = userEvent.setup();
  renderTour();
  await user.click(screen.getByRole('button', { name: 'Start the tour' }));
  await heading('Open the Evidence Locker');
  expect(await axeViolations(document.body)).toEqual([]);

  act(() => useDesktop.getState().open('locker'));
  await heading('Pin something to the board');

  act(() => useProgress.getState().pin(id, item.id));
  await heading('Open the Evidence Board');

  act(() => useDesktop.getState().open('board'));
  await heading('Link evidence to a claim');

  act(() => useProgress.getState().link(id, item.id, question.id, 'supports'));
  await heading('Make a judgement');

  act(() => useProgress.getState().updateJudgement(id, question.id, { verdict: 'possible' }));
  await heading(/You’re ready/);

  await user.click(screen.getByRole('button', { name: 'Finish' }));
  expect(useTour.getState().step).toBeNull();
  expect(useSettings.getState().tourDone).toBe(true);
});

test('Skip, Escape or End tour all remember it as done', async () => {
  const user = userEvent.setup();
  renderTour();
  await user.keyboard('{Escape}');
  expect(useTour.getState().step).toBeNull();
  expect(useSettings.getState().tourDone).toBe(true);

  useSettings.getState().setTourDone(false);
  act(() => useTour.getState().start());
  await user.click(screen.getByRole('button', { name: 'Start the tour' }));
  await user.click(screen.getByRole('button', { name: 'End tour' }));
  expect(useSettings.getState().tourDone).toBe(true);
});
