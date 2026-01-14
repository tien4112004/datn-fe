import { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/shared/components/ui/sheet';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Separator } from '@/shared/components/ui/separator';
import { toast } from 'sonner';
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
      toast.error('Failed to load comments');
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
      toast.success('Comment added successfully');
    } catch (error) {
      console.error('Failed to create comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = (parentId: string) => async (content: string, mentionedUserIds: string[]) => {
    try {
      const reply = await apiService.replyToComment(documentType, documentId, parentId, {
        content,
        mentionedUserIds,
      });

      // Update comments tree with new reply
      setComments((prev) => updateCommentsWithReply(prev, parentId, reply));
      toast.success('Reply added successfully');
    } catch (error) {
      console.error('Failed to reply:', error);
      toast.error('Failed to add reply');
      throw error;
    }
  };

  const handleEdit = (commentId: string) => async (content: string, mentionedUserIds: string[]) => {
    try {
      const updated = await apiService.updateComment(commentId, {
        content,
        mentionedUserIds,
      });

      // Update comment in the tree
      setComments((prev) => updateCommentInTree(prev, commentId, updated));
      toast.success('Comment updated successfully');
    } catch (error) {
      console.error('Failed to edit comment:', error);
      toast.error('Failed to update comment');
      throw error;
    }
  };

  const handleDelete = (commentId: string) => async () => {
    try {
      await apiService.deleteComment(commentId, documentId);

      // Remove comment from tree
      setComments((prev) => removeCommentFromTree(prev, commentId));
      toast.success('Comment deleted successfully');
    } catch (error) {
      console.error('Failed to delete comment:', error);
      toast.error('Failed to delete comment');
      throw error;
    }
  };

  // Helper functions to update comment tree
  const updateCommentsWithReply = (comments: Comment[], parentId: string, reply: Comment): Comment[] => {
    return comments.map((comment) => {
      if (comment.id === parentId) {
        return {
          ...comment,
          replies: [...(comment.replies || []), reply],
          replyCount: comment.replyCount + 1,
        };
      }
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: updateCommentsWithReply(comment.replies, parentId, reply),
        };
      }
      return comment;
    });
  };

  const updateCommentInTree = (comments: Comment[], commentId: string, updated: Comment): Comment[] => {
    return comments.map((comment) => {
      if (comment.id === commentId) {
        return { ...comment, ...updated };
      }
      if (comment.replies && comment.replies.length > 0) {
        return {
          ...comment,
          replies: updateCommentInTree(comment.replies, commentId, updated),
        };
      }
      return comment;
    });
  };

  const removeCommentFromTree = (comments: Comment[], commentId: string): Comment[] => {
    return comments
      .filter((comment) => comment.id !== commentId)
      .map((comment) => ({
        ...comment,
        replies: comment.replies ? removeCommentFromTree(comment.replies, commentId) : undefined,
      }));
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-lg">
        <SheetHeader className="flex-shrink-0 p-6 pb-4">
          <SheetTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comments ({comments.length})
          </SheetTitle>
        </SheetHeader>

        <Separator />

        <div className="flex flex-1 flex-col overflow-hidden">
          {canComment && (
            <div className="flex-shrink-0 p-6 pb-4">
              <CommentForm
                onSubmit={handleCreateComment}
                placeholder="Write a comment..."
                submitLabel="Comment"
                isSubmitting={isSubmitting}
              />
            </div>
          )}

          {canComment && <Separator />}

          <ScrollArea className="flex-1">
            <div className="p-6 pt-4">
              <CommentList
                comments={comments}
                onReply={handleReply}
                onEdit={handleEdit}
                onDelete={handleDelete}
                canComment={canComment}
                isLoading={isLoading}
              />
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
