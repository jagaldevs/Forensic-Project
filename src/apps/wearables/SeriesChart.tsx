import { useId, useState } from 'react';
import type { EvidenceOfType } from '../../engine/types';
import { Button } from '../../ui/Button';
import s from '../shared/shared.module.css';
import {
  clockLabel,
  minutesFrom,
  niceMax,
  offWristSpans,
  timeTicks,
  typicalInterval,
  type LogEvent,
} from './chartMath';
import w from './wearables.module.css';

type Series = NonNullable<EvidenceOfType<'wearableLog'>['series']>[number];

const TITLES: Record<Series['measure'], string> = { steps: 'Steps', heartRate: 'Heart rate' };

// Drawing area in viewBox units; the SVG scales to the window width.
const W = 640;
const H = 220;
const M = { left: 48, right: 14, top: 14, bottom: 30 };

/** One series as a chart: steps as bars, heart rate as a line. Off-wrist periods are hatched. */
export function SeriesChart({
  series,
  events,
  baseDate,
}: {
  series: Series;
  events: LogEvent[] | undefined;
  /** The date the axis counts minutes from (the log's first day). */
  baseDate: string;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const [showTable, setShowTable] = useState(false);
  const title = TITLES[series.measure];
  const bars = series.measure === 'steps';

  const points = series.points.map((p) => ({ t: minutesFrom(p.at, baseDate), v: p.value }));
  const times = points.map((p) => p.t);
  const interval = typicalInterval(times);
  const start = times[0]!;
  const end = times.at(-1)! + (bars ? interval : 0);
  const yMax = niceMax(Math.max(...points.map((p) => p.v)));

  const x = (t: number) => M.left + ((t - start) / (end - start || 1)) * (W - M.left - M.right);
  const y = (v: number) => M.top + (1 - v / yMax) * (H - M.top - M.bottom);

  const off = offWristSpans(events, baseDate, end)
    .map((sp) => ({ start: Math.max(sp.start, start), end: Math.min(sp.end, end) }))
    .filter((sp) => sp.end > sp.start);

  // Break the line where readings stop (e.g. the band was on its charger).
  let path = '';
  points.forEach((p, i) => {
    const gap = i > 0 && p.t - points[i - 1]!.t > interval * 2;
    path += `${i === 0 || gap ? 'M' : 'L'}${x(p.t).toFixed(1)},${y(p.v).toFixed(1)}`;
  });

  const max = points.reduce((a, b) => (b.v > a.v ? b : a));
  const min = points.reduce((a, b) => (b.v < a.v ? b : a));
  const summary =
    `${title} (${series.unit}), readings from ${clockLabel(start)} to ${clockLabel(times.at(-1)!)}. ` +
    `Highest ${max.v} at ${clockLabel(max.t)}; lowest ${min.v} at ${clockLabel(min.t)}.` +
    off
      .map((sp) => ` Not worn or charging from ${clockLabel(sp.start)} to ${clockLabel(sp.end)}.`)
      .join('');

  return (
    <figure className={w.figure}>
      <figcaption className={w.caption}>
        <strong>{title}</strong> <span className={w.unit}>{series.unit}</span>
      </figcaption>
      <svg
        className={w.chart}
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={summary}
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <pattern
            id={`hatch-${uid}`}
            width="8"
            height="8"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <rect width="8" height="8" className={w.offFill} />
            <line x1="0" y1="0" x2="0" y2="8" className={w.offHatch} />
          </pattern>
        </defs>

        {off.map((sp) => (
          <rect
            key={sp.start}
            x={x(sp.start)}
            y={M.top}
            width={x(sp.end) - x(sp.start)}
            height={H - M.top - M.bottom}
            fill={`url(#hatch-${uid})`}
          />
        ))}

        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <g key={f}>
            <line
              x1={M.left}
              x2={W - M.right}
              y1={y(yMax * f)}
              y2={y(yMax * f)}
              className={w.grid}
            />
            <text x={M.left - 6} y={y(yMax * f) + 4} textAnchor="end" className={w.axisText}>
              {Math.round(yMax * f)}
            </text>
          </g>
        ))}

        {timeTicks(start, end).map((t) => (
          <g key={t}>
            <line x1={x(t)} x2={x(t)} y1={H - M.bottom} y2={H - M.bottom + 5} className={w.axis} />
            <text x={x(t)} y={H - M.bottom + 18} textAnchor="middle" className={w.axisText}>
              {clockLabel(t)}
            </text>
          </g>
        ))}
        <line x1={M.left} x2={W - M.right} y1={H - M.bottom} y2={H - M.bottom} className={w.axis} />

        {bars ? (
          points.map((p) => {
            const x0 = x(p.t);
            const width = Math.max(1, x(p.t + interval) - x0 - 2);
            return (
              <rect
                key={p.t}
                x={x0 + 1}
                y={y(p.v)}
                width={width}
                height={Math.max(0, y(0) - y(p.v))}
                className={w.bar}
              />
            );
          })
        ) : (
          <>
            <path d={path} className={w.line} />
            {points.map((p) => (
              <circle key={p.t} cx={x(p.t)} cy={y(p.v)} r={3} className={w.dot} />
            ))}
          </>
        )}
      </svg>

      <div className={w.legendRow}>
        <ul className={w.legend} aria-label="Key">
          <li>
            <span className={bars ? w.swatchBar : w.swatchLine} aria-hidden="true" />
            {title}
          </li>
          {off.length > 0 && (
            <li>
              <span className={w.swatchOff} aria-hidden="true" />
              Not worn / charging
            </li>
          )}
        </ul>
        <Button
          size="small"
          variant="ghost"
          icon="table"
          aria-expanded={showTable}
          aria-controls={`table-${uid}`}
          onClick={() => setShowTable((v) => !v)}
        >
          {showTable ? 'Hide data table' : 'Show data table'}
          <span className="visually-hidden">: {title}</span>
        </Button>
      </div>

      {showTable && (
        <div className={s.tableWrap} id={`table-${uid}`}>
          <table className={s.table}>
            <caption className="visually-hidden">
              {title} readings ({series.unit})
            </caption>
            <thead>
              <tr>
                <th scope="col">Time (as recorded)</th>
                <th scope="col">{series.unit}</th>
              </tr>
            </thead>
            <tbody>
              {series.points.map((p) => (
                <tr key={p.at}>
                  <td>
                    {p.at.slice(0, 10) !== baseDate && `${p.at.slice(5, 10)} `}
                    {p.at.slice(11, 16)}
                  </td>
                  <td>{p.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </figure>
  );
}
