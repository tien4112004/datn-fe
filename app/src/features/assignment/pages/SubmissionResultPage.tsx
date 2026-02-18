import { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@ui/button';
import { Separator } from '@ui/separator';
import { cn } from '@/shared/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  FileText,
  User,
  Clock,
  Calendar,
  Loader2,
} from 'lucide-react';
import { QuestionRenderer } from '../../question/components/QuestionRenderer';
import type { Question } from '@aiprimary/core';
import { VIEW_MODE } from '@aiprimary/core';
import { groupQuestionsByContext } from '../utils/questionGrouping';
import { ContextDisplay } from '../../context/components/ContextDisplay';
import type { AssignmentContext } from '../types/assignment';
import { useFormattedDistance } from '@/shared/lib/date-utils';
import { useSubmission } from '../hooks';
import { useAssignmentPublic } from '../hooks/useAssignmentApi';

export const SubmissionResultPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('assignment', { keyPrefix: 'submissions.result' });
  const { t: tActions } = useTranslation('assignment', { keyPrefix: 'submissions.actions' });
  const { formatDistanceToNow } = useFormattedDistance();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Fetch submission data
  const { data: submission, isLoading: isLoadingSubmission } = useSubmission(id);

  // Fetch assignment data - use public endpoint since submissions reference cloned assignments
  const { data: assignment, isLoading: isLoadingAssignment } = useAssignmentPublic(submission?.assignmentId);

  // Derived state - build contexts map and groups
  const questions = useMemo(() => assignment?.questions || [], [assignment?.questions]);

  const contextsMap = useMemo(() => {
    const map = new Map<string, AssignmentContext>();
    if (assignment?.contexts) {
      assignment.contexts.forEach((ctx) => map.set(ctx.id, ctx));
    }
    return map;
  }, [assignment?.contexts]);

  const questionGroups = useMemo(() => {
    return groupQuestionsByContext(questions as any, contextsMap);
  }, [questions, contextsMap]);

  // Flatten all questions from groups into a single array
  const allQuestions = useMemo(() => {
    return questionGroups.flatMap((group) => group.questions);
  }, [questionGroups]);

  // Safe access to current question with useMemo to ensure consistent calculation
  const currentQuestion = useMemo(() => {
    if (allQuestions.length === 0) return undefined;
    const validIndex = Math.max(0, Math.min(currentQuestionIndex, allQuestions.length - 1));
    return allQuestions[validIndex];
  }, [allQuestions, currentQuestionIndex]);

  // All hooks must be called unconditionally BEFORE any early returns
  const handleNext = useCallback(() => {
    if (currentQuestionIndex < allQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  }, [currentQuestionIndex, allQuestions.length]);

  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  }, [currentQuestionIndex]);

  const percentage = useMemo(
    () =>
      submission?.maxScore && submission?.score !== undefined
        ? Math.round((submission.score / submission.maxScore) * 100)
        : 0,
    [submission?.maxScore, submission?.score]
  );

  const totalPoints = useMemo(
    () => assignment?.totalPoints || questions.reduce((sum, q) => sum + (q.points || 0), 0),
    [assignment?.totalPoints, questions]
  );

  // Loading state
  if (isLoadingSubmission || isLoadingAssignment) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Error state
  if (!submission || !assignment) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold">{t('notFound')}</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            {tActions('goBack')}
          </Button>
        </div>
      </div>
    );
  }

  // Mock teacher data (backend doesn't provide teacher details)
  const teacher = {
    id: submission.gradedBy || 'teacher-1',
    firstName: 'Teacher',
    lastName: '',
  };

  const getScoreColor = (score: number, maxScore: number) => {
    const pct = (score / maxScore) * 100;
    if (pct >= 90) return 'text-green-600 dark:text-green-400';
    if (pct >= 80) return 'text-blue-600 dark:text-blue-400';
    if (pct >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getScoreBgColor = (score: number, maxScore: number) => {
    const pct = (score / maxScore) * 100;
    if (pct >= 90) return 'bg-green-50 dark:bg-green-950/20';
    if (pct >= 80) return 'bg-blue-50 dark:bg-blue-950/20';
    if (pct >= 70) return 'bg-yellow-50 dark:bg-yellow-950/20';
    return 'bg-red-50 dark:bg-red-950/20';
  };

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
          <span
            className={`text-2xl font-bold ${submission.score !== undefined && submission.maxScore !== undefined ? getScoreColor(submission.score, submission.maxScore) : ''}`}
          >
            {submission.score !== undefined && submission.maxScore !== undefined
              ? `${submission.score}/${submission.maxScore}`
              : t('notGraded')}
          </span>
          {submission.score !== undefined && (
            <span className="text-muted-foreground text-sm">({percentage}%)</span>
          )}
        </div>
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
            <p className="text-muted-foreground mt-1 text-sm">{t('yourGradedSubmission')}</p>
          </div>
        </div>

        {/* Score Card */}
        <div
          className={`m-6 rounded-lg border p-6 ${submission.score !== undefined && submission.maxScore !== undefined ? getScoreBgColor(submission.score, submission.maxScore) : 'bg-gray-50 dark:bg-gray-950/20'}`}
        >
          <div className="mb-4 flex items-center justify-center">
            <div
              className={`flex h-24 w-24 items-center justify-center rounded-full ${
                percentage >= 70 ? 'bg-green-600' : 'bg-red-600'
              } text-white`}
            >
              <span className="text-3xl font-bold">{percentage}%</span>
            </div>
          </div>

          <div className="mb-4 text-center">
            <p
              className={`text-3xl font-bold ${submission.score !== undefined && submission.maxScore !== undefined ? getScoreColor(submission.score, submission.maxScore) : ''}`}
            >
              {submission.score !== undefined && submission.maxScore !== undefined
                ? `${submission.score}/${submission.maxScore}`
                : t('notGraded')}
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
              {percentage >= 90
                ? t('excellent')
                : percentage >= 80
                  ? t('greatJob')
                  : percentage >= 70
                    ? t('goodWork')
                    : t('keepPracticing')}
            </p>
          </div>

          <Separator className="my-4" />

          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t('questions')}</span>
              <span className="font-medium">{questions.length}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">{t('totalPoints')}</span>
              <span className="font-medium">{totalPoints}</span>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3 border-t p-6 text-sm">
          <div className="text-muted-foreground flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>
              {t('submitted')}{' '}
              {formatDistanceToNow(new Date(submission.submittedAt), {
                addSuffix: true,
              })}
            </span>
          </div>
          {submission.gradedAt && (
            <div className="text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {t('graded')}{' '}
                {formatDistanceToNow(new Date(submission.gradedAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          )}
          <div className="text-muted-foreground flex items-center gap-2">
            <User className="h-4 w-4" />
            <span>
              {t('gradedBy')} {teacher.firstName} {teacher.lastName}
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-y-auto">
        <div className="flex-1 p-6 md:p-8">
          <div className="mx-auto max-w-4xl">
            {/* Question Navigation - Compact numbered buttons */}
            <div className="mb-6 flex flex-wrap gap-2">
              {allQuestions.map((aq, index) => {
                const isCurrent = index === currentQuestionIndex;
                const grade = submission.grades?.find((g) => g.questionId === aq.question.id);
                const isCorrect = grade && grade.points === aq.points;

                return (
                  <button
                    key={aq.question.id}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={cn(
                      'flex h-10 min-w-[40px] items-center justify-center rounded-lg border-2 text-sm font-medium transition-colors',
                      isCurrent
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : isCorrect
                          ? 'border-green-600 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
                          : 'border-yellow-600 bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300'
                    )}
                  >
                    {index + 1}
                    {!isCurrent && (
                      <>
                        {isCorrect ? (
                          <CheckCircle2 className="ml-1 h-3 w-3" />
                        ) : (
                          <FileText className="ml-1 h-3 w-3" />
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Question Content - Always show individual question */}
            {currentQuestion &&
              (() => {
                // Find the group this question belongs to
                const group = questionGroups.find((g) =>
                  g.questions.some((q) => q.question.id === currentQuestion.question.id)
                );

                const answer = submission?.answers?.find((a) => a.questionId === currentQuestion.question.id);
                const grade = submission?.grades?.find((g) => g.questionId === currentQuestion.question.id);

                return (
                  <div className="space-y-6">
                    {/* Show context reading passage if question belongs to a context */}
                    {group && group.type === 'context' && group.context && (
                      <div className="rounded-lg border bg-white p-6 dark:bg-gray-900">
                        <ContextDisplay
                          context={{ ...group.context, subject: assignment?.subject || 'General' }}
                          defaultCollapsed={false}
                        />
                      </div>
                    )}

                    {/* Show the individual question */}
                    <div className="rounded-lg border bg-white p-6 dark:bg-gray-900">
                      <QuestionRenderer
                        question={currentQuestion.question as Question}
                        viewMode={VIEW_MODE.AFTER_ASSESSMENT}
                        answer={answer}
                        points={currentQuestion.points}
                        grade={grade}
                        number={currentQuestionIndex + 1}
                      />
                    </div>
                  </div>
                );
              })()}

            {/* Overall Feedback - Always show if available */}
            {submission.feedback && (
              <div className="mt-6 rounded-lg border-2 border-blue-500 bg-blue-50 p-6 dark:bg-blue-950/20">
                <div className="mb-3 flex items-center gap-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <h3 className="text-base font-semibold text-blue-900 dark:text-blue-100">
                    {t('overallFeedback')}
                  </h3>
                </div>
                <p className="whitespace-pre-wrap text-sm text-blue-800 dark:text-blue-200">
                  {submission.feedback}
                </p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-6 flex items-center justify-between">
              <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                {tActions('previous')}
              </Button>

              <Button onClick={handleNext} disabled={currentQuestionIndex === allQuestions.length - 1}>
                {tActions('next')}
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
