# Handoff prompt: Phase 7

Paste the text below into a new Claude Code session to continue the build.

```text
Continue building HRS Digital Forensics Lab, picking up at Phase 7 (review, polish and a
local Darwin look).

Project: C:\Users\jack.galbraith\OneDrive - Haileybury\Desktop\forensic project
GitHub:  https://github.com/jagaldevs/Forensic-Project (branch main; push after each commit)
Live:    https://forensic-project.netlify.app/ (every push to main redeploys)

First, read CLAUDE.md in the repo root: the brief, stack, safety rules (including the one
exception for the school's name and Mrs Staggs), design system, repo layout, dev notes and every
decision so far (the Phase 6 entry is at the end of the Decisions log). Then read docs/TODO.md
(the running list I review at the end) and skim docs/writing-a-case.md,
docs/lessons/teacher-guide.md and src/engine/geo/cityMap.ts.

Important steer from Phase 6: this is a Year 8 SCIENCE unit, not a computing one. The technical
(cyber) depth is as far as I want it. Prefer relatable evidence and science ideas (observation
vs inference, uncertainty, calibration, sensors and their limits, alternative explanations,
consent and proportionality) over protocol detail.

Current state (all committed and pushed, 274 tests passing, build OK, live on Netlify):
- Phases 1–5: engine, desktop and window manager, 13 evidence apps, Training Academy (6
  missions), teacher mode, Teacher Review, reports, accessibility tests and audit, first-run
  tour, sounds (muted by default), offline PWA.
- Four cases, in lesson order: The Waterfront Alibi (intro), Where was Jamie? (time zones), The
  Midnight Raid (new practice case: a Year 8 camp at Litchfield, a phone's search history on a
  shared family account, a fitness band and a possum), and the assessment The Science Fair
  Switch. Support levels (Guided / Standard / Deep dive) in every case.
- Phase 6: permission requests as an alternative to warrants (warrants.kind: 'permission');
  Whole class tab in Teacher Review (paste many codes, students × questions grid, .csv);
  ?level=guided on the shared link suggests a class support level; app icons from the crest;
  assessment Q2 no longer needs email headers; teacher guide now 7 × 60-minute lessons (Word
  copies in docs/word/, npm run docs:word).
- Images today are simple hand-written SVGs (3–7 KB each) in src/cases/*/assets and
  src/missions/*/assets. The Map and IP Lookup share one simplified, hand-drawn map of a
  "Darwin-inspired region" (src/engine/geo/cityMap.ts, coordinates in km). The Midnight Raid
  has no map (Litchfield is off the city map).

Phase 7 plan (to agree with me first):
1. Review pass: play every case and mission end to end at laptop and iPad sizes and all three
   text sizes, as a student and with teacher mode. Fix bugs, inconsistent wording and anything
   that feels unfinished. Report findings before big changes.
2. Local Darwin look, so it feels like a Darwin item:
   a. A new base map that reads as Darwin: the harbour and peninsula, Cullen Bay, the
      Waterfront, Mindil Beach, Fannie Bay, Parap, Nightcliff, Casuarina, the airport,
      Palmerston and the Stuart Highway, drawn to scale in the existing km coordinates so
      travel times and accuracy radii stay correct. Self-contained SVG; no tiles, APIs or
      runtime requests. Real place names are fine; homes stay fictional and unlabelled.
   b. A Litchfield inset or second map for The Midnight Raid (camp, Wangi Falls, Batchelor).
   c. Richer evidence images in one consistent illustration style with local character
      (dry-season sunset over the harbour, the Waterfront lagoon, Cullen Bay marina, Mindil
      sunset, a camp cabin and trail camera, a school lab), replacing the current simple SVGs.
      Keep every image friendly, free of real people, with accurate alt text, and small
      enough for school Wi-Fi (set a size budget per image and check the precache total).
   d. Small local touches where they help the science: dry season vs build-up weather,
      ACST (UTC+9:30, no daylight saving), local wildlife, fictional local businesses.
3. Polish: anything the review finds, plus print layout of reports with the new images, and
   re-run the accessibility and contrast tests.
4. Optional, only if time and I agree: a short Training Academy mission that warms students
   up on Email and Cloud Drive (plain English, no headers), since the practice case doesn't
   use those apps; brand colours if I supply official values.
5. Update docs (including writing-a-case.md on maps and images), CLAUDE.md and docs/TODO.md,
   rebuild the Word copies, push, and check the live site.

Open decisions. Ask me these first, recommending defaults:
1. Images: drawn as SVG illustrations in the session (consistent, small, no licence issues),
   photos I supply (real public places, no people; I confirm I own them), or generated images
   I supply. Mixed is possible; say what you recommend and why.
2. Map accuracy: a stylised hand-drawn Darwin (recommended: recognisable, no licence issues),
   or traced from open map data (needs attribution, e.g. OpenStreetMap's ODbL).
3. Scope: which cases and missions get new art first (recommended: the shared map and Where
   was Jamie?, which leans on real places, then The Midnight Raid).
4. Whether to do the optional Email and Cloud Drive warm-up mission.

Working style: I want an MVP I can review later. Show me a short plan, wait for my OK, then
build in small, well-described commits (end commit messages with the Co-Authored-By line from
your instructions) and push after each. Keep docs/TODO.md current. You can use subagents for
independent pieces (for example, drawing one case's images); they must not run git and should
only touch their own folders. Review their work before committing.

Dev notes (also in CLAUDE.md):
- In a session started in this folder, the browser preview uses this project's own
  .claude/launch.json: "dev" (:5173) and "preview-build" (vite preview of dist, :4173).
- The folder is on OneDrive and Vite sometimes misses a file change; if the page shows stale
  code after a reload, touch the file. Fully reload after editing a Zustand store.
- In dev, window.__desktop, __progress, __settings and __nav expose the stores (e.g.
  __nav.getState().openCase('midnight-raid', 'briefing')). The boot screen waits for a click
  on "Enter the lab".
- The browser pane's screenshots can crop at large emulated sizes (display scaling); emulate
  800 × 600 or 1000 × 700, or check with get_page_text / javascript instead. The pane has at
  times refused the live Netlify site ("policy check temporarily unavailable"); curl works for
  checking headers and the deployed build.
- Python, pandoc and LibreOffice aren't installed. Word is: render .docx to PDF through Word's
  COM object in PowerShell to check layout (the teacher brief must stay on one A4 page).
- PowerShell script files (.ps1) are blocked by policy on this machine; use Node scripts.
  App icons: npm run icons (scripts/generate-icons.mjs, dev dependency jpeg-js).
- Don't write files containing backslashes or JSX quotes via shell heredocs, sed or node -e
  string replacements (they get mangled, including \uFEFF); use the Write/Edit tools or a
  script file.
- Run prettier, eslint, `tsc -b`, `vitest run` and `npm run build` before each commit.
- Safety rules are enforced by tests: fictional names and brands only (plus src/brand/local.ts),
  IPs from the documentation ranges, locally administered MACs, web and email addresses on
  .example domains, benign content.
```
