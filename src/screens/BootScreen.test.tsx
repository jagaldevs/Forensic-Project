import { act, cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { BootScreen } from './BootScreen';

beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

test('the start-up waits for the student to press "Enter the lab"', async () => {
  const onDone = vi.fn();
  render(<BootScreen onDone={onDone} />);
  // Each line schedules the next, so step through the animation, then wait a long time.
  for (let i = 0; i < 60; i++) act(() => void vi.advanceTimersByTime(500));
  expect(onDone).not.toHaveBeenCalled();

  const enter = screen.getByRole('button', { name: /enter the lab/i });
  expect(enter).toHaveFocus();
  await userEvent.setup({ advanceTimers: vi.advanceTimersByTime }).click(enter);
  expect(onDone).toHaveBeenCalledTimes(1);
});

test('a key or "Skip intro" fast-forwards the animation but does not leave', async () => {
  const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
  const onDone = vi.fn();
  render(<BootScreen onDone={onDone} />);
  expect(screen.queryByRole('button', { name: /enter the lab/i })).toBeNull();

  await user.keyboard('{Escape}');
  expect(screen.getByRole('button', { name: /enter the lab/i })).toHaveFocus();
  expect(onDone).not.toHaveBeenCalled();

  await user.keyboard('{Enter}');
  expect(onDone).toHaveBeenCalledTimes(1);
});
