/**
 * Student Entity (separate file for better organization)
 *
 * This file is kept separate from class.ts even though Student is referenced there,
 * to allow independent evolution and clearer domain boundaries.
 *
 * Matches backend StudentResponse schema
 */

export interface Student {
  id: string;
  userId: string; // Associated user/profile ID
  status?: string | null; // Student enrollment status (e.g., 'active', 'inactive')
  enrollmentDate?: string | null;
  address?: string | null;
  parentContactEmail?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;

  // User profile fields
  username?: string | null; // Generated username/email (only set during create/import)
  password?: string | null; // Temporary password (only set during create/import)
  firstName?: string | null; // From user profile
  lastName?: string | null; // From user profile
  avatarUrl?: string | null; // From user profile
  phoneNumber?: string | null; // From user profile

  // Legacy/computed fields for compatibility
  fullName?: string; // Computed from firstName + lastName (deprecated)
  dateOfBirth?: string; // (deprecated)
  gender?: StudentGender; // (deprecated)
  parentName?: string; // (deprecated - use parentContactEmail)
  parentPhone?: string; // (deprecated - use phoneNumber)
  classId?: string; // Context-dependent (deprecated)
}

export type StudentGender = 'male' | 'female' | 'other';
