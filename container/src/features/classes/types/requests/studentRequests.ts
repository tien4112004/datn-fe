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
  studentCode: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  email?: string;
  phone?: string;
  address?: string;
  parentName?: string;
  parentPhone?: string;
  classId: string;
  enrollmentDate?: string;
}

/**
 * StudentUpdateRequest
 * Payload for updating an existing student
 */
export interface StudentUpdateRequest extends Partial<StudentCreateRequest> {
  id: string;
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
