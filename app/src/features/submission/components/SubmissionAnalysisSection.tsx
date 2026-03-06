import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import type { Submission } from '@aiprimary/core';

interface SubmissionAnalysisSectionProps {
  submissions: Submission[];
  maxScore?: number;
}

export const SubmissionAnalysisSection = ({ submissions, maxScore }: SubmissionAnalysisSectionProps) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { t } = useTranslation('assignment') as any;

  const stats = useMemo(() => {
    const total = submissions.length;
    const graded = submissions.filter((s) => s.status === 'graded').length;
    const pending = submissions.filter((s) => s.status === 'submitted' || s.status === 'pending').length;
    const inProgress = submissions.filter((s) => s.status === 'in_progress').length;

    const gradedWithScore = submissions.filter(
      (s) => s.status === 'graded' && s.score !== undefined && s.maxScore !== undefined
    );

    const scores = gradedWithScore.map((s) => (s.score! / s.maxScore!) * 100);

    const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null;
    const highestScore = scores.length > 0 ? Math.max(...scores) : null;
    const lowestScore = scores.length > 0 ? Math.min(...scores) : null;

    const distributionCounts = [
      scores.filter((s) => s < 70).length,
      scores.filter((s) => s >= 70 && s < 80).length,
      scores.filter((s) => s >= 80 && s < 90).length,
      scores.filter((s) => s >= 90).length,
    ];

    const maxDistributionCount = Math.max(...distributionCounts, 1);

    return {
      total,
      graded,
      pending,
      inProgress,
      avgScore,
      highestScore,
      lowestScore,
      distributionCounts,
      maxDistributionCount,
      displayMaxScore: maxScore ?? gradedWithScore[0]?.maxScore ?? null,
    };
  }, [submissions, maxScore]);

  const formatScore = (score: number | null) => {
    if (score === null) return '—';
    return `${Math.round(score)}%`;
  };

  const distributionItems = [
    {
      key: 'below70',
      label: t('submissions.analysis.distribution.below70') as string,
      count: stats.distributionCounts[0],
      barColor: 'bg-destructive/70',
    },
    {
      key: '7079',
      label: t('submissions.analysis.distribution.range7079') as string,
      count: stats.distributionCounts[1],
      barColor: 'bg-yellow-500/70',
    },
    {
      key: '8089',
      label: t('submissions.analysis.distribution.range8089') as string,
      count: stats.distributionCounts[2],
      barColor: 'bg-primary/70',
    },
    {
      key: '90100',
      label: t('submissions.analysis.distribution.range90100') as string,
      count: stats.distributionCounts[3],
      barColor: 'bg-primary',
    },
  ];

  return (
    <div className="divide-y">
      {/* Overview */}
      <div className="pb-4">
        <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">
          {t('submissions.analysis.overview.title')}
        </p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 sm:grid-cols-3">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">{t('submissions.analysis.overview.total')}</span>
            <span className="font-semibold">{stats.total}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">{t('submissions.analysis.overview.graded')}</span>
            <span className="font-semibold">{stats.graded}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">
              {t('submissions.analysis.overview.pending')}
            </span>
            <span className="font-semibold">{stats.pending}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">
              {t('submissions.analysis.overview.inProgress')}
            </span>
            <span className="font-semibold">{stats.inProgress}</span>
          </div>
          {stats.displayMaxScore !== null && (
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">
                {t('submissions.analysis.overview.maxScore')}
              </span>
              <span className="font-semibold">{stats.displayMaxScore}</span>
            </div>
          )}
        </div>
      </div>

      {/* Score Statistics */}
      <div className="py-4">
        <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">
          {t('submissions.analysis.scoreStats.title')}
        </p>
        <div className="grid grid-cols-3 divide-x text-center">
          <div className="pr-4">
            <p className="text-2xl font-bold">{formatScore(stats.avgScore)}</p>
            <p className="text-muted-foreground mt-0.5 text-xs">
              {t('submissions.analysis.scoreStats.average')}
            </p>
          </div>
          <div className="px-4">
            <p className="text-2xl font-bold">{formatScore(stats.highestScore)}</p>
            <p className="text-muted-foreground mt-0.5 text-xs">
              {t('submissions.analysis.scoreStats.highest')}
            </p>
          </div>
          <div className="pl-4">
            <p className="text-2xl font-bold">{formatScore(stats.lowestScore)}</p>
            <p className="text-muted-foreground mt-0.5 text-xs">
              {t('submissions.analysis.scoreStats.lowest')}
            </p>
          </div>
        </div>
      </div>

      {/* Score Distribution */}
      <div className="pt-4">
        <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">
          {t('submissions.analysis.distribution.title')}
        </p>
        <div className="space-y-2.5">
          {distributionItems.map((item) => {
            const pct = (item.count / stats.maxDistributionCount) * 100;
            return (
              <div key={item.key}>
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm">{item.label}</span>
                  <span className="text-muted-foreground text-xs font-semibold">{item.count}</span>
                </div>
                <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${item.barColor}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
