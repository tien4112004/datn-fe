import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, AlertDescription, AlertTitle } from '@/shared/components/ui/alert';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { Label } from '@/shared/components/ui/label';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import type { MatrixGapDto } from '@/features/assignment/types/assignment';

interface MatrixGapsSummaryProps {
  gaps: MatrixGapDto[];
  isComplete: boolean;
  onSelectedGapsChange?: (selectedGaps: Set<string>) => void;
  totalMissingQuestions?: number;
}

export function MatrixGapsSummary({
  gaps,
  isComplete,
  onSelectedGapsChange,
  totalMissingQuestions,
}: MatrixGapsSummaryProps) {
  const { t } = useTranslation(I18N_NAMESPACES.ASSIGNMENT, {
    keyPrefix: 'assignmentEditor.fillMatrixGaps',
  });

  const [selectedGaps, setSelectedGaps] = useState<Set<string>>(new Set());

  const handleGapToggle = (gapId: string) => {
    const newSelected = new Set(selectedGaps);
    if (newSelected.has(gapId)) {
      newSelected.delete(gapId);
    } else {
      newSelected.add(gapId);
    }
    setSelectedGaps(newSelected);
    onSelectedGapsChange?.(newSelected);
  };

  const handleSelectAll = () => {
    const newSelected = new Set(gaps.map((_, idx) => idx.toString()));
    setSelectedGaps(newSelected);
    onSelectedGapsChange?.(newSelected);
  };

  const handleClearAll = () => {
    setSelectedGaps(new Set());
    onSelectedGapsChange?.(new Set());
  };

  if (isComplete) {
    return (
      <Alert className="border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950">
        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
        <AlertTitle className="text-green-900 dark:text-green-100">{t('noGaps')}</AlertTitle>
        <AlertDescription className="text-green-800 dark:text-green-200">
          {t('status.allRequirementsMet')}
        </AlertDescription>
      </Alert>
    );
  }

  const totalGaps = gaps.length;
  const totalMissing = totalMissingQuestions ?? gaps.reduce((sum, gap) => sum + gap.gapCount, 0);

  return (
    <div className="space-y-4">
      {/* Summary Alert */}
      <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950">
        <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        <AlertTitle className="text-yellow-900 dark:text-yellow-100">
          {t('gapsFound', { count: totalGaps, total: totalMissing })}
        </AlertTitle>
        <AlertDescription className="text-yellow-800 dark:text-yellow-200">
          {t('selectGaps')}
        </AlertDescription>
      </Alert>

      {/* Gaps List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{t('gapDetails.title')}</h3>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="ghost" onClick={handleSelectAll} className="text-xs">
              {t('actions.selectAll')}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={handleClearAll} className="text-xs">
              {t('actions.clearAll')}
            </Button>
          </div>
        </div>

        {gaps.map((gap, idx) => {
          const gapId = idx.toString();
          const isSelected = selectedGaps.has(gapId);
          const severityColor =
            gap.gapCount >= 5
              ? 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950'
              : gap.gapCount >= 2
                ? 'border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950'
                : 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950';

          return (
            <Card key={gapId} className={`${severityColor} border`}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id={`gap-${gapId}`}
                    checked={isSelected}
                    onCheckedChange={() => handleGapToggle(gapId)}
                    className="mt-1"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap gap-2">
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
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {t('gapDetails.needed', { count: gap.gapCount })}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {t('gapDetails.available', {
                        available: gap.availableCount,
                        required: gap.requiredCount,
                      })}
                    </div>
                  </div>
                  <Label
                    htmlFor={`gap-${gapId}`}
                    className="cursor-pointer whitespace-nowrap text-xs font-medium text-gray-700 dark:text-gray-300"
                  >
                    {isSelected ? t('gapDetails.selected') : t('gapDetails.select')}
                  </Label>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Summary */}
      <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-900">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          <span className="font-medium">{selectedGaps.size}</span> of{' '}
          <span className="font-medium">{totalGaps}</span> gaps selected for generation
        </div>
      </div>
    </div>
  );
}
