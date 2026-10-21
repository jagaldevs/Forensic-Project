import { describe, expect, test } from 'vitest';
import type { EvidenceOfType } from '../../engine/types';
import { headerChecks } from './headerCheck';
import { domainOf, rawSource, rfc2822Date } from './rawSource';

const spoofed: EvidenceOfType<'email'> = {
  id: 'email-fake',
  type: 'email',
  app: 'email',
  title: 'Deadline moved',
  summary: 'A test email.',
  source: 'Test fixture',
  inbox: 'Morgan Lee (school email)',
  from: { name: 'Head Judge', address: 'head.judge@sciencefair.example' },
  replyTo: { name: 'Head Judge', address: 'fair.updates@quickpost.example' },
  to: [
    { name: 'Morgan Lee', address: 'morgan.lee@students.example' },
    { name: 'Priya Nair', address: 'priya.nair@students.example' },
  ],
  subject: 'Deadline extended',
  sentAt: '2026-09-17T19:48:00+09:30',
  body: 'Hello teams.',
  messageId: '<x7f2@mail.quickpost.example>',
  received: [
    {
      from: 'mail.quickpost.example',
      fromIp: '198.51.100.23',
      by: 'mx.students.example',
      at: '2026-09-17T10:18:02Z',
    },
    {
      from: 'webmail.quickpost.example',
      fromIp: '203.0.113.9',
      by: 'mail.quickpost.example',
      at: '2026-09-17T10:18:01Z',
    },
  ],
  auth: { spf: 'fail', dkim: 'none', detail: 'Sent through a free webmail service.' },
  extraHeaders: [{ name: 'X-Mailer', value: 'QuickPost Webmail' }],
};

describe('rawSource', () => {
  test('formats dates in the timestamp’s own zone, RFC 2822 style', () => {
    expect(rfc2822Date('2026-09-17T19:48:02+09:30')).toBe('Thu, 17 Sep 2026 19:48:02 +0930');
    expect(rfc2822Date('2026-09-17T10:18:02Z')).toBe('Thu, 17 Sep 2026 10:18:02 +0000');
  });

  test('lists headers in the order a real original shows them, then the body', () => {
    const lines = rawSource(spoofed).split('\n');
    expect(lines[0]).toBe('Received: from mail.quickpost.example ([198.51.100.23])');
    expect(lines[1]).toBe('        by mx.students.example; Thu, 17 Sep 2026 10:18:02 +0000');
    const names = lines.map((l) => l.split(':')[0]);
    const order = ['Authentication-Results', 'Message-ID', 'Date', 'From', 'Reply-To', 'To'];
    const positions = order.map((n) => names.indexOf(n));
    expect(positions.every((p, i) => p > 1 && (i === 0 || p > positions[i - 1]!))).toBe(true);
    expect(lines).toContain('Authentication-Results: mx.students.example; spf=fail; dkim=none');
    expect(lines).toContain(
      'To: Morgan Lee <morgan.lee@students.example>, Priya Nair <priya.nair@students.example>',
    );
    expect(lines).toContain('X-Mailer: QuickPost Webmail');
    expect(lines.at(-2)).toBe('');
    expect(lines.at(-1)).toBe('Hello teams.');
  });

  test('leaves out Reply-To when there is none', () => {
    expect(rawSource({ ...spoofed, replyTo: undefined })).not.toMatch(/Reply-To/);
  });

  test('domainOf handles addresses and Message-IDs', () => {
    expect(domainOf('<x7f2@Mail.QuickPost.example>')).toBe('mail.quickpost.example');
    expect(domainOf('a@b.example')).toBe('b.example');
  });
});

describe('headerChecks', () => {
  test('flags a spoofed email in plain words', () => {
    const checks = Object.fromEntries(headerChecks(spoofed).map((c) => [c.id, c]));
    expect(checks['reply-to']).toMatchObject({ tone: 'inconclusive' });
    expect(checks['reply-to']!.text).toMatch(/fair\.updates@quickpost\.example/);
    expect(checks.spf).toMatchObject({ tone: 'contradicts', label: 'SPF: fail' });
    expect(checks.dkim!.text).toMatch(/no digital signature/i);
    expect(checks.origin!.text).toMatch(/webmail\.quickpost\.example \[203\.0\.113\.9\]/);
    expect(checks['message-id']).toMatchObject({ label: 'Message-ID from elsewhere' });
    expect(checks.detail!.text).toBe(spoofed.auth.detail);
  });

  test('a genuine email passes every check', () => {
    const genuine = {
      ...spoofed,
      replyTo: undefined,
      messageId: '<a1@mail.sciencefair.example>',
      received: [{ ...spoofed.received[0]!, from: 'mail.sciencefair.example' }],
      auth: { spf: 'pass' as const, dkim: 'pass' as const },
    };
    const tones = headerChecks(genuine).map((c) => c.tone);
    expect(tones.every((t) => t === 'supports' || t === 'info')).toBe(true);
  });
});
