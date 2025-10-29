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
  homeroomTeacherId?: string;
  isActive?: boolean;
}

/**
 * ClassCreateRequest
 * Payload for creating a new class
 */
export interface ClassCreateRequest {
  name: string;
  grade: number;
  track?: string;
  academicYear: string;
  capacity: number;
  homeroomTeacherId?: string;
  subjects?: string[]; // Elementary school subjects to add to class
  classroom?: string;
  description?: string;
}

/**
 * ClassUpdateRequest
 * Payload for updating an existing class
 */
export interface ClassUpdateRequest extends Partial<ClassCreateRequest> {
  id: string;
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
 * StudentTransferRequest
 * Payload for transferring a student between classes
 */
export interface StudentTransferRequest {
  studentId: string;
  fromClassId: string;
  toClassId: string;
  transferDate: string;
  reason?: string;
}

/**
 * SubjectManagementRequest
 * Payload for adding/removing subjects from a class
 */
export interface SubjectManagementRequest {
  classId: string;
  subject: string; // Add or remove a subject from the class
}

/**
 * ClassFilterOptions
 * Client-side filtering options (for mock API)
 */
export interface ClassFilterOptions {
  grade?: number;
  academicYear?: string;
  homeroomTeacherId?: string;
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
