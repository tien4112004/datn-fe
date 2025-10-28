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
  sort?: string;
  search?: string;
  grade?: number;
  academicYear?: string;
  isActive?: boolean;
}

/**
 * ClassCreateRequest
 * Payload for creating a new class
 */
export interface ClassCreateRequest {
  name: string;
  grade: number;
  academicYear: string;
  classroom?: string;
  description?: string;
}

/**
 * ClassUpdateRequest
 * Payload for updating an existing class
 */
export interface ClassUpdateRequest extends Partial<ClassCreateRequest> {
  id: string;
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
