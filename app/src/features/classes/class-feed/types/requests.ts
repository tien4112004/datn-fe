import type { LinkedResourceRequest } from './resource';

// Request types
export interface PostCreateRequest {
  classId: string;
  type: 'Post' | 'Homework';
  content: string;
  attachments?: string[]; // CDN URLs from upload endpoint
  linkedResources?: LinkedResourceRequest[];
  linkedLessonId?: string; // Note: singular, not plural
  assignmentId?: string; // For Homework type posts
  allowComments?: boolean;
}

export interface PostUpdateRequest {
  id: string;
  content?: string;
  type?: 'Post' | 'Homework';
  attachments?: string[]; // CDN URLs from upload endpoint
  linkedResources?: LinkedResourceRequest[];
  linkedLessonId?: string;
  assignmentId?: string; // For Homework type posts
  isPinned?: boolean;
  allowComments?: boolean;
}

export interface CommentCreateRequest {
  postId: string;
  content: string;
}

// Feed Filter
export interface FeedFilter {
  type: 'all' | 'Post' | 'Homework';
  search?: string;
  startDate?: Date;
  endDate?: Date;
}
