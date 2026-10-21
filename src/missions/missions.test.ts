/** Validates EVERY Training Academy mission and proves every step can be completed. */
import { describe, expect, test } from 'vitest';
import { checkStep, correctAnswer } from '../engine/checkStep';
import type { Mission, MissionMeta } from '../engine/missionTypes';
import { validateMission } from '../engine/validateMission';
import { caseCatalogue } from '../cases';

const missionModules = import.meta.glob<{ default: Mission }>('./*/mission.ts', { eager: true });
const metaModules = import.meta.glob<{ meta: MissionMeta }>('./*/meta.ts', { eager: true });

const missions = Object.entries(missionModules).map(([path, mod]) => ({
  folder: path.split('/')[1]!,
  data: mod.default,
}));

test('the academy has six missions with unique suggested positions', () => {
  expect(missions).toHaveLength(6);
  const orders = missions.map((m) => m.data.meta.order);
  expect(new Set(orders).size).toBe(orders.length);
});

test('cases only recommend missions that exist', () => {
  const ids = new Set(missions.map((m) => m.data.meta.id));
  for (const c of caseCatalogue)
    for (const id of c.recommendedMissions ?? []) expect(ids).toContain(id);
});

describe.each(missions)('mission "$folder"', ({ folder, data }) => {
  test('matches the schema and safety rules', () => {
    expect(validateMission(data)).toEqual([]);
  });

  test('folder name matches meta.id and has a matching meta.ts', () => {
    expect(data.meta.id).toBe(folder);
    expect(metaModules[`./${folder}/meta.ts`]?.meta).toEqual(data.meta);
  });

  test('every step can be answered correctly', () => {
    for (const step of data.steps)
      expect(checkStep(step, correctAnswer(step)).correct, step.id).toBe(true);
  });

  test('every classify step uses each bucket at least once', () => {
    for (const step of data.steps) {
      if (step.type !== 'classify') continue;
      for (const b of step.buckets)
        expect(
          step.items.some((i) => i.bucket === b.id),
          `${step.id}/${b.id}`,
        ).toBe(true);
    }
  });
});
