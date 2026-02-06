import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/components/ui/button';
import {
  Clock,
  CheckCircle2,
  FileCheck,
  Eye,
  AlertCircle,
  PlusCircle,
  FileQuestion,
  Trophy,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import type { Submission } from '@aiprimary/core';
import { formatDistanceToNow } from 'date-fns';
import { useAssignmentPublic } from '../hooks/useAssignmentApi';
import { useSubmissionsByPost } from '../hooks';

export const StudentSubmissionsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  useTranslation('assignment');

  // Get postId from query params (for homework flow)
  const postId = searchParams.get('postId');

  // Fetch assignment data using public endpoint (bypasses permission check for students)
  const { data: assignment, isLoading: isLoadingAssignment } = useAssignmentPublic(id);

  // Fetch submissions (only if postId is available)
  const { data: submissions = [], isLoading: isLoadingSubmissions } = useSubmissionsByPost(
    postId || undefined
  );

  // Loading state
  if (isLoadingAssignment || (postId && isLoadingSubmissions)) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Error state
  if (!assignment) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold">Assignment not found</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const sortedSubmissions = submissions.sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );

  // Mock config (backend doesn't provide these)
  const maxSubmissions = undefined; // Backend doesn't track this yet
  const allowRetake = true;
  const totalPoints = assignment.totalPoints || 100;

  const latestSubmission = sortedSubmissions[0];
  const canRetake = allowRetake && (!maxSubmissions || sortedSubmissions.length < maxSubmissions);

  const getStatusBadge = (status: Submission['status']) => {
    switch (status) {
      case 'graded':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
            <CheckCircle2 className="h-3 w-3" />
            Graded
          </span>
        );
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            <FileCheck className="h-3 w-3" />
            Submitted
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300">
            <Clock className="h-3 w-3" />
            Pending
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300">
            <Clock className="h-3 w-3" />
            In Progress
          </span>
        );
    }
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 90) return 'text-green-600 dark:text-green-400';
    if (percentage >= 80) return 'text-blue-600 dark:text-blue-400';
    if (percentage >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const bestScore = Math.max(
    ...sortedSubmissions.filter((s) => s.score !== undefined).map((s) => s.score!),
    0
  );

  return (
    <div className="flex h-full flex-col md:h-[calc(100vh-4rem)] md:flex-row">
      {/* Mobile Header */}
      <div className="border-b px-6 py-4 md:hidden">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="-ml-2 mb-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="truncate text-lg font-semibold">{assignment.title}</h1>
        <div className="mt-2 flex items-center gap-4">
          <span className="text-muted-foreground text-sm">
            {sortedSubmissions.length} submission{sortedSubmissions.length !== 1 ? 's' : ''}
          </span>
          {bestScore > 0 && (
            <span className={`text-lg font-bold ${getScoreColor(bestScore, totalPoints)}`}>
              Best: {bestScore}/{totalPoints}
            </span>
          )}
        </div>
        {!postId && (
          <div className="mt-2 rounded bg-yellow-100 px-3 py-1 text-xs text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
            Preview mode: Access through class homework to view submissions
          </div>
        )}
      </div>

      {/* Sidebar */}
      <aside className="hidden overflow-y-auto border-r md:block md:w-80 lg:w-96">
        {/* Back Button & Title */}
        <div className="space-y-4 border-b p-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="-ml-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{assignment.title}</h1>
            {assignment.description && (
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{assignment.description}</p>
            )}
          </div>
        </div>

        {/* Assignment Info */}
        <div className="space-y-3 border-b p-6 text-sm">
          {assignment.dueDate && (
            <div className="text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
            </div>
          )}
          <div className="text-muted-foreground flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            <span>{totalPoints} points</span>
          </div>
        </div>

        {/* Statistics */}
        <div className="space-y-4 border-b p-6">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <FileQuestion className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold">Total Submissions</span>
            </div>
            <p className="text-2xl font-bold">{sortedSubmissions.length}</p>
            {maxSubmissions && <p className="text-muted-foreground mt-1 text-xs">Max: {maxSubmissions}</p>}
          </div>

          {bestScore > 0 && (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-semibold">Best Score</span>
              </div>
              <p className={`text-2xl font-bold ${getScoreColor(bestScore, totalPoints)}`}>
                {bestScore}/{totalPoints}
              </p>
              <p className="text-muted-foreground mt-1 text-xs">
                {Math.round((bestScore / totalPoints) * 100)}%
              </p>
            </div>
          )}

          {latestSubmission && (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <FileCheck className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-semibold">Latest Status</span>
              </div>
              <div className="mt-2">{getStatusBadge(latestSubmission.status)}</div>
              {latestSubmission.score !== undefined && (
                <p className="text-muted-foreground mt-1 text-xs">
                  Score: {latestSubmission.score}/{latestSubmission.maxScore}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="space-y-3 p-6">
          {canRetake && postId ? (
            <Button
              onClick={() => navigate(`/student/assignments/${id}/do?postId=${postId}`)}
              className="w-full"
              size="lg"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              New Attempt
            </Button>
          ) : !postId ? (
            <Button disabled className="w-full" size="lg">
              <AlertCircle className="mr-2 h-4 w-4" />
              Preview Mode
            </Button>
          ) : (
            <Button disabled className="w-full" size="lg">
              <AlertCircle className="mr-2 h-4 w-4" />
              Max Submissions Reached
            </Button>
          )}
          {allowRetake && maxSubmissions && (
            <p className="text-muted-foreground text-center text-xs">
              {sortedSubmissions.length} / {maxSubmissions} attempts used
            </p>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-y-auto">
        <div className="flex-1 p-6 md:p-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-6 text-xl font-semibold">Submission History</h2>

            {sortedSubmissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
                <FileQuestion className="text-muted-foreground mb-4 h-12 w-12" />
                <p className="text-muted-foreground mb-2 text-lg font-medium">No submissions yet</p>
                <p className="text-muted-foreground mb-4 text-sm">
                  {postId
                    ? 'Start your first attempt to complete this assignment'
                    : 'Access through class homework to submit'}
                </p>
                {postId && (
                  <Button onClick={() => navigate(`/student/assignments/${id}/do?postId=${postId}`)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Start Assignment
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {sortedSubmissions.map((submission, index) => (
                  <div
                    key={submission.id}
                    className="hover:bg-muted/30 flex items-center justify-between rounded-lg border p-6 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <h3 className="text-lg font-semibold">Attempt #{sortedSubmissions.length - index}</h3>
                        {getStatusBadge(submission.status)}
                        {index === 0 && (
                          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                            Latest
                          </span>
                        )}
                      </div>

                      <div className="text-muted-foreground flex flex-wrap gap-x-6 gap-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>
                            Submitted{' '}
                            {formatDistanceToNow(new Date(submission.submittedAt), { addSuffix: true })}
                          </span>
                        </div>

                        {submission.status === 'graded' && submission.score !== undefined && (
                          <>
                            <div className="flex items-center gap-2">
                              <Trophy className="h-4 w-4" />
                              <span className={getScoreColor(submission.score, submission.maxScore!)}>
                                Score: {submission.score}/{submission.maxScore} (
                                {Math.round((submission.score / submission.maxScore!) * 100)}%)
                              </span>
                            </div>
                            {submission.gradedAt && (
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="h-4 w-4" />
                                <span>
                                  Graded{' '}
                                  {formatDistanceToNow(new Date(submission.gradedAt), { addSuffix: true })}
                                </span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="ml-4">
                      {submission.status === 'graded' ? (
                        <Button
                          variant="outline"
                          onClick={() => navigate(`/student/submissions/${submission.id}/result`)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Result
                        </Button>
                      ) : (
                        <Button variant="outline" disabled>
                          <Clock className="mr-2 h-4 w-4" />
                          Pending
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
