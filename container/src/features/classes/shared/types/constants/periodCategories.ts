/**
 * PeriodCategory Constants
 * Defines event types for visual categorization
 */

export const PeriodCategory = {
  ASSIGNMENT: 'assignment',
  EXAM: 'exam',
  FIELD_TRIP: 'fieldTrip',
  MEETING: 'meeting',
  HOLIDAY: 'holiday',
  PRESENTATION: 'presentation',
  OTHER: 'other',
} as const;

export type PeriodCategory = (typeof PeriodCategory)[keyof typeof PeriodCategory];

/**
 * Color mapping for event categories
 * Used for badge styling in calendar UI
 */
export const PERIOD_CATEGORY_COLORS: Record<PeriodCategory, string> = {
  [PeriodCategory.ASSIGNMENT]: '#3B82F6', // Blue
  [PeriodCategory.EXAM]: '#EF4444', // Red
  [PeriodCategory.FIELD_TRIP]: '#10B981', // Green
  [PeriodCategory.MEETING]: '#8B5CF6', // Purple
  [PeriodCategory.HOLIDAY]: '#F59E0B', // Orange
  [PeriodCategory.PRESENTATION]: '#EC4899', // Pink
  [PeriodCategory.OTHER]: '#6B7280', // Gray
};

/**
 * Tailwind CSS classes for event category badges
 */
export const PERIOD_CATEGORY_STYLES: Record<PeriodCategory, { bg: string; text: string; border: string }> = {
  [PeriodCategory.ASSIGNMENT]: {
    bg: 'bg-blue-100',
    text: 'text-blue-700',
    border: 'border-blue-300',
  },
  [PeriodCategory.EXAM]: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    border: 'border-red-300',
  },
  [PeriodCategory.FIELD_TRIP]: {
    bg: 'bg-green-100',
    text: 'text-green-700',
    border: 'border-green-300',
  },
  [PeriodCategory.MEETING]: {
    bg: 'bg-purple-100',
    text: 'text-purple-700',
    border: 'border-purple-300',
  },
  [PeriodCategory.HOLIDAY]: {
    bg: 'bg-orange-100',
    text: 'text-orange-700',
    border: 'border-orange-300',
  },
  [PeriodCategory.PRESENTATION]: {
    bg: 'bg-pink-100',
    text: 'text-pink-700',
    border: 'border-pink-300',
  },
  [PeriodCategory.OTHER]: {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-300',
  },
};
