import type { OpenEndedQuestion } from '@aiprimary/core';
import { MarkdownEditor, DifficultyBadge } from '../shared';
import { useQuestionConfig } from '../config';
import { Button } from '@ui/button';
import { Input } from '@ui/input';
import { Label } from '@ui/label';
import { ImagePlus, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface OpenEndedEditingProps {
  question: OpenEndedQuestion;
  onChange: (updated: OpenEndedQuestion) => void;
  validationErrors?: { errors: string[]; warnings: string[] };
}

export const OpenEndedEditing = ({ question, onChange, validationErrors }: OpenEndedEditingProps) => {
  const { t } = useTranslation('questions', { keyPrefix: 'assignmentEditing.openEnded' });
  const { ImageUploader } = useQuestionConfig();

  const updateQuestion = (updates: Partial<OpenEndedQuestion>) => {
    onChange({ ...question, ...updates });
  };

  // Validation field flags
  const hasErrors = (validationErrors?.errors.length ?? 0) > 0;
  const titleInvalid = hasErrors && !question.title?.trim();

  return (
    <div className="space-y-2 p-2">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t('title')}</h3>
        <DifficultyBadge difficulty={question.difficulty} />
      </div>
      {/* Question */}
      <div className="space-y-1">
        <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">{t('labels.question')}</Label>
        <div className="group/title relative">
          <MarkdownEditor
            value={question.title}
            onChange={(title) => updateQuestion({ title })}
            placeholder={t('placeholders.question')}
            className="pr-9"
            invalid={titleInvalid}
          />
          {question.titleImageUrl != null ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => updateQuestion({ titleImageUrl: undefined })}
              title={t('buttons.removeImage', { ns: 'questions', defaultValue: 'Remove Image' })}
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
              title={t('buttons.addImage', { ns: 'questions', defaultValue: 'Add Image' })}
              className="absolute right-1.5 top-1.5 h-7 w-7 p-0 opacity-0 transition-opacity group-hover/title:opacity-100"
            >
              <ImagePlus className="h-4 w-4" />
            </Button>
          )}
        </div>

        {question.titleImageUrl != null && (
          <ImageUploader
            label={t('labels.questionImage')}
            value={question.titleImageUrl}
            onChange={(titleImageUrl) => updateQuestion({ titleImageUrl })}
          />
        )}
      </div>

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
          className="h-8"
        />
      </div>

      {/* Expected Answer */}
      <div className="space-y-1">
        <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
          {t('labels.expectedAnswer')}
        </Label>
        <MarkdownEditor
          value={question.data.expectedAnswer || ''}
          onChange={(expectedAnswer) => updateQuestion({ data: { ...question.data, expectedAnswer } })}
          placeholder={t('placeholders.expectedAnswer')}
          minHeight={80}
        />
      </div>

      {/* Explanation */}
      <div className="space-y-1">
        <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
          {t('labels.explanation')}
        </Label>
        <MarkdownEditor
          value={question.explanation || ''}
          onChange={(explanation) => updateQuestion({ explanation })}
          placeholder={t('placeholders.explanation')}
          minHeight={80}
        />
      </div>
    </div>
  );
};
