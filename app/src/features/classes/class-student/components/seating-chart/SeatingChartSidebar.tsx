import { Button } from '@/components/ui/button';
import type { Student, Layout } from '@/features/classes/shared/types';
import { Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DroppableArea, DraggableItem } from './SeatingChartCore';
import { SeatingChartConfig } from './SeatingChartConfig';

type SeatingChartSidebarProps = {
  unassignedStudents: Student[];
  isDirty: boolean;
  saveSeatingChart: {
    isPending: boolean;
  };
  handleSave: () => void;
  onLayoutChange: (layout: Layout) => void;
  layout: Layout;
  chartRef?: React.RefObject<HTMLDivElement | null>;
  isTeacher?: boolean;
};

export const SeatingChartSidebar = ({
  unassignedStudents,
  isDirty,
  saveSeatingChart,
  handleSave,
  onLayoutChange,
  layout,
  chartRef,
  isTeacher = true,
}: SeatingChartSidebarProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'detail' });

  return (
    <div className="w-full lg:w-72">
      {/* Layout Configuration */}
      {isTeacher && (
        <SeatingChartConfig onLayoutChange={onLayoutChange} layout={layout} chartRef={chartRef} />
      )}

      {/* Unassigned Students */}
      <div className="rounded-lg border bg-orange-50/50 p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-white">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">{t('students.unassignedStudents')}</h3>
            <p className="text-muted-foreground text-xs">{unassignedStudents.length} students</p>
          </div>
        </div>
        {isTeacher ? (
          <DroppableArea id="unassigned" data={{ containerId: 'unassigned' }}>
            <div className="max-h-[500px] space-y-2 overflow-y-auto">
              {unassignedStudents.length === 0 ? (
                <div className="border-muted-foreground/30 bg-background/50 flex flex-col items-center justify-center rounded-md border border-dashed p-6 text-center">
                  <Users className="text-muted-foreground mb-2 h-8 w-8" />
                  <p className="text-muted-foreground text-sm">{t('students.allStudentsAssigned')}</p>
                </div>
              ) : (
                unassignedStudents.map((student) => (
                  <DraggableItem key={student.id} id={student.id} data={{ containerId: 'unassigned' }}>
                    <div className="flex items-center gap-2 rounded-md border border-orange-200 bg-white p-2 transition-all hover:border-orange-300 hover:bg-orange-50">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                        <Users className="h-4 w-4" />
                      </div>
                      <p className="flex-1 truncate text-sm font-medium">{student.fullName}</p>
                    </div>
                  </DraggableItem>
                ))
              )}
            </div>
          </DroppableArea>
        ) : (
          <div className="max-h-[500px] space-y-2 overflow-y-auto">
            {unassignedStudents.length === 0 ? (
              <div className="border-muted-foreground/30 bg-background/50 flex flex-col items-center justify-center rounded-md border border-dashed p-6 text-center">
                <Users className="text-muted-foreground mb-2 h-8 w-8" />
                <p className="text-muted-foreground text-sm">{t('students.allStudentsAssigned')}</p>
              </div>
            ) : (
              unassignedStudents.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center gap-2 rounded-md border border-orange-200 bg-white p-2"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                    <Users className="h-4 w-4" />
                  </div>
                  <p className="flex-1 truncate text-sm font-medium">{student.fullName}</p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      {isTeacher && (
        <Button
          disabled={!isDirty || saveSeatingChart.isPending}
          onClick={() => handleSave()}
          className="mt-3 w-full"
        >
          {saveSeatingChart.isPending ? t('students.saving') : t('students.saveLayout')}
        </Button>
      )}
    </div>
  );
};
