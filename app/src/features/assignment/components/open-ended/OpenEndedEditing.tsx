import type { OpenEndedQuestion, Difficulty } from '../../types';
import { MarkdownEditor, ImageUploader, DifficultyBadge } from '../shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { DIFFICULTY_LABELS } from '../../types';

interface OpenEndedEditingProps {
  question: OpenEndedQuestion;
  onChange: (updated: OpenEndedQuestion) => void;
}

export const OpenEndedEditing = ({ question, onChange }: OpenEndedEditingProps) => {
  const updateQuestion = (updates: Partial<OpenEndedQuestion>) => {
    onChange({ ...question, ...updates });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Edit Open-ended Question</CardTitle>
          <DifficultyBadge difficulty={question.difficulty} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Difficulty & Points */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Difficulty</Label>
            <Select
              value={question.difficulty}
              onValueChange={(value) => updateQuestion({ difficulty: value as Difficulty })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DIFFICULTY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Points</Label>
            <Input
              type="number"
              min="0"
              value={question.points || 0}
              onChange={(e) => updateQuestion({ points: parseInt(e.target.value) || 0 })}
            />
          </div>
        </div>

        {/* Question */}
        <div className="space-y-2">
          <Label>Question</Label>
          <MarkdownEditor
            value={question.title}
            onChange={(title) => updateQuestion({ title })}
            placeholder="Enter your question here..."
          />
        </div>

        {/* Question Image */}
        <ImageUploader
          label="Question Image (optional)"
          value={question.titleImageUrl}
          onChange={(titleImageUrl) => updateQuestion({ titleImageUrl })}
        />

        {/* Max Length */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Max Answer Length</Label>
            <span className="text-muted-foreground text-xs">
              {question.maxLength || 500} chars (0 = unlimited)
            </span>
          </div>
          <Input
            type="number"
            min="0"
            max="5000"
            value={question.maxLength || 500}
            onChange={(e) => updateQuestion({ maxLength: parseInt(e.target.value) || 500 })}
            className="h-8"
          />
        </div>

        {/* Expected Answer */}
        <div className="space-y-2">
          <Label className="text-sm">Expected Answer (optional)</Label>
          <MarkdownEditor
            value={question.expectedAnswer || ''}
            onChange={(expectedAnswer) => updateQuestion({ expectedAnswer })}
            placeholder="Enter a sample/expected answer for reference..."
            minHeight={80}
          />
        </div>

        {/* Explanation */}
        <div className="space-y-2">
          <Label className="text-sm">Explanation (shown after assessment)</Label>
          <MarkdownEditor
            value={question.explanation || ''}
            onChange={(explanation) => updateQuestion({ explanation })}
            placeholder="Explain what makes a good answer..."
            minHeight={80}
          />
        </div>
      </CardContent>
    </Card>
  );
};
