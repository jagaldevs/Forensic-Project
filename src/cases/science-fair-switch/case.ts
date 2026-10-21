/**
 * Case: The Science Fair Switch (Phase 4 assessment, about 45 minutes).
 * A results spreadsheet is changed the night before judging. Everything here is fictional.
 *
 * Teacher summary of what really happened (Darwin time, ACST, UTC+9:30):
 *  15:58 In class, Morgan signs in to StreamCloud Drive on the shared Lab 2 laptop
 *        (LAB-LAPTOP-07) and never signs out.
 *  18:04 Morgan arrives home (doorbell). 18:25 Morgan saves the genuine final results from
 *        MORGAN-CHROMEBOOK (the drive shows 08:55 UTC).
 *  19:31 A new QuickPost account is created on the school's after-hours network.
 *  19:48 It sends Team 4 a fake "head judge" email: deadline "extended" to 11:59 pm.
 *  21:00 Real deadline. 21:04 Morgan's band goes on the charger at home until 06:40.
 *  23:08 Someone wakes LAB-LAPTOP-07 in Lab 2, still signed in as Morgan.
 *  23:22 The results are changed (the drive shows 13:52 UTC, "Last modified by Morgan Lee").
 *  23:35 The laptop's browser history for the last 25 minutes is cleared.
 *  Next morning 07:52 Someone edits the poster photo after it was collected at 07:40.
 * Who did it is NOT established by the evidence. Team 4 should be cleared of the change.
 */
import { local } from '../../brand/local';
import { defineCase } from '../../engine/defineCase';
import { meta } from './meta';
import posterPhoto from './assets/team4-poster.svg';

const day = '2026-09-17';
const next = '2026-09-18';
const at = (time: string) => `${day}T${time}+09:30`;
const rec = (time: string) => `${day}T${time}`;
const recNext = (time: string) => `${next}T${time}`;

const columns = ['Day', 'Tank A: nutrient (g)', 'Tank B: control (g)'];
const genuineRows = [
  ['1', '2.0', '2.0'],
  ['2', '2.3', '2.1'],
  ['3', '2.7', '2.2'],
  ['4', '3.0', '2.3'],
  ['5', '3.2', '2.3'],
  ['6', '3.5', '2.4'],
  ['7', '3.7', '2.5'],
];
const changedRows = [
  ['1', '2.0', '2.0'],
  ['2', '2.9', '2.1'],
  ['3', '3.8', '2.2'],
  ['4', '4.6', '2.3'],
  ['5', '5.5', '2.3'],
  ['6', '6.3', '2.4'],
  ['7', '7.1', '2.5'],
];

/** Guided notes shared by items of the same kind, so no single item stands out. */
const emailGuide =
  'The From line is what the email says about its sender. Reply-To, if there is one, is where replies will go, and it can be different from From. Each Received line is added by a mail server as it passes the email on: read them from the bottom up to follow its route. SPF checks whether the sending server is on the domain’s list of approved servers, and DKIM checks for the domain’s digital signature (pass, fail or none).';
const historyGuide =
  'A “visit” is a page that was opened and a “search” is something typed into a search box, each with the time on that device’s clock. The profile line shows which browser account was in use. If a period is marked as cleared, someone used a clear-history option and the entries from that time are gone: you can see when they were removed, but not what they were.';

const schoolNet = '203.0.113.60';
const team4 = [
  { name: 'Morgan Lee', address: `morgan.lee@${local.schoolEmailDomain}` },
  { name: 'Priya Nair', address: `priya.nair@${local.schoolEmailDomain}` },
  { name: 'Tom Baxter', address: `tom.baxter@${local.schoolEmailDomain}` },
];
const headJudge = {
  name: 'Dr Helen Achebe (Head Judge)',
  address: 'head.judge@ntsciencefair.example',
};

export default defineCase({
  meta,
  timeZone: { label: 'ACST', utcOffset: '+09:30' },
  incident: {
    summary:
      'Team 4’s results spreadsheet was changed the night before judging. The change was saved “from Morgan Lee’s account”.',
    location: `${local.school}, Darwin`,
    date: day,
    windowStart: '21:00',
    windowEnd: '23:59',
  },

  briefing: {
    from: { name: local.scienceTeacher, role: `Science teacher, ${local.school}` },
    subject: 'Assessment: The Science Fair Switch',
    message: `Agent, I need an independent investigator, and I'd like it to be you.

On Friday morning, just before judging at the Junior Science Fair, Mr Osei, our science coordinator, noticed that Year 9 Team 4's results spreadsheet had been changed. Their algae suddenly grew three times faster. The fair rules say results are final at 9:00 pm on Thursday, and the cloud drive says the last change was made by Morgan Lee, one of the team. Some people think that settles it.

Morgan says they never touched the file after dinner. The team also showed Mr Osei an email from the head judge saying the deadline had been extended, and he has collected everything we have. Morgan's parent has given consent for Morgan's fitness band and the family's doorbell logs. Anything belonging to other people needs a warrant.

This is an assessment. Work on your own. You will not get hints, your answers are saved but not checked, and you can only submit your report once. Before you submit, make sure every answer names the evidence it relies on, what it shows and what it does not show.

Check every clock and every hash. Morgan deserves a fair investigation.`,
    questionIds: [
      'q1-after-deadline',
      'q2-judge-email',
      'q3-morgan-location',
      'q4-poster-photo',
      'q5-what-happened',
    ],
  },

  people: [
    {
      id: 'morgan-lee',
      name: 'Morgan Lee',
      age: 14,
      role: 'Year 9, Team 4 (accused)',
      summary: 'Owns the team’s StreamCloud Drive folder. Says they were home all evening.',
    },
    {
      id: 'priya-nair',
      name: 'Priya Nair',
      age: 14,
      role: 'Year 9, Team 4',
      summary: 'Recorded most of the daily readings.',
    },
    {
      id: 'tom-baxter',
      name: 'Tom Baxter',
      age: 15,
      role: 'Year 9, Team 4',
      summary: 'Made the team’s poster.',
    },
    {
      id: 'daniel-osei',
      name: 'Daniel Osei',
      role: 'Science Coordinator',
      summary: 'Runs the school’s entry in the fair. Collected the evidence on Friday morning.',
    },
    {
      id: 'helen-achebe',
      name: 'Dr Helen Achebe',
      role: 'Head Judge, NT Junior Science Fair',
      summary: 'Sets the fair’s deadlines. Says she sent only one email to teams on Thursday.',
    },
    {
      id: 'sam-lee',
      name: 'Sam Lee',
      role: 'Morgan’s parent',
      summary: 'Gave consent for Morgan’s fitness band and the family doorbell logs.',
    },
  ],

  devices: [
    {
      id: 'morgan-chromebook',
      ownerId: 'morgan-lee',
      type: 'laptop',
      name: 'MORGAN-CHROMEBOOK',
      model: 'Lumen Book 3',
      mac: '02:93:6D:BC:E4:B1',
    },
    {
      id: 'lab-laptop-07',
      ownerLabel: `${local.school} (shared Lab 2 laptop)`,
      type: 'laptop',
      name: 'LAB-LAPTOP-07',
      model: 'EduBook 14',
      mac: '02:93:6D:BC:E4:07',
    },
    {
      id: 'drive-service',
      ownerLabel: 'StreamCloud',
      type: 'server',
      name: 'StreamCloud Drive service',
      clock: { label: 'UTC', utcOffset: '+00:00' },
    },
    {
      id: 'morgan-band',
      ownerId: 'morgan-lee',
      type: 'wearable',
      name: 'Morgan’s PulseBand',
      model: 'PulseBand Go',
    },
    {
      id: 'lee-doorbell',
      ownerLabel: 'Lee family',
      type: 'smart-home',
      name: 'Lee family front doorbell',
      model: 'DoorSense Mini',
    },
    {
      id: 'lab2-sensor',
      ownerLabel: `${local.school} facilities`,
      type: 'smart-home',
      name: 'Science block sensors (Lab 2)',
      model: 'BuildingWatch S2',
    },
  ],

  mapMarkers: [],

  evidence: [
    {
      id: 'coordinator-report',
      type: 'document',
      app: 'locker',
      title: 'Coordinator’s incident note',
      summary:
        'Mr Osei’s note: the results file was “modified from Morgan’s account after the deadline” and the poster matches the new numbers.',
      source: 'Written by Mr Osei, Friday 18 September, 8:10 am',
      fields: [
        { label: 'Noticed', value: 'Friday 18 September, 7:45 am' },
        { label: 'File', value: 'team4-algae-results (StreamCloud Drive)' },
        { label: 'Concern', value: 'Tank A results almost doubled overnight' },
        { label: 'Last modified by', value: 'Morgan Lee' },
      ],
      body: 'The drive says it was last changed at 13:52, which I first read as Thursday afternoon. But the team’s own poster photo shows the new +255% result, so the team must have known about the change. Unless there is a good explanation, Team 4 will be disqualified.',
      teacherNote:
        'The accusation, with two errors built in: 13:52 is UTC (23:22 in Darwin), and the poster photo was edited after collection. Neutral context, not key evidence.',
    },
    {
      id: 'morgan-statement',
      type: 'document',
      app: 'locker',
      title: 'Morgan’s statement',
      summary:
        'Morgan says they saved the final results at about 6:25 pm at home, charged their band after dinner and went to bed at about 10.',
      source: 'Interview with Mr Osei, Friday 18 September, 9:00 am',
      fields: [
        { label: 'Left school', value: 'About 5:15 pm, by bus' },
        { label: 'Final save', value: '“About 6:25, on my Chromebook at home”' },
        { label: 'Lab 2 laptop', value: '“I used it in class. I think I just closed the lid.”' },
        { label: 'Bed', value: 'About 10 pm' },
      ],
      body: '“I got the email about the extension but I didn’t need it. Our results were finished. I never changed the numbers.”',
      teacherNote:
        'A statement is a claim to test, not evidence that settles anything. The “closed the lid” detail is the clue to the signed-in laptop.',
    },
    {
      id: 'fair-rules',
      type: 'document',
      app: 'locker',
      title: 'Junior Science Fair rules',
      summary:
        'Results spreadsheets are final at 9:00 pm (Darwin time) on Thursday 17 September. Files changed after that are reviewed.',
      source: 'NT Junior Science Fair entry pack, page 3',
      fields: [
        {
          label: 'Results deadline',
          value: '9:00 pm ACST, Thursday 17 September 2026',
          note: 'All fair times are Darwin time (ACST, UTC+9:30).',
        },
        {
          label: 'Late changes',
          value: 'Reviewed by the head judge; may lead to disqualification',
        },
        { label: 'Extensions', value: 'Only announced by the head judge to all teams at once' },
        { label: 'Judging', value: 'Friday 18 September, from 9:00 am' },
      ],
      timeline: [{ recorded: rec('21:00'), label: 'Results deadline (fair rules)' }],
      teacherNote:
        'Key for Q1: fixes the deadline at 21:00 ACST. The “all teams at once” rule also helps Q2 (the fake email went to Team 4 only).',
    },
    {
      id: 'drive-results',
      type: 'file',
      app: 'drive',
      title: 'team4-algae-results (StreamCloud Drive)',
      summary:
        'Team 4’s results spreadsheet, owned by Morgan. Five versions; the last one changed Tank A’s results.',
      source: 'StreamCloud Drive, shared with the coordinator by Morgan',
      service: 'StreamCloud Drive',
      fileName: 'team4-algae-results',
      path: 'Science Fair 2026 / Team 4',
      fileKind: 'spreadsheet',
      sizeBytes: 14336,
      owner: 'Morgan Lee',
      sharedWith: ['Priya Nair', 'Tom Baxter', 'Daniel Osei'],
      createdAt: '2026-09-10T06:12:00Z',
      modifiedAt: '2026-09-17T13:52:00Z',
      lastModifiedBy: 'Morgan Lee',
      displayZone: { label: 'UTC', utcOffset: '+00:00' },
      versions: [
        {
          at: '2026-09-10T06:12:00Z',
          by: 'Morgan Lee',
          device: 'MORGAN-CHROMEBOOK',
          note: 'Created',
          content: { kind: 'table', columns, rows: genuineRows.slice(0, 2) },
        },
        {
          at: '2026-09-15T06:40:00Z',
          by: 'Priya Nair',
          device: 'PRIYA-TABLET',
          note: 'Days 3 to 5 added',
          content: { kind: 'table', columns, rows: genuineRows.slice(0, 5) },
        },
        {
          at: '2026-09-17T06:44:00Z',
          by: 'Morgan Lee',
          device: 'LAB-LAPTOP-07',
          note: 'Days 6 and 7 added',
          content: { kind: 'table', columns, rows: genuineRows },
        },
        {
          at: '2026-09-17T08:55:00Z',
          by: 'Morgan Lee',
          device: 'MORGAN-CHROMEBOOK',
          note: 'Growth row added',
          content: { kind: 'table', columns, rows: [...genuineRows, ['Growth', '+85%', '+25%']] },
        },
        {
          at: '2026-09-17T13:52:00Z',
          by: 'Morgan Lee',
          device: 'LAB-LAPTOP-07',
          content: { kind: 'table', columns, rows: [...changedRows, ['Growth', '+255%', '+25%']] },
        },
      ],
      timeline: [
        {
          recorded: rec('08:55'),
          deviceId: 'drive-service',
          label: 'Results saved from MORGAN-CHROMEBOOK (growth +85%)',
        },
        {
          recorded: rec('13:52'),
          deviceId: 'drive-service',
          label: 'Results changed from LAB-LAPTOP-07 (growth +255%)',
        },
      ],
      guided:
        '“Created” is when the file was first made; “modified” is when it was last saved. The version history keeps a copy of each save, with the account, device and time, so you can open older versions and compare them. A service may show times in its own time zone rather than Darwin time, so check the zone label next to each time before comparing it with other evidence.',
      teacherNote:
        'Key for Q1 and Q5. The drive shows UTC: 08:55 UTC = 18:25 ACST (before the deadline, Morgan’s Chromebook) and 13:52 UTC = 23:22 ACST (after the deadline, the shared lab laptop). “Morgan Lee” is the signed-in account, not proof of the person. The genuine results survive in version 4.',
    },
    {
      id: 'email-genuine',
      type: 'email',
      app: 'email',
      title: 'Head judge: deadline reminder',
      summary: 'Thursday morning, the head judge reminds all Year 9 teams the deadline is 9:00 pm.',
      source: 'Morgan Lee’s school inbox (shared by Morgan)',
      inbox: 'Morgan Lee (school email)',
      from: headJudge,
      to: [
        { name: 'Year 9 science fair teams', address: `y9-fair-teams@${local.schoolEmailDomain}` },
      ],
      subject: 'Reminder: results due 9:00 pm tonight',
      sentAt: at('08:30:00'),
      body: `Good morning teams,

A reminder that results spreadsheets are final at 9:00 pm tonight (Darwin time). This deadline will not change. If you have a problem with the portal, tell your coordinator before 9:00 pm.

Good luck for tomorrow!

Dr Helen Achebe
Head Judge, NT Junior Science Fair`,
      messageId: '<20260917083000.4471@mail.ntsciencefair.example>',
      received: [
        {
          from: 'mail.ntsciencefair.example',
          fromIp: '192.0.2.25',
          by: `mx1.${local.schoolEmailDomain}`,
          at: at('08:30:04'),
        },
        {
          from: 'office-pc-12.ntsciencefair.example',
          fromIp: '192.0.2.140',
          by: 'mail.ntsciencefair.example',
          at: at('08:30:01'),
        },
      ],
      auth: {
        spf: 'pass',
        dkim: 'pass',
        detail:
          'The sending server (192.0.2.25) is on ntsciencefair.example’s list of approved mail servers, and the email carries a valid ntsciencefair.example digital signature.',
      },
      timeline: [
        { recorded: rec('08:30'), label: 'Head judge emails all teams: deadline 9:00 pm' },
      ],
      guided: emailGuide,
      teacherNote:
        'Key for Q2: the comparison email. Same From address, but the Received chain stays inside ntsciencefair.example, there is no Reply-To, and SPF and DKIM pass.',
    },
    {
      id: 'email-spoofed',
      type: 'email',
      app: 'email',
      title: '“Deadline extended to 11:59 pm”',
      summary:
        'Thursday 7:48 pm, an email that looks like it is from the head judge tells Team 4 the deadline is extended.',
      source: 'Morgan Lee’s school inbox (shared by Morgan)',
      inbox: 'Morgan Lee (school email)',
      from: headJudge,
      replyTo: { name: 'Head Judge', address: 'hjudge.fair2026@quickpost.example' },
      to: team4,
      subject: 'URGENT: results deadline extended to 11:59 pm',
      sentAt: at('19:48:00'),
      body: `Hi Team 4,

Because of problems with the results portal, your deadline has been extended to 11:59 pm tonight. Feel free to make final changes to your results.

Please reply to me directly rather than your coordinator.

Dr H. Achebe
Head Judge`,
      messageId: '<qp-7f3a9c21e4b8@quickpost.example>',
      received: [
        {
          from: 'smtp-out3.quickpost.example',
          fromIp: '198.51.100.73',
          by: `mx1.${local.schoolEmailDomain}`,
          at: at('19:48:06'),
        },
        {
          from: 'webmail.quickpost.example',
          fromIp: '198.51.100.12',
          by: 'smtp-out3.quickpost.example',
          at: at('19:48:02'),
        },
      ],
      auth: {
        spf: 'fail',
        dkim: 'none',
        detail:
          '198.51.100.73 belongs to QuickPost, a free email service. It is not on ntsciencefair.example’s list of approved mail servers, so SPF failed. The email has no ntsciencefair.example digital signature.',
      },
      extraHeaders: [{ name: 'X-Mailer', value: 'QuickPost Webmail 4.2' }],
      timeline: [{ recorded: rec('19:48'), label: 'Fake “head judge” email: deadline “extended”' }],
      guided: emailGuide,
      teacherNote:
        'Key for Q2. Spoofed: the From line is copied, but Reply-To and Message-ID are QuickPost, it was sent through QuickPost’s servers, SPF fails and there is no DKIM. Sent to Team 4 only, against the fair rules.',
    },
    {
      id: 'band-morgan',
      type: 'wearableLog',
      app: 'wearables',
      title: 'Morgan’s PulseBand log',
      summary:
        'Steps and heart rate until 9:03 pm, when the band was taken off and charged. Nothing until it was worn again at 6:40 am.',
      source: 'PulseBand app export (Sam Lee gave consent)',
      deviceId: 'morgan-band',
      service: 'PulseBand',
      series: [
        {
          measure: 'steps',
          unit: 'steps per hour',
          points: [
            { at: rec('15:00'), value: 820 },
            { at: rec('16:00'), value: 610 },
            { at: rec('17:00'), value: 1450 },
            { at: rec('18:00'), value: 940 },
            { at: rec('19:00'), value: 310 },
            { at: rec('20:00'), value: 260 },
            { at: rec('21:00'), value: 40 },
          ],
        },
        {
          measure: 'heartRate',
          unit: 'bpm',
          points: [
            { at: rec('15:00'), value: 82 },
            { at: rec('15:30'), value: 78 },
            { at: rec('16:00'), value: 84 },
            { at: rec('16:30'), value: 80 },
            { at: rec('17:00'), value: 102 },
            { at: rec('17:30'), value: 96 },
            { at: rec('18:00'), value: 88 },
            { at: rec('18:30'), value: 76 },
            { at: rec('19:00'), value: 74 },
            { at: rec('19:30'), value: 79 },
            { at: rec('20:00'), value: 72 },
            { at: rec('20:30'), value: 70 },
            { at: rec('21:00'), value: 68 },
          ],
        },
      ],
      events: [
        { at: rec('21:03'), kind: 'removed', event: 'Band taken off wrist' },
        { at: rec('21:04'), kind: 'charging', event: 'Charging started' },
        {
          at: rec('21:05'),
          kind: 'other',
          event: 'Synced to phone',
          detail: 'Over the Wi-Fi network “LEE-HOME”',
        },
        { at: recNext('06:40'), kind: 'worn', event: 'Band put on wrist; charging stopped' },
      ],
      note: 'The band records movement and heart rate only while it is worn. It does not record location.',
      timeline: [
        { recorded: rec('21:04'), deviceId: 'morgan-band', label: 'Morgan’s band starts charging' },
        { recorded: recNext('06:40'), deviceId: 'morgan-band', label: 'Morgan’s band worn again' },
      ],
      guided:
        'Heart rate is in beats per minute (bpm) and steps are counted for each hour. A band only records while it is on a wrist; the events list shows when it was taken off, charged or put back on. It measures the wearer’s movement and heart rate, but it cannot tell you who the wearer is.',
      teacherNote:
        'Key for Q3. The band was charging (and syncing over the home Wi-Fi) from 21:04 to 06:40. That places the band at home, not Morgan, and shows nothing at all about 23:22.',
    },
    {
      id: 'doorbell-lee',
      type: 'wearableLog',
      app: 'wearables',
      title: 'Lee family doorbell log',
      summary:
        'Someone arrives at the Lee home at 6:04 pm. The front door is not opened again until 7:35 am.',
      source: 'DoorSense app export (Sam Lee gave consent)',
      deviceId: 'lee-doorbell',
      service: 'DoorSense',
      events: [
        { at: rec('18:04'), kind: 'motion', event: 'Person detected at front door' },
        { at: rec('18:05'), kind: 'door', event: 'Front door opened' },
        { at: rec('18:05'), kind: 'door', event: 'Front door closed' },
        {
          at: rec('20:41'),
          kind: 'motion',
          event: 'Motion detected (driveway)',
          detail: 'Clip shows a cat crossing the driveway',
        },
        { at: recNext('07:35'), kind: 'door', event: 'Front door opened' },
        { at: recNext('07:35'), kind: 'motion', event: 'Person detected leaving' },
      ],
      note: 'This doorbell watches the front door only. The house also has a back door and a garage, which are not monitored.',
      timeline: [
        {
          recorded: rec('18:04'),
          deviceId: 'lee-doorbell',
          label: 'Doorbell: person arrives at the Lee home',
        },
        {
          recorded: recNext('07:35'),
          deviceId: 'lee-doorbell',
          label: 'Doorbell: front door opened (next morning)',
        },
      ],
      guided:
        'A smart doorbell logs an event when its camera sees movement or its sensor feels the door open or close. “Person detected” means the camera’s software thinks the shape is a person, not who it is. Each sensor only covers the area it can see.',
      teacherNote:
        'Key for Q3. Nobody left by the front door overnight, but the doorbell can’t see other doors and doesn’t identify anyone. It fits Morgan’s account; it doesn’t prove it.',
    },
    {
      id: 'lab2-sensor',
      type: 'wearableLog',
      app: 'wearables',
      title: 'Science block sensors: Lab 2',
      summary:
        'Lab 2’s door opened at 11:07 pm and its motion sensor was triggered until 11:31 pm.',
      source: `${local.school} facilities system`,
      releasedBy: 'drop-lab-sensor',
      deviceId: 'lab2-sensor',
      service: 'BuildingWatch',
      events: [
        {
          at: rec('23:07'),
          kind: 'door',
          event: 'Lab 2 door opened',
          detail: 'No access card used: the door is left unlocked for boarders’ evening study',
        },
        { at: rec('23:14'), kind: 'motion', event: 'Motion detected in Lab 2' },
        { at: rec('23:22'), kind: 'motion', event: 'Motion detected in Lab 2' },
        { at: rec('23:31'), kind: 'motion', event: 'Motion detected in Lab 2' },
        { at: rec('23:37'), kind: 'door', event: 'Lab 2 door closed' },
      ],
      note: 'Motion sensors detect movement, not people’s identities. There is no camera in Lab 2.',
      timeline: [
        { recorded: rec('23:07'), deviceId: 'lab2-sensor', label: 'Lab 2 door opened' },
        { recorded: rec('23:31'), deviceId: 'lab2-sensor', label: 'Last motion in Lab 2' },
      ],
      guided:
        'A door sensor logs when a door opens or closes. A motion sensor logs movement in a room, often only every few minutes while movement continues, so a gap between entries doesn’t always mean the room was empty. Neither kind of sensor records who was there.',
      teacherNote:
        'Someone was in Lab 2 when the file changed. It shows a person was there, not who. Good for Q5.',
    },
    {
      id: 'history-lab-laptop',
      type: 'browserHistory',
      app: 'browser',
      title: 'LAB-LAPTOP-07 browser history',
      summary:
        'Morgan’s class research on Thursday afternoon, then a gap: history from 11:10 to 11:35 pm was cleared.',
      source: `${local.school} IT (school-owned device)`,
      browser: 'Lumen Browser',
      profile: 'Lab 2 student account (StreamCloud signed in as Morgan Lee)',
      deviceId: 'lab-laptop-07',
      entries: [
        {
          at: rec('15:58'),
          kind: 'visit',
          title: 'Sign in - StreamCloud Drive',
          url: 'https://drive.streamcloud.example/signin',
        },
        {
          at: rec('16:02'),
          kind: 'visit',
          title: 'team4-algae-results - StreamCloud Drive',
          url: 'https://drive.streamcloud.example/d/team4-algae-results',
        },
        { at: rec('16:05'), kind: 'search', title: 'algae growth rate units' },
        {
          at: rec('16:09'),
          kind: 'visit',
          title: 'Measuring algae growth - Science Help',
          url: 'https://sciencehelp.example/algae-growth',
        },
        { at: rec('16:21'), kind: 'search', title: 'how to calculate percentage change' },
        {
          at: rec('16:24'),
          kind: 'visit',
          title: 'Percentage change, explained - Maths Corner',
          url: 'https://mathscorner.example/percentage-change',
        },
        {
          at: rec('16:40'),
          kind: 'visit',
          title: 'team4-algae-results - StreamCloud Drive',
          url: 'https://drive.streamcloud.example/d/team4-algae-results',
        },
      ],
      cleared: [
        {
          from: rec('23:10'),
          to: rec('23:35'),
          note: '“Clear recent history” was used at 11:35 pm.',
        },
      ],
      note: 'All Lab 2 laptops use one shared “Lab 2 student” account, so the browser can’t say which student used it.',
      timeline: [
        {
          recorded: rec('16:05'),
          deviceId: 'lab-laptop-07',
          label: 'Lab laptop: class research (“algae growth rate units”)',
        },
        {
          recorded: rec('23:35'),
          deviceId: 'lab-laptop-07',
          label: 'Lab laptop: history from 11:10 pm cleared',
        },
      ],
      guided: historyGuide,
      teacherNote:
        'Shows Morgan’s StreamCloud was open on the lab laptop from class, and someone hid what they did late at night. A cleared gap shows something was hidden, not who hid it or what it was.',
    },
    {
      id: 'history-chromebook',
      type: 'browserHistory',
      app: 'browser',
      title: 'MORGAN-CHROMEBOOK browser history',
      summary: 'Homework and videos at home between 7:02 and 8:58 pm. Nothing after 9 pm.',
      source: 'Morgan’s Chromebook (shown by Morgan with Sam Lee present)',
      browser: 'Lumen Browser',
      profile: 'Morgan',
      deviceId: 'morgan-chromebook',
      entries: [
        { at: rec('19:02'), kind: 'search', title: 'persuasive essay hooks year 9' },
        {
          at: rec('19:06'),
          kind: 'visit',
          title: 'Writing a strong opening - LearnHub',
          url: 'https://learnhub.example/english/openings',
        },
        {
          at: rec('19:40'),
          kind: 'visit',
          title: 'How lava lamps work - WaveTube',
          url: 'https://wavetube.example/watch/lava-lamps',
        },
        { at: rec('20:15'), kind: 'search', title: 'chocolate mug cake recipe' },
        {
          at: rec('20:17'),
          kind: 'visit',
          title: 'Two-minute mug cake - Kitchen Basics',
          url: 'https://kitchenbasics.example/mug-cake',
        },
        { at: rec('20:58'), kind: 'search', title: 'sunrise time darwin tomorrow' },
      ],
      timeline: [
        {
          recorded: rec('20:58'),
          deviceId: 'morgan-chromebook',
          label: 'Morgan’s Chromebook: last search of the night',
        },
      ],
      guided: historyGuide,
      teacherNote:
        'Distractor for Q1: it says nothing about when the results file changed. Also only shows the Chromebook was used, not by whom, and an absence of history after 9 pm is not proof of anything.',
    },
    {
      id: 'poster-photo',
      type: 'photo',
      app: 'photos',
      title: 'Team 4 poster photo',
      summary:
        'A photo of Team 4’s poster showing “+255% growth”, the same as the changed spreadsheet.',
      source: 'Team 4 shared folder, collected by Mr Osei on Friday at 7:40 am',
      src: posterPhoto,
      alt: 'A science fair poster titled "Can nutrients speed up algae growth?" with a bar chart. Tank A reaches 7.1 g, Tank B 2.5 g, and a box reads "+255% growth".',
      fileName: 'team4-poster.jpg',
      hashAtCollection: 'f2267403e6447f6ede657701b99def3b97ebbd3d48cdd960217d627f03730488',
      metadata: [
        { label: 'DateTimeOriginal', value: '2026:09:17 16:30:05' },
        {
          label: 'ModifyDate',
          value: '2026:09:18 07:52:10',
          note: 'This file was changed after it was taken.',
        },
        { label: 'Software', value: 'QuickEdit Photo 3.1' },
        { label: 'Make', value: 'Lumo' },
        { label: 'Model', value: 'Lumo 9' },
      ],
      guided:
        'Metadata is information saved inside the photo file. DateTimeOriginal is when the photo was taken, ModifyDate is when the file was last saved, and Software is the program that saved it. The hash is a fingerprint of the file’s exact contents: change even one pixel and the hash changes completely.',
      teacherNote:
        'Key for Q4. The hash no longer matches the one recorded at collection (07:40), and ModifyDate (07:52) is after collection, with editing software. The photo was altered, so it can’t be trusted as a record.',
    },
    {
      id: 'intake-record',
      type: 'document',
      app: 'locker',
      title: 'Evidence intake record',
      summary:
        'When each item was collected on Friday morning, with its SHA-256 hash at the moment of collection.',
      source: 'Kept by Mr Osei',
      fields: [
        { label: 'Item', value: 'team4-poster.jpg (Team 4 shared folder)' },
        { label: 'Collected', value: 'Friday 18 September, 7:40 am' },
        {
          label: 'SHA-256 at collection',
          value: 'f2267403e6447f6ede657701b99def3b97ebbd3d48cdd960217d627f03730488',
        },
        {
          label: 'Folder access',
          value: 'Anyone with the link can edit',
          note: 'The shared folder was not locked after collection.',
        },
      ],
      guided:
        'An intake record notes when each item was collected and its hash at that moment. SHA-256 turns a file’s contents into a 64-character code, and the same contents always give the same code. Investigators compare hashes to check whether a file is exactly the same as when it was collected.',
      teacherNote:
        'Key for Q4. Compare its hash with the poster photo’s current hash: they differ, so the photo changed after collection. The open folder explains how.',
    },
    {
      id: 'cleaning-roster',
      type: 'document',
      app: 'locker',
      title: 'Science block cleaning roster',
      summary: 'Cleaners worked in the science block from 6:00 to 7:30 pm on Thursday.',
      source: `${local.school} facilities`,
      fields: [
        { label: 'Thursday 17 September', value: '6:00 pm to 7:30 pm, Labs 1 to 4' },
        { label: 'Locked up', value: 'Main doors at 7:30 pm. Lab 2 left open for boarders.' },
      ],
      teacherNote:
        'Distractor: the cleaners left hours before the change. The only useful detail is that Lab 2 stays open for boarders.',
    },
    {
      id: 'laptop-session',
      type: 'loginRecord',
      app: 'locker',
      title: 'LAB-LAPTOP-07 session log',
      summary:
        'The lab laptop stayed signed in to Morgan’s StreamCloud account from 3:58 pm. It was woken at 11:08 pm and the results file was saved at 11:22 pm.',
      source: `${local.school} IT (obtained under warrant)`,
      lockedBy: 'warrant',
      service: `${local.school} IT: device log`,
      account: 'LAB-LAPTOP-07 (shared “Lab 2 student” account)',
      events: [
        { at: at('15:58:12'), event: 'StreamCloud signed in as Morgan Lee', ip: schoolNet },
        { at: at('16:41:30'), event: 'Lid closed (StreamCloud still signed in)', ip: schoolNet },
        {
          at: at('23:08:40'),
          event: 'Laptop woken; StreamCloud session resumed, no new sign-in needed',
          ip: schoolNet,
        },
        { at: at('23:22:05'), event: 'File saved: team4-algae-results', ip: schoolNet },
        { at: at('23:35:02'), event: 'Browser history cleared (last 25 minutes)', ip: schoolNet },
        { at: at('23:36:15'), event: 'Laptop put to sleep', ip: schoolNet },
      ],
      note: '203.0.113.60 is the school’s after-hours network, used by the boarding house and the science block.',
      timeline: [
        { recorded: rec('23:08'), label: 'Lab laptop woken, still signed in as Morgan' },
        { recorded: rec('23:22'), label: 'Lab laptop saves team4-algae-results' },
      ],
      guided:
        'A device log records what happened on one computer, such as sign-ins, the lid closing, waking from sleep and files being saved. Each line shows the time and the IP address of the network the computer was using. An IP address identifies a network connection, which many people and devices can share.',
      teacherNote:
        'Explains “modified from Morgan’s account”: Morgan never signed out in class, so anyone who opened the laptop could edit as Morgan. The shared account can’t name the person.',
    },
    {
      id: 'quickpost-signin',
      type: 'loginRecord',
      app: 'locker',
      title: 'QuickPost sign-in record',
      summary:
        'The account that sent the fake email was created at 7:31 pm and used from the school’s after-hours network.',
      source: 'QuickPost (obtained under warrant)',
      lockedBy: 'warrant',
      service: 'QuickPost',
      account: 'hjudge.fair2026@quickpost.example',
      events: [
        {
          at: at('19:31:20'),
          event: 'Account created (no name or phone number given)',
          ip: schoolNet,
        },
        { at: at('19:41:02'), event: 'Signed in (webmail)', ip: schoolNet },
        {
          at: at('19:48:00'),
          event: 'Email sent: “URGENT: results deadline extended to 11:59 pm”',
          ip: schoolNet,
        },
        { at: at('19:52:44'), event: 'Signed out', ip: schoolNet },
      ],
      note: 'Requested for Thursday 7 to 8 pm only.',
      timeline: [
        { recorded: rec('19:41'), label: 'Fake judge account signs in from the school network' },
      ],
      guided:
        'A sign-in record from an email service lists what happened on one account: when it was created, signed in, sent mail and signed out. Each line shows the IP address of the network it was used from. That tells you which network connection was used, not which person or device.',
      teacherNote:
        'Links the fake email and the late edit to the same network (203.0.113.60), not to a person: many boarders and staff share it.',
    },
    {
      id: 'year9-all-data',
      type: 'document',
      app: 'locker',
      title: 'All Year 9 emails and messages',
      summary: 'Every email and message sent by every Year 9 student for the whole week.',
      source: 'Not obtained',
      lockedBy: 'warrant',
      fields: [{ label: 'Status', value: 'Not obtained' }],
      teacherNote:
        'Disproportionate: about 120 students, a whole week, almost all private and irrelevant. Refused.',
    },
  ],

  questions: [
    {
      id: 'q1-after-deadline',
      kind: 'verdict',
      prompt: 'Was the results spreadsheet changed after the 9:00 pm deadline?',
      claim: 'The results file was changed after the deadline',
      acceptedVerdicts: ['strongly-supported'],
      keyEvidenceIds: ['drive-results', 'fair-rules'],
      distractorEvidenceIds: ['history-chromebook'],
      modelAnswer:
        'Strongly supported. The Cloud Drive shows times in UTC. The last version was saved at 13:52 UTC, which is 23:22 ACST (add 9 hours 30 minutes), 2 hours 22 minutes after the 9:00 pm ACST deadline in the fair rules. The version before it, with the genuine results, was saved at 08:55 UTC (6:25 pm ACST), before the deadline. This shows when the file changed, not who changed it.',
      limitationExamples: [
        'The time shows when the file was saved, not who was using the account.',
        'We rely on StreamCloud’s clock being accurate.',
      ],
    },
    {
      id: 'q2-judge-email',
      kind: 'verdict',
      prompt: 'Did the “deadline extended” email really come from the head judge?',
      claim: 'The head judge sent the extension email',
      acceptedVerdicts: ['not-supported'],
      keyEvidenceIds: ['email-spoofed', 'email-genuine'],
      distractorEvidenceIds: ['cleaning-roster'],
      modelAnswer:
        'Not supported. The From line looks right, but anyone can type a From address. The headers show it was sent through QuickPost’s servers (198.51.100.73), the Reply-To and Message-ID are QuickPost addresses, SPF failed and there is no DKIM signature. The genuine reminder from the same address went through ntsciencefair.example’s own server and passed SPF and DKIM. The fair rules also say extensions go to all teams at once, but this went to Team 4 only.',
      limitationExamples: [
        'Headers show which servers handled the email, not who typed it.',
        'SPF can fail for honest reasons (like forwarding), so it is strongest alongside the other clues.',
      ],
    },
    {
      id: 'q3-morgan-location',
      kind: 'verdict',
      prompt: 'Do the doorbell and wearable logs place Morgan at school when the file was changed?',
      claim: 'Morgan was at school at 11:22 pm',
      acceptedVerdicts: ['not-supported'],
      keyEvidenceIds: ['band-morgan', 'doorbell-lee'],
      distractorEvidenceIds: ['poster-photo'],
      modelAnswer:
        'Not supported. Nothing places Morgan at school. Morgan’s band was taken off at 9:03 pm and charged until 6:40 am, syncing over the home Wi-Fi, so it was at home, with no steps at all. The doorbell shows someone arriving home at 6:04 pm and the front door not opening again until 7:35 am. These fit Morgan’s account, but they don’t prove it: the band shows where the band was, not Morgan, and the doorbell only watches the front door and doesn’t identify anyone.',
      limitationExamples: [
        'A device is not a person: the band was at home, which doesn’t prove Morgan was.',
        'The doorbell only covers the front door; there is a back door and a garage.',
      ],
    },
    {
      id: 'q4-poster-photo',
      kind: 'verdict',
      prompt: 'Can the poster photo be trusted as a record of the team’s results?',
      claim: 'The poster photo is a reliable, unaltered record',
      acceptedVerdicts: ['not-supported'],
      keyEvidenceIds: ['poster-photo', 'intake-record'],
      distractorEvidenceIds: ['cleaning-roster'],
      modelAnswer:
        'Not supported. The photo’s SHA-256 hash no longer matches the hash in the intake record taken when it was collected at 7:40 am, so the file has changed since. Its metadata agrees: it was modified at 7:52 am with photo-editing software, after collection. The shared folder was left open, so someone could edit it. An altered photo can’t show what the team’s poster said.',
      limitationExamples: [
        'The hash shows the file changed, not what was changed or who changed it.',
        'Metadata can itself be edited, so the hash is the stronger check.',
      ],
    },
    {
      id: 'q5-what-happened',
      kind: 'open',
      prompt:
        'What most likely happened to Team 4’s results, who should be cleared, and what would you request next? Explain which requests are proportionate.',
      guidance: [
        'Explain how the file could be changed “from Morgan’s account” without Morgan.',
        'Say where the genuine results can be found.',
        'Say who should be cleared, and what the evidence still can’t tell you.',
        'Name two things you would request next, and explain why each is proportionate (or not).',
      ],
      modelAnswer:
        'Morgan signed in to StreamCloud on the shared Lab 2 laptop in class and never signed out. At 11:22 pm someone used that laptop in Lab 2 (door and motion sensor, laptop session log) to change the results, then cleared the browser history. Earlier, a fake “head judge” email from a new QuickPost account on the same college network made late changes seem allowed. The genuine results (+85%) are in version 4 of the file, saved from Morgan’s Chromebook at 6:25 pm, before the deadline. Team 4 should be cleared of changing the results, and the genuine version restored. The evidence does not show who did it: the account, laptop and network are shared. Next I would ask for the boarding house sign-in records and any corridor CCTV for 11 pm to midnight, and interview the boarders who use Lab 2. These are narrow in time and place. Asking for every Year 9 student’s emails and messages for a week would be disproportionate: too many people, too long, and mostly private.',
      keyPoints: [
        'The shared laptop was still signed in to Morgan’s account; account ≠ person',
        'The change was at 23:22 ACST (13:52 UTC), after the deadline',
        'The extension email was spoofed (QuickPost, Reply-To, SPF fail)',
        'The genuine results survive in the version history (6:25 pm)',
        'Team 4 should be cleared; the person responsible is not identified',
        'Narrow, time-limited next requests; the whole-year request is disproportionate',
      ],
    },
  ],

  extensions: [
    {
      id: 'reminder-email-route',
      title: 'Follow an email’s route',
      prompt:
        'Open the head judge’s Thursday morning reminder email and choose “Show original”. Using its Received lines, describe the email’s journey step by step, from the first computer to the school’s mail server. For each step, say which server passed it on, which server received it, the IP address and the time. Then explain one thing these headers cannot tell you.',
      evidenceIds: ['email-genuine'],
      guidance: [
        'Start with the bottom Received line: it is the first step of the journey.',
        'For each line: “from” is the server that sent it on, “by” is the server that received it.',
        'Work out how long the whole journey took, from the Date line to the top Received line.',
      ],
      modelAnswer: `Read bottom up. Step 1: office-pc-12.ntsciencefair.example (192.0.2.140) passed it to mail.ntsciencefair.example at 8:30:01 am ACST, so it left a computer in the fair’s office through the fair’s own mail server. Step 2: mail.ntsciencefair.example (192.0.2.25) passed it to mx1.${local.schoolEmailDomain}, the school’s incoming mail server, at 8:30:04 am. Sent at 8:30:00 am, it took about 4 seconds. The headers show which servers and networks handled it and when, but not who was typing at the office computer.`,
    },
    {
      id: 'intake-procedure',
      title: 'Design an evidence intake procedure',
      prompt:
        'Read Mr Osei’s evidence intake record. Write a step-by-step procedure (4 to 6 steps) the school could use the next time it collects digital evidence. For each step, explain how it protects the chain of custody, and explain the part hashing plays.',
      evidenceIds: ['intake-record'],
      guidance: [
        'Think about where a collected file should be kept, and who can change it there.',
        'Say when a hash should be calculated, where it is written down and when it is checked again.',
        'A chain-of-custody log records who handled an item, when and why.',
      ],
      modelAnswer:
        'A good answer includes: copy each item into locked, read-only storage as soon as it is collected, instead of leaving it in a folder anyone with the link can edit; calculate the SHA-256 hash at collection and record it with the time and the collector’s name; log every access or transfer (who, when, why) in a chain-of-custody record; work only from copies and re-check the hash before the item is used. A matching hash shows the file is unchanged since collection; a different hash shows it changed, but not what changed or who changed it.',
    },
  ],

  drops: [
    {
      id: 'drop-lab-sensor',
      title: 'Facilities sent a sensor log',
      notification:
        'The school’s facilities team has sent the Lab 2 door and motion sensor log for Thursday night. It is in Wearables & Smart Home.',
      triggers: [
        { type: 'afterEvidenceViewed', evidenceId: 'laptop-session' },
        { type: 'afterMinutes', minutes: 20 },
      ],
      delaySeconds: 5,
    },
  ],

  warrants: {
    available: 2,
    requests: [
      {
        id: 'warrant-laptop',
        title: 'Lab laptop session log',
        scope: `${local.school} IT: the sign-in and session log for LAB-LAPTOP-07, Thursday 17 September, 3:00 pm to midnight.`,
        targets: ['laptop-session'],
        proportionate: true,
        outcome:
          'Granted. One school-owned device, one evening, directly connected to the change. The log is now in the Evidence Locker.',
      },
      {
        id: 'warrant-quickpost',
        title: 'QuickPost sign-in record',
        scope:
          'QuickPost: sign-in records for hjudge.fair2026@quickpost.example, Thursday 17 September, 7:00 pm to 8:00 pm only.',
        targets: ['quickpost-signin'],
        proportionate: true,
        outcome:
          'Granted. One account that impersonated a judge, for one hour. It does not include the contents of any other emails. The record is now in the Evidence Locker.',
      },
      {
        id: 'warrant-year9',
        title: 'All Year 9 emails and messages',
        scope: 'Every email and message sent by every Year 9 student, Monday to Friday this week.',
        targets: ['year9-all-data'],
        proportionate: false,
        outcome:
          'Refused. That is around 120 young people and a whole week of private conversations, nearly all of it unrelated to one spreadsheet. Ask for something narrow: a device, an account or a place, for the hour that matters. Your warrant has not been used.',
      },
    ],
  },
});
