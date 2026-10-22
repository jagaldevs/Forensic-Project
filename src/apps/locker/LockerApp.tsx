import { useEffect } from 'react';
import { collectedEvidence, isLocked } from '../../engine/availability';
import { accessWording } from '../../engine/accessWording';
import { formatShortDate, formatTime24 } from '../../engine/format';
import type { CaseFile, Evidence } from '../../engine/types';
import { appMeta, appsForCase } from '../../desktop/appMeta';
import { useDesktop } from '../../stores/desktopStore';
import { useProgress } from '../../stores/progressStore';
import { Button } from '../../ui/Button';
import { Icon } from '../../ui/Icon';
import { Paragraphs } from '../../ui/Paragraphs';
import type { AppProps } from '../registry';
import { EvidenceHeader } from '../shared/EvidenceHeader';
import { evidenceIcon } from '../shared/EvidenceIcon';
import { appFor, openEvidence, useCaseState } from '../shared/hooks';
import { LockedNotice } from '../shared/LockedNotice';
import s from '../shared/shared.module.css';
import { custodyLog } from '../../engine/custody';
import type { CustodyEvent } from '../../engine/progressTypes';
import { CustodyPanel, CustodyTable } from './CustodyPanel';
import l from './locker.module.css';

/**
 * Evidence Locker: everything collected so far, with hashes (chain of custody).
 * Records without their own app (login records, documents) are viewed here.
 */
export default function LockerApp({ params }: AppProps) {
  const { c, progress, caseId } = useCaseState();
  const items = collectedEvidence(c, progress);
  const selected = items.find((e) => e.id === params.selected) ?? null;
  const select = (id: string) => useDesktop.getState().setParams('locker', { selected: id });
  const flagged = failedHashChecks(progress.custody ?? []);

  const viewHere = selected && appFor(selected) === 'locker' && !isLocked(selected, c, progress);
  useEffect(() => {
    if (viewHere) useProgress.getState().markViewed(caseId, selected.id);
  }, [viewHere, selected, caseId]);

  return (
    <div className={s.app}>
      <div className={s.split}>
        <nav className={s.sidebar} aria-label="Collected evidence">
          <ul className={s.list}>
            <li>
              <button
                type="button"
                className={s.listItem}
                aria-current={!selected}
                onClick={() => select('')}
              >
                <Icon name="hash" size={18} />
                <span className={s.listItemText}>
                  <span>Chain of custody</span>
                  <span className={s.listItemSub}>Verify hashes · full log</span>
                </span>
              </button>
            </li>
            {items.map((e) => {
              const locked = isLocked(e, c, progress);
              const mismatch = flagged.has(e.id);
              return (
                <li key={e.id}>
                  <button
                    type="button"
                    className={s.listItem}
                    aria-current={selected?.id === e.id}
                    onClick={() => select(e.id)}
                  >
                    <Icon name={locked ? 'lock' : mismatch ? 'alert' : evidenceIcon(e)} size={18} />
                    <span className={s.listItemText}>
                      <span>{e.title}</span>
                      <span className={s.listItemSub}>
                        {locked
                          ? accessWording(c).locked
                          : mismatch
                            ? 'Hash mismatch'
                            : appMeta[appFor(e)].title}
                      </span>
                    </span>
                    {!locked && !progress.viewed[e.id] && <span className={s.newDot}>NEW</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className={s.main}>
          {!selected ? (
            <>
              <p className={l.intro} style={{ marginBottom: 'var(--space-5)' }}>
                {items.length} item{items.length === 1 ? '' : 's'} in the locker. Select one to
                examine it.
                {appsForCase(c).includes('iplookup')
                  ? ' Some evidence only appears once you find it, for example by running an IP lookup.'
                  : ' New evidence may arrive while you work.'}
              </p>
              <CustodyPanel />
            </>
          ) : isLocked(selected, c, progress) ? (
            <LockedNotice item={selected} />
          ) : (
            <LockerDetail item={selected} c={c} />
          )}
        </div>
      </div>
    </div>
  );
}

/** Ids whose most recent hash check did not match. */
function failedHashChecks(custody: CustodyEvent[]): Set<string> {
  const latest = new Map<string, boolean>();
  for (const e of custody) if (e.action === 'verified') latest.set(e.evidenceId, e.ok === true);
  return new Set([...latest].filter(([, ok]) => !ok).map(([id]) => id));
}

function LockerDetail({ item, c }: { item: Evidence; c: CaseFile }) {
  const offset = c.timeZone.utcOffset;
  const ownApp = appFor(item);
  const { progress } = useCaseState();
  const custody = custodyLog(c, progress)
    .filter((line) => line.evidenceId === item.id)
    .reverse();

  return (
    <article>
      <EvidenceHeader item={item}>
        {ownApp !== 'locker' && (
          <Button size="small" icon={appMeta[ownApp].icon} onClick={() => openEvidence(item)}>
            Open in {appMeta[ownApp].title}
          </Button>
        )}
      </EvidenceHeader>
      <p>{item.summary}</p>

      {item.type === 'loginRecord' && (
        <>
          <table className={s.kv} style={{ marginTop: 'var(--space-4)' }}>
            <tbody>
              <tr>
                <th scope="row">Service</th>
                <td>{item.service}</td>
              </tr>
              <tr>
                <th scope="row">Account</th>
                <td>{item.account}</td>
              </tr>
            </tbody>
          </table>
          <div className={s.tableWrap} style={{ marginTop: 'var(--space-4)' }}>
            <table className={s.table}>
              <caption className="visually-hidden">Account events ({c.timeZone.label})</caption>
              <thead>
                <tr>
                  <th scope="col">Time ({c.timeZone.label})</th>
                  <th scope="col">Event</th>
                  <th scope="col">Source IP</th>
                </tr>
              </thead>
              <tbody>
                {item.events.map((ev) => (
                  <tr key={ev.at + ev.event}>
                    <td>
                      {formatShortDate(ev.at, offset)} {formatTime24(ev.at, offset)}
                    </td>
                    <td style={{ fontFamily: 'var(--font-ui)' }}>{ev.event}</td>
                    <td>{ev.ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {item.note && (
            <p className={s.callout}>
              <Icon name="info" size={16} />
              {item.note}
            </p>
          )}
          <p className={s.prompt}>
            <strong>Think:</strong> this record shows an account was used from an IP address. Does
            it tell you <em>who</em> was using it, or <em>where</em> they were?
            {appsForCase(c).includes('iplookup') && ' Try the IP address in IP Lookup.'}
          </p>
        </>
      )}

      {item.type === 'document' && (
        <>
          <table className={s.kv} style={{ marginTop: 'var(--space-4)' }}>
            <tbody>
              {item.fields.map((f) => (
                <tr key={f.label}>
                  <th scope="row">{f.label}</th>
                  <td>
                    {f.value}
                    {f.note && <span className={s.kvNote}>{f.note}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {item.body && (
            <div style={{ marginTop: 'var(--space-4)', display: 'grid', gap: 'var(--space-2)' }}>
              <Paragraphs text={item.body} />
            </div>
          )}
        </>
      )}

      <section className={l.itemCustody} aria-labelledby="item-custody">
        <h4 id="item-custody" className={l.heading}>
          <Icon name="locker" size={16} /> Chain of custody for this item
        </h4>
        <CustodyTable lines={custody} />
      </section>
    </article>
  );
}
