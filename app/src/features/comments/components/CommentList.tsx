import { Separator } from '@/shared/components/ui/separator';
import { CommentItem } from './CommentItem';
import type { Comment } from '../types';

interface CommentListProps {
  comments: Comment[];
  onReply: (parentId: string) => (content: string, mentions: string[]) => Promise<void>;
  onEdit: (commentId: string) => (content: string, mentions: string[]) => Promise<void>;
  onDelete: (commentId: string) => () => Promise<void>;
  canComment: boolean;
  isLoading?: boolean;
}

export function CommentList({
  comments,
  onReply,
  onEdit,
  onDelete,
  canComment,
  isLoading = false,
}: CommentListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-sm text-gray-500">Loading comments...</p>
      </div>
    );
  }

  if (comments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="mb-1 text-sm text-gray-500">No comments yet</p>
        <p className="text-xs text-gray-400">
          {canComment ? 'Be the first to comment!' : 'No comments to display'}
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {comments.map((comment, index) => (
        <div key={comment.id}>
          <CommentItem
            comment={comment}
            onReply={onReply(comment.id)}
            onEdit={onEdit(comment.id)}
            onDelete={onDelete(comment.id)}
            canComment={canComment}
          />
          {index < comments.length - 1 && <Separator />}
        </div>
      ))}
    </div>
  );
}
