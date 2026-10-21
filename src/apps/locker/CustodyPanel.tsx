import { useState } from 'react';
import { collectedEvidence, isLocked } from '../../engine/availability';
import { custodyLog, type CustodyLine } from '../../engine/custody';
import { formatLocalDateTime } from '../../engine/format';
import { hashCheck } from '../../engine/hash';
import type { Evidence } from '../../engine/types';
import { playSound } from '../../lib/sound';
import { usePrefersReducedMotion } from '../../lib/usePrefersReducedMotion';
import { useDesktop } from '../../stores/desktopStore';
import { useProgress } from '../../stores/progressStore';
import { Button } from '../../ui/Button';
import { Icon, type IconName } from '../../ui/Icon';
import { Badge } from '../../ui/StatusBadge';
import { useCaseState } from '../shared/hooks';
import s from '../shared/shared.module.css';
import l from './locker.module.css';

type Result = { item: Evidence; ok: boolean };

const actionIcons: Record<CustodyLine['action'], IconName> = {
  collected: 'locker',
  viewed: 'eye',
  verified: 'hash',
};

const actionLabels: Record<CustodyLine['action'], string> = {
  collected: 'Collected',
  viewed: 'Viewed',
  verified: 'Hash checked',
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** The locker's overview: verify every hash, and the full chain-of-custody log. */
export function CustodyPanel() {
  const { c, progress, caseId } = useCaseState();
  const reduced = usePrefersReducedMotion();
  const items = collectedEvidence(c, progress).filter((e) => !isLocked(e, c, progress));
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<Result[] | null>(null);
  const [showAll, setShowAll] = useState(false);

  const verifyAll = async () => {
    setRunning(true);
    const done: Result[] = [];
    setResults([]);
    for (const item of items) {
      const check = await hashCheck(item);
      done.push({ item, ok: check.match });
      setResults([...done]);
      if (!reduced) await wait(140);
    }
    useProgress.getState().logVerification(
      caseId,
      done.map((r) => ({ evidenceId: r.item.id, ok: r.ok })),
    );
    playSound(done.every((r) => r.ok) ? 'success' : 'hint');
    setRunning(false);
  };

  const mismatches = results?.filter((r) => !r.ok) ?? [];
  const log = custodyLog(c, progress).reverse();
  const shown = showAll ? log : log.slice(0, 25);
  const title = (id: string) => c.evidence.find((e) => e.id === id)?.title ?? id;

  return (
    <div className={l.overview}>
      <section aria-labelledby="verify-title">
        <h3 id="verify-title" className={l.heading}>
          <Icon name="hash" size={18} /> Hash verification
        </h3>
        <p className={l.intro}>
          Every item was given a SHA-256 hash when it was collected: a fingerprint of its exact
          contents. Re-checking shows whether anything has changed since.
        </p>
        <Button variant="primary" icon="refresh" onClick={verifyAll} disabled={running}>
          {running ? 'Verifying…' : `Verify all ${items.length} hashes`}
        </Button>

        {results && (
          <ul className={l.results} aria-live="polite" aria-label="Verification results">
            {results.map((r) => (
              <li key={r.item.id} className={r.ok ? l.ok : l.bad}>
                <Icon name={r.ok ? 'supports' : 'alert'} size={16} />
                <span>{r.item.title}</span>
                <span className={l.resultLabel}>{r.ok ? 'Matches' : 'MISMATCH'}</span>
              </li>
            ))}
          </ul>
        )}

        {!running && results && mismatches.length === 0 && (
          <p className={l.summaryGood} role="status">
            <Icon name="supports" size={18} /> All {results.length} items match their collection
            records.
          </p>
        )}
        {!running && mismatches.length > 0 && (
          <div className={s.tamper} role="alert">
            <Icon name="alert" size={28} />
            <div>
              <p className={s.tamperTitle}>Tamper warning</p>
              <p>
                {mismatches.length === 1 ? 'One item has' : `${mismatches.length} items have`}{' '}
                changed since collection:
              </p>
              <ul className={l.mismatchList}>
                {mismatches.map((r) => (
                  <li key={r.item.id}>
                    <button
                      type="button"
                      className={l.linkish}
                      onClick={() =>
                        useDesktop.getState().setParams('locker', { selected: r.item.id })
                      }
                    >
                      {r.item.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>

      <section aria-labelledby="custody-title">
        <h3 id="custody-title" className={l.heading}>
          <Icon name="locker" size={18} /> Chain of custody
        </h3>
        <p className={l.intro}>
          Who handled what, and when. Investigators keep this record so a court can trust that
          evidence was not swapped or changed. Newest first; times are on this device&rsquo;s clock.
        </p>
        <CustodyTable lines={shown} title={title} />
        {log.length > shown.length && (
          <Button size="small" onClick={() => setShowAll(true)}>
            Show all {log.length} entries
          </Button>
        )}
      </section>
    </div>
  );
}

export function CustodyTable({
  lines,
  title,
}: {
  lines: CustodyLine[];
  title?: (id: string) => string;
}) {
  if (!lines.length) return <p className={s.listItemSub}>Nothing recorded yet.</p>;
  return (
    <div className={s.tableWrap}>
      <table className={s.table}>
        <thead>
          <tr>
            <th scope="col">When</th>
            {title && <th scope="col">Item</th>}
            <th scope="col">Action</th>
            <th scope="col">Detail</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line, i) => (
            <tr key={`${line.evidenceId}-${line.at}-${i}`}>
              <td>{formatLocalDateTime(line.at)}</td>
              {title && <td className={l.uiCell}>{title(line.evidenceId)}</td>}
              <td className={l.uiCell}>
                <span className={l.action}>
                  <Icon name={actionIcons[line.action]} size={14} />
                  {actionLabels[line.action]}
                </span>
              </td>
              <td className={l.uiCell}>
                {line.action === 'verified' ? (
                  <Badge
                    tone={line.ok ? 'supports' : 'contradicts'}
                    icon={line.ok ? 'check' : 'alert'}
                  >
                    {line.detail}
                  </Badge>
                ) : (
                  line.detail
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
