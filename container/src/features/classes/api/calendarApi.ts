/**
 * Calendar API Service
 * Fetches calendar events for a specific class
 * Currently uses mock data; replace with real API calls later
 */

import type {
  CalendarEventsQueryParams,
  GetCalendarEventsResponse,
} from '../types/requests/calendarRequests';
import { EventCategory } from '../types/constants/eventCategories';
import type { CalendarEvent } from '../types/entities/calendarEvent';

/**
 * Mock calendar events data
 * Comprehensive test data covering all event categories and multiple dates
 */
const MOCK_EVENTS: CalendarEvent[] = [
  // Week 1 - October 1-5
  {
    id: 'event-001',
    classId: '1',
    name: 'Welcome Back Assembly',
    date: '2025-10-01',
    startTime: '08:30:00',
    endTime: '09:30:00',
    category: EventCategory.MEETING,
    location: 'School Auditorium',
    description: 'Start of October - Welcome assembly for all students',
    createdAt: '2025-09-25T10:00:00Z',
    updatedAt: '2025-09-25T10:00:00Z',
  },
  {
    id: 'event-002',
    classId: '1',
    name: 'Reading Assignment Due',
    date: '2025-10-03',
    startTime: null,
    endTime: null,
    category: EventCategory.ASSIGNMENT,
    location: null,
    description: 'Chapter 1-3 reading comprehension questions',
    createdAt: '2025-09-20T10:00:00Z',
    updatedAt: '2025-09-20T10:00:00Z',
  },
  {
    id: 'event-003',
    classId: '1',
    name: 'PE Class - Outdoor Games',
    date: '2025-10-03',
    startTime: '14:00:00',
    endTime: '15:00:00',
    category: EventCategory.OTHER,
    location: 'Sports Field',
    description: 'Team building activities and outdoor games',
    createdAt: '2025-09-25T11:00:00Z',
    updatedAt: '2025-09-25T11:00:00Z',
  },

  // Week 2 - October 6-12
  {
    id: 'event-004',
    classId: '1',
    name: 'Math Homework Check',
    date: '2025-10-07',
    startTime: '09:00:00',
    endTime: '09:30:00',
    category: EventCategory.ASSIGNMENT,
    location: 'Room 301',
    description: 'Review and discussion of homework problems',
    createdAt: '2025-09-28T10:00:00Z',
    updatedAt: '2025-09-28T10:00:00Z',
  },
  {
    id: 'event-005',
    classId: '1',
    name: 'Spelling Bee Competition',
    date: '2025-10-09',
    startTime: '10:00:00',
    endTime: '11:30:00',
    category: EventCategory.EXAM,
    location: 'Room 301',
    description: 'Monthly spelling competition for all students',
    createdAt: '2025-09-30T14:00:00Z',
    updatedAt: '2025-09-30T14:00:00Z',
  },
  {
    id: 'event-006',
    classId: '1',
    name: 'Art Project Workshop',
    date: '2025-10-10',
    startTime: '13:00:00',
    endTime: '15:00:00',
    category: EventCategory.OTHER,
    location: 'Art Room',
    description: 'Collaborative art project - painting autumn landscapes',
    createdAt: '2025-10-01T09:00:00Z',
    updatedAt: '2025-10-01T09:00:00Z',
  },

  // Week 3 - October 13-19
  {
    id: 'event-007',
    classId: '1',
    name: 'History Essay Due',
    date: '2025-10-13',
    startTime: null,
    endTime: null,
    category: EventCategory.ASSIGNMENT,
    location: null,
    description: 'Submit 500-word essay on assigned historical period',
    createdAt: '2025-09-29T10:00:00Z',
    updatedAt: '2025-09-29T10:00:00Z',
  },
  {
    id: 'event-008',
    classId: '1',
    name: 'Math Quiz',
    date: '2025-10-15',
    startTime: '09:00:00',
    endTime: '10:00:00',
    category: EventCategory.EXAM,
    location: 'Room 301',
    description: 'Chapter 5 algebra quiz - bring calculator',
    createdAt: '2025-09-20T11:00:00Z',
    updatedAt: '2025-09-20T11:00:00Z',
  },
  {
    id: 'event-009',
    classId: '1',
    name: 'Guest Speaker: Environmental Science',
    date: '2025-10-16',
    startTime: '11:00:00',
    endTime: '12:00:00',
    category: EventCategory.PRESENTATION,
    location: 'Room 301',
    description: 'Dr. Smith discusses climate change and conservation',
    createdAt: '2025-10-05T10:00:00Z',
    updatedAt: '2025-10-05T10:00:00Z',
  },
  {
    id: 'event-010',
    classId: '1',
    name: 'Science Project Presentation',
    date: '2025-10-18',
    startTime: '10:00:00',
    endTime: '12:00:00',
    category: EventCategory.PRESENTATION,
    location: 'Room 301',
    description: 'Students present their science fair projects',
    createdAt: '2025-09-10T12:00:00Z',
    updatedAt: '2025-09-10T12:00:00Z',
  },

  // Week 4 - October 20-26
  {
    id: 'event-011',
    classId: '1',
    name: 'Book Report Due',
    date: '2025-10-20',
    startTime: null,
    endTime: null,
    category: EventCategory.ASSIGNMENT,
    location: null,
    description: 'Submit book report on assigned reading',
    createdAt: '2025-09-01T10:00:00Z',
    updatedAt: '2025-09-01T10:00:00Z',
  },
  {
    id: 'event-012',
    classId: '1',
    name: 'Mid-Term Exam',
    date: '2025-10-22',
    startTime: '08:00:00',
    endTime: '11:00:00',
    category: EventCategory.EXAM,
    location: 'Room 301',
    description: 'Comprehensive mid-term examination covering all subjects',
    createdAt: '2025-09-15T10:00:00Z',
    updatedAt: '2025-09-15T10:00:00Z',
  },
  {
    id: 'event-013',
    classId: '1',
    name: 'Mid-Term Exam (Day 2)',
    date: '2025-10-23',
    startTime: '08:00:00',
    endTime: '11:00:00',
    category: EventCategory.EXAM,
    location: 'Room 301',
    description: 'Continuation of mid-term examination',
    createdAt: '2025-09-15T10:00:00Z',
    updatedAt: '2025-09-15T10:00:00Z',
  },
  {
    id: 'event-014',
    classId: '1',
    name: 'Field Trip to Science Museum',
    date: '2025-10-25',
    startTime: '08:00:00',
    endTime: '15:00:00',
    category: EventCategory.FIELD_TRIP,
    location: 'City Science Museum',
    description: 'Educational trip to explore science exhibits - bring lunch',
    createdAt: '2025-09-15T14:30:00Z',
    updatedAt: '2025-09-15T14:30:00Z',
  },

  // Week 5 - October 27-31
  {
    id: 'event-015',
    classId: '1',
    name: 'Team Meeting - Project Planning',
    date: '2025-10-27',
    startTime: '09:00:00',
    endTime: '10:00:00',
    category: EventCategory.MEETING,
    location: 'Room 301',
    description: 'Plan group projects for November',
    createdAt: '2025-10-20T10:00:00Z',
    updatedAt: '2025-10-20T10:00:00Z',
  },
  {
    id: 'event-016',
    classId: '1',
    name: 'Math Practice Problems Due',
    date: '2025-10-28',
    startTime: null,
    endTime: null,
    category: EventCategory.ASSIGNMENT,
    location: null,
    description: 'Complete problem set 7 - pages 45-50',
    createdAt: '2025-10-21T10:00:00Z',
    updatedAt: '2025-10-21T10:00:00Z',
  },
  {
    id: 'event-017',
    classId: '1',
    name: 'Parent-Teacher Conference',
    date: '2025-10-30',
    startTime: '14:00:00',
    endTime: '17:00:00',
    category: EventCategory.MEETING,
    location: 'Room 301',
    description: 'Quarterly parent-teacher meetings - sign up for time slots',
    createdAt: '2025-09-25T09:00:00Z',
    updatedAt: '2025-09-25T09:00:00Z',
  },
  {
    id: 'event-018',
    classId: '1',
    name: 'Halloween Party',
    date: '2025-10-31',
    startTime: '13:00:00',
    endTime: '15:00:00',
    category: EventCategory.HOLIDAY,
    location: 'Room 301',
    description: 'Halloween celebration - costumes optional',
    createdAt: '2025-10-15T10:00:00Z',
    updatedAt: '2025-10-15T10:00:00Z',
  },
  {
    id: 'event-019',
    classId: '1',
    name: 'Creative Writing Workshop',
    date: '2025-10-31',
    startTime: '10:00:00',
    endTime: '11:30:00',
    category: EventCategory.OTHER,
    location: 'Library',
    description: 'Write spooky stories for Halloween',
    createdAt: '2025-10-24T10:00:00Z',
    updatedAt: '2025-10-24T10:00:00Z',
  },

  // Additional events throughout the month for better visualization
  {
    id: 'event-020',
    classId: '1',
    name: 'Library Orientation',
    date: '2025-10-02',
    startTime: '11:00:00',
    endTime: '12:00:00',
    category: EventCategory.OTHER,
    location: 'School Library',
    description: 'Introduction to library resources and borrowing system',
    createdAt: '2025-09-28T10:00:00Z',
    updatedAt: '2025-09-28T10:00:00Z',
  },
  {
    id: 'event-021',
    classId: '1',
    name: 'Vocabulary Quiz',
    date: '2025-10-08',
    startTime: '09:00:00',
    endTime: '09:30:00',
    category: EventCategory.EXAM,
    location: 'Room 301',
    description: 'Weekly vocabulary assessment - Units 1-3',
    createdAt: '2025-10-01T10:00:00Z',
    updatedAt: '2025-10-01T10:00:00Z',
  },
  {
    id: 'event-022',
    classId: '1',
    name: 'Fall Concert Practice',
    date: '2025-10-14',
    startTime: '15:00:00',
    endTime: '16:30:00',
    category: EventCategory.OTHER,
    location: 'Music Room',
    description: 'Rehearsal for upcoming fall concert',
    createdAt: '2025-10-07T10:00:00Z',
    updatedAt: '2025-10-07T10:00:00Z',
  },
  {
    id: 'event-023',
    classId: '1',
    name: 'Group Project Presentation',
    date: '2025-10-24',
    startTime: '13:00:00',
    endTime: '15:00:00',
    category: EventCategory.PRESENTATION,
    location: 'Room 301',
    description: 'Final presentations for group projects',
    createdAt: '2025-10-10T10:00:00Z',
    updatedAt: '2025-10-10T10:00:00Z',
  },
];

/**
 * Fetch calendar events for a specific class within a date range
 *
 * @param classId - The class ID to fetch events for
 * @param params - Query parameters (startDate, endDate)
 * @returns Promise with events array and total count
 *
 * @example
 * ```ts
 * const response = await fetchClassEvents('1', {
 *   startDate: '2025-10-01',
 *   endDate: '2025-10-31'
 * });
 * ```
 */
export async function fetchClassEvents(
  classId: string,
  params: CalendarEventsQueryParams
): Promise<GetCalendarEventsResponse> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Filter mock events by classId and date range
  const filtered = MOCK_EVENTS.filter((event) => {
    const eventDate = new Date(event.date);
    const start = new Date(params.startDate);
    const end = new Date(params.endDate);

    return event.classId === classId && eventDate >= start && eventDate <= end;
  });

  // Sort by date, then by startTime
  const sorted = filtered.sort((a, b) => {
    const dateComparison = a.date.localeCompare(b.date);
    if (dateComparison !== 0) return dateComparison;

    // If same date, sort by startTime (nulls last)
    if (a.startTime && b.startTime) {
      return a.startTime.localeCompare(b.startTime);
    }
    if (a.startTime) return -1;
    if (b.startTime) return 1;
    return 0;
  });

  return {
    events: sorted,
    total: sorted.length,
  };
}
