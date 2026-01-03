import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useComments, useCreateComment } from '../hooks/useApi';
import { UserAvatar } from '@/components/common/UserAvatar';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { getLocaleDateFns } from '@/shared/i18n/helper';

interface CommentThreadProps {
  postId: string;
  className?: string;
}

export const CommentThread = ({ postId, className = '' }: CommentThreadProps) => {
  const { t } = useTranslation('classes');
  const { comments, loading, error } = useComments(postId);
  const createComment = useCreateComment();

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
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="flex space-x-3">
              <UserAvatar name={`User ${comment.userId.slice(0, 8)}`} size="sm" />
              <div className="flex-1">
                <div className="rounded-lg bg-gray-100 px-3 py-2">
                  <div className="mb-1 flex items-center space-x-2">
                    <span className="text-sm font-medium">User {comment.userId.slice(0, 8)}</span>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(comment.createdAt, {
                        addSuffix: true,
                        locale: getLocaleDateFns(),
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-800">{comment.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="py-4 text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-b-2 border-blue-500"></div>
          <p className="mt-2 text-sm text-gray-500">{t('feed.list.loading')}</p>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <p className="text-sm text-red-600">{error.message}</p>
        </div>
      )}

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="flex space-x-3">
        <UserAvatar name="Current User" size="sm" />
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
