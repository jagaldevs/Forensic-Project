import { describe, expect, test } from 'vitest';
import waterfront from '../cases/waterfront-alibi/case';
import { checkVerdictJudgement, missingBeforeCheck } from './checkJudgement';
import { dropDueAt, dueDrops } from './drops';
import { canonicalJson, hashCheck } from './hash';
import { clockTo12, formatLongDate, formatTime12, formatTime24 } from './format';
import { isLocked, unlockedIds, warrantsRemaining } from './availability';
import { emptyJudgement, newCaseProgress } from './progressTypes';
import { validateCase } from './validateCase';
import type { VerdictQuestion } from './types';

const q1 = waterfront.questions.find((q) => q.id === 'q1-ip-location') as VerdictQuestion;

describe('checkVerdictJudgement', () => {
  test('a wrong verdict gets a nudge, not the answer', () => {
    const r = checkVerdictJudgement(
      q1,
      { ...emptyJudgement(), verdict: 'strongly-supported' },
      q1.keyEvidenceIds,
      waterfront,
    );
    expect(r.correct).toBe(false);
    expect(r.messages.map((m) => m.text)).toContain(q1.hints!.verdict);
    expect(r.messages.every((m) => !/not supported/i.test(m.text))).toBe(true);
  });

  test('uses a verdict-specific hint when there is one', () => {
    const r = checkVerdictJudgement(
      q1,
      { ...emptyJudgement(), verdict: 'cant-tell' },
      [],
      waterfront,
    );
    expect(r.messages[0]!.text).toBe(q1.hints!.byVerdict!['cant-tell']);
  });

  test('flags missing key evidence and attached distractors with hints', () => {
    const r = checkVerdictJudgement(
      q1,
      { ...emptyJudgement(), verdict: 'not-supported' },
      ['login-streamcloud', 'ip-203-0-113-47', 'weather-record'],
      waterfront,
    );
    expect(r.correct).toBe(false);
    const texts = r.messages.map((m) => m.text);
    expect(texts).toContain(q1.hints!.missingEvidence['router-log-okafor']);
    expect(texts).toContain(q1.hints!.distractors['weather-record']);
    expect(r.messages[0]!.tone).toBe('good');
  });

  test('extra neutral evidence does not stop a correct answer', () => {
    const r = checkVerdictJudgement(
      q1,
      { ...emptyJudgement(), verdict: 'not-supported' },
      [...q1.keyEvidenceIds, 'photo-gaming-setup'],
      waterfront,
    );
    expect(r.correct).toBe(true);
  });

  test('requires verdict, evidence, explanation and limitation before checking', () => {
    expect(missingBeforeCheck(q1, emptyJudgement(), [])).toHaveLength(4);
    expect(
      missingBeforeCheck(
        q1,
        {
          ...emptyJudgement(),
          verdict: 'possible',
          explanation: 'Because the IP radius is very large.',
          limitation: 'Device is not a person',
        },
        ['ip-203-0-113-47'],
      ),
    ).toEqual([]);
  });
});

describe('warrants', () => {
  test('router log is locked until its warrant is granted', () => {
    const p = newCaseProgress('waterfront-alibi', 0);
    const log = waterfront.evidence.find((e) => e.id === 'router-log-okafor')!;
    expect(isLocked(log, waterfront, p)).toBe(true);
    p.warrants.push({ requestId: 'warrant-router', justification: 'x', granted: true, at: 1 });
    expect(isLocked(log, waterfront, p)).toBe(false);
    expect(warrantsRemaining(waterfront, p)).toBe(1);
  });

  test('refused applications do not use a warrant or unlock anything', () => {
    const p = newCaseProgress('waterfront-alibi', 0);
    p.warrants.push({
      requestId: 'warrant-phone-history',
      justification: 'x',
      granted: false,
      at: 1,
    });
    expect(warrantsRemaining(waterfront, p)).toBe(2);
    expect(unlockedIds(waterfront, p).size).toBe(0);
  });
});

describe('drops', () => {
  const drop = waterfront.drops[0]!;

  test('fires after the IP lookup is viewed, plus its delay', () => {
    const p = newCaseProgress('waterfront-alibi', 0);
    expect(dueDrops(waterfront, p, 1000)).toEqual([]);
    p.viewed['ip-203-0-113-47'] = 10_000;
    expect(dropDueAt(drop, p)).toBe(15_000);
    expect(dueDrops(waterfront, p, 14_999)).toEqual([]);
    expect(dueDrops(waterfront, p, 15_000)).toEqual([drop]);
  });

  test('fires after six minutes regardless', () => {
    const p = newCaseProgress('waterfront-alibi', 0);
    expect(dueDrops(waterfront, p, 6 * 60_000 + 5000)).toEqual([drop]);
  });

  test('is not released twice', () => {
    const p = newCaseProgress('waterfront-alibi', 0);
    p.releasedDrops[drop.id] = 1;
    expect(dueDrops(waterfront, p, 10 ** 9)).toEqual([]);
  });
});

describe('hash', () => {
  test('canonical JSON ignores key order and non-content fields', () => {
    expect(canonicalJson({ b: 1, a: 2, teacherNote: 'x' })).toBe(canonicalJson({ a: 2, b: 1 }));
  });

  test('items without a recorded hash match; a different recorded hash is a mismatch', async () => {
    const item = waterfront.evidence[0]!;
    const ok = await hashCheck(item);
    expect(ok.match).toBe(true);
    expect(ok.current).toMatch(/^[a-f0-9]{64}$/);
    const tampered = await hashCheck({ ...item, hashAtCollection: '0'.repeat(64) });
    expect(tampered.match).toBe(false);
  });
});

describe('format', () => {
  test('shows case times in ACST regardless of device zone', () => {
    expect(formatTime12('2026-08-14T19:52:07+09:30', '+09:30')).toBe('7:52 pm');
    expect(formatTime24('2026-08-14T10:22:07Z', '+09:30')).toBe('19:52:07');
    // A phone set to AEST shows a 30-minute difference: the Phase 3 time-zone trap.
    expect(formatTime24('2026-08-14T20:22:07+10:00', '+09:30', false)).toBe('19:52');
    expect(clockTo12('00:05')).toBe('12:05 am');
    expect(formatLongDate('2026-08-14')).toBe('Friday 14 August 2026');
  });
});

describe('validateCase', () => {
  test('reports broken references and unsafe IPs', () => {
    const broken = structuredClone(waterfront);
    broken.questions[0] = { ...q1, keyEvidenceIds: ['does-not-exist'] };
    (broken.evidence[1] as { ip: string }).ip = '8.8.8.8';
    const problems = validateCase(broken);
    expect(problems.some((p) => p.includes('does-not-exist'))).toBe(true);
    expect(problems.some((p) => p.includes('8.8.8.8') || p.includes('documentation'))).toBe(true);
  });
});
