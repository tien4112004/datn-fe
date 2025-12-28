// Vietnamese education system difficulty levels
export const DIFFICULTY = {
  EASY: 'nhan_biet',
  MEDIUM: 'thong_hieu',
  HARD: 'van_dung',
  SUPER_HARD: 'van_dung_cao',
} as const;

export const DIFFICULTY_LABELS = {
  nhan_biet: 'Nhận biết',
  thong_hieu: 'Thông hiểu',
  van_dung: 'Vận dụng',
  van_dung_cao: 'Vận dụng cao',
} as const;

export type Difficulty = (typeof DIFFICULTY)[keyof typeof DIFFICULTY];

// Question types
export const QUESTION_TYPE = {
  MULTIPLE_CHOICE: 'multiple_choice',
  MATCHING: 'matching',
  OPEN_ENDED: 'open_ended',
  FILL_IN_BLANK: 'fill_in_blank',
} as const;

export type QuestionType = (typeof QUESTION_TYPE)[keyof typeof QUESTION_TYPE];

// Subject codes
export const SUBJECT_CODE = {
  MATH: 'T',
  VIETNAMESE: 'TV',
  ENGLISH: 'TA',
} as const;

export type SubjectCode = (typeof SUBJECT_CODE)[keyof typeof SUBJECT_CODE];

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
