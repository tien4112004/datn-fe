import { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Send,
  Trophy,
  Loader2,
} from 'lucide-react';
import { QuestionRenderer } from '../../question/components/QuestionRenderer';
import type { Answer, Question } from '@aiprimary/core';
import { VIEW_MODE } from '@aiprimary/core';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { useAssignmentPublic } from '../hooks/useAssignmentApi';
import { useCreateSubmission } from '../hooks';

// Check if an answer is valid (not empty) - moved outside component as pure function
const isAnswerValid = (answer: Answer): boolean => {
  switch (answer.type) {
    case 'MULTIPLE_CHOICE':
      return !!answer.selectedOptionId;
    case 'FILL_IN_BLANK':
      return answer.blanks.length > 0 && answer.blanks.every((b) => b.value.trim() !== '');
    case 'MATCHING':
      return answer.matches.length > 0;
    case 'OPEN_ENDED':
      return answer.text.trim() !== '';
    default:
      return false;
  }
};

export const AssignmentDoingPage = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  useTranslation('assignment');

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);

  // Get postId from query params (for homework flow) or use assignmentId (for direct access)
  const postId = searchParams.get('postId');

  // Fetch assignment data using public endpoint (bypasses permission check for students)
  const { data: assignment, isLoading } = useAssignmentPublic(id);

  // Create submission mutation
  const { mutate: createSubmission, isPending: isSubmitting } = useCreateSubmission();

  // Derived state - all hooks must be called before any early returns
  const questions = useMemo(() => assignment?.questions || [], [assignment?.questions]);
  const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex]);
  const totalPoints = useMemo(
    () => assignment?.totalPoints || questions.reduce((sum, q) => sum + (q.points || 0), 0),
    [assignment?.totalPoints, questions]
  );

  // Get current answer for the question
  const currentAnswer = useMemo(() => {
    if (!currentQuestion) return undefined;
    return answers.find((a) => a.questionId === currentQuestion.question.id);
  }, [answers, currentQuestion]);

  // Check if all questions are answered
  const allQuestionsAnswered = useMemo(() => {
    return questions.every((q) => answers.some((a) => a.questionId === q.question.id && isAnswerValid(a)));
  }, [answers, questions]);

  const progress = useMemo(
    () => (questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0),
    [currentQuestionIndex, questions.length]
  );

  const answeredCount = useMemo(() => answers.filter((a) => isAnswerValid(a)).length, [answers]);

  const handleAnswerChange = useCallback((answer: Answer) => {
    setAnswers((prev) => {
      const existing = prev.findIndex((a) => a.questionId === answer.questionId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = answer;
        return updated;
      }
      return [...prev, answer];
    });
  }, []);

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

  const handleSubmitAttempt = useCallback(() => {
    if (!allQuestionsAnswered) {
      toast.warning('Please answer all questions before submitting');
      return;
    }
    setShowSubmitDialog(true);
  }, [allQuestionsAnswered]);

  const handleSubmitConfirm = useCallback(async () => {
    if (!postId) {
      // Mock: No postId available, show error
      toast.error('Cannot submit: This assignment must be accessed through class homework');
      setShowSubmitDialog(false);
      return;
    }

    createSubmission(
      {
        postId,
        answers,
      },
      {
        onSuccess: () => {
          setShowSubmitDialog(false);
          navigate(-1);
        },
      }
    );
  }, [postId, createSubmission, answers, navigate]);

  // Loading state - now after all hooks
  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Error state
  if (!assignment || !currentQuestion) {
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

  return (
    <div className="flex h-full flex-col md:h-[calc(100vh-4rem)] md:flex-row">
      {/* Mobile Header - Shown on Mobile Only */}
      <div className="border-b px-6 py-4 md:hidden">
        <h1 className="truncate text-lg font-semibold">{assignment.title}</h1>
        <div className="text-muted-foreground mt-2 flex items-center gap-4 text-sm">
          <span>
            {currentQuestionIndex + 1} of {questions.length}
          </span>
          <span>{Math.round(progress)}% complete</span>
        </div>
      </div>

      {/* Sidebar - Hidden on Mobile, Shown on Desktop */}
      <aside className="hidden overflow-y-auto border-r md:block md:w-80 lg:w-96">
        {/* Assignment Info */}
        <div className="space-y-4 border-b p-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{assignment.title}</h1>
            {assignment.description && (
              <p className="text-muted-foreground mt-2 text-sm leading-relaxed">{assignment.description}</p>
            )}
          </div>

          {/* Metadata */}
          <div className="text-muted-foreground space-y-2 text-sm">
            {assignment.availableUntil && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>Due: {new Date(assignment.availableUntil).toLocaleDateString()}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              <span>{totalPoints} points</span>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="space-y-4 border-b p-6">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium">Progress</span>
              <span className="text-muted-foreground">
                {answeredCount}/{questions.length} answered
              </span>
            </div>
            <div className="bg-muted h-2 overflow-hidden rounded-full">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${(answeredCount / questions.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="text-muted-foreground text-sm">
            <p>
              Question {currentQuestionIndex + 1} of {questions.length}
            </p>
            <p className="mt-1">{Math.round(progress)}% complete</p>
          </div>
        </div>

        {/* Question Navigation Grid */}
        <div className="p-6">
          <h3 className="mb-4 text-sm font-semibold">Questions</h3>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, index) => {
              const isAnswered = answers.some((a) => a.questionId === q.question.id && isAnswerValid(a));
              const isCurrent = index === currentQuestionIndex;

              return (
                <button
                  key={q.question.id}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={cn(
                    'flex h-10 items-center justify-center rounded-lg border-2 text-sm font-medium transition-colors',
                    isCurrent
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : isAnswered
                        ? 'border-green-600 bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800'
                  )}
                  title={`Question ${index + 1}${isAnswered ? ' (Answered)' : ''}`}
                >
                  {index + 1}
                  {isAnswered && !isCurrent && <CheckCircle2 className="ml-1 h-3 w-3" />}
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex flex-1 flex-col overflow-y-auto">
        <div className="flex-1 p-6 md:p-8">
          {/* Question Content */}
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 rounded-lg border bg-white p-6 dark:bg-gray-900">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex-1">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-muted-foreground text-sm font-medium">
                      Question {currentQuestionIndex + 1}
                    </span>
                    <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      {currentQuestion.points} points
                    </span>
                  </div>
                </div>
              </div>

              <QuestionRenderer
                question={currentQuestion.question as Question}
                viewMode={VIEW_MODE.DOING}
                answer={currentAnswer}
                points={currentQuestion.points}
                onAnswerChange={handleAnswerChange}
                number={currentQuestionIndex + 1}
              />
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between">
              <Button variant="outline" onClick={handlePrevious} disabled={currentQuestionIndex === 0}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>

              {currentQuestionIndex < questions.length - 1 ? (
                <Button onClick={handleNext}>
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmitAttempt} className="bg-green-600 hover:bg-green-700">
                  <Send className="mr-2 h-4 w-4" />
                  Submit Assignment
                </Button>
              )}
            </div>

            {/* Warning if not all answered */}
            {!allQuestionsAnswered && currentQuestionIndex === questions.length - 1 && (
              <div className="mt-6 flex items-start gap-2 rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-4 dark:bg-yellow-950/20">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Some questions are not answered
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Please review and answer all questions before submitting.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Submit Confirmation Dialog */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Assignment?</DialogTitle>
            <DialogDescription>
              Are you sure you want to submit this assignment? You won't be able to change your answers after
              submission.
            </DialogDescription>
          </DialogHeader>
          <div className="my-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Questions:</span>
              <span className="font-medium">{questions.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Answered:</span>
              <span className="font-medium">{answeredCount}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total Points:</span>
              <span className="font-medium">{totalPoints}</span>
            </div>
            {!postId && (
              <div className="rounded bg-yellow-100 px-3 py-2 text-xs text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
                Preview mode: Access through class homework to submit
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitConfirm}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
