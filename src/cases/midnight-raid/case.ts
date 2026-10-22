/**
 * Case: The Midnight Raid (practice case before the assessment, about 35 minutes).
 * A raided snack box at camp, and a search history that seems to blame Kai.
 * Everything here is fictional. Centred on a phone's search history.
 *
 * Teacher summary of what really happened (Darwin time, ACST, UTC+9:30; no clock tricks):
 *  Wed 9 Sep, HRS Year 8 camp at the fictional Wangi Ridge Outdoor Education Centre,
 *  Litchfield National Park. Ruby forgot to return Cabin 4's snack box to the kitchen; it
 *  stayed on the verandah all night.
 *  20:15 Kai (phone, before hand-in) searches "what animals come out at night in litchfield".
 *  20:58 Kai's phone goes into the locked phone box (all Cabin 4 phones in by 21:00).
 *  22:10 Kai's StrideBand: asleep.
 *  23:05, 23:40, 23:42 At HOME in Palmerston, Kai's brother Finn (17) uses the family tablet,
 *        signed in to the Thornton family Lumen account: chemistry revision, "midnight snack
 *        ideas", "is it bad to eat cereal at midnight". Kai's phone browser uses the same
 *        account, so these searches appear in its history too (they synced when the phone
 *        was switched on in the morning).
 *  01:05-01:20 Kai's band: restless; 26 steps 01:09-01:12 (Kai got a drink of water).
 *  01:11, 01:13, 01:26, 01:31 Verandah motion light switches on (01:26 and 01:31 while
 *        Kai's band says asleep).
 *  01:12 Trail camera: grainy still, eye-shine near the verandah rail (can't tell what).
 *  01:27 Trail camera: a brushtail possum on the snack box lid (EVIDENCE DROP).
 *  06:30 Kai wakes. 06:45 Ruby finds the box raided. 07:02-07:06 phones returned.
 *  07:08 Ruby photographs the box. 07:10-07:21 Cabin 4 group chat; Kai is blamed.
 *  07:20 Kai searches "can possums open zip lock bags" (after the discovery).
 * A possum raided the box. Kai did not make the snack searches, and the band can't place
 * Kai anywhere. Locked data uses permission requests (asking Jo Thornton), not warrants.
 */
import { local } from '../../brand/local';
import { defineCase } from '../../engine/defineCase';
import { litchfieldLatLon as ll } from '../../engine/geo/litchfield';
import { meta } from './meta';
import trailcam0112 from './assets/trailcam-0112.svg';
import trailcam0127 from './assets/trailcam-0127.svg';
import photoSnackBox from './assets/photo-snack-box.svg';

const day = '2026-09-09';
const next = '2026-09-10';
const rec = (time: string) => `${day}T${time}`;
const recNext = (time: string) => `${next}T${time}`;

/** Every 15 minutes from 9:00 pm to 7:00 am: the band's reading times (41 of them). */
const bandTimes: string[] = [];
for (let m = 21 * 60; m <= 31 * 60; m += 15) {
  const hh = String(Math.floor(m / 60) % 24).padStart(2, '0');
  const mm = String(m % 60).padStart(2, '0');
  bandTimes.push(m < 24 * 60 ? rec(`${hh}:${mm}`) : recNext(`${hh}:${mm}`));
}
const bandSeries = (values: number[]) => values.map((value, i) => ({ at: bandTimes[i]!, value }));

/** Guided note shared by both search histories, so neither stands out. */
const historyGuide =
  'A “search” is something typed into the search box and a “visit” is a page that was opened, each with a time. The profile line at the top shows which account the browser is signed in to. A history is a record of what an account searched for: it does not say who was holding the device, or why they searched.';
/** Guided note shared by both statements. */
const statementGuide =
  'A statement is what a person says happened, in their own words. A statement can be honest and still be mistaken, and it can’t be checked on its own: look for records that agree or disagree with it.';
/** Guided note shared by both trail-camera stills. */
const trailcamGuide =
  'A trail camera is a wildlife camera that takes a photo when its sensor notices something warm moving in front of it. At night it uses an infrared flash, so the photos are black and white, and eyes that face the camera can shine brightly (eye-shine). The overlay time comes from the camera’s own clock. A trail camera only sees what is in its frame at the moment it takes a photo.';

export default defineCase({
  meta,
  timeZone: { label: 'ACST', utcOffset: '+09:30' },
  incident: {
    summary:
      'On Thursday morning, Cabin 4’s snack box was found raided on the verandah. Kai Thornton has been blamed because of a search on Kai’s phone.',
    location: 'Cabin 4, Wangi Ridge Outdoor Education Centre, Litchfield National Park',
    date: day,
    windowStart: '21:00',
    windowEnd: '06:45',
  },

  briefing: {
    from: {
      name: 'Dale Pritchard',
      role: 'Camp coordinator, Wangi Ridge Outdoor Education Centre',
    },
    subject: 'Cabin 4 snack box: a calm review',
    message: `Agent, ${local.scienceTeacher} tells me her Year 8 class at ${local.school} has been training as digital investigators. Something happened at camp last night, and I would like a calm, careful look at it.

On Thursday morning, Cabin 4’s snack box was found raided on the verandah: torn packets, a chewed bag and hot chocolate powder everywhere. It should have been in the kitchen overnight. Nobody was hurt, and nobody is in trouble for that.

The problem is that Kai Thornton is being blamed. Leo heard the cabin door in the night, and Zara saw “midnight snack ideas” in the search history on Kai’s phone when the phones came back. Kai says: “That wasn’t me.” The cabin is upset, and I want to get this right.

Kai and Kai’s parent, Jo Thornton, have agreed to share the history on Kai’s phone and Kai’s StrideBand log from camp night. We also have the centre’s own records: the phone box sheet, the verandah light and the wildlife camera on the track. Anything else belongs to someone else, so you will need to ask their permission, and ask only for what you need.

For every piece of evidence, ask yourself three things. What does it show? What does it not show? What further evidence would help decide between explanations?`,
    questionIds: ['q1-snack-search', 'q2-band', 'q3-animal', 'q4-fair-requests'],
  },

  people: [
    {
      id: 'kai-thornton',
      name: 'Kai Thornton',
      age: 14,
      role: `Cabin 4 (${local.schoolShort} Year 8 student)`,
      summary: 'Being blamed for the raid because of a search in Kai’s phone history.',
    },
    {
      id: 'ruby-halloran',
      name: 'Ruby Halloran',
      age: 14,
      role: `Cabin 4 (${local.schoolShort} Year 8 student)`,
      summary:
        'Looked after the cabin’s snack box and forgot to take it back to the kitchen. Found it raided.',
    },
    {
      id: 'leo-marsh',
      name: 'Leo Marsh',
      age: 14,
      role: `Cabin 4 (${local.schoolShort} Year 8 student)`,
      summary: 'Heard the cabin door in the night.',
    },
    {
      id: 'zara-quinn',
      name: 'Zara Quinn',
      age: 13,
      role: `Cabin 4 (${local.schoolShort} Year 8 student)`,
      summary: 'Saw “midnight snack ideas” in the history on Kai’s phone in the morning.',
    },
    {
      id: 'jo-thornton',
      name: 'Jo Thornton',
      role: 'Kai’s parent, at home in Palmerston',
      summary: 'Gave consent to share Kai’s phone history and band log from camp night.',
    },
    {
      id: 'finn-thornton',
      name: 'Finn Thornton',
      age: 17,
      role: 'Kai’s older brother (Year 12), at home in Palmerston',
      summary: 'Lives with Jo and Kai. Was at home on Wednesday night.',
    },
    {
      id: 'dale-pritchard',
      name: 'Dale Pritchard',
      role: 'Camp coordinator, Wangi Ridge Outdoor Education Centre',
      summary: 'Runs the camp and the phone box.',
    },
    {
      id: 'tess-wardell',
      name: 'Tess Wardell',
      role: 'Parks ranger',
      summary: 'Looks after the wildlife camera on the track beside the cabins.',
    },
  ],

  devices: [
    {
      id: 'kai-phone',
      ownerId: 'kai-thornton',
      type: 'phone',
      name: 'Kai’s phone',
      model: 'Nimbus N4',
    },
    {
      id: 'ruby-phone',
      ownerId: 'ruby-halloran',
      type: 'phone',
      name: 'Ruby’s phone',
      model: 'Lumo 11',
    },
    {
      id: 'family-tablet',
      ownerId: 'jo-thornton',
      type: 'tablet',
      name: 'Thornton family tablet',
      model: 'Nimbus Tab 8',
    },
    {
      id: 'kai-band',
      ownerId: 'kai-thornton',
      type: 'wearable',
      name: 'Kai’s StrideBand',
      model: 'StrideBand 3',
    },
    {
      id: 'verandah-light',
      ownerLabel: 'Wangi Ridge Outdoor Education Centre',
      type: 'smart-home',
      name: 'Cabin 4 verandah light',
      model: 'GlowSafe Motion Light',
    },
    {
      id: 'trail-cam',
      ownerLabel: 'Wangi Ridge Outdoor Education Centre',
      type: 'camera',
      name: 'Trail camera 02',
      model: 'TRAILCAM 02',
    },
  ],

  map: 'litchfield',
  mapMarkers: [
    // The centre is fictional; its pin matches the GPS in Ruby's photo.
    {
      id: 'camp',
      label: 'Wangi Ridge Outdoor Education Centre (camp)',
      kind: 'scene',
      at: ll(-13.165, 130.67),
    },
    {
      id: 'weather-station',
      label: 'Batchelor weather station',
      kind: 'place',
      at: ll(-13.055, 131.02),
    },
  ],

  evidence: [
    {
      id: 'statement-kai',
      type: 'document',
      app: 'locker',
      title: 'Kai’s statement',
      summary:
        'Kai handed the phone in before 9 pm, woke at about 1 am for a drink of water and went back to bed. Kai says the snack searches weren’t Kai’s.',
      source: 'Talk with Dale Pritchard, Thursday 8:00 am (Jo Thornton on speakerphone)',
      fields: [
        { label: 'Phone', value: 'Handed in to the phone box at about 8:58 pm' },
        {
          label: 'In the night',
          value:
            'Woke up thirsty at about 1 am. Got my water bottle from the shelf by the door, had a drink and went back to bed.',
        },
        { label: 'Went outside?', value: 'No. I didn’t go out on the verandah.' },
        { label: 'Snack box', value: 'Didn’t know it had been left outside.' },
      ],
      body: '“I never searched for midnight snacks. My phone was in the box all night. I don’t know how that search got on my phone.” Kai',
      guided: statementGuide,
      teacherNote:
        'Kai’s account. It can’t be checked on its own, but the band (26 steps at 1:09 to 1:12) fits a drink of water, and the phone box sheet fits the phone being away all night.',
    },
    {
      id: 'statement-jo',
      type: 'document',
      app: 'locker',
      title: 'Jo Thornton’s statement',
      summary:
        'The family tablet at home is signed in to the Thornton family Lumen account, and so is the browser on Kai’s phone. Finn often studies late.',
      source: 'Phone call with Dale Pritchard, Thursday 8:15 am',
      fields: [
        { label: 'Home', value: 'Palmerston' },
        {
          label: 'Family tablet',
          value: 'Kept in the living room. Signed in to the Thornton family Lumen account.',
        },
        {
          label: 'Kai’s phone',
          value: 'Its Lumen browser is signed in to the same family account.',
          note: 'Jo set this up so the family could share bookmarks.',
        },
        {
          label: 'Wednesday night',
          value:
            'I went to bed at about 10:30 pm. Finn told me in the morning about staying up to study chemistry on the tablet until about midnight.',
        },
      ],
      body: '“Finn is in Year 12 and often studies late before exams. I set up one family account years ago and never really thought about it.” Jo Thornton',
      guided: statementGuide,
      teacherNote:
        'Explains why the same searches can appear on two devices. Note that Jo was asleep: who used the tablet comes from what Finn said. The tablet history (by permission) backs it up.',
    },
    {
      id: 'phone-box-sheet',
      type: 'document',
      app: 'locker',
      title: 'Phone box sign-in sheet',
      summary:
        'Every Cabin 4 phone was signed in to the locked phone box by 9 pm and signed out between 7:02 and 7:06 am. Kai’s phone went in at 8:58 pm.',
      source: 'Wangi Ridge Outdoor Education Centre office',
      fields: [
        {
          label: 'Camp rule',
          value: 'Phones switched off and handed in by 9:00 pm; returned at 7:00 am.',
        },
        {
          label: 'Box',
          value: 'Locked by Dale Pritchard at 9:05 pm. Key kept in the camp office overnight.',
        },
        {
          label: 'Cabin 4 phones in (Wednesday)',
          value: 'Ruby 8:51 pm · Leo 8:54 pm · Zara 8:55 pm · Kai 8:58 pm',
        },
        {
          label: 'Cabin 4 phones out (Thursday)',
          value: 'Kai 7:02 am · Zara 7:03 am · Ruby 7:04 am · Leo 7:06 am',
        },
        { label: 'Box opened overnight?', value: 'No. Unlocked at 7:00 am.' },
      ],
      body: 'Each camper signs their own phone in and out, and a leader checks the phone is switched off before it goes in the box.',
      timeline: [
        { recorded: rec('20:58'), label: 'Kai’s phone signed in to the phone box' },
        { recorded: rec('21:05'), label: 'Phone box locked for the night' },
        { recorded: recNext('07:00'), label: 'Phone box unlocked' },
        { recorded: recNext('07:02'), label: 'Kai’s phone signed out of the phone box' },
      ],
      guided:
        'A sign-in sheet records when each item was handed in and taken back, and who checked it. It shows where the phone was supposed to be between those times. It is written by people, so it is only as good as the people filling it in and checking it.',
      teacherNote:
        'Key for Q1. Kai’s phone was switched off in a locked box from 8:58 pm to 7:02 am, so nobody could have typed a search on it at 11:40 pm. Limitation: a sheet can’t prove nobody opened the box, though the key was in the office.',
    },
    {
      id: 'history-kai-phone',
      type: 'browserHistory',
      app: 'browser',
      title: 'Kai’s phone: search history',
      summary:
        'The history on Kai’s phone includes “midnight snack ideas” at 11:40 pm, between a Year 12 chemistry search and a question about cereal.',
      source: 'Kai’s phone, shown by Kai with Jo Thornton’s consent',
      browser: 'Lumen Browser',
      profile: 'Thornton family (Lumen account)',
      deviceId: 'kai-phone',
      entries: [
        { at: rec('20:15'), kind: 'search', title: 'what animals come out at night in litchfield' },
        {
          at: rec('20:16'),
          kind: 'visit',
          title: 'Night animals of the Top End - Wild NT',
          url: 'https://wildnt.example/night-animals',
        },
        {
          at: rec('20:31'),
          kind: 'visit',
          title: 'Camp program: Day 3 - Wangi Ridge',
          url: 'https://wangiridge.example/program/day-3',
        },
        {
          at: rec('23:05'),
          kind: 'search',
          title: 'year 12 chemistry equilibrium practice questions',
        },
        {
          at: rec('23:06'),
          kind: 'visit',
          title: 'Equilibrium practice set 3 - ChemSkills',
          url: 'https://chemskills.example/equilibrium-3',
        },
        { at: rec('23:40'), kind: 'search', title: 'midnight snack ideas' },
        {
          at: rec('23:41'),
          kind: 'visit',
          title: '10 easy late-night snacks - Pantry Pal',
          url: 'https://pantrypal.example/late-night-snacks',
        },
        { at: rec('23:42'), kind: 'search', title: 'is it bad to eat cereal at midnight' },
        {
          at: rec('23:50'),
          kind: 'visit',
          title: 'Equilibrium practice set 3 - ChemSkills',
          url: 'https://chemskills.example/equilibrium-3',
        },
        { at: recNext('07:20'), kind: 'search', title: 'can possums open zip lock bags' },
        {
          at: recNext('07:21'),
          kind: 'visit',
          title: 'Living with possums - Wild NT',
          url: 'https://wildnt.example/possums',
        },
      ],
      note: 'This browser is signed in to the Thornton family Lumen account. An account’s history shows searches from every device signed in to it.',
      timeline: [
        {
          recorded: rec('20:15'),
          label: 'Kai’s phone history: search “what animals come out at night in litchfield”',
        },
        {
          recorded: rec('23:05'),
          label: 'Kai’s phone history: search “year 12 chemistry equilibrium practice questions”',
        },
        { recorded: rec('23:40'), label: 'Kai’s phone history: search “midnight snack ideas”' },
        {
          recorded: rec('23:42'),
          label: 'Kai’s phone history: search “is it bad to eat cereal at midnight”',
        },
        {
          recorded: recNext('07:20'),
          label: 'Kai’s phone history: search “can possums open zip lock bags”',
        },
      ],
      guided: historyGuide,
      teacherNote:
        'Key for Q1. The observation is that the account searched “midnight snack ideas” at 11:40 pm; the inference that Kai typed it is not supported. Clues: the family account profile, the Year 12 chemistry search, and the phone being in the box. The 7:20 am possum search comes after the discovery: wondering, not guilt.',
    },
    {
      id: 'history-family-tablet',
      type: 'browserHistory',
      app: 'browser',
      title: 'Family tablet: search history, 11 pm to midnight',
      summary:
        'The family tablet at home in Palmerston has the same searches at the same times: chemistry, “midnight snack ideas” and the cereal question.',
      source: 'Exported by Jo Thornton, with permission from Jo and Finn',
      lockedBy: 'warrant',
      browser: 'Lumen Browser',
      profile: 'Thornton family (Lumen account)',
      deviceId: 'family-tablet',
      entries: [
        {
          at: rec('23:05'),
          kind: 'search',
          title: 'year 12 chemistry equilibrium practice questions',
        },
        {
          at: rec('23:06'),
          kind: 'visit',
          title: 'Equilibrium practice set 3 - ChemSkills',
          url: 'https://chemskills.example/equilibrium-3',
        },
        { at: rec('23:40'), kind: 'search', title: 'midnight snack ideas' },
        {
          at: rec('23:41'),
          kind: 'visit',
          title: '10 easy late-night snacks - Pantry Pal',
          url: 'https://pantrypal.example/late-night-snacks',
        },
        { at: rec('23:42'), kind: 'search', title: 'is it bad to eat cereal at midnight' },
        {
          at: rec('23:50'),
          kind: 'visit',
          title: 'Equilibrium practice set 3 - ChemSkills',
          url: 'https://chemskills.example/equilibrium-3',
        },
      ],
      note: 'Exported using Lumen’s “This device only” view, which lists only what was typed on the tablet itself. Requested for 11:00 pm to midnight on Wednesday 9 September only.',
      timeline: [
        {
          recorded: rec('23:05'),
          label:
            'Family tablet (at home): search “year 12 chemistry equilibrium practice questions”',
        },
        { recorded: rec('23:40'), label: 'Family tablet (at home): search “midnight snack ideas”' },
        {
          recorded: rec('23:42'),
          label: 'Family tablet (at home): search “is it bad to eat cereal at midnight”',
        },
      ],
      guided: historyGuide,
      teacherNote:
        'Key for Q1. The same searches, typed on the tablet in Palmerston, over 100 km from camp by road. With Jo’s statement, it explains the history on Kai’s phone. The record shows the device; Jo’s statement (from Finn) says who was using it.',
    },
    {
      id: 'band-kai',
      type: 'wearableLog',
      app: 'wearables',
      title: 'Kai’s StrideBand log',
      summary:
        'Kai’s band estimates Kai was asleep from 10:10 pm, restless from 1:05 to 1:20 am (26 steps), then asleep again until 6:30 am.',
      source: 'StrideBand app export, shared by Kai with Jo Thornton’s consent',
      deviceId: 'kai-band',
      service: 'StrideBand',
      series: [
        {
          measure: 'steps',
          unit: 'steps in each 15 min',
          // prettier-ignore
          points: bandSeries([
            140, 85, 60, 22, // 9 pm
            6, 0, 0, 0, // 10 pm
            0, 0, 0, 0, // 11 pm
            0, 0, 0, 0, // midnight
            26, 0, 0, 0, // 1 am
            0, 0, 0, 0, // 2 am
            0, 0, 0, 0, // 3 am
            0, 0, 0, 0, // 4 am
            0, 0, 0, 0, // 5 am
            0, 0, 48, 230, // 6 am
            310, // 7 am
          ]),
        },
        {
          measure: 'heartRate',
          unit: 'bpm',
          // prettier-ignore
          points: bandSeries([
            92, 86, 80, 74, // 9 pm
            66, 61, 59, 58, // 10 pm
            57, 58, 56, 57, // 11 pm
            56, 55, 57, 56, // midnight
            74, 66, 58, 57, // 1 am
            55, 56, 54, 55, // 2 am
            54, 55, 56, 54, // 3 am
            55, 54, 56, 57, // 4 am
            56, 58, 57, 59, // 5 am
            61, 63, 70, 84, // 6 am
            90, // 7 am
          ]),
        },
      ],
      events: [
        {
          at: rec('22:10'),
          kind: 'other',
          event: 'Sleep: asleep',
          detail: 'Estimated by the band',
        },
        {
          at: recNext('01:05'),
          kind: 'other',
          event: 'Sleep: restless / awake',
          detail: 'Estimated by the band',
        },
        { at: recNext('01:09'), kind: 'other', event: 'Walking: 26 steps (1:09 to 1:12 am)' },
        {
          at: recNext('01:20'),
          kind: 'other',
          event: 'Sleep: asleep',
          detail: 'Estimated by the band',
        },
        {
          at: recNext('06:30'),
          kind: 'other',
          event: 'Sleep: awake',
          detail: 'Estimated by the band',
        },
      ],
      note: 'StrideBand counts steps from the swing of the wrist and measures heart rate. It estimates sleep from how little the wrist moves and how slow the heart rate is. It has no GPS and does not record where the wearer is.',
      timeline: [
        { recorded: rec('22:10'), deviceId: 'kai-band', label: 'Kai’s band: asleep (estimate)' },
        {
          recorded: recNext('01:05'),
          deviceId: 'kai-band',
          label: 'Kai’s band: restless / awake (estimate)',
        },
        { recorded: recNext('01:09'), deviceId: 'kai-band', label: 'Kai’s band: 26 steps' },
        {
          recorded: recNext('01:20'),
          deviceId: 'kai-band',
          label: 'Kai’s band: asleep again (estimate)',
        },
        {
          recorded: recNext('06:30'),
          deviceId: 'kai-band',
          label: 'Kai’s band: awake (estimate)',
        },
      ],
      guided:
        'Steps are counted in 15-minute blocks, and heart rate is in beats per minute (bpm). The band is a sensor on the wrist: it measures movement and heart beats, and works out (estimates) things like sleep from those measurements. The events list shows what the band decided was happening, not something a person saw.',
      teacherNote:
        'Key for Q2. Shows Kai was up briefly and took 26 steps: it fits a drink of water. It records nothing about location. “Asleep” is an estimate from stillness and heart rate.',
    },
    {
      id: 'motion-light',
      type: 'wearableLog',
      app: 'wearables',
      title: 'Cabin 4 verandah light log',
      summary:
        'The GlowSafe motion light on the Cabin 4 verandah switched on four times between 1:11 and 1:31 am.',
      source: 'Wangi Ridge Outdoor Education Centre (GlowSafe app)',
      deviceId: 'verandah-light',
      service: 'GlowSafe',
      events: [
        { at: rec('20:47'), kind: 'motion', event: 'Motion: light on for 60 seconds' },
        { at: rec('20:52'), kind: 'motion', event: 'Motion: light on for 60 seconds' },
        { at: rec('21:34'), kind: 'motion', event: 'Motion: light on for 60 seconds' },
        { at: recNext('01:11'), kind: 'motion', event: 'Motion: light on for 60 seconds' },
        { at: recNext('01:13'), kind: 'motion', event: 'Motion: light on for 60 seconds' },
        { at: recNext('01:26'), kind: 'motion', event: 'Motion: light on for 60 seconds' },
        { at: recNext('01:31'), kind: 'motion', event: 'Motion: light on for 60 seconds' },
        { at: recNext('06:44'), kind: 'motion', event: 'Motion: light on for 60 seconds' },
      ],
      note: 'The light switches on for 60 seconds when its sensor detects something warm moving within about 8 metres of the verandah: a person or an animal. It has no camera and does not record what set it off.',
      timeline: [
        {
          recorded: recNext('01:11'),
          deviceId: 'verandah-light',
          label: 'Verandah light switches on (motion)',
        },
        {
          recorded: recNext('01:13'),
          deviceId: 'verandah-light',
          label: 'Verandah light switches on (motion)',
        },
        {
          recorded: recNext('01:26'),
          deviceId: 'verandah-light',
          label: 'Verandah light switches on (motion)',
        },
        {
          recorded: recNext('01:31'),
          deviceId: 'verandah-light',
          label: 'Verandah light switches on (motion)',
        },
      ],
      guided:
        'A motion light has a sensor that notices warmth moving across in front of it, then switches the light on for a set time. The log only says when the light switched on. It can’t tell the difference between a person, an animal or anything else warm that moves.',
      teacherNote:
        'Key for Q2. 1:11 and 1:13 are close to Kai’s steps, but 1:26 and 1:31 happen while Kai’s band says asleep, and the trail camera shows a possum at 1:27. The light can’t say what moved. The evening switch-ons (8:47, 8:52 and 9:34 pm) are students and leaders coming and going before and after lights out; nobody needs to explain each one, which is a good point about ordinary “noise” in data.',
    },
    {
      id: 'trailcam-0112',
      type: 'cctvStill',
      app: 'cctv',
      title: 'Trail camera, 1:12 am',
      summary:
        'A grainy black-and-white night photo: two bright eye-shine dots and a dark shape near the Cabin 4 verandah rail.',
      source: 'Wangi Ridge centre office (copied from the trail camera on Thursday morning)',
      camera: 'TRAILCAM 02',
      location: 'Track beside Cabins 3 to 5, Wangi Ridge Outdoor Education Centre',
      deviceId: 'trail-cam',
      src: trailcam0112,
      alt: 'A grainy black-and-white infrared photo of a gravel track at night. At the right edge is part of a cabin verandah. On the verandah rail is a blurry dark shape with two small bright dots, like eyes reflecting the flash.',
      overlay: '2026-09-10 01:12:44',
      note: 'Centre office: the camera points along the track. The Cabin 4 verandah rail is at the right edge of the picture; the cabin door is out of view.',
      timeline: [
        {
          recorded: recNext('01:12:44'),
          deviceId: 'trail-cam',
          label: 'Trail camera: eye-shine and a dark shape near the verandah rail',
        },
      ],
      guided: trailcamGuide,
      teacherNote:
        'Can’t tell what it is: a deliberately unclear image. Viewing it triggers the drop with the clearer 1:27 am image.',
    },
    {
      id: 'trailcam-0127',
      type: 'cctvStill',
      app: 'cctv',
      title: 'Trail camera, 1:27 am',
      summary:
        'A clearer night photo: a brushtail possum sitting on the snack box lid, with a torn chip packet on the boards beside it.',
      source: 'Ranger Tess Wardell, from the trail camera’s memory card',
      releasedBy: 'drop-ranger-card',
      camera: 'TRAILCAM 02',
      location: 'Track beside Cabins 3 to 5, Wangi Ridge Outdoor Education Centre',
      deviceId: 'trail-cam',
      src: trailcam0127,
      alt: 'A black-and-white infrared photo of a cabin verandah at night. A furry animal with pointed ears and a bushy dark tail sits on the lid of a plastic tub. Its eyes shine in the flash. A torn chip packet lies on the boards beside the tub.',
      overlay: '2026-09-10 01:27:09',
      note: 'Ranger Tess Wardell: “That’s a common brushtail possum. These are the only two photos the camera took between midnight and 5 am.”',
      timeline: [
        {
          recorded: recNext('01:27:09'),
          deviceId: 'trail-cam',
          label: 'Trail camera: a brushtail possum on the snack box lid',
        },
      ],
      guided: trailcamGuide,
      teacherNote:
        'Key for Q3, and the evidence that changes the story. Shows a possum on the box at 1:27 am: one moment, not the whole night.',
    },
    {
      id: 'photo-snack-box',
      type: 'photo',
      app: 'photos',
      title: 'Ruby’s photo of the snack box',
      summary:
        'The snack box the next morning: torn packets, a chewed zip-lock bag, and small paw prints in spilled hot chocolate powder, with a teaspoon for scale.',
      source: 'Sent to Dale Pritchard by Ruby Halloran',
      src: photoSnackBox,
      alt: 'A daylight photo of wooden verandah boards. An open plastic tub with its blue lid pushed aside, two torn chip packets, a chewed zip-lock bag with a ragged edge, and a patch of spilled brown powder with four small paw prints, each with five toe marks. A teaspoon lies beside the prints for scale.',
      fileName: 'IMG_20260910_070822.jpg',
      metadata: [
        { label: 'DateTimeOriginal', value: '2026:09:10 07:08:22' },
        { label: 'OffsetTimeOriginal', value: '+09:30' },
        { label: 'Make', value: 'Lumo' },
        { label: 'Model', value: 'Lumo 11' },
        {
          label: 'GPS',
          value: '13° 09′ 54″ S, 130° 40′ 12″ E (Wangi Ridge Outdoor Education Centre)',
        },
      ],
      timeline: [
        {
          recorded: recNext('07:08:22'),
          deviceId: 'ruby-phone',
          label: 'Ruby photographs the raided snack box',
        },
      ],
      guided:
        'Metadata is information the phone saves inside the photo file. DateTimeOriginal is when the photo was taken, by the phone’s clock, and GPS is where the phone was. A photo shows how things looked when it was taken, which may be some time after they happened. An object of known size in the picture, like a teaspoon, helps you judge how big other things are.',
      teacherNote:
        'Key for Q3. Small five-toed prints about 3 cm long (compare the teaspoon) and a chewed bag fit the ranger’s description of a brushtail possum. Taken at 7:08 am, hours after the raid.',
    },
    {
      id: 'chat-cabin4',
      type: 'messageThread',
      app: 'messages',
      title: 'Cabin 4 group chat',
      summary:
        'Ruby asks who ate the snacks. Leo heard the door in the night, Zara saw “midnight snack ideas” on Kai’s phone, and Kai says it wasn’t Kai.',
      source: 'Shared by Ruby Halloran from Ruby’s phone',
      service: 'ChatterBox',
      deviceId: 'ruby-phone',
      participants: ['Ruby', 'Leo', 'Zara', 'Kai'],
      messages: [
        { from: 'Ruby', at: recNext('07:10'), body: 'WHO ATE OUR SNACKS', status: 'read' },
        {
          from: 'Ruby',
          at: recNext('07:11'),
          body: 'found the box like that at quarter to 7 when i went to brush my teeth 😭',
          status: 'read',
        },
        { from: 'Leo', at: recNext('07:14'), body: 'kai was up in the night, i heard the door' },
        {
          from: 'Zara',
          at: recNext('07:16'),
          body: 'and kai’s phone says “midnight snack ideas” lol i saw it when we got our phones back',
        },
        {
          from: 'Kai',
          at: recNext('07:18'),
          body: 'that wasn’t me!! my phone was in the box all night',
        },
        { from: 'Leo', at: recNext('07:19'), body: 'sorry kai, just saying what i heard' },
        {
          from: 'Ruby',
          at: recNext('07:21'),
          body: 'ok let’s work it out properly 🔍 also sorry i left the box out',
          status: 'read',
        },
      ],
      timeline: [
        {
          recorded: recNext('07:11'),
          deviceId: 'ruby-phone',
          label: 'Ruby: found the box raided at about 6:45 am',
        },
        {
          recorded: recNext('07:14'),
          deviceId: 'ruby-phone',
          label: 'Leo: “kai was up in the night, i heard the door”',
        },
        {
          recorded: recNext('07:16'),
          deviceId: 'ruby-phone',
          label: 'Zara: saw “midnight snack ideas” on Kai’s phone',
        },
        {
          recorded: recNext('07:18'),
          deviceId: 'ruby-phone',
          label: 'Kai: “that wasn’t me!! my phone was in the box all night”',
        },
      ],
      guided:
        'This is the group chat as saved on Ruby’s phone, so the times are on Ruby’s phone clock. Each message is what someone wrote at that moment: what they noticed, remembered or guessed. Hearing a door is an observation; who opened it is an inference.',
      teacherNote:
        'Shows how the blame started. Leo heard a door (observation), not who or why. Kai says the water bottle was on the shelf by the door, which could explain the sound, but nothing records whether the door was opened. This is deliberately left open. Zara saw the search in the history (observation) and assumed Kai typed it (inference). Use it to talk about observation vs inference.',
    },
    {
      id: 'ranger-note',
      type: 'document',
      app: 'locker',
      title: 'Ranger’s wildlife note',
      summary:
        'Brushtail possums are common around the cabins, active at night, and raid food left outside. Their front paw prints are about 3 to 4 cm long with five toes.',
      source: 'Ranger Tess Wardell, Litchfield National Park',
      fields: [
        { label: 'Animal', value: 'Common brushtail possum' },
        { label: 'When active', value: 'At night (nocturnal)' },
        {
          label: 'Around the cabins',
          value:
            'Common. Climbs onto verandahs and raids food left outside. Can chew through soft plastic bags and push loose lids off containers.',
        },
        {
          label: 'Front paw prints',
          value: 'About 3 to 4 cm long, with five toes spread out like a small hand',
        },
        {
          label: 'Advice',
          value: 'Keep all food in the kitchen overnight. Please don’t feed the possums.',
        },
      ],
      body: 'Bandicoots and the occasional feral cat also pass the cabins at night.',
      guided:
        'This note is from an expert who knows the area. It describes what is typical for an animal, which helps you compare it with what was found. A description of what usually happens is general knowledge: it doesn’t prove what happened on one particular night.',
      teacherNote:
        'Key for Q3. Lets students compare the paw prints and chewed bag with what possums do. Mentions other animals so students consider alternatives.',
    },
    {
      id: 'weather-record',
      type: 'document',
      app: 'locker',
      title: 'Overnight weather record',
      summary: 'A warm, clear night near Litchfield with light winds and no rain.',
      source: 'Top End Weather Service, Batchelor station (about 40 km from the centre)',
      fields: [
        { label: 'Date', value: 'Wednesday 9 to Thursday 10 September' },
        { label: '9:00 pm temperature', value: '27 °C' },
        { label: 'Lowest overnight', value: '20 °C at 6:10 am' },
        { label: 'Wind', value: 'Light south-easterly, 5 to 10 km/h' },
        { label: 'Rain', value: '0 mm' },
        { label: 'Sky', value: 'Clear' },
      ],
      guided:
        'A weather station records temperature, wind and rain at one place. Conditions a few kilometres away can be a little different.',
      teacherNote:
        'Distractor. The weather says nothing about who or what raided the box (no wind strong enough to blow a lid off, no rain).',
    },
    {
      id: 'camp-menu',
      type: 'document',
      app: 'locker',
      title: 'Camp menu and snack rules',
      summary: 'Wednesday’s camp menu and the rules for cabin snack boxes.',
      source: 'Wangi Ridge Outdoor Education Centre kitchen',
      fields: [
        { label: 'Wednesday dinner', value: 'Chicken wraps, salad, fruit salad and custard' },
        { label: 'Supper (8:15 pm)', value: 'Hot chocolate and biscuits in the dining hall' },
        {
          label: 'Cabin snack boxes',
          value: 'One per cabin. Returned to the kitchen by 8:30 pm each night.',
        },
        { label: 'Rule', value: 'All food stays in the kitchen overnight.' },
      ],
      guided:
        'This is a plan and a set of rules: what was meant to happen. It doesn’t record what actually happened that night.',
      teacherNote:
        'Distractor. A rule describes what should happen, not what did. It explains why the box shouldn’t have been outside, not who or what opened it.',
    },
    {
      id: 'kai-all-data',
      type: 'document',
      app: 'locker',
      title: 'All of Kai’s searches and messages (past year)',
      summary: 'Every search and message from Kai’s phone and the family account for a year.',
      source: 'Not obtained',
      lockedBy: 'warrant',
      fields: [{ label: 'Status', value: 'Not obtained' }],
      guided:
        'This would be a huge amount of someone’s private life. Think about whether it would answer the question about one night.',
      teacherNote:
        'Disproportionate: a whole year of a 14-year-old’s private searches and messages to answer a question about one night. Refused.',
    },
  ],

  questions: [
    {
      id: 'q1-snack-search',
      kind: 'verdict',
      prompt:
        'Does the 11:40 pm “midnight snack ideas” search show that Kai was awake at camp planning a snack?',
      claim: 'Kai searched for midnight snacks at camp at 11:40 pm',
      acceptedVerdicts: ['not-supported'],
      keyEvidenceIds: ['history-kai-phone', 'phone-box-sheet', 'history-family-tablet'],
      distractorEvidenceIds: ['weather-record', 'camp-menu'],
      nudge:
        'Read the profile line at the top of the history on Kai’s phone, then find out where Kai’s phone was at 11:40 pm.',
      hints: {
        correct:
          'Well reasoned. The search is in the history of the Thornton family account, which Kai’s phone shows. Kai’s phone was switched off in the locked phone box from 8:58 pm, and the family tablet at home in Palmerston has the same searches at the same times. A history shows what an account searched for, not who typed it or where.',
        verdict:
          'Whose account is Kai’s phone browser signed in to? And where was Kai’s phone at 11:40 pm?',
        byVerdict: {
          'strongly-supported':
            'The search really is in the history, but does a history show who typed a search, or where? Check the profile line and the phone box sheet.',
          possible:
            'Could anyone have typed it on Kai’s phone at 11:40 pm? Check the phone box sheet, and find out what else uses the same account.',
          'cant-tell':
            'There is evidence that settles this. Where was Kai’s phone at 11:40 pm, and is another device signed in to the same account?',
        },
        missingEvidence: {
          'history-kai-phone':
            'Attach the history on Kai’s phone: it is where the search was seen.',
          'phone-box-sheet': 'Where was Kai’s phone at 11:40 pm? Is there a record of it?',
          'history-family-tablet':
            'Is any other device signed in to the same account? You may need to ask permission for its history. Ask only for what the question needs.',
        },
        distractors: {
          'weather-record': 'Does the weather tell you anything about who typed a search?',
          'camp-menu': 'The camp’s food rules don’t tell you who made the search.',
        },
      },
      modelAnswer:
        'Not supported. The 11:40 pm search is in the history of the Thornton family Lumen account, which is what Kai’s phone browser shows. Kai’s phone was switched off and signed in to the locked phone box at 8:58 pm and not signed out until 7:02 am. The family tablet at home in Palmerston has the same searches at the same times (11:05, 11:40 and 11:42 pm), and Jo’s statement says Finn was studying late on it (a Year 12 chemistry search fits Finn, not a Year 8 student). The searches appeared on Kai’s phone because it uses the same account, which is why Zara saw them in the morning.',
      limitationExamples: [
        'A history shows an account’s searches, not who typed them.',
        'The tablet record shows the device; Jo’s statement says who was using it, and Jo was asleep, so that part comes from Finn.',
        'The phone box sheet shows when phones went in and out; it can’t prove nobody opened the box in the night.',
      ],
    },
    {
      id: 'q2-band',
      kind: 'verdict',
      prompt: 'Does Kai’s fitness band show that Kai went to the snack box in the night?',
      claim: 'Kai’s band places Kai at the snack box at about 1:10 am',
      acceptedVerdicts: ['not-supported', 'cant-tell'],
      keyEvidenceIds: ['band-kai', 'motion-light'],
      distractorEvidenceIds: ['weather-record', 'camp-menu'],
      nudge:
        'Make a list of what a fitness band can measure. Then compare the times in the band log with the times in the verandah light log.',
      hints: {
        correct:
          'Good thinking. The band counts steps and measures heart rate; it has no way of knowing where Kai was, and 26 steps fits a walk to a water bottle. The verandah light switched on at 1:11 and 1:13, but also at 1:26 and 1:31 while the band says Kai was asleep, so something else was moving out there too.',
        verdict:
          'What does a fitness band actually measure? Does it record where the wearer is? Compare the band’s times with the verandah light’s times.',
        byVerdict: {
          'strongly-supported':
            'The band shows Kai moving at about 1:09 to 1:12. Does anything in the band log say where? And what set the light off at 1:26 and 1:31?',
          possible:
            'Kai could have walked somewhere, but does the band show where? Check what the verandah light was doing while the band says Kai was asleep.',
        },
        missingEvidence: {
          'band-kai': 'Attach Kai’s band log: it is what the claim is about.',
          'motion-light':
            'Is there a sensor near the snack box? Compare its times with the band’s.',
        },
        distractors: {
          'weather-record': 'Does the weather tell you where Kai was?',
          'camp-menu': 'The snack rules don’t tell you what Kai’s band recorded.',
        },
      },
      modelAnswer:
        'Not supported (or can’t tell). The band shows Kai was restless from 1:05 to 1:20 am and took 26 steps between 1:09 and 1:12, which fits Kai’s account of getting a drink from a bottle by the door. The band has no GPS: it measures movement and heart rate, not location. The verandah light did switch on at 1:11 and 1:13, but also at 1:26 and 1:31, when the band estimated Kai was asleep, so something else was moving on the verandah. The light senses anything warm that moves, people or animals, so its switch-ons can’t be pinned on Kai.',
      limitationExamples: [
        '“Asleep” is the band’s estimate from movement and heart rate, not an observation: someone lying still could look asleep.',
        'The light shows that something warm moved, not what or who.',
        'Steps are counted from wrist movement, so the count is approximate.',
      ],
    },
    {
      id: 'q3-animal',
      kind: 'verdict',
      prompt: 'Was the snack box raided by an animal rather than a person?',
      claim: 'An animal raided the snack box',
      acceptedVerdicts: ['strongly-supported', 'possible'],
      keyEvidenceIds: ['trailcam-0127', 'photo-snack-box', 'ranger-note'],
      distractorEvidenceIds: ['weather-record', 'camp-menu'],
      nudge:
        'Look closely at every image from the night and the morning. Then think about who would know what lives around the cabins.',
      hints: {
        correct:
          'Yes. The 1:27 am trail-camera photo shows a brushtail possum on the snack box lid with a torn packet beside it. Ruby’s photo shows a chewed bag and small five-toed paw prints, and the ranger says possums here raid food left outside and chew through bags. Remember the camera shows one moment, not the whole night.',
        verdict:
          'Look again at all the images from that night and the next morning. What could leave small five-toed paw prints and chew through a zip-lock bag?',
        byVerdict: {
          'not-supported':
            'Look for signs of an animal. Is there a later trail-camera photo? Compare the paw prints with the ranger’s note.',
          'cant-tell':
            'The first trail-camera photo is unclear, but is it the only one? New evidence may have arrived. Then compare the paw prints with the ranger’s note.',
        },
        missingEvidence: {
          'trailcam-0127':
            'Is there a clearer trail-camera photo from later that night? It may arrive after you look at the first one.',
          'photo-snack-box':
            'Attach Ruby’s photo of the box: look closely at the prints and the bag.',
          'ranger-note':
            'Who would know which animals live at the centre and what their prints look like?',
        },
        distractors: {
          'weather-record': 'Could the weather have opened the box? Check the wind and rain.',
          'camp-menu':
            'The rule says where food should be, not what happened to it. It doesn’t help decide this.',
        },
      },
      modelAnswer:
        'Strongly supported (possible is also reasonable). The trail camera photographed a brushtail possum sitting on the snack box lid at 1:27 am with a torn chip packet beside it. Ruby’s photo shows a chewed zip-lock bag and small five-toed paw prints about 3 cm long (compared with the teaspoon), which match the ranger’s description of a brushtail possum’s front paws. The ranger says possums at the centre are active at night and raid food left outside. The verandah light switching on at 1:26 and 1:31 fits an animal moving about while Kai’s band said Kai was asleep. There is no evidence that a person opened the box.',
      limitationExamples: [
        'The camera shows the possum on the box at 1:27 am, not every moment of the night.',
        'A person could also have opened the box earlier; there is no evidence of that, but it can’t be ruled out completely.',
        'The paw prints were compared by eye with a description, not measured against a reference print.',
      ],
    },
    {
      id: 'q4-fair-requests',
      kind: 'open',
      prompt:
        'Mr Pritchard suggests asking for all of Kai’s search history for the past year “to see if Kai has done this before”. What further evidence would help settle what happened, and which requests would be fair?',
      guidance: [
        'One more piece of evidence that would help is … because …',
        'A fair request asks only for … because …',
        'Asking for a whole year of Kai’s history would / would not be fair because …',
      ],
      modelAnswer:
        'Helpful evidence: trail-camera photos from before midnight or after 5 am (the ranger says only two were taken between midnight and 5 am), checking the box lid and latch and the chewed bag for teeth marks, comparing the paw prints with a reference guide, and a calm talk with the cabin about what each person actually saw or heard. Asking Jo for one hour of the family tablet’s history was fair: it was narrow, about the exact time of the search, and the people it belonged to agreed. A year of Kai’s history and messages would not be fair: it is far more than the question needs, it is a 14-year-old’s private life, and old searches can’t show what happened on one night. To stop it happening again, food should stay in the kitchen overnight.',
      keyPoints: [
        'Names useful further evidence (more camera photos, the box and bag, a reference for paw prints, calm conversations)',
        'The one-hour tablet history was proportionate and had consent',
        'A year of history and messages is disproportionate and private',
        'Past searches can’t show what happened on one night',
        'Prevention: keep food in the kitchen',
      ],
    },
  ],

  drops: [
    {
      id: 'drop-ranger-card',
      title: 'Ranger checked the camera card',
      notification:
        'Ranger Tess Wardell has checked the trail camera’s memory card and sent one more photo from that night. It is in the CCTV app.',
      triggers: [
        { type: 'afterEvidenceViewed', evidenceId: 'trailcam-0112' },
        { type: 'afterMinutes', minutes: 10 },
      ],
      delaySeconds: 6,
    },
  ],

  extensions: [
    {
      id: 'ext-sleep-estimate',
      title: 'How does a band “know” you’re asleep?',
      prompt:
        'Kai’s band says Kai was asleep from 1:20 am. It never saw Kai sleeping: it worked this out from its measurements. Explain what the band measures and how it could estimate sleep from those measurements. Then describe two situations that could fool it into saying “asleep” when the wearer is awake, or “awake” when the wearer is asleep. How could you test how accurate the band is?',
      evidenceIds: ['band-kai'],
      guidance: [
        'The band measures … and … .',
        'It probably decides “asleep” when … .',
        'It could be fooled if … .',
        'To test it, I would compare the band with … .',
      ],
      modelAnswer:
        'The band measures wrist movement (from which it counts steps) and heart rate. It estimates sleep when the wrist barely moves for a while and the heart rate drops and stays steady (Kai’s fell to about 55 to 58 bpm). It could be fooled by someone lying very still while awake (thinking, listening), by a band worn loose or taken off, or by a restless sleeper who moves a lot and is marked “awake”. A fair test would compare the band with another method over several nights, such as a sleep diary, a video of the person sleeping, or a sleep-clinic measurement, and count how often they agree.',
    },
    {
      id: 'ext-paw-prints',
      title: 'Possum or cat?',
      prompt:
        'The ranger says bandicoots and feral cats also pass the cabins at night. What would you need to check to be confident that the paw prints in Ruby’s photo were made by a brushtail possum and not a cat? Think about measurements, comparisons and any other traces an animal might leave.',
      evidenceIds: ['photo-snack-box', 'ranger-note', 'trailcam-0127'],
      guidance: [
        'I would measure … using … .',
        'I would compare the prints with … .',
        'Other traces I would look for are … .',
      ],
      modelAnswer:
        'Measure the prints against an object of known size (the teaspoon, or better a ruler) and compare their length and shape with a reference guide to animal tracks: a brushtail possum’s front paw is about 3 to 4 cm with five spread toes, while a cat’s print shows four toes around a rounded pad. Count the toes on several prints, not just one. Look for other traces: hair caught on the bag or box, teeth marks (compare their width with a possum’s and a cat’s), droppings, and whether the animal could climb (cats and possums climb; bandicoots rarely do). The trail-camera photo at 1:27 am is also strong evidence. Asking the ranger to check the prints would be an expert second opinion.',
    },
    {
      id: 'ext-which-device',
      title: 'One search, two devices',
      prompt:
        'The same “midnight snack ideas” search appears in the history on Kai’s phone and on the family tablet. Without asking for anything more than you need, what record would tell you which device the search was actually typed on? Explain how that record would decide between the two explanations.',
      evidenceIds: ['history-kai-phone', 'history-family-tablet', 'phone-box-sheet'],
      guidance: [
        'One record that would show which device was used is … .',
        'If the search was typed on Kai’s phone, I would expect … .',
        'If it was typed on the tablet, I would expect … .',
      ],
      modelAnswer:
        'Lumen’s “This device only” view on each device would list only what was typed there, for the same hour; so would an activity record from Lumen for the family account showing which device each search came from, at 11:40 pm only. If the search was typed on Kai’s phone, it would appear in the phone’s own list and the phone would have been switched on at 11:40 pm (which the phone box sheet says it was not). If it was typed on the tablet, it would appear in the tablet’s own list but not the phone’s. The tablet export already shows it in the tablet’s own list. Asking for one hour keeps the request fair.',
    },
  ],

  warrants: {
    kind: 'permission',
    available: 1,
    requests: [
      {
        id: 'request-tablet-hour',
        title: 'Family tablet search history, 11 pm to midnight',
        scope:
          'Ask Jo Thornton for the search history on the Thornton family tablet for 11:00 pm to midnight on Wednesday 9 September only.',
        targets: ['history-family-tablet'],
        proportionate: true,
        outcome:
          'Jo Thornton: “Yes, that’s fine. That hour is Finn’s, not Kai’s: Finn was studying on the tablet. I asked Finn, and Finn is happy for you to see it too. I’ve sent just that hour.” The history is now in the Browser app.',
      },
      {
        id: 'request-kai-year',
        title: 'All of Kai’s search history and messages for the past year',
        scope:
          'Every search and every message from Kai’s phone and the Thornton family account over the past 12 months.',
        targets: ['kai-all-data'],
        proportionate: false,
        outcome:
          'Jo Thornton: “No, I won’t agree to that. It’s far more than you need. A whole year of a 14-year-old’s searches and messages is Kai’s private life, and almost none of it is about one night at camp. If you need something, ask about Wednesday night only.” Your request has not been used up.',
      },
    ],
  },
});
