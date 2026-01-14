import { Users } from 'lucide-react';
import { DraggableItem, DroppableArea } from './SeatingChartCore';
import { useTranslation } from 'react-i18next';
import type { Layout, Student } from '@/features/classes/shared/types';
import { Fragment, forwardRef } from 'react';

type SeatingChartGridProps = {
  layout: Layout;
  students: Student[];
};

export const SeatingChartGrid = forwardRef<HTMLDivElement, SeatingChartGridProps>(
  ({ layout, students }, ref) => {
    const { t } = useTranslation('classes', { keyPrefix: 'detail' });

    return (
      <div
        ref={ref}
        className="border-primary/30 bg-accent/20 flex-1 overflow-x-auto rounded-lg border-2 border-dashed p-6"
      >
        <div className="flex flex-col gap-3">
          {Array.from({ length: layout.rows }, (_, rowIndex) => (
            <div key={`row-${rowIndex}`} className="flex gap-3">
              {Array.from({ length: layout.columns }, (_, colIndex) => {
                const seatIndex = rowIndex * layout.columns + colIndex;
                const seat = layout.seats[seatIndex];
                const student = students.find((s) => s.id === seat.studentId);

                return (
                  <Fragment key={seat.id}>
                    <div className="min-w-[120px] flex-1">
                      <DroppableArea id={seat.id} data={{ containerId: 'grid' }}>
                        <DraggableItem id={seat.id} data={{ containerId: 'grid' }} disabled={!student}>
                          <div
                            className={`relative flex h-24 flex-col items-center justify-center gap-1.5 rounded-md border p-2 text-center transition-all ${
                              student
                                ? 'border-primary/30 bg-primary/5 hover:border-primary hover:bg-primary/10'
                                : 'border-muted-foreground/30 bg-muted/30 hover:bg-muted/50 border-dashed'
                            }`}
                          >
                            {student ? (
                              <>
                                <div className="bg-primary/20 text-primary flex h-7 w-7 items-center justify-center rounded-full">
                                  <Users className="h-4 w-4" />
                                </div>
                                <p className="truncate text-xs font-medium leading-tight">
                                  {student.fullName}
                                </p>
                              </>
                            ) : (
                              <>
                                <div className="bg-muted flex h-7 w-7 items-center justify-center rounded-full">
                                  <Users className="text-muted-foreground h-4 w-4" />
                                </div>
                                <p className="text-muted-foreground text-xs">{t('students.emptySeat')}</p>
                              </>
                            )}
                          </div>
                        </DraggableItem>
                      </DroppableArea>
                    </div>
                    {colIndex < layout.columns - 1 &&
                      layout.separatorInterval &&
                      layout.separatorInterval > 0 &&
                      (colIndex + 1) % layout.separatorInterval === 0 && (
                        <div
                          className="mx-2 flex-shrink-0 border-l-2 border-dashed border-gray-300"
                          style={{ height: '128px' }}
                        />
                      )}
                  </Fragment>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    );
  }
);

SeatingChartGrid.displayName = 'SeatingChartGrid';
