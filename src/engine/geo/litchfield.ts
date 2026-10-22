/**
 * Litchfield National Park and Batchelor, about 100 km south of Darwin by road. Used by The
 * Midnight Raid (a Year 8 camp near Wangi Falls).
 *
 * Shapes are latitude/longitude pairs, simplified by hand from general geographic knowledge.
 * There is no coast in this view: everything is land. The camp itself is fictional and is
 * placed by the case file.
 */
import { projection, type MapRegion } from './region';

/** Map kilometres from latitude and longitude (south negative). Also used by case files. */
export const litchfieldLatLon = projection(-12.98, 130.6, -13.11);

const ll = litchfieldLatLon;
const shape = (pairs: [number, number][]) => pairs.map(([lat, lon]) => ll(lat, lon));

export const litchfield: MapRegion = {
  id: 'litchfield',
  name: 'Litchfield National Park',
  widthKm: 54,
  heightKm: 30,
  // All land: one shape well beyond the edges.
  land: [
    shape([
      [-12.9, 130.5],
      [-12.9, 131.2],
      [-13.35, 131.2],
      [-13.35, 130.5],
    ]),
  ],
  water: [
    // Plunge pools below the falls
    shape([
      [-13.1605, 130.6835],
      [-13.1612, 130.6855],
      [-13.1625, 130.6848],
      [-13.162, 130.6828],
    ]),
    shape([
      [-13.0962, 130.7825],
      [-13.0966, 130.7842],
      [-13.0978, 130.7838],
      [-13.0975, 130.7822],
    ]),
  ],
  parks: [
    {
      name: 'Litchfield National Park',
      points: shape([
        [-13.0, 130.62],
        [-12.99, 130.75],
        [-13.02, 130.86],
        [-13.05, 130.9],
        [-13.12, 130.92],
        [-13.2, 130.9],
        [-13.25, 130.82],
        [-13.27, 130.7],
        [-13.24, 130.62],
        [-13.13, 130.6],
      ]),
    },
  ],
  rivers: [
    {
      name: 'Finniss River',
      major: true,
      points: shape([
        [-13.0, 131.12],
        [-13.07, 131.05],
        [-13.17, 130.98],
        [-13.27, 130.9],
        [-13.33, 130.78],
      ]),
    },
    {
      name: 'Walker Creek',
      major: false,
      points: shape([
        [-13.08, 130.66],
        [-13.13, 130.68],
        [-13.16, 130.684],
        [-13.2, 130.66],
      ]),
    },
    {
      name: 'Florence Creek',
      major: false,
      points: shape([
        [-13.095, 130.765],
        [-13.0965, 130.783],
        [-13.1, 130.81],
        [-13.13, 130.86],
      ]),
    },
  ],
  roads: [
    {
      name: 'Litchfield Park Road',
      major: true,
      points: shape([
        [-12.98, 130.99],
        [-13.02, 131.01],
        [-13.049, 131.025],
        [-13.07, 130.97],
        [-13.095, 130.88],
        [-13.11, 130.82],
        [-13.105, 130.79],
        [-13.12, 130.75],
        [-13.17, 130.72],
        [-13.2, 130.71],
        [-13.17, 130.69],
        [-13.15, 130.68],
        [-13.08, 130.67],
        [-13.0, 130.66],
        [-12.97, 130.65],
      ]),
    },
    {
      name: 'Florence Falls road',
      major: false,
      points: shape([
        [-13.105, 130.79],
        [-13.1, 130.785],
      ]),
    },
    {
      name: 'Wangi Falls road',
      major: false,
      points: shape([
        [-13.155, 130.68],
        [-13.162, 130.683],
      ]),
    },
  ],
  runways: [[ll(-13.0455, 131.03), ll(-13.0545, 131.036)]],
  places: [
    { id: 'batchelor', name: 'Batchelor', at: ll(-13.049, 131.029), size: 'major' },
    { id: 'wangi-falls', name: 'Wangi Falls', at: ll(-13.1595, 130.6842), size: 'minor' },
    { id: 'florence-falls', name: 'Florence Falls', at: ll(-13.0953, 130.7832), size: 'minor' },
    {
      id: 'buley-rockhole',
      name: 'Buley Rockhole',
      at: ll(-13.106, 130.77),
      size: 'minor',
      labelSide: 'left',
    },
    { id: 'tolmer-falls', name: 'Tolmer Falls', at: ll(-13.208, 130.711), size: 'minor' },
    {
      id: 'termite-mounds',
      name: 'Magnetic termite mounds',
      at: ll(-13.112, 130.85),
      size: 'minor',
    },
  ],
  labels: [
    { text: 'Litchfield National Park', at: ll(-13.22, 130.8), onLand: true },
    { text: 'Tabletop Range', at: ll(-13.05, 130.74), onLand: true },
    {
      text: 'North to Palmerston and Darwin (over 100 km by road)',
      at: ll(-12.995, 130.93),
      onLand: true,
    },
  ],
};
