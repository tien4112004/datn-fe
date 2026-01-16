import type { Service } from '@/shared/api';
import type { Comment, CreateCommentRequest, Mention, UpdateCommentRequest } from './comment';

export interface CommentApiService extends Service {
  getComments(documentType: string, documentId: string, page?: number, pageSize?: number): Promise<Comment[]>;
  getCommentCount(documentType: string, documentId: string): Promise<number>;
  createComment(documentType: string, documentId: string, data: CreateCommentRequest): Promise<Comment>;
  updateComment(
    documentType: string,
    documentId: string,
    commentId: string,
    data: UpdateCommentRequest
  ): Promise<Comment>;
  deleteComment(documentType: string, documentId: string, commentId: string): Promise<void>;
  getMentions(unreadOnly?: boolean): Promise<Mention[]>;
  markMentionAsRead(mentionId: string): Promise<void>;
}
