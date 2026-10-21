# Writing a case

A case is one folder in `src/cases/`. The lab finds it automatically, so you never need to
change the app's code. The quickest start is to copy `src/cases/waterfront-alibi/` and edit it.

```
src/cases/my-new-case/
  meta.ts      Title, year level, timing, learning intentions (shown on the case list)
  case.ts      Everything else: briefing, people, evidence, questions, warrants, drops
  assets/      Images for photo evidence (SVG, PNG, JPG or WebP)
```

The folder name must match `meta.id` (lowercase words joined by hyphens, e.g. `missing-bike`).

When you have finished, run:

```bash
npm test
```

The tests tell you exactly what is wrong and where: a missing field, an evidence id that doesn't
exist, a real brand name, an IP address outside the documentation ranges, or an answer key that
students could never reach.

## 1. `meta.ts`

```ts
export const meta: CaseFile['meta'] = {
  id: 'missing-bike',
  title: 'The Missing Bike',
  tagline: 'One sentence that hooks students in.',
  yearLevel: 8,
  estimatedMinutes: 25,
  difficulty: 'introductory', // or 'standard' | 'challenging'
  learningIntentions: ['Explain why…'],
  successCriteria: ['I can…'],
};
```

## 2. `case.ts`: the big picture

```ts
export default defineCase({
  meta,
  timeZone: { label: 'ACST', utcOffset: '+09:30' },  // how times are shown to students
  incident: { summary, location, date: '2026-08-14', windowStart: '19:30', windowEnd: '20:15' },
  briefing: { from: { name, role }, subject, message, questionIds: [...] },
  people: [...],
  devices: [...],
  mapMarkers: [...],
  evidence: [...],
  questions: [...],
  drops: [...],
  warrants: { available: 2, requests: [...] },
});
```

Your editor will autocomplete every field and underline mistakes in red.

### Times

Record-keeping systems (login records, posts, router logs) use ISO timestamps **with an
offset**, e.g. `2026-08-14T19:52:07+09:30`, and the lab shows them in the case's `timeZone`.

Anything a **device** displayed (message times, CCTV overlays, photo metadata) is written
exactly as the device showed it. Photo metadata is EXIF style (`2026:08:14 20:01:37`); message
and timeline times are `2026-08-22T19:12` with no offset.

### The Timeline and time-zone puzzles

Any evidence item can add moments to the **Timeline** app with an optional `timeline` list:

```ts
timeline: [{ recorded: '2026-08-22T18:30:12', deviceId: 'ari-phone', label: 'Ari photographs Jamie' }],
```

The Timeline plots `recorded` **as the device showed it**. To build a time-zone puzzle, give the
device a `clock` that differs from the case (teacher knowledge only):

```ts
{ id: 'ari-phone', ownerId: 'ari-ellison', type: 'phone', name: "Ari's phone",
  clock: { label: 'AEST (Brisbane)', utcOffset: '+10:00' } }
```

…and write its times in that zone. Students see an impossible-looking order until they find
evidence of the setting (e.g. a settings screenshot) and choose "Set to AEST" for that device on
the Timeline, which moves its events into place. The lab never corrects anything on its own.
Leave out `deviceId` for records already in the case's zone (bus logs, posts).

The Timeline and Map appear in the dock automatically: the Timeline if any evidence has a
`timeline`, the Map if the case has `mapMarkers`. Other apps appear only if the case has
evidence for them.

### Briefing message

Separate paragraphs with a blank line. Address the student as "Agent".

## 3. Evidence

Every item has these fields:

| Field              | Meaning                                                                                                                     |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| `id`               | Unique, lowercase-with-hyphens (e.g. `photo-foyer-witness`)                                                                 |
| `type` / `app`     | What kind of evidence it is and which app shows it (see below)                                                              |
| `title`            | Short name shown in lists and on board cards                                                                                |
| `summary`          | One or two sentences: what it is. Shown in the locker and on the board                                                      |
| `source`           | Where it came from ("Supplied by StreamCloud to investigators")                                                             |
| `lockedBy`         | Optional. `'warrant'` hides it until a warrant request that targets it is granted                                           |
| `releasedBy`       | Optional. A drop id: the item appears only when that drop is released                                                       |
| `hashAtCollection` | Optional. Leave it out (the lab computes it). Set a different 64-character hex value to simulate tampering after collection |
| `teacherNote`      | Optional. For teacher mode: what this clue is for                                                                           |

Every item can also have a `timeline` (see above).

Types available now (✓ = has its own app; others show in the Evidence Locker):

| `type`            | `app`       | Extra fields                                                                                                                                                     |
| ----------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `photo` ✓         | `photos`    | `src` (imported image), `alt`, `fileName`, `metadata` rows                                                                                                       |
| `ipRecord` ✓      | `iplookup`  | `ip`, `isp`, `network?`, `locationLabel`, `accuracyRadiusKm`, `centre`                                                                                           |
| `networkLog` ✓    | `netlog`    | `routerName`, `household`, `publicIp`, `logDate`, `sessions`                                                                                                     |
| `loginRecord` ✓   | `locker`    | `service`, `account`, `events` (time, event, IP), `note?`                                                                                                        |
| `document` ✓      | `locker`    | `fields` (label/value rows), `body?`                                                                                                                             |
| `messageThread` ✓ | `messages`  | `service`, `deviceId` (whose copy), `participants`, `messages` (`from`, `at`, `body`, `status?`, `readAt?`, `deleted?`)                                          |
| `socialPost` ✓    | `social`    | `platform`, `author`, `handle`, `postedAt`, `body`, `image?`, `originalEvidenceId?` (a photo item: enables "compare with the original"), `checkIn?`, `comments?` |
| `cctvStill` ✓     | `cctv`      | `camera`, `location`, `deviceId`, `src`, `alt`, `overlay` (the burned-in timestamp), `note?`                                                                     |
| `searchEntry`     | `browser`   | `kind` (search/visit/cleared), `at`, `query?`, `url?`, `pageTitle?`                                                                                              |
| `file`            | `drive`     | `fileName`, `path`, `sizeBytes`, `owner`, `createdAt`, `modifiedAt`, `versions`                                                                                  |
| `email`           | `email`     | `from`, `to`, `subject`, `sentAt`, `body`, `headers`                                                                                                             |
| `wearableLog`     | `wearables` | `device`, `measure`, `samples`                                                                                                                                   |

Devices need an `ownerId` (a person) or an `ownerLabel` (e.g. "Waterfront venue operator" for
a security camera).

**Cropped images:** to make a cropped post, copy the SVG and change its `viewBox` to the part you
want to show (see `src/cases/where-was-jamie/assets/`).

**IP lookups** only appear in the locker once a student looks the address up, which rewards
using the tool. `centre` is a point on the shared map in kilometres (Darwin City is about
`{ x: 18.6, y: 27.4 }`, Palmerston `{ x: 35.2, y: 34.4 }`; see
`src/engine/geo/cityMap.ts` for every place).

**Photos:** import the image at the top of `case.ts` (`import photoA from './assets/photo-a.svg'`)
and use it as `src`. Always write a good `alt` description.

## 4. Questions

Two kinds:

**Verdict questions** are auto-checked. Students choose Strongly supported / Possible / Not
supported / Can't tell, attach evidence, explain, and name a limitation.

```ts
{
  id: 'q1-ip-location',
  kind: 'verdict',
  prompt: 'Does the IP login place Riley at the Waterfront at 7:52 pm?',
  claim: 'The IP login places Riley at the Waterfront at 7:52 pm',  // shown on the board
  acceptedVerdicts: ['not-supported'],
  keyEvidenceIds: ['login-streamcloud', 'ip-203-0-113-47', 'router-log-okafor'],
  distractorEvidenceIds: ['weather-record'],
  hints: {
    correct: 'Shown when they get it right. Reinforce the reasoning.',
    verdict: 'A nudge when the verdict is wrong. Never give the answer.',
    byVerdict: { 'cant-tell': 'Optional nudge for one specific wrong verdict.' },
    missingEvidence: { 'router-log-okafor': 'Hint when this key item is not attached.' },
    distractors: { 'weather-record': 'Hint when this distractor is attached.' },
  },
  modelAnswer: 'For the teacher.',
  limitationExamples: ['Examples of good limitations, for the teacher.'],
}
```

A judgement passes when the verdict is accepted, **every** key item is attached, and **no**
distractor is attached. Other evidence can be attached freely. Write hints as questions that make
students look again, never "wrong".

**Open questions** are saved for the teacher, not marked:

```ts
{ id: 'q4-next-steps', kind: 'open', prompt, guidance: ['Sentence starters…'], modelAnswer, keyPoints: [...] }
```

## 5. Warrants

```ts
warrants: {
  available: 2,
  requests: [
    {
      id: 'warrant-router',
      title: 'Okafor home router logs',
      scope: 'Exactly what is being asked for, including the time window.',
      targets: ['router-log-okafor'],   // evidence with lockedBy: 'warrant'
      proportionate: true,              // granted, uses one warrant
      outcome: "The magistrate's response.",
    },
  ],
}
```

A request with `proportionate: false` is always refused, does not use a warrant, and shows the
`outcome` text explaining why. Use it to teach that broad, intrusive requests are refused.

## 6. Evidence drops

```ts
drops: [
  {
    id: 'drop-witness-photo',
    title: 'Witness photo received',
    notification: 'New evidence: …',
    triggers: [
      { type: 'afterEvidenceViewed', evidenceId: 'ip-203-0-113-47' },
      { type: 'afterMinutes', minutes: 6 },
    ],
    delaySeconds: 5,
  },
],
```

The drop is released when **any** trigger fires. Other triggers: `{ type: 'afterQuestionChecked',
questionId }` and `{ type: 'manual' }` (teacher releases it; teacher mode arrives in Phase 4).
If key evidence is in a drop, include at least one automatic trigger (the tests check this).

## 7. Safety checklist (enforced by `npm test` where possible)

- Everyone and everything is fictional: people, accounts, businesses, devices, platforms.
  Invent names (StreamCloud, TopNet, ChatterBox, Nimbus). Real platforms and brands are rejected.
- IPs only from `192.0.2.x`, `198.51.100.x`, `203.0.113.x`.
- MAC addresses: `00:00:5E:00:53:xx`, or locally administered (second character 2, 6, A or E,
  e.g. `02:5A:31:7C:11:04`).
- Real Darwin places are fine; private addresses must be fictional.
- Age-appropriate incidents only. No graphic content.
- Search histories contain only benign searches. Nothing explains how to commit an offence or
  avoid investigators.
