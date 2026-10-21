import { formatShortDate, formatTime24, offsetMinutes } from '../../engine/format';

/** "Thu 17 Sep 2026, 13:52" in the given zone (no conversion hints: that's the student's job). */
export function formatZoned(iso: string, utcOffset: string): string {
  const year = new Date(Date.parse(iso) + offsetMinutes(utcOffset) * 60_000).getUTCFullYear();
  return `${formatShortDate(iso, utcOffset)} ${year}, ${formatTime24(iso, utcOffset, false)}`;
}

/** 2048 → "2 KB", 1_572_864 → "1.5 MB". */
export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} bytes`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(/\.0$/, '')} MB`;
}

export interface CellDiff {
  value: string;
  /** The value in the previous version, when it was different (or the cell is new). */
  was?: string;
  changed: boolean;
}

/** Cell-by-cell comparison of two versions of a table, row by row. */
export function diffTables(previous: string[][], current: string[][]) {
  let changed = 0;
  const rows: CellDiff[][] = current.map((row, r) =>
    row.map((value, col) => {
      const was = previous[r]?.[col];
      const isChanged = was !== value;
      if (isChanged) changed += 1;
      return { value, was: isChanged ? (was ?? '') : undefined, changed: isChanged };
    }),
  );
  const removedRows = Math.max(0, previous.length - current.length);
  return { rows, changed, removedRows };
}
