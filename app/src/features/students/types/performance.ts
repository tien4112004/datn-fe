export interface StudentPerformance {
  overallAverage: number;
  completedAssignments: number;
  totalAssignments: number;
  completionRate: number;
  pendingAssignments: number;
  overdueAssignments: number;
  classSummaries: ClassSummary[];
  performanceTrends: PerformanceTrend[];
  gradeDistribution: Record<string, number>;
}

export interface ClassSummary {
  className: string;
  averageScore: number;
  completedAssignments: number;
  totalAssignments: number;
  completionRate: number;
}

export interface PerformanceTrend {
  period: string;
  averageScore: number;
  submissionCount: number;
}
