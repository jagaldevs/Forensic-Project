import { expect, test } from 'vitest';
import { diffTables, formatSize, formatZoned } from './driveFormat';

test('formats a time in the service zone without converting it to case time', () => {
  expect(formatZoned('2026-09-17T13:52:00Z', '+00:00')).toBe('Thu 17 Sep 2026, 13:52');
  expect(formatZoned('2026-09-17T13:52:00Z', '+09:30')).toBe('Thu 17 Sep 2026, 23:22');
});

test('formats sizes', () => {
  expect(formatSize(500)).toBe('500 bytes');
  expect(formatSize(2048)).toBe('2 KB');
  expect(formatSize(1_572_864)).toBe('1.5 MB');
});

test('finds changed and new cells', () => {
  const d = diffTables(
    [
      ['Day 1', '4.2'],
      ['Day 2', '5.0'],
    ],
    [
      ['Day 1', '4.2'],
      ['Day 2', '7.9'],
      ['Day 3', '9.1'],
    ],
  );
  expect(d.changed).toBe(3);
  expect(d.rows[1]![1]).toEqual({ value: '7.9', was: '5.0', changed: true });
  expect(d.rows[0]![0]!.changed).toBe(false);
  expect(d.removedRows).toBe(0);
});
