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
