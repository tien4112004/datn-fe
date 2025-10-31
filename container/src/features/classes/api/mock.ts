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
  StudentCreateRequest,
  StudentUpdateRequest,
  SubjectManagementRequest,
  DailySchedule,
  ScheduleCollectionRequest,
  ClassPeriod,
  LessonPlan,
  LessonPlanCollectionRequest,
  LearningObjective,
  LessonResource,
  CalendarEventsQueryParams,
  GetCalendarEventsResponse,
  Layout,
} from '../types';
import { API_MODE, type ApiMode } from '@/shared/constants';
import { mapPagination, type ApiResponse } from '@/shared/types/api';
import { initializeMockClasses, mockTeachers, mockStudents } from './data/mockData';
import { fetchClassEvents } from './calendarApi';

export default class ClassMockApiService implements ClassApiService {
  private classes = initializeMockClasses(mockTeachers, mockStudents);
  private students = [...mockStudents];
  private teachers = [...mockTeachers];
  private schedules: DailySchedule[] = [];
  private periods: ClassPeriod[] = [];
  private lessonPlans: LessonPlan[] = [];
  private objectives: LearningObjective[] = [];
  private resources: LessonResource[] = [];
  baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this._initializeMockData();
  }

  getType(): ApiMode {
    return API_MODE.mock;
  }

  private _initializeMockData() {
    // Initialize mock periods for the first class
    if (this.classes.length > 0) {
      const firstClass = this.classes[0];
      const mathTeacher = this.teachers.find((t) => t.subjects.includes('Toán'));
      const englishTeacher = this.teachers.find((t) => t.subjects.includes('Tiếng Anh'));

      if (mathTeacher) {
        // Monday Math period
        const mathPeriod: ClassPeriod = {
          id: 'period-1',
          classId: firstClass.id,
          subject: 'Toán',
          subjectCode: 'TOAN',
          dayOfWeek: 1, // Monday
          startTime: '07:30',
          endTime: '08:15',
          teacherId: mathTeacher.id,
          teacher: {
            id: mathTeacher.id,
            fullName: mathTeacher.fullName,
            email: mathTeacher.email,
          },
          room: 'A101',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        this.periods.push(mathPeriod);

        // Create a lesson plan for today if it's Monday
        const today = new Date();
        const lessonPlan: LessonPlan = {
          id: 'lesson-1',
          classId: firstClass.id,
          className: firstClass.name,
          subject: 'Toán',
          subjectCode: 'TOAN',
          title: 'Phương trình bậc hai',
          description: 'Học về phương trình bậc hai và cách giải',
          date: today.toISOString().split('T')[0],
          periodId: mathPeriod.id,
          startTime: '07:30',
          endTime: '08:15',
          duration: 45,
          teacherId: mathTeacher.id,
          teacher: {
            id: mathTeacher.id,
            fullName: mathTeacher.fullName,
            email: mathTeacher.email,
          },
          objectives: [],
          resources: [],
          status: 'planned',
          preparationTime: 30,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        this.lessonPlans.push(lessonPlan);

        // Add objectives
        const objective1: LearningObjective = {
          id: 'obj-1',
          lessonPlanId: lessonPlan.id,
          description: 'Hiểu công thức giải phương trình bậc hai',
          type: 'knowledge',
          isAchieved: false,
          createdAt: new Date().toISOString(),
        };
        const objective2: LearningObjective = {
          id: 'obj-2',
          lessonPlanId: lessonPlan.id,
          description: 'Áp dụng công thức vào giải bài tập',
          type: 'skill',
          isAchieved: false,
          createdAt: new Date().toISOString(),
        };
        this.objectives.push(objective1, objective2);

        // Add resources
        const resource1: LessonResource = {
          id: 'res-1',
          lessonPlanId: lessonPlan.id,
          name: 'Slide bài giảng Phương trình bậc hai',
          type: 'presentation',
          url: '/resources/math-quadratic-equations.pptx',
          description: 'Slide PowerPoint với ví dụ minh họa',
          isRequired: true,
          isPrepared: true,
          createdAt: new Date().toISOString(),
        };
        this.resources.push(resource1);

        // Create today's schedule
        const todaySchedule: DailySchedule = {
          date: today.toISOString().split('T')[0],
          classId: firstClass.id,
          periods: [mathPeriod],
        };
        this.schedules.push(todaySchedule);
      }

      if (englishTeacher) {
        // Tuesday English period
        const englishPeriod: ClassPeriod = {
          id: 'period-2',
          classId: firstClass.id,
          subject: 'Tiếng Anh',
          subjectCode: 'ANH',
          dayOfWeek: 2, // Tuesday
          startTime: '08:15',
          endTime: '09:00',
          teacherId: englishTeacher.id,
          teacher: {
            id: englishTeacher.id,
            fullName: englishTeacher.fullName,
            email: englishTeacher.email,
          },
          room: 'B202',
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        this.periods.push(englishPeriod);
      }
    }
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
      subjects: data.subjects || [],
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

  // Student CRUD operations for roster management
  async createStudent(classId: string, data: StudentCreateRequest): Promise<Student> {
    await this._delay();

    const cls = this.classes.find((c) => c.id === classId);
    if (!cls) {
      throw new Error('Class not found');
    }

    // Check for duplicate student code
    const existingStudent = this.students.find((s) => s.studentCode === data.studentCode);
    if (existingStudent) {
      throw new Error('Student code already exists');
    }

    // Create new student
    const newStudent: Student = {
      id: `student-${Date.now()}`,
      studentCode: data.studentCode,
      firstName: data.firstName,
      lastName: data.lastName,
      fullName: `${data.firstName} ${data.lastName}`,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      email: data.email,
      phone: data.phone,
      address: data.address,
      parentName: data.parentName,
      parentPhone: data.parentPhone,
      classId: classId,
      enrollmentDate: data.enrollmentDate || new Date().toISOString(),
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.students.push(newStudent);

    // Update class enrollment count
    cls.currentEnrollment += 1;
    cls.updatedAt = new Date().toISOString();

    return newStudent;
  }

  async updateStudent(studentId: string, data: StudentUpdateRequest): Promise<Student> {
    await this._delay();

    const student = this.students.find((s) => s.id === studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    // Check for duplicate student code if it's being changed
    if (data.studentCode && data.studentCode !== student.studentCode) {
      const existingStudent = this.students.find((s) => s.studentCode === data.studentCode);
      if (existingStudent) {
        throw new Error('Student code already exists');
      }
    }

    // Update student fields
    if (data.studentCode) student.studentCode = data.studentCode;
    if (data.firstName) student.firstName = data.firstName;
    if (data.lastName) student.lastName = data.lastName;
    if (data.firstName || data.lastName) {
      student.fullName = `${student.firstName} ${student.lastName}`;
    }
    if (data.dateOfBirth) student.dateOfBirth = data.dateOfBirth;
    if (data.gender) student.gender = data.gender;
    if (data.email !== undefined) student.email = data.email;
    if (data.phone !== undefined) student.phone = data.phone;
    if (data.address !== undefined) student.address = data.address;
    if (data.parentName !== undefined) student.parentName = data.parentName;
    if (data.parentPhone !== undefined) student.parentPhone = data.parentPhone;
    if (data.status) student.status = data.status;

    student.updatedAt = new Date().toISOString();

    return student;
  }

  async deleteStudent(studentId: string): Promise<void> {
    await this._delay();

    const studentIndex = this.students.findIndex((s) => s.id === studentId);
    if (studentIndex === -1) {
      throw new Error('Student not found');
    }

    const student = this.students[studentIndex];

    // Update class enrollment count
    const cls = this.classes.find((c) => c.id === student.classId);
    if (cls) {
      cls.currentEnrollment = Math.max(0, cls.currentEnrollment - 1);
      cls.updatedAt = new Date().toISOString();
    }

    // Remove student
    this.students.splice(studentIndex, 1);
  }

  async getTeachersByClassId(classId: string): Promise<Teacher[]> {
    await this._delay();

    const cls = this.classes.find((c) => c.id === classId);
    if (!cls) {
      return [];
    }

    // Return only the homeroom teacher
    if (cls.homeroomTeacherId) {
      const teacher = this.teachers.find((t) => t.id === cls.homeroomTeacherId);
      return teacher ? [teacher] : [];
    }

    return [];
  }

  async addSubjectToClass(request: SubjectManagementRequest): Promise<void> {
    await this._delay();

    const cls = this.classes.find((c) => c.id === request.classId);
    if (!cls) {
      throw new Error('Class not found');
    }

    // Check if subject already exists
    if (cls.subjects.includes(request.subject)) {
      throw new Error('Subject already exists in this class');
    }

    cls.subjects.push(request.subject);
    cls.updatedAt = new Date().toISOString();
  }

  async removeSubjectFromClass(request: SubjectManagementRequest): Promise<void> {
    await this._delay();

    const cls = this.classes.find((c) => c.id === request.classId);
    if (!cls) {
      throw new Error('Class not found');
    }

    const index = cls.subjects.indexOf(request.subject);
    if (index > -1) {
      cls.subjects.splice(index, 1);
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

  async removeHomeroomTeacher(classId: string): Promise<Class> {
    await this._delay();

    const cls = this.classes.find((c) => c.id === classId);
    if (!cls) {
      throw new Error('Class not found');
    }

    const teacher = this.teachers.find((t) => t.id === cls.homeroomTeacherId);
    if (teacher) {
      teacher.isHomeroomTeacher = false;
      teacher.homeroomClassId = undefined;
      teacher.updatedAt = new Date().toISOString();
    }

    cls.homeroomTeacherId = undefined;
    cls.homeroomTeacher = undefined;
    cls.updatedAt = new Date().toISOString();

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

  // Schedule and Lesson Management
  async getSchedules(
    classId: string,
    params: ScheduleCollectionRequest
  ): Promise<ApiResponse<DailySchedule[]>> {
    await this._delay();

    let filtered = this.schedules.filter((s) => s.classId === classId);

    if (params.startDate) {
      filtered = filtered.filter((s) => s.date >= params.startDate!);
    }

    if (params.endDate) {
      filtered = filtered.filter((s) => s.date <= params.endDate!);
    }

    return {
      data: filtered,
      success: true,
      code: 200,
    };
  }

  async getPeriods(classId: string, params: { date?: string }): Promise<ApiResponse<ClassPeriod[]>> {
    await this._delay();

    let filtered = this.periods.filter((p) => p.classId === classId && p.isActive);

    if (params.date) {
      // Filter by date if provided
      const schedule = this.schedules.find((s) => s.classId === classId && s.date === params.date);
      if (schedule) {
        filtered = filtered.filter((p) => schedule.periods.some((sp) => sp.id === p.id));
      }
    }

    return {
      data: filtered,
      success: true,
      code: 200,
    };
  }

  async getLessonPlans(
    classId: string,
    params: LessonPlanCollectionRequest
  ): Promise<ApiResponse<LessonPlan[]>> {
    await this._delay();

    let filtered = this.lessonPlans.filter((lp) => lp.classId === classId);

    if (params.subject) {
      filtered = filtered.filter((lp) => lp.subject === params.subject);
    }

    if (params.status) {
      filtered = filtered.filter((lp) => lp.status === params.status);
    }

    if (params.date) {
      filtered = filtered.filter((lp) => lp.date === params.date);
    }

    if (params.startDate) {
      filtered = filtered.filter((lp) => lp.date >= params.startDate!);
    }

    if (params.endDate) {
      filtered = filtered.filter((lp) => lp.date <= params.endDate!);
    }

    return {
      data: filtered,
      success: true,
      code: 200,
    };
  }

  async getLessonObjectives(lessonPlanId: string): Promise<LearningObjective[]> {
    await this._delay();
    return this.objectives.filter((obj) => obj.lessonPlanId === lessonPlanId);
  }

  async getLessonResources(lessonPlanId: string): Promise<LessonResource[]> {
    await this._delay();
    return this.resources.filter((res) => res.lessonPlanId === lessonPlanId);
  }

  // Lesson Plan mutations
  async updateLessonStatus(id: string, status: string, notes?: string): Promise<LessonPlan> {
    await this._delay();

    const lessonPlan = this.lessonPlans.find((lp) => lp.id === id);
    if (!lessonPlan) {
      throw new Error('Lesson plan not found');
    }

    lessonPlan.status = status as any;
    if (notes !== undefined) {
      lessonPlan.notes = notes;
    }
    lessonPlan.updatedAt = new Date().toISOString();

    if (status === 'completed') {
      lessonPlan.date = new Date().toISOString().split('T')[0];
    }

    return lessonPlan;
  }

  async createLessonPlan(data: any): Promise<LessonPlan> {
    await this._delay();

    const teacher = this.teachers.find((t) => t.id === data.teacherId);
    const cls = this.classes.find((c) => c.id === data.classId);

    if (!teacher || !cls) {
      throw new Error('Teacher or class not found');
    }

    const newLessonPlan: LessonPlan = {
      id: Date.now().toString(),
      classId: data.classId,
      className: cls.name,
      subject: data.subject,
      subjectCode: data.subjectCode,
      title: data.title,
      description: data.description,
      date: data.date,
      periodId: data.periodId,
      startTime: data.startTime,
      endTime: data.endTime,
      duration: data.duration || 45,
      teacherId: data.teacherId,
      teacher: {
        id: teacher.id,
        fullName: teacher.fullName,
        email: teacher.email,
      },
      objectives: [],
      resources: [],
      status: 'planned',
      notes: data.notes,
      preparationTime: data.preparationTime,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.lessonPlans.push(newLessonPlan);
    return newLessonPlan;
  }

  // Objective mutations
  async updateObjective(id: string, updates: any): Promise<LearningObjective> {
    await this._delay();

    const objective = this.objectives.find((obj) => obj.id === id);
    if (!objective) {
      throw new Error('Objective not found');
    }

    Object.assign(objective, updates);
    return objective;
  }

  async addObjectiveNote(id: string, note: string): Promise<LearningObjective> {
    await this._delay();

    const objective = this.objectives.find((obj) => obj.id === id);
    if (!objective) {
      throw new Error('Objective not found');
    }

    objective.notes = objective.notes ? `${objective.notes}\n${note}` : note;
    return objective;
  }

  // Resource mutations
  async addResource(resource: any): Promise<LessonResource> {
    await this._delay();

    const newResource: LessonResource = {
      id: Date.now().toString(),
      lessonPlanId: resource.lessonPlanId,
      name: resource.name,
      type: resource.type,
      url: resource.url,
      filePath: resource.filePath,
      description: resource.description,
      isRequired: resource.isRequired || false,
      isPrepared: resource.isPrepared || false,
      createdAt: new Date().toISOString(),
    };

    this.resources.push(newResource);
    return newResource;
  }

  async updateResource(id: string, updates: any): Promise<LessonResource> {
    await this._delay();

    const resource = this.resources.find((res) => res.id === id);
    if (!resource) {
      throw new Error('Resource not found');
    }

    Object.assign(resource, updates);
    return resource;
  }

  async deleteResource(id: string): Promise<void> {
    await this._delay();

    const index = this.resources.findIndex((res) => res.id === id);
    if (index > -1) {
      this.resources.splice(index, 1);
    }
  }

  // Schedule mutations
  async addPeriod(data: any): Promise<ClassPeriod> {
    await this._delay();

    const teacher = this.teachers.find((t) => t.id === data.teacherId);
    if (!teacher) {
      throw new Error('Teacher not found');
    }

    const newPeriod: ClassPeriod = {
      id: Date.now().toString(),
      classId: data.classId,
      subject: data.subject,
      subjectCode: data.subjectCode,
      dayOfWeek: data.dayOfWeek,
      startTime: data.startTime,
      endTime: data.endTime,
      teacherId: data.teacherId,
      teacher: {
        id: teacher.id,
        fullName: teacher.fullName,
        email: teacher.email,
      },
      room: data.room,
      isActive: true,
      lessonPlanId: data.lessonPlanId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.periods.push(newPeriod);
    return newPeriod;
  }

  async updatePeriod(id: string, updates: any): Promise<ClassPeriod> {
    await this._delay();

    const period = this.periods.find((p) => p.id === id);
    if (!period) {
      throw new Error('Period not found');
    }

    Object.assign(period, updates);
    period.updatedAt = new Date().toISOString();
    return period;
  }

  async linkLessonToPeriod(periodId: string, lessonPlanId: string): Promise<void> {
    await this._delay();

    const period = this.periods.find((p) => p.id === periodId);
    if (!period) {
      throw new Error('Period not found');
    }

    period.lessonPlanId = lessonPlanId;
    period.updatedAt = new Date().toISOString();
  }

  async unlinkLessonFromPeriod(periodId: string): Promise<void> {
    await this._delay();

    const period = this.periods.find((p) => p.id === periodId);
    if (!period) {
      throw new Error('Period not found');
    }

    period.lessonPlanId = undefined;
    period.updatedAt = new Date().toISOString();
  }

  // Calendar Events
  async getCalendarEvents(
    classId: string,
    params: CalendarEventsQueryParams
  ): Promise<GetCalendarEventsResponse> {
    // Delegate to existing calendarApi implementation
    return fetchClassEvents(classId, params);
  }

  // Seating Chart (stub implementations)
  async getSeatingChart(classId: string): Promise<Layout | null> {
    await this._delay();

    return this.classes.find((c) => c.id === classId)?.layout || null;
  }

  async saveSeatingChart(classId: string, layout: any): Promise<any> {
    await this._delay();
    // TODO: Implement seating chart save logic
    return { classId, layout };
  }

  // CSV Import - Simulates happy case and error case based on filename
  async submitImport(_classId: string, file: File): Promise<any> {
    await this._delay(5000);

    // Simulate error case if filename contains "error"
    if (file.name.toLowerCase().includes('error')) {
      throw new Error('Failed to import students');
    }

    // Happy case: successful import
    const studentsCreated = 15;
    return {
      success: true,
      studentsCreated,
      message: `Successfully imported ${studentsCreated} students`,
    };
  }

  private async _delay(time: number = 300): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, time));
  }
}

export { ClassMockApiService };
