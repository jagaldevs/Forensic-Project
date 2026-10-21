import { formatZoned } from './driveFormat';
import d from './drive.module.css';

/** A time in the service's own zone, always with its zone label beside it. */
export function ZonedTime({
  iso,
  zone,
}: {
  iso: string;
  zone: { label: string; utcOffset: string };
}) {
  return (
    <span className={d.zoned}>
      <time dateTime={iso}>{formatZoned(iso, zone.utcOffset)}</time>
      <span className={d.zoneChip}>{zone.label}</span>
    </span>
  );
}
