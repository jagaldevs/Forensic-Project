import { useEffect, useState } from 'react';
import { usableEvidence } from '../../engine/availability';
import type { EvidenceOfType } from '../../engine/types';
import { useDesktop } from '../../stores/desktopStore';
import { useProgress } from '../../stores/progressStore';
import { Button } from '../../ui/Button';
import { Icon } from '../../ui/Icon';
import type { AppProps } from '../registry';
import { EvidenceHeader } from '../shared/EvidenceHeader';
import { useCaseState } from '../shared/hooks';
import s from '../shared/shared.module.css';
import p from './photos.module.css';

type Photo = EvidenceOfType<'photo'>;

/** Photo viewer with a "Get info" metadata panel. */
export default function PhotosApp({ params }: AppProps) {
  const { c, progress, caseId } = useCaseState();
  const photos = usableEvidence(c, progress).filter((e): e is Photo => e.type === 'photo');
  const selected = photos.find((ph) => ph.id === params.selected) ?? photos[0] ?? null;
  const [showInfo, setShowInfo] = useState(true);
  const [zoomed, setZoomed] = useState(false);

  useEffect(() => {
    if (selected) useProgress.getState().markViewed(caseId, selected.id);
  }, [selected, caseId]);

  if (!selected)
    return (
      <div className={s.empty}>
        <Icon name="photos" size={40} />
        <p>No photos have been collected yet.</p>
      </div>
    );

  return (
    <div className={p.photos}>
      <nav className={p.strip} aria-label="Photos">
        {photos.map((ph) => (
          <button
            key={ph.id}
            type="button"
            className={p.thumb}
            aria-current={ph.id === selected.id}
            onClick={() => {
              setZoomed(false);
              useDesktop.getState().setParams('photos', { selected: ph.id });
            }}
          >
            <img src={ph.src} alt="" />
            <span>{ph.title}</span>
            {!progress.viewed[ph.id] && <span className={`${s.newDot} ${p.thumbNew}`}>NEW</span>}
          </button>
        ))}
      </nav>

      <div className={p.viewer}>
        <div className={p.toolbar}>
          <span className={p.fileName}>{selected.fileName}</span>
          <div className={p.tools}>
            <Button
              size="small"
              icon="search"
              aria-pressed={zoomed}
              onClick={() => setZoomed((z) => !z)}
            >
              {zoomed ? 'Fit' : 'Zoom'}
            </Button>
            <Button
              size="small"
              variant={showInfo ? 'primary' : 'secondary'}
              icon="info"
              aria-pressed={showInfo}
              aria-controls="photo-info"
              onClick={() => setShowInfo((v) => !v)}
            >
              Get info
            </Button>
          </div>
        </div>
        <div className={p.stageRow}>
          <div className={`${p.imageStage} ${zoomed ? p.zoomed : ''}`}>
            <img src={selected.src} alt={selected.alt} />
          </div>
          {showInfo && (
            <aside id="photo-info" className={p.info} aria-label="Photo information">
              <EvidenceHeader item={selected} />
              <p className={p.summary}>{selected.summary}</p>
              <h4 className={p.infoHeading}>Metadata (EXIF)</h4>
              <table className={s.kv}>
                <tbody>
                  {selected.metadata.map((m) => (
                    <tr key={m.label}>
                      <th scope="row">{m.label}</th>
                      <td>
                        {m.value}
                        {m.note && <span className={s.kvNote}>{m.note}</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className={s.prompt}>
                <strong>Think:</strong> what does this photo show, and what can&rsquo;t it show?
                Metadata records the device&rsquo;s clock and settings, not who was holding it.
              </p>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
