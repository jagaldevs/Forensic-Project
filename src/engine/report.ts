import { usableEvidence } from './availability';
import { custodyLog } from './custody';
import {
  attachedEvidenceIds,
  describeSupportLevels,
  isQuestionDone,
  type CaseProgress,
  type SelfRating,
} from './progressTypes';
import { clockTo12, formatLongDate, formatLocalDateTime } from './format';
import { buildTimeline, minutesToClock } from './timeline';
import type { CaseFile, Evidence, Relation, Verdict } from './types';

const VERDICT_LABELS: Record<Verdict, string> = {
  'strongly-supported': 'Strongly supported',
  possible: 'Possible',
  'not-supported': 'Not supported',
  'cant-tell': "Can't tell",
};

const RELATION_LABELS: Record<Relation, string> = {
  supports: 'Supports',
  contradicts: 'Contradicts',
  inconclusive: 'Inconclusive',
};

export const SELF_RATING_LABELS: Record<SelfRating, string> = {
  yes: 'Yes',
  partly: 'Partly',
  'not-yet': 'Not yet',
};

const CUSTODY_LABELS = { collected: 'Collected', viewed: 'Viewed', verified: 'Hash checked' };

export interface ReportEvidence {
  item: Evidence;
  relation: Relation;
}

export interface ReportQuestion {
  number: number;
  prompt: string;
  kind: 'verdict' | 'open';
  verdict: string | null;
  evidence: ReportEvidence[];
  explanation: string;
  limitation: string;
  done: boolean;
  attempts: number;
}

export interface ReportTimelineRow {
  /** Case time, after the student's clock corrections. */
  time: string;
  nextDay: boolean;
  label: string;
  source: string;
  /** e.g. "recorded as 13:52 on StreamCloud Drive service, clock corrected". */
  note: string | null;
}

export interface ReportCustodyRow {
  when: string;
  item: string;
  action: string;
  detail: string;
}

export interface ReportData {
  caseTitle: string;
  agentName: string;
  generatedAt: string;
  incident: string;
  /** An assessment: no auto-check results are shown to the student. */
  assessment: boolean;
  submittedAt: string | null;
  timeZoneLabel: string;
  /** e.g. "Guided (also used: Standard)". */
  supportLevel: string;
  /** Question numbers where a Guided nudge was opened. */
  nudges: number[];
  questions: ReportQuestion[];
  /** Deep dive challenges the student answered. */
  extensions: { title: string; prompt: string; answer: string }[];
  timeline: ReportTimelineRow[];
  warrants: { title: string; justification: string; granted: boolean }[];
  selfAssessment: { criterion: string; rating: SelfRating | null }[];
  examined: Evidence[];
  custody: ReportCustodyRow[];
  complete: boolean;
}

/** Gathers everything the report shows. Pure, so it is easy to test. */
export function buildReport(
  c: CaseFile,
  progress: CaseProgress,
  agentName: string,
  now = Date.now(),
): ReportData {
  const byId = new Map(c.evidence.map((e) => [e.id, e]));
  const questions: ReportQuestion[] = c.questions.map((q, i) => {
    const j = progress.judgements[q.id];
    const evidence = attachedEvidenceIds(progress, q.id)
      .map((id) => ({
        item: byId.get(id)!,
        relation: progress.links.find((l) => l.questionId === q.id && l.evidenceId === id)!
          .relation,
      }))
      .filter((x) => x.item);
    return {
      number: i + 1,
      prompt: q.prompt,
      kind: q.kind,
      verdict: j?.verdict ? VERDICT_LABELS[j.verdict] : null,
      evidence,
      explanation: j?.explanation.trim() ?? '',
      limitation: j?.limitation.trim() ?? '',
      done: isQuestionDone(progress, q),
      attempts: j?.attempts ?? 0,
    };
  });

  const deviceName = (id?: string) => c.devices.find((d) => d.id === id)?.name;
  const timeline = buildTimeline(
    usableEvidence(c, progress),
    c.incident.date,
    c.timeZone.utcOffset,
    progress.clockCorrections ?? {},
  ).map((p) => {
    const device = deviceName(p.deviceId);
    return {
      time: minutesToClock(p.minutes),
      nextDay: p.minutes >= 1440,
      label: p.label,
      source: byId.get(p.evidenceId)?.title ?? p.evidenceId,
      note: device
        ? `recorded as ${p.recordedClock} on ${device}${p.corrected ? ', clock corrected' : ''}`
        : null,
    };
  });

  return {
    caseTitle: c.meta.title,
    agentName,
    generatedAt: formatLocalDateTime(now),
    incident: `${c.incident.summary} ${c.incident.location}, ${formatLongDate(c.incident.date)}, ${clockTo12(c.incident.windowStart)} to ${clockTo12(c.incident.windowEnd)}.`,
    assessment: !!c.meta.assessment,
    submittedAt: progress.submittedAt ? formatLocalDateTime(progress.submittedAt) : null,
    timeZoneLabel: c.timeZone.label,
    supportLevel: describeSupportLevels(progress),
    nudges: c.questions.flatMap((q, i) => (progress.nudgesUsed?.includes(q.id) ? [i + 1] : [])),
    questions,
    extensions: (c.extensions ?? []).flatMap((x) => {
      const answer = progress.extensionAnswers?.[x.id]?.trim();
      return answer ? [{ title: x.title, prompt: x.prompt, answer }] : [];
    }),
    timeline,
    warrants: progress.warrants.map((w) => ({
      title: c.warrants.requests.find((r) => r.id === w.requestId)?.title ?? w.requestId,
      justification: w.justification,
      granted: w.granted,
    })),
    selfAssessment: c.meta.successCriteria.map((criterion, i) => ({
      criterion,
      rating: progress.selfAssessment?.[i] ?? null,
    })),
    examined: c.evidence.filter((e) => e.id in progress.viewed),
    custody: custodyLog(c, progress).map((l) => ({
      when: formatLocalDateTime(l.at),
      item: byId.get(l.evidenceId)?.title ?? l.evidenceId,
      action: CUSTODY_LABELS[l.action],
      detail: l.detail,
    })),
    complete: questions.every((q) => q.done),
  };
}

/** ", nudges opened on Q1, Q3" (empty when none). */
export function nudgeNote(r: ReportData): string {
  return r.nudges.length ? `, nudges opened on ${r.nudges.map((n) => `Q${n}`).join(', ')}` : '';
}

/** Plain-text version for copying into a learning platform or saving as a .txt file. */
export function reportToText(r: ReportData, hashes: Record<string, string> = {}): string {
  const lines: string[] = [];
  const rule = '-'.repeat(48);
  lines.push(`CASE REPORT: ${r.caseTitle}`);
  lines.push(`Investigator: ${r.agentName}`);
  lines.push(`Generated: ${r.generatedAt}`);
  lines.push(
    `Status: ${r.submittedAt ? `Submitted ${r.submittedAt}` : r.complete ? 'All questions completed' : 'In progress'}`,
  );
  lines.push(`Support level: ${r.supportLevel}${nudgeNote(r)}`);
  lines.push('', `Incident: ${r.incident}`);

  for (const q of r.questions) {
    lines.push('', rule, `Q${q.number}. ${q.prompt}`);
    if (q.kind === 'verdict') {
      lines.push(`Verdict: ${q.verdict ?? '(not chosen)'}`);
      lines.push('Evidence:');
      if (!q.evidence.length) lines.push('  (none attached)');
      for (const e of q.evidence) {
        const hash = hashes[e.item.id];
        lines.push(
          `  - [${RELATION_LABELS[e.relation]}] ${e.item.title}${hash ? ` (SHA-256 ${hash.slice(0, 12)}…)` : ''}`,
        );
      }
      lines.push(`Reasoning: ${q.explanation || '(not written)'}`);
      lines.push(`Limitation: ${q.limitation || '(not written)'}`);
      if (!r.assessment)
        lines.push(
          `Auto-check: ${q.done ? `passed (check ${q.attempts})` : q.attempts ? `not yet passed (${q.attempts} checks)` : 'not checked'}`,
        );
    } else {
      lines.push(`Answer: ${q.explanation || '(not written)'}`);
    }
  }

  if (r.extensions.length) {
    lines.push('', rule, 'Deep dive challenges (optional, not marked):');
    for (const x of r.extensions) lines.push(`  ${x.title}: ${x.answer}`);
  }

  if (r.timeline.length) {
    lines.push('', rule, `Timeline (${r.timeZoneLabel}, with my clock corrections):`);
    for (const t of r.timeline)
      lines.push(
        `  ${t.time}${t.nextDay ? ' (next day)' : ''}  ${t.label} [${t.source}]${t.note ? ` (${t.note})` : ''}`,
      );
  }

  lines.push('', rule, 'Warrant applications:');
  if (!r.warrants.length) lines.push('  (none)');
  for (const w of r.warrants)
    lines.push(
      `  - ${w.title}: ${w.granted ? 'GRANTED' : 'REFUSED'}. Justification: "${w.justification}"`,
    );

  if (r.selfAssessment.length) {
    lines.push('', rule, 'Self-assessment:');
    for (const s of r.selfAssessment)
      lines.push(`  [${s.rating ? SELF_RATING_LABELS[s.rating] : '  '}] ${s.criterion}`);
  }

  lines.push('', `Evidence examined: ${r.examined.map((e) => e.title).join('; ') || '(none)'}`);

  if (r.custody.length) {
    lines.push('', rule, 'Appendix: chain of custody');
    for (const c of r.custody) lines.push(`  ${c.when}  ${c.action}: ${c.item} (${c.detail})`);
  }
  return lines.join('\n');
}
