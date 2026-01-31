import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useSubmissionApiService } from '../api/submission.index';
import { submissionKeys } from '../api/submissionApi';
import type { SubmissionCreateRequest, SubmissionGradeRequest } from '../api/submission.service';

/**
 * Hook to fetch submissions for a specific post
 */
export const useSubmissionsByPost = (postId: string | undefined) => {
  const service = useSubmissionApiService();

  return useQuery({
    queryKey: submissionKeys.list(postId!),
    queryFn: () => service.getSubmissionsByPost(postId!),
    enabled: !!postId,
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Hook to fetch a single submission by ID
 */
export const useSubmission = (submissionId: string | undefined) => {
  const service = useSubmissionApiService();

  return useQuery({
    queryKey: submissionKeys.detail(submissionId!),
    queryFn: () => service.getSubmissionById(submissionId!),
    enabled: !!submissionId,
    staleTime: 60000, // 1 minute
  });
};

/**
 * Hook to create a new submission
 */
export const useCreateSubmission = () => {
  const service = useSubmissionApiService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: SubmissionCreateRequest) => service.createSubmission(request),
    onSuccess: (_data, variables) => {
      // Invalidate submissions list for this post
      queryClient.invalidateQueries({ queryKey: submissionKeys.list(variables.postId) });
      toast.success('Assignment submitted successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to submit assignment: ${error.message}`);
    },
  });
};

/**
 * Hook to grade a submission
 */
export const useGradeSubmission = () => {
  const service = useSubmissionApiService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ submissionId, request }: { submissionId: string; request: SubmissionGradeRequest }) =>
      service.gradeSubmission(submissionId, request),
    onSuccess: (data) => {
      // Invalidate the specific submission
      queryClient.invalidateQueries({ queryKey: submissionKeys.detail(data.id) });
      // Also invalidate the list if we know the postId
      if (data.assignmentId) {
        queryClient.invalidateQueries({ queryKey: submissionKeys.lists() });
      }
      toast.success('Grading saved successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save grading: ${error.message}`);
    },
  });
};

/**
 * Hook to delete a submission
 */
export const useDeleteSubmission = () => {
  const service = useSubmissionApiService();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (submissionId: string) => service.deleteSubmission(submissionId),
    onSuccess: () => {
      // Invalidate all submission lists
      queryClient.invalidateQueries({ queryKey: submissionKeys.lists() });
      toast.success('Submission deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete submission: ${error.message}`);
    },
  });
};
