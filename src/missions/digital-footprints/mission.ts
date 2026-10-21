/** Mission 2: Digital Footprints. Taylor Quinn and every app here are fictional. */
import { defineMission } from '../../engine/missionTypes';
import { meta } from './meta';

const saturday = {
  kind: 'table' as const,
  caption: "Taylor Quinn's Saturday (Taylor is 13 and lives in Nightcliff)",
  columns: ['Time', 'What happened'],
  rows: [
    ['8:12 am', 'Asks the kitchen smart speaker, "What’s the weather today?"'],
    ['9:30 am', 'Posts a photo of pancakes on PicPost with the caption "Saturday fuel"'],
    ['10:05 am', 'Taps a Top End Transit bus card at the Casuarina bus interchange'],
    ['11:40 am', 'Phone joins the "Casuarina Library Free WiFi" network'],
    ['1:15 pm', 'Likes a skateboarding video on ClipStream'],
    ['3:00 pm', 'Fitness band records 6,214 steps so far today'],
    ['6:30 pm', 'A friend tags Taylor in a photo checked in at Mindil Beach Sunset Market'],
  ],
};

export default defineMission({
  meta,
  steps: [
    {
      id: 'what-is-a-footprint',
      type: 'explain',
      title: 'The trail you leave',
      body: `A **digital footprint** is the trail of data created as you use technology.

Some of it is **active**: things you choose to share, like posts, messages and likes.

Some of it is **passive**: records made automatically, often without you noticing, like Wi-Fi connections, location logs and app activity.

And some footprints about you are made by **other people**, like a friend tagging you in a photo.

Here is one ordinary Saturday for a fictional student, Taylor.`,
      media: [saturday],
    },
    {
      id: 'sort-footprints',
      type: 'classify',
      title: 'Active, passive, or someone else?',
      media: [saturday],
      question: 'Sort each of Taylor’s footprints.',
      buckets: [
        { id: 'active', label: 'Active: Taylor chose to share it' },
        { id: 'passive', label: 'Passive: recorded automatically' },
        { id: 'others', label: 'Created by someone else' },
      ],
      items: [
        {
          id: 'post',
          text: 'Pancake photo on PicPost',
          bucket: 'active',
          why: 'Taylor decided to post it.',
        },
        {
          id: 'like',
          text: 'Liked a skateboarding video',
          bucket: 'active',
          why: 'Liking is a choice Taylor made, and it is saved.',
        },
        {
          id: 'bus',
          text: 'Bus card tap at Casuarina',
          bucket: 'passive',
          why: 'The transit system logs every tap automatically.',
        },
        {
          id: 'wifi',
          text: 'Phone joined the library Wi-Fi',
          bucket: 'passive',
          why: 'Phones join known networks automatically, and the network logs it.',
        },
        {
          id: 'steps',
          text: 'Fitness band step count',
          bucket: 'passive',
          why: 'The band counts steps in the background.',
        },
        {
          id: 'tag',
          text: 'Tagged in a friend’s photo',
          bucket: 'others',
          why: 'A friend created this footprint about Taylor.',
        },
      ],
      explanation:
        'Most of Taylor’s footprints were passive: bus taps, Wi-Fi connections and step counts happen in the background. Only the post and the like were active choices, and the tag was created by someone else. That is true for most people.',
    },
    {
      id: 'where-at-1140',
      type: 'choice',
      title: 'Where was Taylor at 11:40?',
      media: [saturday],
      question: 'Which footprint best helps place Taylor at 11:40 am?',
      options: [
        { id: 'wifi', text: 'The library Wi-Fi connection', feedback: 'Yes.' },
        {
          id: 'post',
          text: 'The pancake photo',
          feedback: 'That was posted at 9:30 am, two hours earlier.',
        },
        {
          id: 'steps',
          text: 'The step count',
          feedback: 'A step count tells you how far, not where.',
        },
        {
          id: 'none',
          text: 'None of them',
          feedback: 'One of them is linked to a place at about that time. Look again.',
        },
      ],
      correct: ['wifi'],
      explanation:
        'The Wi-Fi log places Taylor’s phone near Casuarina Library at 11:40. Careful, though: it shows where the phone was, not necessarily Taylor. A device is not a person.',
    },
    {
      id: 'location-footprints',
      type: 'choice',
      title: 'Location clues',
      media: [saturday],
      question: 'Which footprints could reveal where Taylor was? Choose all that apply.',
      options: [
        { id: 'bus', text: 'Bus card tap', feedback: 'Yes.' },
        { id: 'wifi', text: 'Library Wi-Fi connection', feedback: 'Yes.' },
        { id: 'tag', text: 'Friend’s tagged photo with a check-in', feedback: 'Yes.' },
        {
          id: 'like',
          text: 'Liked video',
          feedback: 'Liking a video doesn’t record where you were.',
        },
        {
          id: 'speaker',
          text: 'Smart speaker weather question',
          feedback:
            'It tells you someone was in the kitchen, but the speaker never moves. Which footprints actually show a place Taylor went to?',
        },
      ],
      correct: ['bus', 'wifi', 'tag'],
      explanation:
        'The bus tap, the Wi-Fi connection and the check-in all link Taylor (or Taylor’s card or phone) to a place and time. Put together they make a timeline of Taylor’s day, which is why footprints matter for privacy.',
    },
    {
      id: 'smaller-footprint',
      type: 'reflect',
      title: 'A smaller footprint',
      body: 'Taylor wants to share less about where they go.',
      question:
        'Suggest two changes Taylor could make, and say which footprints each change would reduce.',
      minLength: 60,
    },
    {
      id: 'key-idea',
      type: 'explain',
      title: 'Key idea',
      body: `Everyone leaves a digital footprint, mostly **passively**. Footprints can be combined into a detailed picture of someone’s life.

For investigators that is powerful, but each footprint usually shows a **device or an account**, not a person. And because footprints reveal so much, collecting them is a privacy matter.`,
    },
  ],
});
