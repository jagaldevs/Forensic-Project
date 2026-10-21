import { supportLevels, type SupportLevel } from '../engine/progressTypes';

const aliases: Record<string, SupportLevel> = { 'deep-dive': 'deep', deepdive: 'deep' };

/**
 * The class's suggested support level from the shared link, e.g. ?level=guided. Returns
 * undefined when the link doesn't set one (so a saved choice is kept), or null for ?level=none.
 */
export function levelFromLink(search: string): SupportLevel | null | undefined {
  const raw = new URLSearchParams(search).get('level')?.trim().toLowerCase();
  if (!raw) return undefined;
  if (raw === 'none') return null;
  const level = aliases[raw] ?? raw;
  return (supportLevels as string[]).includes(level) ? (level as SupportLevel) : undefined;
}
