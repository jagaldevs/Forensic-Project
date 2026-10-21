# HRS Digital Forensics Lab

Interactive web app for the Year 8 Science "Digital Forensics" unit at Haileybury Rendall School (Darwin, NT, Australia). Owner: Head of Digital Innovation / Head of Computer Science (comfortable with code; reviews decisions).

Students "log in" to a fictional forensics lab desktop, open evidence apps, explore realistic but **entirely fictional** digital evidence, pin findings to an evidence board, link evidence to claims, and make judgements with a stated confidence level. It should feel atmospheric and polished — closer to a game than a worksheet.

## Core learning goal

Scientific reasoning about digital evidence. Students repeatedly answer:

1. What does this evidence show?
2. What does it **not** show?
3. What further evidence would help decide between explanations?

Signature idea: an IP that "geolocates near the crime scene" is approximate, a device is not a person, and a match is not proof.

## Hosting and hard constraints

- GitHub + Netlify, shared as a plain link. `netlify.toml`: build `npm run build`, publish `dist`, SPA fallback `/* /index.html 200`.
- **No logins, no backend, no analytics, no data leaves the device.**
- Progress in `localStorage`, **always wrapped in try/catch**; the app must fully work if storage throws. Export/import progress code as a backup.
- Installable PWA, offline after first load (`vite-plugin-pwa`).
- **No runtime external requests**: no map APIs, CDNs, API keys, remote fonts. Self-host fonts. Verify in DevTools that only the app's own files load.
- Devices: laptops first (Chromebook/Windows/Mac; Chrome, Edge), usable on iPad Safari. No hover-only interactions; touch targets ≥ 44px.
- Fast first load on school Wi-Fi: lazy-load cases and heavy apps (route/app-level `React.lazy`, case modules via dynamic `import()`).

## Stack

- React 19 + Vite 8 + TypeScript 6.0 (`strict`, `noUncheckedIndexedAccess`). Use current versions (check `npm view <pkg> version`), not versions from memory. TypeScript is pinned `~6.0` because typescript-eslint does not support TS 7 yet.
- Zustand stores, all persisted through `lib/safeStorage`: `progressStore` (case progress), `desktopStore` (window layout), `settingsStore` (codename, mute, text size), `navStore` (current screen). `toastStore` is not persisted.
- zod schemas for case files; validated in tests and when a case loads in dev. **Never import `engine/schema.ts` from runtime code** (it would bundle zod): runtime code imports types from `engine/types.ts` and `defineCase` from `engine/defineCase.ts`. zod is only bundled in the lazily loaded progress-code validator.
- Vitest for unit tests, especially case validation and answer checking. A test loads **every** case file and validates it.
- Window manager: hand-rolled with Pointer Events (see Decisions).
- Evidence board: custom SVG strings + shared pointer-drag hook (see Decisions).
- CSS Modules + design tokens as CSS custom properties. No UI kit.
- ESLint (flat config) + Prettier.
- **Australian spelling in all UI text** (colour, analyse, organisation, judgement, licence (n.), centre, behaviour).
- Small readable components — science teachers may author cases later.

## Repo layout

```
src/
  app/            App.tsx (boot → codename → cases), CaseShell (loads a case: briefing/desktop/report), CaseContext
  screens/        Boot, Agent (codename), CaseSelect, Briefing, Report, BackupDialog, Loading
  desktop/        DesktopScreen, Window (hand-rolled), Dock, TopBar, Toasts, DropWatcher, appMeta (app ids/titles/sizes)
  apps/           registry.tsx (lazy app components) + one folder per app; shared/ = EvidenceHeader, PinButton,
                  HashLine, LockedNotice, WarrantDialog, hooks (useCaseState, openEvidence); map/CityMap.tsx
  engine/         schema.ts (zod, tests/dev only), types.ts, defineCase.ts, safety.ts, availability.ts,
                  checkJudgement.ts, drops.ts, hash.ts, format.ts, report.ts, progressTypes.ts, geo/cityMap.ts
  stores/         progressStore, desktopStore, settingsStore, navStore, toastStore
  lib/            safeStorage, progressCode, sound (Web Audio, synthesised), usePointerDrag, usePrefersReducedMotion
  ui/             Button, Dialog (focus trap), Icon (inline SVG set), StatusBadge/Badge, labels (verdict/relation wording)
  styles/         tokens.css (ALL colours), global.css, fonts/ (vendored latin woff2 + licences)
  brand/          brand.ts + Logo.tsx (logo slot)
  cases/<id>/     meta.ts (eager, for case list) + case.ts (lazy) + assets/
  missions/<id>/  Training Academy: meta.ts (eager) + mission.ts (lazy) + assets/; index.ts registry
  academy/        AcademyScreen (hub), MissionScreen (step player), StepInputs, MediaView
docs/writing-a-case.md, docs/writing-a-mission.md
scripts/generate-icons.mjs   placeholder PWA icons
```

Tests are co-located (`*.test.ts(x)`). `src/cases/cases.test.ts` validates every case.

## Dev notes

- In Claude Code desktop, the preview tool reads `claudecode/.claude/launch.json` (the session's original folder). It has `forensics-lab` (dev, :5173) and `forensics-lab-build` (preview of `dist`, :4173) entries pointing at this project.
- After editing a Zustand store module, do a full page reload; HMR can keep the old store instance.
- In dev, `window.__desktop` exposes the desktop store for debugging.
- Avoid shell heredocs for files containing backslashes (they get mangled); use the editor/Write tool.

## Design system

- Dark near-black "lab" UI; **magenta** is the signature accent (active elements, highlights, primary buttons, evidence-board string).
- **Every colour lives in `src/styles/tokens.css`**, with brand values clearly marked `/* PLACEHOLDER BRAND */`. Placeholders: magenta `#B5006A`, black `#0B0B0F`. Logo slot in boot screen and top bar shows placeholder text until a logo file is supplied (`src/brand/`).
- Neutral greys for data surfaces.
- Status colours: Supports / Contradicts / Inconclusive / Not yet assessed — **always paired with an icon and a text label, never colour alone**.
- Fonts (self-hosted, vendored latin subsets in `src/styles/fonts`): UI sans (Inter) + monospace (JetBrains Mono) for logs, hashes, IPs, metadata.
- Subtle motion; optional sound effects with global mute (default muted? see Decisions). Respect `prefers-reduced-motion`.
- Accessibility: WCAG AA contrast, visible focus rings, full keyboard operability (windows movable/resizable by keyboard), ARIA on windows (`role="dialog"`, labelled) and dialogs, text-size toggle (scales root font size).

## Experience flow

1. Boot sequence — short "secure terminal" animation, skippable (click/key/tap; instant with reduced motion).
2. Agent ID — display name/codename (stored locally only; never ask for real personal data), then pick a case.
3. Case briefing — message from fictional lead detective with the case question(s).
4. Desktop — dock of evidence apps, draggable windows, notifications on evidence drops.
5. Case report — compiles judgements + linked evidence; print / save as PDF (print stylesheet) / copy as text.

## Evidence apps (full set over time)

Photos (Get Info metadata), IP Lookup (ISP, approx location, accuracy radius on map), Network Log (router logs), Map (illustrated SVG of fictional Darwin-inspired city + travel-time calculator), Messages, Browser & Search History, Cloud Drive (versions, created vs modified), Email ("Show original" headers), Wearables / Smart Home, Social Feed (incl. cropped image with uncropped original elsewhere), Evidence Locker (all collected items + hashes / chain of custody).

## Core mechanics

- **Pin to board** from any app.
- **Evidence board**: corkboard, draggable cards, link cards to claims with labelled magenta string (Supports / Contradicts / Inconclusive). Linking must work without drag (tap card → tap claim → choose label) for touch and keyboard.
- **Judgements** per question: verdict (Strongly supported / Possible / Not supported / Can't tell), attached evidence, short explanation, one limitation.
- **Warrant tokens**: limited per case; one-sentence justification to unlock. Some requests should be declined as disproportionate (teaches proportionality/privacy).
- **Hash check**: every evidence item shows a hash; later cases include a post-collection mismatch.
- **Evidence drops**: released after a trigger or by teacher control; can overturn a theory.
- **Auto-feedback**: objective parts (right evidence attached, right verdict) checked with helpful hints — **never just "wrong"**. Written reasoning is for the teacher.
- **Teacher mode**: code in config; shows answer key + clue explanations, "release evidence drop" control. Explicitly not secure — that's acceptable.

## Safety and ethics rules (non-negotiable)

- All people, accounts, devices, businesses and records are fictional. No real people, platforms or brands (invent e.g. "StreamCloud", "TopNet").
- **IPs only from documentation ranges**: `192.0.2.0/24`, `198.51.100.0/24`, `203.0.113.0/24`. Enforced by the schema.
- MAC addresses clearly fictional (use locally administered prefix, e.g. `02:00:5E:…`, or `00:00:5E:00:53:xx` documentation range). Enforced by the schema.
- Real Darwin place names OK; private addresses fictional.
- No graphic content; age-appropriate incidents (theft, vandalism, missing item, missing person found safe).
- Search histories benign only. Nothing teaches how to commit an offence or evade investigators.
- App never asks for students' own personal data, never accesses device data (camera, location, files), never sends anything anywhere.
- Ethics woven in: privacy, why warrants exist, why a "match" is not proof.

## Case data format

Each case is a self-contained module in `src/cases/<case-id>/` (`case.ts` exporting typed data + `assets/`). The engine knows nothing about specific cases. Schema in `src/engine/schema.ts` (zod). Top-level shape:

- `meta`: id, title, yearLevel, estimatedMinutes, learningIntentions[], difficulty
- `briefing`: from (person id or name/role), message, questionIds[]
- `people[]`: id, name, age?, role, summary
- `devices[]`: id, ownerId, type, name, mac?
- `evidence[]`: discriminated union on `type` — `photo | ipRecord | loginRecord | networkLog | message | searchEntry | file | email | wearableLog | socialPost | generic` — each with `id`, `app`, `title`, `summary`, `hash`, optional `lockedBy: "warrant"`, `releasedBy: "<drop-id>"`, `teacherNote`
- `questions[]`: id, prompt, kind (`verdict` | `open`), acceptedVerdicts[], keyEvidenceIds[], distractorEvidenceIds[], hints[], modelAnswer, limitationExamples[]
- `warrants`: { available, requests[] } — each request: id, targets (evidence ids), label, `proportionate: boolean`, feedback
- `drops[]`: id, title, trigger (`manual` | `afterJudgement:<qid>` | `afterEvidenceViewed:<eid>` ...), notification text

The schema cross-checks references (every evidence/question/device id referenced exists) and safety rules (IP ranges, MAC format). See `docs/writing-a-case.md`.

## Phase plan

1. **Foundations + vertical slice** — infra, design tokens, PWA, schema + validation test; boot → agent → case select → briefing → desktop; Photos, IP Lookup, Network Log (warrant-locked), Evidence Board, Judgements, basic Report; mini case "The Waterfront Alibi" (~25 min). **Done (21 Oct 2026).**
2. **Training Academy** — short interactive modules: metadata, digital footprints, search history & cookies, IP addresses & networks, timestamps & time zones, ethics & privacy. **MVP done (21 Oct 2026)**: six missions, data-driven like cases (`engine/missionSchema.ts`, `engine/checkStep.ts`, `stores/academyStore.ts`).
3. **Flagship case "Where was Jamie?"** — missing-person timeline: Messages, Map, CCTV-style stills, Social Feed. Time-zone trap: phone on AEST (UTC+10) vs Darwin ACST (UTC+9:30, no DST) → mysterious 30-minute discrepancy.
4. **Remaining apps**, final unseen assessment case, polished report export, teacher mode.
5. **Polish** — sound design, onboarding tutorial, accessibility audit, performance pass.

### Phase 1 definition of done

- `npm run build` succeeds, tests pass, case file validates.
- A student can complete "The Waterfront Alibi" end to end on laptop and iPad-sized viewport and get a report.
- Progress survives reload; app still works if `localStorage` throws.
- No runtime network requests beyond the app's own files.
- Colours and logo swappable from one place.

## Phase 1 mini case: "The Waterfront Alibi"

- Incident: Top End Robotics Cup trophy vanished from a display in a Waterfront convention foyer between 7:30 and 8:15 pm on a Friday.
- Person of interest: Riley Okafor, 19, event volunteer who set up the display that afternoon. Alibi: left 5:30 pm, home in Palmerston gaming all evening.
- Starting claim: Riley's StreamCloud account logged in at 19:52 from `203.0.113.47`, which a quick lookup places in "Darwin City".
- Evidence: (1) StreamCloud login 19:52 from `203.0.113.47`; (2) IP Lookup: ISP TopNet, "Darwin (regional hub)", ~25 km radius covering Waterfront and Palmerston; (3) Network Log (warrant): Okafor home router public IP `203.0.113.47`, RILEY-LAPTOP 18:58–23:20, SAM-PHONE (younger brother) all evening; (4) Photo A (Riley → friend): gaming setup, DateTimeOriginal 20:01, phone model, "GPS data removed (shared via messaging app)"; (5) Photo B (foyer witness): dark hoodie near display, 20:06, GPS Waterfront, face not visible; (6) distractor: weather record.
- Warrants: 2. Network Log needs one; second locked item (Riley's full phone location history) should be declined as too broad.
- Q1 IP login places Riley at Waterfront 19:52? → **Not supported** (approximate geolocation; IP matches home router). Key: 1, 2, 3.
- Q2 Evidence proves Riley was home? → **Possible**, not proven (device ≠ person; Sam home; Photo A no GPS). Key: 3, 4. Limitation: no evidence of who used the device.
- Q3 Photo B identifies Riley? → **Can't tell** (someone at Waterfront 20:06; identity not established). Key: 5.
- Q4 (open) What further evidence, and which justifies a warrant? Model: foyer CCTV, StreamCloud session/device details, interview with Sam; "all of Riley's phone data" is disproportionate.

## Working conventions

- Commit in small, well-described steps.
- Keep this file updated as decisions are made (append to Decisions).
- Never add a runtime network dependency. Never add real names/brands/IPs.

## Decisions log

Approved with the Phase 1 plan:

- Hand-rolled window manager with Pointer Events instead of `react-rnd` (no dependency, React 19-safe, mouse/touch/pen, keyboard move/resize). Windows persist, re-fit on resize, and open maximised below 900px.
- Evidence board: custom SVG string + shared `usePointerDrag`; tap-to-link (card → claim → relation) is the primary interaction. No `@dnd-kit`. Relations also differ by line style (solid/dashed/dotted), not just label.
- Cases are TypeScript modules discovered with `import.meta.glob`, lazy-loaded, validated by zod in tests and dev.
- Sound starts muted.
- Fictional MACs: RFC 7042 block `00:00:5E:00:53:xx` or locally administered addresses.

Made during the Phase 1 build (for review):

- **Board links = judgement attachments.** One source of truth: linking a card to a claim attaches it to that question, and attaching in Judgements links it on the board.
- **Auto-check rule:** pass = accepted verdict + all key evidence + no distractors; other evidence is allowed. Relation labels (supports/contradicts) are not marked; the teacher sees them in the report.
- **Hashes are computed, not authored.** SHA-256 of the item's canonical content (minus `src`, `teacherNote`, `hashAtCollection`). Authors set `hashAtCollection` only to simulate tampering.
- **Refused warrants don't use a token**, and a request can only be applied for once.
- **IP lookup results are "discovered":** they appear in the locker/board only after the student runs the lookup.
- **Evidence Locker** shipped in basic form in Phase 1 (needed somewhere to show the login and weather records).
- **Model answers are not shown to students** in Phase 1 (only hints). Open questions are saved, not marked.
- **Map pins are numbered with a legend** so labels never overlap.
- **Drop in the mini case:** Photo B arrives 5 s after the IP lookup, or after 6 minutes, whichever comes first.
- Fonts are vendored latin subsets (Inter, JetBrains Mono) rather than the fontsource packages, to avoid precaching unused subsets.
- Placeholder PWA icons generated by `scripts/generate-icons.mjs`.

Made during the Phase 2 (Training Academy MVP) build:

- Missions are **recommended, never required**: case meta has `recommendedMissions`, shown on the case card.
- **Badge per mission, no scores.** Attempts are recorded per step for teachers (visible in the progress code).
- **Formative feedback:** two tries per step; right or out of tries → explanation shown, can continue. Unlike cases, missions reveal answers.
- **Step types:** explain, choice (single/multi), classify (tap card → tap bucket), order (up/down buttons), spot (pick rows), shortAnswer (normalised compare), reflect (saved, unmarked). Media: photo (+metadata), map, table. No drag-and-drop anywhere.
- Mission evidence is shown via `academy/MediaView`, not by embedding the desktop apps (no refactor of app views was needed for the MVP).
- Progress code is now **v2** (adds `academy`); v1 codes still import.
- Reflection prompts ask about a fictional character, never the student's own life (privacy rule).
- Replaying a completed mission keeps its badge.
