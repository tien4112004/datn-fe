/**
 * Student credential types for display after enrollment
 *
 * These types represent the sensitive credential information that is returned
 * only once during student creation/import and is displayed temporarily.
 */

/**
 * Represents a single student's login credentials
 * Only contains username and password, used for immediate post-enrollment display
 */
export interface StudentCredential {
  studentId: string;
  fullName: string;
  username: string;
  password: string;
  email?: string;
}
