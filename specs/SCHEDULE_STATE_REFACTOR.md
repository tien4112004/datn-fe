# Schedule State Management Simplification

## Current Architecture Analysis

### Current State Flow
```
ClassDetailPage
├── useCalendarStore (selectedDate)
├── useClassSchedules(classId, { startDate, endDate })
├── useClassPeriods(classId, { date })
└── Passes schedules to ScheduleView
    ├── Uses selectedDate from useCalendarStore
    ├── Filters schedules for selectedDate
    ├── useCalendarEvents(classId, selectedDate)
    └── Passes to ScheduleList
        └── Renders individual events with status logic
```

### Problems Identified

1. **Duplicate Date State**
   - `selectedDate` in `useCalendarStore`
   - `today` constant in `ClassDetailPage`
   - Date filtering happening in multiple places

2. **Duplicate Period Status Logic**
   - `getPeriodStatus()` in `ScheduleView`
   - `getPeriodStatus()` in `ScheduleList`
   - Both calculate current/completed/upcoming status independently

3. **Inefficient Data Fetching**
   - `useClassSchedules()` - fetches for date range
   - `useClassPeriods()` - fetches for specific date
   - `useCalendarEvents()` - fetches again in ScheduleView
   - Multiple API calls for same data

4. **Mixed Responsibilities**
   - ScheduleView handles both daily view AND calendar grid
   - ScheduleList duplicates rendering logic from old ScheduleView
   - Stats calculation in ScheduleView but data comes from filtered schedules

5. **Prop Drilling**
   - schedules passed from Page → ScheduleView → ScheduleList
   - Callbacks passed through multiple layers

---

## Recommended Architecture

### 1. Create a Centralized Schedule Store

**File:** `stores/scheduleStore.ts`

```typescript
import { create } from 'zustand';
import { format } from 'date-fns';

interface ScheduleState {
  // Date range selection
  selectedDate: Date;
  dateRangeStart: Date | null;
  dateRangeEnd: Date | null;
  viewMode: 'day' | 'week' | 'month';
  
  // Actions
  setSelectedDate: (date: Date) => void;
  setDateRange: (start: Date, end: Date) => void;
  setViewMode: (mode: 'day' | 'week' | 'month') => void;
  goToToday: () => void;
}

export const useScheduleStore = create<ScheduleState>((set) => ({
  selectedDate: new Date(),
  dateRangeStart: null,
  dateRangeEnd: null,
  viewMode: 'day',
  
  setSelectedDate: (date) => set({ selectedDate: date }),
  
  setDateRange: (start, end) => set({
    dateRangeStart: start,
    dateRangeEnd: end,
  }),
  
  setViewMode: (mode) => set({ viewMode: mode }),
  
  goToToday: () => set({ selectedDate: new Date() }),
}));
```

### 2. Create Custom Hook for Schedule Logic

**File:** `hooks/useScheduleHelpers.ts`

```typescript
import { useMemo } from 'react';
import { format } from 'date-fns';
import type { ScheduleEvent, DailySchedule } from '../types';

export function useScheduleHelpers() {
  const isToday = (dateString: string) => {
    return dateString === format(new Date(), 'yyyy-MM-dd');
  };

  const getPeriodStatus = (event: ScheduleEvent, dateString: string) => {
    if (!isToday(dateString)) return 'scheduled';
    
    const currentTime = new Date().toTimeString().slice(0, 5);
    
    if (event.startTime && event.endTime && 
        currentTime >= event.startTime && 
        currentTime < event.endTime) {
      return 'current';
    }
    
    if (event.endTime && currentTime >= event.endTime) {
      return 'completed';
    }
    
    return 'upcoming';
  };

  const getScheduleStats = (schedule: DailySchedule | null) => {
    if (!schedule) {
      return {
        total: 0,
        completed: 0,
        remaining: 0,
        withLessonPlan: 0,
      };
    }

    const events = schedule.events;
    return {
      total: events.length,
      completed: events.filter(e => 
        getPeriodStatus(e, schedule.date) === 'completed'
      ).length,
      remaining: events.filter(e => 
        ['current', 'upcoming'].includes(getPeriodStatus(e, schedule.date))
      ).length,
      withLessonPlan: events.filter(e => e.lessonPlanId).length,
    };
  };

  const sortEventsByTime = (events: ScheduleEvent[]) => {
    return [...events].sort((a, b) => 
      (a.startTime || '').localeCompare(b.startTime || '')
    );
  };

  return {
    isToday,
    getPeriodStatus,
    getScheduleStats,
    sortEventsByTime,
  };
}
```

### 3. Create Smart Data Hook

**File:** `hooks/useScheduleData.ts`

```typescript
import { useMemo } from 'react';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { useScheduleStore } from '../stores/scheduleStore';
import { useClassSchedules } from './useApi';

export function useScheduleData(classId: string) {
  const { selectedDate, dateRangeStart, dateRangeEnd, viewMode } = useScheduleStore();

  // Calculate date range based on view mode
  const { startDate, endDate } = useMemo(() => {
    if (dateRangeStart && dateRangeEnd) {
      return {
        startDate: format(dateRangeStart, 'yyyy-MM-dd'),
        endDate: format(dateRangeEnd, 'yyyy-MM-dd'),
      };
    }

    switch (viewMode) {
      case 'week':
        return {
          startDate: format(startOfWeek(selectedDate), 'yyyy-MM-dd'),
          endDate: format(endOfWeek(selectedDate), 'yyyy-MM-dd'),
        };
      case 'month':
        return {
          startDate: format(startOfMonth(selectedDate), 'yyyy-MM-dd'),
          endDate: format(endOfMonth(selectedDate), 'yyyy-MM-dd'),
        };
      case 'day':
      default:
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        return { startDate: dateStr, endDate: dateStr };
    }
  }, [selectedDate, dateRangeStart, dateRangeEnd, viewMode]);

  // Single API call for all schedule data
  const { data: schedulesData, isLoading, error } = useClassSchedules(classId, {
    startDate,
    endDate,
  });

  const schedules = schedulesData?.data || [];

  // Get today's schedule
  const todaySchedule = useMemo(() => {
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    return schedules.find(s => s.date === todayStr) || {
      date: todayStr,
      classId,
      events: [],
    };
  }, [schedules, classId]);

  // Get selected date schedule
  const selectedDateSchedule = useMemo(() => {
    const selectedStr = format(selectedDate, 'yyyy-MM-dd');
    return schedules.find(s => s.date === selectedStr) || {
      date: selectedStr,
      classId,
      events: [],
    };
  }, [schedules, selectedDate, classId]);

  return {
    schedules,
    todaySchedule,
    selectedDateSchedule,
    isLoading,
    error,
    selectedDate,
    dateRange: { startDate, endDate },
  };
}
```

### 4. Simplify ScheduleView Component

**File:** `components/schedule/ScheduleView.tsx`

```typescript
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Plus, CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import type { ScheduleEvent } from '../../types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { useScheduleStore } from '../../stores/scheduleStore';
import { useScheduleData } from '../../hooks/useScheduleData';
import { useScheduleHelpers } from '../../hooks/useScheduleHelpers';
import { CalendarGrid, EventDetailsDialog } from '../calendar';
import ScheduleList from './ScheduleList';
import ScheduleStats from './ScheduleStats';

interface ScheduleViewProps {
  classId: string;
  onAddPeriod?: (date: string) => void;
  onEditPeriod?: (event: ScheduleEvent) => void;
}

const ScheduleView = ({ classId, onAddPeriod, onEditPeriod }: ScheduleViewProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'schedule.daily' });
  const { selectedDate, setSelectedDate } = useScheduleStore();
  const { selectedDateSchedule, isLoading, error } = useScheduleData(classId);
  const { getScheduleStats } = useScheduleHelpers();

  const selectedDateString = format(selectedDate, 'yyyy-MM-dd');
  const stats = getScheduleStats(selectedDateSchedule);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {t('scheduleFor')} {format(selectedDate, 'PPPP', { locale: vi })}
            </CardTitle>
            <div className="flex items-center gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-fit justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(selectedDate, 'PPPP', { locale: vi })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                  />
                </PopoverContent>
              </Popover>
              {onAddPeriod && (
                <Button onClick={() => onAddPeriod(selectedDateString)} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  {t('actions.addPeriod')}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {selectedDateSchedule.events.length === 0 ? (
            <div className="text-muted-foreground py-4 text-center">
              <BookOpen className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p>{t('noClassesToday')}</p>
              {onAddPeriod && (
                <Button variant="outline" className="mt-4" onClick={() => onAddPeriod(selectedDateString)}>
                  <Plus className="mr-2 h-4 w-4" />
                  {t('actions.addFirstPeriod')}
                </Button>
              )}
            </div>
          ) : (
            <>
              <ScheduleList
                schedule={selectedDateSchedule}
                onEventClick={(event) => onEditPeriod?.(event)}
              />
              <ScheduleStats stats={stats} />
            </>
          )}
        </CardContent>
      </Card>

      {!error && (
        <Card>
          <CardHeader>
            <CardTitle>{t('monthlyView')}</CardTitle>
          </CardHeader>
          <CardContent>
            <CalendarGrid classId={classId} />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ScheduleView;
```

### 5. Simplify ScheduleList Component

**File:** `components/schedule/ScheduleList.tsx`

```typescript
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/utils';
import type { DailySchedule, ScheduleEvent } from '../../types';
import { useScheduleHelpers } from '../../hooks/useScheduleHelpers';

interface ScheduleListProps {
  schedule: DailySchedule;
  onEventClick: (event: ScheduleEvent) => void;
}

const ScheduleList = ({ schedule, onEventClick }: ScheduleListProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'schedule.daily' });
  const { getPeriodStatus, sortEventsByTime, isToday } = useScheduleHelpers();

  const sortedEvents = sortEventsByTime(schedule.events);
  const todayFlag = isToday(schedule.date);

  const getStatusBadge = (status: string) => {
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

  return (
    <div className="space-y-3">
      {sortedEvents.map((period) => {
        const status = getPeriodStatus(period, schedule.date);

        return (
          <Card
            key={period.id}
            className={cn(
              'cursor-pointer transition-all duration-200 hover:shadow-md',
              status === 'current' && 'border-green-500 bg-green-50',
              status === 'completed' && 'opacity-75'
            )}
            onClick={() => onEventClick(period)}
          >
            <CardContent className="px-4 py-2">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold">{period.subject}</h3>
                    {getStatusBadge(status)}
                  </div>

                  <div className="text-muted-foreground grid grid-cols-1 gap-2 text-sm md:grid-cols-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {period.startTime && period.endTime &&
                        `${period.startTime} - ${period.endTime}`}
                    </div>

                    {period.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {t('room')} {period.location}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className="text-right">
                    <div className="text-sm font-medium">{period.subjectCode}</div>
                    {period.lessonPlanId && (
                      <div className="text-xs text-green-600">{t('hasLessonPlan')}</div>
                    )}
                  </div>

                  {status === 'current' && <Button size="sm">{t('actions.viewCurrent')}</Button>}

                  {status === 'upcoming' && todayFlag && (
                    <Button size="sm" variant="outline">
                      {t('actions.prepare')}
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ScheduleList;
```

### 6. Extract Stats Component

**File:** `components/schedule/ScheduleStats.tsx`

```typescript
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

const ScheduleStats = ({ stats }: ScheduleStatsProps) => {
  const { t } = useTranslation('classes', { keyPrefix: 'schedule.daily' });

  return (
    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-4">
      <Card>
        <CardContent>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <p className="text-muted-foreground text-xs">{t('stats.totalPeriods')}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-muted-foreground text-xs">{t('stats.completed')}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.remaining}</div>
            <p className="text-muted-foreground text-xs">{t('stats.remaining')}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.withLessonPlan}</div>
            <p className="text-muted-foreground text-xs">{t('stats.withLessonPlan')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduleStats;
```

### 7. Simplify ClassDetailPage

**File:** `pages/ClassDetailPage.tsx`

```typescript
// ... other imports ...
import { useScheduleData } from '../hooks/useScheduleData';
import { useScheduleStore } from '../stores/scheduleStore';

const ClassDetailPage = () => {
  // ... existing code ...
  
  const { selectedDate } = useScheduleStore();
  const { todaySchedule, schedules } = useScheduleData(id!);

  // ... rest of component ...
  
  return (
    // ... JSX ...
    <TabsContent value="teaching" className="space-y-4">
      <TodaysTeachingDashboard
        classData={currentClass}
        todaySchedule={todaySchedule}
        // ... other props ...
      />
    </TabsContent>

    <TabsContent value="schedule" className="space-y-4">
      <ScheduleView
        classId={currentClass.id}
        onAddPeriod={async (date) => {
          // TODO: Open period creation modal
        }}
        onEditPeriod={async (period) => {
          await updatePeriod.mutateAsync({ id: period.id, updates: period });
        }}
      />
    </TabsContent>
    // ... rest of JSX ...
  );
};
```

---

## Benefits of This Refactor

### 1. Single Source of Truth
- ✅ One store for date selection (`useScheduleStore`)
- ✅ One hook for data fetching (`useScheduleData`)
- ✅ One hook for business logic (`useScheduleHelpers`)

### 2. Eliminated Duplication
- ✅ No duplicate `getPeriodStatus()` logic
- ✅ No duplicate date filtering
- ✅ Shared status calculation across components

### 3. Better Performance
- ✅ Single API call for date range
- ✅ Memoized computations
- ✅ Proper React Query caching

### 4. Cleaner Component Hierarchy
```
ClassDetailPage
└── ScheduleView (container)
    ├── useScheduleStore (date state)
    ├── useScheduleData (data fetching)
    ├── useScheduleHelpers (business logic)
    ├── ScheduleList (presentation)
    ├── ScheduleStats (presentation)
    └── CalendarGrid (presentation)
```

### 5. Easier Testing
- ✅ Isolated business logic in hooks
- ✅ Pure presentation components
- ✅ Mockable data fetching

### 6. Better Maintainability
- ✅ Clear separation of concerns
- ✅ Reusable logic across features
- ✅ Easy to add new views (week, month)

---

## Migration Steps

1. **Create new files**
   - `stores/scheduleStore.ts`
   - `hooks/useScheduleHelpers.ts`
   - `hooks/useScheduleData.ts`
   - `components/schedule/ScheduleStats.tsx`

2. **Update existing files**
   - Refactor `ScheduleView.tsx`
   - Refactor `ScheduleList.tsx`
   - Update `ClassDetailPage.tsx`

3. **Merge calendar store** (optional)
   - Consider merging `calendarStore` into `scheduleStore`
   - Or keep separate if calendar has distinct UI concerns

4. **Remove deprecated code**
   - Remove duplicate `useClassPeriods` call
   - Remove duplicate `useCalendarEvents` call
   - Clean up unused props

5. **Test thoroughly**
   - Test date selection
   - Test status calculations
   - Test data fetching
   - Test edge cases (no events, past dates, etc.)

---

## Future Enhancements

1. **Add Week View**
   ```typescript
   setViewMode('week');
   // Automatically fetches week's data
   ```

2. **Add Month View**
   ```typescript
   setViewMode('month');
   // Shows calendar with all events
   ```

3. **Add Date Range Filter**
   ```typescript
   setDateRange(startDate, endDate);
   // Custom range selection
   ```

4. **Real-time Updates**
   ```typescript
   // Auto-update status when time changes
   useEffect(() => {
     const interval = setInterval(() => {
       queryClient.invalidateQueries(classKeys.schedules(classId));
     }, 60000); // Every minute
     return () => clearInterval(interval);
   }, [classId]);
   ```

---

## Summary

This refactor simplifies the schedule state management by:
- **Centralizing** date/view state in `useScheduleStore`
- **Unifying** data fetching in `useScheduleData`
- **Extracting** business logic to `useScheduleHelpers`
- **Separating** presentation from logic
- **Eliminating** duplicate code and API calls
- **Improving** performance and maintainability
