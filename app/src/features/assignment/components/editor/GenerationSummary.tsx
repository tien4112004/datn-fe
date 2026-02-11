import { AlertCircle, Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Badge } from '@/shared/components/ui/badge';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import { getAllDifficulties, getAllQuestionTypes } from '@aiprimary/core';

interface GenerationSummaryProps {
  totalQuestions: number;
  totalPoints: number;
  difficulties: string[];
  questionTypes: string[];
  prompt: string;
}

export function GenerationSummary({
  totalQuestions,
  totalPoints,
  difficulties,
  questionTypes,
  prompt,
}: GenerationSummaryProps) {
  const { t } = useTranslation(I18N_NAMESPACES.ASSIGNMENT, {
    keyPrefix: 'assignmentEditor.generateMatrixDialog',
  });

  const warnings: string[] = [];
  const info: string[] = [];

  if (totalQuestions > 50) {
    warnings.push(t('summary.warnings.largeMatrix'));
  }

  if (difficulties.length === 1) {
    info.push(t('summary.info.singleDifficulty'));
  }

  if (!prompt.trim()) {
    info.push(t('summary.info.emptyPrompt'));
  }

  const allDifficulties = getAllDifficulties();
  const allQuestionTypes = getAllQuestionTypes();

  const difficultyLabels = difficulties
    .map((d) => allDifficulties.find((ad) => ad.value === d)?.label)
    .filter(Boolean) as string[];

  const questionTypeLabels = questionTypes
    .map((qt) => allQuestionTypes.find((aqt) => aqt.value === qt)?.label)
    .filter(Boolean) as string[];

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
      <div className="space-y-3">
        {/* Main Summary */}
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {t('summary.willGenerate', {
            questions: totalQuestions,
            points: totalPoints,
            difficulties: difficulties.length,
            types: questionTypes.length,
          })}
        </p>

        {/* Difficulty Badges */}
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
            {t('fields.difficulties')}
          </p>
          <div className="flex flex-wrap gap-2">
            {difficultyLabels.map((label) => (
              <Badge key={label} variant="secondary" className="text-xs">
                {label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Question Type Badges */}
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
            {t('fields.questionTypes')}
          </p>
          <div className="flex flex-wrap gap-2">
            {questionTypeLabels.map((label) => (
              <Badge key={label} variant="outline" className="text-xs">
                {label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <div className="space-y-1 rounded bg-yellow-50 p-2 dark:bg-yellow-950/20">
            {warnings.map((warning, idx) => (
              <div key={idx} className="flex gap-2 text-xs text-yellow-700 dark:text-yellow-400">
                <AlertCircle className="mt-0.5 h-3 w-3 flex-shrink-0" />
                <span>{warning}</span>
              </div>
            ))}
          </div>
        )}

        {/* Info Messages */}
        {info.length > 0 && (
          <div className="space-y-1 rounded bg-blue-50 p-2 dark:bg-blue-950/20">
            {info.map((message, idx) => (
              <div key={idx} className="flex gap-2 text-xs text-blue-700 dark:text-blue-400">
                <Info className="mt-0.5 h-3 w-3 flex-shrink-0" />
                <span>{message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
