import type { Evidence } from '../../engine/types';
import type { IconName } from '../../ui/Icon';

const icons: Record<Evidence['type'], IconName> = {
  photo: 'photos',
  loginRecord: 'user',
  ipRecord: 'globe',
  networkLog: 'router',
  messageThread: 'chat',
  cctvStill: 'camera',
  searchEntry: 'search',
  file: 'report',
  email: 'brief',
  wearableLog: 'clock',
  socialPost: 'feed',
  document: 'report',
};

export function evidenceIcon(item: Evidence): IconName {
  return icons[item.type];
}
