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
- [x] App icons are now made from the crest (`npm run icons`). They come from the 300 px JPEG, so
      the 512 px icons are upscaled: a vector (SVG) or larger logo would make them sharper, and
      would also print more sharply.
- [x] (Owner, 22 Oct 2026) Test on a real iPad (Safari) and a Chromebook: touch dragging of windows and board cards,
      the dock scrolling, installing as an app (check the crest icon), offline after first load.
- [ ] Screen readers: one run through a case with VoiceOver on iPad and ChromeVox on a Chromebook.
- [ ] Listen to the sound effects on classroom speakers (levels were set by reasoning).
- [ ] Read the Guided notes, nudges and Deep dive challenges in all four cases (drafted for
      review; see the support levels entry in CLAUDE.md).
- [ ] Review the teacher guide and student sheets (`docs/lessons/`). Curriculum links use the
      Victorian Curriculum F–10 Version 2.0 (Science Levels 7 and 8), quoted from the VCAA document.
- [x] (Owner, 22 Oct 2026) The lab is live at https://forensic-project.netlify.app/ (every push to `main` redeploys). Open it on a
      laptop, Chromebook and iPad, install it as an app, and check it works offline after first
      load.
- [ ] Check that no fictional student name in the cases matches a real student in the class
      (Morgan Lee, Priya Nair, Tom Baxter, Jamie Ellison, Kit Lam, Elliot Barker, Sasha Morales,
      Riley and Sam Okafor, Kai and Finn Thornton, Ruby Halloran, Leo Marsh, Zara Quinn). The
      school and Mrs Staggs now appear by name (she has agreed).
- [ ] Play The Midnight Raid (new practice case, lesson 6) and read its story, questions and
      model answers (`src/cases/midnight-raid/`).

## Decisions to review

- [x] **Assessment Guided note on the Cloud Drive file**: softened. It still explains created,
      modified, versions and the zone label, but no longer says to check the zone "before
      comparing it with other evidence".
- [x] **Where was Jamie?, Q3:** the 19:34 tower sector now covers Parap and about 4 km of the main
      road back towards the city, and the model answers say Jamie was roughly halfway there.
      Times are unchanged (moving 19:34 would clash with the 19:31 message that was sent but not
      delivered).
- [ ] **Assessment Q2 without headers.** The fake email can now be spotted from what any reader
      sees: Reply to (now shown in the normal Email view) goes to a free QuickPost address, it
      asks Team 4 to reply directly, and it went to Team 4 only, against the fair rules. SPF,
      DKIM and Received lines are mentioned only as Deep dive. Check you're happy with that level.
- [ ] **The Midnight Raid answer key.** Q2 (does the band place Kai at the box?) accepts Not
      supported or Can't tell; Q3 (an animal, not a person?) accepts Strongly supported or
      Possible. One permission request (an hour of the family tablet's history) is granted; a
      year of Kai's searches and messages is refused.
- [ ] **Permission requests instead of warrants** in The Midnight Raid
      (`kind: 'permission'`): students ask Kai's parent rather than a magistrate. Same mechanics.
- [ ] **Seven lessons.** The practice case is a new lesson 6, so the assessment is lesson 7. The
      guide says what to do with only six lessons (homework, or instead of the gallery walk).
- [ ] **The Midnight Raid doesn't practise Email or Cloud Drive.** Students still meet those
      apps first in the assessment, but its email question no longer needs headers, and the
      Drive's zone label works like the clock corrections from Where was Jamie?.

## Deferred features

- [x] Class summary table in Teacher Review (Whole class tab, with a .csv download).
- [ ] Deep dive "raw view first" (e.g. Email opens on the full original, Network Log on raw rows).
- [x] Teacher sets a class default support level through the shared link (`?level=guided`).
- [x] A practice case before the assessment (The Midnight Raid, centred on a phone's search
      history and sensors).
- [x] Teacher guide: lesson sequence, which Academy missions go before which case, discussion
      prompts.
