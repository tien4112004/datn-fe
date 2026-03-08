import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@ui/button';
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
import { useFormattedDistance } from '@/shared/lib/date-utils';
import { useAssignment, useAssignmentByPost } from '@/features/assignment/hooks/useAssignmentApi';
import { useSubmissionsByAssignment } from '../hooks';
import { useAuth } from '@/shared/context/auth';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@ui/table';

export const StudentSubmissionsPage = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation('assignment', { keyPrefix: 'submissions' });
  const { t: tStudent } = useTranslation('assignment', { keyPrefix: 'submissions.studentSubmissions' });
  const { t: tActions } = useTranslation('assignment', { keyPrefix: 'submissions.actions' });
  const { formatDistanceToNow } = useFormattedDistance();

  // Get postId from query params (for homework flow)
  const postId = searchParams.get('postId');

  const { data: assignmentByPost, isLoading: isLoadingByPost } = useAssignmentByPost(postId ?? undefined);
  const { data: assignmentById, isLoading: isLoadingById } = useAssignment(postId ? undefined : id);
  const assignment = assignmentByPost ?? assignmentById;
  const isLoadingAssignment = isLoadingByPost || isLoadingById;

  // Fetch submissions filtered by current student's ID
  const { data: submissions = [], isLoading: isLoadingSubmissions } = useSubmissionsByAssignment(
    id, // assignmentId
    user?.id // studentId - filter by current user
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
          <p className="text-lg font-semibold">{tStudent('notFound')}</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            {tActions('goBack')}
          </Button>
        </div>
      </div>
    );
  }

  const sortedSubmissions = [...submissions].sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
  );

  const maxSubmissions = assignment.maxSubmissions;
  const allowRetake = assignment.allowRetake !== false; // Default to true if not set
  const totalPoints = assignment.totalPoints || 100;

  const latestSubmission = sortedSubmissions[0];
  const canRetake = allowRetake && (!maxSubmissions || sortedSubmissions.length < maxSubmissions);

  const getStatusBadge = (status: Submission['status']) => {
    switch (status) {
      case 'graded':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
            <CheckCircle2 className="h-3 w-3" />
            {t('status.graded')}
          </span>
        );
      case 'submitted':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            <FileCheck className="h-3 w-3" />
            {t('status.submitted')}
          </span>
        );
      case 'in_progress':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300">
            <Clock className="h-3 w-3" />
            {t('status.inProgress')}
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

  const gradedSubmissions = sortedSubmissions.filter((s) => s.score !== undefined && s.maxScore);
  const bestSubmission =
    gradedSubmissions.length > 0
      ? gradedSubmissions.reduce((best, s) =>
          s.score! / s.maxScore! > best.score! / best.maxScore! ? s : best
        )
      : null;
  const bestScore = bestSubmission?.score ?? 0;

  return (
    <div className="flex h-full flex-col md:h-[calc(100vh-4rem)] md:flex-row">
      {/* Mobile Header */}
      <div className="border-b px-6 py-4 md:hidden">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="-ml-2 mb-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {tActions('back')}
        </Button>
        <h1 className="truncate text-lg font-semibold">{assignment.title}</h1>
        <div className="mt-2 flex items-center gap-4">
          <span className="text-muted-foreground text-sm">
            {sortedSubmissions.length}{' '}
            {sortedSubmissions.length !== 1 ? tStudent('submission_plural') : tStudent('submission')}
          </span>
          {bestScore > 0 && (
            <span className={`text-lg font-bold ${getScoreColor(bestScore, totalPoints)}`}>
              {tStudent('best')} {bestScore % 1 === 0 ? bestScore : bestScore.toFixed(1)}/{totalPoints}
            </span>
          )}
        </div>
        {!postId && (
          <div className="mt-2 rounded bg-yellow-100 px-3 py-1 text-xs text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
            {tStudent('previewMode')}
          </div>
        )}
      </div>

      {/* Sidebar */}
      <aside className="hidden overflow-y-auto border-r md:block md:w-80 lg:w-96">
        {/* Back Button & Title */}
        <div className="space-y-4 border-b p-6">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="-ml-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {tActions('back')}
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
          {assignment.availableUntil && (
            <div className="text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>
                {tStudent('due')} {new Date(assignment.availableUntil).toLocaleDateString()}
              </span>
            </div>
          )}
          <div className="text-muted-foreground flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            <span>
              {totalPoints} {tStudent('points')}
            </span>
          </div>
        </div>

        {/* Statistics */}
        <div className="space-y-4 border-b p-6">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <FileQuestion className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold">{tStudent('totalSubmissions')}</span>
            </div>
            <p className="text-2xl font-bold">{sortedSubmissions.length}</p>
            {maxSubmissions && (
              <p className="text-muted-foreground mt-1 text-xs">
                {tStudent('max')} {maxSubmissions}
              </p>
            )}
          </div>

          {bestSubmission && (
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-semibold">{tStudent('bestScore')}</span>
              </div>
              <p className={`text-2xl font-bold ${getScoreColor(bestScore, totalPoints)}`}>
                {bestScore % 1 === 0 ? bestScore : bestScore.toFixed(1)}/{totalPoints}
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
                <span className="text-sm font-semibold">{tStudent('latestStatus')}</span>
              </div>
              <div className="mt-2">{getStatusBadge(latestSubmission.status)}</div>
              {latestSubmission.score !== undefined && (
                <p className="text-muted-foreground mt-1 text-xs">
                  {tStudent('score')}{' '}
                  {latestSubmission.score! % 1 === 0
                    ? latestSubmission.score
                    : latestSubmission.score!.toFixed(1)}
                  /{latestSubmission.maxScore}
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
              {tActions('newAttempt')}
            </Button>
          ) : !postId ? (
            <Button disabled className="w-full" size="lg">
              <AlertCircle className="mr-2 h-4 w-4" />
              {tStudent('previewModeButton')}
            </Button>
          ) : (
            <Button disabled className="w-full" size="lg">
              <AlertCircle className="mr-2 h-4 w-4" />
              {tStudent('maxSubmissionsReached')}
            </Button>
          )}
          {allowRetake && maxSubmissions && (
            <p className="text-muted-foreground text-center text-xs">
              {sortedSubmissions.length} / {maxSubmissions} {tStudent('attemptsUsed')}
            </p>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-y-auto">
        <div className="flex-1 p-6 md:p-8">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-6 text-xl font-semibold">{tStudent('submissionHistory')}</h2>

            {sortedSubmissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
                <FileQuestion className="text-muted-foreground mb-4 h-12 w-12" />
                <p className="text-muted-foreground mb-2 text-lg font-medium">{tStudent('noSubmissions')}</p>
                <p className="text-muted-foreground mb-4 text-sm">
                  {postId ? tStudent('startFirstAttempt') : tStudent('accessThroughHomework')}
                </p>
                {postId && (
                  <Button onClick={() => navigate(`/student/assignments/${id}/do?postId=${postId}`)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    {tActions('startAssignment')}
                  </Button>
                )}
              </div>
            ) : (
              <div className="rounded-lg border bg-white dark:bg-gray-900">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{tStudent('tableHeaders.attempt')}</TableHead>
                      <TableHead>{tStudent('tableHeaders.submitted')}</TableHead>
                      <TableHead>{tStudent('tableHeaders.status')}</TableHead>
                      <TableHead>{tStudent('tableHeaders.score')}</TableHead>
                      <TableHead>{tStudent('tableHeaders.graded')}</TableHead>
                      <TableHead className="text-right">{tStudent('tableHeaders.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedSubmissions.map((submission, index) => {
                      const attemptNumber = sortedSubmissions.length - index;
                      const isBest = bestSubmission?.id === submission.id;
                      const isLatest = index === 0;

                      return (
                        <TableRow key={submission.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <span>{tStudent('attempt', { number: attemptNumber })}</span>
                              {isLatest && (
                                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                  {tStudent('latest')}
                                </span>
                              )}
                              {isBest && !isLatest && (
                                <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300">
                                  {tStudent('best')}
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Clock className="text-muted-foreground h-4 w-4" />
                              <span className="text-sm">
                                {formatDistanceToNow(new Date(submission.submittedAt), {
                                  addSuffix: true,
                                })}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(submission.status)}</TableCell>
                          <TableCell>
                            {submission.status === 'graded' &&
                            submission.score !== undefined &&
                            submission.maxScore ? (
                              <div className="flex items-center gap-2">
                                <Trophy className="h-4 w-4" />
                                <span
                                  className={`font-semibold ${getScoreColor(submission.score, submission.maxScore)}`}
                                >
                                  {submission.score! % 1 === 0
                                    ? submission.score
                                    : submission.score!.toFixed(1)}
                                  /{submission.maxScore}
                                </span>
                                <span className="text-muted-foreground text-xs">
                                  ({Math.round((submission.score / submission.maxScore) * 100)}%)
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            {submission.gradedAt ? (
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="text-muted-foreground h-4 w-4" />
                                <span className="text-sm">
                                  {formatDistanceToNow(new Date(submission.gradedAt), {
                                    addSuffix: true,
                                  })}
                                </span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">—</span>
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
                                {tActions('viewResult')}
                              </Button>
                            ) : (
                              <Button variant="outline" size="sm" disabled>
                                <Clock className="mr-2 h-4 w-4" />
                                {t('status.pending')}
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
        </div>
      </main>
    </div>
  );
};
