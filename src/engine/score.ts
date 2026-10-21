/**
 * Auto-scoring of the objective parts of a case (verdict + evidence), for Teacher Review.
 * Uses the same rule as the student-facing check: an accepted verdict, every key item attached,
 * and no distractors. Written reasoning is never scored; the teacher reads it.
 */
import { attachedEvidenceIds, type CaseProgress } from './progressTypes';
import type { CaseFile, Question } from './types';

export interface QuestionScore {
  question: Question;
  number: number;
  /** null for open questions (read by the teacher, not scored). */
  correct: boolean | null;
  verdictOk: boolean;
  /** Key evidence the student did not attach. */
  missingKey: string[];
  /** Distractors the student did attach. */
  distractors: string[];
  answered: boolean;
}

export interface CaseScore {
  questions: QuestionScore[];
  correct: number;
  /** Number of verdict (auto-scored) questions. */
  total: number;
}

export function scoreCase(c: CaseFile, progress: CaseProgress): CaseScore {
  const questions = c.questions.map((q, i): QuestionScore => {
    const j = progress.judgements[q.id];
    if (q.kind === 'open')
      return {
        question: q,
        number: i + 1,
        correct: null,
        verdictOk: false,
        missingKey: [],
        distractors: [],
        answered: !!j?.explanation.trim(),
      };
    const attached = new Set(attachedEvidenceIds(progress, q.id));
    const verdictOk = !!j?.verdict && q.acceptedVerdicts.includes(j.verdict);
    const missingKey = q.keyEvidenceIds.filter((id) => !attached.has(id));
    const distractors = q.distractorEvidenceIds.filter((id) => attached.has(id));
    return {
      question: q,
      number: i + 1,
      correct: verdictOk && missingKey.length === 0 && distractors.length === 0,
      verdictOk,
      missingKey,
      distractors,
      answered: !!j?.verdict,
    };
  });
  const scored = questions.filter((q) => q.correct !== null);
  return { questions, correct: scored.filter((q) => q.correct).length, total: scored.length };
}
