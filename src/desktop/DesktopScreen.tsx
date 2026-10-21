import { useEffect, useLayoutEffect, useRef } from 'react';
import { useCaseFile } from '../app/CaseContext';
import { appComponents } from '../apps/registry';
import { setDesktopSize, topWindowId, useDesktop } from '../stores/desktopStore';
import { TopBar } from './TopBar';
import { Dock } from './Dock';
import { Toasts } from './Toasts';
import { DropWatcher } from './DropWatcher';
import { Window } from './Window';
import s from './desktop.module.css';

/** The investigator's workstation. */
export default function DesktopScreen() {
  const c = useCaseFile();
  const windows = useDesktop((st) => st.windows);
  const areaRef = useRef<HTMLDivElement>(null);
  const activeId = topWindowId(windows);

  useEffect(() => {
    const desktop = useDesktop.getState();
    desktop.switchCase(c.meta.id);
    // First visit: open the brief and the evidence locker so students know where to start.
    if (useDesktop.getState().windows.length === 0) {
      desktop.open('locker');
      desktop.open('brief');
    }
  }, [c.meta.id]);

  // Keep the window manager informed of the usable area (for clamping and compact mode).
  useLayoutEffect(() => {
    const el = areaRef.current;
    if (!el) return;
    const update = () => {
      setDesktopSize(el.clientWidth, el.clientHeight);
      useDesktop.getState().clampAll();
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className={s.desktop}>
      <TopBar />
      <main ref={areaRef} className={s.area} aria-label="Workstation desktop">
        <div className={s.wallpaper} aria-hidden="true">
          <div>
            <strong>{c.meta.title.toUpperCase()}</strong>
            Open an app from the dock to start investigating
          </div>
        </div>
        {windows.map((win) => {
          const App = appComponents[win.id];
          return (
            <Window key={win.id} win={win} active={win.id === activeId}>
              <App params={win.params} />
            </Window>
          );
        })}
      </main>
      <Dock />
      <Toasts />
      <DropWatcher />
    </div>
  );
}
