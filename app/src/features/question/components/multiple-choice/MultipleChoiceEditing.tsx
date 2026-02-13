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
  validationErrors?: { errors: string[]; warnings: string[] };
}

export const MultipleChoiceEditing = ({
  question,
  onChange,
  validationErrors,
}: MultipleChoiceEditingProps) => {
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

  // Validation field flags
  const hasErrors = (validationErrors?.errors.length ?? 0) > 0;
  const titleInvalid = hasErrors && !question.title?.trim();
  const isOptionEmpty = (option: MultipleChoiceOption) => hasErrors && !option.text?.trim();

  return (
    <div className="space-y-2 p-2">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{tQuestions('types.multipleChoice')}</h3>
        <DifficultyBadge difficulty={question.difficulty} />
      </div>

      {/* Question Title */}
      <div className="space-y-1">
        <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">{t('title')}</Label>
        <div className="group/title relative">
          <MarkdownEditor
            value={question.title}
            onChange={(title) => updateQuestion({ title })}
            placeholder={t('titlePlaceholder')}
            className="pr-9"
            invalid={titleInvalid}
          />
          {question.titleImageUrl != null ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => updateQuestion({ titleImageUrl: undefined })}
              title={t('removeImage')}
              className="absolute right-1.5 top-1.5 h-7 w-7 p-0"
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
              className="absolute right-1.5 top-1.5 h-7 w-7 p-0 opacity-0 transition-opacity group-hover/title:opacity-100"
            >
              <ImagePlus className="h-4 w-4" />
            </Button>
          )}
        </div>

        {question.titleImageUrl != null && (
          <ImageUploader
            label={t('questionImage')}
            value={question.titleImageUrl}
            onChange={(titleImageUrl) => updateQuestion({ titleImageUrl })}
          />
        )}
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
              <div key={option.id} className="space-y-2 rounded-md p-2">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value={option.id} id={`correct-${option.id}`} />
                  <Label htmlFor={`correct-${option.id}`} className="cursor-pointer text-sm font-medium">
                    {String.fromCharCode(65 + index)}
                  </Label>
                  <div className="group/option relative flex-1">
                    <MarkdownEditor
                      value={option.text}
                      onChange={(text) => updateOption(option.id, { text })}
                      placeholder={t('optionPlaceholder', { letter: String.fromCharCode(65 + index) })}
                      minHeight={50}
                      className="pr-9"
                      invalid={isOptionEmpty(option)}
                    />
                    {option.imageUrl != null ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => updateOption(option.id, { imageUrl: undefined })}
                        title={t('removeOption')}
                        className="absolute right-1.5 top-1.5 h-7 w-7 p-0"
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
                        className="absolute right-1.5 top-1.5 h-7 w-7 p-0 opacity-0 transition-opacity group-hover/option:opacity-100"
                      >
                        <ImagePlus className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
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

                {option.imageUrl != null && (
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
        <MarkdownEditor
          value={question.explanation || ''}
          onChange={(explanation) => updateQuestion({ explanation })}
          placeholder={t('explanationPlaceholder')}
        />
      </div>
    </div>
  );
};
