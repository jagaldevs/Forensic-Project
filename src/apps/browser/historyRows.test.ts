import { expect, test } from 'vitest';
import type { EvidenceOfType } from '../../engine/types';
import { historyRows } from './historyRows';

const item: EvidenceOfType<'browserHistory'> = {
  id: 'history',
  type: 'browserHistory',
  app: 'browser',
  title: 'History',
  summary: 'Test',
  source: 'Test',
  browser: 'Lumen Browser',
  profile: 'Test profile',
  deviceId: 'laptop',
  entries: [
    { at: '2026-09-17T15:30', kind: 'search', title: 'algae growth units' },
    { at: '2026-09-17T15:31', kind: 'visit', title: 'Algae facts', url: 'https://algae.example/' },
    { at: '2026-09-17T23:40', kind: 'visit', title: 'Homework hub' },
  ],
  cleared: [{ from: '2026-09-17T23:10', to: '2026-09-17T23:30' }],
};

test('slots cleared periods in time order', () => {
  const { rows } = historyRows(item, '', 'all');
  expect(rows.map((r) => r.type)).toEqual(['entry', 'entry', 'cleared', 'entry']);
});

test('filters by words, address and kind, but always keeps cleared periods', () => {
  expect(historyRows(item, 'ALGAE.example', 'all').shown).toBe(1);
  const searches = historyRows(item, '', 'search');
  expect(searches.shown).toBe(1);
  expect(searches.total).toBe(3);
  const nothing = historyRows(item, 'volcano', 'all');
  expect(nothing.shown).toBe(0);
  expect(nothing.rows.map((r) => r.type)).toEqual(['cleared']);
});
