import { brand } from './brand';
import s from './Logo.module.css';

/**
 * The school logo slot. Shows a text placeholder until `brand.logoUrl` is set.
 */
export function Logo({ size = 'small' }: { size?: 'small' | 'large' }) {
  if (brand.logoUrl) {
    return <img className={`${s.img} ${s[size]}`} src={brand.logoUrl} alt={brand.logoAlt} />;
  }
  return (
    <span
      className={`${s.placeholder} ${s[size]}`}
      role="img"
      aria-label={`${brand.schoolName} (logo placeholder)`}
    >
      <span className={s.mark} aria-hidden="true">
        {brand.shortName}
      </span>
      <span className={s.text} aria-hidden="true">
        LOGO
      </span>
    </span>
  );
}
