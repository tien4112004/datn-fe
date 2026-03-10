import React, { useMemo } from 'react';
import { List } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/utils';
import { Tooltip, TooltipContent, TooltipTrigger } from '@ui/tooltip';
import { CollapsibleSection } from '../CollapsibleSection';
import { useAssignmentEditorStore } from '../../../stores/useAssignmentEditorStore';
import { useAssignmentFormStore } from '../../../stores/useAssignmentFormStore';
import { groupQuestionsByContext } from '../../../utils/questionGrouping';
import type { AssignmentContext } from '../../../types';
import {
  NavigatorToolbar,
  NavigatorContextGroupButton,
  getQuestionButtonClassName,
} from '../../shared/NavigatorShared';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableItemProps {
  id: string;
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  tooltip?: string;
  dataTutorial?: string;
  disabled?: boolean;
  hasTitle?: boolean;
  isInContext?: boolean;
  hasError?: boolean;
}

const SortableItem = ({
  id,
  isActive,
  onClick,
  children,
  className,
  tooltip,
  dataTutorial,
  disabled,
  hasTitle,
  isInContext,
  hasError,
}: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    disabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const computedClassName = className
    ? className
    : hasTitle !== undefined && isInContext !== undefined
      ? getQuestionButtonClassName({
          isActive,
          hasError,
          isInContext,
          hasTitle,
          isDragging,
          disabled,
        })
      : cn(
          'flex h-8 w-full items-center justify-center rounded text-xs font-medium transition-colors',
          isActive ? 'bg-primary text-primary-foreground' : className,
          isDragging ? 'cursor-grabbing' : disabled ? 'cursor-not-allowed opacity-50' : 'cursor-grab'
        );

  const button = (
    <button
      ref={setNodeRef}
      style={style}
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={computedClassName}
      {...(dataTutorial ? { 'data-tutorial': dataTutorial } : {})}
      {...attributes}
      {...listeners}
    >
      {children}
    </button>
  );

  if (tooltip) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <div>{button}</div>
        </TooltipTrigger>
        <TooltipContent className="max-w-[150px]">
          <p className="truncate">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return button;
};

export const QuestionNavigator = () => {
  const { t } = useTranslation('assignment', { keyPrefix: 'assignmentEditor.navigator' });
  const { t: tContext } = useTranslation('assignment', { keyPrefix: 'context' });

  const questions = useAssignmentFormStore((state) => state.questions);
  const contexts = useAssignmentFormStore((state) => state.contexts);
  const reorderQuestions = useAssignmentFormStore((state) => state.reorderQuestions);

  const validationErrors = useAssignmentFormStore((state) => state.validationErrors);

  const mainView = useAssignmentEditorStore((state) => state.mainView);
  const setMainView = useAssignmentEditorStore((state) => state.setMainView);
  const currentQuestionId = useAssignmentEditorStore((state) => state.currentQuestionId);
  const currentContextId = useAssignmentEditorStore((state) => state.currentContextId);
  const setCurrentQuestionId = useAssignmentEditorStore((state) => state.setCurrentQuestionId);
  const setCurrentContextId = useAssignmentEditorStore((state) => state.setCurrentContextId);
  const isGeneratingQuestions = useAssignmentEditorStore((state) => state.isGeneratingQuestions);

  const hasQuestionError = (questionId: string): boolean =>
    (validationErrors?.questions[questionId]?.errors.length ?? 0) > 0;
  const hasAssignmentError = !!(validationErrors?.assignment?.title || validationErrors?.assignment?.subject);
  const hasMatrixWarning = (validationErrors?.matrix?.errors.length ?? 0) > 0;

  // Build contexts map from assignment's cloned contexts (not from API)
  const contextsMap = useMemo(() => {
    const map = new Map<string, AssignmentContext>();
    contexts.forEach((ctx) => map.set(ctx.id, ctx));
    return map;
  }, [contexts]);

  // Group questions by context
  const groups = useMemo(() => groupQuestionsByContext(questions, contextsMap), [questions, contextsMap]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    if (isGeneratingQuestions) return;
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q.question.id === active.id);
      const newIndex = questions.findIndex((q) => q.question.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        reorderQuestions(oldIndex, newIndex);
      }
    }
  };

  const handleQuestionClick = (questionId: string) => {
    setMainView('questions');
    setCurrentQuestionId(questionId);
  };

  const handleContextClick = (contextId: string) => {
    setMainView('contextGroup');
    setCurrentContextId(contextId);
  };

  // Track question numbers and context group index for tutorial
  let questionNumber = 0;
  let contextGroupIndex = 0;

  return (
    <CollapsibleSection
      title={t('questionsCount', { count: questions.length })}
      icon={<List className="h-5 w-5" />}
      defaultOpen={true}
    >
      <div className="space-y-2">
        <NavigatorToolbar
          activeView={mainView}
          onInfoClick={() => setMainView('info')}
          onMatrixClick={() => setMainView('matrix')}
          onContextsClick={() => setMainView('contexts')}
          onQuestionsListClick={() => setMainView('questionsList')}
          disabled={isGeneratingQuestions}
          infoErrorClassName={
            hasAssignmentError && mainView !== 'info'
              ? 'bg-destructive/15 text-destructive hover:bg-destructive/25'
              : undefined
          }
          matrixWarningClassName={
            hasMatrixWarning && mainView !== 'matrix'
              ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:hover:bg-yellow-900/50'
              : undefined
          }
          tooltipInfo={t('tooltips.assignmentInfo')}
          tooltipMatrix={t('tooltips.matrixBuilder')}
          tooltipContexts={t('tooltips.contexts')}
          tooltipQuestionsList={t('listView')}
          tutorialAttrToolbar="nav-toolbar"
          tutorialAttrInfo="nav-info"
          tutorialAttrMatrix="nav-matrix"
          tutorialAttrContexts="nav-contexts"
          tutorialAttrQuestionsList="nav-questions-list"
        />

        {questions.length > 0 && <hr className="border-border" />}

        {/* Questions/Contexts grid */}
        {questions.length > 0 && (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-5 gap-1.5 overflow-hidden" data-tutorial="nav-grid">
              <SortableContext
                items={questions.filter((q) => q?.question?.id).map((q) => q.question.id)}
                strategy={rectSortingStrategy}
              >
                {groups.map((group) => {
                  if (group.type === 'context') {
                    const isContextActive =
                      mainView === 'contextGroup' && currentContextId === group.contextId;
                    const isFirstContextGroup = contextGroupIndex === 0;
                    contextGroupIndex++;

                    return (
                      <React.Fragment key={group.id}>
                        <NavigatorContextGroupButton
                          tooltipText={`${group.context?.title || tContext('readingPassage')} (${tContext('questionsCount', { count: group.questions.length })})`}
                          isActive={isContextActive}
                          onClick={() => handleContextClick(group.contextId!)}
                          disabled={isGeneratingQuestions}
                          dataTutorial={isFirstContextGroup ? 'nav-context-group' : undefined}
                        />

                        {group.questions.map((aq) => {
                          const question = aq?.question;
                          if (!question) return null;
                          questionNumber++;
                          const isQuestionActive =
                            mainView === 'questions' && currentQuestionId === question.id;
                          const hasTitle = Boolean(question.title) && question.title.trim() !== '';

                          return (
                            <SortableItem
                              key={question.id}
                              id={question.id}
                              isActive={isQuestionActive}
                              onClick={() => handleQuestionClick(question.id)}
                              disabled={isGeneratingQuestions}
                              dataTutorial={questionNumber === 1 ? 'nav-question-item' : undefined}
                              tooltip={question.title || 'Untitled'}
                              hasTitle={hasTitle}
                              isInContext={true}
                              hasError={hasQuestionError(question.id)}
                            >
                              {questionNumber}
                            </SortableItem>
                          );
                        })}
                      </React.Fragment>
                    );
                  } else {
                    const aq = group.questions[0];
                    const question = aq?.question;
                    if (!question) return null;
                    questionNumber++;
                    const isActive = mainView === 'questions' && currentQuestionId === question.id;
                    const hasTitle = Boolean(question.title) && question.title.trim() !== '';

                    return (
                      <SortableItem
                        key={group.id}
                        id={question.id}
                        isActive={isActive}
                        onClick={() => handleQuestionClick(question.id)}
                        disabled={isGeneratingQuestions}
                        dataTutorial={questionNumber === 1 ? 'nav-question-item' : undefined}
                        tooltip={question.title || 'Untitled'}
                        hasTitle={hasTitle}
                        isInContext={false}
                        hasError={hasQuestionError(question.id)}
                      >
                        {questionNumber}
                      </SortableItem>
                    );
                  }
                })}
              </SortableContext>
            </div>
          </DndContext>
        )}
      </div>
    </CollapsibleSection>
  );
};
