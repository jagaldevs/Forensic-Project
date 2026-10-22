/**
 * Mission 7: Emails & Cloud Files. A warm-up for the assessment (The Science Fair Switch), in
 * plain English with no email headers. Practises the same skills on different data: comparing
 * an email with a genuine one, reading a version history in UTC, and account vs person.
 * The football club, its people and every address are fictional (.example domains).
 */
import { defineMission } from '../../engine/missionTypes';
import { meta } from './meta';

const genuine = {
  kind: 'email' as const,
  caption: 'Email 1',
  from: { name: 'Coach Rivera', address: 'coach@topendjuniors.example' },
  to: ['Under-14s team list'],
  sent: 'Tue 3 March, 4:15 pm',
  subject: 'Training moved to Thursday',
  body: `Hi everyone,

Training is moved to Thursday this week because the oval is being mowed. Same time, 5 pm. Team lists for Saturday go up on the club drive by 7 pm tonight.

Coach Rivera
Top End Juniors Football Club`,
};

const suspicious = {
  kind: 'email' as const,
  caption: 'Email 2',
  from: { name: 'Coach Rivera', address: 'coach@topendjuniors.example' },
  replyTo: { name: 'Coach Rivera', address: 'coachrivera.u14@kookamail.example' },
  to: ['Ava Chen'],
  sent: 'Tue 3 March, 8:02 pm',
  subject: 'Your spot in Saturday’s team',
  body: `Hi Ava,

Good news, you are in the starting team! Please reply straight to me with your parent’s phone number so I can confirm your spot. Don’t send it to the club, they are busy.

Coach`,
};

const versions = {
  kind: 'table' as const,
  caption: 'U14 team list (club cloud drive): version history. Times are shown in UTC.',
  columns: ['Version', 'Saved (UTC)', 'Saved by (account)', 'Device'],
  rows: [
    ['1', 'Mon 2 March, 06:10', 'Coach Rivera', 'CLUB-OFFICE-PC'],
    ['2', 'Tue 3 March, 08:30', 'Coach Rivera', 'CLUB-OFFICE-PC'],
    ['3', 'Tue 3 March, 09:25', 'Coach Rivera', 'CLUB-OFFICE-PC'],
    ['4', 'Tue 3 March, 11:20', 'Ava Chen', 'CLUB-LAPTOP (shared)'],
  ],
  mono: true,
};

export default defineMission({
  meta,
  steps: [
    {
      id: 'reading-an-email',
      type: 'explain',
      title: 'What an email shows',
      body: `Every email has a few lines at the top, and each one means something different.

**From** is the name and address the sender's email program wrote there, like the return address on an envelope. Whoever writes an email can type anything there, so it is a claim, not proof.

**Reply to** (only shown when it is different) is where your reply will go. If it is different from From, replies go somewhere else.

**To** lists everyone the email was sent to. **Sent** is shown on your own device's clock, in your time zone.`,
      media: [genuine],
    },
    {
      id: 'odd-email',
      type: 'choice',
      title: 'Is it really the coach?',
      body: 'Ava gets a second email that seems to come from the coach. Compare it with the first one, a genuine team email.',
      media: [genuine, suspicious],
      question: 'Which details suggest Email 2 might not really be from Coach Rivera?',
      options: [
        {
          id: 'reply-to',
          text: 'Replies go to a different, free email address',
          feedback: 'Yes.',
        },
        {
          id: 'one-person',
          text: 'It went to Ava only, but team news goes to the whole team list',
          feedback: 'Yes.',
        },
        {
          id: 'asks-data',
          text: 'It asks for personal information to be sent straight back, not to the club',
          feedback: 'Yes.',
        },
        {
          id: 'from-line',
          text: 'The From line says Coach Rivera',
          feedback:
            'The From line matches the genuine email, but anyone can type a From line, so it can’t settle this either way.',
        },
        {
          id: 'evening',
          text: 'It was sent in the evening',
          feedback:
            'Coaches send emails at all hours. On its own, the time isn’t a sign of anything.',
        },
      ],
      correct: ['reply-to', 'one-person', 'asks-data'],
      explanation:
        'Three details don’t fit the genuine pattern: replies go to a free Kookamail address, it went to one player instead of the team list, and it asks for personal information to be sent straight back. One odd detail could be innocent; several together make a strong case. Even so, the email can’t show who wrote it. The safe next step is to check with the coach or the club directly, not by replying.',
    },
    {
      id: 'email-shows',
      type: 'classify',
      title: 'Shows, or can’t show?',
      question: 'Sort what a copy of an email can tell you.',
      buckets: [
        { id: 'shows', label: 'The email shows this' },
        { id: 'cannot', label: 'The email can’t show this' },
      ],
      items: [
        {
          id: 'recipients',
          text: 'Who it was sent to',
          bucket: 'shows',
          why: 'The To line lists everyone it was sent to.',
        },
        {
          id: 'replies',
          text: 'Where a reply would go',
          bucket: 'shows',
          why: 'Reply to (or From, if there is no Reply to) is where a reply goes.',
        },
        {
          id: 'when',
          text: 'When it arrived, on the reader’s clock',
          bucket: 'shows',
          why: 'Sent is shown on the reader’s device, in the reader’s time zone.',
        },
        {
          id: 'who-typed',
          text: 'Who actually typed it',
          bucket: 'cannot',
          why: 'An email shows an account and an address, not the person at the keyboard.',
        },
        {
          id: 'from-true',
          text: 'Whether the From name is true',
          bucket: 'cannot',
          why: 'From can be typed by anyone, so you need other evidence, such as comparing with genuine emails.',
        },
      ],
      explanation:
        'An email is a record of an account sending a message. It shows who it went to, where replies go and when it arrived. It can’t show who typed it, or whether the From name is honest.',
    },
    {
      id: 'cloud-history',
      type: 'explain',
      title: 'A file’s history',
      body: `Cloud drives keep a **version history**: every time a file is saved, the drive keeps a copy with the time, the **account** that was signed in and the **device** it came from.

**Created** is when the file first appeared on the drive (a copy uploaded today is “created” today, even if it was written last year). **Modified** is the last save.

Many online services show times in **UTC**, the world's reference time, not Darwin time. Always check the label. Darwin is UTC +9:30 all year.`,
      media: [versions],
    },
    {
      id: 'saved-by',
      type: 'choice',
      title: 'Saved by Ava Chen',
      body: 'Version 4 of the team list was saved by the account "Ava Chen" on the club’s shared laptop. Ava used that laptop at the club on Tuesday afternoon to update the canteen roster.',
      media: [versions],
      question: 'What does "Saved by Ava Chen" show?',
      options: [
        {
          id: 'ava-did-it',
          text: 'Ava changed the team list',
          feedback:
            'It shows which account was signed in. Anyone using that laptop while Ava’s account was still signed in would appear as Ava.',
        },
        {
          id: 'account',
          text: 'Someone using Ava’s signed-in account on the shared laptop saved it',
          feedback: 'Yes.',
        },
        {
          id: 'nothing',
          text: 'Nothing useful at all',
          feedback:
            'It does show something: which account and which device saved version 4, and when.',
        },
      ],
      correct: ['account'],
      explanation:
        'A version history records accounts and devices, not people. If Ava didn’t sign out of a shared laptop, anyone using it later would save as "Ava Chen". An account is not a person.',
    },
    {
      id: 'utc-to-darwin',
      type: 'shortAnswer',
      title: 'Darwin time',
      body: 'Version 4 was saved at 11:20 UTC on Tuesday.',
      media: [versions],
      question: 'What time was that in Darwin? Use 24-hour time, like 19:30.',
      accept: ['20:50', '2050', '8:50pm', '850pm', '20:50acst', '2050acst'],
      placeholder: 'HH:MM',
      hint: 'Darwin is UTC +9:30, so add 9 hours and 30 minutes.',
      explanation:
        '11:20 + 9:30 = 20:50, so 8:50 pm in Darwin. A time that looks like late morning in UTC was actually Tuesday evening in Darwin.',
    },
    {
      id: 'after-deadline',
      type: 'spot',
      title: 'After the deadline?',
      body: 'Team lists had to be final by 7:00 pm Darwin time on Tuesday 3 March. The drive shows these saves in UTC.',
      question: 'Pick every save that happened after the 7:00 pm deadline.',
      rows: [
        { id: 'v1', label: 'Version 1', value: 'Mon 2 March, 06:10 UTC' },
        { id: 'v2', label: 'Version 2', value: 'Tue 3 March, 08:30 UTC' },
        { id: 'v3', label: 'Version 3', value: 'Tue 3 March, 09:25 UTC' },
        { id: 'v4', label: 'Version 4', value: 'Tue 3 March, 11:20 UTC' },
      ],
      correct: ['v4'],
      hint: 'Convert each time to Darwin time first (add 9 hours 30 minutes), then compare it with 7:00 pm.',
      explanation:
        'In Darwin time the saves were Monday 3:40 pm, then Tuesday 6:00 pm, 6:55 pm and 8:50 pm. Only version 4 came after the 7:00 pm deadline. Version 3 looks late in UTC but was five minutes early.',
    },
    {
      id: 'fair-conclusion',
      type: 'reflect',
      title: 'Be fair to Ava',
      body: 'The team manager says: “The drive says Ava Chen changed the team list after the deadline, so Ava cheated.”',
      question:
        'Write two or three sentences to the manager: what does the evidence show, what doesn’t it show, and what would you check next?',
      minLength: 80,
    },
  ],
});
