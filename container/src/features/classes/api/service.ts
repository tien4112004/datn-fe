import { API_MODE, type ApiMode } from '@/shared/constants';
import {
  type ClassApiService,
  type Class,
  type Student,
  type Teacher,
  type ClassCollectionRequest,
  type ClassCreateRequest,
  type ClassUpdateRequest,
  type StudentEnrollmentRequest,
  type StudentTransferRequest,
  type StudentCreateRequest,
  type StudentUpdateRequest,
  type SubjectManagementRequest,
  type ClassPeriod,
  type LessonPlan,
  type LessonPlanCollectionRequest,
  type LearningObjective,
  type LessonResource,
  type Layout,
  type CalendarEventsQueryParams,
  type GetCalendarEventsResponse,
  type DailySchedule,
  type ScheduleCollectionRequest,
} from '../types';
import { api } from '@/shared/api';
import { mapPagination, type ApiResponse, type Pagination } from '@/shared/types/api';

export default class ClassRealApiService implements ClassApiService {
  baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  getType(): ApiMode {
    return API_MODE.real;
  }

  async getClasses(request: ClassCollectionRequest): Promise<ApiResponse<Class[]>> {
    const response = await api.get<ApiResponse<Class[]>>(`${this.baseUrl}/api/classes`, {
      params: {
        page: (request.page || 0) + 1,
        pageSize: request.pageSize,
        sort: request.sort,
        search: request.search,
        grade: request.grade,
        academicYear: request.academicYear,
        homeroomTeacherId: request.homeroomTeacherId,
        isActive: request.isActive,
      },
    });

    return {
      ...response.data,
      data: response.data.data.map(this._mapClass),
      pagination: mapPagination(response.data.pagination as Pagination),
    };
  }

  async getClassById(id: string): Promise<Class | null> {
    try {
      const response = await api.get<ApiResponse<Class>>(`${this.baseUrl}/api/classes/${id}`);
      return this._mapClass(response.data.data);
    } catch (error) {
      console.error('Failed to fetch class:', error);
      return null;
    }
  }

  async createClass(data: ClassCreateRequest): Promise<Class> {
    const response = await api.post<ApiResponse<Class>>(`${this.baseUrl}/api/classes`, data);
    return this._mapClass(response.data.data);
  }

  async updateClass(data: ClassUpdateRequest): Promise<Class> {
    const { id, ...updateData } = data;
    const response = await api.put<ApiResponse<Class>>(`${this.baseUrl}/api/classes/${id}`, updateData);
    return this._mapClass(response.data.data);
  }

  async deleteClass(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/api/classes/${id}`);
  }

  async getSeatingChart(classId: string): Promise<Layout | null> {
    const response = await api.get<ApiResponse<Layout>>(
      `${this.baseUrl}/api/classes/${classId}/seating-chart`
    );
    return response.data.data;
  }

  async saveSeatingChart(classId: string, layout: Layout): Promise<Layout> {
    const response = await api.put<ApiResponse<Layout>>(
      `${this.baseUrl}/api/classes/${classId}/seating-chart`,
      layout
    );
    return response.data.data;
  }

  async getStudentsByClassId(classId: string): Promise<Student[]> {
    const response = await api.get<ApiResponse<Student[]>>(`${this.baseUrl}/api/classes/${classId}/students`);
    return response.data.data.map(this._mapStudent);
  }

  async enrollStudent(request: StudentEnrollmentRequest): Promise<Student> {
    const response = await api.post<ApiResponse<Student>>(
      `${this.baseUrl}/api/classes/${request.classId}/students`,
      {
        studentId: request.studentId,
        enrollmentDate: request.enrollmentDate,
      }
    );
    return this._mapStudent(response.data.data);
  }

  async removeStudentFromClass(classId: string, studentId: string): Promise<void> {
    await api.delete(`${this.baseUrl}/api/classes/${classId}/students/${studentId}`);
  }

  async transferStudent(request: StudentTransferRequest): Promise<Student> {
    const response = await api.post<ApiResponse<Student>>(
      `${this.baseUrl}/api/students/${request.studentId}/transfer`,
      {
        fromClassId: request.fromClassId,
        toClassId: request.toClassId,
        transferDate: request.transferDate,
        reason: request.reason,
      }
    );
    return this._mapStudent(response.data.data);
  }

  // Student CRUD operations for roster management
  async createStudent(classId: string, data: StudentCreateRequest): Promise<Student> {
    const response = await api.post<ApiResponse<Student>>(
      `${this.baseUrl}/api/classes/${classId}/students`,
      data
    );
    return this._mapStudent(response.data.data);
  }

  async updateStudent(studentId: string, data: StudentUpdateRequest): Promise<Student> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...updateData } = data;
    const response = await api.put<ApiResponse<Student>>(
      `${this.baseUrl}/api/students/${studentId}`,
      updateData
    );
    return this._mapStudent(response.data.data);
  }

  async deleteStudent(studentId: string): Promise<void> {
    await api.delete(`${this.baseUrl}/api/students/${studentId}`);
  }

  async getTeachersByClassId(classId: string): Promise<Teacher[]> {
    const response = await api.get<ApiResponse<Teacher[]>>(`${this.baseUrl}/api/classes/${classId}/teachers`);
    return response.data.data.map(this._mapTeacher);
  }

  async assignHomeroomTeacher(classId: string, teacherId: string): Promise<Class> {
    const response = await api.put<ApiResponse<Class>>(
      `${this.baseUrl}/api/classes/${classId}/homeroom-teacher`,
      {
        teacherId,
      }
    );
    return this._mapClass(response.data.data);
  }

  async removeHomeroomTeacher(classId: string): Promise<Class> {
    const response = await api.delete<ApiResponse<Class>>(
      `${this.baseUrl}/api/classes/${classId}/homeroom-teacher`
    );
    return this._mapClass(response.data.data);
  }

  async addSubjectToClass(request: SubjectManagementRequest): Promise<void> {
    await api.post(`${this.baseUrl}/api/classes/${request.classId}/subjects`, {
      subject: request.subject,
    });
  }

  async removeSubjectFromClass(request: SubjectManagementRequest): Promise<void> {
    await api.delete(`${this.baseUrl}/api/classes/${request.classId}/subjects/${request.subject}`);
  }

  async getAvailableTeachers(subject?: string): Promise<Teacher[]> {
    const params = subject ? { subject } : {};
    const response = await api.get<ApiResponse<Teacher[]>>(`${this.baseUrl}/api/teachers/available`, {
      params,
    });
    return response.data.data.map(this._mapTeacher);
  }

  // Schedule and Lesson Management
  async getSchedules(
    classId: string,
    params: ScheduleCollectionRequest
  ): Promise<ApiResponse<DailySchedule[]>> {
    const response = await api.get<ApiResponse<DailySchedule[]>>(
      `${this.baseUrl}/api/classes/${classId}/schedules`,
      {
        params: {
          startDate: params.startDate,
          endDate: params.endDate,
          dayOfWeek: params.dayOfWeek,
        },
      }
    );
    return response.data;
  }

  async getPeriods(classId: string, params: { date?: string }): Promise<ApiResponse<ClassPeriod[]>> {
    const response = await api.get<ApiResponse<ClassPeriod[]>>(
      `${this.baseUrl}/api/classes/${classId}/periods`,
      {
        params: {
          date: params.date,
        },
      }
    );
    return response.data;
  }

  async getLessonPlans(
    classId: string,
    params: LessonPlanCollectionRequest
  ): Promise<ApiResponse<LessonPlan[]>> {
    const response = await api.get<ApiResponse<LessonPlan[]>>(
      `${this.baseUrl}/api/classes/${classId}/lesson-plans`,
      {
        params: {
          teacherId: params.teacherId,
          subject: params.subject,
          date: params.date,
          startDate: params.startDate,
          endDate: params.endDate,
          status: params.status,
          page: params.page,
          pageSize: params.pageSize,
        },
      }
    );
    return response.data;
  }

  async getLessonObjectives(lessonPlanId: string): Promise<LearningObjective[]> {
    const response = await api.get<ApiResponse<LearningObjective[]>>(
      `${this.baseUrl}/api/lesson-plans/${lessonPlanId}/objectives`
    );
    return response.data.data;
  }

  async getLessonResources(lessonPlanId: string): Promise<LessonResource[]> {
    const response = await api.get<ApiResponse<LessonResource[]>>(
      `${this.baseUrl}/api/lesson-plans/${lessonPlanId}/resources`
    );
    return response.data.data;
  }

  // Lesson Plan mutations
  async updateLessonStatus(id: string, status: string, notes?: string): Promise<LessonPlan> {
    const response = await api.patch<ApiResponse<LessonPlan>>(
      `${this.baseUrl}/api/lesson-plans/${id}/status`,
      {
        status,
        notes,
      }
    );
    return response.data.data;
  }

  async createLessonPlan(data: any): Promise<LessonPlan> {
    const response = await api.post<ApiResponse<LessonPlan>>(`${this.baseUrl}/api/lesson-plans`, data);
    return response.data.data;
  }

  // Objective mutations
  async updateObjective(id: string, updates: any): Promise<LearningObjective> {
    const response = await api.patch<ApiResponse<LearningObjective>>(
      `${this.baseUrl}/api/objectives/${id}`,
      updates
    );
    return response.data.data;
  }

  async addObjectiveNote(id: string, note: string): Promise<LearningObjective> {
    const response = await api.post<ApiResponse<LearningObjective>>(
      `${this.baseUrl}/api/objectives/${id}/notes`,
      { note }
    );
    return response.data.data;
  }

  // Resource mutations
  async addResource(resource: any): Promise<LessonResource> {
    const response = await api.post<ApiResponse<LessonResource>>(`${this.baseUrl}/api/resources`, resource);
    return response.data.data;
  }

  async updateResource(id: string, updates: any): Promise<LessonResource> {
    const response = await api.patch<ApiResponse<LessonResource>>(
      `${this.baseUrl}/api/resources/${id}`,
      updates
    );
    return response.data.data;
  }

  async deleteResource(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/api/resources/${id}`);
  }

  // Schedule mutations
  async addPeriod(data: any): Promise<ClassPeriod> {
    const response = await api.post<ApiResponse<ClassPeriod>>(`${this.baseUrl}/api/periods`, data);
    return response.data.data;
  }

  async updatePeriod(id: string, updates: any): Promise<ClassPeriod> {
    const response = await api.patch<ApiResponse<ClassPeriod>>(`${this.baseUrl}/api/periods/${id}`, updates);
    return response.data.data;
  }

  async linkLessonToPeriod(periodId: string, lessonPlanId: string): Promise<void> {
    await api.post(`${this.baseUrl}/api/periods/${periodId}/link-lesson`, { lessonPlanId });
  }

  async unlinkLessonFromPeriod(periodId: string): Promise<void> {
    await api.delete(`${this.baseUrl}/api/periods/${periodId}/link-lesson`);
  }

  // Calendar Events
  async getCalendarEvents(
    classId: string,
    params: CalendarEventsQueryParams
  ): Promise<GetCalendarEventsResponse> {
    const response = await api.get<GetCalendarEventsResponse>(
      `${this.baseUrl}/api/classes/${classId}/calendar/events`,
      {
        params: {
          startDate: params.startDate,
          endDate: params.endDate,
        },
      }
    );
    return response.data;
  }

  private _mapClass(data: any): Class {
    return {
      id: data.id,
      name: data.name,
      grade: data.grade,
      track: data.track,
      academicYear: data.academicYear,
      currentEnrollment: data.currentEnrollment || 0,
      homeroomTeacherId: data.homeroomTeacherId,
      homeroomTeacher: data.homeroomTeacher ? this._mapTeacher(data.homeroomTeacher) : undefined,
      subjects: data.subjects || [],
      classroom: data.classroom,
      description: data.description,
      students: (data.students || []).map(this._mapStudent),
      layout: data.layout, // Assuming the backend returns the layout
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      isActive: data.isActive !== false, // default to true if not specified
    };
  }

  private _mapStudent(data: any): Student {
    return {
      id: data.id,
      studentCode: data.studentCode,
      firstName: data.firstName,
      lastName: data.lastName,
      fullName: data.fullName || `${data.firstName} ${data.lastName}`,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      email: data.email,
      phone: data.phone,
      address: data.address,
      parentName: data.parentName,
      parentPhone: data.parentPhone,
      classId: data.classId,
      enrollmentDate: data.enrollmentDate,
      status: data.status || 'active',
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  private _mapTeacher(data: any): Teacher {
    return {
      id: data.id,
      teacherCode: data.teacherCode,
      firstName: data.firstName,
      lastName: data.lastName,
      fullName: data.fullName || `${data.firstName} ${data.lastName}`,
      email: data.email,
      phone: data.phone,
      subjects: data.subjects || [],
      isHomeroomTeacher: data.isHomeroomTeacher || false,
      homeroomClassId: data.homeroomClassId,
      department: data.department,
      qualification: data.qualification,
      experience: data.experience,
      status: data.status || 'active',
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    };
  }

  async submitImport(classId: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await api.post(`${this.baseUrl}/api/classes/${classId}/students/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        success: true,
        studentsCreated: response.data.data?.studentsCreated || 0,
        message: response.data.message || 'Students imported successfully',
      };
    } catch (error) {
      const errorData = (error as any)?.response?.data;
      return {
        success: false,
        errors: errorData?.errors || [],
        message: errorData?.message || (error instanceof Error ? error.message : 'Failed to import students'),
      };
    }
  }
}
