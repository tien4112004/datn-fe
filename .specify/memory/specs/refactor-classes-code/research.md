# Research: Classes Feature Refactoring Strategy

**Feature**: Classes Feature Code Refactoring  
**Date**: 2025-10-29  
**Status**: Complete

## Overview

This document consolidates research findings for refactoring the `container/src/features/classes` directory to improve maintainability while preserving all existing behavior.

## Research Areas

### 1. Large Service Class Refactoring (800+ lines)

**Decision**: Extract service methods into domain-specific service modules (classService, studentService, scheduleService, lessonService) with shared filtering/sorting utilities.

**Rationale**:
- Current `ClassMockApiService` violates single responsibility principle with mixed concerns (CRUD, filtering, sorting, mock data initialization)
- Service layer pattern enables testing individual operations without entire API service
- Shared filtering/sorting utilities eliminate code duplication across methods
- Maintains ClassApiService interface contract (no breaking changes)

**Pattern**:
```typescript
// Before: Monolithic service
class ClassMockApiService {
  async getClasses(request) { /* 50+ lines with filtering, sorting, pagination */ }
  async getStudents(request) { /* 50+ lines with similar filtering, sorting */ }
  // ... 10+ more methods
}

// After: Modular services
class ClassMockApiService {
  async getClasses(request) {
    const filtered = classService.filterClasses(this.classes, request);
    const sorted = collectionFilters.sort(filtered, request.sort);
    return collectionFilters.paginate(sorted, request);
  }
  async getStudents(request) {
    const filtered = studentService.filterStudents(this.students, request);
    const sorted = collectionFilters.sort(filtered, request.sort);
    return collectionFilters.paginate(sorted, request);
  }
}

// api/services/classService.ts
export const classService = {
  filterClasses(classes, filters) { /* focused logic */ },
  createClass(data) { /* focused logic */ },
  updateClass(id, data) { /* focused logic */ },
};

// api/filters/collectionFilters.ts
export const collectionFilters = {
  sort<T>(items: T[], sortSpec: string) { /* generic sorting */ },
  paginate<T>(items: T[], page, limit) { /* generic pagination */ },
};
```

**Alternatives Considered**:
- **Repository pattern**: Rejected - Adds unnecessary abstraction for mock data
- **Class-based services**: Rejected - Functions are simpler for stateless operations
- **Leave as-is**: Rejected - Violates 50-line function limit and maintainability goals

### 2. Type Definition Organization

**Decision**: Organize types into three categories: entities (domain objects), requests (API contracts), and constants (shared enums/configs).

**Rationale**:
- Current structure mixes entity definitions, API request types, and constants in same files
- Domain-driven separation improves discoverability and reduces coupling
- Consolidating duplicated constants (subjects, grades) into single source of truth prevents inconsistencies
- Barrel exports (`types/index.ts`) maintain backward compatibility

**Pattern**:
```typescript
// Before: Mixed concerns
// types/schedule.ts contains:
// - ClassPeriod interface
// - DailySchedule interface  
// - ScheduleCollectionRequest interface
// - VIETNAMESE_SUBJECTS constants
// - Day/period constants

// After: Separated by purpose
// types/entities/schedule.ts - Domain objects
export interface ClassPeriod { /*...*/ }
export interface DailySchedule { /*...*/ }

// types/requests/scheduleRequests.ts - API contracts
export interface ScheduleCollectionRequest { /*...*/ }
export interface ClassPeriodCreateRequest { /*...*/ }

// types/constants/subjects.ts - Shared constants
export const VIETNAMESE_SUBJECTS = { /*...*/ };
export const ELEMENTARY_SUBJECTS = { /*...*/ };

// types/index.ts - Backward compatibility
export * from './entities/schedule';
export * from './requests/scheduleRequests';
export * from './constants/subjects';
```

**Alternatives Considered**:
- **Single types file**: Rejected - Would exceed 500 lines, poor discoverability
- **Feature-based grouping**: Rejected - Less clear for shared types (subjects used in schedule, lesson, class)
- **Keep current structure**: Rejected - Duplication and mixing of concerns hinder maintenance

### 3. Component Complexity Reduction

**Decision**: Extract data transformation logic into custom hooks, split large components (>200 lines) into sub-components with clear responsibilities.

**Rationale**:
- Hooks pattern (already used in project) enables logic reuse and testing without UI
- Sub-components with props interfaces create clear contracts and improve testability
- Separation of concerns: components render, hooks manage data/side effects
- Smaller components are easier to understand, modify, and test

**Pattern**:
```typescript
// Before: Mixed concerns (200+ lines)
function LessonCreator() {
  // Data fetching
  const { data: teachers } = useQuery(/*...*/);
  // Data transformation
  const formattedTeachers = teachers?.map(t => ({ /*...*/ }));
  // Form state
  const [objectives, setObjectives] = useState([]);
  // Form logic
  const handleAddObjective = () => { /*...*/ };
  // Rendering
  return (
    <div>
      {/* 150+ lines of JSX with objectives, resources, timing sections */}
    </div>
  );
}

// After: Separated concerns
function LessonCreator() {
  const { formattedTeachers, formattedSubjects } = useLessonFormatting();
  const lessonForm = useLessonForm();
  
  return (
    <div>
      <ObjectivesSection 
        objectives={lessonForm.objectives}
        onAdd={lessonForm.addObjective}
        onRemove={lessonForm.removeObjective}
      />
      <ResourcesSection 
        resources={lessonForm.resources}
        onAdd={lessonForm.addResource}
      />
      <TimingSection
        startTime={lessonForm.startTime}
        duration={lessonForm.duration}
        onChange={lessonForm.updateTiming}
      />
    </div>
  );
}

// hooks/data/useLessonFormatting.ts
export function useLessonFormatting() {
  const { data: teachers } = useQuery(/*...*/);
  const formattedTeachers = useMemo(
    () => teachers?.map(formatTeacherOption),
    [teachers]
  );
  return { formattedTeachers, /*...*/ };
}

// components/lesson/LessonCreator/ObjectivesSection.tsx
interface ObjectivesSectionProps {
  objectives: LearningObjective[];
  onAdd: (objective: LearningObjective) => void;
  onRemove: (id: string) => void;
}

export function ObjectivesSection({ objectives, onAdd, onRemove }: ObjectivesSectionProps) {
  // Focused on objectives UI only
}
```

**Alternatives Considered**:
- **Render props**: Rejected - Hooks are more idiomatic in modern React
- **HOCs**: Rejected - Hooks provide better type inference and composability
- **Keep monolithic**: Rejected - Violates single responsibility and 50-line function limit

### 4. Naming Convention Improvements

**Decision**: Apply consistent naming: descriptive variables (no `cls`, `data`, `temp`), action verbs for functions (`formatTeacherOption` not `format`), specific contexts (`classFilters` not `filters`).

**Rationale**:
- Constitution mandates descriptive naming for maintainability
- Generic names require reading implementation to understand purpose
- Consistent patterns reduce cognitive load and improve code search

**Pattern**:
```typescript
// Before: Generic names
function format(data) { /*...*/ }
const cls = classes.find(/*...*/);
let temp = [];

// After: Descriptive names
function formatTeacherOption(teacher: Teacher): SelectOption { /*...*/ }
const matchingClass = classes.find(/*...*/);
const filteredClasses: Class[] = [];
```

**Alternatives Considered**:
- **Hungarian notation**: Rejected - TypeScript provides type information
- **Abbreviated names**: Rejected - Verbosity acceptable with autocomplete
- **Keep current**: Rejected - Violates constitution maintainability principle

### 5. Mock Data Organization

**Decision**: Split 1400-line `mockData.ts` into domain-specific data files (classData, studentData, scheduleData, lessonData) with shared initialization in main file.

**Rationale**:
- Monolithic file is difficult to navigate and modify
- Domain separation enables parallel development (modify student data without touching class data)
- Smaller files reduce merge conflicts and improve git diff clarity

**Pattern**:
```typescript
// api/data/mockData.ts - Entry point
export { mockClasses, initializeMockClasses } from './classData';
export { mockStudents } from './studentData';
export { mockTeachers } from './teacherData';
export { initializeMockClassPeriods } from './scheduleData';

// api/data/classData.ts - ~300 lines
export const mockClasses: Class[] = [/*...*/];
export function initializeMockClasses(teachers, students) { /*...*/ }

// api/data/scheduleData.ts - ~400 lines
export function initializeMockClassPeriods(teachers) { /*...*/ }
const class1ASchedule = [/*...*/];
const class2ASchedule = [/*...*/];
```

**Alternatives Considered**:
- **JSON files**: Rejected - TypeScript provides type safety and allows functions
- **Database**: Rejected - Out of scope, mock data serves development needs
- **Single file**: Rejected - Exceeds file length guidelines, poor maintainability

## Refactoring Approach

### Phase Sequence

1. **API Services** (P1): Extract from monolithic mock service first - foundation for everything else
2. **Type Organization** (P2): Restructure types after services stable - types used throughout codebase
3. **Components** (P3): Simplify components using new organized types and services
4. **Naming** (P4): Polish pass after structure is correct

### Behavior Preservation Strategy

- Run existing test suite after each extraction
- Use git commits for each logical refactoring step (enables easy rollback)
- Validate TypeScript compilation after each change
- Manual smoke testing of UI after each phase

### Risk Mitigation

**Risk**: Circular dependencies between extracted modules  
**Mitigation**: Establish clear dependency hierarchy (types → utilities → services → hooks → components)

**Risk**: Breaking i18n during component splitting  
**Mitigation**: Preserve all translation key usage, validate no hardcoded strings introduced

**Risk**: Performance regression from additional module boundaries  
**Mitigation**: Vite tree-shaking handles this; measure bundle size before/after

## Implementation Priorities

1. **Must Have** (blocking release):
   - API service modularization (P1)
   - Type organization (P2)
   - All tests passing unchanged
   - Zero TypeScript errors

2. **Should Have** (improves maintainability):
   - Component simplification (P3)
   - Hook extraction for data logic
   - Mock data file splitting

3. **Nice to Have** (polish):
   - Naming convention cleanup (P4)
   - Inline documentation for complex logic
   - Utility function consolidation

## Success Validation

✅ All functions <50 lines (automated via ESLint rule)  
✅ Code duplication <40% of original (measured by code analysis tool)  
✅ 100% TypeScript type coverage (0 `any` types)  
✅ All existing tests pass unchanged  
✅ `pnpm build && pnpm typecheck && pnpm lint` succeeds  
✅ Manual UI testing confirms no behavior changes  

## Conclusion

The research establishes a clear refactoring strategy: modularize the API service, organize types by domain, extract component logic into hooks, split large components, and improve naming. This approach preserves all behavior while enforcing constitution principles for maintainability. Phased execution minimizes risk and enables incremental validation.
