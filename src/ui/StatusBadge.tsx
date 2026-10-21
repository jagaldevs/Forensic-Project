import { Icon, type IconName } from './Icon';
import { statusInfo, type StatusKind } from './labels';
import s from './ui.module.css';

/** A relation/status badge: always icon + text, never colour alone. */
export function StatusBadge({ status }: { status: StatusKind }) {
  const info = statusInfo[status];
  return (
    <span className={`${s.badge} ${s[`badge-${status}`]}`}>
      <Icon name={info.icon} size={14} />
      {info.label}
    </span>
  );
}

export function Badge({
  tone,
  icon,
  children,
}: {
  tone: 'info' | 'accent' | StatusKind;
  icon?: IconName;
  children: React.ReactNode;
}) {
  return (
    <span className={`${s.badge} ${s[`badge-${tone}`]}`}>
      {icon && <Icon name={icon} size={14} />}
      {children}
    </span>
  );
}
