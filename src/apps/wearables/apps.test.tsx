/** Smoke tests: the Email and Wearables apps render a case's evidence and their key controls. */
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test } from 'vitest';
import waterfront from '../../cases/waterfront-alibi/case';
import { CaseContext } from '../../app/CaseContext';
import type { CaseFile, Evidence } from '../../engine/types';
import EmailApp from '../email/EmailApp';
import WearablesApp from './WearablesApp';

const base = { source: 'Test fixture', summary: 'A test item.' };

const extra: Evidence[] = [
  {
    ...base,
    id: 'email-fake',
    type: 'email',
    app: 'email',
    title: 'Deadline moved',
    inbox: 'Riley Okafor (school email)',
    from: { name: 'Head Judge', address: 'judge@sciencefair.example' },
    replyTo: { name: 'Head Judge', address: 'prank@freemail.example' },
    to: [{ name: 'Riley', address: 'riley@students.example' }],
    subject: 'Deadline extended',
    sentAt: '2026-08-14T19:48:00+09:30',
    body: 'Hello teams.',
    messageId: '<abc@freemail.example>',
    received: [
      {
        from: 'mail.freemail.example',
        fromIp: '198.51.100.23',
        by: 'mx.students.example',
        at: '2026-08-14T10:18:02Z',
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
    deviceId: 'riley-phone',
    service: 'PulseBand',
    series: [
      {
        measure: 'heartRate',
        unit: 'bpm',
        points: [
          { at: '2026-08-14T18:00', value: 82 },
          { at: '2026-08-14T18:30', value: 74 },
          { at: '2026-08-14T19:00', value: 70 },
        ],
      },
    ],
    events: [{ at: '2026-08-14T18:40', kind: 'charging', event: 'Band placed on charger' }],
  },
];

const c: CaseFile = { ...waterfront, evidence: [...waterfront.evidence, ...extra] };
const inCase = (ui: React.ReactNode) =>
  render(<CaseContext.Provider value={c}>{ui}</CaseContext.Provider>);

test('Email: shows the message, and the original with a plain-English header check', async () => {
  const user = userEvent.setup();
  inCase(<EmailApp params={{}} />);
  expect(screen.getByRole('heading', { name: 'Deadline extended' })).toBeInTheDocument();
  expect(screen.queryByText(/Reply-To/)).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Show original' }));
  expect(screen.getByText(/spf=fail; dkim=none/)).toBeInTheDocument();
  expect(screen.getByText('SPF: fail')).toBeInTheDocument();
  expect(
    screen.getByText(/Replies go somewhere else: prank@freemail\.example/),
  ).toBeInTheDocument();
});

test('Wearables: draws a chart with an accessible summary and a data table', async () => {
  const user = userEvent.setup();
  inCase(<WearablesApp params={{}} />);
  const chart = screen.getByRole('img', { name: /Heart rate \(bpm\)/ });
  expect(chart.getAttribute('aria-label')).toMatch(/Not worn or charging from 18:40/);
  expect(screen.getByText('Not worn / charging')).toBeInTheDocument();
  expect(screen.getByText('Band placed on charger')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Show data table: Heart rate' }));
  expect(screen.getByRole('cell', { name: '82' })).toBeInTheDocument();
});
