/**
 * CalendarEvent Entity
 * Represents a scheduled activity or deadline for a class
 */

import type { EventCategory } from '../constants/eventCategories';

export interface CalendarEvent {
  /** Unique identifier (UUID) */
  id: string;

  /** Foreign key to Class entity */
  classId: string;

  /** Event title (e.g., "Book Report Due", "Field Trip") */
  name: string;

  /** ISO 8601 date (YYYY-MM-DD) */
  date: string;

  /** Optional ISO 8601 time (HH:mm:ss) */
  startTime?: string | null;

  /** Optional ISO 8601 time (HH:mm:ss) */
  endTime?: string | null;

  /** Event type for visual distinction */
  category: EventCategory;

  /** Optional physical location */
  location?: string | null;

  /** Optional detailed description */
  description?: string | null;

  /** ISO 8601 timestamp */
  createdAt: string;

  /** ISO 8601 timestamp */
  updatedAt: string;
}
