import type { KeyboardEvent } from 'react';

/**
 * Arrow-key behaviour for a role="tablist" (the ARIA tabs pattern): Left/Right move between
 * tabs and select them, Home/End jump to the ends. Give the selected tab tabIndex 0 and the
 * others -1, so Tab moves past the row to the panel.
 */
export function onTabListKeyDown(e: KeyboardEvent<HTMLElement>) {
  const tabs = Array.from(e.currentTarget.querySelectorAll<HTMLElement>('[role="tab"]'));
  const i = tabs.indexOf(document.activeElement as HTMLElement);
  if (i < 0) return;
  const next = {
    ArrowRight: (i + 1) % tabs.length,
    ArrowLeft: (i - 1 + tabs.length) % tabs.length,
    Home: 0,
    End: tabs.length - 1,
  }[e.key];
  if (next === undefined) return;
  e.preventDefault();
  tabs[next]!.focus();
  tabs[next]!.click();
}
