// Question Types
export const QUESTION_TYPE = {
  MULTIPLE_CHOICE: 'multiple_choice',
  MATCHING: 'matching',
  OPEN_ENDED: 'open_ended',
  FILL_IN_BLANK: 'fill_in_blank',
} as const;

export type QuestionType = (typeof QUESTION_TYPE)[keyof typeof QUESTION_TYPE];

// Difficulty Levels (Vietnamese education system)
export const DIFFICULTY = {
  EASY: 'nhan_biet', // Nhận biết (Knowledge)
  MEDIUM: 'thong_hieu', // Thông hiểu (Comprehension)
  HARD: 'van_dung', // Vận dụng (Application)
  SUPER_HARD: 'van_dung_cao', // Vận dụng cao (Advanced Application)
} as const;

export type Difficulty = (typeof DIFFICULTY)[keyof typeof DIFFICULTY];

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

// Difficulty labels for UI
export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  [DIFFICULTY.EASY]: 'Nhận biết',
  [DIFFICULTY.MEDIUM]: 'Thông hiểu',
  [DIFFICULTY.HARD]: 'Vận dụng',
  [DIFFICULTY.SUPER_HARD]: 'Vận dụng cao',
};

// Question type labels for UI
export const QUESTION_TYPE_LABELS: Record<QuestionType, string> = {
  [QUESTION_TYPE.MULTIPLE_CHOICE]: 'Multiple Choice',
  [QUESTION_TYPE.MATCHING]: 'Matching',
  [QUESTION_TYPE.OPEN_ENDED]: 'Open-ended',
  [QUESTION_TYPE.FILL_IN_BLANK]: 'Fill In Blank',
};

// View mode labels for UI
export const VIEW_MODE_LABELS: Record<ViewMode, string> = {
  [VIEW_MODE.EDITING]: 'Editing (Teacher)',
  [VIEW_MODE.VIEWING]: 'Viewing (Read-only)',
  [VIEW_MODE.DOING]: 'Doing (Student)',
  [VIEW_MODE.AFTER_ASSESSMENT]: 'After Assessment',
  [VIEW_MODE.GRADING]: 'Grading (Teacher)',
};
