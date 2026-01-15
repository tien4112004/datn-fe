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
  GroupQuestion,
  MultipleChoiceOption,
  MatchingPair,
  BlankSegment,
  SubQuestion,
  GroupQuestionData,
  Answer,
  MultipleChoiceAnswer,
  MatchingAnswer,
  OpenEndedAnswer,
  FillInBlankAnswer,
  Submission,
  Grade,
  AssignmentQuestion,
} from '@aiprimary/core';
