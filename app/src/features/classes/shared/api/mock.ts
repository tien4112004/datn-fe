import {
  type Class,
  type Student,
  type ClassApiService,
  type ClassCollectionRequest,
  type ClassCreateRequest,
  type ClassUpdateRequest,
  type StudentEnrollmentRequest,
  type StudentCreateRequest,
  type StudentUpdateRequest,
  type DailySchedule,
  type SchedulePeriod,
  type ScheduleCollectionRequest,
  type Lesson,
  type LessonCollectionRequest,
  type Layout,
  type LessonCreateRequest,
  type LessonUpdateRequest,
  type SchedulePeriodCreateRequest,
  type SchedulePeriodUpdateRequest,
  type ImportResult,
  type ObjectiveType,
  toMinimalSchedulePeriod,
} from '../types';
import { API_MODE, type ApiMode } from '@aiprimary/api';
import { mapPagination, type ApiResponse } from '@aiprimary/api';

import { classesTable } from './data/classes.data';
import { studentsTable } from './data/students.data';
import { schedulePeriodsTable } from './data/schedule-periods.data';
import { lessonsTable } from './data/lesson-plans.data';
import { seatingLayoutsTable } from './data/seating-layouts.data';

export default class ClassMockApiService implements ClassApiService {
  private classes: Class[] = [];
  private students: Student[] = [];
  private schedules: DailySchedule[] = [];
  private periods: SchedulePeriod[] = [];
  private lessons: Lesson[] = [];
  baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    this._initializeMockData();
  }

  getType(): ApiMode {
    return API_MODE.mock;
  }

  private _initializeMockData() {
    this.students = [...studentsTable];

    // Initialize data from data tables with proper transformations
    this.classes = classesTable.map((classData) => ({
      ...classData,
      students: studentsTable.filter((s) => s.classId === classData.id),
      layout: seatingLayoutsTable.find((layout) => layout.classId === classData.id),
    }));

    this.periods = [
      ...schedulePeriodsTable.map((periodData) => ({
        ...periodData,
      })),
    ];

    // Initialize lessons with populated objectives and resources
    this.lessons = lessonsTable.map((lessonData) => {
      return {
        ...lessonData,
        objectives: lessonData.objectives || [], // Use inline objectives from lesson
        resources: lessonData.resources || [], // Use inline resources from lesson
        subject: lessonData.subject, // subject is already the code
      };
    });

    // Generate daily schedules for each class
    if (this.classes.length > 0) {
      this.classes.forEach((classItem) => {
        const classSchedules = this.periods.filter((p) => p.classId === classItem.id);

        if (classSchedules.length > 0) {
          // Group periods by their date field
          const periodsByDate = new Map<string, typeof classSchedules>();

          classSchedules.forEach((period) => {
            if (!period.date) return; // Skip periods without dates

            if (!periodsByDate.has(period.date)) {
              periodsByDate.set(period.date, []);
            }
            periodsByDate.get(period.date)!.push(period);
          });

          // Create DailySchedule for each date
          periodsByDate.forEach((periods, dateStr) => {
            this.schedules.push({
              date: dateStr,
              classId: classItem.id,
              periods: periods,
            });
          });
        }
      });
    }

    // Map lessons to their schedule periods - initialize empty lessons arrays
    this.periods.forEach((period) => {
      period.lessons = [];
    });

    // Map schedule periods to lessons
    this.lessons.forEach((lesson) => {
      const linkedPeriodsList = this.periods.filter((p) => p.lessons.some((l) => l.id === lesson.id));
      lesson.linkedPeriods = linkedPeriodsList.map((p) => toMinimalSchedulePeriod(p));
    });
  }

  getLesson(id: string): Promise<Lesson | null> {
    this._delay();

    const lesson = this.lessons.find((lp) => lp.id === id);
    return Promise.resolve(lesson || null);
  }

  async getClasses(request: ClassCollectionRequest): Promise<ApiResponse<Class[]>> {
    await this._delay();

    let filteredClasses = [...this.classes];

    // Apply filters
    if (request.search) {
      const search = request.search.toLowerCase();
      filteredClasses = filteredClasses.filter(
        (cls) => cls.name.toLowerCase().includes(search) || cls.description?.toLowerCase().includes(search)
      );
    }

    if (request.grade !== undefined) {
      filteredClasses = filteredClasses.filter((cls) => cls.settings?.grade === request.grade);
    }

    if (request.academicYear) {
      filteredClasses = filteredClasses.filter((cls) => cls.settings?.academicYear === request.academicYear);
    }

    if (request.isActive !== undefined) {
      filteredClasses = filteredClasses.filter((cls) => cls.isActive === request.isActive);
    }

    // Apply sorting
    if (request.sort) {
      const [field, direction] = request.sort.split(':');
      filteredClasses.sort((a, b) => {
        let aVal = a[field as keyof Class] as string | number | boolean | undefined;
        let bVal = b[field as keyof Class] as string | number | boolean | undefined;

        // Handle undefined values
        if (aVal === undefined && bVal === undefined) return 0;
        if (aVal === undefined) return direction === 'desc' ? 1 : -1;
        if (bVal === undefined) return direction === 'desc' ? -1 : 1;

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

    // Parse settings from JSON string if needed
    let parsedSettings = null;
    if (data.settings && typeof data.settings === 'string') {
      try {
        parsedSettings = JSON.parse(data.settings);
      } catch (error) {
        console.error('Failed to parse settings:', error);
      }
    } else if (data.settings) {
      parsedSettings = data.settings;
    }

    const newClass: Class = {
      id: Date.now().toString(),
      ...data,
      ownerId: '1',
      teacherId: '1',
      students: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      name: data.name,
      settings: parsedSettings,
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

    const updatedClass: Class = {
      ...this.classes[index],
      ...(data.name !== undefined && data.name !== null && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.settings !== undefined && {
        settings: typeof data.settings === 'string' ? JSON.parse(data.settings) : data.settings,
      }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      updatedAt: new Date().toISOString(),
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
    if (this.students.filter((s) => s.classId === id).length > 0) {
      throw new Error('Cannot delete class with enrolled students');
    }

    this.classes.splice(index, 1);
  }

  async getStudentsByClassId(classId: string): Promise<Student[]> {
    await this._delay();
    return this.students.filter((student) => student.classId === classId);
  }

  async getStudentById(studentId: string): Promise<Student | null> {
    await this._delay();
    const student = this.students.find((s) => s.id === studentId);
    return student || null;
  }

  async enrollStudent(request: StudentEnrollmentRequest): Promise<Student> {
    await this._delay();

    const cls = this.classes.find((c) => c.id === request.classId);
    if (!cls) {
      throw new Error('Class not found');
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
    student.updatedAt = new Date().toISOString();

    // Update class timestamp
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

    // Update class timestamp
    cls.updatedAt = new Date().toISOString();

    // Remove student from students array (in real system, might just update status)
    const studentIndex = this.students.findIndex((s) => s.id === studentId);
    if (studentIndex > -1) {
      this.students.splice(studentIndex, 1);
    }
  }

  // Student CRUD operations for roster management
  async createStudent(classId: string, data: StudentCreateRequest): Promise<Student> {
    await this._delay();

    const cls = this.classes.find((c) => c.id === classId);
    if (!cls) {
      throw new Error('Class not found');
    }

    // Create new student
    const newStudent: Student = {
      id: `student-${Date.now()}`,
      userId: `user-${Date.now()}`,
      firstName: data.firstName,
      lastName: data.lastName,
      address: data.address,
      parentContactEmail: data.parentContactEmail,
      phoneNumber: data.phoneNumber,
      avatarUrl: data.avatarUrl,
      enrollmentDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.students.push(newStudent);

    // Update class timestamp
    cls.updatedAt = new Date().toISOString();

    return newStudent;
  }

  async updateStudent(studentId: string, data: StudentUpdateRequest): Promise<Student> {
    await this._delay();

    const student = this.students.find((s) => s.id === studentId);
    if (!student) {
      throw new Error('Student not found');
    }

    // Update student fields
    if (data.firstName !== undefined) student.firstName = data.firstName;
    if (data.lastName !== undefined) student.lastName = data.lastName;
    if (data.phoneNumber !== undefined) student.phoneNumber = data.phoneNumber;
    if (data.address !== undefined) student.address = data.address;
    if (data.parentContactEmail !== undefined) student.parentContactEmail = data.parentContactEmail;
    if (data.avatarUrl !== undefined) student.avatarUrl = data.avatarUrl;
    if (data.status !== undefined) student.status = data.status;

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

    // Update class timestamp
    const cls = this.classes.find((c) => c.id === student.classId);
    if (cls) {
      cls.updatedAt = new Date().toISOString();
    }

    // Remove student
    this.students.splice(studentIndex, 1);
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

    // Populate lesson data for each period
    filtered = filtered.map((schedule) => ({
      ...schedule,
      periods: schedule.periods.map((period) => {
        return period;
      }),
    }));

    return {
      data: filtered,
      success: true,
      code: 200,
    };
  }

  async getSchedulePeriods(
    classId: string,
    params: { date?: string; startDate?: string; endDate?: string }
  ): Promise<ApiResponse<SchedulePeriod[]>> {
    await this._delay();

    let filtered = this.periods.filter((p) => p.classId === classId && p.isActive);

    if (params.date) {
      // Filter by specific date
      const schedule = this.schedules.find((s) => s.classId === classId && s.date === params.date);
      if (schedule) {
        filtered = filtered.filter((p) => schedule.periods.some((period) => period.id === p.id));
      }
    } else if (params.startDate && params.endDate) {
      // Filter by date range
      filtered = filtered.filter((p) => {
        const periodDate = p.date;
        return periodDate >= params.startDate! && periodDate <= params.endDate!;
      });
    }

    // Periods already have lessons loaded from constructor
    // No additional mapping needed

    return {
      data: filtered,
      success: true,
      code: 200,
    };
  }

  async getPeriodById(id: string): Promise<SchedulePeriod | null> {
    await this._delay();
    const period = this.periods.find((p) => p.id === id);
    if (!period) {
      return null;
    }
    // Lessons are already loaded in the period
    return period;
  }

  async getLessons(classId: string, params: LessonCollectionRequest): Promise<ApiResponse<Lesson[]>> {
    await this._delay();

    let filtered = this.lessons.filter((lp) => lp.classId === classId);

    if (params.subject) {
      filtered = filtered.filter((lp) => lp.subject === params.subject);
    }

    if (params.status) {
      filtered = filtered.filter((lp) => lp.status === params.status);
    }

    return {
      data: filtered,
      success: true,
      code: 200,
    };
  }

  // Lesson  mutations
  async updateLessonStatus(id: string, status: string, notes?: string): Promise<Lesson> {
    await this._delay();

    const lesson = this.lessons.find((lp) => lp.id === id);
    if (!lesson) {
      throw new Error('Lesson plan not found');
    }

    lesson.status = status as Lesson['status'];
    if (notes !== undefined) {
      lesson.notes = notes;
    }
    lesson.updatedAt = new Date().toISOString();

    return lesson;
  }

  async createLesson(data: LessonCreateRequest): Promise<Lesson> {
    await this._delay();

    const cls = this.classes.find((c) => c.id === data.classId);

    if (!cls) {
      throw new Error('Class not found');
    }

    const newLesson: Lesson = {
      id: Date.now().toString(),
      classId: data.classId,
      authorId: '1', // Default author ID for mock API
      className: cls.name,
      subject: data.subject || null,
      title: data.title,
      content: data.content,
      type: data.type || 'lecture',
      duration: 45, // Default duration, could be calculated from start/end time
      linkedPeriods: [],
      learningObjectives:
        data.learningObjectives?.map((obj, index) => ({
          id: `obj-${Date.now()}-${index}`,
          lessonId: Date.now().toString(),
          description: obj.description,
          type: (obj.type as ObjectiveType) || 'knowledge',
          isAchieved: obj.isAchieved || false,
          notes: obj.notes || undefined,
        })) || null,
      lessonPlan: data.lessonPlan || null,
      maxPoints: data.maxPoints || null,
      dueDate: data.dueDate || null,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Legacy fields for compatibility
      description: data.content,
      objectives:
        data.learningObjectives?.map((obj, index) => ({
          id: `obj-${Date.now()}-${index}`,
          lessonId: Date.now().toString(),
          description: obj.description,
          type: (obj.type as ObjectiveType) || 'knowledge',
          isAchieved: obj.isAchieved || false,
          notes: obj.notes || undefined,
        })) || [],
      resources: [],
      notes: data.lessonPlan || undefined,
    };

    this.lessons.push(newLesson);
    return newLesson;
  }

  async updateLesson(data: LessonUpdateRequest): Promise<Lesson> {
    await this._delay();

    const lesson = this.lessons.find((lp) => lp.id === data.id);
    if (!lesson) {
      throw new Error('Lesson plan not found');
    }

    // Update basic fields
    if (data.title !== undefined) lesson.title = data.title;
    if (data.content !== undefined) {
      lesson.content = data.content;
      lesson.description = data.content; // Keep legacy field in sync
    }
    if (data.subject !== undefined) lesson.subject = data.subject;
    if (data.type !== undefined) lesson.type = data.type;
    if (data.status !== undefined) lesson.status = data.status;
    if (data.lessonPlan !== undefined) {
      lesson.lessonPlan = data.lessonPlan;
      lesson.notes = data.lessonPlan ?? undefined; // Keep legacy field in sync
    }
    if (data.maxPoints !== undefined) lesson.maxPoints = data.maxPoints;
    if (data.dueDate !== undefined) lesson.dueDate = data.dueDate;

    // Update learning objectives if provided
    if (data.learningObjectives !== undefined) {
      lesson.learningObjectives =
        data.learningObjectives?.map((obj, index) => ({
          id: `obj-${Date.now()}-${index}`,
          lessonId: lesson.id,
          description: obj.description,
          type: (obj.type as ObjectiveType) || 'knowledge',
          isAchieved: obj.isAchieved || false,
          notes: obj.notes || undefined,
        })) || null;
      // Keep legacy field in sync
      lesson.objectives = lesson.learningObjectives || [];
    }

    lesson.updatedAt = new Date().toISOString();
    return lesson;
  }

  async deleteLesson(id: string): Promise<void> {
    await this._delay();

    const lessonIndex = this.lessons.findIndex((lp) => lp.id === id);
    if (lessonIndex === -1) {
      throw new Error('Lesson not found');
    }

    this.lessons.splice(lessonIndex, 1);
  }

  // Schedule mutations
  async addSchedulePeriod(_classId: string, data: SchedulePeriodCreateRequest): Promise<SchedulePeriod> {
    await this._delay();

    const newEvent: SchedulePeriod = {
      id: Date.now().toString(),
      classId: data.classId,
      name: 'New Period', // Default name since subject is not specified
      subject: '', // No subject specified
      date: data.date,
      startTime: data.startTime,
      endTime: data.endTime,
      category: 'other', // Default category
      location: data.location,
      description: null,
      isActive: true,
      lessons: [], // Will be populated when lessons are linked
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.periods.push(newEvent);
    return newEvent;
  }

  async updateSchedulePeriod(
    _classId: string,
    id: string,
    updates: SchedulePeriodUpdateRequest
  ): Promise<SchedulePeriod> {
    await this._delay();

    const period = this.periods.find((p) => p.id === id);
    if (!period) {
      throw new Error('Period not found');
    }

    Object.assign(period, updates);
    period.updatedAt = new Date().toISOString();
    return period;
  }

  async linkLessonToSchedulePeriod(_classId: string, periodId: string, lessonId: string): Promise<void> {
    await this._delay();

    const period = this.periods.find((p) => p.id === periodId);
    const lesson = this.lessons.find((lp) => lp.id === lessonId);

    if (!period) {
      throw new Error('Period not found');
    }
    if (!lesson) {
      throw new Error('Lesson plan not found');
    }

    // Add lesson to the lessons array if not already present
    if (!period.lessons.find((l) => l.id === lessonId)) {
      period.lessons.push(lesson);
    }
    period.updatedAt = new Date().toISOString();
  }

  async unlinkLessonFromSchedulePeriod(_classId: string, periodId: string, lessonId: string): Promise<void> {
    await this._delay();

    const period = this.periods.find((p) => p.id === periodId);
    if (!period) {
      throw new Error('Period not found');
    }

    // Remove lesson from the lessons array
    period.lessons = period.lessons.filter((l) => l.id !== lessonId);
    period.updatedAt = new Date().toISOString();
  }

  // Seating Chart (stub implementations)
  async getSeatingChart(classId: string): Promise<Layout | null> {
    await this._delay();

    return this.classes.find((c) => c.id === classId)?.layout || null;
  }

  async saveSeatingChart(_classId: string, layout: Layout): Promise<Layout> {
    await this._delay();
    // TODO: Implement seating chart save logic
    return layout;
  }

  // CSV Import - Simulates happy case and error case based on filename
  async submitImport(_classId: string, file: File): Promise<ImportResult> {
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

  async getPeriodsBySubject(classId: string, subjectCode: string): Promise<SchedulePeriod[]> {
    await this._delay();

    // Return all periods for this class and subject code, sorted by date
    const res = this.periods
      .filter((p) => p.classId === classId && p.subject === subjectCode)
      .sort((a, b) => {
        const dateCompare = new Date(a.date).getTime() - new Date(b.date).getTime();
        if (dateCompare !== 0) return dateCompare;
        return (a.startTime || '').localeCompare(b.startTime || '');
      })
      // Lessons are already loaded in each period
      .map((period) => period);

    return res;
  }

  private async _delay(time: number = 300): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, time));
  }
}

export { ClassMockApiService };
