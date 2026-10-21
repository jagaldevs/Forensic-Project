import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expect, test, vi } from 'vitest';

test('a student can get from boot to the briefing even when localStorage is blocked', async () => {
  // Simulate a browser that blocks storage entirely (e.g. strict privacy settings).
  vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
    throw new DOMException('Storage is blocked', 'SecurityError');
  });
  // Import after blocking storage, so the stores hydrate without it.
  const { App } = await import('./App');
  const user = userEvent.setup();
  render(<App />);

  await user.keyboard('{Escape}'); // fast-forward the boot sequence
  await user.click(screen.getByRole('button', { name: /enter the lab/i }));
  await user.type(await screen.findByLabelText('Codename'), 'Agent Test');
  await user.click(screen.getByRole('button', { name: /continue/i }));

  expect(await screen.findByText(/Welcome, Agent Test/)).toBeInTheDocument();
  const card = screen.getByRole('article', { name: 'The Waterfront Alibi' });
  await user.click(within(card).getByRole('button', { name: /open case/i }));

  expect(
    await screen.findByRole(
      'button',
      { name: /accept case and open workstation/i },
      { timeout: 5000 },
    ),
  ).toBeInTheDocument();
  expect(screen.getByText(/Does the IP login place Riley at the Waterfront/)).toBeInTheDocument();
});
