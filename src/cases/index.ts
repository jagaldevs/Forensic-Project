/**
 * Case registry. Cases are discovered automatically: any folder in src/cases with a meta.ts
 * and a case.ts is listed. The engine never refers to a specific case.
 */
import type { CaseFile } from '../engine/types';

type CaseMeta = CaseFile['meta'];

const metaModules = import.meta.glob<{ meta: CaseMeta }>('./*/meta.ts', { eager: true });
const caseModules = import.meta.glob<{ default: CaseFile }>('./*/case.ts');

export const caseCatalogue: CaseMeta[] = Object.values(metaModules)
  .map((m) => m.meta)
  .sort((a, b) => a.estimatedMinutes - b.estimatedMinutes || a.title.localeCompare(b.title));

export function findCaseMeta(id: string): CaseMeta | undefined {
  return caseCatalogue.find((m) => m.id === id);
}

/** Lazy-loads a full case (its data and image assets). Validated in development. */
export async function loadCase(id: string): Promise<CaseFile> {
  const loader = caseModules[`./${id}/case.ts`];
  if (!loader) throw new Error(`Unknown case "${id}"`);
  const data = (await loader()).default;
  if (import.meta.env.DEV) {
    const { validateCase } = await import('../engine/validateCase');
    const problems = validateCase(data);
    if (problems.length) console.error(`Case "${id}" has problems:\n${problems.join('\n')}`);
  }
  return data;
}
