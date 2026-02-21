import {
  useGenerateQuestions,
  useQuestionBankChapters,
} from '@/features/question-bank/hooks/useQuestionBankApi';
import type { GenerateQuestionsRequest } from '@/features/question-bank/types';
import { MODEL_TYPES, useModels } from '@/features/model';
import { ModelSelect } from '@/features/model/components/ModelSelect';
import { Button } from '@ui/button';
import { Input } from '@ui/input';
import { Label } from '@ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/select';
import { Textarea } from '@ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@ui/tooltip';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import {
  DIFFICULTY,
  getAllDifficulties,
  getAllQuestionTypes,
  getAllSubjects,
  getElementaryGrades,
} from '@aiprimary/core';
import { AlertCircle, Info, Loader2, Sparkles, X, Plus, Check } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import type { QuestionBankItem } from '@/features/question-bank/types';
import { QuestionGenerateResultPanel } from './QuestionGenerateResultPanel';

interface QuestionGeneratePanelProps {
  onClose?: () => void;
  /** Optional initial value for grade field. */
  initialGrade?: string;
  /** Optional initial value for subject field. */
  initialSubject?: string;
  /** When provided, adds an "Add to Assignment" action in results. */
  onApply?: (questions: QuestionBankItem[]) => void;
}

interface ModelValue {
  name: string;
  provider: string;
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

      // Store results and show results panel
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
    setSelectedModel(defaultModel ? { name: defaultModel.name, provider: defaultModel.provider } : undefined);
    setValidationErrors({});
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
                  <label htmlFor={`difficulty-${difficulty.value}`} className="text-muted-foreground text-xs">
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

        {/* Footer Actions */}
        <div className="border-t px-2 pt-4">
          {/* Generation Summary */}
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
