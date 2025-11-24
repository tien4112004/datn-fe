# Quickstart: Working with Refactored Classes Feature

**Feature**: Classes Feature Code Refactoring  
**Date**: 2025-10-29  
**Audience**: Developers working on the classes feature

## Overview

This guide helps developers understand and work with the refactored `container/src/features/classes` directory structure. The refactoring improves maintainability by organizing code into modular services, separated type definitions, and focused components.

## Directory Structure at a Glance

```
container/src/features/classes/
├── api/                    # Data layer
│   ├── mock.ts            # Main mock API service (delegates to modules)
│   ├── rest.ts            # Future REST API implementation
│   ├── services/          # Domain-specific service modules
│   ├── filters/           # Reusable filtering & sorting utilities
│   └── data/              # Mock data organized by domain
├── components/            # UI components
├── hooks/                 # React hooks
│   ├── useClasses.ts      # Data fetching hooks
│   └── data/              # Data transformation hooks
├── pages/                 # Page-level components
├── types/                 # Type definitions
│   ├── entities/          # Domain objects
│   ├── requests/          # API contracts
│   └── constants/         # Shared constants
└── utils/                 # Utility functions
```

## Common Tasks

### Task 1: Adding a New API Endpoint

**Example**: Add a method to get class statistics

1. **Add service logic** (`api/services/classService.ts`):

```typescript
export const classService = {
  // ... existing methods
  
  getClassStatistics(classId: string, classes: Class[]): ClassStatistics {
    const targetClass = classes.find(c => c.id === classId);
    if (!targetClass) return null;
    
    return {
      totalStudents: targetClass.currentEnrollment,
      capacity: targetClass.capacity,
      utilizationRate: (targetClass.currentEnrollment / targetClass.capacity) * 100,
      // ... more statistics
    };
  },
};
```

2. **Add to main API service** (`api/mock.ts`):

```typescript
async getClassStatistics(classId: string): Promise<ClassStatistics | null> {
  await this._delay();
  return classService.getClassStatistics(classId, this.classes);
}
```

3. **Add interface** (in `types/entities/class.ts` or new file):

```typescript
export interface ClassStatistics {
  totalStudents: number;
  capacity: number;
  utilizationRate: number;
}
```

4. **Create hook** (`hooks/useClassStatistics.ts`):

```typescript
export function useClassStatistics(classId: string) {
  return useQuery({
    queryKey: ['class-statistics', classId],
    queryFn: () => classApi.getClassStatistics(classId),
  });
}
```

### Task 2: Adding a New Type

**Example**: Add a new attendance entity

1. **Create entity file** (`types/entities/attendance.ts`):

```typescript
export interface Attendance {
  id: string;
  studentId: string;
  classId: string;
  date: string;
  status: AttendanceStatus;
  note?: string;
  createdAt: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';
```

2. **Create request types** (`types/requests/attendanceRequests.ts`):

```typescript
export interface AttendanceCollectionRequest {
  classId?: string;
  studentId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface AttendanceCreateRequest {
  studentId: string;
  classId: string;
  date: string;
  status: AttendanceStatus;
  note?: string;
}
```

3. **Add to barrel exports** (`types/index.ts`):

```typescript
export * from './entities/attendance';
export * from './requests/attendanceRequests';
```

4. **Import in components**:

```typescript
import type { Attendance, AttendanceCreateRequest } from '@/features/classes/types';
// Or specific path:
import type { Attendance } from '@/features/classes/types/entities/attendance';
```

### Task 3: Refactoring a Large Component

**Example**: Split a 200-line component into sub-components

**Before**:
```typescript
// components/ClassDetailView.tsx (200+ lines)
function ClassDetailView({ classId }: Props) {
  // ... lots of state, logic, and rendering mixed together
  return (
    <div>
      {/* 150+ lines of JSX */}
    </div>
  );
}
```

**After**:

1. **Extract data logic to hook** (`hooks/data/useClassDetails.ts`):

```typescript
export function useClassDetails(classId: string) {
  const { data: classData } = useClass(classId);
  const { data: students } = useClassStudents(classId);
  const { data: schedule } = useClassSchedule(classId);
  
  const formattedData = useMemo(() => ({
    class: classData,
    studentCount: students?.length ?? 0,
    schedulePreview: formatSchedulePreview(schedule),
  }), [classData, students, schedule]);
  
  return formattedData;
}
```

2. **Create sub-components** (each <100 lines):

```typescript
// components/ClassDetailView/index.tsx
function ClassDetailView({ classId }: Props) {
  const classDetails = useClassDetails(classId);
  
  return (
    <div>
      <ClassHeader class={classDetails.class} />
      <ClassStatistics studentCount={classDetails.studentCount} />
      <ClassSchedulePreview schedule={classDetails.schedulePreview} />
      <ClassStudentList classId={classId} />
    </div>
  );
}

// components/ClassDetailView/ClassHeader.tsx
interface ClassHeaderProps {
  class: Class;
}

export function ClassHeader({ class: classData }: ClassHeaderProps) {
  return (
    <header>
      <h1>{classData.name}</h1>
      <p>{classData.description}</p>
    </header>
  );
}

// ... similar for ClassStatistics.tsx, ClassSchedulePreview.tsx, etc.
```

### Task 4: Adding Shared Utility Function

**Example**: Add a date formatting utility

1. **Add to appropriate utils file** (`utils/dateTime.ts`):

```typescript
export function formatVietnameseDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function getAcademicYearLabel(startYear: number): string {
  return `${startYear}-${startYear + 1}`;
}
```

2. **Use in components**:

```typescript
import { formatVietnameseDate } from '@/features/classes/utils/dateTime';

function ClassCard({ class: classData }: Props) {
  return (
    <div>
      <p>Created: {formatVietnameseDate(classData.createdAt)}</p>
    </div>
  );
}
```

### Task 5: Working with Subject Constants

**Example**: Get subjects for a specific grade

```typescript
import { getSubjectsByGrade, ELEMENTARY_SUBJECTS } from '@/features/classes/types/constants/subjects';

function SubjectSelector({ grade }: Props) {
  const subjects = getSubjectsByGrade(grade);
  
  return (
    <Select>
      {subjects.map(subject => (
        <option key={subject.code} value={subject.code}>
          {subject.name}
        </option>
      ))}
    </Select>
  );
}
```

## Architecture Patterns

### Service Layer Pattern

Services contain business logic and data operations. They are pure functions (no side effects, no React hooks).

```typescript
// Good: Service function
export const classService = {
  filterClasses(classes: Class[], filters: ClassFilters): Class[] {
    let filtered = [...classes];
    if (filters.grade) {
      filtered = filtered.filter(c => c.grade === filters.grade);
    }
    return filtered;
  },
};

// Bad: Service with side effects
export const classService = {
  filterClasses(classes: Class[], filters: ClassFilters): Class[] {
    console.log('Filtering classes...'); // Side effect!
    toast.success('Classes filtered'); // Side effect!
    return classes.filter(/*...*/);
  },
};
```

### Hook Pattern

Hooks handle React-specific concerns (state, effects, context). They can call services.

```typescript
// Good: Hook uses service
export function useFilteredClasses(filters: ClassFilters) {
  const { data: classes } = useClasses();
  
  return useMemo(
    () => classService.filterClasses(classes ?? [], filters),
    [classes, filters]
  );
}

// Bad: Hook contains business logic inline
export function useFilteredClasses(filters: ClassFilters) {
  const { data: classes } = useClasses();
  
  return useMemo(() => {
    // Business logic here - should be in service
    let filtered = [...(classes ?? [])];
    if (filters.grade) {
      filtered = filtered.filter(c => c.grade === filters.grade);
    }
    return filtered;
  }, [classes, filters]);
}
```

### Component Pattern

Components focus on rendering. They use hooks for data/logic, services for complex calculations.

```typescript
// Good: Component delegates to hooks
function ClassList() {
  const filters = useClassFilters();
  const classes = useFilteredClasses(filters);
  
  return (
    <div>
      {classes.map(c => <ClassCard key={c.id} class={c} />)}
    </div>
  );
}

// Bad: Component has inline logic
function ClassList() {
  const { data: classes } = useClasses();
  const [filters, setFilters] = useState({});
  
  // Logic mixed with rendering
  const filtered = classes?.filter(c => 
    (!filters.grade || c.grade === filters.grade) &&
    (!filters.search || c.name.includes(filters.search))
  ) ?? [];
  
  return (
    <div>{/* ... */}</div>
  );
}
```

## Testing Strategies

### Testing Services

Services are pure functions - easy to test without React:

```typescript
// api/services/classService.test.ts
import { classService } from './classService';

describe('classService', () => {
  describe('filterClasses', () => {
    it('filters by grade', () => {
      const classes = [
        { id: '1', grade: 1, /*...*/ },
        { id: '2', grade: 2, /*...*/ },
      ];
      
      const result = classService.filterClasses(classes, { grade: 1 });
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
    });
  });
});
```

### Testing Hooks

Use React Testing Library hooks:

```typescript
// hooks/useFilteredClasses.test.ts
import { renderHook } from '@testing-library/react';
import { useFilteredClasses } from './useFilteredClasses';

test('useFilteredClasses filters by grade', () => {
  const { result } = renderHook(() => 
    useFilteredClasses({ grade: 1 })
  );
  
  expect(result.current).toBeDefined();
  // ... assertions
});
```

### Testing Components

Use React Testing Library:

```typescript
// components/ClassCard.test.tsx
import { render, screen } from '@testing-library/react';
import { ClassCard } from './ClassCard';

test('renders class name', () => {
  const mockClass = { id: '1', name: 'Class 1A', /*...*/ };
  
  render(<ClassCard class={mockClass} />);
  
  expect(screen.getByText('Class 1A')).toBeInTheDocument();
});
```

## Code Style Guidelines

### Function Length

✅ **Good**: Under 50 lines
```typescript
export function formatClassName(grade: number, track: string): string {
  const gradeLabel = GRADE_LEVELS[grade as GradeLevel];
  return `${gradeLabel}${track}`;
}
```

❌ **Bad**: Over 50 lines - extract into smaller functions

### Naming Conventions

✅ **Good**: Descriptive names
```typescript
const filteredClasses = classes.filter(/*...*/);
const matchingStudent = students.find(/*...*/);
function formatTeacherOption(teacher: Teacher): SelectOption { /*...*/ }
```

❌ **Bad**: Generic names
```typescript
const cls = classes.filter(/*...*/);
const data = students.find(/*...*/);
function format(teacher: Teacher) { /*...*/ }
```

### Type Safety

✅ **Good**: Explicit types
```typescript
function getClassById(id: string, classes: Class[]): Class | null {
  return classes.find(c => c.id === id) ?? null;
}
```

❌ **Bad**: Using `any`
```typescript
function getClassById(id: any, classes: any): any {
  return classes.find((c: any) => c.id === id);
}
```

## Troubleshooting

### Import Errors After Refactoring

**Problem**: `Cannot find module '@/features/classes/types/class'`

**Solution**: Update import paths to new structure:
```typescript
// Old
import type { Class } from '@/features/classes/types/class';

// New (via barrel export)
import type { Class } from '@/features/classes/types';

// Or specific path
import type { Class } from '@/features/classes/types/entities/class';
```

### Circular Dependencies

**Problem**: "Circular dependency detected" warning

**Solution**: Follow dependency hierarchy:
- Types → Utilities → Services → Hooks → Components
- Use barrel exports (`types/index.ts`) to break cycles
- Move shared types to `types/entities/` if used across layers

### Type Errors After Moving Files

**Problem**: Type errors after reorganizing type files

**Solution**: 
1. Ensure all types are re-exported in `types/index.ts`
2. Run `pnpm typecheck` to catch all errors
3. Update imports systematically using IDE refactoring tools

## Next Steps

- Review [data-model.md](./data-model.md) for detailed type structure
- Review [research.md](./research.md) for refactoring patterns
- Check [plan.md](./plan.md) for overall refactoring strategy
- See constitution at `.specify/memory/constitution.md` for coding standards

## Getting Help

- Check existing tests for usage examples
- Look at similar components/hooks for patterns
- Review code comments for complex logic explanations
- Ask team for architecture decisions before major changes
