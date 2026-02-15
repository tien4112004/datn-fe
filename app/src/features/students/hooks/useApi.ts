import { useQuery } from '@tanstack/react-query';
import { useStudentApiService } from '../api';

// Query keys for students
export const studentKeys = {
  all: ['students'] as const,
  details: () => [...studentKeys.all, 'detail'] as const,
  detail: (id: string) => [...studentKeys.details(), id] as const,
  performance: (userId: string) => [...studentKeys.all, 'performance', userId] as const,
};

/**
 * Hook to fetch a student by ID
 */
export function useStudent(studentId: string) {
  const studentApiService = useStudentApiService();

  return useQuery({
    queryKey: studentKeys.detail(studentId),
    queryFn: () => studentApiService.getStudentById(studentId),
    enabled: !!studentId,
    staleTime: 300000, // 5 minutes
  });
}

/**
 * Hook to fetch student performance analytics
 * Note: This uses userId, not studentId
 */
export function useStudentPerformance(userId: string | undefined) {
  const studentApiService = useStudentApiService();

  return useQuery({
    queryKey: studentKeys.performance(userId || ''),
    queryFn: () => studentApiService.getStudentPerformance(userId!),
    enabled: !!userId,
    staleTime: 120000, // 2 minutes
  });
}
