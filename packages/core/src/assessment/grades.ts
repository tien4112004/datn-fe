/**
 * Grade constants and utilities for the application.
 *
 * Provides type-safe grade constants for elementary grades (1-5),
 * along with helper functions for grade display, validation, and conversion.
 *
 * @module assessment/grades
 */

/**
 * Elementary grade constants (grades 1-5)
 * Used primarily for assignments and question bank in elementary education
 */
export const ELEMENTARY_GRADE = {
  GRADE_1: '1',
  GRADE_2: '2',
  GRADE_3: '3',
  GRADE_4: '4',
  GRADE_5: '5',
} as const;

/**
 * All grade constants (grades 1-5)
 * Same as ELEMENTARY_GRADE
 */
export const GRADE = {
  ...ELEMENTARY_GRADE,
} as const;

/**
 * Type representing elementary grade values ('1' | '2' | '3' | '4' | '5')
 */
export type ElementaryGrade = (typeof ELEMENTARY_GRADE)[keyof typeof ELEMENTARY_GRADE];

/**
 * Type representing all grade values ('1' | '2' | '3' | '4' | '5')
 */
export type Grade = (typeof GRADE)[keyof typeof GRADE];

/**
 * Vietnamese labels for grades
 */
export const GRADE_LABELS = {
  '1': 'Lớp 1',
  '2': 'Lớp 2',
  '3': 'Lớp 3',
  '4': 'Lớp 4',
  '5': 'Lớp 5',
} as const;

/**
 * English labels for grades
 */
export const GRADE_LABELS_EN = {
  '1': 'Grade 1',
  '2': 'Grade 2',
  '3': 'Grade 3',
  '4': 'Grade 4',
  '5': 'Grade 5',
} as const;

/**
 * Get the Vietnamese name for a grade
 *
 * @param grade - The grade code as a string
 * @returns The Vietnamese grade name (e.g., 'Lớp 3')
 *
 * @example
 * ```typescript
 * getGradeName('3'); // Returns 'Lớp 3'
 * getGradeName('10'); // Returns 'Lớp 10'
 * getGradeName('99'); // Returns 'Lớp 99' (graceful fallback)
 * ```
 */
export function getGradeName(grade: string): string {
  return GRADE_LABELS[grade as keyof typeof GRADE_LABELS] || `Lớp ${grade}`;
}

/**
 * Get the English name for a grade
 *
 * @param grade - The grade code as a string
 * @returns The English grade name (e.g., 'Grade 3')
 *
 * @example
 * ```typescript
 * getGradeNameEn('3'); // Returns 'Grade 3'
 * getGradeNameEn('10'); // Returns 'Grade 10'
 * getGradeNameEn('99'); // Returns 'Grade 99' (graceful fallback)
 * ```
 */
export function getGradeNameEn(grade: string): string {
  return GRADE_LABELS_EN[grade as keyof typeof GRADE_LABELS_EN] || `Grade ${grade}`;
}

/**
 * Get all elementary grades (1-5) as an array of objects
 *
 * @returns Array of grade objects with code, Vietnamese name, and English name
 *
 * @example
 * ```typescript
 * getElementaryGrades();
 * // Returns:
 * // [
 * //   { code: '1', name: 'Lớp 1', nameEn: 'Grade 1' },
 * //   { code: '2', name: 'Lớp 2', nameEn: 'Grade 2' },
 * //   ...
 * // ]
 * ```
 */
export function getElementaryGrades(): Array<{ code: string; name: string; nameEn: string }> {
  return Object.values(ELEMENTARY_GRADE).map((code) => ({
    code,
    name: getGradeName(code),
    nameEn: getGradeNameEn(code),
  }));
}

/**
 * Get all grades (1-5) as an array of objects
 *
 * @returns Array of grade objects with code, Vietnamese name, and English name
 *
 * @example
 * ```typescript
 * getAllGrades();
 * // Returns:
 * // [
 * //   { code: '1', name: 'Lớp 1', nameEn: 'Grade 1' },
 * //   { code: '2', name: 'Lớp 2', nameEn: 'Grade 2' },
 * //   ...
 * //   { code: '5', name: 'Lớp 5', nameEn: 'Grade 5' }
 * // ]
 * ```
 */
export function getAllGrades(): Array<{ code: string; name: string; nameEn: string }> {
  return Object.values(GRADE).map((code) => ({
    code,
    name: getGradeName(code),
    nameEn: getGradeNameEn(code),
  }));
}

/**
 * Check if a grade string is valid (1-5)
 *
 * @param grade - The grade code to validate
 * @returns True if the grade is valid (1-5), false otherwise
 *
 * @example
 * ```typescript
 * isValidGrade('3'); // Returns true
 * isValidGrade('5'); // Returns true
 * isValidGrade('0'); // Returns false
 * isValidGrade('6'); // Returns false
 * isValidGrade('abc'); // Returns false
 * ```
 */
export function isValidGrade(grade: string): boolean {
  return Object.values(GRADE).includes(grade as Grade);
}

/**
 * Check if a grade is an elementary grade (1-5)
 *
 * @param grade - The grade code to check
 * @returns True if the grade is elementary (1-5), false otherwise
 *
 * @example
 * ```typescript
 * isElementaryGrade('3'); // Returns true
 * isElementaryGrade('5'); // Returns true
 * isElementaryGrade('6'); // Returns false
 * isElementaryGrade('12'); // Returns false
 * ```
 */
export function isElementaryGrade(grade: string): boolean {
  return Object.values(ELEMENTARY_GRADE).includes(grade as ElementaryGrade);
}

/**
 * Convert a numeric grade to string format
 *
 * @param grade - The grade as a number (1-5)
 * @returns The grade as a string
 *
 * @example
 * ```typescript
 * gradeNumberToString(3); // Returns '3'
 * gradeNumberToString(5); // Returns '5'
 * ```
 */
export function gradeNumberToString(grade: number): string {
  return grade.toString();
}

/**
 * Convert a string grade to numeric format
 *
 * @param grade - The grade as a string
 * @returns The grade as a number
 *
 * @example
 * ```typescript
 * gradeStringToNumber('3'); // Returns 3
 * gradeStringToNumber('5'); // Returns 5
 * ```
 */
export function gradeStringToNumber(grade: string): number {
  return parseInt(grade, 10);
}
