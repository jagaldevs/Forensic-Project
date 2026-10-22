import type { MissionMeta } from '../../engine/missionTypes';

export const meta: MissionMeta = {
  id: 'email-cloud',
  title: 'Emails & Cloud Files',
  concept: 'Accounts',
  summary:
    'Read an email and a cloud file’s history like an investigator: what they show, and what they don’t.',
  estimatedMinutes: 9,
  order: 7,
  icon: 'mail',
  badge: {
    name: 'Inbox Inspector',
    description:
      'You can check who an email really came from, read a file’s version history in the right time zone, and explain why an account is not a person.',
  },
};
