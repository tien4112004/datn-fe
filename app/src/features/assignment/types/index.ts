export * from './assignment';
export * from './context';
export * from './questionBank';
export * from './service';
export * from './validation';

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
