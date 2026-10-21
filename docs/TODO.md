# To do

A running list for the end-of-project review. Newest additions at the bottom of each section.

## For the teacher (can't be done in code)

- [ ] Replace the placeholder teacher code and assessment access code in `src/config/teacher.ts`
      (`CHANGE-ME-TEACHER-2026`, `CHANGE-ME-ASSESS-2026`).
- [x] Logo added (`src/brand/haileybury-logo.jpg`): full logo on the boot screen and report cover,
      crest only in top bars.
- [ ] Add the official brand colours (values marked `PLACEHOLDER BRAND` in `src/styles/tokens.css`;
      `npm test` re-checks contrast). The current magenta is close to the logo's plum but not
      matched to it.
- [ ] App icons (`public/pwa-*.png`, `apple-touch-icon.png`) are still placeholders: make them from
      the crest, ideally from a vector (SVG) version of the logo, which would also print more
      sharply than the 300 px JPEG.
- [ ] Test on a real iPad (Safari) and a Chromebook: touch dragging of windows and board cards,
      the dock scrolling, installing as an app, offline after first load.
- [ ] Screen readers: one run through a case with VoiceOver on iPad and ChromeVox on a Chromebook.
- [ ] Listen to the sound effects on classroom speakers (levels were set by reasoning).
- [ ] Read the Guided notes, nudges and Deep dive challenges in all three cases (drafted for
      review; see the support levels entry in CLAUDE.md).
- [ ] Review the teacher guide and student sheets (`docs/lessons/`), and check the curriculum
      codes against the ACARA website (taken from a reproduction of the v9 tables).
- [ ] Add the lab's Netlify link to the teacher brief once it is final.

## Decisions to review

- [ ] **Assessment Guided note on the Cloud Drive file** says "check the zone label next to each
      time before comparing it with other evidence". It explains how to read the evidence, but it
      points Guided students at Q1's time-zone trap. Keep, soften, or remove for the assessment?
- [ ] **Where was Jamie?, Q3:** the model answer says the 19:34 phone-tower connection near Parap
      "fits", but it is only 10 minutes after the 19:24 bus tap-on. At bus speed that covers about
      3–4 km of the roughly 7 km trip, so it is borderline. Check the times or the wording.

## Deferred features

- [ ] Class summary table in Teacher Review (paste several progress codes, see a students ×
      questions grid).
- [ ] Deep dive "raw view first" (e.g. Email opens on the full original, Network Log on raw rows).
- [ ] Teacher sets a class default support level through the shared link (e.g. `?level=guided`).
- [ ] A practice case that uses Email, Cloud Drive, Wearables and Browser History before the
      assessment (students currently meet these apps first in the assessment).
- [ ] Teacher guide: lesson sequence, which Academy missions go before which case, discussion
      prompts.
