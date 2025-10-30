import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import type { Layout, Student } from '../../types';
import { useSaveSeatingChart, useSeatingChart } from '../../hooks';
import { StudentListView } from './seating-chart/StudentListView';
import { SeatingChartView } from './seating-chart/SeatingChartView';

interface ClassStudentListProps {
  classData: any;
}

const ClassStudentList = ({ classData }: ClassStudentListProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'detail' });
  const [viewMode, setViewMode] = useState('list');
  const [showLayoutConfig, setShowLayoutConfig] = useState(false);
  const { data: initialLayout, isLoading, isError } = useSeatingChart(classData.id);
  const [localLayout, setLocalLayout] = useState<Layout | null>(null);
  const [unassignedStudents, setUnassignedStudents] = useState<any[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const saveSeatingChart = useSaveSeatingChart();

  useEffect(() => {
    if (initialLayout) {
      setLocalLayout(initialLayout);
      setUnassignedStudents(
        classData.students.filter(
          (student: Student) => !initialLayout.seats.some((seat) => seat.studentId === student.id)
        )
      );
      setIsDirty(false);
    }
  }, [initialLayout, classData.students]);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (!over) return;

    const activeContainer = active.data.current?.containerId;
    const overContainer = over.data.current?.containerId;

    if (activeContainer === overContainer) {
      if (activeContainer === 'unassigned') {
        // Reordering within unassigned students list - keep simple drag
        // No need to reorder in unassigned list
        return;
      } else if (activeContainer === 'grid') {
        // Swapping students within the grid
        setLocalLayout((layout) => {
          if (!layout) return null;

          const activeSeatIndex = layout.seats.findIndex((s) => s.id === active.id);
          const overSeatIndex = layout.seats.findIndex((s) => s.id === over.id);

          if (activeSeatIndex === -1 || overSeatIndex === -1) return layout;

          // Create a new seats array with swapped studentIds
          const newSeats = layout.seats.map((seat, index) => {
            if (index === activeSeatIndex) {
              return { ...seat, studentId: layout.seats[overSeatIndex].studentId };
            }
            if (index === overSeatIndex) {
              return { ...seat, studentId: layout.seats[activeSeatIndex].studentId };
            }
            return seat;
          });

          return {
            ...layout,
            seats: newSeats,
          };
        });
      }
    } else {
      // Dragging from unassigned to grid
      if (activeContainer === 'unassigned' && overContainer === 'grid') {
        const studentId = active.id;
        const seatId = over.id;

        // Find the target seat first to check if it's occupied
        const overSeat = localLayout?.seats.find((s) => s.id === seatId);

        // If the target seat has a student, swap them
        if (overSeat && overSeat.studentId) {
          const studentToUnassign = classData.students.find((s: Student) => s.id === overSeat.studentId);

          // Update unassigned students list: remove dragged student, add displaced student
          setUnassignedStudents((students) => {
            const filtered = students.filter((s) => s.id !== studentId);
            if (studentToUnassign) {
              return [...filtered, studentToUnassign];
            }
            return filtered;
          });
        } else {
          // Target seat is empty, just remove the dragged student from unassigned
          setUnassignedStudents((students) => students.filter((s) => s.id !== studentId));
        }

        // Update the layout with the new seat assignment
        setLocalLayout((layout) => {
          if (!layout) return null;

          const newSeats = layout.seats.map((seat) => {
            if (seat.id === seatId) {
              return { ...seat, studentId };
            }
            return seat;
          });

          return { ...layout, seats: newSeats };
        });
      }
      // Dragging from grid to unassigned
      else if (activeContainer === 'grid' && overContainer === 'unassigned') {
        const seatId = active.id;

        // Find the student before updating layout
        const activeSeat = localLayout?.seats.find((s) => s.id === seatId);
        const studentId = activeSeat?.studentId;

        // Update unassigned students first (outside of setLocalLayout)
        if (studentId) {
          const student = classData.students.find((s: Student) => s.id === studentId);
          if (student) {
            setUnassignedStudents((students) => [...students, student]);
          }
        }

        // Then update layout to remove student from seat
        setLocalLayout((layout) => {
          if (!layout) return null;

          const newSeats = layout.seats.map((seat) => {
            if (seat.id === seatId) {
              return { ...seat, studentId: null };
            }
            return seat;
          });

          return { ...layout, seats: newSeats };
        });
      }
    }
    setIsDirty(true);
  };

  const handleSave = () => {
    if (localLayout) {
      saveSeatingChart.mutate(
        { classId: classData.id, layout: localLayout },
        {
          onSuccess: () => {
            setIsDirty(false);
          },
        }
      );
    }
  };

  const handleLayoutChange = (newLayout: Layout) => {
    if (!localLayout) {
      setLocalLayout(newLayout);
      return;
    }
    // When layout dimensions change, regenerate seats
    const totalSeats = newLayout.rows * newLayout.columns;
    const currentSeats = localLayout.seats;

    const newSeats = [];

    // Create new seats grid
    for (let i = 0; i < totalSeats; i++) {
      // Try to preserve existing seat assignment if within range
      if (i < currentSeats.length) {
        newSeats.push(currentSeats[i]);
      } else {
        // Create new empty seat
        newSeats.push({
          id: `seat-${i}`,
          studentId: null,
        });
      }
    }

    // If we're reducing seats, move students from removed seats to unassigned
    if (totalSeats < currentSeats.length) {
      const removedSeats = currentSeats.slice(totalSeats);
      const studentsToUnassign = removedSeats
        .filter((seat) => seat.studentId)
        .map((seat) => classData.students.find((s: Student) => s.id === seat.studentId))
        .filter(Boolean);

      if (studentsToUnassign.length > 0) {
        setUnassignedStudents((prev) => [...prev, ...studentsToUnassign]);
      }
    }

    setLocalLayout({
      ...newLayout,
      seats: newSeats,
    });
    setIsDirty(true);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('students.title', { count: classData.students.length })}</CardTitle>
          <div className="flex gap-2">
            {viewMode === 'seating-chart' && (
              <>
                <Button
                  variant={showLayoutConfig ? 'default' : 'outline'}
                  onClick={() => setShowLayoutConfig(!showLayoutConfig)}
                >
                  {t('students.layoutConfiguration')}
                </Button>
                <Button disabled={!isDirty || saveSeatingChart.isPending} onClick={handleSave}>
                  {saveSeatingChart.isPending ? t('students.saving') : t('students.saveLayout')}
                </Button>
              </>
            )}
            <Button variant={viewMode === 'list' ? 'default' : 'outline'} onClick={() => setViewMode('list')}>
              {t('students.listView')}
            </Button>
            <Button
              variant={viewMode === 'seating-chart' ? 'default' : 'outline'}
              onClick={() => setViewMode('seating-chart')}
            >
              {t('students.seatingChartView')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === 'list' && <StudentListView students={classData.students} />}
          {viewMode === 'seating-chart' && (
            <>
              {isLoading && (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">{t('students.loadingSeatingChart')}</p>
                </div>
              )}
              {isError && (
                <div className="py-8 text-center">
                  <p className="text-destructive">{t('students.errorSeatingChart')}</p>
                </div>
              )}
              {localLayout && (
                <SeatingChartView
                  layout={localLayout}
                  students={classData.students}
                  unassignedStudents={unassignedStudents}
                  onDragEnd={handleDragEnd}
                  onLayoutChange={handleLayoutChange}
                  showLayoutConfig={showLayoutConfig}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClassStudentList;
