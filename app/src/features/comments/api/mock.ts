import type { ApiClient } from '@aiprimary/api';
import type {
  CommentApiService,
  Comment,
  CreateCommentRequest,
  Mention,
  UpdateCommentRequest,
} from '../types';

export default class CommentMockService implements CommentApiService {
  private mockComments: Comment[] = [];

  constructor(_apiClient: ApiClient, _baseUrl: string) {
    // Mock service doesn't need to use these parameters
  }

  async getComments(
    _documentType: string,
    _documentId: string,
    _page?: number,
    _pageSize?: number
  ): Promise<Comment[]> {
    // Return mock comments for testing
    return Promise.resolve([]);
  }

  async getCommentCount(_documentType: string, _documentId: string): Promise<number> {
    return Promise.resolve(0);
  }

  async createComment(
    documentType: string,
    documentId: string,
    data: CreateCommentRequest
  ): Promise<Comment> {
    const timestamp = new Date().toISOString();
    const newComment: Comment = {
      id: Math.random().toString(36).substring(7),
      documentId,
      documentType: documentType as 'presentation' | 'mindmap',
      content: data.content,
      author: {
        id: 'mock-user',
        name: 'Mock User',
        avatarUrl: undefined,
      },
      canEdit: true,
      canDelete: true,
      mentionedUserIds: data.mentionedUserIds || [],
      createdAt: timestamp,
      updatedAt: timestamp,
      isEdited: false,
    };
    this.mockComments.push(newComment);
    return Promise.resolve(newComment);
  }

  async updateComment(
    _documentType: string,
    _documentId: string,
    commentId: string,
    data: UpdateCommentRequest
  ): Promise<Comment> {
    const comment = this.mockComments.find((c) => c.id === commentId);
    if (comment) {
      comment.content = data.content;
      comment.updatedAt = new Date().toISOString();
      comment.isEdited = true;
    }
    return Promise.resolve(comment!);
  }

  async deleteComment(_documentType: string, _documentId: string, commentId: string): Promise<void> {
    this.mockComments = this.mockComments.filter((c) => c.id !== commentId);
    return Promise.resolve();
  }

  async getMentions(_unreadOnly: boolean = false): Promise<Mention[]> {
    return Promise.resolve([]);
  }

  async markMentionAsRead(_mentionId: string): Promise<void> {
    return Promise.resolve();
  }
}
