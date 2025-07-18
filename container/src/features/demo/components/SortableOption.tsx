import { useSortable } from '@dnd-kit/sortable';
import type { SortableOptionProps } from './types/types';

const SortableOption = ({ option, index, questionId }: SortableOptionProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `option-${questionId}-${option.id}`,
  });

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`
        p-4 mb-2 bg-white border rounded-lg shadow-sm cursor-move
        ${isDragging ? 'opacity-50' : ''}
        ${option.isCorrect ? 'border-green-500 bg-green-50' : 'border-gray-200'}
        hover:shadow-md transition-shadow
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium">
            {String.fromCharCode(65 + index)}
          </div>
          <span className="text-gray-900">{option.text}</span>
        </div>
        {option.isCorrect && (
          <div className="flex-shrink-0 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default SortableOption;
