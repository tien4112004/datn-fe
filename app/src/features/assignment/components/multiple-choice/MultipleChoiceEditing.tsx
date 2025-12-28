import type { MultipleChoiceQuestion, MultipleChoiceOption } from '../../types';
import { MarkdownEditor, ImageUploader, DifficultyBadge } from '../shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';
import { Input } from '@/shared/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Plus, Trash2, ImagePlus, X } from 'lucide-react';
import { generateId } from '@/shared/lib/utils';
import { DIFFICULTY_LABELS, type Difficulty } from '../../types';

interface MultipleChoiceEditingProps {
  question: MultipleChoiceQuestion;
  onChange: (updated: MultipleChoiceQuestion) => void;
}

export const MultipleChoiceEditing = ({ question, onChange }: MultipleChoiceEditingProps) => {
  const updateQuestion = (updates: Partial<MultipleChoiceQuestion>) => {
    onChange({ ...question, ...updates });
  };

  const addOption = () => {
    const newOption: MultipleChoiceOption = {
      id: generateId(),
      text: '',
      isCorrect: false,
    };
    updateQuestion({ options: [...question.options, newOption] });
  };

  const removeOption = (optionId: string) => {
    if (question.options.length <= 2) {
      alert('Must have at least 2 options');
      return;
    }
    updateQuestion({ options: question.options.filter((o) => o.id !== optionId) });
  };

  const updateOption = (optionId: string, updates: Partial<MultipleChoiceOption>) => {
    updateQuestion({
      options: question.options.map((o) => (o.id === optionId ? { ...o, ...updates } : o)),
    });
  };

  const markAsCorrect = (optionId: string) => {
    updateQuestion({
      options: question.options.map((o) => ({
        ...o,
        isCorrect: o.id === optionId,
      })),
    });
  };

  const correctOptionId = question.options.find((o) => o.isCorrect)?.id || '';

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Edit Multiple Choice Question</CardTitle>
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

        {/* Question Title */}
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

        {/* Options */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Options</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addOption}
              disabled={question.options.length >= 6}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Option
            </Button>
          </div>

          <RadioGroup value={correctOptionId} onValueChange={markAsCorrect}>
            <div className="space-y-2">
              {question.options.map((option, index) => (
                <div key={option.id} className="space-y-2 rounded-md border p-3">
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value={option.id} id={`correct-${option.id}`} />
                    <Label htmlFor={`correct-${option.id}`} className="cursor-pointer text-sm font-medium">
                      {String.fromCharCode(65 + index)}
                    </Label>
                    <MarkdownEditor
                      value={option.text}
                      onChange={(text) => updateOption(option.id, { text })}
                      placeholder="Enter option text..."
                      minHeight={50}
                      className="flex-1"
                    />
                    {option.imageUrl !== undefined ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => updateOption(option.id, { imageUrl: undefined })}
                        title="Remove image"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => updateOption(option.id, { imageUrl: '' })}
                        title="Add image"
                      >
                        <ImagePlus className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(option.id)}
                      disabled={question.options.length <= 2}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {option.imageUrl !== undefined && (
                    <ImageUploader
                      label="Option Image"
                      value={option.imageUrl}
                      onChange={(imageUrl) => updateOption(option.id, { imageUrl })}
                    />
                  )}
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>

        {/* Explanation */}
        <div className="space-y-2">
          <Label>Explanation (shown after assessment)</Label>
          <MarkdownEditor
            value={question.explanation || ''}
            onChange={(explanation) => updateQuestion({ explanation })}
            placeholder="Explain the correct answer..."
          />
        </div>
      </CardContent>
    </Card>
  );
};
