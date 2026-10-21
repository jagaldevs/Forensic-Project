/**
 * Case: The Waterfront Alibi (Phase 1 mini case, about 25 minutes).
 * Everything here is fictional. IPs use documentation ranges; MACs are locally administered.
 */
import { defineCase } from '../../engine/defineCase';
import { meta } from './meta';
import photoGaming from './assets/photo-gaming-setup.svg';
import photoFoyer from './assets/photo-foyer-witness.svg';

const at = (time: string) => `2026-08-14T${time}+09:30`;

export default defineCase({
  meta,
  timeZone: { label: 'ACST', utcOffset: '+09:30' },
  incident: {
    summary:
      'The Top End Robotics Cup trophy vanished from its display in the convention centre foyer.',
    location: 'Harbourside Convention Centre foyer, Darwin Waterfront',
    date: '2026-08-14',
    windowStart: '19:30',
    windowEnd: '20:15',
  },

  briefing: {
    from: { name: 'Detective Sergeant Leah Tran', role: 'Digital Evidence Unit' },
    subject: 'Case 26-0814: The Waterfront Alibi',
    message: `Agent, thanks for coming in at short notice.

On Friday 14 August, the Top End Robotics Cup trophy disappeared from its display in the foyer of the Harbourside Convention Centre at the Waterfront. Staff last saw it at 7:30 pm. By 8:15 pm it was gone.

Riley Okafor, 19, volunteered at the event and set up the display that afternoon. Riley says he left at 5:30 pm and spent the whole evening gaming at home in Palmerston.

One of my team ran a quick check. Riley's StreamCloud account logged in at 7:52 pm from IP address 203.0.113.47, and a free lookup website put that address in Darwin City, right near the Waterfront. Some people here think that settles it.

I'm not so sure. Test that claim properly. Tell me what the evidence shows, what it doesn't show, and what we would need to know to be certain.

You have two warrants for this case. Use them wisely: a magistrate will only grant a request that is necessary and proportionate.`,
    questionIds: ['q1-ip-location', 'q2-at-home', 'q3-photo-identity', 'q4-next-steps'],
  },

  people: [
    {
      id: 'riley-okafor',
      name: 'Riley Okafor',
      age: 19,
      role: 'Event volunteer (person of interest)',
      summary:
        'Set up the trophy display on Friday afternoon. Says he left at 5:30 pm and was gaming at home all evening.',
    },
    {
      id: 'sam-okafor',
      name: 'Sam Okafor',
      age: 14,
      role: "Riley's younger brother",
      summary: 'Lives at the Okafor home in Palmerston.',
    },
    {
      id: 'grace-okafor',
      name: 'Grace Okafor',
      role: "Riley and Sam's parent",
      summary: 'Worked a late shift on Friday and got home at about 10:30 pm.',
    },
    {
      id: 'kai-mendes',
      name: 'Kai Mendes',
      age: 19,
      role: "Riley's friend",
      summary: 'Received a photo from Riley on Friday evening.',
    },
    {
      id: 'jordan-pike',
      name: 'Jordan Pike',
      role: 'Visitor at the convention centre',
      summary: 'Took a photo in the foyer on Friday evening and sent it to police.',
    },
    {
      id: 'ada-brennan',
      name: 'Ada Brennan',
      role: 'Event coordinator',
      summary: 'Reported the trophy missing at 8:15 pm.',
    },
  ],

  devices: [
    {
      id: 'riley-laptop',
      ownerId: 'riley-okafor',
      type: 'laptop',
      name: 'RILEY-LAPTOP',
      mac: '02:5A:31:7C:11:04',
    },
    {
      id: 'riley-phone',
      ownerId: 'riley-okafor',
      type: 'phone',
      name: "Riley's phone",
      model: 'Nimbus N8 Lite',
    },
    {
      id: 'sam-phone',
      ownerId: 'sam-okafor',
      type: 'phone',
      name: 'SAM-PHONE',
      mac: '02:5A:31:7C:22:9E',
    },
    {
      id: 'okafor-tv',
      ownerId: 'grace-okafor',
      type: 'other',
      name: 'OKAFOR-TV',
      mac: '02:5A:31:7C:30:12',
    },
    {
      id: 'okafor-router',
      ownerId: 'grace-okafor',
      type: 'router',
      name: 'TopNet HomeHub',
      mac: '02:5A:31:7C:00:01',
    },
  ],

  mapMarkers: [
    { id: 'scene', label: 'Convention centre (scene)', kind: 'scene', at: { x: 20.1, y: 29.0 } },
    { id: 'okafor-home', label: 'Okafor home', kind: 'home', at: { x: 35.9, y: 35.1 } },
  ],

  evidence: [
    {
      id: 'login-streamcloud',
      type: 'loginRecord',
      app: 'locker',
      title: 'StreamCloud login record',
      summary: "Riley's StreamCloud account logged in at 7:52 pm from IP address 203.0.113.47.",
      source: 'Supplied by StreamCloud to investigators',
      service: 'StreamCloud',
      account: 'rileyo (Riley Okafor)',
      events: [
        { at: at('19:52:07'), event: 'Login successful (saved password)', ip: '203.0.113.47' },
        { at: at('19:53:30'), event: 'Game stream started: Orbit Rally', ip: '203.0.113.47' },
        { at: at('23:16:41'), event: 'Game stream ended', ip: '203.0.113.47' },
      ],
      note: 'This summary does not include session or device details. StreamCloud keeps those separately.',
      teacherNote:
        'The record shows the account was used from 203.0.113.47. It says nothing about who was using it or where they physically were. The "saved password" detail hints that anyone on that computer could log in.',
    },
    {
      id: 'ip-203-0-113-47',
      type: 'ipRecord',
      app: 'iplookup',
      title: 'IP lookup: 203.0.113.47',
      summary:
        'TopNet address. Estimated location "Darwin (regional hub)" with an accuracy radius of about 25 km.',
      source: 'IP geolocation database (lab copy)',
      ip: '203.0.113.47',
      isp: 'TopNet',
      network: 'TopNet Home Fibre: Top End residential pool',
      locationLabel: 'Darwin (regional hub)',
      accuracyRadiusKm: 25,
      centre: { x: 18.6, y: 27.4 },
      note: 'Geolocation databases estimate a location from where an internet provider registers or routes a block of addresses, often a regional hub. They do not know where a device actually is. TopNet routes home connections across the Top End through its Darwin City hub.',
      teacherNote:
        'The pin lands in Darwin City, which is why it looks damning. The 25 km radius covers the Waterfront AND Palmerston (and most of the region), so the lookup cannot separate the two.',
    },
    {
      id: 'router-log-okafor',
      type: 'networkLog',
      app: 'netlog',
      title: 'Okafor home router log',
      summary:
        "The Okafor home router's public IP was 203.0.113.47. RILEY-LAPTOP was online 6:58 pm to 11:20 pm.",
      source: 'TopNet HomeHub at the Okafor home (obtained under warrant)',
      lockedBy: 'warrant',
      routerName: 'TopNet HomeHub',
      household: 'Okafor home, Palmerston',
      publicIp: '203.0.113.47',
      logDate: '2026-08-14',
      sessions: [
        {
          deviceName: 'SAM-PHONE',
          deviceId: 'sam-phone',
          mac: '02:5A:31:7C:22:9E',
          connected: at('15:47:12'),
          disconnected: at('23:41:05'),
        },
        {
          deviceName: 'OKAFOR-TV',
          deviceId: 'okafor-tv',
          mac: '02:5A:31:7C:30:12',
          connected: at('17:05:40'),
          disconnected: at('22:10:18'),
        },
        {
          deviceName: 'RILEY-LAPTOP',
          deviceId: 'riley-laptop',
          mac: '02:5A:31:7C:11:04',
          connected: at('18:58:33'),
          disconnected: at('23:20:09'),
        },
      ],
      note: "A router logs devices, not people. Riley's phone does not appear in this log.",
      teacherNote:
        "Key evidence. The IP in the login record is the Okafor home connection, which explains the 7:52 pm login without Riley being at the Waterfront. But SAM-PHONE was online all evening: Sam was home and could have used the laptop or the account. Riley's phone is absent, which could mean mobile data, wi-fi off, or not being home. Good discussion point.",
    },
    {
      id: 'photo-gaming-setup',
      type: 'photo',
      app: 'photos',
      title: 'Photo A: gaming setup',
      summary:
        'Photo Riley sent to his friend Kai as "proof" he was home. Taken 8:01 pm. GPS data removed.',
      source: "Riley's message to Kai Mendes, provided voluntarily by Kai",
      src: photoGaming,
      fileName: 'chatterbox_img_0814_2002.jpg',
      alt: 'A dim bedroom gaming setup at night: a monitor showing a racing game, a keyboard with coloured lights, headphones on a stand, and a dark window. No people are visible.',
      metadata: [
        { label: 'DateTimeOriginal', value: '2026:08:14 20:01:37' },
        { label: 'OffsetTimeOriginal', value: '+09:30' },
        { label: 'Make', value: 'Nimbus' },
        { label: 'Model', value: 'Nimbus N8 Lite' },
        { label: 'Image size', value: '1600 × 1200' },
        {
          label: 'GPS',
          value: 'GPS data removed (shared via messaging app)',
          note: 'ChatterBox strips location data from photos when they are sent. This is normal and is not suspicious in itself, but it means the photo cannot tell us where it was taken.',
        },
        { label: 'Software', value: 'ChatterBox 6.2 (re-compressed on send)' },
      ],
      teacherNote:
        'Fits the alibi but does not prove it. Time comes from the phone clock. No GPS. No person in frame. It shows that the phone was pointed at a gaming setup at 8:01 pm, not who held it or which room it was.',
    },
    {
      id: 'photo-foyer-witness',
      type: 'photo',
      app: 'photos',
      title: 'Photo B: foyer witness photo',
      summary:
        'Photo from a visitor in the foyer. Taken 8:06 pm at the Waterfront. Shows a person in a dark hoodie near the display; face not visible.',
      source: 'Sent to police by Jordan Pike, a visitor at the event',
      releasedBy: 'drop-witness-photo',
      src: photoFoyer,
      fileName: 'IMG_20260814_200612.jpg',
      alt: 'A convention centre foyer at night. A person in a dark hooded jumper stands with their back to the camera beside a glass display case under a "Top End Robotics Cup" banner. Their face is not visible. The image is slightly blurred.',
      metadata: [
        { label: 'DateTimeOriginal', value: '2026:08:14 20:06:12' },
        { label: 'OffsetTimeOriginal', value: '+09:30' },
        { label: 'Make', value: 'Lumo' },
        { label: 'Model', value: 'Lumo 12' },
        { label: 'Image size', value: '4032 × 3024' },
        {
          label: 'GPS',
          value: '12° 28′ 06″ S, 130° 50′ 44″ E (±8 m)',
          note: 'Darwin Waterfront precinct',
        },
        { label: 'Software', value: 'None (original file from the camera)' },
      ],
      teacherNote:
        'Places someone at the scene at 8:06 pm, inside the incident window. Identity cannot be established: back to camera, common clothing. A classic case of a "match" (dark hoodie, similar build) not being proof.',
    },
    {
      id: 'weather-record',
      type: 'document',
      app: 'locker',
      title: 'Weather record, Friday evening',
      summary: 'Clear, dry evening in Darwin. 27 °C at 6 pm, 24 °C at 9 pm. No rain.',
      source: 'Top End Weather Service observations',
      fields: [
        { label: 'Date', value: 'Friday 14 August 2026' },
        { label: '6:00 pm', value: '27 °C, clear, light north-easterly' },
        { label: '9:00 pm', value: '24 °C, clear' },
        { label: 'Rainfall', value: '0 mm' },
        { label: 'Sunset', value: '6:47 pm' },
      ],
      teacherNote: 'Distractor. It is irrelevant to where Riley was or who used the account.',
    },
    {
      id: 'phone-location-riley',
      type: 'document',
      app: 'locker',
      title: "Riley's phone: complete location history",
      summary:
        "Every location record from Riley's phone for the last 12 months, plus photos and messages.",
      source: 'Not obtained',
      lockedBy: 'warrant',
      fields: [{ label: 'Status', value: 'Not obtained' }],
      teacherNote:
        'Students should recognise this as disproportionate. Applying for it is refused (no warrant used). Good answers to Q4 suggest a narrow time-limited request instead.',
    },
  ],

  questions: [
    {
      id: 'q1-ip-location',
      kind: 'verdict',
      prompt: 'Does the IP login place Riley at the Waterfront at 7:52 pm?',
      claim: 'The IP login places Riley at the Waterfront at 7:52 pm',
      acceptedVerdicts: ['not-supported'],
      keyEvidenceIds: ['login-streamcloud', 'ip-203-0-113-47', 'router-log-okafor'],
      distractorEvidenceIds: ['weather-record', 'photo-foyer-witness'],
      hints: {
        correct:
          'Spot on. IP geolocation is only an estimate (here, a 25 km radius), and the router log shows that 203.0.113.47 is the Okafor home connection. The login came through the home internet, not from the Waterfront.',
        verdict:
          'Look closely at the accuracy radius in IP Lookup. Which places fall inside that circle? Does the lookup really point to one spot?',
        byVerdict: {
          'cant-tell':
            "Close, but there's a record that tells you exactly whose connection 203.0.113.47 is. Once you have it, does the claim still stand?",
        },
        missingEvidence: {
          'login-streamcloud':
            'Your judgement is about the 7:52 pm login, so attach the login record itself.',
          'ip-203-0-113-47':
            'Attach the IP Lookup result. It tells you how precise (or not) the location estimate is.',
          'router-log-okafor':
            'Whose internet connection uses 203.0.113.47? There is a record that answers this, but you may need a warrant to see it.',
        },
        distractors: {
          'weather-record':
            "The weather record doesn't tell you anything about where the login came from.",
          'photo-foyer-witness':
            'Photo B shows someone at the Waterfront, but this question is about what the IP login shows. Keep each claim focused on its own evidence.',
        },
      },
      modelAnswer:
        "Not supported. The IP lookup only estimates a location within about 25 km, a circle that covers both the Waterfront and Palmerston. The router log shows that 203.0.113.47 was the Okafor home router's public IP, so the 7:52 pm login came through the home internet connection.",
      limitationExamples: [
        'The router log shows which connection was used, not who was typing.',
        'IP geolocation databases can be out of date or wrong.',
      ],
    },
    {
      id: 'q2-at-home',
      kind: 'verdict',
      prompt: 'Does the evidence prove Riley was at home in Palmerston all evening?',
      claim: 'Riley was at home in Palmerston all evening',
      acceptedVerdicts: ['possible'],
      keyEvidenceIds: ['router-log-okafor', 'photo-gaming-setup'],
      distractorEvidenceIds: ['weather-record'],
      hints: {
        correct:
          "Well reasoned. Riley's laptop was online at home and Photo A was taken at 8:01 pm, which fits his alibi but doesn't prove it. A device is not a person: Sam was home too, and Photo A has no GPS.",
        verdict:
          'Think about the difference between evidence that fits a claim and evidence that proves it. Does anything here show who was using the laptop, or where Photo A was taken?',
        byVerdict: {
          'strongly-supported':
            "The evidence fits the alibi, but does it prove it? Check who else was at home that evening, and what Photo A's metadata can and cannot tell you.",
          'not-supported':
            'Is there anything that actually points against Riley being home? Look at which devices were online at the Okafor home.',
        },
        missingEvidence: {
          'router-log-okafor':
            'Is there a record of which devices were online at the Okafor home that evening?',
          'photo-gaming-setup':
            'Riley sent a friend a photo as "proof". Check its metadata in Photos and attach it.',
        },
        distractors: {
          'weather-record': "The weather doesn't help decide where Riley was.",
        },
      },
      modelAnswer:
        "Possible, but not proven. The router log shows RILEY-LAPTOP online at home from 6:58 pm to 11:20 pm, and Photo A was taken at 8:01 pm. That fits the alibi. But a device is not a person: Sam was home all evening and could have used the laptop or the account, and Photo A has no GPS data, so we can't tell where it was taken.",
      limitationExamples: [
        'There is no evidence of who was using RILEY-LAPTOP.',
        'Photo A has no GPS data, so it cannot show where it was taken.',
        'Sam was home and could have used the laptop or the StreamCloud account.',
      ],
    },
    {
      id: 'q3-photo-identity',
      kind: 'verdict',
      prompt: 'Does Photo B identify Riley as the person near the display?',
      claim: 'Photo B shows Riley near the display',
      acceptedVerdicts: ['cant-tell'],
      keyEvidenceIds: ['photo-foyer-witness'],
      distractorEvidenceIds: ['weather-record'],
      hints: {
        correct:
          "Exactly. Photo B's metadata places someone at the Waterfront at 8:06 pm, but their face isn't visible. A dark hoodie is not enough to identify anyone.",
        verdict:
          'What can you actually see in Photo B? Could you pick this person out from a group of people wearing dark hoodies?',
        byVerdict: {
          'not-supported':
            "Does Photo B show anything that rules Riley out? If it can't confirm or rule out who it is, which verdict fits best?",
        },
        missingEvidence: {
          'photo-foyer-witness':
            "Attach Photo B itself: it's the evidence this question is about. If you haven't got it yet, keep investigating. New evidence may arrive.",
        },
        distractors: {
          'weather-record': "The weather doesn't help identify the person in the photo.",
        },
      },
      modelAnswer:
        "Can't tell. Photo B's metadata shows it was taken at 8:06 pm at the Waterfront, inside the incident window, so someone was near the display. But the person's face is not visible and a dark hoodie is common, so the photo cannot establish who it is.",
      limitationExamples: [
        "The person's face is not visible.",
        'Clothing is not enough to identify a person.',
      ],
    },
    {
      id: 'q4-next-steps',
      kind: 'open',
      prompt:
        'What further evidence would help decide what happened? Which of it would justify a warrant, and why?',
      guidance: [
        'Name at least two pieces of further evidence.',
        'For each one, say what it could show, and what it still could not show.',
        'Explain which would justify a warrant. Is your request necessary and proportionate?',
      ],
      modelAnswer:
        "Foyer CCTV from 7:30 to 8:15 pm could show who took the trophy. StreamCloud session and device details for the 7:52 pm login could show which device was used. Interviewing Sam would tell us whether he used the laptop or Riley's account. A narrow request for Riley's phone location between 7:00 and 8:30 pm could justify a warrant because it is limited to the incident. A request for all of Riley's phone data for a year is disproportionate: it intrudes on lots of private information that has nothing to do with the case.",
      keyPoints: [
        'Foyer or venue CCTV for the incident window',
        'StreamCloud session and device details for the 7:52 pm login',
        'Interview Sam (and Riley) about who used the laptop and account',
        'A narrow, time-limited location request rather than all phone data',
        'Warrants must be necessary and proportionate, which protects privacy',
      ],
    },
  ],

  drops: [
    {
      id: 'drop-witness-photo',
      title: 'Witness photo received',
      notification:
        'New evidence: a visitor at the convention centre has sent in a photo taken in the foyer on Friday evening. It is now in Photos.',
      triggers: [
        { type: 'afterEvidenceViewed', evidenceId: 'ip-203-0-113-47' },
        { type: 'afterMinutes', minutes: 6 },
      ],
      delaySeconds: 5,
    },
  ],

  warrants: {
    available: 2,
    requests: [
      {
        id: 'warrant-router',
        title: 'Okafor home router logs',
        scope:
          "Connection logs from the router at the Okafor home for Friday 14 August 2026, 5:00 pm to midnight, including the router's public IP address.",
        targets: ['router-log-okafor'],
        proportionate: true,
        outcome:
          'Granted. The request is limited to one evening and directly tests the IP evidence. The router log is now available in Network Log.',
      },
      {
        id: 'warrant-phone-history',
        title: "Riley's phone: complete location history",
        scope:
          "Every location record stored on, or synced from, Riley Okafor's phone for the past 12 months, plus all of its photos and messages.",
        targets: ['phone-location-riley'],
        proportionate: false,
        outcome:
          'Refused. This request is far broader than the investigation needs. It covers a whole year and lots of private information about Riley and the people he talks to. A warrant must be necessary and proportionate. Think about what a narrower request would look like (you can suggest one in your final answer). Your warrant has not been used.',
      },
    ],
  },
});
