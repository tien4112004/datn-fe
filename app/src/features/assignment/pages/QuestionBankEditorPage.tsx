import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { Separator } from '@/shared/components/ui/separator';
import { Collapsible, CollapsibleContent } from '@/shared/components/ui/collapsible';
import {
  useCreateQuestion,
  useUpdateQuestion,
  useQuestionBankItem,
  useQuestionBankChapters,
} from '@/features/assignment/hooks/useQuestionBankApi';
import { useContext } from '@/features/assignment/hooks/useContextApi';
import { ContextSelector } from '@/features/assignment/components/context/ContextSelector';
import { MarkdownPreview } from '@/features/question/components/shared/MarkdownPreview';
import type { CreateQuestionRequest, Question, QuestionBankItem } from '@/features/assignment/types';
import {
  DIFFICULTY,
  getAllDifficulties,
  getAllQuestionTypes,
  getAllSubjects,
  getAllGrades,
  QUESTION_TYPE,
  SUBJECT_CODE,
  type Difficulty,
  type QuestionType,
  type SubjectCode,
} from '@aiprimary/core';
import { VIEW_MODE } from '@/features/assignment/types';
import { QuestionRenderer } from '@/features/question';
import { generateId } from '@/shared/lib/utils';
import { toast } from 'sonner';
import {
  AlertCircle,
  Save,
  Settings,
  FileText,
  Eye,
  Edit3,
  BookOpen,
  Unlink,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { validateQuestion } from '@/features/assignment/utils/validateQuestion';
import { useTranslation } from 'react-i18next';

// Helper function to create default question based on type
function createDefaultQuestion(type: QuestionType): QuestionBankItem {
  const baseQuestion = {
    id: generateId(),
    type,
    difficulty: DIFFICULTY.KNOWLEDGE,
    subject: SUBJECT_CODE.MATH,
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

    default:
      return baseQuestion as QuestionBankItem;
  }
}

export function QuestionBankEditorPage() {
  const { t } = useTranslation('questions');
  const { t: tContext } = useTranslation('assignment', { keyPrefix: 'context' });
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();

  const isEditMode = !!id;

  // Form state
  const [questionData, setQuestionData] = useState<QuestionBankItem | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isContextOpen, setIsContextOpen] = useState(true);

  // Fetch existing question if editing
  const { data: existingQuestion, isLoading } = useQuestionBankItem(id || '');

  // Fetch context if contextId is present
  const { data: contextData } = useContext(questionData?.contextId);

  // Mutations
  const createMutation = useCreateQuestion();
  const updateMutation = useUpdateQuestion();

  // Fetch chapters when subject and grade are selected
  const { data: chapters } = useQuestionBankChapters(questionData?.subject, questionData?.grade);

  // Initialize form data
  useEffect(() => {
    if (isEditMode && existingQuestion) {
      setQuestionData(existingQuestion);
    } else if (!isEditMode) {
      setQuestionData(createDefaultQuestion(QUESTION_TYPE.MULTIPLE_CHOICE));
    }
  }, [isEditMode, existingQuestion]);

  // Auto-open context display when context is selected
  useEffect(() => {
    if (questionData?.contextId && contextData) {
      setIsContextOpen(true);
    }
  }, [questionData?.contextId, contextData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!questionData) {
      toast.error(t('editor.missingData'));
      return;
    }

    // Validate question content (cast to Question for validation)
    const validation = validateQuestion(questionData as Question);

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      toast.error(t('editor.fixErrors'));
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
        toast.success(t('editor.updateSuccess'));
      } else {
        const payload: CreateQuestionRequest = {
          question: questionData as any,
        };
        await createMutation.mutateAsync(payload);
        toast.success(t('editor.createSuccess'));
      }

      navigate('/question-bank');
    } catch {
      toast.error(isEditMode ? t('editor.updateError') : t('editor.createError'));
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
        subject: questionData.subject,
      });
    }
  };

  if (isEditMode && isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">{t('editor.loading')}</div>
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
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="scroll-m-20 text-3xl font-semibold tracking-tight">
                {isEditMode ? t('editor.editTitle') : t('editor.createTitle')}
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
                    {t('editor.edit')}
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    {t('editor.preview')}
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleCancel}>
                {t('editor.cancel')}
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending || isPreviewMode}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {createMutation.isPending || updateMutation.isPending ? t('editor.saving') : t('editor.save')}
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
                  <h3 className="text-lg font-semibold">{t('editor.metadataSection')}</h3>
                </div>
                <Separator />

                {/* Question Type - Only for create mode */}
                {!isEditMode && (
                  <div className="space-y-2">
                    <Label>{t('form.questionType')}</Label>
                    <Select value={questionData.type} onValueChange={handleTypeChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {getAllQuestionTypes().map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {t(type.i18nKey as any)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Metadata Row */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>{t('form.subject')}</Label>
                    <Select
                      value={questionData.subject}
                      onValueChange={(value) =>
                        setQuestionData({
                          ...questionData,
                          subject: value as SubjectCode,
                          chapter: undefined,
                        })
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
                    <Label>{t('form.difficulty')}</Label>
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
                            {t(difficulty.i18nKey as any)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{t('form.grade')}</Label>
                    <Select
                      value={questionData.grade || ''}
                      onValueChange={(value) =>
                        setQuestionData({ ...questionData, grade: value || undefined, chapter: undefined })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('form.selectGradeOptional')} />
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

                  <div className="space-y-2">
                    <Label>{t('form.chapter')}</Label>
                    <Select
                      value={questionData.chapter || ''}
                      onValueChange={(value) =>
                        setQuestionData({ ...questionData, chapter: value || undefined })
                      }
                      disabled={!questionData.subject || !questionData.grade}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            !questionData.subject || !questionData.grade
                              ? t('form.selectSubjectGradeFirst')
                              : t('form.selectChapterOptional')
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {chapters?.map((chapter) => (
                          <SelectItem key={chapter.id} value={chapter.name}>
                            {chapter.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}

            {/* Context Section */}
            {!isPreviewMode && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="text-primary h-5 w-5" />
                  <h3 className="text-lg font-semibold">{tContext('readingPassage')}</h3>
                </div>
                <Separator />

                {/* Context Selector */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>{tContext('contextLabel')}</Label>
                    {questionData.contextId && (
                      <div className="flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 gap-1 text-xs"
                          onClick={() => setQuestionData({ ...questionData, contextId: undefined })}
                        >
                          <Unlink className="h-3 w-3" />
                          {tContext('disconnect')}
                        </Button>
                        {contextData && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setIsContextOpen(!isContextOpen)}
                          >
                            {isContextOpen ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                  <ContextSelector
                    value={questionData.contextId}
                    onChange={(contextId) => setQuestionData({ ...questionData, contextId })}
                  />
                  <p className="text-muted-foreground text-xs">{t('editor.contextDescription')}</p>
                </div>

                {/* Context Display */}
                {contextData && (
                  <Collapsible open={isContextOpen} onOpenChange={setIsContextOpen}>
                    <CollapsibleContent>
                      <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                        <div className="space-y-3">
                          {contextData.title && (
                            <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                              {contextData.title}
                            </h4>
                          )}
                          <MarkdownPreview
                            content={contextData.content}
                            className="text-sm text-gray-700 dark:text-gray-300"
                          />
                          {contextData.author && (
                            <p className="text-right text-xs italic text-gray-600 dark:text-gray-400">
                              — {contextData.author}
                            </p>
                          )}
                        </div>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                )}
              </div>
            )}

            {/* Context Display - Preview Mode (Read-only) */}
            {isPreviewMode && contextData && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="text-primary h-5 w-5" />
                  <h3 className="text-lg font-semibold">{tContext('readingPassage')}</h3>
                </div>
                <Separator />
                <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
                  <div className="space-y-3">
                    {contextData.title && (
                      <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                        {contextData.title}
                      </h4>
                    )}
                    <MarkdownPreview
                      content={contextData.content}
                      className="text-sm text-gray-700 dark:text-gray-300"
                    />
                    {contextData.author && (
                      <p className="text-right text-xs italic text-gray-600 dark:text-gray-400">
                        — {contextData.author}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Validation Errors */}
            {!isPreviewMode && validationErrors.length > 0 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>{t('editor.validationErrors')}</AlertTitle>
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
                <h3 className="text-lg font-semibold">{t('editor.contentSection')}</h3>
              </div>
              <Separator />

              <QuestionRenderer
                question={questionData as Question}
                viewMode={isPreviewMode ? VIEW_MODE.VIEWING : VIEW_MODE.EDITING}
                onChange={(updated) => setQuestionData({ ...questionData, ...updated })}
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
