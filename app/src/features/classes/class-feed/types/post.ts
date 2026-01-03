// Class Feed Post
export interface Post {
  id: string;
  classId: string;
  authorId: string;
  type: 'announcement' | 'general' | 'schedule_event';
  content: string;
  attachments?: string[]; // Array of URLs from backend
  linkedResourceIds?: string[];
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
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
