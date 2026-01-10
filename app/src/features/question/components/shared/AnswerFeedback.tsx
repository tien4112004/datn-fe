import { CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '@/shared/lib/utils';

interface AnswerFeedbackProps {
  isCorrect: boolean;
  score?: number;
  totalPoints?: number;
  className?: string;
}

export const AnswerFeedback = ({ isCorrect, score, totalPoints, className }: AnswerFeedbackProps) => {
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
        <p className="font-medium">{isCorrect ? 'Correct!' : 'Incorrect'}</p>
        {score !== undefined && totalPoints !== undefined && (
          <p className="text-sm opacity-80">
            Score: {score}/{totalPoints} points
          </p>
        )}
      </div>
    </div>
  );
};
