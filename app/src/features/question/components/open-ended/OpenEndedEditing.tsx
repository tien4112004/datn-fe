import type { OpenEndedQuestion } from '@/features/assignment/types';
import { MarkdownEditor, ImageUploader, DifficultyBadge } from '../shared';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { useTranslation } from 'react-i18next';

interface OpenEndedEditingProps {
  question: OpenEndedQuestion;
  onChange: (updated: OpenEndedQuestion) => void;
}

export const OpenEndedEditing = ({ question, onChange }: OpenEndedEditingProps) => {
  const { t } = useTranslation('assignment', { keyPrefix: 'editing.openEnded' });

  const updateQuestion = (updates: Partial<OpenEndedQuestion>) => {
    onChange({ ...question, ...updates });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t('title')}</h3>
        <DifficultyBadge difficulty={question.difficulty} />
      </div>
      {/* Question */}
      <div className="space-y-1">
        <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">{t('labels.question')}</Label>
        <div className="rounded-md border border-gray-300 bg-white p-2 dark:border-gray-600 dark:bg-gray-900">
          <MarkdownEditor
            value={question.title}
            onChange={(title) => updateQuestion({ title })}
            placeholder={t('placeholders.question')}
          />
        </div>
      </div>

      {/* Question Image */}
      <ImageUploader
        label={t('labels.questionImage')}
        value={question.titleImageUrl}
        onChange={(titleImageUrl) => updateQuestion({ titleImageUrl })}
      />

      {/* Max Length */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {t('labels.maxLength')}
          </Label>
          <span className="text-muted-foreground text-xs">
            {t('maxLengthInfo', { length: question.data.maxLength || 500 })}
          </span>
        </div>
        <Input
          type="number"
          min="0"
          max="5000"
          value={question.data.maxLength || 500}
          onChange={(e) =>
            updateQuestion({ data: { ...question.data, maxLength: parseInt(e.target.value) || 500 } })
          }
          className="h-8 border-gray-300 bg-white dark:border-gray-600 dark:bg-gray-900"
        />
      </div>

      {/* Expected Answer */}
      <div className="space-y-1">
        <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
          {t('labels.expectedAnswer')}
        </Label>
        <div className="rounded-md border border-gray-300 bg-white p-2 dark:border-gray-600 dark:bg-gray-900">
          <MarkdownEditor
            value={question.data.expectedAnswer || ''}
            onChange={(expectedAnswer) => updateQuestion({ data: { ...question.data, expectedAnswer } })}
            placeholder={t('placeholders.expectedAnswer')}
            minHeight={80}
          />
        </div>
      </div>

      {/* Explanation */}
      <div className="space-y-1">
        <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
          {t('labels.explanation')}
        </Label>
        <div className="rounded-md border border-gray-300 bg-white p-2 dark:border-gray-600 dark:bg-gray-900">
          <MarkdownEditor
            value={question.explanation || ''}
            onChange={(explanation) => updateQuestion({ explanation })}
            placeholder={t('placeholders.explanation')}
            minHeight={80}
          />
        </div>
      </div>
    </div>
  );
};
