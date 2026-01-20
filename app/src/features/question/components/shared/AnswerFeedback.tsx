import { CheckCircle2, XCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/utils';

interface AnswerFeedbackProps {
  isCorrect: boolean;
  score?: number;
  totalPoints?: number;
  className?: string;
}

export const AnswerFeedback = ({ isCorrect, score, totalPoints, className }: AnswerFeedbackProps) => {
  const { t } = useTranslation('questions');

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-md p-3',
        isCorrect
          ? 'bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-100'
          : 'bg-red-50 text-red-800 dark:bg-red-900/20 dark:text-red-100',
        className
      )}
    >
      {isCorrect ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
      <div>
        <p className="font-medium">{t(isCorrect ? 'common.correct' : 'common.incorrect')}</p>
        {score !== undefined && totalPoints !== undefined && (
          <p className="text-sm opacity-80">{t('common.scoreDisplay', { score, total: totalPoints })}</p>
        )}
      </div>
    </div>
  );
};
