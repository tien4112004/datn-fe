import type { FillInBlankQuestion, BlankSegment, Difficulty } from '../../types';
import { MarkdownEditor, ImageUploader, DifficultyBadge } from '../shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Switch } from '@/shared/components/ui/switch';
import { Badge } from '@/shared/components/ui/badge';
import { Plus, Trash2, FileText, FilePlus2 } from 'lucide-react';
import { generateId } from '@/shared/lib/utils';
import { DIFFICULTY_LABELS } from '../../types';

interface FillInBlankEditingProps {
  question: FillInBlankQuestion;
  onChange: (updated: FillInBlankQuestion) => void;
}

export const FillInBlankEditing = ({ question, onChange }: FillInBlankEditingProps) => {
  const updateQuestion = (updates: Partial<FillInBlankQuestion>) => {
    onChange({ ...question, ...updates });
  };

  const addTextSegment = () => {
    const newSegment: BlankSegment = {
      id: generateId(),
      type: 'text',
      content: '',
    };
    updateQuestion({ segments: [...question.segments, newSegment] });
  };

  const addBlankSegment = () => {
    const newSegment: BlankSegment = {
      id: generateId(),
      type: 'blank',
      content: '',
      acceptableAnswers: [],
    };
    updateQuestion({ segments: [...question.segments, newSegment] });
  };

  const removeSegment = (segmentId: string) => {
    if (question.segments.length <= 1) {
      alert('Must have at least 1 segment');
      return;
    }
    updateQuestion({ segments: question.segments.filter((s) => s.id !== segmentId) });
  };

  const updateSegment = (segmentId: string, updates: Partial<BlankSegment>) => {
    updateQuestion({
      segments: question.segments.map((s) => (s.id === segmentId ? { ...s, ...updates } : s)),
    });
  };

  const addAcceptableAnswer = (segmentId: string) => {
    const segment = question.segments.find((s) => s.id === segmentId);
    if (!segment || segment.type !== 'blank') return;

    updateSegment(segmentId, {
      acceptableAnswers: [...(segment.acceptableAnswers || []), ''],
    });
  };

  const updateAcceptableAnswer = (segmentId: string, index: number, value: string) => {
    const segment = question.segments.find((s) => s.id === segmentId);
    if (!segment || segment.type !== 'blank') return;

    const updated = [...(segment.acceptableAnswers || [])];
    updated[index] = value;
    updateSegment(segmentId, { acceptableAnswers: updated });
  };

  const removeAcceptableAnswer = (segmentId: string, index: number) => {
    const segment = question.segments.find((s) => s.id === segmentId);
    if (!segment || segment.type !== 'blank') return;

    const updated = [...(segment.acceptableAnswers || [])];
    updated.splice(index, 1);
    updateSegment(segmentId, { acceptableAnswers: updated });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Edit Fill In Blank Question</CardTitle>
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

        {/* Title & Case Sensitive */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Title (optional)</Label>
            <div className="flex items-center gap-2">
              <Label htmlFor="case-sensitive" className="text-muted-foreground cursor-pointer text-xs">
                Case sensitive
              </Label>
              <Switch
                id="case-sensitive"
                checked={question.caseSensitive || false}
                onCheckedChange={(caseSensitive) => updateQuestion({ caseSensitive })}
              />
            </div>
          </div>
          <Input
            value={question.title}
            onChange={(e) => updateQuestion({ title: e.target.value })}
            placeholder="Enter a title or instructions..."
            className="h-8"
          />
        </div>

        {/* Title Image */}
        <ImageUploader
          label="Title Image (optional)"
          value={question.titleImageUrl}
          onChange={(titleImageUrl) => updateQuestion({ titleImageUrl })}
        />

        {/* Segments */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Question Segments</Label>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={addTextSegment}>
                <FileText className="mr-2 h-4 w-4" />
                Add Text
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={addBlankSegment}>
                <FilePlus2 className="mr-2 h-4 w-4" />
                Add Blank
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {question.segments.map((segment, index) => (
              <div key={segment.id} className="space-y-2 rounded-md border p-2">
                <div className="flex items-center gap-2">
                  <Badge variant={segment.type === 'text' ? 'secondary' : 'default'} className="text-xs">
                    {segment.type === 'text' ? 'Text' : 'Blank'} #{index + 1}
                  </Badge>
                  {segment.type === 'text' ? (
                    <Input
                      value={segment.content}
                      onChange={(e) => updateSegment(segment.id, { content: e.target.value })}
                      placeholder="Enter text..."
                      className="h-8 flex-1 font-mono"
                    />
                  ) : (
                    <Input
                      value={segment.content}
                      onChange={(e) => updateSegment(segment.id, { content: e.target.value })}
                      placeholder="Correct answer..."
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
                      <Label className="text-muted-foreground text-xs">Alternative answers</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => addAcceptableAnswer(segment.id)}
                        className="h-6 text-xs"
                      >
                        <Plus className="mr-1 h-3 w-3" />
                        Add
                      </Button>
                    </div>
                    {(segment.acceptableAnswers || []).map((alt, altIndex) => (
                      <div key={altIndex} className="flex gap-1">
                        <Input
                          value={alt}
                          onChange={(e) => updateAcceptableAnswer(segment.id, altIndex, e.target.value)}
                          placeholder="Alternative..."
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
            <p className="mb-2 text-sm font-medium">Preview:</p>
            <div className="font-mono text-sm">
              {question.segments.map((segment) => (
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
          <Label>Explanation (shown after assessment)</Label>
          <MarkdownEditor
            value={question.explanation || ''}
            onChange={(explanation) => updateQuestion({ explanation })}
            placeholder="Explain the correct answers..."
          />
        </div>
      </CardContent>
    </Card>
  );
};
