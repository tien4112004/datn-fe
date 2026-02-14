import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/shared/context/auth';
import { useClassFeedApiService } from '../api';
import type {
  Comment,
  CommentCreateRequest,
  FeedFilter,
  Post,
  PostCreateRequest,
  PostUpdateRequest,
} from '../types';
import type { ApiResponse } from '@aiprimary/api';

// Query Keys
export const feedQueryKeys = {
  all: ['class-feed'] as const,
  posts: (classId: string, filter: FeedFilter) => [...feedQueryKeys.all, 'posts', classId, filter] as const,
  post: (postId: string) => [...feedQueryKeys.all, 'post', postId] as const,
  comments: (postId: string) => [...feedQueryKeys.all, 'comments', postId] as const,
  comment: (commentId: string) => [...feedQueryKeys.all, 'comment', commentId] as const,
};

// Helper to update comment count on a post
function updatePostCommentCount(
  queryClient: ReturnType<typeof useQueryClient>,
  postId: string,
  delta: number
): ApiResponse<Post[]> | undefined {
  const previousData = queryClient.getQueriesData<ApiResponse<Post[]>>({
    queryKey: feedQueryKeys.all,
  });

  queryClient.setQueriesData<ApiResponse<Post[]>>({ queryKey: feedQueryKeys.all }, (oldData) => {
    if (!oldData?.data) return oldData;
    return {
      ...oldData,
      data: oldData.data.map((post) =>
        post.id === postId ? { ...post, commentCount: Math.max(0, post.commentCount + delta) } : post
      ),
    };
  });

  return previousData[0]?.[1];
}

/**
 * Hook for managing posts query with filter and pagination state
 */
export function usePosts(classId: string) {
  const classFeedApi = useClassFeedApiService();

  // Feed state
  const [filter, setFilter] = useState<FeedFilter>({ type: 'all' });
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Posts Query
  const postsQuery = useQuery({
    queryKey: feedQueryKeys.posts(classId, filter),
    queryFn: () => classFeedApi.getPosts(classId, filter, currentPage, pageSize),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!classId,
  });

  // Feed methods
  const posts = postsQuery.data?.data || [];
  const hasMore = currentPage < (postsQuery.data?.pagination?.totalPages || 1);

  const loadMore = useCallback(() => {
    if (!postsQuery.isLoading && hasMore) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [postsQuery.isLoading, hasMore]);

  const updateFilter = useCallback((newFilter: FeedFilter) => {
    setFilter(newFilter);
    setCurrentPage(1); // Reset page when filter changes
  }, []);

  const refresh = useCallback(() => {
    postsQuery.refetch();
  }, [postsQuery]);

  return {
    // Data
    posts,
    filter,
    currentPage,
    hasMore,

    // State
    loading: postsQuery.isLoading,
    error: postsQuery.error,

    // Methods
    loadMore,
    updateFilter,
    refresh,
  };
}

/**
 * Hook for fetching a single post by ID
 */
export function usePost(postId: string) {
  const classFeedApi = useClassFeedApiService();

  const postQuery = useQuery({
    queryKey: feedQueryKeys.post(postId),
    queryFn: () => classFeedApi.getPostById(postId),
    enabled: !!postId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    post: postQuery.data,
    loading: postQuery.isLoading,
    error: postQuery.error,
    refetch: postQuery.refetch,
  };
}

/**
 * Hook for managing comments query for a specific post
 */
export function useComments(postId: string) {
  const classFeedApi = useClassFeedApiService();

  const commentsQuery = useQuery({
    queryKey: feedQueryKeys.comments(postId),
    queryFn: () => classFeedApi.getComments(postId),
    enabled: !!postId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  return {
    comments: commentsQuery.data || [],
    loading: commentsQuery.isLoading,
    error: commentsQuery.error,
    refetch: commentsQuery.refetch,
  };
}

/**
 * Hook for creating a new post
 */
export function useCreatePost() {
  const queryClient = useQueryClient();
  const classFeedApi = useClassFeedApiService();
  const { t } = useTranslation('classes');

  return useMutation({
    mutationFn: (request: PostCreateRequest) => classFeedApi.createPost(request),

    onMutate: async (request) => {
      // Cancel ongoing queries
      await queryClient.cancelQueries({ queryKey: feedQueryKeys.all });

      // Create optimistic post
      const optimisticPost: Post = {
        id: `temp-${Date.now()}`,
        classId: request.classId,
        authorId: 'current-user',
        type: request.type,
        content: request.content,
        attachments: request.attachments,
        assignmentId: request.assignmentId,
        dueDate: request.dueDate,
        isPinned: false,
        allowComments: request.allowComments ?? true,
        commentCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save previous state and add optimistic post
      const previousData = queryClient.getQueriesData<ApiResponse<Post[]>>({
        queryKey: feedQueryKeys.all,
      });

      queryClient.setQueriesData<ApiResponse<Post[]>>({ queryKey: feedQueryKeys.all }, (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: [optimisticPost, ...(oldData.data || [])],
        };
      });

      return { previousPosts: previousData[0]?.[1] };
    },

    onSuccess: () => {
      // Invalidate to refetch with real server data
      queryClient.invalidateQueries({ queryKey: feedQueryKeys.all });
      toast.success(t('feed.success.postCreated'));
    },

    onError: (error, _request, context) => {
      // Rollback optimistic update on error
      if (context?.previousPosts) {
        queryClient.setQueriesData({ queryKey: feedQueryKeys.all }, context.previousPosts);
      }
      toast.error(t('feed.errors.createFailed'), {
        description: error instanceof Error ? error.message : t('feed.errors.genericError'),
      });
    },
  });
}

/**
 * Hook for updating an existing post
 */
export function useUpdatePost() {
  const queryClient = useQueryClient();
  const classFeedApi = useClassFeedApiService();
  const { t } = useTranslation('classes');

  return useMutation({
    mutationFn: (request: PostUpdateRequest) => classFeedApi.updatePost(request),

    onMutate: async (request) => {
      // Cancel ongoing queries
      await queryClient.cancelQueries({ queryKey: feedQueryKeys.all });

      // Save previous state
      const previousData = queryClient.getQueriesData<ApiResponse<Post[]>>({
        queryKey: feedQueryKeys.all,
      });

      // Optimistically update the post
      queryClient.setQueriesData<ApiResponse<Post[]>>({ queryKey: feedQueryKeys.all }, (oldData) => {
        if (!oldData?.data) return oldData;
        return {
          ...oldData,
          data: oldData.data.map((post) =>
            post.id === request.id
              ? {
                  ...post,
                  ...(request.content !== undefined && { content: request.content }),
                  ...(request.type !== undefined && { type: request.type }),
                  ...(request.attachments !== undefined && { attachments: request.attachments }),
                  updatedAt: new Date(),
                }
              : post
          ),
        };
      });

      // Update the single post query
      return { previousPosts: previousData[0]?.[1] };
    },

    onSuccess: () => {
      // Invalidate to refetch with real server data
      queryClient.invalidateQueries({ queryKey: feedQueryKeys.all });
      toast.success(t('feed.success.postUpdated'));
    },

    onError: (error, _request, context) => {
      // Rollback on error
      if (context?.previousPosts) {
        queryClient.setQueriesData({ queryKey: feedQueryKeys.all }, context.previousPosts);
      }
      toast.error(t('feed.errors.updateFailed'), {
        description: error instanceof Error ? error.message : t('feed.errors.genericError'),
      });
    },
  });
}

/**
 * Hook for deleting a post
 */
export function useDeletePost() {
  const queryClient = useQueryClient();
  const classFeedApi = useClassFeedApiService();
  const { t } = useTranslation('classes');

  return useMutation({
    mutationFn: (postId: string) => classFeedApi.deletePost(postId),

    onMutate: async (postId) => {
      // Cancel ongoing queries
      await queryClient.cancelQueries({ queryKey: feedQueryKeys.all });

      // Save previous state
      const previousData = queryClient.getQueriesData<ApiResponse<Post[]>>({
        queryKey: feedQueryKeys.all,
      });

      // Optimistically remove the post
      queryClient.setQueriesData<ApiResponse<Post[]>>({ queryKey: feedQueryKeys.all }, (oldData) => {
        if (!oldData?.data) return oldData;
        return {
          ...oldData,
          data: oldData.data.filter((post) => post.id !== postId),
        };
      });

      return { previousPosts: previousData[0]?.[1] };
    },

    onSuccess: () => {
      // Invalidate to refetch with real server data
      queryClient.invalidateQueries({ queryKey: feedQueryKeys.all });
      toast.success(t('feed.success.postDeleted'));
    },

    onError: (error, _postId, context) => {
      // Rollback on error
      if (context?.previousPosts) {
        queryClient.setQueriesData({ queryKey: feedQueryKeys.all }, context.previousPosts);
      }
      toast.error(t('feed.errors.deleteFailed'), {
        description: error instanceof Error ? error.message : t('feed.errors.genericError'),
      });
    },
  });
}

/**
 * Hook for pinning/unpinning a post
 */
export function usePinPost() {
  const queryClient = useQueryClient();
  const classFeedApi = useClassFeedApiService();
  const { t } = useTranslation('classes');

  return useMutation({
    mutationFn: ({ postId, pinned }: { postId: string; pinned: boolean }) =>
      classFeedApi.pinPost(postId, pinned),

    onMutate: async ({ postId, pinned }) => {
      // Cancel ongoing queries
      await queryClient.cancelQueries({ queryKey: feedQueryKeys.all });

      // Save previous state
      const previousData = queryClient.getQueriesData<ApiResponse<Post[]>>({
        queryKey: feedQueryKeys.all,
      });

      // Optimistically update pin status
      queryClient.setQueriesData<ApiResponse<Post[]>>({ queryKey: feedQueryKeys.all }, (oldData) => {
        if (!oldData?.data) return oldData;
        return {
          ...oldData,
          data: oldData.data.map((post) => (post.id === postId ? { ...post, isPinned: pinned } : post)),
        };
      });

      // Update the single post query
      return { previousPosts: previousData[0]?.[1] };
    },

    onSuccess: (_, variables) => {
      // Invalidate to refetch (may reorder pinned posts)
      queryClient.invalidateQueries({ queryKey: feedQueryKeys.all });
      toast.success(variables.pinned ? t('feed.success.postPinned') : t('feed.success.postUnpinned'));
    },

    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousPosts) {
        queryClient.setQueriesData({ queryKey: feedQueryKeys.all }, context.previousPosts);
      }
      toast.error(
        variables.pinned ? t('feed.errors.pinFailed', { action: 'pin' }) : t('feed.errors.unpinFailed'),
        {
          description: error instanceof Error ? error.message : t('feed.errors.genericError'),
        }
      );
    },
  });
}

/**
 * Hook for creating a new comment
 */
export function useCreateComment() {
  const queryClient = useQueryClient();
  const classFeedApi = useClassFeedApiService();
  const { t } = useTranslation('classes');
  const { user: currentUser } = useAuth();

  return useMutation({
    mutationFn: (request: CommentCreateRequest) => classFeedApi.createComment(request),

    onMutate: async (request) => {
      const { postId } = request;

      // Cancel ongoing queries
      await queryClient.cancelQueries({ queryKey: feedQueryKeys.comments(postId) });
      await queryClient.cancelQueries({ queryKey: feedQueryKeys.all });

      // Create optimistic comment with real user data to avoid flickering
      const optimisticComment: Comment = {
        id: `temp-${Date.now()}`,
        postId: request.postId,
        userId: currentUser?.id || 'current-user',
        user: currentUser
          ? {
              id: currentUser.id,
              firstName: currentUser.firstName || '',
              lastName: currentUser.lastName || '',
              email: currentUser.email,
              avatarUrl: currentUser.avatarUrl || currentUser.avatar || null,
            }
          : undefined,
        content: request.content,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Save previous comments
      const previousComments = queryClient.getQueryData<Comment[]>(feedQueryKeys.comments(postId));

      // Save previous posts and increment comment count
      const previousPosts = updatePostCommentCount(queryClient, postId, 1);

      // Add optimistic comment
      queryClient.setQueryData<Comment[]>(feedQueryKeys.comments(postId), (old = []) => [
        ...old,
        optimisticComment,
      ]);

      return { previousComments, previousPosts, postId };
    },

    onSuccess: () => {
      // Invalidate both comments and posts queries
      queryClient.invalidateQueries({ queryKey: feedQueryKeys.all });
      toast.success(t('feed.success.commentAdded'));
    },

    onError: (error, _request, context) => {
      // Rollback comments
      if (context?.previousComments) {
        queryClient.setQueryData(feedQueryKeys.comments(context.postId), context.previousComments);
      }
      // Rollback posts comment count
      if (context?.previousPosts) {
        queryClient.setQueriesData({ queryKey: feedQueryKeys.all }, context.previousPosts);
      }
      toast.error(t('feed.errors.commentFailed'), {
        description: error instanceof Error ? error.message : t('feed.errors.genericError'),
      });
    },
  });
}

/**
 * Hook for deleting a comment
 */
export function useDeleteComment() {
  const queryClient = useQueryClient();
  const classFeedApi = useClassFeedApiService();
  const { t } = useTranslation('classes');

  return useMutation({
    mutationFn: ({ commentId }: { commentId: string; postId: string }) =>
      classFeedApi.deleteComment(commentId),

    onMutate: async ({ commentId, postId }) => {
      // Cancel ongoing queries
      await queryClient.cancelQueries({ queryKey: feedQueryKeys.comments(postId) });
      await queryClient.cancelQueries({ queryKey: feedQueryKeys.all });

      // Save previous comments
      const previousComments = queryClient.getQueryData<Comment[]>(feedQueryKeys.comments(postId));

      // Save previous posts and decrement comment count
      const previousPosts = updatePostCommentCount(queryClient, postId, -1);

      // Remove comment optimistically
      queryClient.setQueryData<Comment[]>(feedQueryKeys.comments(postId), (old = []) =>
        old.filter((c) => c.id !== commentId)
      );

      return { previousComments, previousPosts, postId };
    },

    onSuccess: () => {
      // Invalidate both comments and posts queries
      queryClient.invalidateQueries({ queryKey: feedQueryKeys.all });
      toast.success(t('feed.success.commentDeleted'));
    },

    onError: (error, _variables, context) => {
      // Rollback comments
      if (context?.previousComments) {
        queryClient.setQueryData(feedQueryKeys.comments(context.postId), context.previousComments);
      }
      // Rollback posts comment count
      if (context?.previousPosts) {
        queryClient.setQueriesData({ queryKey: feedQueryKeys.all }, context.previousPosts);
      }
      toast.error(t('feed.errors.deleteCommentFailed'), {
        description: error instanceof Error ? error.message : t('feed.errors.genericError'),
      });
    },
  });
}

/**
 * Combined hook for all post-related mutations
 * Provides a convenient interface for managing posts
 */
export function usePostMutations() {
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();
  const deletePost = useDeletePost();
  const pinPost = usePinPost();

  return {
    // Individual mutations
    createPost,
    updatePost,
    deletePost,
    pinPost,

    // Loading states
    isCreating: createPost.isPending,
    isUpdating: updatePost.isPending,
    isDeleting: deletePost.isPending,
    isPinning: pinPost.isPending,

    // Combined loading state
    isLoading: createPost.isPending || updatePost.isPending || deletePost.isPending || pinPost.isPending,
  };
}
