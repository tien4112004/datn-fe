export * from './assignment';
// Re-export from question-bank feature for backward compatibility
export * from '@/features/question-bank/types';
export * from './service';
export * from './validation';

// Re-export context types from context feature for backward compatibility
export type { Context, ContextFilters, ContextListResponse } from '@/features/context';

// Re-export core assessment types
export type {
  Question,
  MultipleChoiceQuestion,
  MatchingQuestion,
  OpenEndedQuestion,
  FillInBlankQuestion,
  MultipleChoiceOption,
  MatchingPair,
  BlankSegment,
  Answer,
  MultipleChoiceAnswer,
  MatchingAnswer,
  OpenEndedAnswer,
  FillInBlankAnswer,
  Submission,
  Grade,
  AssignmentQuestion,
  BankType,
  Difficulty,
  QuestionType,
  SubjectCode,
  ViewMode,
} from '@aiprimary/core';

// Re-export core assessment constants
export {
  BANK_TYPE,
  DIFFICULTY,
  DIFFICULTY_LABELS,
  getDifficultyName,
  QUESTION_TYPE,
  QUESTION_TYPE_LABELS,
  getQuestionTypeName,
  SUBJECT_CODE,
  VIEW_MODE,
} from '@aiprimary/core';
