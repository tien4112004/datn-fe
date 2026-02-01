import { Badge } from '@/shared/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/utils';
import { DIFFICULTY, type Difficulty, getDifficultyI18nKey } from '@aiprimary/core';

interface DifficultyBadgeProps {
  difficulty: Difficulty;
  className?: string;
}

const difficultyColors: Record<Difficulty, string> = {
  [DIFFICULTY.KNOWLEDGE]:
    'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
  [DIFFICULTY.COMPREHENSION]:
    'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800',
  [DIFFICULTY.APPLICATION]:
    'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800',
};

export const DifficultyBadge = ({ difficulty, className }: DifficultyBadgeProps) => {
  const { t } = useTranslation('questions');

  return (
    <Badge variant="outline" className={cn(difficultyColors[difficulty], className)}>
      {t(getDifficultyI18nKey(difficulty) as any)}
    </Badge>
  );
};
