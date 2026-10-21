import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { safeStorage } from '../lib/safeStorage';
import {
  emptyJudgement,
  MAX_CUSTODY_EVENTS,
  newCaseProgress,
  type CaseProgress,
  type CheckResult,
  type Judgement,
  type SelfRating,
  type WarrantApplication,
} from '../engine/progressTypes';
import { warrantsRemaining } from '../engine/availability';
import type { CaseFile, Relation } from '../engine/types';

interface ProgressState {
  cases: Record<string, CaseProgress>;

  startCase: (caseId: string) => void;
  resetCase: (caseId: string) => void;
  markBriefingRead: (caseId: string) => void;
  markViewed: (caseId: string, evidenceId: string) => void;

  pin: (caseId: string, evidenceId: string) => void;
  unpin: (caseId: string, evidenceId: string) => void;
  moveCard: (caseId: string, evidenceId: string, x: number, y: number) => void;
  link: (caseId: string, evidenceId: string, questionId: string, relation: Relation) => void;
  unlink: (caseId: string, evidenceId: string, questionId: string) => void;

  updateJudgement: (caseId: string, questionId: string, patch: Partial<Judgement>) => void;
  recordCheck: (caseId: string, questionId: string, result: CheckResult) => void;

  applyWarrant: (
    caseFile: CaseFile,
    requestId: string,
    justification: string,
  ) => WarrantApplication | null;
  releaseDrop: (caseId: string, dropId: string) => void;
  /** Marks the case complete. Assessments pass lock: true, which freezes it. */
  submit: (caseId: string, opts?: { lock?: boolean }) => void;
  /** Assessment cases: record that the student saved an answer (no checking). */
  saveJudgement: (caseId: string, questionId: string) => void;
  /** Chain of custody: the result of checking hashes. */
  logVerification: (caseId: string, results: { evidenceId: string; ok: boolean }[]) => void;
  /** Teacher mode: give back every warrant (applications are cleared). */
  resetWarrants: (caseId: string) => void;
  /** Teacher mode: re-open a submitted assessment (e.g. submitted by mistake). */
  unlock: (caseId: string) => void;
  /** Report: rate yourself against a success criterion (null clears it). */
  setSelfAssessment: (caseId: string, index: number, rating: SelfRating | null) => void;
  /** null removes the correction (the device is assumed to be on case time). */
  setClockCorrection: (caseId: string, deviceId: string, utcOffset: string | null) => void;

  /** Replace everything (used by progress-code import). */
  replaceAll: (cases: Record<string, CaseProgress>) => void;
}

/** Board positions for newly pinned cards: a loose grid on the left of the board. */
function nextCardSlot(board: CaseProgress['board']): { x: number; y: number } {
  const n = Object.keys(board).length;
  const col = n % 3;
  const row = Math.floor(n / 3);
  return { x: 32 + col * 236 + (row % 2) * 18, y: 32 + row * 176 + (col % 2) * 14 };
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => {
      /** Apply a change to one case's progress (creating it if needed). */
      const update = (caseId: string, fn: (p: CaseProgress) => void, force = false) => {
        const current = get().cases[caseId] ?? newCaseProgress(caseId);
        // A submitted assessment is frozen. Only views and hash checks are still logged.
        if (current.locked && !force) return;
        const next = structuredClone(current);
        fn(next);
        set({ cases: { ...get().cases, [caseId]: next } });
      };

      return {
        cases: {},

        startCase: (caseId) => {
          if (!get().cases[caseId]) update(caseId, () => {});
        },
        resetCase: (caseId) =>
          set({ cases: { ...get().cases, [caseId]: newCaseProgress(caseId) } }),
        markBriefingRead: (caseId) => update(caseId, (p) => void (p.briefingRead = true)),
        markViewed: (caseId, evidenceId) => {
          const now = Date.now();
          const last = get().cases[caseId]?.custody?.findLast((e) => e.evidenceId === evidenceId);
          // Re-renders and quick re-selections count as one view.
          if (last?.action === 'viewed' && now - last.at < 30_000) return;
          update(
            caseId,
            (p) => {
              p.viewed[evidenceId] ??= now;
              p.custody = [
                ...(p.custody ?? []),
                { at: now, evidenceId, action: 'viewed' as const },
              ].slice(-MAX_CUSTODY_EVENTS);
            },
            true,
          );
        },

        pin: (caseId, evidenceId) =>
          update(caseId, (p) => {
            if (!p.board[evidenceId]) p.board[evidenceId] = nextCardSlot(p.board);
          }),
        unpin: (caseId, evidenceId) =>
          update(caseId, (p) => {
            delete p.board[evidenceId];
            p.links = p.links.filter((l) => l.evidenceId !== evidenceId);
          }),
        moveCard: (caseId, evidenceId, x, y) =>
          update(caseId, (p) => {
            if (p.board[evidenceId]) p.board[evidenceId] = { x: Math.round(x), y: Math.round(y) };
          }),
        link: (caseId, evidenceId, questionId, relation) =>
          update(caseId, (p) => {
            if (!p.board[evidenceId]) p.board[evidenceId] = nextCardSlot(p.board);
            const existing = p.links.find(
              (l) => l.evidenceId === evidenceId && l.questionId === questionId,
            );
            if (existing) existing.relation = relation;
            else
              p.links.push({
                id: `${evidenceId}->${questionId}`,
                evidenceId,
                questionId,
                relation,
              });
          }),
        unlink: (caseId, evidenceId, questionId) =>
          update(caseId, (p) => {
            p.links = p.links.filter(
              (l) => !(l.evidenceId === evidenceId && l.questionId === questionId),
            );
          }),

        updateJudgement: (caseId, questionId, patch) =>
          update(caseId, (p) => {
            p.judgements[questionId] = {
              ...(p.judgements[questionId] ?? emptyJudgement()),
              ...patch,
            };
          }),
        recordCheck: (caseId, questionId, result) =>
          update(caseId, (p) => {
            const j = p.judgements[questionId] ?? emptyJudgement();
            p.judgements[questionId] = { ...j, attempts: j.attempts + 1, lastResult: result };
          }),

        applyWarrant: (caseFile, requestId, justification) => {
          const caseId = caseFile.meta.id;
          const request = caseFile.warrants.requests.find((r) => r.id === requestId);
          const progress = get().cases[caseId] ?? newCaseProgress(caseId);
          if (!request || progress.warrants.some((w) => w.requestId === requestId)) return null;
          const granted = request.proportionate && warrantsRemaining(caseFile, progress) > 0;
          const application: WarrantApplication = {
            requestId,
            justification: justification.trim(),
            granted,
            at: Date.now(),
          };
          update(caseId, (p) => void p.warrants.push(application));
          return application;
        },
        releaseDrop: (caseId, dropId) =>
          update(caseId, (p) => {
            if (!(dropId in p.releasedDrops)) p.releasedDrops[dropId] = Date.now();
          }),
        submit: (caseId, opts) =>
          update(caseId, (p) => {
            p.submittedAt ??= Date.now();
            if (opts?.lock) p.locked = true;
          }),
        saveJudgement: (caseId, questionId) =>
          update(caseId, (p) => {
            p.judgements[questionId] = {
              ...(p.judgements[questionId] ?? emptyJudgement()),
              savedAt: Date.now(),
            };
          }),
        logVerification: (caseId, results) =>
          update(
            caseId,
            (p) => {
              const at = Date.now();
              p.custody = [
                ...(p.custody ?? []),
                ...results.map((r) => ({
                  at,
                  evidenceId: r.evidenceId,
                  action: 'verified' as const,
                  ok: r.ok,
                })),
              ].slice(-MAX_CUSTODY_EVENTS);
            },
            true,
          ),
        resetWarrants: (caseId) => update(caseId, (p) => void (p.warrants = []), true),
        setSelfAssessment: (caseId, index, rating) =>
          update(caseId, (p) => {
            const next = { ...(p.selfAssessment ?? {}) };
            if (rating) next[index] = rating;
            else delete next[index];
            p.selfAssessment = next;
          }),
        unlock: (caseId) =>
          update(
            caseId,
            (p) => {
              p.locked = false;
              p.submittedAt = null;
            },
            true,
          ),
        setClockCorrection: (caseId, deviceId, utcOffset) =>
          update(caseId, (p) => {
            const next = { ...(p.clockCorrections ?? {}) };
            if (utcOffset) next[deviceId] = utcOffset;
            else delete next[deviceId];
            p.clockCorrections = next;
          }),

        replaceAll: (cases) => set({ cases }),
      };
    },
    { name: 'hrsfl-progress', version: 1, storage: createJSONStorage(() => safeStorage) },
  ),
);

/** Progress for one case (a fresh, unsaved object if the case has not been started). */
export function useCaseProgress(caseId: string): CaseProgress {
  const progress = useProgress((s) => s.cases[caseId]);
  return progress ?? EMPTY_CACHE.get(caseId);
}

const EMPTY_CACHE = {
  map: new Map<string, CaseProgress>(),
  get(caseId: string) {
    let p = this.map.get(caseId);
    if (!p) this.map.set(caseId, (p = newCaseProgress(caseId)));
    return p;
  },
};
