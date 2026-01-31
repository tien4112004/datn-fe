/**
 * Query keys for React Query
 * Used for cache management and invalidation
 */
export const assignmentKeys = {
  all: ['assignments'] as const,
  lists: () => [...assignmentKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) => [...assignmentKeys.lists(), filters] as const,
  details: () => [...assignmentKeys.all, 'detail'] as const,
  detail: (id: string) => [...assignmentKeys.details(), id] as const,
};
