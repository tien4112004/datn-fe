/**
 * Student Request Types
 *
 * API request types for student-related operations.
 */

/**
 * StudentCollectionRequest
 * Query parameters for fetching students
 */
export interface StudentCollectionRequest {
  classId?: string;
  grade?: number;
  status?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
}

/**
 * StudentCreateRequest
 * Payload for creating a new student
 */
export interface StudentCreateRequest {
  fullName: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  parentName: string; // Required
  parentPhone: string; // Required
  parentContactEmail?: string;
  classId: string;
  enrollmentDate?: string;
  status?: string;
}

/**
 * StudentUpdateRequest
 * Payload for updating an existing student
 */
export interface StudentUpdateRequest {
  id: string;
  fullName?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  parentName?: string;
  parentPhone?: string;
  parentContactEmail?: string;
  enrollmentDate?: string;
  status?: 'active' | 'transferred' | 'graduated' | 'dropped';
}

/**
 * StudentFilterOptions
 * Client-side filtering options
 */
export interface StudentFilterOptions {
  classId?: string;
  status?: string;
  search?: string;
  grade?: number;
}

/**
 * StudentSortOption
 * Sorting options for student lists
 */
export type StudentSortOption =
  | 'name-asc'
  | 'name-desc'
  | 'code-asc'
  | 'code-desc'
  | 'enrollment-asc'
  | 'enrollment-desc';
