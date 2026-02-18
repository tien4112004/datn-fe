import { Card, CardContent, CardHeader } from '@ui/card';
import { Separator } from '@ui/separator';

/**
 * Skeleton loader for Student Detail Page
 * Follows UX best practice: Use skeleton screens instead of blank loading states
 */
export function StudentDetailSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Student Info Skeleton */}
      <Card>
        <CardHeader>
          <div className="bg-muted h-6 w-48 rounded" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar and Name */}
          <div className="flex items-center gap-4">
            <div className="bg-muted h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <div className="bg-muted h-8 w-48 rounded" />
              <div className="bg-muted h-4 w-32 rounded" />
            </div>
          </div>

          <Separator />

          {/* Contact Information Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="bg-muted h-4 w-4 rounded" />
                <div className="bg-muted h-4 w-40 rounded" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics Skeleton */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-muted h-12 w-12 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <div className="bg-muted h-3 w-20 rounded" />
                  <div className="bg-muted h-6 w-16 rounded" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart Skeleton */}
      <Card>
        <CardHeader>
          <div className="bg-muted h-6 w-48 rounded" />
        </CardHeader>
        <CardContent>
          <div className="bg-muted h-[250px] rounded" />
        </CardContent>
      </Card>
    </div>
  );
}
