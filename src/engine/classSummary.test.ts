import { expect, test } from 'vitest';
import waterfront from '../cases/waterfront-alibi/case';
import { splitCodes, summariseCase, summaryCsv } from './classSummary';
import { newCaseProgress, type CaseProgress, type Judgement } from './progressTypes';

const judgement = (verdict: Judgement['verdict'], explanation = ''): Judgement => ({
  verdict,
  explanation,
  limitation: '',
  attempts: 1,
  lastResult: null,
});

const link = (evidenceId: string, questionId: string) => ({
  id: `${evidenceId}-${questionId}`,
  evidenceId,
  questionId,
  relation: 'supports' as const,
});

test('splitCodes finds codes in any layout, including codes wrapped over lines', () => {
  const text = `HRSFL1.abc
  def

HRSFL1u.xyz HRSFL1.123
not a code`;
  expect(splitCodes(text)).toEqual(['HRSFL1.abcdef', 'HRSFL1u.xyz', 'HRSFL1.123notacode']);
  expect(splitCodes('nothing here')).toEqual([]);
});

test('summariseCase scores each question with the same rule as the student check', () => {
  const p: CaseProgress = {
    ...newCaseProgress(waterfront.meta.id, 0),
    supportLevel: 'guided',
    nudgesUsed: ['q1-ip-location', 'q2-at-home'],
    links: [
      link('login-streamcloud', 'q1-ip-location'),
      link('ip-203-0-113-47', 'q1-ip-location'),
      link('router-log-okafor', 'q1-ip-location'),
      link('photo-foyer-witness', 'q3-photo-identity'),
      link('weather-record', 'q3-photo-identity'),
    ],
    judgements: {
      'q1-ip-location': judgement('not-supported'),
      'q3-photo-identity': judgement('cant-tell'),
      'q4-next-steps': judgement(null, 'Foyer CCTV'),
    },
    warrants: [
      { requestId: 'warrant-router', justification: 'x', granted: true, at: 1 },
      { requestId: 'warrant-phone-history', justification: 'y', granted: false, at: 2 },
    ],
    custody: [{ at: 1, evidenceId: 'photo-foyer-witness', action: 'verified', ok: true }],
  };
  const [row, missing] = summariseCase(waterfront, [
    { name: 'Nova', progress: p, teacherModeUsedAt: null },
    { name: 'Nova ', progress: undefined, teacherModeUsedAt: 5 },
  ]);

  // Q1 passes; Q2 unanswered; Q3 has a distractor attached; Q4 is open and written.
  expect(row!.results.slice(0, 4)).toEqual(['passed', 'not-answered', 'not-yet', 'written']);
  expect(row!.correct).toBe(1);
  expect(row!.total).toBe(3);
  expect(row!.levels).toBe('Guided');
  expect(row!.nudges).toBe(2);
  expect(row!.hashChecks).toBe(1);
  expect(row!.disproportionate).toBe(1);
  expect(row!.duplicateName).toBe(true);
  expect(missing!.started).toBe(false);
  expect(missing!.teacherModeUsedAt).toBe(5);
});

test('summaryCsv is Excel-friendly and never lets a codename become a formula', () => {
  const rows = summariseCase(waterfront, [
    {
      name: '=HYPERLINK("x")',
      progress: newCaseProgress(waterfront.meta.id, 0),
      teacherModeUsedAt: null,
    },
  ]);
  const csv = summaryCsv(waterfront, rows, () => 'time');
  expect(csv.startsWith('\uFEFF"Student","Support level","Q1"')).toBe(true);
  expect(csv).toContain(`"'=HYPERLINK(""x"")"`);
  expect(csv.trimEnd().split('\r\n')).toHaveLength(2);
});
