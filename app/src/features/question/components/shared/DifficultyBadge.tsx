import { Badge } from '@/shared/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { DIFFICULTY, type Difficulty } from '@/features/assignment/types';
import { cn } from '@/shared/lib/utils';

interface DifficultyBadgeProps {
  difficulty: Difficulty;
  className?: string;
}

const difficultyColors: Record<Difficulty, string> = {
  [DIFFICULTY.EASY]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  [DIFFICULTY.MEDIUM]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  [DIFFICULTY.HARD]: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
  [DIFFICULTY.SUPER_HARD]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
};

const difficultyI18nKeys: Record<Difficulty, string> = {
  [DIFFICULTY.EASY]: 'difficulty.easy',
  [DIFFICULTY.MEDIUM]: 'difficulty.medium',
  [DIFFICULTY.HARD]: 'difficulty.hard',
  [DIFFICULTY.SUPER_HARD]: 'difficulty.superHard',
};

export const DifficultyBadge = ({ difficulty, className }: DifficultyBadgeProps) => {
  const { t } = useTranslation('questions');

  return (
    <Badge variant="outline" className={cn(difficultyColors[difficulty], className)}>
      {t(difficultyI18nKeys[difficulty])}
    </Badge>
  );
};
