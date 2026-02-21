import { Button } from '@ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@ui/tooltip';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import { Loader2, Sparkles, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { QuestionBankItem } from '@/features/question-bank/types';
import { QuestionGenerateResultPanel } from './QuestionGenerateResultPanel';
import { useQuestionGenerateForm } from './useQuestionGenerateForm';
import { QuestionGenerateFormFields } from './QuestionGenerateFormFields';

interface QuestionGeneratePanelProps {
  onClose?: () => void;
  /** Optional initial value for grade field. */
  initialGrade?: string;
  /** Optional initial value for subject field. */
  initialSubject?: string;
  /** When provided, adds an "Add to Assignment" action in results. */
  onApply?: (questions: QuestionBankItem[]) => void;
}

interface GenerationResult {
  questions: QuestionBankItem[];
  totalGenerated: number;
  generationParams: {
    prompt: string;
    grade: string;
    subject: string;
    chapter?: string;
  };
}

export function QuestionGeneratePanel({
  onClose,
  initialGrade,
  initialSubject,
  onApply,
}: QuestionGeneratePanelProps) {
  const { t } = useTranslation(I18N_NAMESPACES.ASSIGNMENT, { keyPrefix: 'teacherQuestionBank.generate' });

  // View state
  const [showResults, setShowResults] = useState(false);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);

  const form = useQuestionGenerateForm({ initialGrade, initialSubject });
  const {
    prompt,
    grade,
    subject,
    chapter,
    selectedTypes,
    setValidationErrors,
    getTotalQuestions,
    isFormValid,
    buildRequest,
    resetForm,
    generateMutation,
  } = form;

  const handleGenerate = async () => {
    const errors: Record<string, boolean> = {};

    if (!grade) {
      errors.grade = true;
      toast.error(t('validation.gradeRequired'));
    }
    if (!subject) {
      errors.subject = true;
      toast.error(t('validation.subjectRequired'));
    }
    if (selectedTypes.length === 0) {
      errors.questionTypes = true;
      toast.error(t('toast.noQuestionTypes'));
    }
    if (getTotalQuestions() === 0) {
      errors.difficulty = true;
      toast.error(t('toast.noQuestionsRequested'));
    }

    setValidationErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      const result = await generateMutation.mutateAsync(buildRequest());

      setGenerationResult({
        questions: result.questions,
        totalGenerated: result.totalGenerated,
        generationParams: {
          prompt: prompt.trim(),
          grade,
          subject,
          ...(chapter && { chapter }),
        },
      });
      setShowResults(true);
      setValidationErrors({});
      toast.success(t('toast.success', { count: result.totalGenerated }));
    } catch (error: any) {
      if (error?.response?.data?.errorCode === 'VALIDATION_ERROR' && error?.response?.data?.data) {
        const backendErrors: Record<string, boolean> = {};
        const errorData = error.response.data.data;
        if (errorData.topic) backendErrors.prompt = true;
        if (errorData.grade) backendErrors.grade = true;
        if (errorData.subject) backendErrors.subject = true;
        setValidationErrors(backendErrors);
        toast.error(error.response.data.message || t('toast.error'));
      } else {
        toast.error(t('toast.error'));
      }
    }
  };

  const handleBackToForm = () => {
    setShowResults(false);
    setGenerationResult(null);
  };

  const handleNewGeneration = () => {
    setShowResults(false);
    setGenerationResult(null);
    resetForm();
  };

  // Show results panel if we have results
  if (showResults && generationResult) {
    return (
      <QuestionGenerateResultPanel
        questions={generationResult.questions}
        totalGenerated={generationResult.totalGenerated}
        generationParams={generationResult.generationParams}
        onBack={handleBackToForm}
        onNewGeneration={handleNewGeneration}
        onClose={onClose}
        onApply={onApply}
      />
    );
  }

  // Show generation form
  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('title')}</h2>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Form Content */}
        <div className="mx-auto max-w-4xl space-y-6">
          <QuestionGenerateFormFields {...form} initialGrade={initialGrade} initialSubject={initialSubject} />
        </div>

        {/* Footer Actions */}
        <div className="border-t px-2 pt-4">
          {isFormValid() && (
            <div className="mb-4 flex items-center gap-2 text-sm">
              <Sparkles className="text-primary h-4 w-4" />
              <span className="font-medium">{t('footer.readyToGenerate')}</span>
              <span className="text-muted-foreground">
                {getTotalQuestions()}{' '}
                {getTotalQuestions() === 1 ? t('footer.questionSingular') : t('footer.questionPlural')}
              </span>
              {selectedTypes.length > 0 && (
                <>
                  <span className="text-muted-foreground">•</span>
                  <span className="text-muted-foreground">
                    {selectedTypes.length}{' '}
                    {selectedTypes.length === 1 ? t('footer.typeSingular') : t('footer.typePlural')}
                  </span>
                </>
              )}
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <div className="ml-auto flex gap-2">
              {onClose && (
                <Button variant="outline" onClick={onClose} disabled={generateMutation.isPending}>
                  {t('actions.cancel')}
                </Button>
              )}
              <Tooltip>
                <TooltipTrigger asChild>
                  <span>
                    <Button
                      onClick={handleGenerate}
                      disabled={generateMutation.isPending || !isFormValid()}
                      className="gap-2"
                    >
                      {generateMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {t('actions.generating')}
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          {t('actions.generate')}
                        </>
                      )}
                    </Button>
                  </span>
                </TooltipTrigger>
                {!isFormValid() && (
                  <TooltipContent>
                    <p className="max-w-xs">{t('footer.validationRequired')}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
