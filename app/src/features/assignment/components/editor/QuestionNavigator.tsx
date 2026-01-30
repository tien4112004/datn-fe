import { List, FileText, Grid3x3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { CollapsibleSection } from './CollapsibleSection';
import { useAssignmentEditorStore } from '../../stores/useAssignmentEditorStore';
import { useAssignmentFormStore } from '../../stores/useAssignmentFormStore';
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

interface SortableQuestionButtonProps {
  id: string;
  index: number;
  isActive: boolean;
  hasTitle: boolean;
  title: string;
  onClick: () => void;
  untitledLabel: string;
}

const SortableQuestionButton = ({
  id,
  index,
  isActive,
  hasTitle,
  title,
  onClick,
  untitledLabel,
}: SortableQuestionButtonProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <button
      ref={setNodeRef}
      style={style}
      type="button"
      onClick={onClick}
      className={`flex h-8 w-full items-center justify-center rounded text-xs font-medium transition-colors ${
        isActive
          ? 'bg-primary text-primary-foreground'
          : hasTitle
            ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
      } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      title={title || untitledLabel}
      {...attributes}
      {...listeners}
    >
      {index + 1}
    </button>
  );
};

export const QuestionNavigator = () => {
  const { t } = useTranslation('assignment', { keyPrefix: 'assignmentEditor.navigator' });

  const questions = useAssignmentFormStore((state) => state.questions);
  const reorderQuestions = useAssignmentFormStore((state) => state.reorderQuestions);

  const mainView = useAssignmentEditorStore((state) => state.mainView);
  const setMainView = useAssignmentEditorStore((state) => state.setMainView);
  const currentQuestionId = useAssignmentEditorStore((state) => state.currentQuestionId);
  const setCurrentQuestionId = useAssignmentEditorStore((state) => state.setCurrentQuestionId);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before activating drag
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
        // Current question ID remains the same, no need to update
      }
    }
  };

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
                className={`flex h-8 w-full items-center justify-center rounded text-xs transition-colors ${
                  mainView === 'info'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
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
                className={`flex h-8 w-full items-center justify-center rounded text-xs transition-colors ${
                  mainView === 'matrix'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                }`}
              >
                <Grid3x3 className="h-3 w-3" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('tooltips.matrixBuilder')}</p>
            </TooltipContent>
          </Tooltip>

          {/* Question Numbers */}
          <SortableContext items={questions.map((q) => q.question.id)} strategy={rectSortingStrategy}>
            {questions.map((aq, index) => {
              const isActive = mainView === 'questions' && currentQuestionId === aq.question.id;
              const question = aq.question;
              const hasTitle = Boolean(question.title) && question.title.trim() !== '';

              return (
                <Tooltip key={question.id}>
                  <TooltipTrigger asChild>
                    <div>
                      <SortableQuestionButton
                        id={question.id}
                        index={index}
                        isActive={isActive}
                        hasTitle={hasTitle}
                        title={question.title}
                        untitledLabel={t('untitled')}
                        onClick={() => {
                          setMainView('questions');
                          setCurrentQuestionId(question.id);
                        }}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{t('tooltips.questionNumber')}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </SortableContext>
        </div>
      </DndContext>
    </CollapsibleSection>
  );
};
