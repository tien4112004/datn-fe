/**
 * Schedule Request Types
 *
 * API request types for schedule and period-related operations.
 */

/**
 * ScheduleCollectionRequest
 * Query parameters for fetching schedules
 */
export interface ScheduleCollectionRequest {
  classId: string;
  startDate?: string;
  endDate?: string;
  dayOfWeek?: number;
}

/**
 * ClassPeriodCreateRequest
 * Payload for creating a new class period
 */
export interface ClassPeriodCreateRequest {
  classId: string;
  subject: string;
  subjectCode: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  teacherId: string;
  room?: string;
}

/**
 * ClassPeriodUpdateRequest
 * Payload for updating an existing class period
 */
export interface ClassPeriodUpdateRequest extends Partial<ClassPeriodCreateRequest> {
  id: string;
}

/**
 * ScheduleFilterOptions
 * Client-side filtering options for schedules
 */
export interface ScheduleFilterOptions {
  classId?: string;
  dayOfWeek?: number;
  teacherId?: string;
  subject?: string;
}

/**
 * CreateScheduleRequest
 * Payload for creating a complete weekly schedule
 */
export interface CreateScheduleRequest {
  classId: string;
  academicYear: string;
  periods: Omit<ClassPeriodCreateRequest, 'classId'>[];
}

/**
 * UpdatePeriodRequest
 * Payload for updating period details
 */
export interface UpdatePeriodRequest {
  periodId: string;
  updates: Partial<ClassPeriodCreateRequest>;
}
