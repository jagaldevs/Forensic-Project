import { expect, test } from 'vitest';
import waterfront from '../cases/waterfront-alibi/case';
import jamie from '../cases/where-was-jamie/case';
import { appsForCase } from './appMeta';

test('each case gets only the apps its evidence needs, plus the core four', () => {
  const w = appsForCase(waterfront);
  expect(w).toEqual(
    expect.arrayContaining([
      'brief',
      'locker',
      'board',
      'judgements',
      'photos',
      'iplookup',
      'netlog',
      'map',
    ]),
  );
  expect(w).not.toContain('messages');
  expect(w).not.toContain('timeline');

  const j = appsForCase(jamie);
  expect(j).toEqual(
    expect.arrayContaining(['messages', 'social', 'photos', 'cctv', 'map', 'timeline']),
  );
  expect(j).not.toContain('iplookup');
  expect(j).not.toContain('netlog');
});
