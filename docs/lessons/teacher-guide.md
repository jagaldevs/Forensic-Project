# Digital Forensics: teacher guide (6 lessons × 60 minutes)

Year 8 Science · HRS Digital Forensics Lab. Read the one-page [teacher brief](../teacher-brief.md)
first. Student sheets for every lesson are in [student-lessons.md](student-lessons.md).

## The big idea

Digital evidence is **data**, and data has uncertainty, error and limits like any measurement.
Students practise the same reasoning scientists use, asking three questions of every piece of
evidence:

1. What does this evidence show?
2. What does it **not** show?
3. What further evidence would help decide between explanations?

The science links make this more than a computing unit. Make them explicit in every lesson:

| In the lab                                                      | The science idea                                   |
| --------------------------------------------------------------- | -------------------------------------------------- |
| An IP lookup is "accurate to about 25 km"                       | Uncertainty; error bars; precision vs accuracy     |
| A phone set to the wrong time zone; a CCTV clock 2 minutes fast | Systematic error; calibrating instruments          |
| A login from the home router doesn't show who was typing        | Correlation is not causation; a match is not proof |
| Evidence that arrives later overturns a theory                  | New evidence changes scientific knowledge          |
| A hash that no longer matches                                   | Data integrity; reproducibility                    |
| Warrants must be necessary and proportionate                    | Ethics in science; privacy                         |

## Curriculum links (Australian Curriculum v9, Year 8 Science)

| Code     | Content description (abridged)                                                                                                                                | Lessons    |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| AC9S8H01 | Explain how new evidence or different perspectives can lead to changes in scientific knowledge                                                                | 4, 5       |
| AC9S8H03 | Examine how proposed scientific responses to contemporary issues may impact on society and explore ethical, environmental, social and economic considerations | 3          |
| AC9S8I04 | Select and construct appropriate representations, including tables, graphs, models and mathematical relationships, to organise and process data               | 4, 5       |
| AC9S8I05 | Analyse data and information to describe patterns, trends and relationships and identify anomalies                                                            | 2, 4       |
| AC9S8I06 | Analyse methods, conclusions and claims for assumptions, possible sources of error, conflicting evidence and unanswered questions                             | 1–6        |
| AC9S8I07 | Construct evidence-based arguments to support conclusions or evaluate claims, and consider any ethical issues…                                                | 2, 3, 5, 6 |
| AC9S8I08 | Write and create texts to communicate ideas, findings and arguments for specific purposes and audiences…                                                      | 5, 6       |

Wording checked against a reproduction of the ACARA v9 tables; confirm against the
[Australian Curriculum website](https://www.australiancurriculum.edu.au/) before formal planning.

## Unit at a glance

| Lesson | Focus                         | In the lab                                                     | Off the screen                   |
| ------ | ----------------------------- | -------------------------------------------------------------- | -------------------------------- |
| 1      | Observation vs inference      | Desktop tour; Academy: Digital Footprints, Metadata Matters    | "Is this proof?" card sort       |
| 2      | Uncertainty                   | Academy: IP Addresses & Networks; **The Waterfront Alibi**     | Error-bar starter; exit ticket   |
| 3      | Limits, ethics and warrants   | Waterfront debrief (presenter view); Academy: Ethics & Privacy | Warrant debate                   |
| 4      | Systematic error              | Academy: Timestamps & Time Zones; **Where was Jamie?** part 1  | Two-clocks starter               |
| 5      | New evidence changes theories | Where was Jamie? part 2; Jamie debrief                         | Board gallery walk (peer review) |
| 6      | Assessment                    | **The Science Fair Switch** (assessment case)                  | Written reflection               |

Homework (optional, about 6 minutes): Academy: Search History & Cookies before lesson 6. The
assessment uses a browser history, and this mission is the only practice for reading one.

## Before the unit

- [ ] Get the lab link, the **teacher code** and the **assessment access code** from the lab owner.
- [ ] Open the link on a student laptop, a Chromebook and an iPad. Check it loads and the dock fits.
- [ ] Play The Waterfront Alibi yourself with teacher mode on: on the case list, press **Teacher**
      and enter the teacher code. A Teacher icon appears in the dock of every case: the Teacher
      Panel has the answer key, clue notes, drop controls and a presenter view.
- [ ] Decide how students keep their progress. It is saved **in the browser on that device**.
      If devices are shared or wiped, students copy their **progress code** (top bar → Back up
      progress) into their notes at the end of every lesson, and paste it back next time.
- [ ] Print the student sheets (one per lesson) and, for lesson 1, the card sort; for lesson 3,
      the warrant scenarios (both at the end of this guide).
- [ ] Turn teacher mode **off** on any device students will use. It stays on until turned off.

**Support levels.** In every case students choose Guided, Standard or Deep dive (they can switch
at any time). Everyone gets the same questions and answer key. Suggest: "Choose the level that
lets you think hardest about the evidence, not about the computer." Guided suits students who
find technical words a barrier (and many EAL/D students); Deep dive suits students who finish
early. You see which level each student used in their report and in Teacher Review.

---

## Lesson 1: Is this proof? Observation vs inference

**Learning intention:** Understand the difference between what evidence shows (an observation)
and what we conclude from it (an inference).

**Success criteria:** Students can

- sort statements into observations and inferences
- name one thing a photo's metadata shows and one thing it does not show.

**Curriculum:** AC9S8I06.

**You need:** the lab link on the board; card sort sets (one per pair); student sheet 1.

| Time  | What happens                                                                                                                                                                                                                  |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0–10  | **Hook: "Is this proof?"** Pairs sort the cards (appendix A) into _Observation_ and _Inference_. Take two or three contested cards to the class. Draw out: an observation is what a record says; an inference goes beyond it. |
| 10–20 | **Into the lab.** Students open the link, skip the intro, and choose a **codename** (never their real name). Show the dock and the Academy. Explain that progress stays on the device (and the progress code, if you use it). |
| 20–45 | **Training Academy:** _Digital Footprints_ (about 6 min), then _Metadata Matters_ (about 7 min). Fast finishers: _IP Addresses & Networks_. Circulate and ask "what does that row tell you, and what doesn't it?"             |
| 45–55 | **Discuss.** A photo's metadata says it was taken at 8:01 pm on a particular phone. What does that show? What doesn't it show (who took it, whether the clock was right, whether the file was edited)?                        |
| 55–60 | **Exit ticket** (student sheet).                                                                                                                                                                                              |

**Watch for:** "The metadata proves where they were." It shows where the **phone** recorded it
was, if GPS was on and accurate. A shared photo may have had its metadata removed.

**Exit ticket:** One observation and one inference from today's photo mission.

---

## Lesson 2: How sure are we? Uncertainty in The Waterfront Alibi

**Learning intention:** Understand that measurements, including IP locations, have uncertainty,
and that this limits the conclusions we can draw.

**Success criteria:** Students can

- explain what an "accuracy radius" means
- use evidence to judge a claim, and say what the evidence does **not** show.

**Curriculum:** AC9S8I05, AC9S8I06, AC9S8I07.

**You need:** the lab link; student sheet 2. On your own device: teacher mode on, The Waterfront
Alibi open, so you can see the Teacher Panel.

| Time  | What happens                                                                                                                                                                                                                                                                                                                                                                                                               |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0–7   | **Starter: error bars.** "A map app says your friend is within 25 km of the city centre." Which suburbs could they be in? Link to error bars on a graph: a value plus its uncertainty.                                                                                                                                                                                                                                     |
| 7–15  | **Academy:** _IP Addresses & Networks_ (about 7 min).                                                                                                                                                                                                                                                                                                                                                                      |
| 15–50 | **The Waterfront Alibi** (about 25 min plus slack). Students read the briefing, **choose a support level**, and follow the desktop tour if it appears. They run the IP lookup, apply for warrants (two available; one request is deliberately too broad and is refused), pin evidence, link it on the board and check their judgements. A witness photo arrives as an **evidence drop** a few seconds after the IP lookup. |
| 50–55 | **Pause point.** Without giving answers: "Hands up if the IP lookup put Riley at the Waterfront. Now: what does a 25 km circle actually include?"                                                                                                                                                                                                                                                                          |
| 55–60 | **Exit ticket** and save progress (and progress code, if needed).                                                                                                                                                                                                                                                                                                                                                          |

**Teacher mode:** the Teacher Panel → _Evidence drops_ can release the witness photo early for a
student who is stuck. _Case controls_ can give back warrants if a student wastes one.

**Feedback in the app:** Questions 1–3 are checked automatically, with hints, never just
"wrong". Students may need two or three checks. Q4 is open and is saved for you.

**Watch for:**

- "The IP is in Darwin City, so Riley was in the city." The IP lookup is an estimate with a 25 km
  radius that includes Palmerston, and the router log shows the IP is the Okafor home connection.
- "The router log proves Riley was home." It shows Riley's **laptop** was connected. Riley's
  younger brother Sam was home too. A device is not a person (Q2's verdict is _Possible_).
- "Photo B shows Riley." Someone in a dark hoodie, face not visible (Q3: _Can't tell_).

**Exit ticket:** "The IP lookup shows… but it does not show…"

---

## Lesson 3: Limits, ethics and warrants

**Learning intention:** Understand that evidence has limits, and that collecting personal data
needs a necessary and proportionate reason.

**Success criteria:** Students can

- explain why a device is not the same as a person
- decide whether a request for data is proportionate, and justify it.

**Curriculum:** AC9S8H03, AC9S8I07.

**You need:** your device with teacher mode on and The Waterfront Alibi open; the projector;
warrant scenario cards (appendix B); student sheet 3.

| Time  | What happens                                                                                                                                                                                                                                                                                             |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0–20  | **Debrief The Waterfront Alibi.** Teacher Panel → _Answer key_ → **Present full screen** (arrow keys move between questions). For each question, ask students for their verdict first, then reveal the accepted verdict and key evidence. Spend longest on Q2: a device is not a person.                 |
| 20–28 | **Academy:** _Ethics & Privacy_ (about 8 min).                                                                                                                                                                                                                                                           |
| 28–48 | **Warrant debate.** Groups take two scenario cards each. For each: Is it necessary? Is it proportionate? What is the least intrusive way to get the answer? Groups report back; take a class vote on the trickiest one. Link to science ethics: researchers also need approval to collect people's data. |
| 48–55 | **Finish Q4** in the Waterfront case (what further evidence, which would justify a warrant), then open the **Report** (dock). Students can print or save it as a PDF.                                                                                                                                    |
| 55–60 | **Exit ticket.** Save progress.                                                                                                                                                                                                                                                                          |

**Watch for:** "If police want data they should get all of it, just in case." That is the
disproportionate request the case refuses ("all of Riley's phone location history").

**Exit ticket:** One warrant request you would approve and one you would refuse, with a reason.

---

## Lesson 4: When clocks disagree: systematic error in Where was Jamie?

**Learning intention:** Understand that instruments (including device clocks) can have
systematic errors, and that we correct for them before comparing data.

**Success criteria:** Students can

- explain the difference between a systematic error and a random error
- correct a device's clock on a timeline and explain why.

**Curriculum:** AC9S8H01, AC9S8I04, AC9S8I05, AC9S8I06.

**You need:** the lab link; student sheet 4. Teacher mode on your device, with Where was Jamie?
open.

| Time  | What happens                                                                                                                                                                                                                                                                                                                                                                                     |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 0–7   | **Starter: two clocks.** Show two clocks, one 30 minutes ahead, one a few seconds off at random. Which error can you correct, and how? Introduce _systematic error_ and _calibration_.                                                                                                                                                                                                           |
| 7–15  | **Academy:** _Timestamps & Time Zones_ (about 8 min). Darwin is UTC+9:30 all year (no daylight saving); Brisbane is UTC+10.                                                                                                                                                                                                                                                                      |
| 15–55 | **Where was Jamie?** (part 1, about 40 min across two lessons). Jamie is safe; the case asks why the search went to the wrong beach. Students use Messages, Social Feed, CCTV, Map and the **Timeline**. Two evidence drops arrive: a screenshot from Ari (after viewing the lagoon CCTV, or after 12 minutes) and a recovered original photo (after viewing Jamie's post, or after 10 minutes). |
| 55–60 | **Exit ticket.** Save progress.                                                                                                                                                                                                                                                                                                                                                                  |

**The key moment:** Ari's photo seems to show Jamie at the lagoon **after** the CCTV shows Jamie
leaving. Ari's phone is set to Brisbane time (UTC+10), 30 minutes ahead of Darwin. Students who
find Ari's settings screenshot can choose _Set to AEST_ for that device on the Timeline, and the
"impossible" order disappears. The app never corrects clocks by itself.

**Watch for:** "One of them is lying." Before deciding someone is wrong, check every clock.

**Exit ticket:** Which device's clock was wrong, how do you know, and how did you correct it?

---

## Lesson 5: New evidence changes the story

**Learning intention:** Understand how new evidence can change a conclusion, and how peer review
improves reasoning.

**Success criteria:** Students can

- explain how one piece of evidence changed their thinking
- give useful feedback on another investigator's evidence board.

**Curriculum:** AC9S8H01, AC9S8I07, AC9S8I08.

**You need:** sticky notes (two colours); your device with teacher mode on; student sheet 5.

| Time  | What happens                                                                                                                                                                                                                                                                 |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0–25  | **Finish Where was Jamie?** Q3 (could Jamie reach Parap by 8 pm? use the Map's travel calculator) and Q4 (where the search should have started, and what data was needed, fairly obtained). Release any drops a student hasn't triggered (Teacher Panel → _Evidence drops_). |
| 25–40 | **Gallery walk.** Students leave their Evidence Board open and move around. On each board they visit, leave one sticky note: green for a strong link ("this supports the claim because…"), yellow for a question ("what does this _not_ show?").                             |
| 40–55 | **Debrief with the presenter view.** Why did the search start at Mindil Beach? (Jamie's cropped sunset post looked like Mindil; the original photo shows Cullen Bay.) Ask: when has new evidence changed what scientists thought? (e.g. a new fossil, a better instrument).  |
| 55–60 | **Exit ticket.** Remind students about the assessment next lesson, and set the optional Search History mission as homework.                                                                                                                                                  |

**Exit ticket:** Name one piece of evidence that changed your thinking, and how.

---

## Lesson 6: Assessment: The Science Fair Switch

**Learning intention:** Show how you reason about digital evidence on your own.

**Success criteria:** see the rubric below; share it with students before they start.

**Curriculum:** AC9S8I06, AC9S8I07, AC9S8I08, AC9S8H03.

**You need:** the **assessment access code** on the board (or given out on slips); student sheet
6 (the reflection task).

| Time  | What happens                                                                                                                                                                                                                                                                                                                                                                                                       |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 0–5   | Students open the lab and, on the case list, choose _Enter access code_ on The Science Fair Switch, and type the code. Remind them: **no hints** in this case, they choose a support level as usual, and they **submit once** from the report.                                                                                                                                                                     |
| 5–50  | **The Science Fair Switch** (about 45 min). A Year 9 team's results file was changed the night before judging. Evidence includes a cloud drive with version history (times shown in **UTC**), two emails (one spoofed), browser histories, a fitness band, a smart doorbell and lab sensors. Students answer five questions (four verdicts, one open) and press **Save** on each, then **Submit** from the Report. |
| 50–60 | **Reflection** (student sheet 6), handwritten or typed.                                                                                                                                                                                                                                                                                                                                                            |

**After the lesson:** each student copies their **progress code** (top bar → Back up progress)
and submits it (e.g. in a learning platform assignment) along with their report PDF and
reflection. With teacher mode on, press **Teacher Review** on the case list and paste each code to see the
auto-scored verdicts and evidence, their writing, warrant choices, hash checks, clock
corrections, support level and Deep dive answers. Nothing is uploaded anywhere.

**If something goes wrong:** the Teacher Panel → _Case controls_ can **re-open** a submitted
assessment or reset it on that device. The access code is not secure, so treat this as a
classroom task, not an exam.

### Rubric

The app auto-scores the objective parts of each verdict question: the accepted verdict, all key
evidence attached and no distractors. Use the rubric for the written reasoning and the reflection.

| Criterion                                 | Beginning                                        | Developing                                   | Proficient                                                 | Extending                                                                                               |
| ----------------------------------------- | ------------------------------------------------ | -------------------------------------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| **Judgements and evidence** (AC9S8I07)    | Verdicts given with little or unrelated evidence | Some verdicts supported by relevant evidence | Most verdicts accepted, with the key evidence attached     | All verdicts justified with key evidence; distractors recognised and explained                          |
| **Shows and does not show** (AC9S8I06)    | Treats evidence as proof                         | Describes what evidence shows                | Explains what evidence shows **and** what it does not show | Identifies assumptions and sources of error (time zones, shared devices, spoofed headers, edited files) |
| **Limitations and further evidence**      | Limitation missing or vague                      | A general limitation ("it could be wrong")   | A specific limitation for each judgement                   | Proposes specific further evidence that would decide between explanations                               |
| **Ethics and proportionality** (AC9S8H03) | Not considered                                   | Mentions privacy                             | Explains why a request is or isn't proportionate           | Weighs the need for data against people's privacy, suggesting the least intrusive option                |
| **Communication** (AC9S8I08)              | Hard to follow                                   | Mostly clear                                 | Clear and uses correct terms                               | Concise, precise and well organised for its audience                                                    |

### Reflection task (10 minutes, about 150 words)

1. Choose one piece of evidence that looked convincing at first but wasn't. What does it show,
   and what does it not show?
2. How is checking a device's clock like calibrating a scientific instrument?
3. When is it fair for investigators to collect someone's personal data?

---

## Appendix A: "Is this proof?" card sort (lesson 1)

Print, cut out, one set per pair. Sort into **Observation** (what the record says) and
**Inference** (a conclusion drawn from it). Some are worth arguing about.

| #   | Card                                                       |
| --- | ---------------------------------------------------------- |
| 1   | The photo file says it was taken at 8:01 pm.               |
| 2   | Riley was at home at 8:01 pm.                              |
| 3   | The account logged in from the IP address 203.0.113.47.    |
| 4   | Riley logged in to the account.                            |
| 5   | The fitness band recorded no steps between 9 pm and 10 pm. |
| 6   | Morgan was asleep between 9 pm and 10 pm.                  |
| 7   | The CCTV overlay reads 18:05.                              |
| 8   | Jamie left the lagoon at 6:05 pm.                          |
| 9   | The email's From line says it came from the head judge.    |
| 10  | The head judge sent the email.                             |
| 11  | A person in a dark hoodie stood near the display.          |
| 12  | The person in the hoodie took the trophy.                  |

Answers: odd numbers are observations; even numbers are inferences. Cards 7/8 open the idea that
an observation can still be wrong (the camera's clock).

## Appendix B: Warrant scenarios (lesson 3)

All fictional. For each: Is it **necessary**? Is it **proportionate**? What is the **least
intrusive** way to find out?

1. Ask StreamCloud which device logged in to Riley's account at 7:52 pm.
2. Get every message Riley has sent in the past year.
3. Get the convention centre's foyer CCTV for 7:30–8:15 pm on the night.
4. Get the location of every phone near the Waterfront that evening.
5. Ask Sam (Riley's younger brother) what he saw that evening.
6. Get Riley's school email account.

Discussion notes: 1, 3 and 5 are targeted at the question and time; 2, 4 and 6 are far broader
than the question needs (4 affects hundreds of people with no link to the case). Asking someone
(5) needs no warrant but raises its own questions: they may not remember, and they may want to
protect a family member.
