import { TrendingUp, CheckCircle2, Clock, AlertCircle, Target, BarChart3, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@ui/card';
import type { StudentPerformance } from '../types';
import { MetricCard } from './MetricCard';
import { PerformanceTrendChart } from './PerformanceTrendChart';
import { ClassPerformanceRow } from './ClassPerformanceRow';
import { formatPercentage } from '../utils/formatters';

interface StudentPerformanceSectionProps {
  performance: StudentPerformance;
}

/**
 * StudentPerformanceSection Component
 *
 * Design: Data-dense dashboard with clear hierarchy
 * - Grid-based metric cards for quick overview
 * - Performance trends visualization
 * - Per-class breakdown with progress indicators
 * - Responsive layout (2 cols mobile → 5 cols desktop)
 */
export function StudentPerformanceSection({ performance }: StudentPerformanceSectionProps) {
  const { t } = useTranslation('classes');
  const hasPerformanceTrends = performance.performanceTrends && performance.performanceTrends.length > 0;
  const hasClassSummaries = performance.classSummaries && performance.classSummaries.length > 0;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <BarChart3 className="text-muted-foreground h-6 w-6" />
        <div>
          <h2 className="text-2xl font-bold tracking-tight">{t('studentDetail.analytics.title')}</h2>
          <p className="text-muted-foreground text-sm">{t('studentDetail.analytics.subtitle')}</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        <MetricCard
          icon={Target}
          label={t('studentDetail.analytics.metrics.overallAverage')}
          value={formatPercentage(performance.overallAverage, 1)}
          colorScheme="blue"
        />
        <MetricCard
          icon={TrendingUp}
          label={t('studentDetail.analytics.metrics.completionRate')}
          value={formatPercentage(performance.completionRate, 1)}
          colorScheme="green"
        />
        <MetricCard
          icon={CheckCircle2}
          label={t('studentDetail.analytics.metrics.completed')}
          value={performance.completedAssignments}
          colorScheme="green"
        />
        <MetricCard
          icon={Clock}
          label={t('studentDetail.analytics.metrics.pending')}
          value={performance.pendingAssignments}
          colorScheme="amber"
        />
        <MetricCard
          icon={AlertCircle}
          label={t('studentDetail.analytics.metrics.overdue')}
          value={performance.overdueAssignments}
          colorScheme="red"
        />
      </div>

      {/* Performance Trend Chart */}
      {hasPerformanceTrends && (
        <Card className="overflow-hidden transition-shadow duration-200 hover:shadow-md">
          <CardHeader className="bg-muted/30">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  {t('studentDetail.analytics.trends.title')}
                </CardTitle>
                <CardDescription className="mt-1">
                  {t('studentDetail.analytics.trends.subtitle')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <PerformanceTrendChart data={performance.performanceTrends} />
          </CardContent>
        </Card>
      )}

      {/* Class Breakdown */}
      {hasClassSummaries && (
        <Card className="overflow-hidden transition-shadow duration-200 hover:shadow-md">
          <CardHeader className="bg-muted/30">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {t('studentDetail.analytics.byClass.title')}
              </CardTitle>
              <CardDescription className="mt-1">
                {t('studentDetail.analytics.byClass.subtitle', { count: performance.classSummaries.length })}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {performance.classSummaries.map((classSummary, index) => (
              <div key={index}>
                <ClassPerformanceRow classSummary={classSummary} />
                {index < performance.classSummaries.length - 1 && (
                  <div className="border-muted mt-6 border-b" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
