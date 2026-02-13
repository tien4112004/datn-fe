import { User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Grade } from '@aiprimary/core';
import { cn } from '@/shared/lib/utils';

interface GradeDisplayProps {
  grade: Grade;
  maxPoints: number;
  className?: string;
}

export const GradeDisplay = ({ grade, maxPoints, className }: GradeDisplayProps) => {
  const { t } = useTranslation('assignment', { keyPrefix: 'submissions.result' });

  const isFullScore = grade.points === maxPoints;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Points Badge */}
      <div className="flex items-center gap-2">
        <span
          className={`rounded px-2 py-0.5 text-xs font-medium ${
            isFullScore
              ? 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300'
              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300'
          }`}
        >
          {t('youEarned')} {grade.points}/{maxPoints}
        </span>
      </div>

      {/* Teacher Feedback */}
      {grade.feedback && (
        <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4 dark:bg-blue-950/20">
          <div className="mb-2 flex items-center gap-2">
            <User className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              {t('teacherFeedback')}
            </span>
          </div>
          <p className="text-sm text-blue-800 dark:text-blue-200">{grade.feedback}</p>
        </div>
      )}
    </div>
  );
};
