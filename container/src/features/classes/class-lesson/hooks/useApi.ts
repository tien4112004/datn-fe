import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useClassApiService } from '../../shared/api';
import type { LessonCollectionRequest, LessonCreateRequest, LessonUpdateRequest } from '../../shared/types';

// Query keys for lessons
const classKeys = {
  all: ['classes'] as const,
  lessons: (classId: string, params?: LessonCollectionRequest) =>
    [...classKeys.all, 'lessons', classId, params] as const,
};

// Lesson queries
export function useLesson(id: string) {
  const classApiService = useClassApiService();

  return useQuery({
    queryKey: ['lesson', id],
    queryFn: () => classApiService.getLesson(id),
    enabled: !!id,
  });
}

export function useClassLessons(classId: string, params: LessonCollectionRequest = {}) {
  const classApiService = useClassApiService();
  return useQuery({
    queryKey: classKeys.lessons(classId, params),
    queryFn: () => classApiService.getLessons(classId, params),
    enabled: !!classId,
  });
}

// Lesson mutations
export function useUpdateLessonStatus() {
  const queryClient = useQueryClient();
  const classApiService = useClassApiService();

  return useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: string; notes?: string }) =>
      classApiService.updateLessonStatus(id, status, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: classKeys.lessons(variables.id, {}) });
    },
  });
}

export function useCreateLesson() {
  const queryClient = useQueryClient();
  const classApiService = useClassApiService();

  return useMutation({
    mutationFn: (data: LessonCreateRequest) => classApiService.createLesson(data),
    onSuccess: (lesson) => {
      queryClient.invalidateQueries({ queryKey: classKeys.lessons(lesson.classId, {}) });
    },
  });
}

export function useUpdateLesson() {
  const queryClient = useQueryClient();
  const classApiService = useClassApiService();

  return useMutation({
    mutationFn: (data: LessonUpdateRequest) => classApiService.updateLesson(data),
    onSuccess: (lesson) => {
      queryClient.invalidateQueries({ queryKey: classKeys.lessons(lesson.classId, {}) });
      queryClient.invalidateQueries({ queryKey: ['lesson', lesson.id] });
    },
  });
}
