// Types
export * from './types';

// API
export { useAssignmentApiService, getAssignmentApiService } from './api';

// Hooks
export * from './hooks';

// Utils
export * from './utils';

// Pages
export * from './pages';

// Components
// Re-export from question feature for backward compatibility
export { QuestionRenderer } from '@/features/question';
export * from '@aiprimary/question/shared';
export * from '@aiprimary/question/multiple-choice';
export * from '@aiprimary/question/matching';
export * from '@aiprimary/question/open-ended';
export * from '@aiprimary/question/fill-in-blank';
