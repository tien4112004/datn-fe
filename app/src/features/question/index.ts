// Main feature barrel export
export { QuestionRenderer } from './components/QuestionRenderer';

// Re-export from shared question package
export * from '@aiprimary/question';

// App-specific shared components (not in shared package)
export { ContextSelector } from './components/shared/ContextSelector';
export { ImageUploader } from './components/shared/ImageUploader';
export { ImageStorageDialog } from './components/shared/ImageStorageDialog';

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
