import { Progress } from '@ui/progress';
import type { ClassSummary } from '../types';
import { getScoreColorClasses } from '../utils/colorUtils';
import { cn } from '@/shared/lib/utils';

interface ClassPerformanceRowProps {
  classSummary: ClassSummary;
}

export function ClassPerformanceRow({ classSummary }: ClassPerformanceRowProps) {
  const colorClasses = getScoreColorClasses(classSummary.averageScore);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="font-medium">{classSummary.className}</h4>
          <p className="text-muted-foreground text-sm">
            {classSummary.completedAssignments} of {classSummary.totalAssignments} assignments completed
          </p>
        </div>
        <div className={cn('text-right', colorClasses.text)}>
          <p className="text-2xl font-bold">{classSummary.averageScore.toFixed(1)}%</p>
        </div>
      </div>
      <Progress value={classSummary.completionRate} className="h-2" />
    </div>
  );
}
