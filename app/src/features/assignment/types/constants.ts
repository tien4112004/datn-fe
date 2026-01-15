// Vietnamese education system difficulty levels - re-exported from core package
export { DIFFICULTY, type Difficulty, DIFFICULTY_LABELS, getDifficultyName } from '@aiprimary/core';

// Question types
export const QUESTION_TYPE = {
  MULTIPLE_CHOICE: 'multiple_choice',
  MATCHING: 'matching',
  OPEN_ENDED: 'open_ended',
  FILL_IN_BLANK: 'fill_in_blank',
  GROUP: 'group',
} as const;

export type QuestionType = (typeof QUESTION_TYPE)[keyof typeof QUESTION_TYPE];

// Subject codes - re-exported from core package
export { SUBJECT_CODE } from '@aiprimary/core';
export type { SubjectCode } from '@aiprimary/core';

// Question bank types
export const BANK_TYPE = {
  PERSONAL: 'personal',
  APPLICATION: 'application',
} as const;

export type BankType = (typeof BANK_TYPE)[keyof typeof BANK_TYPE];

// View modes
export const VIEW_MODE = {
  EDITING: 'editing',
  VIEWING: 'viewing',
  DOING: 'doing',
  AFTER_ASSESSMENT: 'after_assessment',
  GRADING: 'grading',
} as const;

export type ViewMode = (typeof VIEW_MODE)[keyof typeof VIEW_MODE];
