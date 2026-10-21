/**
 * Automated accessibility checks (axe-core) of whole screens, rendered through <App />.
 */
import { act, cleanup, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeAll, expect, test } from 'vitest';
import { App } from './app/App';
import type { MissionMeta } from './engine/missionTypes';
import { useDesktop } from './stores/desktopStore';
import { useNav, type Screen } from './stores/navStore';
import { useProgress } from './stores/progressStore';
import { useSettings } from './stores/settingsStore';
import { axeViolations } from './test/axe';

const missionMetas = import.meta.glob<{ meta: MissionMeta }>('./missions/*/meta.ts', {
  eager: true,
});
const firstMission = Object.values(missionMetas)[0]!.meta.id;
const caseId = 'waterfront-alibi';

async function showScreen(screen: Screen) {
  const user = userEvent.setup();
  const { container, getByRole } = render(<App />);
  await user.keyboard('{Escape}'); // fast-forward the boot sequence
  await user.click(getByRole('button', { name: /enter the lab/i }));
  act(() => {
    if (screen === 'mission') useNav.getState().openMission(firstMission);
    else useNav.getState().openCase(caseId, screen);
  });
  await waitFor(() => expect(container.querySelector('.loading')).toBeNull(), {
    timeout: 5000,
  });
  return container;
}

beforeAll(() => {
  useSettings.getState().setAgentName('Agent Test');
  useProgress.getState().startCase(caseId);
});
afterEach(cleanup);

const screens: Screen[] = ['agent', 'cases', 'academy', 'mission', 'review', 'briefing', 'report'];

for (const screen of screens) {
  test(`${screen} screen passes axe`, async () => {
    const container = await showScreen(screen);
    expect(await axeViolations(container)).toEqual([]);
  });
}

test('desktop with windows open passes axe', async () => {
  act(() => {
    useDesktop.getState().switchCase(caseId);
    useDesktop.getState().open('locker');
    useDesktop.getState().open('board');
  });
  const container = await showScreen('desktop');
  await waitFor(() => expect(container.querySelectorAll('[role="dialog"]').length).toBe(2), {
    timeout: 5000,
  });
  expect(await axeViolations(container)).toEqual([]);
  // The first-run tour (welcome dialog) is portalled to <body>.
  expect(document.querySelector('[aria-modal="true"]')).not.toBeNull();
  expect(await axeViolations(document.body)).toEqual([]);
});
