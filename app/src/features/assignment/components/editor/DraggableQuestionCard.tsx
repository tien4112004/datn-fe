import { useState } from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, ChevronDown } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { useTranslation } from 'react-i18next';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Badge } from '@/shared/components/ui/badge';
import type { AssignmentFormData } from '../../types';
import { DIFFICULTY_LABELS } from '../../types';
import { QuestionRenderer } from '@/features/question';
import { useAssignmentEditorStore } from '../../stores/useAssignmentEditorStore';
import { VIEW_MODE, type Question, getQuestionTypeName } from '@aiprimary/core';

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

  const assignmentQuestion = watch(`questions.${index}`);
  const topics = watch('topics');

  // Extract question and points from assignment question structure
  const question = assignmentQuestion?.question;
  const points = assignmentQuestion?.points || 0;

  const questionViewModes = useAssignmentEditorStore((state) => state.questionViewModes);
  const viewMode = questionViewModes.get(question?.id || '') || VIEW_MODE.EDITING;
  const { t } = useTranslation('assignment');

  // Safety check - if question is not loaded yet, show debug state
  if (!assignmentQuestion || !question) {
    return (
      <div className="rounded-lg border-2 border-red-500 bg-white p-4 dark:bg-red-950/20">
        <div className="text-sm font-semibold text-red-600 dark:text-red-400">
          {t('collection.item.dataMissingTitle', { number: index + 1 })}
        </div>
        <div className="text-xs text-gray-600 dark:text-gray-400">
          {t('collection.item.dataMissingFieldId', { id })}
        </div>
      </div>
    );
  }

  const handleQuestionChange = (updatedQuestion: Question) => {
    // Sync back to form - merge the updated question data
    setValue(`questions.${index}`, {
      ...assignmentQuestion,
      question: {
        ...question,
        ...updatedQuestion,
      },
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
              {getQuestionTypeName(question.type)}
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
            onClick={() => {
              if (question) {
                const confirmMessage = t('collection.item.removeQuestionConfirm', {
                  type: getQuestionTypeName(question.type),
                });
                if (window.confirm(confirmMessage)) {
                  remove(index);
                }
              }
            }}
            className="text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content: Question Details - Collapsible */}
      {isExpanded && (
        <div className="space-y-2 border-t border-gray-200 bg-gray-50/50 px-4 py-3 text-gray-900 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-100">
          {/* Topic, Difficulty, and Points in single horizontal row */}
          <div className="grid gap-2 sm:grid-cols-3">
            <div>
              <Label
                htmlFor={`topic-${index}`}
                className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300"
              >
                {t('collection.item.topicLabel')}
              </Label>
              <Select
                value={question.topicId}
                onValueChange={(value) => setValue(`questions.${index}.question.topicId`, value)}
              >
                <SelectTrigger
                  id={`topic-${index}`}
                  className="h-9 border-gray-300 bg-white text-sm dark:border-gray-600 dark:bg-gray-900"
                >
                  <SelectValue placeholder={t('collection.item.selectTopicPlaceholder') as string} />
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
              <Label
                htmlFor={`difficulty-${index}`}
                className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300"
              >
                {t('collection.item.difficultyLabel')}
              </Label>
              <Select
                value={question.difficulty}
                onValueChange={(value) => setValue(`questions.${index}.question.difficulty`, value as any)}
              >
                <SelectTrigger
                  id={`difficulty-${index}`}
                  className="h-9 border-gray-300 bg-white text-sm dark:border-gray-600 dark:bg-gray-900"
                >
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

            <div>
              <Label
                htmlFor={`points-${index}`}
                className="mb-1 block text-xs font-medium text-gray-700 dark:text-gray-300"
              >
                {t('collection.item.pointsLabel')}
              </Label>
              <Input
                id={`points-${index}`}
                type="number"
                {...register(`questions.${index}.points`, { valueAsNumber: true })}
                min={0}
                className="h-9 border-gray-300 bg-white text-sm dark:border-gray-600 dark:bg-gray-900"
              />
            </div>
          </div>

          {/* QuestionRenderer for type-specific content */}
          <div className="rounded-md bg-gray-50 p-3 dark:bg-gray-700/50">
            <QuestionRenderer
              question={question as Question}
              viewMode={viewMode}
              points={points}
              onChange={handleQuestionChange}
            />
          </div>
        </div>
      )}

      {/* Collapsed view - Show quick preview */}
      {!isExpanded && (
        <div className="border-t border-gray-200 px-4 py-3 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-400">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-gray-900 dark:text-gray-100">
                {question.title || (
                  <span className="italic text-gray-400">{t('collection.item.noQuestionText')}</span>
                )}
              </p>
            </div>
            {points > 0 && (
              <span className="flex-shrink-0 whitespace-nowrap font-medium text-gray-900 dark:text-gray-100">
                {t('collection.item.pointsShort', { points })}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
