import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { Badge } from '@ui/badge';
import { getQuestionTypeName, getDifficultyName } from '@aiprimary/core';
import type { AssignmentQuestionWithTopic, AssignmentTopic } from '../../types';
import { cn } from '@/shared/lib/utils';

interface SortableQuestionItemProps {
  question: AssignmentQuestionWithTopic;
  index: number;
  topics: AssignmentTopic[];
}

export const SortableQuestionItem = ({ question, index, topics }: SortableQuestionItemProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `question-${question.question.id}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const topic = topics.find((t) => t.id === question.question.topicId);
  const hasTitle = question.question.title && question.question.title.trim() !== '';

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-3 rounded-lg border bg-white p-4 transition-colors hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800',
        isDragging && 'shadow-lg'
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-move touch-none p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
      >
        <GripVertical className="h-5 w-5" />
      </div>

      {/* Question Number */}
      <div className="flex-shrink-0">
        <div className="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold">
          {index + 1}
        </div>
      </div>

      {/* Question Details */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {/* Question Type Badge */}
          <Badge variant="outline" className="text-xs">
            {getQuestionTypeName(question.question.type)}
          </Badge>

          {/* Difficulty Badge */}
          <Badge variant="secondary" className="text-xs">
            {getDifficultyName(question.question.difficulty)}
          </Badge>

          {/* Topic Badge */}
          {topic && (
            <Badge variant="default" className="text-xs">
              {topic.name}
            </Badge>
          )}
        </div>

        {/* Question Title */}
        <div className="mt-2">
          {hasTitle ? (
            <p className="line-clamp-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              {question.question.title}
            </p>
          ) : (
            <p className="text-sm italic text-gray-500 dark:text-gray-400">No question text</p>
          )}
        </div>
      </div>

      {/* Points */}
      <div className="flex-shrink-0">
        <div className="text-right">
          <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            {question.points || 0} pts
          </div>
        </div>
      </div>
    </div>
  );
};
