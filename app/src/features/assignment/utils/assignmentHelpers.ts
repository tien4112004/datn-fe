import type { Question, Assignment } from '../types';

/**
 * Calculate total points from an array of questions
 * @param questions - Array of questions
 * @returns Total points sum
 */
export function calculateTotalPoints(questions: Question[]): number {
  return questions.reduce((sum, q) => sum + (q.points || 0), 0);
}

/**
 * Validate assignment metadata
 * @param assignment - Assignment object (can be partial)
 * @returns Array of validation error messages
 */
export function validateAssignmentMetadata(assignment: Partial<Assignment>): string[] {
  const errors: string[] = [];

  if (!assignment.title?.trim()) {
    errors.push('Assignment title is required');
  }

  if (!assignment.classId) {
    errors.push('Class is required');
  }

  if (assignment.dueDate) {
    const dueDate = new Date(assignment.dueDate);
    const now = new Date();
    if (dueDate < now) {
      errors.push('Due date must be in the future');
    }
  }

  return errors;
}

/**
 * Check if assignment can be published
 * @param assignment - Assignment object (can be partial)
 * @param questions - Array of questions
 * @returns Object with canPublish boolean and array of blocking reasons
 */
export function canPublishAssignment(
  assignment: Partial<Assignment>,
  questions: Question[]
): { canPublish: boolean; reasons: string[] } {
  const reasons: string[] = [];

  // Check metadata validity
  const metadataErrors = validateAssignmentMetadata(assignment);
  if (metadataErrors.length > 0) {
    reasons.push(...metadataErrors);
  }

  // Check questions
  if (questions.length === 0) {
    reasons.push('Assignment must have at least one question');
  }

  // Check due date for published assignments
  if (!assignment.dueDate) {
    reasons.push('Due date is required for published assignments');
  }

  return {
    canPublish: reasons.length === 0,
    reasons,
  };
}
