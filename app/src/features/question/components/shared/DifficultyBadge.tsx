import { Badge } from '@/shared/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/utils';
import { DIFFICULTY, type Difficulty, getDifficultyI18nKey } from '@aiprimary/core';

interface DifficultyBadgeProps {
  difficulty: Difficulty;
  className?: string;
}

const difficultyColors: Record<Difficulty, string> = {
  [DIFFICULTY.KNOWLEDGE]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
  [DIFFICULTY.COMPREHENSION]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  [DIFFICULTY.APPLICATION]: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
  [DIFFICULTY.ADVANCED_APPLICATION]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100',
};

export const DifficultyBadge = ({ difficulty, className }: DifficultyBadgeProps) => {
  const { t } = useTranslation('questions');

  return (
    <Badge variant="outline" className={cn(difficultyColors[difficulty], className)}>
      {t(getDifficultyI18nKey(difficulty) as any)}
    </Badge>
  );
};
