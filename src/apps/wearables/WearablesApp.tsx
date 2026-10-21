import { useEffect } from 'react';
import { usableEvidence } from '../../engine/availability';
import type { EvidenceOfType } from '../../engine/types';
import { useDesktop } from '../../stores/desktopStore';
import { useProgress } from '../../stores/progressStore';
import { Icon, type IconName } from '../../ui/Icon';
import type { AppProps } from '../registry';
import { EvidenceHeader } from '../shared/EvidenceHeader';
import { useCaseState } from '../shared/hooks';
import s from '../shared/shared.module.css';
import { SeriesChart } from './SeriesChart';
import w from './wearables.module.css';

type Log = EvidenceOfType<'wearableLog'>;
type EventKind = NonNullable<Log['events']>[number]['kind'];

const EVENT_ICONS: Record<EventKind, IconName> = {
  doorbell: 'bell',
  motion: 'eye',
  door: 'door',
  charging: 'battery',
  worn: 'pulse',
  removed: 'pulse',
  other: 'info',
};

/** The first day in a log, so every chart in it shares one time axis. */
function firstDate(log: Log): string {
  const times = [
    ...(log.series ?? []).flatMap((sr) => sr.points.map((p) => p.at)),
    ...(log.events ?? []).map((e) => e.at),
  ].sort();
  return times[0]!.slice(0, 10);
}

/** Fitness bands and smart-home devices: activity charts and event logs. */
export default function WearablesApp({ params }: AppProps) {
  const { c, progress, caseId } = useCaseState();
  const logs = usableEvidence(c, progress).filter((e): e is Log => e.type === 'wearableLog');
  const selected = logs.find((l) => l.id === params.selected) ?? logs[0] ?? null;

  useEffect(() => {
    if (selected) useProgress.getState().markViewed(caseId, selected.id);
  }, [selected, caseId]);

  if (!selected)
    return (
      <div className={s.empty}>
        <Icon name="pulse" size={40} />
        <p>No device logs have been collected yet.</p>
      </div>
    );

  const deviceFor = (log: Log) => c.devices.find((d) => d.id === log.deviceId);
  const device = deviceFor(selected);
  const owner = c.people.find((p) => p.id === device?.ownerId)?.name ?? device?.ownerLabel;
  const baseDate = firstDate(selected);
  const events = [...(selected.events ?? [])].sort((a, b) => (a.at < b.at ? -1 : 1));
  const multiDay = events.some((e) => e.at.slice(0, 10) !== baseDate);

  return (
    <div className={s.app}>
      <div className={s.split}>
        <nav className={s.sidebar} aria-label="Device logs">
          <ul className={s.list}>
            {logs.map((l) => (
              <li key={l.id}>
                <button
                  type="button"
                  className={s.listItem}
                  aria-current={l.id === selected.id}
                  onClick={() => useDesktop.getState().setParams('wearables', { selected: l.id })}
                >
                  <Icon name={l.series?.length ? 'pulse' : 'bell'} size={18} />
                  <span className={s.listItemText}>
                    <span>{l.title}</span>
                    <span className={s.listItemSub}>
                      {deviceFor(l)?.name ?? l.deviceId} · {l.service}
                    </span>
                  </span>
                  {!progress.viewed[l.id] && <span className={s.newDot}>NEW</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className={s.main}>
          <EvidenceHeader item={selected} />
          <p className={w.deviceLine}>
            <Icon name="clock" size={14} className="inline-icon" /> Device:{' '}
            <strong>{device?.name ?? selected.deviceId}</strong>
            {owner && <> ({owner})</>} · times as recorded by the device
          </p>

          {selected.series?.map((series) => (
            <SeriesChart
              key={series.measure}
              series={series}
              events={selected.events}
              baseDate={baseDate}
            />
          ))}

          {events.length > 0 && (
            <section aria-labelledby={`events-${selected.id}`}>
              <h4 id={`events-${selected.id}`} className={w.heading}>
                Events
              </h4>
              <ol className={w.events}>
                {events.map((e, i) => (
                  <li key={`${e.at}-${i}`} className={w.event}>
                    <span className={w.eventTime}>
                      {multiDay && <span className={w.eventDate}>{e.at.slice(5, 10)} </span>}
                      {e.at.slice(11, 16)}
                    </span>
                    <span className={w.eventIcon} aria-hidden="true">
                      <Icon name={EVENT_ICONS[e.kind]} size={18} />
                    </span>
                    <span className={w.eventText}>
                      <span>{e.event}</span>
                      {e.detail && <span className={s.listItemSub}>{e.detail}</span>}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {selected.note && (
            <p className={s.callout}>
              <Icon name="info" size={16} />
              {selected.note}
            </p>
          )}

          <p className={s.prompt}>
            <strong>Think:</strong> a band records the band, not the person. A doorbell records
            someone at the door. What would you need to link either record to a particular person?
          </p>
        </div>
      </div>
    </div>
  );
}
