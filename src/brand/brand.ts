import logoUrl from './haileybury-logo.jpg';

/**
 * Branding in one place.
 *
 * The logo is src/brand/haileybury-logo.jpg (crest above the HAILEYBURY wordmark, 300 x 300).
 * Large places show all of it; small ones (top bars) show just the crest, using `crest`.
 * To swap it, replace the file and adjust `crest`. Set logoUrl to null for the text placeholder.
 * Colours live in src/styles/tokens.css (search for PLACEHOLDER BRAND).
 */
export const brand: {
  schoolName: string;
  shortName: string;
  labName: string;
  /** URL of the logo image, or null to show the text placeholder. */
  logoUrl: string | null;
  logoAlt: string;
  /** The crest's box inside the logo image, in image pixels (for small sizes). */
  crest: { x: number; y: number; width: number; height: number; imageSize: number };
} = {
  schoolName: 'Haileybury Rendall School',
  shortName: 'HRS',
  labName: 'Digital Forensics Lab',
  logoUrl,
  logoAlt: 'Haileybury Rendall School',
  crest: { x: 75, y: 28, width: 150, height: 192, imageSize: 300 },
};
