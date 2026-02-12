import { School, ClipboardCheck, Users } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { useTeacherSummary } from '../hooks/useTeacherSummary';
import { useState } from 'react';
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
}: MetricCardProps) => {
  return (
    <Card
      className={`group transition-all ${isClickable ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="mt-2 text-3xl font-bold">{value}</h3>
            {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
          </div>
          <div className={`rounded-lg p-3 ${bgColor}`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ShimmerCard = () => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-3">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-8 w-16 animate-pulse rounded bg-muted" />
            <div className="h-3 w-32 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-12 w-12 animate-pulse rounded-lg bg-muted" />
        </div>
      </CardContent>
    </Card>
  );
};

export const SummaryMetrics = () => {
  const { summary, isLoading } = useTeacherSummary();
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [showClassesModal, setShowClassesModal] = useState(false);

  if (isLoading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <ShimmerCard />
        <ShimmerCard />
        <ShimmerCard />
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  const urgentGrading = summary.pendingGrading; // Could be enhanced with urgency calculation

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          icon={School}
          title="Total Classes"
          value={summary.totalClasses}
          subtitle={`${summary.totalStudents} students total`}
          bgColor="bg-blue-50 dark:bg-blue-950/30"
          iconColor="text-blue-600 dark:text-blue-400"
          onClick={() => setShowClassesModal(true)}
          isClickable
        />

        <MetricCard
          icon={ClipboardCheck}
          title="Pending Grading"
          value={summary.pendingGrading}
          subtitle={urgentGrading > 0 ? `${urgentGrading} need attention` : 'All caught up'}
          bgColor="bg-orange-50 dark:bg-orange-950/30"
          iconColor="text-orange-600 dark:text-orange-400"
          onClick={() => setShowGradingModal(true)}
          isClickable
        />

        <MetricCard
          icon={Users}
          title="Total Students"
          value={summary.totalStudents}
          subtitle={`Across ${summary.totalClasses} classes`}
          bgColor="bg-purple-50 dark:bg-purple-950/30"
          iconColor="text-purple-600 dark:text-purple-400"
        />
      </div>

      {/* Modals */}
      <PendingGradingModal isOpen={showGradingModal} onClose={() => setShowGradingModal(false)} />
      <ClassesOverviewModal isOpen={showClassesModal} onClose={() => setShowClassesModal(false)} />
    </>
  );
};
