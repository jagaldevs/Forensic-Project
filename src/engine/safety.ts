/**
 * Safety rules for case content. These are enforced by the case validation test.
 * See CLAUDE.md "Safety and ethics rules".
 */

/** Only the IPv4 documentation ranges from RFC 5737 may appear in cases. */
const DOCUMENTATION_PREFIXES = ['192.0.2.', '198.51.100.', '203.0.113.'];

export function isDocumentationIp(value: string): boolean {
  const parts = value.split('.');
  if (parts.length !== 4) return false;
  if (!parts.every((p) => /^\d{1,3}$/.test(p) && Number(p) <= 255 && String(Number(p)) === p))
    return false;
  return DOCUMENTATION_PREFIXES.some((prefix) => value.startsWith(prefix));
}

/**
 * Fictional MACs: the RFC 7042 documentation block 00:00:5E:00:53:xx, or any locally
 * administered address (second hex digit of the first octet is 2, 6, A or E), which no
 * manufacturer is assigned.
 */
export function isFictionalMac(value: string): boolean {
  if (!/^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/.test(value)) return false;
  const upper = value.toUpperCase();
  if (upper.startsWith('00:00:5E:00:53:')) return true;
  return ['2', '6', 'A', 'E'].includes(upper[1]!);
}

/**
 * Real platforms, brands and providers that must not appear in case text.
 * Invent fictional names instead (e.g. StreamCloud, TopNet, Nimbus).
 */
export const BLOCKED_TERMS = [
  'google',
  'gmail',
  'youtube',
  'facebook',
  'instagram',
  'whatsapp',
  'tiktok',
  'snapchat',
  'twitter',
  'discord',
  'reddit',
  'twitch',
  'steam',
  'netflix',
  'spotify',
  'roblox',
  'fortnite',
  'minecraft',
  'apple',
  'iphone',
  'ipad',
  'icloud',
  'samsung',
  'microsoft',
  'outlook',
  'xbox',
  'playstation',
  'nintendo',
  'telstra',
  'optus',
  'vodafone',
  'tpg',
  'aussie broadband',
  'amazon',
  'uber',
  'fitbit',
  'garmin',
  'ring doorbell',
];

const IPV4 = /\b(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})\b/g;

/** Walks every string in a value, returning human-readable problems. */
export function findSafetyIssues(value: unknown, path = 'case'): string[] {
  const issues: string[] = [];
  const visit = (v: unknown, p: string) => {
    if (typeof v === 'string') {
      const lower = v.toLowerCase();
      for (const term of BLOCKED_TERMS) {
        if (new RegExp(`\\b${term}\\b`).test(lower))
          issues.push(`${p}: mentions real brand/platform "${term}"`);
      }
      for (const match of v.matchAll(IPV4)) {
        if (!isDocumentationIp(match[0]))
          issues.push(`${p}: IP ${match[0]} is outside the documentation ranges`);
      }
    } else if (Array.isArray(v)) {
      v.forEach((item, i) => visit(item, `${p}[${i}]`));
    } else if (v && typeof v === 'object') {
      for (const [k, child] of Object.entries(v)) visit(child, `${p}.${k}`);
    }
  };
  visit(value, path);
  return issues;
}
