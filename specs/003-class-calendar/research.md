# Research: Class Calendar

**Feature**: 003-class-calendar  
**Date**: October 30, 2025  
**Status**: Complete

## Calendar Library Selection

### Decision: react-day-picker 9.8.0

**Rationale**:
- Already installed in the project (`package.json` shows `react-day-picker: ^9.8.0`)
- Excellent React 19 compatibility with hooks-first API
- Strong i18n support with date-fns locales integration
- Highly customizable styling with Tailwind CSS classes
- Lightweight (~15KB gzipped) with minimal dependencies
- Active maintenance and strong TypeScript support
- Flexible enough to handle custom event rendering within calendar cells

**Alternatives Considered**:

1. **FullCalendar**
   - ❌ Rejected: Heavyweight (~300KB), overkill for read-only monthly view
   - ❌ Commercial license required for some features
   - ✅ Rich features (drag-drop, scheduling) not needed for this use case

2. **react-calendar**
   - ❌ Rejected: Less flexible customization for event rendering
   - ❌ Weaker TypeScript support compared to react-day-picker
   - ✅ Simpler API, but less suitable for complex event display

3. **Custom implementation**
   - ❌ Rejected: Reinventing date calculations (month boundaries, weeks, localization)
   - ❌ Higher maintenance burden
   - ❌ More testing surface area
   - ✅ Could be more performant, but premature optimization

**Implementation Approach**: Use react-day-picker's base calendar rendering, customize with `components` prop to render events within calendar cells, and handle event click interactions through custom handlers.

## Date Handling

### Decision: date-fns 4.1.0

**Rationale**:
- Already installed and used throughout the project
- Tree-shakeable (only import needed functions)
- Immutable date operations (safer than Moment.js mutations)
- Excellent i18n support with locale modules
- Works seamlessly with react-day-picker
- Strong TypeScript support with accurate types

**Key Functions Needed**:
- `startOfMonth`, `endOfMonth`: Determine month boundaries for API queries
- `format`: Display month/year header (e.g., "October 2025")
- `isSameDay`: Group events by date
- `addMonths`, `subMonths`: Month navigation
- `isWithinInterval`: Filter events for current month
- `compareAsc`: Sort events chronologically

**Alternatives Considered**:
- **Moment.js**: ❌ Deprecated, large bundle size, mutable API
- **Day.js**: ✅ Smaller, but date-fns already integrated
- **Luxon**: ✅ Modern, but switching would be inconsistent with existing codebase

## State Management Pattern

### Decision: Zustand store + React Query (TanStack Query)

**Rationale**:
- Zustand already used for classes feature (`useClassStore`)
- React Query already installed (`@tanstack/react-query: ^5.83.0`)
- Zustand handles UI state (selected month, view mode)
- React Query handles server state (events fetching, caching)
- This pattern separates concerns: UI state vs. server data
- Automatic cache invalidation and refetch on stale data
- Built-in loading and error states

**State Structure**:
```typescript
// Zustand store (UI state)
interface CalendarState {
  selectedDate: Date;           // Currently viewed month
  viewMode: 'monthly';          // Future: 'weekly', 'daily'
  selectedEventId: string | null; // For event details dialog
  setSelectedDate: (date: Date) => void;
  nextMonth: () => void;
  prevMonth: () => void;
  openEventDetails: (eventId: string) => void;
  closeEventDetails: () => void;
}

// React Query (server state)
useQuery({
  queryKey: ['classEvents', classId, monthKey],
  queryFn: () => fetchClassEvents(classId, startDate, endDate)
})
```

**Alternatives Considered**:
- **Redux**: ❌ Too heavy for this scope, existing project uses Zustand
- **Context + useState**: ❌ Less scalable, manual cache management
- **Zustand only**: ❌ Would need manual API caching logic

## Event Rendering Strategy

### Decision: Custom Day Cell Component

**Rationale**:
- react-day-picker supports custom `components.Day` prop
- Allows rendering multiple events per calendar cell
- Can apply visual indicators (colored dots/badges) for event categories
- Supports click handlers for event selection
- Maintains calendar accessibility

**Rendering Approach**:
```typescript
<DayPicker
  components={{
    Day: (props) => <CustomDayCell {...props} events={eventsForDay} />
  }}
/>
```

**Visual Strategy**:
- **Desktop**: Show up to 3 event names per cell, "+ N more" for overflow
- **Tablet**: Show 2 event names per cell, "+ N more" for overflow
- **Overflow handling**: Click cell to see full event list in popover/dialog
- **Color coding**: Category-based badge colors (assignment=blue, trip=green, exam=red)

**Alternatives Considered**:
- **Event list below calendar**: ❌ Less intuitive, requires scrolling
- **Popover on hover**: ❌ Poor mobile/tablet experience
- **Separate events panel**: ❌ Splits attention, more complex layout

## Internationalization (i18n)

### Decision: Extend existing i18next setup

**Rationale**:
- Project already uses i18next 25.3.2 + react-i18next 15.6.0
- Existing pattern: JSON files per feature in `shared/i18n/locales/{lang}/`
- date-fns locales integrate with i18next for date formatting
- Month/day names automatically localized via date-fns

**Translation Structure**:
```json
// locales/en/calendar.json
{
  "title": "Class Calendar",
  "navigation": {
    "previous": "Previous Month",
    "next": "Next Month",
    "today": "Today"
  },
  "events": {
    "showMore": "{{count}} more events",
    "noEvents": "No events this month"
  },
  "categories": {
    "assignment": "Assignment Due",
    "fieldTrip": "Field Trip",
    "exam": "Exam",
    "meeting": "Parent Meeting"
  }
}
```

**Date Localization**: Use date-fns locale with `format(date, 'MMMM yyyy', { locale: viLocale })`

## API Integration Pattern

### Decision: Axios service with React Query

**Rationale**:
- Existing classes feature uses Axios for API calls
- Centralized API configuration in `features/classes/api/`
- React Query wraps Axios for caching and state management
- Consistent error handling with existing patterns

**Endpoint Design** (for contracts phase):
```typescript
GET /api/classes/:classId/events?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
Response: { events: CalendarEvent[] }
```

**Mock Data Strategy**:
- Initial development uses mock data in API service
- Mock includes sample events: "Book Report Due" (Oct 20), "Field Trip" (Oct 25)
- Easy swap to real backend when available

## Responsive Design Strategy

### Decision: Tailwind CSS with mobile-first approach

**Rationale**:
- Project uses Tailwind CSS 4.1.11 throughout
- Existing components follow responsive patterns
- react-day-picker supports custom className props for styling
- Breakpoints: mobile (default), tablet (md:), desktop (lg:)

**Responsive Behavior**:
- **Mobile** (< 768px): Not primary target (spec says desktop + tablet)
- **Tablet** (768px - 1023px): Compact event display, 2 events per cell
- **Desktop** (≥ 1024px): Full event display, 3 events per cell

**Calendar Layout**:
- Full-width on tablet/desktop
- Sticky month navigation header
- Event details in Dialog (not inline) for consistent mobile support

## Performance Considerations

### Decision: Memoization + Virtual Scrolling for Event Lists

**Rationale**:
- Calendar grid is small (7 × 5-6 cells = 35-42 cells max)
- No virtual scrolling needed for calendar grid itself
- Event details list (when many events) uses virtualization if > 50 items
- React.memo for day cells to prevent unnecessary re-renders
- useMemo for expensive date calculations (grouping events by day)

**Caching Strategy**:
- React Query caches events for 5 minutes (staleTime: 5 * 60 * 1000)
- Prefetch adjacent months on hover of navigation buttons
- Cache key includes classId + month to prevent stale data across classes

**Bundle Size**:
- react-day-picker: ~15KB
- date-fns (tree-shaken): ~5KB for needed functions
- Total impact: ~20KB additional (acceptable for calendar feature)

## Testing Strategy

### Decision: Unit tests + integration tests with React Testing Library

**Test Coverage Focus**:
1. **Unit Tests**:
   - Date utilities (grouping, formatting)
   - Month navigation logic
   - Event filtering by date range

2. **Integration Tests**:
   - Calendar renders with events on correct dates
   - Month navigation updates calendar
   - Event click opens details dialog
   - Empty state when no events

3. **Mock Strategy**:
   - Mock date-fns `new Date()` for consistent test dates
   - Mock API responses with sample events
   - Mock React Query with testing utilities

**Not Testing**:
- react-day-picker internals (library responsibility)
- date-fns calculations (library responsibility)

## Accessibility Considerations

### Decision: Leverage react-day-picker's built-in a11y

**Features**:
- Keyboard navigation (arrow keys between days)
- Screen reader support (ARIA labels)
- Focus management for month navigation
- Semantic HTML structure (table for calendar)

**Additional Enhancements**:
- ARIA labels for event badges (e.g., "3 events on October 20")
- Dialog focus trap for event details
- Skip link to jump to calendar from header
- Announce month changes to screen readers

**Testing**: Manual accessibility audit with screen reader after implementation

## Summary of Technology Choices

| Category | Technology | Justification |
|----------|-----------|---------------|
| Calendar UI | react-day-picker 9.8.0 | Already installed, flexible, lightweight, strong React 19 support |
| Date Handling | date-fns 4.1.0 | Already installed, tree-shakeable, immutable, excellent i18n |
| State Management | Zustand 5.0.7 + React Query 5.83.0 | Already installed, separates UI/server state, automatic caching |
| i18n | i18next 25.3.2 + react-i18next 15.6.0 | Already installed, consistent with project patterns |
| Styling | Tailwind CSS 4.1.11 | Already installed, responsive utilities, custom calendar styling |
| API Client | Axios 1.10.0 | Already installed, consistent with classes feature patterns |
| Testing | Vitest 3.2.4 + React Testing Library 16.3.0 | Already installed, fast, React-focused |
| Routing | React Router DOM 7.6.3 | Already installed, add `/classes/:id/calendar` route |

**Result**: Zero new dependencies required. All necessary libraries already installed in project. This aligns with constitution principle IV (Workspace Isolation & Dependencies): "prefer existing solutions before adding packages."
