import { useParams } from 'react-router-dom';
import { usePeriod } from './hooks/useApi';
import { PeriodDetailView } from './components/detail/PeriodDetailView';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslation } from 'react-i18next';

export const PeriodDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation('classes');
  const { data: period, isLoading, isError } = usePeriod(id!);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold">{t('errors.general')}</h2>
          <p className="text-muted-foreground">{t('errors.failedToLoadPeriodDetails')}</p>
        </div>
      </div>
    );
  }

  if (!period) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold">{t('errors.periodNotFound')}</h2>
          <p className="text-muted-foreground">{t('errors.periodNotFoundDescription')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mx-12">
        <PeriodDetailView period={period} />
      </div>
    </div>
  );
};
