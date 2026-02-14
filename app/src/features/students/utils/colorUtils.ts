/**
 * Determine color category based on score
 */
export function getScoreColor(score: number): 'green' | 'amber' | 'red' {
  if (score >= 80) return 'green';
  if (score >= 60) return 'amber';
  return 'red';
}

/**
 * Get Tailwind color classes for a given score
 */
export function getScoreColorClasses(score: number): {
  text: string;
  bg: string;
  border: string;
} {
  const color = getScoreColor(score);

  switch (color) {
    case 'green':
      return {
        text: 'text-green-700 dark:text-green-400',
        bg: 'bg-green-50 dark:bg-green-950',
        border: 'border-green-200 dark:border-green-800',
      };
    case 'amber':
      return {
        text: 'text-amber-700 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-950',
        border: 'border-amber-200 dark:border-amber-800',
      };
    case 'red':
      return {
        text: 'text-red-700 dark:text-red-400',
        bg: 'bg-red-50 dark:bg-red-950',
        border: 'border-red-200 dark:border-red-800',
      };
  }
}
