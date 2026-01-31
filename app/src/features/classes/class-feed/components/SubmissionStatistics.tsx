import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion, CheckCircle2, Clock, TrendingUp, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useSubmissionsByPost } from '@/features/assignment/hooks';

interface SubmissionStatisticsProps {
  postId: string;
  assignmentId?: string;
}

export const SubmissionStatistics = ({ postId, assignmentId }: SubmissionStatisticsProps) => {
  const navigate = useNavigate();
  const { data: submissions = [], isLoading } = useSubmissionsByPost(postId);

  const stats = useMemo(() => {
    const total = submissions.length;
    const graded = submissions.filter((s) => s.status === 'graded').length;
    const pending = submissions.filter((s) => s.status === 'submitted' && s.status !== 'graded').length;
    const inProgress = submissions.filter((s) => s.status === 'in_progress').length;

    // Calculate average score for graded submissions
    const gradedSubmissions = submissions.filter(
      (s) => s.status === 'graded' && s.score !== undefined && s.maxScore !== undefined
    );
    const avgScore =
      gradedSubmissions.length > 0
        ? gradedSubmissions.reduce((sum, s) => sum + (s.score! / s.maxScore!) * 100, 0) /
          gradedSubmissions.length
        : 0;

    return {
      total,
      graded,
      pending,
      inProgress,
      avgScore: Math.round(avgScore),
    };
  }, [submissions]);

  if (isLoading) {
    return (
      <div className="mt-6">
        <Skeleton className="mb-4 h-6 w-48" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 80) return 'text-blue-600 dark:text-blue-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const statCards = [
    {
      icon: Users,
      label: 'Total Submissions',
      value: stats.total,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-950/20',
    },
    {
      icon: CheckCircle2,
      label: 'Graded',
      value: stats.graded,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-950/20',
    },
    {
      icon: Clock,
      label: 'Pending Review',
      value: stats.pending,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
    },
    {
      icon: TrendingUp,
      label: 'Average Score',
      value: stats.graded > 0 ? `${stats.avgScore}%` : 'N/A',
      color: stats.graded > 0 ? getScoreColor(stats.avgScore) : 'text-gray-600 dark:text-gray-400',
      bgColor: stats.graded > 0 ? 'bg-purple-50 dark:bg-purple-950/20' : 'bg-gray-50 dark:bg-gray-950/20',
    },
  ];

  return (
    <div className="mt-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileQuestion className="text-muted-foreground h-5 w-5" />
          <h3 className="text-lg font-semibold">Submission Overview</h3>
        </div>
        {assignmentId && stats.total > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/assignments/${assignmentId}/submissions`)}
          >
            View All Submissions
          </Button>
        )}
      </div>

      {stats.total === 0 ? (
        <div className="py-8 text-center">
          <FileQuestion className="text-muted-foreground/50 mx-auto mb-3 h-12 w-12" />
          <p className="text-muted-foreground text-sm">No submissions yet</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className={`rounded-lg border p-4 transition-colors ${stat.bgColor}`}>
                <div className="mb-2 flex items-center justify-between">
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-muted-foreground mt-1 text-xs">{stat.label}</p>
              </div>
            );
          })}
        </div>
      )}

      {stats.pending > 0 && (
        <div className="mt-4 rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-3 dark:bg-yellow-950/20">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>{stats.pending}</strong> {stats.pending === 1 ? 'submission' : 'submissions'} waiting for
            review
          </p>
        </div>
      )}
    </div>
  );
};
