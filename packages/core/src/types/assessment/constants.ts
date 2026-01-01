/**
 * Assessment Domain Constants
 * Core constants for question types, difficulty levels, subjects, and bank types
 * Used across the assessment/exam system
 */

/**
 * Question Types
 * Defines the supported question formats in the assessment system
 */
export const QUESTION_TYPE = {
  MULTIPLE_CHOICE: 'multiple_choice',
  MATCHING: 'matching',
  OPEN_ENDED: 'open_ended',
  FILL_IN_BLANK: 'fill_in_blank',
} as const;

export type QuestionType = (typeof QUESTION_TYPE)[keyof typeof QUESTION_TYPE];

/**
 * Difficulty Levels (Vietnamese education system)
 * Based on Bloom's Taxonomy adapted for Vietnamese curriculum
 */
export const DIFFICULTY = {
  /** Nhận biết (Knowledge) - Recall facts and basic concepts */
  EASY: 'nhan_biet',
  /** Thông hiểu (Comprehension) - Explain ideas or concepts */
  MEDIUM: 'thong_hieu',
  /** Vận dụng (Application) - Use information in new situations */
  HARD: 'van_dung',
  /** Vận dụng cao (Advanced Application) - Draw connections among ideas */
  SUPER_HARD: 'van_dung_cao',
} as const;

export type Difficulty = (typeof DIFFICULTY)[keyof typeof DIFFICULTY];

/**
 * Subject Codes (Vietnamese education system)
 * Core subjects supported in the system
 */
export const SUBJECT_CODE = {
  /** Toán (Math) */
  MATH: 'T',
  /** Tiếng Việt (Vietnamese) */
  VIETNAMESE: 'TV',
  /** Tiếng Anh (English) */
  ENGLISH: 'TA',
} as const;

export type SubjectCode = (typeof SUBJECT_CODE)[keyof typeof SUBJECT_CODE];

/**
 * Question Bank Types
 * Defines the ownership/visibility scope of questions
 */
export const BANK_TYPE = {
  /** Teacher's private question bank */
  PERSONAL: 'personal',
  /** Shared application-wide question bank */
  APPLICATION: 'application',
} as const;

export type BankType = (typeof BANK_TYPE)[keyof typeof BANK_TYPE];

/**
 * View Modes
 * Defines the different interaction modes for questions and assignments
 */
export const VIEW_MODE = {
  /** Teacher creates/edits */
  EDITING: 'editing',
  /** Teacher/student view (read-only) */
  VIEWING: 'viewing',
  /** Student answers (interactive) */
  DOING: 'doing',
  /** Results/feedback after completion */
  AFTER_ASSESSMENT: 'after_assessment',
  /** Teacher grades student submissions */
  GRADING: 'grading',
} as const;

export type ViewMode = (typeof VIEW_MODE)[keyof typeof VIEW_MODE];
