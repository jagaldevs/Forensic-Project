import type { CaseFile } from '../../engine/types';

/** Loaded eagerly for the case-select screen; the full case loads only when opened. */
export const meta: CaseFile['meta'] = {
  id: 'midnight-raid',
  title: 'The Midnight Raid',
  tagline:
    'Camp night. A raided snack box, and “midnight snack ideas” in Kai’s phone history. Case closed? Not so fast.',
  yearLevel: 8,
  order: 3,
  estimatedMinutes: 35,
  difficulty: 'standard',
  learningIntentions: [
    'Tell the difference between what a search history shows (observation) and what people conclude from it (inference).',
    'Explain why an account or a device is not the same as a person.',
    'Explain what a sensor measures, what it does not measure, and how its readings can mislead.',
    'Explain how new evidence can change a conclusion.',
    'Decide which requests for someone’s data are fair, by collecting only what a question needs.',
  ],
  recommendedMissions: ['search-history', 'digital-footprints', 'ethics-privacy'],
  successCriteria: [
    'I can say what a search history shows and what it does not show about who typed a search.',
    'I can explain why a search on an account does not prove which person, or which device, made it.',
    'I can describe what a fitness band and a motion light measure, and what they cannot tell us.',
    'I can change my conclusion when new evidence arrives, and explain why.',
    'I can explain why asking for one hour of data is fair and asking for a whole year is not.',
  ],
};
