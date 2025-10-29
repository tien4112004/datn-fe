/**
 * Student Entity (separate file for better organization)
 *
 * This file is kept separate from class.ts even though Student is referenced there,
 * to allow independent evolution and clearer domain boundaries.
 */

export interface Student {
  id: string;
  studentCode: string; // unique student identifier
  firstName: string;
  lastName: string;
  fullName: string;
  dateOfBirth: string;
  gender: StudentGender;
  email?: string;
  phone?: string;
  address?: string;
  parentName?: string;
  parentPhone?: string;
  classId: string;
  enrollmentDate: string;
  status: StudentStatus;
  createdAt: string;
  updatedAt: string;
}

export type StudentStatus = 'active' | 'transferred' | 'graduated' | 'dropped';
export type StudentGender = 'male' | 'female' | 'other';
