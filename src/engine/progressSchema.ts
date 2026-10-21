/** Validates imported progress codes (loaded on demand). Mirrors progressTypes.ts. */
import { z } from 'zod';
import { relationSchema, verdictSchema } from './schema';

const checkResult = z.object({
  correct: z.boolean(),
  messages: z.array(z.object({ tone: z.enum(['good', 'hint']), text: z.string() })),
  at: z.number(),
});

const caseProgress = z.object({
  caseId: z.string(),
  startedAt: z.number(),
  briefingRead: z.boolean(),
  viewed: z.record(z.string(), z.number()),
  board: z.record(z.string(), z.object({ x: z.number(), y: z.number() })),
  links: z.array(
    z.object({
      id: z.string(),
      evidenceId: z.string(),
      questionId: z.string(),
      relation: relationSchema,
    }),
  ),
  warrants: z.array(
    z.object({
      requestId: z.string(),
      justification: z.string(),
      granted: z.boolean(),
      at: z.number(),
    }),
  ),
  releasedDrops: z.record(z.string(), z.number()),
  judgements: z.record(
    z.string(),
    z.object({
      verdict: verdictSchema.nullable(),
      explanation: z.string(),
      limitation: z.string(),
      attempts: z.number(),
      lastResult: checkResult.nullable(),
      savedAt: z.number().nullable().optional(),
    }),
  ),
  submittedAt: z.number().nullable(),
  clockCorrections: z.record(z.string(), z.string()).optional(),
  custody: z
    .array(
      z.object({
        at: z.number(),
        evidenceId: z.string(),
        action: z.enum(['viewed', 'verified']),
        ok: z.boolean().optional(),
      }),
    )
    .optional(),
  locked: z.boolean().optional(),
  selfAssessment: z.record(z.string(), z.enum(['yes', 'partly', 'not-yet'])).optional(),
  // Support levels (added after v3; optional, so older codes still import).
  supportLevel: z.enum(['guided', 'standard', 'deep']).optional(),
  supportLevelsUsed: z.partialRecord(z.enum(['guided', 'standard', 'deep']), z.number()).optional(),
  nudgesUsed: z.array(z.string()).optional(),
  extensionAnswers: z.record(z.string(), z.string()).optional(),
});

const stepAnswer = z.discriminatedUnion('type', [
  z.object({ type: z.literal('choice'), selected: z.array(z.string()) }),
  z.object({ type: z.literal('classify'), placements: z.record(z.string(), z.string()) }),
  z.object({ type: z.literal('order'), order: z.array(z.string()) }),
  z.object({ type: z.literal('spot'), selected: z.array(z.string()) }),
  z.object({ type: z.literal('shortAnswer'), text: z.string() }),
  z.object({ type: z.literal('reflect'), text: z.string() }),
]);

const missionProgress = z.object({
  startedAt: z.number(),
  stepIndex: z.number().int().nonnegative(),
  steps: z.record(
    z.string(),
    z.object({
      attempts: z.number(),
      correct: z.boolean(),
      done: z.boolean(),
      hints: z.array(z.string()),
      answer: stepAnswer.optional(),
    }),
  ),
  completedAt: z.number().nullable(),
});

const base = { agentName: z.string().max(64), cases: z.record(z.string(), caseProgress) };

export const progressBackupSchema = z.discriminatedUnion('v', [
  z.object({ v: z.literal(1), ...base }),
  z.object({ v: z.literal(2), ...base, academy: z.record(z.string(), missionProgress) }),
  z.object({
    v: z.literal(3),
    ...base,
    academy: z.record(z.string(), missionProgress),
    teacherModeUsedAt: z.number().nullable(),
  }),
]);
