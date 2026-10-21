import type { MissionMeta } from '../../engine/missionTypes';

export const meta: MissionMeta = {
  id: 'metadata-matters',
  title: 'Metadata Matters',
  concept: 'Metadata',
  summary: 'Read the hidden information inside photos, and learn what it can and cannot tell you.',
  estimatedMinutes: 7,
  order: 1,
  icon: 'photos',
  badge: {
    name: 'Metadata Detective',
    description:
      'You can read photo metadata, spot edits and clock errors, and explain why metadata describes a device, not a person.',
  },
};
