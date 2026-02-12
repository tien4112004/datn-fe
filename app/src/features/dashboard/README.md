# Teacher Dashboard Feature

## Quick Overview

The Teacher Dashboard provides teachers with a comprehensive overview of their classes, students, and assignments. It integrates with the backend analytics API to display real-time metrics and insights.

## Features Implemented

### 📊 Summary Metrics
- **Total Classes** - Click to view all classes with at-risk students
- **Pending Grading** - Click to see grading queue with urgency indicators
- **Total Students** - Aggregate count across all classes
- **Average Score** - Overall class performance with 24h engagement

### ✨ Resource Generation Banner
- Prominent call-to-action for AI-powered resource creation
- Links to presentation, mindmap, and assignment generators

### 📅 Enhanced Calendar
- Interactive month view with event indicators
- Color-coded events:
  - 🔴 Red: Overdue deadlines
  - 🟠 Orange: Due soon (within 2 days) or grading reminders
  - 🔵 Blue: Normal deadlines
  - 🟢 Green: Assignments returned
  - 🟣 Purple: Exams
- Click dates to view event details
- Month navigation

### 🎯 Interactive Modals

#### Pending Grading Modal
- Full list of submissions awaiting grading
- Urgency indicators based on submission age:
  - Normal (0-1 days)
  - Attention (2 days)
  - Urgent (3+ days)
- Student avatars and details
- Auto-graded scores (if available)
- Click to navigate to grading interface

#### Classes Overview Modal
- Expandable class cards
- At-risk student count per class
- Detailed at-risk student information:
  - Average scores
  - Missed and late submissions
  - Risk level (Critical, High, Medium, Low)
- Color-coded risk indicators

## File Structure

```
dashboard/
├── api/
│   ├── index.ts              # Service exports
│   ├── service.ts            # API service with all endpoints
│   └── types.ts              # TypeScript interfaces
├── components/
│   ├── ClassesOverviewModal.tsx
│   ├── EnhancedCalendar.tsx
│   ├── PendingGradingModal.tsx
│   ├── ResourceGenerationBanner.tsx
│   ├── SummaryMetrics.tsx
│   └── ... (other components)
├── hooks/
│   ├── useAtRiskStudents.ts
│   ├── useGradingQueue.ts
│   ├── useTeacherCalendar.ts
│   └── useTeacherSummary.ts
├── DashboardPage.tsx         # Main page component
├── IMPLEMENTATION.md         # Detailed implementation docs
└── README.md                 # This file
```

## Usage

### Basic Usage

The dashboard automatically loads when a teacher navigates to the root route (`/`). Students are automatically redirected to the student view.

```tsx
import { DashboardPage } from '@/features/dashboard';

// In your router
<Route path="/" element={<DashboardPage />} />
```

### Using Hooks

```tsx
import { useTeacherSummary, useGradingQueue } from '@/features/dashboard/hooks';

function MyComponent() {
  const { summary, isLoading } = useTeacherSummary();
  const { queue } = useGradingQueue();

  // Use the data...
}
```

### Using API Service

```tsx
import { useDashboardApiService } from '@/features/dashboard/api';

function MyComponent() {
  const apiService = useDashboardApiService();

  const fetchData = async () => {
    const response = await apiService.getTeacherSummary();
    console.log(response.data);
  };
}
```

## API Endpoints

All endpoints are prefixed with `/api/analytics/teacher/`:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/summary` | GET | Teacher dashboard summary metrics |
| `/grading-queue` | GET | Pending grading submissions |
| `/students/at-risk` | GET | At-risk students grouped by class |
| `/calendar` | GET | Calendar events with deadlines |
| `/classes/{classId}/performance` | GET | Detailed class performance |
| `/recent-activity` | GET | Recent submission activity |

## Data Flow

```
Backend API → DashboardService → React Query Hooks → Components → UI
```

1. **Backend API** provides analytics data (Java Spring Boot)
2. **DashboardService** wraps API calls with TypeScript types
3. **React Query Hooks** handle caching, loading, and error states
4. **Components** consume hooks and render UI
5. **UI** displays data with loading states and interactions

## Customization

### Adjusting Cache Times

In hooks files, modify `staleTime`:

```tsx
const { data } = useQuery({
  queryKey: ['teacherSummary'],
  queryFn: () => apiService.getTeacherSummary(),
  staleTime: 5 * 60 * 1000, // 5 minutes
});
```

### Changing Colors

Update the color classes in component files:

```tsx
// SummaryMetrics.tsx
<MetricCard
  bgColor="bg-blue-50 dark:bg-blue-950/30"
  iconColor="text-blue-600 dark:text-blue-400"
  // ...
/>
```

### Modifying Urgency Thresholds

In `PendingGradingModal.tsx`:

```tsx
const getUrgencyConfig = (daysSince: number) => {
  if (daysSince >= 3) return { /* urgent */ };
  if (daysSince >= 2) return { /* attention */ };
  return { /* normal */ };
};
```

## Loading States

All components include shimmer loading states (no spinners) for better UX:

```tsx
{isLoading ? (
  <ShimmerCard />
) : (
  <ActualContent />
)}
```

## Error Handling

React Query provides error states automatically:

```tsx
const { data, isLoading, isError, error } = useTeacherSummary();

if (isError) {
  return <ErrorDisplay error={error} />;
}
```

## Performance

- **React Query Caching**: Reduces API calls (1-5 min stale time)
- **useMemo**: Optimizes calendar calculations and event grouping
- **Lazy Loading**: Modals only render when opened
- **Shimmer Loaders**: Maintain layout during loading

## Accessibility

- Semantic HTML structure
- ARIA labels on icon buttons
- Keyboard navigation support in dialogs
- Focus management in modals
- Color contrast compliance

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Dependencies

Required packages:
- `@tanstack/react-query` - Data fetching
- `date-fns` - Date manipulation
- `lucide-react` - Icons
- `react-router-dom` - Navigation
- `react-i18next` - Internationalization

UI Components (shadcn/ui):
- Card, Button, Badge
- Dialog, Avatar, ScrollArea

## Troubleshooting

### Data not loading
1. Check backend API is running
2. Verify API endpoints match backend routes
3. Check browser console for errors
4. Verify authentication token is valid

### Import errors
Ensure all imports use correct paths:
- UI components: `@/shared/components/ui/...`
- Utils: `@/shared/lib/utils`
- Hooks: `../hooks/...`

### Type errors
Run TypeScript compiler to check:
```bash
pnpm tsc --noEmit
```

## Future Enhancements

See `IMPLEMENTATION.md` for detailed roadmap.

Priority items:
- [ ] Error UI components
- [ ] Activity feed
- [ ] Keyboard shortcuts
- [ ] Export functionality
- [ ] Real-time WebSocket updates

## Support

For issues or questions:
1. Check `IMPLEMENTATION.md` for detailed documentation
2. Review backend API documentation
3. Check React Query devtools for data state

---

**Version**: 1.0
**Last Updated**: 2026-02-12
