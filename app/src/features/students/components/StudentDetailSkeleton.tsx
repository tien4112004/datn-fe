import { Card, CardContent, CardHeader } from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';

/**
 * Skeleton loader for Student Detail Page
 * Follows UX best practice: Use skeleton screens instead of blank loading states
 */
export function StudentDetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Student Info Skeleton */}
      <Card>
        <CardHeader>
          <div className="h-6 w-48 bg-muted rounded" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar and Name */}
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-muted" />
            <div className="space-y-2">
              <div className="h-8 w-48 bg-muted rounded" />
              <div className="h-4 w-32 bg-muted rounded" />
            </div>
          </div>

          <Separator />

          {/* Contact Information Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="h-4 w-4 bg-muted rounded" />
                <div className="h-4 w-40 bg-muted rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics Skeleton */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-muted rounded-lg" />
                <div className="space-y-2 flex-1">
                  <div className="h-3 w-20 bg-muted rounded" />
                  <div className="h-6 w-16 bg-muted rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart Skeleton */}
      <Card>
        <CardHeader>
          <div className="h-6 w-48 bg-muted rounded" />
        </CardHeader>
        <CardContent>
          <div className="h-[250px] bg-muted rounded" />
        </CardContent>
      </Card>
    </div>
  );
}
