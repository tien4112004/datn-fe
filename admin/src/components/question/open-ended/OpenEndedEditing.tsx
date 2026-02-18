import type { OpenEndedQuestion } from '@/types/questionBank';
import { MarkdownEditor, ImageUploader, DifficultyBadge } from '../shared';
import { Button } from '@ui/button';
import { Input } from '@ui/input';
import { Label } from '@ui/label';
import { ImagePlus, X } from 'lucide-react';

interface OpenEndedEditingProps {
  question: OpenEndedQuestion;
  onChange: (updated: OpenEndedQuestion) => void;
}

export const OpenEndedEditing = ({ question, onChange }: OpenEndedEditingProps) => {
  const updateQuestion = (updates: Partial<OpenEndedQuestion>) => {
    onChange({ ...question, ...updates });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Open Ended</h3>
        <DifficultyBadge difficulty={question.difficulty} />
      </div>

      {/* Question */}
      <div className="space-y-1">
        <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Question</Label>
        <div className="space-y-2 rounded-md border border-gray-300 bg-white p-2 dark:border-gray-600 dark:bg-gray-900">
          <div className="flex items-center gap-2">
            <MarkdownEditor
              value={question.title}
              onChange={(title) => updateQuestion({ title })}
              placeholder="Enter your question..."
              className="flex-1"
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

      {/* Max Length */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Max Characters</Label>
          <span className="text-muted-foreground text-xs">
            Current: {question.data.maxLength || 500} characters
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
        <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Expected Answer</Label>
        <div className="rounded-md border border-gray-300 bg-white p-2 dark:border-gray-600 dark:bg-gray-900">
          <MarkdownEditor
            value={question.data.expectedAnswer || ''}
            onChange={(expectedAnswer) => updateQuestion({ data: { ...question.data, expectedAnswer } })}
            placeholder="Enter expected answer (for grading reference)..."
            minHeight={80}
          />
        </div>
      </div>

      {/* Explanation */}
      <div className="space-y-1">
        <Label className="text-xs font-medium text-gray-700 dark:text-gray-300">Explanation</Label>
        <div className="rounded-md border border-gray-300 bg-white p-2 dark:border-gray-600 dark:bg-gray-900">
          <MarkdownEditor
            value={question.explanation || ''}
            onChange={(explanation) => updateQuestion({ explanation })}
            placeholder="Explain the correct answer..."
            minHeight={80}
          />
        </div>
      </div>
    </div>
  );
};
