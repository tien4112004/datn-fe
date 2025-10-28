# Quickstart: Class Calendar Feature

**Feature**: 003-class-calendar  
**For**: Frontend developers implementing the calendar UI  
**Time**: ~30 minutes to understand and start development

## Overview

This guide helps you implement the Class Calendar feature—a read-only monthly calendar view showing class events like assignments, field trips, and exams.

## Prerequisites

- Node.js 20+ installed
- pnpm 9+ installed (check with `pnpm --version`)
- Familiarity with React 19, TypeScript, and Tailwind CSS
- Understanding of the existing classes feature structure

## Quick Start

### 1. Setup Development Environment

```bash
# Navigate to container workspace
cd container

# Install dependencies (already done if project is set up)
pnpm install

# Start development server
pnpm dev

# In another terminal, run type checking
pnpm typecheck --watch
```

### 2. Verify Existing Dependencies

All required dependencies are already installed. Verify:

```bash
# Check package.json for these versions
grep -A 5 "dependencies" package.json | grep -E "(react-day-picker|date-fns|zustand|i18next)"
```

Expected output shows:
- `react-day-picker: ^9.8.0`
- `date-fns: ^4.1.0`
- `zustand: ^5.0.7`
- `i18next: ^25.3.2`
- `react-i18next: ^15.6.0`

### 3. Project Structure Overview

```text
container/src/features/classes/
├── components/
│   ├── calendar/              # NEW: Calendar components
│   │   ├── CalendarGrid.tsx
│   │   ├── CalendarEventCard.tsx
│   │   ├── CalendarHeader.tsx
│   │   ├── EventDetailsDialog.tsx
│   │   └── index.ts
│   └── table/                 # Existing: Class table
├── pages/
│   ├── ClassListPage.tsx      # Existing
│   ├── ClassDetailPage.tsx    # Existing
│   └── ClassCalendarPage.tsx  # NEW: Main calendar page
├── hooks/
│   ├── useClasses.ts          # Existing
│   ├── useCalendarEvents.ts   # NEW: Fetch events hook
│   └── useCalendarNavigation.ts # NEW: Month navigation
├── stores/
│   ├── classStore.ts          # Existing
│   └── calendarStore.ts       # NEW: Calendar UI state
├── api/
│   ├── classApi.ts            # Existing
│   └── calendarApi.ts         # NEW: Events API
└── types/
    ├── entities/
    │   ├── class.ts           # Existing
    │   └── calendarEvent.ts   # NEW: Event types
    └── constants/
        └── eventCategories.ts # NEW: Category enum
```

### 4. Key Files to Create

#### Priority 1 (Core Calendar Display - P1 User Story)

1. **Types**: `types/entities/calendarEvent.ts`
   - Define `CalendarEvent` interface
   - Define `EventCategory` enum
   - See: [data-model.md](./data-model.md)

2. **API Service**: `api/calendarApi.ts`
   - Implement `fetchClassEvents(classId, startDate, endDate)`
   - Use mock data initially
   - See: [contracts/calendar-events-api.yaml](./contracts/calendar-events-api.yaml)

3. **Store**: `stores/calendarStore.ts`
   - Create Zustand store for selected date, view mode
   - Implement month navigation actions
   - See: [research.md](./research.md#state-management-pattern)

4. **Hook**: `hooks/useCalendarEvents.ts`
   - Wrap API calls with React Query
   - Handle loading/error states
   - Cache events by month

5. **Components**:
   - `CalendarHeader.tsx`: Month/year display + prev/next buttons
   - `CalendarGrid.tsx`: react-day-picker integration with custom day cells
   - `CalendarEventCard.tsx`: Event badge rendering in calendar cells

6. **Page**: `pages/ClassCalendarPage.tsx`
   - Main page component
   - Integrate header, grid, and state
   - Route: `/classes/:id/calendar`

#### Priority 2 (Month Navigation - P2 User Story)

Already covered in Priority 1 components (CalendarHeader navigation).

#### Priority 3 (Event Details - P3 User Story)

7. **Component**: `components/calendar/EventDetailsDialog.tsx`
   - Radix UI Dialog for event details
   - Display full event information
   - Triggered by clicking events

### 5. Implementation Order

**Day 1-2: Foundation**
```bash
# Create type definitions
touch src/features/classes/types/entities/calendarEvent.ts
touch src/features/classes/types/constants/eventCategories.ts

# Create API service with mock data
touch src/features/classes/api/calendarApi.ts

# Create store
touch src/features/classes/stores/calendarStore.ts

# Create hook
touch src/features/classes/hooks/useCalendarEvents.ts
```

**Day 3-4: UI Components**
```bash
# Create component directory
mkdir -p src/features/classes/components/calendar

# Create components
touch src/features/classes/components/calendar/CalendarHeader.tsx
touch src/features/classes/components/calendar/CalendarGrid.tsx
touch src/features/classes/components/calendar/CalendarEventCard.tsx
touch src/features/classes/components/calendar/index.ts
```

**Day 5: Integration**
```bash
# Create main page
touch src/features/classes/pages/ClassCalendarPage.tsx

# Add routing (update router.tsx)
# Add navigation link (update ClassDetailPage.tsx)
```

**Day 6: Event Details (P3)**
```bash
touch src/features/classes/components/calendar/EventDetailsDialog.tsx
```

**Day 7: i18n + Polish**
```bash
# Add translations
touch src/shared/i18n/locales/en/calendar.json
touch src/shared/i18n/locales/vi/calendar.json

# Run tests, fix styling, handle edge cases
```

### 6. Code Examples

#### Type Definition Example

```typescript
// types/entities/calendarEvent.ts
export interface CalendarEvent {
  id: string;
  classId: string;
  name: string;
  date: string; // ISO 8601 (YYYY-MM-DD)
  startTime?: string;
  endTime?: string;
  category: EventCategory;
  location?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export enum EventCategory {
  ASSIGNMENT = 'assignment',
  EXAM = 'exam',
  FIELD_TRIP = 'fieldTrip',
  MEETING = 'meeting',
  HOLIDAY = 'holiday',
  PRESENTATION = 'presentation',
  OTHER = 'other'
}
```

#### API Service Example

```typescript
// api/calendarApi.ts
import axios from 'axios';
import { CalendarEvent } from '../types/entities/calendarEvent';

export const calendarApi = {
  async fetchClassEvents(
    classId: string,
    startDate: string,
    endDate: string
  ): Promise<CalendarEvent[]> {
    // Mock data for initial development
    return [
      {
        id: 'event-001',
        classId,
        name: 'Book Report Due',
        date: '2025-10-20',
        category: 'assignment',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 'event-002',
        classId,
        name: 'Field Trip',
        date: '2025-10-25',
        startTime: '08:00:00',
        endTime: '15:00:00',
        category: 'fieldTrip',
        location: 'City Science Museum',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    
    // Uncomment when backend ready:
    // const response = await axios.get(
    //   `/api/classes/${classId}/events`,
    //   { params: { startDate, endDate } }
    // );
    // return response.data.events;
  }
};
```

#### Store Example

```typescript
// stores/calendarStore.ts
import { create } from 'zustand';
import { addMonths, subMonths } from 'date-fns';

interface CalendarState {
  selectedDate: Date;
  selectedEventId: string | null;
  setSelectedDate: (date: Date) => void;
  nextMonth: () => void;
  prevMonth: () => void;
  openEventDetails: (eventId: string) => void;
  closeEventDetails: () => void;
}

export const useCalendarStore = create<CalendarState>((set) => ({
  selectedDate: new Date(),
  selectedEventId: null,
  
  setSelectedDate: (date) => set({ selectedDate: date }),
  
  nextMonth: () => set((state) => ({
    selectedDate: addMonths(state.selectedDate, 1)
  })),
  
  prevMonth: () => set((state) => ({
    selectedDate: subMonths(state.selectedDate, 1)
  })),
  
  openEventDetails: (eventId) => set({ selectedEventId: eventId }),
  
  closeEventDetails: () => set({ selectedEventId: null }),
}));
```

#### React Query Hook Example

```typescript
// hooks/useCalendarEvents.ts
import { useQuery } from '@tanstack/react-query';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { calendarApi } from '../api/calendarApi';

export function useCalendarEvents(classId: string, selectedDate: Date) {
  const startDate = format(startOfMonth(selectedDate), 'yyyy-MM-dd');
  const endDate = format(endOfMonth(selectedDate), 'yyyy-MM-dd');
  
  return useQuery({
    queryKey: ['classEvents', classId, startDate],
    queryFn: () => calendarApi.fetchClassEvents(classId, startDate, endDate),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

### 7. Testing Strategy

```typescript
// Example test for CalendarGrid.test.tsx
import { render, screen } from '@testing-library/react';
import { CalendarGrid } from '../CalendarGrid';

describe('CalendarGrid', () => {
  it('renders events on correct dates', () => {
    const events = [
      {
        id: '1',
        name: 'Book Report Due',
        date: '2025-10-20',
        category: 'assignment',
        // ... other fields
      }
    ];
    
    render(<CalendarGrid events={events} selectedDate={new Date(2025, 9, 1)} />);
    
    // Find the cell for October 20
    const cell = screen.getByText('20');
    expect(cell).toBeInTheDocument();
    
    // Verify event is displayed
    expect(screen.getByText('Book Report Due')).toBeInTheDocument();
  });
});
```

### 8. i18n Setup

```json
// shared/i18n/locales/en/calendar.json
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
    "meeting": "Parent Meeting",
    "holiday": "Holiday",
    "presentation": "Presentation",
    "other": "Other"
  },
  "details": {
    "title": "Event Details",
    "date": "Date",
    "time": "Time",
    "location": "Location",
    "description": "Description",
    "close": "Close"
  }
}
```

### 9. Routing Setup

```typescript
// app/router.tsx (add this route)
{
  path: 'classes/:id/calendar',
  Component: Classes.ClassCalendarPage,
  loader: getClassById, // Reuse existing loader
}
```

```typescript
// features/classes/pages/ClassDetailPage.tsx (add navigation link)
import { Link } from 'react-router-dom';

<Link 
  to={`/classes/${classId}/calendar`}
  className="btn btn-secondary"
>
  View Calendar
</Link>
```

### 10. Debugging Tips

**Problem**: Calendar not rendering events
```bash
# Check React Query DevTools
# Verify API is returning data
console.log('Events:', data);
```

**Problem**: Date formatting issues
```bash
# Check date-fns locale import
import { enUS, vi } from 'date-fns/locale';
```

**Problem**: Styling conflicts
```bash
# Use Tailwind classes with proper prefixes
# Check Tailwind config for custom calendar styles
```

### 11. Quality Checklist

Before submitting PR, verify:

- [ ] `pnpm typecheck` passes (zero errors)
- [ ] `pnpm lint` passes (zero warnings)
- [ ] `pnpm test` passes (all tests green)
- [ ] `pnpm build` succeeds
- [ ] Calendar displays October 2025 with "Book Report Due" on 20th
- [ ] Calendar displays "Field Trip" on October 25th
- [ ] Month navigation works (prev/next buttons)
- [ ] Event click shows details dialog
- [ ] Responsive on tablet and desktop
- [ ] i18n works (test with language switcher)
- [ ] Conventional commit messages used
- [ ] Code follows project formatting (Prettier)

### 12. Resources

- **Specification**: [spec.md](./spec.md)
- **Research**: [research.md](./research.md)
- **Data Model**: [data-model.md](./data-model.md)
- **API Contract**: [contracts/calendar-events-api.yaml](./contracts/calendar-events-api.yaml)
- **react-day-picker Docs**: https://react-day-picker.js.org/
- **date-fns Docs**: https://date-fns.org/
- **Zustand Docs**: https://zustand-demo.pmnd.rs/

### 13. Getting Help

- Review existing classes feature for patterns (`features/classes/`)
- Check constitution.md for code standards (`.specify/memory/constitution.md`)
- Ask questions in team chat with `@frontend` tag
- Create draft PR early for feedback

## Next Steps

1. Read through [spec.md](./spec.md) to understand user requirements
2. Review [data-model.md](./data-model.md) for entity structure
3. Start with Priority 1 tasks (types, API, store)
4. Implement components incrementally
5. Test each component as you build
6. Add i18n translations last
7. Submit PR with link to this specification

Happy coding! 🎉
