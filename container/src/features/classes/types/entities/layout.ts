/**
 * Layout Entity
 *
 * Represents the seating arrangement of a classroom.
 */

export interface Layout {
  rows: number;
  columns: number;
  seats: Seat[];
}

/**
 * Seat Entity
 *
 * Represents a single seat in the classroom layout.
 */
export interface Seat {
  id: string;
  studentId: string | null;
}
