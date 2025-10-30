import { Users } from 'lucide-react';
import { DraggableItem, DroppableArea } from './SeatingChartCore';
import { Card } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import type { Layout, Student } from '@/features/classes/types';

type SeatingChartGridProps = {
  layout: Layout;
  students: Student[];
};

const SeatingChartGrid = ({ layout, students }: SeatingChartGridProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'detail' });

  return (
    <div className="border-primary/30 bg-accent/20 flex-1 overflow-x-auto rounded-lg border-2 border-dashed p-6">
      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: `repeat(${layout.columns}, 1fr)`,
          gridTemplateRows: `repeat(${layout.rows}, 1fr)`,
          minWidth: `${layout.columns * 140}px`,
        }}
      >
        {layout.seats.map((seat) => {
          const student = students.find((s) => s.id === seat.studentId);
          const hasStudent = !!student;

          return (
            <DroppableArea key={seat.id} id={seat.id} data={{ containerId: 'grid' }}>
              <DraggableItem id={seat.id} data={{ containerId: 'grid' }} disabled={!hasStudent}>
                <Card
                  className={`relative h-32 transition-all duration-200 ${
                    student
                      ? 'border-primary/40 hover:border-primary bg-white shadow-md hover:scale-105 hover:shadow-xl'
                      : 'hover:border-primary/40 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className="flex h-full w-full flex-col items-center justify-center gap-1.5 p-3 text-center">
                    {student ? (
                      <>
                        <div className="bg-primary/10 text-primary mb-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full">
                          <Users className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p
                            className="overflow-hidden whitespace-nowrap text-sm font-semibold"
                            style={{ textOverflow: 'ellipsis' }}
                          >
                            {student.fullName}
                          </p>
                          <p className="text-xs">{student.studentCode}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-200">
                          <Users className="h-5 w-5 text-gray-400" />
                        </div>
                        <p className="text-muted-foreground text-xs">{t('students.emptySeat')}</p>
                      </>
                    )}
                  </div>
                </Card>
              </DraggableItem>
            </DroppableArea>
          );
        })}
      </div>
    </div>
  );
};

export default SeatingChartGrid;
