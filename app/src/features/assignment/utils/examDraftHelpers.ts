import type { ExamDraft } from '@aiprimary/core';

/**
 * Validates an exam draft to ensure it meets requirements
 */
export const validateDraft = (draft: ExamDraft): { valid: boolean; error?: string } => {
  if (draft.questions.length === 0) {
    return { valid: false, error: 'No questions selected' };
  }

  const totalPoints = draft.questions.reduce((sum, q) => sum + (q.points || 0), 0);
  if (Math.abs(totalPoints - draft.targetPoints) > 0.01) {
    return {
      valid: false,
      error: `Point mismatch: ${totalPoints} vs ${draft.targetPoints}`,
    };
  }

  return { valid: true };
};
