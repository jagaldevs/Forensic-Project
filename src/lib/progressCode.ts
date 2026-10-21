/**
 * Progress codes: a copy-and-paste backup of everything saved on this device.
 * Useful when storage is blocked, a laptop is swapped, or a browser is cleared.
 * Format: "HRSFL1." + base64url(deflate(JSON)), or "HRSFL1u." + base64url(JSON) if the
 * browser cannot compress. Nothing is sent anywhere.
 */
import type { CaseProgress } from '../engine/progressTypes';

export interface ProgressBackup {
  v: 1;
  agentName: string;
  cases: Record<string, CaseProgress>;
}

const PREFIX = 'HRSFL1.';
const PREFIX_RAW = 'HRSFL1u.';

function toBase64Url(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(text: string): Uint8Array {
  const b64 = text.replace(/-/g, '+').replace(/_/g, '/');
  const bin = atob(b64 + '='.repeat((4 - (b64.length % 4)) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function pipe(bytes: Uint8Array, stream: CompressionStream | DecompressionStream) {
  const out = new Response(bytes as BodyInit).body!.pipeThrough(stream);
  return new Uint8Array(await new Response(out).arrayBuffer());
}

const canCompress = () =>
  typeof CompressionStream !== 'undefined' && typeof DecompressionStream !== 'undefined';

export async function encodeProgress(backup: ProgressBackup): Promise<string> {
  const json = new TextEncoder().encode(JSON.stringify(backup));
  if (canCompress())
    return PREFIX + toBase64Url(await pipe(json, new CompressionStream('deflate-raw')));
  return PREFIX_RAW + toBase64Url(json);
}

/** Throws an Error with a student-friendly message if the code is not valid. */
export async function decodeProgress(code: string): Promise<ProgressBackup> {
  const trimmed = code.replace(/\s+/g, '');
  let json: string;
  try {
    if (trimmed.startsWith(PREFIX)) {
      if (!canCompress()) throw new Error('compression unsupported');
      const bytes = await pipe(
        fromBase64Url(trimmed.slice(PREFIX.length)),
        new DecompressionStream('deflate-raw'),
      );
      json = new TextDecoder().decode(bytes);
    } else if (trimmed.startsWith(PREFIX_RAW)) {
      json = new TextDecoder().decode(fromBase64Url(trimmed.slice(PREFIX_RAW.length)));
    } else {
      throw new Error('prefix');
    }
  } catch {
    throw new Error("That doesn't look like a complete progress code. Check you copied all of it.");
  }
  const { progressBackupSchema } = await import('../engine/progressSchema');
  const parsed = progressBackupSchema.safeParse(JSON.parse(json));
  if (!parsed.success) throw new Error('That progress code is damaged or from a different app.');
  return parsed.data as ProgressBackup;
}
