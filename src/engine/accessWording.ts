import type { CaseFile } from './types';

/**
 * Wording for unlocking private data. Police-style cases use warrants from a magistrate;
 * school-scale cases (`warrants.kind: 'permission'`) ask the people responsible for the data.
 * The mechanics are the same.
 */
export interface AccessWording {
  /** Top-bar chip, e.g. "Warrants: 2". */
  chip: string;
  chipTitle: string;
  /** Locker list line for a locked item. */
  locked: string;
  /** "Investigators need … to access it." */
  need: string;
  apply: string;
  dialogTitle: string;
  submit: string;
  readReasons: string;
  granted: string;
  left: string;
  /** "… only agrees to a request that is necessary and proportionate." */
  decider: string;
  refusedFree: string;
  noneLeft: string;
  heading: string;
  noneRequested: string;
  giveBack: string;
}

const warrant: AccessWording = {
  chip: 'Warrants',
  chipTitle: 'Warrants you can still use in this case',
  locked: 'Needs a warrant',
  need: 'a warrant from a magistrate',
  apply: 'Apply for a warrant',
  dialogTitle: 'Warrant application',
  submit: 'Submit to magistrate',
  readReasons: 'Read the magistrate’s reasons',
  granted: 'Warrant granted',
  left: 'Warrants left',
  decider: 'A magistrate only grants',
  refusedFree: 'A refused application does not use a warrant.',
  noneLeft: 'You have no warrants left for this case.',
  heading: 'Warrant applications',
  noneRequested: 'No warrants requested.',
  giveBack: 'Give back all warrants',
};

const permission: AccessWording = {
  chip: 'Requests',
  chipTitle: 'Permission requests you can still make in this case',
  locked: 'Needs permission',
  need: 'permission from the people responsible for it',
  apply: 'Ask for permission',
  dialogTitle: 'Permission request',
  submit: 'Send request',
  readReasons: 'Read their reasons',
  granted: 'Permission given',
  left: 'Requests left',
  decider: 'People only agree to',
  refusedFree: 'A refused request is not used up.',
  noneLeft: 'You have no permission requests left for this case.',
  heading: 'Permission requests',
  noneRequested: 'No permission requests made.',
  giveBack: 'Give back all requests',
};

export function accessWording(c: Pick<CaseFile, 'warrants'>): AccessWording {
  return c.warrants.kind === 'permission' ? permission : warrant;
}
