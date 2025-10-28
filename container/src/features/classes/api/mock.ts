import type {
  Class,
  Student,
  Teacher,
  ClassApiService,
  ClassCollectionRequest,
  ClassCreateRequest,
  ClassUpdateRequest,
  StudentEnrollmentRequest,
  StudentTransferRequest,
  TeacherAssignmentRequest,
} from '../types';
import { API_MODE, type ApiMode } from '@/shared/constants';
import { mapPagination, type ApiResponse } from '@/shared/types/api';
import { mockTeachers, mockStudents, initializeMockClasses } from './data/mockData';

export default class ClassMockApiService implements ClassApiService {
  private classes = initializeMockClasses(mockTeachers, mockStudents);
  private students = [...mockStudents];
  private teachers = [...mockTeachers];

  getType(): ApiMode {
    return API_MODE.mock;
  }

  async getClasses(request: ClassCollectionRequest): Promise<ApiResponse<Class[]>> {
    await this._delay();

    let filteredClasses = [...this.classes];

    // Apply filters
    if (request.search) {
      const search = request.search.toLowerCase();
      filteredClasses = filteredClasses.filter(
        (cls) =>
          cls.name.toLowerCase().includes(search) ||
          cls.description?.toLowerCase().includes(search) ||
          cls.homeroomTeacher?.fullName.toLowerCase().includes(search)
      );
    }

    if (request.grade !== undefined) {
      filteredClasses = filteredClasses.filter((cls) => cls.grade === request.grade);
    }

    if (request.academicYear) {
      filteredClasses = filteredClasses.filter((cls) => cls.academicYear === request.academicYear);
    }

    if (request.homeroomTeacherId) {
      filteredClasses = filteredClasses.filter((cls) => cls.homeroomTeacherId === request.homeroomTeacherId);
    }

    if (request.isActive !== undefined) {
      filteredClasses = filteredClasses.filter((cls) => cls.isActive === request.isActive);
    }

    // Apply sorting
    if (request.sort) {
      const [field, direction] = request.sort.split(':');
      filteredClasses.sort((a, b) => {
        let aVal = a[field as keyof Class] as any;
        let bVal = b[field as keyof Class] as any;

        if (typeof aVal === 'string') aVal = aVal.toLowerCase();
        if (typeof bVal === 'string') bVal = bVal.toLowerCase();

        if (direction === 'desc') {
          return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
        }
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      });
    }

    // Apply pagination
    const pageSize = request.pageSize || 10;
    const page = request.page || 0;
    const start = page * pageSize;
    const end = start + pageSize;
    const paginatedClasses = filteredClasses.slice(start, end);

    return {
      data: paginatedClasses,
      pagination: mapPagination({
        currentPage: page + 1,
        pageSize: pageSize,
        totalItems: filteredClasses.length,
        totalPages: Math.ceil(filteredClasses.length / pageSize),
      }),
      success: true,
      code: 200,
    };
  }

  async getClassById(id: string): Promise<Class | null> {
    await this._delay();
    return this.classes.find((cls) => cls.id === id) || null;
  }

  async createClass(data: ClassCreateRequest): Promise<Class> {
    await this._delay();

    const newClass: Class = {
      id: Date.now().toString(),
      ...data,
      currentEnrollment: 0,
      subjectTeachers: [],
      students: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      homeroomTeacher: data.homeroomTeacherId
        ? this.teachers.find((t) => t.id === data.homeroomTeacherId)
        : undefined,
    };

    this.classes.push(newClass);
    return newClass;
  }

  async updateClass(data: ClassUpdateRequest): Promise<Class> {
    await this._delay();

    const index = this.classes.findIndex((cls) => cls.id === data.id);
    if (index === -1) {
      throw new Error('Class not found');
    }

    const updatedClass = {
      ...this.classes[index],
      ...data,
      updatedAt: new Date().toISOString(),
      homeroomTeacher: data.homeroomTeacherId
        ? this.teachers.find((t) => t.id === data.homeroomTeacherId)
        : this.classes[index].homeroomTeacher,
    };

    this.classes[index] = updatedClass;
    return updatedClass;
  }

  async deleteClass(id: string): Promise<void> {
    await this._delay();

    const index = this.classes.findIndex((cls) => cls.id === id);
    if (index === -1) {
      throw new Error('Class not found');
    }

    // Check if class has students
    if (this.classes[index].currentEnrollment > 0) {
      throw new Error('Cannot delete class with enrolled students');
    }

    this.classes.splice(index, 1);
  }

  async getStudentsByClassId(classId: string): Promise<Student[]> {
    await this._delay();
    return this.students.filter((student) => student.classId === classId);
  }

  async enrollStudent(request: StudentEnrollmentRequest): Promise<Student> {
    await this._delay();

    const cls = this.classes.find((c) => c.id === request.classId);
    if (!cls) {
      throw new Error('Class not found');
    }

    if (cls.currentEnrollment >= cls.capacity) {
      throw new Error('Class is at full capacity');
    }

    const student = this.students.find((s) => s.id === request.studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    if (student.classId === request.classId) {
      throw new Error('Student is already enrolled in this class');
    }

    // Update student
    student.classId = request.classId;
    student.enrollmentDate = request.enrollmentDate || new Date().toISOString().split('T')[0];
    student.status = 'active';
    student.updatedAt = new Date().toISOString();

    // Update class enrollment count
    cls.currentEnrollment += 1;
    cls.updatedAt = new Date().toISOString();

    return student;
  }

  async removeStudentFromClass(classId: string, studentId: string): Promise<void> {
    await this._delay();

    const cls = this.classes.find((c) => c.id === classId);
    if (!cls) {
      throw new Error('Class not found');
    }

    const student = this.students.find((s) => s.id === studentId && s.classId === classId);
    if (!student) {
      throw new Error('Student not found in this class');
    }

    // Update class enrollment count
    cls.currentEnrollment = Math.max(0, cls.currentEnrollment - 1);
    cls.updatedAt = new Date().toISOString();

    // Remove student from students array (in real system, might just update status)
    const studentIndex = this.students.findIndex((s) => s.id === studentId);
    if (studentIndex > -1) {
      this.students.splice(studentIndex, 1);
    }
  }

  async transferStudent(request: StudentTransferRequest): Promise<Student> {
    await this._delay();

    const fromClass = this.classes.find((c) => c.id === request.fromClassId);
    const toClass = this.classes.find((c) => c.id === request.toClassId);

    if (!fromClass || !toClass) {
      throw new Error('Source or destination class not found');
    }

    if (toClass.currentEnrollment >= toClass.capacity) {
      throw new Error('Destination class is at full capacity');
    }

    const student = this.students.find(
      (s) => s.id === request.studentId && s.classId === request.fromClassId
    );
    if (!student) {
      throw new Error('Student not found in source class');
    }

    // Update student
    student.classId = request.toClassId;
    student.updatedAt = new Date().toISOString();

    // Update class enrollment counts
    fromClass.currentEnrollment = Math.max(0, fromClass.currentEnrollment - 1);
    fromClass.updatedAt = new Date().toISOString();

    toClass.currentEnrollment += 1;
    toClass.updatedAt = new Date().toISOString();

    return student;
  }

  async getTeachersByClassId(classId: string): Promise<Teacher[]> {
    await this._delay();

    const cls = this.classes.find((c) => c.id === classId);
    if (!cls) {
      return [];
    }

    const teacherIds = cls.subjectTeachers.map((st) => st.teacherId);
    if (cls.homeroomTeacherId) {
      teacherIds.push(cls.homeroomTeacherId);
    }

    return this.teachers.filter((teacher) => teacherIds.includes(teacher.id));
  }

  async assignTeacherToClass(request: TeacherAssignmentRequest): Promise<void> {
    await this._delay();

    const cls = this.classes.find((c) => c.id === request.classId);
    const teacher = this.teachers.find((t) => t.id === request.teacherId);

    if (!cls || !teacher) {
      throw new Error('Class or teacher not found');
    }

    if (!request.subject) {
      throw new Error('Subject is required for teacher assignment');
    }

    // Check if teacher already assigned to this subject in this class
    const existingAssignment = cls.subjectTeachers.find(
      (st) => st.teacherId === request.teacherId && st.subject === request.subject
    );

    if (existingAssignment) {
      throw new Error('Teacher is already assigned to this subject in this class');
    }

    // Add new assignment
    const newAssignment = {
      id: Date.now().toString(),
      classId: request.classId,
      teacherId: request.teacherId,
      teacher: teacher,
      subject: request.subject,
      isMainTeacher: request.isMainTeacher || false,
      assignedAt: new Date().toISOString(),
    };

    cls.subjectTeachers.push(newAssignment);
    cls.updatedAt = new Date().toISOString();
  }

  async removeTeacherFromClass(classId: string, teacherId: string, subject?: string): Promise<void> {
    await this._delay();

    const cls = this.classes.find((c) => c.id === classId);
    if (!cls) {
      throw new Error('Class not found');
    }

    if (subject) {
      // Remove specific subject assignment
      const index = cls.subjectTeachers.findIndex(
        (st) => st.teacherId === teacherId && st.subject === subject
      );
      if (index > -1) {
        cls.subjectTeachers.splice(index, 1);
        cls.updatedAt = new Date().toISOString();
      }
    } else {
      // Remove all assignments for this teacher
      cls.subjectTeachers = cls.subjectTeachers.filter((st) => st.teacherId !== teacherId);
      cls.updatedAt = new Date().toISOString();
    }
  }

  async assignHomeroomTeacher(classId: string, teacherId: string): Promise<Class> {
    await this._delay();

    const cls = this.classes.find((c) => c.id === classId);
    const teacher = this.teachers.find((t) => t.id === teacherId);

    if (!cls || !teacher) {
      throw new Error('Class or teacher not found');
    }

    // Update class
    cls.homeroomTeacherId = teacherId;
    cls.homeroomTeacher = teacher;
    cls.updatedAt = new Date().toISOString();

    // Update teacher
    teacher.isHomeroomTeacher = true;
    teacher.homeroomClassId = classId;
    teacher.updatedAt = new Date().toISOString();

    return cls;
  }

  async getAvailableTeachers(subject?: string): Promise<Teacher[]> {
    await this._delay();

    let availableTeachers = this.teachers.filter((teacher) => teacher.status === 'active');

    if (subject) {
      availableTeachers = availableTeachers.filter((teacher) => teacher.subjects.includes(subject));
    }

    return availableTeachers;
  }

  async getClassCapacityInfo(
    classId: string
  ): Promise<{ capacity: number; currentEnrollment: number; available: number }> {
    await this._delay();

    const cls = this.classes.find((c) => c.id === classId);
    if (!cls) {
      throw new Error('Class not found');
    }

    return {
      capacity: cls.capacity,
      currentEnrollment: cls.currentEnrollment,
      available: cls.capacity - cls.currentEnrollment,
    };
  }

  private async _delay(): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, 300));
  }
}

export { ClassMockApiService };
