/**
 * Schedule Entity
 *
 * Unified type that represents both recurring class periods (schedule)
 * and one-time calendar events. This combines the concepts of ClassPeriod
 * and CalendarEvent into a single coherent type.
 */

import type { PeriodCategory } from '../../shared/types/constants/periodCategories';
import type { Lesson } from '../../class-lesson';

/**
 * SchedulePeriod - Date-based class period
 *
 * Represents a scheduled event or class period on a specific date.
 * All events are non-recurring and must have a specific date.
 *
 * Note: Teacher information is not included here since the Teacher interface has been removed.
 */
export interface SchedulePeriod {
  id: string;
  classId: string;
  name: string;
  subject: string; // Subject code
  date: string;
  startTime: string | null;
  endTime: string | null;
  category: PeriodCategory;
  location?: string | null;
  description?: string | null;
  isActive: boolean;
  lessons: Lesson[];
  createdAt: string;
  updatedAt: string;
}

export const toMinimalSchedulePeriod = (period: SchedulePeriod): MinimalSchedulePeriod => {
  return {
    id: period.id,
    classId: period.classId,
    name: period.name,
    subject: period.subject,
    date: period.date,
    startTime: period.startTime,
    endTime: period.endTime,
    category: period.category,
    isActive: period.isActive,
    lessonIds: period.lessons.map((lesson) => lesson.id),
  };
};

export interface MinimalSchedulePeriod {
  id: string;
  classId: string;
  name: string;
  subject: string; // Subject code
  date: string;
  startTime: string | null;
  endTime: string | null;
  category: PeriodCategory;
  isActive: boolean;
  lessonIds: string[];
}

/**
 * DailySchedule Entity
 *
 * All events for a specific class on a specific date.
 */
export interface DailySchedule {
  /** Date (YYYY-MM-DD) */
  date: string;

  /** Class ID */
  classId: string;

  /** All events for this day */
  periods: SchedulePeriod[];
}

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // Sunday = 0, Monday = 1, ..., Saturday = 6
