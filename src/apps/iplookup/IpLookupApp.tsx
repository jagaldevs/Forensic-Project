import { useEffect, useState, type FormEvent } from 'react';
import { releasedEvidence, usableEvidence } from '../../engine/availability';
import { distanceKm, placesWithin } from '../../engine/geo/cityMap';
import type { EvidenceOfType } from '../../engine/types';
import { useDesktop } from '../../stores/desktopStore';
import { useProgress } from '../../stores/progressStore';
import { Button } from '../../ui/Button';
import { Icon } from '../../ui/Icon';
import ui from '../../ui/ui.module.css';
import { CityMap } from '../map/CityMap';
import type { AppProps } from '../registry';
import { EvidenceHeader } from '../shared/EvidenceHeader';
import { useCaseState } from '../shared/hooks';
import s from '../shared/shared.module.css';
import ip from './iplookup.module.css';

type IpRecord = EvidenceOfType<'ipRecord'>;

const IPV4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

/** Look up an IP address: ISP, approximate location and accuracy radius on the map. */
export default function IpLookupApp({ params }: AppProps) {
  const { c, progress, caseId } = useCaseState();
  const [query, setQuery] = useState(params.query ?? '');
  const searched = params.query ?? '';
  const records = releasedEvidence(c, progress).filter((e): e is IpRecord => e.type === 'ipRecord');
  const result = records.find((r) => r.ip === searched) ?? null;

  // Addresses that appear in collected evidence, offered as shortcuts.
  const knownIps = [
    ...new Set(
      usableEvidence(c, progress).flatMap((e) =>
        e.type === 'loginRecord'
          ? e.events.map((ev) => ev.ip)
          : e.type === 'networkLog'
            ? [e.publicIp]
            : [],
      ),
    ),
  ];

  useEffect(() => {
    if (result) useProgress.getState().markViewed(caseId, result.id);
  }, [result, caseId]);

  const lookup = (value: string) => {
    const v = value.trim();
    setQuery(v);
    useDesktop.getState().setParams('iplookup', { query: v });
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    lookup(query);
  };

  const valid = IPV4.test(searched) && searched.split('.').every((n) => Number(n) <= 255);
  const markers = c.mapMarkers;

  return (
    <div className={`${s.main} ${ip.app}`}>
      <form className={ip.searchRow} onSubmit={submit} role="search">
        <label className="visually-hidden" htmlFor="ip-query">
          IP address
        </label>
        <input
          id="ip-query"
          className={`${ui.input} ${ui.mono}`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. 203.0.113.47"
          inputMode="decimal"
          autoComplete="off"
          spellCheck={false}
        />
        <Button type="submit" variant="primary" icon="search" disabled={!query.trim()}>
          Look up
        </Button>
      </form>
      {knownIps.length > 0 && (
        <div className={ip.known}>
          <span>From your evidence:</span>
          {knownIps.map((addr) => (
            <Button key={addr} size="small" onClick={() => lookup(addr)}>
              <span className={ui.mono}>{addr}</span>
            </Button>
          ))}
        </div>
      )}

      {!searched && (
        <div className={s.empty}>
          <Icon name="globe" size={40} />
          <p>Enter an IP address to see who provides it and roughly where it is.</p>
          <p className={s.listItemSub}>
            Tip: the login record in the Evidence Locker has an address to check.
          </p>
        </div>
      )}

      {searched && !valid && (
        <p className={s.callout} role="alert">
          <Icon name="alert" size={16} />
          That isn&rsquo;t a valid IPv4 address. It should be four numbers from 0 to 255 separated
          by dots, like 203.0.113.47.
        </p>
      )}

      {searched && valid && !result && (
        <p className={s.callout} role="status">
          <Icon name="info" size={16} />
          No record for {searched} in the lab&rsquo;s geolocation database.
        </p>
      )}

      {result && <IpResult record={result} markers={markers} />}
    </div>
  );
}

function IpResult({
  record,
  markers,
}: {
  record: IpRecord;
  markers: ReturnType<typeof useCaseState>['c']['mapMarkers'];
}) {
  const inside = placesWithin(record.centre, record.accuracyRadiusKm);
  const markersInside = markers.filter(
    (m) => distanceKm(m.at, record.centre) <= record.accuracyRadiusKm,
  );

  return (
    <article className={ip.result} aria-live="polite">
      <EvidenceHeader item={record} />
      <div className={ip.resultGrid}>
        <div>
          <table className={s.kv}>
            <tbody>
              <tr>
                <th scope="row">IP address</th>
                <td>{record.ip}</td>
              </tr>
              <tr>
                <th scope="row">Provider (ISP)</th>
                <td>{record.isp}</td>
              </tr>
              {record.network && (
                <tr>
                  <th scope="row">Network</th>
                  <td>{record.network}</td>
                </tr>
              )}
              <tr>
                <th scope="row">Location</th>
                <td>{record.locationLabel}</td>
              </tr>
              <tr>
                <th scope="row">Accuracy radius</th>
                <td>
                  <strong className={ip.radius}>about {record.accuracyRadiusKm} km</strong>
                </td>
              </tr>
            </tbody>
          </table>
          <div className={ip.inside}>
            <h4>Inside the accuracy circle</h4>
            <ul>
              {inside.map((p) => (
                <li key={p.id}>{p.name}</li>
              ))}
              {markersInside.map((m) => (
                <li key={m.id} className={ip.insideMarker}>
                  <Icon name="mapPin" size={14} /> {m.label}
                </li>
              ))}
            </ul>
          </div>
          {record.note && (
            <p className={s.callout}>
              <Icon name="info" size={16} />
              {record.note}
            </p>
          )}
        </div>
        <CityMap
          circle={{
            centre: record.centre,
            radiusKm: record.accuracyRadiusKm,
            label: record.locationLabel,
          }}
          markers={markers}
          description={`Map showing the estimated location of ${record.ip}: a circle of about ${record.accuracyRadiusKm} km around ${record.locationLabel}, covering ${inside.map((p) => p.name).join(', ')}.`}
        />
      </div>
      <p className={s.prompt}>
        <strong>Think:</strong> the pin shows where the database <em>guesses</em>. The circle shows
        everywhere the device could actually be. Does this lookup place a person at one spot?
      </p>
    </article>
  );
}
