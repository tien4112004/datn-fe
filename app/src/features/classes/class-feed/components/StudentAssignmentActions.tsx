import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlayCircle,
  FileCheck,
  Trophy,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubmissionsByPost } from '@/features/assignment/hooks';
import { useAuth } from '@/context/auth';
import { formatDistanceToNow } from 'date-fns';
import type { Submission } from '@aiprimary/core';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface StudentAssignmentActionsProps {
  postId: string;
  assignmentId?: string;
}

export const StudentAssignmentActions = ({ postId, assignmentId }: StudentAssignmentActionsProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: submissions = [] } = useSubmissionsByPost(postId);
  const [showHistory, setShowHistory] = useState(false);

  // Find current student's submissions
  const mySubmissions = useMemo(() => {
    if (!user?.id) return [];
    return submissions
      .filter((s) => s.studentId === user.id || s.student?.id === user.id)
      .sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
  }, [submissions, user?.id]);

  const latestSubmission = mySubmissions[0];

  // Determine status
  const status = useMemo(() => {
    if (!latestSubmission) return 'not_started';
    if (latestSubmission.status === 'graded') return 'graded';
    if (latestSubmission.status === 'submitted') return 'submitted';
    return 'in_progress';
  }, [latestSubmission]);

  const handleStartAssignment = () => {
    if (assignmentId) {
      navigate(`/student/assignments/${assignmentId}/do?postId=${postId}`);
    }
  };

  const handleViewResult = () => {
    if (latestSubmission) {
      navigate(`/student/submissions/${latestSubmission.id}/result`);
    }
  };

  const getStatusConfig = () => {
    switch (status) {
      case 'graded':
        return {
          icon: Trophy,
          label: 'Graded',
          color: 'text-green-600 dark:text-green-400',
          bgColor: 'bg-green-50 dark:bg-green-950/20',
          borderColor: 'border-green-200 dark:border-green-900',
        };
      case 'submitted':
        return {
          icon: FileCheck,
          label: 'Submitted',
          color: 'text-blue-600 dark:text-blue-400',
          bgColor: 'bg-blue-50 dark:bg-blue-950/20',
          borderColor: 'border-blue-200 dark:border-blue-900',
        };
      case 'in_progress':
        return {
          icon: Clock,
          label: 'In Progress',
          color: 'text-yellow-600 dark:text-yellow-400',
          bgColor: 'bg-yellow-50 dark:bg-yellow-950/20',
          borderColor: 'border-yellow-200 dark:border-yellow-900',
        };
      default:
        return {
          icon: PlayCircle,
          label: 'Not Started',
          color: 'text-gray-600 dark:text-gray-400',
          bgColor: 'bg-gray-50 dark:bg-gray-950/20',
          borderColor: 'border-gray-200 dark:border-gray-900',
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <div className="mt-6 space-y-4">
      {/* Status Card */}
      <div className={`rounded-lg border p-4 ${statusConfig.bgColor} ${statusConfig.borderColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`rounded-full p-2 ${statusConfig.bgColor}`}>
              <StatusIcon className={`h-5 w-5 ${statusConfig.color}`} />
            </div>
            <div>
              <p className={`font-semibold ${statusConfig.color}`}>{statusConfig.label}</p>
              {latestSubmission && (
                <p className="text-muted-foreground text-xs">
                  {status === 'graded' &&
                    latestSubmission.score !== undefined &&
                    latestSubmission.maxScore !== undefined && (
                      <span>
                        Score: {latestSubmission.score}/{latestSubmission.maxScore}
                      </span>
                    )}
                  {status === 'submitted' && (
                    <span>
                      Submitted{' '}
                      {formatDistanceToNow(new Date(latestSubmission.submittedAt), { addSuffix: true })}
                    </span>
                  )}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {status === 'not_started' && (
              <Button onClick={handleStartAssignment} size="sm">
                <PlayCircle className="mr-2 h-4 w-4" />
                Start Assignment
              </Button>
            )}

            {status === 'in_progress' && (
              <Button onClick={handleStartAssignment} size="sm" variant="outline">
                Continue
              </Button>
            )}

            {status === 'submitted' && (
              <Button onClick={handleStartAssignment} size="sm" variant="outline">
                <PlayCircle className="mr-2 h-4 w-4" />
                Retake
              </Button>
            )}

            {status === 'graded' && (
              <>
                <Button onClick={handleViewResult} size="sm">
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  View Result
                </Button>
                <Button onClick={handleStartAssignment} size="sm" variant="outline">
                  Retake
                </Button>
              </>
            )}

            {mySubmissions.length > 0 && (
              <Button onClick={() => setShowHistory(!showHistory)} size="sm" variant="ghost">
                {showHistory ? (
                  <ChevronUp className="mr-2 h-4 w-4" />
                ) : (
                  <ChevronDown className="mr-2 h-4 w-4" />
                )}
                {mySubmissions.length} {mySubmissions.length === 1 ? 'Attempt' : 'Attempts'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Submission History Table */}
      {showHistory && mySubmissions.length > 0 && (
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Attempt</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Score</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mySubmissions.map((submission, index) => {
                const getSubmissionStatusBadge = (s: Submission) => {
                  if (s.status === 'graded') {
                    return (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
                        <CheckCircle2 className="h-3 w-3" />
                        Graded
                      </span>
                    );
                  }
                  if (s.status === 'submitted') {
                    return (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        <FileCheck className="h-3 w-3" />
                        Submitted
                      </span>
                    );
                  }
                  return (
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-950 dark:text-gray-300">
                      <Clock className="h-3 w-3" />
                      In Progress
                    </span>
                  );
                };

                const getScoreColor = (score: number, maxScore: number) => {
                  const percentage = (score / maxScore) * 100;
                  if (percentage >= 90) return 'text-green-600 dark:text-green-400';
                  if (percentage >= 80) return 'text-blue-600 dark:text-blue-400';
                  if (percentage >= 70) return 'text-yellow-600 dark:text-yellow-400';
                  return 'text-red-600 dark:text-red-400';
                };

                return (
                  <TableRow key={submission.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <span>#{mySubmissions.length - index}</span>
                        {index === 0 && (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                            Latest
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="text-muted-foreground h-4 w-4" />
                        <span className="text-sm">
                          {formatDistanceToNow(new Date(submission.submittedAt), { addSuffix: true })}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{getSubmissionStatusBadge(submission)}</TableCell>
                    <TableCell>
                      {submission.status === 'graded' &&
                      submission.score !== undefined &&
                      submission.maxScore ? (
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4" />
                          <span
                            className={`font-semibold ${getScoreColor(submission.score, submission.maxScore)}`}
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
                      {submission.status === 'graded' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/student/submissions/${submission.id}/result`)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Result
                        </Button>
                      ) : (
                        <Button variant="outline" size="sm" disabled>
                          <Clock className="mr-2 h-4 w-4" />
                          Pending
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
