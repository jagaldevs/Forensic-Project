/**
 * Automated accessibility checks (axe-core): every evidence app in every case, with all
 * evidence unlocked and pinned, plus the Teacher Panel. Manual keyboard and screen-reader
 * checks are still needed; see docs/accessibility.md.
 */
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { Suspense } from 'react';
import { afterEach, beforeAll, describe, expect, test } from 'vitest';
import { CaseContext } from './app/CaseContext';
import { appComponents } from './apps/registry';
import { appsForCase, type DesktopAppId } from './desktop/appMeta';
import type { CaseFile } from './engine/types';
import { useProgress } from './stores/progressStore';
import { useSettings } from './stores/settingsStore';
import { axeViolations } from './test/axe';

const caseModules = import.meta.glob<{ default: CaseFile }>('./cases/*/case.ts', { eager: true });
const cases = Object.values(caseModules).map((m) => m.default);

/** A student part-way through: everything released, granted and pinned, one link made. */
function unlockEverything(c: CaseFile) {
  const p = useProgress.getState();
  const id = c.meta.id;
  p.startCase(id);
  for (const d of c.drops) p.releaseDrop(id, d.id);
  const byProportion = [...c.warrants.requests].sort(
    (a, b) => Number(b.proportionate) - Number(a.proportionate),
  );
  for (const r of byProportion) p.applyWarrant(c, r.id, 'Needed to test the case.');
  for (const e of c.evidence) p.pin(id, e.id);
  const [first] = c.evidence;
  const [q] = c.questions;
  if (first && q) p.link(id, first.id, q.id, 'supports');
}

async function renderApp(c: CaseFile, app: DesktopAppId) {
  const App = appComponents[app];
  const view = render(
    <CaseContext.Provider value={c}>
      <Suspense fallback={<p>Loading</p>}>
        <App params={{}} />
      </Suspense>
    </CaseContext.Provider>,
  );
  // Wait for the lazy chunk to replace the fallback.
  await waitFor(() => expect(screen.queryByText('Loading')).toBeNull(), { timeout: 5000 });
  return view;
}

beforeAll(() => {
  for (const c of cases) unlockEverything(c);
});
afterEach(cleanup);

for (const c of cases) {
  describe(`${c.meta.title}: apps pass axe`, () => {
    for (const app of appsForCase(c)) {
      test(app, async () => {
        const { container } = await renderApp(c, app);
        expect(await axeViolations(container)).toEqual([]);
      });
    }
  });
}

test('Teacher Panel passes axe', async () => {
  useSettings.getState().setTeacherMode(true);
  const c = cases[0]!;
  const { container } = await renderApp(c, 'teacher');
  expect(await axeViolations(container)).toEqual([]);
  useSettings.getState().setTeacherMode(false);
});
