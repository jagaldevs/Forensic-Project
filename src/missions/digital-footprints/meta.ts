import type { MissionMeta } from '../../engine/missionTypes';

export const meta: MissionMeta = {
  id: 'digital-footprints',
  title: 'Digital Footprints',
  concept: 'Footprints',
  summary: 'Follow a fictional student’s Saturday and find the trail of data they leave behind.',
  estimatedMinutes: 6,
  order: 2,
  icon: 'fingerprint',
  badge: {
    name: 'Footprint Tracker',
    description:
      'You can tell active footprints from passive ones, and explain what a footprint does and doesn’t reveal.',
  },
};
