/**
 * Class Request Types
 *
 * API request and response types for class-related operations.
 */

/**
 * ClassCollectionRequest
 * Query parameters for fetching a collection of classes
 */
export interface ClassCollectionRequest {
  page?: number;
  pageSize?: number;
  sort?: 'asc' | 'desc'; // Backend only accepts direction, not field:direction
  search?: string;
  isActive?: boolean;
  grade?: number;
  academicYear?: string;
}

/**
 * ClassCreateRequest
 * Payload for creating a new class
 * Matches backend schema exactly
 * Note: settings is a JSON string, not an object
 */
export interface ClassCreateRequest {
  name: string;
  description?: string | null;
  settings?: string | null; // JSON string, not object
}

/**
 * ClassUpdateRequest
 * Payload for updating an existing class
 * Matches backend schema exactly
 * Note: settings is a JSON string, not an object
 */
export interface ClassUpdateRequest {
  id: string;
  name?: string | null;
  description?: string | null;
  settings?: string | null; // JSON string, not object
  isActive?: boolean;
}

/**
 * StudentEnrollmentRequest
 * Payload for enrolling a student in a class
 */
export interface StudentEnrollmentRequest {
  classId: string;
  studentId: string;
  enrollmentDate?: string;
}

/**
 * ClassFilterOptions
 * Client-side filtering options (for mock API)
 */
export interface ClassFilterOptions {
  grade?: number;
  academicYear?: string;
  search?: string;
  isActive?: boolean;
}

/**
 * ClassSortOption
 * Sorting options for class lists
 */
export type ClassSortOption =
  | 'name-asc'
  | 'name-desc'
  | 'grade-asc'
  | 'grade-desc'
  | 'enrollment-asc'
  | 'enrollment-desc'
  | 'created-asc'
  | 'created-desc';
