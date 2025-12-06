import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { Student } from '@/features/classes/shared/types';
import { Users } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DroppableArea, DraggableItem } from './SeatingChartCore';

type SeatingChartSidebarProps = {
  unassignedStudents: Student[];
  isDirty: boolean;
  saveSeatingChart: {
    isPending: boolean;
  };
  handleSave: () => void;
};

export const SeatingChartSidebar = ({
  unassignedStudents,
  isDirty,
  saveSeatingChart,
  handleSave,
}: SeatingChartSidebarProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'detail' });

  return (
    <div className="w-full lg:w-80">
      <Card className="border-orange-200 bg-amber-50 p-4">
        <div className="mb-4 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white">
            <Users className="h-4 w-4" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{t('students.unassignedStudents')}</h3>
            <p className="text-muted-foreground text-xs">
              {unassignedStudents.length} {unassignedStudents.length === 1 ? 'student' : 'students'}
            </p>
          </div>
        </div>
        <DroppableArea id="unassigned" data={{ containerId: 'unassigned' }}>
          <div className="max-h-[600px] space-y-2 overflow-y-auto pr-2">
            {unassignedStudents.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-white/50 p-6 text-center">
                <Users className="mb-2 h-8 w-8 text-gray-400" />
                <p className="text-muted-foreground text-sm">{t('students.allStudentsAssigned')}</p>
              </div>
            ) : (
              unassignedStudents.map((student) => (
                <DraggableItem key={student.id} id={student.id} data={{ containerId: 'unassigned' }}>
                  <Card className="h-[72px] border-orange-200 bg-white shadow-sm transition-all hover:scale-[1.02] hover:border-orange-300 hover:shadow-lg">
                    <div className="flex h-full items-center gap-3 p-3">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                        <Users className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <p className="truncate font-medium leading-tight text-gray-900">{student.fullName}</p>
                      </div>
                    </div>
                  </Card>
                </DraggableItem>
              ))
            )}
          </div>
        </DroppableArea>
      </Card>
      <Button
        disabled={!isDirty || saveSeatingChart.isPending}
        onClick={() => handleSave()}
        className="mt-4 w-full"
      >
        {saveSeatingChart.isPending ? t('students.saving') : t('students.saveLayout')}
      </Button>
    </div>
  );
};
