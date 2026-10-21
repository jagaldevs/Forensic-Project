import { caseSchema } from './schema';
import { findSafetyIssues } from './safety';

/** Every problem with a case file (structure, references, safety). Empty means valid. */
export function validateCase(data: unknown): string[] {
  const parsed = caseSchema.safeParse(data);
  const problems = parsed.success
    ? []
    : parsed.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`);
  return [...problems, ...findSafetyIssues(data)];
}
