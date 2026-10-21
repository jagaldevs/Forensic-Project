import { useLayoutEffect, useRef, type PointerEvent as ReactPointerEvent } from 'react';

interface DragHandlers {
  /** Return false to cancel the drag (e.g. the pointer went down on a button). */
  onStart?: (e: ReactPointerEvent) => boolean | void;
  onMove: (dx: number, dy: number) => void;
  onEnd?: (moved: boolean) => void;
}

/**
 * Pointer-events drag helper shared by windows, resize handles and board cards.
 * Works the same for mouse, touch and pen. Returns an onPointerDown handler.
 */
export function usePointerDrag({ onStart, onMove, onEnd }: DragHandlers) {
  const handlers = useRef({ onStart, onMove, onEnd });
  useLayoutEffect(() => {
    handlers.current = { onStart, onMove, onEnd };
  });

  return (e: ReactPointerEvent<HTMLElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    if (handlers.current.onStart?.(e) === false) return;
    const target = e.currentTarget;
    const startX = e.clientX;
    const startY = e.clientY;
    let moved = false;
    target.setPointerCapture(e.pointerId);

    const move = (ev: PointerEvent) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      if (!moved && Math.hypot(dx, dy) < 3) return;
      moved = true;
      handlers.current.onMove(dx, dy);
    };
    const end = () => {
      target.removeEventListener('pointermove', move);
      target.removeEventListener('pointerup', end);
      target.removeEventListener('pointercancel', end);
      handlers.current.onEnd?.(moved);
    };
    target.addEventListener('pointermove', move);
    target.addEventListener('pointerup', end);
    target.addEventListener('pointercancel', end);
  };
}
