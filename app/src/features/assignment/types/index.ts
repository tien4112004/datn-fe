// Re-export core domain types
export type {
  // Constants
  QuestionType,
  Difficulty,
  SubjectCode,
  BankType,
  ViewMode,
  // Questions
  BaseQuestion,
  MultipleChoiceOption,
  MultipleChoiceQuestion,
  MatchingPair,
  MatchingQuestion,
  OpenEndedQuestion,
  BlankSegment,
  FillInBlankQuestion,
  Question,
  // Answers
  MultipleChoiceAnswer,
  MatchingAnswer,
  OpenEndedAnswer,
  FillInBlankAnswer,
  Answer,
  Grade,
  Submission,
  Assignment,
  // Question Bank
  QuestionBankItem,
  // Exam Draft
  ExamDraft,
} from '@aiprimary/core';

export {
  // Constants
  QUESTION_TYPE,
  DIFFICULTY,
  SUBJECT_CODE,
  BANK_TYPE,
  VIEW_MODE,
  // Type guards
  isMultipleChoice,
  isMatching,
  isOpenEnded,
  isFillInBlank,
} from '@aiprimary/core';

// UI-specific exports
export * from './constants';
export * from './questionBank';
export * from './validation';
export * from './service';
