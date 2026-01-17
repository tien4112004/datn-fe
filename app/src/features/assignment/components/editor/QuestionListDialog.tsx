import { useCallback, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  closestCenter,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/shared/components/ui/dialog';
import { SortableQuestionItem } from './SortableQuestionItem';
import { useAssignmentEditorStore } from '../../stores/useAssignmentEditorStore';
import type { AssignmentFormData } from '../../types';
import { Info } from 'lucide-react';

export const QuestionListDialog = () => {
  const { t } = useTranslation('assignment', { keyPrefix: 'assignmentEditor.questionList' });
  const { watch, setValue } = useFormContext<AssignmentFormData>();

  const questions = watch('questions');
  const topics = watch('topics');

  const isOpen = useAssignmentEditorStore((state) => state.isQuestionListDialogOpen);
  const setOpen = useAssignmentEditorStore((state) => state.setQuestionListDialogOpen);
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

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="flex max-h-[85vh] max-w-4xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>
            {questions.length > 0 ? (
              <div className="flex items-center gap-2 text-sm">
                <Info className="h-4 w-4" />
                <span>{t('dragHint')}</span>
              </div>
            ) : null}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2">
          {questions.length === 0 ? (
            <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
              <div className="text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('emptyMessage')}</p>
              </div>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={items} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                  {questions.map((question, index) => (
                    <SortableQuestionItem
                      key={question.question.id}
                      question={question}
                      index={index}
                      topics={topics}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
