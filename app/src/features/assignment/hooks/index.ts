// Re-export from question-bank feature for backward compatibility
export * from '@/features/question-bank/hooks/useQuestionBankApi';
export * from './useDirtyFormTracking';
export {
  useAssignmentList,
  useAssignment,
  useAssignmentPublic,
  useAssignmentByPost,
  useCreateAssignment,
  useUpdateAssignment,
  useDeleteAssignment,
} from './useAssignmentApi';
// Re-export from submission feature for backward compatibility
export {
  useSubmissionsByPost,
  useSubmissionsByAssignment,
  useSubmission,
  useCreateSubmission,
  useGradeSubmission,
  useDeleteSubmission,
} from '@/features/submission/hooks';

// Re-export context hooks from context feature for backward compatibility
export { useContextList, useContext, contextKeys } from '@/features/context';
