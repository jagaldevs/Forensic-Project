/**
 * Validates EVERY case in src/cases: schema, cross-references, safety rules, and that the
 * answer key is actually achievable by a student.
 */
import { describe, expect, test } from 'vitest';
import { validateCase } from '../engine/validateCase';
import { checkVerdictJudgement } from '../engine/checkJudgement';
import { emptyJudgement } from '../engine/progressTypes';
import type { CaseFile } from '../engine/types';

const caseModules = import.meta.glob<{ default: CaseFile }>('./*/case.ts', { eager: true });
const metaModules = import.meta.glob<{ meta: CaseFile['meta'] }>('./*/meta.ts', { eager: true });

const cases = Object.entries(caseModules).map(([path, mod]) => ({
  folder: path.split('/')[1]!,
  data: mod.default,
}));

test('at least one case exists', () => {
  expect(cases.length).toBeGreaterThan(0);
});

describe.each(cases)('case "$folder"', ({ folder, data }) => {
  test('matches the schema and safety rules', () => {
    expect(validateCase(data)).toEqual([]);
  });

  test('folder name matches meta.id and has a meta.ts', () => {
    expect(data.meta.id).toBe(folder);
    expect(metaModules[`./${folder}/meta.ts`]?.meta).toEqual(data.meta);
  });

  test('every key evidence item can be obtained by a student', () => {
    for (const q of data.questions) {
      if (q.kind !== 'verdict') continue;
      for (const id of q.keyEvidenceIds) {
        const item = data.evidence.find((e) => e.id === id)!;
        if (item.lockedBy === 'warrant') {
          const grantable = data.warrants.requests.some(
            (r) => r.proportionate && r.targets.includes(id),
          );
          expect(grantable, `${id} is locked with no proportionate warrant`).toBe(true);
        }
        if (item.releasedBy) {
          const drop = data.drops.find((d) => d.id === item.releasedBy)!;
          const automatic = drop.triggers.some((t) => t.type !== 'manual');
          expect(automatic, `${id} is only released manually`).toBe(true);
        }
      }
    }
  });

  test('the answer key passes the auto-check', () => {
    for (const q of data.questions) {
      if (q.kind !== 'verdict') continue;
      const result = checkVerdictJudgement(
        q,
        { ...emptyJudgement(), verdict: q.acceptedVerdicts[0]! },
        q.keyEvidenceIds,
        data,
      );
      expect(result.correct, q.id).toBe(true);
    }
  });

  test('every question is in the briefing', () => {
    expect(new Set(data.briefing.questionIds)).toEqual(new Set(data.questions.map((q) => q.id)));
  });
});
