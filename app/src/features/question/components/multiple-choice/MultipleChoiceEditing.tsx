import type { MultipleChoiceQuestion, MultipleChoiceOption } from '@/features/assignment/types';
import { MarkdownEditor, ImageUploader, DifficultyBadge } from '../shared';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { Switch } from '@/shared/components/ui/switch';
import { Plus, Trash2, ImagePlus, X, Shuffle } from 'lucide-react';
import { generateId } from '@/shared/lib/utils';
import { useTranslation } from 'react-i18next';

interface MultipleChoiceEditingProps {
  question: MultipleChoiceQuestion;
  onChange: (updated: MultipleChoiceQuestion) => void;
}

export const MultipleChoiceEditing = ({ question, onChange }: MultipleChoiceEditingProps) => {
  const { t } = useTranslation('questions', { keyPrefix: 'multipleChoice.editing' });
  const { t: tQuestions } = useTranslation('questions');

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
      alert(t('validation.minOptions', { ns: 'questions', defaultValue: 'At least 2 options required' }));
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
        <h3 className="text-lg font-semibold">{tQuestions('types.multipleChoice')}</h3>
        <DifficultyBadge difficulty={question.difficulty} />
      </div>

      {/* Question Title */}
      <div className="space-y-1">
        <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">{t('title')}</Label>
        <div className="space-y-2 rounded-md border border-gray-300 bg-white p-2 dark:border-gray-600 dark:bg-gray-900">
          <div className="flex items-center gap-2">
            <MarkdownEditor
              value={question.title}
              onChange={(title) => updateQuestion({ title })}
              placeholder={t('titlePlaceholder')}
              className="flex-1"
            />
            {question.titleImageUrl !== undefined ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => updateQuestion({ titleImageUrl: undefined })}
                title={t('removeImage')}
              >
                <X className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => updateQuestion({ titleImageUrl: '' })}
                title={t('addImage')}
              >
                <ImagePlus className="h-4 w-4" />
              </Button>
            )}
          </div>

          {question.titleImageUrl !== undefined && (
            <ImageUploader
              label={t('questionImage')}
              value={question.titleImageUrl}
              onChange={(titleImageUrl) => updateQuestion({ titleImageUrl })}
            />
          )}
        </div>
      </div>

      {/* Options */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">{t('options')}</Label>
          {/* Shuffle Options */}
          <div className="flex items-center gap-2">
            <Shuffle className="h-3.5 w-3.5 text-gray-500" />
            <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {t('shuffleOptions')}
            </Label>
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
                    placeholder={t('optionPlaceholder', { letter: String.fromCharCode(65 + index) })}
                    minHeight={50}
                    className="flex-1"
                  />
                  {option.imageUrl !== undefined ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => updateOption(option.id, { imageUrl: undefined })}
                      title={t('removeOption')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => updateOption(option.id, { imageUrl: '' })}
                      title={t('imageUrl')}
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
                    label={t('optionImage')}
                    value={option.imageUrl}
                    onChange={(imageUrl) => updateOption(option.id, { imageUrl })}
                  />
                )}
              </div>
            ))}
          </div>
        </RadioGroup>

        {/* Add Option button - now below the options list, aligned to the left */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addOption}
          disabled={question.data.options.length >= 6}
          className="mt-2"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t('addOption')}
        </Button>
      </div>

      {/* Explanation */}
      <div className="space-y-1">
        <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">{t('explanation')}</Label>
        <div className="rounded-md border border-gray-300 bg-white p-2 dark:border-gray-600 dark:bg-gray-900">
          <MarkdownEditor
            value={question.explanation || ''}
            onChange={(explanation) => updateQuestion({ explanation })}
            placeholder={t('explanationPlaceholder')}
          />
        </div>
      </div>
    </div>
  );
};
