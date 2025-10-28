# Schedule State Refactoring Proposal

## Current Architecture Analysis

### Current State Flow
```
ClassDetailPage
├─ useCalendarStore (selectedDate)
├─ useClassSchedules (fetches DailySchedule[] for date range)
├─ useClassPeriods (fetches ScheduleEvent[] for specific date)
│
├─ TodaysTeachingDashboard Tab (uses today's data)
│  ├─ todaySchedule: DailySchedule (filtered from schedules)
│  ├─ allPeriods: ScheduleEvent[]
│  └─ todayLessonPlans: LessonPlan[]
│
└─ ScheduleView Tab
   ├─ useCalendarStore (selectedDate) ← DUPLICATE
   ├─ useCalendarEvents (fetches events for month) ← DIFFERENT API
   ├─ schedules prop (from parent)
   ├─ todaySchedule (filtered from schedules)
   └─ ScheduleList (receives todaySchedule)
```

### Issues Identified

1. **Duplicate Date State**: Both `ClassDetailPage` and `ScheduleView` use `selectedDate` independently
2. **Multiple Data Sources**: 
   - `useClassSchedules` for daily view
   - `useCalendarEvents` for calendar grid
   - `useClassPeriods` for detailed period info
3. **Prop Drilling**: Schedules passed from parent to child unnecessarily
4. **Inconsistent Date Ranges**: 
   - Today: `new Date().toISOString().split('T')[0]`
   - Selected: `format(selectedDate, 'yyyy-MM-dd')`
   - Range: `startDate` / `endDate` params
5. **Logic Duplication**: Status calculation (`getPeriodStatus`) duplicated in both `ScheduleView` and `ScheduleList`

---

## Proposed Solutions

### Option 1: Unified Schedule Store (Recommended) ⭐

Create a dedicated schedule store that manages all schedule-related state.

```typescript
// stores/scheduleStore.ts
import { create } from 'zustand';
import { format, startOfMonth, endOfMonth } from 'date-fns';

interface ScheduleState {
  // Date state
  selectedDate: Date;
  viewMode: 'day' | 'week' | 'month';
  
  // View state
  selectedEventId: string | null;
  
  // Actions
  setSelectedDate: (date: Date) => void;
  setViewMode: (mode: 'day' | 'week' | 'month') => void;
  goToToday: () => void;
  nextPeriod: () => void;
  prevPeriod: () => void;
  openEventDetails: (eventId: string) => void;
  closeEventDetails: () => void;
  
  // Computed values (helpers)
  getDateRange: () => { startDate: string; endDate: string };
  isToday: (dateString: string) => boolean;
}

export const useScheduleStore = create<ScheduleState>((set, get) => ({
  selectedDate: new Date(),
  viewMode: 'day',
  selectedEventId: null,

  setSelectedDate: (date) => set({ selectedDate: date }),
  setViewMode: (mode) => set({ viewMode: mode }),
  goToToday: () => set({ selectedDate: new Date() }),
  
  nextPeriod: () => {
    const { selectedDate, viewMode } = get();
    // Logic based on viewMode
  },
  
  prevPeriod: () => {
    const { selectedDate, viewMode } = get();
    // Logic based on viewMode
  },
  
  openEventDetails: (eventId) => set({ selectedEventId: eventId }),
  closeEventDetails: () => set({ selectedEventId: null }),
  
  getDateRange: () => {
    const { selectedDate, viewMode } = get();
    switch (viewMode) {
      case 'day':
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        return { startDate: dateStr, endDate: dateStr };
      case 'month':
        return {
          startDate: format(startOfMonth(selectedDate), 'yyyy-MM-dd'),
          endDate: format(endOfMonth(selectedDate), 'yyyy-MM-dd'),
        };
      // ... week logic
    }
  },
  
  isToday: (dateString: string) => {
    return dateString === format(new Date(), 'yyyy-MM-dd');
  },
}));
```

**Benefits:**
- ✅ Single source of truth for date state
- ✅ Reusable across all schedule components
- ✅ Easy to add features (week view, filters)
- ✅ Consistent date formatting

---

### Option 2: Unified Data Hook

Create a single hook that provides all schedule data based on the current view state.

```typescript
// hooks/useScheduleData.ts
import { useScheduleStore } from '../stores/scheduleStore';
import { useClassSchedules, useCalendarEvents } from './useApi';

export function useScheduleData(classId: string) {
  const { selectedDate, viewMode, getDateRange } = useScheduleStore();
  const { startDate, endDate } = getDateRange();
  
  // Fetch schedules for the selected range
  const { data: schedulesData, isLoading: schedulesLoading } = useClassSchedules(
    classId,
    { startDate, endDate }
  );
  
  // Only fetch calendar events for month view
  const { 
    events: calendarEvents, 
    isLoading: eventsLoading 
  } = useCalendarEvents(
    classId, 
    selectedDate,
    viewMode === 'month' // Only enable for month view
  );
  
  const schedules = schedulesData?.data || [];
  const selectedDateString = format(selectedDate, 'yyyy-MM-dd');
  
  // Get current view's schedule
  const currentSchedule = schedules.find(
    (s) => s.date === selectedDateString
  ) || {
    date: selectedDateString,
    classId,
    events: [],
  };
  
  return {
    schedules,
    currentSchedule,
    calendarEvents: viewMode === 'month' ? calendarEvents : [],
    isLoading: schedulesLoading || eventsLoading,
    selectedDate,
    viewMode,
  };
}
```

**Benefits:**
- ✅ Centralized data fetching logic
- ✅ Automatic data selection based on view
- ✅ Reduced component complexity

---

### Option 3: Utility Functions for Shared Logic

Extract common calculations into utility functions.

```typescript
// utils/scheduleHelpers.ts
import { format } from 'date-fns';
import type { ScheduleEvent } from '../types';

export type PeriodStatus = 'current' | 'completed' | 'upcoming' | 'scheduled';

/**
 * Calculate the status of a period/event
 */
export function getPeriodStatus(
  event: ScheduleEvent,
  dateString: string
): PeriodStatus {
  const isToday = dateString === format(new Date(), 'yyyy-MM-dd');
  
  if (!isToday) return 'scheduled';
  
  const currentTime = new Date().toTimeString().slice(0, 5);
  
  if (
    event.startTime &&
    event.endTime &&
    currentTime >= event.startTime &&
    currentTime < event.endTime
  ) {
    return 'current';
  }
  
  if (event.endTime && currentTime >= event.endTime) {
    return 'completed';
  }
  
  return 'upcoming';
}

/**
 * Sort events by start time
 */
export function sortEventsByTime(events: ScheduleEvent[]): ScheduleEvent[] {
  return [...events].sort((a, b) => 
    (a.startTime || '').localeCompare(b.startTime || '')
  );
}

/**
 * Get statistics for a list of events
 */
export function getScheduleStats(events: ScheduleEvent[], dateString: string) {
  const sortedEvents = sortEventsByTime(events);
  
  return {
    total: sortedEvents.length,
    completed: sortedEvents.filter(
      (e) => getPeriodStatus(e, dateString) === 'completed'
    ).length,
    remaining: sortedEvents.filter((e) =>
      ['current', 'upcoming'].includes(getPeriodStatus(e, dateString))
    ).length,
    withLessonPlan: sortedEvents.filter((e) => e.lessonPlanId).length,
  };
}

/**
 * Format time string (can be enhanced later)
 */
export function formatTime(timeStr: string): string {
  return timeStr;
}

/**
 * Check if a date string is today
 */
export function isToday(dateString: string): boolean {
  return dateString === format(new Date(), 'yyyy-MM-dd');
}
```

**Benefits:**
- ✅ No logic duplication
- ✅ Easy to test
- ✅ Consistent behavior across components

---

## Recommended Implementation Plan

### Phase 1: Create Unified Store & Utils
1. Create `scheduleStore.ts` (merge with `calendarStore.ts`)
2. Create `scheduleHelpers.ts` utility file
3. Update type exports if needed

### Phase 2: Refactor ScheduleList
```typescript
// ScheduleList.tsx
import { getStatusBadge } from './ScheduleStatusBadge'; // Extract to component
import { getPeriodStatus, sortEventsByTime, isToday } from '../../utils/scheduleHelpers';

const ScheduleList = ({ schedules, onEventClick }: ScheduleListProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'schedule.daily' });

  const sortedSchedules = useMemo(() => {
    return schedules.map((schedule) => ({
      ...schedule,
      events: sortEventsByTime(schedule.events),
    }));
  }, [schedules]);

  return (
    <div className="space-y-3">
      {sortedSchedules.map((dailySchedule) =>
        dailySchedule.events.map((period) => {
          const status = getPeriodStatus(period, dailySchedule.date);
          const todayFlag = isToday(dailySchedule.date);
          
          // ... render logic (stays the same)
        })
      )}
    </div>
  );
};
```

### Phase 3: Refactor ScheduleView
```typescript
// ScheduleView.tsx
import { useScheduleStore } from '../../stores/scheduleStore';
import { useScheduleData } from '../../hooks/useScheduleData';
import { getScheduleStats } from '../../utils/scheduleHelpers';

const ScheduleView = ({ classId, onAddPeriod, onEditPeriod }: ScheduleViewProps) => {
  const { 
    selectedDate, 
    setSelectedDate, 
    selectedEventId, 
    openEventDetails, 
    closeEventDetails 
  } = useScheduleStore();
  
  const { 
    currentSchedule, 
    calendarEvents, 
    isLoading, 
    error 
  } = useScheduleData(classId);
  
  const selectedDateString = format(selectedDate, 'yyyy-MM-dd');
  const stats = getScheduleStats(currentSchedule.events, selectedDateString);
  
  // ... render logic (simplified, no duplicate calculations)
};
```

### Phase 4: Refactor ClassDetailPage
```typescript
// ClassDetailPage.tsx
import { useScheduleStore } from '../stores/scheduleStore';
import { useScheduleData } from '../hooks/useScheduleData';

const ClassDetailPage = () => {
  const { selectedDate, goToToday } = useScheduleStore();
  const { schedules, currentSchedule, isLoading } = useScheduleData(id!);
  
  // No need to manage date state or filter schedules
  // Just use currentSchedule directly
  
  return (
    // ... render with simplified data access
  );
};
```

---

## Additional Improvements

### 1. Extract StatusBadge Component
```typescript
// components/ScheduleStatusBadge.tsx
import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import type { PeriodStatus } from '../../utils/scheduleHelpers';

interface ScheduleStatusBadgeProps {
  status: PeriodStatus;
}

export const ScheduleStatusBadge = ({ status }: ScheduleStatusBadgeProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'schedule.daily' });
  
  switch (status) {
    case 'current':
      return <Badge className="bg-green-500">{t('status.current')}</Badge>;
    case 'completed':
      return <Badge variant="secondary">{t('status.completed')}</Badge>;
    case 'upcoming':
      return <Badge variant="outline">{t('status.upcoming')}</Badge>;
    default:
      return <Badge variant="outline">{t('status.scheduled')}</Badge>;
  }
};
```

### 2. Extract ScheduleStats Component
```typescript
// components/ScheduleStats.tsx
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

interface ScheduleStatsProps {
  stats: {
    total: number;
    completed: number;
    remaining: number;
    withLessonPlan: number;
  };
}

export const ScheduleStats = ({ stats }: ScheduleStatsProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'schedule.daily.stats' });
  
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
      <Card>
        <CardContent>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <p className="text-muted-foreground text-xs">{t('totalPeriods')}</p>
          </div>
        </CardContent>
      </Card>
      {/* ... other stat cards */}
    </div>
  );
};
```

### 3. Consolidate API Calls
Consider merging `useClassSchedules` and `useCalendarEvents` into a single endpoint if they serve similar purposes, or clearly separate their use cases:
- `useClassSchedules`: For daily/weekly detailed view
- `useCalendarEvents`: For monthly calendar grid only

---

## Migration Checklist

- [ ] Create `scheduleStore.ts`
- [ ] Create `scheduleHelpers.ts` utility functions
- [ ] Extract `ScheduleStatusBadge` component
- [ ] Extract `ScheduleStats` component
- [ ] Create `useScheduleData` hook
- [ ] Refactor `ScheduleList` to use utilities
- [ ] Refactor `ScheduleView` to use store and utilities
- [ ] Refactor `ClassDetailPage` to use store
- [ ] Remove `calendarStore.ts` (merge into scheduleStore)
- [ ] Update tests
- [ ] Remove duplicate logic

---

## Benefits Summary

### Before
- 3 different date state locations
- 2-3 API calls for similar data
- Duplicate status calculation logic
- Props drilling through 2-3 levels
- Hard to add new views (week, agenda)

### After
- ✅ Single date state source
- ✅ Unified data fetching
- ✅ Reusable utility functions
- ✅ Direct store access (no props drilling)
- ✅ Easy to extend (add week view, filters, etc.)
- ✅ Better testability
- ✅ Improved performance (no redundant calculations)
- ✅ Cleaner component code

---

## Example: Adding Week View (Future)

With the new architecture, adding a week view becomes trivial:

```typescript
// In scheduleStore.ts
setViewMode: (mode) => set({ viewMode: mode }),

nextPeriod: () => {
  const { selectedDate, viewMode } = get();
  switch (viewMode) {
    case 'day':
      set({ selectedDate: addDays(selectedDate, 1) });
      break;
    case 'week':
      set({ selectedDate: addWeeks(selectedDate, 1) });
      break;
    case 'month':
      set({ selectedDate: addMonths(selectedDate, 1) });
      break;
  }
},
```

Then in the UI:
```typescript
const { viewMode, setViewMode } = useScheduleStore();

<ToggleGroup value={viewMode} onValueChange={setViewMode}>
  <ToggleGroupItem value="day">Day</ToggleGroupItem>
  <ToggleGroupItem value="week">Week</ToggleGroupItem>
  <ToggleGroupItem value="month">Month</ToggleGroupItem>
</ToggleGroup>
```

All components automatically adapt! 🎉
