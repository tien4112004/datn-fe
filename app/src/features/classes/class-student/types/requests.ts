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
  search?: string;
  page?: number;
  pageSize?: number;
  sort?: string;
}

/**
 * StudentCreateRequest
 * Payload for creating a new student
 * Matches backend schema exactly
 */
export interface StudentCreateRequest {
  fullName: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  parentName: string;
  parentPhone: string;
  parentContactEmail?: string;
  classId: string;
  enrollmentDate?: string;
}

/**
 * StudentUpdateRequest
 * Payload for updating an existing student
 * Matches backend schema exactly
 */
export interface StudentUpdateRequest {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  parentContactEmail?: string | null;
  avatarUrl?: string | null;
  status?: string | null;
}

/**
 * StudentFilterOptions
 * Client-side filtering options
 */
export interface StudentFilterOptions {
  classId?: string;
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
