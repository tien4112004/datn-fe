/**
 * Schedule Request Types
 *
 * API request types for schedule and period-related operations.
 * All schedules are now date-based (non-recurring).
 *
 * Note: Request types use subject IDs instead of full subject instances
 * to reduce payload size and improve API efficiency.
 */

/**
 * ScheduleCollectionRequest
 * Query parameters for fetching schedules
 */
export interface ScheduleCollectionRequest {
  startDate?: string;
  endDate?: string;
  date?: string;
}

/**
 * ClassPeriodCreateRequest
 * Payload for creating a new class period
 */
export interface SchedulePeriodCreateRequest {
  classId: string;
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  repeat?: {
    repeatType: 'daily' | 'weekly';
    weekdays?: number[];
    endDate: Date;
  };
}

/**
 * ClassPeriodUpdateRequest
 * Payload for updating an existing class period
 */
export interface SchedulePeriodUpdateRequest extends Partial<SchedulePeriodCreateRequest> {
  id: string;
}

/**
 * ScheduleFilterOptions
 * Client-side filtering options for schedules
 */
export interface ScheduleFilterOptions {
  classId?: string;
  date?: string;
  subject?: string;
}
