# Phase 5 Hooks - Final Design Principles

## Design Philosophy

### ✅ What Hooks SHOULD Contain

**1. Business Logic & Calculations**
```typescript
// ✅ GOOD - Actual calculation
getEnrollmentPercentage: (current: number, max: number) => {
  return max > 0 ? Math.round((current / max) * 100) : 0;
}

// ✅ GOOD - Aggregating multiple calculations
getCapacityInfo: (classData: Class) => ({
  current: classData.currentEnrollment,
  max: classData.capacity,
  available: classData.capacity - classData.currentEnrollment,
  percentage: Math.round((classData.currentEnrollment / classData.capacity) * 100)
})

// ✅ GOOD - Complex filtering/grouping logic
getObjectivesStats: (objectives: LearningObjective[]) => {
  const byType = objectives.reduce((acc, obj) => {
    acc[obj.type] = (acc[obj.type] || 0) + 1;
    return acc;
  }, {} as Record<ObjectiveType, number>);
  
  return { total: objectives.length, achieved: /* ... */, byType };
}
```

**2. UI Logic (Non-localized)**
```typescript
// ✅ GOOD - Styling/color logic based on business rules
getCapacityStatusColor: (current: number, max: number) => {
  const percentage = max > 0 ? (current / max) * 100 : 0;
  if (percentage >= 90) return 'text-red-600';
  if (percentage >= 75) return 'text-orange-600';
  return 'text-green-600';
}

// ✅ GOOD - Badge variant selection
getStatusBadgeVariant: (isActive: boolean) => {
  return isActive ? 'default' : 'secondary';
}
```

**3. Data Transformations**
```typescript
// ✅ GOOD - Transforms data structure for component use
getDurationInfo: (minutes: number) => ({
  hours: Math.floor(minutes / 60),
  minutes: minutes % 60,
  totalMinutes: minutes
})

// ✅ GOOD - Sorts/filters with business logic
sortPeriodsByTime: (periods: ClassPeriod[]) => {
  return [...periods].sort((a, b) => a.startTime.localeCompare(b.startTime));
}
```

### ❌ What Hooks SHOULD NOT Contain

**1. Pass-through Functions (Redundant)**
```typescript
// ❌ BAD - Just returns the same value
getStatusKey: (status: LessonStatus) => status;
// Component can use: lesson.status directly

// ❌ BAD - Just returns a property
formatAcademicYear: (year: string) => year;
// Component can use: classData.academicYear directly

// ❌ BAD - Simple property access
getRequiredResourcesCount: (resources) => resources.filter(r => r.isRequired).length;
// Component can do: resources.filter(r => r.isRequired).length
```

**2. Localized Strings**
```typescript
// ❌ BAD - Hardcoded English
formatStatus: (status) => status === 'planned' ? 'Planned' : 'Completed';
// Should be: t(`status.${status}`) in component

// ❌ BAD - English pluralization
formatObjectives: (objectives) => `${objectives.length} objectives`;
// Should be: t('objectivesCount', { count: objectives.length }) in component
```

**3. Simple String Concatenation**
```typescript
// ❌ BAD - Component can do this
formatLessonTitle: (lesson) => `${lesson.subject}: ${lesson.title}`;
// Component: <span>{lesson.subject}: {lesson.title}</span>

// ❌ BAD - No business logic
formatTimeRange: (start, end) => `${start} - ${end}`;
// Component: <span>{start} - {end}</span>
```

## Examples: Before & After

### useClassFormatting - Cleaned Up

**❌ Before (Redundant)**
```typescript
formatAcademicYear: (year: string) => year,  // Just returns input
formatGradeLevel: (grade: number) => `Grade ${grade}`,  // English string
```

**✅ After (Useful)**
```typescript
getCapacityInfo: (classData: Class) => ({
  current: classData.currentEnrollment,
  max: classData.capacity,
  available: classData.capacity - classData.currentEnrollment,  // Calculation
  percentage: Math.round((classData.currentEnrollment / classData.capacity) * 100)  // Business logic
}),

getCapacityStatus: (current, max): 'critical' | 'warning' | 'normal' => {
  const percentage = max > 0 ? (current / max) * 100 : 0;
  if (percentage >= 90) return 'critical';  // Business rules
  if (percentage >= 75) return 'warning';
  return 'normal';
}
```

### useScheduleFormatting - Cleaned Up

**❌ Before (Redundant)**
```typescript
formatTime: (timeStr: string) => timeStr,  // Pass-through
formatDayOfWeek: (day) => ['Monday', 'Tuesday', ...][day],  // English strings
formatTimeUntil: (min) => `${min} minutes`,  // English + pluralization
```

**✅ After (Useful)**
```typescript
getDayOfWeekKey: (dayNumber: number) => {
  const days = ['sunday', 'monday', ...];  // Keys for translation
  return days[dayNumber] || 'unknown';
},

getTimeUntilInfo: (minutes: number) => ({
  hours: Math.floor(minutes / 60),  // Calculation
  minutes: minutes % 60,
  totalMinutes: minutes
}),  // Component uses: t('timeFormat.hoursMinutes', { hours, minutes })

getPeriodStatus: (period, isToday, currentTime): 'current' | 'completed' | 'upcoming' | 'scheduled' => {
  if (!isToday) return 'scheduled';
  if (currentTime >= period.startTime && currentTime < period.endTime) return 'current';
  if (currentTime >= period.endTime) return 'completed';
  return 'upcoming';
}  // Business logic for status determination
```

### useLessonFormatting - Cleaned Up

**❌ Before (Redundant)**
```typescript
getStatusKey: (status) => status,  // Just returns input
formatObjectiveType: (type) => typeMap[type],  // English strings
formatPreparationTime: (min) => `${min} min preparation`,  // English
formatLessonTitle: (lesson) => `${lesson.subject}: ${lesson.title}`,  // Simple concat
```

**✅ After (Useful)**
```typescript
getObjectivesStats: (objectives: LearningObjective[]) => {
  const byType = objectives.reduce((acc, obj) => {  // Complex aggregation
    acc[obj.type] = (acc[obj.type] || 0) + 1;
    return acc;
  }, {} as Record<ObjectiveType, number>);
  
  return {
    total: objectives.length,
    achieved: objectives.filter(obj => obj.isAchieved).length,
    byType  // Grouped statistics
  };
},

getCompletionInfo: (lesson: Lesson) => {
  const percentage = getCompletionPercentage(lesson);  // Calculation
  return {
    percentage,
    objectives: { total: lesson.objectives.length, achieved: /* ... */ },
    resources: { total: lesson.resources.length, prepared: /* ... */ },
    isComplete: percentage === 100  // Derived boolean for conditional logic
  };
}
```

## Component Usage Examples

### ✅ Correct Pattern

```typescript
function ClassCard({ classData }: Props) {
  const { t } = useTranslation('classes');
  const { getCapacityInfo, getCapacityStatus } = useClassFormatting();
  
  const capacity = getCapacityInfo(classData);  // Get calculations from hook
  const status = getCapacityStatus(capacity.current, capacity.max);
  
  return (
    <Card>
      <div className={status === 'critical' ? 'text-red-600' : ''}>
        {/* Component decides HOW to display */}
        {t('enrollment')}: {capacity.current}/{capacity.max}
        {' '}
        ({capacity.percentage}%)
        {' - '}
        {t('detail.stats.available', { count: capacity.available })}
      </div>
    </Card>
  );
}
```

### ✅ Another Correct Pattern

```typescript
function LessonStatus({ lesson }: Props) {
  const { t } = useTranslation('classes', { keyPrefix: 'lesson' });
  const { getCompletionInfo, getStatusColor } = useLessonFormatting();
  
  const completion = getCompletionInfo(lesson);  // Get structured data
  const color = getStatusColor(lesson.status);   // Get styling logic
  
  return (
    <div>
      <Badge className={color}>
        {t(`status.${lesson.status}`)}  {/* Component handles translation */}
      </Badge>
      
      <Progress value={completion.percentage} />
      
      <div>
        {t('objectives.achieved', {
          achieved: completion.objectives.achieved,
          total: completion.objectives.total
        })}
      </div>
      
      <div>
        {t('resources.prepared', {
          prepared: completion.resources.prepared,
          total: completion.resources.total
        })}
      </div>
    </div>
  );
}
```

## Decision Tree: Should This Function Be in a Hook?

```
Does the function:
  1. Perform calculations/transformations? → ✅ YES
  2. Apply business rules/logic? → ✅ YES
  3. Aggregate/group data? → ✅ YES
  4. Determine UI behavior (colors/variants)? → ✅ YES
  5. Just return input unchanged? → ❌ NO (redundant)
  6. Return localized strings? → ❌ NO (violates i18n)
  7. Do simple string concatenation? → ❌ NO (component can do it)
  8. Just access properties? → ❌ NO (component can access directly)
```

## Summary

**Hooks = Business Logic Layer**
- Calculations, transformations, aggregations
- Business rules and conditional logic
- UI behavior logic (non-localized)
- Returns structured data

**Components = Presentation Layer**
- Uses hook data to render UI
- Applies translations with `t()`
- Decides display format
- Handles user interactions

This separation ensures:
- ✅ Proper i18n support
- ✅ Testability (pure functions)
- ✅ Reusability across features
- ✅ Maintainability
- ✅ No redundancy
