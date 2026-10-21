import { useState } from 'react';
import type { EvidenceOfType } from '../../engine/types';
import { Button } from '../../ui/Button';
import { Icon } from '../../ui/Icon';
import { Badge } from '../../ui/StatusBadge';
import s from '../shared/shared.module.css';
import { ZonedTime } from './ZonedTime';
import { diffTables } from './driveFormat';
import d from './drive.module.css';

type DriveFile = EvidenceOfType<'file'>;
type Version = DriveFile['versions'][number];
type Content = NonNullable<Version['content']>;
type Zone = { label: string; utcOffset: string };

/** Every saved version, newest first (as real drives list them). */
export function VersionHistory({ file, zone }: { file: DriveFile; zone: Zone }) {
  const newestFirst = file.versions.map((v, i) => ({ v, i })).reverse();
  const latest = file.versions.length - 1;

  return (
    <section className={d.section} aria-labelledby={`versions-${file.id}`}>
      <h4 id={`versions-${file.id}`} className={d.heading}>
        <Icon name="refresh" size={16} /> Version history ({file.versions.length})
      </h4>
      <ol className={d.versions}>
        {newestFirst.map(({ v, i }) => (
          <VersionItem
            key={`${v.at}-${i}`}
            id={`${file.id}-v${i}`}
            version={v}
            previous={file.versions[i - 1]}
            number={i + 1}
            current={i === latest}
            zone={zone}
          />
        ))}
      </ol>
    </section>
  );
}

function VersionItem({
  id,
  version,
  previous,
  number,
  current,
  zone,
}: {
  id: string;
  version: Version;
  previous: Version | undefined;
  number: number;
  current: boolean;
  zone: Zone;
}) {
  const [view, setView] = useState<'none' | 'content' | 'compare'>('none');
  const toggle = (next: 'content' | 'compare') => setView(view === next ? 'none' : next);
  const canCompare =
    !!version.content && !!previous?.content && comparable(previous.content, version.content);

  return (
    <li className={d.version}>
      <div className={d.versionHead}>
        <div className={d.versionMeta}>
          <span className={d.versionTitle}>
            Version {number}
            {current && (
              <Badge tone="accent" icon="check">
                Current version
              </Badge>
            )}
          </span>
          <ZonedTime iso={version.at} zone={zone} />
          <span className={d.versionBy}>
            <Icon name="user" size={14} className="inline-icon" /> {version.by}
            {version.device && (
              <>
                {' · '}
                <span className={d.device}>{version.device}</span>
              </>
            )}
          </span>
          {version.note && <span className={d.versionNote}>{version.note}</span>}
        </div>
        {version.content && (
          <div className={d.versionActions}>
            <Button
              size="small"
              icon="eye"
              aria-expanded={view === 'content'}
              aria-controls={`${id}-panel`}
              onClick={() => toggle('content')}
            >
              {view === 'content' ? 'Hide' : 'View'}{' '}
              <span className="visually-hidden">version {number}</span>
            </Button>
            {canCompare && (
              <Button
                size="small"
                icon="table"
                aria-expanded={view === 'compare'}
                aria-controls={`${id}-panel`}
                onClick={() => toggle('compare')}
              >
                Compare with previous version{' '}
                <span className="visually-hidden">(version {number})</span>
              </Button>
            )}
          </div>
        )}
      </div>
      {view !== 'none' && version.content && (
        <div id={`${id}-panel`} className={d.panel}>
          {view === 'content' || !previous?.content ? (
            <ContentView content={version.content} />
          ) : (
            <CompareView previous={previous.content} current={version.content} />
          )}
        </div>
      )}
    </li>
  );
}

/** Tables with the same columns can be compared cell by cell; text can always be compared. */
function comparable(a: Content, b: Content): boolean {
  if (a.kind === 'text' && b.kind === 'text') return true;
  return (
    a.kind === 'table' &&
    b.kind === 'table' &&
    a.columns.join('\u0000') === b.columns.join('\u0000')
  );
}

function ContentView({ content }: { content: Content }) {
  if (content.kind === 'text') return <div className={d.text}>{content.text}</div>;
  return (
    <div className={s.tableWrap}>
      <table className={s.table}>
        <thead>
          <tr>
            {content.columns.map((col) => (
              <th key={col} scope="col">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {content.rows.map((row, r) => (
            <tr key={r}>
              {row.map((cell, i) => (
                <td key={i}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function CompareView({ previous, current }: { previous: Content; current: Content }) {
  if (previous.kind === 'text' || current.kind === 'text')
    return (
      <div className={d.sideBySide}>
        <div>
          <p className={d.compareLabel}>Previous version</p>
          <ContentView content={previous} />
        </div>
        <div>
          <p className={d.compareLabel}>This version</p>
          <ContentView content={current} />
        </div>
      </div>
    );

  const diff = diffTables(previous.rows, current.rows);
  return (
    <>
      <p className={d.diffSummary} role="status">
        <Icon name={diff.changed ? 'alert' : 'check'} size={16} className="inline-icon" />{' '}
        {diff.changed === 0
          ? 'No cells changed from the previous version.'
          : `${diff.changed} cell${diff.changed === 1 ? '' : 's'} changed from the previous version.`}
        {diff.removedRows > 0 &&
          ` ${diff.removedRows} row${diff.removedRows === 1 ? ' was' : 's were'} removed.`}
      </p>
      <div className={s.tableWrap}>
        <table className={s.table}>
          <thead>
            <tr>
              {current.columns.map((col) => (
                <th key={col} scope="col">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {diff.rows.map((row, r) => (
              <tr key={r}>
                {row.map((cell, i) => (
                  <td key={i} className={cell.changed ? d.changed : undefined}>
                    {cell.changed && (
                      <span className={d.changeMark} aria-hidden="true">
                        ●
                      </span>
                    )}
                    {cell.value}
                    {cell.changed && (
                      <>
                        <span className="visually-hidden">
                          {cell.was ? ` (changed from ${cell.was})` : ' (new)'}
                        </span>
                        <del className={d.was} aria-hidden="true">
                          {cell.was || 'new'}
                        </del>
                      </>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className={d.legend}>
        <span className={d.changeMark} aria-hidden="true">
          ●
        </span>{' '}
        Changed cell. The old value is shown struck through underneath.
      </p>
    </>
  );
}
