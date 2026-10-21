/**
 * Class summary for Teacher Review: one row per student for one case, built from several
 * progress codes. Uses the same auto-scoring as the single-student review (score.ts).
 * Everything stays on this device.
 */
import { describeSupportLevels, type CaseProgress } from './progressTypes';
import { scoreCase } from './score';
import type { CaseFile } from './types';

export type QuestionResult = 'passed' | 'not-yet' | 'not-answered' | 'written' | 'blank';

export const questionResultLabels: Record<QuestionResult, string> = {
  passed: 'Passed',
  'not-yet': 'Not yet',
  'not-answered': 'Not answered',
  written: 'Written',
  blank: 'Blank',
};

export interface SummaryStudent {
  name: string;
  progress: CaseProgress | undefined;
  teacherModeUsedAt: number | null;
}

export interface SummaryRow {
  name: string;
  /** False if this student's code has no progress for the case. */
  started: boolean;
  levels: string;
  results: QuestionResult[];
  correct: number;
  total: number;
  nudges: number;
  hashChecks: number;
  disproportionate: number;
  submittedAt: number | null;
  teacherModeUsedAt: number | null;
  /** Another code in this batch has the same codename. */
  duplicateName: boolean;
}

/** Splits pasted text into progress codes: each code starts with its prefix (HRSFL1. or HRSFL1u.). */
export function splitCodes(text: string): string[] {
  return text
    .split(/(?=HRSFL1u?\.)/)
    .map((part) => part.replace(/\s+/g, ''))
    .filter((part) => /^HRSFL1u?\./.test(part));
}

export function summariseCase(c: CaseFile, students: SummaryStudent[]): SummaryRow[] {
  const nameCounts = new Map<string, number>();
  for (const s of students) {
    const key = s.name.trim().toLowerCase();
    nameCounts.set(key, (nameCounts.get(key) ?? 0) + 1);
  }

  return students.map((s): SummaryRow => {
    const duplicateName = (nameCounts.get(s.name.trim().toLowerCase()) ?? 0) > 1;
    const p = s.progress;
    if (!p)
      return {
        name: s.name,
        started: false,
        levels: '',
        results: c.questions.map((q) => (q.kind === 'open' ? 'blank' : 'not-answered')),
        correct: 0,
        total: c.questions.filter((q) => q.kind === 'verdict').length,
        nudges: 0,
        hashChecks: 0,
        disproportionate: 0,
        submittedAt: null,
        teacherModeUsedAt: s.teacherModeUsedAt,
        duplicateName,
      };
    const score = scoreCase(c, p);
    return {
      name: s.name,
      started: true,
      levels: describeSupportLevels(p),
      results: score.questions.map((q) =>
        q.correct === null
          ? q.answered
            ? 'written'
            : 'blank'
          : q.correct
            ? 'passed'
            : q.answered
              ? 'not-yet'
              : 'not-answered',
      ),
      correct: score.correct,
      total: score.total,
      nudges: p.nudgesUsed?.length ?? 0,
      hashChecks: (p.custody ?? []).filter((e) => e.action === 'verified').length,
      disproportionate: p.warrants.filter(
        (w) => c.warrants.requests.find((r) => r.id === w.requestId)?.proportionate === false,
      ).length,
      submittedAt: p.submittedAt,
      teacherModeUsedAt: s.teacherModeUsedAt,
      duplicateName,
    };
  });
}

/** Notes for one row (also used in the .csv). */
export function rowNotes(row: SummaryRow): string[] {
  const notes: string[] = [];
  if (!row.started) notes.push('Case not started');
  if (row.teacherModeUsedAt) notes.push('Teacher mode was used on this device');
  if (row.duplicateName) notes.push('Same codename as another code');
  return notes;
}

/** Spreadsheet-safe cell: quoted, and never read as a formula. */
function cell(value: string | number): string {
  let text = String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

/** A .csv for a markbook. Starts with a byte-order mark so Excel reads it as UTF-8. */
export function summaryCsv(
  c: CaseFile,
  rows: SummaryRow[],
  formatTime: (ms: number) => string,
): string {
  const header = [
    'Student',
    'Support level',
    ...c.questions.map((q, i) => `Q${i + 1}${q.kind === 'open' ? ' (open)' : ''}`),
    'Auto-score',
    'Out of',
    'Nudges used',
    'Hash checks',
    'Disproportionate requests',
    ...(c.meta.assessment ? ['Submitted'] : []),
    'Notes',
  ];
  const lines = rows.map((row) => [
    row.name,
    row.levels,
    ...row.results.map((r) => questionResultLabels[r]),
    row.correct,
    row.total,
    row.nudges,
    row.hashChecks,
    row.disproportionate,
    ...(c.meta.assessment ? [row.submittedAt ? formatTime(row.submittedAt) : 'No'] : []),
    rowNotes(row).join('; '),
  ]);
  return (
    '\uFEFF' + [header, ...lines].map((line) => line.map(cell).join(',')).join('\r\n') + '\r\n'
  );
}
