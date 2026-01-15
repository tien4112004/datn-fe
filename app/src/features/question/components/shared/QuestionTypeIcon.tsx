import { CheckCircle2, GitMerge, FileText, FileInput, Layers } from 'lucide-react';
import { QUESTION_TYPE, type QuestionType } from '@/features/assignment/types';
import { cn } from '@/shared/lib/utils';

interface QuestionTypeIconProps {
  type: QuestionType;
  className?: string;
}

const iconMap: Record<QuestionType, React.ComponentType<{ className?: string }>> = {
  [QUESTION_TYPE.MULTIPLE_CHOICE]: CheckCircle2,
  [QUESTION_TYPE.MATCHING]: GitMerge,
  [QUESTION_TYPE.OPEN_ENDED]: FileText,
  [QUESTION_TYPE.FILL_IN_BLANK]: FileInput,
  [QUESTION_TYPE.GROUP]: Layers,
};

export const QuestionTypeIcon = ({ type, className }: QuestionTypeIconProps) => {
  const Icon = iconMap[type];
  return <Icon className={cn('h-5 w-5', className)} />;
};
