import type { MatchingQuestion, MatchingPair } from '../../types';
import { MarkdownEditor, ImageUploader, DifficultyBadge } from '../shared';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { Plus, Trash2, ImagePlus, X, Shuffle } from 'lucide-react';
import { generateId } from '@/shared/lib/utils';
import { useTranslation } from 'react-i18next';

interface MatchingEditingProps {
  question: MatchingQuestion;
  onChange: (updated: MatchingQuestion) => void;
}

export const MatchingEditing = ({ question, onChange }: MatchingEditingProps) => {
  const { t } = useTranslation('assignment', { keyPrefix: 'editing.matching' });

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t('title')}</h3>
        <DifficultyBadge difficulty={question.difficulty} />
      </div>
      {/* Shuffle Pairs */}
      <div className="flex items-center justify-between rounded-lg border p-2">
        <div className="flex items-center gap-2">
          <Shuffle className="h-4 w-4" />
          <Label className="text-sm font-medium">
            {t('shuffle.shufflePairs', { ns: 'assignment', defaultValue: 'Shuffle Pairs' })}
          </Label>
        </div>
        <Switch
          checked={question.data.shufflePairs || false}
          onCheckedChange={(shufflePairs) => updateQuestion({ data: { ...question.data, shufflePairs } })}
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

      {/* Pairs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>{t('labels.matchingPairs')}</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addPair}
            disabled={question.data.pairs.length >= 8}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('buttons.addPair')}
          </Button>
        </div>

        <div className="space-y-2">
          {question.data.pairs.map((pair, index) => (
            <div key={pair.id} className="space-y-2 rounded-md border p-3">
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-semibold">{t('pair', { number: index + 1 })}</h4>
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
                  <div className="flex items-center justify-between">
                    <Label className="text-muted-foreground text-xs">{t('labels.left')}</Label>
                    {pair.leftImageUrl === undefined ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => updatePair(pair.id, { leftImageUrl: '' })}
                        className="h-6 w-6 p-0"
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
                        className="h-6 w-6 p-0"
                        title={t('buttons.removeImage')}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <MarkdownEditor
                    value={pair.left}
                    onChange={(left) => updatePair(pair.id, { left })}
                    placeholder={t('placeholders.leftItem')}
                    minHeight={50}
                  />
                  {pair.leftImageUrl !== undefined && (
                    <ImageUploader
                      label=""
                      value={pair.leftImageUrl}
                      onChange={(leftImageUrl) => updatePair(pair.id, { leftImageUrl })}
                    />
                  )}
                </div>

                {/* Right Item */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-muted-foreground text-xs">{t('labels.right')}</Label>
                    {pair.rightImageUrl === undefined ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => updatePair(pair.id, { rightImageUrl: '' })}
                        className="h-6 w-6 p-0"
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
                        className="h-6 w-6 p-0"
                        title={t('buttons.removeImage')}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <MarkdownEditor
                    value={pair.right}
                    onChange={(right) => updatePair(pair.id, { right })}
                    placeholder={t('placeholders.rightItem')}
                    minHeight={50}
                  />
                  {pair.rightImageUrl !== undefined && (
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
