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
  MULTIPLE_CHOICE: 'MULTIPLE_CHOICE',
  MATCHING: 'MATCHING',
  OPEN_ENDED: 'OPEN_ENDED',
  FILL_IN_BLANK: 'FILL_IN_BLANK',
} as const;

export type QuestionType = (typeof QUESTION_TYPE)[keyof typeof QUESTION_TYPE];

/**
 * Question Type Labels (Vietnamese)
 * Display names for question types in Vietnamese
 */
export const QUESTION_TYPE_LABELS = {
  MULTIPLE_CHOICE: 'Trắc Nghiệm',
  MATCHING: 'Nối',
  OPEN_ENDED: 'Tự Luận',
  FILL_IN_BLANK: 'Điền Vào Chỗ Trống',
} as const;

/**
 * Question Type I18n Keys
 * Localization keys for question types (for use with i18n)
 */
export const QUESTION_TYPE_I18N_KEYS = {
  MULTIPLE_CHOICE: 'types.multipleChoice',
  MATCHING: 'types.matching',
  OPEN_ENDED: 'types.openEnded',
  FILL_IN_BLANK: 'types.fillInBlank',
} as const;

/**
 * Difficulty Levels (Vietnamese education system)
 * Based on Bloom's Taxonomy adapted for Vietnamese curriculum
 */
export const DIFFICULTY = {
  KNOWLEDGE: 'KNOWLEDGE', // Nhận biết (Knowledge) - Recall facts and basic concepts
  COMPREHENSION: 'COMPREHENSION', // Thông hiểu (Comprehension) - Explain ideas or concepts
  APPLICATION: 'APPLICATION', // Vận dụng (Application) - Use information in new situations
} as const;

export type Difficulty = (typeof DIFFICULTY)[keyof typeof DIFFICULTY];

/**
 * Difficulty Labels (Vietnamese)
 * Display names for difficulty levels in Vietnamese education system
 */
export const DIFFICULTY_LABELS = {
  KNOWLEDGE: 'Nhận biết',
  COMPREHENSION: 'Thông hiểu',
  APPLICATION: 'Vận dụng',
} as const;

/**
 * Difficulty I18n Keys
 * Localization keys for difficulty levels (for use with i18n)
 */
export const DIFFICULTY_I18N_KEYS = {
  KNOWLEDGE: 'difficulty.knowledge',
  COMPREHENSION: 'difficulty.comprehension',
  APPLICATION: 'difficulty.application',
} as const;

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
 * Subject Labels (Vietnamese)
 * Display names for subjects in Vietnamese
 */
export const SUBJECT_LABELS = {
  [SUBJECT_CODE.MATH]: 'Toán',
  [SUBJECT_CODE.VIETNAMESE]: 'Tiếng Việt',
  [SUBJECT_CODE.ENGLISH]: 'Tiếng Anh',
} as const;

/**
 * Subject I18n Keys
 * Localization keys for subjects (for use with i18n)
 */
export const SUBJECT_I18N_KEYS = {
  [SUBJECT_CODE.MATH]: 'subjectNames.math',
  [SUBJECT_CODE.VIETNAMESE]: 'subjectNames.vietnamese',
  [SUBJECT_CODE.ENGLISH]: 'subjectNames.english',
} as const;

/**
 * Question Bank Types
 * Defines the ownership/visibility scope of questions
 */
export const BANK_TYPE = {
  PERSONAL: 'personal', // Teacher's private question bank
  PUBLIC: 'public', // Shared public question bank
} as const;

export type BankType = (typeof BANK_TYPE)[keyof typeof BANK_TYPE];

/**
 * Bank Type Labels (Vietnamese)
 * Display names for bank types in Vietnamese
 */
export const BANK_TYPE_LABELS = {
  personal: 'Cá nhân',
  public: 'Công khai',
} as const;

/**
 * Bank Type I18n Keys
 * Localization keys for bank types (for use with i18n)
 */
export const BANK_TYPE_I18N_KEYS = {
  personal: 'bankType.personal',
  public: 'bankType.public',
} as const;

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

/**
 * Grade Constants and Utilities
 * Re-exported from grades.ts for centralized access
 */
export { ELEMENTARY_GRADE, GRADE } from './grades';
export type { ElementaryGrade, Grade as GradeCode } from './grades';
