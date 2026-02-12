import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { useClassFeedApiService } from '../api';
import type {
  Comment,
  CommentCreateRequest,
  FeedFilter,
  Post,
  PostCreateRequest,
  PostUpdateRequest,
} from '../types';

// Query Keys
const feedQueryKeys = {
  all: ['class-feed'] as const,
  posts: (classId: string, filter: FeedFilter) => [...feedQueryKeys.all, 'posts', classId, filter] as const,
  post: (postId: string) => [...feedQueryKeys.all, 'post', postId] as const,
  comments: (postId: string) => [...feedQueryKeys.all, 'comments', postId] as const,
  comment: (commentId: string) => [...feedQueryKeys.all, 'comment', commentId] as const,
};

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
    onSuccess: (newPost) => {
      // Invalidate and refetch posts queries
      queryClient.invalidateQueries({ queryKey: feedQueryKeys.all });

      // Optimistically add the new post to existing queries
      queryClient.setQueriesData({ queryKey: feedQueryKeys.all }, (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: [newPost, ...(oldData.data || [])],
        };
      });

      toast.success(t('feed.success.postCreated'));
    },
    onError: (error) => {
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
    onSuccess: (updatedPost: Post) => {
      // Update the post in all relevant queries
      queryClient.setQueriesData({ queryKey: feedQueryKeys.all }, (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: oldData.data?.map((post: Post) => (post.id === updatedPost.id ? updatedPost : post)) || [],
        };
      });

      // Update the single post query
      queryClient.setQueryData(feedQueryKeys.post(updatedPost.id), updatedPost);

      toast.success(t('feed.success.postUpdated'));
    },
    onError: (error) => {
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
    onSuccess: (_, postId) => {
      // Remove the post from all relevant queries
      queryClient.setQueriesData({ queryKey: feedQueryKeys.all }, (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: oldData.data?.filter((post: Post) => post.id !== postId) || [],
        };
      });

      toast.success(t('feed.success.postDeleted'));
    },
    onError: (error) => {
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
    onSuccess: (updatedPost: Post, variables) => {
      // Update the post in all relevant queries
      queryClient.setQueriesData({ queryKey: feedQueryKeys.all }, (oldData: any) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          data: oldData.data?.map((post: Post) => (post.id === updatedPost.id ? updatedPost : post)) || [],
        };
      });

      // Update the single post query
      queryClient.setQueryData(feedQueryKeys.post(updatedPost.id), updatedPost);

      toast.success(variables.pinned ? t('feed.success.postPinned') : t('feed.success.postUnpinned'));
    },
    onError: (error, variables) => {
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

  return useMutation({
    mutationFn: (request: CommentCreateRequest) => classFeedApi.createComment(request),
    onSuccess: (newComment: Comment) => {
      // Add the new comment to the comments query
      queryClient.setQueryData(feedQueryKeys.comments(newComment.postId), (oldComments: Comment[] = []) => [
        ...oldComments,
        newComment,
      ]);

      toast.success(t('feed.success.commentAdded'));
    },
    onError: (error) => {
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
    mutationFn: (commentId: string) => classFeedApi.deleteComment(commentId),
    onSuccess: (_, commentId) => {
      // Remove the comment from all comments queries
      queryClient.setQueriesData({ queryKey: feedQueryKeys.comments }, (oldComments: Comment[] = []) =>
        oldComments.filter((comment) => comment.id !== commentId)
      );

      toast.success(t('feed.success.commentDeleted'));
    },
    onError: (error) => {
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
