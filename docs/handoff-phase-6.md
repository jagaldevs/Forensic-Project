# Handoff prompt: Phase 6

Paste the text below into a new Claude Code session to continue the build.

```text
Continue building HRS Digital Forensics Lab, picking up at Phase 6 (classroom readiness).

Project: C:\Users\jack.galbraith\OneDrive - Haileybury\Desktop\forensic project
GitHub:  https://github.com/jagaldevs/Forensic-Project (branch main; push after each commit)

First, read CLAUDE.md in the repo root: the brief, stack, safety rules (including the one
exception for the school's name and Mrs Staggs), design system, repo layout, dev notes and every
decision so far (the Phase 5, support levels, teacher documents and familiar names entries are
at the end of the Decisions log). Then read docs/TODO.md (the running list I review at the end)
and skim docs/writing-a-case.md and docs/lessons/teacher-guide.md.

Current state (all committed and pushed, 254 tests passing, build OK):
- Phases 1–4: engine, desktop and window manager, 13 evidence apps, Training Academy (6
  missions), three cases (The Waterfront Alibi, Where was Jamie?, and the assessment case The
  Science Fair Switch), teacher mode, Teacher Review (one progress code at a time), reports.
- Phase 5 (polish): axe-core and colour-contrast tests over every app and screen plus a manual
  keyboard pass (docs/accessibility.md); first-run desktop tour (replay with the ? button);
  synthesised sounds at key moments only (muted by default); performance and offline checked;
  Timeline date headings past midnight.
- Support levels: students choose Guided (plain-English "What this means" notes and a nudge),
  Standard or Deep dive (optional extension challenges) per case; same questions and answer key;
  levels used, nudges and Deep dive answers appear in the report and Teacher Review.
- Familiar names: the school (Haileybury Rendall School, Darwin) and the science teacher, Mrs
  Staggs (she has agreed), appear by name from src/brand/local.ts. Staff only narrate, never in
  the evidence or as suspects; students in the stories stay fictional. The Science Fair Switch
  now happens at HRS. The Haileybury logo is in src/brand/.
- Boot screen waits for students to press "Enter the lab".
- Teacher documents: one-page brief (docs/teacher-brief.md), a 6 × 60-minute teacher guide with
  rubric and printables, and student sheets (docs/lessons/), with Word copies in docs/word/
  (npm run docs:word). Curriculum: Victorian Curriculum F–10 Version 2.0, Science Levels 7–8
  (HRS follows the Victorian Curriculum as a Darwin campus of the Haileybury network).

Phase 6 plan (to agree with me first):
1. Practice case for the newer apps: a standard-difficulty case (about 35 minutes) that uses
   Email (incl. "Show original" headers), Cloud Drive (versions, created vs modified, a zone
   label), Wearables & Smart Home and Browser History, so students practise them before the
   assessment. Guided notes, nudges and Deep dive challenges from the start. Slot it into the
   teacher guide and student sheets (and rebuild the Word copies).
2. Class summary table in Teacher Review: paste several progress codes and see a students ×
   questions grid (auto-scored result, support level, nudges, hash checks, disproportionate
   warrant requests), with a .csv download for the markbook. Still nothing uploaded.
3. Class default support level from the shared link (e.g. ?level=guided preselects the level on
   the briefing; students can still change it).
4. Brand finish: app icons (PWA and apple-touch) made from the crest, and brand colours matched
   to the logo's plum, if I supply official values (npm test re-checks contrast).
5. Deploy check: build on Netlify, open the live link on a laptop, Chromebook and iPad, confirm
   offline after first load, and add the link to the teacher brief.
6. Update docs, CLAUDE.md and docs/TODO.md, push.

Open decisions. Ask me these first, recommending defaults:
1. Practice case: setting and story (e.g. at HRS: a school camp photo competition, or a
   missing robotics part), and whether it goes in the lesson sequence as a new lesson or
   replaces part of lesson 5.
2. Class summary table: which columns, and whether to include the .csv download.
3. The two decisions waiting in docs/TODO.md: the assessment's Cloud Drive Guided note (keep,
   soften or remove) and the borderline 19:34 tower time in Where was Jamie? Q3.
4. Deep dive "raw view first" (Email opens on the original, Network Log on raw rows): now or
   later (recommended: later).

Working style: I want an MVP I can review later. Show me a short plan, wait for my OK, then
build in small, well-described commits (end commit messages with the Co-Authored-By line from
your instructions) and push after each. Keep docs/TODO.md current. You can use subagents for
independent pieces (for example, drafting case content); they must not run git and should only
touch their own folders. Review their work before committing.

Dev notes (also in CLAUDE.md):
- In a session started in this folder, the browser preview uses this project's own
  .claude/launch.json: "dev" (:5173) and "preview-build" (vite preview of dist, :4173).
- The folder is on OneDrive and Vite sometimes misses a file change; if the page shows stale
  code after a reload, touch the file. Fully reload after editing a Zustand store.
- In dev, window.__desktop, __progress, __settings and __nav expose the stores.
- The browser pane's screenshots can crop at large emulated sizes (display scaling); emulate
  800 × 600 or check with get_page_text / javascript instead.
- Python, pandoc and LibreOffice aren't installed. Word is: render .docx to PDF through Word's
  COM object in PowerShell to check layout (see how docs/word was checked).
- Don't write files containing backslashes or JSX quotes via shell heredocs, sed or node -e
  string replacements (they get mangled); use the Write/Edit tools or a script file.
- Run prettier, eslint, `tsc -b`, `vitest run` and `npm run build` before each commit.
- Safety rules are enforced by tests: fictional names and brands only (plus src/brand/local.ts),
  IPs from the documentation ranges, locally administered MACs, web and email addresses on
  .example domains, benign content.
```
