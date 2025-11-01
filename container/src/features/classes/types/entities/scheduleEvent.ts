/**
 * ScheduleEvent Entity
 *
 * Unified type that represents both recurring class periods (schedule)
 * and one-time calendar events. This combines the concepts of ClassPeriod
 * and CalendarEvent into a single coherent type.
 */

import type { EventCategory } from '../constants/eventCategories';

/**
 * ScheduleEvent - Date-based event/class period
 *
 * Represents a scheduled event or class period on a specific date.
 * All events are non-recurring and must have a specific date.
 *
 * Note: Teacher information is not included here since an event is bound to a class,
 * and a class has only one teacher (homeroom teacher).
 */
export interface ScheduleEvent {
  id: string;
  classId: string;
  name: string;
  subject: string;
  subjectCode: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  category: EventCategory;
  location?: string | null;
  description?: string | null;
  isActive: boolean;
  lessonPlanId?: string | null;
  createdAt: string;
  updatedAt: string;
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
  events: ScheduleEvent[];
}

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // Sunday = 0, Monday = 1, ..., Saturday = 6
