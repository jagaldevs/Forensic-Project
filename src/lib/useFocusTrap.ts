import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Keeps keyboard focus inside a modal: focuses it (or its [data-autofocus] child) on open,
 * wraps Tab at both ends, pulls focus back in if it was lost (e.g. a focused button became
 * disabled), closes on Escape, and returns focus to where it was on close.
 */
export function useFocusTrap(ref: RefObject<HTMLElement | null>, onEscape: () => void) {
  const onEscapeRef = useRef(onEscape);
  useEffect(() => {
    onEscapeRef.current = onEscape;
  });

  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const node = ref.current;
    const first = node?.querySelector<HTMLElement>('[data-autofocus]') ?? node;
    first?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onEscapeRef.current();
      }
      if (e.key !== 'Tab' || !node) return;
      const items = Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (!items.length) return;
      const firstItem = items[0]!;
      const lastItem = items.at(-1)!;
      const active = document.activeElement;
      if (!node.contains(active) || (active === node && e.shiftKey)) {
        e.preventDefault();
        (e.shiftKey ? lastItem : firstItem).focus();
      } else if (e.shiftKey && active === firstItem) {
        e.preventDefault();
        lastItem.focus();
      } else if (!e.shiftKey && active === lastItem) {
        e.preventDefault();
        firstItem.focus();
      }
    };
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('keydown', onKey, true);
      previouslyFocused?.focus?.();
    };
  }, [ref]);
}
