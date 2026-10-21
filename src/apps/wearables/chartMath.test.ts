import { describe, expect, test } from 'vitest';
import { minutesFrom, niceMax, offWristSpans, timeTicks, typicalInterval } from './chartMath';

const day = '2026-09-17';

describe('chartMath', () => {
  test('minutesFrom handles seconds and logs that cross midnight', () => {
    expect(minutesFrom('2026-09-17T21:05', day)).toBe(21 * 60 + 5);
    expect(minutesFrom('2026-09-17T21:05:30', day)).toBe(21 * 60 + 5.5);
    expect(minutesFrom('2026-09-18T01:00', day)).toBe(25 * 60);
  });

  test('off-wrist spans run from removed/charging to the next worn event, or the end', () => {
    const spans = offWristSpans(
      [
        { at: '2026-09-17T18:00', kind: 'removed', event: 'Band taken off' },
        { at: '2026-09-17T18:30', kind: 'worn', event: 'Band put on' },
        { at: '2026-09-17T21:05', kind: 'charging', event: 'On charger' },
        { at: '2026-09-17T21:10', kind: 'doorbell', event: 'Ignored' },
      ],
      day,
      30 * 60,
    );
    expect(spans).toEqual([
      { start: 18 * 60, end: 18 * 60 + 30 },
      { start: 21 * 60 + 5, end: 30 * 60 },
    ]);
    expect(offWristSpans(undefined, day, 100)).toEqual([]);
  });

  test('typical interval is the median gap', () => {
    expect(typicalInterval([0, 60, 120, 300])).toBe(60);
    expect(typicalInterval([5])).toBe(60);
  });

  test('ticks land on round times, at most about eight of them', () => {
    expect(timeTicks(17 * 60 + 10, 23 * 60)).toEqual([18, 19, 20, 21, 22, 23].map((h) => h * 60));
    expect(timeTicks(0, 24 * 60).length).toBeLessThanOrEqual(9);
  });

  test('niceMax rounds up to a tidy axis limit', () => {
    expect(niceMax(1340)).toBe(1500);
    expect(niceMax(96)).toBe(100);
    expect(niceMax(0)).toBe(1);
  });
});
