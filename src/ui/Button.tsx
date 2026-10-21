import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';
import { Icon, type IconName } from './Icon';
import s from './ui.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'normal' | 'small';
  icon?: IconName;
  /** For icon-only buttons: required accessible name. */
  label?: string;
  children?: ReactNode;
  ref?: Ref<HTMLButtonElement>;
}

export function Button({
  variant = 'secondary',
  size = 'normal',
  icon,
  label,
  children,
  className,
  type = 'button',
  ...rest
}: ButtonProps) {
  const iconOnly = !children;
  const classes = [
    s.button,
    variant === 'primary' && s.primary,
    variant === 'ghost' && s.ghost,
    variant === 'danger' && `${s.ghost} ${s.danger}`,
    size === 'small' && s.small,
    iconOnly && s.iconOnly,
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <button
      type={type}
      className={classes}
      aria-label={iconOnly ? label : undefined}
      title={iconOnly ? label : undefined}
      {...rest}
    >
      {icon && <Icon name={icon} size={size === 'small' ? 18 : 20} />}
      {children}
    </button>
  );
}
