import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { useQuestionBankItem, useCreateQuestionBankItem, useUpdateQuestionBankItem } from '@/hooks/useApi';
import type {
  QuestionBankItem,
  Question,
  CreateQuestionPayload,
  UpdateQuestionPayload,
} from '@/types/questionBank';
import {
  DIFFICULTY,
  QUESTION_TYPE,
  SUBJECT_CODE,
  getAllDifficulties,
  getAllQuestionTypes,
  getAllSubjects,
  getAllGrades,
  type Difficulty,
  type QuestionType,
  type SubjectCode,
} from '@aiprimary/core';
import { QuestionRenderer } from '@/components/question';
import { generateId } from '@/lib/utils';
import { toast } from 'sonner';
import { AlertCircle, Save, Settings, FileText, Eye, Edit3 } from 'lucide-react';

// Helper function to create default question based on type
function createDefaultQuestion(type: QuestionType): QuestionBankItem {
  const baseQuestion = {
    id: generateId(),
    type,
    difficulty: DIFFICULTY.KNOWLEDGE as Difficulty,
    subjectCode: SUBJECT_CODE.MATH as SubjectCode,
    bankType: 'public' as const,
    title: '',
    explanation: '',
  };

  switch (type) {
    case QUESTION_TYPE.MULTIPLE_CHOICE:
      return {
        ...baseQuestion,
        type: 'MULTIPLE_CHOICE',
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
        type: 'MATCHING',
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
        type: 'FILL_IN_BLANK',
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
        type: 'OPEN_ENDED',
        data: {
          expectedAnswer: '',
          maxLength: 500,
        },
      } as QuestionBankItem;

    case QUESTION_TYPE.GROUP:
      return {
        ...baseQuestion,
        type: 'GROUP',
        data: {
          description: '',
          questions: [],
          showQuestionNumbers: true,
          shuffleQuestions: false,
        },
      } as QuestionBankItem;

    default:
      return baseQuestion as QuestionBankItem;
  }
}

// Simple validation function
function validateQuestion(question: QuestionBankItem): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (
    !question.title &&
    question.type !== QUESTION_TYPE.FILL_IN_BLANK &&
    question.type !== QUESTION_TYPE.GROUP
  ) {
    errors.push('Question title is required');
  }

  if (!question.subjectCode) {
    errors.push('Subject is required');
  }

  if (!question.difficulty) {
    errors.push('Difficulty is required');
  }

  // Type-specific validation
  if (question.type === QUESTION_TYPE.MULTIPLE_CHOICE) {
    const data = question.data as any;
    if (!data?.options || data.options.length < 2) {
      errors.push('Multiple choice questions must have at least 2 options');
    }
    const hasCorrect = data?.options?.some((o: any) => o.isCorrect);
    if (!hasCorrect) {
      errors.push('Please mark one option as correct');
    }
  }

  if (question.type === QUESTION_TYPE.MATCHING) {
    const data = question.data as any;
    if (!data?.pairs || data.pairs.length < 2) {
      errors.push('Matching questions must have at least 2 pairs');
    }
  }

  if (question.type === QUESTION_TYPE.FILL_IN_BLANK) {
    const data = question.data as any;
    const blanks = data?.segments?.filter((s: any) => s.type === 'blank') || [];
    if (blanks.length === 0) {
      errors.push('Fill in blank questions must have at least one blank');
    }
  }

  if (question.type === QUESTION_TYPE.GROUP) {
    const data = question.data as any;
    if (!data?.questions || data.questions.length === 0) {
      errors.push('Group questions must have at least one sub-question');
    }
  }

  return { isValid: errors.length === 0, errors, warnings };
}

export function QuestionBankEditorPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const isEditMode = !!id;

  // Form state
  const [questionData, setQuestionData] = useState<QuestionBankItem | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Fetch existing question if editing
  const { data: existingQuestionResponse, isLoading } = useQuestionBankItem(id || '');

  // Mutations
  const createMutation = useCreateQuestionBankItem();
  const updateMutation = useUpdateQuestionBankItem();

  // Initialize form data
  useEffect(() => {
    if (isEditMode && existingQuestionResponse?.data) {
      setQuestionData(existingQuestionResponse.data);
    } else if (!isEditMode) {
      setQuestionData(createDefaultQuestion(QUESTION_TYPE.MULTIPLE_CHOICE));
    }
  }, [isEditMode, existingQuestionResponse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!questionData) {
      toast.error('Missing question data');
      return;
    }

    // Validate question content
    const validation = validateQuestion(questionData);

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      toast.error('Please fix the errors before saving');
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
        const payload: UpdateQuestionPayload = {
          question: questionData,
        };
        await updateMutation.mutateAsync({ id, payload });
        toast.success('Question updated successfully');
      } else {
        const payload: CreateQuestionPayload = {
          question: questionData,
        };
        await createMutation.mutateAsync(payload);
        toast.success('Question created successfully');
      }

      navigate('/question-bank');
    } catch {
      toast.error(isEditMode ? 'Failed to update question' : 'Failed to create question');
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
                {isEditMode ? 'Edit Question' : 'Create Question'}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant={isPreviewMode ? 'default' : 'outline'}
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="gap-2"
              >
                {isPreviewMode ? (
                  <>
                    <Edit3 className="h-4 w-4" />
                    Edit
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    Preview
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending || isPreviewMode}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Metadata Section */}
            {!isPreviewMode && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Settings className="text-primary h-5 w-5" />
                  <h3 className="text-lg font-semibold">Question Settings</h3>
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
                        {getAllQuestionTypes({ includeGroup: true }).map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
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
                        {getAllDifficulties().map((difficulty) => (
                          <SelectItem key={difficulty.value} value={difficulty.value}>
                            {difficulty.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Grade</Label>
                    <Select
                      value={questionData.grade || ''}
                      onValueChange={(value) =>
                        setQuestionData({ ...questionData, grade: value || undefined })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select grade (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAllGrades().map((grade) => (
                          <SelectItem key={grade.code} value={grade.code}>
                            {grade.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Validation Errors */}
            {!isPreviewMode && validationErrors.length > 0 && (
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

              <QuestionRenderer
                question={questionData as Question}
                viewMode={isPreviewMode ? 'viewing' : 'editing'}
                onChange={(updated) => setQuestionData({ ...questionData, ...updated })}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
