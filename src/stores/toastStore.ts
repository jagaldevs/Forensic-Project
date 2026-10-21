import { create } from 'zustand';
import type { DesktopAppId } from '../desktop/appMeta';
import type { IconName } from '../ui/Icon';

export interface Toast {
  id: number;
  title: string;
  body?: string;
  icon?: IconName;
  /** Optional button to open an app, e.g. "Open Photos". */
  action?: { label: string; appId: DesktopAppId; params?: Record<string, string> };
  /** A new toast with the same key replaces the old one instead of stacking. */
  key?: string;
}

interface ToastState {
  toasts: Toast[];
  push: (toast: Omit<Toast, 'id'>) => void;
  dismiss: (id: number) => void;
}

let nextId = 1;

/** Notifications (evidence drops, warrant outcomes). Not persisted. */
export const useToasts = create<ToastState>()((set, get) => ({
  toasts: [],
  push: (toast) => {
    const others = get().toasts.filter((t) => !toast.key || t.key !== toast.key);
    set({ toasts: [...others.slice(-3), { ...toast, id: nextId++ }] });
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}));
