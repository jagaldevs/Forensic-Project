import { useEffect, useState } from 'react';
import { caseCatalogue, loadCase } from '../cases';
import {
  questionResultLabels,
  rowNotes,
  splitCodes,
  summariseCase,
  summaryCsv,
  type QuestionResult,
} from '../engine/classSummary';
import { formatLocalDateTime } from '../engine/format';
import type { CaseFile } from '../engine/types';
import { decodeProgress, type ProgressBackup } from '../lib/progressCode';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { Badge } from '../ui/StatusBadge';
import ui from '../ui/ui.module.css';
import s from '../screens/screens.module.css';
import r from './review.module.css';

interface Batch {
  backups: ProgressBackup[];
  errors: { index: number; message: string }[];
}

/**
 * Paste several progress codes and see one case as a students × questions grid, with a .csv
 * for the markbook. Decoded on this device; nothing is uploaded or saved.
 */
export function ClassSummary({ onOpen }: { onOpen: (backup: ProgressBackup) => void }) {
  const [text, setText] = useState('');
  const [caseId, setCaseId] = useState(caseCatalogue[0]?.id ?? '');
  const [loaded, setLoaded] = useState<CaseFile | null>(null);
  const c = loaded?.meta.id === caseId ? loaded : null;
  const [batch, setBatch] = useState<Batch | null>(null);
  const [busy, setBusy] = useState(false);
  const codes = splitCodes(text);

  useEffect(() => {
    let live = true;
    loadCase(caseId)
      .then((data) => live && setLoaded(data))
      .catch(() => live && setLoaded(null));
    return () => {
      live = false;
    };
  }, [caseId]);

  const build = async () => {
    setBusy(true);
    const result: Batch = { backups: [], errors: [] };
    for (const [i, code] of codes.entries()) {
      try {
        result.backups.push(await decodeProgress(code));
      } catch (e) {
        result.errors.push({ index: i + 1, message: (e as Error).message });
      }
    }
    setBatch(result);
    setBusy(false);
  };

  const rows =
    c && batch
      ? summariseCase(
          c,
          batch.backups.map((b) => ({
            name: b.agentName || 'Unnamed agent',
            progress: b.cases[c.meta.id],
            teacherModeUsedAt: b.teacherModeUsedAt,
          })),
        )
      : [];

  const download = () => {
    if (!c) return;
    const csv = summaryCsv(c, rows, formatLocalDateTime);
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${c.meta.id}-class-summary.csv`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <>
      <section className={r.intake} aria-labelledby="class-title">
        <h2 id="class-title" className={s.title}>
          Class summary
        </h2>
        <p className={s.small}>
          Paste every student&rsquo;s progress code (one after another, in any layout), choose a
          case, and see the whole class at once. Codes are read on this device only: nothing is
          uploaded or saved, so download the .csv if you want to keep the table.
        </p>
        <label className={ui.label} htmlFor="class-codes">
          Progress codes
        </label>
        <textarea
          id="class-codes"
          className={`${ui.textarea} ${ui.mono}`}
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={'HRSFL1.…\nHRSFL1.…'}
        />
        <p className={s.small} role="status">
          {codes.length === 1 ? '1 code found' : `${codes.length} codes found`}
        </p>
        <label className={ui.label} htmlFor="class-case">
          Case
        </label>
        <select
          id="class-case"
          className={ui.select}
          value={caseId}
          onChange={(e) => setCaseId(e.target.value)}
        >
          {caseCatalogue.map((m) => (
            <option key={m.id} value={m.id}>
              {m.title}
              {m.assessment ? ' (assessment)' : ''}
            </option>
          ))}
        </select>
        <div className={s.row}>
          <Button variant="primary" icon="table" onClick={build} disabled={!codes.length || busy}>
            {busy ? 'Reading…' : 'Build summary'}
          </Button>
          {batch && (
            <Button
              icon="close"
              onClick={() => {
                setBatch(null);
                setText('');
              }}
            >
              Clear
            </Button>
          )}
        </div>
      </section>

      {batch && (
        <section className={`${r.sheet} ${r.sheetWide}`} aria-labelledby="class-results">
          <div className={r.summaryHead}>
            <h2 id="class-results">{c ? c.meta.title : 'Loading case…'}</h2>
            <Button icon="download" onClick={download} disabled={!c || !rows.length}>
              Download .csv
            </Button>
          </div>
          {batch.errors.length > 0 && (
            <div role="alert">
              <ul className={r.summaryErrors}>
                {batch.errors.map((e) => (
                  <li key={e.index}>
                    <Icon name="alert" size={16} /> Code {e.index} couldn&rsquo;t be read:{' '}
                    {e.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {c && rows.length > 0 && (
            <>
              <div
                className={r.tableWrap}
                role="region"
                aria-label="Class summary table"
                tabIndex={0}
              >
                <table className={r.summaryTable}>
                  <thead>
                    <tr>
                      <th scope="col">Student</th>
                      <th scope="col">Support level</th>
                      {c.questions.map((q, i) => (
                        <th scope="col" key={q.id}>
                          Q{i + 1}
                        </th>
                      ))}
                      <th scope="col">Auto-score</th>
                      <th scope="col">Nudges</th>
                      <th scope="col">Hash checks</th>
                      <th scope="col">Dispro&shy;portionate requests</th>
                      {c.meta.assessment && <th scope="col">Submitted</th>}
                      <th scope="col">Notes</th>
                      <th scope="col">
                        <span className="visually-hidden">Open</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <tr key={i}>
                        <th scope="row">{row.name}</th>
                        <td>{row.started ? row.levels : '–'}</td>
                        {row.results.map((res, j) => (
                          <td key={c.questions[j]!.id}>
                            <ResultCell result={res} />
                          </td>
                        ))}
                        <td>
                          {row.correct} of {row.total}
                        </td>
                        <td>{row.nudges}</td>
                        <td>{row.hashChecks}</td>
                        <td>{row.disproportionate}</td>
                        {c.meta.assessment && (
                          <td>{row.submittedAt ? formatLocalDateTime(row.submittedAt) : 'No'}</td>
                        )}
                        <td className={r.summaryNotes}>
                          {rowNotes(row).map((note) => (
                            <span key={note}>
                              <Icon name="alert" size={14} /> {note}
                            </span>
                          ))}
                        </td>
                        <td>
                          <Button
                            size="small"
                            aria-label={`Open ${row.name}’s work`}
                            onClick={() => onOpen(batch.backups[i]!)}
                          >
                            Open
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <ol className={r.summaryKey} aria-label="Questions">
                {c.questions.map((q, i) => (
                  <li key={q.id}>
                    <strong>Q{i + 1}</strong>
                    {q.kind === 'open' ? ' (open, not scored)' : ''}: {q.prompt}
                  </li>
                ))}
              </ol>
              <p className={r.muted}>
                Auto-scoring checks the verdict and the attached evidence only, using the same rule
                as the students&rsquo; Check button. Open a student&rsquo;s work to read their
                reasoning.
              </p>
            </>
          )}
        </section>
      )}
    </>
  );
}

function ResultCell({ result }: { result: QuestionResult }) {
  const label = questionResultLabels[result];
  if (result === 'passed')
    return (
      <Badge tone="supports" icon="check">
        {label}
      </Badge>
    );
  if (result === 'not-yet')
    return (
      <Badge tone="inconclusive" icon="inconclusive">
        {label}
      </Badge>
    );
  if (result === 'written') return <Badge>{label}</Badge>;
  return (
    <>
      <span aria-hidden="true">–</span>
      <span className="visually-hidden">{label}</span>
    </>
  );
}
