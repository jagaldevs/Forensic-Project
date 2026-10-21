/**
 * Branding in one place.
 *
 * To add the official logo: put the file in src/brand/ (SVG or PNG) and set
 *   import logoUrl from './haileybury-logo.svg';
 *   export const brand = { ..., logoUrl };
 * Colours live in src/styles/tokens.css (search for PLACEHOLDER BRAND).
 */
export const brand: {
  schoolName: string;
  shortName: string;
  labName: string;
  /** URL of the logo image, or null to show the text placeholder. */
  logoUrl: string | null;
  logoAlt: string;
} = {
  schoolName: 'Haileybury Rendall School',
  shortName: 'HRS',
  labName: 'Digital Forensics Lab',
  logoUrl: null,
  logoAlt: 'Haileybury Rendall School logo',
};
