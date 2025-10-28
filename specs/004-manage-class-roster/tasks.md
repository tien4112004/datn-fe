# Tasks: Manage Class Roster

**Input**: Design documents from `/specs/004-manage-class-roster/`  
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/student-api.yaml ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

All paths relative to `/media/tondeptrai/NewVolume1/DevTest/RealProject/DATN/fe/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify project structure and prepare for roster feature implementation

- [X] T001 Verify TypeScript strict mode enabled in `container/tsconfig.json`
- [X] T002 Verify all required dependencies installed (React Hook Form 7.61.1, Zod 4.0.10, React Query 5.83.0, Tanstack Table 8.21.3)
- [X] T003 [P] Create feature directory structure: `container/src/features/classes/components/roster/`
- [X] T004 [P] Create schemas directory: `container/src/features/classes/schemas/`
- [X] T005 [P] Create locales directory: `container/src/features/classes/locales/en/`
- [X] T006 [P] Create test directory structure: `container/tests/features/classes/roster/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T007 Create Zod validation schema in `container/src/features/classes/schemas/studentSchema.ts` (includes studentFormSchema with email regex, required fields validation, string length constraints)
- [X] T008 Create translation file in `container/src/features/classes/locales/en/roster.json` (form labels, validation messages, success/error messages, confirmation dialog text)
- [X] T009 [P] Create shared confirmation dialog hook in `container/src/shared/hooks/useConfirmDialog.ts` (manages dialog open/close state, pending action execution)
- [X] T010 Verify existing Student entity in `container/src/features/classes/types/entities/student.ts` (no changes needed, confirm interface matches spec)
- [X] T011 Verify existing StudentCreateRequest and StudentUpdateRequest types in `container/src/features/classes/types/requests/studentRequests.ts` (confirm types exist and match API contracts)
- [X] T012 Check existing API service in `container/src/features/classes/api/service.ts` (identify if CRUD methods exist or need to be added)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Add New Student to Roster (Priority: P1) 🎯 MVP

**Goal**: Enable teachers to add new students to their class roster with required validation

**Independent Test**: Navigate to any class roster page, click "Add Student", fill in required fields (First Name, Last Name, Student ID, Email), submit form. Verify new student appears in roster with confirmation toast.

### Implementation for User Story 1

- [X] T013 [P] [US1] Create useStudentForm hook in `container/src/features/classes/hooks/useStudentForm.ts` (React Hook Form integration with Zod, form state management for isDirty/isValid/errors, mode prop for 'create' | 'edit')
- [X] T014 [P] [US1] Create useStudentMutations hook in `container/src/features/classes/hooks/useStudentMutations.ts` (createStudent mutation with optimistic update, onMutate for cache snapshot, onError for rollback, onSuccess for toast notification and cache invalidation)
- [X] T015 [US1] Create StudentFormDialog component in `container/src/features/classes/components/roster/StudentFormDialog.tsx` (Radix Dialog with form fields, integrates useStudentForm and useStudentMutations, mode='create' by default, displays firstName/lastName/studentCode/email required fields, shows validation errors inline, disable submit during isSubmitting, close dialog on success)
- [X] T016 [US1] Create StudentRosterTable component in `container/src/features/classes/components/roster/StudentRosterTable.tsx` (Tanstack Table with student data columns, "Add Student" button in header that opens StudentFormDialog, uses existing Student type for row data, displays fullName, studentCode, email, status columns)
- [X] T017 [US1] Add CRUD methods to API service in `container/src/features/classes/api/service.ts` if missing (createStudent: POST /api/classes/{classId}/students, implement request/response handling with Axios, error handling for 400/409/403 status codes)
- [X] T018 [US1] Update mock data in `container/src/features/classes/api/data/mockData.ts` if using mocks (add mockStudents array, implement mock createStudent that appends to array, return proper Student objects with IDs)
- [X] T019 [US1] Integrate StudentRosterTable into existing class detail page (import and render StudentRosterTable, pass classId prop, ensure React Query provider wraps component tree)

**Checkpoint**: At this point, User Story 1 (Add Student) should be fully functional and testable independently

---

## Phase 4: User Story 2 - Modify Existing Student Information (Priority: P2)

**Goal**: Enable teachers to edit existing student details with pre-filled forms

**Independent Test**: Click "Edit" on any existing student in roster, verify form pre-fills with current data, modify one or more fields, save changes. Verify updates reflected in roster with confirmation toast.

### Implementation for User Story 2

- [X] T020 [US2] Extend useStudentMutations hook in `container/src/features/classes/hooks/useStudentMutations.ts` (add updateStudent mutation with optimistic update, implement onMutate to snapshot and update cache, onError to rollback, onSuccess for toast and invalidation)
- [X] T021 [US2] Update StudentFormDialog component in `container/src/features/classes/components/roster/StudentFormDialog.tsx` (accept initialData prop of type Student | undefined, accept mode prop: 'create' | 'edit', pre-fill form when mode='edit' and initialData provided, change dialog title based on mode: "Add Student" vs "Edit Student", change submit button text: "Add" vs "Save", handle duplicate studentCode validation when code is changed)
- [X] T022 [US2] Update StudentRosterTable component in `container/src/features/classes/components/roster/StudentRosterTable.tsx` (add action column with "Edit" button per row, clicking Edit opens StudentFormDialog with mode='edit' and initialData={student}, manage dialog open state and selected student state)
- [X] T023 [US2] Add updateStudent method to API service in `container/src/features/classes/api/service.ts` if missing (updateStudent: PUT /api/students/{studentId}, implement request/response handling, error handling for 400/404/409/403 status codes)
- [X] T024 [US2] Update mock data handlers in `container/src/features/classes/api/data/mockData.ts` if using mocks (implement mock updateStudent that finds and updates student in array, return updated Student object)

**Checkpoint**: At this point, User Stories 1 (Add) AND 2 (Edit) should both work independently

---

## Phase 5: User Story 3 - Remove Student from Roster (Priority: P3)

**Goal**: Enable teachers to remove students from rosters with explicit confirmation

**Independent Test**: Click "Delete" on any student, verify confirmation dialog shows student's full name, click "Confirm" to remove. Verify student disappears from roster with confirmation toast. Test "Cancel" dismisses dialog without action.

### Implementation for User Story 3

- [X] T025 [P] [US3] Create StudentDeleteConfirmation component in `container/src/features/classes/components/roster/StudentDeleteConfirmation.tsx` (Radix AlertDialog component, accepts open/onOpenChange/studentName/onConfirm/onCancel props, displays message: "Are you sure you want to remove {studentName} from the class?", Confirm button triggers onConfirm, Cancel button and ESC key trigger onCancel)
- [X] T026 [US3] Extend useStudentMutations hook in `container/src/features/classes/hooks/useStudentMutations.ts` (add deleteStudent mutation with optimistic removal, implement onMutate to snapshot and remove from cache, onError to rollback, onSuccess for toast and invalidation)
- [X] T027 [US3] Update StudentRosterTable component in `container/src/features/classes/components/roster/StudentRosterTable.tsx` (add "Delete" button to action column per row, use useConfirmDialog hook to manage confirmation state, clicking Delete opens StudentDeleteConfirmation with student's fullName, pass delete mutation to confirmation handler)
- [X] T028 [US3] Add deleteStudent method to API service in `container/src/features/classes/api/service.ts` if missing (deleteStudent: DELETE /api/students/{studentId}, implement request/response handling, error handling for 403/404 status codes)
- [X] T029 [US3] Update mock data handlers in `container/src/features/classes/api/data/mockData.ts` if using mocks (implement mock deleteStudent that filters student from array, return success response)

**Checkpoint**: All user stories (Add, Edit, Delete) should now be independently functional
- [ ] T026 [US3] Extend useStudentMutations hook in `container/src/features/classes/hooks/useStudentMutations.ts` (add deleteStudent mutation with optimistic removal, implement onMutate to snapshot and remove from cache, onError to rollback, onSuccess for toast and invalidation)
- [ ] T027 [US3] Update StudentRosterTable component in `container/src/features/classes/components/roster/StudentRosterTable.tsx` (add "Delete" button to action column per row, use useConfirmDialog hook to manage confirmation state, clicking Delete opens StudentDeleteConfirmation with student's fullName, pass delete mutation to confirmation handler)
- [ ] T028 [US3] Add deleteStudent method to API service in `container/src/features/classes/api/service.ts` if missing (deleteStudent: DELETE /api/students/{studentId}, implement request/response handling, error handling for 403/404 status codes)
- [ ] T029 [US3] Update mock data handlers in `container/src/features/classes/api/data/mockData.ts` if using mocks (implement mock deleteStudent that filters student from array, return success response)

**Checkpoint**: All user stories (Add, Edit, Delete) should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and ensure production readiness

- [ ] T030 [P] Add duplicate studentCode validation to studentSchema in `container/src/features/classes/schemas/studentSchema.ts` (extend schema with refine() for async duplicate check, check against React Query cache of existing students, exclude current student when editing, return specific error message)
- [X] T031 [P] Add Vietnamese translations in `container/src/features/classes/locales/vi/roster.json` if multi-language support needed (translate all keys from en/roster.json) - ✅ Vietnamese translations created
- [X] T032 [P] Register roster translations in i18n configuration (import roster namespace in `container/src/features/classes/i18n/index.ts` or equivalent, ensure translations load correctly) - ✅ Integrated into shared i18n classes namespace (en/classes.ts and vi/classes.ts)
- [X] T033 Verify all components follow TypeScript strict mode (run `pnpm typecheck` in container workspace, fix any type errors, ensure no `any` types used) - ✅ Passed with zero errors
- [X] T034 Verify all components follow linting rules (run `pnpm lint` in container workspace, fix any warnings or errors, ensure consistent formatting) - ✅ No errors in roster code (existing unrelated issues in other features)
- [X] T035 Add JSDoc comments to public APIs (document props interfaces for StudentFormDialog/StudentDeleteConfirmation/StudentRosterTable, document hook return types for useStudentForm/useStudentMutations/useConfirmDialog, add WHY comments for complex validation logic in studentSchema) - ✅ Already documented during implementation
- [ ] T036 Optimize form rendering performance (add React.memo to StudentFormDialog if needed, debounce async validation in studentCode field, ensure minimal re-renders during form input)
- [ ] T037 Add error boundaries if not present (wrap StudentRosterTable in error boundary, handle catastrophic failures gracefully, log errors for debugging)
- [ ] T038 Verify accessibility (test keyboard navigation through forms and dialogs, ensure screen reader compatibility with Radix UI components, verify focus management when dialogs open/close, check color contrast for all text)
- [ ] T039 Test edge cases (test very long names and special characters, test network error handling during submission, test rapid clicking of submit button, test simultaneous edits by multiple users if applicable)
- [ ] T040 Manual QA against acceptance criteria (complete manual testing checklist from quickstart.md, verify all acceptance scenarios from spec.md pass, test with sample data of 30-50 students, verify performance goals: add < 30s, edit < 20s, roster update < 2s)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if team staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1) - Add Student**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2) - Edit Student**: Can start after Foundational (Phase 2) - Extends US1 components but independently testable
- **User Story 3 (P3) - Delete Student**: Can start after Foundational (Phase 2) - Extends US1 components but independently testable

### Within Each User Story

**User Story 1 (Add)**:
1. Hooks (T013, T014) can run in parallel [P]
2. StudentFormDialog (T015) depends on hooks (T013, T014)
3. StudentRosterTable (T016) depends on StudentFormDialog (T015)
4. API service (T017) and mock data (T018) can run in parallel with UI work
5. Integration (T019) depends on StudentRosterTable (T016)

**User Story 2 (Edit)**:
1. Extend useStudentMutations (T020) - depends on T014 existing
2. Update StudentFormDialog (T021) - depends on T015 existing
3. Update StudentRosterTable (T022) - depends on T016 existing
4. API service (T023) and mock data (T024) can run in parallel

**User Story 3 (Delete)**:
1. StudentDeleteConfirmation (T025) can run in parallel [P]
2. Extend useStudentMutations (T026) - depends on T014 existing
3. Update StudentRosterTable (T027) - depends on T016 and T025
4. API service (T028) and mock data (T029) can run in parallel

### Parallel Opportunities

- **Setup (Phase 1)**: Tasks T003, T004, T005, T006 can all run in parallel
- **Foundational (Phase 2)**: Tasks T009 can run in parallel with T007, T008
- **User Story 1**: Tasks T013, T014 can run in parallel; T017, T018 can run in parallel
- **User Story 2**: Tasks T023, T024 can run in parallel
- **User Story 3**: Task T025 can start immediately (parallel with T026)
- **Polish (Phase 6)**: Tasks T030, T031, T032 can all run in parallel

---

## Parallel Example: User Story 1 (Add Student)

```bash
# Launch hooks together:
Task T013: "Create useStudentForm hook in container/src/features/classes/hooks/useStudentForm.ts"
Task T014: "Create useStudentMutations hook in container/src/features/classes/hooks/useStudentMutations.ts"

# After hooks complete, launch API work in parallel with UI:
Task T015: "Create StudentFormDialog component"
Task T017: "Add CRUD methods to API service"
Task T018: "Update mock data"

# After T015 completes:
Task T016: "Create StudentRosterTable component"

# Finally:
Task T019: "Integrate StudentRosterTable into class detail page"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (Tasks T001-T006)
2. Complete Phase 2: Foundational (Tasks T007-T012) - CRITICAL
3. Complete Phase 3: User Story 1 (Tasks T013-T019)
4. **STOP and VALIDATE**: Test User Story 1 independently
   - Teachers can add students with all required fields
   - Validation works (required fields, email format)
   - Duplicate student IDs are caught
   - Success toast appears
   - New students appear in roster immediately
   - Form resets after submission
5. Deploy/demo if ready (Basic roster management working!)

**Estimated Effort for MVP**: 5-6 hours
- Setup: 30 minutes
- Foundational: 1.5 hours
- User Story 1: 3-4 hours

### Incremental Delivery

1. **Release 1 (MVP)**: Setup + Foundational + User Story 1 → Teachers can add students
2. **Release 2**: Add User Story 2 → Teachers can edit existing students
3. **Release 3**: Add User Story 3 → Teachers can remove students with confirmation
4. **Release 4**: Polish (Phase 6) → Production-ready with all enhancements

Each release adds value without breaking previous functionality.

### Parallel Team Strategy

With multiple developers after Foundational phase completes:

1. **Developer A**: User Story 1 (Tasks T013-T019)
2. **Developer B**: User Story 2 (Tasks T020-T024) - starts after US1 components exist
3. **Developer C**: User Story 3 (Tasks T025-T029) - starts after US1 components exist

Or if full parallel:
1. **Developer A**: US1 foundation (T013-T016)
2. **Developer B**: US3 confirmation component (T025) + shared hook improvements
3. **Developer C**: API integration (T017, T018, T023, T024, T028, T029)

---

## Task Summary

**Total Tasks**: 40

**By Phase**:
- Phase 1 (Setup): 6 tasks
- Phase 2 (Foundational): 6 tasks (BLOCKING)
- Phase 3 (User Story 1 - Add): 7 tasks
- Phase 4 (User Story 2 - Edit): 5 tasks
- Phase 5 (User Story 3 - Delete): 5 tasks
- Phase 6 (Polish): 11 tasks

**By User Story**:
- User Story 1 (P1 - Add Student): 7 implementation tasks
- User Story 2 (P2 - Edit Student): 5 implementation tasks
- User Story 3 (P3 - Delete Student): 5 implementation tasks
- Cross-cutting (Setup + Foundational + Polish): 23 tasks

**Parallel Opportunities**: 15 tasks marked [P] can run concurrently within their phases

**Independent Test Criteria**:
- ✅ US1: Add student form works end-to-end (click Add → fill form → submit → see in roster)
- ✅ US2: Edit student form works end-to-end (click Edit → modify data → save → see updates)
- ✅ US3: Delete confirmation works end-to-end (click Delete → confirm → student removed)

**Suggested MVP Scope**: Complete through Phase 3 (User Story 1) only
- Delivers core value: Teachers can add students to rosters
- ~12 tasks (Setup + Foundational + US1)
- ~5-6 hours estimated effort
- Fully testable and demonstrable
- Foundation for subsequent stories

---

## Notes

- **[P] tasks**: Different files, no dependencies - can run in parallel
- **[Story] labels**: Map tasks to specific user stories for traceability
- **File paths**: All paths are exact locations in container workspace
- **No tests included**: Spec did not request TDD approach; tests can be added later if needed
- **Constitution compliant**: All tasks follow TypeScript strict mode, no `any` types, component modularity
- **Each user story independently completable**: Can stop after any story phase and have working feature
- **Commit strategy**: Commit after each task or logical group (e.g., after completing a component)
- **Validation checkpoints**: Use checkpoints to test stories independently before proceeding
- **Avoid**: Vague tasks, editing same file concurrently, cross-story dependencies that break independence
