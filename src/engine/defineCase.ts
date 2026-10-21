import type { CaseFile } from './schema';

/**
 * Identity helper that gives case authors type checking and autocomplete.
 * Kept separate from schema.ts so the zod schema is not bundled into the app at runtime;
 * cases are validated by `npm test` and when loaded in development.
 */
export function defineCase(data: CaseFile): CaseFile {
  return data;
}
