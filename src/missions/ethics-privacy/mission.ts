/** Mission 6: Ethics & Privacy. Scenarios are fictional and age-appropriate. */
import { defineMission } from '../../engine/missionTypes';
import { meta } from './meta';

export default defineMission({
  meta,
  steps: [
    {
      id: 'why-warrants',
      type: 'explain',
      title: 'Why warrants exist',
      body: `Digital evidence can reveal a huge amount about a person: where they go, who they talk to, what they search for. Most of it has nothing to do with any crime.

So investigators usually need a **warrant**: permission from a magistrate or judge. To get one, a request must be:

**Necessary**: it would help answer a real question in the investigation.
**Proportionate**: it asks for no more than it needs, for example a short time window rather than years of data.

A good request is specific about **whose** data, **what** data, and **when**.`,
    },
    {
      id: 'triage',
      type: 'classify',
      title: 'Warrant triage',
      body: 'A trophy was taken from a school hall between 7:00 and 8:30 pm. You are the magistrate.',
      question: 'Sort each request.',
      buckets: [
        { id: 'grant', label: 'Grant it: necessary and proportionate' },
        { id: 'narrow', label: 'Too broad: narrow it down' },
        { id: 'refuse', label: 'Refuse: no good reason' },
      ],
      items: [
        {
          id: 'cctv',
          text: 'CCTV from the hall entrance, 7:00 to 8:30 pm on the night',
          bucket: 'grant',
          why: 'It is directly about the incident and limited to the time window.',
        },
        {
          id: 'router',
          text: 'The router log for a house whose IP appears in a login at 7:52 pm, for that evening only',
          bucket: 'grant',
          why: 'It tests one specific piece of evidence, for one evening.',
        },
        {
          id: 'messages',
          text: 'Every message a suspect has sent in the last two years',
          bucket: 'narrow',
          why: 'Messages might help, but two years is far more than needed. Ask for the evening of the theft.',
        },
        {
          id: 'location',
          text: 'A suspect’s phone location history for the past year',
          bucket: 'narrow',
          why: 'Only the incident window matters. A year reveals far too much private life.',
        },
        {
          id: 'everyone',
          text: 'All photos on the phones of everyone at the school',
          bucket: 'refuse',
          why: 'Hundreds of innocent people, with no specific reason to suspect any of them.',
        },
        {
          id: 'vibe',
          text: 'A student’s whole search history because they “seem suspicious”',
          bucket: 'refuse',
          why: 'A feeling is not a reason. There is no evidence linking them to the theft.',
        },
      ],
      explanation:
        'Good requests are tied to specific evidence and a short time window. Broad requests can sometimes be fixed by narrowing them. Requests with no real reason, or that sweep up lots of innocent people, should be refused.',
    },
    {
      id: 'match-not-proof',
      type: 'choice',
      title: 'It’s a match!',
      body: 'A doorbell camera shows someone in a dark hoodie, about 175 cm tall, walking past the hall at 7:45 pm. A suspect is 175 cm tall and owns a dark hoodie. An investigator says, “It’s a match.”',
      question: 'What is the best response?',
      options: [
        {
          id: 'proof',
          text: 'Then the suspect did it',
          feedback: 'How many people are about 175 cm and own a dark hoodie?',
        },
        {
          id: 'consistent',
          text: 'The suspect fits the description, but so could many people. It isn’t proof.',
          feedback: 'Yes.',
        },
        {
          id: 'useless',
          text: 'The footage is useless and should be thrown out',
          feedback:
            'It is still useful: it shows someone was there at 7:45 pm. It just can’t identify them.',
        },
      ],
      correct: ['consistent'],
      explanation:
        'A “match” means the evidence is consistent with the suspect. It doesn’t rule out everyone else. Investigators ask: how many other people would also match? Treating a weak match as proof is how innocent people get blamed.',
    },
    {
      id: 'why-it-matters',
      type: 'choice',
      title: 'Why does this matter?',
      question: 'Why do we require warrants for private data?',
      options: [
        { id: 'innocent', text: 'To protect the privacy of innocent people', feedback: 'Yes.' },
        {
          id: 'justify',
          text: 'To make investigators explain why they need the data',
          feedback: 'Yes.',
        },
        {
          id: 'fair',
          text: 'So evidence is collected fairly and can be trusted in court',
          feedback: 'Yes.',
        },
        {
          id: 'slow',
          text: 'To slow investigations down for no reason',
          feedback: 'Warrants can take time, but they have a purpose. What is it?',
        },
        {
          id: 'guilty',
          text: 'So that only guilty people’s data is ever collected',
          feedback:
            'Investigators can’t know who is guilty in advance. That’s why warrants focus on what is necessary and proportionate instead.',
        },
      ],
      correct: ['innocent', 'justify', 'fair'],
      explanation:
        'Warrants protect innocent people, make investigators justify their requests to someone independent, and help make sure evidence is collected lawfully so it can be trusted.',
    },
    {
      id: 'advise',
      type: 'reflect',
      title: 'Advise the investigator',
      body: 'An investigator wants to read every message on a 14-year-old witness’s phone, “just in case”.',
      question:
        'Write two or three sentences to the investigator: why is this a problem, and what could they ask for instead?',
      minLength: 80,
    },
    {
      id: 'key-idea',
      type: 'explain',
      title: 'Key idea',
      body: `Good investigators ask for **only what they need**, from **the right people**, for **the right time**.

And they remember that a match is not proof: evidence can be **consistent with** someone without showing that they did it.`,
    },
  ],
});
