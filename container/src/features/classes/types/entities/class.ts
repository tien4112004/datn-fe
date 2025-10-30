/**
 * Class Entity
 *
 * Represents a class (learning group) in the Vietnamese education system.
 * A class is a group of students learning together, typically 20-45 students,
 * with a homeroom teacher and a set schedule of subjects.
 */

import type { Student } from './student';
import type { Layout } from './layout';

export interface Class {
  id: string;
  name: string; // e.g., "10A1", "11B2"
  grade: number; // 1-12 for Vietnamese education system
  track?: string; // A, B, C for high school tracks
  academicYear: string; // e.g., "2024-2025"
  capacity: number; // maximum students (typically 30-40)
  currentEnrollment: number; // current number of students
  homeroomTeacherId?: string;
  homeroomTeacher?: Teacher; // The homeroom teacher teaches all subjects
  subjects: string[]; // List of subjects taught in this class (must be unique)
  classroom?: string; // physical location
  description?: string;
  students: Student[];
  layout?: Layout;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

/**
 * Teacher Entity
 *
 * Represents a teacher who can teach subjects and optionally serve as homeroom teacher.
 */
export interface Teacher {
  id: string;
  teacherCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  subjects: string[]; // subjects the teacher can teach
  isHomeroomTeacher: boolean;
  homeroomClassId?: string;
  department?: string;
  qualification?: string;
  experience?: number; // years of experience
  status: TeacherStatus;
  createdAt: string;
  updatedAt: string;
}

export type TeacherStatus = 'active' | 'inactive' | 'retired';
