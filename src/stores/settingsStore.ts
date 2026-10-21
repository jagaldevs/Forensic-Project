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
  /** Teacher mode (answer keys, notes, drop controls). Stays on until turned off. Not secure. */
  teacherMode: boolean;
  /** When teacher mode was first turned on on this device. Included in progress codes. */
  teacherModeUsedAt: number | null;
  /** The assessment access code was entered on this device. */
  assessmentAccess: boolean;
  setAgentName: (name: string) => void;
  toggleMuted: () => void;
  cycleTextScale: () => void;
  setTeacherMode: (on: boolean) => void;
  grantAssessmentAccess: () => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set, get) => ({
      agentName: '',
      muted: true,
      textScale: 1,
      teacherMode: false,
      teacherModeUsedAt: null,
      assessmentAccess: false,
      setAgentName: (agentName) => set({ agentName: agentName.trim().slice(0, 32) }),
      toggleMuted: () => set({ muted: !get().muted }),
      cycleTextScale: () => {
        const i = textScales.indexOf(get().textScale);
        set({ textScale: textScales[(i + 1) % textScales.length]! });
      },
      setTeacherMode: (teacherMode) =>
        set({
          teacherMode,
          teacherModeUsedAt: teacherMode
            ? (get().teacherModeUsedAt ?? Date.now())
            : get().teacherModeUsedAt,
        }),
      grantAssessmentAccess: () => set({ assessmentAccess: true }),
    }),
    { name: 'hrsfl-settings', version: 1, storage: createJSONStorage(() => safeStorage) },
  ),
);

if (import.meta.env.DEV) Object.assign(window, { __settings: useSettings });
