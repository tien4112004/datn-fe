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
  type MinimalSchedulePeriod,
  type ScheduleCollectionRequest,
  type LessonPlan,
  type LessonPlanCollectionRequest,
  type Layout,
  type LessonPlanCreateRequest,
  type LessonPlanUpdateRequest,
  type SchedulePeriodCreateRequest,
  type SchedulePeriodUpdateRequest,
  type ImportResult,
  toMinimalSchedulePeriod,
} from '../types';
import { API_MODE, type ApiMode } from '@/shared/constants';
import { mapPagination, type ApiResponse } from '@/shared/types/api';

import { classesTable } from './data/classes.data';
import { studentsTable } from './data/students.data';
import { schedulePeriodsTable } from './data/schedule-periods.data';
import { lessonPlansTable } from './data/lesson-plans.data';
import { seatingLayoutsTable } from './data/seating-layouts.data';

export default class ClassMockApiService implements ClassApiService {
  private classes: Class[] = [];
  private students: Student[] = [];
  private schedules: DailySchedule[] = [];
  private periods: SchedulePeriod[] = [];
  private lessonPlans: LessonPlan[] = [];
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

    // Initialize lesson plans with populated objectives and resources
    this.lessonPlans = lessonPlansTable.map((lessonData) => {
      return {
        ...lessonData,
        objectives: lessonData.objectives || [], // Use inline objectives from lesson plan
        resources: lessonData.resources || [], // Use inline resources from lesson plan
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

    // Map lessons to their schedule periods
    this.periods.forEach((period) => {
      if (period.lessonPlanId) {
        const lessonPlan = this.lessonPlans.find((lp) => lp.id === period.lessonPlanId);
        if (lessonPlan) {
          period.lessonPlan = lessonPlan;
        }
      }
    });

    // Map schedule periods to lessons
    this.lessonPlans.forEach((lesson) => {
      const linkedPeriods = this.periods.filter((p) => p.lessonPlanId === lesson.id);
      lesson.linkedPeriod = toMinimalSchedulePeriod(linkedPeriods[0]);
    });
  }

  getLessonPlan(id: string): Promise<LessonPlan | null> {
    this._delay();

    const lessonPlan = this.lessonPlans.find((lp) => lp.id === id);
    return Promise.resolve(lessonPlan || null);
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
      filteredClasses = filteredClasses.filter((cls) => cls.grade === request.grade);
    }

    if (request.academicYear) {
      filteredClasses = filteredClasses.filter((cls) => cls.academicYear === request.academicYear);
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

    const newClass: Class = {
      id: Date.now().toString(),
      ...data,
      teacherId: '1',
      currentEnrollment: 0,
      students: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
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
      fullName: data.fullName,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
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

    // Update student fields
    if (data.fullName !== undefined) student.fullName = data.fullName;
    if (data.dateOfBirth !== undefined) student.dateOfBirth = data.dateOfBirth;
    if (data.gender !== undefined) student.gender = data.gender;
    if (data.address !== undefined) student.address = data.address;
    if (data.parentName !== undefined) student.parentName = data.parentName;
    if (data.parentPhone !== undefined) student.parentPhone = data.parentPhone;
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

    // Update class enrollment count
    const cls = this.classes.find((c) => c.id === student.classId);
    if (cls) {
      cls.currentEnrollment = Math.max(0, cls.currentEnrollment - 1);
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

    // Populate lesson plan data for each period
    filtered = filtered.map((schedule) => ({
      ...schedule,
      periods: schedule.periods.map((period) => {
        if (period.lessonPlanId) {
          const lessonPlan = this.lessonPlans.find((lp) => lp.id === period.lessonPlanId);
          return lessonPlan ? { ...period, lessonPlan } : period;
        }
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

    // Populate lesson plan data for each period
    filtered = filtered.map((period) => {
      if (period.lessonPlanId) {
        const lessonPlan = this.lessonPlans.find((lp) => lp.id === period.lessonPlanId);
        return lessonPlan ? { ...period, lessonPlan } : period;
      }
      return period;
    });

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
    if (period.lessonPlanId) {
      const lessonPlan = this.lessonPlans.find((lp) => lp.id === period.lessonPlanId);
      if (lessonPlan) {
        period.lessonPlan = lessonPlan;
      }
    }
    return period;
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

    return {
      data: filtered,
      success: true,
      code: 200,
    };
  }

  // Lesson Plan mutations
  async updateLessonStatus(id: string, status: string, notes?: string): Promise<LessonPlan> {
    await this._delay();

    const lessonPlan = this.lessonPlans.find((lp) => lp.id === id);
    if (!lessonPlan) {
      throw new Error('Lesson plan not found');
    }

    lessonPlan.status = status as LessonPlan['status'];
    if (notes !== undefined) {
      lessonPlan.notes = notes;
    }
    lessonPlan.updatedAt = new Date().toISOString();

    return lessonPlan;
  }

  async createLessonPlan(data: LessonPlanCreateRequest): Promise<LessonPlan> {
    await this._delay();

    const cls = this.classes.find((c) => c.id === data.classId);

    if (!cls) {
      throw new Error('Class not found');
    }

    // Look up the binded period if provided
    let bindedPeriod: MinimalSchedulePeriod | undefined;
    if (data.bindedPeriodId) {
      const period = this.periods.find((p) => p.id === data.bindedPeriodId);
      if (period) {
        bindedPeriod = {
          id: period.id,
          classId: period.classId,
          name: period.name,
          subject: period.subject, // This is now a string code
          date: period.date,
          startTime: period.startTime,
          endTime: period.endTime,
          category: period.category,
          isActive: period.isActive,
        };
      }
    }

    const newLessonPlan: LessonPlan = {
      id: Date.now().toString(),
      classId: data.classId,
      className: cls.name,
      subject: '', // Subject not specified in request
      title: data.title,
      description: data.description,
      duration: 45, // Default duration, could be calculated from start/end time
      linkedPeriod: bindedPeriod,
      objectives: data.objectives.map((obj, index) => ({
        ...obj,
        lessonPlanId: '', // Will be set after creation
        id: `obj-${Date.now()}-${index}`, // Temporary ID for API operations
      })),
      resources: data.resources.map((res, index) => ({
        ...res,
        lessonPlanId: '', // Will be set after creation
        id: `res-${Date.now()}-${index}`, // Temporary ID for API operations
      })),
      status: 'planned',
      notes: data.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.lessonPlans.push(newLessonPlan);
    return newLessonPlan;
  }

  async updateLessonPlan(data: LessonPlanUpdateRequest): Promise<LessonPlan> {
    await this._delay();

    const lessonPlan = this.lessonPlans.find((lp) => lp.id === data.id);
    if (!lessonPlan) {
      throw new Error('Lesson plan not found');
    }

    // Update basic fields
    if (data.title !== undefined) lessonPlan.title = data.title;
    if (data.description !== undefined) lessonPlan.description = data.description;
    if (data.notes !== undefined) lessonPlan.notes = data.notes;
    if (data.status !== undefined) lessonPlan.status = data.status;

    // Update objectives if provided
    if (data.objectives !== undefined) {
      lessonPlan.objectives = data.objectives.map((obj, index) => ({
        ...obj,
        lessonPlanId: lessonPlan.id,
        id: `obj-${Date.now()}-${index}`, // Generate new ID for each objective
      }));
    }

    // Update resources if provided
    if (data.resources !== undefined) {
      lessonPlan.resources = data.resources.map((res, index) => ({
        ...res,
        lessonPlanId: lessonPlan.id,
        id: `res-${Date.now()}-${index}`, // Generate new ID for each resource
      }));
    }

    lessonPlan.updatedAt = new Date().toISOString();
    return lessonPlan;
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
      lessonPlanId: null, // Will be set later if linked to a lesson
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

  async linkLessonToSchedulePeriod(_classId: string, periodId: string, lessonPlanId: string): Promise<void> {
    await this._delay();

    const period = this.periods.find((p) => p.id === periodId);
    const lessonPlan = this.lessonPlans.find((lp) => lp.id === lessonPlanId);

    if (!period) {
      throw new Error('Period not found');
    }

    if (!lessonPlan) {
      throw new Error('Lesson plan not found');
    }

    period.lessonPlanId = lessonPlanId;
    period.lessonPlan = lessonPlan;
    period.updatedAt = new Date().toISOString();
  }

  async unlinkLessonFromSchedulePeriod(_classId: string, periodId: string): Promise<void> {
    await this._delay();

    const period = this.periods.find((p) => p.id === periodId);
    if (!period) {
      throw new Error('Period not found');
    }

    period.lessonPlanId = undefined;
    period.lessonPlan = undefined;
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
      // Populate lesson plan data for each period
      .map((period) => {
        if (period.lessonPlanId) {
          const lessonPlan = this.lessonPlans.find((lp) => lp.id === period.lessonPlanId);
          return lessonPlan ? { ...period, lessonPlan } : period;
        }
        return period;
      });

    return res;
  }

  private async _delay(time: number = 300): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, time));
  }
}

export { ClassMockApiService };
