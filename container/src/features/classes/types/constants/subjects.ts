/**
 * Subject Constants
 *
 * Consolidated subject definitions for Vietnamese education system.
 * Combines elementary (grades 1-5) and secondary (grades 6-12) subjects.
 */

// Vietnamese Elementary School Subjects (Grades 1-5)
export const ELEMENTARY_SUBJECTS = {
  TIENG_VIET: { code: 'TV', name: 'Tiếng Việt' },
  TOAN: { code: 'T', name: 'Toán' },
  DAO_DUC: { code: 'DD', name: 'Đạo đức' },
  TU_NHIEN_XA_HOI: { code: 'TNXH', name: 'Tự nhiên và Xã hội' }, // Grades 1-3
  KHOA_HOC: { code: 'KH', name: 'Khoa học' }, // Grades 4-5
  LICH_SU_DIA_LY: { code: 'LSDL', name: 'Lịch sử và Địa lý' }, // Grades 4-5
  TIENG_ANH: { code: 'TA', name: 'Tiếng Anh' },
  TIN_HOC: { code: 'TH', name: 'Tin học và Công nghệ' },
  AM_NHAC: { code: 'AN', name: 'Âm nhạc' },
  MY_THUAT: { code: 'MT', name: 'Mỹ thuật' },
  GIAO_DUC_THE_CHAT: { code: 'GDTC', name: 'Giáo dục thể chất' },
  HOAT_DONG_TRAI_NGHIEM: { code: 'HDTN', name: 'Hoạt động trải nghiệm' },
} as const;

// Vietnamese Secondary School Subjects (Grades 6-12)
export const SECONDARY_SUBJECTS = {
  TOAN: { code: 'TOAN', name: 'Toán', nameEn: 'Mathematics' },
  VAN: { code: 'VAN', name: 'Ngữ văn', nameEn: 'Vietnamese Literature' },
  ANH: { code: 'ANH', name: 'Tiếng Anh', nameEn: 'English' },
  LY: { code: 'LY', name: 'Vật lý', nameEn: 'Physics' },
  HOA: { code: 'HOA', name: 'Hóa học', nameEn: 'Chemistry' },
  SINH: { code: 'SINH', name: 'Sinh học', nameEn: 'Biology' },
  SU: { code: 'SU', name: 'Lịch sử', nameEn: 'History' },
  DIA: { code: 'DIA', name: 'Địa lý', nameEn: 'Geography' },
  GDCD: { code: 'GDCD', name: 'Giáo dục công dân', nameEn: 'Civic Education' },
  GDQP: { code: 'GDQP', name: 'Giáo dục quốc phòng', nameEn: 'National Defense Education' },
  CN: { code: 'CN', name: 'Công nghệ', nameEn: 'Technology' },
  TIN: { code: 'TIN', name: 'Tin học', nameEn: 'Computer Science' },
  GDTC: { code: 'GDTC', name: 'Giáo dục thể chất', nameEn: 'Physical Education' },
  MY: { code: 'MY', name: 'Mỹ thuật', nameEn: 'Fine Arts' },
  NHAC: { code: 'NHAC', name: 'Âm nhạc', nameEn: 'Music' },
} as const;

/**
 * Get subjects by grade level
 * @param grade Grade level (1-12)
 * @returns Array of subjects applicable to that grade
 */
export function getSubjectsByGrade(grade: number): Array<{ code: string; name: string }> {
  // Elementary school (grades 1-5)
  if (grade >= 1 && grade <= 5) {
    const subjects: Array<{ code: string; name: string }> = [
      ELEMENTARY_SUBJECTS.TIENG_VIET,
      ELEMENTARY_SUBJECTS.TOAN,
      ELEMENTARY_SUBJECTS.DAO_DUC,
      ELEMENTARY_SUBJECTS.AM_NHAC,
      ELEMENTARY_SUBJECTS.MY_THUAT,
      ELEMENTARY_SUBJECTS.GIAO_DUC_THE_CHAT,
    ];

    if (grade >= 1 && grade <= 3) {
      subjects.push(ELEMENTARY_SUBJECTS.TU_NHIEN_XA_HOI);
    } else if (grade >= 4 && grade <= 5) {
      subjects.push(ELEMENTARY_SUBJECTS.KHOA_HOC);
      subjects.push(ELEMENTARY_SUBJECTS.LICH_SU_DIA_LY);
    }

    if (grade >= 3) {
      subjects.push(ELEMENTARY_SUBJECTS.TIENG_ANH);
      subjects.push(ELEMENTARY_SUBJECTS.TIN_HOC);
    }

    subjects.push(ELEMENTARY_SUBJECTS.HOAT_DONG_TRAI_NGHIEM);

    return subjects;
  }

  // Secondary school (grades 6-12) - return all subjects
  return Object.values(SECONDARY_SUBJECTS);
}

/**
 * Get subject by code
 * @param code Subject code (e.g., "TOAN", "VAN")
 * @returns Subject object or undefined
 */
export function getSubjectByCode(code: string): { code: string; name: string; nameEn?: string } | undefined {
  // Check elementary subjects
  const elementarySubject = Object.values(ELEMENTARY_SUBJECTS).find((s) => s.code === code);
  if (elementarySubject) return elementarySubject;

  // Check secondary subjects
  const secondarySubject = Object.values(SECONDARY_SUBJECTS).find((s) => s.code === code);
  return secondarySubject;
}

export type ElementarySubject = (typeof ELEMENTARY_SUBJECTS)[keyof typeof ELEMENTARY_SUBJECTS];
export type SecondarySubject = (typeof SECONDARY_SUBJECTS)[keyof typeof SECONDARY_SUBJECTS];
export type SubjectCode = keyof typeof SECONDARY_SUBJECTS;
