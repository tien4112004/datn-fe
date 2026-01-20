import { cn } from '@/shared/lib/utils';

interface QuestionNumberProps {
  number: number | string;
  className?: string;
}

export function QuestionNumber({ number, className }: QuestionNumberProps) {
  return (
    <div
      className={cn(
        'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full',
        'bg-blue-100 text-sm font-semibold text-blue-700',
        'dark:bg-blue-900 dark:text-blue-300',
        className
      )}
    >
      {number}
    </div>
  );
}
