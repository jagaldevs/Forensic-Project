/**
 * Mission 4: IP Addresses & Networks. The Quinn household is fictional; the IP comes from the
 * 198.51.100.0/24 documentation range and the MACs are locally administered.
 */
import { defineMission } from '../../engine/missionTypes';
import { meta } from './meta';

const router = {
  kind: 'table' as const,
  caption: 'Quinn household router (TopNet HomeHub). Public IP address: 198.51.100.23',
  columns: ['Device name', 'MAC address', 'Connected'],
  rows: [
    ['MORGAN-LAPTOP', '02:3C:11:A0:00:01', '6:40 pm to 10:15 pm'],
    ['JESS-PHONE', '02:3C:11:A0:00:02', 'all evening'],
    ['TAYLOR-TABLET', '02:3C:11:A0:00:03', '7:00 pm to 8:30 pm'],
    ['LOUNGE-TV', '02:3C:11:A0:00:04', '6:00 pm to 9:45 pm'],
    ['GAME-CONSOLE', '02:3C:11:A0:00:05', '7:10 pm to 7:50 pm'],
  ],
  mono: true,
};

export default defineMission({
  meta,
  steps: [
    {
      id: 'what-is-an-ip',
      type: 'explain',
      title: 'One house, one address',
      body: `Every connection to the internet needs an **IP address**, a bit like a return address on a letter, so replies come back to the right place.

A home internet provider usually gives each household **one public IP address**. The home router shares it between every device in the house. Inside the home, each device is told apart by the router using its name and its **MAC address**.

So the rest of the internet sees the household connection, not the individual device.

(All IP addresses in this lab come from special ranges reserved for examples, so they can never belong to a real person.)`,
      media: [router],
    },
    {
      id: 'which-device',
      type: 'choice',
      title: 'Which device?',
      body: 'A website records a visit from 198.51.100.23 at 7:15 pm.',
      media: [router],
      question: 'Which device made the visit?',
      options: [
        {
          id: 'console',
          text: 'GAME-CONSOLE, because it was only on briefly around then',
          feedback:
            'It was online, but so were others. Does the website’s record say which device?',
        },
        {
          id: 'tablet',
          text: 'TAYLOR-TABLET',
          feedback: 'It was online at 7:15, but so were four other devices.',
        },
        { id: 'cant-tell', text: 'You can’t tell from the IP address alone', feedback: 'Yes.' },
      ],
      correct: ['cant-tell'],
      explanation:
        'At 7:15 pm all five devices were online and all of them share 198.51.100.23. The website only sees the household’s public IP, so the visit could have come from any of them. And even knowing the device wouldn’t tell you who was using it.',
    },
    {
      id: 'public-row',
      type: 'spot',
      title: 'What the internet sees',
      question: 'Which detail does a website see when someone in the house visits it?',
      rows: [
        { id: 'public', label: 'Public IP address', value: '198.51.100.23' },
        { id: 'mac', label: 'MAC address of TAYLOR-TABLET', value: '02:3C:11:A0:00:03' },
        { id: 'name', label: 'Device name', value: 'TAYLOR-TABLET' },
        { id: 'wifi', label: 'Wi-Fi network name', value: 'Quinn-Home-5G' },
      ],
      correct: ['public'],
      hint: 'MAC addresses, device names and the Wi-Fi name stay inside the home network. What leaves the house?',
      explanation:
        'Websites see the public IP address of the household connection. Device names and MAC addresses are only known to the home router, which is why investigators sometimes need the router’s log.',
    },
    {
      id: 'geolocation',
      type: 'choice',
      title: 'Where is 198.51.100.23?',
      body: 'A free lookup website says 198.51.100.23 is in “Darwin (regional hub)” with an accuracy radius of 20 km. The Quinns actually live in Nightcliff (pin 1).',
      media: [
        {
          kind: 'map',
          description:
            'Map of the Darwin region. A 20 km circle centred on Darwin City covers the city, Nightcliff, Casuarina, the airport and Berrimah.',
          circle: { centre: { x: 18.6, y: 27.4 }, radiusKm: 20, label: 'Darwin (regional hub)' },
          markers: [
            {
              id: 'quinn-home',
              label: 'Quinn home, Nightcliff',
              kind: 'home',
              at: { x: 15.9, y: 13.8 },
            },
          ],
        },
      ],
      question: 'What does the lookup tell you about where the connection is?',
      options: [
        {
          id: 'city',
          text: 'It is in Darwin City',
          feedback: 'That is only where the pin was dropped. What does the circle mean?',
        },
        {
          id: 'circle',
          text: 'Somewhere inside a 20 km circle, which includes Nightcliff',
          feedback: 'Yes.',
        },
        {
          id: 'house',
          text: 'Exactly which house it is',
          feedback: 'IP geolocation never gives an exact house. Look at the size of the circle.',
        },
      ],
      correct: ['circle'],
      explanation:
        'Lookup sites guess a location from where the internet provider registers its addresses, often a regional hub. The pin is just the centre of the guess; the accuracy circle shows everywhere the connection could be. Here the real home is 15 km from the pin.',
    },
    {
      id: 'ip-can-show',
      type: 'classify',
      title: 'What can an IP address tell you?',
      question: 'On its own, can an IP address tell you…',
      buckets: [
        { id: 'yes', label: 'Yes' },
        { id: 'no', label: 'No' },
      ],
      items: [
        {
          id: 'isp',
          text: 'which internet provider it belongs to',
          bucket: 'yes',
          why: 'Address blocks are registered to providers.',
        },
        {
          id: 'region',
          text: 'roughly which region it is in',
          bucket: 'yes',
          why: 'Geolocation gives an estimate, with an accuracy radius.',
        },
        {
          id: 'house',
          text: 'the exact house',
          bucket: 'no',
          why: 'Only the provider’s customer records could show that.',
        },
        {
          id: 'device',
          text: 'which device in the house was used',
          bucket: 'no',
          why: 'All devices share the one public IP.',
        },
        {
          id: 'person',
          text: 'which person was typing',
          bucket: 'no',
          why: 'A device is not a person; anyone could be using it.',
        },
      ],
      explanation:
        'An IP address points to a connection run by a provider, in a rough area. Getting from there to a house needs provider records; from a house to a device needs the router log; and from a device to a person needs other evidence again.',
    },
    {
      id: 'key-idea',
      type: 'explain',
      title: 'Key idea',
      body: `Think of it as a chain: **IP address → household connection → device → person**.

Each link needs its own evidence. IP geolocation is an estimate with a radius, not a pin on a house. You’ll use exactly this chain in The Waterfront Alibi.`,
    },
  ],
});
