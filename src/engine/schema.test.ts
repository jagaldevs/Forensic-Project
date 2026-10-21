/** The Phase 4 evidence types, checked against a copy of a real case. */
import { describe, expect, test } from 'vitest';
import waterfront from '../cases/waterfront-alibi/case';
import { appsForCase } from '../desktop/appMeta';
import { buildTimeline } from './timeline';
import type { CaseFile, Evidence } from './types';
import { validateCase } from './validateCase';

const base = { source: 'Test fixture', summary: 'A test item.' };

const extra: Evidence[] = [
  {
    ...base,
    id: 'history-lab-laptop',
    type: 'browserHistory',
    app: 'browser',
    title: 'Lab laptop history',
    browser: 'Lumen Browser',
    profile: 'Riley (school account)',
    deviceId: 'riley-laptop',
    entries: [
      { at: '2026-08-14T18:02', kind: 'search', title: 'robotics cup results' },
      {
        at: '2026-08-14T18:03',
        kind: 'visit',
        title: 'Top End Robotics Cup',
        url: 'https://robotics-cup.example/results',
      },
    ],
    cleared: [{ from: '2026-08-14T18:10', to: '2026-08-14T19:00' }],
  },
  {
    ...base,
    id: 'file-results',
    type: 'file',
    app: 'drive',
    title: 'results.sheet',
    service: 'StreamCloud Drive',
    fileName: 'results.sheet',
    path: 'Team 4',
    fileKind: 'spreadsheet',
    sizeBytes: 2048,
    owner: 'Riley Okafor',
    createdAt: '2026-08-10T01:00:00Z',
    modifiedAt: '2026-08-14T13:40:00Z',
    lastModifiedBy: 'Riley Okafor',
    displayZone: { label: 'UTC', utcOffset: '+00:00' },
    versions: [
      { at: '2026-08-10T01:00:00Z', by: 'Riley Okafor', content: { kind: 'text', text: 'v1' } },
      { at: '2026-08-14T13:40:00Z', by: 'Riley Okafor' },
    ],
    timeline: [{ recorded: '2026-08-14T13:40', label: 'results.sheet saved' }],
  },
  {
    ...base,
    id: 'email-judge',
    type: 'email',
    app: 'email',
    title: 'Deadline moved',
    inbox: 'Riley Okafor (school email)',
    from: { name: 'Head Judge', address: 'judge@sciencefair.example' },
    replyTo: { name: 'Head Judge', address: 'prank@freemail.example' },
    to: [{ name: 'Riley', address: 'riley@hrs-students.example' }],
    subject: 'Deadline moved',
    sentAt: '2026-08-14T19:00:00+09:30',
    body: 'Hello',
    messageId: '<abc123@freemail.example>',
    received: [
      {
        from: 'mx.freemail.example',
        fromIp: '198.51.100.23',
        by: 'mail.hrs.example',
        at: '2026-08-14T19:00:02+09:30',
      },
    ],
    auth: { spf: 'fail', dkim: 'none' },
  },
  {
    ...base,
    id: 'band-log',
    type: 'wearableLog',
    app: 'wearables',
    title: 'Band log',
    deviceId: 'riley-laptop',
    service: 'PulseBand',
    series: [
      {
        measure: 'steps',
        unit: 'steps per hour',
        points: [
          { at: '2026-08-14T18:00', value: 120 },
          { at: '2026-08-14T19:00', value: 0 },
        ],
      },
    ],
    events: [{ at: '2026-08-14T19:05', kind: 'charging', event: 'Band placed on charger' }],
    timeline: [
      { recorded: '2026-08-14T19:05', deviceId: 'riley-laptop', label: 'Band on charger' },
    ],
  },
];

const withExtra = (evidence: Evidence[]): CaseFile => ({
  ...waterfront,
  evidence: [...waterfront.evidence, ...evidence],
});

describe('Phase 4 evidence types', () => {
  test('browser history, drive files, emails and wearable logs validate', () => {
    expect(validateCase(withExtra(extra))).toEqual([]);
  });

  test('they get their apps on the dock, and feed the Timeline', () => {
    const c = withExtra(extra);
    expect(appsForCase(c)).toEqual(expect.arrayContaining(['timeline']));
    const labels = buildTimeline(c.evidence, c.incident.date, c.timeZone.utcOffset).map(
      (p) => p.label,
    );
    expect(labels).toEqual(expect.arrayContaining(['results.sheet saved', 'Band on charger']));
  });

  test('a file whose latest version disagrees with its properties is rejected', () => {
    const file = extra[1] as Extract<Evidence, { type: 'file' }>;
    const problems = validateCase(withExtra([{ ...file, lastModifiedBy: 'Sam Okafor' }]));
    expect(problems.join('\n')).toMatch(/lastModifiedBy must match/);
  });

  test('a real-looking email domain is a safety problem', () => {
    const email = extra[2] as Extract<Evidence, { type: 'email' }>;
    const problems = validateCase(
      withExtra([{ ...email, from: { name: 'Judge', address: 'judge@sciencefair.org' } }]),
    );
    expect(problems.join('\n')).toMatch(/real-looking domain/);
  });

  test('practice cases need hints; assessment cases do not', () => {
    const noHints = waterfront.questions.map((q) =>
      q.kind === 'verdict' ? { ...q, hints: undefined } : q,
    );
    expect(validateCase({ ...waterfront, questions: noHints }).join('\n')).toMatch(/need hints/);
    expect(
      validateCase({
        ...waterfront,
        meta: { ...waterfront.meta, assessment: true },
        questions: noHints,
      }).filter((p) => !p.startsWith('(root)')),
    ).toEqual([]);
  });

  test('Deep dive extensions must point at real evidence and have unique ids', () => {
    const x = { id: 'x1', title: 'T', prompt: 'P', evidenceIds: ['nope'], modelAnswer: 'M' };
    const problems = validateCase({ ...waterfront, extensions: [x, { ...x, evidenceIds: [] }] });
    expect(problems.join('\n')).toMatch(/Unknown evidence "nope"/);
    expect(problems.join('\n')).toMatch(/Duplicate id "x1"/);
  });
});
