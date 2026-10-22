import type { CaseFile } from '../../engine/types';

/** Loaded eagerly for the case-select screen; the full case loads only when opened. */
export const meta: CaseFile['meta'] = {
  id: 'science-fair-switch',
  title: 'The Science Fair Switch',
  tagline:
    'The night before judging, Team 4’s results changed “from Morgan’s account”. Was it Morgan? Weigh the evidence.',
  yearLevel: 8,
  order: 4,
  estimatedMinutes: 45,
  difficulty: 'challenging',
  assessment: true,
  learningIntentions: [
    'Convert times between UTC and Darwin time to check a deadline.',
    'Compare an email with a genuine one to judge whether it really came from its sender.',
    'Explain why an account, a device or a log is not the same as a person.',
    'Use hashes to decide whether evidence has been changed since it was collected.',
    'Decide which requests for other people’s data are proportionate.',
  ],
  recommendedMissions: ['email-cloud', 'time-zones', 'metadata-matters', 'ethics-privacy'],
  successCriteria: [
    'I can convert a UTC time to ACST and use it to check a deadline.',
    'I can compare an email’s From, Reply to and recipients with a genuine email to judge where it came from.',
    'I can explain why “modified from Morgan’s account” does not prove Morgan made the change.',
    'I can use a hash mismatch to explain why a piece of evidence can’t be trusted.',
    'I can justify which data requests are proportionate and which are not.',
  ],
};
