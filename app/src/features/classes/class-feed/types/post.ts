// Class Feed Post
export interface Post {
  id: string;
  classId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  type: 'announcement' | 'post' | 'assignment';
  content: string;
  attachments?: Attachment[];
  deadline?: Date; // Only for assignments
  isPinned: boolean;
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Comment on Post
export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

// File Attachment
export interface Attachment {
  id: string;
  fileName: string;
  fileType: string; // MIME type
  fileSize: number;
  url: string;
  uploadedAt: Date;
}
