/**
 * Subject Constants and Utilities
 *
 * Centralized subject definitions for the Vietnamese elementary education system.
 * Currently supports 3 core subjects: Toán (Math), Tiếng Việt (Vietnamese), Tiếng Anh (English)
 */

// Subject definition type
export interface SubjectDefinition {
  code: string;
  name: string;
  grades?: number[]; // Optional: specific grades this subject applies to
}

// Vietnamese Elementary School Subjects (Grades 1-5)
export const ELEMENTARY_SUBJECTS: Record<string, SubjectDefinition> = {
  TOAN: { code: 'T', name: 'Toán' },
  TIENG_VIET: { code: 'TV', name: 'Tiếng Việt' },
  TIENG_ANH: { code: 'TA', name: 'Tiếng Anh' },
};

export type ElementarySubject = SubjectDefinition;

// Note: SUBJECT_CODE and SubjectCode are defined in assessment/constants.ts
// and are available when importing from @aiprimary/core

// Helper to check if subject applies to grade
function isSubjectForGrade(subject: SubjectDefinition, grade: number): boolean {
  // If no grades specified, it applies to all elementary grades
  if (!subject.grades) return grade >= 1 && grade <= 5;
  return subject.grades.includes(grade);
}

/**
 * Get subjects by grade level
 */
export function getSubjectsByGrade(grade: number): Array<{ code: string; name: string }> {
  if (grade < 1 || grade > 5) return [];

  const subjects = Object.values(ELEMENTARY_SUBJECTS);
  const result: Array<{ code: string; name: string }> = [];

  for (const subject of subjects) {
    if (isSubjectForGrade(subject, grade)) {
      result.push({
        code: subject.code,
        name: subject.name,
      });
    }
  }

  return result;
}

/**
 * Get subject by code
 */
export function getSubjectByCode(code: string): { code: string; name: string } | undefined {
  const subjects = Object.values(ELEMENTARY_SUBJECTS);

  for (const subject of subjects) {
    if (subject.code === code) {
      return {
        code: subject.code,
        name: subject.name,
      };
    }
  }

  return undefined;
}

/**
 * Get all available elementary subjects
 */
export function getAllSubjects(): Array<{ code: string; name: string }> {
  const subjects = Object.values(ELEMENTARY_SUBJECTS);
  const result: Array<{ code: string; name: string }> = [];

  for (const subject of subjects) {
    result.push({
      code: subject.code,
      name: subject.name,
    });
  }

  return result;
}

/**
 * Check if a subject code is valid
 */
export function isValidSubjectCode(code: string): boolean {
  const subjects = Object.values(ELEMENTARY_SUBJECTS);
  for (const subject of subjects) {
    if (subject.code === code) return true;
  }
  return false;
}

/**
 * Get subjects available for a grade range
 */
export function getSubjectsForGradeRange(
  startGrade: number,
  endGrade: number
): Array<{ code: string; name: string }> {
  if (startGrade < 1 || endGrade > 5 || startGrade > endGrade) return [];

  const subjects = Object.values(ELEMENTARY_SUBJECTS);
  const result: Array<{ code: string; name: string }> = [];

  for (const subject of subjects) {
    let found = false;
    for (let grade = startGrade; grade <= endGrade; grade++) {
      if (isSubjectForGrade(subject, grade)) {
        found = true;
        break;
      }
    }
    if (found) {
      result.push({
        code: subject.code,
        name: subject.name,
      });
    }
  }

  return result;
}

/**
 * Get subject Vietnamese name from code
 * Returns the code itself if not found (graceful fallback)
 */
export function getSubjectName(code: string): string {
  const subject = getSubjectByCode(code);
  return subject?.name || code;
}
