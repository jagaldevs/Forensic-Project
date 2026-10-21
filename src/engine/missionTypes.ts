/** Mission types and the authoring helper, safe to import at runtime (no zod). */
import type { Mission } from './missionSchema';

export type { Media, Mission, MissionMeta, Step, StepOfType } from './missionSchema';

/** Identity helper that gives mission authors type checking and autocomplete. */
export function defineMission(data: Mission): Mission {
  return data;
}
