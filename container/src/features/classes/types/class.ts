export interface Class {
  id: string;
  name: string; // e.g., "10A1", "11B2"
  grade: number; // 1-12 for Vietnamese education system
  track?: string; // A, B, C for high school tracks
  academicYear: string; // e.g., "2024-2025"
  capacity: number; // maximum students (typically 30-40)
  currentEnrollment: number; // current number of students
  homeroomTeacherId?: string;
  homeroomTeacher?: Teacher; // The homeroom teacher teaches all subjects
  subjects: string[]; // List of subjects taught in this class (must be unique)
  classroom?: string; // physical location
  description?: string;
  students: Student[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface Student {
  id: string;
  studentCode: string; // unique student identifier
  firstName: string;
  lastName: string;
  fullName: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  email?: string;
  phone?: string;
  address?: string;
  parentName?: string;
  parentPhone?: string;
  classId: string;
  enrollmentDate: string;
  status: 'active' | 'transferred' | 'graduated' | 'dropped';
  createdAt: string;
  updatedAt: string;
}

export interface Teacher {
  id: string;
  teacherCode: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  subjects: string[]; // subjects the teacher can teach
  isHomeroomTeacher: boolean;
  homeroomClassId?: string;
  department?: string;
  qualification?: string;
  experience?: number; // years of experience
  status: 'active' | 'inactive' | 'retired';
  createdAt: string;
  updatedAt: string;
}

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

export interface ClassUpdateRequest extends Partial<ClassCreateRequest> {
  id: string;
}

export interface StudentEnrollmentRequest {
  classId: string;
  studentId: string;
  enrollmentDate?: string;
}

export interface StudentTransferRequest {
  studentId: string;
  fromClassId: string;
  toClassId: string;
  transferDate: string;
  reason?: string;
}

export interface SubjectManagementRequest {
  classId: string;
  subject: string; // Add or remove a subject from the class
}

// Vietnamese education constants
export const VIETNAMESE_GRADES = {
  TIEU_HOC: [1, 2, 3, 4, 5], // Primary school
  THCS: [6, 7, 8, 9], // Lower secondary school
  THPT: [10, 11, 12], // Upper secondary school
} as const;

export const GRADE_LABELS = {
  1: 'Lớp 1',
  2: 'Lớp 2',
  3: 'Lớp 3',
  4: 'Lớp 4',
  5: 'Lớp 5',
  6: 'Lớp 6',
  7: 'Lớp 7',
  8: 'Lớp 8',
  9: 'Lớp 9',
  10: 'Lớp 10',
  11: 'Lớp 11',
  12: 'Lớp 12',
} as const;

export const CLASS_TRACKS = ['A', 'B', 'C', 'D'] as const;

export const DEFAULT_CLASS_CAPACITY = 35;
export const MAX_CLASS_CAPACITY = 45;
export const MIN_CLASS_CAPACITY = 20;

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

// Get subjects by grade level (grades 1-5)
export function getSubjectsByGrade(grade: number): Array<{ code: string; name: string }> {
  const subjects: Array<{ code: string; name: string }> = [
    ELEMENTARY_SUBJECTS.TIENG_VIET,
    ELEMENTARY_SUBJECTS.TOAN,
    ELEMENTARY_SUBJECTS.DAO_DUC,
    ELEMENTARY_SUBJECTS.AM_NHAC,
    ELEMENTARY_SUBJECTS.MY_THUAT,
    ELEMENTARY_SUBJECTS.GIAO_DUC_THE_CHAT,
  ];

  if (grade >= 1 && grade <= 3) {
    // Grades 1-3: Add Tự nhiên và Xã hội
    subjects.push(ELEMENTARY_SUBJECTS.TU_NHIEN_XA_HOI);
  } else if (grade >= 4 && grade <= 5) {
    // Grades 4-5: Add Khoa học, Lịch sử và Địa lý
    subjects.push(ELEMENTARY_SUBJECTS.KHOA_HOC);
    subjects.push(ELEMENTARY_SUBJECTS.LICH_SU_DIA_LY);
  }

  // Optional subjects for all grades
  if (grade >= 3) {
    subjects.push(ELEMENTARY_SUBJECTS.TIENG_ANH);
  }

  if (grade >= 3) {
    subjects.push(ELEMENTARY_SUBJECTS.TIN_HOC);
  }

  subjects.push(ELEMENTARY_SUBJECTS.HOAT_DONG_TRAI_NGHIEM);

  return subjects;
}

export type GradeLevel = keyof typeof GRADE_LABELS;
export type ClassTrack = (typeof CLASS_TRACKS)[number];
export type ElementarySubject = (typeof ELEMENTARY_SUBJECTS)[keyof typeof ELEMENTARY_SUBJECTS];
