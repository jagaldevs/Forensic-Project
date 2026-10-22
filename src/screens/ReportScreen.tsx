import { useEffect, useMemo, useState } from 'react';
import { useCaseFile } from '../app/CaseContext';
import { Logo } from '../brand/Logo';
import { brand } from '../brand/brand';
import { collectedEvidence, isLocked } from '../engine/availability';
import { accessWording } from '../engine/accessWording';
import { hashCheck, type HashCheck } from '../engine/hash';
import { buildReport, nudgeNote, reportToText, type ReportData } from '../engine/report';
import type { Evidence } from '../engine/types';
import { playSound } from '../lib/sound';
import { useNav } from '../stores/navStore';
import { useCaseProgress, useProgress } from '../stores/progressStore';
import { useSettings } from '../stores/settingsStore';
import { useAcademy } from '../stores/academyStore';
import { missionCatalogue } from '../missions';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { Icon } from '../ui/Icon';
import { Badge, StatusBadge } from '../ui/StatusBadge';
import { BoardSnapshot } from './report/BoardSnapshot';
import { SelfAssessment } from './report/SelfAssessment';
import r from './report.module.css';

/** A safe file name from the codename, e.g. "Agent Kestrel-42" → "agent-kestrel-42". */
const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'agent';

/** The compiled case report: print / save as PDF, copy as text, or download a .txt file. */
export default function ReportScreen() {
  const c = useCaseFile();
  const progress = useCaseProgress(c.meta.id);
  const agentName = useSettings((s) => s.agentName);
  const go = useNav((s) => s.go);
  const academy = useAcademy((s) => s.missions);
  const badges = missionCatalogue
    .filter((m) => academy[m.id]?.completedAt)
    .map((m) => m.badge.name);
  const report = useMemo(() => buildReport(c, progress, agentName), [c, progress, agentName]);
  const [checks, setChecks] = useState<Record<string, HashCheck>>({});
  const [copied, setCopied] = useState<'idle' | 'done' | 'failed'>('idle');
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  useEffect(() => {
    let live = true;
    Promise.all(c.evidence.map(async (e) => [e.id, await hashCheck(e)] as const)).then(
      (pairs) => live && setChecks(Object.fromEntries(pairs)),
    );
    return () => {
      live = false;
    };
  }, [c]);

  const hashes = Object.fromEntries(Object.entries(checks).map(([id, h]) => [id, h.recorded]));
  const asText = () =>
    `${reportToText(report, hashes)}\n\nTraining badges: ${badges.length ? badges.join(', ') : 'none yet'}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(asText());
      setCopied('done');
    } catch {
      setCopied('failed');
    }
  };

  const download = () => {
    const url = URL.createObjectURL(new Blob([asText()], { type: 'text/plain;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug(agentName)}-${c.meta.id}-report.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const doneCount = report.questions.filter((q) => q.done).length;
  const collected = collectedEvidence(c, progress).filter((e) => !isLocked(e, c, progress));

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
          <Button icon="download" onClick={download}>
            Download .txt
          </Button>
          <Button variant="primary" icon="print" onClick={() => window.print()}>
            Print or save as PDF
          </Button>
        </div>
      </div>
      {copied === 'failed' && (
        <p className={r.notice} role="alert">
          Copying was blocked by the browser. Use Download .txt or Print instead.
        </p>
      )}
      {report.submittedAt && report.assessment ? (
        <p className={r.notice} role="status">
          <Icon name="lock" size={16} /> Submitted {report.submittedAt}. This report is locked; your
          teacher will review it.
        </p>
      ) : (
        !report.complete && (
          <p className={r.notice} role="status">
            <Icon name="info" size={16} /> {doneCount} of {report.questions.length} questions{' '}
            {report.assessment ? 'saved' : 'complete'}. You can still go back and finish them; this
            report updates automatically.
          </p>
        )
      )}

      <article className={r.report} aria-labelledby="report-title">
        <Cover report={report} badges={badges} />

        <section className={r.section}>
          <h2>Incident</h2>
          <p>{report.incident}</p>
        </section>

        {report.questions.map((q) => (
          <QuestionSection key={q.number} q={q} report={report} hashes={hashes} />
        ))}

        {report.extensions.length > 0 && (
          <section className={r.section}>
            <h2>Deep dive challenges</h2>
            <p className={r.extensionNote}>Optional extension tasks. Not marked.</p>
            {report.extensions.map((x) => (
              <div key={x.title} className={r.extension}>
                <h3>{x.title}</h3>
                <p className={r.extensionNote}>{x.prompt}</p>
                <p>{x.answer}</p>
              </div>
            ))}
          </section>
        )}

        {report.timeline.length > 0 && <TimelineSection report={report} />}

        {Object.keys(progress.board).length > 0 && (
          <section className={`${r.section} ${r.long}`}>
            <h2>Evidence board</h2>
            <BoardSnapshot c={c} progress={progress} />
          </section>
        )}

        <section className={r.section}>
          <h2>{accessWording(c).heading}</h2>
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
            <p className={r.empty}>{accessWording(c).noneRequested}</p>
          )}
        </section>

        {report.selfAssessment.length > 0 && (
          <SelfAssessment
            report={report}
            locked={!!progress.locked}
            onRate={(i, rating) => useProgress.getState().setSelfAssessment(c.meta.id, i, rating)}
          />
        )}

        <section className={r.section}>
          <h2>Evidence examined ({report.examined.length})</h2>
          <ul className={r.examined}>
            {report.examined.map((e) => (
              <li key={e.id}>{e.title}</li>
            ))}
          </ul>
        </section>

        <section className={`${r.section} ${r.appendix}`}>
          <h2>Appendix: chain of custody</h2>
          <p className={r.small}>
            Each item&rsquo;s SHA-256 hash at collection, checked against the item as it is now,
            followed by every recorded action. Times are on this device&rsquo;s clock.
          </p>
          <table className={r.table}>
            <thead>
              <tr>
                <th scope="col">Item</th>
                <th scope="col">SHA-256 at collection</th>
                <th scope="col">Check</th>
              </tr>
            </thead>
            <tbody>
              {collected.map((e) => {
                const h = checks[e.id];
                return (
                  <tr key={e.id}>
                    <td>{e.title}</td>
                    <td className={r.hash}>{h?.recorded ?? '…'}</td>
                    <td>
                      {h &&
                        (h.match ? (
                          <Badge tone="supports" icon="check">
                            Matches
                          </Badge>
                        ) : (
                          <Badge tone="contradicts" icon="alert">
                            Mismatch
                          </Badge>
                        ))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {report.custody.length > 0 && (
            <table className={r.table}>
              <thead>
                <tr>
                  <th scope="col">When</th>
                  <th scope="col">Action</th>
                  <th scope="col">Item</th>
                  <th scope="col">Detail</th>
                </tr>
              </thead>
              <tbody>
                {report.custody.map((row, i) => (
                  <tr key={i}>
                    <td className={r.nowrap}>{row.when}</td>
                    <td>{row.action}</td>
                    <td>{row.item}</td>
                    <td>{row.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <footer className={r.footer}>
          All people, organisations and records in this case are fictional.
        </footer>
      </article>

      <Finalise
        report={report}
        doneCount={doneCount}
        onComplete={() => {
          useProgress.getState().submit(c.meta.id);
          playSound('submit');
        }}
        onSubmit={() => setConfirmSubmit(true)}
      />

      {confirmSubmit && (
        <Dialog
          title="Submit your assessment?"
          onClose={() => setConfirmSubmit(false)}
          actions={
            <>
              <Button onClick={() => setConfirmSubmit(false)}>Keep working</Button>
              <Button
                variant="primary"
                icon="check"
                onClick={() => {
                  useProgress.getState().submit(c.meta.id, { lock: true });
                  playSound('submit');
                  setConfirmSubmit(false);
                }}
              >
                Submit
              </Button>
            </>
          }
        >
          <p>
            You can only submit <strong>once</strong>. After that, your answers, board and report
            are locked.
          </p>
          <p style={{ marginTop: 'var(--space-3)' }}>
            {doneCount} of {report.questions.length} answers saved.
            {doneCount < report.questions.length &&
              ' Unsaved or unfinished answers will be submitted as they are.'}
          </p>
        </Dialog>
      )}
    </div>
  );
}

function Cover({ report, badges }: { report: ReportData; badges: string[] }) {
  const status = report.submittedAt
    ? `Submitted ${report.submittedAt}`
    : report.complete
      ? 'All questions completed'
      : 'In progress';
  return (
    <header className={r.cover}>
      <div className={r.coverTop}>
        <p className={r.eyebrow}>
          {brand.schoolName} · {brand.labName}
        </p>
        <Logo size="large" />
      </div>
      <div>
        <p className={r.coverKind}>{report.assessment ? 'Assessment report' : 'Case report'}</p>
        <h1 id="report-title">{report.caseTitle}</h1>
      </div>
      <dl className={r.meta}>
        <dt>Investigator</dt>
        <dd>{report.agentName}</dd>
        <dt>Generated</dt>
        <dd>{report.generatedAt}</dd>
        <dt>Status</dt>
        <dd>{status}</dd>
        <dt>Support level</dt>
        <dd>
          {report.supportLevel}
          {nudgeNote(report)}
        </dd>
        <dt>Training badges</dt>
        <dd>{badges.length ? badges.join(', ') : 'None yet'}</dd>
      </dl>
      <p className={r.coverNote}>
        All people, organisations and records in this case are fictional.
      </p>
    </header>
  );
}

function QuestionSection({
  q,
  report,
  hashes,
}: {
  q: ReportData['questions'][number];
  report: ReportData;
  hashes: Record<string, string>;
}) {
  return (
    <section className={r.section}>
      <h2>
        Q{q.number}. {q.prompt}
      </h2>
      {q.kind === 'verdict' ? (
        <>
          <div className={r.verdictRow}>
            <span className={r.verdict}>Verdict: {q.verdict ?? 'not chosen'}</span>
            {report.assessment ? (
              q.done && (
                <Badge tone="info" icon="check">
                  Saved
                </Badge>
              )
            ) : q.done ? (
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
                    <span className={r.hash}>SHA-256 {hashes[e.item.id]?.slice(0, 16) ?? '…'}</span>
                  </span>
                  {imageOf(e.item) && <img className={r.thumb} src={imageOf(e.item)} alt="" />}
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
  );
}

function TimelineSection({ report }: { report: ReportData }) {
  return (
    <section className={`${r.section} ${r.long}`}>
      <h2>Timeline</h2>
      <p className={r.small}>
        In {report.timeZoneLabel}, after the clock corrections made on the Timeline.
      </p>
      <table className={r.table}>
        <thead>
          <tr>
            <th scope="col">Time</th>
            <th scope="col">Event</th>
            <th scope="col">Source</th>
          </tr>
        </thead>
        <tbody>
          {report.timeline.map((t, i) => (
            <tr key={i}>
              <td className={`${r.hash} ${r.nowrap}`}>
                {t.time}
                {t.nextDay && ' +1 day'}
              </td>
              <td>
                {t.label}
                {t.note && <span className={r.rowNote}>{t.note}</span>}
              </td>
              <td>{t.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function Finalise({
  report,
  doneCount,
  onComplete,
  onSubmit,
}: {
  report: ReportData;
  doneCount: number;
  onComplete: () => void;
  onSubmit: () => void;
}) {
  if (report.submittedAt) return null;
  if (report.assessment)
    return (
      <div className={r.finalise}>
        <p className={r.small}>
          {doneCount} of {report.questions.length} answers saved. Check your report, then submit it
          once.
        </p>
        <Button variant="primary" icon="check" onClick={onSubmit}>
          Submit assessment
        </Button>
      </div>
    );
  if (!report.complete) return null;
  return (
    <div className={r.finalise}>
      <Button variant="primary" icon="check" onClick={onComplete}>
        Mark case as complete
      </Button>
    </div>
  );
}

/** The picture an evidence item shows, for a small thumbnail beside it in the report. */
function imageOf(item: Evidence): string | undefined {
  if (item.type === 'photo' || item.type === 'cctvStill') return item.src;
  if (item.type === 'socialPost') return item.image?.src;
  return undefined;
}
