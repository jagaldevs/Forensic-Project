/** Keyboard flow on the evidence board: Link → claim → relation, with focus kept in place. */
import { cleanup, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, test } from 'vitest';
import { CaseContext } from '../../app/CaseContext';
import waterfront from '../../cases/waterfront-alibi/case';
import { useProgress } from '../../stores/progressStore';
import EvidenceBoardApp from './EvidenceBoardApp';

const id = waterfront.meta.id;
const item = waterfront.evidence.find(
  (e) => !e.lockedBy && !e.releasedBy && e.type !== 'ipRecord',
)!;

beforeEach(() => {
  useProgress.getState().resetCase(id);
  useProgress.getState().startCase(id);
  useProgress.getState().pin(id, item.id);
});

afterEach(cleanup);

const renderBoard = () =>
  render(
    <CaseContext.Provider value={waterfront}>
      <EvidenceBoardApp />
    </CaseContext.Provider>,
  );

test('linking by keyboard moves focus to the claims, then back to the card', async () => {
  const user = userEvent.setup();
  renderBoard();
  const linkButton = screen.getByRole('button', { name: /^Link / });
  await user.click(linkButton);

  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Link here (claim 1)' }));
  await user.keyboard('{Tab}');
  expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Link here (claim 2)' }));
  await user.keyboard('{Enter}');

  const dialog = screen.getByRole('dialog');
  await user.click(within(dialog).getByRole('button', { name: /Contradicts/ }));

  expect(screen.queryByRole('dialog')).toBeNull();
  expect(document.activeElement).toBe(screen.getByRole('button', { name: /^Link / }));
  const [link] = useProgress.getState().cases[id]!.links;
  expect(link).toMatchObject({ evidenceId: item.id, relation: 'contradicts' });
});

test('Escape cancels linking and returns focus to the card', async () => {
  const user = userEvent.setup();
  renderBoard();
  await user.click(screen.getByRole('button', { name: /^Link / }));
  await user.keyboard('{Escape}');
  expect(screen.queryByRole('button', { name: /Link here/ })).toBeNull();
  expect(document.activeElement).toBe(screen.getByRole('button', { name: /^Link / }));
});
