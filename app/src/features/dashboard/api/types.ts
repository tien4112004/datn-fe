import type { ApiResponse } from '@aiprimary/api';

export interface DocumentItem {
  id: string;
  title: string;
  thumbnail?: string;
  updatedAt: string;
  type: 'presentation' | 'mindmap' | 'assignment';
}

export interface RecentDocumentsRequest {
  limit?: number;
}

// Analytics Types (based on backend API)

export interface UserMinimalInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

export interface TeacherSummary {
  totalClasses: number;
  totalStudents: number;
  totalAssignments: number;
  pendingGrading: number;
  averageClassScore: number;
  engagementRate24h: number;
  overallGradeDistribution: {
    A: number;
    B: number;
    C: number;
    D: number;
    F: number;
  };
  atRiskStudentsCount?: number;
  comparison?: {
    previousPeriod: {
      averageScore: number;
      engagementRate: number;
    };
  } | null;
}

export interface GradingQueueItem {
  submissionId: string;
  assignmentId: string;
  assignmentTitle: string;
  postId: string;
  classId: string;
  className: string;
  student: UserMinimalInfo;
  submittedAt: string;
  daysSinceSubmission: number;
  status: string;
  autoGradedScore?: number;
  maxScore?: number;
}

export interface AtRiskStudent {
  student: UserMinimalInfo;
  averageScore: number;
  missedSubmissions: number;
  lateSubmissions: number;
  totalAssignments: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  lastActivity?: string;
  trend?: 'improving' | 'declining' | 'stable';
  recommendations?: string[];
}

export interface ClassAtRiskStudents {
  classId: string;
  className: string;
  totalStudents: number;
  atRiskCount: number;
  atRiskStudents: AtRiskStudent[];
}

export const CalendarEventType = {
  DEADLINE: 'DEADLINE',
  GRADING_REMINDER: 'GRADING_REMINDER',
  ASSIGNMENT_RETURNED: 'ASSIGNMENT_RETURNED',
  CLASS_SESSION: 'CLASS_SESSION',
  EXAM: 'EXAM',
  MEETING: 'MEETING',
  OTHER: 'OTHER',
} as const;

export type CalendarEventType = (typeof CalendarEventType)[keyof typeof CalendarEventType];

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  type: CalendarEventType;
  date: string;
  classId: string;
  className: string;
  relatedId?: string;
  status?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface ClassPerformance {
  classId: string;
  className: string;
  totalStudents: number;
  activeStudents: number;
  participationRate: number;
  averageScore: number;
  gradeDistribution: {
    A: number;
    B: number;
    C: number;
    D: number;
    F: number;
  };
  atRiskStudents: AtRiskStudent[];
  recentAssignments: AssignmentSummary[];
  engagement: EngagementMetrics;
}

export interface AssignmentSummary {
  assignmentId: string;
  title: string;
  dueDate?: string;
  totalSubmissions: number;
  gradedSubmissions: number;
  averageScore: number;
  participationRate: number;
}

export interface EngagementMetrics {
  last24Hours: number;
  last7Days: number;
  avgSubmissionsPerStudent: number;
}

export interface RecentActivity {
  id: string;
  type: 'SUBMISSION' | 'GRADING_COMPLETED' | 'LATE_SUBMISSION';
  student: UserMinimalInfo;
  assignmentTitle: string;
  assignmentId: string;
  className: string;
  classId: string;
  timestamp: string;
  score?: number;
  status: string;
}

export interface DashboardApiService {
  getType(): 'real' | 'mock';
  getRecentDocuments(request?: RecentDocumentsRequest): Promise<ApiResponse<DocumentItem[]>>;

  // Analytics endpoints
  getTeacherSummary(): Promise<ApiResponse<TeacherSummary>>;
  getGradingQueue(page?: number, size?: number): Promise<ApiResponse<GradingQueueItem[]>>;
  getAtRiskStudents(): Promise<ApiResponse<ClassAtRiskStudents[]>>;
  getTeacherCalendar(startDate?: string, endDate?: string): Promise<ApiResponse<CalendarEvent[]>>;
  getClassPerformance(classId: string): Promise<ApiResponse<ClassPerformance>>;
  getRecentActivity(limit?: number): Promise<ApiResponse<RecentActivity[]>>;
}
