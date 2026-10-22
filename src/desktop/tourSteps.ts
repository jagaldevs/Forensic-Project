import type { DesktopAppId } from './appMeta';

/** What the tour watches to know a step is done. */
export interface TourSnapshot {
  /** The window in front. */
  top: DesktopAppId | null;
  pins: number;
  links: number;
  verdicts: number;
}

export interface TourStep {
  title: string;
  body: (opts: { assessment: boolean }) => string;
  /** CSS selectors for the thing to highlight; the first one on screen wins. */
  highlight: string[];
  /** Done when this is true (compared with the moment the step started). */
  done?: (now: TourSnapshot, start: TourSnapshot) => boolean;
}

/**
 * The first-run desktop tour, after the welcome. Each step moves on by itself when the
 * student does the thing, so they learn by doing; "Next" is always there too.
 */
export const tourSteps: TourStep[] = [
  {
    title: 'Open the Evidence Locker',
    body: () =>
      'Everything collected for this case is in the Locker. Open it from the dock at the bottom.',
    highlight: ['[data-dock-app="locker"]'],
    done: (now) => now.top === 'locker',
  },
  {
    title: 'Pin something to the board',
    body: () =>
      'Choose an item, read it, then press Pin to board. Pin anything that might matter, even if you are not sure yet.',
    highlight: ['[data-tour="pin"]'],
    done: (now, start) => now.pins > start.pins,
  },
  {
    title: 'Open the Evidence Board',
    body: () => 'Your pinned evidence is waiting on the board, next to the claims you are testing.',
    highlight: ['[data-dock-app="board"]'],
    done: (now) => now.top === 'board',
  },
  {
    title: 'Link evidence to a claim',
    body: () =>
      'Press Link on a card, then Link here on a claim, and choose Supports, Contradicts or Inconclusive.',
    highlight: ['[data-claim-link]', '[data-link-for]', '[data-dock-app="board"]'],
    done: (now, start) => now.links > start.links,
  },
  {
    title: 'Make a judgement',
    body: ({ assessment }) =>
      `Open Judgements and choose a verdict for a claim. Then say why, name one limitation, and press ${assessment ? 'Save my answer' : 'Check my judgement'}.`,
    highlight: ['[data-tour="verdicts"]', '[data-dock-app="judgements"]'],
    done: (now, start) => now.verdicts > start.verdicts,
  },
  {
    title: 'You’re ready, Agent',
    body: () =>
      'Explore, pin, link, judge, and ask what the evidence does not show. When every question is answered, open the Report. You can replay this tour with the ? button in the top bar.',
    highlight: [],
  },
];
