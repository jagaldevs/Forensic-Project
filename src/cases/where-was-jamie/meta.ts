import type { CaseFile } from '../../engine/types';

/** Loaded eagerly for the case-select screen; the full case loads only when opened. */
export const meta: CaseFile['meta'] = {
  id: 'where-was-jamie',
  title: 'Where was Jamie?',
  tagline:
    'Jamie is safe. But on the night, the search went to the wrong beach. Rebuild the timeline and find out why.',
  yearLevel: 8,
  estimatedMinutes: 40,
  difficulty: 'standard',
  learningIntentions: [
    'Build a timeline from evidence recorded by different devices.',
    'Explain how time zone settings and clock errors can make evidence seem to contradict.',
    'Explain why a posted or cropped image can mislead, and how to check it.',
    'Use travel times to test whether a sequence of events is possible.',
  ],
  recommendedMissions: ['time-zones', 'metadata-matters', 'digital-footprints'],
  successCriteria: [
    'I can put evidence from different devices onto one accurate timeline.',
    'I can resolve an apparent contradiction by checking device settings.',
    'I can say what a piece of evidence shows, what it does not show, and how to check it.',
  ],
};
