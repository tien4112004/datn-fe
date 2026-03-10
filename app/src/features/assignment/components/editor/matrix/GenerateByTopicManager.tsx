import { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@ui/button';
import { Label } from '@ui/label';
import { Textarea } from '@ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@ui/alert';
import { Checkbox } from '@ui/checkbox';
import { ArrowLeft, AlertCircle, CheckCircle2, Sparkles, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import { AiDisclaimer } from '@/shared/components/common/AiDisclaimer';
import { ModelSelect } from '@/features/model/components/ModelSelect';
import { useModels, MODEL_TYPES } from '@/features/model';
import { GenerateByTopicProgressPanel } from './GenerateByTopicProgressPanel';
import { useAssignmentFormStore } from '../../../stores/useAssignmentFormStore';
import type { MatrixGapDto } from '../../../types/assignment';
import { MatrixGridView } from '../../viewer/MatrixGridView';
import type { AssignmentTopic } from '@aiprimary/core';

interface TopicGroup {
  topicName: string;
  gaps: MatrixGapDto[];
  totalQuestions: number;
}

interface GenerateByTopicManagerProps {
  onClose: () => void;
  onQuestionsAdded?: () => void;
}

export function GenerateByTopicManager({ onClose, onQuestionsAdded }: GenerateByTopicManagerProps) {
  const { t } = useTranslation(I18N_NAMESPACES.ASSIGNMENT, {
    keyPrefix: 'assignmentEditor.generateByTopic',
  });

  const matrix = useAssignmentFormStore((state) => state.matrix);
  const topics = useAssignmentFormStore((state) => state.topics);
  const matrixCells = useAssignmentFormStore((state) => state.matrix);

  const { models, defaultModel, isLoading: isLoadingModels } = useModels(MODEL_TYPES.TEXT);

  const topicGroups = useMemo((): TopicGroup[] => {
    const groupMap = new Map<string, MatrixGapDto[]>();
    (matrix ?? [])
      .filter((cell) => cell.requiredCount > cell.currentCount)
      .forEach((cell) => {
        const gap: MatrixGapDto = {
          topic: cell.topicName,
          difficulty: cell.difficulty,
          questionType: cell.questionType,
          requiredCount: cell.requiredCount,
          availableCount: cell.currentCount,
          gapCount: cell.requiredCount - cell.currentCount,
        };
        const existing = groupMap.get(cell.topicName) || [];
        existing.push(gap);
        groupMap.set(cell.topicName, existing);
      });

    return Array.from(groupMap.entries()).map(([topicName, gaps]) => ({
      topicName,
      gaps,
      totalQuestions: gaps.reduce((sum, g) => sum + g.gapCount, 0),
    }));
  }, [matrix]);

  // Build a quick lookup: topicName → gap count
  const gapsByTopicName = useMemo(
    () => new Map(topicGroups.map((g) => [g.topicName, g.totalQuestions])),
    [topicGroups]
  );

  const isComplete = topicGroups.length === 0;

  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState<Set<string>>(
    () => new Set(topicGroups.map((g) => g.topicName))
  );
  const [frozenTopicGroups, setFrozenTopicGroups] = useState<TopicGroup[]>([]);
  const [selectedModel, setSelectedModel] = useState<{ name: string; provider: string } | undefined>();
  const [additionalPrompt, setAdditionalPrompt] = useState('');

  useEffect(() => {
    if (!selectedModel && defaultModel && !isLoadingModels) {
      setSelectedModel({ name: defaultModel.name, provider: defaultModel.provider });
    }
  }, [defaultModel, isLoadingModels, selectedModel]);

  const handleTopicToggle = (topicName: string) => {
    const newSelected = new Set(selectedTopics);
    if (newSelected.has(topicName)) {
      newSelected.delete(topicName);
    } else {
      newSelected.add(topicName);
    }
    setSelectedTopics(newSelected);
  };

  const handleSelectAll = () => setSelectedTopics(new Set(topicGroups.map((g) => g.topicName)));
  const handleClearAll = () => setSelectedTopics(new Set());

  const handleGenerate = () => {
    if (selectedTopics.size === 0) {
      toast.error(String(t('errors.noTopicsSelected')));
      return;
    }
    if (!selectedModel) {
      toast.error(String(t('errors.modelRequired')));
      return;
    }
    setFrozenTopicGroups(topicGroups.filter((g) => selectedTopics.has(g.topicName)));
    setIsGenerating(true);
  };

  const renderTopicLabel = (topic: AssignmentTopic) => {
    const gapCount = gapsByTopicName.get(topic.name);
    const hasGap = gapCount !== undefined;
    const isSelected = selectedTopics.has(topic.name);

    return (
      <div
        className={`flex items-start gap-2 ${hasGap ? 'cursor-pointer' : ''}`}
        onClick={hasGap ? () => handleTopicToggle(topic.name) : undefined}
      >
        {hasGap && (
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => handleTopicToggle(topic.name)}
            onClick={(e) => e.stopPropagation()}
            className="mt-0.5 shrink-0"
          />
        )}
        <div className="space-y-0.5">
          <div className="flex items-center gap-1.5">
            <span className="whitespace-normal break-words text-sm">{topic.name}</span>
            {topic.hasContext && (
              <span className="gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                <BookOpen className="h-3 w-3 shrink-0" />
              </span>
            )}
          </div>
          {hasGap && (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {String(t('topicSelection.topicGaps', { count: gapCount }))}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isGenerating) {
    return (
      <GenerateByTopicProgressPanel
        topicGroups={frozenTopicGroups}
        model={selectedModel!}
        prompt={additionalPrompt}
        onComplete={() => {
          toast.success(String(t('success', { count: frozenTopicGroups.length })));
          onQuestionsAdded?.();
          onClose();
        }}
        onBack={() => setIsGenerating(false)}
        onError={(error) => {
          toast.error(error);
          setIsGenerating(false);
        }}
      />
    );
  }

  return (
    <div className="space-y-4 px-2">
      {isComplete ? (
        <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle className="text-green-900 dark:text-green-100">
            {String(t('topicSelection.noGaps'))}
          </AlertTitle>
        </Alert>
      ) : (
        <>
          {/* Summary Alert */}
          <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950">
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <AlertTitle className="text-yellow-900 dark:text-yellow-100">
              {String(
                t('topicSelection.totalQuestions', {
                  count: topicGroups.reduce((sum, g) => sum + g.totalQuestions, 0),
                  topics: topicGroups.length,
                })
              )}
            </AlertTitle>
            <AlertDescription className="text-yellow-800 dark:text-yellow-200">
              {String(t('topicSelection.subtitle'))}
            </AlertDescription>
          </Alert>

          {/* Matrix with inline checkboxes + Select All / Clear All */}
          <div className="space-y-2">
            <div className="flex items-center justify-end gap-2">
              <Button type="button" size="sm" variant="ghost" onClick={handleSelectAll} className="text-xs">
                {String(t('actions.selectAll'))}
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={handleClearAll} className="text-xs">
                {String(t('actions.clearAll'))}
              </Button>
            </div>
            <MatrixGridView
              compact
              topics={topics}
              matrixCells={matrixCells}
              renderTopicLabel={renderTopicLabel}
            />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {String(
                t('topicSelection.summary', { selected: selectedTopics.size, total: topicGroups.length })
              )}
            </p>
          </div>

          {/* Model + Prompt */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{String(t('config.model'))}</Label>
              <ModelSelect
                models={models}
                value={selectedModel}
                onValueChange={(value) => setSelectedModel(value as { name: string; provider: string })}
                placeholder={String(t('config.modelPlaceholder'))}
                isLoading={isLoadingModels}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="additional-prompt">{String(t('config.additionalPrompt'))}</Label>
              <Textarea
                id="additional-prompt"
                placeholder={String(t('config.additionalPromptPlaceholder'))}
                value={additionalPrompt}
                onChange={(e) => setAdditionalPrompt(e.target.value)}
                className="min-h-20 resize-none"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">{String(t('config.promptHint'))}</p>
            </div>
          </div>

          <AiDisclaimer />
        </>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button onClick={onClose} variant="outline" className="flex-1">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {String(t('actions.backToMatrix'))}
        </Button>
        {!isComplete && (
          <Button onClick={handleGenerate} className="flex-1" disabled={selectedTopics.size === 0}>
            <Sparkles className="mr-2 h-4 w-4" />
            {String(t('actions.generate'))}
          </Button>
        )}
      </div>
    </div>
  );
}
