# Digital Forensics: teacher guide (7 lessons × 60 minutes)

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

## Curriculum links (Victorian Curriculum F–10 Version 2.0, Science Levels 7 and 8)

| Code     | Content description                                                                                                                                                                                                                                   | Lessons       |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| VC2S8H01 | Scientific knowledge, including models and theories, can change because of new evidence                                                                                                                                                               | 4, 5, 6       |
| VC2S8H03 | Proposed scientific responses to socio-scientific issues impact on society and may involve ethical, environmental, social and economic considerations                                                                                                 | 3, 6, 7       |
| VC2S8I04 | Data and information can be organised and processed by selecting and constructing representations including tables, graphs, keys, models and mathematical relationships                                                                               | 4, 5          |
| VC2S8I05 | Information and processed data can be analysed to show patterns, trends and relationships, and to identify anomalies                                                                                                                                  | 2, 4          |
| VC2S8I06 | Scientific methods, conclusions and claims can be analysed to identify assumptions, possible sources of error, conflicting evidence and unanswered questions                                                                                          | 1–7           |
| VC2S8I07 | Evidence-based arguments can be constructed to support conclusions or evaluate claims, including consideration of ethical issues and protocols associated with using or citing secondary data or information                                          | 2, 3, 5, 6, 7 |
| VC2S8I08 | Communicating ideas, findings and arguments for specific purposes and audiences involves the selection and use of appropriate presentation formats, scientific vocabulary, models and other representations, and may include the use of digital tools | 5, 7          |

The unit also works towards this part of the Level 8 achievement standard: students "explain how
new evidence can lead to changes in scientific knowledge" and "discuss the relevant ethical …
considerations associated with a proposed scientific response". Wording from the VCAA's
[Victorian Curriculum F–10 Version 2.0 Science](https://f10.vcaa.vic.edu.au/learning-areas/science/introduction)
document.

## Unit at a glance

| Lesson | Focus                         | In the lab                                                                                       | Off the screen                   |
| ------ | ----------------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------- |
| 1      | Observation vs inference      | Desktop tour; Academy: Digital Footprints, Metadata Matters                                      | "Is this proof?" card sort       |
| 2      | Uncertainty                   | Academy: IP Addresses & Networks; **The Waterfront Alibi**                                       | Error-bar starter; exit ticket   |
| 3      | Limits, ethics and warrants   | Waterfront debrief (presenter view); Academy: Ethics & Privacy                                   | Warrant debate                   |
| 4      | Systematic error              | Academy: Timestamps & Time Zones; **Where was Jamie?** part 1                                    | Two-clocks starter               |
| 5      | New evidence changes theories | Where was Jamie? part 2; Jamie debrief                                                           | Board gallery walk (peer review) |
| 6      | Whose search was it?          | Academy: Search History & Cookies; **The Midnight Raid**; homework: Academy Emails & Cloud Files | Rubric preview                   |
| 7      | Assessment                    | **The Science Fair Switch** (assessment case)                                                    | Written reflection               |

Only six lessons? Set The Midnight Raid as homework before the assessment, or run it in place of
the gallery walk in lesson 5. It is the practice for search histories and fitness-band logs.

## Before the unit

- [ ] The lab is at **https://forensic-project.netlify.app/**. Get the **teacher code** and the **assessment access code**
      from the lab owner.
- [ ] Open the link on a student laptop, a Chromebook and an iPad. Check it loads and the dock fits.
- [ ] Play The Waterfront Alibi yourself with teacher mode on: on the case list, press **Teacher**
      and enter the teacher code. A Teacher icon appears in the dock of every case: the Teacher
      Panel has the answer key, clue notes, drop controls and a presenter view. To see what each
      support level gives students, switch level from the top bar: Guided adds "What this
      means" notes and nudges, Deep dive adds a Deep dive tab in Judgements.
- [ ] Decide how students keep their progress. It is saved **in the browser on that device**.
      If devices are shared or wiped, students copy their **progress code** (top bar → Back up
      progress) into their notes at the end of every lesson, and paste it back next time.
- [ ] Print the student sheets (one per lesson) and, for lesson 1, the card sort; for lesson 3,
      the warrant scenarios (both at the end of this guide).
- [ ] Turn teacher mode **off** on any device students will use. It stays on until turned off.
- [ ] Optional: to suggest a support level for the whole class, share the link with
      `?level=guided` (or `standard`, `deep`) on the end. Students can still change it.
- [ ] Check that no fictional student in the cases shares a name with a real student in the class
      (e.g. Morgan Lee, Priya Nair, Tom Baxter, Jamie Ellison, Kit Lam, Elliot Barker, Sasha
      Morales, Kai and Finn Thornton, Ruby Halloran, Leo Marsh, Zara Quinn). Rename them in the
      case files if needed.

**Familiar names.** The lab uses the school's name and Mrs Staggs's name (with her permission) to
feel familiar: she introduces the Training Academy, is mentioned in each case briefing, and sends
the assessment briefing herself. Staff appear only as narrators, never in the evidence or as
suspects; every student in the stories is fictional. The names live in one file,
`src/brand/local.ts`, so another teacher can swap in their own.

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

**Curriculum:** VC2S8I06.

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

**Curriculum:** VC2S8I05, VC2S8I06, VC2S8I07.

**You need:** the lab link; student sheet 2; the one-page Waterfront checklist
([waterfront-checklist.md](waterfront-checklist.md)) for students who want step-by-step
guidance (or everyone, if the class found the open-ended start hard). On your own device:
teacher mode on, The Waterfront Alibi open, so you can see the Teacher Panel.

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
  younger brother Sam's phone was online at home too, so Sam was probably there. A device is not a
  person (Q2's verdict is _Possible_).
- "Photo B shows Riley." Someone in a dark hoodie, face not visible (Q3: _Can't tell_).

**Exit ticket:** "The IP lookup shows… but it does not show…"

---

## Lesson 3: Limits, ethics and warrants

**Learning intention:** Understand that evidence has limits, and that collecting personal data
needs a necessary and proportionate reason.

**Success criteria:** Students can

- explain why a device is not the same as a person
- decide whether a request for data is proportionate, and justify it.

**Curriculum:** VC2S8H03, VC2S8I07.

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

**Curriculum:** VC2S8H01, VC2S8I04, VC2S8I05, VC2S8I06.

**You need:** the lab link; student sheet 4. Teacher mode on your device, with Where was Jamie?
open.

| Time  | What happens                                                                                                                                                                                                                                                                                                                                                                                     |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 0–7   | **Starter: two clocks.** Show two clocks, one 30 minutes ahead, one a few seconds off at random. Which error can you correct, and how? Introduce _systematic error_ and _calibration_.                                                                                                                                                                                                           |
| 7–15  | **Academy:** _Timestamps & Time Zones_ (about 8 min). Darwin is UTC+9:30 all year (no daylight saving); Brisbane is UTC+10.                                                                                                                                                                                                                                                                      |
| 15–55 | **Where was Jamie?** (part 1, about 40 min across two lessons). Jamie is safe; the case asks why the search went to the wrong place. Students use Messages, Social Feed, CCTV, Map and the **Timeline**. Two evidence drops arrive: a screenshot from Ari (after viewing the lagoon CCTV, or after 12 minutes) and a recovered original photo (after viewing Jamie's post, or after 10 minutes). |
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

**Curriculum:** VC2S8H01, VC2S8I07, VC2S8I08.

**You need:** sticky notes (two colours); your device with teacher mode on; student sheet 5.

| Time  | What happens                                                                                                                                                                                                                                                                 |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0–25  | **Finish Where was Jamie?** Q3 (could Jamie reach Parap by 8 pm? use the Map's travel calculator) and Q4 (where the search should have started, and what data was needed, fairly obtained). Release any drops a student hasn't triggered (Teacher Panel → _Evidence drops_). |
| 25–40 | **Gallery walk.** Students leave their Evidence Board open and move around. On each board they visit, leave one sticky note: green for a strong link ("this supports the claim because…"), yellow for a question ("what does this _not_ show?").                             |
| 40–55 | **Debrief with the presenter view.** Why did the search start at Mindil Beach? (Jamie's cropped sunset post looked like Mindil; the original photo shows Cullen Bay.) Ask: when has new evidence changed what scientists thought? (e.g. a new fossil, a better instrument).  |
| 55–60 | **Exit ticket.** Save progress. Next lesson is a practice case before the assessment.                                                                                                                                                                                        |

**Exit ticket:** Name one piece of evidence that changed your thinking, and how.

---

## Lesson 6: Whose search was it? Practice case: The Midnight Raid

**Learning intention:** Use observation and inference to judge a phone's search history and
sensor data, working more independently before the assessment.

**Success criteria:** Students can

- explain why a search in a history does not show who typed it
- describe what a fitness band and a motion light measure, and what they cannot tell us
- decide which requests for someone's data are fair.

**Curriculum:** VC2S8H01, VC2S8H03, VC2S8I06, VC2S8I07.

**You need:** the lab link; student sheet 6. Teacher mode on your device with The Midnight Raid
open; the rubric (lesson 7) ready to show.

| Time  | What happens                                                                                                                                                                                                                                                                                                                                                                                                |
| ----- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0–8   | **Academy:** _Search History & Cookies_ (about 6 min).                                                                                                                                                                                                                                                                                                                                                      |
| 8–45  | **The Midnight Raid** (about 35 min). On Year 8 camp, Cabin 4's snack box is raided overnight and Kai is blamed because "midnight snack ideas" is in the history on Kai's phone. Treat it as a rehearsal: "Work as if it were the assessment, and only press Check when you're confident." A second trail-camera photo arrives as an **evidence drop** after students view the first (or after 10 minutes). |
| 45–55 | **Debrief with the presenter view**, then show the rubric. Pairs rate one of their own answers against the _Shows and does not show_ row and say what would move it up a level. Science link: the band's "asleep" is an instrument's estimate, not an observation, like any reading that is calculated from something else.                                                                                 |
| 55–60 | **Exit ticket.** Save progress. Remind students the assessment is next lesson. **Homework:** Academy _Emails & Cloud Files_ (about 9 min), the warm-up for the assessment's emails and cloud drive: comparing an email with a genuine one, a version history shown in UTC, and "saved by" meaning an account, not a person.                                                                                 |

**The key moment:** the search is in Kai's phone history because the phone's browser is signed
in to the family account. Kai's phone was switched off in the locked phone box; the search was
typed on the family tablet at home by Kai's older brother. A search history records what an
**account** searched for, not who typed it, or on which device.

**Permission, not warrants:** in this school-scale case, students ask the people the data
belongs to (Kai's parent) instead of a magistrate. The test is the same: necessary and
proportionate. One hour of the family tablet's history is granted; a year of Kai's searches and
messages is refused.

**Watch for:**

- "It's in Kai's history, so Kai searched it." Check the profile line and the phone box sheet.
- "The band shows Kai walked to the box at 1:10." The band counts steps and measures heart rate;
  it doesn't know where Kai was. The verandah light also switched on while the band said Kai was
  asleep.
- "Kai searched about possums, so Kai knew." Check the time: 7:20 am, after the box was found.

**Exit ticket:** "The search history shows… but it does not show…"

---

## Lesson 7: Assessment: The Science Fair Switch

**Learning intention:** Show how you reason about digital evidence on your own.

**Success criteria:** see the rubric below; share it with students before they start.

**Curriculum:** VC2S8I06, VC2S8I07, VC2S8I08, VC2S8H03.

**You need:** the **assessment access code** on the board (or given out on slips); student sheet
7 (the reflection task).

| Time  | What happens                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0–5   | Students open the lab and, on the case list, choose _Enter access code_ on The Science Fair Switch, and type the code. Remind them: **no hints** in this case, they choose a support level as usual, and they **submit once** from the report.                                                                                                                                                                                               |
| 5–50  | **The Science Fair Switch** (about 45 min). A Year 9 team's results file was changed the night before judging at the school's science fair. Evidence includes a cloud drive with version history (times shown in **UTC**), two emails (one fake), browser histories, a fitness band, a smart doorbell and lab sensors. Students answer five questions (four verdicts, one open) and press **Save** on each, then **Submit** from the Report. |
| 50–60 | **Reflection** (student sheet 7), handwritten or typed.                                                                                                                                                                                                                                                                                                                                                                                      |

**After the lesson:** each student copies their **progress code** (top bar → Back up progress)
and submits it (e.g. in a learning platform assignment) along with their report PDF and
reflection. With teacher mode on, press **Teacher Review** on the case list and paste each code to see the
auto-scored verdicts and evidence, their writing, warrant choices, hash checks, clock
corrections, support level and Deep dive answers. Nothing is uploaded anywhere. To see the
whole class at once, choose **Whole class**, paste every code, pick the case, and download the
.csv for your markbook.

**If something goes wrong:** the Teacher Panel → _Case controls_ can **re-open** a submitted
assessment or reset it on that device. The access code is not secure, so treat this as a
classroom task, not an exam.

### Rubric

The app auto-scores the objective parts of each verdict question: the accepted verdict, all key
evidence attached and no distractors. Use the rubric for the written reasoning and the reflection.

| Criterion                                 | Beginning                                        | Developing                                   | Proficient                                                 | Extending                                                                                                        |
| ----------------------------------------- | ------------------------------------------------ | -------------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Judgements and evidence** (VC2S8I07)    | Verdicts given with little or unrelated evidence | Some verdicts supported by relevant evidence | Most verdicts accepted, with the key evidence attached     | All verdicts justified with key evidence; distractors recognised and explained                                   |
| **Shows and does not show** (VC2S8I06)    | Treats evidence as proof                         | Describes what evidence shows                | Explains what evidence shows **and** what it does not show | Identifies assumptions and sources of error (time zones, shared devices and accounts, fake emails, edited files) |
| **Limitations and further evidence**      | Limitation missing or vague                      | A general limitation ("it could be wrong")   | A specific limitation for each judgement                   | Proposes specific further evidence that would decide between explanations                                        |
| **Ethics and proportionality** (VC2S8H03) | Not considered                                   | Mentions privacy                             | Explains why a request is or isn't proportionate           | Weighs the need for data against people's privacy, suggesting the least intrusive option                         |
| **Communication** (VC2S8I08)              | Hard to follow                                   | Mostly clear                                 | Clear and uses correct terms                               | Concise, precise and well organised for its audience                                                             |

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
