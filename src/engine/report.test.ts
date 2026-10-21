import { expect, test } from 'vitest';
import waterfront from '../cases/waterfront-alibi/case';
import { newCaseProgress } from './progressTypes';
import { buildReport, reportToText } from './report';

test('report includes verdicts, evidence, reasoning and warrants', () => {
  const p = newCaseProgress('waterfront-alibi', 0);
  p.viewed['login-streamcloud'] = 1;
  p.links.push({
    id: 'x',
    evidenceId: 'ip-203-0-113-47',
    questionId: 'q1-ip-location',
    relation: 'contradicts',
  });
  p.judgements['q1-ip-location'] = {
    verdict: 'not-supported',
    explanation: 'The radius is 25 km.',
    limitation: 'Device is not a person.',
    attempts: 2,
    lastResult: { correct: true, messages: [], at: 1 },
  };
  p.warrants.push({
    requestId: 'warrant-router',
    justification: 'To see whose IP.',
    granted: true,
    at: 1,
  });

  const report = buildReport(waterfront, p, 'Agent Kestrel', 0);
  expect(report.complete).toBe(false);
  const text = reportToText(report, { 'ip-203-0-113-47': 'a'.repeat(64) });
  expect(text).toContain('Investigator: Agent Kestrel');
  expect(text).toContain('Verdict: Not supported');
  expect(text).toContain('[Contradicts] IP lookup: 203.0.113.47 (SHA-256 aaaaaaaaaaaa…)');
  expect(text).toContain('Auto-check: passed (check 2)');
  expect(text).toContain('Okafor home router logs: GRANTED');
  expect(text).toContain('Evidence examined: StreamCloud login record');
});

test('report includes the corrected timeline, self-assessment and custody appendix', async () => {
  const { default: jamie } = await import('../cases/where-was-jamie/case');
  const p = newCaseProgress('where-was-jamie', 0);
  p.selfAssessment = { 0: 'partly' };
  p.custody = [{ at: 5, evidenceId: jamie.evidence[0]!.id, action: 'viewed' }];
  const report = buildReport(jamie, p, 'Agent Kestrel', 0);
  expect(report.timeline.length).toBeGreaterThan(0);
  expect(report.selfAssessment[0]).toEqual({
    criterion: jamie.meta.successCriteria[0],
    rating: 'partly',
  });
  const text = reportToText(report);
  expect(text).toContain('Timeline (ACST');
  expect(text).toContain(`[Partly] ${jamie.meta.successCriteria[0]}`);
  expect(text).toContain('Appendix: chain of custody');
  expect(text).toContain(`Viewed: ${jamie.evidence[0]!.title}`);
});

test('assessment reports never show auto-check results', async () => {
  const { default: fair } = await import('../cases/science-fair-switch/case');
  const report = buildReport(fair, newCaseProgress('science-fair-switch', 0), 'Agent K', 0);
  expect(report.assessment).toBe(true);
  expect(reportToText(report)).not.toContain('Auto-check');
});
