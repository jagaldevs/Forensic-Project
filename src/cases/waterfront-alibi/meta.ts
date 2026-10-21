import type { CaseFile } from '../../engine/types';

/** Loaded eagerly for the case-select screen; the full case loads only when opened. */
export const meta: CaseFile['meta'] = {
  id: 'waterfront-alibi',
  title: 'The Waterfront Alibi',
  tagline: 'A trophy vanishes. An IP address points to the city. Does it point to Riley?',
  yearLevel: 8,
  estimatedMinutes: 25,
  difficulty: 'introductory',
  learningIntentions: [
    'Explain why an IP address location is an estimate, not an exact position.',
    'Distinguish between a device and the person using it.',
    'Judge how strongly evidence supports a claim, and state a limitation.',
    'Explain why warrants must be necessary and proportionate.',
  ],
  recommendedMissions: ['metadata-matters', 'ip-networks', 'ethics-privacy'],
  successCriteria: [
    'I can say what a piece of evidence shows and what it does not show.',
    'I can attach evidence to a judgement and justify my verdict.',
    'I can suggest further evidence and explain whether a warrant is justified.',
  ],
};
