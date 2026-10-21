import type { Evidence } from './types';

/** Fields that are not part of the evidence content itself. */
const EXCLUDED = new Set(['hashAtCollection', 'teacherNote', 'src']);

/** Stable JSON with sorted keys, so the same content always gives the same hash. */
export function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') {
    const entries = Object.entries(value)
      .filter(([k, v]) => !EXCLUDED.has(k) && v !== undefined)
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0));
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${canonicalJson(v)}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

export async function sha256Hex(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

export interface HashCheck {
  recorded: string;
  current: string;
  match: boolean;
}

/**
 * The hash recorded at collection vs the hash of the item now.
 * A mismatch means the item changed after it was collected.
 */
export async function hashCheck(item: Evidence): Promise<HashCheck> {
  const current = await sha256Hex(canonicalJson(item));
  const recorded = item.hashAtCollection ?? current;
  return { recorded, current, match: recorded === current };
}
