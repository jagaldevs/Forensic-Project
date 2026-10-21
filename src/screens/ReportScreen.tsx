import { useEffect, useMemo, useState } from 'react';
import { useCaseFile } from '../app/CaseContext';
import { Logo } from '../brand/Logo';
import { brand } from '../brand/brand';
import { hashCheck } from '../engine/hash';
import { buildReport, reportToText } from '../engine/report';
import { useNav } from '../stores/navStore';
import { useCaseProgress, useProgress } from '../stores/progressStore';
import { useSettings } from '../stores/settingsStore';
import { Button } from '../ui/Button';
import { Icon } from '../ui/Icon';
import { Badge, StatusBadge } from '../ui/StatusBadge';
import r from './report.module.css';

/** The compiled case report: print / save as PDF, or copy as text. */
export default function ReportScreen() {
  const c = useCaseFile();
  const progress = useCaseProgress(c.meta.id);
  const agentName = useSettings((s) => s.agentName);
  const go = useNav((s) => s.go);
  const report = useMemo(() => buildReport(c, progress, agentName), [c, progress, agentName]);
  const [hashes, setHashes] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<'idle' | 'done' | 'failed'>('idle');

  useEffect(() => {
    let live = true;
    Promise.all(c.evidence.map(async (e) => [e.id, (await hashCheck(e)).recorded] as const)).then(
      (pairs) => live && setHashes(Object.fromEntries(pairs)),
    );
    return () => {
      live = false;
    };
  }, [c]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(reportToText(report, hashes));
      setCopied('done');
    } catch {
      setCopied('failed');
    }
  };

  const doneCount = report.questions.filter((q) => q.done).length;

  return (
    <div className={r.page}>
      <div className={r.toolbar}>
        <Button icon="arrowLeft" onClick={() => go('desktop')}>
          Back to workstation
        </Button>
        <div className={r.toolbarRight}>
          <Button icon={copied === 'done' ? 'check' : 'copy'} onClick={copy}>
            {copied === 'done' ? 'Copied' : 'Copy as text'}
          </Button>
          <Button variant="primary" icon="print" onClick={() => window.print()}>
            Print or save as PDF
          </Button>
        </div>
      </div>
      {copied === 'failed' && (
        <p className={r.notice} role="alert">
          Copying was blocked by the browser. Use Print or save as PDF instead.
        </p>
      )}
      {!report.complete && (
        <p className={r.notice} role="status">
          <Icon name="info" size={16} /> {doneCount} of {report.questions.length} questions
          complete. You can still go back and finish them; this report updates automatically.
        </p>
      )}

      <article className={r.report} aria-labelledby="report-title">
        <header className={r.header}>
          <div>
            <p className={r.eyebrow}>
              {brand.schoolName} · {brand.labName}
            </p>
            <h1 id="report-title">Case report: {report.caseTitle}</h1>
            <dl className={r.meta}>
              <dt>Investigator</dt>
              <dd>{report.agentName}</dd>
              <dt>Generated</dt>
              <dd>{report.generatedAt}</dd>
              <dt>Status</dt>
              <dd>{report.complete ? 'All questions completed' : 'In progress'}</dd>
            </dl>
          </div>
          <Logo size="large" />
        </header>

        <section className={r.section}>
          <h2>Incident</h2>
          <p>{report.incident}</p>
        </section>

        {report.questions.map((q) => (
          <section key={q.number} className={r.section}>
            <h2>
              Q{q.number}. {q.prompt}
            </h2>
            {q.kind === 'verdict' ? (
              <>
                <div className={r.verdictRow}>
                  <span className={r.verdict}>Verdict: {q.verdict ?? 'not chosen'}</span>
                  {q.done ? (
                    <Badge tone="supports" icon="check">
                      Auto-check passed
                    </Badge>
                  ) : (
                    <Badge tone="unassessed" icon="unassessed">
                      {q.attempts ? 'Not yet passed' : 'Not checked'}
                    </Badge>
                  )}
                </div>
                <h3>Evidence</h3>
                {q.evidence.length ? (
                  <ul className={r.evidence}>
                    {q.evidence.map((e) => (
                      <li key={e.item.id}>
                        <StatusBadge status={e.relation} />
                        <span>
                          <strong>{e.item.title}</strong>
                          <span className={r.hash}>
                            SHA-256 {hashes[e.item.id]?.slice(0, 16) ?? '…'}
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={r.empty}>No evidence attached.</p>
                )}
                <h3>Reasoning</h3>
                <p className={r.answer}>
                  {q.explanation || <span className={r.empty}>Not written yet.</span>}
                </p>
                <h3>Limitation</h3>
                <p className={r.answer}>
                  {q.limitation || <span className={r.empty}>Not written yet.</span>}
                </p>
              </>
            ) : (
              <>
                <h3>Answer</h3>
                <p className={r.answer}>
                  {q.explanation || <span className={r.empty}>Not written yet.</span>}
                </p>
              </>
            )}
          </section>
        ))}

        <section className={r.section}>
          <h2>Warrant applications</h2>
          {report.warrants.length ? (
            <ul className={r.warrants}>
              {report.warrants.map((w) => (
                <li key={w.title}>
                  <Badge
                    tone={w.granted ? 'supports' : 'contradicts'}
                    icon={w.granted ? 'supports' : 'contradicts'}
                  >
                    {w.granted ? 'Granted' : 'Refused'}
                  </Badge>
                  <span>
                    <strong>{w.title}</strong>: {w.granted ? 'granted' : 'refused'}.
                    <br />
                    <em>&ldquo;{w.justification}&rdquo;</em>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className={r.empty}>No warrants requested.</p>
          )}
        </section>

        <section className={r.section}>
          <h2>Evidence examined ({report.examined.length})</h2>
          <ul className={r.examined}>
            {report.examined.map((e) => (
              <li key={e.id}>
                {e.title} <span className={r.hash}>{hashes[e.id]?.slice(0, 16)}</span>
              </li>
            ))}
          </ul>
        </section>

        <footer className={r.footer}>
          All people, organisations and records in this case are fictional.
        </footer>
      </article>

      {report.complete && !progress.submittedAt && (
        <div className={r.finalise}>
          <Button
            variant="primary"
            icon="check"
            onClick={() => useProgress.getState().submit(c.meta.id)}
          >
            Mark case as complete
          </Button>
        </div>
      )}
    </div>
  );
}
