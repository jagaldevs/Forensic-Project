/** Mission 1: Metadata Matters. All people and apps are fictional. */
import { defineMission } from '../../engine/missionTypes';
import { meta } from './meta';
import sunset from './assets/beach-sunset.svg';
import sunsetEdited from './assets/beach-sunset-edited.svg';
import puppy from './assets/puppy.svg';

const photo1 = {
  kind: 'photo' as const,
  src: sunset,
  alt: 'A beach at sunset with a palm tree silhouette and two people standing on the sand.',
  caption: 'Photo 1: IMG_0412.jpg (original file from the phone)',
  metadata: [
    { label: 'DateTimeOriginal', value: '2026:08:13 18:52:07' },
    { label: 'OffsetTimeOriginal', value: '+09:30' },
    { label: 'Make', value: 'Nimbus' },
    { label: 'Model', value: 'Nimbus N8 Lite' },
    { label: 'GPS', value: '12° 26′ 46″ S, 130° 49′ 55″ E (Mindil Beach)' },
    { label: 'Software', value: 'Nimbus Camera 4.2' },
  ],
};

const photo2 = {
  kind: 'photo' as const,
  src: sunsetEdited,
  alt: 'The same beach sunset with brighter colours, sparkle stickers and the words "best night ever!!".',
  caption: 'Photo 2: posted to PicPost the next day',
  metadata: [
    { label: 'DateTimeOriginal', value: '2026:08:13 18:52:07' },
    { label: 'ModifyDate', value: '2026:08:14 09:15:40' },
    { label: 'Make', value: 'Nimbus' },
    { label: 'Model', value: 'Nimbus N8 Lite' },
    { label: 'GPS', value: 'GPS data removed' },
    { label: 'Software', value: 'PixelPop Editor 3.1' },
  ],
};

export default defineMission({
  meta,
  steps: [
    {
      id: 'what-is-metadata',
      type: 'explain',
      title: 'Data about data',
      body: `Every digital photo carries hidden information called **metadata**. Cameras and phones record it automatically using a standard called EXIF.

It can include when the photo was taken (from the device's own clock), the make and model of the device, the camera settings, the software used, and sometimes GPS coordinates if location was switched on.

Investigators use metadata a lot. But it describes the **device and the file**, not the person holding it. Let's see what that means.`,
      media: [photo1],
    },
    {
      id: 'spot-when-where',
      type: 'spot',
      title: 'When and where?',
      body: 'Taylor says Photo 1 was taken at Mindil Beach on Thursday evening.',
      media: [{ ...photo1, metadata: undefined }],
      question: 'Which metadata rows help check WHEN and WHERE the photo was taken?',
      rows: [
        { id: 'make', label: 'Make', value: 'Nimbus' },
        { id: 'taken', label: 'DateTimeOriginal', value: '2026:08:13 18:52:07' },
        { id: 'model', label: 'Model', value: 'Nimbus N8 Lite' },
        { id: 'gps', label: 'GPS', value: '12° 26′ 46″ S, 130° 49′ 55″ E (Mindil Beach)' },
        { id: 'software', label: 'Software', value: 'Nimbus Camera 4.2' },
      ],
      correct: ['taken', 'gps'],
      hint: 'Look for the row with a date and time, and the row with coordinates.',
      explanation:
        "DateTimeOriginal gives the date and time (from the phone's clock) and GPS gives the location: Thursday 13 August, 6:52 pm, at Mindil Beach. Make and model tell you which kind of phone, not where or when.",
    },
    {
      id: 'edited-copy',
      type: 'choice',
      title: 'Spot the edit',
      body: 'Photo 2 was posted online the next morning. Compare its metadata with Photo 1.',
      media: [photo1, photo2],
      question: 'What does Photo 2’s metadata tell you?',
      options: [
        {
          id: 'edited',
          text: 'It is the same photo, edited the next morning with an app.',
          feedback: 'Yes.',
        },
        {
          id: 'different-day',
          text: 'It was taken on a different day from Photo 1.',
          feedback: 'Check DateTimeOriginal in both photos. Are they different?',
        },
        {
          id: 'different-person',
          text: 'A different person took it.',
          feedback:
            'Can metadata tell you who pressed the button? Look at what it actually records.',
        },
        {
          id: 'fake',
          text: 'It is fake, so it should be ignored.',
          feedback:
            'Adding a filter and text is an edit, not a fake scene. Edited photos can still be useful evidence.',
        },
      ],
      correct: ['edited'],
      explanation:
        'Both photos have the same DateTimeOriginal and phone model, so they began as the same picture. Photo 2 has a later ModifyDate and the Software row names an editing app (PixelPop Editor), so it was edited the next morning. Edited is not the same as fake, but investigators prefer the original file.',
    },
    {
      id: 'wrong-clock',
      type: 'choice',
      title: 'A photo from the year 2000?',
      body: 'Taylor’s little brother took this photo of the new puppy last weekend on an old tablet.',
      media: [
        {
          kind: 'photo',
          src: puppy,
          alt: 'A cartoon puppy sitting in a sunny backyard next to a red ball.',
          caption: 'Photo 3: DSC00007.jpg',
          metadata: [
            { label: 'DateTimeOriginal', value: '2000:01:01 00:04:12' },
            { label: 'Make', value: 'Kestrel' },
            { label: 'Model', value: 'Kestrel Tab 2' },
            { label: 'GPS', value: 'No GPS data' },
          ],
        },
      ],
      question: 'What is the most likely explanation for the date?',
      options: [
        {
          id: 'year-2000',
          text: 'The photo really was taken on 1 January 2000.',
          feedback:
            'The puppy arrived last weekend. Could the date be coming from somewhere unreliable?',
        },
        {
          id: 'clock',
          text: 'The tablet’s clock was wrong, for example it reset after the battery went flat.',
          feedback: 'Yes.',
        },
        {
          id: 'hacked',
          text: 'Someone hacked the metadata to trick investigators.',
          feedback:
            'Possible, but is it the simplest explanation? Think about where the date comes from.',
        },
      ],
      correct: ['clock'],
      explanation:
        'Timestamps come from the device’s own clock. When some devices lose power completely, the clock resets to a default date like 1 January 2000. A timestamp is only as reliable as the clock that made it, so investigators check it against other evidence.',
    },
    {
      id: 'shows-not-shows',
      type: 'classify',
      title: 'What can metadata show?',
      question: 'Sort each statement: can photo metadata show it, or not?',
      buckets: [
        { id: 'can', label: 'Metadata can show this' },
        { id: 'cannot', label: 'Metadata cannot show this' },
      ],
      items: [
        {
          id: 'model',
          text: 'Which model of phone took the photo',
          bucket: 'can',
          why: 'Make and Model are recorded by the device.',
        },
        {
          id: 'who',
          text: 'Who pressed the button',
          bucket: 'cannot',
          why: 'Metadata records the device, not the person using it.',
        },
        {
          id: 'gps',
          text: 'Where the phone was, if location was on',
          bucket: 'can',
          why: 'GPS coordinates are saved when location services are on.',
        },
        {
          id: 'why',
          text: 'Why the photo was taken',
          bucket: 'cannot',
          why: 'Intentions are not recorded anywhere in a file.',
        },
        {
          id: 'edit',
          text: 'Whether an editing app saved the file',
          bucket: 'can',
          why: 'Many editors write their name in the Software row.',
        },
        {
          id: 'consent',
          text: 'Whether people in the photo agreed to it',
          bucket: 'cannot',
          why: 'Consent is not something a camera can record.',
        },
      ],
      explanation:
        'Metadata describes the device and the file: model, settings, time on the device clock, location (if on) and software. It cannot tell you who held the device, why, or whether anyone agreed.',
    },
    {
      id: 'gps-removed',
      type: 'choice',
      title: 'Missing location',
      body: 'Taylor sent Photo 1 to a friend on ChatterBox. The friend’s copy says “GPS data removed”.',
      question: 'What is the best explanation?',
      options: [
        {
          id: 'privacy',
          text: 'Many messaging apps remove location data automatically to protect privacy.',
          feedback: 'Yes.',
        },
        {
          id: 'hiding',
          text: 'Taylor deleted the GPS to hide where they were.',
          feedback:
            'That is possible, but is there a more ordinary explanation? Think about what apps do when you share photos.',
        },
        {
          id: 'never',
          text: 'The photo never had GPS data.',
          feedback:
            'Photo 1, the original, does have GPS. So it was removed somewhere along the way.',
        },
      ],
      correct: ['privacy'],
      explanation:
        'Messaging and social apps often strip GPS when a photo is shared, so strangers can’t find out where you live. Missing GPS is normal and not suspicious on its own. To know where a photo was taken, investigators need the original file.',
    },
    {
      id: 'key-idea',
      type: 'explain',
      title: 'Key idea',
      body: `Metadata is powerful evidence, but remember:

1. It describes the **device and file**, not the person.
2. Times come from the **device's clock**, which can be wrong.
3. It can be **removed or changed**, often for ordinary reasons.

Always ask: what does it show, and what doesn't it show?`,
    },
  ],
});
