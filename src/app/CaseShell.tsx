import { lazy, Suspense, useEffect, useState } from 'react';
import { loadCase } from '../cases';
import type { CaseFile } from '../engine/types';
import { useNav, type Screen } from '../stores/navStore';
import { useProgress } from '../stores/progressStore';
import { CaseContext } from './CaseContext';
import { Loading } from '../screens/Loading';
import { BriefingScreen } from '../screens/BriefingScreen';

const DesktopScreen = lazy(() => import('../desktop/DesktopScreen'));
const ReportScreen = lazy(() => import('../screens/ReportScreen'));

/** Loads a case, then shows its briefing, desktop or report. */
export default function CaseShell({ caseId, screen }: { caseId: string; screen: Screen }) {
  const [loaded, setLoaded] = useState<{ id: string; data: CaseFile } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const exitCase = useNav((s) => s.exitCase);

  useEffect(() => {
    let cancelled = false;
    loadCase(caseId)
      .then((data) => {
        if (cancelled) return;
        useProgress.getState().startCase(caseId);
        setLoaded({ id: caseId, data });
      })
      .catch(() => {
        if (!cancelled) setError('This case could not be opened.');
      });
    return () => {
      cancelled = true;
    };
  }, [caseId]);

  if (error)
    return (
      <Loading label={error}>
        <button type="button" onClick={exitCase}>
          Back to cases
        </button>
      </Loading>
    );
  if (!loaded || loaded.id !== caseId) return <Loading label="Decrypting case files" />;

  return (
    <CaseContext.Provider value={loaded.data}>
      <Suspense fallback={<Loading label="Starting workstation" />}>
        {screen === 'briefing' && <BriefingScreen />}
        {screen === 'desktop' && <DesktopScreen />}
        {screen === 'report' && <ReportScreen />}
      </Suspense>
    </CaseContext.Provider>
  );
}
