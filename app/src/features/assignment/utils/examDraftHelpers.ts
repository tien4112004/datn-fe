import type { ExamDraft } from '@aiprimary/core';

/**
 * Validates an exam draft to ensure it meets requirements
 */
export const validateDraft = (draft: ExamDraft): { valid: boolean; error?: string } => {
  if (draft.questions.length === 0) {
    return { valid: false, error: 'No questions selected' };
  }

  // Note: Point validation should be done when converting to Assignment
  // since ExamDraft questions don't have points assigned yet

  return { valid: true };
};
