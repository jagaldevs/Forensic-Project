/** Mission 3: Search History & Cookies. The Quinn family and all sites are fictional. */
import { defineMission } from '../../engine/missionTypes';
import { meta } from './meta';

const history = {
  kind: 'table' as const,
  caption: 'Orbit Browser history on FAMILY-PC (one shared profile), Wednesday',
  columns: ['Time', 'Type', 'Entry'],
  rows: [
    ['3:42 pm', 'Search', 'how to fix a bike chain'],
    ['3:44 pm', 'Visit', 'Bike Repair Basics | Top End Cycles'],
    ['4:10 pm', 'Search', 'volcano science project ideas'],
    ['4:25 pm', 'Visit', 'StreamCloud | Home (signed in as Morgan Q.)'],
    ['4:30 pm to 7:00 pm', '—', 'History cleared for this period'],
    ['7:05 pm', 'Search', 'Casuarina pool opening hours'],
    ['7:20 pm', 'Visit', 'Easy butter chicken | Weeknight Recipes'],
  ],
  mono: true,
};

const household = {
  kind: 'table' as const,
  caption: 'Who uses FAMILY-PC',
  columns: ['Name', 'Age', 'Notes'],
  rows: [
    ['Morgan Quinn', '44', 'Parent. Has a StreamCloud account.'],
    ['Jess Quinn', '17', 'Has a part-time job; rides a bike to work.'],
    ['Taylor Quinn', '13', 'Doing a science project this week.'],
  ],
};

export default defineMission({
  meta,
  steps: [
    {
      id: 'what-is-history',
      type: 'explain',
      title: 'Browser history',
      body: `Web browsers keep a **history**: a list of searches and pages visited, with times. It is saved on the device, for the browser profile that was used.

If a whole family shares one computer and one profile, everyone’s browsing ends up in the same list. History can also be **cleared**, by choice or by settings that delete it automatically.`,
      media: [history, household],
    },
    {
      id: 'who-searched',
      type: 'choice',
      title: 'Who searched?',
      media: [history, household],
      question: 'Who searched “how to fix a bike chain” at 3:42 pm?',
      options: [
        {
          id: 'jess',
          text: 'Jess, because Jess rides a bike to work',
          feedback: 'That fits, but does anything here show who was at the keyboard?',
        },
        {
          id: 'morgan',
          text: 'Morgan, because StreamCloud is signed in as Morgan',
          feedback: 'Being signed in to one website doesn’t tell you who used the whole browser.',
        },
        { id: 'cant-tell', text: 'You can’t tell from the history alone', feedback: 'Yes.' },
      ],
      correct: ['cant-tell'],
      explanation:
        'Everyone shares one profile on FAMILY-PC, so the history shows what the computer was used for, not who used it. Jess is a reasonable guess, but a guess isn’t evidence. You’d need more, such as asking the family or checking who was home at 3:42.',
    },
    {
      id: 'cleared-gap',
      type: 'choice',
      title: 'The missing hours',
      media: [history],
      question: 'History from 4:30 to 7:00 pm was cleared. What does that show?',
      options: [
        {
          id: 'hiding',
          text: 'Someone was hiding something suspicious',
          feedback:
            'That’s one possibility, but there are many ordinary reasons. What does it actually show?',
        },
        {
          id: 'only-cleared',
          text: 'Only that the history for that time was cleared',
          feedback: 'Yes.',
        },
        {
          id: 'off',
          text: 'The computer was switched off',
          feedback:
            'A cleared period doesn’t mean nothing happened. It means the record was removed.',
        },
      ],
      correct: ['only-cleared'],
      explanation:
        'A gap shows that history was removed, nothing more. People clear history for ordinary reasons: privacy, planning a surprise present, or a setting that does it automatically. Treat a gap as a question to investigate, not as proof.',
    },
    {
      id: 'cookie-or-not',
      type: 'classify',
      title: 'What is a cookie?',
      body: 'A **cookie** is a small file a website saves in your browser so it can remember you next time: that you are signed in, your settings, or what is in your basket.',
      question: 'Which of these would a website store in a cookie?',
      buckets: [
        { id: 'cookie', label: 'Stored in a cookie' },
        { id: 'not', label: 'Not a cookie' },
      ],
      items: [
        {
          id: 'signin',
          text: 'Keeping you signed in to StreamCloud',
          bucket: 'cookie',
          why: 'Sign-in cookies let a site recognise the browser next time.',
        },
        {
          id: 'basket',
          text: 'Items in an online shopping basket',
          bucket: 'cookie',
          why: 'Shops often keep your basket in a cookie.',
        },
        {
          id: 'dark',
          text: 'That you chose dark mode on a website',
          bucket: 'cookie',
          why: 'Site settings are commonly remembered with cookies.',
        },
        {
          id: 'battery',
          text: 'The laptop’s battery level',
          bucket: 'not',
          why: 'That is the device’s own information, not something a website saves.',
        },
        {
          id: 'ip',
          text: 'The home router’s public IP address',
          bucket: 'not',
          why: 'That comes from the network connection, not a cookie.',
        },
      ],
      explanation:
        'Cookies remember things about a browser: sign-ins, settings and baskets. That’s convenient, but it also means anyone using the same browser is treated as the same person.',
    },
    {
      id: 'account-not-person',
      type: 'choice',
      title: 'Signed in as Morgan',
      body: 'At 4:25 pm StreamCloud was still signed in as Morgan because of a saved cookie. Taylor used the computer and watched a show. StreamCloud’s log says “Morgan Q. watched a show at 4:25 pm”.',
      question: 'What should an investigator conclude from StreamCloud’s log?',
      options: [
        {
          id: 'morgan',
          text: 'Morgan was at the computer at 4:25 pm',
          feedback:
            'The log records the account, not the person. Who else could use a signed-in browser?',
        },
        {
          id: 'account',
          text: 'Morgan’s account was used on that browser, but not necessarily by Morgan',
          feedback: 'Yes.',
        },
        {
          id: 'wrong',
          text: 'StreamCloud’s log must be wrong',
          feedback: 'The log is accurate about the account. The question is who was using it.',
        },
      ],
      correct: ['account'],
      explanation:
        'A saved sign-in means anyone using that browser acts as that account. An account is not a person. This is exactly the reasoning you need in The Waterfront Alibi.',
    },
    {
      id: 'key-idea',
      type: 'explain',
      title: 'Key idea',
      body: `Browser history shows what a **browser profile** was used for. Cookies make a browser act as a signed-in **account**.

Neither tells you which **person** was at the keyboard. And cleared history shows that something was removed, not why.`,
    },
  ],
});
