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
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { ArrowUpDown } from 'lucide-react';
import type { SortableQuestionProps } from './types/types';
import SortableOption from './SortableOption';

const SortableQuestion = ({ question, index, onOptionDragEnd }: SortableQuestionProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `question-${question.id}`,
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleOptionDragEnd = (event: DragEndEvent) => {
    onOptionDragEnd(question.id, event);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        bg-white rounded-lg shadow-lg p-6 border-2 border-transparent flex items-center gap-4
        ${isDragging ? 'opacity-50 border-blue-300' : ''}
        hover:shadow-xl transition-shadow
      `}
    >
      <ArrowUpDown {...attributes} {...listeners} className="text-gray-400 cursor-move w-4 h-4 " />
      <div className="flex-1">
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <div className="flex-shrink-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-semibold mr-3  hover:bg-blue-600 transition-colors">
              {index + 1}
            </div>
            <h2 className="text-xl font-medium text-gray-900">{question.question}</h2>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Answer Options (drag to reorder):</h4>

          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleOptionDragEnd}>
            <SortableContext
              items={question.options.map((option) => `option-${question.id}-${option.id}`)}
              strategy={verticalListSortingStrategy}
            >
              {question.options.map((option, optionIndex) => (
                <SortableOption
                  key={option.id}
                  option={option}
                  index={optionIndex}
                  questionId={question.id}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>
      </div>
    </div>
  );
};

export default SortableQuestion;
