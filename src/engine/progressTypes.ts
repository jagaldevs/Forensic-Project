import type { Relation, Verdict } from './types';

/** A string of magenta on the evidence board: evidence → question claim. Also the judgement's attachments. */
export interface BoardLink {
  id: string;
  evidenceId: string;
  questionId: string;
  relation: Relation;
}

export interface CheckMessage {
  tone: 'good' | 'hint';
  text: string;
}

export interface CheckResult {
  correct: boolean;
  messages: CheckMessage[];
  at: number;
}

export interface Judgement {
  /** null for open questions or when not chosen yet. */
  verdict: Verdict | null;
  /** For open questions this is the whole answer. */
  explanation: string;
  limitation: string;
  attempts: number;
  lastResult: CheckResult | null;
}

export interface WarrantApplication {
  requestId: string;
  justification: string;
  granted: boolean;
  at: number;
}

export interface CaseProgress {
  caseId: string;
  startedAt: number;
  briefingRead: boolean;
  /** evidence id → first time viewed (ms). */
  viewed: Record<string, number>;
  /** Pinned evidence id → card position on the board. */
  board: Record<string, { x: number; y: number }>;
  links: BoardLink[];
  warrants: WarrantApplication[];
  /** drop id → time released (ms). */
  releasedDrops: Record<string, number>;
  judgements: Record<string, Judgement>;
  submittedAt: number | null;
}

export function newCaseProgress(caseId: string, now = Date.now()): CaseProgress {
  return {
    caseId,
    startedAt: now,
    briefingRead: false,
    viewed: {},
    board: {},
    links: [],
    warrants: [],
    releasedDrops: {},
    judgements: {},
    submittedAt: null,
  };
}

export function emptyJudgement(): Judgement {
  return { verdict: null, explanation: '', limitation: '', attempts: 0, lastResult: null };
}

/** Evidence attached to a question = the board links to it. */
export function attachedEvidenceIds(progress: CaseProgress, questionId: string): string[] {
  return progress.links.filter((l) => l.questionId === questionId).map((l) => l.evidenceId);
}
