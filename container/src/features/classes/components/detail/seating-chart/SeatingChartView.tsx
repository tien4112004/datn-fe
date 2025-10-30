import { DndContext, closestCenter, useDraggable, useDroppable, DragOverlay } from '@dnd-kit/core';
import type { Layout, Student } from '../../../types';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Users, Grid3x3, Settings2 } from 'lucide-react';

interface SeatingChartViewProps {
  layout: Layout;
  students: Student[];
  unassignedStudents: Student[];
  onDragEnd: (event: any) => void;
  onLayoutChange: (newLayout: Layout) => void;
  showLayoutConfig?: boolean;
}

const DraggableItem = ({
  id,
  children,
  data,
  disabled = false,
}: {
  id: string;
  children: React.ReactNode;
  data?: any;
  disabled?: boolean;
}) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data,
    disabled,
  });

  const style = {
    cursor: disabled ? 'default' : isDragging ? 'grabbing' : 'grab',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={isDragging ? 'opacity-0' : ''}
    >
      {children}
    </div>
  );
};

const DroppableArea = ({ id, children, data }: { id: string; children: React.ReactNode; data?: any }) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data,
  });

  return (
    <div ref={setNodeRef} className={isOver ? 'ring-primary/50 rounded-lg ring-2 ring-offset-2' : ''}>
      {children}
    </div>
  );
};

export const SeatingChartView = ({
  layout,
  students,
  unassignedStudents,
  onDragEnd,
  onLayoutChange,
  showLayoutConfig = false,
}: SeatingChartViewProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'detail' });
  const [cols, setCols] = useState(layout.columns);
  const [rows, setRows] = useState(layout.rows);
  const [activeId, setActiveId] = useState<string | null>(null);

  const handleApplyLayout = () => {
    onLayoutChange({ ...layout, columns: cols, rows: rows });
  };

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: any) => {
    // Pass the event to parent handler which manages the actual state
    onDragEnd(event);
    // Clear activeId after a brief delay to allow state update to complete
    requestAnimationFrame(() => {
      setActiveId(null);
    });
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  // Get student info and source for the active dragged item
  const getActiveDragInfo = () => {
    if (!activeId) return null;

    // Check if it's a student from unassigned list
    const unassignedStudent = unassignedStudents.find((s) => s.id === activeId);
    if (unassignedStudent) {
      return {
        student: unassignedStudent,
        source: 'unassigned' as const,
      };
    }

    // Check if it's a seat with a student
    const seat = layout.seats.find((seat) => seat.id === activeId);
    if (seat?.studentId) {
      const student = students.find((s) => s.id === seat.studentId);
      if (student) {
        return {
          student,
          source: 'grid' as const,
        };
      }
    }

    return null;
  };

  const activeDragInfo = getActiveDragInfo();

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {/* Layout Configuration Section */}
      {showLayoutConfig && (
        <Card className="border-primary/20 bg-primary/5 mb-10 p-4">
          <div className="flex flex-row gap-4">
            <div className="text-primary flex items-center justify-center gap-2">
              <Settings2 className="h-5 w-5" />
              <h3 className="font-semibold">{t('students.layoutConfiguration')}</h3>
            </div>
            <div className="flex flex-1 items-center gap-4">
              <div className="flex flex-1 items-center gap-2">
                <Label htmlFor="columns" className="flex items-center gap-1.5 text-sm font-medium">
                  <Grid3x3 className="h-4 w-4" />
                  <span className="whitespace-nowrap">{t('students.columns')}</span>
                </Label>
                <Input
                  id="columns"
                  type="number"
                  min="1"
                  max="20"
                  value={cols}
                  onChange={(e) => setCols(Number(e.target.value))}
                  className="h-10 w-full"
                />
              </div>
              <div className="flex flex-1 items-center gap-2">
                <Label htmlFor="rows" className="flex items-center gap-1.5 text-sm font-medium">
                  <Grid3x3 className="h-4 w-4" />
                  <span className="whitespace-nowrap">{t('students.rows')}</span>
                </Label>
                <Input
                  id="rows"
                  type="number"
                  min="1"
                  max="20"
                  value={rows}
                  onChange={(e) => setRows(Number(e.target.value))}
                  className="h-10 w-full"
                />
              </div>
              <Button onClick={handleApplyLayout} className="h-10 min-w-[120px]" variant="default">
                {t('students.applyLayout')}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Main Seating Chart and Unassigned Students */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Seating Grid */}
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

        {/* Unassigned Students Sidebar */}
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
                            <p className="truncate font-medium leading-tight text-gray-900">
                              {student.fullName}
                            </p>
                            <p className="text-muted-foreground truncate text-xs leading-tight">
                              {student.studentCode}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </DraggableItem>
                  ))
                )}
              </div>
            </DroppableArea>
          </Card>
        </div>
      </div>

      {/* DragOverlay - renders the dragged item with high z-index */}
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
    </DndContext>
  );
};
