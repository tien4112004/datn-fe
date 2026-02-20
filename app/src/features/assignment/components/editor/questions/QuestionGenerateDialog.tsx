import { useState, useEffect } from 'react';
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
import { Label } from '@ui/label';
import { Textarea } from '@ui/textarea';
import { Input } from '@ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@ui/tooltip';
import {
  useGenerateQuestions,
  useQuestionBankChapters,
} from '@/features/question-bank/hooks/useQuestionBankApi';
import { useModels, MODEL_TYPES } from '@/features/model';
import { ModelSelect } from '@/features/model/components/ModelSelect';
import type { GenerateQuestionsRequest } from '@/features/question-bank/types';
import { Sparkles, Loader2, Info, Check, Plus, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import {
  getElementaryGrades,
  getAllSubjects,
  getAllQuestionTypes,
  getAllDifficulties,
  DIFFICULTY,
} from '@aiprimary/core';

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

interface ModelValue {
  name: string;
  provider: string;
}

export function QuestionBankGenerateDialog({
  open,
  onOpenChange,
  onGenerated,
  initialGrade,
  initialSubject,
}: QuestionBankGenerateDialogProps) {
  const navigate = useNavigate();
  const { t } = useTranslation(I18N_NAMESPACES.ASSIGNMENT, { keyPrefix: 'teacherQuestionBank.generate' });

  // Form state
  const [prompt, setPrompt] = useState('');
  const [grade, setGrade] = useState(initialGrade || '');
  const [subject, setSubject] = useState(initialSubject || '');
  const [chapter, setChapter] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['MULTIPLE_CHOICE']);
  const [questionsPerDifficulty, setQuestionsPerDifficulty] = useState<Record<string, number>>({
    [DIFFICULTY.KNOWLEDGE]: 2,
    [DIFFICULTY.COMPREHENSION]: 2,
    [DIFFICULTY.APPLICATION]: 1,
  });
  const [selectedModel, setSelectedModel] = useState<ModelValue | undefined>();
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});

  const generateMutation = useGenerateQuestions();
  const {
    models,
    defaultModel,
    isLoading: isLoadingModels,
    isError: isErrorModels,
  } = useModels(MODEL_TYPES.TEXT);

  // Auto-select default model when models load
  useEffect(() => {
    if (defaultModel && !selectedModel) {
      setSelectedModel({ name: defaultModel.name, provider: defaultModel.provider });
    }
  }, [defaultModel]);

  // Fetch chapters when both subject and grade are selected
  const { data: chapters } = useQuestionBankChapters(subject || undefined, grade || undefined);

  // Get data from core constants
  const grades = getElementaryGrades();
  const subjects = getAllSubjects();
  const questionTypes = getAllQuestionTypes();
  const difficulties = getAllDifficulties();

  const handleTypeToggle = (type: string) => {
    setSelectedTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
  };

  const handleDifficultyChange = (difficulty: string, value: string) => {
    const numValue = parseInt(value, 10) || 0;
    setQuestionsPerDifficulty((prev) => ({
      ...prev,
      [difficulty]: Math.max(0, Math.min(10, numValue)),
    }));
  };

  const getTotalQuestions = () => {
    return Object.values(questionsPerDifficulty).reduce((sum, count) => sum + count, 0);
  };

  const isFormValid = () => {
    return grade.length > 0 && subject.length > 0 && selectedTypes.length > 0 && getTotalQuestions() > 0;
  };

  // Reset chapter when subject or grade changes
  const handleSubjectChange = (value: string) => {
    setSubject(value);
    setChapter('');
  };

  const handleGradeChange = (value: string) => {
    setGrade(value);
    setChapter('');
  };

  const handleGenerate = async () => {
    // Validation
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
    if (Object.keys(errors).length > 0) {
      return;
    }

    // Build questionsPerDifficulty only with non-zero values
    const filteredDifficulties: Record<string, number> = {};
    for (const [key, value] of Object.entries(questionsPerDifficulty)) {
      if (value > 0) {
        filteredDifficulties[key] = value;
      }
    }

    const request: GenerateQuestionsRequest = {
      ...(prompt.trim() && { prompt: prompt.trim() }),
      // TODO: Change this to use the correct topic/prompt field
      topic: chapter || '',
      grade: grade,
      subject,
      questionTypes: selectedTypes,
      questionsPerDifficulty: filteredDifficulties,
      ...(chapter && { chapter }),
      ...(selectedModel && { provider: selectedModel.provider.toLowerCase(), model: selectedModel.name }),
    };

    try {
      const result = await generateMutation.mutateAsync(request);
      onOpenChange(false);
      resetForm();

      if (onGenerated) {
        // Editor context: pass questions to the callback
        onGenerated(result.questions);
      } else {
        // Question bank page context: navigate to generated page
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
      // Handle backend validation errors
      if (error?.response?.data?.errorCode === 'VALIDATION_ERROR' && error?.response?.data?.data) {
        const backendErrors: Record<string, boolean> = {};
        const errorData = error.response.data.data;

        // Map backend field names to frontend validation state
        if (errorData.topic) {
          backendErrors.prompt = true;
        }
        if (errorData.grade) {
          backendErrors.grade = true;
        }
        if (errorData.subject) {
          backendErrors.subject = true;
        }

        setValidationErrors(backendErrors);
        toast.error(error.response.data.message || t('toast.error'));
      } else {
        toast.error(t('toast.error'));
      }
    }
  };

  const resetForm = () => {
    setPrompt('');
    setGrade(initialGrade || '');
    setSubject(initialSubject || '');
    setChapter('');
    setSelectedTypes(['MULTIPLE_CHOICE']);
    setQuestionsPerDifficulty({
      [DIFFICULTY.KNOWLEDGE]: 2,
      [DIFFICULTY.COMPREHENSION]: 2,
      [DIFFICULTY.APPLICATION]: 1,
    });
    setSelectedModel(undefined);
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

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
            {/* Prompt */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="prompt">{t('fields.prompt')}</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="text-muted-foreground h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{t('tooltips.prompt')}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  if (validationErrors.prompt) {
                    setValidationErrors((prev) => ({ ...prev, prompt: false }));
                  }
                }}
                placeholder={t('fields.promptPlaceholder')}
                className={`min-h-20 resize-none ${validationErrors.prompt ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              />
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-xs">{t('fields.promptHelp')}</p>
                <p className="text-muted-foreground text-xs">{prompt.length} / 1000</p>
              </div>
            </div>

            {/* Grade and Subject */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grade">
                  {t('fields.grade')} <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={grade}
                  onValueChange={(value) => {
                    handleGradeChange(value);
                    if (validationErrors.grade) {
                      setValidationErrors((prev) => ({ ...prev, grade: false }));
                    }
                  }}
                  disabled={!!initialGrade}
                >
                  <SelectTrigger className={`w-full ${validationErrors.grade ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder={t('fields.gradePlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {grades.map((g) => (
                      <SelectItem key={g.code} value={g.code}>
                        {g.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">
                  {t('fields.subject')} <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={subject}
                  onValueChange={(value) => {
                    handleSubjectChange(value);
                    if (validationErrors.subject) {
                      setValidationErrors((prev) => ({ ...prev, subject: false }));
                    }
                  }}
                  disabled={!!initialSubject}
                >
                  <SelectTrigger className={`w-full ${validationErrors.subject ? 'border-red-500' : ''}`}>
                    <SelectValue placeholder={t('fields.subjectPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s.code} value={s.code}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Chapter - Optional (only shown when chapters are available) */}
            {chapters && chapters.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="chapter">{t('fields.chapter')}</Label>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Info className="text-muted-foreground h-4 w-4" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">{t('tooltips.chapter')}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Select value={chapter} onValueChange={setChapter}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={t('fields.chapterPlaceholder')} />
                  </SelectTrigger>
                  <SelectContent>
                    {chapters.map((ch) => (
                      <SelectItem key={ch.id} value={ch.name}>
                        {ch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-muted-foreground text-xs">{t('fields.chapterHelp')}</p>
              </div>
            )}

            {/* Question Types */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>
                  {t('fields.questionTypes')} <span className="text-red-500">*</span>
                </Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="text-muted-foreground h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{t('tooltips.questionTypes')}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div
                className={`flex flex-wrap gap-2 rounded-md p-1 ${validationErrors.questionTypes ? 'ring-2 ring-red-500' : ''}`}
              >
                {questionTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => {
                      handleTypeToggle(type.value);
                      if (validationErrors.questionTypes) {
                        setValidationErrors((prev) => ({ ...prev, questionTypes: false }));
                      }
                    }}
                    className={`inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium transition-all duration-200 ${
                      selectedTypes.includes(type.value)
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                  >
                    {selectedTypes.includes(type.value) ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    {type.label}
                  </button>
                ))}
              </div>
              <p className="text-muted-foreground text-xs">{t('fields.questionTypesHelp')}</p>
            </div>

            {/* Questions per Difficulty */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>{t('fields.questionsPerDifficulty')}</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="text-muted-foreground h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{t('tooltips.questionsPerDifficulty')}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div
                className={`grid grid-cols-3 gap-4 ${validationErrors.difficulty ? 'rounded-md border-2 border-red-500 p-2' : ''}`}
              >
                {difficulties.map((difficulty) => (
                  <div key={difficulty.value} className="space-y-1">
                    <label
                      htmlFor={`difficulty-${difficulty.value}`}
                      className="text-muted-foreground text-xs"
                    >
                      {difficulty.label}
                    </label>
                    <Input
                      id={`difficulty-${difficulty.value}`}
                      type="number"
                      min={0}
                      max={10}
                      value={questionsPerDifficulty[difficulty.value] || 0}
                      onChange={(e) => {
                        handleDifficultyChange(difficulty.value, e.target.value);
                        if (validationErrors.difficulty) {
                          setValidationErrors((prev) => ({ ...prev, difficulty: false }));
                        }
                      }}
                      className="h-9"
                    />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-xs">
                  {t('fields.total')}{' '}
                  <span
                    className={`font-semibold ${getTotalQuestions() === 0 ? 'text-red-500' : getTotalQuestions() > 10 ? 'text-orange-500' : 'text-green-600'}`}
                  >
                    {getTotalQuestions()}
                  </span>{' '}
                  {getTotalQuestions() === 1 ? t('fields.questionSingular') : t('fields.questionPlural')}
                </p>
                {getTotalQuestions() > 10 && (
                  <p className="flex items-center gap-1 text-xs text-orange-500">
                    <AlertCircle className="h-3 w-3" />
                    {t('fields.largeGenerationWarning')}
                  </p>
                )}
              </div>
            </div>

            {/* AI Model */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label>{t('fields.model')}</Label>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="text-muted-foreground h-4 w-4" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{t('tooltips.model')}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <ModelSelect
                models={models}
                value={selectedModel}
                onValueChange={(value) => setSelectedModel(value as ModelValue)}
                placeholder={t('fields.modelPlaceholder')}
                className="w-full"
                isLoading={isLoadingModels}
                isError={isErrorModels}
              />
            </div>
          </div>

          <DialogFooter>
            <div className="flex w-full flex-col gap-4">
              {/* Generation Summary */}
              {isFormValid() && (
                <div className="flex items-center gap-2 text-sm">
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
