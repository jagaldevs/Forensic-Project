import { expect, test } from 'vitest';
import { levelFromLink } from './linkLevel';

test('levelFromLink reads the class level from the shared link', () => {
  expect(levelFromLink('?level=guided')).toBe('guided');
  expect(levelFromLink('?level=Deep-Dive')).toBe('deep');
  expect(levelFromLink('?x=1&level=standard')).toBe('standard');
  expect(levelFromLink('?level=none')).toBeNull();
  // No level, or one we don't know: keep whatever the device already has.
  expect(levelFromLink('')).toBeUndefined();
  expect(levelFromLink('?level=expert')).toBeUndefined();
});
