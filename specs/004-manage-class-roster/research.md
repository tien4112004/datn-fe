# Research: Manage Class Roster

**Feature**: 004-manage-class-roster  
**Date**: October 30, 2025  
**Purpose**: Research technical approaches, validation patterns, and architecture decisions for roster management

## Overview

This document consolidates research findings for implementing CRUD operations on class rosters. The feature extends existing class management functionality with form-based student management, requiring decisions on form state, validation strategies, optimistic updates, and error handling patterns.

## Research Questions & Findings

### 1. Form State Management

**Question**: What approach should we use for complex form state with validation?

**Decision**: React Hook Form 7.61.1

**Rationale**:
- Already installed in project (`package.json` confirms version 7.61.1)
- Excellent TypeScript support with typed form data
- Minimal re-renders (uncontrolled components by default)
- Built-in validation lifecycle (onBlur, onChange, onSubmit)
- Seamless integration with Zod via `@hookform/resolvers`
- Handles dirty state tracking for unsaved changes warning
- Well-documented and widely adopted (industry standard)

**Alternatives Considered**:
- **Formik**: More boilerplate, controlled components cause more re-renders, less TypeScript-friendly
- **React state + manual validation**: Too much boilerplate, error-prone, doesn't scale with form complexity
- **Uncontrolled forms (vanilla)**: No validation support, poor UX for inline validation

**Implementation Pattern**:
```typescript
const form = useForm<StudentFormData>({
  resolver: zodResolver(studentFormSchema),
  defaultValues: mode === 'edit' ? initialData : defaultStudentValues,
});
```

---

### 2. Validation Strategy

**Question**: How do we validate form data client-side before API calls?

**Decision**: Zod 4.0.10 with custom validators

**Rationale**:
- Already installed (version 4.0.10 in `package.json`)
- Runtime validation + TypeScript type inference (type safety at compile and runtime)
- Declarative schema definition (readable, maintainable)
- Integrates with React Hook Form via `@hookform/resolvers/zod`
- Custom validators for domain-specific rules (duplicate student ID, email format)
- Error messages are localizable via i18next

**Validation Requirements** (from spec):
- **FR-002**: All required fields present (firstName, lastName, studentCode, email)
- **FR-003**: Email format validation (regex pattern)
- **FR-004**: Unique student ID within roster (custom async validator)

**Schema Design**:
```typescript
const studentFormSchema = z.object({
  firstName: z.string().min(1, 'roster.validation.firstNameRequired'),
  lastName: z.string().min(1, 'roster.validation.lastNameRequired'),
  studentCode: z.string()
    .min(1, 'roster.validation.studentCodeRequired')
    .refine(async (code) => {
      // Check uniqueness against roster cache or API
      return await checkStudentCodeUnique(code, classId);
    }, 'roster.validation.duplicateStudentCode'),
  email: z.string()
    .min(1, 'roster.validation.emailRequired')
    .email('roster.validation.emailInvalid'),
  // ... optional fields
});
```

**Alternatives Considered**:
- **Yup**: Less TypeScript-friendly, larger bundle size, no runtime type inference
- **Manual validation functions**: Boilerplate-heavy, error-prone, no type safety
- **Backend-only validation**: Poor UX (no instant feedback), unnecessary API calls for invalid data

---

### 3. Duplicate Student ID Validation

**Question**: How do we check for duplicate student IDs (FR-004) without excessive API calls?

**Decision**: Two-tier validation approach

**Rationale**:
- **Client-side first**: Check against React Query cache of current roster
  - Instant feedback (no API call needed)
  - Works for most cases (student already visible in table)
  - Zod `.refine()` can access cache synchronously
- **Server-side fallback**: Backend validates uniqueness across all classes
  - Catches edge cases (concurrent edits, stale cache)
  - Returns 409 Conflict with error message
  - Form displays server error under studentCode field

**Implementation Flow**:
1. User enters student code in form
2. On blur: Zod runs `refine()` validator
3. Validator checks `queryClient.getQueryData(['students', classId])`
4. If duplicate found: Show error immediately
5. If not found locally: Allow submission
6. On submit: Backend validates again
7. If server returns 409: Display error from response

**Edge Cases Handled**:
- User edits their own student code (exclude current student from duplicate check)
- Multiple tabs/users editing simultaneously (server validation catches conflicts)
- Network latency (client-side check provides instant feedback while server processes)

**Alternatives Considered**:
- **Debounced API call on every keystroke**: Excessive load, poor UX during network delays
- **Server-only validation**: Poor UX (user waits for submit to see error)
- **Local storage caching**: Stale data risk, no multi-user sync

---

### 4. Optimistic Updates

**Question**: How do we provide immediate feedback (SC-006: 2 second update)?

**Decision**: React Query optimistic mutations with rollback

**Rationale**:
- React Query 5.83.0 already installed and used in project
- Built-in optimistic update support via `onMutate`
- Automatic rollback on error
- Cache invalidation triggers refetch for consistency
- Meets SC-006 requirement (update within 2 seconds - actually immediate)

**Mutation Pattern**:
```typescript
const { mutate: createStudent } = useMutation({
  mutationFn: (data: StudentCreateRequest) => api.students.create(data),
  onMutate: async (newStudent) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries(['students', classId]);
    
    // Snapshot previous value
    const previous = queryClient.getQueryData(['students', classId]);
    
    // Optimistically update cache
    queryClient.setQueryData(['students', classId], (old) => 
      [...old, { ...newStudent, id: 'temp-' + Date.now() }]
    );
    
    return { previous };
  },
  onError: (err, newStudent, context) => {
    // Rollback on error
    queryClient.setQueryData(['students', classId], context.previous);
    toast.error(t('roster.errors.createFailed'));
  },
  onSuccess: () => {
    toast.success(t('roster.messages.studentAdded'));
    queryClient.invalidateQueries(['students', classId]);
  },
});
```

**Alternatives Considered**:
- **No optimistic updates**: Poor UX (user waits for API before seeing changes)
- **Pessimistic updates only**: Doesn't meet SC-006 requirement
- **Manual state management**: More complex, error-prone, reinventing React Query

---

### 5. Dialog Management

**Question**: Should we use a single dialog for add/edit or separate components?

**Decision**: Single `StudentFormDialog` component with mode prop

**Rationale**:
- Reduces code duplication (form fields are identical for add/edit)
- Single source of truth for validation logic
- Mode prop controls behavior: `mode: 'create' | 'edit'`
- Conditional logic for:
  - Dialog title: "Add Student" vs "Edit Student"
  - Submit button text: "Add" vs "Save"
  - Default values: empty vs pre-filled from `initialData`
- Easier to maintain (changes to form affect both modes)

**Component Signature**:
```typescript
interface StudentFormDialogProps {
  mode: 'create' | 'edit';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classId: string;
  initialData?: Student; // Required when mode='edit'
  onSuccess?: () => void;
}
```

**Alternatives Considered**:
- **Separate AddStudentDialog + EditStudentDialog**: Code duplication, harder to maintain
- **Inline forms (no dialog)**: Poor UX (clutters roster table), harder to focus user attention
- **Modal with router state**: Unnecessary complexity, breaks with browser back button

---

### 6. Confirmation Dialog Pattern

**Question**: How do we implement the delete confirmation (FR-008)?

**Decision**: Radix AlertDialog with custom hook

**Rationale**:
- Radix AlertDialog is already installed and provides accessible modal
- AlertDialog vs Dialog: AlertDialog forces user acknowledgment (can't dismiss by clicking outside)
- Custom `useConfirmDialog` hook encapsulates open/close logic
- Reusable for other confirmation scenarios (transfer student, archive class, etc.)

**Component Structure**:
```typescript
// Shared hook
export const useConfirmDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  
  const confirm = (action: () => void) => {
    setPendingAction(() => action);
    setIsOpen(true);
  };
  
  const handleConfirm = () => {
    pendingAction?.();
    setIsOpen(false);
    setPendingAction(null);
  };
  
  return { isOpen, confirm, handleConfirm, handleCancel: () => setIsOpen(false) };
};

// Usage in component
const deleteDialog = useConfirmDialog();

<Button onClick={() => deleteDialog.confirm(() => deleteStudent(student.id))}>
  Delete
</Button>

<StudentDeleteConfirmation 
  open={deleteDialog.isOpen}
  studentName={student.fullName}
  onConfirm={deleteDialog.handleConfirm}
  onCancel={deleteDialog.handleCancel}
/>
```

**Alternatives Considered**:
- **window.confirm()**: Not customizable, breaks UI consistency, poor UX
- **Inline confirmation**: Clutters UI, harder to implement accessibility
- **Toast with undo**: Doesn't meet FR-008 (requires explicit confirmation before deletion)

---

### 7. Internationalization

**Question**: How do we support multiple languages for form labels and errors?

**Decision**: i18next 25.3.2 with namespace-based translations

**Rationale**:
- i18next already configured in project (`i18next 25.3.2`, `react-i18next 15.6.0`)
- Namespace pattern keeps translations organized: `roster.en.json`, `roster.vi.json`
- Translation keys in Zod schemas allow localized validation errors
- Consistent with existing i18n patterns in the project

**Translation Structure**:
```json
{
  "roster": {
    "title": "Class Roster",
    "actions": {
      "addStudent": "Add Student",
      "editStudent": "Edit Student",
      "deleteStudent": "Delete Student"
    },
    "form": {
      "firstName": "First Name",
      "lastName": "Last Name",
      "studentCode": "Student ID",
      "email": "Email Address"
    },
    "validation": {
      "firstNameRequired": "First name is required",
      "emailInvalid": "Please enter a valid email address",
      "duplicateStudentCode": "This student ID already exists in the roster"
    },
    "messages": {
      "studentAdded": "Student added successfully",
      "studentUpdated": "Student updated successfully",
      "studentDeleted": "Student removed from roster"
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

**Alternatives Considered**:
- **Hardcoded English strings**: Not acceptable (project requires i18n support)
- **Global translation file**: Doesn't scale, harder to maintain
- **Component-level translations**: Violates separation of concerns

---

### 8. Error Handling Strategy

**Question**: How do we handle API errors and network failures (FR-013)?

**Decision**: Multi-layered error handling with user-friendly messages

**Rationale**:
- Errors can occur at multiple levels: validation, network, server
- Each error type needs appropriate handling:
  - **Validation errors**: Show inline below fields (React Hook Form + Zod)
  - **Network errors**: Show toast notification, preserve form state for retry
  - **Server errors**: Parse response, show specific error (409 for duplicates, 403 for permissions)
- Toast notifications (sonner) for transient messages
- Error boundaries for catastrophic failures

**Error Handling Flow**:
```typescript
onError: (error, variables, context) => {
  // Rollback optimistic update
  queryClient.setQueryData(['students', classId], context.previous);
  
  // Parse error type
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.message;
    
    if (status === 409) {
      // Duplicate student ID - show field error
      form.setError('studentCode', { 
        message: t('roster.validation.duplicateStudentCode') 
      });
    } else if (status === 403) {
      toast.error(t('roster.errors.permissionDenied'));
    } else if (status === 404) {
      toast.error(t('roster.errors.studentNotFound'));
    } else {
      toast.error(message || t('roster.errors.unknownError'));
    }
  } else {
    // Network error
    toast.error(t('roster.errors.networkError'));
  }
}
```

**Alternatives Considered**:
- **Generic error messages**: Poor UX (user doesn't know what went wrong)
- **Alert boxes**: Intrusive, breaks user flow
- **Console.log only**: Errors invisible to users

---

## Architecture Decisions Record

### ADR-001: Use React Hook Form + Zod for form management

**Context**: Need robust form state management with validation

**Decision**: Use React Hook Form 7.61.1 with Zod 4.0.10 for validation

**Consequences**:
- **Positive**: Type-safe forms, minimal re-renders, built-in validation lifecycle
- **Negative**: Learning curve for team members unfamiliar with React Hook Form
- **Mitigation**: Document common patterns in quickstart.md

---

### ADR-002: Implement optimistic updates with rollback

**Context**: SC-006 requires roster updates within 2 seconds

**Decision**: Use React Query optimistic mutations with automatic rollback on error

**Consequences**:
- **Positive**: Immediate UI feedback, meets performance requirement
- **Negative**: Cache management complexity, potential inconsistency if rollback fails
- **Mitigation**: Rely on React Query's battle-tested implementation, invalidate queries on success

---

### ADR-003: Single form component for add/edit operations

**Context**: Add and edit operations use identical form fields

**Decision**: Single `StudentFormDialog` component with `mode` prop

**Consequences**:
- **Positive**: DRY principle, easier maintenance, consistent UX
- **Negative**: Slightly more complex conditional logic within component
- **Mitigation**: Extract conditional logic to hooks (`useStudentForm`) to keep component clean

---

### ADR-004: Two-tier duplicate validation

**Context**: FR-004 requires unique student IDs within roster

**Decision**: Client-side cache check + server-side validation

**Consequences**:
- **Positive**: Instant feedback, catches edge cases, handles concurrent edits
- **Negative**: Two validation layers to maintain
- **Mitigation**: Server is source of truth, client-side is optimization for UX

---

## Best Practices

### Form State Management
- **Use uncontrolled inputs** with React Hook Form (better performance)
- **Validate on blur** for real-time feedback without being intrusive
- **Disable submit button** during mutation to prevent duplicate submissions
- **Show loading spinner** in button during submission
- **Reset form** on successful submission (add mode) or close dialog (edit mode)

### Validation
- **Localize all error messages** via i18next translation keys
- **Show field errors inline** below the input (better UX than toast)
- **Validate email with regex** on client, but trust server for domain validation
- **Use async validation sparingly** (only for duplicate checks, not for every field)

### Optimistic Updates
- **Always provide rollback** in `onError` handler
- **Invalidate queries on success** to ensure cache consistency
- **Use temporary IDs** for optimistic creates (`'temp-' + Date.now()`)
- **Show loading states** during mutations (even with optimistic updates)

### Error Handling
- **Parse error responses** to provide specific feedback
- **Preserve form state** on error (don't clear fields, allow retry)
- **Log errors** to console for debugging (in addition to user-facing messages)
- **Handle network errors gracefully** with offline detection if needed

### Testing
- **Test validation schemas** independently with Zod's `.safeParse()`
- **Mock API calls** in component tests (don't make real HTTP requests)
- **Test optimistic update rollback** by simulating API errors
- **Test accessibility** (keyboard navigation, screen reader labels)

---

## References

- [React Hook Form Documentation](https://react-hook-form.com/)
- [Zod Documentation](https://zod.dev/)
- [React Query Optimistic Updates](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)
- [Radix UI AlertDialog](https://www.radix-ui.com/primitives/docs/components/alert-dialog)
- [i18next React Integration](https://react.i18next.com/)

---

## Open Questions

*None remaining - all research questions resolved*

---

**Status**: ✅ Research complete - All decisions documented and ready for implementation
