import type { MissionMeta } from '../../engine/missionTypes';

export const meta: MissionMeta = {
  id: 'time-zones',
  title: 'Timestamps & Time Zones',
  concept: 'Time',
  summary:
    'Line up evidence from devices set to different time zones, and catch a mysterious 30-minute gap.',
  estimatedMinutes: 8,
  order: 5,
  icon: 'clock',
  badge: {
    name: 'Clock Watcher',
    description:
      'You can convert between time zones, order events from different devices, and explain why Darwin time trips people up.',
  },
};
