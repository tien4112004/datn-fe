import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MoreVertical, Pencil, Trash2, Reply } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { CommentForm } from './CommentForm';
import type { Comment } from '../types';

interface CommentItemProps {
  comment: Comment;
  onReply?: (content: string, mentions: string[]) => Promise<void>;
  onEdit?: (content: string, mentions: string[]) => Promise<void>;
  onDelete?: () => Promise<void>;
  canComment: boolean;
  depth?: number;
}

const MAX_DEPTH = 3;

export function CommentItem({ comment, onReply, onEdit, onDelete, canComment, depth = 0 }: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReplies, setShowReplies] = useState(true);

  const handleReply = async (content: string, mentions: string[]) => {
    if (!onReply) return;
    setIsSubmitting(true);
    try {
      await onReply(content, mentions);
      setIsReplying(false);
    } catch (error) {
      console.error('Failed to reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = async (content: string, mentions: string[]) => {
    if (!onEdit) return;
    setIsSubmitting(true);
    try {
      await onEdit(content, mentions);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to edit:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      await onDelete();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const indentClass = depth > 0 ? `ml-${Math.min(depth * 8, 24)}` : '';

  return (
    <div className={`group ${indentClass}`}>
      <div className="flex gap-3 py-3">
        <Avatar className="h-8 w-8 flex-shrink-0">
          {comment.author.avatarUrl && <AvatarImage src={comment.author.avatarUrl} />}
          <AvatarFallback>{getInitials(comment.author.name)}</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-sm font-medium">{comment.author.name}</span>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
            </span>
            {comment.isEdited && <span className="text-xs text-gray-400">(edited)</span>}
          </div>

          {isEditing ? (
            <CommentForm
              onSubmit={handleEdit}
              onCancel={() => setIsEditing(false)}
              initialContent={comment.content}
              submitLabel="Save"
              autoFocus
              isSubmitting={isSubmitting}
            />
          ) : (
            <>
              <p className="whitespace-pre-wrap break-words text-sm text-gray-700">{comment.content}</p>

              <div className="mt-2 flex items-center gap-3">
                {canComment && depth < MAX_DEPTH && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto px-2 py-1 text-xs text-gray-600 hover:text-gray-900"
                    onClick={() => setIsReplying(!isReplying)}
                  >
                    <Reply className="mr-1 h-3 w-3" />
                    Reply
                  </Button>
                )}

                {comment.replyCount > 0 && comment.replies && comment.replies.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto px-2 py-1 text-xs text-gray-600 hover:text-gray-900"
                    onClick={() => setShowReplies(!showReplies)}
                  >
                    {showReplies ? 'Hide' : 'Show'} {comment.replyCount}{' '}
                    {comment.replyCount === 1 ? 'reply' : 'replies'}
                  </Button>
                )}

                {(comment.canEdit || comment.canDelete) && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto h-auto px-1 py-1 opacity-0 group-hover:opacity-100"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {comment.canEdit && (
                        <DropdownMenuItem onClick={() => setIsEditing(true)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                      )}
                      {comment.canDelete && (
                        <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </>
          )}

          {isReplying && (
            <div className="mt-3">
              <CommentForm
                onSubmit={handleReply}
                onCancel={() => setIsReplying(false)}
                placeholder="Write a reply..."
                submitLabel="Reply"
                autoFocus
                isSubmitting={isSubmitting}
              />
            </div>
          )}
        </div>
      </div>

      {showReplies && comment.replies && comment.replies.length > 0 && (
        <div className="ml-11">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              canComment={canComment}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
