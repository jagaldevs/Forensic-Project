/**
 * Maths for the Wearables charts: recorded times on one axis, "not worn / charging" periods,
 * and tidy tick marks. Pure, so it is easy to test.
 */
import { minutesToClock } from '../../engine/timeline';
import type { EvidenceOfType } from '../../engine/types';

type Log = EvidenceOfType<'wearableLog'>;
export type LogEvent = NonNullable<Log['events']>[number];

/** Minutes since midnight of `baseDate` for a recorded "YYYY-MM-DDTHH:MM(:SS)" time. */
export function minutesFrom(recorded: string, baseDate: string): number {
  const full = recorded.length === 16 ? `${recorded}:00` : recorded;
  return (Date.parse(`${full}Z`) - Date.parse(`${baseDate}T00:00:00Z`)) / 60_000;
}

export interface Span {
  start: number;
  end: number;
}

/**
 * When the band was off the wrist or on its charger: from a "removed" or "charging" event until
 * the next "worn" event (or `untilMinutes` if it was never put back on).
 */
export function offWristSpans(
  events: LogEvent[] | undefined,
  baseDate: string,
  untilMinutes: number,
): Span[] {
  const spans: Span[] = [];
  let start: number | null = null;
  const sorted = [...(events ?? [])].sort(
    (a, b) => minutesFrom(a.at, baseDate) - minutesFrom(b.at, baseDate),
  );
  for (const e of sorted) {
    const t = minutesFrom(e.at, baseDate);
    if ((e.kind === 'removed' || e.kind === 'charging') && start === null) start = t;
    else if (e.kind === 'worn' && start !== null) {
      spans.push({ start, end: t });
      start = null;
    }
  }
  if (start !== null) spans.push({ start, end: Math.max(start, untilMinutes) });
  return spans;
}

/** The usual gap between readings (the median), so bars and line breaks are sized sensibly. */
export function typicalInterval(minutes: number[]): number {
  const gaps = minutes
    .slice(1)
    .map((m, i) => m - minutes[i]!)
    .filter((g) => g > 0)
    .sort((a, b) => a - b);
  return gaps[Math.floor(gaps.length / 2)] ?? 60;
}

/** Tick positions for a time axis, at a round step, with at most ~8 labels. */
export function timeTicks(start: number, end: number): number[] {
  const span = Math.max(end - start, 1);
  const step = [15, 30, 60, 120, 180, 240, 360, 720].find((s) => span / s <= 8) ?? 1440;
  const ticks: number[] = [];
  for (let t = Math.ceil(start / step) * step; t <= end + 1e-9; t += step) ticks.push(t);
  return ticks;
}

/** A round upper bound for the value axis, e.g. 1340 → 1500, 96 → 100. */
export function niceMax(value: number): number {
  if (value <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((s) => s * magnitude >= value)!;
  return step * magnitude;
}

/** "HH:MM" for minutes on the axis (wraps past midnight, like a clock). */
export const clockLabel = (minutes: number) => minutesToClock(minutes);
