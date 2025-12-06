/**
 * Grade Constants
 *
 * Constants for Vietnamese education grade levels (1-12).
 */

// Grade labels in Vietnamese
export const GRADE_LABELS = {
  1: 'Lớp 1',
  2: 'Lớp 2',
  3: 'Lớp 3',
  4: 'Lớp 4',
  5: 'Lớp 5',
  6: 'Lớp 6',
  7: 'Lớp 7',
  8: 'Lớp 8',
  9: 'Lớp 9',
  10: 'Lớp 10',
  11: 'Lớp 11',
  12: 'Lớp 12',
} as const;

// Class capacity limits
export const DEFAULT_CLASS_CAPACITY = 35;
export const MAX_CLASS_CAPACITY = 45;
export const MIN_CLASS_CAPACITY = 20;

// Standard class period times
export const STANDARD_PERIODS = [
  { period: 1, startTime: '07:30', endTime: '08:15' },
  { period: 2, startTime: '08:15', endTime: '09:00' },
  { period: 3, startTime: '09:15', endTime: '10:00' },
  { period: 4, startTime: '10:00', endTime: '10:45' },
  { period: 5, startTime: '10:45', endTime: '11:30' },
  { period: 6, startTime: '13:30', endTime: '14:15' },
  { period: 7, startTime: '14:15', endTime: '15:00' },
  { period: 8, startTime: '15:15', endTime: '16:00' },
  { period: 9, startTime: '16:00', endTime: '16:45' },
  { period: 10, startTime: '16:45', endTime: '17:30' },
] as const;

export type GradeLevel = keyof typeof GRADE_LABELS;
