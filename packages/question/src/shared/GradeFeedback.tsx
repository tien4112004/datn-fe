import { CheckCircle2, XCircle, AlertCircle, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Grade } from '@aiprimary/core';
import { cn } from '@ui/lib/utils';

interface GradeFeedbackProps {
  grade?: Grade; // Teacher's grade (optional)
  maxPoints: number; // Maximum points for this question
  autoScore?: number; // Auto-calculated score (fallback)
  isAutoCorrect?: boolean; // Auto-calculated correctness (fallback)
  className?: string;
  hideHeader?: boolean; // Match existing pattern for sub-questions
}

export const GradeFeedback = ({
  grade,
  maxPoints,
  autoScore,
  isAutoCorrect,
  className,
  hideHeader = false,
}: GradeFeedbackProps) => {
  const { t: tQuestions } = useTranslation('questions');
  const { t: tAssignment } = useTranslation('questions', { keyPrefix: 'submissionsResult' });

  if (hideHeader && !grade) {
    return null;
  }

  // Determine if using teacher's grade or auto-calculated
  const isUsingGrade = grade !== undefined;
  const isCorrect = isUsingGrade ? grade.points === maxPoints : isAutoCorrect;
  const isPartialCredit = isUsingGrade && grade.points > 0 && grade.points < maxPoints;
  const score = isUsingGrade ? grade.points : autoScore;

  // Determine banner styling
  let bannerBgColor = 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-100';
  let bannerBorderColor = 'border-red-200 dark:border-red-800';
  let Icon = XCircle;
  let statusText = tQuestions('common.incorrect');

  if (isCorrect) {
    bannerBgColor = 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-100';
    bannerBorderColor = 'border-green-200 dark:border-green-800';
    Icon = CheckCircle2;
    statusText = tQuestions('common.correct');
  } else if (isPartialCredit) {
    bannerBgColor = 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-100';
    bannerBorderColor = 'border-yellow-200 dark:border-yellow-800';
    Icon = AlertCircle;
    statusText = tQuestions('common.partialCredit');
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Score Banner */}
      <div className={cn('flex items-center gap-3 rounded-md border p-3', bannerBgColor, bannerBorderColor)}>
        <Icon className="h-5 w-5 flex-shrink-0" />
        <div className="flex-1">
          <p className="font-medium">{statusText}</p>
          {score !== undefined && (
            <p className="text-sm opacity-80">
              {isUsingGrade
                ? `${tAssignment('youEarned')} ${score}/${maxPoints}`
                : tQuestions('common.scoreDisplay', { score, total: maxPoints })}
            </p>
          )}
        </div>
      </div>

      {/* Teacher Feedback */}
      {grade?.feedback && (
        <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50 p-4 dark:bg-blue-950/20">
          <div className="mb-2 flex items-center gap-2">
            <User className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-900 dark:text-blue-100">
              {tAssignment('teacherFeedback')}
            </span>
          </div>
          <p className="text-sm text-blue-800 dark:text-blue-200">{grade.feedback}</p>
        </div>
      )}
    </div>
  );
};
