import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { Separator } from '@/shared/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/shared/components/ui/breadcrumb';
import {
  useCreateQuestion,
  useUpdateQuestion,
  useQuestionBankItem,
} from '@/features/assignment/hooks/useQuestionBankApi';
import type {
  CreateQuestionRequest,
  QuestionType,
  Difficulty,
  SubjectCode,
  Question,
  QuestionBankItem,
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
import { AlertCircle, Save, Settings, FileText } from 'lucide-react';
import { validateQuestion } from '@/features/assignment/utils/validateQuestion';

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
        type: 'multiple_choice',
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
        type: 'matching',
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
        type: 'fill_in_blank',
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
        type: 'open_ended',
        data: {
          expectedAnswer: '',
          maxLength: 500,
        },
      } as QuestionBankItem;

    default:
      return baseQuestion as QuestionBankItem;
  }
}

export function QuestionBankEditorPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const isEditMode = !!id;

  // Form state
  const [questionData, setQuestionData] = useState<QuestionBankItem | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Fetch existing question if editing
  const { data: existingQuestion, isLoading } = useQuestionBankItem(id || '');

  // Mutations
  const createMutation = useCreateQuestion();
  const updateMutation = useUpdateQuestion();

  // Initialize form data
  useEffect(() => {
    if (isEditMode && existingQuestion) {
      setQuestionData(existingQuestion);
    } else if (!isEditMode) {
      setQuestionData(createDefaultQuestion(QUESTION_TYPE.MULTIPLE_CHOICE));
    }
  }, [isEditMode, existingQuestion]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!questionData) {
      toast.error('Question data is missing');
      return;
    }

    // Validate question content (cast to Question for validation)
    const validation = validateQuestion(questionData as Question);

    if (!validation.isValid) {
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
      if (isEditMode && id) {
        await updateMutation.mutateAsync({
          id,
          data: {
            question: questionData as any,
          },
        });
        toast.success('Question updated successfully');
      } else {
        const payload: CreateQuestionRequest = {
          question: {
            ...questionData,
            bankType: BANK_TYPE.PERSONAL,
          } as any,
        };
        await createMutation.mutateAsync(payload);
        toast.success('Question created successfully');
      }

      navigate('/question-bank');
    } catch (error) {
      toast.error(`Failed to ${isEditMode ? 'update' : 'create'} question`);
    }
  };

  const handleCancel = () => {
    navigate('/question-bank');
  };

  // Handle question type change (create mode only)
  const handleTypeChange = (newType: QuestionType) => {
    if (!isEditMode && questionData) {
      const newQuestion = createDefaultQuestion(newType);
      setQuestionData({
        ...newQuestion,
        difficulty: questionData.difficulty,
        subjectCode: questionData.subjectCode,
      });
    }
  };

  if (isEditMode && isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading question...</div>
      </div>
    );
  }

  if (!questionData) {
    return null;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 flex-col overflow-auto">
        <div className="mx-auto w-full max-w-7xl space-y-6 px-8 py-12">
          {/* Breadcrumb Navigation */}
          <Breadcrumb className="mb-6">
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/question-bank">Question Bank</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{isEditMode ? 'Edit Question' : 'Create Question'}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="scroll-m-20 text-3xl font-semibold tracking-tight">
                {isEditMode ? 'Edit Question' : 'Create New Question'}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {createMutation.isPending || updateMutation.isPending
                  ? 'Saving...'
                  : isEditMode
                    ? 'Save Changes'
                    : 'Create Question'}
              </Button>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Metadata Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Settings className="text-primary h-5 w-5" />
                <h3 className="text-lg font-semibold">Question Metadata</h3>
              </div>
              <Separator />

              {/* Question Type - Only for create mode */}
              {!isEditMode && (
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

            {/* Question Content Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="text-primary h-5 w-5" />
                <h3 className="text-lg font-semibold">Question Content</h3>
              </div>
              <Separator />

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
          </form>
        </div>
      </div>
    </div>
  );
}
