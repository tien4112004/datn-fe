import type { ApiResponse } from '@/shared/types/api';

import type { Service } from '@/shared/api';
import type {
  Class,
  ClassCollectionRequest,
  ClassCreateRequest,
  ClassPeriod,
  ClassUpdateRequest,
  DailySchedule,
  Layout,
  LearningObjective,
  LessonPlan,
  LessonPlanCollectionRequest,
  LessonResource,
  ScheduleCollectionRequest,
  Student,
  StudentEnrollmentRequest,
  StudentTransferRequest,
  StudentCreateRequest,
  StudentUpdateRequest,
  SubjectManagementRequest,
  Teacher,
  CalendarEventsQueryParams,
  GetCalendarEventsResponse,
  ImportBackendResult,
} from '.';

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
  getPeriods(classId: string, params: { date?: string }): Promise<ApiResponse<ClassPeriod[]>>;
  getLessonPlans(classId: string, params: LessonPlanCollectionRequest): Promise<ApiResponse<LessonPlan[]>>;
  getLessonObjectives(lessonPlanId: string): Promise<LearningObjective[]>;
  getLessonResources(lessonPlanId: string): Promise<LessonResource[]>;

  // Calendar Events
  getCalendarEvents(classId: string, params: CalendarEventsQueryParams): Promise<GetCalendarEventsResponse>;

  // Lesson Plan mutations
  updateLessonStatus(id: string, status: string, notes?: string): Promise<LessonPlan>;
  createLessonPlan(data: any): Promise<LessonPlan>;

  // Objective mutations
  updateObjective(id: string, updates: any): Promise<LearningObjective>;
  addObjectiveNote(id: string, note: string): Promise<LearningObjective>;

  // Resource mutations
  addResource(resource: any): Promise<LessonResource>;
  updateResource(id: string, updates: any): Promise<LessonResource>;
  deleteResource(id: string): Promise<void>;

  // Schedule mutations
  addPeriod(data: any): Promise<ClassPeriod>;
  updatePeriod(id: string, updates: any): Promise<ClassPeriod>;
  linkLessonToPeriod(periodId: string, lessonPlanId: string): Promise<void>;
  unlinkLessonFromPeriod(periodId: string): Promise<void>;

  // Student management
  getStudentsByClassId(classId: string): Promise<Student[]>;
  enrollStudent(request: StudentEnrollmentRequest): Promise<Student>;
  removeStudentFromClass(classId: string, studentId: string): Promise<void>;
  transferStudent(request: StudentTransferRequest): Promise<Student>;

  // Student CRUD operations (for roster management)
  createStudent(classId: string, data: StudentCreateRequest): Promise<Student>;
  updateStudent(studentId: string, data: StudentUpdateRequest): Promise<Student>;
  deleteStudent(studentId: string): Promise<void>;

  // Teacher management
  getTeachersByClassId(classId: string): Promise<Teacher[]>;
  assignHomeroomTeacher(classId: string, teacherId: string): Promise<Class>;
  removeHomeroomTeacher(classId: string): Promise<Class>;

  // Subject management
  addSubjectToClass(request: SubjectManagementRequest): Promise<void>;
  removeSubjectFromClass(request: SubjectManagementRequest): Promise<void>;

  // Utility methods
  getAvailableTeachers(subject?: string): Promise<Teacher[]>;
  getClassCapacityInfo(
    classId: string
  ): Promise<{ capacity: number; currentEnrollment: number; available: number }>;

  // CSV Import
  submitImport(classId: string, file: File): Promise<ImportBackendResult>;
}
