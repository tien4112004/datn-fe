import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChartContainer, ChartTooltip, ChartTooltipContent, PieChart, Pie, Cell } from '@ui/chart';
import type { ChartConfig } from '@ui/chart';
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

    return {
      total,
      graded,
      pending,
      inProgress,
      avgScore,
      highestScore,
      lowestScore,
      distributionCounts,
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
      color: '#ef4444',
    },
    {
      key: 'range7079',
      label: t('submissions.analysis.distribution.range7079') as string,
      count: stats.distributionCounts[1],
      color: '#eab308',
    },
    {
      key: 'range8089',
      label: t('submissions.analysis.distribution.range8089') as string,
      count: stats.distributionCounts[2],
      color: '#3b82f6',
    },
    {
      key: 'range90100',
      label: t('submissions.analysis.distribution.range90100') as string,
      count: stats.distributionCounts[3],
      color: '#22c55e',
    },
  ];

  const chartConfig = {
    below70: { label: distributionItems[0].label, color: '#ef4444' },
    range7079: { label: distributionItems[1].label, color: '#eab308' },
    range8089: { label: distributionItems[2].label, color: '#3b82f6' },
    range90100: { label: distributionItems[3].label, color: '#22c55e' },
  } satisfies ChartConfig;

  const pieData = distributionItems.map((d) => ({ ...d, fill: d.color }));
  const hasScoreData = stats.distributionCounts.some((c) => c > 0);

  return (
    <div className="grid grid-cols-1 gap-0 sm:grid-cols-2 sm:divide-x">
      {/* Left column: Overview + Score stats */}
      <div className="sm:pr-6">
        {/* Overview */}
        <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">
          {t('submissions.analysis.overview.title')}
        </p>
        <div className="overflow-hidden rounded-md border">
          {[
            { label: t('submissions.analysis.overview.total'), value: stats.total },
            { label: t('submissions.analysis.overview.graded'), value: stats.graded },
            { label: t('submissions.analysis.overview.pending'), value: stats.pending },
            { label: t('submissions.analysis.overview.inProgress'), value: stats.inProgress },
            ...(stats.displayMaxScore !== null
              ? [{ label: t('submissions.analysis.overview.maxScore'), value: stats.displayMaxScore }]
              : []),
          ].map((row, i) => (
            <div
              key={i}
              className={`flex items-center justify-between px-3 py-1.5 text-sm ${i % 2 === 0 ? 'bg-muted/40' : ''}`}
            >
              <span className="text-muted-foreground">{row.label}</span>
              <span className="font-semibold tabular-nums">{row.value}</span>
            </div>
          ))}
        </div>

        {/* Score stats */}
        <p className="text-muted-foreground mb-2 mt-4 text-xs font-medium uppercase tracking-wide">
          {t('submissions.analysis.scoreStats.title')}
        </p>
        <div className="overflow-hidden rounded-md border">
          {[
            { label: t('submissions.analysis.scoreStats.average'), value: formatScore(stats.avgScore) },
            { label: t('submissions.analysis.scoreStats.highest'), value: formatScore(stats.highestScore) },
            { label: t('submissions.analysis.scoreStats.lowest'), value: formatScore(stats.lowestScore) },
          ].map((row, i) => (
            <div
              key={i}
              className={`flex items-center justify-between px-3 py-1.5 text-sm ${i % 2 === 0 ? 'bg-muted/40' : ''}`}
            >
              <span className="text-muted-foreground">{row.label}</span>
              <span className="font-semibold tabular-nums">{row.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right column: Pie chart */}
      <div className="mt-5 sm:mt-0 sm:pl-6">
        <p className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">
          {t('submissions.analysis.distribution.title')}
        </p>
        {hasScoreData ? (
          <div className="flex items-center gap-4">
            <ChartContainer config={chartConfig} className="aspect-square min-w-0 max-w-[300px] flex-1">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="label" hideLabel />} />
                <Pie
                  data={pieData}
                  dataKey="count"
                  nameKey="label"
                  innerRadius="38%"
                  outerRadius="70%"
                  strokeWidth={1}
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.key} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="space-y-2">
              {distributionItems.map((item) => (
                <div key={item.key} className="flex items-center gap-2">
                  <span className="h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: item.color }} />
                  <span className="text-xs">{item.label}</span>
                  <span className="text-muted-foreground ml-auto pl-3 text-xs font-semibold">
                    {item.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">—</p>
        )}
      </div>
    </div>
  );
};
