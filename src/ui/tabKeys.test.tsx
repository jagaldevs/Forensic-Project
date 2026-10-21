import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { afterEach, expect, test } from 'vitest';
import { onTabListKeyDown } from './tabKeys';

afterEach(cleanup);

function Tabs() {
  const [selected, setSelected] = useState('a');
  return (
    <div role="tablist" aria-label="Test" onKeyDown={onTabListKeyDown}>
      {['a', 'b', 'c'].map((t) => (
        <button
          key={t}
          type="button"
          role="tab"
          aria-selected={selected === t}
          tabIndex={selected === t ? 0 : -1}
          onClick={() => setSelected(t)}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

test('arrow keys, Home and End move between tabs and select them', async () => {
  const user = userEvent.setup();
  render(<Tabs />);
  await user.tab();
  expect(screen.getByRole('tab', { name: 'a' })).toHaveFocus();

  await user.keyboard('{ArrowRight}');
  expect(screen.getByRole('tab', { name: 'b' })).toHaveFocus();
  expect(screen.getByRole('tab', { name: 'b' })).toHaveAttribute('aria-selected', 'true');

  await user.keyboard('{ArrowLeft}{ArrowLeft}');
  expect(screen.getByRole('tab', { name: 'c' })).toHaveAttribute('aria-selected', 'true');

  await user.keyboard('{Home}');
  expect(screen.getByRole('tab', { name: 'a' })).toHaveAttribute('aria-selected', 'true');
  await user.keyboard('{End}');
  expect(screen.getByRole('tab', { name: 'c' })).toHaveFocus();
});
