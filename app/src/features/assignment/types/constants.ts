// Re-export core domain constants
export {
  QUESTION_TYPE,
  DIFFICULTY,
  SUBJECT_CODE,
  BANK_TYPE,
  VIEW_MODE,
  type QuestionType,
  type Difficulty,
  type SubjectCode,
  type BankType,
  type ViewMode,
} from '@aiprimary/core';

// UI-specific labels (remain in app)

/** Difficulty labels for UI display (Vietnamese) */
export const DIFFICULTY_LABELS: Record<import('@aiprimary/core').Difficulty, string> = {
  nhan_biet: 'Nhận biết',
  thong_hieu: 'Thông hiểu',
  van_dung: 'Vận dụng',
  van_dung_cao: 'Vận dụng cao',
};

/** Question type labels for UI display */
export const QUESTION_TYPE_LABELS: Record<import('@aiprimary/core').QuestionType, string> = {
  multiple_choice: 'Multiple Choice',
  matching: 'Matching',
  open_ended: 'Open-ended',
  fill_in_blank: 'Fill In Blank',
};

/** View mode labels for UI display */
export const VIEW_MODE_LABELS: Record<import('@aiprimary/core').ViewMode, string> = {
  editing: 'Editing (Teacher)',
  viewing: 'Viewing (Read-only)',
  doing: 'Doing (Student)',
  after_assessment: 'After Assessment',
  grading: 'Grading (Teacher)',
};
