import { Card } from '@/components/ui/card';
import { DragOverlay } from '@dnd-kit/core';
import { Users } from 'lucide-react';

export const SeatingChartOverlay = ({ activeDragInfo }: { activeDragInfo: any }) => {
  return (
    <DragOverlay style={{ zIndex: 9999 }} dropAnimation={null}>
      {activeDragInfo ? (
        activeDragInfo.source === 'unassigned' ? (
          // Unassigned student style (orange/amber)
          <Card className="h-[72px] border-orange-200 bg-white shadow-2xl">
            <div className="flex h-full items-center gap-3 p-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                <Users className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1 overflow-hidden">
                <p className="truncate font-medium leading-tight text-gray-900">
                  {activeDragInfo.student.fullName}
                </p>
                <p className="text-muted-foreground truncate text-xs leading-tight">
                  {activeDragInfo.student.studentCode}
                </p>
              </div>
            </div>
          </Card>
        ) : (
          // Grid student style (primary/blue)
          <Card className="border-primary/40 h-32 bg-white shadow-2xl">
            <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 p-3 text-center">
              <div className="bg-primary/10 text-primary mb-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full">
                <Users className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p
                  className="overflow-hidden whitespace-nowrap text-sm font-semibold"
                  style={{ textOverflow: 'ellipsis' }}
                >
                  {activeDragInfo.student.fullName}
                </p>
                <p className="text-xs">{activeDragInfo.student.studentCode}</p>
              </div>
            </div>
          </Card>
        )
      ) : null}
    </DragOverlay>
  );
};
