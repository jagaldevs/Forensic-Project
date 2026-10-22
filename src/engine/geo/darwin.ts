/**
 * The Darwin region: the city peninsula and harbour, the northern suburbs, the airport,
 * Palmerston, Howard Springs and Humpty Doo. Used by IP Lookup, the Map app and the Academy.
 *
 * Shapes are latitude/longitude pairs, simplified by hand from general geographic knowledge
 * (not traced from map data). Real place names are fine; homes in the cases are fictional and
 * are placed by the case files, never labelled here.
 */
import { projection, type MapRegion } from './region';

/** Map kilometres from latitude and longitude (south negative). Also used by case files. */
export const darwinLatLon = projection(-12.29, 130.7, -12.46);

const ll = darwinLatLon;
const shape = (pairs: [number, number][]) => pairs.map(([lat, lon]) => ll(lat, lon));

/**
 * The mainland, clockwise from beyond the top-right corner: down the right edge, along the
 * bottom, up the left edge to the Cox Peninsula shore, round Mandorah, into the harbour (West
 * Arm, Middle Arm, East Arm and the Elizabeth River), back past Frances Bay to the city, then
 * north along the coast to Lee Point and Shoal Bay. The corners sit outside the map so their
 * curves are never seen.
 */
const mainland = shape([
  [-12.2, 131.27],
  [-12.72, 131.27],
  [-12.72, 130.63],
  [-12.41, 130.63],
  // Cox Peninsula, facing Beagle Gulf
  [-12.418, 130.69],
  [-12.425, 130.72],
  [-12.432, 130.745],
  [-12.438, 130.757],
  [-12.443, 130.764],
  // West shore of the harbour
  [-12.452, 130.77],
  [-12.468, 130.773],
  [-12.485, 130.782],
  [-12.5, 130.79],
  [-12.512, 130.8],
  // West Arm
  [-12.525, 130.796],
  [-12.545, 130.785],
  [-12.565, 130.772],
  [-12.585, 130.765],
  [-12.598, 130.772],
  [-12.588, 130.785],
  [-12.566, 130.8],
  [-12.545, 130.812],
  [-12.528, 130.822],
  [-12.518, 130.835],
  // Middle Arm
  [-12.53, 130.845],
  [-12.555, 130.852],
  [-12.58, 130.86],
  [-12.605, 130.868],
  [-12.625, 130.878],
  [-12.61, 130.884],
  [-12.585, 130.88],
  [-12.558, 130.874],
  [-12.535, 130.87],
  [-12.518, 130.866],
  // East Arm and the Elizabeth River
  [-12.512, 130.885],
  [-12.51, 130.905],
  [-12.515, 130.925],
  [-12.523, 130.945],
  [-12.535, 130.962],
  [-12.548, 130.975],
  [-12.556, 130.985],
  [-12.545, 130.983],
  [-12.53, 130.968],
  [-12.515, 130.952],
  [-12.502, 130.935],
  [-12.497, 130.915],
  [-12.495, 130.898],
  [-12.5, 130.88],
  [-12.49, 130.87],
  [-12.478, 130.872],
  [-12.468, 130.868],
  // Frances Bay
  [-12.458, 130.866],
  [-12.452, 130.862],
  [-12.449, 130.855],
  [-12.454, 130.85],
  [-12.461, 130.85],
  // The city: Stokes Hill Wharf, the Waterfront, the Esplanade, Emery Point
  [-12.471, 130.849],
  [-12.47, 130.844],
  [-12.467, 130.84],
  [-12.463, 130.835],
  [-12.459, 130.829],
  [-12.457, 130.822],
  [-12.4545, 130.817],
  // Cullen Bay, Mindil Beach, Bullocky Point, Fannie Bay, East Point
  [-12.4515, 130.818],
  [-12.4495, 130.8205],
  [-12.4475, 130.825],
  [-12.444, 130.8295],
  [-12.4405, 130.8295],
  [-12.4365, 130.8275],
  [-12.432, 130.8305],
  [-12.426, 130.833],
  [-12.419, 130.831],
  [-12.413, 130.824],
  [-12.407, 130.816],
  [-12.402, 130.82],
  [-12.4, 130.829],
  // Ludmilla, Nightcliff, Rapid Creek, Casuarina, Lee Point
  [-12.401, 130.837],
  [-12.392, 130.839],
  [-12.381, 130.841],
  [-12.3745, 130.85],
  [-12.372, 130.856],
  [-12.365, 130.863],
  [-12.356, 130.872],
  [-12.348, 130.881],
  [-12.333, 130.89],
  // Shoal Bay
  [-12.3345, 130.9],
  [-12.338, 130.912],
  [-12.34, 130.93],
  [-12.335, 130.955],
  [-12.322, 130.98],
  [-12.305, 131.0],
  [-12.285, 131.02],
  [-12.2, 131.05],
]);

export const darwin: MapRegion = {
  id: 'darwin',
  name: 'the Darwin region',
  widthKm: 54,
  heightKm: 39,
  land: [mainland],
  water: [
    // Cullen Bay marina basin (behind its lock)
    shape([
      [-12.4505, 130.8205],
      [-12.4494, 130.8226],
      [-12.4503, 130.8247],
      [-12.4524, 130.8241],
      [-12.4527, 130.8216],
    ]),
  ],
  parks: [
    {
      name: 'East Point Reserve',
      points: shape([
        [-12.4075, 130.818],
        [-12.4025, 130.821],
        [-12.4008, 130.829],
        [-12.405, 130.834],
        [-12.412, 130.828],
        [-12.414, 130.823],
      ]),
    },
    {
      name: 'Charles Darwin National Park',
      points: shape([
        [-12.449, 130.867],
        [-12.446, 130.88],
        [-12.455, 130.887],
        [-12.468, 130.882],
        [-12.467, 130.87],
        [-12.459, 130.867],
      ]),
    },
    {
      name: 'Casuarina Coastal Reserve',
      points: shape([
        [-12.372, 130.857],
        [-12.364, 130.865],
        [-12.355, 130.874],
        [-12.347, 130.883],
        [-12.335, 130.891],
        [-12.339, 130.896],
        [-12.351, 130.887],
        [-12.36, 130.878],
        [-12.368, 130.869],
        [-12.375, 130.861],
      ]),
    },
    {
      name: 'Holmes Jungle',
      points: shape([
        [-12.398, 130.926],
        [-12.392, 130.94],
        [-12.402, 130.948],
        [-12.41, 130.937],
      ]),
    },
  ],
  rivers: [
    {
      name: 'Rapid Creek',
      major: false,
      points: shape([
        [-12.372, 130.856],
        [-12.378, 130.866],
        [-12.392, 130.872],
        [-12.401, 130.882],
      ]),
    },
    {
      name: 'Howard River',
      major: false,
      points: shape([
        [-12.42, 131.06],
        [-12.45, 131.07],
        [-12.48, 131.08],
        [-12.51, 131.1],
      ]),
    },
  ],
  roads: [
    {
      name: 'Stuart Highway',
      major: true,
      points: shape([
        [-12.46, 130.8395],
        [-12.452, 130.843],
        [-12.444, 130.847],
        [-12.436, 130.853],
        [-12.43, 130.865],
        [-12.4275, 130.879],
        [-12.429, 130.895],
        [-12.435, 130.92],
        [-12.448, 130.945],
        [-12.465, 130.962],
        [-12.485, 130.988],
        [-12.505, 131.015],
        [-12.52, 131.04],
        [-12.548, 131.062],
        [-12.59, 131.078],
        [-12.67, 131.1],
      ]),
    },
    {
      name: 'Tiger Brennan Drive',
      major: true,
      points: shape([
        [-12.46, 130.845],
        [-12.4535, 130.8535],
        [-12.4465, 130.866],
        [-12.447, 130.89],
        [-12.456, 130.91],
        [-12.465, 130.935],
        [-12.474, 130.956],
        [-12.48, 130.97],
      ]),
    },
    {
      name: 'Arnhem Highway',
      major: true,
      points: shape([
        [-12.548, 131.062],
        [-12.56, 131.09],
        [-12.572, 131.12],
        [-12.576, 131.14],
        [-12.58, 131.21],
      ]),
    },
    {
      name: 'Bagot Road',
      major: false,
      points: shape([
        [-12.437, 130.851],
        [-12.42, 130.855],
        [-12.4, 130.858],
        [-12.385, 130.864],
        [-12.378, 130.874],
      ]),
    },
    {
      name: 'Coast road',
      major: false,
      points: shape([
        [-12.403, 130.842],
        [-12.388, 130.8435],
        [-12.378, 130.852],
        [-12.37, 130.862],
        [-12.36, 130.872],
        [-12.348, 130.886],
      ]),
    },
    {
      name: 'East Point Road',
      major: false,
      points: shape([
        [-12.456, 130.837],
        [-12.445, 130.835],
        [-12.433, 130.836],
        [-12.422, 130.836],
        [-12.413, 130.829],
        [-12.408, 130.822],
      ]),
    },
    {
      name: 'McMillans Road',
      major: false,
      points: shape([
        [-12.39, 130.86],
        [-12.393, 130.88],
        [-12.388, 130.9],
        [-12.383, 130.92],
      ]),
    },
    {
      name: 'Howard Springs Road',
      major: false,
      points: shape([
        [-12.513, 131.03],
        [-12.5, 131.045],
        [-12.495, 131.055],
      ]),
    },
  ],
  runways: [[ll(-12.4065, 130.8635), ll(-12.4218, 130.893)]],
  places: [
    { id: 'darwin-city', name: 'Darwin City', at: ll(-12.4634, 130.8418), size: 'major' },
    { id: 'palmerston', name: 'Palmerston', at: ll(-12.481, 130.984), size: 'major' },
    { id: 'casuarina', name: 'Casuarina', at: ll(-12.3755, 130.8813), size: 'major' },
    { id: 'nightcliff', name: 'Nightcliff', at: ll(-12.384, 130.851), size: 'minor' },
    {
      id: 'fannie-bay',
      name: 'Fannie Bay',
      at: ll(-12.424, 130.8365),
      size: 'minor',
      labelSide: 'left',
    },
    { id: 'parap', name: 'Parap', at: ll(-12.431, 130.8435), size: 'minor' },
    { id: 'airport', name: 'Airport', at: ll(-12.41, 130.877), size: 'minor' },
    { id: 'winnellie', name: 'Winnellie', at: ll(-12.428, 130.887), size: 'minor' },
    { id: 'berrimah', name: 'Berrimah', at: ll(-12.435, 130.924), size: 'minor' },
    { id: 'east-arm', name: 'East Arm', at: ll(-12.487, 130.884), size: 'minor' },
    { id: 'lee-point', name: 'Lee Point', at: ll(-12.335, 130.892), size: 'minor' },
    {
      id: 'east-point',
      name: 'East Point',
      at: ll(-12.408, 130.82),
      size: 'minor',
      labelSide: 'left',
    },
    {
      id: 'mandorah',
      name: 'Mandorah',
      at: ll(-12.446, 130.762),
      size: 'minor',
      labelSide: 'left',
    },
    { id: 'howard-springs', name: 'Howard Springs', at: ll(-12.497, 131.052), size: 'minor' },
    {
      id: 'humpty-doo',
      name: 'Humpty Doo',
      at: ll(-12.574, 131.137),
      size: 'minor',
      labelSide: 'left',
    },
    // Close together near the city: named only when zoomed in.
    {
      id: 'waterfront',
      name: 'Waterfront',
      at: ll(-12.4685, 130.8462),
      size: 'minor',
      detail: true,
    },
    {
      id: 'cullen-bay',
      name: 'Cullen Bay',
      at: ll(-12.454, 130.8228),
      size: 'minor',
      detail: true,
      labelSide: 'left',
    },
    {
      id: 'mindil-beach',
      name: 'Mindil Beach',
      at: ll(-12.4445, 130.8315),
      size: 'minor',
      detail: true,
      labelSide: 'left',
    },
    {
      id: 'stuart-park',
      name: 'Stuart Park',
      at: ll(-12.446, 130.8455),
      size: 'minor',
      detail: true,
    },
    {
      id: 'larrakeyah',
      name: 'Larrakeyah',
      at: ll(-12.456, 130.828),
      size: 'minor',
      detail: true,
      labelSide: 'left',
    },
  ],
  labels: [
    { text: 'Beagle Gulf', at: ll(-12.36, 130.74) },
    { text: 'Darwin Harbour', at: ll(-12.485, 130.81), rotate: 55 },
    { text: 'Shoal Bay', at: ll(-12.305, 130.93) },
    { text: 'East Arm', at: ll(-12.505, 130.905), rotate: 10 },
    { text: 'Middle Arm', at: ll(-12.57, 130.866), rotate: 70 },
  ],
};
