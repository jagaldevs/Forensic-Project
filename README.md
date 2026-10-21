# HRS Digital Forensics Lab

An interactive investigator's workstation for the Year 8 Science **Digital Forensics** unit at
Haileybury Rendall School. Students examine entirely fictional digital evidence, pin it to an
evidence board, link it to claims and make judgements, always asking:

- What does this evidence show?
- What does it **not** show?
- What further evidence would help decide between explanations?

No logins, no backend, no analytics. Everything stays on the student's device. It works
offline once loaded and can be installed as an app.

**Teachers:** start with the one-page [teacher brief](docs/teacher-brief.md).

## Quick start

Requires Node 22 or later.

```bash
npm install
npm run dev        # http://localhost:5173
```

| Command           | What it does                                        |
| ----------------- | --------------------------------------------------- |
| `npm run dev`     | Local development server with hot reload            |
| `npm test`        | Unit tests, including validation of every case file |
| `npm run build`   | Type-check and build to `dist/`                     |
| `npm run preview` | Serve the production build (tests the PWA/offline)  |
| `npm run lint`    | ESLint                                              |
| `npm run format`  | Prettier                                            |

## Deploying to Netlify

1. Push this repo to GitHub.
2. In Netlify, choose **Add new site → Import an existing project → GitHub** and pick the repo.
3. Netlify reads `netlify.toml`: build command `npm run build`, publish directory `dist`,
   Node 22, and an SPA fallback. No settings need changing.
4. Deploy, then share the site URL with students. Every push to `main` redeploys.

`netlify.toml` also sets a strict Content Security Policy (`default-src 'self'`), so the app
cannot load anything from another site.

## Branding

- **Colours:** every colour is in [`src/styles/tokens.css`](src/styles/tokens.css). Brand values
  are marked `PLACEHOLDER BRAND`. Replace them with the official hex codes. `--accent` is a
  lighter tint of the magenta used for text and the board string on dark backgrounds; keep it at
  4.5:1 contrast or better against `--bg-0`.
- **Logo:** put the file in `src/brand/` and set `logoUrl` in
  [`src/brand/brand.ts`](src/brand/brand.ts) (instructions are in the file). It appears on the
  boot screen, top bar, codename screen and report.
- **App icons:** `public/pwa-192.png`, `public/pwa-512.png` and `public/apple-touch-icon.png`
  are generated placeholders (`node scripts/generate-icons.mjs`). Replace them with official
  artwork of the same sizes.

## Project structure

```
src/
  app/        App shell and case loading
  screens/    Boot, codename, case select, briefing, report
  desktop/    Window manager, dock, top bar, notifications
  apps/       Evidence apps (one folder each) and shared evidence components
  engine/     Case schema (zod), answer checking, warrants, drops, hashing, report
  stores/     Zustand stores (settings, navigation, progress, desktop, toasts)
  lib/        Safe storage, progress codes, sound, drag helper
  styles/     Design tokens, global styles, self-hosted fonts
  brand/      Logo slot and school names
  cases/      One folder per case (data + assets)
docs/         Guides, including how to write a case
```

## Writing a case

See [`docs/writing-a-case.md`](docs/writing-a-case.md). Training Academy missions work the
same way: see [`docs/writing-a-mission.md`](docs/writing-a-mission.md). `npm test` checks every case for
structure, broken references, real brand names and non-documentation IP addresses.

## Privacy and safety

- Progress is saved in the browser's `localStorage` only. If storage is blocked, the app keeps
  working for the session, and students can copy a **progress code** (top bar → backup icon) to
  restore later.
- The app never asks for real names, never uses the camera, location or files, and makes no
  network requests to anything except its own files.
- All people, businesses, accounts and records are fictional. IP addresses come only from the
  documentation ranges `192.0.2.0/24`, `198.51.100.0/24` and `203.0.113.0/24`.
