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
  type TeacherAssignmentRequest,
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

  async getTeachersByClassId(classId: string): Promise<Teacher[]> {
    const response = await api.get<ApiResponse<Teacher[]>>(`${this.baseUrl}/api/classes/${classId}/teachers`);
    return response.data.data.map(this._mapTeacher);
  }

  async assignTeacherToClass(request: TeacherAssignmentRequest): Promise<void> {
    await api.post(`${this.baseUrl}/api/classes/${request.classId}/teachers`, {
      teacherId: request.teacherId,
      subject: request.subject,
      isMainTeacher: request.isMainTeacher,
    });
  }

  async removeTeacherFromClass(classId: string, teacherId: string, subject?: string): Promise<void> {
    const params = subject ? { subject } : {};
    await api.delete(`${this.baseUrl}/api/classes/${classId}/teachers/${teacherId}`, { params });
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

  async getAvailableTeachers(subject?: string): Promise<Teacher[]> {
    const params = subject ? { subject } : {};
    const response = await api.get<ApiResponse<Teacher[]>>(`${this.baseUrl}/api/teachers/available`, {
      params,
    });
    return response.data.data.map(this._mapTeacher);
  }

  async getClassCapacityInfo(
    classId: string
  ): Promise<{ capacity: number; currentEnrollment: number; available: number }> {
    const response = await api.get<
      ApiResponse<{ capacity: number; currentEnrollment: number; available: number }>
    >(`${this.baseUrl}/api/classes/${classId}/capacity`);
    return response.data.data;
  }

  private _mapClass(data: any): Class {
    return {
      id: data.id,
      name: data.name,
      grade: data.grade,
      track: data.track,
      academicYear: data.academicYear,
      capacity: data.capacity,
      currentEnrollment: data.currentEnrollment || 0,
      homeroomTeacherId: data.homeroomTeacherId,
      homeroomTeacher: data.homeroomTeacher ? this._mapTeacher(data.homeroomTeacher) : undefined,
      subjectTeachers: (data.subjectTeachers || []).map((st: any) => ({
        id: st.id,
        classId: st.classId,
        teacherId: st.teacherId,
        teacher: this._mapTeacher(st.teacher),
        subject: st.subject,
        isMainTeacher: st.isMainTeacher || false,
        assignedAt: st.assignedAt,
      })),
      classroom: data.classroom,
      description: data.description,
      students: (data.students || []).map(this._mapStudent),
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
}
