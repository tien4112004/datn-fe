import type { FillInBlankQuestion, BlankSegment } from '../../types';
import { MarkdownEditor, ImageUploader, DifficultyBadge } from '../shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { Badge } from '@/shared/components/ui/badge';
import { Plus, Trash2, FileText, FilePlus2 } from 'lucide-react';
import { generateId } from '@/shared/lib/utils';
import { useTranslation } from 'react-i18next';

interface FillInBlankEditingProps {
  question: FillInBlankQuestion;
  onChange: (updated: FillInBlankQuestion) => void;
}

export const FillInBlankEditing = ({ question, onChange }: FillInBlankEditingProps) => {
  const { t } = useTranslation('assignment', { keyPrefix: 'editing.fillInBlank' });

  const updateQuestion = (updates: Partial<FillInBlankQuestion>) => {
    onChange({ ...question, ...updates });
  };

  const addTextSegment = () => {
    const newSegment: BlankSegment = {
      id: generateId(),
      type: 'text',
      content: '',
    };
    updateQuestion({ data: { ...question.data, segments: [...question.data.segments, newSegment] } });
  };

  const addBlankSegment = () => {
    const newSegment: BlankSegment = {
      id: generateId(),
      type: 'blank',
      content: '',
      acceptableAnswers: [],
    };
    updateQuestion({ data: { ...question.data, segments: [...question.data.segments, newSegment] } });
  };

  const removeSegment = (segmentId: string) => {
    if (question.data.segments.length <= 1) {
      alert(t('alerts.minSegments'));
      return;
    }
    updateQuestion({
      data: { ...question.data, segments: question.data.segments.filter((s) => s.id !== segmentId) },
    });
  };

  const updateSegment = (segmentId: string, updates: Partial<BlankSegment>) => {
    updateQuestion({
      data: {
        ...question.data,
        segments: question.data.segments.map((s) => (s.id === segmentId ? { ...s, ...updates } : s)),
      },
    });
  };

  const addAcceptableAnswer = (segmentId: string) => {
    const segment = question.data.segments.find((s) => s.id === segmentId);
    if (!segment || segment.type !== 'blank') return;

    updateSegment(segmentId, {
      acceptableAnswers: [...(segment.acceptableAnswers || []), ''],
    });
  };

  const updateAcceptableAnswer = (segmentId: string, index: number, value: string) => {
    const segment = question.data.segments.find((s) => s.id === segmentId);
    if (!segment || segment.type !== 'blank') return;

    const updated = [...(segment.acceptableAnswers || [])];
    updated[index] = value;
    updateSegment(segmentId, { acceptableAnswers: updated });
  };

  const removeAcceptableAnswer = (segmentId: string, index: number) => {
    const segment = question.data.segments.find((s) => s.id === segmentId);
    if (!segment || segment.type !== 'blank') return;

    const updated = [...(segment.acceptableAnswers || [])];
    updated.splice(index, 1);
    updateSegment(segmentId, { acceptableAnswers: updated });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{t('title')}</CardTitle>
          <DifficultyBadge difficulty={question.difficulty} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Title & Case Sensitive */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">{t('labels.title')}</Label>
            <div className="flex items-center gap-2">
              <Label htmlFor="case-sensitive" className="text-muted-foreground cursor-pointer text-xs">
                {t('labels.caseSensitive')}
              </Label>
              <Switch
                id="case-sensitive"
                checked={question.data.caseSensitive || false}
                onCheckedChange={(caseSensitive) =>
                  updateQuestion({ data: { ...question.data, caseSensitive } })
                }
              />
            </div>
          </div>
          <Input
            value={question.title}
            onChange={(e) => updateQuestion({ title: e.target.value })}
            placeholder={t('placeholders.title')}
            className="h-8"
          />
        </div>

        {/* Title Image */}
        <ImageUploader
          label={t('labels.titleImage')}
          value={question.titleImageUrl}
          onChange={(titleImageUrl) => updateQuestion({ titleImageUrl })}
        />

        {/* Segments */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>{t('labels.questionSegments')}</Label>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={addTextSegment}>
                <FileText className="mr-2 h-4 w-4" />
                {t('buttons.addText')}
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={addBlankSegment}>
                <FilePlus2 className="mr-2 h-4 w-4" />
                {t('buttons.addBlank')}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {question.data.segments.map((segment, index) => (
              <div key={segment.id} className="space-y-2 rounded-md border p-2">
                <div className="flex items-center gap-2">
                  <Badge variant={segment.type === 'text' ? 'secondary' : 'default'} className="text-xs">
                    {segment.type === 'text' ? t('segmentTypes.text') : t('segmentTypes.blank')} #{index + 1}
                  </Badge>
                  {segment.type === 'text' ? (
                    <Input
                      value={segment.content}
                      onChange={(e) => updateSegment(segment.id, { content: e.target.value })}
                      placeholder={t('placeholders.text')}
                      className="h-8 flex-1 font-mono"
                    />
                  ) : (
                    <Input
                      value={segment.content}
                      onChange={(e) => updateSegment(segment.id, { content: e.target.value })}
                      placeholder={t('placeholders.correctAnswer')}
                      className="h-8 flex-1 font-mono"
                    />
                  )}
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeSegment(segment.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {segment.type === 'blank' && (
                  <div className="ml-16 space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-muted-foreground text-xs">
                        {t('labels.alternativeAnswers')}
                      </Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => addAcceptableAnswer(segment.id)}
                        className="h-6 text-xs"
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        {t('buttons.add')}
                      </Button>
                    </div>
                    {(segment.acceptableAnswers || []).map((alt, altIndex) => (
                      <div key={altIndex} className="flex gap-1">
                        <Input
                          value={alt}
                          onChange={(e) => updateAcceptableAnswer(segment.id, altIndex, e.target.value)}
                          placeholder={t('placeholders.alternative')}
                          className="h-7 font-mono text-xs"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeAcceptableAnswer(segment.id, altIndex)}
                          className="h-7 w-7 p-0"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Preview */}
          <div className="bg-muted/50 rounded-md p-4">
            <p className="mb-2 text-sm font-medium">{t('labels.preview')}</p>
            <div className="font-mono text-sm">
              {question.data.segments.map((segment) => (
                <span key={segment.id}>
                  {segment.type === 'text' ? (
                    segment.content
                  ) : (
                    <span className="border-primary mx-1 inline-block min-w-[100px] border-b-2 border-dashed px-2">
                      _________
                    </span>
                  )}
                </span>
              ))}
            </div>
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
      </CardContent>
    </Card>
  );
};
