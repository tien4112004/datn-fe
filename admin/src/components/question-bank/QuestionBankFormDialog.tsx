import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateQuestionBankItem, useUpdateQuestionBankItem } from '@/hooks/useApi';
import type {
  QuestionBankItem,
  CreateQuestionPayload,
  QuestionType,
  Difficulty,
  SubjectCode,
} from '@/types/questionBank';
import { QUESTION_TYPE, DIFFICULTY, SUBJECT_CODE, BANK_TYPE } from '@/types/questionBank';
import { getAllQuestionTypes, getAllDifficulties } from '@aiprimary/core';

interface QuestionBankFormDialogProps {
  open: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  question?: QuestionBankItem | null;
}

export function QuestionBankFormDialog({ open, onClose, mode, question }: QuestionBankFormDialogProps) {
  const createMutation = useCreateQuestionBankItem();
  const updateMutation = useUpdateQuestionBankItem();

  // Form state
  const [formData, setFormData] = useState<{
    type: QuestionType;
    difficulty: Difficulty;
    subjectCode: SubjectCode;
    title: string;
    explanation: string;
    points: number;
  }>({
    type: QUESTION_TYPE.MULTIPLE_CHOICE,
    difficulty: DIFFICULTY.KNOWLEDGE,
    subjectCode: SUBJECT_CODE.MATH,
    title: '',
    explanation: '',
    points: 10,
  });

  // Initialize form with question data when editing
  useEffect(() => {
    if (mode === 'edit' && question) {
      setFormData({
        type: question.type,
        difficulty: question.difficulty,
        subjectCode: question.subjectCode,
        title: question.title,
        explanation: question.explanation || '',
        points: question.points || 10,
      });
    } else if (mode === 'create') {
      // Reset form for create mode
      setFormData({
        type: QUESTION_TYPE.MULTIPLE_CHOICE,
        difficulty: DIFFICULTY.KNOWLEDGE,
        subjectCode: SUBJECT_CODE.MATH,
        title: '',
        explanation: '',
        points: 10,
      });
    }
  }, [mode, question, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'create') {
      // Create a minimal question payload
      const payload: CreateQuestionPayload = {
        question: {
          type: formData.type,
          difficulty: formData.difficulty,
          subjectCode: formData.subjectCode,
          bankType: BANK_TYPE.PUBLIC,
          title: formData.title,
          explanation: formData.explanation,
          points: formData.points,
          // Add type-specific required fields
          ...(formData.type === QUESTION_TYPE.MULTIPLE_CHOICE && {
            options: [
              { id: '1', text: 'Option 1', isCorrect: true },
              { id: '2', text: 'Option 2', isCorrect: false },
            ],
          }),
          ...(formData.type === QUESTION_TYPE.MATCHING && {
            pairs: [
              { id: '1', left: 'Left 1', right: 'Right 1' },
              { id: '2', left: 'Left 2', right: 'Right 2' },
            ],
          }),
          ...(formData.type === QUESTION_TYPE.OPEN_ENDED && {
            expectedAnswer: '',
            maxLength: 500,
          }),
          ...(formData.type === QUESTION_TYPE.FILL_IN_BLANK && {
            segments: [
              { id: '1', type: 'text' as const, content: 'Fill in the ' },
              { id: '2', type: 'blank' as const, content: 'blank' },
            ],
            caseSensitive: false,
          }),
        } as any,
      };

      await createMutation.mutateAsync(payload);
    } else if (mode === 'edit' && question) {
      await updateMutation.mutateAsync({
        id: question.id,
        payload: {
          question: {
            title: formData.title,
            explanation: formData.explanation,
            points: formData.points,
            difficulty: formData.difficulty,
            subjectCode: formData.subjectCode,
          },
        },
      });
    }

    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create New Question' : 'Edit Question'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Question Type - Only for create mode */}
          {mode === 'create' && (
            <div className="space-y-2">
              <Label>Question Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData({ ...formData, type: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getAllQuestionTypes({ includeGroup: false }).map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label>Question Title *</Label>
            <Textarea
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter the question title..."
              rows={3}
              required
            />
          </div>

          {/* Metadata Row */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select
                value={formData.subjectCode}
                onValueChange={(value) => setFormData({ ...formData, subjectCode: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SUBJECT_CODE.MATH}>Math</SelectItem>
                  <SelectItem value={SUBJECT_CODE.VIETNAMESE}>Vietnamese</SelectItem>
                  <SelectItem value={SUBJECT_CODE.ENGLISH}>English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Difficulty</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value) => setFormData({ ...formData, difficulty: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getAllDifficulties().map((difficulty) => (
                    <SelectItem key={difficulty.value} value={difficulty.value}>
                      {difficulty.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Points</Label>
              <Input
                type="number"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                min={1}
                max={100}
              />
            </div>
          </div>

          {/* Explanation */}
          <div className="space-y-2">
            <Label>Explanation (Optional)</Label>
            <Textarea
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              placeholder="Provide an explanation or answer key..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {mode === 'create' ? 'Create Question' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
