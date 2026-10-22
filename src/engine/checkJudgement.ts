import type { CheckMessage, CheckResult, Judgement } from './progressTypes';
import type { CaseFile, Question, VerdictQuestion } from './types';

export const MIN_EXPLANATION = 20;
export const MIN_LIMITATION = 10;
export const MIN_OPEN_ANSWER = 40;

/** What the student still needs to fill in before checking. Empty = ready. */
export function missingBeforeCheck(
  question: Question,
  judgement: Judgement,
  attachedIds: string[],
): string[] {
  const missing: string[] = [];
  if (question.kind === 'open') {
    if (judgement.explanation.trim().length < MIN_OPEN_ANSWER)
      missing.push('Write a fuller answer (a few sentences).');
    return missing;
  }
  if (!judgement.verdict) missing.push('Choose a verdict.');
  if (attachedIds.length === 0) missing.push('Attach at least one piece of evidence.');
  if (judgement.explanation.trim().length < MIN_EXPLANATION)
    missing.push('Explain your reasoning in a sentence or two.');
  if (judgement.limitation.trim().length < MIN_LIMITATION) missing.push('Name one limitation.');
  return missing;
}

/**
 * Checks the objective parts of a verdict judgement: the verdict and the attached evidence.
 * Written reasoning is not marked here; it is for the teacher.
 * Feedback is always a helpful hint, never just "wrong".
 */
export function checkVerdictJudgement(
  question: VerdictQuestion,
  judgement: Judgement,
  attachedIds: string[],
  caseFile: CaseFile,
  now = Date.now(),
): CheckResult {
  const messages: CheckMessage[] = [];
  const attached = new Set(attachedIds);

  const verdictOk =
    judgement.verdict !== null && question.acceptedVerdicts.includes(judgement.verdict);
  if (!verdictOk) {
    const specific = judgement.verdict ? question.hints?.byVerdict?.[judgement.verdict] : undefined;
    messages.push({
      tone: 'hint',
      text:
        specific ??
        question.hints?.verdict ??
        'Look again at what the evidence can and cannot show.',
    });
  }

  const missing = question.keyEvidenceIds.filter((id) => !attached.has(id));
  for (const id of missing) {
    const title = caseFile.evidence.find((e) => e.id === id)?.title ?? 'a key item';
    messages.push({
      tone: 'hint',
      text:
        question.hints?.missingEvidence[id] ??
        `There's another piece of evidence that matters here. Have you looked at "${title}"?`,
    });
  }

  const distractors = question.distractorEvidenceIds.filter((id) => attached.has(id));
  for (const id of distractors) {
    messages.push({
      tone: 'hint',
      text:
        question.hints?.distractors[id] ??
        "One of your attached items doesn't really help answer this question. Which one is it?",
    });
  }

  const correct = verdictOk && missing.length === 0 && distractors.length === 0;
  if (correct)
    messages.unshift({ tone: 'good', text: question.hints?.correct ?? 'Well reasoned.' });
  else if (verdictOk)
    messages.unshift({
      tone: 'good',
      text: 'Your verdict is on the right track. Now tidy up the evidence you have attached.',
    });

  return { correct, messages, at: now };
}

/** Open questions are not auto-marked: completing one records the answer for the teacher. */
export function checkOpenJudgement(now = Date.now()): CheckResult {
  return {
    correct: true,
    messages: [
      {
        tone: 'good',
        text: 'Answer saved for your teacher. Check that you named specific evidence and explained whether each request for someone’s data would be fair and proportionate.',
      },
    ],
    at: now,
  };
}
