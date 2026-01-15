import { type QuestionType } from '@aiprimary/core';

/**
 * Converts frontend question type (lowercase) to backend enum value (uppercase)
 * @param frontendType - Frontend question type (e.g., 'multiple_choice')
 * @returns Backend enum value (e.g., 'MULTIPLE_CHOICE')
 * @example
 * toBackendQuestionType('multiple_choice') // returns 'MULTIPLE_CHOICE'
 * toBackendQuestionType('fill_in_blank') // returns 'FILL_IN_BLANK'
 */
export function toBackendQuestionType(frontendType: QuestionType): string {
  return frontendType.toUpperCase();
}

/**
 * Converts backend enum value (uppercase) to frontend question type (lowercase)
 * @param backendType - Backend enum value (e.g., 'MULTIPLE_CHOICE')
 * @returns Frontend question type (e.g., 'multiple_choice')
 * @example
 * toFrontendQuestionType('MULTIPLE_CHOICE') // returns 'multiple_choice'
 * toFrontendQuestionType('FILL_IN_BLANK') // returns 'fill_in_blank'
 */
export function toFrontendQuestionType(backendType: string): QuestionType {
  return backendType.toLowerCase() as QuestionType;
}
