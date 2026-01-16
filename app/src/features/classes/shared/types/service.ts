import type { ApiResponse } from '@aiprimary/api';

import type {
  Class,
  ClassCollectionRequest,
  ClassCreateRequest,
  ClassUpdateRequest,
  Layout,
  Lesson,
  LessonCollectionRequest,
  Student,
  StudentCreateRequest,
  StudentUpdateRequest,
  StudentEnrollmentRequest,
  LessonCreateRequest,
  LessonUpdateRequest,
  ScheduleCollectionRequest,
  SchedulePeriodCreateRequest,
  SchedulePeriodUpdateRequest,
  SchedulePeriod,
  DailySchedule,
} from '.';

/**
 * Import result for CSV student import
 */
export interface ImportResult {
  success: boolean;
  studentsCreated?: number;
  message?: string;
  errors?: string[];
}

export interface ClassApiService {
  // Class CRUD operations
  getClasses(request: ClassCollectionRequest): Promise<ApiResponse<Class[]>>;
  getClassById(id: string): Promise<Class | null>;
  createClass(data: ClassCreateRequest): Promise<Class>;
  updateClass(data: ClassUpdateRequest): Promise<Class>;
  deleteClass(id: string): Promise<void>;

  // Seating Chart
  getSeatingChart(classId: string): Promise<Layout | null>;
  saveSeatingChart(classId: string, layout: Layout): Promise<Layout>;

  // Lesson Management
  getLessons(classId: string, params: LessonCollectionRequest): Promise<ApiResponse<Lesson[]>>;
  getLesson(id: string): Promise<Lesson | null>;
  createLesson(data: LessonCreateRequest): Promise<Lesson>;
  updateLesson(data: LessonUpdateRequest): Promise<Lesson>;
  updateLessonStatus(id: string, status: string, notes?: string): Promise<Lesson>;
  deleteLesson(id: string): Promise<void>;

  // Schedule Management
  getSchedules(classId: string, params: ScheduleCollectionRequest): Promise<ApiResponse<DailySchedule[]>>;
  getSchedulePeriods(
    classId: string,
    params: { date?: string; startDate?: string; endDate?: string }
  ): Promise<ApiResponse<SchedulePeriod[]>>;
  getPeriodById(id: string): Promise<SchedulePeriod | null>;
  getPeriodsBySubject(classId: string, subjectCode: string): Promise<SchedulePeriod[]>;
  addSchedulePeriod(classId: string, data: SchedulePeriodCreateRequest): Promise<SchedulePeriod>;
  updateSchedulePeriod(
    classId: string,
    id: string,
    updates: SchedulePeriodUpdateRequest
  ): Promise<SchedulePeriod>;
  linkLessonToSchedulePeriod(classId: string, periodId: string, lessonId: string): Promise<void>;
  unlinkLessonFromSchedulePeriod(classId: string, periodId: string, lessonId: string): Promise<void>;

  // Student Management
  getStudentsByClassId(classId: string, page?: number, size?: number): Promise<Student[]>;
  removeStudentFromClass(classId: string, studentId: string): Promise<void>;
  createStudent(classId: string, data: StudentCreateRequest): Promise<Student>;
  getStudentById(studentId: string): Promise<Student | null>;
  updateStudent(studentId: string, data: StudentUpdateRequest): Promise<Student>;
  enrollStudent(data: StudentEnrollmentRequest): Promise<Student>;
  deleteStudent(studentId: string): Promise<void>;

  // CSV Import
  submitImport(classId: string, file: File): Promise<ImportResult>;
}
