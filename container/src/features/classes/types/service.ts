import type { ApiMode } from '@/shared/constants';
import type { ApiResponse } from '@/shared/types/api';
import type {
  Class,
  Student,
  Teacher,
  ClassCollectionRequest,
  ClassCreateRequest,
  ClassUpdateRequest,
  StudentEnrollmentRequest,
  StudentTransferRequest,
  TeacherAssignmentRequest,
} from './class';

export interface ClassApiService {
  getType(): ApiMode;

  // Class CRUD operations
  getClasses(request: ClassCollectionRequest): Promise<ApiResponse<Class[]>>;
  getClassById(id: string): Promise<Class | null>;
  createClass(data: ClassCreateRequest): Promise<Class>;
  updateClass(data: ClassUpdateRequest): Promise<Class>;
  deleteClass(id: string): Promise<void>;

  // Student management
  getStudentsByClassId(classId: string): Promise<Student[]>;
  enrollStudent(request: StudentEnrollmentRequest): Promise<Student>;
  removeStudentFromClass(classId: string, studentId: string): Promise<void>;
  transferStudent(request: StudentTransferRequest): Promise<Student>;

  // Teacher management
  getTeachersByClassId(classId: string): Promise<Teacher[]>;
  assignTeacherToClass(request: TeacherAssignmentRequest): Promise<void>;
  removeTeacherFromClass(classId: string, teacherId: string, subject?: string): Promise<void>;
  assignHomeroomTeacher(classId: string, teacherId: string): Promise<Class>;

  // Utility methods
  getAvailableTeachers(subject?: string): Promise<Teacher[]>;
  getClassCapacityInfo(
    classId: string
  ): Promise<{ capacity: number; currentEnrollment: number; available: number }>;
}
