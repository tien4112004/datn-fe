import type { ApiClient, ApiResponse } from '@aiprimary/api';
import type { Student, StudentPerformance } from '../types';

export interface StudentApiService {
  getStudentById(studentId: string): Promise<Student | null>;
  getStudentPerformance(userId: string): Promise<StudentPerformance | null>;
}

export default class StudentService implements StudentApiService {
  private readonly apiClient: ApiClient;
  private readonly baseUrl: string;

  constructor(apiClient: ApiClient, baseUrl: string) {
    this.apiClient = apiClient;
    this.baseUrl = baseUrl;
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

  async getStudentPerformance(userId: string): Promise<StudentPerformance | null> {
    try {
      const response = await this.apiClient.get<ApiResponse<StudentPerformance>>(
        `${this.baseUrl}/api/analytics/teacher/students/${userId}/performance`
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch student performance:', error);
      return null;
    }
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
}
