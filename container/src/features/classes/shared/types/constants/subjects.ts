/**
 * Subject Constants
 *
 * Elementary school subject definitions for Vietnamese education system.
 * (Grades 1-5)
 */

// Subject definition type
interface SubjectDefinition {
  code: string;
  name: string;
  grades?: number[]; // Optional: specific grades this subject applies to
}

// Vietnamese Elementary School Subjects (Grades 1-5)
export const ELEMENTARY_SUBJECTS: Record<string, SubjectDefinition> = {
  TIENG_VIET: { code: 'TV', name: 'Tiếng Việt' },
  TOAN: { code: 'T', name: 'Toán' },
  DAO_DUC: { code: 'DD', name: 'Đạo Đức' },
  TU_NHIEN_XA_HOI: {
    code: 'TNXH',
    name: 'Tự Nhiên Xã Hội',
    grades: [1, 2, 3],
  },
  KHOA_HOC: {
    code: 'KH',
    name: 'Khoa Học',
    grades: [4, 5],
  },
  LICH_SU_DIA_LY: {
    code: 'LSDL',
    name: 'Lịch Sử Địa Lý',
    grades: [4, 5],
  },
  TIENG_ANH: {
    code: 'TA',
    name: 'Tiếng Anh',
    grades: [3, 4, 5],
  },
  TIN_HOC: {
    code: 'TH',
    name: 'Tin Học',
    grades: [3, 4, 5],
  },
  AM_NHAC: { code: 'AN', name: 'Âm Nhạc' },
  MY_THUAT: { code: 'MT', name: 'Mỹ Thuật' },
  GIAO_DUC_THE_CHAT: {
    code: 'GDTC',
    name: 'Giáo Dục Thể Chất',
  },
  HOAT_DONG_TRAI_NGHIEM: {
    code: 'HDTN',
    name: 'Hoạt Động Trải Nghiệm',
  },
};

export type ElementarySubject = SubjectDefinition;

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
