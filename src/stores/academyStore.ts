import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { safeStorage } from '../lib/safeStorage';
import { checkStep, MAX_TRIES, type StepAnswer, type StepResult } from '../engine/checkStep';
import type { Mission } from '../engine/missionTypes';

export interface StepProgress {
  attempts: number;
  correct: boolean;
  /** Right, or out of tries: the explanation is shown and the student can move on. */
  done: boolean;
  /** Hints from the last check. */
  hints: string[];
  answer?: StepAnswer;
}

export interface MissionProgress {
  startedAt: number;
  stepIndex: number;
  steps: Record<string, StepProgress>;
  completedAt: number | null;
}

interface AcademyState {
  missions: Record<string, MissionProgress>;
  start: (missionId: string) => void;
  goToStep: (missionId: string, index: number) => void;
  setAnswer: (missionId: string, stepId: string, answer: StepAnswer) => void;
  /** Check the current answer; returns the result. */
  submit: (mission: Mission, stepId: string) => StepResult;
  complete: (missionId: string) => void;
  /** Start again from step 1, keeping any badge already earned. */
  replay: (missionId: string) => void;
  replaceAll: (missions: Record<string, MissionProgress>) => void;
}

const emptyStep = (): StepProgress => ({ attempts: 0, correct: false, done: false, hints: [] });
const newMission = (): MissionProgress => ({
  startedAt: Date.now(),
  stepIndex: 0,
  steps: {},
  completedAt: null,
});

/** Training Academy progress, kept separate from case progress. */
export const useAcademy = create<AcademyState>()(
  persist(
    (set, get) => {
      const update = (missionId: string, fn: (m: MissionProgress) => void) => {
        const next = structuredClone(get().missions[missionId] ?? newMission());
        fn(next);
        set({ missions: { ...get().missions, [missionId]: next } });
      };

      return {
        missions: {},
        start: (id) => {
          if (!get().missions[id]) update(id, () => {});
        },
        goToStep: (id, index) => update(id, (m) => void (m.stepIndex = index)),
        setAnswer: (id, stepId, answer) =>
          update(id, (m) => {
            const s = (m.steps[stepId] ??= emptyStep());
            if (!s.done) s.answer = answer;
          }),
        submit: (mission, stepId) => {
          const step = mission.steps.find((s) => s.id === stepId)!;
          const current = get().missions[mission.meta.id]?.steps[stepId];
          const result = checkStep(step, current?.answer);
          update(mission.meta.id, (m) => {
            const s = (m.steps[stepId] ??= emptyStep());
            s.attempts += 1;
            s.correct = result.correct;
            s.hints = result.hints;
            s.done = result.correct || s.attempts >= MAX_TRIES || step.type === 'explain';
          });
          return result;
        },
        complete: (id) => update(id, (m) => void (m.completedAt ??= Date.now())),
        replay: (id) =>
          update(id, (m) => {
            m.stepIndex = 0;
            m.steps = {};
          }),
        replaceAll: (missions) => set({ missions }),
      };
    },
    { name: 'hrsfl-academy', version: 1, storage: createJSONStorage(() => safeStorage) },
  ),
);
