import { useFormContext, useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import type { AssignmentFormData } from '../../types';
import { DIFFICULTY } from '../../types';
import { generateId, createMatrixCellsForTopic } from '../../utils';

export const TopicManager = () => {
  const { control, register, watch } = useFormContext<AssignmentFormData>();
  const {
    fields: topicFields,
    append: appendTopic,
    remove: removeTopic,
  } = useFieldArray({
    control,
    name: 'topics',
  });

  const { append: appendMatrixCell, remove: removeMatrixCell } = useFieldArray({
    control,
    name: 'matrixCells',
  });

  const matrixCells = watch('matrixCells');

  const handleAddTopic = () => {
    const newTopicId = generateId();

    // Add the topic
    appendTopic({
      id: newTopicId,
      name: '',
      description: '',
    });

    // Create matrix cells for all difficulties
    const difficulties = [DIFFICULTY.EASY, DIFFICULTY.MEDIUM, DIFFICULTY.HARD, DIFFICULTY.SUPER_HARD];
    const newCells = createMatrixCellsForTopic(newTopicId, difficulties);

    newCells.forEach((cell) => appendMatrixCell(cell));
  };

  const handleRemoveTopic = (index: number, topicId: string) => {
    // Find indices of matrix cells for this topic
    const cellIndices = matrixCells
      .map((cell: any, idx: number) => (cell.topicId === topicId ? idx : -1))
      .filter((idx: number) => idx !== -1)
      .reverse(); // Remove from end to start to maintain correct indices

    // Remove matrix cells
    cellIndices.forEach((cellIdx) => removeMatrixCell(cellIdx));

    // Remove topic
    removeTopic(index);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold">Topics</Label>
        <Button type="button" size="sm" variant="outline" onClick={handleAddTopic}>
          <Plus className="mr-1 h-3 w-3" />
          Add Topic
        </Button>
      </div>

      <div className="space-y-2">
        {topicFields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-2">
            <Input {...register(`topics.${index}.name`)} placeholder="Topic name..." className="text-sm" />
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => handleRemoveTopic(index, field.id)}
              className="text-red-500 hover:bg-red-50 hover:text-red-600"
              disabled={topicFields.length === 1}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};
