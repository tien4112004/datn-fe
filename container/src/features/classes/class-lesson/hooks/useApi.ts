import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useClassApiService } from '../../shared/api';
import type {
  LessonPlanCollectionRequest,
  LessonPlanCreateRequest,
  LessonPlanUpdateRequest,
} from '../../shared/types';

// Query keys for lesson plans
const classKeys = {
  all: ['classes'] as const,
  lessonPlans: (classId: string, params?: LessonPlanCollectionRequest) =>
    [...classKeys.all, 'lesson-plans', classId, params] as const,
};

// Lesson plan queries
export function useLessonPlan(id: string) {
  const classApiService = useClassApiService();

  return useQuery({
    queryKey: ['lessonPlan', id],
    queryFn: () => classApiService.getLessonPlan(id),
    enabled: !!id,
  });
}

export function useClassLessonPlans(classId: string, params: LessonPlanCollectionRequest = {}) {
  const classApiService = useClassApiService();
  return useQuery({
    queryKey: classKeys.lessonPlans(classId, params),
    queryFn: () => classApiService.getLessonPlans(classId, params),
    enabled: !!classId,
  });
}

// Lesson plan mutations
export function useUpdateLessonStatus() {
  const queryClient = useQueryClient();
  const classApiService = useClassApiService();

  return useMutation({
    mutationFn: ({ id, status, notes }: { id: string; status: string; notes?: string }) =>
      classApiService.updateLessonStatus(id, status, notes),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: classKeys.lessonPlans(variables.id, {}) });
    },
  });
}

export function useCreateLessonPlan() {
  const queryClient = useQueryClient();
  const classApiService = useClassApiService();

  return useMutation({
    mutationFn: (data: LessonPlanCreateRequest) => classApiService.createLessonPlan(data),
    onSuccess: (lessonPlan) => {
      queryClient.invalidateQueries({ queryKey: classKeys.lessonPlans(lessonPlan.classId, {}) });
    },
  });
}

export function useUpdateLessonPlan() {
  const queryClient = useQueryClient();
  const classApiService = useClassApiService();

  return useMutation({
    mutationFn: (data: LessonPlanUpdateRequest) => classApiService.updateLessonPlan(data),
    onSuccess: (lessonPlan) => {
      queryClient.invalidateQueries({ queryKey: classKeys.lessonPlans(lessonPlan.classId, {}) });
      queryClient.invalidateQueries({ queryKey: ['lessonPlan', lessonPlan.id] });
    },
  });
}
