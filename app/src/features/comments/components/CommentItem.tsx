import { useState } from 'react';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import { Button } from '@ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@ui/dropdown-menu';
import { CommentForm } from './CommentForm';
import type { Comment } from '../types';
import { CommentHeader } from '@/shared/components/comments';

interface CommentItemProps {
  comment: Comment;
  onEdit?: (content: string, mentions: string[]) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export function CommentItem({ comment, onEdit, onDelete }: CommentItemProps) {
  const { t } = useTranslation(I18N_NAMESPACES.COMMENTS);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (!confirm(t('confirmations.deleteComment'))) return;

    try {
      await onDelete();
    } catch (error) {
      console.error('Failed to delete:', error);
    }
  };

  // Safety check for author data
  if (!comment.author) {
    console.error('Comment missing author data:', comment);
    return null;
  }

  return (
    <div className="group">
      <div className="flex gap-3 py-3">
        <div className="min-w-0 flex-1">
          <CommentHeader
            user={comment.author}
            timestamp={comment.createdAt}
            size="sm"
            showEdited={comment.isEdited}
            editedLabel={t('actions.edited')}
            className="mb-1"
          />

          {isEditing ? (
            <CommentForm
              onSubmit={handleEdit}
              onCancel={() => setIsEditing(false)}
              initialContent={comment.content}
              submitLabel={t('form.save')}
              autoFocus
              isSubmitting={isSubmitting}
            />
          ) : (
            <div className="flex items-start justify-between">
              <p className="whitespace-pre-wrap break-words text-sm text-gray-700">{comment.content}</p>

              <div className="mt-2 flex items-center gap-3">
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
                    <DropdownMenuContent align="end" className="z-[10001]">
                      {comment.canEdit && (
                        <DropdownMenuItem onClick={() => setIsEditing(true)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          {t('actions.edit')}
                        </DropdownMenuItem>
                      )}
                      {comment.canDelete && (
                        <DropdownMenuItem onClick={handleDelete} className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          {t('actions.delete')}
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
