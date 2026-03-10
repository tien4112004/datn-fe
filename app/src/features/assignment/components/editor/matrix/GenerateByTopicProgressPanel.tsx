import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@ui/button';
import { Badge } from '@ui/badge';
import { Progress } from '@ui/progress';
import { Loader2, Check, ArrowLeft, ChevronRight } from 'lucide-react';
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
import type { Context } from '@/features/context';
import { ContextDisplay } from '@/features/context/components/ContextDisplay';

interface TopicGroup {
  topicName: string;
  gaps: MatrixGapDto[];
  totalQuestions: number;
}

interface TopicResult {
  topicName: string;
  context?: Context;
  questions: QuestionBankItem[];
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
  const [isDone, setIsDone] = useState(false);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const runGeneration = async () => {
      setIsGeneratingQuestions(true);

      try {
        for (let i = 0; i < topicGroups.length; i++) {
          const group = topicGroups[i];

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

          // Append grouped result for display
          setTopicResults((prev) => [
            ...prev,
            { topicName: group.topicName, context: result.context, questions: result.questions },
          ]);

          const newContextId = result.context
            ? addContext({ title: result.context.title || '', content: result.context.content || '' })
            : undefined;

          // Add to assignment store
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

  const totalGenerated = topicResults.reduce((sum, r) => sum + r.questions.length, 0);

  return (
    <div className="space-y-6 px-2">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          {String(t('progress.title'))}
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {String(t('progress.generating', { count: topicGroups.length }))}
        </p>
      </div>

      {/* Progress tracker */}
      <div className="space-y-4 rounded-lg border p-4">
        <div className="flex items-center justify-between border-b pb-3">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {String(t('progress.generating', { count: topicGroups.length }))}
          </p>
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {completedCount} / {topicGroups.length}
          </span>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{String(t('progress.progress'))}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        <div className="space-y-2">
          {topicGroups.map((group, idx) => (
            <div
              key={group.topicName}
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
              ) : (
                <span className="h-4 w-4" />
              )}
              <Badge variant="secondary" className="text-xs">
                {group.topicName}
              </Badge>
              <span className="text-xs text-gray-500">({group.totalQuestions} questions)</span>
            </div>
          ))}
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
                  <span className="text-xs text-gray-500">{result.questions.length} questions</span>
                </div>
                {result.context && <ContextDisplay context={result.context} defaultCollapsed />}
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
              {String(t('actions.backToConfig'))}
            </Button>
            <Button onClick={onComplete} className="gap-2">
              {String(t('actions.done'))}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
