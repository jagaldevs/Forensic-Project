import { useEffect } from 'react';
import { isLocked, releasedEvidence } from '../../engine/availability';
import {
  clockTo12,
  clockToMinutes,
  formatLongDate,
  formatTime24,
  minutesOfDay,
} from '../../engine/format';
import type { EvidenceOfType } from '../../engine/types';
import { useDesktop } from '../../stores/desktopStore';
import { useProgress } from '../../stores/progressStore';
import { Icon } from '../../ui/Icon';
import { onTabListKeyDown } from '../../ui/tabKeys';
import type { AppProps } from '../registry';
import { EvidenceHeader } from '../shared/EvidenceHeader';
import { useCaseState } from '../shared/hooks';
import { LockedNotice } from '../shared/LockedNotice';
import s from '../shared/shared.module.css';
import n from './netlog.module.css';

type NetworkLog = EvidenceOfType<'networkLog'>;

/** Home router connection logs: which devices were online, and when. */
export default function NetworkLogApp({ params }: AppProps) {
  const { c, progress, caseId } = useCaseState();
  const logs = releasedEvidence(c, progress).filter(
    (e): e is NetworkLog => e.type === 'networkLog',
  );
  const selected = logs.find((l) => l.id === params.selected) ?? logs[0] ?? null;
  const locked = selected ? isLocked(selected, c, progress) : false;

  useEffect(() => {
    if (selected && !locked) useProgress.getState().markViewed(caseId, selected.id);
  }, [selected, locked, caseId]);

  if (!selected)
    return (
      <div className={s.empty}>
        <Icon name="router" size={40} />
        <p>No network logs in this case yet.</p>
      </div>
    );

  return (
    <div className={s.main}>
      {logs.length > 1 && (
        <div
          className={n.tabs}
          role="tablist"
          aria-label="Network logs"
          onKeyDown={onTabListKeyDown}
        >
          {logs.map((l) => (
            <button
              key={l.id}
              type="button"
              role="tab"
              aria-selected={l.id === selected.id}
              tabIndex={l.id === selected.id ? 0 : -1}
              className={n.tab}
              onClick={() => useDesktop.getState().setParams('netlog', { selected: l.id })}
            >
              {l.household}
            </button>
          ))}
        </div>
      )}
      {locked ? <LockedNotice item={selected} /> : <LogView log={selected} />}
    </div>
  );
}

function LogView({ log }: { log: NetworkLog }) {
  const { c } = useCaseState();
  const offset = c.timeZone.utcOffset;

  // Timeline range: whole hours around the sessions.
  const starts = log.sessions.map((x) => minutesOfDay(x.connected, offset));
  const ends = log.sessions.map((x) =>
    x.disconnected ? minutesOfDay(x.disconnected, offset) : 24 * 60,
  );
  const from = Math.floor(Math.min(...starts) / 60) * 60;
  const to = Math.min(24 * 60, Math.ceil(Math.max(...ends) / 60) * 60);
  const pct = (m: number) => `${((m - from) / (to - from)) * 100}%`;
  const hours = Array.from({ length: (to - from) / 60 + 1 }, (_, i) => from + i * 60);
  const sameDay = log.logDate === c.incident.date;
  const winStart = clockToMinutes(c.incident.windowStart);
  // A window that ends before it starts runs past midnight (e.g. 9 pm to 6:45 am).
  const winEnd =
    clockToMinutes(c.incident.windowEnd) +
    (c.incident.windowEnd < c.incident.windowStart ? 24 * 60 : 0);

  return (
    <article>
      <EvidenceHeader item={log} />
      <dl className={n.router}>
        <div>
          <dt>Router</dt>
          <dd>{log.routerName}</dd>
        </div>
        <div>
          <dt>Location</dt>
          <dd>{log.household}</dd>
        </div>
        <div>
          <dt>Public IP address</dt>
          <dd className={n.publicIp}>{log.publicIp}</dd>
        </div>
        <div>
          <dt>Log date</dt>
          <dd>{formatLongDate(log.logDate)}</dd>
        </div>
      </dl>

      <section className={n.timeline} aria-label="Connection timeline">
        <div className={n.timelineGrid}>
          <div className={n.axis} aria-hidden="true">
            {hours.map((h) => (
              <span key={h} style={{ left: pct(h) }}>
                {String(Math.floor(h / 60) % 24).padStart(2, '0')}:00
              </span>
            ))}
          </div>
          {sameDay && (
            <div
              className={n.window}
              style={{
                left: pct(Math.max(from, winStart)),
                width: `calc(${pct(Math.min(to, winEnd))} - ${pct(Math.max(from, winStart))})`,
              }}
              aria-hidden="true"
            >
              <span>Incident</span>
            </div>
          )}
          {log.sessions.map((x) => {
            const a = minutesOfDay(x.connected, offset);
            const b = x.disconnected ? minutesOfDay(x.disconnected, offset) : to;
            return (
              <div key={x.mac + x.connected} className={n.lane}>
                <span className={n.laneLabel}>{x.deviceName}</span>
                <div className={n.laneTrack}>
                  <div
                    className={n.bar}
                    style={{ left: pct(a), width: `calc(${pct(b)} - ${pct(a)})` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        {sameDay && (
          <p className={n.legend}>
            <span className={n.legendSwatch} aria-hidden="true" /> Shaded: incident window,{' '}
            {clockTo12(c.incident.windowStart)} to {clockTo12(c.incident.windowEnd)}
          </p>
        )}
      </section>

      <div className={s.tableWrap}>
        <table className={s.table}>
          <caption className="visually-hidden">Device connections ({c.timeZone.label})</caption>
          <thead>
            <tr>
              <th scope="col">Device name</th>
              <th scope="col">MAC address</th>
              <th scope="col">Connected</th>
              <th scope="col">Disconnected</th>
            </tr>
          </thead>
          <tbody>
            {log.sessions.map((x) => (
              <tr key={x.mac + x.connected}>
                <td>{x.deviceName}</td>
                <td>{x.mac}</td>
                <td>{formatTime24(x.connected, offset)}</td>
                <td>{x.disconnected ? formatTime24(x.disconnected, offset) : 'still connected'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {log.note && (
        <p className={s.callout}>
          <Icon name="info" size={16} />
          {log.note}
        </p>
      )}
      <p className={s.prompt}>
        <strong>Think:</strong> a router records <em>devices</em>, identified by name and MAC
        address. Does it tell you which <em>person</em> was using each one?
      </p>
    </article>
  );
}
