import { useState, useEffect } from 'react';
import type { FillInBlankQuestion, BlankSegment } from '@/features/assignment/types';
import { MarkdownEditor, ImageUploader } from '../shared';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import { Textarea } from '@/shared/components/ui/textarea';
import { Plus, Trash2 } from 'lucide-react';
import { generateId } from '@/shared/lib/utils';
import { useTranslation } from 'react-i18next';

interface FillInBlankEditingProps {
  question: FillInBlankQuestion;
  onChange: (updated: FillInBlankQuestion) => void;
}

// Parse text with {{}} syntax into segments
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

    // Add blank segment
    segments.push({
      id: generateId(),
      type: 'blank',
      content: match[1].trim(),
      acceptableAnswers: [],
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
const segmentsToText = (segments: BlankSegment[]): string => {
  return segments
    .map((seg) => {
      if (seg.type === 'text') {
        return seg.content;
      } else {
        return `{{${seg.content}}}`;
      }
    })
    .join('');
};

export const FillInBlankEditing = ({ question, onChange }: FillInBlankEditingProps) => {
  const { t } = useTranslation('assignment', { keyPrefix: 'editing.fillInBlank' });
  const [questionText, setQuestionText] = useState(() => segmentsToText(question.data.segments));

  useEffect(() => {
    // Update questionText when segments change externally
    setQuestionText(segmentsToText(question.data.segments));
  }, [question.data.segments]);

  const updateQuestion = (updates: Partial<FillInBlankQuestion>) => {
    onChange({ ...question, ...updates });
  };

  const handleQuestionTextChange = (text: string) => {
    setQuestionText(text);
    const newSegments = parseQuestionText(text);

    // Preserve existing alternative answers by matching blank content
    const segmentsWithAnswers = newSegments.map((seg) => {
      if (seg.type === 'blank') {
        const existingBlank = question.data.segments.find(
          (s) => s.type === 'blank' && s.content === seg.content
        );
        if (existingBlank) {
          return { ...seg, acceptableAnswers: existingBlank.acceptableAnswers || [] };
        }
      }
      return seg;
    });

    updateQuestion({ data: { ...question.data, segments: segmentsWithAnswers } });
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

  // Get only blank segments for alternative answers section
  const blankSegments = question.data.segments.filter((s) => s.type === 'blank');

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">Question Title</Label>
        <Input
          value={question.title}
          onChange={(e) => updateQuestion({ title: e.target.value })}
          placeholder="Enter question title (optional)"
          className="h-9"
        />
      </div>

      {/* Title Image */}
      <ImageUploader
        label="Question Image"
        value={question.titleImageUrl}
        onChange={(titleImageUrl) => updateQuestion({ titleImageUrl })}
      />

      {/* Question Text with {{}} syntax */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Question Text</Label>
          <div className="flex items-center gap-2">
            <Label
              htmlFor="case-sensitive"
              className="cursor-pointer text-xs text-gray-600 dark:text-gray-400"
            >
              Case Sensitive
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
          placeholder="Use {{answer}} to mark blanks. Example: I {{am}} a {{student}}."
          className="min-h-[100px] font-mono text-sm"
        />
        <p className="text-xs text-gray-500">
          Use <code className="rounded bg-gray-100 px-1 dark:bg-gray-800">{'{{answer}}'}</code> syntax to mark
          blanks
        </p>
      </div>

      {/* Preview */}
      {blankSegments.length > 0 && (
        <div className="rounded-lg border bg-gray-50 p-4 dark:bg-gray-900/50">
          <p className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Preview</p>
          <div className="text-sm">
            {question.data.segments.map((segment) => (
              <span key={segment.id}>
                {segment.type === 'text' ? (
                  segment.content
                ) : (
                  <span className="mx-1 inline-block min-w-[100px] border-b-2 border-dashed border-blue-400 px-2 text-transparent">
                    blank
                  </span>
                )}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Alternative Answers for each blank */}
      {blankSegments.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Alternative Answers</Label>
          {blankSegments.map((segment, index) => (
            <div key={segment.id} className="space-y-2 rounded-lg border p-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Blank {index + 1}: <span className="font-mono text-blue-600">{segment.content}</span>
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => addAcceptableAnswer(segment.id)}
                  className="h-7 text-xs"
                >
                  <Plus className="mr-1 h-3 w-3" />
                  Add Alternative
                </Button>
              </div>
              {(segment.acceptableAnswers || []).length > 0 && (
                <div className="space-y-1.5">
                  {segment.acceptableAnswers!.map((alt, altIndex) => (
                    <div key={altIndex} className="flex gap-2">
                      <Input
                        value={alt}
                        onChange={(e) => updateAcceptableAnswer(segment.id, altIndex, e.target.value)}
                        placeholder="Alternative answer"
                        className="h-8 font-mono text-sm"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAcceptableAnswer(segment.id, altIndex)}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Explanation */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">Explanation</Label>
        <div className="rounded-lg border p-3">
          <MarkdownEditor
            value={question.explanation || ''}
            onChange={(explanation) => updateQuestion({ explanation })}
            placeholder="Explain the answer (optional, shown after assessment)"
          />
        </div>
      </div>
    </div>
  );
};
