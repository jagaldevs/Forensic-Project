import { useId } from 'react';
import {
  coastline,
  MAP_HEIGHT_KM,
  MAP_WIDTH_KM,
  places,
  roads,
  smoothPath,
  type MapView,
} from '../../engine/geo/cityMap';
import type { MapMarker, MapPoint } from '../../engine/types';
import s from './map.module.css';

const FULL_VIEW: MapView = { x: 0, y: 0, w: MAP_WIDTH_KM, h: MAP_HEIGHT_KM };

interface CityMapProps {
  /** Accuracy circle, drawn to scale. */
  circle?: { centre: MapPoint; radiusKm: number; label: string };
  markers?: MapMarker[];
  /** A straight dashed line between two points (travel calculator). */
  route?: { from: MapPoint; to: MapPoint };
  /** Zoom to part of the map. Labels and pins stay the same size on screen. */
  view?: MapView;
  /** Accessible description of what the map shows. */
  description: string;
}

const LAND = smoothPath(coastline, true);

/**
 * Illustrated map of a Darwin-inspired region, drawn in SVG with kilometre units.
 * Custom-drawn: no map tiles or external requests.
 */
export function CityMap({
  circle,
  markers = [],
  route,
  view = FULL_VIEW,
  description,
}: CityMapProps) {
  const descId = useId();
  const patternId = useId();
  // k keeps text, pins and lines the same size on screen however far we zoom in.
  const k = view.w / MAP_WIDTH_KM;
  const text = (size: number) => ({ fontSize: `${size * k}px`, strokeWidth: `${0.5 * k}px` });
  const scaleKm = view.w > 30 ? 10 : view.w > 12 ? 2 : 1;

  return (
    <figure className={s.figure}>
      <svg
        className={s.map}
        viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
        role="img"
        aria-labelledby={descId}
      >
        <title id={descId}>{description}</title>
        <defs>
          <pattern id={patternId} width={2 * k} height={2 * k} patternUnits="userSpaceOnUse">
            <path
              d={`M0 ${2 * k}L${2 * k} 0`}
              stroke="var(--map-sea-line)"
              strokeWidth={0.15 * k}
            />
          </pattern>
        </defs>

        <rect
          x={-10}
          y={-10}
          width={MAP_WIDTH_KM + 20}
          height={MAP_HEIGHT_KM + 20}
          fill="var(--map-sea)"
        />
        <rect
          x={-10}
          y={-10}
          width={MAP_WIDTH_KM + 20}
          height={MAP_HEIGHT_KM + 20}
          fill={`url(#${patternId})`}
        />
        <path
          d={LAND}
          fill="var(--map-land)"
          stroke="var(--map-land-edge)"
          strokeWidth={0.35 * k}
        />

        {roads.map((r) => (
          <path
            key={r.name}
            d={smoothPath(r.points, false)}
            fill="none"
            stroke={r.major ? 'var(--map-road-major)' : 'var(--map-road)'}
            strokeWidth={(r.major ? 0.45 : 0.28) * Math.max(k, 0.35)}
            strokeLinecap="round"
          />
        ))}

        {view === FULL_VIEW && (
          <>
            <text className={s.seaLabel} x="4" y="12">
              Beagle Gulf
            </text>
            <text className={s.seaLabel} x="5" y="36">
              Darwin Harbour
            </text>
          </>
        )}

        {circle && (
          <g className={s.circle}>
            <circle
              cx={circle.centre.x}
              cy={circle.centre.y}
              r={circle.radiusKm}
              fill="var(--map-radius-fill)"
              stroke="var(--accent)"
              strokeWidth={0.3 * k}
              strokeDasharray={`${k} ${0.6 * k}`}
            />
            <line
              x1={circle.centre.x}
              y1={circle.centre.y}
              x2={circle.centre.x + circle.radiusKm}
              y2={circle.centre.y}
              stroke="var(--accent)"
              strokeWidth={0.2 * k}
            />
            <text
              className={s.radiusLabel}
              style={text(1.5)}
              x={circle.centre.x + circle.radiusKm / 2}
              y={circle.centre.y - 0.8 * k}
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
              r={(p.size === 'major' ? 0.55 : 0.35) * k}
              fill="var(--map-label)"
            />
            <text
              className={p.size === 'major' ? s.placeMajor : s.placeMinor}
              style={text(p.size === 'major' ? 1.7 : 1.3)}
              x={p.at.x + 0.9 * k}
              y={p.at.y + 0.5 * k}
            >
              {p.name}
            </text>
          </g>
        ))}

        {circle && (
          <circle
            cx={circle.centre.x}
            cy={circle.centre.y}
            r={0.9 * k}
            fill="var(--accent)"
            stroke="var(--bg-0)"
            strokeWidth={0.25 * k}
          />
        )}

        {route && (
          <g>
            <line
              x1={route.from.x}
              y1={route.from.y}
              x2={route.to.x}
              y2={route.to.y}
              stroke="var(--accent)"
              strokeWidth={0.45 * k}
              strokeDasharray={`${1.2 * k} ${0.8 * k}`}
              strokeLinecap="round"
            />
            <circle cx={route.from.x} cy={route.from.y} r={0.8 * k} fill="var(--accent)" />
            <circle
              cx={route.to.x}
              cy={route.to.y}
              r={0.8 * k}
              fill="var(--on-brand)"
              stroke="var(--accent)"
              strokeWidth={0.3 * k}
            />
          </g>
        )}

        {/* Numbered pins; names are in the legend so labels never pile up. */}
        {markers.map((m, i) => (
          <g key={m.id} transform={`translate(${m.at.x} ${m.at.y}) scale(${k})`}>
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

        <g
          transform={`translate(${view.x + view.w - (scaleKm + 4 * k)} ${view.y + view.h - 3 * k})`}
        >
          <line x1="0" y1="0" x2={scaleKm} y2="0" stroke="var(--map-label)" strokeWidth={0.3 * k} />
          <line
            x1="0"
            y1={-0.6 * k}
            x2="0"
            y2={0.6 * k}
            stroke="var(--map-label)"
            strokeWidth={0.3 * k}
          />
          <line
            x1={scaleKm}
            y1={-0.6 * k}
            x2={scaleKm}
            y2={0.6 * k}
            stroke="var(--map-label)"
            strokeWidth={0.3 * k}
          />
          <text
            className={s.scaleLabel}
            style={text(1.2)}
            x={scaleKm / 2}
            y={-k}
            textAnchor="middle"
          >
            {scaleKm} km
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
