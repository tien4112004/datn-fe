import type { ApiClient, ApiResponse } from '@aiprimary/api';
import {
  type ClassApiService,
  type Class,
  type Student,
  type ClassCollectionRequest,
  type ClassCreateRequest,
  type ClassUpdateRequest,
  type StudentCreateRequest,
  type StudentUpdateRequest,
  type StudentEnrollmentRequest,
  type Lesson,
  type LessonCollectionRequest,
  type Layout,
  type LessonCreateRequest,
  type LessonUpdateRequest,
  type ImportResult,
  type ScheduleCollectionRequest,
  type SchedulePeriodCreateRequest,
  type SchedulePeriodUpdateRequest,
  type SchedulePeriod,
  type DailySchedule,
} from '../types';
import { mapPagination, type Pagination } from '@aiprimary/api';

export default class ClassService implements ClassApiService {
  private readonly apiClient: ApiClient;
  private readonly baseUrl: string;

  constructor(apiClient: ApiClient, baseUrl: string) {
    this.apiClient = apiClient;
    this.baseUrl = baseUrl;
  }

  async getClasses(request: ClassCollectionRequest): Promise<ApiResponse<Class[]>> {
    const response = await this.apiClient.get<ApiResponse<Class[]>>(`${this.baseUrl}/api/classes`, {
      params: {
        page: (request.page || 0) + 1,
        pageSize: request.pageSize,
        // sort: request.sort,
        search: request.search,
        isActive: request.isActive,
      },
    });

    const mappedData = response.data.data.map((item) => this._mapClass(item));

    return {
      ...response.data,
      data: mappedData,
      pagination: mapPagination(response.data.pagination as Pagination),
    };
  }

  async getClassById(id: string): Promise<Class | null> {
    try {
      const response = await this.apiClient.get<ApiResponse<Class>>(`${this.baseUrl}/api/classes/${id}`);
      return this._mapClass(response.data.data);
    } catch (error) {
      console.error('Failed to fetch class:', error);
      return null;
    }
  }

  async createClass(data: ClassCreateRequest): Promise<Class> {
    const response = await this.apiClient.post<ApiResponse<Class>>(`${this.baseUrl}/api/classes`, data);
    return this._mapClass(response.data.data);
  }

  async updateClass(data: ClassUpdateRequest): Promise<Class> {
    const { id, ...updateData } = data;
    const response = await this.apiClient.put<ApiResponse<Class>>(
      `${this.baseUrl}/api/classes/${id}`,
      updateData
    );
    return this._mapClass(response.data.data);
  }

  async deleteClass(id: string): Promise<void> {
    await this.apiClient.delete(`${this.baseUrl}/api/classes/${id}`);
  }

  async getSeatingChart(classId: string): Promise<Layout | null> {
    const response = await this.apiClient.get<ApiResponse<Layout | null>>(
      `${this.baseUrl}/api/classes/${classId}/seating-chart`
    );
    return response.data.data ?? null;
  }

  async saveSeatingChart(classId: string, layout: Layout): Promise<Layout> {
    const response = await this.apiClient.put<ApiResponse<Layout>>(
      `${this.baseUrl}/api/classes/${classId}/seating-chart`,
      layout
    );
    return response.data.data;
  }

  async getStudentsByClassId(classId: string, page = 1, size = 10): Promise<Student[]> {
    const response = await this.apiClient.get<ApiResponse<Student[]>>(
      `${this.baseUrl}/api/classes/${classId}/students`,
      {
        params: { page, size },
      }
    );
    return response.data.data.map((item) => this._mapStudent(item));
  }

  async removeStudentFromClass(classId: string, studentId: string): Promise<void> {
    await this.apiClient.delete(`${this.baseUrl}/api/classes/${classId}/students/${studentId}`);
  }

  // Student CRUD operations for roster management
  async createStudent(classId: string, data: StudentCreateRequest): Promise<Student> {
    const response = await this.apiClient.post<ApiResponse<Student>>(
      `${this.baseUrl}/api/classes/${classId}/students`,
      data
    );
    return this._mapStudent(response.data.data);
  }

  async getStudentById(studentId: string): Promise<Student | null> {
    try {
      const response = await this.apiClient.get<ApiResponse<Student>>(
        `${this.baseUrl}/api/students/${studentId}`
      );
      return this._mapStudent(response.data.data);
    } catch (error) {
      console.error('Failed to fetch student:', error);
      return null;
    }
  }

  async updateStudent(studentId: string, data: StudentUpdateRequest): Promise<Student> {
    const { id, ...updateData } = data;
    const response = await this.apiClient.put<ApiResponse<Student>>(
      `${this.baseUrl}/api/students/${studentId}`,
      updateData
    );
    return this._mapStudent(response.data.data);
  }

  async enrollStudent(data: StudentEnrollmentRequest): Promise<Student> {
    const response = await this.apiClient.post<ApiResponse<Student>>(
      `${this.baseUrl}/api/classes/${data.classId}/students/enroll`,
      data
    );
    return this._mapStudent(response.data.data);
  }

  async deleteStudent(studentId: string): Promise<void> {
    await this.apiClient.delete(`${this.baseUrl}/api/students/${studentId}`);
  }

  // Lesson Management

  async getLessons(classId: string, params: LessonCollectionRequest): Promise<ApiResponse<Lesson[]>> {
    const response = await this.apiClient.get<ApiResponse<Lesson[]>>(
      `${this.baseUrl}/api/classes/${classId}/lessons`,
      {
        params: {
          page: params.page || 1,
          size: params.pageSize || 20,
          search: params.search || undefined,
        },
      }
    );
    return response.data;
  }

  async getLesson(id: string): Promise<Lesson | null> {
    try {
      const response = await this.apiClient.get<ApiResponse<Lesson>>(`${this.baseUrl}/api/lessons/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch lesson:', error);
      return null;
    }
  }

  // Lesson mutations
  async createLesson(data: LessonCreateRequest): Promise<Lesson> {
    const response = await this.apiClient.post<ApiResponse<Lesson>>(`${this.baseUrl}/api/lessons`, data);
    return response.data.data;
  }

  async updateLesson(data: LessonUpdateRequest): Promise<Lesson> {
    const { id, ...updateData } = data;
    const response = await this.apiClient.put<ApiResponse<Lesson>>(
      `${this.baseUrl}/api/lessons/${id}`,
      updateData
    );
    return response.data.data;
  }

  async deleteLesson(id: string): Promise<void> {
    await this.apiClient.delete(`${this.baseUrl}/api/lessons/${id}`);
  }

  async updateLessonStatus(id: string, status: string, notes?: string): Promise<Lesson> {
    const response = await this.apiClient.patch<ApiResponse<Lesson>>(
      `${this.baseUrl}/api/lessons/${id}/status`,
      {
        status,
        notes,
      }
    );
    return response.data.data;
  }

  // Schedule Management

  async getSchedules(
    classId: string,
    params: ScheduleCollectionRequest
  ): Promise<ApiResponse<DailySchedule[]>> {
    const response = await this.apiClient.get<ApiResponse<DailySchedule[]>>(
      `${this.baseUrl}/api/classes/${classId}/schedules`,
      { params }
    );
    return response.data;
  }

  async getSchedulePeriods(
    classId: string,
    params: { date?: string; startDate?: string; endDate?: string }
  ): Promise<ApiResponse<SchedulePeriod[]>> {
    const response = await this.apiClient.get<ApiResponse<SchedulePeriod[]>>(
      `${this.baseUrl}/api/classes/${classId}/periods`,
      { params }
    );
    return response.data;
  }

  async getPeriodById(id: string): Promise<SchedulePeriod | null> {
    try {
      const response = await this.apiClient.get<ApiResponse<SchedulePeriod>>(
        `${this.baseUrl}/api/periods/${id}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch period:', error);
      return null;
    }
  }

  async getPeriodsBySubject(classId: string, subject: string): Promise<SchedulePeriod[]> {
    const response = await this.apiClient.get<ApiResponse<SchedulePeriod[]>>(
      `${this.baseUrl}/api/classes/${classId}/periods`,
      {
        params: { subject: subject },
      }
    );
    return response.data.data;
  }

  async addSchedulePeriod(classId: string, data: SchedulePeriodCreateRequest): Promise<SchedulePeriod> {
    const response = await this.apiClient.post<ApiResponse<SchedulePeriod>>(
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
    const { id: _id, ...updateData } = updates;
    const response = await this.apiClient.put<ApiResponse<SchedulePeriod>>(
      `${this.baseUrl}/api/classes/${classId}/periods/${id}`,
      updateData
    );
    return response.data.data;
  }

  async linkLessonToSchedulePeriod(classId: string, periodId: string, lessonId: string): Promise<void> {
    await this.apiClient.post(`${this.baseUrl}/api/classes/${classId}/periods/${periodId}/lessons`, {
      lessonId,
    });
  }

  async unlinkLessonFromSchedulePeriod(classId: string, periodId: string, lessonId: string): Promise<void> {
    await this.apiClient.delete(
      `${this.baseUrl}/api/classes/${classId}/periods/${periodId}/lessons/${lessonId}`
    );
  }

  private _mapClass(data: any): Class {
    // Parse settings from JSON string to object
    let parsedSettings: Record<string, any> | null = null;
    if (data.settings && typeof data.settings === 'string') {
      try {
        parsedSettings = JSON.parse(data.settings);
      } catch (error) {
        console.error('Failed to parse settings JSON:', error);
        parsedSettings = null;
      }
    } else if (data.settings && typeof data.settings === 'object') {
      parsedSettings = data.settings;
    }

    // Ensure settings exist, create if needed
    const finalSettings = parsedSettings || {};

    // Migrate top-level fields to settings if they exist (backward compatibility)
    if (data.grade !== undefined) {
      finalSettings.grade = data.grade;
    }
    if (data.academicYear !== undefined) {
      finalSettings.academicYear = data.academicYear;
    }
    if (data.class !== undefined) {
      finalSettings.class = data.class;
    }

    return {
      // Backend fields
      id: data.id,
      ownerId: data.ownerId,
      name: data.name,
      description: data.description ?? null,
      joinCode: data.joinCode ?? null,
      settings: Object.keys(finalSettings).length > 0 ? finalSettings : null,
      isActive: data.isActive ?? true,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,

      // Legacy/compatibility fields
      teacherId: data.ownerId, // Map ownerId to teacherId for backwards compatibility
      students: (data.students || []).map((item: any) => this._mapStudent(item)),
      layout: data.layout ?? undefined,
    };
  }

  private _mapStudent(data: any): Student {
    return {
      // Backend fields
      id: data.id,
      userId: data.userId,
      enrollmentDate: data.enrollmentDate,
      address: data.address,
      parentContactEmail: data.parentContactEmail,
      status: data.status,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,

      // User profile fields
      username: data.username,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      avatarUrl: data.avatarUrl,
      phoneNumber: data.phoneNumber,

      // Legacy/compatibility fields
      fullName: data.firstName && data.lastName ? `${data.firstName} ${data.lastName}` : data.fullName,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      parentName: data.parentName,
      parentPhone: data.phoneNumber || data.parentPhone,
      classId: data.classId,
    };
  }

  async submitImport(classId: string, file: File): Promise<ImportResult> {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await this.apiClient.post(
        `${this.baseUrl}/api/classes/${classId}/students/import`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

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
