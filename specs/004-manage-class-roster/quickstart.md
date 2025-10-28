# Quickstart Guide: Manage Class Roster

**Feature**: 004-manage-class-roster  
**Date**: October 30, 2025  
**For**: Developers implementing or testing roster management functionality

## Overview

This guide helps developers quickly set up, implement, and test the class roster management feature. It covers local development setup, key implementation patterns, and testing strategies.

## Prerequisites

Before starting, ensure you have:

- ✅ **Node.js 20+ LTS** (check with `node --version`)
- ✅ **pnpm ≥ 9** (check with `pnpm --version`)
- ✅ **Git** for version control
- ✅ **VS Code** (recommended) with ESLint and Prettier extensions
- ✅ **Read access** to:
  - [spec.md](./spec.md) - Feature specification
  - [plan.md](./plan.md) - Implementation plan
  - [data-model.md](./data-model.md) - Data structures and validation
  - [contracts/student-api.yaml](./contracts/student-api.yaml) - API contracts

## Quick Setup (5 minutes)

### 1. Clone and Install Dependencies

```bash
# Navigate to project root
cd /path/to/fe

# Install all dependencies (uses pnpm workspace)
pnpm install

# Verify TypeScript compilation
pnpm typecheck

# Verify linting passes
pnpm lint
```

### 2. Start Development Servers

```bash
# Terminal 1: Start container app (React 19 + Vite)
cd container
pnpm dev
# Opens at http://localhost:5173

# Terminal 2: (Optional) Start presentation app if needed
cd presentation
pnpm dev
# Opens at http://localhost:5174
```

### 3. Verify Environment

Navigate to `http://localhost:5173` and confirm:
- ✅ App loads without errors
- ✅ Class list page is accessible
- ✅ Student roster view displays (read-only currently)

---

## Implementation Roadmap

### Phase 1: Foundation (Priority P1 - Add Student)

**Goal**: Enable teachers to add new students to rosters

**Components to Create**:
1. `container/src/features/classes/schemas/studentSchema.ts`
   - Zod validation schema for student form
   - Reference: [data-model.md - StudentFormData](./data-model.md#studentformdata-new-type)

2. `container/src/features/classes/hooks/useStudentForm.ts`
   - React Hook Form integration with Zod
   - Form state management (isDirty, isValid, errors)

3. `container/src/features/classes/hooks/useStudentMutations.ts`
   - React Query mutations (create, update, delete)
   - Optimistic updates with rollback
   - Reference: [research.md - Optimistic Updates](./research.md#4-optimistic-updates)

4. `container/src/features/classes/components/roster/StudentFormDialog.tsx`
   - Radix Dialog with form fields
   - Mode prop: 'create' | 'edit'
   - Success/error toast notifications

5. `container/src/features/classes/components/roster/StudentRosterTable.tsx`
   - Tanstack Table with student data
   - "Add Student" button in header

**API Integration**:
- Verify `POST /api/classes/{classId}/students` endpoint exists
- If mocked: Update `container/src/features/classes/api/data/mockData.ts`
- Reference: [contracts/student-api.yaml](./contracts/student-api.yaml#L75)

**Testing**:
```bash
# Run tests for this phase
cd container
pnpm test src/features/classes/roster/StudentFormDialog.test.tsx
```

**Acceptance Criteria** (User Story 1):
- [ ] "Add Student" button opens form dialog
- [ ] Form validates required fields (firstName, lastName, studentCode, email)
- [ ] Form validates email format
- [ ] Form checks duplicate student IDs
- [ ] Success toast appears after adding student
- [ ] New student appears in roster table immediately
- [ ] Form resets after successful submission

---

### Phase 2: Edit Functionality (Priority P2 - Edit Student)

**Goal**: Enable teachers to modify existing student information

**Components to Create/Modify**:
1. Add "Edit" action to `StudentRosterTable`
   - Action column with Edit button per row
   - Click opens `StudentFormDialog` with mode='edit'

2. Update `StudentFormDialog` to support pre-filling
   - Accept `initialData` prop (optional)
   - Pre-fill form when `mode='edit'`
   - Change dialog title and button text based on mode

3. Update `useStudentMutations` hook
   - Add `updateStudent` mutation
   - Handle optimistic updates for edit operations

**API Integration**:
- Verify `PUT /api/students/{studentId}` endpoint exists
- Reference: [contracts/student-api.yaml](./contracts/student-api.yaml#L274)

**Testing**:
```bash
# Run edit flow tests
cd container
pnpm test src/features/classes/roster/StudentFormDialog.test.tsx -t "edit mode"
```

**Acceptance Criteria** (User Story 2):
- [ ] Edit button appears for each student in roster
- [ ] Clicking Edit opens form pre-filled with student data
- [ ] Form validates changes (including duplicate check if studentCode changed)
- [ ] Success toast appears after saving
- [ ] Updated data reflects in roster table immediately
- [ ] Dialog closes after successful update

---

### Phase 3: Delete Functionality (Priority P3 - Remove Student)

**Goal**: Enable teachers to remove students from rosters

**Components to Create**:
1. `container/src/shared/hooks/useConfirmDialog.ts`
   - Reusable confirmation dialog hook
   - Manages open/close state and pending action
   - Reference: [research.md - Confirmation Dialog Pattern](./research.md#6-confirmation-dialog-pattern)

2. `container/src/features/classes/components/roster/StudentDeleteConfirmation.tsx`
   - Radix AlertDialog component
   - Displays student name in confirmation message
   - Confirm/Cancel buttons

3. Add "Delete" action to `StudentRosterTable`
   - Delete button per row
   - Triggers confirmation dialog

4. Update `useStudentMutations` hook
   - Add `deleteStudent` mutation
   - Handle optimistic removal from cache

**API Integration**:
- Verify `DELETE /api/students/{studentId}` endpoint exists
- Reference: [contracts/student-api.yaml](./contracts/student-api.yaml#L368)

**Testing**:
```bash
# Run delete flow tests
cd container
pnpm test src/features/classes/roster/StudentDeleteConfirmation.test.tsx
```

**Acceptance Criteria** (User Story 3):
- [ ] Delete button appears for each student
- [ ] Clicking Delete opens confirmation dialog
- [ ] Dialog shows student's full name
- [ ] Cancel button dismisses dialog without action
- [ ] Confirm button removes student from roster
- [ ] Success toast appears after deletion
- [ ] Student disappears from table immediately

---

## Key Implementation Patterns

### 1. Form Validation with Zod + React Hook Form

```typescript
// schemas/studentSchema.ts
import { z } from 'zod';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const studentFormSchema = z.object({
  firstName: z.string().min(1, 'roster.validation.firstNameRequired'),
  lastName: z.string().min(1, 'roster.validation.lastNameRequired'),
  studentCode: z.string().min(1, 'roster.validation.studentCodeRequired'),
  email: z.string().regex(emailRegex, 'roster.validation.emailInvalid'),
  // ... other fields
});

export type StudentFormData = z.infer<typeof studentFormSchema>;

// hooks/useStudentForm.ts
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export const useStudentForm = (mode: 'create' | 'edit', initialData?: Student) => {
  const form = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: mode === 'edit' ? transformStudentToFormData(initialData) : {},
  });

  return form;
};
```

### 2. Optimistic Mutations with React Query

```typescript
// hooks/useStudentMutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useStudentMutations = (classId: string) => {
  const queryClient = useQueryClient();

  const createStudent = useMutation({
    mutationFn: (data: StudentCreateRequest) => api.students.create(data),
    
    onMutate: async (newStudent) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries(['students', classId]);
      
      // Snapshot previous value
      const previous = queryClient.getQueryData(['students', classId]);
      
      // Optimistically update cache
      queryClient.setQueryData(['students', classId], (old: Student[]) => [
        ...old,
        { ...newStudent, id: `temp-${Date.now()}` }
      ]);
      
      return { previous };
    },
    
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(['students', classId], context?.previous);
      toast.error(t('roster.errors.createFailed'));
    },
    
    onSuccess: () => {
      toast.success(t('roster.messages.studentAdded'));
      queryClient.invalidateQueries(['students', classId]);
    },
  });

  return { createStudent };
};
```

### 3. Form Dialog with Mode Prop

```typescript
// components/roster/StudentFormDialog.tsx
interface StudentFormDialogProps {
  mode: 'create' | 'edit';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  initialData?: Student;
}

export const StudentFormDialog = ({ mode, open, classId, initialData }: StudentFormDialogProps) => {
  const { t } = useTranslation();
  const form = useStudentForm(mode, initialData);
  const { createStudent, updateStudent } = useStudentMutations(classId);

  const onSubmit = (data: StudentFormData) => {
    if (mode === 'create') {
      createStudent.mutate(transformFormDataToCreateRequest(data, classId));
    } else {
      updateStudent.mutate(transformFormDataToUpdateRequest(data, initialData!.id));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {mode === 'create' ? t('roster.actions.addStudent') : t('roster.actions.editStudent')}
          </DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            {/* Form fields */}
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {mode === 'create' ? t('roster.actions.add') : t('roster.actions.save')}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
```

### 4. Duplicate Validation (Client-Side)

```typescript
// Extend schema with async validation
export const createStudentFormSchema = (classId: string, existingStudents: Student[], currentStudentId?: string) => {
  return studentFormSchema.extend({
    studentCode: studentFormSchema.shape.studentCode.refine(
      async (code) => {
        // Skip check if editing current student with same code
        if (currentStudentId) {
          const current = existingStudents.find(s => s.id === currentStudentId);
          if (current?.studentCode === code) return true;
        }

        // Check against local cache
        return !existingStudents.some(
          s => s.studentCode === code && s.id !== currentStudentId
        );
      },
      'roster.validation.duplicateStudentCode'
    ),
  });
};
```

---

## Testing Strategy

### Unit Tests

Test individual components and hooks in isolation:

```bash
# Test validation schemas
pnpm test schemas/studentSchema.test.ts

# Test form hook
pnpm test hooks/useStudentForm.test.ts

# Test mutations hook
pnpm test hooks/useStudentMutations.test.ts
```

**Example Test** (`StudentFormDialog.test.tsx`):
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StudentFormDialog } from './StudentFormDialog';

describe('StudentFormDialog', () => {
  it('validates required fields on submit', async () => {
    const user = userEvent.setup();
    render(
      <StudentFormDialog mode="create" open={true} classId="class-1" />
    );

    // Click submit without filling fields
    await user.click(screen.getByRole('button', { name: /add/i }));

    // Expect validation errors
    await waitFor(() => {
      expect(screen.getByText(/first name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('submits valid form data', async () => {
    const user = userEvent.setup();
    const mockMutate = vi.fn();
    
    render(
      <StudentFormDialog mode="create" open={true} classId="class-1" />
    );

    // Fill form
    await user.type(screen.getByLabelText(/first name/i), 'John');
    await user.type(screen.getByLabelText(/last name/i), 'Doe');
    await user.type(screen.getByLabelText(/student id/i), 'STU001');
    await user.type(screen.getByLabelText(/email/i), 'john@example.com');

    // Submit
    await user.click(screen.getByRole('button', { name: /add/i }));

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          firstName: 'John',
          lastName: 'Doe',
          studentCode: 'STU001',
          email: 'john@example.com',
        })
      );
    });
  });
});
```

### Integration Tests

Test complete user flows:

```bash
# Run integration tests
pnpm test integration/roster-management.test.tsx
```

### Manual Testing Checklist

**Add Student Flow**:
- [ ] Navigate to class roster page
- [ ] Click "Add Student" button
- [ ] Leave all fields empty and click "Add" → See validation errors
- [ ] Fill only firstName → See errors for other required fields
- [ ] Enter invalid email (e.g., "notanemail") → See email format error
- [ ] Enter duplicate student code → See duplicate error
- [ ] Fill all required fields correctly → Student added, toast shown, dialog closes
- [ ] Verify new student appears in table
- [ ] Refresh page → Student still present (persisted)

**Edit Student Flow**:
- [ ] Click "Edit" on existing student
- [ ] Verify form pre-filled with current data
- [ ] Change email to invalid format → See validation error
- [ ] Change studentCode to existing code → See duplicate error
- [ ] Update firstName and email with valid values → Click "Save"
- [ ] Verify toast shown and dialog closes
- [ ] Verify changes reflected in table
- [ ] Refresh page → Changes persisted

**Delete Student Flow**:
- [ ] Click "Delete" on student
- [ ] Verify confirmation dialog shows student's full name
- [ ] Click "Cancel" → Dialog closes, student still in table
- [ ] Click "Delete" again, then "Confirm" → Student removed, toast shown
- [ ] Verify student no longer in table
- [ ] Refresh page → Student still removed

---

## Debugging Tips

### Common Issues

**1. Form validation not working**
```typescript
// Check: Is zodResolver properly imported and passed to useForm?
import { zodResolver } from '@hookform/resolvers/zod';

const form = useForm({
  resolver: zodResolver(studentFormSchema), // ← Must be present
});
```

**2. Optimistic update doesn't rollback on error**
```typescript
// Check: Does onError handler call setQueryData with context.previous?
onError: (err, variables, context) => {
  queryClient.setQueryData(['students', classId], context?.previous); // ← Must restore
}
```

**3. Duplicate student ID not caught**
```typescript
// Check: Are you using the extended schema with refine()?
const schema = createStudentFormSchema(classId, existingStudents, currentStudentId);
```

**4. Dialog doesn't close after success**
```typescript
// Check: Is onSuccess calling onOpenChange(false)?
onSuccess: () => {
  toast.success('...');
  onOpenChange(false); // ← Must close dialog
}
```

### Development Tools

**React Query Devtools**:
```typescript
// Already installed - add to App.tsx if not present
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<ReactQueryDevtools initialIsOpen={false} />
```

**Browser DevTools**:
- Network tab: Monitor API requests/responses
- Console: Check for validation errors or React warnings
- React DevTools: Inspect component props and state

---

## Performance Optimization

### Best Practices

1. **Debounce async validation**:
```typescript
// Don't validate on every keystroke
studentCode: z.string().refine(
  debounce(async (code) => checkUnique(code), 500), // ← 500ms debounce
  'Duplicate code'
)
```

2. **Memoize expensive computations**:
```typescript
const transformedData = useMemo(
  () => students.map(transformStudent),
  [students]
);
```

3. **Use React.memo for table rows**:
```typescript
const StudentRow = React.memo(({ student }: { student: Student }) => {
  // Row rendering logic
});
```

4. **Limit React Query cache size**:
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: 5 * 60 * 1000, // 5 minutes
      staleTime: 30 * 1000,     // 30 seconds
    },
  },
});
```

---

## Internationalization (i18n)

### Translation Files

Create translation keys in:
- `container/src/features/classes/locales/en/roster.json`
- `container/src/features/classes/locales/vi/roster.json` (if needed)

**Example** (`roster.json`):
```json
{
  "roster": {
    "title": "Class Roster",
    "actions": {
      "addStudent": "Add Student",
      "editStudent": "Edit Student",
      "deleteStudent": "Delete Student",
      "add": "Add",
      "save": "Save",
      "cancel": "Cancel"
    },
    "form": {
      "firstName": "First Name",
      "lastName": "Last Name",
      "studentCode": "Student ID",
      "email": "Email Address",
      "phone": "Phone Number",
      "dateOfBirth": "Date of Birth",
      "gender": "Gender"
    },
    "validation": {
      "firstNameRequired": "First name is required",
      "lastNameRequired": "Last name is required",
      "studentCodeRequired": "Student ID is required",
      "emailRequired": "Email is required",
      "emailInvalid": "Please enter a valid email address",
      "duplicateStudentCode": "This student ID already exists in the roster"
    },
    "messages": {
      "studentAdded": "Student added successfully",
      "studentUpdated": "Student updated successfully",
      "studentDeleted": "Student removed from roster"
    },
    "errors": {
      "createFailed": "Failed to add student. Please try again.",
      "updateFailed": "Failed to update student. Please try again.",
      "deleteFailed": "Failed to remove student. Please try again.",
      "permissionDenied": "You don't have permission to modify this roster",
      "networkError": "Network error. Please check your connection."
    },
    "confirmDelete": {
      "title": "Remove Student",
      "message": "Are you sure you want to remove {{studentName}} from the class?",
      "confirm": "Yes, remove student",
      "cancel": "Cancel"
    }
  }
}
```

### Using Translations

```typescript
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();

// In JSX
<DialogTitle>{t('roster.actions.addStudent')}</DialogTitle>

// With interpolation
<p>{t('roster.confirmDelete.message', { studentName: student.fullName })}</p>

// In validation schemas
z.string().min(1, 'roster.validation.firstNameRequired')
```

---

## API Mocking (Development)

If backend endpoints aren't ready, mock them:

```typescript
// container/src/features/classes/api/data/mockData.ts
export const mockStudents: Student[] = [
  {
    id: '1',
    studentCode: 'STU001',
    firstName: 'John',
    lastName: 'Doe',
    fullName: 'John Doe',
    email: 'john.doe@example.com',
    classId: 'class-1',
    status: 'active',
    enrollmentDate: '2025-09-01T00:00:00Z',
    createdAt: '2025-09-01T10:00:00Z',
    updatedAt: '2025-09-01T10:00:00Z',
  },
  // ... more students
];

// container/src/features/classes/api/service.ts
export const studentsApi = {
  getAll: async (classId: string): Promise<Student[]> => {
    // Return mock data in development
    return mockStudents.filter(s => s.classId === classId);
  },
  
  create: async (data: StudentCreateRequest): Promise<Student> => {
    const newStudent = {
      ...data,
      id: `temp-${Date.now()}`,
      fullName: `${data.firstName} ${data.lastName}`,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockStudents.push(newStudent);
    return newStudent;
  },
  
  // ... update, delete methods
};
```

---

## Useful Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm preview          # Preview production build

# Quality Checks
pnpm typecheck        # TypeScript compilation
pnpm lint             # ESLint check
pnpm lint --fix       # Auto-fix linting issues
pnpm format           # Prettier formatting

# Testing
pnpm test             # Run all tests
pnpm test --watch     # Watch mode
pnpm test:ui          # Visual test UI
pnpm test --coverage  # Coverage report

# Specific feature tests
pnpm test src/features/classes/roster  # Test roster feature only
```

---

## Next Steps

After completing implementation:

1. **Run full test suite**:
   ```bash
   pnpm test:run && pnpm typecheck && pnpm lint
   ```

2. **Manual QA**: Complete the manual testing checklist above

3. **Create PR**: Follow conventional commit format
   ```bash
   git commit -m "feat(roster): add student CRUD operations"
   ```

4. **Update documentation**: Add any learnings or gotchas to this guide

---

## Resources

- **Internal Docs**:
  - [Feature Spec](./spec.md)
  - [Implementation Plan](./plan.md)
  - [Data Model](./data-model.md)
  - [API Contracts](./contracts/student-api.yaml)
  - [Research Findings](./research.md)

- **External Docs**:
  - [React Hook Form](https://react-hook-form.com/)
  - [Zod](https://zod.dev/)
  - [React Query](https://tanstack.com/query/latest)
  - [Radix UI](https://www.radix-ui.com/primitives)
  - [Tailwind CSS](https://tailwindcss.com/)

---

**Status**: ✅ Quickstart complete - Ready for implementation

**Questions?** Refer to [research.md](./research.md) for architectural decisions or create a new issue.
