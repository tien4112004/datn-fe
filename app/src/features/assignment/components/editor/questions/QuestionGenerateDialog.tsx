import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@ui/dialog';
import { Button } from '@ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@ui/tooltip';
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import { useQuestionGenerateForm } from './useQuestionGenerateForm';
import { QuestionGenerateFormFields } from './QuestionGenerateFormFields';

interface QuestionBankGenerateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided, called with generated questions instead of navigating. */
  onGenerated?: (questions: import('@/features/question-bank/types').QuestionBankItem[]) => void;
  /** Optional initial value for grade field. */
  initialGrade?: string;
  /** Optional initial value for subject field. */
  initialSubject?: string;
}

export function QuestionBankGenerateDialog({
  open,
  onOpenChange,
  onGenerated,
  initialGrade,
  initialSubject,
}: QuestionBankGenerateDialogProps) {
  const navigate = useNavigate();
  const { t } = useTranslation(I18N_NAMESPACES.ASSIGNMENT, {
    keyPrefix: 'teacherQuestionBank.generate',
  });

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
      onOpenChange(false);
      resetForm();

      if (onGenerated) {
        onGenerated(result.questions);
      } else {
        navigate('/question-bank/generated', {
          state: {
            questions: result.questions,
            totalGenerated: result.totalGenerated,
            generationParams: {
              prompt: prompt.trim(),
              grade,
              subject,
              ...(chapter && { chapter }),
            },
          },
        });
      }
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

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  const total = getTotalQuestions();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-2xl rounded-3xl border-2 shadow-xl">
        <TooltipProvider>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              {t('title')}
            </DialogTitle>
            <DialogDescription>{t('description')}</DialogDescription>
          </DialogHeader>

          <div className="max-h-[60vh] space-y-6 overflow-y-auto px-2">
            <QuestionGenerateFormFields
              {...form}
              initialGrade={initialGrade}
              initialSubject={initialSubject}
            />
          </div>

          <DialogFooter>
            <div className="flex w-full flex-col gap-4">
              {isFormValid() && (
                <div className="flex items-center gap-2 text-sm">
                  <Sparkles className="text-primary h-4 w-4" />
                  <span className="font-medium">{t('footer.readyToGenerate')}</span>
                  <span className="text-muted-foreground">
                    {total} {total === 1 ? t('footer.questionSingular') : t('footer.questionPlural')}
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

              <div className="flex items-center justify-end gap-2">
                <Button variant="outline" onClick={handleClose} disabled={generateMutation.isPending}>
                  {t('actions.cancel')}
                </Button>
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
          </DialogFooter>
        </TooltipProvider>
      </DialogContent>
    </Dialog>
  );
}
