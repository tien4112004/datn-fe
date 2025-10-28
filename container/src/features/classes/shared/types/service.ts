import type { ApiResponse } from '@/shared/types/api';

import type { Service } from '@/shared/api';
import type {
  Class,
  ClassCollectionRequest,
  ClassCreateRequest,
  ClassUpdateRequest,
  DailySchedule,
  Layout,
  LessonPlan,
  LessonPlanCollectionRequest,
  ScheduleCollectionRequest,
  SchedulePeriod,
  Student,
  StudentEnrollmentRequest,
  StudentCreateRequest,
  StudentUpdateRequest,
  LessonPlanCreateRequest,
  LessonPlanUpdateRequest,
  SchedulePeriodCreateRequest,
  SchedulePeriodUpdateRequest,
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

export interface ClassApiService extends Service {
  // Class CRUD operations
  getClasses(request: ClassCollectionRequest): Promise<ApiResponse<Class[]>>;
  getClassById(id: string): Promise<Class | null>;
  createClass(data: ClassCreateRequest): Promise<Class>;
  updateClass(data: ClassUpdateRequest): Promise<Class>;
  deleteClass(id: string): Promise<void>;

  // Seating Chart
  getSeatingChart(classId: string): Promise<Layout | null>;
  saveSeatingChart(classId: string, layout: Layout): Promise<Layout>;

  // Schedule and Lesson Management
  getSchedules(classId: string, params: ScheduleCollectionRequest): Promise<ApiResponse<DailySchedule[]>>;
  getSchedulePeriods(
    classId: string,
    params: { date?: string; startDate?: string; endDate?: string }
  ): Promise<ApiResponse<SchedulePeriod[]>>;
  getPeriodById(id: string): Promise<SchedulePeriod | null>;
  getPeriodsBySubject(classId: string, subjectCode: string): Promise<SchedulePeriod[]>;
  getLessonPlans(classId: string, params: LessonPlanCollectionRequest): Promise<ApiResponse<LessonPlan[]>>;
  getLessonPlan(id: string): Promise<LessonPlan | null>;

  // Lesson Plan mutations
  updateLessonStatus(id: string, status: string, notes?: string): Promise<LessonPlan>;
  createLessonPlan(data: LessonPlanCreateRequest): Promise<LessonPlan>;
  updateLessonPlan(data: LessonPlanUpdateRequest): Promise<LessonPlan>;

  // Schedule mutations
  addSchedulePeriod(classId: string, data: SchedulePeriodCreateRequest): Promise<SchedulePeriod>;
  updateSchedulePeriod(
    classId: string,
    id: string,
    updates: SchedulePeriodUpdateRequest
  ): Promise<SchedulePeriod>;
  linkLessonToSchedulePeriod(classId: string, periodId: string, lessonPlanId: string): Promise<void>;
  unlinkLessonFromSchedulePeriod(classId: string, periodId: string): Promise<void>;

  // Student management
  getStudentsByClassId(classId: string): Promise<Student[]>;
  enrollStudent(request: StudentEnrollmentRequest): Promise<Student>;
  removeStudentFromClass(classId: string, studentId: string): Promise<void>;

  // Student CRUD operations
  createStudent(classId: string, data: StudentCreateRequest): Promise<Student>;
  updateStudent(studentId: string, data: StudentUpdateRequest): Promise<Student>;
  deleteStudent(studentId: string): Promise<void>;

  // CSV Import
  submitImport(classId: string, file: File): Promise<ImportResult>;
}
