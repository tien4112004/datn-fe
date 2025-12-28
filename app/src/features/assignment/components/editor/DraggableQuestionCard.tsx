import { useFormContext, useFieldArray } from 'react-hook-form';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Card, CardHeader } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import type { AssignmentFormData } from '../../types';
import { DIFFICULTY_LABELS, QUESTION_TYPE } from '../../types';

interface DraggableQuestionCardProps {
  id: string;
  index: number;
}

export const DraggableQuestionCard = ({ id, index }: DraggableQuestionCardProps) => {
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
  };

  const question = watch(`questions.${index}`);
  const topics = watch('topics');

  const questionTypeLabels: Record<string, string> = {
    [QUESTION_TYPE.MULTIPLE_CHOICE]: 'Multiple Choice',
    [QUESTION_TYPE.MATCHING]: 'Matching',
    [QUESTION_TYPE.OPEN_ENDED]: 'Open Ended',
    [QUESTION_TYPE.FILL_IN_BLANK]: 'Fill in the Blank',
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`transition-all ${isDragging ? 'opacity-50 shadow-2xl' : 'hover:shadow-md'}`}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 p-4">
        <div className="flex flex-1 items-start gap-3">
          {/* Drag handle */}
          <div
            {...attributes}
            {...listeners}
            className="cursor-move rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <GripVertical className="h-5 w-5 text-gray-400" />
          </div>

          <div className="flex-1 space-y-3">
            {/* Question metadata */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{questionTypeLabels[question?.type as string] || 'Unknown'}</Badge>
              <Badge variant="secondary">
                {DIFFICULTY_LABELS[question?.difficulty as keyof typeof DIFFICULTY_LABELS]}
              </Badge>
              <span className="text-xs text-gray-500">Question {index + 1}</span>
            </div>

            {/* Question fields */}
            <div className="grid gap-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <Label htmlFor={`topic-${index}`} className="text-xs">
                    Topic *
                  </Label>
                  <Select
                    value={question?.topicId}
                    onValueChange={(value) => setValue(`questions.${index}.topicId`, value)}
                  >
                    <SelectTrigger id={`topic-${index}`} className="h-9">
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
                  <Label htmlFor={`difficulty-${index}`} className="text-xs">
                    Difficulty
                  </Label>
                  <Select
                    value={question?.difficulty}
                    onValueChange={(value) => setValue(`questions.${index}.difficulty`, value as any)}
                  >
                    <SelectTrigger id={`difficulty-${index}`} className="h-9">
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

              <div>
                <Label htmlFor={`title-${index}`} className="text-xs">
                  Question *
                </Label>
                <Textarea
                  id={`title-${index}`}
                  {...register(`questions.${index}.title`)}
                  placeholder="Enter question text..."
                  rows={2}
                  className="resize-none text-sm"
                />
              </div>

              <div>
                <Label htmlFor={`explanation-${index}`} className="text-xs">
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

              <div className="w-32">
                <Label htmlFor={`points-${index}`} className="text-xs">
                  Points
                </Label>
                <Input
                  id={`points-${index}`}
                  type="number"
                  {...register(`questions.${index}.points`, { valueAsNumber: true })}
                  min={0}
                  className="h-9"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Delete button */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => remove(index)}
          className="text-red-500 hover:bg-red-50 hover:text-red-600"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardHeader>
    </Card>
  );
};
