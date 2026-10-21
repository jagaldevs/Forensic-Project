/**
 * Case: Where was Jamie? (Phase 3 flagship, about 40 minutes).
 * A missing-person timeline with a happy ending. Everything here is fictional.
 *
 * Teacher summary of what really happened (Darwin time, ACST):
 *  16:41 Jamie arrives at the Waterfront Wave Lagoon with friends.
 *  18:00 Cousin Ari photographs them (Ari's phone is still on Brisbane time, so it says 18:30).
 *  18:05 Lagoon gate camera: Jamie leaves.
 *  18:52 Jamie photographs the sunset at Cullen Bay marina.
 *  19:02 Cullen Bay boardwalk camera (its clock is 2 min fast, so it shows 19:04).
 *  19:12 Jamie asks Sasha to come over; phone on 3%.
 *  19:20 Jamie posts a CROPPED sunset photo; a friend comments "mindil??".
 *  19:24 Bus card taps on at Cullen Bay, Route 4 towards Parap.
 *  19:34 Phone's last network connection, near Parap. Battery dies.
 *  20:05 Parent's messages stop being delivered. Search goes to Mindil Beach.
 *  21:40 Jamie found safe at Sasha's home in Parap.
 */
import { defineCase } from '../../engine/defineCase';
import { meta } from './meta';
import cctvLagoon from './assets/cctv-lagoon-gate.svg';
import cctvCullen from './assets/cctv-cullen-boardwalk.svg';
import photoAri from './assets/photo-ari-lagoon.svg';
import sunsetOriginal from './assets/jamie-sunset-original.svg';
import sunsetCropped from './assets/jamie-sunset-cropped.svg';

const day = '2026-08-22';
const at = (time: string) => `${day}T${time}+09:30`;
const rec = (time: string) => `${day}T${time}`;

export default defineCase({
  meta,
  timeZone: { label: 'ACST', utcOffset: '+09:30' },
  incident: {
    summary:
      'Jamie Ellison, 14, did not come home on Saturday evening and could not be contacted. Jamie was found safe at 9:40 pm.',
    location: 'Darwin Waterfront, Cullen Bay and Parap',
    date: day,
    windowStart: '17:30',
    windowEnd: '21:00',
  },

  briefing: {
    from: { name: 'Detective Sergeant Leah Tran', role: 'Digital Evidence Unit' },
    subject: 'Case 26-0822: Where was Jamie? (review)',
    message: `First, the good news: Jamie is safe. Jamie was found at 9:40 pm on Saturday at a friend's house in Parap, tired, hungry and with a flat phone. Nobody was hurt and nobody is in trouble.

But it took us two hours to find Jamie, and our search team spent most of that time at Mindil Beach, which was the wrong place. I want to know why the evidence pointed us there, and what it could have told us if we had read it properly.

Jamie's parent, Casey, has given consent for us to look at Jamie's messages and photos from Jamie's cloud backup. Anything belonging to other people needs their consent or a warrant.

Some of the evidence seems to contradict itself. Before you decide someone is wrong, check how each device keeps time. The Timeline app will help.`,
    questionIds: ['q1-ari-photo', 'q2-mindil-post', 'q3-reach-parap', 'q4-search-plan'],
  },

  people: [
    {
      id: 'jamie-ellison',
      name: 'Jamie Ellison',
      age: 14,
      role: 'Missing on Saturday evening (found safe)',
      summary:
        'Went to the Waterfront Wave Lagoon with friends. Was due home in Nightcliff by 8 pm.',
    },
    {
      id: 'casey-ellison',
      name: 'Casey Ellison',
      role: "Jamie's parent",
      summary: 'Reported Jamie missing at 8:45 pm and gave consent to search Jamie’s cloud backup.',
    },
    {
      id: 'ari-ellison',
      name: 'Ari Ellison',
      age: 16,
      role: "Jamie's cousin, visiting from Brisbane",
      summary: 'Spent the afternoon at the lagoon and sent police a photo.',
    },
    {
      id: 'kit-lam',
      name: 'Kit Lam',
      age: 14,
      role: "Jamie's friend",
      summary: 'Was at the lagoon with Jamie.',
    },
    {
      id: 'elliot-barker',
      name: 'Elliot Barker',
      age: 14,
      role: "Jamie's friend",
      summary: 'Was at the lagoon and left at about 6 pm.',
    },
    {
      id: 'sasha-morales',
      name: 'Sasha Morales',
      age: 14,
      role: "Jamie's friend",
      summary: 'Lives in Parap. Not at the lagoon that day.',
    },
  ],

  devices: [
    {
      id: 'jamie-phone',
      ownerId: 'jamie-ellison',
      type: 'phone',
      name: "Jamie's phone",
      model: 'Nimbus N6',
    },
    {
      id: 'ari-phone',
      ownerId: 'ari-ellison',
      type: 'phone',
      name: "Ari's phone",
      model: 'Lumo 11',
      clock: { label: 'AEST (Brisbane)', utcOffset: '+10:00' },
    },
    { id: 'casey-phone', ownerId: 'casey-ellison', type: 'phone', name: "Casey's phone" },
    {
      id: 'cam-lagoon',
      ownerLabel: 'Waterfront venue operator',
      type: 'camera',
      name: 'Lagoon gate camera',
      model: 'WF-LAGOON-GATE-02',
    },
    {
      id: 'cam-cullen',
      ownerLabel: 'Cullen Bay marina management',
      type: 'camera',
      name: 'Cullen Bay boardwalk camera',
      model: 'CB-BOARDWALK-01',
    },
  ],

  mapMarkers: [
    {
      id: 'lagoon',
      label: 'Wave Lagoon gate, Waterfront',
      kind: 'place',
      at: { x: 19.3, y: 29.0 },
    },
    {
      id: 'cullen-boardwalk',
      label: 'Cullen Bay marina boardwalk',
      kind: 'place',
      at: { x: 17.5, y: 27.2 },
    },
    {
      id: 'mindil',
      label: 'Mindil Beach (where the search went)',
      kind: 'scene',
      at: { x: 15.5, y: 23.8 },
    },
    { id: 'sasha-home', label: "Sasha's home, Parap", kind: 'home', at: { x: 18.0, y: 21.7 } },
    {
      id: 'ellison-home',
      label: 'Ellison home, Nightcliff',
      kind: 'home',
      at: { x: 15.9, y: 13.7 },
    },
  ],

  evidence: [
    {
      id: 'statement-casey',
      type: 'document',
      app: 'locker',
      title: "Casey's statement",
      summary:
        'Jamie was due home by 8 pm, had a green backpack and a Nimbus N6 phone in a green case.',
      source: 'Statement to police, 8:45 pm',
      fields: [
        { label: 'Last saw Jamie', value: 'About 2:30 pm, leaving home in Nightcliff' },
        { label: 'Plan', value: 'Wave Lagoon at the Waterfront with Kit and Elliot, home by 8 pm' },
        { label: 'Wearing', value: 'Black shorts, white T-shirt, green backpack' },
        { label: "Jamie's phone", value: 'Nimbus N6 in a green case' },
      ],
      body: 'At about 8:30 I saw Jamie\'s post of a sunset, and Kit had commented "mindil??", so I told police Jamie was probably at Mindil Beach.',
      teacherNote:
        'Explains why the search went to Mindil: an assumption from a cropped photo and a friend’s guess in a comment. Also gives the phone model and backpack colour students need to rule out the distractor.',
    },
    {
      id: 'thread-group',
      type: 'messageThread',
      app: 'messages',
      title: 'Group chat: lagoon crew',
      summary:
        'Jamie, Kit and Elliot’s group chat. Jamie says they are going to Cullen Bay for sunset, then “on the bus to Sasha’s”.',
      source: "Jamie's NimbusCloud backup (accessed with Casey's consent)",
      service: 'ChatterBox',
      deviceId: 'jamie-phone',
      participants: ['Jamie', 'Kit', 'Elliot'],
      messages: [
        { from: 'Kit', at: rec('16:38'), body: 'here!! at the gate' },
        { from: 'Jamie', at: rec('16:41'), body: 'omw 2 min', status: 'read' },
        { from: 'Elliot', at: rec('17:55'), body: 'mum’s picking me up at 6, gotta go soon' },
        {
          from: 'Jamie',
          at: rec('18:02'),
          body: 'same, im gonna go watch the sunset at cullen bay 🌅',
          status: 'read',
          readAt: rec('18:03'),
        },
        { from: 'Kit', at: rec('18:03'), body: 'ok cya!!' },
        { from: 'Jamie', at: rec('18:20'), body: '', deleted: true, status: 'read' },
        {
          from: 'Jamie',
          at: rec('19:31'),
          body: 'on the bus to sashas. phone about to die 🪫',
          status: 'delivered',
        },
      ],
      timeline: [
        {
          recorded: rec('16:41'),
          deviceId: 'jamie-phone',
          label: 'Jamie: “omw” to the lagoon gate',
        },
        {
          recorded: rec('18:02'),
          deviceId: 'jamie-phone',
          label: 'Jamie: going to watch the sunset at Cullen Bay',
        },
        {
          recorded: rec('19:31'),
          deviceId: 'jamie-phone',
          label: 'Jamie: “on the bus to Sasha’s”, phone about to die',
        },
      ],
      teacherNote:
        'Says Cullen Bay, not Mindil, at 18:02. The last message is delivered but never read: everyone else had stopped looking. The deleted message is a deliberate red herring (it was a typo).',
    },
    {
      id: 'thread-sasha',
      type: 'messageThread',
      app: 'messages',
      title: 'Jamie and Sasha',
      summary: 'At 7:12 pm Jamie asks to come over to Sasha’s; Sasha says yes at 7:15.',
      source: "Jamie's NimbusCloud backup (accessed with Casey's consent)",
      service: 'ChatterBox',
      deviceId: 'jamie-phone',
      participants: ['Jamie', 'Sasha'],
      messages: [
        {
          from: 'Jamie',
          at: rec('19:12'),
          body: 'can i come to yours? phone on 3% and dont wanna go home yet',
          status: 'read',
          readAt: rec('19:14'),
        },
        { from: 'Sasha', at: rec('19:15'), body: 'yeh mum says ok 👍 we’re home' },
        { from: 'Jamie', at: rec('19:16'), body: 'sweet getting the bus', status: 'read' },
      ],
      timeline: [
        {
          recorded: rec('19:12'),
          deviceId: 'jamie-phone',
          label: 'Jamie asks to go to Sasha’s; phone on 3%',
        },
        { recorded: rec('19:15'), deviceId: 'jamie-phone', label: 'Sasha: “yeh mum says ok”' },
      ],
      teacherNote:
        'Shows intention to go to Parap, not that Jamie arrived. Combine with the bus tap and the tower record.',
    },
    {
      id: 'thread-casey',
      type: 'messageThread',
      app: 'messages',
      title: "Casey's messages to Jamie",
      summary:
        'From 8:05 pm, Casey’s messages are only “Sent”, never “Delivered”: Jamie’s phone was off.',
      source: "Casey's phone, shown to police",
      service: 'ChatterBox',
      deviceId: 'casey-phone',
      participants: ['Casey', 'Jamie'],
      messages: [
        {
          from: 'Casey',
          at: rec('17:30'),
          body: 'Have fun! Home by 8 please 😊',
          status: 'read',
          readAt: rec('17:31'),
        },
        { from: 'Jamie', at: rec('17:32'), body: 'ok!!' },
        { from: 'Casey', at: rec('20:05'), body: 'Are you on your way?', status: 'sent' },
        { from: 'Casey', at: rec('20:31'), body: 'Jamie please call me', status: 'sent' },
      ],
      timeline: [
        {
          recorded: rec('17:30'),
          deviceId: 'casey-phone',
          label: 'Casey: “Home by 8 please” (read)',
        },
        {
          recorded: rec('20:05'),
          deviceId: 'casey-phone',
          label: 'Casey’s message is sent but never delivered',
        },
      ],
      teacherNote:
        '“Sent” but not “Delivered” means the phone was off or offline. It fits the battery dying around 19:34.',
    },
    {
      id: 'cctv-lagoon',
      type: 'cctvStill',
      app: 'cctv',
      title: 'Lagoon gate CCTV',
      summary:
        'A person with a green backpack walks out of the Wave Lagoon gate. Frame stamped 18:05:41.',
      source: 'Supplied by the Waterfront venue operator',
      camera: 'WF-LAGOON-GATE-02',
      location: 'Wave Lagoon entry gate, Darwin Waterfront',
      deviceId: 'cam-lagoon',
      src: cctvLagoon,
      alt: 'A grainy high-angle security camera view of a lagoon entry gate. A teenager wearing a green backpack walks out through the gate, away from the camera. Two other people stand near the fence.',
      overlay: '2026-08-22 18:05:41',
      note: 'Operator: this camera’s clock is checked against internet time every week and is accurate to within a few seconds.',
      timeline: [
        {
          recorded: rec('18:05:41'),
          deviceId: 'cam-lagoon',
          label: 'Person with a green backpack leaves the lagoon gate',
        },
      ],
      teacherNote:
        'Reliable clock. Casey identified the backpack. On its own it looks like it contradicts Ari’s photo (stamped 18:30) until Ari’s phone settings arrive.',
    },
    {
      id: 'photo-ari',
      type: 'photo',
      app: 'photos',
      title: "Ari's photo at the lagoon",
      summary:
        'Jamie and two friends beside the Wave Lagoon. The metadata says 18:30, after the CCTV shows Jamie leaving.',
      source: "Sent to police by Ari Ellison (Jamie's cousin)",
      src: photoAri,
      fileName: 'IMG_20260822_183012.jpg',
      alt: 'Three teenagers with towels standing beside a wave lagoon in the late afternoon. The one in the middle has a green backpack and is smiling.',
      metadata: [
        { label: 'DateTimeOriginal', value: '2026:08:22 18:30:12' },
        {
          label: 'OffsetTimeOriginal',
          value: '(not recorded)',
          note: 'This phone model does not save its time zone in photos.',
        },
        { label: 'Make', value: 'Lumo' },
        { label: 'Model', value: 'Lumo 11' },
        { label: 'GPS', value: '12° 28′ 03″ S, 130° 50′ 46″ E (Darwin Waterfront)' },
      ],
      timeline: [
        {
          recorded: rec('18:30:12'),
          deviceId: 'ari-phone',
          label: 'Ari photographs Jamie with friends at the lagoon',
        },
      ],
      teacherNote:
        'The trap. Ari’s phone is still on Brisbane time (AEST), 30 minutes ahead. 18:30 AEST = 18:00 ACST, five minutes before the CCTV.',
    },
    {
      id: 'ari-settings',
      type: 'document',
      app: 'locker',
      title: "Ari's phone settings",
      summary:
        'Ari’s phone is set to Brisbane time (AEST, UTC+10:00), with automatic time zone switched off.',
      source: 'Screenshot sent by Ari Ellison the next morning',
      releasedBy: 'drop-ari-settings',
      fields: [
        { label: 'Set automatically', value: 'Off' },
        { label: 'Time zone', value: 'Brisbane (GMT+10:00)' },
        { label: '24-hour time', value: 'On' },
      ],
      body: '“I haven’t changed anything on my phone since we flew up from Brisbane on Wednesday.” Ari',
      teacherNote:
        'The key to Q1. Students should apply an AEST correction for Ari’s phone on the Timeline.',
    },
    {
      id: 'photo-jamie-original',
      type: 'photo',
      app: 'photos',
      title: "Jamie's sunset photo (original file)",
      summary:
        'The full, uncropped photo from Jamie’s backup. A Cullen Bay Marina sign is visible; GPS confirms Cullen Bay. Taken 6:52 pm.',
      source: "Jamie's NimbusCloud backup (accessed with Casey's consent)",
      releasedBy: 'drop-backup',
      src: sunsetOriginal,
      fileName: 'IMG_2214.jpg',
      alt: 'A sunset over the water at a marina. On the left are moored boats and a sign reading "Cullen Bay Marina".',
      metadata: [
        { label: 'DateTimeOriginal', value: '2026:08:22 18:52:30' },
        { label: 'OffsetTimeOriginal', value: '+09:30' },
        { label: 'Make', value: 'Nimbus' },
        { label: 'Model', value: 'Nimbus N6' },
        { label: 'GPS', value: '12° 27′ 05″ S, 130° 49′ 22″ E (Cullen Bay)' },
        { label: 'Software', value: 'Nimbus Camera 5.0' },
      ],
      timeline: [
        {
          recorded: rec('18:52:30'),
          deviceId: 'jamie-phone',
          label: 'Jamie takes the sunset photo at Cullen Bay (original file)',
        },
      ],
      teacherNote:
        'Original file: GPS and the sign both say Cullen Bay. Taken 28 minutes before it was posted.',
    },
    {
      id: 'post-jamie',
      type: 'socialPost',
      app: 'social',
      title: "Jamie's sunset post",
      summary:
        'Jamie posted a cropped sunset photo at 7:20 pm: “best view in darwin”. A friend commented “mindil??”.',
      source: "Jamie's PicPost account (accessed with Casey's consent)",
      platform: 'PicPost',
      author: 'Jamie Ellison',
      handle: '@jamie.e',
      postedAt: at('19:20:00'),
      body: 'best view in darwin 🌅',
      image: { src: sunsetCropped, alt: 'A sunset over calm water. No landmarks are visible.' },
      originalEvidenceId: 'photo-jamie-original',
      comments: [
        { author: 'Kit Lam', at: at('19:22:00'), body: 'mindil?? so jealous 😭' },
        { author: 'Elliot Barker', at: at('19:25:00'), body: '🔥🔥' },
      ],
      timeline: [
        { recorded: rec('19:20'), label: 'Jamie posts the cropped sunset photo on PicPost' },
      ],
      teacherNote:
        'Posted time is not taken time. The crop removes the marina sign, and Kit’s comment is a guess that nobody corrected.',
    },
    {
      id: 'post-kit',
      type: 'socialPost',
      app: 'social',
      title: "Kit's check-in",
      summary: 'Kit checked in at the Waterfront Wave Lagoon at 4:40 pm.',
      source: "Kit Lam's public PicPost account",
      platform: 'PicPost',
      author: 'Kit Lam',
      handle: '@kitlam',
      postedAt: at('16:40:00'),
      body: 'lagoon day with the crew 🌊',
      checkIn: 'Wave Lagoon, Darwin Waterfront',
      timeline: [{ recorded: rec('16:40'), label: 'Kit checks in at the Wave Lagoon' }],
    },
    {
      id: 'cctv-cullen',
      type: 'cctvStill',
      app: 'cctv',
      title: 'Cullen Bay boardwalk CCTV',
      summary:
        'A person with a green backpack on the Cullen Bay boardwalk, holding up a phone. Frame stamped 19:04:10.',
      source: 'Supplied by Cullen Bay marina management',
      camera: 'CB-BOARDWALK-01',
      location: 'Cullen Bay marina boardwalk',
      deviceId: 'cam-cullen',
      src: cctvCullen,
      alt: 'A grainy security camera view of a marina boardwalk at dusk. A teenager with a green backpack stands near the railing holding up a phone. Boats and masts are behind.',
      overlay: '2026-08-22 19:04:10',
      note: 'Operator: this camera’s clock runs about 2 minutes fast and hasn’t been corrected yet.',
      timeline: [
        {
          recorded: rec('19:04:10'),
          deviceId: 'cam-cullen',
          label:
            'Person with a green backpack on the Cullen Bay boardwalk (clock about 2 min fast)',
        },
      ],
      teacherNote:
        'Places someone matching Jamie at Cullen Bay after sunset. Also a reminder that clocks drift, not just time zones.',
    },
    {
      id: 'lost-property',
      type: 'document',
      app: 'locker',
      title: 'Lost property: phone at Mindil Beach',
      summary:
        'A phone was handed in at the Mindil Beach kiosk at 8:10 pm: a Lumo 9 in a blue case.',
      source: 'Mindil Beach kiosk lost property log',
      fields: [
        { label: 'Handed in', value: '8:10 pm, Saturday 22 August' },
        { label: 'Item', value: 'Phone: Lumo 9, blue case, cracked screen' },
        { label: 'Found', value: 'On the sand near the steps' },
      ],
      timeline: [
        { recorded: rec('20:10'), label: 'A phone (Lumo 9, blue case) handed in at Mindil Beach' },
      ],
      teacherNote: 'Distractor. Jamie’s phone is a Nimbus N6 in a green case (Casey’s statement).',
    },
    {
      id: 'bus-log',
      type: 'document',
      app: 'locker',
      title: 'Bus card log',
      summary:
        'Jamie’s concession card tapped on at 7:24 pm at Cullen Bay Marina stop, Route 4 towards Parap.',
      source: 'Top End Transit (obtained under warrant)',
      lockedBy: 'warrant',
      fields: [
        { label: 'Card', value: 'Concession card ending 4471, registered to Jamie Ellison' },
        { label: 'Tap on', value: '7:24 pm, Cullen Bay Marina stop, Route 4 towards Parap' },
        { label: 'Tap off', value: 'Not recorded (tapping off is not required on this route)' },
      ],
      timeline: [
        {
          recorded: rec('19:24'),
          label: 'Jamie’s bus card taps on at Cullen Bay, Route 4 towards Parap',
        },
      ],
      teacherNote:
        'Shows the card was used, not who used it, and not where they got off. Strong when combined with the messages.',
    },
    {
      id: 'tower-data',
      type: 'document',
      app: 'locker',
      title: 'Phone network records',
      summary:
        'Jamie’s phone last connected at 7:34 pm to a tower sector covering about 1.5 km around Parap. Nothing after that.',
      source: 'Mobile network provider (obtained under warrant)',
      lockedBy: 'warrant',
      fields: [
        { label: 'Period', value: '6:00 pm to 10:00 pm, Saturday 22 August' },
        { label: 'Last connection', value: '7:34 pm, sector PARAP-N2' },
        {
          label: 'Sector coverage',
          value: 'Roughly 1.5 km around Parap shops',
          note: 'Like IP geolocation, a tower sector is an area, not an exact spot.',
        },
        { label: 'After 7:34 pm', value: 'No further connections (phone switched off or flat)' },
      ],
      timeline: [
        { recorded: rec('19:34'), label: 'Jamie’s phone last connects to the network, near Parap' },
      ],
      teacherNote:
        'Puts the phone near Parap at 19:34, consistent with the bus. The search should have started in Parap.',
    },
    {
      id: 'friends-messages',
      type: 'document',
      app: 'locker',
      title: 'All of Jamie’s friends’ messages',
      summary: 'Every message sent by every one of Jamie’s friends in the past month.',
      source: 'Not obtained',
      lockedBy: 'warrant',
      fields: [{ label: 'Status', value: 'Not obtained' }],
      teacherNote:
        'Disproportionate: many people, a whole month, mostly private and irrelevant. Refused.',
    },
  ],

  questions: [
    {
      id: 'q1-ari-photo',
      kind: 'verdict',
      prompt:
        'Does Ari’s photo show that Jamie was still at the lagoon after the CCTV shows Jamie leaving?',
      claim: 'Ari’s photo shows Jamie at the lagoon after the CCTV shows Jamie leaving',
      acceptedVerdicts: ['not-supported'],
      keyEvidenceIds: ['photo-ari', 'cctv-lagoon', 'ari-settings'],
      distractorEvidenceIds: ['lost-property'],
      hints: {
        correct:
          'Exactly. Ari’s phone was still on Brisbane time (AEST), 30 minutes ahead of Darwin. Its 18:30 is 18:00 in Darwin, five minutes before the CCTV shows Jamie leaving. No contradiction at all.',
        verdict:
          'Before deciding which one is wrong, ask: how does each device keep time? Is there a record of how Ari’s phone was set up?',
        byVerdict: {
          'cant-tell':
            'There is a way to decide. Look for evidence about the clock on Ari’s phone, then try correcting it on the Timeline.',
          possible:
            'If the two times can be reconciled, is the claim still possible? Check Ari’s phone settings and the Timeline.',
        },
        missingEvidence: {
          'photo-ari': 'Attach Ari’s photo: its timestamp is what this question is about.',
          'cctv-lagoon':
            'Attach the lagoon gate CCTV, the other half of the apparent contradiction.',
          'ari-settings':
            'Is there evidence about how Ari’s phone clock was set? It may arrive after you look at the CCTV.',
        },
        distractors: {
          'lost-property': 'The lost phone at Mindil doesn’t tell you anything about Ari’s photo.',
        },
      },
      modelAnswer:
        'Not supported. Ari’s phone was set to Brisbane time (AEST, UTC+10:00), 30 minutes ahead of Darwin (ACST, UTC+9:30). Its timestamp of 18:30 is 18:00 Darwin time, five minutes before the CCTV shows Jamie leaving at 18:05. The two pieces of evidence agree.',
      limitationExamples: [
        'The photo metadata doesn’t record its time zone, so we rely on Ari’s screenshot of the settings.',
        'The CCTV shows someone with Jamie’s backpack; it doesn’t show their face.',
      ],
    },
    {
      id: 'q2-mindil-post',
      kind: 'verdict',
      prompt: 'Does Jamie’s sunset post show that Jamie was at Mindil Beach at sunset?',
      claim: 'Jamie’s post shows Jamie was at Mindil Beach at sunset',
      acceptedVerdicts: ['not-supported'],
      keyEvidenceIds: ['post-jamie', 'photo-jamie-original'],
      distractorEvidenceIds: ['lost-property'],
      hints: {
        correct:
          'Well done. The post was cropped, so it hid the Cullen Bay Marina sign, and the original file’s GPS says Cullen Bay. Kit’s “mindil??” was just a guess. And the post went up at 7:20 pm, 28 minutes after the photo was taken.',
        verdict:
          'What does the posted image actually show? Is there a fuller version of it somewhere, and what does its metadata say?',
        byVerdict: {
          'cant-tell':
            'There is evidence that settles this. Compare the post with the original file.',
        },
        missingEvidence: {
          'post-jamie': 'Attach Jamie’s post itself.',
          'photo-jamie-original':
            'Social apps often crop photos and strip GPS. Is the original file available? Jamie’s backup may help (keep investigating).',
        },
        distractors: {
          'lost-property':
            'A phone was found at Mindil, but check Casey’s statement: is it Jamie’s phone? Same model, same case colour?',
        },
      },
      modelAnswer:
        'Not supported. The posted image was cropped. The original file shows a Cullen Bay Marina sign and its GPS places it at Cullen Bay. “Mindil??” was a friend’s guess. The post was published at 7:20 pm but the photo was taken at 6:52 pm, so the post time isn’t when Jamie was there either.',
      limitationExamples: [
        'GPS shows where the phone was, not who held it.',
        'The original only shows where Jamie was at 6:52 pm, not where Jamie went next.',
      ],
    },
    {
      id: 'q3-reach-parap',
      kind: 'verdict',
      prompt: 'Could Jamie have reached Sasha’s home in Parap by 8 pm?',
      claim: 'Jamie could have reached Sasha’s home in Parap by 8 pm',
      acceptedVerdicts: ['possible', 'strongly-supported'],
      keyEvidenceIds: ['bus-log', 'thread-sasha'],
      distractorEvidenceIds: ['lost-property'],
      hints: {
        correct:
          'Good reasoning. Jamie’s card tapped onto a bus towards Parap at 7:24 pm, and the Map’s estimate for that bus trip is roughly 20 to 40 minutes, so arriving by about 8 pm fits. Jamie had also arranged it with Sasha. Remember the tap shows the card was used, not who used it.',
        verdict:
          'Use the Map’s travel-time calculator. Is there a record of Jamie leaving Cullen Bay, and of where Jamie was heading?',
        byVerdict: {
          'not-supported':
            'Try the travel-time calculator from Cullen Bay to Parap by bus. Does the timing really rule it out?',
          'cant-tell':
            'There is evidence of how and when Jamie left Cullen Bay, but you may need a warrant for it. Then check the travel time.',
        },
        missingEvidence: {
          'bus-log':
            'Is there a record of Jamie’s journey? Transport records need a warrant. Is it proportionate here?',
          'thread-sasha': 'Where was Jamie planning to go? Check Jamie’s messages.',
        },
        distractors: {
          'lost-property': 'The phone at Mindil isn’t Jamie’s: wrong model and case colour.',
        },
      },
      modelAnswer:
        'Possible, even likely. Jamie asked Sasha at 7:12 pm and Sasha agreed. Jamie’s bus card tapped on at Cullen Bay at 7:24 pm on a route towards Parap, and a bus trip of roughly 20 to 40 minutes would arrive around 7:45 to 8:05 pm. The phone’s last connection near Parap at 7:34 pm fits. But the card and phone show devices, not Jamie, and there is no record of where Jamie got off.',
      limitationExamples: [
        'The bus tap shows the card was used, not who used it.',
        'There is no tap-off, so we don’t know where the passenger got off.',
        'Travel times are estimates.',
      ],
    },
    {
      id: 'q4-search-plan',
      kind: 'open',
      prompt:
        'Using your Timeline, explain where the search should have started and why the evidence pointed to Mindil Beach instead. What data was needed, and how could police get it fairly?',
      guidance: [
        'Summarise Jamie’s evening as a short timeline (use the Timeline app).',
        'Explain the two things that misled people: the cropped post and the time zone mix-up.',
        'Say which data helped most, and whether it needed consent or a warrant, and why.',
      ],
      modelAnswer:
        'Jamie left the lagoon at 6:05 pm, watched the sunset at Cullen Bay (photo 6:52 pm), arranged to go to Sasha’s at 7:12 pm, caught a bus towards Parap at 7:24 pm, and the phone died near Parap at about 7:34 pm. The search should have started in Parap. People were misled by a cropped photo plus a friend’s guess (“mindil??”), and by Ari’s photo appearing to put Jamie at the lagoon later than they really were. Jamie’s own messages and photos could be checked with a parent’s consent; the bus and phone network records needed narrow, time-limited warrants. Reading all of Jamie’s friends’ messages would have been disproportionate.',
      keyPoints: [
        'An accurate timeline ending near Parap around 7:30 to 8 pm',
        'The cropped post and Kit’s comment led to Mindil',
        'Ari’s phone on AEST made a false contradiction',
        'Consent covered Jamie’s data; other people’s data needed narrow warrants',
        'Broad requests (all friends’ messages) are disproportionate',
      ],
    },
  ],

  drops: [
    {
      id: 'drop-ari-settings',
      title: 'Ari sent a screenshot',
      notification:
        'Ari has sent a screenshot of their phone’s Date & Time settings. It is in the Evidence Locker.',
      triggers: [
        { type: 'afterEvidenceViewed', evidenceId: 'cctv-lagoon' },
        { type: 'afterMinutes', minutes: 12 },
      ],
      delaySeconds: 6,
    },
    {
      id: 'drop-backup',
      title: 'Backup finished syncing',
      notification:
        'Jamie’s NimbusCloud backup has finished syncing. One original photo was recovered. It is in Photos.',
      triggers: [
        { type: 'afterEvidenceViewed', evidenceId: 'post-jamie' },
        { type: 'afterMinutes', minutes: 10 },
      ],
      delaySeconds: 5,
    },
  ],

  warrants: {
    available: 2,
    requests: [
      {
        id: 'warrant-bus',
        title: 'Bus card log',
        scope:
          'Top End Transit tap records for the concession card registered to Jamie Ellison, Saturday 22 August, 5:00 pm to 10:00 pm.',
        targets: ['bus-log'],
        proportionate: true,
        outcome:
          'Granted. A missing 14-year-old, one card, one evening. The log is now in the Evidence Locker.',
      },
      {
        id: 'warrant-tower',
        title: 'Phone network records',
        scope:
          'Which network towers Jamie’s phone connected to between 6:00 pm and 10:00 pm on Saturday 22 August.',
        targets: ['tower-data'],
        proportionate: true,
        outcome:
          'Granted. The request is limited to the time Jamie was missing. The records are now in the Evidence Locker.',
      },
      {
        id: 'warrant-friends',
        title: 'All of Jamie’s friends’ messages',
        scope: 'Every message sent by Kit, Elliot, Sasha and Ari over the past month.',
        targets: ['friends-messages'],
        proportionate: false,
        outcome:
          'Refused. That covers four young people and a whole month of private conversations. Most of it has nothing to do with Saturday evening. Ask the friends directly, or request something narrow and specific. Your warrant has not been used.',
      },
    ],
  },
});
