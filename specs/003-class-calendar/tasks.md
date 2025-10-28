# Implementation Tasks: Class Calendar

**Feature**: 003-class-calendar  
**Date**: October 30, 2025  
**Status**: Ready for Implementation

## Task Execution Rules

- **Sequential tasks**: Must be completed in order within each phase
- **Parallel tasks [P]**: Can be executed simultaneously
- **Dependencies**: Tasks list dependencies that must complete first
- **Phases**: Complete each phase before moving to the next
- **Mark completed**: Change `- [ ]` to `- [X]` when done

## Phase 1: Setup & Type Definitions

Foundation work for the calendar feature. These tasks set up the type system and project structure.

### 1.1 Create Type Definitions

- [ ] **TASK-001**: Create CalendarEvent entity type
  - **File**: `container/src/features/classes/types/entities/calendarEvent.ts`
  - **Description**: Define CalendarEvent interface with all fields (id, classId, name, date, startTime, endTime, category, location, description, createdAt, updatedAt)
  - **Dependencies**: None
  - **Acceptance**: TypeScript interface matches data-model.md specification
  - **Parallel**: No

- [ ] **TASK-002**: Create EventCategory constants
  - **File**: `container/src/features/classes/types/constants/eventCategories.ts`
  - **Description**: Define EventCategory enum (ASSIGNMENT, EXAM, FIELD_TRIP, MEETING, HOLIDAY, PRESENTATION, OTHER) and color mapping object
  - **Dependencies**: None
  - **Acceptance**: Enum values match data-model.md, color mapping includes all categories
  - **Parallel**: Yes [P]

- [ ] **TASK-003**: Create API request/response types
  - **File**: `container/src/features/classes/types/requests/calendarRequests.ts`
  - **Description**: Define GetCalendarEventsRequest, GetCalendarEventsResponse, CalendarEventsQueryParams types
  - **Dependencies**: TASK-001
  - **Acceptance**: Types align with OpenAPI contract in contracts/calendar-events-api.yaml
  - **Parallel**: Yes [P]

- [ ] **TASK-004**: Update types index exports
  - **File**: `container/src/features/classes/types/index.ts`
  - **Description**: Add exports for calendarEvent, eventCategories, and calendarRequests
  - **Dependencies**: TASK-001, TASK-002, TASK-003
  - **Acceptance**: All new types are properly exported and accessible
  - **Parallel**: No

## Phase 2: State Management & API

Set up state management and API integration for calendar data.

### 2.1 Create Calendar Store

- [ ] **TASK-005**: Implement Zustand calendar store
  - **File**: `container/src/features/classes/stores/calendarStore.ts`
  - **Description**: Create store with selectedDate, selectedEventId, setSelectedDate, nextMonth, prevMonth, openEventDetails, closeEventDetails actions
  - **Dependencies**: None
  - **Acceptance**: Store follows research.md state management pattern, includes date-fns for month navigation
  - **Parallel**: No

### 2.2 Create API Service

- [ ] **TASK-006**: Implement calendar API service with mock data
  - **File**: `container/src/features/classes/api/calendarApi.ts`
  - **Description**: Create fetchClassEvents function with mock data including "Book Report Due" (Oct 20) and "Field Trip" (Oct 25)
  - **Dependencies**: TASK-001, TASK-003
  - **Acceptance**: Returns mock CalendarEvent[] matching data-model.md structure, accepts classId, startDate, endDate parameters
  - **Parallel**: No

- [ ] **TASK-007**: Create React Query hook for events
  - **File**: `container/src/features/classes/hooks/useCalendarEvents.ts`
  - **Description**: Implement useCalendarEvents hook wrapping API with React Query, includes loading/error states, 5-minute cache
  - **Dependencies**: TASK-006
  - **Acceptance**: Hook uses queryKey with classId and month, implements staleTime, returns data/loading/error
  - **Parallel**: No

### 2.3 Create Utility Functions

- [ ] **TASK-008**: Implement calendar helper utilities
  - **File**: `container/src/features/classes/utils/calendarHelpers.ts`
  - **Description**: Create groupEventsByDate, formatMonthYear, isToday, isPast functions using date-fns
  - **Dependencies**: TASK-001
  - **Acceptance**: Utilities handle date formatting, grouping events by date, date comparisons
  - **Parallel**: Yes [P]

## Phase 3: Core Components (P1 - View Monthly Calendar)

Build the main calendar UI components for displaying events.

### 3.1 Calendar Header Component

- [ ] **TASK-009**: Create CalendarHeader component
  - **File**: `container/src/features/classes/components/calendar/CalendarHeader.tsx`
  - **Description**: Build header with month/year display, previous/next navigation buttons, today button
  - **Dependencies**: TASK-005
  - **Acceptance**: Displays formatted month/year, prev/next buttons call store actions, responsive styling
  - **Parallel**: No

### 3.2 Calendar Grid Component

- [ ] **TASK-010**: Create CalendarGrid component
  - **File**: `container/src/features/classes/components/calendar/CalendarGrid.tsx`
  - **Description**: Integrate react-day-picker with custom Day component, render events in calendar cells
  - **Dependencies**: TASK-007, TASK-008
  - **Acceptance**: Uses DayPicker with custom components prop, displays events on correct dates, handles loading/error states
  - **Parallel**: No

### 3.3 Event Card Component

- [ ] **TASK-011**: Create CalendarEventCard component
  - **File**: `container/src/features/classes/components/calendar/CalendarEventCard.tsx`
  - **Description**: Small event badge component with category color, event name, click handler
  - **Dependencies**: TASK-002
  - **Acceptance**: Shows event name, applies category color from mapping, clickable, responsive for desktop/tablet
  - **Parallel**: Yes [P]

### 3.4 Component Index

- [ ] **TASK-012**: Create calendar components index
  - **File**: `container/src/features/classes/components/calendar/index.ts`
  - **Description**: Export all calendar components (CalendarHeader, CalendarGrid, CalendarEventCard)
  - **Dependencies**: TASK-009, TASK-010, TASK-011
  - **Acceptance**: All components properly exported
  - **Parallel**: No

### 3.5 Main Calendar Page

- [ ] **TASK-013**: Create ClassCalendarPage component
  - **File**: `container/src/features/classes/pages/ClassCalendarPage.tsx`
  - **Description**: Main page integrating header, grid, and state; fetch classId from route params
  - **Dependencies**: TASK-012
  - **Acceptance**: Renders calendar with header and grid, fetches events for class, handles loading/error/empty states
  - **Parallel**: No

## Phase 4: Navigation & Routing

Integrate calendar into application routing and navigation.

### 4.1 Add Route

- [ ] **TASK-014**: Add calendar route to router
  - **File**: `container/src/app/router.tsx`
  - **Description**: Add route for /classes/:id/calendar with ClassCalendarPage component and getClassById loader
  - **Dependencies**: TASK-013
  - **Acceptance**: Route accessible, uses existing class loader, matches pattern in plan.md
  - **Parallel**: No

### 4.2 Add Navigation Link

- [ ] **TASK-015**: Add calendar link to ClassDetailPage
  - **File**: `container/src/features/classes/pages/ClassDetailPage.tsx`
  - **Description**: Add "View Calendar" button/link to class detail page navigation
  - **Dependencies**: TASK-014
  - **Acceptance**: Link visible on class detail page, navigates to calendar when clicked
  - **Parallel**: No

### 4.3 Update Feature Exports

- [ ] **TASK-016**: Update classes feature index exports
  - **File**: `container/src/features/classes/index.ts`
  - **Description**: Export ClassCalendarPage from pages
  - **Dependencies**: TASK-013
  - **Acceptance**: ClassCalendarPage exported and accessible for router
  - **Parallel**: No

## Phase 5: Event Details (P3 - View Event Details)

Add detailed event viewing functionality.

### 5.1 Event Details Dialog

- [ ] **TASK-017**: Create EventDetailsDialog component
  - **File**: `container/src/features/classes/components/calendar/EventDetailsDialog.tsx`
  - **Description**: Radix UI Dialog displaying full event details (name, date, time, location, description, category)
  - **Dependencies**: TASK-005, TASK-011
  - **Acceptance**: Opens when event clicked, shows all event fields, close button works, uses Radix Dialog
  - **Parallel**: No

- [ ] **TASK-018**: Integrate event details with calendar grid
  - **File**: `container/src/features/classes/components/calendar/CalendarGrid.tsx`
  - **Description**: Add onClick handler to open event details dialog when event card clicked
  - **Dependencies**: TASK-017
  - **Acceptance**: Clicking event opens dialog with correct event data, dialog closes properly
  - **Parallel**: No

## Phase 6: Internationalization (i18n)

Add multilingual support for calendar UI.

### 6.1 English Translations

- [ ] **TASK-019**: Create English calendar translations
  - **File**: `container/src/shared/i18n/locales/en/calendar.json`
  - **Description**: Add all English translations (title, navigation, events, categories, details)
  - **Dependencies**: None
  - **Acceptance**: JSON structure matches research.md i18n section, includes all required keys
  - **Parallel**: Yes [P]

### 6.2 Vietnamese Translations

- [ ] **TASK-020**: Create Vietnamese calendar translations
  - **File**: `container/src/shared/i18n/locales/vi/calendar.json`
  - **Description**: Add all Vietnamese translations (title, navigation, events, categories, details)
  - **Dependencies**: None
  - **Acceptance**: JSON structure matches English file, all keys translated to Vietnamese
  - **Parallel**: Yes [P]

### 6.3 Apply i18n to Components

- [ ] **TASK-021**: Add i18n hooks to calendar components
  - **Files**: All components in `container/src/features/classes/components/calendar/`
  - **Description**: Use useTranslation('calendar') hook in all components, replace hardcoded strings
  - **Dependencies**: TASK-019, TASK-020, TASK-009, TASK-010, TASK-011, TASK-017
  - **Acceptance**: All UI text uses t() function, no hardcoded English strings, language switching works
  - **Parallel**: No

### 6.4 Date Localization

- [ ] **TASK-022**: Add date-fns locale support
  - **File**: `container/src/features/classes/utils/calendarHelpers.ts`
  - **Description**: Import and use date-fns locales (enUS, vi) for date formatting based on i18next language
  - **Dependencies**: TASK-008, TASK-021
  - **Acceptance**: Month/day names display in correct language, format function uses locale parameter
  - **Parallel**: No

## Phase 7: Testing

Write tests for calendar functionality.

### 7.1 Utility Tests

- [ ] **TASK-023**: Write tests for calendar helpers
  - **File**: `container/tests/features/classes/calendarHelpers.test.ts`
  - **Description**: Unit tests for groupEventsByDate, formatMonthYear, date comparison functions
  - **Dependencies**: TASK-008
  - **Acceptance**: 100% coverage of utility functions, tests handle edge cases (empty arrays, timezone handling)
  - **Parallel**: Yes [P]

### 7.2 Hook Tests

- [ ] **TASK-024**: Write tests for useCalendarEvents hook
  - **File**: `container/tests/features/classes/useCalendarEvents.test.ts`
  - **Description**: Test hook with React Query test utilities, verify loading/success/error states
  - **Dependencies**: TASK-007
  - **Acceptance**: Tests cover data fetching, cache behavior, parameter passing
  - **Parallel**: Yes [P]

### 7.3 Component Tests

- [ ] **TASK-025**: Write tests for CalendarGrid component
  - **File**: `container/tests/features/classes/CalendarGrid.test.tsx`
  - **Description**: Integration tests for calendar rendering with events, verify events appear on correct dates
  - **Dependencies**: TASK-010
  - **Acceptance**: Tests verify "Book Report Due" on Oct 20, "Field Trip" on Oct 25, empty state, multiple events per day
  - **Parallel**: Yes [P]

### 7.4 Navigation Tests

- [ ] **TASK-026**: Write tests for month navigation
  - **File**: `container/tests/features/classes/CalendarHeader.test.tsx`
  - **Description**: Test previous/next month buttons, verify calendar updates
  - **Dependencies**: TASK-009
  - **Acceptance**: Tests verify prev/next buttons work, month display updates, today button works
  - **Parallel**: Yes [P]

## Phase 8: Polish & Validation

Final touches and quality assurance.

### 8.1 Responsive Styling

- [ ] **TASK-027**: Add responsive styles to calendar components
  - **Files**: All components in `container/src/features/classes/components/calendar/`
  - **Description**: Add Tailwind responsive classes for tablet (md:) and desktop (lg:) breakpoints
  - **Dependencies**: TASK-012
  - **Acceptance**: Calendar displays correctly on desktop (≥1024px) and tablet (768-1023px), events show 2-3 per cell based on breakpoint
  - **Parallel**: No

### 8.2 Accessibility

- [ ] **TASK-028**: Add ARIA labels and keyboard navigation
  - **Files**: CalendarGrid.tsx, CalendarHeader.tsx, EventDetailsDialog.tsx
  - **Description**: Add ARIA labels for screen readers, ensure keyboard navigation works (arrow keys, Enter, Escape)
  - **Dependencies**: TASK-027
  - **Acceptance**: Screen reader announces month changes and event counts, keyboard navigation functional, focus management correct
  - **Parallel**: No

### 8.3 Error Handling

- [ ] **TASK-029**: Implement comprehensive error handling
  - **Files**: CalendarGrid.tsx, ClassCalendarPage.tsx, useCalendarEvents.ts
  - **Description**: Add error boundaries, user-friendly error messages, retry functionality
  - **Dependencies**: TASK-007, TASK-013
  - **Acceptance**: Network errors show friendly message, retry button works, errors don't crash app
  - **Parallel**: Yes [P]

### 8.4 Loading States

- [ ] **TASK-030**: Add skeleton loaders and loading indicators
  - **Files**: CalendarGrid.tsx, ClassCalendarPage.tsx
  - **Description**: Add skeleton calendar grid during loading, loading spinners for data fetching
  - **Dependencies**: TASK-027
  - **Acceptance**: Loading states show before data arrives, smooth transitions, no flash of empty content
  - **Parallel**: Yes [P]

### 8.5 Performance Optimization

- [ ] **TASK-031**: Optimize calendar rendering
  - **Files**: CalendarGrid.tsx, CalendarEventCard.tsx
  - **Description**: Add React.memo to day cells, useMemo for event grouping, optimize re-renders
  - **Dependencies**: TASK-010, TASK-011
  - **Acceptance**: Calendar renders in < 500ms, month navigation < 300ms, React DevTools shows minimal re-renders
  - **Parallel**: No

## Phase 9: Final Validation

Pre-deployment checks and quality gates.

### 9.1 Type Checking

- [ ] **TASK-032**: Run TypeScript type check
  - **Command**: `cd container && pnpm typecheck`
  - **Description**: Verify zero TypeScript errors across entire feature
  - **Dependencies**: All previous tasks
  - **Acceptance**: `pnpm typecheck` exits with code 0, no errors
  - **Parallel**: Yes [P]

### 9.2 Linting

- [ ] **TASK-033**: Run ESLint check
  - **Command**: `cd container && pnpm lint`
  - **Description**: Verify zero linting errors or warnings
  - **Dependencies**: All previous tasks
  - **Acceptance**: `pnpm lint` exits with code 0, no warnings
  - **Parallel**: Yes [P]

### 9.3 Test Suite

- [ ] **TASK-034**: Run full test suite
  - **Command**: `cd container && pnpm test:run`
  - **Description**: Execute all tests and verify they pass
  - **Dependencies**: TASK-023, TASK-024, TASK-025, TASK-026
  - **Acceptance**: All tests pass, coverage meets requirements (>80% for calendar code)
  - **Parallel**: Yes [P]

### 9.4 Build Verification

- [ ] **TASK-035**: Build container workspace
  - **Command**: `cd container && pnpm build`
  - **Description**: Verify production build succeeds without errors
  - **Dependencies**: TASK-032, TASK-033
  - **Acceptance**: Build completes successfully, no errors in output
  - **Parallel**: No

### 9.5 Manual Testing Checklist

- [ ] **TASK-036**: Execute manual acceptance testing
  - **Description**: Manually verify all acceptance scenarios from spec.md
  - **Dependencies**: TASK-035
  - **Checklist**:
    - [ ] Navigate to /classes/:id/calendar from class detail page
    - [ ] Calendar displays current month by default
    - [ ] "Book Report Due" appears on October 20
    - [ ] "Field Trip" appears on October 25
    - [ ] Previous month button shows September
    - [ ] Next month button shows November
    - [ ] Click event opens details dialog
    - [ ] Details dialog shows all event information
    - [ ] Calendar responsive on tablet and desktop
    - [ ] Language switcher changes calendar text
    - [ ] Month names localize correctly
    - [ ] Calendar handles no events gracefully
  - **Acceptance**: All checklist items verified and passing
  - **Parallel**: No

## Summary

**Total Tasks**: 36  
**Estimated Time**: 5-7 days (following quickstart.md timeline)

**Phases**:
1. Setup & Type Definitions: 4 tasks (Day 1)
2. State Management & API: 4 tasks (Day 1-2)
3. Core Components: 5 tasks (Day 2-3)
4. Navigation & Routing: 3 tasks (Day 3)
5. Event Details: 2 tasks (Day 4)
6. Internationalization: 4 tasks (Day 4-5)
7. Testing: 4 tasks (Day 5-6)
8. Polish & Validation: 5 tasks (Day 6-7)
9. Final Validation: 5 tasks (Day 7)

**Critical Path**: TASK-001 → TASK-004 → TASK-005 → TASK-006 → TASK-007 → TASK-010 → TASK-012 → TASK-013 → TASK-014 → TASK-021 → TASK-027 → TASK-031 → TASK-035 → TASK-036

**Parallel Opportunities**: TASK-002, TASK-003, TASK-008, TASK-011, TASK-019, TASK-020, TASK-023-026, TASK-029-030, TASK-032-034 can run in parallel with their respective dependencies met.
