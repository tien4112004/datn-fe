import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion, Clock, Eye, Edit, Trophy, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useSubmissionsByPost } from '@/features/assignment/hooks';
import { SubmissionStatusBadge } from '@/features/assignment/components/SubmissionStatusBadge';
import { formatDistanceToNow } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface SubmissionStatisticsProps {
  postId: string;
  assignmentId?: string;
}

export const SubmissionStatistics = ({ postId }: SubmissionStatisticsProps) => {
  const navigate = useNavigate();
  const { data: submissions = [], isLoading } = useSubmissionsByPost(postId);
  const [showTable, setShowTable] = useState(true);

  const stats = useMemo(() => {
    const total = submissions.length;
    const graded = submissions.filter((s) => s.status === 'graded').length;
    const pending = submissions.filter((s) => s.status === 'submitted').length;
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

  return (
    <div className="mt-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileQuestion className="text-muted-foreground h-5 w-5" />
          <h3 className="text-lg font-semibold">Submissions</h3>
        </div>
        {stats.total > 0 && (
          <Button variant="outline" size="sm" onClick={() => setShowTable(!showTable)}>
            {showTable ? <ChevronUp className="mr-2 h-4 w-4" /> : <ChevronDown className="mr-2 h-4 w-4" />}
            {showTable ? 'Hide' : 'Show'} Table
          </Button>
        )}
      </div>

      {/* Submissions Table */}
      {showTable && submissions.length > 0 && (
        <div className="mt-4 overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {submissions.map((submission) => (
                <TableRow key={submission.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">
                    {submission.student ? (
                      <div>
                        <p className="font-semibold">
                          {submission.student.firstName} {submission.student.lastName}
                        </p>
                        <p className="text-muted-foreground text-xs">{submission.student.email}</p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">Unknown Student</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="text-muted-foreground h-4 w-4" />
                      <span className="text-sm">
                        {formatDistanceToNow(new Date(submission.submittedAt), { addSuffix: true })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <SubmissionStatusBadge status={submission.status} />
                  </TableCell>
                  <TableCell>
                    {submission.status === 'graded' &&
                    submission.score !== undefined &&
                    submission.maxScore ? (
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4" />
                        <span
                          className={`font-semibold ${getScoreColor((submission.score / submission.maxScore) * 100)}`}
                        >
                          {submission.score}/{submission.maxScore}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          ({Math.round((submission.score / submission.maxScore) * 100)}%)
                        </span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Not graded</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {submission.status === 'graded' ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/submissions/${submission.id}/grade`)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/submissions/${submission.id}/grade`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => navigate(`/submissions/${submission.id}/grade`)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Grade
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
