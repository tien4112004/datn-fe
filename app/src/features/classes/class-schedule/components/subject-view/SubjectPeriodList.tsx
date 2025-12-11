import { BookOpen, AlertCircle, Loader2 } from 'lucide-react';
import type { SchedulePeriod } from '../../../shared/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useTranslation } from 'react-i18next';
import PeriodItem from '../common/PeriodItem';

interface SubjectPeriodListProps {
  periods: SchedulePeriod[];
  isLoading?: boolean;
  error?: Error | null;
  onPeriodClick?: (period: SchedulePeriod) => void;
}

const SubjectPeriodList = ({
  periods,
  isLoading = false,
  error = null,
  onPeriodClick,
}: SubjectPeriodListProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'schedule' });
  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{t('subjectView.error')}</AlertDescription>
      </Alert>
    );
  }

  // Empty state
  if (periods.length === 0) {
    return (
      <div className="py-8 text-center">
        <BookOpen className="mx-auto mb-4 h-12 w-12 opacity-50" />
        <p className="text-muted-foreground">{t('subjectView.noPeriods')}</p>
      </div>
    );
  }

  // Periods list
  return (
    <div className="space-y-3">
      {periods.map((period) => (
        <PeriodItem key={period.id} period={period} onClick={() => onPeriodClick?.(period)} />
      ))}
    </div>
  );
};

export default SubjectPeriodList;
