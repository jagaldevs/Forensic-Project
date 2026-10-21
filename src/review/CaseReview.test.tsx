import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, test } from 'vitest';
import waterfront from '../cases/waterfront-alibi/case';
import { newCaseProgress } from '../engine/progressTypes';
import { CaseReview } from './CaseReview';

afterEach(cleanup);

test('Teacher Review shows the support level, nudges and Deep dive answers with model answers', async () => {
  const [first] = waterfront.extensions!;
  const progress = {
    ...newCaseProgress(waterfront.meta.id, 0),
    supportLevel: 'guided' as const,
    supportLevelsUsed: { standard: 1, guided: 2 },
    nudgesUsed: ['q2-at-home'],
    extensionAnswers: { [first!.id]: 'Both places are inside the circle.' },
  };
  render(<CaseReview caseId={waterfront.meta.id} progress={progress} />);

  expect(await screen.findByText('Guided (also used: Standard)')).toBeInTheDocument();
  expect(screen.getByText(/Guided nudges opened on Q2/)).toBeInTheDocument();
  expect(screen.getByText('Both places are inside the circle.')).toBeInTheDocument();
  expect(screen.getByText(`Model answer: ${first!.modelAnswer}`)).toBeInTheDocument();
});
