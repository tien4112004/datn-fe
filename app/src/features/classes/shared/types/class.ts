/**
 * Class Entity
 *
 * Represents a class (learning group) in the Vietnamese education system.
 * A class is a group of students learning together, typically 20-45 students.
 */

import type { Student } from '../../class-student/types/student';

export interface Class {
  id: string;
  ownerId: string; // ID of the teacher/owner who created the class
  name: string; // e.g., "10A1", "11B2"
  description?: string | null;
  joinCode?: string | null; // Unique join code for students to enroll
  settings?: {
    grade?: number;
    academicYear?: string;
    class?: string;
    [key: string]: any;
  } | null; // Class-specific settings
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // Legacy/computed fields for compatibility with existing frontend code
  grade?: number; // 1-12 for Vietnamese education system (deprecated)
  academicYear?: string; // e.g., "2024-2025" (deprecated)
  teacherId?: string; // alias for ownerId (deprecated)
  class?: string; // physical location (deprecated)
  students?: Student[]; // populated from separate endpoint
  layout?: Layout; // populated from separate endpoint
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
