// Request types
export interface PostCreateRequest {
  classId: string;
  type: 'Post' | 'Assignment';
  content: string;
  attachments?: File[];
  linkedResourceIds?: string[];
  linkedLessonId?: string; // Note: singular, not plural
  assignmentId?: string; // For Assignment type posts
  allowComments?: boolean;
}

export interface PostUpdateRequest {
  id: string;
  content?: string;
  type?: 'Post' | 'Assignment';
  attachments?: File[];
  linkedResourceIds?: string[];
  linkedLessonId?: string;
  assignmentId?: string; // For Assignment type posts
  isPinned?: boolean;
  allowComments?: boolean;
}

export interface CommentCreateRequest {
  postId: string;
  content: string;
}

// Feed Filter
export interface FeedFilter {
  type: 'all' | 'Post' | 'Assignment';
  search?: string;
  startDate?: Date;
  endDate?: Date;
}
