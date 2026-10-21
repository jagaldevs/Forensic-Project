/** Inline stroke icons (24×24, currentColor). No icon font or external requests. */
const paths = {
  brief: 'M4 5h16v12H8l-4 3V5z M8 9h8 M8 13h5',
  locker: 'M4 7l8-4 8 4v10l-8 4-8-4V7z M4 7l8 4 8-4 M12 11v10',
  photos: 'M3 6h18v13H3z M3 16l5-5 4 4 3-3 6 6 M15.5 9.5a1.5 1.5 0 1 0 0.01 0',
  globe: 'M12 3a9 9 0 1 0 0.01 0z M3 12h18 M12 3c2.8 3 2.8 15 0 18 M12 3c-2.8 3-2.8 15 0 18',
  router:
    'M3 14h18v5H3z M7 16.5h0.01 M11 16.5h0.01 M8 14l-2-6 M16 14l2-6 M9 7a4 4 0 0 1 6 0 M7 4.5a7 7 0 0 1 10 0',
  board: 'M3 4h18v14H3z M7 20l2-2 M17 20l-2-2 M8 9l5 3 4-4',
  gavel: 'M14 4l6 6 M11 7l6 6 M12.5 5.5l-5 5 M9 13l-6 6 M4 21h9',
  pin: 'M9 3h6 M10 3v6l-3 4h10l-3-4V3 M12 13v8',
  link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1 M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  close: 'M6 6l12 12 M18 6L6 18',
  minimise: 'M6 17h12',
  maximise: 'M5 5h14v14H5z',
  restore: 'M8 8h11v11H8z M5 16V5h11',
  lock: 'M6 11h12v9H6z M8.5 11V8a3.5 3.5 0 0 1 7 0v3',
  unlock: 'M6 11h12v9H6z M8.5 11V8a3.5 3.5 0 0 1 6.8-1',
  warrant: 'M6 3h9l4 4v14H6z M14 3v5h5 M9 13h7 M9 17h4',
  check: 'M5 12.5l4.5 4.5L19 7.5',
  supports: 'M12 3a9 9 0 1 0 0.01 0z M8 12.5l3 3 5-6',
  contradicts: 'M12 3a9 9 0 1 0 0.01 0z M9 9l6 6 M15 9l-6 6',
  inconclusive: 'M12 3a9 9 0 1 0 0.01 0z M8 12h8',
  unassessed: 'M12 3a9 9 0 1 0 0.01 0z M12 8v0.01 M12 11v5',
  question:
    'M12 3a9 9 0 1 0 0.01 0z M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .8-1 1.5v.7 M12 17v0.01',
  alert: 'M12 3l10 18H2z M12 10v4 M12 17.5v0.01',
  info: 'M12 3a9 9 0 1 0 0.01 0z M12 11v6 M12 7.5v0.01',
  volume: 'M4 9h4l5-4v14l-5-4H4z M16.5 9a4 4 0 0 1 0 6 M19 6.5a7.5 7.5 0 0 1 0 11',
  mute: 'M4 9h4l5-4v14l-5-4H4z M17 9l5 6 M22 9l-5 6',
  textsize: 'M4 18l5-12 5 12 M6 14h6 M15 18l3-7 3 7 M16 16h4',
  report: 'M6 3h12v18H6z M9 8h6 M9 12h6 M9 16h4',
  print: 'M7 9V3h10v6 M5 9h14v8H5z M7 14h10v7H7z',
  copy: 'M9 9h11v11H9z M5 15H4V4h11v1',
  exit: 'M14 4h5v16h-5 M10 8l-4 4 4 4 M6 12h10',
  arrowRight: 'M5 12h14 M13 6l6 6-6 6',
  arrowLeft: 'M19 12H5 M11 6l-6 6 6 6',
  hash: 'M5 9h15 M4 15h15 M10 4L8 20 M16 4l-2 16',
  eye: 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z M12 9a3 3 0 1 0 0.01 0z',
  search: 'M11 4a7 7 0 1 0 0.01 0z M16 16l5 5',
  plus: 'M12 5v14 M5 12h14',
  trash: 'M4 7h16 M10 11v6 M14 11v6 M6 7l1 13h10l1-13 M9 7V4h6v3',
  mapPin: 'M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z M12 7a2 2 0 1 0 0.01 0z',
  clock: 'M12 3a9 9 0 1 0 0.01 0z M12 7v5l3 2',
  user: 'M12 4a4 4 0 1 0 0.01 0z M4 21a8 8 0 0 1 16 0',
  download: 'M12 4v11 M7 10l5 5 5-5 M5 20h14',
  upload: 'M12 20V9 M7 14l5-5 5 5 M5 4h14',
  chevronDown: 'M6 9l6 6 6-6',
  menu: 'M4 7h16 M4 12h16 M4 17h16',
  bell: 'M6 16V11a6 6 0 0 1 12 0v5l2 2H4z M10 20a2 2 0 0 0 4 0',
  academy: 'M2 9l10-5 10 5-10 5z M6 11v5c0 1.5 3 3 6 3s6-1.5 6-3v-5 M22 9v6',
  badge: 'M12 14a5 5 0 1 0 0.01 0z M9 13.5L7 22l5-3 5 3-2-8.5 M12 3a5 5 0 1 0 0.01 0',
  medal:
    'M8 3l4 6 4-6 M12 21a6 6 0 1 0 0.01 0z M12 13l1.2 2.4 2.6.4-1.9 1.8.5 2.6-2.4-1.3-2.4 1.3.5-2.6-1.9-1.8 2.6-.4z',
  arrowUp: 'M12 19V5 M6 11l6-6 6 6',
  arrowDown: 'M12 5v14 M6 13l6 6 6-6',
  fingerprint:
    'M12 4a8 8 0 0 1 8 8 M4 12a8 8 0 0 1 4-6.9 M8 12a4 4 0 0 1 8 0v2 M12 12v4 M6 16c.5 2 1.5 3.5 3 5 M16 17c-.3 1.5-.8 2.8-1.5 4',
} as const;

export type IconName = keyof typeof paths;

interface IconProps {
  name: IconName;
  size?: number;
  /** Provide a label only when the icon is the sole content; otherwise it is decorative. */
  label?: string;
  className?: string;
}

export function Icon({ name, size = 20, label, className }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      <path d={paths[name]} />
    </svg>
  );
}
