/**
 * Training Academy registry. Missions are discovered automatically: any folder in
 * src/missions with a mission.ts is listed. Each mission is lazy-loaded.
 */
import type { Mission, MissionMeta } from '../engine/missionTypes';

const metaModules = import.meta.glob<{ meta: MissionMeta }>('./*/meta.ts', { eager: true });
const missionModules = import.meta.glob<{ default: Mission }>('./*/mission.ts');

export const missionCatalogue: MissionMeta[] = Object.values(metaModules)
  .map((m) => m.meta)
  .sort((a, b) => a.order - b.order);

export function findMissionMeta(id: string): MissionMeta | undefined {
  return missionCatalogue.find((m) => m.id === id);
}

export async function loadMission(id: string): Promise<Mission> {
  const loader = missionModules[`./${id}/mission.ts`];
  if (!loader) throw new Error(`Unknown mission "${id}"`);
  const data = (await loader()).default;
  if (import.meta.env.DEV) {
    const { validateMission } = await import('../engine/validateMission');
    const problems = validateMission(data);
    if (problems.length) console.error(`Mission "${id}" has problems:\n${problems.join('\n')}`);
  }
  return data;
}
