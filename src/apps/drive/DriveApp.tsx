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
import { formatSize } from './driveFormat';
import { ZonedTime } from './ZonedTime';
import { VersionHistory } from './VersionHistory';
import d from './drive.module.css';

type DriveFile = EvidenceOfType<'file'>;
type Zone = { label: string; utcOffset: string };

const kindIcons: Record<DriveFile['fileKind'], IconName> = {
  spreadsheet: 'table',
  document: 'file',
  image: 'photos',
  other: 'file',
};

const kindLabels: Record<DriveFile['fileKind'], string> = {
  spreadsheet: 'Spreadsheet',
  document: 'Document',
  image: 'Image',
  other: 'File',
};

/** Cloud Drive: file properties (created vs modified, last modified by) and version history. */
export default function DriveApp({ params }: AppProps) {
  const { c, progress, caseId } = useCaseState();
  const files = usableEvidence(c, progress).filter((e): e is DriveFile => e.type === 'file');
  const selected = files.find((f) => f.id === params.selected) ?? files[0] ?? null;

  useEffect(() => {
    if (selected) useProgress.getState().markViewed(caseId, selected.id);
  }, [selected, caseId]);

  if (!selected)
    return (
      <div className={s.empty}>
        <Icon name="folder" size={40} />
        <p>No cloud files have been collected yet.</p>
      </div>
    );

  return (
    <div className={s.app}>
      <div className={s.split}>
        <nav className={s.sidebar} aria-label="Files">
          <ul className={s.list}>
            {files.map((f) => (
              <li key={f.id}>
                <button
                  type="button"
                  className={s.listItem}
                  aria-current={f.id === selected.id}
                  onClick={() => useDesktop.getState().setParams('drive', { selected: f.id })}
                >
                  <Icon name={kindIcons[f.fileKind]} size={18} />
                  <span className={s.listItemText}>
                    <span>{f.fileName}</span>
                    <span className={s.listItemSub}>{f.path || f.service}</span>
                  </span>
                  {!progress.viewed[f.id] && <span className={s.newDot}>NEW</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className={s.main}>
          <FileView key={selected.id} file={selected} zone={selected.displayZone ?? c.timeZone} />
        </div>
      </div>
    </div>
  );
}

function FileView({ file, zone }: { file: DriveFile; zone: Zone }) {
  const { c } = useCaseState();
  const when = (iso: string) => <ZonedTime iso={iso} zone={zone} />;
  const otherZone = zone.utcOffset !== c.timeZone.utcOffset;

  return (
    <article>
      <EvidenceHeader item={file} />
      <p>{file.summary}</p>

      <section className={d.section} aria-labelledby={`props-${file.id}`}>
        <h4 id={`props-${file.id}`} className={d.heading}>
          <Icon name="info" size={16} /> Properties
        </h4>
        <table className={s.kv}>
          <tbody>
            <Row label="Name">{file.fileName}</Row>
            <Row label="Location">
              {file.service}
              {file.path ? ` / ${file.path}` : ''}
            </Row>
            <Row label="Kind">{kindLabels[file.fileKind]}</Row>
            <Row label="Size">{formatSize(file.sizeBytes)}</Row>
            <Row label="Owner">{file.owner}</Row>
            <Row label="Shared with">
              {file.sharedWith?.length ? file.sharedWith.join(', ') : 'Not shared'}
            </Row>
            <Row label="Created">{when(file.createdAt)}</Row>
            <Row label="Modified">{when(file.modifiedAt)}</Row>
            <Row label="Last modified by">{file.lastModifiedBy}</Row>
          </tbody>
        </table>
        {otherZone && (
          <p className={d.zoneNote}>
            <Icon name="clock" size={14} className="inline-icon" /> This service shows every time in{' '}
            <strong>{zone.label}</strong>. Darwin is {c.timeZone.label} (UTC{c.timeZone.utcOffset}).
          </p>
        )}
      </section>

      <VersionHistory file={file} zone={zone} />

      <p className={s.prompt}>
        <strong>Think:</strong> “Created” is when the file first existed; “Modified” is the last
        time anything in it changed. “Last modified by” names the account that was signed in, not
        the person at the keyboard. Who else could have used a device signed in to that account?
      </p>
    </article>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr>
      <th scope="row">{label}</th>
      <td>{children}</td>
    </tr>
  );
}
