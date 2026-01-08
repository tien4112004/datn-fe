import { useState } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, ChevronDown } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import type { AssignmentFormData } from '../../types';
import { DIFFICULTY_LABELS, QUESTION_TYPE } from '../../types';
import { QuestionRenderer } from '../QuestionRenderer';
import { useAssignmentEditorStore } from '../../stores/useAssignmentEditorStore';
import { VIEW_MODE, type Question } from '@aiprimary/core';

interface DraggableQuestionCardProps {
  id: string;
  index: number;
}

export const DraggableQuestionCard = ({ id, index }: DraggableQuestionCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { register, watch, setValue, control } = useFormContext<AssignmentFormData>();
  const { remove } = useFieldArray({
    control,
    name: 'questions',
  });

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `question-${id}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    willChange: isDragging ? 'transform' : 'auto',
  } as const;

  const question = watch(`questions.${index}`);
  const topics = watch('topics');

  const questionViewModes = useAssignmentEditorStore((state) => state.questionViewModes);
  const viewMode = questionViewModes.get(question?.id || '') || VIEW_MODE.EDITING;

  // Safety check - if question is not loaded yet, show debug state
  if (!question) {
    return (
      <div className="rounded-lg border-2 border-red-500 bg-white p-4 dark:bg-red-950/20">
        <div className="text-sm font-semibold text-red-600 dark:text-red-400">
          Question {index + 1} - Data Missing (Debug)
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400">Field ID: {id}</div>
      </div>
    );
  }

  const questionTypeLabels: Record<string, string> = {
    [QUESTION_TYPE.MULTIPLE_CHOICE]: 'Multiple Choice',
    [QUESTION_TYPE.MATCHING]: 'Matching',
    [QUESTION_TYPE.OPEN_ENDED]: 'Open Ended',
    [QUESTION_TYPE.FILL_IN_BLANK]: 'Fill in the Blank',
  };

  const handleQuestionChange = (updatedQuestion: Question) => {
    // Sync back to form - merge the updated question data
    setValue(`questions.${index}`, {
      ...question,
      ...updatedQuestion,
    });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg bg-white shadow-sm dark:bg-gray-800 ${isDragging ? 'opacity-50 shadow-2xl' : 'border border-gray-200 hover:shadow-md dark:border-gray-700'}`}
    >
      {/* Header */}
      <div className="flex flex-row items-center justify-between gap-3 px-4 py-3 text-gray-900 dark:text-gray-100">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {/* Drag handle */}
          <div
            {...attributes}
            {...listeners}
            className="flex-shrink-0 cursor-move rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <GripVertical className="h-5 w-5 text-gray-400" />
          </div>

          {/* Question number and metadata */}
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <span className="whitespace-nowrap text-sm font-semibold">Q{index + 1}</span>
            <Badge variant="outline" className="text-xs">
              {questionTypeLabels[question.type as string] || 'Unknown'}
            </Badge>
            {question.difficulty && (
              <Badge variant="secondary" className="text-xs">
                {DIFFICULTY_LABELS[question.difficulty as keyof typeof DIFFICULTY_LABELS]}
              </Badge>
            )}
          </div>
        </div>

        {/* Expand and Delete buttons */}
        <div className="flex flex-shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => remove(index)}
            className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content: Question Details - Collapsible */}
      {isExpanded && (
        <div className="space-y-4 border-t border-gray-200 px-4 py-4 text-gray-900 dark:border-gray-700 dark:text-gray-100">
          {/* Topic and Difficulty selects */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor={`topic-${index}`} className="mb-1.5 block text-xs font-medium">
                Topic *
              </Label>
              <Select
                value={question.topicId}
                onValueChange={(value) => setValue(`questions.${index}.topicId`, value)}
              >
                <SelectTrigger id={`topic-${index}`} className="h-9 text-sm">
                  <SelectValue placeholder="Select topic" />
                </SelectTrigger>
                <SelectContent>
                  {topics.map((topic) => (
                    <SelectItem key={topic.id} value={topic.id}>
                      {topic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor={`difficulty-${index}`} className="mb-1.5 block text-xs font-medium">
                Difficulty
              </Label>
              <Select
                value={question.difficulty}
                onValueChange={(value) => setValue(`questions.${index}.difficulty`, value as any)}
              >
                <SelectTrigger id={`difficulty-${index}`} className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(DIFFICULTY_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Question Title */}
          <div>
            <Label htmlFor={`title-${index}`} className="mb-1.5 block text-xs font-medium">
              Question Title *
            </Label>
            <Textarea
              id={`title-${index}`}
              {...register(`questions.${index}.title`)}
              placeholder="Enter question text..."
              rows={2}
              className="resize-none text-sm"
            />
          </div>

          {/* QuestionRenderer for type-specific content */}
          <div className="rounded-md bg-gray-50 p-3 dark:bg-gray-700/50">
            <QuestionRenderer
              question={question as Question}
              viewMode={viewMode}
              onChange={handleQuestionChange}
            />
          </div>

          {/* Explanation and Points */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label htmlFor={`explanation-${index}`} className="mb-1.5 block text-xs font-medium">
                Explanation (optional)
              </Label>
              <Textarea
                id={`explanation-${index}`}
                {...register(`questions.${index}.explanation`)}
                placeholder="Provide an explanation or answer key..."
                rows={2}
                className="resize-none text-sm"
              />
            </div>

            <div>
              <Label htmlFor={`points-${index}`} className="mb-1.5 block text-xs font-medium">
                Points
              </Label>
              <Input
                id={`points-${index}`}
                type="number"
                {...register(`questions.${index}.points`, { valueAsNumber: true })}
                min={0}
                className="h-9 text-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* Collapsed view - Show quick preview */}
      {!isExpanded && (
        <div className="border-t border-gray-200 px-4 py-3 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-gray-900 dark:text-gray-100">
                {question.title || <span className="italic text-gray-400">No question text</span>}
              </p>
            </div>
            {question.points && (
              <span className="flex-shrink-0 whitespace-nowrap font-medium text-gray-900 dark:text-gray-100">
                {question.points} pts
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
