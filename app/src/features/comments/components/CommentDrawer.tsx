import { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Separator } from '@/shared/components/ui/separator';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import { CommentForm } from './CommentForm';
import { CommentList } from './CommentList';
import { useCommentApiService } from '../api';
import type { Comment } from '../types';

interface CommentDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
  documentType: 'presentation' | 'mindmap';
  userPermission: 'read' | 'comment' | 'edit';
}

export function CommentDrawer({
  isOpen,
  onOpenChange,
  documentId,
  documentType,
  userPermission,
}: CommentDrawerProps) {
  const { t } = useTranslation(I18N_NAMESPACES.COMMENTS);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const apiService = useCommentApiService();
  const canComment = userPermission === 'comment' || userPermission === 'edit';

  // Fetch comments when drawer opens
  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, documentId, documentType]);

  const fetchComments = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getComments(documentType, documentId);
      setComments(data);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      toast.error(t('messages.loadFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateComment = async (content: string, mentionedUserIds: string[]) => {
    setIsSubmitting(true);
    try {
      const newComment = await apiService.createComment(documentType, documentId, {
        content,
        mentionedUserIds,
      });
      setComments((prev) => [newComment, ...prev]);
      toast.success(t('messages.addSuccess'));
    } catch (error) {
      console.error('Failed to create comment:', error);
      toast.error(t('messages.addFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (commentId: string) => async (content: string, mentionedUserIds: string[]) => {
    try {
      const updated = await apiService.updateComment(documentType, documentId, commentId, {
        content,
        mentionedUserIds,
      });

      // Update comment in the tree
      setComments((prev) => updateCommentInTree(prev, commentId, updated));
      toast.success(t('messages.updateSuccess'));
    } catch (error) {
      console.error('Failed to edit comment:', error);
      toast.error(t('messages.updateFailed'));
      throw error;
    }
  };

  const handleDelete = (commentId: string) => async () => {
    try {
      await apiService.deleteComment(documentType, documentId, commentId);

      // Remove comment from tree
      setComments((prev) => removeCommentFromTree(prev, commentId));
      toast.success(t('messages.deleteSuccess'));
    } catch (error) {
      console.error('Failed to delete comment:', error);
      toast.error(t('messages.deleteFailed'));
      throw error;
    }
  };

  // Helper functions to update comment tree
  const updateCommentInTree = (comments: Comment[], commentId: string, updated: Comment): Comment[] => {
    return comments.map((comment) => {
      if (comment.id === commentId) {
        return { ...comment, ...updated };
      }
      return comment;
    });
  };

  const removeCommentFromTree = (comments: Comment[], commentId: string): Comment[] => {
    return comments.filter((comment) => comment.id !== commentId);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="z-[10000] flex w-full flex-col p-0 sm:max-w-lg"
        aria-describedby={undefined}
      >
        <SheetHeader className="flex-shrink-0 p-6 pb-4">
          <SheetTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            {t('drawer.titleWithCount', { count: comments.length })}
          </SheetTitle>
        </SheetHeader>

        <Separator />

        <div className="flex flex-1 flex-col overflow-hidden">
          {canComment && (
            <div className="flex-shrink-0 p-6 pb-4">
              <CommentForm
                onSubmit={handleCreateComment}
                placeholder={t('form.placeholder')}
                submitLabel={t('form.submit')}
                isSubmitting={isSubmitting}
              />
            </div>
          )}

          {canComment && <Separator />}

          <ScrollArea className="flex-1">
            <div className="p-6 pt-4">
              <CommentList
                comments={comments}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isLoading={isLoading}
              />
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
