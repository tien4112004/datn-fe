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
export * from '@/features/question/components/shared';
export * from '@/features/question/components/multiple-choice';
export * from '@/features/question/components/matching';
export * from '@/features/question/components/open-ended';
export * from '@/features/question/components/fill-in-blank';
