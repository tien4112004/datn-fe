export interface Comment {
  id: string;
  documentId: string;
  documentType: 'presentation' | 'mindmap';
  content: string;

  author: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };

  parentCommentId?: string;
  threadRootId?: string;
  replyCount: number;
  replies?: Comment[];

  isEdited: boolean;
  canEdit: boolean;
  canDelete: boolean;

  mentions: Array<{
    id: string;
    name: string;
  }>;

  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentRequest {
  content: string;
  mentionedUserIds?: string[];
}

export interface UpdateCommentRequest {
  content: string;
  mentionedUserIds?: string[];
}

export interface Mention {
  id: string;
  commentId: string;
  comment: Comment;
  documentId: string;
  documentType: 'presentation' | 'mindmap';
  isRead: boolean;
  createdAt: string;
}
