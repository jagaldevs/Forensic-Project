import type { Evidence } from '../../engine/types';
import type { IconName } from '../../ui/Icon';

const icons: Record<Evidence['type'], IconName> = {
  photo: 'photos',
  loginRecord: 'user',
  ipRecord: 'globe',
  networkLog: 'router',
  messageThread: 'chat',
  cctvStill: 'camera',
  browserHistory: 'search',
  file: 'folder',
  email: 'mail',
  wearableLog: 'pulse',
  socialPost: 'feed',
  document: 'report',
};

export function evidenceIcon(item: Evidence): IconName {
  return icons[item.type];
}
