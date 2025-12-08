/**
 * Class Entity
 *
 * Represents a class (learning group) in the Vietnamese education system.
 * A class is a group of students learning together, typically 20-45 students.
 */

import type { Student } from '../../class-student/types/student';

export interface Class {
  id: string;
  name: string; // e.g., "10A1", "11B2"
  grade: number; // 1-12 for Vietnamese education system
  academicYear: string; // e.g., "2024-2025"
  currentEnrollment: number; // current number of students
  teacherId: string; // homeroom teacher
  class?: string; // physical location
  description?: string;
  students: Student[];
  layout?: Layout;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

/**
 * Layout Entity
 *
 * Represents the seating arrangement of a class.
 */

export interface Layout {
  rows: number;
  columns: number;
  seats: Seat[];
  separatorInterval?: number;
}

/**
 * Seat Entity
 *
 * Represents a single seat in the class layout.
 */
export interface Seat {
  id: string;
  studentId: string | null;
}
