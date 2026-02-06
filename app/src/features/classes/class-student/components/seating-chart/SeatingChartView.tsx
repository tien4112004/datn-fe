import { DndContext, closestCenter } from '@dnd-kit/core';
import type { Layout, Student } from '@/features/classes/shared/types';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/shared/context/auth';
import { SeatingChartSidebar } from './SeatingChartSidebar';
import { SeatingChartGrid } from './SeatingChartGrid';
import { SeatingChartOverlay } from './SeatingChartOverlay';
import { useSaveSeatingChart } from '../../hooks';

interface SeatingChartViewProps {
  classId: string;
  layout: Layout;
  students: Student[];
}

export const SeatingChartView = ({ layout, students, classId }: SeatingChartViewProps) => {
  const { user } = useAuth();
  const [activeId, setActiveId] = useState<string | null>(null);

  const isStudent = user?.role === 'student';
  const isTeacher = !isStudent;

  const [localLayout, setLocalLayout] = useState<Layout | null>(null);
  const [unassignedStudents, setUnassignedStudents] = useState<any[]>([]);

  const [isDirty, setIsDirty] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  const saveSeatingChart = useSaveSeatingChart();

  const handleSave = () => {
    if (localLayout) {
      saveSeatingChart.mutate(
        { classId: classId, layout: localLayout },
        {
          onSuccess: () => {
            setIsDirty(false);
          },
        }
      );
    }
  };

  useEffect(() => {
    if (layout) {
      setLocalLayout(layout);
      setUnassignedStudents(
        students.filter((student: Student) => !layout.seats.some((seat) => seat.studentId === student.id))
      );
      setIsDirty(false);
    }
  }, [layout, students]);

  const handleDragStart = (event: any) => {
    if (!isTeacher) return;
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: any) => {
    if (!isTeacher) return;
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
          const studentToUnassign = students.find((s: Student) => s.id === overSeat.studentId);

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
          const student = students.find((s: Student) => s.id === studentId);
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
    setActiveId(null);
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
        .map((seat) => students.find((s: Student) => s.id === seat.studentId))
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
      {/* Main Seating Chart and Unassigned Students */}
      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Seating Grid */}
        <SeatingChartGrid
          ref={chartRef}
          layout={localLayout || layout}
          students={students}
          isTeacher={isTeacher}
        />
        <SeatingChartSidebar
          unassignedStudents={unassignedStudents}
          isDirty={isDirty}
          saveSeatingChart={saveSeatingChart}
          handleSave={handleSave}
          onLayoutChange={handleLayoutChange}
          layout={localLayout || layout}
          chartRef={chartRef}
          isTeacher={isTeacher}
        />
      </div>

      <SeatingChartOverlay activeDragInfo={activeDragInfo} />
    </DndContext>
  );
};
