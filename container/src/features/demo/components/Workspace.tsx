import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import SortableQuestion from './SortableQuestion';
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import type { Question } from '../types/types';

interface WorkspaceProps {
  questions: Question[];
  setQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
}

const Workspace: React.FC<WorkspaceProps> = ({ questions, setQuestions }) => {
  const { setNodeRef: setDroppableNodeRef, isOver } = useDroppable({
    id: 'workspace',
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleOptionDragEnd = (_questionId: string, event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      const activeId = active.id as string;
      const overId = over.id as string;

      // Handle option reordering within the same question
      if (activeId.startsWith('option-') && overId.startsWith('option-')) {
        const activeQuestionId = activeId.split('-')[1];
        const overQuestionId = overId.split('-')[1];

        // Only allow reordering within the same question
        if (activeQuestionId !== overQuestionId) return;

        setQuestions((prevQuestions) => {
          const newQuestions = [...prevQuestions];
          const questionIndex = newQuestions.findIndex((q) => q.id === activeQuestionId);
          const question = newQuestions[questionIndex];

          const activeOptionId = activeId.split('-')[2];
          const overOptionId = overId.split('-')[2];

          const oldIndex = question.options.findIndex((option) => option.id === activeOptionId);
          const newIndex = question.options.findIndex((option) => option.id === overOptionId);

          newQuestions[questionIndex] = {
            ...question,
            options: arrayMove(question.options, oldIndex, newIndex),
          };

          return newQuestions;
        });
      }
    }
  };

  const handleQuestionDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    if (active.id !== over.id) {
      const activeId = active.id as string;
      const overId = over.id as string;

      // Handle question reordering
      if (activeId.startsWith('question-') && overId.startsWith('question-')) {
        const activeQuestionId = activeId.replace('question-', '');
        const overQuestionId = overId.replace('question-', '');

        setQuestions((prevQuestions) => {
          const oldIndex = prevQuestions.findIndex((q) => q.id === activeQuestionId);
          const newIndex = prevQuestions.findIndex((q) => q.id === overQuestionId);
          return arrayMove(prevQuestions, oldIndex, newIndex);
        });
      }
    }
  };

  return (
    <div ref={setDroppableNodeRef} className={`flex-1 ${isOver ? 'bg-red-500' : ''} p-4`}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleQuestionDragEnd}>
        <SortableContext
          items={questions.map((question) => `question-${question.id}`)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {questions.map((question, questionIndex) => (
              <SortableQuestion
                key={question.id}
                question={question}
                index={questionIndex}
                onOptionDragEnd={handleOptionDragEnd}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default Workspace;
