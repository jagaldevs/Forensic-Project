/**
 * The Timeline: every timed moment in the collected evidence, on one line.
 *
 * Times are plotted exactly as each device recorded them. A student who discovers that a
 * device's clock was set to another time zone can apply a correction for that device, and
 * its events move to the right place. The engine never corrects anything by itself.
 */
import { offsetMinutes } from './format';
import type { Evidence } from './types';

/** Time zones a student can say a device was set to. */
export const clockZones = [
  { utcOffset: '+09:30', label: 'ACST (Darwin)' },
  { utcOffset: '+10:00', label: 'AEST (Brisbane, Sydney in winter)' },
  { utcOffset: '+10:30', label: 'ACDT (Adelaide in summer)' },
  { utcOffset: '+11:00', label: 'AEDT (Sydney in summer)' },
  { utcOffset: '+08:00', label: 'AWST (Perth)' },
  { utcOffset: '+00:00', label: 'UTC' },
] as const;

export interface TimelinePoint {
  evidenceId: string;
  label: string;
  deviceId?: string;
  /** Exactly as the device showed it, e.g. "19:12". */
  recordedClock: string;
  /** Minutes since midnight on the case date, in the case's zone, after any correction. */
  minutes: number;
  /** A correction moved this point. */
  corrected: boolean;
}

/** "2026-08-22T19:12" → minutes since midnight of `caseDate` (can go past 24 h or below 0). */
export function recordedToMinutes(recorded: string, caseDate: string): number {
  const ms = Date.parse(`${recorded.length === 16 ? `${recorded}:00` : recorded}Z`);
  const midnight = Date.parse(`${caseDate}T00:00:00Z`);
  return (ms - midnight) / 60_000;
}

export function minutesToClock(minutes: number): string {
  // Clocks truncate seconds (18:05:41 reads as 18:05), so floor rather than round.
  const m = ((Math.floor(minutes + 1e-9) % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

export function buildTimeline(
  evidence: Evidence[],
  caseDate: string,
  caseOffset: string,
  /** deviceId → the UTC offset the student believes that device's clock was set to. */
  corrections: Record<string, string> = {},
): TimelinePoint[] {
  const points: TimelinePoint[] = [];
  for (const item of evidence) {
    for (const t of item.timeline ?? []) {
      const recordedMinutes = recordedToMinutes(t.recorded, caseDate);
      const believed = t.deviceId ? corrections[t.deviceId] : undefined;
      const shift = believed ? offsetMinutes(caseOffset) - offsetMinutes(believed) : 0;
      points.push({
        evidenceId: item.id,
        label: t.label,
        deviceId: t.deviceId,
        recordedClock: t.recorded.slice(11, 16),
        minutes: recordedMinutes + shift,
        corrected: shift !== 0,
      });
    }
  }
  return points.sort((a, b) => a.minutes - b.minutes);
}

/** Devices that have at least one point on the timeline (the ones students can correct). */
export function timelineDeviceIds(evidence: Evidence[]): string[] {
  return [
    ...new Set(
      evidence.flatMap((e) =>
        (e.timeline ?? []).map((t) => t.deviceId).filter((d): d is string => !!d),
      ),
    ),
  ];
}
