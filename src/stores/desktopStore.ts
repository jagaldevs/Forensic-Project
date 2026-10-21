import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { safeStorage } from '../lib/safeStorage';
import { appMeta, type DesktopAppId } from '../desktop/appMeta';

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface WindowState extends Rect {
  id: DesktopAppId;
  z: number;
  minimised: boolean;
  maximised: boolean;
  /** App-specific state, e.g. which photo is selected. */
  params: Record<string, string>;
}

/** Below this desktop width, windows open maximised (e.g. iPad portrait). */
export const COMPACT_WIDTH = 900;
export const MIN_WINDOW = { w: 320, h: 240 };

/** The area windows live in, between the top bar and the dock. Set by the Desktop component. */
let desktopSize = { w: 1280, h: 680 };
export function setDesktopSize(w: number, h: number) {
  desktopSize = { w, h };
}
export function getDesktopSize() {
  return desktopSize;
}

/** Keep at least the title bar reachable, so a window can never be lost off-screen. */
export function clampRect(r: Rect, area = desktopSize): Rect {
  const w = Math.max(MIN_WINDOW.w, Math.min(r.w, area.w));
  const h = Math.max(MIN_WINDOW.h, Math.min(r.h, area.h));
  const x = Math.min(Math.max(r.x, -w + 120), area.w - 120);
  const y = Math.min(Math.max(r.y, 0), area.h - 48);
  return { x, y, w, h };
}

interface DesktopState {
  caseId: string | null;
  windows: WindowState[];
  topZ: number;
  /** Clears the desktop when switching to a different case. */
  switchCase: (caseId: string) => void;
  open: (id: DesktopAppId, params?: Record<string, string>) => void;
  close: (id: DesktopAppId) => void;
  focus: (id: DesktopAppId) => void;
  minimise: (id: DesktopAppId) => void;
  toggleMaximise: (id: DesktopAppId) => void;
  setRect: (id: DesktopAppId, rect: Rect) => void;
  setParams: (id: DesktopAppId, params: Record<string, string>) => void;
}

export const useDesktop = create<DesktopState>()(
  persist(
    (set, get) => {
      const patch = (id: DesktopAppId, fn: (w: WindowState) => Partial<WindowState>) =>
        set({ windows: get().windows.map((w) => (w.id === id ? { ...w, ...fn(w) } : w)) });

      return {
        caseId: null,
        windows: [],
        topZ: 1,

        switchCase: (caseId) => {
          if (get().caseId !== caseId) set({ caseId, windows: [], topZ: 1 });
        },

        open: (id, params = {}) => {
          const z = get().topZ + 1;
          const existing = get().windows.find((w) => w.id === id);
          if (existing) {
            patch(id, (w) => ({ z, minimised: false, params: { ...w.params, ...params } }));
            set({ topZ: z });
            return;
          }
          const meta = appMeta[id];
          const open = get().windows.filter((w) => !w.minimised).length;
          const area = desktopSize;
          const w = Math.min(meta.width, area.w - 32);
          const h = Math.min(meta.height, area.h - 24);
          const cascade = (open % 6) * 28;
          const rect = clampRect({
            x: Math.max(16, (area.w - w) / 2 - 80 + cascade),
            y: Math.max(12, (area.h - h) / 2 - 30 + cascade),
            w,
            h,
          });
          const win: WindowState = {
            id,
            ...rect,
            z,
            minimised: false,
            maximised: area.w < COMPACT_WIDTH,
            params,
          };
          set({ windows: [...get().windows, win], topZ: z });
        },

        close: (id) => set({ windows: get().windows.filter((w) => w.id !== id) }),

        focus: (id) => {
          const target = get().windows.find((w) => w.id === id);
          if (!target || target.z === get().topZ) return;
          const z = get().topZ + 1;
          patch(id, () => ({ z }));
          set({ topZ: z });
        },

        minimise: (id) => patch(id, () => ({ minimised: true })),
        toggleMaximise: (id) => patch(id, (w) => ({ maximised: !w.maximised })),
        setRect: (id, rect) => patch(id, () => clampRect(rect)),
        setParams: (id, params) => patch(id, (w) => ({ params: { ...w.params, ...params } })),
      };
    },
    {
      name: 'hrsfl-desktop',
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: ({ caseId, windows, topZ }) => ({ caseId, windows, topZ }),
    },
  ),
);

/** Which window is in front (and not minimised). */
export function topWindowId(windows: WindowState[]): DesktopAppId | null {
  const visible = windows.filter((w) => !w.minimised);
  if (!visible.length) return null;
  return visible.reduce((a, b) => (a.z > b.z ? a : b)).id;
}
