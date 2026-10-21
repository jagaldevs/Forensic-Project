import { Suspense, useEffect, useId, useRef, type KeyboardEvent, type ReactNode } from 'react';
import { appMeta } from './appMeta';
import { useDesktop, type Rect, type WindowState } from '../stores/desktopStore';
import { usePointerDrag } from '../lib/usePointerDrag';
import { Icon } from '../ui/Icon';
import { Button } from '../ui/Button';
import s from './desktop.module.css';

const KEY_STEP = 24;

interface WindowProps {
  win: WindowState;
  active: boolean;
  children: ReactNode;
}

/**
 * A draggable, resizable window. Hand-rolled with Pointer Events (mouse, touch, pen) and
 * fully keyboard operable: focus the title bar, then use the arrow keys to move and
 * Shift + arrow keys to resize.
 */
export function Window({ win, active, children }: WindowProps) {
  const meta = appMeta[win.id];
  const titleId = useId();
  const helpId = useId();
  const ref = useRef<HTMLElement>(null);
  const start = useRef<Rect>(win);
  const { focus, close, minimise, toggleMaximise, setRect } = useDesktop.getState();

  // Move keyboard focus into the front window when it opens, is restored, or is brought
  // forward from the dock (unless focus is already inside it).
  useEffect(() => {
    const el = ref.current;
    if (active && !win.minimised && el && !el.contains(document.activeElement))
      el.focus({ preventScroll: true });
  }, [active, win.minimised]);

  const dragMove = usePointerDrag({
    onStart: (e) => {
      if ((e.target as HTMLElement).closest('button') || win.maximised) return false;
      start.current = win;
    },
    onMove: (dx, dy) =>
      setRect(win.id, { ...start.current, x: start.current.x + dx, y: start.current.y + dy }),
  });

  const dragResize = usePointerDrag({
    onStart: () => {
      start.current = win;
    },
    onMove: (dx, dy) =>
      setRect(win.id, { ...start.current, w: start.current.w + dx, h: start.current.h + dy }),
  });

  // After closing or minimising, the next window takes focus (effect above); if there is
  // none, focus goes to this app's dock button rather than being lost.
  const hide = (action: (id: typeof win.id) => void) => {
    action(win.id);
    requestAnimationFrame(() => {
      if (document.activeElement && document.activeElement !== document.body) return;
      document.querySelector<HTMLElement>(`[data-dock-app="${win.id}"]`)?.focus();
    });
  };

  const onTitleKey = (e: KeyboardEvent) => {
    const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[
      e.key
    ];
    if (!d || win.maximised) return;
    e.preventDefault();
    const [dx, dy] = d as [number, number];
    if (e.shiftKey) setRect(win.id, { ...win, w: win.w + dx * KEY_STEP, h: win.h + dy * KEY_STEP });
    else setRect(win.id, { ...win, x: win.x + dx * KEY_STEP, y: win.y + dy * KEY_STEP });
  };

  const style = win.maximised
    ? { zIndex: win.z }
    : { left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z };

  return (
    <section
      ref={ref}
      className={`${s.window} ${win.maximised ? s.maximised : ''} ${active ? s.active : ''}`}
      style={style}
      hidden={win.minimised}
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      tabIndex={-1}
      onPointerDownCapture={() => focus(win.id)}
      onFocusCapture={() => focus(win.id)}
    >
      <header
        className={s.titlebar}
        onPointerDown={dragMove}
        onDoubleClick={() => toggleMaximise(win.id)}
        onKeyDown={onTitleKey}
        tabIndex={0}
        aria-describedby={helpId}
      >
        <Icon name={meta.icon} size={18} />
        <h2 id={titleId} className={s.windowTitle}>
          {meta.title}
        </h2>
        <span id={helpId} className="visually-hidden">
          Use arrow keys to move this window, and Shift with arrow keys to resize it.
        </span>
        <div className={s.windowButtons}>
          <Button
            size="small"
            variant="ghost"
            icon="minimise"
            label={`Minimise ${meta.title}`}
            onClick={() => hide(minimise)}
          />
          <Button
            size="small"
            variant="ghost"
            icon={win.maximised ? 'restore' : 'maximise'}
            label={win.maximised ? `Restore ${meta.title}` : `Maximise ${meta.title}`}
            onClick={() => toggleMaximise(win.id)}
          />
          <Button
            size="small"
            variant="ghost"
            icon="close"
            label={`Close ${meta.title}`}
            onClick={() => hide(close)}
          />
        </div>
      </header>
      <div className={s.windowBody}>
        <Suspense fallback={<div className={s.windowLoading}>Loading…</div>}>{children}</Suspense>
      </div>
      {!win.maximised && (
        <div className={s.resizeHandle} onPointerDown={dragResize} aria-hidden="true">
          <svg viewBox="0 0 16 16" width="16" height="16">
            <path d="M14 6v8H6M14 10v4h-4" stroke="currentColor" strokeWidth="1.5" fill="none" />
          </svg>
        </div>
      )}
    </section>
  );
}
