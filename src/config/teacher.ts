/**
 * Teacher settings. CHANGE THESE CODES before sharing the link with a class.
 *
 * NOT SECURE: these codes ship inside the app, so a determined student can find them in the
 * browser's developer tools. They stop casual access, nothing more. The assessment case's data
 * (including its answer key) also ships with the app, so it is not exam-secure.
 */
export const teacherConfig = {
  /** Turns on teacher mode (answer keys, teacher notes, drop controls) and Teacher Review. */
  teacherCode: 'CHANGE-ME-TEACHER-2026',
  /** Unlocks assessment cases on a student's device. Give this to students on the day. */
  assessmentCode: 'CHANGE-ME-ASSESS-2026',
};

/** Codes are compared ignoring case, spaces and dashes, so "change me teacher 2026" works. */
export function codeMatches(input: string, code: string): boolean {
  const norm = (v: string) => v.toUpperCase().replace(/[\s-]+/g, '');
  return norm(input) !== '' && norm(input) === norm(code);
}
