import { CheckCircle2, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Submission } from '@aiprimary/core';

interface SubmissionStatusBadgeProps {
  status: Submission['status'];
}

export const SubmissionStatusBadge = ({ status }: SubmissionStatusBadgeProps) => {
  const { t } = useTranslation('assignment', { keyPrefix: 'submissions.status' });

  switch (status) {
    case 'graded':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950 dark:text-green-300">
          <CheckCircle2 className="h-3 w-3" />
          {t('graded')}
        </span>
      );
    case 'submitted':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          <CheckCircle2 className="h-3 w-3" />
          {t('submitted')}
        </span>
      );
    case 'in_progress':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-950 dark:text-gray-300">
          <Clock className="h-3 w-3" />
          {t('inProgress')}
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-950 dark:text-gray-300">
          <Clock className="h-3 w-3" />
          {status}
        </span>
      );
  }
};
