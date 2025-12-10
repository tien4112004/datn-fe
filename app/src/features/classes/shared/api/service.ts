import { API_MODE, type ApiMode } from '@aiprimary/api';
import {
  type ClassApiService,
  type Class,
  type Student,
  type ClassCollectionRequest,
  type ClassCreateRequest,
  type ClassUpdateRequest,
  type StudentEnrollmentRequest,
  type StudentCreateRequest,
  type StudentUpdateRequest,
  type SchedulePeriod,
  type Lesson,
  type LessonCollectionRequest,
  type Layout,
  type DailySchedule,
  type ScheduleCollectionRequest,
  type LessonCreateRequest,
  type LessonUpdateRequest,
  type SchedulePeriodCreateRequest,
  type SchedulePeriodUpdateRequest,
  type ImportResult,
} from '../types';
import { api } from '@aiprimary/api';
import { mapPagination, type ApiResponse, type Pagination } from '@aiprimary/api';

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

  // Student CRUD operations for roster management
  async createStudent(classId: string, data: StudentCreateRequest): Promise<Student> {
    const response = await api.post<ApiResponse<Student>>(
      `${this.baseUrl}/api/classes/${classId}/students`,
      data
    );
    return this._mapStudent(response.data.data);
  }

  async updateStudent(studentId: string, data: StudentUpdateRequest): Promise<Student> {
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
        },
      }
    );
    return response.data;
  }

  async getSchedulePeriods(
    classId: string,
    params: { date?: string; startDate?: string; endDate?: string }
  ): Promise<ApiResponse<SchedulePeriod[]>> {
    const response = await api.get<ApiResponse<SchedulePeriod[]>>(
      `${this.baseUrl}/api/classes/${classId}/periods`,
      {
        params: {
          date: params.date,
          startDate: params.startDate,
          endDate: params.endDate,
        },
      }
    );
    return response.data;
  }

  async getPeriodsBySubject(classId: string, subjectCode: string): Promise<SchedulePeriod[]> {
    const response = await api.get(`${this.baseUrl}/api/classes/${classId}/periods`, {
      params: {
        subject: subjectCode,
      },
    });
    return response.data.data || [];
  }

  async getPeriodById(id: string): Promise<SchedulePeriod | null> {
    try {
      const response = await api.get<ApiResponse<SchedulePeriod>>(`${this.baseUrl}/api/periods/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch period:', error);
      return null;
    }
  }

  async getLessons(classId: string, params: LessonCollectionRequest): Promise<ApiResponse<Lesson[]>> {
    const response = await api.get<ApiResponse<Lesson[]>>(
      `${this.baseUrl}/api/classes/${classId}/lesson-plans`,
      {
        params: {
          subject: params.subject,
          status: params.status,
          page: params.page,
          pageSize: params.pageSize,
        },
      }
    );
    return response.data;
  }

  async getLesson(id: string): Promise<Lesson | null> {
    try {
      const response = await api.get<ApiResponse<Lesson>>(`${this.baseUrl}/api/lesson-plans/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch lesson:', error);
      return null;
    }
  }

  // Lesson  mutations
  async updateLessonStatus(id: string, status: string, notes?: string): Promise<Lesson> {
    const response = await api.patch<ApiResponse<Lesson>>(`${this.baseUrl}/api/lesson-plans/${id}/status`, {
      status,
      notes,
    });
    return response.data.data;
  }

  async createLesson(data: LessonCreateRequest): Promise<Lesson> {
    const response = await api.post<ApiResponse<Lesson>>(`${this.baseUrl}/api/lesson-plans`, data);
    return response.data.data;
  }

  async updateLesson(data: LessonUpdateRequest): Promise<Lesson> {
    const { id, ...updateData } = data;
    const response = await api.patch<ApiResponse<Lesson>>(
      `${this.baseUrl}/api/lesson-plans/${id}`,
      updateData
    );
    return response.data.data;
  }

  // Schedule mutations
  async addSchedulePeriod(classId: string, data: SchedulePeriodCreateRequest): Promise<SchedulePeriod> {
    const response = await api.post<ApiResponse<SchedulePeriod>>(
      `${this.baseUrl}/api/classes/${classId}/periods`,
      data
    );
    return response.data.data;
  }

  async updateSchedulePeriod(
    classId: string,
    id: string,
    updates: SchedulePeriodUpdateRequest
  ): Promise<SchedulePeriod> {
    const response = await api.patch<ApiResponse<SchedulePeriod>>(
      `${this.baseUrl}/api/classes/${classId}/periods/${id}`,
      updates
    );
    return response.data.data;
  }

  async linkLessonToSchedulePeriod(classId: string, periodId: string, lessonId: string): Promise<void> {
    await api.post(`${this.baseUrl}/api/classes/${classId}/periods/${periodId}/link-lesson`, {
      lessonId,
    });
  }

  async unlinkLessonFromSchedulePeriod(classId: string, periodId: string, lessonId: string): Promise<void> {
    await api.delete(`${this.baseUrl}/api/classes/${classId}/periods/${periodId}/link-lesson`, {
      data: { lessonId },
    });
  }

  private _mapClass(data: any): Class {
    return {
      id: data.id,
      name: data.name,
      grade: data.grade,
      academicYear: data.academicYear,
      currentEnrollment: data.currentEnrollment || 0,
      classroom: data.classroom,
      description: data.description,
      students: (data.students || []).map(this._mapStudent),
      layout: data.layout, // Assuming the backend returns the layout
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      isActive: data.isActive !== false, // default to true if not specified
      teacherId: data.teacherId,
    };
  }

  private _mapStudent(data: any): Student {
    return {
      id: data.id,
      fullName: data.fullName,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
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

  async submitImport(classId: string, file: File): Promise<ImportResult> {
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
