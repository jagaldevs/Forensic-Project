# Writing a Training Academy mission

A mission is a short (5–8 minute) interactive lesson. Like a case, it is one folder in
`src/missions/` and the academy finds it automatically. The quickest start is to copy an
existing mission, e.g. `src/missions/ip-networks/`.

```
src/missions/my-mission/
  meta.ts      Title, concept, minutes, suggested order, icon, badge
  mission.ts   The steps
  assets/      Optional images
```

Run `npm test` when you're done. It checks the structure, the safety rules (fictional names,
documentation-range IPs, no real brands) and that **every step can actually be answered
correctly**.

## `meta.ts`

```ts
export const meta: MissionMeta = {
  id: 'my-mission', // must match the folder name
  title: 'My Mission',
  concept: 'Metadata', // a word or two, shown as a tag
  summary: 'One sentence for the academy card.',
  estimatedMinutes: 6,
  order: 7, // position in the suggested path (unique)
  icon: 'photos', // any icon name from src/ui/Icon.tsx
  badge: { name: 'Badge Name', description: 'What earning it means.' },
};
```

## Steps

Every step has an `id`, a `title`, and optionally a `body` (paragraphs separated by a blank
line; `**bold**` works) and `media` (photos, the map, or a table). Checked steps also have a
`question` and an `explanation`.

**Missions are formative.** A student gets two tries. If they're right, or after the second try,
the `explanation` is shown and they move on. So write the explanation to teach the answer, not
just state it.

| `type`        | What the student does                          | Key fields                                                                                       |
| ------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| `explain`     | Reads, then continues                          | `body`, `media`                                                                                  |
| `choice`      | Picks one answer (or several)                  | `options` (`id`, `text`, `feedback`), `correct: [ids]` (more than one = "choose all that apply") |
| `classify`    | Sorts cards into buckets (tap card, tap box)   | `buckets`, `items` (`text`, `bucket`, `why`)                                                     |
| `order`       | Puts items in order with up/down buttons       | `items` **written in the correct order** (shown shuffled)                                        |
| `spot`        | Selects the row(s) of a table that answer it   | `rows` (`label`, `value`), `correct`, `hint`                                                     |
| `shortAnswer` | Types a short answer (e.g. a time)             | `accept` (all acceptable answers), `hint`, `placeholder`                                         |
| `reflect`     | Writes a response for the teacher (not marked) | `question`, `minLength`                                                                          |

`feedback` on a wrong choice, `why` on a classify item and `hint` should nudge, never just say
"wrong". Short answers are compared ignoring case, spaces and full stops, so `7:52 pm`,
`7:52PM` and `7.52pm` all match `7:52pm`; list any other forms in `accept`.

### Media

```ts
{ kind: 'photo', src: importedImage, alt: '…', caption: '…', metadata: [{ label, value, note? }] }
{ kind: 'map', description: '…', circle: { centre: { x, y }, radiusKm, label }, markers: [...] }
{ kind: 'table', caption: '…', columns: ['Time', 'Event'], rows: [['7:52 pm', '…']], mono: true }
```

Map coordinates are kilometres on the shared map (see `src/engine/geo/cityMap.ts`).

## Recommending a mission for a case

In a case's `meta.ts`, add `recommendedMissions: ['my-mission']`. It shows on the case card as
"Recommended training". Cases are never locked.

## Safety

The same rules as cases apply: fictional people, apps and businesses; IPs only from
`192.0.2.x`, `198.51.100.x`, `203.0.113.x`; benign content; and reflection questions must not ask
students for their own personal information (ask about a fictional character instead).
