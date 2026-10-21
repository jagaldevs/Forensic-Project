import { expect, test } from 'vitest';
import { newCaseProgress } from '../engine/progressTypes';
import { decodeProgress, encodeProgress, type ProgressBackup } from './progressCode';

const backup: ProgressBackup = {
  v: 3,
  agentName: 'Agent Kestrel-42',
  teacherModeUsedAt: null,
  cases: {
    'waterfront-alibi': {
      ...newCaseProgress('waterfront-alibi', 1),
      briefingRead: true,
      custody: [{ at: 5, evidenceId: 'photo-a', action: 'verified', ok: false }],
      locked: true,
      supportLevel: 'guided',
      supportLevelsUsed: { standard: 1, guided: 2 },
      nudgesUsed: ['q1-ip-location'],
      extensionAnswers: { 'x-utc': 'six twenty-five' },
    },
  },
  academy: {
    'time-zones': {
      startedAt: 1,
      stepIndex: 2,
      completedAt: null,
      steps: {
        'brisbane-to-darwin': {
          attempts: 1,
          correct: true,
          done: true,
          hints: [],
          answer: { type: 'shortAnswer', text: '19:52' },
        },
      },
    },
  },
};

test('round-trips case and academy progress through a code', async () => {
  const code = await encodeProgress(backup);
  expect(code).toMatch(/^HRSFL1u?\./);
  expect(await decodeProgress(code)).toEqual(backup);
});

test('tolerates whitespace and line breaks from copy-paste', async () => {
  const code = await encodeProgress(backup);
  const messy = `  ${code.slice(0, 20)}\n${code.slice(20)}  `;
  expect(await decodeProgress(messy)).toEqual(backup);
});

test('still imports version 1 codes (before the academy existed)', async () => {
  const v1 = { v: 1, agentName: 'Agent Old', cases: backup.cases };
  const code = `HRSFL1u.${btoa(JSON.stringify(v1)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}`;
  const decoded = await decodeProgress(code);
  expect(decoded.academy).toEqual({});
  expect(decoded.teacherModeUsedAt).toBeNull();
  expect(decoded.cases).toEqual(backup.cases);
});

test('rejects junk with a friendly message', async () => {
  await expect(decodeProgress('hello')).rejects.toThrow(/progress code/);
  await expect(decodeProgress('HRSFL1u.e30')).rejects.toThrow(/damaged/);
});

test('version 2 codes import with no teacher-mode record', async () => {
  const v2 = { v: 2, agentName: 'Agent Two', cases: backup.cases, academy: backup.academy };
  const code = `HRSFL1u.${btoa(JSON.stringify(v2)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}`;
  const decoded = await decodeProgress(code);
  expect(decoded).toEqual({ ...backup, agentName: 'Agent Two', teacherModeUsedAt: null });
});
