/**
 * Chain of custody: when each item was collected, every time it was viewed, and every hash
 * check. Collection is worked out from progress (case start, warrants, drops, lookups); views
 * and checks are logged as they happen.
 */
import { collectedEvidence, isLocked } from './availability';
import type { CaseProgress } from './progressTypes';
import type { CaseFile, Evidence } from './types';

export interface CustodyLine {
  at: number;
  evidenceId: string;
  action: 'collected' | 'viewed' | 'verified';
  detail: string;
  /** For "verified": whether the hash matched. */
  ok?: boolean;
}

/** When (and how) an item came into the investigation, or null if it has not yet. */
export function collection(
  item: Evidence,
  c: CaseFile,
  progress: CaseProgress,
): { at: number; detail: string } | null {
  if (item.releasedBy) {
    const at = progress.releasedDrops[item.releasedBy];
    if (at === undefined) return null;
    const drop = c.drops.find((d) => d.id === item.releasedBy);
    return { at, detail: `Delivered: ${drop?.title ?? 'new evidence'}` };
  }
  if (item.app === 'iplookup') {
    const at = progress.viewed[item.id];
    return at === undefined ? null : { at, detail: 'Found with IP Lookup' };
  }
  if (item.lockedBy === 'warrant') {
    if (isLocked(item, c, progress)) return null;
    const request = c.warrants.requests.find(
      (r) =>
        r.targets.includes(item.id) &&
        progress.warrants.some((w) => w.granted && w.requestId === r.id),
    );
    const grant = progress.warrants.find((w) => w.granted && w.requestId === request?.id);
    return { at: grant?.at ?? progress.startedAt, detail: `Warrant granted: ${request?.title}` };
  }
  return { at: progress.startedAt, detail: 'In the case file when it opened' };
}

/** Every custody event for collected items, oldest first. */
export function custodyLog(c: CaseFile, progress: CaseProgress): CustodyLine[] {
  const ids = new Set(collectedEvidence(c, progress).map((e) => e.id));
  const lines: CustodyLine[] = [];
  for (const item of c.evidence) {
    if (!ids.has(item.id)) continue;
    const got = collection(item, c, progress);
    if (got)
      lines.push({ at: got.at, evidenceId: item.id, action: 'collected', detail: got.detail });
  }
  for (const e of progress.custody ?? []) {
    if (!ids.has(e.evidenceId)) continue;
    lines.push(
      e.action === 'viewed'
        ? { at: e.at, evidenceId: e.evidenceId, action: 'viewed', detail: 'Examined' }
        : {
            at: e.at,
            evidenceId: e.evidenceId,
            action: 'verified',
            detail: e.ok ? 'Hash matches the collection record' : 'Hash MISMATCH',
            ok: e.ok,
          },
    );
  }
  // Collection comes first when events share a timestamp.
  const order = { collected: 0, viewed: 1, verified: 2 };
  return lines.sort((a, b) => a.at - b.at || order[a.action] - order[b.action]);
}
