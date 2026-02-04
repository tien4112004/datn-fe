import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useContextApiService, contextKeys, type Context } from '@/features/context';
import { getUniqueContextIds } from '../utils/questionGrouping';
import type { AssignmentQuestionWithTopic } from '../types/assignment';

/**
 * Hook to batch fetch all contexts for questions in an assignment.
 * Returns a Map of contextId to Context for efficient lookup.
 */
export function useQuestionContexts(questions: AssignmentQuestionWithTopic[]) {
  const apiService = useContextApiService();

  // Extract unique context IDs from questions
  const contextIds = useMemo(() => getUniqueContextIds(questions), [questions]);

  // Fetch all contexts in a single batch request
  const {
    data: contexts,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: [...contextKeys.lists(), 'batch', contextIds],
    queryFn: () => apiService.getContextsByIds(contextIds),
    enabled: contextIds.length > 0,
    staleTime: 300000, // 5 minutes
    gcTime: 600000, // 10 minutes
  });

  // Build a Map of contextId to Context
  const contextsMap = useMemo(() => {
    const map = new Map<string, Context>();
    if (contexts) {
      contexts.forEach((context) => {
        map.set(context.id, context);
      });
    }
    return map;
  }, [contexts]);

  // Error handling
  const errors = error ? [error] : [];

  return {
    contextsMap,
    isLoading,
    isError,
    errors,
    contextIds,
  };
}
