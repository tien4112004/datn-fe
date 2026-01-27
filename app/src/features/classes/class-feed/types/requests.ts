import type { LinkedResourceRequest } from '@/features/projects/types/resource';

// Request types
export interface PostCreateRequest {
  classId: string;
  type: 'Post' | 'Exercise';
  content: string;
  attachments?: string[]; // CDN URLs from upload endpoint
  linkedResources?: LinkedResourceRequest[];
  linkedLessonId?: string; // Note: singular, not plural
  assignmentId?: string; // For Exercise type posts
  dueDate?: string; // ISO string for Exercise type posts
  allowComments?: boolean;
}

export interface PostUpdateRequest {
  id: string;
  content?: string;
  type?: 'Post' | 'Exercise';
  attachments?: string[]; // CDN URLs from upload endpoint
  linkedResources?: LinkedResourceRequest[];
  linkedLessonId?: string;
  assignmentId?: string; // For Exercise type posts
  dueDate?: string; // ISO string for Exercise type posts
  isPinned?: boolean;
  allowComments?: boolean;
}

export interface CommentCreateRequest {
  postId: string;
  content: string;
}

// Feed Filter
export interface FeedFilter {
  type: 'all' | 'Post' | 'Exercise';
  search?: string;
  startDate?: Date;
  endDate?: Date;
}
