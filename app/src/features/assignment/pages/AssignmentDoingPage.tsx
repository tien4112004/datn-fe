import { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button } from '@ui/button';
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
  BookOpen,
} from 'lucide-react';
import { QuestionRenderer } from '../../question/components/QuestionRenderer';
import type { Answer, Question } from '@aiprimary/core';
import { VIEW_MODE } from '@aiprimary/core';
import { groupQuestionsByContext, type QuestionGroup } from '../utils/questionGrouping';
import { ContextGroupView } from '../components/context/ContextGroupView';
import { ContextDisplay } from '../../context/components/ContextDisplay';
import type { AssignmentContext } from '../types/assignment';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@ui/dialog';
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

// Get question number for a specific question in a group (sequential across all groups)
const getQuestionNumber = (groups: QuestionGroup[], groupId: string, indexInGroup: number): number => {
  let number = 1;
  for (const g of groups) {
    if (g.id === groupId) return number + indexInGroup;
    number += g.questions.length;
  }
  return number;
};

// Find question by ID and return its metadata
const findQuestionById = (groups: QuestionGroup[], questionId: string) => {
  for (const group of groups) {
    const idx = group.questions.findIndex((q) => q.question.id === questionId);
    if (idx >= 0) {
      return {
        group,
        question: group.questions[idx],
        questionNumber: getQuestionNumber(groups, group.id, idx),
        indexInGroup: idx,
      };
    }
  }
  return { group: null, question: null, questionNumber: -1, indexInGroup: -1 };
};

export const AssignmentDoingPage = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation('assignment', { keyPrefix: 'submissions.doing' });
  const { t: tActions } = useTranslation('assignment', { keyPrefix: 'submissions.actions' });

  const [currentQuestionId, setCurrentQuestionId] = useState<string | null>(null);
  const [currentContextId, setCurrentContextId] = useState<string | null>(null);
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

  // Initialize to first question on load
  useEffect(() => {
    if (!currentQuestionId && !currentContextId && questions.length > 0) {
      setCurrentQuestionId(questions[0].question.id);
    }
  }, [currentQuestionId, currentContextId, questions]);

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

  const totalPoints = useMemo(
    () => assignment?.totalPoints || questions.reduce((sum, q) => sum + (q.points || 0), 0),
    [assignment?.totalPoints, questions]
  );

  // Check if all questions are answered
  const allQuestionsAnswered = useMemo(() => {
    return questions.every((q) => answers.some((a) => a.questionId === q.question.id && isAnswerValid(a)));
  }, [answers, questions]);

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

  const handleContextClick = useCallback((contextId: string) => {
    setCurrentContextId(contextId);
    setCurrentQuestionId(null);
  }, []);

  const handleQuestionClick = useCallback((questionId: string) => {
    setCurrentQuestionId(questionId);
    setCurrentContextId(null);
  }, []);

  const handleNext = useCallback(() => {
    // Simple approach: find next question and navigate to it
    const allQuestions = questionGroups.flatMap((group) =>
      group.questions.map((aq) => ({ id: aq.question.id, groupId: group.id }))
    );

    if (currentQuestionId) {
      const currentIdx = allQuestions.findIndex((q) => q.id === currentQuestionId);
      if (currentIdx >= 0 && currentIdx < allQuestions.length - 1) {
        setCurrentQuestionId(allQuestions[currentIdx + 1].id);
        setCurrentContextId(null);
      }
    } else if (currentContextId) {
      // Move to first question after this context
      const contextGroup = questionGroups.find((g) => g.contextId === currentContextId);
      if (contextGroup) {
        const lastQuestionInContext = contextGroup.questions[contextGroup.questions.length - 1];
        const lastIdx = allQuestions.findIndex((q) => q.id === lastQuestionInContext.question.id);
        if (lastIdx >= 0 && lastIdx < allQuestions.length - 1) {
          setCurrentQuestionId(allQuestions[lastIdx + 1].id);
          setCurrentContextId(null);
        }
      }
    } else if (allQuestions.length > 0) {
      setCurrentQuestionId(allQuestions[0].id);
      setCurrentContextId(null);
    }
  }, [currentQuestionId, currentContextId, questionGroups]);

  const handlePrevious = useCallback(() => {
    const allQuestions = questionGroups.flatMap((group) =>
      group.questions.map((aq) => ({ id: aq.question.id, groupId: group.id }))
    );

    if (currentQuestionId) {
      const currentIdx = allQuestions.findIndex((q) => q.id === currentQuestionId);
      if (currentIdx > 0) {
        setCurrentQuestionId(allQuestions[currentIdx - 1].id);
        setCurrentContextId(null);
      }
    }
  }, [currentQuestionId, questionGroups]);

  const handleSubmitAttempt = useCallback(() => {
    if (!allQuestionsAnswered) {
      toast.warning(t('answerAllQuestions'));
      return;
    }
    setShowSubmitDialog(true);
  }, [allQuestionsAnswered, t]);

  const handleSubmitConfirm = useCallback(async () => {
    if (!postId) {
      // Mock: No postId available, show error
      toast.error(t('cannotSubmit'));
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
  }, [postId, createSubmission, answers, navigate, t]);

  // Loading state - now after all hooks
  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  // Error state
  if (!assignment || questions.length === 0) {
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
      {/* Mobile Header - Shown on Mobile Only */}
      <div className="border-b px-6 py-4 md:hidden">
        <h1 className="truncate text-lg font-semibold">{assignment.title}</h1>
        <div className="text-muted-foreground mt-2 flex items-center gap-4 text-sm">
          <span>
            {answeredCount} {t('of')} {questions.length}
          </span>
          <span>
            {questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0}
            {t('complete')}
          </span>
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
                <span>
                  {t('due')} {new Date(assignment.availableUntil).toLocaleDateString()}
                </span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              <span>
                {totalPoints} {t('points')}
              </span>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="space-y-4 border-b p-6">
          <div>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium">{t('progress')}</span>
              <span className="text-muted-foreground">
                {answeredCount}/{questions.length} {t('answered')}
              </span>
            </div>
            <div className="bg-muted h-2 overflow-hidden rounded-full">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{
                  width: questions.length > 0 ? `${(answeredCount / questions.length) * 100}%` : '0%',
                }}
              />
            </div>
          </div>

          <div className="text-muted-foreground text-sm">
            <p>
              {answeredCount}/{questions.length} {t('answered')}
            </p>
            <p className="mt-1">
              {questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0}
              {t('complete')}
            </p>
          </div>
        </div>

        {/* Question Navigation - Dual-level with context headers and individual questions */}
        <div className="p-6">
          <h3 className="mb-4 text-sm font-semibold">{t('questions')}</h3>
          <div className="space-y-2">
            {questionGroups.map((group, groupIdx) => {
              if (group.type === 'context' && group.contextId) {
                // Context group: header button + individual question buttons
                const isContextActive = currentContextId === group.contextId;
                const allContextQuestionsAnswered = group.questions.every((q) =>
                  answers.some((a) => a.questionId === q.question.id && isAnswerValid(a))
                );

                return (
                  <div key={group.id} className="space-y-1">
                    {/* Context Header Button - click to view ALL questions together */}
                    <button
                      onClick={() => handleContextClick(group.contextId!)}
                      className={cn(
                        'w-full rounded-lg border-2 px-4 py-3 text-left transition-colors',
                        isContextActive
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-950'
                          : 'border-blue-300 bg-blue-50/50 hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/30'
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <BookOpen className="h-5 w-5 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-medium">
                            {group.context?.title || `Context ${groupIdx + 1}`}
                          </div>
                          <div className="text-muted-foreground text-xs">
                            {group.questions.length} {group.questions.length === 1 ? 'question' : 'questions'}
                          </div>
                        </div>
                        {allContextQuestionsAnswered && (
                          <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-600" />
                        )}
                      </div>
                    </button>

                    {/* Individual Question Buttons - indented under context */}
                    {group.questions.map((aq, idx) => {
                      const questionNumber = getQuestionNumber(questionGroups, group.id, idx);
                      const isQuestionActive = currentQuestionId === aq.question.id;
                      const isAnswered = answers.some(
                        (a) => a.questionId === aq.question.id && isAnswerValid(a)
                      );

                      return (
                        <button
                          key={aq.question.id}
                          onClick={() => handleQuestionClick(aq.question.id)}
                          className={cn(
                            'ml-6 w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                            isQuestionActive
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-950'
                              : 'border-blue-200 hover:bg-blue-50/50 dark:border-blue-800 dark:hover:bg-blue-950/30'
                          )}
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-blue-700 dark:text-blue-300">
                              Q{questionNumber}
                            </span>
                            {isAnswered && <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-600" />}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                );
              } else {
                // Standalone question (no context)
                const aq = group.questions[0];
                const questionNumber = getQuestionNumber(questionGroups, group.id, 0);
                const isActive = currentQuestionId === aq.question.id;
                const isAnswered = answers.some((a) => a.questionId === aq.question.id && isAnswerValid(a));

                return (
                  <button
                    key={group.id}
                    onClick={() => handleQuestionClick(aq.question.id)}
                    className={cn(
                      'w-full rounded-lg border-2 px-4 py-2 text-left transition-colors',
                      isActive
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-950'
                        : 'border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-medium">Q{questionNumber}</span>
                      {isAnswered && <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-600" />}
                    </div>
                  </button>
                );
              }
            })}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex flex-1 flex-col overflow-y-auto">
        <div className="flex-1 p-6 md:p-8">
          {/* Question Content - Render based on navigation state */}
          <div className="mx-auto max-w-4xl">
            {currentContextId
              ? // Viewing entire context: show ALL questions in context with reading passage
                (() => {
                  const group = questionGroups.find(
                    (g) => g.type === 'context' && g.contextId === currentContextId
                  );
                  if (!group || !group.context) return null;

                  const startNumber = getQuestionNumber(questionGroups, group.id, 0);

                  return (
                    <ContextGroupView
                      context={group.context}
                      questions={group.questions}
                      viewMode={VIEW_MODE.DOING}
                      startNumber={startNumber}
                      onAnswerChange={(_questionId, answer) => handleAnswerChange(answer)}
                      answers={new Map(answers.map((a) => [a.questionId, a]))}
                    />
                  );
                })()
              : currentQuestionId
                ? // Viewing single question - show ONLY this question (with context passage if applicable)
                  (() => {
                    const result = findQuestionById(questionGroups, currentQuestionId);
                    if (!result.question) return null;

                    const { group, question: aq, questionNumber } = result;
                    const answer = answers.find((a) => a.questionId === aq.question.id);

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
                              showQuestionNumbers={true}
                              questionNumbers={group.questions.map((_, idx) =>
                                getQuestionNumber(questionGroups, group.id, idx)
                              )}
                            />
                          </div>
                        )}

                        {/* Show the individual question */}
                        <QuestionRenderer
                          question={aq.question as Question}
                          viewMode={VIEW_MODE.DOING}
                          answer={answer}
                          points={aq.points}
                          onAnswerChange={handleAnswerChange}
                          number={questionNumber}
                        />
                      </div>
                    );
                  })()
                : null}

            {/* Navigation Buttons */}
            <div className="mt-8 flex items-center justify-between">
              <Button variant="outline" onClick={handlePrevious} disabled={!currentQuestionId}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                {tActions('previous')}
              </Button>

              <div className="flex items-center gap-2">
                <Button onClick={handleNext} variant="outline">
                  {tActions('next')}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
                <Button onClick={handleSubmitAttempt} className="bg-green-600 hover:bg-green-700">
                  <Send className="mr-2 h-4 w-4" />
                  {tActions('submit')}
                </Button>
              </div>
            </div>

            {/* Warning if not all answered */}
            {!allQuestionsAnswered && (
              <div className="mt-6 flex items-start gap-2 rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-4 dark:bg-yellow-950/20">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    {t('someQuestionsUnanswered')}
                  </p>
                  <p className="text-muted-foreground mt-1 text-sm">{t('reviewBeforeSubmit')}</p>
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
            <DialogTitle>{t('submitDialog.title')}</DialogTitle>
            <DialogDescription>{t('submitDialog.description')}</DialogDescription>
          </DialogHeader>
          <div className="my-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t('submitDialog.totalQuestions')}</span>
              <span className="font-medium">{questions.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t('submitDialog.answered')}</span>
              <span className="font-medium">{answeredCount}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{t('submitDialog.totalPoints')}</span>
              <span className="font-medium">{totalPoints}</span>
            </div>
            {!postId && (
              <div className="rounded bg-yellow-100 px-3 py-2 text-xs text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
                {t('submitDialog.previewMode')}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)} disabled={isSubmitting}>
              {tActions('cancel')}
            </Button>
            <Button
              onClick={handleSubmitConfirm}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700"
            >
              {isSubmitting ? tActions('submitting') : tActions('submit')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
