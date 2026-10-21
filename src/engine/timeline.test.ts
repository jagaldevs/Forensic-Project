import { describe, expect, test } from 'vitest';
import { buildTimeline, hourHeadings, minutesToClock, recordedToMinutes } from './timeline';
import { travelEstimate } from './geo/travel';
import type { Evidence } from './types';

const doc = (id: string, recorded: string, deviceId?: string): Evidence => ({
  id,
  type: 'document',
  app: 'locker',
  title: id,
  summary: 's',
  source: 's',
  fields: [{ label: 'a', value: 'b' }],
  timeline: [{ recorded, deviceId, label: id }],
});

describe('timeline', () => {
  const evidence = [
    doc('cctv', '2026-08-22T18:45', 'cam'),
    doc('cousin-photo', '2026-08-22T19:12', 'cousin-phone'),
    doc('bus', '2026-08-22T19:31'),
  ];

  test('plots times exactly as recorded until a student corrects a device', () => {
    const points = buildTimeline(evidence, '2026-08-22', '+09:30');
    expect(points.map((p) => p.evidenceId)).toEqual(['cctv', 'cousin-photo', 'bus']);
    expect(points.every((p) => !p.corrected)).toBe(true);
  });

  test('correcting a phone set to AEST moves its events 30 minutes earlier', () => {
    const points = buildTimeline(evidence, '2026-08-22', '+09:30', { 'cousin-phone': '+10:00' });
    expect(points.map((p) => p.evidenceId)).toEqual(['cousin-photo', 'cctv', 'bus']);
    const photo = points.find((p) => p.evidenceId === 'cousin-photo')!;
    expect(minutesToClock(photo.minutes)).toBe('18:42');
    expect(photo.recordedClock).toBe('19:12');
    expect(photo.corrected).toBe(true);
  });

  test('handles seconds and times after midnight', () => {
    expect(recordedToMinutes('2026-08-22T19:12:30', '2026-08-22')).toBe(19 * 60 + 12.5);
    expect(minutesToClock(recordedToMinutes('2026-08-23T00:10', '2026-08-22'))).toBe('00:10');
  });
});

describe('hour headings', () => {
  test('one heading per hour, without dates when everything is on the case date', () => {
    const points = buildTimeline(
      [doc('a', '2026-08-22T18:45'), doc('b', '2026-08-22T18:50'), doc('c', '2026-08-22T19:31')],
      '2026-08-22',
      '+09:30',
    );
    expect(hourHeadings(points, '2026-08-22')).toEqual(['6:00 pm', null, '7:00 pm']);
  });

  test('past midnight, headings say which day', () => {
    const points = buildTimeline(
      [doc('a', '2026-08-22T23:40'), doc('b', '2026-08-23T00:15'), doc('c', '2026-08-23T00:20')],
      '2026-08-22',
      '+09:30',
    );
    expect(hourHeadings(points, '2026-08-22')).toEqual([
      'Sat 22 Aug, 11:00 pm',
      'Sun 23 Aug, 12:00 am',
      null,
    ]);
  });
});

describe('travelEstimate', () => {
  test('uses a road factor and gives a fastest-to-slowest range', () => {
    const e = travelEstimate({ x: 0, y: 0 }, { x: 3, y: 4 }, 'walk');
    expect(e.straightKm).toBe(5);
    expect(e.roadKm).toBeCloseTo(6.5);
    expect(e.minMinutes).toBe(71); // 6.5 km at 5.5 km/h
    expect(e.maxMinutes).toBe(87); // 6.5 km at 4.5 km/h
  });

  test('bus includes waiting time', () => {
    const e = travelEstimate({ x: 0, y: 0 }, { x: 0, y: 5 }, 'bus');
    expect(e.minMinutes).toBeGreaterThanOrEqual(3 + Math.round((6.5 / 25) * 60) - 1);
    expect(e.maxMinutes).toBe(Math.round((6.5 / 18) * 60 + 15));
  });
});
