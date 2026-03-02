import { School, ClipboardCheck, Users } from 'lucide-react';
import { Card, CardContent } from '@ui/card';
import { useTeacherSummary } from '../hooks/useTeacherSummary';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PendingGradingModal } from './PendingGradingModal';
import { ClassesOverviewModal } from './ClassesOverviewModal';

interface MetricCardProps {
  icon: React.ElementType;
  title: string;
  value: number | string;
  subtitle?: string;
  bgColor: string;
  iconColor: string;
  onClick?: () => void;
  isClickable?: boolean;
  isLoading?: boolean;
}

const MetricCard = ({
  icon: Icon,
  title,
  value,
  subtitle,
  bgColor,
  iconColor,
  onClick,
  isClickable = false,
  isLoading = false,
}: MetricCardProps) => {
  return (
    <Card
      className={`group transition-all ${isClickable && !isLoading ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-md' : ''}`}
      onClick={!isLoading ? onClick : undefined}
    >
      <CardContent>
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-muted-foreground truncate text-sm font-medium">{title}</p>
            {isLoading ? (
              <div className="bg-muted mt-2 h-9 w-16 max-w-full animate-pulse rounded" />
            ) : (
              <h3 className="mt-2 text-3xl font-bold">{value}</h3>
            )}
            {isLoading ? (
              <div className="bg-muted mt-1 h-3 w-32 max-w-full animate-pulse rounded" />
            ) : (
              subtitle && <p className="text-muted-foreground mt-1 text-xs">{subtitle}</p>
            )}
          </div>
          <div className={`rounded-lg p-3 ${bgColor}`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const SummaryMetrics = () => {
  const { t } = useTranslation('dashboard');
  const { summary, isLoading } = useTeacherSummary();
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [showClassesModal, setShowClassesModal] = useState(false);

  const urgentGrading = summary?.pendingGrading ?? 0;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          icon={School}
          title={t('metrics.totalClasses.title')}
          value={summary?.totalClasses ?? 0}
          subtitle={t('metrics.totalClasses.subtitle', { count: summary?.totalStudents ?? 0 })}
          bgColor="bg-blue-50 dark:bg-blue-950/30"
          iconColor="text-blue-600 dark:text-blue-400"
          onClick={() => setShowClassesModal(true)}
          isClickable
          isLoading={isLoading}
        />

        <MetricCard
          icon={ClipboardCheck}
          title={t('metrics.pendingGrading.title')}
          value={summary?.pendingGrading ?? 0}
          subtitle={
            urgentGrading > 0
              ? t('metrics.pendingGrading.subtitle.urgent', { count: urgentGrading })
              : t('metrics.pendingGrading.subtitle.allGood')
          }
          bgColor="bg-orange-50 dark:bg-orange-950/30"
          iconColor="text-orange-600 dark:text-orange-400"
          onClick={() => setShowGradingModal(true)}
          isClickable
          isLoading={isLoading}
        />

        <MetricCard
          icon={Users}
          title={t('metrics.totalStudents.title')}
          value={summary?.totalStudents ?? 0}
          subtitle={t('metrics.totalStudents.subtitle', { count: summary?.totalClasses ?? 0 })}
          bgColor="bg-purple-50 dark:bg-purple-950/30"
          iconColor="text-purple-600 dark:text-purple-400"
          isLoading={isLoading}
        />
      </div>

      {/* Modals */}
      <PendingGradingModal isOpen={showGradingModal} onClose={() => setShowGradingModal(false)} />
      <ClassesOverviewModal isOpen={showClassesModal} onClose={() => setShowClassesModal(false)} />
    </>
  );
};
