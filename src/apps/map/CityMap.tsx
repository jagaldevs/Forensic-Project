import { useId } from 'react';
import {
  coastline,
  MAP_HEIGHT_KM,
  MAP_WIDTH_KM,
  places,
  roads,
  smoothPath,
} from '../../engine/geo/cityMap';
import type { MapMarker, MapPoint } from '../../engine/types';
import s from './map.module.css';

interface CityMapProps {
  /** Accuracy circle, drawn to scale. */
  circle?: { centre: MapPoint; radiusKm: number; label: string };
  markers?: MapMarker[];
  /** Accessible description of what the map shows. */
  description: string;
}

const LAND = smoothPath(coastline, true);

/**
 * Illustrated map of a Darwin-inspired region, drawn in SVG with kilometre units.
 * Custom-drawn: no map tiles or external requests.
 */
export function CityMap({ circle, markers = [], description }: CityMapProps) {
  const descId = useId();
  const patternId = useId();

  return (
    <figure className={s.figure}>
      <svg
        className={s.map}
        viewBox={`0 0 ${MAP_WIDTH_KM} ${MAP_HEIGHT_KM}`}
        role="img"
        aria-labelledby={descId}
      >
        <title id={descId}>{description}</title>
        <defs>
          <pattern id={patternId} width="2" height="2" patternUnits="userSpaceOnUse">
            <path d="M0 2L2 0" stroke="var(--map-sea-line)" strokeWidth="0.15" />
          </pattern>
        </defs>

        <rect width={MAP_WIDTH_KM} height={MAP_HEIGHT_KM} fill="var(--map-sea)" />
        <rect width={MAP_WIDTH_KM} height={MAP_HEIGHT_KM} fill={`url(#${patternId})`} />
        <path d={LAND} fill="var(--map-land)" stroke="var(--map-land-edge)" strokeWidth="0.35" />

        {roads.map((r) => (
          <path
            key={r.name}
            d={smoothPath(r.points, false)}
            fill="none"
            stroke={r.major ? 'var(--map-road-major)' : 'var(--map-road)'}
            strokeWidth={r.major ? 0.45 : 0.28}
            strokeLinecap="round"
          />
        ))}

        <text className={s.seaLabel} x="4" y="12">
          Beagle Gulf
        </text>
        <text className={s.seaLabel} x="5" y="36">
          Darwin Harbour
        </text>

        {circle && (
          <g className={s.circle}>
            <circle
              cx={circle.centre.x}
              cy={circle.centre.y}
              r={circle.radiusKm}
              fill="var(--map-radius-fill)"
              stroke="var(--accent)"
              strokeWidth="0.3"
              strokeDasharray="1 0.6"
            />
            <line
              x1={circle.centre.x}
              y1={circle.centre.y}
              x2={circle.centre.x + circle.radiusKm}
              y2={circle.centre.y}
              stroke="var(--accent)"
              strokeWidth="0.2"
            />
            <text
              className={s.radiusLabel}
              x={circle.centre.x + circle.radiusKm / 2}
              y={circle.centre.y - 0.8}
              textAnchor="middle"
            >
              {circle.radiusKm} km
            </text>
          </g>
        )}

        {places.map((p) => (
          <g key={p.id}>
            <circle
              cx={p.at.x}
              cy={p.at.y}
              r={p.size === 'major' ? 0.55 : 0.35}
              fill="var(--map-label)"
            />
            <text
              className={p.size === 'major' ? s.placeMajor : s.placeMinor}
              x={p.at.x + 0.9}
              y={p.at.y + 0.5}
            >
              {p.name}
            </text>
          </g>
        ))}

        {circle && (
          <g transform={`translate(${circle.centre.x} ${circle.centre.y})`}>
            <circle r="0.9" fill="var(--accent)" stroke="var(--bg-0)" strokeWidth="0.25" />
          </g>
        )}

        {/* Numbered pins; names are in the legend so labels never pile up. */}
        {markers.map((m, i) => (
          <g key={m.id} transform={`translate(${m.at.x} ${m.at.y})`}>
            <path
              d="M0 0 C-1.4 -2 -1.6 -2.6 -1.6 -3.2 A1.6 1.6 0 1 1 1.6 -3.2 C1.6 -2.6 1.4 -2 0 0Z"
              fill={m.kind === 'scene' ? 'var(--status-contradicts)' : 'var(--status-info)'}
              stroke="var(--bg-0)"
              strokeWidth="0.2"
            />
            <text className={s.markerNumber} x="0" y="-2.7" textAnchor="middle">
              {i + 1}
            </text>
          </g>
        ))}

        <g transform={`translate(${MAP_WIDTH_KM - 14} ${MAP_HEIGHT_KM - 3})`}>
          <line x1="0" y1="0" x2="10" y2="0" stroke="var(--map-label)" strokeWidth="0.3" />
          <line x1="0" y1="-0.6" x2="0" y2="0.6" stroke="var(--map-label)" strokeWidth="0.3" />
          <line x1="10" y1="-0.6" x2="10" y2="0.6" stroke="var(--map-label)" strokeWidth="0.3" />
          <text className={s.scaleLabel} x="5" y="-1" textAnchor="middle">
            10 km
          </text>
        </g>
      </svg>
      <figcaption className={s.caption}>
        <ul className={s.legend}>
          {circle && (
            <li>
              <span className={s.keyCentre} aria-hidden="true" />
              Database estimate: {circle.label}
            </li>
          )}
          {markers.map((m, i) => (
            <li key={m.id}>
              <span className={m.kind === 'scene' ? s.keyScene : s.keyPlace} aria-hidden="true">
                {i + 1}
              </span>
              {m.label}
            </li>
          ))}
        </ul>
        Illustrative map. Not for navigation.
      </figcaption>
    </figure>
  );
}
