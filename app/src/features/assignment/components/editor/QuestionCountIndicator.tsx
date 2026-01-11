import { Badge } from '@/shared/components/ui/badge';

interface QuestionCountIndicatorProps {
  currentIndex?: number;
  totalQuestions: number;
  onNavigate?: (index: number) => void;
}

export const QuestionCountIndicator = ({ totalQuestions }: QuestionCountIndicatorProps) => {
  if (totalQuestions === 0) {
    return (
      <Badge variant="secondary" className="text-xs">
        No questions yet
      </Badge>
    );
  }

  return (
    <Badge variant="secondary" className="text-xs font-normal">
      {totalQuestions} {totalQuestions === 1 ? 'Question' : 'Questions'}
    </Badge>
  );
};
