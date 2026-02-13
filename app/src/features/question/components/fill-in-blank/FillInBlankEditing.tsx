import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { FillInBlankQuestion, BlankSegment } from '@/features/assignment/types';
import { ImageUploader, ExplanationSection } from '../shared';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { Textarea } from '@/shared/components/ui/textarea';
import { ImagePlus, X } from 'lucide-react';
import { generateId } from '@/shared/lib/utils';

interface FillInBlankEditingProps {
  question: FillInBlankQuestion;
  onChange: (updated: FillInBlankQuestion) => void;
  validationErrors?: { errors: string[]; warnings: string[] };
}

// Parse text with {{}} syntax into segments
// Supports alternative answers: {{answer1|alternative2|alternative3}}
const parseQuestionText = (text: string): BlankSegment[] => {
  const segments: BlankSegment[] = [];
  const regex = /\{\{([^}]+)\}\}/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(text)) !== null) {
    // Add text segment before the blank
    if (match.index > lastIndex) {
      const textContent = text.substring(lastIndex, match.index);
      if (textContent) {
        segments.push({
          id: generateId(),
          type: 'text',
          content: textContent,
        });
      }
    }

    // Parse alternatives from the blank content (e.g., "answer1|alternative2|alternative3")
    const blankContent = match[1].trim();
    const alternatives = blankContent
      .split('|')
      .map((alt) => alt.trim())
      .filter((alt) => alt);

    // First alternative becomes the primary content, rest become acceptableAnswers
    const primaryAnswer = alternatives[0] || '';
    const acceptableAnswers = alternatives.slice(1);

    // Add blank segment
    segments.push({
      id: generateId(),
      type: 'blank',
      content: primaryAnswer,
      acceptableAnswers: acceptableAnswers,
    });

    lastIndex = regex.lastIndex;
  }

  // Add remaining text after last blank
  if (lastIndex < text.length) {
    const textContent = text.substring(lastIndex);
    if (textContent) {
      segments.push({
        id: generateId(),
        type: 'text',
        content: textContent,
      });
    }
  }

  return segments.length > 0 ? segments : [{ id: generateId(), type: 'text', content: text }];
};

// Convert segments back to text with {{}} syntax
// Includes alternative answers: {{answer1|alternative2|alternative3}}
const segmentsToText = (segments: BlankSegment[]): string => {
  return segments
    .map((seg) => {
      if (seg.type === 'text') {
        return seg.content;
      } else {
        // Include acceptable answers in the syntax if they exist
        const alternatives =
          seg.acceptableAnswers && seg.acceptableAnswers.length > 0
            ? seg.acceptableAnswers.filter((alt) => alt.trim()).join('|')
            : '';
        const allAnswers = alternatives ? `${seg.content}|${alternatives}` : seg.content;
        return `{{${allAnswers}}}`;
      }
    })
    .join('');
};

export const FillInBlankEditing = ({ question, onChange, validationErrors }: FillInBlankEditingProps) => {
  const { t } = useTranslation('questions');
  const [questionText, setQuestionText] = useState(() => segmentsToText(question.data.segments));

  const updateQuestion = (updates: Partial<FillInBlankQuestion>) => {
    onChange({ ...question, ...updates });
  };

  const handleQuestionTextChange = (text: string) => {
    setQuestionText(text);
    const newSegments = parseQuestionText(text);
    updateQuestion({ data: { ...question.data, segments: newSegments } });
  };

  // Get only blank segments for alternative answers section
  const blankSegments = question.data.segments.filter((s) => s.type === 'blank');

  // Validation field flags
  const hasErrors = (validationErrors?.errors.length ?? 0) > 0;
  const titleInvalid = hasErrors && !question.title?.trim();
  const segmentsInvalid =
    hasErrors && (blankSegments.length === 0 || blankSegments.some((b) => !b.content?.trim()));

  return (
    <div className="space-y-4 p-2">
      {/* Title */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">{t('fillInBlank.editing.title')}</Label>
        <div className="group/title relative">
          <Input
            value={question.title}
            onChange={(e) => updateQuestion({ title: e.target.value })}
            placeholder={t('fillInBlank.editing.titlePlaceholder')}
            className="h-9 pr-9"
            aria-invalid={titleInvalid}
          />
          {question.titleImageUrl != null ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => updateQuestion({ titleImageUrl: undefined })}
              title={t('fillInBlank.editing.removeImage', { defaultValue: 'Remove Image' })}
              className="absolute right-1.5 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => updateQuestion({ titleImageUrl: '' })}
              title={t('fillInBlank.editing.addImage', { defaultValue: 'Add Image' })}
              className="absolute right-1.5 top-1/2 h-7 w-7 -translate-y-1/2 p-0 opacity-0 transition-opacity group-hover/title:opacity-100"
            >
              <ImagePlus className="h-4 w-4" />
            </Button>
          )}
        </div>

        {question.titleImageUrl != null && (
          <ImageUploader
            label={t('fillInBlank.editing.questionImage')}
            value={question.titleImageUrl}
            onChange={(titleImageUrl) => updateQuestion({ titleImageUrl })}
          />
        )}
      </div>

      {/* Question Text with {{}} syntax */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">{t('fillInBlank.editing.questionText')}</Label>
          <div className="flex items-center gap-2">
            <Label htmlFor="case-sensitive" className="text-muted-foreground cursor-pointer text-xs">
              {t('fillInBlank.editing.caseSensitive')}
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
        <Textarea
          value={questionText}
          onChange={(e) => handleQuestionTextChange(e.target.value)}
          placeholder={t('fillInBlank.editing.questionTextPlaceholder')}
          className="min-h-[100px] font-mono text-sm"
          aria-invalid={segmentsInvalid}
        />
        <p className="text-xs text-gray-500">
          {t('fillInBlank.editing.questionTextInstruction')} {t('fillInBlank.editing.questionTextExample')}
          <br />
          {t('fillInBlank.editing.alternativesSyntax', {
            defaultValue: 'Use | to separate alternatives: {{answer1|alternative2|alternative3}}',
          })}
        </p>
      </div>

      {/* Preview */}
      {blankSegments.length > 0 && (
        <div className="bg-muted/50 rounded-lg border p-4">
          <p className="mb-2 text-sm font-medium">{t('fillInBlank.editing.preview')}</p>
          <div className="text-sm">
            {question.data.segments.map((segment) => (
              <span key={segment.id}>
                {segment.type === 'text' ? (
                  segment.content
                ) : (
                  <span className="mx-1 inline-block min-w-[100px] border-b-2 border-dashed border-blue-400 px-2 text-transparent">
                    {t('fillInBlank.editing.previewBlank')}
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Alternative Answers Display (Read-Only) */}
      {blankSegments.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">{t('fillInBlank.editing.alternativeAnswers')}</Label>
          <p className="text-muted-foreground text-xs">
            {t('fillInBlank.editing.alternativeAnswersHint', {
              defaultValue: 'Alternatives are parsed from your question text using | syntax',
            })}
          </p>

          {blankSegments.map((segment, index) => (
            <div key={segment.id} className="bg-muted/50 space-y-2 rounded-lg border p-3">
              <Label className="text-sm font-medium">
                {t('fillInBlank.editing.blankLabel', { index: index + 1 })}{' '}
                <span className="font-mono text-blue-600">{segment.content}</span>
              </Label>

              {(segment.acceptableAnswers || []).length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {segment.acceptableAnswers!.map((alt, altIndex) => (
                    <span
                      key={altIndex}
                      className="inline-flex items-center rounded-md bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                    >
                      {alt}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-xs italic">
                  {t('fillInBlank.editing.noAlternatives', {
                    defaultValue: 'No alternative answers',
                  })}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Explanation */}
      <ExplanationSection
        mode="editing"
        explanation={question.explanation}
        onChange={(explanation) => updateQuestion({ explanation })}
      />
    </div>
  );
};
