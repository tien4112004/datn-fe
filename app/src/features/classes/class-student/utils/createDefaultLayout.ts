import type { Layout } from '@/features/classes/shared/types';

/**
 * Creates a default seating chart layout based on student count
 *
 * Layout rules:
 * - 1-12 students: 3 rows × 4 columns (12 seats)
 * - 13-20 students: 4 rows × 5 columns (20 seats)
 * - 21-30 students: 5 rows × 6 columns (30 seats)
 * - 31-40 students: 5 rows × 8 columns (40 seats)
 * - 41+ students: 6 rows × 8 columns (48 seats)
 *
 * All seats are initially empty (studentId = null).
 * Teachers can drag students into seats and reconfigure the layout as needed.
 *
 * @param studentCount - Number of students in the class
 * @returns A Layout object with appropriate dimensions
 *
 * @example
 * ```typescript
 * const layout = createDefaultLayout(15);
 * // Returns: { rows: 4, columns: 5, seats: [...20 seats], separatorInterval: 2 }
 * ```
 */
export function createDefaultLayout(studentCount: number): Layout {
  let rows: number;
  let columns: number;

  if (studentCount <= 12) {
    rows = 3;
    columns = 4;
  } else if (studentCount <= 20) {
    rows = 4;
    columns = 5;
  } else if (studentCount <= 30) {
    rows = 5;
    columns = 6;
  } else if (studentCount <= 40) {
    rows = 5;
    columns = 8;
  } else {
    rows = 6;
    columns = 8;
  }

  const totalSeats = rows * columns;
  const seats = Array.from({ length: totalSeats }, (_, index) => ({
    id: `seat-${index}`,
    studentId: null,
  }));

  return {
    rows,
    columns,
    seats,
    separatorInterval: 2, // Visual separator every 2 columns
  };
}
