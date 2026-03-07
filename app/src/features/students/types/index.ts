export * from './performance';
export type { Student } from '../../classes/class-student/types/student';

export interface StudentSubmission {
  id: string;
  assignmentId?: string;
  postId?: string;
  assignmentTitle?: string;
  className?: string;
  score?: number;
  maxScore?: number;
  status: 'in_progress' | 'submitted' | 'graded' | 'pending';
  submittedAt?: string;
  feedback?: string;
}
