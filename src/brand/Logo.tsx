import { brand } from './brand';
import s from './Logo.module.css';

/** Height of the crest in the small (top bar) logo, in pixels. */
const CREST_HEIGHT = 40;

/**
 * The school logo slot: the full logo when large, just the crest when small (the wordmark
 * would be too small to read). Shows a text placeholder if `brand.logoUrl` is null.
 */
export function Logo({ size = 'small' }: { size?: 'small' | 'large' }) {
  if (brand.logoUrl && size === 'large')
    return <img className={`${s.img} ${s.large}`} src={brand.logoUrl} alt={brand.logoAlt} />;
  if (brand.logoUrl) {
    const { x, y, width, height, imageSize } = brand.crest;
    const scale = CREST_HEIGHT / height;
    return (
      <span
        className={s.crest}
        role="img"
        aria-label={brand.logoAlt}
        style={{ width: Math.round(width * scale), height: CREST_HEIGHT }}
      >
        <img
          src={brand.logoUrl}
          alt=""
          style={{
            width: imageSize * scale,
            height: imageSize * scale,
            left: -x * scale,
            top: -y * scale,
          }}
        />
      </span>
    );
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
