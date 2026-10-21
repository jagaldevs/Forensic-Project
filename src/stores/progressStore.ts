import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { safeStorage } from '../lib/safeStorage';
import {
  emptyJudgement,
  newCaseProgress,
  type CaseProgress,
  type CheckResult,
  type Judgement,
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
  submit: (caseId: string) => void;
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
      const update = (caseId: string, fn: (p: CaseProgress) => void) => {
        const current = get().cases[caseId] ?? newCaseProgress(caseId);
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
          if (get().cases[caseId]?.viewed[evidenceId]) return;
          update(caseId, (p) => void (p.viewed[evidenceId] = Date.now()));
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
        submit: (caseId) => update(caseId, (p) => void (p.submittedAt = Date.now())),
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
