import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@ui/button';
import { Label } from '@ui/label';
import { Textarea } from '@ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@ui/card';
import { Badge } from '@ui/badge';
import { Progress } from '@ui/progress';
import { Loader2, ArrowLeft, Sparkles, Check } from 'lucide-react';
import { toast } from 'sonner';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import { useAssignmentFormStore } from '@/features/assignment/stores/useAssignmentFormStore';
import { useGenerateQuestions } from '@/features/question-bank/hooks/useQuestionBankApi';
import { ModelSelect } from '@/features/model/components/ModelSelect';
import { useModels, MODEL_TYPES } from '@/features/model';
import { generateId } from '@/shared/lib/utils';
import type { MatrixGapDto } from '@/features/assignment/types/assignment';
import type { AssignmentQuestionWithTopic, QuestionWithTopic } from '@/features/assignment/types/assignment';
import type { GenerateQuestionsRequest } from '@/features/question-bank/types';

interface FillMatrixGapsPanelProps {
  gaps: MatrixGapDto[];
  onBack: () => void;
  onSuccess: () => void;
}

export function FillMatrixGapsPanel({ gaps, onBack, onSuccess }: FillMatrixGapsPanelProps) {
  const { t } = useTranslation(I18N_NAMESPACES.ASSIGNMENT, {
    keyPrefix: 'assignmentEditor.fillMatrixGaps',
  });

  // Get assignment data and actions
  const subject = useAssignmentFormStore((state) => state.subject);
  const topics = useAssignmentFormStore((state) => state.topics);
  const addQuestion = useAssignmentFormStore((state) => state.addQuestion);

  // State
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [additionalPrompt, setAdditionalPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState<{ name: string; provider: string } | undefined>();
  const [completedCount, setCompletedCount] = useState(0);

  // Models and API
  const { models, defaultModel, isLoading: isLoadingModels } = useModels(MODEL_TYPES.TEXT);
  const generateMutation = useGenerateQuestions();

  // Initialize with default model
  useEffect(() => {
    if (!selectedModel && defaultModel && !isLoadingModels) {
      setSelectedModel({ name: defaultModel.name, provider: defaultModel.provider });
    }
  }, [defaultModel, isLoadingModels, selectedModel]);

  const handleGenerate = async () => {
    if (gaps.length === 0) {
      toast.error(t('errors.noGapsSelected'));
      return;
    }

    if (!selectedModel) {
      toast.error(t('errors.modelRequired'));
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setCompletedCount(0);

    try {
      // Generate questions for each gap
      for (let i = 0; i < gaps.length; i++) {
        const gap = gaps[i];

        // Find topic ID from topic name
        const topicId = topics.find((t) => t.name === gap.topic)?.id || gap.topic;
        const topic = topics.find((t) => t.id === topicId);
        const shouldUseContext = topic?.hasContext || false;

        // Build request for this gap
        const request: GenerateQuestionsRequest = {
          grade: '5', // Default grade, could be parameterized
          topic: gap.topic,
          prompt: `Generate ${gap.gapCount} ${gap.difficulty} level ${gap.questionType} question${gap.gapCount > 1 ? 's' : ''} about ${gap.topic}.${shouldUseContext ? ' Include a reading passage for context.' : ''}${additionalPrompt ? ' ' + additionalPrompt : ''}`,
          subject: subject || 'T',
          questionsPerDifficulty: {
            [gap.difficulty]: gap.gapCount,
          },
          questionTypes: [gap.questionType],
          provider: selectedModel.provider,
          model: selectedModel.name,
        };

        // Call API to generate questions
        const result = await generateMutation.mutateAsync(request);

        // Transform and add questions to store
        result.questions.forEach((bankItem) => {
          const questionWithTopic: QuestionWithTopic = {
            id: generateId(),
            type: bankItem.type,
            difficulty: bankItem.difficulty,
            title: bankItem.title,
            titleImageUrl: bankItem.titleImageUrl,
            explanation: bankItem.explanation,
            data: bankItem.data,
            topicId,
            contextId: bankItem.contextId,
          } as QuestionWithTopic;

          const assignmentQuestion: AssignmentQuestionWithTopic = {
            question: questionWithTopic,
            points: 10,
          };

          addQuestion(assignmentQuestion);
        });

        // Update progress
        setProgress(((i + 1) / gaps.length) * 100);
        setCompletedCount(i + 1);
      }

      // Show success and trigger callback
      toast.success(t('success', { count: gaps.length }));
      onSuccess();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('errors.generationFailed');
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{String(t('title'))}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {String(
            t('gapsFound', { count: gaps.length, total: gaps.reduce((sum, g) => sum + g.gapCount, 0) })
          )}
        </p>
      </div>

      {/* Selected Gaps Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">{String(t('gapDetails.title'))}</CardTitle>
          <CardDescription>{String(t('selectGaps'))}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {gaps.map((gap, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-900"
              >
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {gap.topic}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {gap.difficulty}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {gap.questionType}
                  </Badge>
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {gap.gapCount} needed
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Generation Config */}
      {!isGenerating && (
        <div className="space-y-4">
          {/* AI Model Selection */}
          <div className="space-y-2">
            <Label>{String(t('fields.model'))}</Label>
            <ModelSelect
              models={models}
              value={selectedModel}
              onValueChange={(value) => setSelectedModel(value as any)}
              placeholder={String(t('fields.modelPlaceholder'))}
              isLoading={isLoadingModels}
            />
          </div>

          {/* Additional Prompt */}
          <div className="space-y-2">
            <Label htmlFor="additional-prompt">{String(t('fields.additionalPrompt'))}</Label>
            <Textarea
              id="additional-prompt"
              placeholder={String(t('fields.additionalPromptPlaceholder'))}
              value={additionalPrompt}
              onChange={(e) => setAdditionalPrompt(e.target.value)}
              className="min-h-20 resize-none"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">{String(t('fields.promptHint'))}</p>
          </div>
        </div>
      )}

      {/* Progress */}
      {isGenerating && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {String(t('generatingQuestions', { count: gaps.length }))}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Progress</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {completedCount} / {gaps.length}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            <div className="space-y-2">
              {gaps.map((gap, idx) => (
                <div
                  key={idx}
                  className={`flex items-center gap-2 text-sm ${
                    idx < completedCount
                      ? 'text-green-700 dark:text-green-400'
                      : idx === completedCount
                        ? 'text-blue-700 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {idx < completedCount ? (
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                  ) : idx === completedCount ? (
                    <Loader2 className="h-4 w-4 animate-spin text-blue-600 dark:text-blue-400" />
                  ) : null}
                  <span>
                    {gap.topic} - {gap.difficulty} - {gap.questionType} ({gap.gapCount})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={onBack} variant="outline" disabled={isGenerating} className="flex-1">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {String(t('actions.backToReview'))}
        </Button>
        {!isGenerating && (
          <Button onClick={handleGenerate} className="flex-1" disabled={gaps.length === 0}>
            <Sparkles className="mr-2 h-4 w-4" />
            {String(t('actions.generateQuestions'))}
          </Button>
        )}
      </div>
    </div>
  );
}
