/**
 * Loading Skeleton Components for Exam Matrix Feature
 * Reusable skeleton states for tables, cards, and forms
 */

import { Skeleton } from '@/shared/components/ui/skeleton';
import { cn } from '@/shared/lib/utils';
import { getStaggerDelay } from '../constants/animations';

interface TableSkeletonProps {
  rows?: number;
  className?: string;
}

/**
 * Table skeleton for loading states in MatrixTable
 */
export const TableSkeleton = ({ rows = 5, className }: TableSkeletonProps) => {
  return (
    <div className={cn('space-y-2', className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className={cn('flex items-center gap-4 border-b p-4', 'animate-in fade-in', getStaggerDelay(i))}
        >
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
};

interface CardSkeletonProps {
  className?: string;
}

/**
 * Card skeleton for loading states in grid views
 */
export const CardSkeleton = ({ className }: CardSkeletonProps) => {
  return (
    <div className={cn('space-y-3 rounded-lg border p-4', 'animate-in fade-in', className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </div>
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-2 w-full rounded-full" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  );
};

interface GridSkeletonProps {
  cards?: number;
  columns?: number;
  className?: string;
}

/**
 * Grid skeleton for loading states in grid layouts
 */
export const GridSkeleton = ({ cards = 6, columns = 3, className }: GridSkeletonProps) => {
  return (
    <div className={cn('grid gap-4', `grid-cols-${columns}`, className)}>
      {Array.from({ length: cards }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
};

interface FormSkeletonProps {
  fields?: number;
  className?: string;
}

/**
 * Form skeleton for loading states in configuration forms
 */
export const FormSkeleton = ({ fields = 4, className }: FormSkeletonProps) => {
  return (
    <div className={cn('space-y-6', className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className={cn('space-y-2', 'animate-in fade-in', getStaggerDelay(i))}>
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      ))}
    </div>
  );
};

interface StatCardSkeletonProps {
  className?: string;
}

/**
 * Stat card skeleton for loading states in summary cards
 */
export const StatCardSkeleton = ({ className }: StatCardSkeletonProps) => {
  return (
    <div className={cn('space-y-2 rounded-lg border p-3', 'animate-in fade-in', className)}>
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-8 w-16" />
    </div>
  );
};

interface DialogSkeletonProps {
  className?: string;
}

/**
 * Dialog content skeleton for loading states in dialogs
 */
export const DialogSkeleton = ({ className }: DialogSkeletonProps) => {
  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-full" />
      </div>

      {/* Content */}
      <div className="space-y-4">
        <Skeleton className="h-32 w-full rounded-lg" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-2">
        <Skeleton className="h-10 w-20 rounded-md" />
        <Skeleton className="h-10 w-24 rounded-md" />
      </div>
    </div>
  );
};

interface MatrixGridSkeletonProps {
  rows?: number;
  columns?: number;
  className?: string;
}

/**
 * Matrix grid skeleton for loading states in matrix editor
 */
export const MatrixGridSkeleton = ({ rows = 5, columns = 4, className }: MatrixGridSkeletonProps) => {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Grid table */}
      <div className="overflow-auto rounded-lg border">
        <table className="w-full">
          <thead>
            <tr className="bg-muted/50 border-b">
              <th className="p-3">
                <Skeleton className="h-4 w-16" />
              </th>
              {Array.from({ length: columns }).map((_, i) => (
                <th key={i} className="p-3">
                  <Skeleton className="mx-auto h-4 w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }).map((_, rowIdx) => (
              <tr key={rowIdx} className="border-b">
                <td className="p-3">
                  <Skeleton className="h-4 w-24" />
                </td>
                {Array.from({ length: columns }).map((_, colIdx) => (
                  <td key={colIdx} className="p-2">
                    <Skeleton className="h-16 w-full rounded" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface QuestionListSkeletonProps {
  items?: number;
  className?: string;
}

/**
 * Question list skeleton for loading states in question lists
 */
export const QuestionListSkeleton = ({ items = 5, className }: QuestionListSkeletonProps) => {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className={cn('space-y-2 rounded-lg border p-4', 'animate-in fade-in', getStaggerDelay(i))}
        >
          <div className="flex items-start justify-between">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <div className="mt-2 flex gap-2">
            <Skeleton className="h-5 w-12 rounded-full" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
};
