import type { Relation, Verdict } from '../engine/types';
import type { IconName } from './Icon';

/** Verdicts in the order students see them, strongest first. */
export const verdictOrder: Verdict[] = [
  'strongly-supported',
  'possible',
  'not-supported',
  'cant-tell',
];

/** Verdict wording shown to students. Status is never shown by colour alone. */
export const verdictInfo: Record<Verdict, { label: string; description: string; icon: IconName }> =
  {
    'strongly-supported': {
      label: 'Strongly supported',
      description: 'The evidence clearly backs the claim.',
      icon: 'supports',
    },
    possible: {
      label: 'Possible',
      description: "The evidence fits the claim but doesn't prove it.",
      icon: 'inconclusive',
    },
    'not-supported': {
      label: 'Not supported',
      description: 'The evidence points against the claim, or the claim relies on a mistake.',
      icon: 'contradicts',
    },
    'cant-tell': {
      label: "Can't tell",
      description: "The evidence can't decide either way.",
      icon: 'question',
    },
  };

export type StatusKind = Relation | 'unassessed';

export const statusInfo: Record<StatusKind, { label: string; icon: IconName }> = {
  supports: { label: 'Supports', icon: 'supports' },
  contradicts: { label: 'Contradicts', icon: 'contradicts' },
  inconclusive: { label: 'Inconclusive', icon: 'inconclusive' },
  unassessed: { label: 'Not yet assessed', icon: 'unassessed' },
};
