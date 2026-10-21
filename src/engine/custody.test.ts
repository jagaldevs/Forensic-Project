import { describe, expect, test } from 'vitest';
import waterfront from '../cases/waterfront-alibi/case';
import { custodyLog } from './custody';
import { newCaseProgress } from './progressTypes';
import { scoreCase } from './score';

describe('custodyLog', () => {
  test('lists collection first, then views and hash checks in time order', () => {
    const p = newCaseProgress('waterfront-alibi', 1000);
    p.custody = [
      { at: 3000, evidenceId: 'photo-gaming-setup', action: 'verified', ok: true },
      { at: 2000, evidenceId: 'photo-gaming-setup', action: 'viewed' },
    ];
    const lines = custodyLog(waterfront, p).filter((l) => l.evidenceId === 'photo-gaming-setup');
    expect(lines.map((l) => l.action)).toEqual(['collected', 'viewed', 'verified']);
  });

  test('warrant-locked items are collected when the warrant is granted', () => {
    const p = newCaseProgress('waterfront-alibi', 1000);
    const request = waterfront.warrants.requests.find((r) => r.proportionate)!;
    const target = request.targets[0]!;
    expect(custodyLog(waterfront, p).some((l) => l.evidenceId === target)).toBe(false);
    p.warrants.push({ requestId: request.id, justification: 'x', granted: true, at: 5000 });
    const line = custodyLog(waterfront, p).find((l) => l.evidenceId === target)!;
    expect(line).toMatchObject({ action: 'collected', at: 5000 });
  });
});

describe('scoreCase', () => {
  test('scores an empty case as zero and the answer key as full marks', () => {
    const empty = scoreCase(waterfront, newCaseProgress('waterfront-alibi'));
    expect(empty.correct).toBe(0);
    expect(empty.total).toBe(waterfront.questions.filter((q) => q.kind === 'verdict').length);

    const p = newCaseProgress('waterfront-alibi');
    for (const q of waterfront.questions) {
      if (q.kind !== 'verdict') continue;
      p.judgements[q.id] = {
        verdict: q.acceptedVerdicts[0]!,
        explanation: '',
        limitation: '',
        attempts: 0,
        lastResult: null,
      };
      for (const id of q.keyEvidenceIds)
        p.links.push({
          id: `${id}->${q.id}`,
          evidenceId: id,
          questionId: q.id,
          relation: 'supports',
        });
    }
    const full = scoreCase(waterfront, p);
    expect(full.correct).toBe(full.total);
    expect(full.questions.find((q) => q.question.kind === 'open')?.correct).toBeNull();
  });
});
