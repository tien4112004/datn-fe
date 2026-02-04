import React, { useMemo } from 'react';
import { List, FileText, Grid3x3, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { cn } from '@/shared/lib/utils';
import { CollapsibleSection } from './CollapsibleSection';
import { useAssignmentEditorStore } from '../../stores/useAssignmentEditorStore';
import { useAssignmentFormStore } from '../../stores/useAssignmentFormStore';
import { useQuestionContexts } from '../../hooks/useQuestionContexts';
import { groupQuestionsByContext } from '../../utils/questionGrouping';
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
}

const SortableItem = ({ id, isActive, onClick, children, className, tooltip }: SortableItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const button = (
    <button
      ref={setNodeRef}
      style={style}
      type="button"
      onClick={onClick}
      className={cn(
        'flex h-8 w-full items-center justify-center rounded text-xs font-medium transition-colors',
        isActive ? 'bg-primary text-primary-foreground' : className,
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      )}
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
        <TooltipContent>
          <p>{tooltip}</p>
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
  const reorderQuestions = useAssignmentFormStore((state) => state.reorderQuestions);

  const mainView = useAssignmentEditorStore((state) => state.mainView);
  const setMainView = useAssignmentEditorStore((state) => state.setMainView);
  const currentQuestionId = useAssignmentEditorStore((state) => state.currentQuestionId);
  const currentContextId = useAssignmentEditorStore((state) => state.currentContextId);
  const setCurrentQuestionId = useAssignmentEditorStore((state) => state.setCurrentQuestionId);
  const setCurrentContextId = useAssignmentEditorStore((state) => state.setCurrentContextId);

  // Fetch all contexts for questions
  const { contextsMap } = useQuestionContexts(questions);

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
    setMainView('questions');
    setCurrentContextId(contextId);
  };

  // Track question numbers
  let questionNumber = 0;

  return (
    <CollapsibleSection
      title={t('questionsCount', { count: questions.length })}
      icon={<List className="h-5 w-5" />}
      defaultOpen={true}
    >
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-5 gap-1.5 overflow-hidden">
          {/* Assignment Info Icon */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => setMainView('info')}
                className={cn(
                  'flex h-8 w-full items-center justify-center rounded text-xs transition-colors',
                  mainView === 'info'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                )}
              >
                <FileText className="h-3 w-3" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('tooltips.assignmentInfo')}</p>
            </TooltipContent>
          </Tooltip>

          {/* Matrix Builder Icon */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={() => setMainView('matrix')}
                className={cn(
                  'flex h-8 w-full items-center justify-center rounded text-xs transition-colors',
                  mainView === 'matrix'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                )}
              >
                <Grid3x3 className="h-3 w-3" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('tooltips.matrixBuilder')}</p>
            </TooltipContent>
          </Tooltip>

          {/* Groups: Context groups and standalone questions */}
          <SortableContext
            items={questions.filter((q) => q?.question?.id).map((q) => q.question.id)}
            strategy={rectSortingStrategy}
          >
            {groups.map((group) => {
              if (group.type === 'context') {
                // Context group - show BookOpen icon THEN individual questions
                const isContextActive = mainView === 'questions' && currentContextId === group.contextId;

                return (
                  <React.Fragment key={group.id}>
                    {/* Context group icon - click to view all questions together */}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => handleContextClick(group.contextId!)}
                          className={cn(
                            'flex h-8 w-full items-center justify-center rounded text-xs font-medium transition-colors',
                            isContextActive
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:hover:bg-blue-800'
                          )}
                        >
                          <BookOpen className="h-3 w-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          {group.context?.title || tContext('readingPassage')} (
                          {tContext('questionsCount', { count: group.questions.length })})
                        </p>
                      </TooltipContent>
                    </Tooltip>

                    {/* Individual questions in the context group */}
                    {group.questions.map((aq) => {
                      const question = aq?.question;
                      if (!question) return null;
                      questionNumber++;
                      const isQuestionActive = mainView === 'questions' && currentQuestionId === question.id;
                      const hasTitle = Boolean(question.title) && question.title.trim() !== '';

                      return (
                        <SortableItem
                          key={question.id}
                          id={question.id}
                          isActive={isQuestionActive}
                          onClick={() => handleQuestionClick(question.id)}
                          className={
                            hasTitle
                              ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900'
                              : 'bg-blue-50/50 text-blue-600 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-400 dark:hover:bg-blue-900'
                          }
                          tooltip={question.title || t('untitled')}
                        >
                          {questionNumber}
                        </SortableItem>
                      );
                    })}
                  </React.Fragment>
                );
              } else {
                // Standalone question (no context)
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
                    className={
                      hasTitle
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                    }
                    tooltip={question.title || t('untitled')}
                  >
                    {questionNumber}
                  </SortableItem>
                );
              }
            })}
          </SortableContext>
        </div>
      </DndContext>
    </CollapsibleSection>
  );
};
