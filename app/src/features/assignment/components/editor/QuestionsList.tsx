import { useCallback, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { DraggableQuestionCard } from './DraggableQuestionCard';
import { useAssignmentEditorStore } from '../../stores/useAssignmentEditorStore';
import type { AssignmentFormData } from '../../types';

export const QuestionsList = () => {
  const { watch, setValue } = useFormContext<AssignmentFormData>();
  const questions = watch('questions');
  const reorderQuestions = useAssignmentEditorStore((state) => state.reorderQuestions);

  const items = useMemo(() => questions.map((field) => `question-${field.question.id}`), [questions]);

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

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      if (activeId.startsWith('question-') && overId.startsWith('question-')) {
        const activeIndex = questions.findIndex((q) => `question-${q.question.id}` === activeId);
        const overIndex = questions.findIndex((q) => `question-${q.question.id}` === overId);

        if (activeIndex !== -1 && overIndex !== -1) {
          const reordered = reorderQuestions(questions, activeIndex, overIndex);
          setValue('questions', reordered, { shouldDirty: true });
        }
      }
    },
    [questions, reorderQuestions, setValue]
  );

  if (questions.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center border border-dashed border-gray-300 dark:border-gray-700">
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">No questions yet</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">Click "Add Question" to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="divide-y rounded-sm border">
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {questions.map((field, index) => (
            <DraggableQuestionCard key={field.question.id} id={field.question.id} index={index} />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
};
