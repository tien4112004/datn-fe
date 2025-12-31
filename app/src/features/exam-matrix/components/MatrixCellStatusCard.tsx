import { useTranslation } from 'react-i18next';
import { I18N_NAMESPACES } from '@/shared/i18n/constants';
import type { MatrixCell, Topic } from '@/features/exam-matrix/types';
import type { Difficulty } from '@/features/assignment/types';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';
import { CheckCircle, Circle, AlertCircle } from 'lucide-react';

interface MatrixCellStatusCardProps {
  cell: MatrixCell;
  topic: Topic;
  selectedQuestionCount: number;
  isActive: boolean;
  onClick: () => void;
}

export const MatrixCellStatusCard = ({
  cell,
  topic,
  selectedQuestionCount,
  isActive,
  onClick,
}: MatrixCellStatusCardProps) => {
  const { t } = useTranslation(I18N_NAMESPACES.EXAM_MATRIX);

  const required = cell.requiredQuestionCount;
  const selected = selectedQuestionCount;
  const isFulfilled = selected >= required;
  const isPartial = selected > 0 && selected < required;

  const selectedPoints = selected * cell.pointsPerQuestion;
  const requiredPoints = required * cell.pointsPerQuestion;

  const getDifficultyLabel = (difficulty: Difficulty) => {
    const labels: Record<Difficulty, string> = {
      nhan_biet: t('difficulty.easy'),
      thong_hieu: t('difficulty.medium'),
      van_dung: t('difficulty.hard'),
      van_dung_cao: 'Super Hard',
    };
    return labels[difficulty];
  };

  const getStatusIcon = () => {
    if (isFulfilled) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    } else if (isPartial) {
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    } else {
      return <Circle className="text-muted-foreground h-4 w-4" />;
    }
  };

  const getStatusLabel = () => {
    if (isFulfilled) return t('cellStatus.fulfilled');
    if (isPartial) return t('cellStatus.partial');
    return t('cellStatus.empty');
  };

  const getStatusColor = () => {
    if (isFulfilled) return 'border-green-500 bg-green-50';
    if (isPartial) return 'border-yellow-500 bg-yellow-50';
    return 'border-muted-foreground/20 bg-muted/20';
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full rounded-lg border-2 p-3 text-left transition-all hover:shadow-md',
        isActive ? 'border-primary bg-primary/10 shadow-md' : getStatusColor()
      )}
    >
      <div className="space-y-2">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium">{topic.name}</div>
            <Badge variant="outline" className="mt-1 text-xs">
              {getDifficultyLabel(cell.difficulty)}
            </Badge>
          </div>
          {getStatusIcon()}
        </div>

        {/* Progress */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Questions</span>
            <span
              className={cn(
                'font-medium',
                isFulfilled ? 'text-green-600' : isPartial ? 'text-yellow-600' : ''
              )}
            >
              {t('cellStatus.questionsSelected', { selected, required })}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Points</span>
            <span
              className={cn(
                'font-medium',
                isFulfilled ? 'text-green-600' : isPartial ? 'text-yellow-600' : ''
              )}
            >
              {t('cellStatus.pointsSelected', {
                selected: selectedPoints.toFixed(1),
                required: requiredPoints.toFixed(1),
              })}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="bg-muted relative h-1.5 overflow-hidden rounded-full">
            <div
              className={cn(
                'absolute inset-y-0 left-0 transition-all',
                isFulfilled ? 'bg-green-500' : isPartial ? 'bg-yellow-500' : 'bg-muted-foreground/20'
              )}
              style={{ width: `${Math.min((selected / required) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Status Label */}
        <div className="text-xs font-medium">
          <span
            className={cn(
              isFulfilled ? 'text-green-600' : isPartial ? 'text-yellow-600' : 'text-muted-foreground'
            )}
          >
            {getStatusLabel()}
          </span>
        </div>
      </div>
    </button>
  );
};
