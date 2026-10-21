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
  /** Assessment cases: when the student last pressed Save (cleared by any later edit). */
  savedAt?: number | null;
}

/** One line of the chain-of-custody log, beyond collection (which is derived). */
export interface CustodyEvent {
  at: number;
  evidenceId: string;
  action: 'viewed' | 'verified';
  /** For "verified": whether the hash matched the collection record. */
  ok?: boolean;
}

/** The custody log keeps the most recent events only, so progress codes stay short. */
export const MAX_CUSTODY_EVENTS = 200;

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
  /** Timeline: deviceId → the UTC offset the student believes its clock was set to. */
  clockCorrections?: Record<string, string>;
  /** Views and hash checks, oldest first (capped at MAX_CUSTODY_EVENTS). */
  custody?: CustodyEvent[];
  /** Set when an assessment is submitted: nothing the student does changes it after that. */
  locked?: boolean;
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

/**
 * A verdict question is done when its check passed; an open question when it was submitted.
 * In an assessment (no checking), a question is done once its answer is saved.
 */
export function isQuestionDone(progress: CaseProgress, question: { id: string }): boolean {
  const j = progress.judgements[question.id];
  return j?.lastResult?.correct === true || !!j?.savedAt;
}

/** Evidence attached to a question = the board links to it. */
export function attachedEvidenceIds(progress: CaseProgress, questionId: string): string[] {
  return progress.links.filter((l) => l.questionId === questionId).map((l) => l.evidenceId);
}
