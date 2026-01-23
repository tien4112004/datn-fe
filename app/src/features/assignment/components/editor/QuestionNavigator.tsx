import { List, FileText, Grid3x3 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
import type { AssignmentQuestionWithTopic } from '../../types';

interface SortableQuestionButtonProps {
  aq: AssignmentQuestionWithTopic;
  index: number;
  isActive: boolean;
  hasTitle: boolean;
  onClick: () => void;
  title: string;
}

const SortableQuestionButton = ({
  aq,
  index,
  isActive,
  hasTitle,
  onClick,
  title,
}: SortableQuestionButtonProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: aq.question.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleClick = () => {
    // Only trigger onClick if not dragging
    if (!isDragging) {
      onClick();
    }
  };

  return (
    <button
      ref={setNodeRef}
      style={style}
      type="button"
      onClick={handleClick}
      className={`flex h-8 w-full items-center justify-center rounded text-xs font-medium transition-colors ${
        isActive
          ? 'bg-primary text-primary-foreground'
          : hasTitle
            ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950 dark:text-blue-300 dark:hover:bg-blue-900'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
      } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      title={title}
      {...attributes}
      {...listeners}
    >
      {index + 1}
    </button>
  );
};

export const QuestionNavigator = () => {
  const { t } = useTranslation('assignment', { keyPrefix: 'assignmentEditor.navigator' });

  // Get data from store
  const questions = useAssignmentFormStore((state) => state.questions);
  const reorderQuestions = useAssignmentFormStore((state) => state.reorderQuestions);

  const mainView = useAssignmentEditorStore((state) => state.mainView);
  const setMainView = useAssignmentEditorStore((state) => state.setMainView);
  const currentQuestionIndex = useAssignmentEditorStore((state) => state.currentQuestionIndex);
  const setCurrentQuestionIndex = useAssignmentEditorStore((state) => state.setCurrentQuestionIndex);

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

        // Update current question index if the active question was moved
        if (currentQuestionIndex === oldIndex) {
          setCurrentQuestionIndex(newIndex);
        } else if (currentQuestionIndex > oldIndex && currentQuestionIndex <= newIndex) {
          setCurrentQuestionIndex(currentQuestionIndex - 1);
        } else if (currentQuestionIndex < oldIndex && currentQuestionIndex >= newIndex) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        }
      }
    }
  };

  return (
    <CollapsibleSection
      title={t('questionsCount', { count: questions.length })}
      icon={<List className="h-5 w-5" />}
      defaultOpen={true}
    >
      <div className="grid grid-cols-5 gap-1.5">
        {/* Assignment Info Icon */}
        <button
          type="button"
          onClick={() => setMainView('info')}
          className={`flex h-8 w-full items-center justify-center rounded text-xs transition-colors ${
            mainView === 'info'
              ? 'bg-primary text-primary-foreground'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
          }`}
          title={t('assignmentInfo')}
        >
          <FileText className="h-3 w-3" />
        </button>

        {/* Matrix Builder Icon */}
        <button
          type="button"
          onClick={() => setMainView('matrix')}
          className={`flex h-8 w-full items-center justify-center rounded text-xs transition-colors ${
            mainView === 'matrix'
              ? 'bg-primary text-primary-foreground'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
          }`}
          title={t('matrixBuilder')}
        >
          <Grid3x3 className="h-3 w-3" />
        </button>

        {/* Sortable Question Numbers */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={questions.map((q) => q.question.id)} strategy={rectSortingStrategy}>
            {questions.map((aq, index) => {
              const isActive = mainView === 'questions' && currentQuestionIndex === index;
              const question = aq.question;
              const hasTitle = Boolean(question.title) && question.title.trim() !== '';

              return (
                <SortableQuestionButton
                  key={question.id}
                  aq={aq}
                  index={index}
                  isActive={isActive}
                  hasTitle={hasTitle}
                  onClick={() => {
                    setMainView('questions');
                    setCurrentQuestionIndex(index);
                  }}
                  title={question.title || t('untitled')}
                />
              );
            })}
          </SortableContext>
        </DndContext>
      </div>
    </CollapsibleSection>
  );
};
