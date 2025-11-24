/**
 * Schedule Helpers Hook - The Toolbox
 * Pure utility functions for processing schedule data
 *
 * This hook provides:
 * - Status calculation (current, completed, upcoming, scheduled)
 * - Date checking and filtering
 * - Statistics calculation
 * - Event sorting
 *
 * These are all pure functions - no API calls, no side effects.
 * Input data → output processed data.
 */

import { format } from 'date-fns';
import type { SchedulePeriod, DailySchedule } from '../types';

export interface ScheduleStats {
  total: number;
  completed: number;
  remaining: number;
  withLesson: number;
}

export type PeriodStatus = 'current' | 'completed' | 'upcoming' | 'scheduled';

export function useScheduleHelpers() {
  /**
   * Check if a date string represents today
   */
  const isToday = (dateString: string): boolean => {
    return dateString === format(new Date(), 'yyyy-MM-dd');
  };

  /**
   * Get the current time in HH:mm format
   */
  const getCurrentTime = (): string => {
    return new Date().toTimeString().slice(0, 5);
  };

  /**
   * Calculate the status of a event based on current time
   * Status can be: 'current', 'completed', 'upcoming', 'scheduled'
   */
  const getPeriodStatus = (event: SchedulePeriod, dateString: string): PeriodStatus => {
    if (!isToday(dateString)) return 'scheduled';

    const currentTime = getCurrentTime();

    if (event.startTime && event.endTime && currentTime >= event.startTime && currentTime < event.endTime) {
      return 'current';
    }

    if (event.endTime && currentTime >= event.endTime) {
      return 'completed';
    }

    return 'upcoming';
  };

  /**
   * Calculate statistics for a daily schedule
   */
  const getScheduleStats = (schedule: DailySchedule | null): ScheduleStats => {
    if (!schedule || schedule.periods.length === 0) {
      return {
        total: 0,
        completed: 0,
        remaining: 0,
        withLesson: 0,
      };
    }

    const events = schedule.periods;

    return {
      total: events.length,
      completed: events.filter((e) => getPeriodStatus(e, schedule.date) === 'completed').length,
      remaining: events.filter((e) => ['current', 'upcoming'].includes(getPeriodStatus(e, schedule.date)))
        .length,
      withLesson: events.filter((e) => e.lessons.length > 0).length,
    };
  };

  /**
   * Sort events by start time
   */
  const sortPeriodsByTime = (events: SchedulePeriod[]): SchedulePeriod[] => {
    return [...events].sort((a, b) => (a.startTime || '').localeCompare(b.startTime || ''));
  };

  /**
   * Sort schedules and their events
   */
  const sortSchedules = (schedules: DailySchedule[]): DailySchedule[] => {
    return schedules.map((schedule) => ({
      ...schedule,
      periods: sortPeriodsByTime(schedule.periods),
    }));
  };

  // Calculate stats for subject periods
  const getSubjectStats = (periods: SchedulePeriod[]): ScheduleStats => {
    if (periods.length === 0) {
      return {
        total: 0,
        completed: 0,
        remaining: 0,
        withLesson: 0,
      };
    }

    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format

    return {
      total: periods.length,
      completed: periods.filter((p) => {
        const status = getPeriodStatus(p, today);
        return status === 'completed';
      }).length,
      remaining: periods.filter((p) => {
        const status = getPeriodStatus(p, today);
        return ['current', 'upcoming'].includes(status);
      }).length,
      withLesson: periods.filter((p) => p.lessons.length > 0).length,
    };
  };

  /**
   * Find a schedule for a specific date
   * Returns the schedule if found, otherwise returns an empty schedule for that date
   *
   * @param schedules - List of schedules to search in
   * @param dateString - Date string in 'yyyy-MM-dd' format
   * @param classId - Class ID for the empty schedule (if not found)
   * @returns The schedule for the date, or an empty schedule if not found
   */
  const findScheduleForDate = (
    schedules: DailySchedule[],
    dateString: string,
    classId: string = ''
  ): DailySchedule => {
    return (
      schedules.find((s) => s.date === dateString) || {
        date: dateString,
        classId,
        periods: [],
      }
    );
  };

  /**
   * Find all schedules for a specific date (primarily for consistency with naming)
   * Useful for filtering operations
   *
   * @param schedules - List of schedules to filter
   * @param dateString - Date string in 'yyyy-MM-dd' format
   * @returns Array containing the schedule for that date (0 or 1 element)
   */
  const filterSchedulesForDate = (schedules: DailySchedule[], dateString: string): DailySchedule[] => {
    return schedules.filter((s) => s.date === dateString);
  };

  /**
   * Get all schedules for a specific date range
   *
   * @param schedules - List of schedules to filter
   * @param startDateString - Start date in 'yyyy-MM-dd' format
   * @param endDateString - End date in 'yyyy-MM-dd' format (inclusive)
   * @returns Array of schedules within the date range
   */
  const filterSchedulesForDateRange = (
    schedules: DailySchedule[],
    startDateString: string,
    endDateString: string
  ): DailySchedule[] => {
    return schedules.filter((s) => s.date >= startDateString && s.date <= endDateString);
  };

  return {
    isToday,
    getCurrentTime,
    getPeriodStatus,
    getScheduleStats,
    getSubjectStats,
    sortPeriodsByTime,
    sortSchedules,
    findScheduleForDate,
    filterSchedulesForDate,
    filterSchedulesForDateRange,
  };
}
