import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { newCaseProgress } from '../engine/progressTypes';
import { axeViolations } from '../test/axe';
import { ClassSummary } from './ClassSummary';

afterEach(cleanup);

/** An uncompressed progress code (the format used when a browser can't compress). */
function rawCode(agentName: string, caseIds: string[]): string {
  const json = JSON.stringify({
    v: 3,
    agentName,
    academy: {},
    teacherModeUsedAt: null,
    cases: Object.fromEntries(caseIds.map((id) => [id, newCaseProgress(id, 0)])),
  });
  const b64 = btoa(String.fromCharCode(...new TextEncoder().encode(json)));
  return 'HRSFL1u.' + b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

test('Class summary builds one row per code, reports bad codes and passes axe', async () => {
  const onOpen = vi.fn();
  const { container } = render(<ClassSummary onOpen={onOpen} />);
  fireEvent.change(screen.getByLabelText('Progress codes'), {
    target: {
      value: `${rawCode('Falcon', ['waterfront-alibi'])}\n\n${rawCode('Comet', [])}\nHRSFL1u.@@@`,
    },
  });
  expect(screen.getByText('3 codes found')).toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Build summary' }));

  expect(await screen.findByRole('table', undefined, { timeout: 5000 })).toBeInTheDocument();
  expect(screen.getByRole('rowheader', { name: 'Falcon' })).toBeInTheDocument();
  expect(screen.getByText('Case not started')).toBeInTheDocument();
  expect(screen.getByText(/Code 3 couldn’t be read/)).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: 'Open Falcon’s work' }));
  expect(onOpen).toHaveBeenCalledWith(expect.objectContaining({ agentName: 'Falcon' }));

  expect(await axeViolations(container)).toEqual([]);
});
