import type { MissionMeta } from '../../engine/missionTypes';

export const meta: MissionMeta = {
  id: 'search-history',
  title: 'Search History & Cookies',
  concept: 'Browsers',
  summary: 'Read a shared family computer’s history, and learn why an account is not a person.',
  estimatedMinutes: 6,
  order: 3,
  icon: 'search',
  badge: {
    name: 'History Buff',
    description:
      'You know what browser history and cookies can show, and why shared devices and cleared history need careful reasoning.',
  },
};
