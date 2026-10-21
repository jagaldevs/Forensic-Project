# Handoff prompt: Phase 5

Paste the text below into a new Claude Code session to continue the build.

```text
Continue building HRS Digital Forensics Lab, picking up at Phase 5 (polish).

Project: C:\Users\jack.galbraith\OneDrive - Haileybury\Desktop\forensic project
GitHub:  https://github.com/jagaldevs/Forensic-Project (branch main; push after each commit)

First, read CLAUDE.md in the repo root. It has the brief, stack, safety rules, design system,
repo layout, dev notes and every decision so far (including the Phase 4 and visual-overhaul
entries at the end of the Decisions log). Then skim docs/writing-a-case.md.

Current state (all committed and pushed, 120 tests passing, build OK):
- Phase 1: engine, desktop and window manager, The Waterfront Alibi case
- Phase 2: Training Academy (6 missions, badges)
- Phase 3: "Where was Jamie?" case plus Messages, Social Feed, CCTV, Map and Timeline apps
- Phase 4: Browser & Search History, Cloud Drive, Email, and Wearables & Smart Home apps;
  Evidence Locker chain of custody with "Verify all hashes" and tamper warnings; teacher mode
  (Teacher Panel, presenter view, drop controls); Teacher Review (paste one student's
  progress code); report export (cover page, timeline, board snapshot, self-assessment,
  custody appendix, .txt download); assessment case "The Science Fair Switch" (access code,
  no hints, single locked submission). Codes are placeholders in src/config/teacher.ts.
- Visual overhaul: light "case file" look (white windows on a pale grey desk, grey tags,
  neutral buttons, magenta only for the one main action, selection, NEW markers, links and
  the board string). All colours are in src/styles/tokens.css.

Phase 5 plan (to agree with me first):
1. Accessibility audit: keyboard-only runs through every app (especially the four new ones,
   the Teacher Panel and the presenter view), screen-reader checks of the charts, the tamper
   warning and dialogs, WCAG AA contrast of the new light palette and chart colours, and
   the text-size toggle on every screen. Fix what fails.
2. Onboarding tutorial: a short, skippable first-run walkthrough of the desktop (open the
   locker, pin a card, link it to a claim, make a judgement), remembered once done.
3. Performance pass: first-load size on slow school Wi-Fi, confirm every app and case still
   lazy-loads, and check the offline cache (about 880 KB).
4. Sound design: refine the synthesised sounds (still muted by default).
5. Small fixes: Timeline hour headings don't show the date when events run past midnight;
   consider a multi-code class summary table in Teacher Review (deferred in Phase 4).
6. Play through at laptop and iPad sizes, check offline with the build preview, update docs
   and CLAUDE.md, push.

Open decisions. Ask me these first, recommending defaults:
1. Onboarding format: an overlay tour on the real desktop (recommended), or a short
   tutorial case.
2. Accessibility scope: automated checks plus a manual keyboard/screen-reader pass
   (recommended), or automated checks only.
3. Class summary table in Teacher Review: now, or leave for later (recommended: later).
4. Sound: which events get sounds, and whether any stay on when unmuted.

Working style: I want an MVP I can review later. Show me a short plan, wait for my OK, then
build in small, well-described commits (end commit messages with the Co-Authored-By line from
your instructions) and push after each. You can use subagents for independent pieces; they
must not run git and should only touch their own folders.

Dev notes (also in CLAUDE.md):
- In a session started in this folder, the browser preview uses this project's own
  .claude/launch.json: "dev" (:5173) and "preview-build" (vite preview of dist, :4173).
- The folder is on OneDrive and Vite sometimes misses a file change; if the page shows stale
  code after a reload, touch the file.
- Fully reload the page after editing a Zustand store. In dev, window.__desktop exposes the
  desktop store.
- Python isn't installed. Don't write files containing backslashes or JSX quotes via shell
  heredocs, sed or node -e string replacements (they get mangled); use the Write/Edit tools.
- Run prettier, eslint, `tsc -b`, `vitest run` and `npm run build` before each commit.
- Safety rules are enforced by tests: fictional names and brands only, IPs from the
  documentation ranges, locally administered MACs, web and email addresses on .example
  domains, benign content.
- Still to do by the teacher: replace the placeholder codes, add the official brand colours
  and logo, and test on a real iPad and Chromebook.
```
