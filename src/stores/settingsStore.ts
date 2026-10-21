import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { safeStorage } from '../lib/safeStorage';

export const textScales = [1, 1.125, 1.25] as const;
export type TextScale = (typeof textScales)[number];

interface SettingsState {
  /** Codename chosen by the student. Stored on this device only. */
  agentName: string;
  /** Sound is off by default (classroom-friendly). */
  muted: boolean;
  textScale: TextScale;
  setAgentName: (name: string) => void;
  toggleMuted: () => void;
  cycleTextScale: () => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set, get) => ({
      agentName: '',
      muted: true,
      textScale: 1,
      setAgentName: (agentName) => set({ agentName: agentName.trim().slice(0, 32) }),
      toggleMuted: () => set({ muted: !get().muted }),
      cycleTextScale: () => {
        const i = textScales.indexOf(get().textScale);
        set({ textScale: textScales[(i + 1) % textScales.length]! });
      },
    }),
    { name: 'hrsfl-settings', version: 1, storage: createJSONStorage(() => safeStorage) },
  ),
);
