import type { CaseProgress } from './progressTypes';
import type { CaseFile, Evidence } from './types';

/** Evidence ids unlocked by granted warrants. */
export function unlockedIds(caseFile: CaseFile, progress: CaseProgress): Set<string> {
  const granted = new Set(progress.warrants.filter((w) => w.granted).map((w) => w.requestId));
  return new Set(
    caseFile.warrants.requests.filter((r) => granted.has(r.id)).flatMap((r) => r.targets),
  );
}

/** Hidden until its drop is released. */
export function isReleased(item: Evidence, progress: CaseProgress): boolean {
  return !item.releasedBy || item.releasedBy in progress.releasedDrops;
}

export function isLocked(item: Evidence, caseFile: CaseFile, progress: CaseProgress): boolean {
  return item.lockedBy === 'warrant' && !unlockedIds(caseFile, progress).has(item.id);
}

/** Evidence the student can see (released), whether locked or not. */
export function releasedEvidence(caseFile: CaseFile, progress: CaseProgress): Evidence[] {
  return caseFile.evidence.filter((e) => isReleased(e, progress));
}

/** Evidence the student can open and use (released and unlocked). */
export function usableEvidence(caseFile: CaseFile, progress: CaseProgress): Evidence[] {
  return releasedEvidence(caseFile, progress).filter((e) => !isLocked(e, caseFile, progress));
}

export function warrantsRemaining(caseFile: CaseFile, progress: CaseProgress): number {
  return caseFile.warrants.available - progress.warrants.filter((w) => w.granted).length;
}

/** The warrant request(s) that would unlock an evidence item. */
export function requestsFor(caseFile: CaseFile, evidenceId: string) {
  return caseFile.warrants.requests.filter((r) => r.targets.includes(evidenceId));
}
