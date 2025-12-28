import type { MatchingQuestion, MatchingPair, Difficulty } from '../../types';
import { MarkdownEditor, ImageUploader, DifficultyBadge } from '../shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Plus, Trash2, ImagePlus, X } from 'lucide-react';
import { generateId } from '@/shared/lib/utils';
import { DIFFICULTY_LABELS } from '../../types';

interface MatchingEditingProps {
  question: MatchingQuestion;
  onChange: (updated: MatchingQuestion) => void;
}

export const MatchingEditing = ({ question, onChange }: MatchingEditingProps) => {
  const updateQuestion = (updates: Partial<MatchingQuestion>) => {
    onChange({ ...question, ...updates });
  };

  const addPair = () => {
    const newPair: MatchingPair = {
      id: generateId(),
      left: '',
      right: '',
    };
    updateQuestion({ pairs: [...question.pairs, newPair] });
  };

  const removePair = (pairId: string) => {
    if (question.pairs.length <= 2) {
      alert('Must have at least 2 pairs');
      return;
    }
    updateQuestion({ pairs: question.pairs.filter((p) => p.id !== pairId) });
  };

  const updatePair = (pairId: string, updates: Partial<MatchingPair>) => {
    updateQuestion({
      pairs: question.pairs.map((p) => (p.id === pairId ? { ...p, ...updates } : p)),
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Edit Matching Question</CardTitle>
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
            placeholder="Enter your matching question instructions..."
          />
        </div>

        {/* Question Image */}
        <ImageUploader
          label="Question Image (optional)"
          value={question.titleImageUrl}
          onChange={(titleImageUrl) => updateQuestion({ titleImageUrl })}
        />

        {/* Pairs */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Matching Pairs</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addPair}
              disabled={question.pairs.length >= 8}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Pair
            </Button>
          </div>

          <div className="space-y-2">
            {question.pairs.map((pair, index) => (
              <div key={pair.id} className="space-y-2 rounded-md border p-3">
                <div className="mb-2 flex items-center justify-between">
                  <h4 className="text-sm font-semibold">Pair {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removePair(pair.id)}
                    disabled={question.pairs.length <= 2}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Left Item */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Label className="text-muted-foreground text-xs">Left</Label>
                      {pair.leftImageUrl === undefined ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => updatePair(pair.id, { leftImageUrl: '' })}
                          className="h-6 w-6 p-0"
                          title="Add image"
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
                          title="Remove image"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <MarkdownEditor
                      value={pair.left}
                      onChange={(left) => updatePair(pair.id, { left })}
                      placeholder="Left item..."
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
                      <Label className="text-muted-foreground text-xs">Right</Label>
                      {pair.rightImageUrl === undefined ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => updatePair(pair.id, { rightImageUrl: '' })}
                          className="h-6 w-6 p-0"
                          title="Add image"
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
                          title="Remove image"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <MarkdownEditor
                      value={pair.right}
                      onChange={(right) => updatePair(pair.id, { right })}
                      placeholder="Right item..."
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
          <Label>Explanation (shown after assessment)</Label>
          <MarkdownEditor
            value={question.explanation || ''}
            onChange={(explanation) => updateQuestion({ explanation })}
            placeholder="Explain the correct matches..."
          />
        </div>
      </CardContent>
    </Card>
  );
};
