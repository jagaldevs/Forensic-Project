import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { safeStorage } from '../lib/safeStorage';

/** Screens after the boot sequence (which always plays first, and is skippable). */
export type Screen =
  'agent' | 'cases' | 'academy' | 'mission' | 'review' | 'briefing' | 'desktop' | 'report';

interface NavState {
  screen: Screen;
  activeCaseId: string | null;
  activeMissionId: string | null;
  go: (screen: Screen) => void;
  openCase: (caseId: string, screen: Screen) => void;
  exitCase: () => void;
  openMission: (missionId: string) => void;
}

export const useNav = create<NavState>()(
  persist(
    (set) => ({
      screen: 'agent',
      activeCaseId: null,
      activeMissionId: null,
      go: (screen) => set({ screen }),
      openCase: (activeCaseId, screen) => set({ activeCaseId, screen }),
      exitCase: () => set({ activeCaseId: null, screen: 'cases' }),
      openMission: (activeMissionId) => set({ activeMissionId, screen: 'mission' }),
    }),
    { name: 'hrsfl-nav', version: 1, storage: createJSONStorage(() => safeStorage) },
  ),
);
