/**
 * Shared comment components library
 * Provides reusable primitives, states, hooks, and utilities for comment features
 */

// Primitive components
export { CommentHeader } from './primitives/CommentHeader';
export { CommentInput } from './primitives/CommentInput';

// State components
export { CommentListLoading } from './states/CommentListLoading';
export { CommentListEmpty } from './states/CommentListEmpty';
export { CommentListError } from './states/CommentListError';

// Hooks
export { useCommentDate } from './hooks/useCommentDate';
export { useCommentValidation } from './hooks/useCommentValidation';
export type { CommentValidationOptions } from './hooks/useCommentValidation';

// Types
export type { CommentUser, BaseComment } from './types';
