import { createContext, useContext } from 'react';
import type { CaseFile } from '../engine/types';

export const CaseContext = createContext<CaseFile | null>(null);

/** The loaded case. Only usable inside a case (briefing, desktop, report). */
export function useCaseFile(): CaseFile {
  const c = useContext(CaseContext);
  if (!c) throw new Error('useCaseFile must be used inside a loaded case');
  return c;
}
