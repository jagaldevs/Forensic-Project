import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { safeStorage } from '../lib/safeStorage';

/** Screens after the boot sequence (which always plays first, and is skippable). */
export type Screen = 'agent' | 'cases' | 'briefing' | 'desktop' | 'report';

interface NavState {
  screen: Screen;
  activeCaseId: string | null;
  go: (screen: Screen) => void;
  openCase: (caseId: string, screen: Screen) => void;
  exitCase: () => void;
}

export const useNav = create<NavState>()(
  persist(
    (set) => ({
      screen: 'agent',
      activeCaseId: null,
      go: (screen) => set({ screen }),
      openCase: (activeCaseId, screen) => set({ activeCaseId, screen }),
      exitCase: () => set({ activeCaseId: null, screen: 'cases' }),
    }),
    { name: 'hrsfl-nav', version: 1, storage: createJSONStorage(() => safeStorage) },
  ),
);
