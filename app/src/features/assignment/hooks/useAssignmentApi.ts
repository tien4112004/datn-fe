import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { getAssignmentApiService } from '../api';
import { assignmentKeys } from '../api/assignmentApi';
import type {
  CreateAssignmentRequest,
  UpdateAssignmentRequest,
  GenerateMatrixRequest,
  GenerateAssignmentFromMatrixRequest,
} from '../types';
import { getExamplePromptsApiService, type UpdateChapterPayload } from '@/features/projects/api';

/**
 * Hook to fetch list of assignments with optional filters
 * @param filters - Optional filters for assignments
 * @returns Query result with assignments list
 */
type AssignmentListFilters = {
  classId?: string;
  status?: 'draft' | 'published' | 'archived';
  searchText?: string;
  page?: number;
  size?: number;
  grade?: string;
  subject?: string;
  chapter?: string;
};

export const useAssignmentList = (filters?: AssignmentListFilters) => {
  const service = getAssignmentApiService();

  return useQuery({
    queryKey: assignmentKeys.list(filters),
    queryFn: async () => {
      const response = await service.getAssignments({
        classId: filters?.classId,
        search: filters?.searchText,
        page: filters?.page,
        size: filters?.size,
        grade: filters?.grade,
        subject: filters?.subject,
        chapter: filters?.chapter,
      });
      return {
        assignments: response.data,
        total: response.pagination?.totalItems ?? response.data.length,
      };
    },
    staleTime: 30 * 1000, // 30 seconds
  });
};

export const useInfiniteAssignmentList = (
  filters?: Omit<AssignmentListFilters, 'page' | 'size'> & { enabled?: boolean }
) => {
  const service = getAssignmentApiService();
  const { enabled = true, ...params } = filters ?? {};
  const PAGE_SIZE = 20;

  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: [...assignmentKeys.list(params), 'infinite'],
    queryFn: async ({ pageParam }) => {
      return service.getAssignments({
        search: params.searchText,
        page: pageParam as number,
        size: PAGE_SIZE,
        grade: params.grade,
        subject: params.subject,
        chapter: params.chapter,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: any) => {
      const { currentPage, totalPages } = lastPage.pagination ?? {};
      if (currentPage == null || totalPages == null) return undefined;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    staleTime: 30 * 1000,
    enabled,
  });

  const assignments = data?.pages.flatMap((p: any) => p.data ?? []) ?? [];
  return { assignments, hasNextPage: hasNextPage ?? false, fetchNextPage, isFetchingNextPage, isLoading };
};

/**
 * Hook to fetch a single assignment by ID
 * @param id - Assignment ID (optional, query disabled if undefined)
 * @returns Query result with assignment details
 */
export const useAssignment = (id?: string) => {
  const service = getAssignmentApiService();

  return useQuery({
    queryKey: id ? assignmentKeys.detail(id) : assignmentKeys.details(),
    queryFn: async () => {
      if (!id) throw new Error('Missing assignment id');
      return service.getAssignmentById(id);
    },
    staleTime: 60 * 1000, // 1 minute
    enabled: !!id, // Only fetch if ID is provided
  });
};

/**
 * Hook to fetch assignment data via post ID
 * Uses the post-based endpoint that joins through assignment_post table
 * Should be used in feed contexts where post ID is readily available
 * @param postId - Post ID (optional, query disabled if undefined)
 * @returns Query result with assignment details
 */
export const useAssignmentByPost = (postId?: string) => {
  const service = getAssignmentApiService();

  return useQuery({
    queryKey: postId ? [...assignmentKeys.detail('post'), postId] : [...assignmentKeys.details(), 'post'],
    queryFn: async () => {
      if (!postId) return;
      return service.getAssignmentByPostId(postId);
    },
    staleTime: 60 * 1000, // 1 minute
    enabled: !!postId,
  });
};

/**
 * Hook to create a new assignment
 * Automatically invalidates assignment lists after successful creation
 * @returns Mutation function and state
 */
export const useCreateAssignment = () => {
  const queryClient = useQueryClient();
  const service = getAssignmentApiService();

  return useMutation({
    mutationFn: (data: CreateAssignmentRequest) => service.createAssignment(data),
    onSuccess: () => {
      // Invalidate all assignment lists to refetch with new data
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() });
    },
  });
};

/**
 * Hook to update an existing assignment
 * Automatically invalidates related queries after successful update
 * @returns Mutation function and state
 */
export const useUpdateAssignment = () => {
  const queryClient = useQueryClient();
  const service = getAssignmentApiService();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateAssignmentRequest }) =>
      service.updateAssignment(id, data),
    onSuccess: (_, variables) => {
      // Invalidate both the specific assignment and all lists
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: assignmentKeys.detail(variables.id),
      });
    },
  });
};

/**
 * Hook to delete an assignment
 * Automatically invalidates assignment lists after successful deletion
 * @returns Mutation function and state
 */
export const useDeleteAssignment = () => {
  const queryClient = useQueryClient();
  const service = getAssignmentApiService();

  return useMutation({
    mutationFn: (id: string) => service.deleteAssignment(id),
    onSuccess: () => {
      // Invalidate all assignment lists
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() });
    },
  });
};

/**
 * Hook to generate an assessment matrix using AI
 * @returns Mutation function and state
 */
export const useGenerateMatrix = () => {
  const service = getAssignmentApiService();

  return useMutation({
    mutationFn: (request: GenerateMatrixRequest) => service.generateMatrix(request),
  });
};

/**
 * Hook to generate an exam from a matrix (detects gaps)
 * @returns Mutation function and state that returns AssignmentDraft with gaps
 */
export const useGenerateAssignmentFromMatrix = () => {
  const service = getAssignmentApiService();

  return useMutation({
    mutationFn: (request: GenerateAssignmentFromMatrixRequest) =>
      service.generateAssignmentFromMatrix(request),
  });
};

export const useUpdateAssignmentChapter = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...payload }: { id: string } & UpdateChapterPayload) => {
      await getExamplePromptsApiService().updateDocumentChapter('assignment', id, payload);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ['real', 'allDocuments'] });
      queryClient.invalidateQueries({ queryKey: ['real', 'allDocumentsInfinite'] });
      queryClient.invalidateQueries({ queryKey: ['real', 'recentDocuments'] });
    },
  });
};
