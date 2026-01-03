import { API_MODE, type ApiMode } from '@aiprimary/api';
import {
  type ClassApiService,
  type Class,
  type Student,
  type ClassCollectionRequest,
  type ClassCreateRequest,
  type ClassUpdateRequest,
  type StudentCreateRequest,
  type StudentUpdateRequest,
  type Lesson,
  type LessonCollectionRequest,
  type Layout,
  type LessonCreateRequest,
  type LessonUpdateRequest,
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
    const response = await api.get<ApiResponse<Layout | null>>(
      `${this.baseUrl}/api/classes/${classId}/seating-chart`
    );
    return response.data.data ?? null;
  }

  async saveSeatingChart(classId: string, layout: Layout): Promise<Layout> {
    const response = await api.put<ApiResponse<Layout>>(
      `${this.baseUrl}/api/classes/${classId}/seating-chart`,
      layout
    );
    return response.data.data;
  }

  async getStudentsByClassId(classId: string, page = 1, size = 10): Promise<Student[]> {
    const response = await api.get<ApiResponse<Student[]>>(
      `${this.baseUrl}/api/classes/${classId}/students`,
      {
        params: { page, size },
      }
    );
    return response.data.data.map((item) => this._mapStudent(item));
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

  async getStudentById(studentId: string): Promise<Student | null> {
    try {
      const response = await api.get<ApiResponse<Student>>(`${this.baseUrl}/api/students/${studentId}`);
      return this._mapStudent(response.data.data);
    } catch (error) {
      console.error('Failed to fetch student:', error);
      return null;
    }
  }

  async updateStudent(studentId: string, data: StudentUpdateRequest): Promise<Student> {
    const { id, ...updateData } = data;
    const response = await api.put<ApiResponse<Student>>(
      `${this.baseUrl}/api/students/${studentId}`,
      updateData
    );
    return this._mapStudent(response.data.data);
  }

  // Lesson Management

  async getLessons(classId: string, params: LessonCollectionRequest): Promise<ApiResponse<Lesson[]>> {
    const response = await api.get<ApiResponse<Lesson[]>>(`${this.baseUrl}/api/classes/${classId}/lessons`, {
      params: {
        page: params.page || 1,
        size: params.pageSize || 20,
        search: params.search || undefined,
      },
    });
    return response.data;
  }

  async getLesson(id: string): Promise<Lesson | null> {
    try {
      const response = await api.get<ApiResponse<Lesson>>(`${this.baseUrl}/api/lessons/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch lesson:', error);
      return null;
    }
  }

  // Lesson mutations
  async createLesson(data: LessonCreateRequest): Promise<Lesson> {
    const response = await api.post<ApiResponse<Lesson>>(`${this.baseUrl}/api/lessons`, data);
    return response.data.data;
  }

  async updateLesson(data: LessonUpdateRequest): Promise<Lesson> {
    const { id, ...updateData } = data;
    const response = await api.put<ApiResponse<Lesson>>(`${this.baseUrl}/api/lessons/${id}`, updateData);
    return response.data.data;
  }

  async deleteLesson(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/api/lessons/${id}`);
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
      students: (data.students || []).map((item) => this._mapStudent(item)),
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
