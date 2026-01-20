import { cn } from '@/shared/lib/utils';

interface SkeletonCardProps {
  className?: string;
}

function SkeletonCard({ className }: SkeletonCardProps) {
  return (
    <div className={cn('w-full', className)}>
      {/* Thumbnail skeleton with shimmer */}
      <div className="relative mb-3 aspect-video w-full overflow-hidden rounded-lg bg-gray-200">
        <div className="animate-shimmer absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      </div>
      {/* Title skeleton */}
      <div className="relative mb-2 h-4 w-3/4 overflow-hidden rounded bg-gray-200">
        <div className="animate-shimmer absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      </div>
      {/* Date skeleton */}
      <div className="relative h-3 w-1/2 overflow-hidden rounded bg-gray-200">
        <div className="animate-shimmer absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent" />
      </div>
    </div>
  );
}

interface SkeletonGridProps {
  count?: number;
  className?: string;
}

function SkeletonGrid({ count = 10, className }: SkeletonGridProps) {
  return (
    <div
      className={cn(
        'grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5',
        className
      )}
    >
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
}

export { SkeletonCard, SkeletonGrid };
