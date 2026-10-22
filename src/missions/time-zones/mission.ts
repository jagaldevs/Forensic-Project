/** Mission 5: Timestamps & Time Zones. Prepares students for the AEST/ACST trap in Phase 3. */
import { defineMission } from '../../engine/missionTypes';
import { meta } from './meta';

const zones = {
  kind: 'table' as const,
  caption: 'Some Australian time zones (in August, when no one is on daylight saving)',
  columns: ['City', 'Zone', 'Offset from UTC', 'Daylight saving?'],
  rows: [
    ['Perth', 'AWST', '+8:00', 'No'],
    ['Darwin', 'ACST', '+9:30', 'No, never'],
    ['Adelaide', 'ACST', '+9:30', 'Yes, October to April'],
    ['Brisbane', 'AEST', '+10:00', 'No'],
    ['Sydney', 'AEST', '+10:00', 'Yes, October to April'],
  ],
};

export default defineMission({
  meta,
  steps: [
    {
      id: 'why-time-zones',
      type: 'explain',
      title: 'Whose time is it?',
      body: `Every device records times using **its own clock and time zone setting**. Investigators often combine evidence from many devices, so they must line everything up on one timeline.

The world reference is **UTC** (Coordinated Universal Time). Darwin is on **ACST**, which is UTC **+9:30**, and Darwin **never** uses daylight saving.

Brisbane and Sydney are on AEST (UTC +10:00), which is **30 minutes ahead** of Darwin. In summer, Sydney moves to daylight saving and is 1 hour 30 minutes ahead.`,
      media: [zones],
    },
    {
      id: 'brisbane-to-darwin',
      type: 'shortAnswer',
      title: 'Convert it',
      body: 'A phone set to Brisbane time (AEST, UTC +10:00) took a photo. Its timestamp says 20:22.',
      media: [zones],
      question: 'What time was that in Darwin? Use 24-hour time, like 19:30.',
      accept: ['19:52', '1952', '7:52pm', '7:52 pm', '752pm', '19:52acst', '1952acst'],
      placeholder: 'HH:MM',
      hint: 'Darwin is 30 minutes behind Brisbane.',
      explanation:
        '20:22 AEST is 19:52 ACST. Darwin is half an hour behind, so subtract 30 minutes.',
    },
    {
      id: 'utc-to-darwin',
      type: 'shortAnswer',
      title: 'From UTC',
      body: 'Online services often log times in UTC. A server log says a login happened at 10:22 UTC.',
      question: 'What time was that in Darwin? Use 24-hour time.',
      accept: ['19:52', '1952', '7:52pm', '7:52 pm', '752pm', '19:52acst', '1952acst'],
      placeholder: 'HH:MM',
      hint: 'Darwin is UTC +9:30, so add 9 hours and 30 minutes.',
      explanation: '10:22 + 9:30 = 19:52 in Darwin.',
    },
    {
      id: 'order-events',
      type: 'order',
      title: 'Build the timeline',
      body: 'Five devices, three different clock settings. Convert each one to Darwin time in your head (or on paper), then put them in the order they really happened.',
      media: [zones],
      question: 'Put these events in the order they actually happened, earliest first.',
      items: [
        { id: 'band', text: 'Fitness band (set to ACST): run started at 19:30' },
        { id: 'phone', text: 'Phone (set to AEST): message sent at 20:05' },
        { id: 'doorbell', text: 'Doorbell camera (set to ACST): motion at 19:40' },
        { id: 'laptop', text: 'Laptop (set to UTC): file saved at 10:20' },
        { id: 'server', text: 'Website server (UTC): login at 10:30' },
      ],
      explanation:
        'In Darwin time: run 19:30, message 19:35 (20:05 AEST minus 30 minutes), motion 19:40, file saved 19:50 (10:20 UTC plus 9:30), login 20:00. Sorting by the numbers as written would have put them in the wrong order.',
    },
    {
      id: 'thirty-minutes',
      type: 'choice',
      title: 'The 30-minute mystery',
      body: 'Two witnesses photographed the same fireworks in Darwin. One photo’s metadata says 21:00; the other says 21:30.',
      question: 'What is the most likely explanation for the exactly 30-minute difference?',
      options: [
        {
          id: 'zone',
          text: 'One phone is set to an eastern time zone, like Brisbane (AEST)',
          feedback: 'Yes.',
        },
        {
          id: 'lying',
          text: 'One witness is lying about when they took it',
          feedback:
            'Metadata comes from the phone, not the person. Is there a technical explanation for exactly 30 minutes?',
        },
        {
          id: 'broken',
          text: 'One phone’s clock is broken',
          feedback: 'Clocks can drift, but by exactly half an hour? Look at the time zone table.',
        },
      ],
      correct: ['zone'],
      explanation:
        'Exactly 30 minutes is the gap between ACST and AEST. Visitors from Queensland, or phones that never updated their zone, record eastern time. Always check a device’s time zone setting before comparing times.',
    },
    {
      id: 'unambiguous',
      type: 'choice',
      title: 'Write it so no one gets confused',
      question: 'Which timestamp means exactly one moment, wherever you are?',
      options: [
        { id: 'plain', text: '19:52', feedback: '19:52 where? In which zone, and on which day?' },
        { id: 'friday', text: '7:52 pm Friday', feedback: 'Which Friday, and in which time zone?' },
        { id: 'iso', text: '2026-08-14T19:52:00+09:30', feedback: 'Yes.' },
        {
          id: 'slashes',
          text: '14/08/26 7:52',
          feedback:
            'Is that am or pm, and in which zone? And 14/08/26 could even be read as 26 August 2014.',
        },
      ],
      correct: ['iso'],
      explanation:
        'The international format (ISO 8601) includes the date, the time and the offset from UTC, so it can only mean one moment. That’s how this lab stores evidence times.',
    },
    {
      id: 'key-idea',
      type: 'explain',
      title: 'Key idea',
      body: `A timestamp is only meaningful with its **time zone**, and only reliable if the **device clock** was right.

Darwin is UTC +9:30 all year, so it is 30 minutes behind Brisbane, and 30 minutes behind Sydney for half the year (1 hour 30 minutes in summer). Watch for that 30-minute gap. You’ll meet it again.`,
    },
  ],
});
