import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { cn } from '@/shared/lib/utils';

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  colorScheme?: 'blue' | 'green' | 'amber' | 'red' | 'purple';
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'text-blue-600 dark:text-blue-400',
    iconBg: 'bg-blue-100 dark:bg-blue-900',
    hover: 'hover:border-blue-300 dark:hover:border-blue-700',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-950',
    border: 'border-green-200 dark:border-green-800',
    icon: 'text-green-600 dark:text-green-400',
    iconBg: 'bg-green-100 dark:bg-green-900',
    hover: 'hover:border-green-300 dark:hover:border-green-700',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950',
    border: 'border-amber-200 dark:border-amber-800',
    icon: 'text-amber-600 dark:text-amber-400',
    iconBg: 'bg-amber-100 dark:bg-amber-900',
    hover: 'hover:border-amber-300 dark:hover:border-amber-700',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-950',
    border: 'border-red-200 dark:border-red-800',
    icon: 'text-red-600 dark:text-red-400',
    iconBg: 'bg-red-100 dark:bg-red-900',
    hover: 'hover:border-red-300 dark:hover:border-red-700',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950',
    border: 'border-purple-200 dark:border-purple-800',
    icon: 'text-purple-600 dark:text-purple-400',
    iconBg: 'bg-purple-100 dark:bg-purple-900',
    hover: 'hover:border-purple-300 dark:hover:border-purple-700',
  },
};

/**
 * MetricCard Component
 *
 * Design: Soft UI Evolution with micro-interactions
 * - Subtle hover effects (no layout shift)
 * - Clear visual hierarchy
 * - Accessible color contrast (WCAG AA+)
 * - Smooth transitions (200ms)
 */
export function MetricCard({
  icon: Icon,
  label,
  value,
  colorScheme = 'blue',
  trend,
  trendValue,
}: MetricCardProps) {
  const colors = colorClasses[colorScheme];

  return (
    <Card
      className={cn(
        'border-2 transition-all duration-200',
        colors.bg,
        colors.border,
        colors.hover,
        'hover:shadow-md'
      )}
    >
      <CardContent className="flex items-center gap-4 py-1.5 px-4">
        {/* Icon Container */}
        <div
          className={cn(
            'rounded-lg transition-transform duration-200',
            colors.iconBg,
            'p-2 flex items-center'
          )}
          aria-hidden="true"
        >
          <Icon className={cn('h-6 w-6', colors.icon)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-muted-foreground truncate">
            {label}
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-bold tabular-nums">{value}</p>
            {trend && trendValue && (
              <span
                className={cn(
                  'text-xs font-medium',
                  trend === 'up' && 'text-green-600 dark:text-green-400',
                  trend === 'down' && 'text-red-600 dark:text-red-400',
                  trend === 'neutral' && 'text-muted-foreground'
                )}
              >
                {trendValue}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
