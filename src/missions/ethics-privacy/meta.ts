import type { MissionMeta } from '../../engine/missionTypes';

export const meta: MissionMeta = {
  id: 'ethics-privacy',
  title: 'Ethics & Privacy',
  concept: 'Warrants',
  summary: 'Decide which data requests are fair, and why a match is not the same as proof.',
  estimatedMinutes: 8,
  order: 6,
  icon: 'warrant',
  badge: {
    name: 'Privacy Guardian',
    description:
      'You can judge whether a request for data is necessary and proportionate, and explain why a match is not proof.',
  },
};
