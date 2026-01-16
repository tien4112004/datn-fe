import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useComments, useCreateComment } from '../hooks/useApi';
import { UserAvatar } from '@/components/common/UserAvatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/shared/context/auth';
import { CommentListLoading, CommentListError, useCommentDate } from '@/shared/components/comments';

interface CommentThreadProps {
  postId: string;
  className?: string;
}

export const CommentThread = ({ postId, className = '' }: CommentThreadProps) => {
  const { t } = useTranslation('classes');
  const { user } = useAuth();
  const { comments, loading, error } = useComments(postId);
  const createComment = useCreateComment();
  const { formatRelative } = useCommentDate();

  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      await createComment.mutateAsync({
        postId,
        content: newComment.trim(),
      });
      setNewComment('');
    } catch (err) {
      // Error is handled by the hook
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Comments List */}
      {comments.length > 0 && (
        <div className="space-y-2 md:space-y-3">
          {comments.map((comment) => {
            const user = {
              id: comment.userId,
              name: comment.user
                ? `${comment.user.firstName} ${comment.user.lastName}`
                : `User ${comment.userId.slice(0, 8)}`,
              avatarUrl: comment.user?.avatarUrl || null,
            };

            return (
              <div key={comment.id} className="flex space-x-2 md:space-x-3">
                <UserAvatar name={user.name} src={user.avatarUrl || undefined} size="sm" />
                <div className="flex-1">
                  <div className="rounded-lg bg-gray-100 px-2.5 py-1.5 md:px-3 md:py-2">
                    <div className="mb-1 flex items-center space-x-2">
                      <span className="text-sm font-medium">{user.name}</span>
                      <span className="text-xs text-gray-500">{formatRelative(comment.createdAt)}</span>
                    </div>
                    <p className="whitespace-pre-wrap break-words text-sm text-gray-800">{comment.content}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Loading State */}
      {loading && <CommentListLoading message={t('feed.list.loading')} />}

      {/* Error State */}
      {error && <CommentListError error={error.message} />}

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="flex space-x-2 md:space-x-3">
        <UserAvatar
          name={user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email : 'User'}
          src={user?.avatarUrl || user?.avatar}
          size="sm"
        />
        <div className="flex-1">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={t('feed.creator.placeholders.comment')}
            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={1}
            disabled={submitting}
          />
          {newComment.trim() && (
            <div className="mt-2 flex justify-end">
              <Button type="submit" disabled={submitting}>
                {submitting ? t('feed.creator.actions.posting') : t('feed.creator.actions.postComment')}
              </Button>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};
