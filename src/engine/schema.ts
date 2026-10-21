/**
 * The case file schema. Every case in src/cases/<id>/case.ts must match this.
 * `npm test` validates every case (structure, cross-references and safety rules).
 * See docs/writing-a-case.md for an author's guide.
 */
import { z } from 'zod';
import { isDocumentationIp, isFictionalMac } from './safety';

// ---------- Primitives ----------

export const idSchema = z
  .string()
  .regex(/^[a-z0-9][a-z0-9-]*$/, 'Use lowercase-kebab-case ids, e.g. "photo-foyer"');

/** ISO 8601 with an explicit offset, e.g. "2026-08-14T19:52:00+09:30". */
const timestamp = z.iso.datetime({ offset: true, local: false });
const date = z.iso.date();
const clockTime = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use 24-hour HH:MM');

const ip = z.string().refine(isDocumentationIp, {
  message: 'IP addresses must come from 192.0.2.0/24, 198.51.100.0/24 or 203.0.113.0/24',
});
const mac = z.string().refine(isFictionalMac, {
  message:
    'MAC addresses must be fictional: 00:00:5E:00:53:xx or locally administered (x2:, x6:, xA:, xE:)',
});
const sha256 = z.string().regex(/^[a-f0-9]{64}$/, 'SHA-256 hashes are 64 lowercase hex characters');

/** A point on the shared city map, in kilometres from the map's top-left corner. */
export const mapPointSchema = z.object({ x: z.number().min(0), y: z.number().min(0) });

const labelValue = z.object({
  label: z.string().min(1),
  value: z.string(),
  /** Optional explanation shown under the value (e.g. why GPS was removed). */
  note: z.string().optional(),
});

// ---------- Shared vocab ----------

export const verdicts = ['strongly-supported', 'possible', 'not-supported', 'cant-tell'] as const;
export const verdictSchema = z.enum(verdicts);
export type Verdict = z.infer<typeof verdictSchema>;

export const relations = ['supports', 'contradicts', 'inconclusive'] as const;
export const relationSchema = z.enum(relations);
export type Relation = z.infer<typeof relationSchema>;

export const appIds = [
  'locker',
  'photos',
  'iplookup',
  'netlog',
  'map',
  'messages',
  'browser',
  'drive',
  'email',
  'wearables',
  'social',
] as const;
export const evidenceAppSchema = z.enum(appIds);
export type EvidenceAppId = z.infer<typeof evidenceAppSchema>;

// ---------- Evidence ----------

const evidenceBase = {
  id: idSchema,
  title: z.string().min(1),
  /** One or two sentences: what this item is. Shown in the locker and on board cards. */
  summary: z.string().min(1),
  /** Where it came from, e.g. "Submitted by a witness". */
  source: z.string().min(1),
  /** Item stays hidden behind a warrant until a matching request is granted. */
  lockedBy: z.literal('warrant').optional(),
  /** Item stays hidden until this drop is released. */
  releasedBy: idSchema.optional(),
  /**
   * Hash recorded when the item was collected. Leave this out and the lab computes it from the
   * content. Set it to a different value to simulate tampering after collection.
   */
  hashAtCollection: sha256.optional(),
  /** Shown only in teacher mode. */
  teacherNote: z.string().optional(),
};

const photoEvidence = z.object({
  ...evidenceBase,
  type: z.literal('photo'),
  app: z.literal('photos'),
  /** Imported asset URL, e.g. `import photoA from './assets/photo-a.svg'`. */
  src: z.string().min(1),
  /** Describes the image for screen readers and as a text alternative. */
  alt: z.string().min(1),
  fileName: z.string().min(1),
  /** "Get Info" rows, shown exactly as written (use EXIF-style formatting). */
  metadata: z.array(labelValue).min(1),
});

const loginRecordEvidence = z.object({
  ...evidenceBase,
  type: z.literal('loginRecord'),
  app: z.literal('locker'),
  service: z.string(),
  account: z.string(),
  events: z
    .array(z.object({ at: timestamp, event: z.string(), ip, detail: z.string().optional() }))
    .min(1),
  note: z.string().optional(),
});

const ipRecordEvidence = z.object({
  ...evidenceBase,
  type: z.literal('ipRecord'),
  app: z.literal('iplookup'),
  ip,
  isp: z.string(),
  network: z.string().optional(),
  locationLabel: z.string(),
  accuracyRadiusKm: z.number().positive(),
  centre: mapPointSchema,
  note: z.string().optional(),
});

const networkLogEvidence = z.object({
  ...evidenceBase,
  type: z.literal('networkLog'),
  app: z.literal('netlog'),
  routerName: z.string(),
  household: z.string(),
  publicIp: ip,
  logDate: date,
  sessions: z
    .array(
      z.object({
        deviceName: z.string(),
        deviceId: idSchema.optional(),
        mac,
        connected: timestamp,
        /** null = still connected when the log was exported. */
        disconnected: timestamp.nullable(),
      }),
    )
    .min(1),
  note: z.string().optional(),
});

const messageEvidence = z.object({
  ...evidenceBase,
  type: z.literal('message'),
  app: z.literal('messages'),
  thread: z.string(),
  from: z.string(),
  to: z.string(),
  sentAt: timestamp,
  body: z.string(),
  readAt: timestamp.nullable().optional(),
  deleted: z.boolean().optional(),
});

const searchEntryEvidence = z.object({
  ...evidenceBase,
  type: z.literal('searchEntry'),
  app: z.literal('browser'),
  kind: z.enum(['search', 'visit', 'cleared']),
  at: timestamp,
  query: z.string().optional(),
  url: z.string().optional(),
  pageTitle: z.string().optional(),
});

const fileEvidence = z.object({
  ...evidenceBase,
  type: z.literal('file'),
  app: z.literal('drive'),
  fileName: z.string(),
  path: z.string(),
  sizeBytes: z.number().int().nonnegative(),
  owner: z.string(),
  createdAt: timestamp,
  modifiedAt: timestamp,
  versions: z.array(z.object({ at: timestamp, by: z.string(), note: z.string() })),
});

const emailEvidence = z.object({
  ...evidenceBase,
  type: z.literal('email'),
  app: z.literal('email'),
  from: z.string(),
  to: z.array(z.string()).min(1),
  subject: z.string(),
  sentAt: timestamp,
  body: z.string(),
  headers: z.array(z.object({ name: z.string(), value: z.string() })),
});

const wearableLogEvidence = z.object({
  ...evidenceBase,
  type: z.literal('wearableLog'),
  app: z.literal('wearables'),
  device: z.string(),
  measure: z.enum(['steps', 'heartRate', 'motion', 'doorbell', 'other']),
  samples: z
    .array(z.object({ at: timestamp, value: z.string(), note: z.string().optional() }))
    .min(1),
});

const socialPostEvidence = z.object({
  ...evidenceBase,
  type: z.literal('socialPost'),
  app: z.literal('social'),
  platform: z.string(),
  author: z.string(),
  handle: z.string(),
  postedAt: timestamp,
  body: z.string(),
  imageEvidenceId: idSchema.optional(),
  checkIn: z.string().optional(),
});

/** Anything else: a report, record or statement shown as labelled fields in the Evidence Locker. */
const documentEvidence = z.object({
  ...evidenceBase,
  type: z.literal('document'),
  app: z.literal('locker'),
  fields: z.array(labelValue).min(1),
  body: z.string().optional(),
});

export const evidenceSchema = z.discriminatedUnion('type', [
  photoEvidence,
  loginRecordEvidence,
  ipRecordEvidence,
  networkLogEvidence,
  messageEvidence,
  searchEntryEvidence,
  fileEvidence,
  emailEvidence,
  wearableLogEvidence,
  socialPostEvidence,
  documentEvidence,
]);
export type Evidence = z.infer<typeof evidenceSchema>;
export type EvidenceOfType<T extends Evidence['type']> = Extract<Evidence, { type: T }>;

// ---------- Questions ----------

const verdictQuestion = z.object({
  id: idSchema,
  kind: z.literal('verdict'),
  /** The question as students see it. */
  prompt: z.string().min(1),
  /** Short claim shown on the evidence board, e.g. "Riley was at the Waterfront at 7:52 pm". */
  claim: z.string().min(1),
  acceptedVerdicts: z.array(verdictSchema).min(1),
  keyEvidenceIds: z.array(idSchema).min(1),
  distractorEvidenceIds: z.array(idSchema),
  hints: z.object({
    /** Shown when the verdict is right and all key evidence is attached. */
    correct: z.string(),
    /** Shown when the verdict is not accepted. A nudge, never the answer. */
    verdict: z.string(),
    /** Optional nudges for specific wrong verdicts (overrides `verdict`). */
    byVerdict: z.partialRecord(verdictSchema, z.string()).optional(),
    /** Per missing key item. Falls back to a generic hint. */
    missingEvidence: z.record(z.string(), z.string()),
    /** Per distractor attached. */
    distractors: z.record(z.string(), z.string()),
  }),
  modelAnswer: z.string(),
  limitationExamples: z.array(z.string()).min(1),
});

const openQuestion = z.object({
  id: idSchema,
  kind: z.literal('open'),
  prompt: z.string().min(1),
  /** Sentence starters or prompts shown to students under the question. */
  guidance: z.array(z.string()),
  modelAnswer: z.string(),
  keyPoints: z.array(z.string()).min(1),
});

export const questionSchema = z.discriminatedUnion('kind', [verdictQuestion, openQuestion]);
export type Question = z.infer<typeof questionSchema>;
export type VerdictQuestion = z.infer<typeof verdictQuestion>;
export type OpenQuestion = z.infer<typeof openQuestion>;

// ---------- Drops and warrants ----------

export const dropTriggerSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('manual') }),
  z.object({ type: z.literal('afterEvidenceViewed'), evidenceId: idSchema }),
  z.object({ type: z.literal('afterQuestionChecked'), questionId: idSchema }),
  z.object({ type: z.literal('afterMinutes'), minutes: z.number().positive() }),
]);
export type DropTrigger = z.infer<typeof dropTriggerSchema>;

const dropSchema = z.object({
  id: idSchema,
  title: z.string(),
  /** Notification text when the drop arrives. */
  notification: z.string(),
  /** Released when ANY trigger fires. A teacher can always release it manually. */
  triggers: z.array(dropTriggerSchema).min(1),
  /** Wait this long after the trigger fires, so it feels like a real delivery. */
  delaySeconds: z.number().nonnegative().optional(),
});
export type Drop = z.infer<typeof dropSchema>;

const warrantRequestSchema = z.object({
  id: idSchema,
  title: z.string(),
  /** Exactly what is being asked for. Students judge whether it is proportionate. */
  scope: z.string(),
  targets: z.array(idSchema).min(1),
  proportionate: z.boolean(),
  /** The magistrate's response once the student applies. */
  outcome: z.string(),
});
export type WarrantRequest = z.infer<typeof warrantRequestSchema>;

// ---------- Case ----------

export const caseSchema = z
  .object({
    meta: z.object({
      id: idSchema,
      title: z.string().min(1),
      tagline: z.string(),
      yearLevel: z.number().int().min(5).max(12),
      estimatedMinutes: z.number().int().positive(),
      difficulty: z.enum(['introductory', 'standard', 'challenging']),
      learningIntentions: z.array(z.string()).min(1),
      successCriteria: z.array(z.string()),
    }),
    /** How times are displayed to students, e.g. ACST (UTC+09:30). */
    timeZone: z.object({
      label: z.string(),
      utcOffset: z.string().regex(/^[+-]\d{2}:\d{2}$/),
    }),
    incident: z.object({
      summary: z.string(),
      location: z.string(),
      date,
      windowStart: clockTime,
      windowEnd: clockTime,
    }),
    briefing: z.object({
      from: z.object({ name: z.string(), role: z.string() }),
      subject: z.string(),
      /** Paragraphs separated by a blank line. */
      message: z.string(),
      questionIds: z.array(idSchema).min(1),
    }),
    people: z.array(
      z.object({
        id: idSchema,
        name: z.string(),
        age: z.number().int().positive().optional(),
        role: z.string(),
        summary: z.string(),
      }),
    ),
    devices: z.array(
      z.object({
        id: idSchema,
        ownerId: idSchema,
        type: z.enum([
          'laptop',
          'desktop',
          'phone',
          'tablet',
          'console',
          'router',
          'camera',
          'wearable',
          'other',
        ]),
        name: z.string(),
        model: z.string().optional(),
        mac: mac.optional(),
      }),
    ),
    /** Case-specific pins on the shared city map. */
    mapMarkers: z.array(
      z.object({
        id: idSchema,
        label: z.string(),
        kind: z.enum(['scene', 'home', 'place']),
        at: mapPointSchema,
      }),
    ),
    evidence: z.array(evidenceSchema).min(1),
    questions: z.array(questionSchema).min(1),
    drops: z.array(dropSchema),
    warrants: z.object({
      available: z.number().int().nonnegative(),
      requests: z.array(warrantRequestSchema),
    }),
  })
  .superRefine((c, ctx) => {
    const issue = (path: (string | number)[], message: string) =>
      ctx.addIssue({ code: 'custom', path, message });

    const evidenceIds = new Set(c.evidence.map((e) => e.id));
    const questionIds = new Set(c.questions.map((q) => q.id));
    const dropIds = new Set(c.drops.map((d) => d.id));
    const peopleIds = new Set(c.people.map((p) => p.id));
    const deviceIds = new Set(c.devices.map((d) => d.id));

    const checkUnique = (ids: string[], path: string) => {
      const seen = new Set<string>();
      ids.forEach((id, i) => {
        if (seen.has(id)) issue([path, i, 'id'], `Duplicate id "${id}"`);
        seen.add(id);
      });
    };
    checkUnique(
      c.evidence.map((e) => e.id),
      'evidence',
    );
    checkUnique(
      c.questions.map((q) => q.id),
      'questions',
    );
    checkUnique(
      c.people.map((p) => p.id),
      'people',
    );
    checkUnique(
      c.devices.map((d) => d.id),
      'devices',
    );
    checkUnique(
      c.drops.map((d) => d.id),
      'drops',
    );
    checkUnique(
      c.warrants.requests.map((r) => r.id),
      'warrants.requests',
    );

    c.devices.forEach((d, i) => {
      if (!peopleIds.has(d.ownerId))
        issue(['devices', i, 'ownerId'], `Unknown person "${d.ownerId}"`);
    });

    c.briefing.questionIds.forEach((id, i) => {
      if (!questionIds.has(id)) issue(['briefing', 'questionIds', i], `Unknown question "${id}"`);
    });

    const warrantTargets = new Set(c.warrants.requests.flatMap((r) => r.targets));
    c.evidence.forEach((e, i) => {
      if (e.releasedBy && !dropIds.has(e.releasedBy))
        issue(['evidence', i, 'releasedBy'], `Unknown drop "${e.releasedBy}"`);
      if (e.lockedBy === 'warrant' && !warrantTargets.has(e.id))
        issue(
          ['evidence', i, 'lockedBy'],
          `Locked item "${e.id}" is not the target of any warrant request`,
        );
      if (e.type === 'networkLog')
        e.sessions.forEach((s, j) => {
          if (s.deviceId && !deviceIds.has(s.deviceId))
            issue(['evidence', i, 'sessions', j, 'deviceId'], `Unknown device "${s.deviceId}"`);
        });
      if (e.type === 'socialPost' && e.imageEvidenceId && !evidenceIds.has(e.imageEvidenceId))
        issue(['evidence', i, 'imageEvidenceId'], `Unknown evidence "${e.imageEvidenceId}"`);
    });

    c.warrants.requests.forEach((r, i) => {
      r.targets.forEach((t, j) => {
        const target = c.evidence.find((e) => e.id === t);
        if (!target) issue(['warrants', 'requests', i, 'targets', j], `Unknown evidence "${t}"`);
        else if (target.lockedBy !== 'warrant')
          issue(['warrants', 'requests', i, 'targets', j], `"${t}" is not locked by a warrant`);
      });
    });
    const grantable = c.warrants.requests.filter((r) => r.proportionate).length;
    if (grantable > c.warrants.available)
      issue(
        ['warrants', 'available'],
        'Fewer warrants than proportionate requests: the case may be impossible',
      );

    c.questions.forEach((q, i) => {
      if (q.kind !== 'verdict') return;
      const refs: [string, string[]][] = [
        ['keyEvidenceIds', q.keyEvidenceIds],
        ['distractorEvidenceIds', q.distractorEvidenceIds],
        ['hints.missingEvidence', Object.keys(q.hints.missingEvidence)],
        ['hints.distractors', Object.keys(q.hints.distractors)],
      ];
      for (const [field, ids] of refs)
        ids.forEach((id) => {
          if (!evidenceIds.has(id)) issue(['questions', i, field], `Unknown evidence "${id}"`);
        });
      q.keyEvidenceIds.forEach((id) => {
        if (q.distractorEvidenceIds.includes(id))
          issue(['questions', i, 'distractorEvidenceIds'], `"${id}" is both key and distractor`);
      });
    });

    c.drops.forEach((d, i) =>
      d.triggers.forEach((t, j) => {
        if (t.type === 'afterEvidenceViewed' && !evidenceIds.has(t.evidenceId))
          issue(['drops', i, 'triggers', j], `Unknown evidence "${t.evidenceId}"`);
        if (t.type === 'afterQuestionChecked' && !questionIds.has(t.questionId))
          issue(['drops', i, 'triggers', j], `Unknown question "${t.questionId}"`);
      }),
    );
  });

export type CaseFile = z.infer<typeof caseSchema>;
export type Person = CaseFile['people'][number];
export type Device = CaseFile['devices'][number];
export type MapMarker = CaseFile['mapMarkers'][number];
