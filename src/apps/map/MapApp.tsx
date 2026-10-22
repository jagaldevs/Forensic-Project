import { useState } from 'react';
import { darwin } from '../../engine/geo/darwin';
import { viewAround } from '../../engine/geo/region';
import { travelEstimate, travelModes, type TravelMode } from '../../engine/geo/travel';
import type { MapPoint } from '../../engine/types';
import { Button } from '../../ui/Button';
import { Icon } from '../../ui/Icon';
import ui from '../../ui/ui.module.css';
import { useCaseState } from '../shared/hooks';
import s from '../shared/shared.module.css';
import { CityMap } from './CityMap';
import mp from './mapApp.module.css';

interface Spot {
  id: string;
  label: string;
  at: MapPoint;
}

/** The case map with a travel-time calculator. */
export default function MapApp() {
  const { c } = useCaseState();
  const spots: Spot[] = [
    ...c.mapMarkers.map((m, i) => ({ id: m.id, label: `${i + 1}. ${m.label}`, at: m.at })),
    ...darwin.places.map((p) => ({ id: p.id, label: p.name, at: p.at })),
  ];
  const [from, setFrom] = useState(spots[0]?.id ?? '');
  const [to, setTo] = useState(spots[1]?.id ?? '');
  const [mode, setMode] = useState<TravelMode>('walk');
  const [zoomed, setZoomed] = useState(c.mapMarkers.length > 0);

  const a = spots.find((x) => x.id === from);
  const b = spots.find((x) => x.id === to);
  const estimate = a && b && a.id !== b.id ? travelEstimate(a.at, b.at, mode) : null;
  const modeInfo = travelModes[mode];

  return (
    <div className={`${s.main} ${mp.layout}`}>
      <div className={mp.mapCol}>
        <div className={mp.mapTools}>
          <Button
            size="small"
            icon="search"
            aria-pressed={zoomed}
            onClick={() => setZoomed((z) => !z)}
          >
            {zoomed ? 'Show whole region' : 'Zoom to case'}
          </Button>
        </div>
        <CityMap
          view={
            zoomed
              ? viewAround(darwin, [
                  ...c.mapMarkers.map((m) => m.at),
                  ...(a ? [a.at] : []),
                  ...(b ? [b.at] : []),
                ])
              : undefined
          }
          markers={c.mapMarkers}
          route={estimate && a && b ? { from: a.at, to: b.at } : undefined}
          description={`Map of the Darwin region with ${c.mapMarkers.length} case locations marked.`}
        />
      </div>
      <section className={mp.panel} aria-labelledby="travel-title">
        <h3 id="travel-title" className={mp.heading}>
          <Icon name="clock" size={16} /> Travel-time calculator
        </h3>
        <label className={ui.label} htmlFor="travel-from">
          From
        </label>
        <select
          id="travel-from"
          className={ui.select}
          value={from}
          onChange={(e) => setFrom(e.target.value)}
        >
          {spots.map((x) => (
            <option key={x.id} value={x.id}>
              {x.label}
            </option>
          ))}
        </select>
        <label className={ui.label} htmlFor="travel-to" style={{ marginTop: 'var(--space-3)' }}>
          To
        </label>
        <select
          id="travel-to"
          className={ui.select}
          value={to}
          onChange={(e) => setTo(e.target.value)}
        >
          {spots.map((x) => (
            <option key={x.id} value={x.id}>
              {x.label}
            </option>
          ))}
        </select>
        <fieldset className={mp.modes}>
          <legend className={ui.label}>How</legend>
          {(Object.keys(travelModes) as TravelMode[]).map((m) => (
            <button
              key={m}
              type="button"
              className={mp.mode}
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
            >
              {travelModes[m].label}
            </button>
          ))}
        </fieldset>

        <div className={mp.result} aria-live="polite">
          {estimate ? (
            <>
              <p className={mp.time}>
                {estimate.minMinutes}–{estimate.maxMinutes} min
              </p>
              <p className={mp.detail}>
                Straight line {estimate.straightKm.toFixed(1)} km · by road about{' '}
                {estimate.roadKm.toFixed(1)} km
                <br />
                {modeInfo.label} at {modeInfo.speedKmh[0]}–{modeInfo.speedKmh[1]} km/h
                {modeInfo.extraNote ? `, ${modeInfo.extraNote}` : ''}
              </p>
            </>
          ) : (
            <p className={mp.detail}>Choose two different places.</p>
          )}
        </div>
        <p className={s.callout}>
          <Icon name="info" size={16} />
          This is an estimate, not a timetable. Real journeys depend on traffic, waiting and route.
          Use it to ask “is this possible?”, not “this is exactly when”.
        </p>
      </section>
    </div>
  );
}
