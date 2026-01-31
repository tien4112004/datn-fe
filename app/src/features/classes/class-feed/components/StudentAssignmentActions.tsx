import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, FileCheck, Trophy, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSubmissionsByPost } from '@/features/assignment/hooks';
import { useAuth } from '@/context/auth';
import { formatDistanceToNow } from 'date-fns';
import type { Submission } from '@aiprimary/core';

interface StudentAssignmentActionsProps {
  postId: string;
  assignmentId?: string;
  dueDate?: string;
}

export const StudentAssignmentActions = ({
  postId,
  assignmentId,
  dueDate,
}: StudentAssignmentActionsProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: submissions = [] } = useSubmissionsByPost(postId);

  // Find current student's submissions
  const mySubmissions = useMemo(() => {
    return submissions
      .filter((s) => s.studentId === user?.id)
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

  // Check if overdue
  const isOverdue = useMemo(() => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  }, [dueDate]);

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

  const handleViewSubmissions = () => {
    if (assignmentId) {
      navigate(`/student/assignments/${assignmentId}/submissions?postId=${postId}`);
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

            {mySubmissions.length > 1 && (
              <Button onClick={handleViewSubmissions} size="sm" variant="ghost">
                View All ({mySubmissions.length})
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Due Date Warning */}
      {dueDate && (
        <div
          className={`flex items-center gap-2 rounded-lg border p-3 text-sm ${
            isOverdue
              ? 'border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/20 dark:text-red-200'
              : 'border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950/20 dark:text-blue-200'
          }`}
        >
          {isOverdue ? (
            <>
              <AlertCircle className="h-4 w-4" />
              <span>
                <strong>Overdue:</strong> Due date was{' '}
                {formatDistanceToNow(new Date(dueDate), { addSuffix: true })}
              </span>
            </>
          ) : (
            <>
              <Clock className="h-4 w-4" />
              <span>
                <strong>Due:</strong> {formatDistanceToNow(new Date(dueDate), { addSuffix: true })}
              </span>
            </>
          )}
        </div>
      )}

      {/* Submission History Summary */}
      {mySubmissions.length > 0 && (
        <div className="text-muted-foreground text-xs">
          {mySubmissions.length === 1 ? '1 attempt' : `${mySubmissions.length} attempts`}
          {status === 'graded' && latestSubmission.gradedAt && (
            <span>
              {' '}
              • Graded {formatDistanceToNow(new Date(latestSubmission.gradedAt), { addSuffix: true })}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
