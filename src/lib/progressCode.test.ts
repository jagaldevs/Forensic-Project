import { expect, test } from 'vitest';
import { newCaseProgress } from '../engine/progressTypes';
import { decodeProgress, encodeProgress, type ProgressBackup } from './progressCode';

const backup: ProgressBackup = {
  v: 1,
  agentName: 'Agent Kestrel-42',
  cases: { 'waterfront-alibi': { ...newCaseProgress('waterfront-alibi', 1), briefingRead: true } },
};

test('round-trips progress through a code', async () => {
  const code = await encodeProgress(backup);
  expect(code).toMatch(/^HRSFL1u?\./);
  expect(await decodeProgress(code)).toEqual(backup);
});

test('tolerates whitespace and line breaks from copy-paste', async () => {
  const code = await encodeProgress(backup);
  const messy = `  ${code.slice(0, 20)}\n${code.slice(20)}  `;
  expect(await decodeProgress(messy)).toEqual(backup);
});

test('rejects junk with a friendly message', async () => {
  await expect(decodeProgress('hello')).rejects.toThrow(/progress code/);
  await expect(decodeProgress('HRSFL1u.e30')).rejects.toThrow(/damaged/);
});
