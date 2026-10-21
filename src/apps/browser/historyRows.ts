import type { EvidenceOfType } from '../../engine/types';

type History = EvidenceOfType<'browserHistory'>;
type Entry = History['entries'][number];

export type KindFilter = 'all' | 'search' | 'visit';

export type HistoryRow =
  | { type: 'entry'; at: string; entry: Entry }
  | { type: 'cleared'; at: string; to: string; note?: string };

/**
 * Entries that match the filter, with every cleared period slotted in where it happened.
 * Cleared gaps always show: they are part of the record, whatever the student filters for.
 * Times are "as recorded" strings, so they sort correctly as text.
 */
export function historyRows(item: History, query: string, kind: KindFilter) {
  const q = query.trim().toLowerCase();
  const matches = item.entries.filter(
    (e) =>
      (kind === 'all' || e.kind === kind) &&
      (!q || e.title.toLowerCase().includes(q) || (e.url ?? '').toLowerCase().includes(q)),
  );
  const rows: HistoryRow[] = [
    ...matches.map((entry) => ({ type: 'entry' as const, at: entry.at, entry })),
    ...(item.cleared ?? []).map((g) => ({
      type: 'cleared' as const,
      at: g.from,
      to: g.to,
      note: g.note,
    })),
  ];
  // Stable sort: an entry recorded in the same minute a gap starts stays before the gap.
  rows.sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0));
  return { rows, shown: matches.length, total: item.entries.length };
}
