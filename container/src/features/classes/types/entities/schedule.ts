/**
 * Schedule Entities
 *
 * Represents the class schedule - periods, time slots, and daily schedules.
 */

/**
 * ClassPeriod Entity
 *
 * A single class period - one subject taught at a specific time on a specific day.
 */
export interface ClassPeriod {
  id: string;
  classId: string;
  subject: string;
  subjectCode: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string; // "08:00"
  endTime: string; // "08:45"
  teacherId: string;
  teacher: TeacherInfo;
  room?: string;
  isActive: boolean;
  lessonPlanId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * DailySchedule Entity
 *
 * All periods for a specific class on a specific date.
 */
export interface DailySchedule {
  date: string; // "2024-09-29"
  classId: string;
  periods: ClassPeriod[];
}

/**
 * TeacherInfo
 *
 * Simplified teacher information embedded in schedule/lesson entities.
 */
export interface TeacherInfo {
  id: string;
  fullName: string;
  email: string;
}

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // Sunday = 0, Monday = 1, ..., Saturday = 6
