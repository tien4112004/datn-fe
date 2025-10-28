export interface Class {
  id: string;
  name: string; // e.g., "10A1", "11B2"
  grade: number; // 1-12 for Vietnamese education system
  track?: string; // A, B, C for high school tracks
  academicYear: string; // e.g., "2024-2025"
  capacity: number; // maximum students (typically 30-40)
  currentEnrollment: number; // current number of students
  homeroomTeacherId?: string;
  homeroomTeacher?: Teacher;
  subjectTeachers: ClassSubjectTeacher[];
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

export interface ClassSubjectTeacher {
  id: string;
  classId: string;
  teacherId: string;
  teacher: Teacher;
  subject: string;
  isMainTeacher: boolean;
  assignedAt: string;
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

export interface TeacherAssignmentRequest {
  classId: string;
  teacherId: string;
  subject?: string;
  isMainTeacher?: boolean;
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

export type GradeLevel = keyof typeof GRADE_LABELS;
export type ClassTrack = (typeof CLASS_TRACKS)[number];
