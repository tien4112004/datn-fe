import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { useCreateQuestion, useUpdateQuestion } from '@/features/assignment/hooks/useQuestionBankApi';
import type {
  QuestionBankItem,
  CreateQuestionRequest,
  QuestionType,
  Difficulty,
  SubjectCode,
  Question,
  MultipleChoiceQuestion,
  MatchingQuestion,
  FillInBlankQuestion,
  OpenEndedQuestion,
} from '@/features/assignment/types';
import { QUESTION_TYPE, DIFFICULTY, SUBJECT_CODE, BANK_TYPE } from '@/features/assignment/types';
import { getAllSubjects } from '@aiprimary/core';
import {
  MultipleChoiceEditing,
  MatchingEditing,
  FillInBlankEditing,
  OpenEndedEditing,
} from '@/features/question';
import { generateId } from '@/shared/lib/utils';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { validateQuestion } from '@/features/assignment/utils/validateQuestion';

interface QuestionBankFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  question?: QuestionBankItem | null;
}

// Helper function to create default question based on type
function createDefaultQuestion(type: QuestionType): QuestionBankItem {
  const baseQuestion = {
    id: generateId(),
    type,
    difficulty: DIFFICULTY.EASY,
    subjectCode: SUBJECT_CODE.MATH,
    bankType: BANK_TYPE.PERSONAL,
    title: '',
    explanation: '',
  };

  switch (type) {
    case QUESTION_TYPE.MULTIPLE_CHOICE:
      return {
        ...baseQuestion,
        data: {
          options: [
            { id: generateId(), text: '', isCorrect: false },
            { id: generateId(), text: '', isCorrect: false },
          ],
        },
      } as QuestionBankItem;

    case QUESTION_TYPE.MATCHING:
      return {
        ...baseQuestion,
        data: {
          pairs: [
            { id: generateId(), left: '', right: '' },
            { id: generateId(), left: '', right: '' },
          ],
        },
      } as QuestionBankItem;

    case QUESTION_TYPE.FILL_IN_BLANK:
      return {
        ...baseQuestion,
        data: {
          segments: [
            { id: generateId(), type: 'text', content: '' },
            { id: generateId(), type: 'blank', content: '' },
          ],
          caseSensitive: false,
        },
      } as QuestionBankItem;

    case QUESTION_TYPE.OPEN_ENDED:
      return {
        ...baseQuestion,
        data: {
          expectedAnswer: '',
          maxLength: 500,
        },
      } as QuestionBankItem;

    default:
      return baseQuestion as QuestionBankItem;
  }
}

export function QuestionBankFormDialog({ open, onOpenChange, mode, question }: QuestionBankFormDialogProps) {
  const createMutation = useCreateQuestion();
  const updateMutation = useUpdateQuestion();

  // Form state - full question object instead of metadata only
  const [questionData, setQuestionData] = useState<QuestionBankItem | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Initialize form with question data when editing or opening
  useEffect(() => {
    if (mode === 'edit' && question && open) {
      // Edit mode: use full existing question
      setQuestionData(question);
      setValidationErrors([]);
    } else if (mode === 'create' && open) {
      // Create mode: initialize with default question of initial type
      setQuestionData(createDefaultQuestion(QUESTION_TYPE.MULTIPLE_CHOICE));
      setValidationErrors([]);
    }
  }, [mode, question, open]);

  // Clean up state after dialog closes (with delay for animation)
  useEffect(() => {
    if (!open) {
      // Delay cleanup to allow Radix UI Dialog's close animation to complete
      const timeoutId = setTimeout(() => {
        setQuestionData(null);
        setValidationErrors([]);
      }, 300); // Match dialog animation duration

      return () => clearTimeout(timeoutId);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!questionData) {
      toast.error('Question data is missing');
      return;
    }

    // Validate question content (cast to Question for validation)
    const validation = validateQuestion(questionData as Question);

    if (!validation.isValid) {
      // Show errors - block submission
      setValidationErrors(validation.errors);
      toast.error('Please fix validation errors before saving');
      return;
    }

    // Clear errors if validation passed
    setValidationErrors([]);

    // Show warnings but allow submission
    if (validation.warnings.length > 0) {
      validation.warnings.forEach((warning: string) => {
        toast.warning(warning);
      });
    }

    try {
      if (mode === 'create') {
        // Create with full question content
        const payload: CreateQuestionRequest = {
          question: {
            ...questionData,
            bankType: BANK_TYPE.PERSONAL, // Ensure it's personal
          } as any,
        };

        await createMutation.mutateAsync(payload);
        toast.success('Question created successfully');
      } else if (mode === 'edit' && question) {
        // Update with full question content
        await updateMutation.mutateAsync({
          id: question.id,
          data: {
            question: questionData as any,
          },
        });
        toast.success('Question updated successfully');
      }

      onOpenChange(false);
    } catch (error) {
      toast.error(`Failed to ${mode} question`);
    }
  };

  // Handle question type change (create mode only)
  const handleTypeChange = (newType: QuestionType) => {
    if (mode === 'create' && questionData) {
      const newQuestion = createDefaultQuestion(newType);
      // Preserve metadata from current question
      setQuestionData({
        ...newQuestion,
        difficulty: questionData.difficulty,
        subjectCode: questionData.subjectCode,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] !max-w-6xl overflow-y-auto rounded-3xl border-2 shadow-2xl">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Create New Question' : 'Edit Question'}</DialogTitle>
        </DialogHeader>

        {questionData && (
          <form onSubmit={handleSubmit} className="gap-6 space-y-6">
            {/* Metadata Section */}
            <div className="bg-muted/10 space-y-4 rounded-2xl border p-6 shadow-sm">
              <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">Question Metadata</h3>

              {/* Question Type - Only for create mode */}
              {mode === 'create' && (
                <div className="space-y-2">
                  <Label>Question Type</Label>
                  <Select value={questionData.type} onValueChange={handleTypeChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={QUESTION_TYPE.MULTIPLE_CHOICE}>Multiple Choice</SelectItem>
                      <SelectItem value={QUESTION_TYPE.MATCHING}>Matching</SelectItem>
                      <SelectItem value={QUESTION_TYPE.OPEN_ENDED}>Open-ended</SelectItem>
                      <SelectItem value={QUESTION_TYPE.FILL_IN_BLANK}>Fill In Blank</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Metadata Row */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Select
                    value={questionData.subjectCode}
                    onValueChange={(value) =>
                      setQuestionData({ ...questionData, subjectCode: value as SubjectCode })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getAllSubjects().map((subject) => (
                        <SelectItem key={subject.code} value={subject.code}>
                          {subject.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select
                    value={questionData.difficulty}
                    onValueChange={(value) =>
                      setQuestionData({ ...questionData, difficulty: value as Difficulty })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={DIFFICULTY.EASY}>Nhận biết</SelectItem>
                      <SelectItem value={DIFFICULTY.MEDIUM}>Thông hiểu</SelectItem>
                      <SelectItem value={DIFFICULTY.HARD}>Vận dụng</SelectItem>
                      <SelectItem value={DIFFICULTY.SUPER_HARD}>Vận dụng cao</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Validation Errors</AlertTitle>
                <AlertDescription>
                  <ul className="mt-2 list-disc space-y-1 pl-4">
                    {validationErrors.map((error, i) => (
                      <li key={i} className="text-sm">
                        {error}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Question Content Editor - Type Specific */}
            <div className="mt-6 space-y-4 rounded-2xl border p-6 shadow-sm">
              <h3 className="scroll-m-20 text-xl font-semibold tracking-tight">Question Content</h3>

              {questionData.type === QUESTION_TYPE.MULTIPLE_CHOICE && (
                <MultipleChoiceEditing
                  question={questionData as Question as MultipleChoiceQuestion}
                  onChange={(updated) => setQuestionData({ ...questionData, ...updated })}
                />
              )}

              {questionData.type === QUESTION_TYPE.MATCHING && (
                <MatchingEditing
                  question={questionData as Question as MatchingQuestion}
                  onChange={(updated) => setQuestionData({ ...questionData, ...updated })}
                />
              )}

              {questionData.type === QUESTION_TYPE.FILL_IN_BLANK && (
                <FillInBlankEditing
                  question={questionData as Question as FillInBlankQuestion}
                  onChange={(updated) => setQuestionData({ ...questionData, ...updated })}
                />
              )}

              {questionData.type === QUESTION_TYPE.OPEN_ENDED && (
                <OpenEndedEditing
                  question={questionData as Question as OpenEndedQuestion}
                  onChange={(updated) => setQuestionData({ ...questionData, ...updated })}
                />
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {mode === 'create' ? 'Create Question' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
