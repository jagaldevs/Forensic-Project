import { missionSchema } from './missionSchema';
import { findSafetyIssues } from './safety';

/** Every problem with a mission file (structure, references, safety). Empty means valid. */
export function validateMission(data: unknown): string[] {
  const parsed = missionSchema.safeParse(data);
  const problems = parsed.success
    ? []
    : parsed.error.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`);
  return [...problems, ...findSafetyIssues(data, 'mission')];
}
