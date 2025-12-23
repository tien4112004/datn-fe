/**
 * Student Entity (separate file for better organization)
 *
 * This file is kept separate from class.ts even though Student is referenced there,
 * to allow independent evolution and clearer domain boundaries.
 */

export interface Student {
  id: string;
  userId?: string; // Reference to user profile (optional)
  fullName: string;
  dateOfBirth?: string;
  gender?: StudentGender;
  address?: string;
  parentName: string;
  parentPhone: string;
  parentContactEmail?: string;
  classId: string;
  enrollmentDate: string;
  status: StudentStatus;
  createdAt?: string;
  updatedAt?: string;
  // Credentials (only present after creation)
  username?: string;
  password?: string;
  email?: string;
}

export type StudentStatus = 'active' | 'transferred' | 'graduated' | 'dropped';
export type StudentGender = 'male' | 'female' | 'other';
