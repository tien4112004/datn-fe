export * from './constants';
export * from './assignment';
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
} from '@aiprimary/core';
