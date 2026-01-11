// Question Types
export const QUESTION_TYPE = {
  MULTIPLE_CHOICE: 'multiple_choice',
  MATCHING: 'matching',
  OPEN_ENDED: 'open_ended',
  FILL_IN_BLANK: 'fill_in_blank',
} as const;

export type QuestionType = (typeof QUESTION_TYPE)[keyof typeof QUESTION_TYPE];

// Difficulty Levels - re-exported from core package
export { DIFFICULTY, type Difficulty, DIFFICULTY_LABELS, getDifficultyName } from '@aiprimary/core';

// Subject Codes (Vietnamese education system)
export const SUBJECT_CODE = {
  MATH: 'T', // Toán (Math)
  VIETNAMESE: 'TV', // Tiếng Việt (Vietnamese)
  ENGLISH: 'TA', // Tiếng Anh (English)
} as const;

export type SubjectCode = (typeof SUBJECT_CODE)[keyof typeof SUBJECT_CODE];

// Question Bank Types
export const BANK_TYPE = {
  PERSONAL: 'personal', // Teacher's private question bank
  APPLICATION: 'application', // Shared application-wide question bank
} as const;

export type BankType = (typeof BANK_TYPE)[keyof typeof BANK_TYPE];

// View Modes
export const VIEW_MODE = {
  EDITING: 'editing', // Teacher creates/edits
  VIEWING: 'viewing', // Teacher/student view (read-only)
  DOING: 'doing', // Student answers (interactive)
  AFTER_ASSESSMENT: 'after_assessment', // Results/feedback after completion
  GRADING: 'grading', // Teacher grades student submissions
} as const;

export type ViewMode = (typeof VIEW_MODE)[keyof typeof VIEW_MODE];

// Question type labels and helper - re-exported from core package
export { QUESTION_TYPE_LABELS, getQuestionTypeName } from '@aiprimary/core';

// View mode labels for UI
export const VIEW_MODE_LABELS: Record<ViewMode, string> = {
  [VIEW_MODE.EDITING]: 'Editing (Teacher)',
  [VIEW_MODE.VIEWING]: 'Viewing (Read-only)',
  [VIEW_MODE.DOING]: 'Doing (Student)',
  [VIEW_MODE.AFTER_ASSESSMENT]: 'After Assessment',
  [VIEW_MODE.GRADING]: 'Grading (Teacher)',
};
