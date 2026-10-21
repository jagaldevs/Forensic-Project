import { lazy, Suspense, useEffect, useState } from 'react';
import { useSettings } from '../stores/settingsStore';
import { useNav } from '../stores/navStore';
import { BootScreen } from '../screens/BootScreen';
import { AgentScreen } from '../screens/AgentScreen';
import { CaseSelectScreen } from '../screens/CaseSelectScreen';
import { Loading } from '../screens/Loading';

/** Everything inside a case (briefing, desktop, report) is loaded on demand, as is the academy. */
const CaseShell = lazy(() => import('./CaseShell'));
const AcademyScreen = lazy(() => import('../academy/AcademyScreen'));
const MissionScreen = lazy(() => import('../academy/MissionScreen'));

export function App() {
  const [booted, setBooted] = useState(false);
  const agentName = useSettings((s) => s.agentName);
  const textScale = useSettings((s) => s.textScale);
  const screen = useNav((s) => s.screen);
  const activeCaseId = useNav((s) => s.activeCaseId);
  const activeMissionId = useNav((s) => s.activeMissionId);

  useEffect(() => {
    document.documentElement.style.setProperty('--text-scale', String(textScale));
  }, [textScale]);

  if (!booted) return <BootScreen onDone={() => setBooted(true)} />;
  if (!agentName || screen === 'agent') return <AgentScreen />;

  if (screen === 'academy' || (screen === 'mission' && !activeMissionId))
    return (
      <Suspense fallback={<Loading label="Opening the Training Academy" />}>
        <AcademyScreen />
      </Suspense>
    );
  if (screen === 'mission' && activeMissionId)
    return (
      <Suspense fallback={<Loading label="Loading mission" />}>
        <MissionScreen missionId={activeMissionId} />
      </Suspense>
    );

  if (screen === 'cases' || !activeCaseId) return <CaseSelectScreen />;

  return (
    <Suspense fallback={<Loading label="Opening case files" />}>
      <CaseShell caseId={activeCaseId} screen={screen} />
    </Suspense>
  );
}
