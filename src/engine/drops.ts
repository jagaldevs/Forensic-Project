import type { CaseProgress } from './progressTypes';
import type { CaseFile, Drop } from './types';

/** When a drop becomes due (ms), or null if no trigger has fired yet. Manual triggers never auto-fire. */
export function dropDueAt(drop: Drop, progress: CaseProgress): number | null {
  const delay = (drop.delaySeconds ?? 0) * 1000;
  const firedAt = drop.triggers
    .map((t): number | null => {
      switch (t.type) {
        case 'manual':
          return null;
        case 'afterEvidenceViewed':
          return progress.viewed[t.evidenceId] ?? null;
        case 'afterQuestionChecked':
          return progress.judgements[t.questionId]?.lastResult?.at ?? null;
        case 'afterMinutes':
          return progress.startedAt + t.minutes * 60_000;
      }
    })
    .filter((v): v is number => v !== null);
  if (firedAt.length === 0) return null;
  return Math.min(...firedAt) + delay;
}

/** Drops that should be released now and have not been yet. */
export function dueDrops(caseFile: CaseFile, progress: CaseProgress, now = Date.now()): Drop[] {
  return caseFile.drops.filter((d) => {
    if (d.id in progress.releasedDrops) return false;
    const due = dropDueAt(d, progress);
    return due !== null && due <= now;
  });
}
