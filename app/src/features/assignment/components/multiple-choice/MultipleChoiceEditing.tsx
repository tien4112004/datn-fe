import type { MultipleChoiceQuestion, MultipleChoiceOption } from '../../types';
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
  const { t } = useTranslation('assignment', { keyPrefix: 'editing.multipleChoice' });

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
      alert(t('alerts.minOptions'));
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t('title')}</h3>
        <DifficultyBadge difficulty={question.difficulty} />
      </div>
      {/* Shuffle Options */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Shuffle className="h-4 w-4" />
            <Label className="text-base font-medium">
              {t('shuffle.shuffleOptions', { ns: 'assignment', defaultValue: 'Shuffle Options' })}
            </Label>
          </div>
          <div className="text-muted-foreground text-sm">
            {t('shuffle.shuffleOptionsDescription', {
              ns: 'assignment',
              defaultValue: 'Randomize the order of options for each student',
            })}
          </div>
        </div>
        <Switch
          checked={question.data.shuffleOptions || false}
          onCheckedChange={(shuffleOptions) => updateQuestion({ data: { ...question.data, shuffleOptions } })}
        />
      </div>

      {/* Question Title */}
      <div className="space-y-2">
        <Label>{t('labels.question')}</Label>
        <MarkdownEditor
          value={question.title}
          onChange={(title) => updateQuestion({ title })}
          placeholder={t('placeholders.question')}
        />
      </div>

      {/* Question Image */}
      <ImageUploader
        label={t('labels.questionImage')}
        value={question.titleImageUrl}
        onChange={(titleImageUrl) => updateQuestion({ titleImageUrl })}
      />

      {/* Options */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>{t('labels.options')}</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addOption}
            disabled={question.data.options.length >= 6}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('buttons.addOption')}
          </Button>
        </div>

        <RadioGroup value={correctOptionId} onValueChange={markAsCorrect}>
          <div className="space-y-2">
            {question.data.options.map((option, index) => (
              <div key={option.id} className="space-y-2 rounded-md border p-3">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value={option.id} id={`correct-${option.id}`} />
                  <Label htmlFor={`correct-${option.id}`} className="cursor-pointer text-sm font-medium">
                    {String.fromCharCode(65 + index)}
                  </Label>
                  <MarkdownEditor
                    value={option.text}
                    onChange={(text) => updateOption(option.id, { text })}
                    placeholder={t('placeholders.option')}
                    minHeight={50}
                    className="flex-1"
                  />
                  {option.imageUrl !== undefined ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => updateOption(option.id, { imageUrl: undefined })}
                      title={t('buttons.removeImage')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => updateOption(option.id, { imageUrl: '' })}
                      title={t('buttons.addImage')}
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
      </div>

      {/* Explanation */}
      <div className="space-y-2">
        <Label>{t('labels.explanation')}</Label>
        <MarkdownEditor
          value={question.explanation || ''}
          onChange={(explanation) => updateQuestion({ explanation })}
          placeholder={t('placeholders.explanation')}
        />
      </div>
    </div>
  );
};
