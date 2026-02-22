import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Sparkles, X, Loader2, Info, Check, Plus, AlertCircle, BookOpen } from 'lucide-react';
import { Button } from '@ui/button';
import { Label } from '@ui/label';
import { Textarea } from '@ui/textarea';
import { NumberInput } from '@ui/number-input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@ui/tooltip';
import { MarkdownPreview } from '@aiprimary/question/shared';
import { DIFFICULTY, getAllDifficulties, getAllQuestionTypes } from '@aiprimary/core';
import { ModelSelect } from '@/features/model/components/ModelSelect';
import { MODEL_TYPES, useModels } from '@/features/model';
import { useGenerateQuestionsFromContext } from '@/features/question-bank/hooks/useQuestionBankApi';
import type { QuestionBankItem, GenerateQuestionsFromContextRequest } from '@/features/question-bank/types';
import type { AssignmentQuestionWithTopic, QuestionWithTopic } from '../../../types/assignment';
import { useAssignmentEditorStore } from '../../../stores/useAssignmentEditorStore';
import { useAssignmentFormStore } from '../../../stores/useAssignmentFormStore';
import { generateId } from '@/shared/lib/utils';
import { QuestionGenerateResultPanel } from '../questions/QuestionGenerateResultPanel';

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
  };
}

export const GenerateFromContextManager = () => {
  const { t } = useTranslation('assignment', { keyPrefix: 'assignmentEditor.contextGenerate' });
  const { t: tEditor } = useTranslation('assignment', { keyPrefix: 'assignmentEditor' });

  const setMainView = useAssignmentEditorStore((state) => state.setMainView);
  const currentContextId = useAssignmentEditorStore((state) => state.currentContextId);

  const contexts = useAssignmentFormStore((state) => state.contexts);
  const grade = useAssignmentFormStore((state) => state.grade);
  const subject = useAssignmentFormStore((state) => state.subject);

  const context = useMemo(
    () => contexts.find((c) => c.id === currentContextId),
    [contexts, currentContextId]
  );

  // Form state
  const [prompt, setPrompt] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>(['MULTIPLE_CHOICE']);
  const [questionsPerDifficulty, setQuestionsPerDifficulty] = useState<Record<string, number>>({
    [DIFFICULTY.KNOWLEDGE]: 2,
    [DIFFICULTY.COMPREHENSION]: 2,
    [DIFFICULTY.APPLICATION]: 1,
  });
  const [selectedModel, setSelectedModel] = useState<ModelValue | undefined>();
  const [validationErrors, setValidationErrors] = useState<Record<string, boolean>>({});

  // Result state
  const [showResults, setShowResults] = useState(false);
  const [generationResult, setGenerationResult] = useState<GenerationResult | null>(null);

  const generateMutation = useGenerateQuestionsFromContext();
  const {
    models,
    defaultModel,
    isLoading: isLoadingModels,
    isError: isErrorModels,
  } = useModels(MODEL_TYPES.TEXT);

  const difficulties = getAllDifficulties();
  const questionTypes = getAllQuestionTypes();

  // Auto-select default model
  useEffect(() => {
    if (defaultModel && !selectedModel) {
      setSelectedModel({ name: defaultModel.name, provider: defaultModel.provider });
    }
  }, [defaultModel]);

  const handleTypeToggle = (type: string) => {
    setSelectedTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
  };

  const handleDifficultyCountChange = (difficulty: string, value: number) => {
    setQuestionsPerDifficulty((prev) => ({
      ...prev,
      [difficulty]: Math.max(0, Math.min(50, value)),
    }));
  };

  const getTotalQuestions = () =>
    Object.values(questionsPerDifficulty).reduce((sum, count) => sum + count, 0);

  const isFormValid = () => selectedTypes.length > 0 && getTotalQuestions() > 0;

  const buildRequest = (): GenerateQuestionsFromContextRequest => {
    // Build questionsPerDifficulty in the "count:points" format per type (points default to 0)
    const qpd: Record<string, Record<string, string>> = {};
    for (const [difficulty, count] of Object.entries(questionsPerDifficulty)) {
      if (count > 0) {
        const typeMap: Record<string, string> = {};
        for (const type of selectedTypes) {
          typeMap[type] = `${count}:0`;
        }
        qpd[difficulty] = typeMap;
      }
    }

    return {
      contextContent: context?.content || '',
      contextTitle: context?.title,
      grade: grade || undefined,
      subject: subject || undefined,
      questionsPerDifficulty: qpd,
      ...(prompt.trim() && { prompt: prompt.trim() }),
      ...(selectedModel && { provider: selectedModel.provider.toLowerCase(), model: selectedModel.name }),
    };
  };

  const handleGenerate = async () => {
    const errors: Record<string, boolean> = {};

    if (selectedTypes.length === 0) {
      errors.questionTypes = true;
      toast.error(t('validation.noQuestionTypes'));
    }
    if (getTotalQuestions() === 0) {
      errors.difficulty = true;
      toast.error(t('validation.noQuestionsRequested'));
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
          grade: grade || '',
          subject: subject || '',
        },
      });
      setShowResults(true);
      setValidationErrors({});
      toast.success(t('toast.success', { count: result.totalGenerated }));
    } catch (error: any) {
      toast.error(t('toast.error'));
    }
  };

  const handleApply = React.useCallback(
    (questions: QuestionBankItem[]) => {
      const { addQuestion, topics } = useAssignmentFormStore.getState();

      const defaultTopic = topics[0];
      if (!defaultTopic) {
        toast.error(tEditor('toasts.noTopicError'));
        return;
      }

      questions.forEach((bankItem) => {
        const questionWithTopic = {
          id: generateId(),
          type: bankItem.type,
          difficulty: bankItem.difficulty,
          title: bankItem.title,
          titleImageUrl: bankItem.titleImageUrl,
          explanation: bankItem.explanation,
          data: bankItem.data,
          topicId: defaultTopic.id,
          contextId: currentContextId,
        } as QuestionWithTopic;

        const assignmentQuestion: AssignmentQuestionWithTopic = {
          question: questionWithTopic,
          points: 10,
        };

        addQuestion(assignmentQuestion);
      });

      toast.success(tEditor('toasts.questionsAdded', { count: questions.length }));
      setMainView('contextGroup');
    },
    [tEditor, setMainView, currentContextId]
  );

  const handleClose = React.useCallback(() => {
    setMainView('contextGroup');
  }, [setMainView]);

  // No context found
  if (!context) {
    return (
      <div className="flex min-h-[400px] items-center justify-center border border-dashed border-gray-300 dark:border-gray-700">
        <p className="text-sm text-gray-500">{t('noContext')}</p>
      </div>
    );
  }

  // Show results
  if (showResults && generationResult) {
    return (
      <QuestionGenerateResultPanel
        questions={generationResult.questions}
        totalGenerated={generationResult.totalGenerated}
        generationParams={generationResult.generationParams}
        onBack={() => {
          setShowResults(false);
          setGenerationResult(null);
        }}
        onNewGeneration={() => {
          setShowResults(false);
          setGenerationResult(null);
        }}
        onClose={handleClose}
        onApply={handleApply}
      />
    );
  }

  const total = getTotalQuestions();

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('title')}</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mx-auto max-w-4xl space-y-6">
          {/* Context Preview */}
          <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
            <div className="mb-2 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                {context.title || t('readingPassage')}
              </span>
            </div>
            <div className="max-h-32 overflow-y-auto text-sm text-gray-700 dark:text-gray-300">
              <MarkdownPreview
                content={context.content.slice(0, 300) + (context.content.length > 300 ? '...' : '')}
              />
            </div>
          </div>

          {/* Prompt */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="context-prompt">{t('fields.prompt')}</Label>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="text-muted-foreground h-4 w-4" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{t('fields.promptHelp')}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <Textarea
              id="context-prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t('fields.promptPlaceholder')}
              className="min-h-20 resize-none"
            />
          </div>

          {/* Question Types */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>
                {t('fields.questionTypes')} <span className="text-red-500">*</span>
              </Label>
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
                    if (validationErrors.questionTypes)
                      setValidationErrors((prev) => ({ ...prev, questionTypes: false }));
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
                  <p className="max-w-xs">{t('fields.questionsPerDifficultyHelp')}</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div
              className={`grid grid-cols-3 gap-4 ${validationErrors.difficulty ? 'rounded-md border-2 border-red-500 p-2' : ''}`}
            >
              {difficulties.map((difficulty) => (
                <div key={difficulty.value} className="flex items-center gap-4">
                  <span className="w-32 text-sm font-medium">{difficulty.label}</span>
                  <NumberInput
                    min={0}
                    max={50}
                    value={questionsPerDifficulty[difficulty.value] || 0}
                    onValueChange={(val: number | undefined) => {
                      handleDifficultyCountChange(difficulty.value, val ?? 0);
                      if (validationErrors.difficulty)
                        setValidationErrors((prev) => ({ ...prev, difficulty: false }));
                    }}
                    stepper={1}
                    className="h-9 w-20"
                    aria-label={`${difficulty.label} count`}
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground text-xs">
                {t('fields.total')}{' '}
                <span
                  className={`font-semibold ${total === 0 ? 'text-red-500' : total > 10 ? 'text-orange-500' : 'text-green-600'}`}
                >
                  {total}
                </span>{' '}
                {total === 1 ? t('fields.questionSingular') : t('fields.questionPlural')}
              </p>
              {total > 10 && (
                <p className="flex items-center gap-1 text-xs text-orange-500">
                  <AlertCircle className="h-3 w-3" />
                  {t('fields.largeGenerationWarning')}
                </p>
              )}
            </div>
          </div>

          {/* AI Model */}
          <div className="space-y-2">
            <Label>{t('fields.model')}</Label>
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

        {/* Footer */}
        <div className="border-t px-2 pt-4">
          {isFormValid() && (
            <div className="mb-4 flex items-center gap-2 text-sm">
              <Sparkles className="text-primary h-4 w-4" />
              <span className="font-medium">{t('footer.readyToGenerate')}</span>
              <span className="text-muted-foreground">
                {total} {total === 1 ? t('fields.questionSingular') : t('fields.questionPlural')}
              </span>
              <span className="text-muted-foreground">x</span>
              <span className="text-muted-foreground">
                {selectedTypes.length}{' '}
                {selectedTypes.length === 1 ? t('footer.typeSingular') : t('footer.typePlural')}
              </span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={handleClose} disabled={generateMutation.isPending}>
              {t('actions.cancel')}
            </Button>
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
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};
