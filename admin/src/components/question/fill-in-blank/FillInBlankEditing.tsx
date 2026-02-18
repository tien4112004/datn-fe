import { useState } from 'react';
import type { FillInBlankQuestion, FillInBlankSegment } from '@/types/questionBank';
import { MarkdownEditor, ImageUploader } from '../shared';
import { Button } from '@ui/button';
import { Input } from '@ui/input';
import { Label } from '@ui/label';
import { Switch } from '@ui/switch';
import { Textarea } from '@ui/textarea';
import { ImagePlus, X } from 'lucide-react';
import { generateId } from '@/lib/utils';

interface FillInBlankEditingProps {
  question: FillInBlankQuestion;
  onChange: (updated: FillInBlankQuestion) => void;
}

// Parse text with {{}} syntax into segments
// Supports alternative answers: {{answer1::alternative2::alternative3}}
const parseQuestionText = (text: string): FillInBlankSegment[] => {
  const segments: FillInBlankSegment[] = [];
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

    // Parse alternatives from the blank content (e.g., "answer1::alternative2::alternative3")
    const blankContent = match[1].trim();
    const alternatives = blankContent
      .split('::')
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
// Includes alternative answers: {{answer1::alternative2::alternative3}}
const segmentsToText = (segments: FillInBlankSegment[]): string => {
  return segments
    .map((seg) => {
      if (seg.type === 'text') {
        return seg.content;
      } else {
        // Include acceptable answers in the syntax if they exist
        const alternatives =
          seg.acceptableAnswers && seg.acceptableAnswers.length > 0
            ? seg.acceptableAnswers.filter((alt: string) => alt.trim()).join('::')
            : '';
        const allAnswers = alternatives ? `${seg.content}::${alternatives}` : seg.content;
        return `{{${allAnswers}}}`;
      }
    })
    .join('');
};

export const FillInBlankEditing = ({ question, onChange }: FillInBlankEditingProps) => {
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

  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="space-y-1.5">
        <Label className="text-sm font-medium">Title</Label>
        <div className="space-y-2 rounded-md border border-gray-300 bg-white p-2 dark:border-gray-600 dark:bg-gray-900">
          <div className="flex items-center gap-2">
            <Input
              value={question.title}
              onChange={(e) => updateQuestion({ title: e.target.value })}
              placeholder="Enter title (optional)..."
              className="h-9 flex-1 border-0 p-0 focus-visible:ring-0"
            />
            {question.titleImageUrl !== undefined ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => updateQuestion({ titleImageUrl: undefined })}
                title="Remove image"
              >
                <X className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => updateQuestion({ titleImageUrl: '' })}
                title="Add image"
              >
                <ImagePlus className="h-4 w-4" />
              </Button>
            )}
          </div>

          {question.titleImageUrl !== undefined && (
            <ImageUploader
              label="Question Image"
              value={question.titleImageUrl}
              onChange={(titleImageUrl) => updateQuestion({ titleImageUrl })}
            />
          )}
        </div>
      </div>

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
          placeholder="Enter question text with {{answer}} for blanks..."
          className="min-h-[100px] font-mono text-sm"
        />
        <p className="text-xs text-gray-500">
          Use {'{{answer}}'} to create blanks. Example: The capital of France is {'{{Paris}}'}.
          <br />
          Use :: to separate alternatives: {'{{answer1::alternative2::alternative3}}'}
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

      {/* Alternative Answers Display (Read-Only) */}
      {blankSegments.length > 0 && (
        <div className="space-y-3">
          <Label className="text-sm font-medium">Alternative Answers</Label>
          <p className="text-xs text-gray-500">
            Alternatives are parsed from your question text using :: syntax
          </p>

          {blankSegments.map((segment, index) => (
            <div key={segment.id} className="space-y-2 rounded-lg border bg-gray-50 p-3 dark:bg-gray-900/50">
              <Label className="text-sm font-medium">
                Blank {index + 1}: <span className="font-mono text-blue-600">{segment.content}</span>
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
                <p className="text-xs italic text-gray-400">No alternative answers</p>
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
            placeholder="Explain the correct answer..."
          />
        </div>
      </div>
    </div>
  );
};
