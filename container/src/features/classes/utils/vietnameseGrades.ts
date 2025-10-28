import { VIETNAMESE_GRADES, GRADE_LABELS, CLASS_TRACKS, type GradeLevel, type ClassTrack } from '../types';

/**
 * Get the education level for a given grade
 */
export function getEducationLevel(grade: number): 'tieuHoc' | 'thcs' | 'thpt' | null {
  if (VIETNAMESE_GRADES.TIEU_HOC.includes(grade as any)) return 'tieuHoc';
  if (VIETNAMESE_GRADES.THCS.includes(grade as any)) return 'thcs';
  if (VIETNAMESE_GRADES.THPT.includes(grade as any)) return 'thpt';
  return null;
}

/**
 * Get Vietnamese label for a grade
 */
export function getGradeLabel(grade: number): string {
  return GRADE_LABELS[grade as GradeLevel] || `Lớp ${grade}`;
}

/**
 * Format class name according to Vietnamese standards
 * e.g., generateClassName(10, 'A', 1) => "10A1"
 */
export function generateClassName(grade: number, track?: string, number?: number): string {
  let className = grade.toString();

  if (track) {
    className += track.toUpperCase();
  }

  if (number) {
    className += number.toString();
  }

  return className;
}

/**
 * Parse class name to extract components
 * e.g., parseClassName("10A1") => { grade: 10, track: "A", number: 1 }
 */
export function parseClassName(className: string): {
  grade: number | null;
  track: string | null;
  number: number | null;
} {
  const match = className.match(/^(\d{1,2})([A-Z]?)(\d*)$/);

  if (!match) {
    return { grade: null, track: null, number: null };
  }

  const [, gradeStr, track, numberStr] = match;

  return {
    grade: parseInt(gradeStr, 10),
    track: track || null,
    number: numberStr ? parseInt(numberStr, 10) : null,
  };
}

/**
 * Validate if a grade is valid in Vietnamese education system
 */
export function isValidGrade(grade: number): boolean {
  return grade >= 1 && grade <= 12;
}

/**
 * Validate if a track is valid (mainly for high school)
 */
export function isValidTrack(track: string): boolean {
  return CLASS_TRACKS.includes(track as ClassTrack);
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

/**
 * Validate academic year format
 */
export function isValidAcademicYear(academicYear: string): boolean {
  const match = academicYear.match(/^(\d{4})-(\d{4})$/);
  if (!match) return false;

  const [, startYear, endYear] = match.map(Number);
  return endYear === startYear + 1;
}

/**
 * Get suggested class tracks for a grade level
 */
export function getSuggestedTracks(grade: number): string[] {
  const level = getEducationLevel(grade);

  switch (level) {
    case 'tieuHoc':
      return ['A', 'B', 'C'];
    case 'thcs':
      return ['A', 'B', 'C', 'D'];
    case 'thpt':
      return ['A', 'B', 'C']; // A: Science, B: Social Sciences, C: Mixed
    default:
      return ['A'];
  }
}

/**
 * Get default capacity based on grade level
 */
export function getDefaultCapacity(grade: number): number {
  const level = getEducationLevel(grade);

  switch (level) {
    case 'tieuHoc':
      return 30; // Primary school - smaller classes
    case 'thcs':
      return 35; // Lower secondary
    case 'thpt':
      return 40; // Upper secondary
    default:
      return 35;
  }
}

/**
 * Check if student can be enrolled in a class (age validation)
 */
export function canEnrollInGrade(grade: number, studentBirthYear: number, academicYear: string): boolean {
  const [startYear] = academicYear.split('-').map(Number);
  const studentAge = startYear - studentBirthYear;

  // Typical age ranges for Vietnamese education
  const expectedAge = 6 + grade - 1; // Grade 1 starts at age 6

  // Allow +/- 2 years flexibility
  return studentAge >= expectedAge - 2 && studentAge <= expectedAge + 2;
}
