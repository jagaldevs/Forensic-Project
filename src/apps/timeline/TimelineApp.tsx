import { usableEvidence } from '../../engine/availability';
import { clockTo12, clockToMinutes } from '../../engine/format';
import {
  buildTimeline,
  clockZones,
  hourHeadings,
  minutesToClock,
  timelineDeviceIds,
} from '../../engine/timeline';
import { useProgress } from '../../stores/progressStore';
import { useSettings } from '../../stores/settingsStore';
import { Icon } from '../../ui/Icon';
import { Badge } from '../../ui/StatusBadge';
import ui from '../../ui/ui.module.css';
import { evidenceIcon } from '../shared/EvidenceIcon';
import { openEvidence, useCaseState } from '../shared/hooks';
import { PinButton } from '../shared/PinButton';
import s from '../shared/shared.module.css';
import t from './timeline.module.css';

/**
 * Every timed moment in the collected evidence, on one line, exactly as each device recorded
 * it. Students who discover a device was set to another time zone can correct it here.
 */
export default function TimelineApp() {
  const { c, progress, caseId } = useCaseState();
  const evidence = usableEvidence(c, progress);
  const corrections = progress.clockCorrections ?? {};
  const points = buildTimeline(evidence, c.incident.date, c.timeZone.utcOffset, corrections);
  const deviceIds = timelineDeviceIds(evidence);
  const headings = hourHeadings(points, c.incident.date);
  const winStart = clockToMinutes(c.incident.windowStart);
  const winEnd = clockToMinutes(c.incident.windowEnd);
  const teacherMode = useSettings((st) => st.teacherMode);

  if (!points.length)
    return (
      <div className={s.empty}>
        <Icon name="timeline" size={40} />
        <p>Nothing with a time has been collected yet.</p>
      </div>
    );

  return (
    <div className={`${s.main} ${t.app}`}>
      <p className={t.intro}>
        Every timed moment in your evidence, plotted{' '}
        <strong>exactly as each device recorded it</strong>. Devices keep their own clocks. If you
        find evidence that a device was set to a different time zone, correct it below.
      </p>

      <section className={t.clocks} aria-labelledby="clocks-title">
        <h3 id="clocks-title" className={t.heading}>
          <Icon name="clock" size={16} /> Device clocks
        </h3>
        <div className={t.clockGrid}>
          {deviceIds.map((id) => {
            const device = c.devices.find((d) => d.id === id);
            const owner =
              c.people.find((p) => p.id === device?.ownerId)?.name ?? device?.ownerLabel;
            return (
              <div key={id} className={t.clock}>
                <label className={ui.label} htmlFor={`clock-${id}`}>
                  {device?.name ?? id}
                  <span className={t.owner}>{owner}</span>
                </label>
                <select
                  id={`clock-${id}`}
                  className={ui.select}
                  value={corrections[id] ?? ''}
                  onChange={(e) =>
                    useProgress.getState().setClockCorrection(caseId, id, e.target.value || null)
                  }
                >
                  <option value="">Case time ({c.timeZone.label})</option>
                  {clockZones
                    .filter((z) => z.utcOffset !== c.timeZone.utcOffset)
                    .map((z) => (
                      <option key={z.utcOffset} value={z.utcOffset}>
                        Set to {z.label}
                      </option>
                    ))}
                </select>
                {teacherMode && (
                  <p className={t.trueClock}>
                    <Icon name="shield" size={14} /> Teacher: really set to{' '}
                    <strong>{device?.clock?.label ?? `case time (${c.timeZone.label})`}</strong>
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <ol className={t.list} aria-label={`Timeline, in ${c.timeZone.label}`}>
        {points.map((p, i) => {
          const item = evidence.find((e) => e.id === p.evidenceId)!;
          const device = c.devices.find((d) => d.id === p.deviceId);
          const inWindow = p.minutes >= winStart && p.minutes <= winEnd;
          const heading = headings[i];
          return (
            <li key={`${p.evidenceId}-${i}`} className={`${t.row} ${inWindow ? '' : t.outside}`}>
              {heading && (
                <div className={t.hour} aria-hidden="true">
                  {heading}
                </div>
              )}
              <div className={t.time}>
                {minutesToClock(p.minutes)}
                {p.minutes >= 1440 && <span className={t.nextDay}>next day</span>}
                {p.minutes < 0 && <span className={t.nextDay}>day before</span>}
              </div>
              <div className={t.dot} aria-hidden="true" />
              <div className={t.card}>
                <div className={t.label}>{p.label}</div>
                <div className={t.meta}>
                  <button type="button" className={t.source} onClick={() => openEvidence(item)}>
                    <Icon name={evidenceIcon(item)} size={14} className="inline-icon" />{' '}
                    {item.title}
                  </button>
                  {device && (
                    <span>
                      · recorded as <span className={ui.mono}>{p.recordedClock}</span> on{' '}
                      {device.name}
                    </span>
                  )}
                  {p.corrected && (
                    <Badge tone="info" icon="clock">
                      Clock corrected
                    </Badge>
                  )}
                </div>
              </div>
              <div className={t.pin}>
                <PinButton evidenceId={item.id} />
              </div>
            </li>
          );
        })}
      </ol>
      <p className={s.prompt}>
        <strong>Think:</strong> shaded rows fall outside the incident window (
        {clockTo12(c.incident.windowStart)} to {clockTo12(c.incident.windowEnd)}). Do any two events
        seem impossible together? Before deciding someone is wrong, check every device’s clock.
      </p>
    </div>
  );
}
