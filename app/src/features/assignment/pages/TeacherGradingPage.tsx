import { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Textarea } from '@/shared/components/ui/textarea';
import { Label } from '@/shared/components/ui/label';
import { cn } from '@/shared/lib/utils';
import { ChevronLeft, ChevronRight, Save, User, Clock, Trophy, CheckCircle2, Loader2 } from 'lucide-react';
import { QuestionRenderer } from '../../question/components/QuestionRenderer';
import type { Question, Grade } from '@aiprimary/core';
import { VIEW_MODE } from '@aiprimary/core';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { useSubmission, useGradeSubmission } from '../hooks';
import { useAssignmentPublic } from '../hooks/useAssignmentApi';

export const TeacherGradingPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [overallFeedback, setOverallFeedback] = useState('');

  // Fetch submission data
  const { data: submission, isLoading: isLoadingSubmission } = useSubmission(id);

  // Fetch assignment data - use public endpoint since submissions reference cloned assignments
  const { data: assignment, isLoading: isLoadingAssignment } = useAssignmentPublic(submission?.assignmentId);

  // Grade submission mutation
  const { mutate: gradeSubmission, isPending: isSaving } = useGradeSubmission();

  // Derived state - all hooks must be called before any early returns
  const questions = useMemo(() => assignment?.questions || [], [assignment?.questions]);
  const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex]);
  const totalPoints = useMemo(
    () => assignment?.totalPoints || questions.reduce((sum, q) => sum + (q.point || 0), 0),
    [assignment?.totalPoints, questions]
  );

  // Mock student data (backend doesn't provide student details in submission)
  const student = useMemo(
    () => ({
      id: submission?.studentId || '',
      firstName: 'Student',
      lastName: submission?.studentId?.slice(0, 4) || '',
      avatarUrl: undefined,
    }),
    [submission?.studentId]
  );

  // Get current answer for the question
  const currentAnswer = useMemo(() => {
    if (!submission || !currentQuestion) return undefined;
    return submission.questions?.find((a) => a.questionId === currentQuestion.id);
  }, [submission, currentQuestion]);

  // Get current grade for the question
  const currentGrade = useMemo(() => {
    if (!currentQuestion) return undefined;
    return grades.find((g) => g.questionId === currentQuestion.id);
  }, [grades, currentQuestion]);

  // Calculate total score
  const totalScore = useMemo(() => {
    return grades.reduce((sum, g) => sum + g.points, 0);
  }, [grades]);

  const gradedCount = grades.length;

  const handleGradeChange = useCallback(
    (grade: { points: number; feedback?: string }) => {
      if (!currentQuestion) return;

      setGrades((prev) => {
        const existing = prev.findIndex((g) => g.questionId === currentQuestion.id);
        const newGrade: Grade = {
          questionId: currentQuestion.id,
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
    [currentQuestion]
  );

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  }, [currentQuestionIndex, questions.length]);

  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  }, [currentQuestionIndex]);

  const handleSave = useCallback(async () => {
    if (!submission) return;

    // Check if all questions are graded
    const ungradedQuestions = questions.filter((q) => !grades.some((g) => g.questionId === q.id));

    if (ungradedQuestions.length > 0) {
      toast.warning(`Please grade all questions (${ungradedQuestions.length} remaining)`);
      return;
    }

    // Prepare grade request
    const questionScores: Record<string, number> = {};
    grades.forEach((grade) => {
      questionScores[grade.questionId] = grade.points;
    });

    gradeSubmission(
      {
        submissionId: submission.id,
        request: {
          questionScores,
          overallFeedback: overallFeedback || undefined,
        },
      },
      {
        onSuccess: () => {
          navigate(-1);
        },
      }
    );
  }, [submission, questions, grades, overallFeedback, gradeSubmission, navigate]);

  // Loading state - now after all hooks
  if (isLoadingSubmission || isLoadingAssignment) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Error state
  if (!submission || !assignment || !currentQuestion) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold">Submission not found</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col md:h-[calc(100vh-4rem)] md:flex-row">
      {/* Mobile Header */}
      <div className="border-b px-6 py-4 md:hidden">
        <h1 className="text-lg font-semibold">Grade Submission</h1>
        <p className="text-muted-foreground mt-1 text-sm">{assignment.title}</p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-muted-foreground text-sm">
            {gradedCount}/{questions.length} graded
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
            <h1 className="text-2xl font-bold tracking-tight">Grade Submission</h1>
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
                  Submitted {formatDistanceToNow(new Date(submission.submittedAt), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Grading Progress */}
        <div className="space-y-4 border-b p-6">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium">Grading Progress</span>
              <span className="text-muted-foreground">
                {gradedCount}/{questions.length} graded
              </span>
            </div>
            <div className="bg-muted h-2 overflow-hidden rounded-full">
              <div
                className="h-full bg-green-600 transition-all duration-300"
                style={{ width: `${(gradedCount / questions.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950/20">
            <div className="mb-2 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-semibold">Current Score</span>
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
              Overall Feedback (Optional)
            </Label>
            <p className="text-muted-foreground mb-2 text-xs">
              Provide general comments about the student's work
            </p>
            <Textarea
              id="overall-feedback"
              value={overallFeedback}
              onChange={(e) => setOverallFeedback(e.target.value)}
              placeholder="Great work! You demonstrated a good understanding..."
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
            {isSaving ? 'Saving...' : 'Save Grading'}
          </Button>

          {gradedCount < questions.length && (
            <p className="text-muted-foreground text-center text-xs">Grade all questions before saving</p>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-y-auto">
        <div className="flex-1 p-6 md:p-8">
          <div className="mx-auto max-w-4xl">
            {/* Question Navigation Grid */}
            <div className="mb-6 flex items-center gap-2 overflow-x-auto pb-2">
              {questions.map((q, index) => {
                const isGraded = grades.some((g) => g.questionId === q.id);
                const isCurrent = index === currentQuestionIndex;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={cn(
                      'flex h-10 min-w-[40px] items-center justify-center rounded-lg border-2 text-sm font-medium transition-colors',
                      isCurrent
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : isGraded
                          ? 'border-green-600 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800'
                    )}
                  >
                    {index + 1}
                    {isGraded && !isCurrent && <CheckCircle2 className="ml-1 h-3 w-3" />}
                  </button>
                );
              })}
            </div>

            {/* Question Content */}
            <div className="rounded-lg border bg-white p-6 dark:bg-gray-900">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-muted-foreground text-sm font-medium">
                      Question {currentQuestionIndex + 1}
                    </span>
                    <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      Max: {currentQuestion.point} points
                    </span>
                    {currentGrade && (
                      <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
                        Awarded: {currentGrade.points} points
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <QuestionRenderer
                question={currentQuestion as Question}
                viewMode={VIEW_MODE.GRADING}
                answer={currentAnswer}
                points={currentQuestion.point}
                onGradeChange={handleGradeChange}
                number={currentQuestionIndex + 1}
              />
            </div>

            {/* Navigation Buttons */}
            <div className="mt-6 flex items-center justify-between">
              <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              <Button onClick={handleNext} disabled={currentQuestionIndex === questions.length - 1}>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
