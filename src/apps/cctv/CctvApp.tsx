import { useEffect } from 'react';
import { usableEvidence } from '../../engine/availability';
import type { EvidenceOfType } from '../../engine/types';
import { useDesktop } from '../../stores/desktopStore';
import { useProgress } from '../../stores/progressStore';
import { Icon } from '../../ui/Icon';
import type { AppProps } from '../registry';
import { EvidenceHeader } from '../shared/EvidenceHeader';
import { useCaseState } from '../shared/hooks';
import s from '../shared/shared.module.css';
import v from './cctv.module.css';

type Still = EvidenceOfType<'cctvStill'>;

/** Security camera stills, with the camera's own timestamp burned into the frame. */
export default function CctvApp({ params }: AppProps) {
  const { c, progress, caseId } = useCaseState();
  const stills = usableEvidence(c, progress).filter((e): e is Still => e.type === 'cctvStill');
  const selected = stills.find((x) => x.id === params.selected) ?? stills[0] ?? null;

  useEffect(() => {
    if (selected) useProgress.getState().markViewed(caseId, selected.id);
  }, [selected, caseId]);

  if (!selected)
    return (
      <div className={s.empty}>
        <Icon name="camera" size={40} />
        <p>No camera footage collected yet.</p>
      </div>
    );

  return (
    <div className={s.app}>
      <div className={s.split}>
        <nav className={s.sidebar} aria-label="Cameras">
          <ul className={s.list}>
            {stills.map((x) => (
              <li key={x.id}>
                <button
                  type="button"
                  className={s.listItem}
                  aria-current={x.id === selected.id}
                  onClick={() => useDesktop.getState().setParams('cctv', { selected: x.id })}
                >
                  <Icon name="camera" size={18} />
                  <span className={s.listItemText}>
                    <span>{x.camera}</span>
                    <span className={s.listItemSub}>{x.location}</span>
                  </span>
                  {!progress.viewed[x.id] && <span className={s.newDot}>NEW</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className={s.main}>
          <EvidenceHeader item={selected} />
          <figure className={v.frame}>
            <img src={selected.src} alt={selected.alt} />
            <span className={v.cam} aria-hidden="true">
              <span className={v.rec} /> {selected.camera}
            </span>
            <span className={v.stamp} aria-hidden="true">
              {selected.overlay}
            </span>
          </figure>
          <table className={s.kv} style={{ marginTop: 'var(--space-3)' }}>
            <tbody>
              <tr>
                <th scope="row">Camera</th>
                <td>{selected.camera}</td>
              </tr>
              <tr>
                <th scope="row">Location</th>
                <td>{selected.location}</td>
              </tr>
              <tr>
                <th scope="row">Frame timestamp</th>
                <td>{selected.overlay}</td>
              </tr>
            </tbody>
          </table>
          {selected.note && (
            <p className={s.callout}>
              <Icon name="info" size={16} />
              {selected.note}
            </p>
          )}
          <p className={s.prompt}>
            <strong>Think:</strong> the timestamp comes from the camera’s own clock. Who set it, and
            how accurate is it?
          </p>
        </div>
      </div>
    </div>
  );
}
