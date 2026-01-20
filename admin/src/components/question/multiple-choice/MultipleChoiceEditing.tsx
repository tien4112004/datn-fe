import type { MultipleChoiceQuestion, MultipleChoiceOption } from '@/types/questionBank';
import { MarkdownEditor, ImageUploader, DifficultyBadge } from '../shared';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Plus, Trash2, ImagePlus, X, Shuffle } from 'lucide-react';
import { generateId } from '@/lib/utils';

interface MultipleChoiceEditingProps {
  question: MultipleChoiceQuestion;
  onChange: (updated: MultipleChoiceQuestion) => void;
}

export const MultipleChoiceEditing = ({ question, onChange }: MultipleChoiceEditingProps) => {
  const updateQuestion = (updates: Partial<MultipleChoiceQuestion>) => {
    onChange({ ...question, ...updates });
  };

  const addOption = () => {
    const newOption: MultipleChoiceOption = {
      id: generateId(),
      text: '',
      isCorrect: false,
    };
    updateQuestion({ data: { ...question.data, options: [...question.data.options, newOption] } });
  };

  const removeOption = (optionId: string) => {
    if (question.data.options.length <= 2) {
      alert('At least 2 options required');
      return;
    }
    updateQuestion({
      data: { ...question.data, options: question.data.options.filter((o) => o.id !== optionId) },
    });
  };

  const updateOption = (optionId: string, updates: Partial<MultipleChoiceOption>) => {
    updateQuestion({
      data: {
        ...question.data,
        options: question.data.options.map((o) => (o.id === optionId ? { ...o, ...updates } : o)),
      },
    });
  };

  const markAsCorrect = (optionId: string) => {
    updateQuestion({
      data: {
        ...question.data,
        options: question.data.options.map((o) => ({
          ...o,
          isCorrect: o.id === optionId,
        })),
      },
    });
  };

  const correctOptionId = question.data.options.find((o) => o.isCorrect)?.id || '';

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Multiple Choice</h3>
        <DifficultyBadge difficulty={question.difficulty} />
      </div>

      {/* Question Title */}
      <div className="space-y-1">
        <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Question Title</Label>
        <div className="space-y-2 rounded-md border border-gray-300 bg-white p-2 dark:border-gray-600 dark:bg-gray-900">
          <div className="flex items-center gap-2">
            <MarkdownEditor
              value={question.title}
              onChange={(title) => updateQuestion({ title })}
              placeholder="Enter question title..."
              className="flex-1"
            />
            {question.titleImageUrl !== undefined ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => updateQuestion({ titleImageUrl: undefined })}
                title="Remove image"
              >
                <X className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => updateQuestion({ titleImageUrl: '' })}
                title="Add image"
              >
                <ImagePlus className="h-4 w-4" />
              </Button>
            )}
          </div>

          {question.titleImageUrl !== undefined && (
            <ImageUploader
              label="Question Image"
              value={question.titleImageUrl}
              onChange={(titleImageUrl) => updateQuestion({ titleImageUrl })}
            />
          )}
        </div>
      </div>

      {/* Options */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Options</Label>
          {/* Shuffle Options */}
          <div className="flex items-center gap-2">
            <Shuffle className="h-3.5 w-3.5 text-gray-500" />
            <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">Shuffle Options</Label>
            <Switch
              checked={question.data.shuffleOptions || false}
              onCheckedChange={(shuffleOptions) =>
                updateQuestion({ data: { ...question.data, shuffleOptions } })
              }
            />
          </div>
        </div>

        <RadioGroup value={correctOptionId} onValueChange={markAsCorrect}>
          <div className="space-y-2">
            {question.data.options.map((option, index) => (
              <div
                key={option.id}
                className="space-y-2 rounded-md border border-gray-300 bg-white p-2 dark:border-gray-600 dark:bg-gray-900"
              >
                <div className="flex items-center gap-2">
                  <RadioGroupItem value={option.id} id={`correct-${option.id}`} />
                  <Label htmlFor={`correct-${option.id}`} className="cursor-pointer text-sm font-medium">
                    {String.fromCharCode(65 + index)}
                  </Label>
                  <MarkdownEditor
                    value={option.text}
                    onChange={(text) => updateOption(option.id, { text })}
                    placeholder={`Option ${String.fromCharCode(65 + index)}...`}
                    minHeight={50}
                    className="flex-1"
                  />
                  {option.imageUrl !== undefined ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => updateOption(option.id, { imageUrl: undefined })}
                      title="Remove image"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => updateOption(option.id, { imageUrl: '' })}
                      title="Add image"
                    >
                      <ImagePlus className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeOption(option.id)}
                    disabled={question.data.options.length <= 2}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {option.imageUrl !== undefined && (
                  <ImageUploader
                    label="Option Image"
                    value={option.imageUrl}
                    onChange={(imageUrl) => updateOption(option.id, { imageUrl })}
                  />
                )}
              </div>
            ))}
          </div>
        </RadioGroup>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addOption}
          disabled={question.data.options.length >= 6}
          className="mt-2"
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Option
        </Button>
      </div>

      {/* Explanation */}
      <div className="space-y-1">
        <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Explanation</Label>
        <div className="rounded-md border border-gray-300 bg-white p-2 dark:border-gray-600 dark:bg-gray-900">
          <MarkdownEditor
            value={question.explanation || ''}
            onChange={(explanation) => updateQuestion({ explanation })}
            placeholder="Explain the correct answer..."
          />
        </div>
      </div>
    </div>
  );
};
