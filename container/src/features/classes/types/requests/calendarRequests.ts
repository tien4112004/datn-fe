/**
 * Calendar API Request/Response Types
 * Aligned with OpenAPI contract in contracts/calendar-events-api.yaml
 */

import type { CalendarEvent } from '../entities/calendarEvent';

/**
 * Query parameters for fetching calendar events
 */
export interface CalendarEventsQueryParams {
  /** ISO 8601 date (YYYY-MM-DD) - Start of date range */
  startDate: string;

  /** ISO 8601 date (YYYY-MM-DD) - End of date range */
  endDate: string;
}

/**
 * Request type for GET /api/classes/{classId}/events
 */
export interface GetCalendarEventsRequest {
  /** Class ID from route parameter */
  classId: string;

  /** Query parameters for date filtering */
  params: CalendarEventsQueryParams;
}

/**
 * Response type for GET /api/classes/{classId}/events
 */
export interface GetCalendarEventsResponse {
  /** Array of calendar events within the specified date range */
  events: CalendarEvent[];

  /** Total count of events (useful for pagination in future) */
  total: number;
}
