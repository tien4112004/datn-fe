import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@ui/button';
import { Badge } from '@ui/badge';
import { Progress } from '@ui/progress';
import { Loader2, Check, ArrowLeft, ChevronRight, XCircle, RotateCcw, BookOpen } from 'lucide-react';
import type { Question } from '@aiprimary/core';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import { AiDisclaimer } from '@/shared/components/common/AiDisclaimer';
import { GeneratedQuestionsResultList } from '@aiprimary/question/shared';
import { QuestionRenderer } from '@/features/question/components/QuestionRenderer';
import { VIEW_MODE, type GenerateQuestionsByTopicRequest } from '@/features/assignment/types';
import { useAssignmentFormStore } from '@/features/assignment/stores/useAssignmentFormStore';
import { useAssignmentEditorStore } from '@/features/assignment/stores/useAssignmentEditorStore';
import { generateId } from '@/shared/lib/utils';
import type { MatrixGapDto } from '@/features/assignment/types/assignment';
import type { QuestionWithTopic, AssignmentQuestionWithTopic } from '@/features/assignment/types/assignment';
import type { QuestionBankItem } from '@/features/question-bank/types';
import { useGenerateQuestionsByTopic } from '@/features/assignment/hooks';
import type { AssignmentContext } from '@aiprimary/core';
import type { Context } from '@/features/context';
import { ContextDisplay } from '@/features/context/components/ContextDisplay';

interface TopicGroup {
  topicName: string;
  gaps: MatrixGapDto[];
  totalQuestions: number;
}

interface TopicResult {
  topicName: string;
  context?: AssignmentContext;
  questions: QuestionBankItem[];
}

interface TopicError {
  topicName: string;
  message: string;
  group: TopicGroup;
}

interface GenerateByTopicProgressPanelProps {
  topicGroups: TopicGroup[];
  model: { name: string; provider: string };
  prompt: string;
  onComplete: () => void;
  onBack: () => void;
  onError: (error: string) => void;
}

export function GenerateByTopicProgressPanel({
  topicGroups,
  model,
  prompt,
  onComplete,
  onBack,
  onError,
}: GenerateByTopicProgressPanelProps) {
  const { t } = useTranslation(I18N_NAMESPACES.ASSIGNMENT, {
    keyPrefix: 'assignmentEditor.generateByTopic',
  });
  const subject = useAssignmentFormStore((state) => state.subject);
  const grade = useAssignmentFormStore((state) => state.grade);
  const topics = useAssignmentFormStore((state) => state.topics);
  const matrix = useAssignmentFormStore((state) => state.matrix);
  const setIsGeneratingQuestions = useAssignmentEditorStore((state) => state.setIsGeneratingQuestions);
  const addQuestion = useAssignmentFormStore((state) => state.addQuestion);
  const addContext = useAssignmentFormStore((state) => state.addContext);

  const generateMutation = useGenerateQuestionsByTopic();

  const [completedCount, setCompletedCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const [topicResults, setTopicResults] = useState<TopicResult[]>([]);
  const [topicErrors, setTopicErrors] = useState<TopicError[]>([]);
  const [isDone, setIsDone] = useState(false);
  const hasStarted = useRef(false);

  const runTopicGeneration = async (group: TopicGroup) => {
    const topic = topics.find((t) => t.name === group.topicName);
    const topicId = topic?.id || group.topicName;

    const questionsPerDifficulty: Record<string, Record<string, string>> = {};
    for (const gap of group.gaps) {
      if (!questionsPerDifficulty[gap.difficulty]) {
        questionsPerDifficulty[gap.difficulty] = {};
      }
      const cell = (matrix ?? []).find(
        (c) =>
          c.topicName === group.topicName &&
          c.difficulty === gap.difficulty &&
          c.questionType === gap.questionType
      );
      const points = cell?.points ?? 10;
      questionsPerDifficulty[gap.difficulty][gap.questionType] = `${gap.gapCount}:${points}`;
    }

    const request: GenerateQuestionsByTopicRequest = {
      grade: grade,
      subject: subject,
      topicName: group.topicName,
      hasContext: topic?.hasContext || false,
      questionsPerDifficulty,
      prompt: prompt || undefined,
      provider: model.provider,
      model: model.name,
    };

    const result = await generateMutation.mutateAsync(request);

    setTopicResults((prev) => [
      ...prev,
      { topicName: group.topicName, context: result.context, questions: result.questions },
    ]);

    const newContextId = result.context
      ? addContext({ title: result.context.title || '', content: result.context.content || '' })
      : undefined;

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
        contextId: newContextId,
      } as QuestionWithTopic;

      addQuestion({ question: questionWithTopic, points: 10 } as AssignmentQuestionWithTopic);
    });
  };

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const runGeneration = async () => {
      setIsGeneratingQuestions(true);

      try {
        for (let i = 0; i < topicGroups.length; i++) {
          const group = topicGroups[i];

          try {
            await runTopicGeneration(group);
          } catch (topicError) {
            const message =
              topicError instanceof Error ? topicError.message : String(t('errors.generationFailed'));
            setTopicErrors((prev) => [...prev, { topicName: group.topicName, message, group }]);
          }

          setCompletedCount(i + 1);
          setProgress(((i + 1) / topicGroups.length) * 100);
        }

        setIsDone(true);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(t('errors.generationFailed'));
        onError(errorMessage);
      } finally {
        setIsGeneratingQuestions(false);
      }
    };

    runGeneration();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const retryTopic = async (errorItem: TopicError) => {
    setTopicErrors((prev) => prev.filter((e) => e.topicName !== errorItem.topicName));
    try {
      await runTopicGeneration(errorItem.group);
    } catch (topicError) {
      const message = topicError instanceof Error ? topicError.message : t('errors.generationFailed');
      setTopicErrors((prev) => [
        ...prev,
        { topicName: errorItem.topicName, message, group: errorItem.group },
      ]);
    }
  };

  const totalGenerated = topicResults.reduce((sum, r) => sum + r.questions.length, 0);

  return (
    <div className="space-y-6 px-2">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('progress.title')}</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('progress.generating', { count: topicGroups.length })}
        </p>
      </div>

      {/* Progress tracker */}
      <div className="space-y-4 rounded-lg border p-4">
        <div className="flex items-center justify-between border-b pb-3">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {t('progress.generating', { count: topicGroups.length })}
          </p>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {completedCount} / {topicGroups.length}
          </span>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{t('progress.progress')}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        <div className="space-y-2">
          {topicGroups.map((group, idx) => {
            const errorItem = topicErrors.find((e) => e.topicName === group.topicName);
            const isError = !!errorItem;
            const isCompleted = !isError && idx < completedCount;
            const isProcessing = !isError && idx === completedCount;
            const topicMeta = topics.find((tp) => tp.name === group.topicName);

            return (
              <div
                key={group.topicName}
                className={`flex items-center gap-2 text-sm ${
                  isError
                    ? 'text-red-600 dark:text-red-400'
                    : isCompleted
                      ? 'text-green-700 dark:text-green-400'
                      : isProcessing
                        ? 'text-blue-700 dark:text-blue-400'
                        : 'text-gray-600 dark:text-gray-400'
                }`}
              >
                {isError ? (
                  <XCircle className="h-4 w-4 shrink-0 text-red-500" />
                ) : isCompleted ? (
                  <Check className="h-4 w-4 shrink-0 text-green-600 dark:text-green-400" />
                ) : isProcessing ? (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin text-blue-600 dark:text-blue-400" />
                ) : (
                  <span className="h-4 w-4 shrink-0" />
                )}
                <Badge variant={isError ? 'destructive' : 'secondary'} className="text-xs">
                  {group.topicName}
                </Badge>
                {topicMeta?.hasContext && (
                  <div className="flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                    <BookOpen className="h-3 w-3 shrink-0" />
                  </div>
                )}
                <span className="text-xs text-gray-500">
                  ({group.totalQuestions} {t('progress.questions')})
                </span>
                {isError && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-auto h-6 gap-1 px-2 text-xs text-red-600 hover:text-red-700 dark:text-red-400"
                    onClick={() => retryTopic(errorItem)}
                  >
                    <RotateCcw className="h-3 w-3" />
                    {t('actions.retry')}
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Generated questions grouped by topic/context */}
      {topicResults.length > 0 && (
        <div className="space-y-6">
          <AiDisclaimer />
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {String(t('progress.generatedCount', { count: totalGenerated }))}
          </p>
          {topicResults.map((result) => (
            <div key={result.topicName} className="space-y-3">
              {/* Topic header */}
              <div className="space-y-2 rounded-lg border p-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {result.topicName}
                  </Badge>
                  {result.context && (
                    <div className="flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                      <BookOpen className="h-3 w-3 shrink-0" />
                      <span>Context</span>
                    </div>
                  )}
                  <span className="text-xs text-gray-500">
                    {result.questions.length} {String(t('progress.questions'))}
                  </span>
                </div>
                {result.context && (
                  <ContextDisplay context={result.context as unknown as Context} defaultCollapsed />
                )}
              </div>

              {/* Questions */}
              <div className="space-y-2">
                <GeneratedQuestionsResultList
                  questions={result.questions}
                  showType={false}
                  showDifficulty={true}
                  renderQuestion={(question, _) => (
                    <QuestionRenderer question={question as Question} viewMode={VIEW_MODE.VIEWING} />
                  )}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Action buttons — only shown when done */}
      {isDone && (
        <div className="border-t pt-4">
          <div className="flex justify-between gap-2">
            <Button variant="outline" onClick={onBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              {t('actions.backToConfig')}
            </Button>
            <Button onClick={onComplete} className="gap-2">
              {t('actions.done')}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
