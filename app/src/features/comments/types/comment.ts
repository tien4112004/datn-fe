export interface Comment {
  id: string;
  documentId: string;
  documentType: 'presentation' | 'mindmap';
  content: string;

  // Author info (transformed from backend's userId/userName/userAvatar)
  author: {
    id: string;
    name: string;
    avatarUrl?: string;
  };

  // Permission flags (derived from backend's isOwner)
  canEdit: boolean;
  canDelete: boolean;

  // Backend fields
  mentionedUserIds: string[]; // Direct from backend

  // Timestamps
  createdAt: string;
  updatedAt: string;

  // Computed
  isEdited: boolean; // createdAt !== updatedAt (rounded to seconds)
}

export interface CommentBackendResponse {
  id: string;
  presentationId?: string;
  mindmapId?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  isOwner: boolean;
  content: string;
  mentionedUsers: string[];
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
