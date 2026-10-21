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
    }),
  ),
  submittedAt: z.number().nullable(),
});

export const progressBackupSchema = z.object({
  v: z.literal(1),
  agentName: z.string().max(64),
  cases: z.record(z.string(), caseProgress),
});
