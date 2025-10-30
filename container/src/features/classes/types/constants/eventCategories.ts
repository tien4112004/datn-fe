/**
 * EventCategory Constants
 * Defines event types for visual categorization
 */

export const EventCategory = {
  ASSIGNMENT: 'assignment',
  EXAM: 'exam',
  FIELD_TRIP: 'fieldTrip',
  MEETING: 'meeting',
  HOLIDAY: 'holiday',
  PRESENTATION: 'presentation',
  OTHER: 'other',
} as const;

export type EventCategory = (typeof EventCategory)[keyof typeof EventCategory];

/**
 * Color mapping for event categories
 * Used for badge styling in calendar UI
 */
export const EVENT_CATEGORY_COLORS: Record<EventCategory, string> = {
  [EventCategory.ASSIGNMENT]: '#3B82F6', // Blue
  [EventCategory.EXAM]: '#EF4444', // Red
  [EventCategory.FIELD_TRIP]: '#10B981', // Green
  [EventCategory.MEETING]: '#8B5CF6', // Purple
  [EventCategory.HOLIDAY]: '#F59E0B', // Orange
  [EventCategory.PRESENTATION]: '#EC4899', // Pink
  [EventCategory.OTHER]: '#6B7280', // Gray
};

/**
 * Tailwind CSS classes for event category badges
 */
export const EVENT_CATEGORY_STYLES: Record<EventCategory, { bg: string; text: string; border: string }> = {
  [EventCategory.ASSIGNMENT]: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-300',
  },
  [EventCategory.EXAM]: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-300',
  },
  [EventCategory.FIELD_TRIP]: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-300',
  },
  [EventCategory.MEETING]: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    border: 'border-purple-300',
  },
  [EventCategory.HOLIDAY]: {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    border: 'border-orange-300',
  },
  [EventCategory.PRESENTATION]: {
    bg: 'bg-pink-100',
    text: 'text-pink-700',
    border: 'border-pink-300',
  },
  [EventCategory.OTHER]: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-300',
  },
};
