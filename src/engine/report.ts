import { attachedEvidenceIds, isQuestionDone, type CaseProgress } from './progressTypes';
import { clockTo12, formatLongDate, formatLocalDateTime } from './format';
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

export interface ReportData {
  caseTitle: string;
  agentName: string;
  generatedAt: string;
  incident: string;
  questions: ReportQuestion[];
  warrants: { title: string; justification: string; granted: boolean }[];
  examined: Evidence[];
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

  return {
    caseTitle: c.meta.title,
    agentName,
    generatedAt: formatLocalDateTime(now),
    incident: `${c.incident.summary} ${c.incident.location}, ${formatLongDate(c.incident.date)}, ${clockTo12(c.incident.windowStart)} to ${clockTo12(c.incident.windowEnd)}.`,
    questions,
    warrants: progress.warrants.map((w) => ({
      title: c.warrants.requests.find((r) => r.id === w.requestId)?.title ?? w.requestId,
      justification: w.justification,
      granted: w.granted,
    })),
    examined: c.evidence.filter((e) => e.id in progress.viewed),
    complete: questions.every((q) => q.done),
  };
}

/** Plain-text version for copying into a learning platform. */
export function reportToText(r: ReportData, hashes: Record<string, string> = {}): string {
  const lines: string[] = [];
  const rule = '-'.repeat(48);
  lines.push(`CASE REPORT: ${r.caseTitle}`);
  lines.push(`Investigator: ${r.agentName}`);
  lines.push(`Generated: ${r.generatedAt}`);
  lines.push(`Status: ${r.complete ? 'All questions completed' : 'In progress'}`);
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
      lines.push(
        `Auto-check: ${q.done ? `passed (check ${q.attempts})` : q.attempts ? `not yet passed (${q.attempts} checks)` : 'not checked'}`,
      );
    } else {
      lines.push(`Answer: ${q.explanation || '(not written)'}`);
    }
  }

  lines.push('', rule, 'Warrant applications:');
  if (!r.warrants.length) lines.push('  (none)');
  for (const w of r.warrants)
    lines.push(
      `  - ${w.title}: ${w.granted ? 'GRANTED' : 'REFUSED'}. Justification: "${w.justification}"`,
    );

  lines.push('', `Evidence examined: ${r.examined.map((e) => e.title).join('; ') || '(none)'}`);
  return lines.join('\n');
}
