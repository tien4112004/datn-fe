import { useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, Eye, Pencil, FileQuestion, BookOpen, Unlink, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { Collapsible, CollapsibleContent } from '@/shared/components/ui/collapsible';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/shared/components/ui/alert-dialog';
import { MarkdownPreview } from '@/features/question/components/shared/MarkdownPreview';
import { useAssignmentEditorStore } from '../../stores/useAssignmentEditorStore';
import { useAssignmentFormStore } from '../../stores/useAssignmentFormStore';
import { QuestionRenderer } from '@/features/question';
import { VIEW_MODE, type Question, getQuestionTypeName, getAllDifficulties } from '@aiprimary/core';
import { ContextSelector } from '../context/ContextSelector';
import { ContextGroupView } from '../context/ContextGroupView';
import { groupQuestionsByContext, getQuestionDisplayNumber } from '../../utils/questionGrouping';
import type { AssignmentContext } from '../../types';

export const CurrentQuestionView = () => {
  const { t } = useTranslation('assignment');
  const { t: tQuestion } = useTranslation('assignment', { keyPrefix: 'assignmentEditor.currentQuestion' });
  const { t: tContext } = useTranslation('assignment', { keyPrefix: 'context' });
  const { t: tQuestions } = useTranslation('questions');

  // Get data and actions from stores
  const questions = useAssignmentFormStore((state) => state.questions);
  const topics = useAssignmentFormStore((state) => state.topics);
  const contexts = useAssignmentFormStore((state) => state.contexts);
  const removeQuestion = useAssignmentFormStore((state) => state.removeQuestion);
  const updateQuestion = useAssignmentFormStore((state) => state.updateQuestion);
  const updateContext = useAssignmentFormStore((state) => state.updateContext);

  const currentQuestionId = useAssignmentEditorStore((state) => state.currentQuestionId);
  const currentContextId = useAssignmentEditorStore((state) => state.currentContextId);
  const setCurrentQuestionId = useAssignmentEditorStore((state) => state.setCurrentQuestionId);
  const questionViewModes = useAssignmentEditorStore((state) => state.questionViewModes);
  const toggleQuestionViewMode = useAssignmentEditorStore((state) => state.toggleQuestionViewMode);

  // Build contexts map from assignment's cloned contexts
  const contextsMap = useMemo(() => {
    const map = new Map<string, AssignmentContext>();
    contexts.forEach((ctx) => map.set(ctx.id, ctx));
    return map;
  }, [contexts]);

  // Group questions by context
  const groups = useMemo(() => groupQuestionsByContext(questions, contextsMap), [questions, contextsMap]);

  // Find selected context group
  const selectedContextGroup = useMemo(() => {
    if (!currentContextId) return null;
    return groups.find((g) => g.type === 'context' && g.contextId === currentContextId);
  }, [groups, currentContextId]);

  const currentQuestionIndex = questions.findIndex((q) => q.question.id === currentQuestionId);
  const assignmentQuestion = questions[currentQuestionIndex];
  const question = assignmentQuestion?.question;
  const points = assignmentQuestion?.points || 0;

  // State for context editing UI
  const [isContextOpen, setIsContextOpen] = useState(true);
  const [isContextEditing, setIsContextEditing] = useState(false);

  const viewMode = questionViewModes.get(question?.id || '') || VIEW_MODE.EDITING;
  const isEditing = viewMode === VIEW_MODE.EDITING;

  // Get display number for individual question
  const questionDisplayNumber = useMemo(() => {
    if (!currentQuestionId) return 0;
    return getQuestionDisplayNumber(groups, currentQuestionId);
  }, [groups, currentQuestionId]);

  // Get start number for context group
  const contextStartNumber = useMemo(() => {
    if (!selectedContextGroup) return 1;
    const firstQuestion = selectedContextGroup.questions[0];
    if (!firstQuestion) return 1;
    return getQuestionDisplayNumber(groups, firstQuestion.question.id);
  }, [groups, selectedContextGroup]);

  const handleConfirmDelete = () => {
    if (question && currentQuestionIndex !== -1) {
      removeQuestion(currentQuestionIndex);
      // Set current question to the next one or previous if at end
      if (questions.length > 1) {
        const nextIndex =
          currentQuestionIndex >= questions.length - 1 ? currentQuestionIndex - 1 : currentQuestionIndex;
        setCurrentQuestionId(questions[nextIndex]?.question.id || null);
      } else {
        setCurrentQuestionId(null);
      }
    }
  };

  const handleQuestionChange = (updatedQuestion: Question) => {
    updateQuestion(currentQuestionIndex, {
      question: {
        ...question,
        ...updatedQuestion,
      },
    });
  };

  // Handler for question changes within a context group
  const handleContextQuestionChange = (questionId: string, updatedQuestion: Question) => {
    const qIndex = questions.findIndex((q) => q.question.id === questionId);
    if (qIndex !== -1) {
      updateQuestion(qIndex, {
        question: {
          ...questions[qIndex].question,
          ...updatedQuestion,
        },
      });
    }
  };

  // Handler for context updates (shared editing)
  const handleContextUpdate = useCallback(
    (contextId: string, updates: Partial<AssignmentContext>) => {
      updateContext(contextId, updates);
    },
    [updateContext]
  );

  // Empty state
  if (questions.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center border border-dashed border-gray-300 dark:border-gray-700">
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">{tQuestion('noQuestions')}</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">{tQuestion('addQuestionHint')}</p>
        </div>
      </div>
    );
  }

  // Context group selected - show ContextGroupView in viewing mode (editing context group is complex)
  if (selectedContextGroup && selectedContextGroup.context) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b pb-4">
          <div className="flex w-full items-center gap-3">
            <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {selectedContextGroup.context.title || tContext('readingPassage')}
            </h2>
            <Badge variant="secondary">
              {tContext('questionsCount', { count: selectedContextGroup.questions.length })}
            </Badge>
          </div>
        </div>

        {/* Context Group View - Viewing mode for group overview */}
        <ContextGroupView
          context={selectedContextGroup.context}
          questions={selectedContextGroup.questions}
          viewMode={VIEW_MODE.VIEWING}
          startNumber={contextStartNumber}
          onQuestionChange={handleContextQuestionChange}
          onContextUpdate={
            selectedContextGroup.contextId
              ? (updates) => handleContextUpdate(selectedContextGroup.contextId!, updates)
              : undefined
          }
        />

        {/* Tip to edit individual questions */}
        <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          {tContext('contextGroupEditTip')}
        </div>
      </div>
    );
  }

  // Handle race condition: question ID is set but question not yet in array
  // This can happen when a new question is added but stores haven't synced yet
  if (!assignmentQuestion && currentQuestionId) {
    return (
      <div className="flex min-h-[400px] items-center justify-center border border-dashed border-gray-300 dark:border-gray-700">
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">{tQuestion('noQuestionSelected')}</p>
        </div>
      </div>
    );
  }

  // No question selected
  if (!assignmentQuestion || !question) {
    return (
      <div className="flex min-h-[400px] items-center justify-center border border-dashed border-gray-300 dark:border-gray-700">
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">{tQuestion('noQuestionSelected')}</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">{tQuestion('selectQuestionHint')}</p>
        </div>
      </div>
    );
  }

  // Get context for individual question
  const contextId = (question as any).contextId;
  const context = contextId ? contextsMap.get(contextId) : undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b bg-white pb-4 pt-1 lg:top-0 dark:bg-gray-950">
        <div className="flex w-full items-center gap-3">
          <FileQuestion className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {tQuestion('panelTitle', { number: questionDisplayNumber })}
          </h2>
          <span className="ml-auto text-xs text-gray-500">
            {getQuestionTypeName(question.type?.toUpperCase() as any)}
          </span>

          {/* Edit/Preview Toggle */}
          <div className="flex items-center rounded border">
            <Button
              type="button"
              variant={isEditing ? 'default' : 'ghost'}
              size="sm"
              onClick={() => !isEditing && toggleQuestionViewMode(question.id)}
              className="h-7 rounded-r-none px-2"
            >
              <Pencil className="mr-1 h-3 w-3" />
              <span className="text-xs">{tQuestion('edit')}</span>
            </Button>
            <Button
              type="button"
              variant={!isEditing ? 'default' : 'ghost'}
              size="sm"
              onClick={() => isEditing && toggleQuestionViewMode(question.id)}
              className="h-7 rounded-l-none px-2"
            >
              <Eye className="mr-1 h-3 w-3" />
              <span className="text-xs">{tQuestion('preview')}</span>
            </Button>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{t('collection.item.deleteConfirm.title')}</AlertDialogTitle>
                <AlertDialogDescription>
                  {t('collection.item.removeQuestionConfirm', {
                    type: getQuestionTypeName(question.type?.toUpperCase() as any),
                  })}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{t('collection.item.deleteConfirm.cancel')}</AlertDialogCancel>
                <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
                  {t('collection.item.deleteConfirm.confirm')}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Question Details */}
      <div className="space-y-4">
        {/* Topic, Difficulty, and Points - Only show in editing mode */}
        {isEditing && (
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label
                htmlFor={`topic-${currentQuestionIndex}`}
                className="text-xs text-gray-600 dark:text-gray-400"
              >
                {t('collection.item.topicLabel')}
              </Label>
              <Select
                value={question.topicId || '__none__'}
                onValueChange={(value) =>
                  updateQuestion(currentQuestionIndex, {
                    question: { ...question, topicId: value === '__none__' ? '' : value },
                  })
                }
              >
                <SelectTrigger id={`topic-${currentQuestionIndex}`} className="mt-1.5 h-9 text-sm">
                  <SelectValue placeholder={t('collection.item.selectTopicPlaceholder') as string} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__" className="text-gray-400">
                    {t('collection.item.noTopic')}
                  </SelectItem>
                  {topics.map((topic) => (
                    <SelectItem key={topic.id} value={topic.id}>
                      {topic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label
                htmlFor={`difficulty-${currentQuestionIndex}`}
                className="text-xs text-gray-600 dark:text-gray-400"
              >
                {t('collection.item.difficultyLabel')}
              </Label>
              <Select
                value={question.difficulty}
                onValueChange={(value) =>
                  updateQuestion(currentQuestionIndex, {
                    question: { ...question, difficulty: value as any },
                  })
                }
              >
                <SelectTrigger id={`difficulty-${currentQuestionIndex}`} className="mt-1.5 h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getAllDifficulties().map((difficulty) => (
                    <SelectItem key={difficulty.value} value={difficulty.value}>
                      {(tQuestions as any)(difficulty.i18nKey!)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label
                htmlFor={`points-${currentQuestionIndex}`}
                className="text-xs text-gray-600 dark:text-gray-400"
              >
                {t('collection.item.pointsLabel')}
              </Label>
              <Input
                id={`points-${currentQuestionIndex}`}
                type="number"
                value={points}
                onChange={(e) =>
                  updateQuestion(currentQuestionIndex, {
                    points: parseInt(e.target.value, 10) || 0,
                  })
                }
                min={0}
                className="mt-1.5 h-9 text-sm"
              />
            </div>
          </div>
        )}

        {/* Context (Reading Passage) - Only show selector and controls in editing mode */}
        {isEditing && (
          <>
            <Label className="text-xs text-gray-600 dark:text-gray-400">{tContext('contextLabel')}</Label>
            <div className="mt-1.5 flex items-center gap-1">
              <div className="flex-1">
                <ContextSelector
                  value={(question as any).contextId}
                  onChange={(newContextId) =>
                    updateQuestion(currentQuestionIndex, {
                      question: { ...question, contextId: newContextId },
                    })
                  }
                />
              </div>
              {context && (
                <>
                  {!isContextEditing && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 shrink-0 p-0"
                      onClick={() => {
                        setIsContextEditing(true);
                        setIsContextOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 shrink-0 p-0 text-gray-400 hover:text-red-600"
                    onClick={() =>
                      updateQuestion(currentQuestionIndex, {
                        question: { ...question, contextId: undefined },
                      })
                    }
                  >
                    <Unlink className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-9 w-9 shrink-0 p-0"
                    onClick={() => setIsContextOpen(!isContextOpen)}
                  >
                    {isContextOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                </>
              )}
            </div>
          </>
        )}

        {/* Context Display - Show read-only in viewing mode */}
        {!isEditing && context && (
          <div className="border-l-4 border-l-blue-400 py-2 pl-4">
            <div className="space-y-2 pl-4 pr-8">
              {context.title && <h3 className="text-lg font-semibold">{context.title}</h3>}
              <MarkdownPreview content={context.content} className="text-gray-800 dark:text-gray-200" />
              {context.author && (
                <p className="text-muted-foreground text-right text-sm italic">— {context.author}</p>
              )}
            </div>
          </div>
        )}

        {/* Context Collapsible - Show in editing mode */}
        {isEditing && context && (
          <Collapsible open={isContextOpen} onOpenChange={setIsContextOpen}>
            <CollapsibleContent>
              <div className="mt-2 border-l-4 border-l-blue-400 py-2 pl-4">
                {isContextEditing ? (
                  <div className="space-y-4">
                    <Input
                      value={context.title}
                      onChange={(e) => updateContext(context.id, { title: e.target.value })}
                      placeholder={tContext('titlePlaceholder')}
                      className="text-base font-semibold"
                    />
                    <Textarea
                      value={context.content}
                      onChange={(e) => updateContext(context.id, { content: e.target.value })}
                      placeholder={tContext('contentPlaceholder')}
                      className="min-h-[200px] resize-y"
                    />
                    <Input
                      value={context.author || ''}
                      onChange={(e) => updateContext(context.id, { author: e.target.value })}
                      placeholder={tContext('authorPlaceholder')}
                      className="max-w-xs text-sm"
                    />
                    <div className="flex justify-end">
                      <Button type="button" size="sm" onClick={() => setIsContextEditing(false)}>
                        {tContext('done')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 pl-4 pr-8">
                    {context.title && <h3 className="text-lg font-semibold">{context.title}</h3>}
                    <MarkdownPreview content={context.content} className="text-gray-800 dark:text-gray-200" />
                    {context.author && (
                      <p className="text-muted-foreground text-right text-sm italic">— {context.author}</p>
                    )}
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* QuestionRenderer */}
        <div className="pt-2">
          <QuestionRenderer
            question={question}
            viewMode={viewMode}
            points={points}
            onChange={handleQuestionChange}
          />
        </div>
      </div>
    </div>
  );
};

// Note: Inline context handling is now integrated directly in CurrentQuestionView
