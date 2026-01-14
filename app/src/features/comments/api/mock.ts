import { API_MODE, type ApiMode } from '@aiprimary/api';
import type {
  CommentApiService,
  Comment,
  CreateCommentRequest,
  Mention,
  UpdateCommentRequest,
} from '../types';

export default class CommentMockService implements CommentApiService {
  baseUrl: string;
  private mockComments: Comment[] = [];

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  getType(): ApiMode {
    return API_MODE.mock;
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
    const newComment: Comment = {
      id: Math.random().toString(36).substring(7),
      documentId,
      documentType: documentType as 'presentation' | 'mindmap',
      content: data.content,
      author: {
        id: 'mock-user',
        name: 'Mock User',
        email: 'mock@example.com',
      },
      replyCount: 0,
      isEdited: false,
      canEdit: true,
      canDelete: true,
      mentions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.mockComments.push(newComment);
    return Promise.resolve(newComment);
  }

  async replyToComment(
    documentType: string,
    documentId: string,
    parentCommentId: string,
    data: CreateCommentRequest
  ): Promise<Comment> {
    const reply: Comment = {
      id: Math.random().toString(36).substring(7),
      documentId,
      documentType: documentType as 'presentation' | 'mindmap',
      content: data.content,
      author: {
        id: 'mock-user',
        name: 'Mock User',
        email: 'mock@example.com',
      },
      parentCommentId,
      replyCount: 0,
      isEdited: false,
      canEdit: true,
      canDelete: true,
      mentions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return Promise.resolve(reply);
  }

  async updateComment(commentId: string, data: UpdateCommentRequest): Promise<Comment> {
    const comment = this.mockComments.find((c) => c.id === commentId);
    if (comment) {
      comment.content = data.content;
      comment.isEdited = true;
    }
    return Promise.resolve(comment!);
  }

  async deleteComment(commentId: string, _documentId: string): Promise<void> {
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
