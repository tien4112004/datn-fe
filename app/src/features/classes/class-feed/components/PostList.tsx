import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PostCard } from './PostCard';
import { CommentThread } from './CommentThread';
import { usePinPost, useDeletePost } from '../hooks/useApi';
import type { Post } from '../types';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { DeleteConfirmation } from '@/shared/components/common/DeleteConfirmation';
import { AnimatePresence, motion } from 'motion/react';

interface PostListProps {
  posts: Post[];
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
  className?: string;
  filterType?: 'all' | 'Post' | 'Homework';
}

export const PostList = ({
  posts,
  onLoadMore,
  hasMore = false,
  loading = false,
  className = '',
  filterType = 'all',
}: PostListProps) => {
  const { t } = useTranslation('classes');
  const pinPost = usePinPost();
  const deletePost = useDeletePost();
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const { isOpen, openDialog, confirm, cancel } = useConfirmDialog<string>();

  const handlePinPost = async (postId: string, pinned: boolean) => {
    try {
      await pinPost.mutateAsync({ postId, pinned });
    } catch (err) {
      // Error handled by hook
    }
  };

  const handleDeletePost = (postId: string) => {
    openDialog(postId);
  };

  const handleConfirmDelete = async () => {
    confirm(async (postId: string) => {
      try {
        await deletePost.mutateAsync(postId);
      } catch (err) {
        // Error handled by hook
      }
    });
  };

  const toggleComments = (postId: string) => {
    setExpandedComments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  if (posts.length === 0 && !loading) {
    const emptyStateKey =
      filterType === 'Homework'
        ? 'feed.list.empty.homework'
        : filterType === 'Post'
          ? 'feed.list.empty.post'
          : 'feed.list.empty.all';

    return (
      <div className={`px-4 py-8 text-center md:py-12 ${className}`}>
        <div className="mb-4 text-gray-400">
          <svg
            className="mx-auto h-12 w-12 md:h-16 md:w-16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <h3 className="mb-2 text-lg font-medium text-gray-900">{t(`${emptyStateKey}.title`)}</h3>
        <p className="text-gray-500">{t(`${emptyStateKey}.description`)}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {posts.map((post) => (
        <div key={post.id}>
          <PostCard
            post={post}
            onPin={(pinned) => handlePinPost(post.id, pinned)}
            onDelete={() => handleDeletePost(post.id)}
            onComment={() => toggleComments(post.id)}
          />

          <AnimatePresence>
            {expandedComments.has(post.id) && (
              <motion.div
                key="comment-thread"
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: 1, scaleY: 1 }}
                exit={{ opacity: 0, scaleY: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                style={{ transformOrigin: 'top' }}
                className="bg-muted/20 border-b px-3 py-3 pl-9 md:px-6 md:py-4 md:pl-14"
              >
                <CommentThread postId={post.id} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}

      {/* Load More Button */}
      {hasMore && (
        <div className="py-6 text-center">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="rounded-lg bg-gray-100 px-6 py-3 font-medium text-gray-700 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? t('feed.list.loadingMore') : t('feed.list.loadMore')}
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && posts.length === 0 && (
        <div className="py-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
          <p className="mt-4 text-sm text-gray-500">{t('feed.list.loading')}</p>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmation
        open={isOpen}
        onOpenChange={(open) => !open && cancel()}
        onConfirm={handleConfirmDelete}
        onCancel={cancel}
        isDeleting={deletePost.isPending}
        title={t('feed.list.delete.title')}
        description={t('feed.list.delete.description')}
      />
    </div>
  );
};
