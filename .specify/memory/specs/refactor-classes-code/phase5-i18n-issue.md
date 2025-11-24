# Phase 5 Localization Issue

## Problem Identified

During Phase 5 implementation (T061-T063), the data transformation hooks were created with hardcoded English strings, violating Constitution Principle #6: "Translation keys used for all user-facing text".

## Constitution Violation

**Principle #6**: Internationalization
- ❌ Hooks contain hardcoded English: "No objectives", "minutes", "hours", "available", etc.
- ❌ Components cannot translate these strings for Vietnamese or other languages
- ❌ Violates existing i18n structure (useTranslation('classes'))

## Examples of Violations

### useClassFormatting.ts
```typescript
// ❌ WRONG - hardcoded English
formatCapacityDisplay: (classData: Class): string => {
  const available = classData.capacity - classData.currentEnrollment;
  return `${classData.currentEnrollment}/${classData.capacity} - ${available} available`;
}
```

### useScheduleFormatting.ts
```typescript
// ❌ WRONG - hardcoded English pluralization
formatTimeUntil: (minutes: number): string => {
  if (minutes < 60) {
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
  }
  // ... more hardcoded English
}
```

### useLessonFormatting.ts
```typescript
// ❌ WRONG - hardcoded English
formatObjectives: (objectives: LearningObjective[]): string => {
  if (objectives.length === 0) return 'No objectives';
  return `${objectives.length} ${objectives.length === 1 ? 'objective' : 'objectives'}`;
}
```

## Correct Approach

### Hooks Should Return:
1. **Raw numbers**: counts, percentages, durations (in minutes)
2. **Structured data**: `{ hours: 1, minutes: 30, total: 90 }`
3. **Status keys**: `'current'`, `'completed'`, `'scheduled'` (not translated)
4. **Simple calculations**: available spots, enrollment percentage

### Components Should:
1. Call hooks for calculations
2. Use `useTranslation('classes')` for display
3. Apply proper translation keys with interpolation

## Corrected Examples

### useClassFormatting.ts ✅
```typescript
// ✅ CORRECT - returns calculation only
getCapacityInfo: (classData: Class) => {
  const available = classData.capacity - classData.currentEnrollment;
  const percentage = classData.capacity > 0 
    ? Math.round((classData.currentEnrollment / classData.capacity) * 100) 
    : 0;
  
  return {
    current: classData.currentEnrollment,
    max: classData.capacity,
    available,
    percentage,
  };
}
```

### Component Usage ✅
```typescript
// In component
const { t } = useTranslation('classes');
const { getCapacityInfo } = useClassFormatting();
const capacity = getCapacityInfo(classData);

// Render with translation
<span>
  {capacity.current}/{capacity.max} - {t('detail.stats.available', { count: capacity.available })}
</span>
```

### useScheduleFormatting.ts ✅
```typescript
// ✅ CORRECT - returns structured data
getTimeUntilInfo: (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return { hours, minutes: remainingMinutes, totalMinutes: minutes };
}
```

### Component Usage ✅
```typescript
const { t } = useTranslation('classes', { keyPrefix: 'schedule.currentNext' });
const { getTimeUntilInfo } = useScheduleFormatting();
const timeInfo = getTimeUntilInfo(90);

// Use existing translation keys
<span>
  {t('timeFormat.hoursMinutes', { hours: timeInfo.hours, minutes: timeInfo.minutes })}
</span>
```

## Impact Assessment

### Files Affected:
1. `hooks/data/useClassFormatting.ts` - 5 functions need refactoring
2. `hooks/data/useScheduleFormatting.ts` - 4 functions need refactoring  
3. `hooks/data/useLessonFormatting.ts` - 8 functions need refactoring

### Tasks Status:
- T061-T063: ⚠️ NEEDS REVISION - hooks created but violate i18n
- Must fix before proceeding to T064-T067 (component refactoring)

## Recommendation

**PAUSE Phase 5 implementation and fix hooks first:**

1. Refactor all three hooks to return calculations only
2. Remove all hardcoded English strings
3. Update JSDoc comments to clarify i18n responsibility
4. Create example showing correct component usage with t()
5. Verify against existing translation keys in `locales/en/classes.ts`

## Translation Keys Reference

Existing keys in `classes.ts` that should be used:
- `detail.stats.available` - for available spots
- `detail.stats.students` - for "students" text
- `schedule.currentNext.timeFormat.minutes` - for minute formatting
- `schedule.currentNext.timeFormat.hoursMinutes` - for hours+minutes
- `lesson.creator.objectiveTypes.*` - for objective type names
- `lesson.creator.resourceTypes.*` - for resource type names

## Next Steps

1. ✅ Document issue (this file)
2. ⏳ Refactor useClassFormatting.ts
3. ⏳ Refactor useScheduleFormatting.ts  
4. ⏳ Refactor useLessonFormatting.ts
5. ⏳ Update tasks.md to reflect corrected approach
6. ⏳ Proceed with T064-T067 using corrected hooks
