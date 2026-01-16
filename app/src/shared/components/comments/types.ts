/**
 * Shared type definitions for comment components
 */

export interface CommentUser {
  id: string;
  name: string;
  avatarUrl?: string | null;
}

export interface BaseComment {
  id: string;
  content: string;
  createdAt: string | Date;
  updatedAt?: string | Date;
  isEdited?: boolean;
}
