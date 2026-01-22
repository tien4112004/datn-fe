import type { LinkedResourceResponse } from '@/features/projects/types/resource';

// User minimal info from backend
export interface UserMinimalInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
}

// Class Feed Post
export interface Post {
  id: string;
  classId: string;
  authorId: string;
  author?: UserMinimalInfo; // User info from backend
  type: 'Post' | 'Homework';
  content: string;
  attachments?: string[]; // Array of URLs from backend
  linkedResources?: LinkedResourceResponse[];
  linkedLessonId?: string;
  isPinned: boolean;
  allowComments?: boolean;
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Comment on Post
export interface Comment {
  id: string;
  postId: string;
  userId: string;
  user?: UserMinimalInfo; // User info from backend
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
