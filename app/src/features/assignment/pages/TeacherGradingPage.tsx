import { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@ui/button';
import { Textarea } from '@ui/textarea';
import { Label } from '@ui/label';

import { cn } from '@/shared/lib/utils';
import {
  ChevronLeft,
  ChevronRight,
  Save,
  User,
  Clock,
  Trophy,
  CheckCircle2,
  FileText,
  Loader2,
} from 'lucide-react';
import { QuestionRenderer } from '../../question/components/QuestionRenderer';
import type { Question, Grade } from '@aiprimary/core';
import { VIEW_MODE } from '@aiprimary/core';
import { groupQuestionsByContext } from '../utils/questionGrouping';
import { ContextDisplay } from '../../context/components/ContextDisplay';
import type { AssignmentContext } from '../types/assignment';
import { toast } from 'sonner';
import { useFormattedDistance } from '@/shared/lib/date-utils';
import { useSubmission, useGradeSubmission } from '../hooks';
import { useAssignmentPublic } from '../hooks/useAssignmentApi';

export const TeacherGradingPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation('assignment', { keyPrefix: 'submissions.grading' });
  const { t: tActions } = useTranslation('assignment', { keyPrefix: 'submissions.actions' });
  const { formatDistanceToNow } = useFormattedDistance();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [overallFeedback, setOverallFeedback] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  // Fetch submission data
  const { data: submission, isLoading: isLoadingSubmission } = useSubmission(id);

  // Fetch assignment data - use public endpoint since submissions reference cloned assignments
  const { data: assignment, isLoading: isLoadingAssignment } = useAssignmentPublic(submission?.assignmentId);

  // Grade submission mutation
  const { mutate: gradeSubmission, isPending: isSaving } = useGradeSubmission();

  // Derived state - all hooks must be called before any early returns
  const questions = useMemo(() => assignment?.questions || [], [assignment?.questions]);

  // Build contexts map from assignment
  const contextsMap = useMemo(() => {
    const map = new Map<string, AssignmentContext>();
    if (assignment?.contexts) {
      assignment.contexts.forEach((ctx) => map.set(ctx.id, ctx));
    }
    return map;
  }, [assignment?.contexts]);

  // Group questions by context - cast to ensure type compatibility
  const questionGroups = useMemo(() => {
    return groupQuestionsByContext(questions as any, contextsMap);
  }, [questions, contextsMap]);

  // Flatten all questions from groups into a single array
  const allQuestions = useMemo(() => {
    return questionGroups.flatMap((group) => group.questions);
  }, [questionGroups]);

  const currentQuestion =
    allQuestions.length > 0
      ? allQuestions[Math.min(currentQuestionIndex, allQuestions.length - 1)]
      : undefined;
  const totalPoints = useMemo(
    () => assignment?.totalPoints || questions.reduce((sum, q) => sum + (q.points || 0), 0),
    [assignment?.totalPoints, questions]
  );

  // Get student data from submission (enriched by backend)
  const student = useMemo(
    () => ({
      id: submission?.student?.id || submission?.studentId || '',
      firstName: submission?.student?.firstName || 'Student',
      lastName: submission?.student?.lastName || '',
      email: submission?.student?.email,
      avatarUrl: undefined,
    }),
    [submission]
  );

  // Calculate total score
  const totalScore = useMemo(() => {
    return grades.reduce((sum, g) => sum + g.points, 0);
  }, [grades]);

  const gradedCount = grades.length;

  // Initialize grades and feedback from submission (auto-graded scores)
  const initializeGrades = useCallback(() => {
    if (!submission || !assignment || isInitialized) return;

    // If submission has auto-graded scores, use them
    if (submission.grades && submission.grades.length > 0) {
      const initialGrades: Grade[] = submission.grades.map((g) => ({
        questionId: g.questionId,
        points: g.points,
        feedback: g.feedback,
      }));
      setGrades(initialGrades);
    }

    // Initialize overall feedback if exists
    if (submission.feedback) {
      setOverallFeedback(submission.feedback);
    }

    setIsInitialized(true);
  }, [submission, assignment, isInitialized]);

  // Run initialization when data is loaded
  if (!isInitialized && submission && assignment) {
    initializeGrades();
  }

  const handleGradeChange = useCallback(
    (questionId: string, grade: { points: number; feedback?: string }) => {
      setGrades((prev) => {
        const existing = prev.findIndex((g) => g.questionId === questionId);
        const newGrade: Grade = {
          questionId,
          points: grade.points,
          feedback: grade.feedback,
        };

        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = newGrade;
          return updated;
        }
        return [...prev, newGrade];
      });
    },
    []
  );

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

  const handleSave = useCallback(async () => {
    if (!submission) return;

    // Check if all questions are graded
    const ungradedQuestions = questions.filter((q) => !grades.some((g) => g.questionId === q.question.id));

    if (ungradedQuestions.length > 0) {
      toast.warning(t('pleaseGradeAll', { count: ungradedQuestions.length }));
      return;
    }

    // Prepare grade request
    const questionScores: Record<string, number> = {};
    const questionFeedback: Record<string, string> = {};

    grades.forEach((grade) => {
      questionScores[grade.questionId] = grade.points;
      if (grade.feedback && grade.feedback.trim()) {
        questionFeedback[grade.questionId] = grade.feedback;
      }
    });

    gradeSubmission(
      {
        submissionId: submission.id,
        request: {
          questionScores,
          questionFeedback: Object.keys(questionFeedback).length > 0 ? questionFeedback : undefined,
          overallFeedback: overallFeedback || undefined,
        },
      },
      {
        onSuccess: () => {
          navigate(-1);
        },
      }
    );
  }, [submission, questions, grades, overallFeedback, gradeSubmission, navigate, t]);

  // Loading state - now after all hooks
  if (isLoadingSubmission || isLoadingAssignment) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Error state
  if (!submission || !assignment || questions.length === 0) {
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

  return (
    <div className="flex h-full flex-col md:h-[calc(100vh-4rem)] md:flex-row">
      {/* Mobile Header */}
      <div className="border-b px-6 py-4 md:hidden">
        <h1 className="text-lg font-semibold">{t('title')}</h1>
        <p className="text-muted-foreground mt-1 text-sm">{assignment.title}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-muted-foreground text-sm">
            {gradedCount}/{questions.length} {t('graded')}
          </span>
          <span className="text-lg font-bold">
            {totalScore}/{totalPoints}
          </span>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="hidden overflow-y-auto border-r md:block md:w-80 lg:w-96">
        {/* Header */}
        <div className="space-y-4 border-b p-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
            <p className="text-muted-foreground mt-1 text-sm">{assignment.title}</p>
          </div>
        </div>

        {/* Student Info */}
        <div className="border-b p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-950">
              <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold">
                {student.firstName} {student.lastName}
              </p>
              <div className="text-muted-foreground flex items-center gap-1 text-sm">
                <Clock className="h-3 w-3" />
                <span>
                  {t('submitted')}{' '}
                  {formatDistanceToNow(new Date(submission.submittedAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Grading Progress */}
        <div className="space-y-4 border-b p-6">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium">{t('gradingProgress')}</span>
              <span className="text-muted-foreground">
                {gradedCount}/{questions.length} {t('graded')}
              </span>
            </div>
            <div className="bg-muted h-2 overflow-hidden rounded-full">
              <div
                className="h-full bg-green-600 transition-all duration-300"
                style={{ width: `${questions.length > 0 ? (gradedCount / questions.length) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/20">
            <div className="mb-2 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold">{t('currentScore')}</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">
              {totalScore}/{totalPoints}
            </p>
            <p className="text-muted-foreground mt-1 text-xs">
              {Math.round((totalScore / totalPoints) * 100)}%
            </p>
          </div>
        </div>

        {/* Overall Feedback */}
        <div className="space-y-4 p-6">
          <div>
            <Label htmlFor="overall-feedback" className="text-sm font-semibold">
              {t('overallFeedback')}
            </Label>
            <p className="text-muted-foreground mb-2 text-xs">{t('feedbackDescription')}</p>
            <Textarea
              id="overall-feedback"
              value={overallFeedback}
              onChange={(e) => setOverallFeedback(e.target.value)}
              placeholder={t('overallFeedbackPlaceholder')}
              className="min-h-[120px]"
            />
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={isSaving || gradedCount < questions.length}
            className="w-full"
            size="lg"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? tActions('saving') : tActions('save')}
          </Button>

          {gradedCount < questions.length && (
            <p className="text-muted-foreground text-center text-xs">{t('gradeAllQuestions')}</p>
          )}
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
                const isGraded = grades.some((g) => g.questionId === aq.question.id);

                return (
                  <button
                    key={aq.question.id}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={cn(
                      'flex h-10 min-w-[40px] items-center justify-center rounded-lg border-2 text-sm font-medium transition-colors',
                      isCurrent
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : isGraded
                          ? 'border-green-600 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
                          : 'border-yellow-600 bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300'
                    )}
                  >
                    {index + 1}
                    {!isCurrent && (
                      <>
                        {isGraded ? (
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

            {/* Question Display Section */}
            {currentQuestion &&
              (() => {
                // Find the group this question belongs to
                const group = questionGroups.find((g) =>
                  g.questions.some((q) => q.question.id === currentQuestion.question.id)
                );

                const answer = submission?.answers?.find((a) => a.questionId === currentQuestion.question.id);
                const grade = grades.find((g) => g.questionId === currentQuestion.question.id);

                return (
                  <div className="space-y-6">
                    {/* Show context reading passage if question belongs to a context */}
                    {group && group.type === 'context' && group.context && (
                      <div className="rounded-lg border bg-white p-6 dark:bg-gray-900">
                        <ContextDisplay
                          context={{
                            ...group.context,
                            subject: assignment?.subject || 'General',
                          }}
                          defaultCollapsed={false}
                        />
                      </div>
                    )}

                    {/* Question & Answer Section */}
                    <div className="rounded-lg border bg-white p-6 dark:bg-gray-900">
                      <QuestionRenderer
                        question={currentQuestion.question as Question}
                        viewMode={VIEW_MODE.GRADING}
                        answer={answer}
                        points={currentQuestion.points}
                        grade={grade}
                        onGradeChange={(gradeData) =>
                          handleGradeChange(currentQuestion.question.id, gradeData)
                        }
                        number={currentQuestionIndex + 1}
                      />
                    </div>
                  </div>
                );
              })()}

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
