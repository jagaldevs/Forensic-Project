import { create } from 'zustand';
import type { TourSnapshot } from '../desktop/tourSteps';

/**
 * The desktop tour's current step (not persisted: a reload starts it again from the welcome).
 * Whether it has been finished is remembered in settingsStore.tourDone.
 */
interface TourState {
  /** null when the tour is not showing. 0 is the welcome; 1… are tourSteps. */
  step: number | null;
  /** What things looked like when the step started (so "pin something" means a new pin). */
  baseline: TourSnapshot | null;
  start: () => void;
  goTo: (step: number, baseline: TourSnapshot) => void;
  stop: () => void;
}

export const useTour = create<TourState>()((set) => ({
  step: null,
  baseline: null,
  start: () => set({ step: 0, baseline: null }),
  goTo: (step, baseline) => set({ step, baseline }),
  stop: () => set({ step: null, baseline: null }),
}));
