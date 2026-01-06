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
  EASY: 'nhan_biet', // Nhận biết (Knowledge) - Recall facts and basic concepts
  MEDIUM: 'thong_hieu', // Thông hiểu (Comprehension) - Explain ideas or concepts
  HARD: 'van_dung', // Vận dụng (Application) - Use information in new situations
  SUPER_HARD: 'van_dung_cao', // Vận dụng cao (Advanced Application) - Draw connections among ideas
} as const;

export type Difficulty = (typeof DIFFICULTY)[keyof typeof DIFFICULTY];

/**
 * Subject Codes (Vietnamese education system)
 * Core subjects supported in the system
 */
export const SUBJECT_CODE = {
  MATH: 'T', // Toán (Math)
  VIETNAMESE: 'TV', // Tiếng Việt (Vietnamese)
  ENGLISH: 'TA', // Tiếng Anh (English)
} as const;

export type SubjectCode = (typeof SUBJECT_CODE)[keyof typeof SUBJECT_CODE];

/**
 * Question Bank Types
 * Defines the ownership/visibility scope of questions
 */
export const BANK_TYPE = {
  PERSONAL: 'personal', // Teacher's private question bank
  APPLICATION: 'application', // Shared application-wide question bank
} as const;

export type BankType = (typeof BANK_TYPE)[keyof typeof BANK_TYPE];

/**
 * View Modes
 * Defines the different interaction modes for questions and assignments
 */
export const VIEW_MODE = {
  EDITING: 'editing', // Teacher creates/edits
  VIEWING: 'viewing', // Teacher/student view (read-only)
  DOING: 'doing', // Student answers (interactive)
  AFTER_ASSESSMENT: 'after_assessment', // Results/feedback after completion
  GRADING: 'grading', // Teacher grades student submissions
} as const;

export type ViewMode = (typeof VIEW_MODE)[keyof typeof VIEW_MODE];
