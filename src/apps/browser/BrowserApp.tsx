import { useEffect, useState } from 'react';
import { usableEvidence } from '../../engine/availability';
import type { CaseFile, EvidenceOfType } from '../../engine/types';
import { useDesktop } from '../../stores/desktopStore';
import { useProgress } from '../../stores/progressStore';
import { Icon } from '../../ui/Icon';
import ui from '../../ui/ui.module.css';
import type { AppProps } from '../registry';
import { EvidenceHeader } from '../shared/EvidenceHeader';
import { useCaseState } from '../shared/hooks';
import s from '../shared/shared.module.css';
import { historyRows, type KindFilter } from './historyRows';
import b from './browser.module.css';

type History = EvidenceOfType<'browserHistory'>;

/** Histories from a phone or tablet are drawn inside a phone frame. */
function isHandheld(c: CaseFile, item: History): boolean {
  const type = c.devices.find((d) => d.id === item.deviceId)?.type;
  return type === 'phone' || type === 'tablet';
}

const kindFilters: { id: KindFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'search', label: 'Searches' },
  { id: 'visit', label: 'Pages visited' },
];

/** Browser & search history, one profile at a time, with visible "history cleared" gaps. */
export default function BrowserApp({ params }: AppProps) {
  const { c, progress, caseId } = useCaseState();
  const profiles = usableEvidence(c, progress).filter(
    (e): e is History => e.type === 'browserHistory',
  );
  const selected = profiles.find((p) => p.id === params.selected) ?? profiles[0] ?? null;

  useEffect(() => {
    if (selected) useProgress.getState().markViewed(caseId, selected.id);
  }, [selected, caseId]);

  if (!selected)
    return (
      <div className={s.empty}>
        <Icon name="search" size={40} />
        <p>No browser history has been collected yet.</p>
      </div>
    );

  return (
    <div className={s.app}>
      <div className={s.split}>
        <nav className={s.sidebar} aria-label="Browser profiles">
          <ul className={s.list}>
            {profiles.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  className={s.listItem}
                  aria-current={p.id === selected.id}
                  onClick={() => useDesktop.getState().setParams('browser', { selected: p.id })}
                >
                  <Icon name={isHandheld(c, p) ? 'phone' : 'search'} size={18} />
                  <span className={s.listItemText}>
                    <span>{p.title}</span>
                    <span className={s.listItemSub}>
                      {p.browser} · {p.profile}
                    </span>
                  </span>
                  {!progress.viewed[p.id] && <span className={s.newDot}>NEW</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className={s.main}>
          {/* Keyed so the filters reset when another profile is opened. */}
          <HistoryView key={selected.id} item={selected} />
        </div>
      </div>
    </div>
  );
}

function HistoryView({ item }: { item: History }) {
  const { c } = useCaseState();
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<KindFilter>('all');
  const device = c.devices.find((d) => d.id === item.deviceId);
  const { rows, shown, total } = historyRows(item, query, kind);
  const handheld = isHandheld(c, item);

  return (
    <article>
      <EvidenceHeader item={item} />
      <p className={b.deviceNote}>
        <Icon name="clock" size={14} className="inline-icon" /> Times are shown exactly as recorded
        by {device?.name ?? 'the device'} ({item.browser}).
      </p>

      <div className={handheld ? b.phone : undefined}>
        {handheld && (
          <div className={b.phoneTop} aria-hidden="true">
            <span>{device?.name}</span>
            <span>History</span>
          </div>
        )}
        <div className={b.filters}>
          <div className={b.searchBox}>
            <label className="visually-hidden" htmlFor={`history-filter-${item.id}`}>
              Filter history
            </label>
            <input
              id={`history-filter-${item.id}`}
              type="search"
              className={ui.input}
              placeholder="Filter by words or address…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className={b.kinds} role="group" aria-label="Show">
            {kindFilters.map((f) => (
              <button
                key={f.id}
                type="button"
                className={b.kind}
                aria-pressed={kind === f.id}
                onClick={() => setKind(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <p className={b.count} role="status">
          Showing {shown} of {total} entries
        </p>

        <ol className={b.list} aria-label={`History for ${item.profile}`}>
          {rows.map((row, i) => {
            const date = row.at.slice(0, 10);
            const heading = date !== rows[i - 1]?.at.slice(0, 10);
            return (
              <li key={`${row.type}-${row.at}-${i}`}>
                {heading && <h4 className={b.date}>{date}</h4>}
                {row.type === 'cleared' ? (
                  <div className={b.gap}>
                    <Icon name="trash" size={18} />
                    <div>
                      <strong>
                        History cleared: {row.at.slice(11, 16)} to {row.to.slice(11, 16)}.
                      </strong>{' '}
                      Anything visited in this period was deleted from this profile.
                      {row.note && <span className={b.gapNote}>{row.note}</span>}
                    </div>
                  </div>
                ) : (
                  <div className={b.entry}>
                    <span className={b.time}>{row.at.slice(11, 16)}</span>
                    <Icon name={row.entry.kind === 'search' ? 'search' : 'globe'} size={18} />
                    <span className={b.entryText}>
                      {row.entry.kind === 'search' ? (
                        <span>
                          Searched for <strong>“{row.entry.title}”</strong>
                        </span>
                      ) : (
                        <span>{row.entry.title}</span>
                      )}
                      {row.entry.url && <span className={b.url}>{row.entry.url}</span>}
                    </span>
                  </div>
                )}
              </li>
            );
          })}
        </ol>
        {shown === 0 && (
          <p className={b.none}>No entries match that filter. Try fewer words, or choose All.</p>
        )}
      </div>

      {item.note && (
        <p className={s.callout}>
          <Icon name="info" size={16} />
          {item.note}
        </p>
      )}
      <p className={s.prompt}>
        <strong>Think:</strong>{' '}
        {item.cleared?.length
          ? 'a cleared period shows that someone deleted history. It does not show what was visited, or who cleared it. Whose profile is this, and who else could use that device?'
          : 'a history shows what was searched and visited on this profile. It does not show who was typing, or why. Who else could use this device or account?'}
      </p>
    </article>
  );
}
