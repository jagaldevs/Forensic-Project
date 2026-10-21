/**
 * Builds the "Show original" view of an email: the raw header lines a mail client hides,
 * followed by the body. Pure, so it is easy to test.
 */
import type { EvidenceOfType } from '../../engine/types';

type Email = EvidenceOfType<'email'>;
type Mailbox = Email['from'];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const pad = (n: number) => String(n).padStart(2, '0');

/** The offset written in an ISO timestamp: "…+09:30" → "+09:30", "…Z" → "+00:00". */
export function isoOffset(iso: string): string {
  const m = /([+-]\d{2}:\d{2})$/.exec(iso);
  return m ? m[1]! : '+00:00';
}

/** "2026-09-17T19:48:02+09:30" → "Thu, 17 Sep 2026 19:48:02 +0930" (in the timestamp's own zone). */
export function rfc2822Date(iso: string): string {
  const offset = isoOffset(iso);
  const sign = offset.startsWith('-') ? -1 : 1;
  const [h = 0, m = 0] = offset.slice(1).split(':').map(Number);
  const d = new Date(Date.parse(iso) + sign * (h * 60 + m) * 60_000);
  return (
    `${DAYS[d.getUTCDay()]}, ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()} ` +
    `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} ${offset.replace(':', '')}`
  );
}

export function formatMailbox(m: Mailbox): string {
  return m.name ? `${m.name} <${m.address}>` : m.address;
}

/** The domain part of an address or Message-ID: "<a1@mail.x.example>" → "mail.x.example". */
export function domainOf(address: string): string {
  const at = address.lastIndexOf('@');
  return (at === -1 ? address : address.slice(at + 1)).replace(/[<>\s]/g, '').toLowerCase();
}

/** The same organisation: equal domains, or one is a subdomain of the other. */
export function sameOrganisation(a: string, b: string): boolean {
  return a === b || a.endsWith(`.${b}`) || b.endsWith(`.${a}`);
}

export function rawSource(email: Email): string {
  const lines: string[] = [];
  for (const r of email.received)
    lines.push(
      `Received: from ${r.from} ([${r.fromIp}])`,
      `        by ${r.by}; ${rfc2822Date(r.at)}`,
    );
  const receivedBy = email.received[0]?.by ?? 'mail';
  lines.push(
    `Authentication-Results: ${receivedBy}; spf=${email.auth.spf}; dkim=${email.auth.dkim}`,
    `Message-ID: ${email.messageId}`,
    `Date: ${rfc2822Date(email.sentAt)}`,
    `From: ${formatMailbox(email.from)}`,
  );
  if (email.replyTo) lines.push(`Reply-To: ${formatMailbox(email.replyTo)}`);
  lines.push(`To: ${email.to.map(formatMailbox).join(', ')}`, `Subject: ${email.subject}`);
  for (const h of email.extraHeaders ?? []) lines.push(`${h.name}: ${h.value}`);
  lines.push('', email.body);
  return lines.join('\n');
}
