import type { MatchingQuestion, MatchingPair } from '@/features/assignment/types';
import { MarkdownEditor, ImageUploader, DifficultyBadge } from '../shared';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { Badge } from '@/shared/components/ui/badge';
import { Plus, Trash2, ImagePlus, X, Shuffle } from 'lucide-react';
import { generateId } from '@/shared/lib/utils';
import { useTranslation } from 'react-i18next';

interface MatchingEditingProps {
  question: MatchingQuestion;
  onChange: (updated: MatchingQuestion) => void;
  validationErrors?: { errors: string[]; warnings: string[] };
}

export const MatchingEditing = ({ question, onChange, validationErrors }: MatchingEditingProps) => {
  const { t } = useTranslation('assignment', { keyPrefix: 'editing.matching' });
  const { t: tEditing } = useTranslation('assignment', { keyPrefix: 'editing' });

  const updateQuestion = (updates: Partial<MatchingQuestion>) => {
    onChange({ ...question, ...updates });
  };

  const addPair = () => {
    const newPair: MatchingPair = {
      id: generateId(),
      left: '',
      right: '',
    };
    updateQuestion({ data: { ...question.data, pairs: [...question.data.pairs, newPair] } });
  };

  const removePair = (pairId: string) => {
    if (question.data.pairs.length <= 2) {
      alert(t('alerts.minPairs'));
      return;
    }
    updateQuestion({ data: { ...question.data, pairs: question.data.pairs.filter((p) => p.id !== pairId) } });
  };

  const updatePair = (pairId: string, updates: Partial<MatchingPair>) => {
    updateQuestion({
      data: {
        ...question.data,
        pairs: question.data.pairs.map((p) => (p.id === pairId ? { ...p, ...updates } : p)),
      },
    });
  };

  // Validation field flags
  const hasErrors = (validationErrors?.errors.length ?? 0) > 0;
  const titleInvalid = hasErrors && !question.title?.trim();
  const isLeftEmpty = (pair: MatchingPair) => hasErrors && !pair.left?.trim();
  const isRightEmpty = (pair: MatchingPair) => hasErrors && !pair.right?.trim();

  return (
    <div className="space-y-2 p-2">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t('title')}</h3>
        <DifficultyBadge difficulty={question.difficulty} />
      </div>

      {/* Question Title */}
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
              title={t('buttons.removeImage')}
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
              title={t('buttons.addImage')}
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

      {/* Pairs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">
            {t('labels.matchingPairs')}
          </Label>
          {/* Shuffle Pairs */}
          <div className="flex items-center gap-2">
            <Shuffle className="h-3.5 w-3.5 text-gray-500" />
            <Label className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {tEditing('shuffle.shufflePairs')}
            </Label>
            <Switch
              checked={question.data.shufflePairs || false}
              onCheckedChange={(shufflePairs) => updateQuestion({ data: { ...question.data, shufflePairs } })}
            />
          </div>
        </div>

        <div className="space-y-2">
          {question.data.pairs.map((pair, index) => (
            <div key={pair.id} className="space-y-2 rounded-md">
              <div className="mb-2 flex items-center justify-between">
                <Badge variant="secondary">{t('pair', { number: index + 1 })}</Badge>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removePair(pair.id)}
                  disabled={question.data.pairs.length <= 2}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Left Item */}
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">{t('labels.left')}</Label>
                  <div className="group/left relative">
                    <MarkdownEditor
                      value={pair.left}
                      onChange={(left) => updatePair(pair.id, { left })}
                      placeholder={t('placeholders.leftItem')}
                      minHeight={50}
                      className="pr-8"
                      invalid={isLeftEmpty(pair)}
                    />
                    {pair.leftImageUrl == null ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => updatePair(pair.id, { leftImageUrl: '' })}
                        className="absolute right-1 top-1 h-6 w-6 p-0 opacity-0 transition-opacity group-hover/left:opacity-100"
                        title={t('buttons.addImage')}
                      >
                        <ImagePlus className="h-3 w-3" />
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => updatePair(pair.id, { leftImageUrl: undefined })}
                        className="absolute right-1 top-1 h-6 w-6 p-0"
                        title={t('buttons.removeImage')}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  {pair.leftImageUrl != null && (
                    <ImageUploader
                      label=""
                      value={pair.leftImageUrl}
                      onChange={(leftImageUrl) => updatePair(pair.id, { leftImageUrl })}
                    />
                  )}
                </div>

                {/* Right Item */}
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">{t('labels.right')}</Label>
                  <div className="group/right relative">
                    <MarkdownEditor
                      value={pair.right}
                      onChange={(right) => updatePair(pair.id, { right })}
                      placeholder={t('placeholders.rightItem')}
                      minHeight={50}
                      className="pr-8"
                      invalid={isRightEmpty(pair)}
                    />
                    {pair.rightImageUrl == null ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => updatePair(pair.id, { rightImageUrl: '' })}
                        className="absolute right-1 top-1 h-6 w-6 p-0 opacity-0 transition-opacity group-hover/right:opacity-100"
                        title={t('buttons.addImage')}
                      >
                        <ImagePlus className="h-3 w-3" />
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => updatePair(pair.id, { rightImageUrl: undefined })}
                        className="absolute right-1 top-1 h-6 w-6 p-0"
                        title={t('buttons.removeImage')}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  {pair.rightImageUrl != null && (
                    <ImageUploader
                      label=""
                      value={pair.rightImageUrl}
                      onChange={(rightImageUrl) => updatePair(pair.id, { rightImageUrl })}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add Pair button - now below the pairs list, aligned to the left */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addPair}
          disabled={question.data.pairs.length >= 8}
          className="mt-2"
        >
          <Plus className="mr-2 h-4 w-4" />
          {t('buttons.addPair')}
        </Button>
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
        />
      </div>
    </div>
  );
};
