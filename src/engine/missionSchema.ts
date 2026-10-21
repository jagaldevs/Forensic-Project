/**
 * Training Academy mission schema. Every mission in src/missions/<id>/mission.ts must match it.
 * Like case files, this is validated by `npm test` and in development, and is not bundled at
 * runtime (runtime code imports types from missionTypes.ts).
 * See docs/writing-a-mission.md.
 */
import { z } from 'zod';
import { idSchema, labelValue, mapPointSchema } from './schema';

// ---------- Media shown alongside a step ----------

const photoMedia = z.object({
  kind: z.literal('photo'),
  /** Imported asset URL. */
  src: z.string().min(1),
  alt: z.string().min(1),
  caption: z.string().optional(),
  /** "Get Info" rows, shown exactly as written. */
  metadata: z.array(labelValue).optional(),
});

const mapMedia = z.object({
  kind: z.literal('map'),
  description: z.string().min(1),
  circle: z
    .object({ centre: mapPointSchema, radiusKm: z.number().positive(), label: z.string() })
    .optional(),
  markers: z
    .array(
      z.object({
        id: idSchema,
        label: z.string(),
        kind: z.enum(['scene', 'home', 'place']),
        at: mapPointSchema,
      }),
    )
    .optional(),
});

const tableMedia = z.object({
  kind: z.literal('table'),
  caption: z.string().min(1),
  columns: z.array(z.string()).min(1),
  rows: z.array(z.array(z.string())).min(1),
  /** Render cells in the monospace font (logs, timestamps). */
  mono: z.boolean().optional(),
});

export const mediaSchema = z.discriminatedUnion('kind', [photoMedia, mapMedia, tableMedia]);
export type Media = z.infer<typeof mediaSchema>;

// ---------- Steps ----------

const stepBase = {
  id: idSchema,
  title: z.string().min(1),
  /** Paragraphs separated by a blank line. */
  body: z.string().optional(),
  media: z.array(mediaSchema).optional(),
};

const checked = {
  /** The question or instruction for the activity. */
  question: z.string().min(1),
  /** Shown once the step is done (right, or after a second try). Formative: always explain. */
  explanation: z.string().min(1),
};

const explainStep = z.object({ ...stepBase, type: z.literal('explain') });

const choiceStep = z.object({
  ...stepBase,
  ...checked,
  type: z.literal('choice'),
  options: z
    .array(z.object({ id: idSchema, text: z.string().min(1), feedback: z.string().min(1) }))
    .min(2),
  /** One id = pick one. Several = "choose all that apply". */
  correct: z.array(idSchema).min(1),
});

const classifyStep = z.object({
  ...stepBase,
  ...checked,
  type: z.literal('classify'),
  buckets: z.array(z.object({ id: idSchema, label: z.string().min(1) })).min(2),
  items: z
    .array(
      z.object({
        id: idSchema,
        text: z.string().min(1),
        bucket: idSchema,
        /** Why it belongs in that bucket. Shown if the student places it wrongly. */
        why: z.string().min(1),
      }),
    )
    .min(2),
});

const orderStep = z.object({
  ...stepBase,
  ...checked,
  type: z.literal('order'),
  /** Written in the CORRECT order. Students see them shuffled. */
  items: z.array(z.object({ id: idSchema, text: z.string().min(1) })).min(3),
});

const spotStep = z.object({
  ...stepBase,
  ...checked,
  type: z.literal('spot'),
  rows: z.array(z.object({ id: idSchema, label: z.string(), value: z.string() })).min(2),
  correct: z.array(idSchema).min(1),
  /** Hint if they pick a wrong row. */
  hint: z.string().min(1),
});

const shortAnswerStep = z.object({
  ...stepBase,
  ...checked,
  type: z.literal('shortAnswer'),
  /** Accepted answers. Compared ignoring case, spaces and full stops. */
  accept: z.array(z.string().min(1)).min(1),
  placeholder: z.string().optional(),
  hint: z.string().min(1),
});

const reflectStep = z.object({
  ...stepBase,
  type: z.literal('reflect'),
  question: z.string().min(1),
  /** Minimum characters before it can be saved. */
  minLength: z.number().int().positive(),
});

export const stepSchema = z.discriminatedUnion('type', [
  explainStep,
  choiceStep,
  classifyStep,
  orderStep,
  spotStep,
  shortAnswerStep,
  reflectStep,
]);
export type Step = z.infer<typeof stepSchema>;
export type StepOfType<T extends Step['type']> = Extract<Step, { type: T }>;

// ---------- Mission ----------

export const missionSchema = z
  .object({
    meta: z.object({
      id: idSchema,
      title: z.string().min(1),
      /** The big idea in a few words, e.g. "Metadata". */
      concept: z.string().min(1),
      summary: z.string().min(1),
      estimatedMinutes: z.number().int().positive(),
      /** Suggested position in the academy (1 = first). */
      order: z.number().int().positive(),
      /** One of the app's icon names. */
      icon: z.string().min(1),
      badge: z.object({ name: z.string().min(1), description: z.string().min(1) }),
    }),
    steps: z.array(stepSchema).min(3),
  })
  .superRefine((m, ctx) => {
    const issue = (path: (string | number)[], message: string) =>
      ctx.addIssue({ code: 'custom', path, message });
    const seen = new Set<string>();
    m.steps.forEach((s, i) => {
      if (seen.has(s.id)) issue(['steps', i, 'id'], `Duplicate step id "${s.id}"`);
      seen.add(s.id);
      if (s.type === 'choice') {
        const ids = new Set(s.options.map((o) => o.id));
        s.correct.forEach((c) => {
          if (!ids.has(c)) issue(['steps', i, 'correct'], `Unknown option "${c}"`);
        });
      }
      if (s.type === 'classify') {
        const buckets = new Set(s.buckets.map((b) => b.id));
        s.items.forEach((it, j) => {
          if (!buckets.has(it.bucket))
            issue(['steps', i, 'items', j], `Unknown bucket "${it.bucket}"`);
        });
      }
      if (s.type === 'spot') {
        const rows = new Set(s.rows.map((r) => r.id));
        s.correct.forEach((c) => {
          if (!rows.has(c)) issue(['steps', i, 'correct'], `Unknown row "${c}"`);
        });
      }
    });
  });

export type Mission = z.infer<typeof missionSchema>;
export type MissionMeta = Mission['meta'];
