import type { MissionMeta } from '../../engine/missionTypes';

export const meta: MissionMeta = {
  id: 'ip-networks',
  title: 'IP Addresses & Networks',
  concept: 'Networks',
  summary:
    'Find out what an IP address really points to: a household connection, not a person or a spot on a map.',
  estimatedMinutes: 7,
  order: 4,
  icon: 'globe',
  badge: {
    name: 'Network Navigator',
    description:
      'You can explain how one home connection shares an IP address, and why IP geolocation is only an estimate.',
  },
};
