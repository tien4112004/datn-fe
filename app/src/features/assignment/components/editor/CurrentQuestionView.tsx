import { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, Eye, Pencil, FileQuestion, BookOpen } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import { useAssignmentEditorStore } from '../../stores/useAssignmentEditorStore';
import { useAssignmentFormStore } from '../../stores/useAssignmentFormStore';
import { QuestionRenderer } from '@/features/question';
import { VIEW_MODE, type Question, getQuestionTypeName, getAllDifficulties } from '@aiprimary/core';
import { ContextSelector } from '../context/ContextSelector';
import { ContextGroupView } from '../context/ContextGroupView';
import { EditableContextDisplay } from '../context/EditableContextDisplay';
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

  const handleDelete = () => {
    if (question && currentQuestionIndex !== -1) {
      const confirmMessage = t('collection.item.removeQuestionConfirm', {
        type: getQuestionTypeName(question.type),
      });
      if (window.confirm(confirmMessage)) {
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
      <div className="flex items-center justify-between gap-3 border-b pb-4">
        <div className="flex w-full items-center gap-3">
          <FileQuestion className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {tQuestion('panelTitle', { number: questionDisplayNumber })}
          </h2>
          <span className="ml-auto text-xs text-gray-500">{getQuestionTypeName(question.type)}</span>

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

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Question Details */}
      <div className="space-y-4">
        {/* Topic, Difficulty, and Points */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label
              htmlFor={`topic-${currentQuestionIndex}`}
              className="text-xs text-gray-600 dark:text-gray-400"
            >
              {t('collection.item.topicLabel')}
            </Label>
            <Select
              value={question.topicId}
              onValueChange={(value) =>
                updateQuestion(currentQuestionIndex, {
                  question: { ...question, topicId: value },
                })
              }
            >
              <SelectTrigger id={`topic-${currentQuestionIndex}`} className="mt-1.5 h-9 text-sm">
                <SelectValue placeholder={t('collection.item.selectTopicPlaceholder') as string} />
              </SelectTrigger>
              <SelectContent>
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

        {/* Context (Reading Passage) Selector */}
        <div>
          <Label className="text-xs text-gray-600 dark:text-gray-400">{t('context.contextLabel')}</Label>
          <div className="mt-1.5">
            <ContextSelector
              value={(question as any).contextId}
              onChange={(newContextId) =>
                updateQuestion(currentQuestionIndex, {
                  question: { ...question, contextId: newContextId },
                })
              }
            />
          </div>
        </div>

        {/* Editable Context Display (if question has context) */}
        {context && (
          <EditableContextDisplay
            context={context}
            onUpdate={(updates) => handleContextUpdate(context.id, updates)}
            defaultCollapsed={true}
            readOnly={!isEditing}
          />
        )}

        {/* QuestionRenderer */}
        <div className="pt-2">
          <QuestionRenderer
            question={question as Question}
            viewMode={viewMode}
            points={points}
            onChange={handleQuestionChange}
          />
        </div>
      </div>
    </div>
  );
};
