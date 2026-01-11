// Main feature barrel export
export { QuestionRenderer } from './components/QuestionRenderer';

// Question type components
export * from './components/multiple-choice';
export * from './components/matching';
export * from './components/open-ended';
export * from './components/fill-in-blank';

// Shared components
export * from './components/shared';

// Re-export types for convenience
export type {
  Question,
  Answer,
  MultipleChoiceQuestion,
  MatchingQuestion,
  OpenEndedQuestion,
  FillInBlankQuestion,
  MultipleChoiceAnswer,
  MatchingAnswer,
  OpenEndedAnswer,
  FillInBlankAnswer,
} from '@aiprimary/core';

export type { ViewMode } from '@/features/assignment/types';
export { VIEW_MODE, QUESTION_TYPE } from '@/features/assignment/types';
