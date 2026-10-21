# HRS Digital Forensics Lab: brief for science teachers

**What it is.** A web app for the Year 8 Digital Forensics unit. Students sign in to a fictional
forensics lab and investigate realistic but entirely made-up digital evidence: photo metadata, IP
lookups, router logs, messages, CCTV stills, emails, cloud files and smart-device logs. They pin
evidence to a corkboard, link it to claims, and make judgements with reasons. It feels like a
game, but the work is scientific reasoning.

**The science.** Every case asks students the same three questions about each piece of evidence:

1. What does this evidence show?
2. What does it **not** show?
3. What further evidence would help decide between explanations?

The ideas students meet: an IP address that "geolocates near the crime scene" is only an
estimate; a device is not a person; clocks and time zones can mislead; a match is not proof;
data can be changed after collection (hashes); and investigators need a proportionate reason
(a warrant) to see private data. Students choose a verdict (Strongly supported, Possible, Not
supported, Can't tell), attach the evidence, explain their reasoning, and name a limitation.

**What's in it**

| Part                    | Time         | What students do                                                                                                                 |
| ----------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| Training Academy        | 6–8 min each | Six short missions: Metadata, Digital Footprints, Search History, IP Addresses, Time Zones, Ethics & Privacy. Badges, no scores. |
| The Waterfront Alibi    | ~25 min      | Introductory case. A trophy goes missing; does an IP login really put Riley at the scene?                                        |
| Where was Jamie?        | ~40 min      | A missing person found safe. Why did the search go to the wrong beach? A 30-minute time-zone puzzle.                             |
| The Science Fair Switch | ~45 min      | **Assessment case** (needs an access code): no hints, one submission. Spoofed email, edited cloud file, smart-device logs.       |

A first-run tour shows students the desktop. In each case, students choose a **support level**:
**Guided** (plain-English notes on reading each item, plus a nudge), **Standard**, or **Deep dive**
(optional, harder technical challenges). Everyone gets the same questions and answer key.

**Teacher tools**

- **Teacher mode** (teacher code): answer keys, clue explanations, a full-screen presenter view
  for class discussion, and controls to release "evidence drops" early, give back warrants, or
  reset or re-open a case.
- **Reports**: students print or save their case report as a PDF, or copy it as text, with
  verdicts, reasoning, evidence, the board, a timeline and the chain of custody.
- **Teacher Review**: a student copies their **progress code** (top bar, Back up progress) and
  pastes it into Teacher Review. You see auto-scored verdicts and evidence, their writing, warrant
  choices, hash checks, support level and Deep dive answers. Written reasoning is yours to mark.

**Privacy and safety**

- No logins, accounts or analytics; nothing is sent anywhere. Progress stays in the browser on
  that device, and students enter only a made-up codename. Works offline once loaded, on
  laptops, Chromebooks and iPads.
- Everything is fictional except the school's name and Mrs Staggs (with permission), who only
  narrates, never appears in the evidence. Incidents are age-appropriate.
- The teacher and assessment codes are **not secure**: a determined student could find them.
  Treat the assessment as a classroom task, not an exam.

**Before you use it with a class**

- Share the link (Netlify) and check it opens on student devices. Students should use the same
  device each lesson, or save their progress code.
- Ask the lab owner for the teacher code and the assessment code (set in `src/config/teacher.ts`).
- Play The Waterfront Alibi yourself first, with teacher mode on, to see the answer key.
- Lesson plans: the [teacher guide](lessons/teacher-guide.md) (six 60-minute lessons and a rubric)
  and the [student sheets](lessons/student-lessons.md). Word copies are in `docs/word/`.
