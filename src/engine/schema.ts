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

export const labelValue = z.object({
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
  'cctv',
] as const;
export const evidenceAppSchema = z.enum(appIds);
export type EvidenceAppId = z.infer<typeof evidenceAppSchema>;

// ---------- Evidence ----------

/** Wall-clock time exactly as a device displayed it, with no offset: "2026-08-22T19:12" or with seconds. */
const recordedTime = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/,
    'Use YYYY-MM-DDTHH:MM (as shown on the device)',
  );

/**
 * A moment this evidence puts on the Timeline. `recorded` is what the device showed. If the
 * device's clock was set to another time zone, students can correct it on the Timeline.
 */
const timelineEntry = z.object({
  recorded: recordedTime,
  /** The device whose clock made this time. Leave out for records already in the case's zone. */
  deviceId: idSchema.optional(),
  label: z.string().min(1),
});

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
  /**
   * Guided level: a plain-English "What this means" note on how to read the item (terms,
   * units, what is approximate). Explains the evidence; never answers a case question.
   */
  guided: z.string().optional(),
  /** Moments this item adds to the Timeline app. */
  timeline: z.array(timelineEntry).optional(),
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

/** A whole conversation, as it appears on one device. Times are as that device displayed them. */
const messageThreadEvidence = z.object({
  ...evidenceBase,
  type: z.literal('messageThread'),
  app: z.literal('messages'),
  service: z.string(),
  /** Whose device this copy of the thread came from. */
  deviceId: idSchema,
  participants: z.array(z.string()).min(2),
  messages: z
    .array(
      z.object({
        from: z.string(),
        at: recordedTime,
        body: z.string(),
        /** Delivery status shown under the sender's own messages. */
        status: z.enum(['sent', 'delivered', 'read']).optional(),
        /** "Read 7:41 pm" receipts, as recorded. */
        readAt: recordedTime.optional(),
        /** Shows a "This message was deleted" placeholder instead of the body. */
        deleted: z.boolean().optional(),
      }),
    )
    .min(1),
});

/** One browser profile's history, exported from one device. Times are as the device showed them. */
const browserHistoryEvidence = z.object({
  ...evidenceBase,
  type: z.literal('browserHistory'),
  app: z.literal('browser'),
  /** The (fictional) browser, e.g. "Lumen Browser". */
  browser: z.string().min(1),
  /** Whose profile this is, e.g. "Morgan (school account)". */
  profile: z.string().min(1),
  deviceId: idSchema,
  /** Oldest first. */
  entries: z
    .array(
      z.object({
        at: recordedTime,
        kind: z.enum(['search', 'visit']),
        /** The search terms, or the page title. */
        title: z.string().min(1),
        /** Fictional addresses only, ending in .example (e.g. https://lumen.example/search). */
        url: z.string().optional(),
      }),
    )
    .min(1),
  /** Periods when the history was cleared. Shown as visible gaps. */
  cleared: z
    .array(z.object({ from: recordedTime, to: recordedTime, note: z.string().optional() }))
    .optional(),
  note: z.string().optional(),
});

const utcOffset = z.string().regex(/^[+-]\d{2}:\d{2}$/, 'Use an offset like +09:30');
const zoneSchema = z.object({ label: z.string().min(1), utcOffset });

/** What a file looked like at one version: a small table or some text. */
const fileContent = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('table'),
    columns: z.array(z.string()).min(1),
    rows: z.array(z.array(z.string())),
  }),
  z.object({ kind: z.literal('text'), text: z.string() }),
]);

/** A file in a cloud drive, with its properties and version history. */
const fileEvidence = z.object({
  ...evidenceBase,
  type: z.literal('file'),
  app: z.literal('drive'),
  /** The (fictional) cloud service, e.g. "StreamCloud Drive". */
  service: z.string().min(1),
  fileName: z.string().min(1),
  /** Folder path shown in Properties, e.g. "Science Fair / Team 4". */
  path: z.string(),
  fileKind: z.enum(['spreadsheet', 'document', 'image', 'other']),
  sizeBytes: z.number().int().nonnegative(),
  owner: z.string(),
  sharedWith: z.array(z.string()).optional(),
  createdAt: timestamp,
  modifiedAt: timestamp,
  lastModifiedBy: z.string(),
  /**
   * The zone this service SHOWS times in (e.g. UTC). Leave out to show case time. Students must
   * notice the label and convert.
   */
  displayZone: zoneSchema.optional(),
  /** Oldest first. The last version must match modifiedAt and lastModifiedBy. */
  versions: z
    .array(
      z.object({
        at: timestamp,
        by: z.string(),
        /** The device or session it was saved from, as the service recorded it. */
        device: z.string().optional(),
        note: z.string().optional(),
        content: fileContent.optional(),
      }),
    )
    .min(1),
});

const mailbox = z.object({ name: z.string(), address: z.string().min(3) });

/** An email, with the headers students see under "Show original". */
const emailEvidence = z.object({
  ...evidenceBase,
  type: z.literal('email'),
  app: z.literal('email'),
  /** Whose inbox it came from, e.g. "Morgan Lee (school email)". */
  inbox: z.string().min(1),
  from: mailbox,
  /** Where replies go. In a spoofed email this is often not the sender. */
  replyTo: mailbox.optional(),
  to: z.array(mailbox).min(1),
  subject: z.string(),
  sentAt: timestamp,
  body: z.string(),
  messageId: z.string().min(1),
  /** Received headers, newest first (the order they appear in a real original). */
  received: z
    .array(z.object({ from: z.string(), fromIp: ip, by: z.string(), at: timestamp }))
    .min(1),
  auth: z.object({
    spf: z.enum(['pass', 'fail', 'softfail', 'none']),
    dkim: z.enum(['pass', 'fail', 'none']),
    /** Plain-English summary, shown under the results. */
    detail: z.string().optional(),
  }),
  /** Any other header lines to show in the original. */
  extraHeaders: z.array(z.object({ name: z.string(), value: z.string() })).optional(),
  attachments: z.array(z.string()).optional(),
});

/** A wearable or smart-home device's log. Times are as the device recorded them. */
const wearableLogEvidence = z.object({
  ...evidenceBase,
  type: z.literal('wearableLog'),
  app: z.literal('wearables'),
  deviceId: idSchema,
  /** The (fictional) companion app, e.g. "PulseBand". */
  service: z.string().min(1),
  /** Regular readings, drawn as charts. */
  series: z
    .array(
      z.object({
        measure: z.enum(['steps', 'heartRate']),
        /** e.g. "steps per 15 min", "bpm". */
        unit: z.string(),
        points: z.array(z.object({ at: recordedTime, value: z.number().nonnegative() })).min(2),
      }),
    )
    .optional(),
  /** Doorbell presses, motion, charging, band taken off… Oldest first. */
  events: z
    .array(
      z.object({
        at: recordedTime,
        kind: z.enum(['doorbell', 'motion', 'door', 'charging', 'worn', 'removed', 'other']),
        event: z.string().min(1),
        detail: z.string().optional(),
      }),
    )
    .optional(),
  note: z.string().optional(),
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
  /** The image as posted (often cropped or filtered). */
  image: z.object({ src: z.string().min(1), alt: z.string().min(1) }).optional(),
  /** A photo item holding the original, uncropped file. Enables a side-by-side compare. */
  originalEvidenceId: idSchema.optional(),
  checkIn: z.string().optional(),
  comments: z.array(z.object({ author: z.string(), at: timestamp, body: z.string() })).optional(),
});

/** A still frame from a fixed security camera. */
const cctvStillEvidence = z.object({
  ...evidenceBase,
  type: z.literal('cctvStill'),
  app: z.literal('cctv'),
  camera: z.string(),
  location: z.string(),
  deviceId: idSchema,
  src: z.string().min(1),
  alt: z.string().min(1),
  /** The timestamp burned into the frame, exactly as the camera showed it. */
  overlay: z.string(),
  /** Operator's notes, e.g. about clock accuracy. */
  note: z.string().optional(),
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
  messageThreadEvidence,
  cctvStillEvidence,
  browserHistoryEvidence,
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
  /** Required, except in assessment cases (which never show hints). */
  /**
   * Guided level: "Need a nudge?" before the first check. What to look at, not the answer.
   * Falls back to hints.verdict.
   */
  nudge: z.string().optional(),
  hints: z
    .object({
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
    })
    .optional(),
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

/**
 * Deep dive level: an optional, more technical task (e.g. convert UTC times yourself). Saved
 * for the teacher, never marked, and never needed to answer the case questions.
 */
export const extensionSchema = z.object({
  id: idSchema,
  title: z.string().min(1),
  prompt: z.string().min(1),
  /** Evidence worth opening for this task. */
  evidenceIds: z.array(idSchema),
  /** Sentence starters or steps shown under the task. */
  guidance: z.array(z.string()).optional(),
  /** For the teacher (teacher mode, Teacher Review). */
  modelAnswer: z.string().min(1),
});
export type Extension = z.infer<typeof extensionSchema>;
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
      /** Training Academy mission ids worth doing first (shown on the case card, never locked). */
      recommendedMissions: z.array(idSchema).optional(),
      /** Position on the case list, lowest first (the order the teacher guide uses them). */
      order: z.number().int().optional(),
      /**
       * An assessment case: hidden behind the assessment access code, no hints, one submission
       * that locks the report, scores visible only in Teacher Review. NOT exam-secure: the case
       * data still ships with the app.
       */
      assessment: z.boolean().optional(),
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
        /** A person in the case. Leave out for e.g. a venue's security camera. */
        ownerId: idSchema.optional(),
        /** Who owns it, when not a person in the case (e.g. "Waterfront venue operator"). */
        ownerLabel: z.string().optional(),
        /**
         * The time zone the device's clock was ACTUALLY set to (teacher knowledge). Students only
         * learn this from evidence, then correct it on the Timeline. Omit if it matches the case.
         */
        clock: zoneSchema.optional(),
        type: z.enum([
          'laptop',
          'desktop',
          'phone',
          'tablet',
          'console',
          'router',
          'camera',
          'wearable',
          'smart-home',
          'server',
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
    /** Deep dive extension tasks (optional). */
    extensions: z.array(extensionSchema).optional(),
    warrants: z.object({
      /**
       * How locked data is unlocked: a warrant from a magistrate (default), or a permission
       * request to the people responsible for the data (for school-scale stories). Same
       * mechanics; only the wording changes.
       */
      kind: z.enum(['warrant', 'permission']).optional(),
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
      if (d.ownerId && !peopleIds.has(d.ownerId))
        issue(['devices', i, 'ownerId'], `Unknown person "${d.ownerId}"`);
      if (!d.ownerId && !d.ownerLabel)
        issue(['devices', i], 'A device needs an ownerId (a person) or an ownerLabel');
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
      if (e.type === 'socialPost' && e.originalEvidenceId) {
        const original = c.evidence.find((o) => o.id === e.originalEvidenceId);
        if (original?.type !== 'photo')
          issue(
            ['evidence', i, 'originalEvidenceId'],
            `"${e.originalEvidenceId}" must be a photo item`,
          );
      }
      if (
        (e.type === 'messageThread' ||
          e.type === 'cctvStill' ||
          e.type === 'browserHistory' ||
          e.type === 'wearableLog') &&
        !deviceIds.has(e.deviceId)
      )
        issue(['evidence', i, 'deviceId'], `Unknown device "${e.deviceId}"`);
      if (e.type === 'file') {
        const last = e.versions.at(-1)!;
        if (Date.parse(last.at) !== Date.parse(e.modifiedAt))
          issue(['evidence', i, 'modifiedAt'], 'modifiedAt must match the latest version');
        if (last.by !== e.lastModifiedBy)
          issue(['evidence', i, 'lastModifiedBy'], 'lastModifiedBy must match the latest version');
        if (Date.parse(e.versions[0]!.at) < Date.parse(e.createdAt))
          issue(['evidence', i, 'versions'], 'A version is older than the file itself');
        e.versions.forEach((v, j) => {
          const prev = e.versions[j - 1];
          if (prev && Date.parse(prev.at) > Date.parse(v.at))
            issue(['evidence', i, 'versions', j], 'Versions must be oldest first');
        });
      }
      if (e.type === 'wearableLog' && !e.series?.length && !e.events?.length)
        issue(['evidence', i], 'A wearable log needs some series or events');
      if (e.type === 'browserHistory')
        e.cleared?.forEach((g, j) => {
          if (g.from > g.to)
            issue(['evidence', i, 'cleared', j], 'A cleared period must end after it starts');
        });
      e.timeline?.forEach((t, j) => {
        if (t.deviceId && !deviceIds.has(t.deviceId))
          issue(['evidence', i, 'timeline', j, 'deviceId'], `Unknown device "${t.deviceId}"`);
      });
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

    checkUnique(
      (c.extensions ?? []).map((x) => x.id),
      'extensions',
    );
    c.extensions?.forEach((x, i) =>
      x.evidenceIds.forEach((id, j) => {
        if (!evidenceIds.has(id))
          issue(['extensions', i, 'evidenceIds', j], `Unknown evidence "${id}"`);
      }),
    );

    c.questions.forEach((q, i) => {
      if (q.kind !== 'verdict') return;
      if (!q.hints && !c.meta.assessment)
        issue(['questions', i, 'hints'], 'Practice cases need hints (only assessments skip them)');
      const refs: [string, string[]][] = [
        ['keyEvidenceIds', q.keyEvidenceIds],
        ['distractorEvidenceIds', q.distractorEvidenceIds],
        ['hints.missingEvidence', Object.keys(q.hints?.missingEvidence ?? {})],
        ['hints.distractors', Object.keys(q.hints?.distractors ?? {})],
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
