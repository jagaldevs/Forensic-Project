import { lazy, Suspense, useEffect, useState } from 'react';
import { useSettings } from '../stores/settingsStore';
import { useNav } from '../stores/navStore';
import { BootScreen } from '../screens/BootScreen';
import { AgentScreen } from '../screens/AgentScreen';
import { CaseSelectScreen } from '../screens/CaseSelectScreen';
import { Loading } from '../screens/Loading';

/** Everything inside a case (briefing, desktop, report) is loaded on demand. */
const CaseShell = lazy(() => import('./CaseShell'));

export function App() {
  const [booted, setBooted] = useState(false);
  const agentName = useSettings((s) => s.agentName);
  const textScale = useSettings((s) => s.textScale);
  const screen = useNav((s) => s.screen);
  const activeCaseId = useNav((s) => s.activeCaseId);

  useEffect(() => {
    document.documentElement.style.setProperty('--text-scale', String(textScale));
  }, [textScale]);

  if (!booted) return <BootScreen onDone={() => setBooted(true)} />;
  if (!agentName || screen === 'agent') return <AgentScreen />;
  if (screen === 'cases' || !activeCaseId) return <CaseSelectScreen />;

  return (
    <Suspense fallback={<Loading label="Opening case files" />}>
      <CaseShell caseId={activeCaseId} screen={screen} />
    </Suspense>
  );
}
