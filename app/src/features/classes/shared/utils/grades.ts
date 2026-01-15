import { getGradeName as coreGetGradeName, gradeNumberToString } from '@aiprimary/core';

/**
 * Get Vietnamese label for a grade
 * Accepts both number and string formats for backward compatibility
 */
export function getGradeLabel(grade: number | string): string {
  const gradeStr = typeof grade === 'number' ? gradeNumberToString(grade) : grade;
  return coreGetGradeName(gradeStr);
}

/**
 * Get academic year format (e.g., "2024-2025")
 */
export function getCurrentAcademicYear(): string {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed

  // Academic year in Vietnam typically starts in September
  if (currentMonth >= 9) {
    return `${currentYear}-${currentYear + 1}`;
  } else {
    return `${currentYear - 1}-${currentYear}`;
  }
}

/**
 * Generate next academic year
 */
export function getNextAcademicYear(currentYear?: string): string {
  if (!currentYear) {
    currentYear = getCurrentAcademicYear();
  }

  const [startYear] = currentYear.split('-').map(Number);
  return `${startYear + 1}-${startYear + 2}`;
}

/**
 * Generate previous academic year
 */
export function getPreviousAcademicYear(currentYear?: string): string {
  if (!currentYear) {
    currentYear = getCurrentAcademicYear();
  }

  const [startYear] = currentYear.split('-').map(Number);
  return `${startYear - 1}-${startYear}`;
}
