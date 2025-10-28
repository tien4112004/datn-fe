# Implementation Planning Summary: Manage Class Roster

**Feature**: 004-manage-class-roster  
**Date**: October 30, 2025  
**Phase**: Planning Complete (Phase 0 & 1)  
**Status**: ✅ Ready for Phase 2 (Task Breakdown)

## Executive Summary

The implementation plan for the "Manage Class Roster" feature is complete. This feature enables teachers to add, edit, and remove students from their class rosters through a user-friendly interface with real-time updates and comprehensive validation.

**Feature Scope**:
- **Priority P1**: Add new students with required information (first name, last name, student ID, email)
- **Priority P2**: Edit existing student details with pre-filled forms
- **Priority P3**: Remove students with confirmation dialogs to prevent accidents

**Technical Approach**: React 19.1.0 + TypeScript 5.8.3, React Hook Form 7.61.1 + Zod 4.0.10 for form management, React Query 5.83.0 for data fetching with optimistic updates, Radix UI components for accessible dialogs, and i18next 25.3.2 for internationalization.

## Generated Artifacts

### ✅ Phase 0: Research & Decisions
- **[research.md](./research.md)**: Comprehensive research findings covering:
  - Form state management (React Hook Form + Zod)
  - Validation strategies (client-side + server-side)
  - Duplicate student ID validation approach
  - Optimistic updates with React Query
  - Dialog management patterns
  - Confirmation dialog implementation
  - Internationalization setup
  - Error handling strategies
  - 4 Architecture Decision Records (ADRs)

### ✅ Phase 1: Design Artifacts
- **[plan.md](./plan.md)**: Complete implementation plan with:
  - Technical context and dependencies
  - Constitution compliance checks (all gates passed ✅)
  - Project structure with file locations
  - Component architecture diagrams
  - User flow descriptions for add/edit/delete operations
  - Post-design constitution validation

- **[data-model.md](./data-model.md)**: Data structures and validation:
  - Student entity (existing, no changes needed)
  - StudentFormData type with Zod schema
  - Validation rules table (required fields, formats, async checks)
  - State management structures (React Query + React Hook Form)
  - State transition diagrams for all three operations
  - Error handling specifications
  - Database indexing recommendations

- **[contracts/student-api.yaml](./contracts/student-api.yaml)**: OpenAPI 3.0 specification:
  - `GET /api/classes/{classId}/students` - Fetch roster
  - `POST /api/classes/{classId}/students` - Add student
  - `PUT /api/students/{studentId}` - Update student
  - `DELETE /api/students/{studentId}` - Remove student
  - Complete request/response schemas
  - Error response specifications (400, 401, 403, 404, 409)
  - Example payloads for all endpoints

- **[quickstart.md](./quickstart.md)**: Developer guide with:
  - 5-minute quick setup instructions
  - Implementation roadmap (3 phases: P1 → P2 → P3)
  - Key implementation patterns with code examples
  - Testing strategy (unit, integration, manual)
  - Debugging tips for common issues
  - Performance optimization best practices
  - Internationalization setup guide
  - API mocking instructions
  - Useful commands and next steps

### ✅ Pre-existing Artifacts
- **[spec.md](./spec.md)**: Feature specification (created in specify phase)
  - 3 prioritized user stories with acceptance criteria
  - 14 functional requirements
  - 8 measurable success criteria
  - Comprehensive edge cases

- **[checklists/requirements.md](./checklists/requirements.md)**: Quality validation
  - All specification quality checks passed ✅
  - No clarifications needed
  - Ready for implementation

## Key Architectural Decisions

### 1. Form Management: React Hook Form + Zod
**Rationale**: Already in project, excellent TypeScript support, minimal re-renders, built-in validation lifecycle, seamless Zod integration.

### 2. Optimistic Updates with Rollback
**Rationale**: Meets SC-006 requirement (< 2 second updates), provides immediate UI feedback, React Query handles complexity with battle-tested implementation.

### 3. Single Form Component for Add/Edit
**Rationale**: DRY principle, easier maintenance, consistent UX. Mode prop controls behavior without code duplication.

### 4. Two-Tier Duplicate Validation
**Rationale**: Client-side checks React Query cache for instant feedback, server-side validates for correctness, handles edge cases (concurrent edits, stale cache).

## Constitution Compliance

### Pre-Design Check: ✅ All Gates Passed
- **Component Modularity**: Self-contained components in `features/classes/components/roster/`
- **Type Safety**: TypeScript strict mode, no `any` types, explicit interfaces
- **Code Maintainability**: Descriptive names, functions under 50 lines, conventional commits
- **Workspace Isolation**: No new dependencies, stays within `container/` workspace
- **Quality Gates**: Tests for all user flows, pre-commit hooks enforced

### Post-Design Check: ✅ All Gates Passed
- Design aligns with all constitution principles
- No complexity violations requiring justification
- Follows established patterns in the project

## Component Structure

```
StudentRosterTable (Main)
├── "Add Student" button → StudentFormDialog (mode='create')
├── Table rows with student data
└── Action buttons per row
    ├── "Edit" → StudentFormDialog (mode='edit', initialData={student})
    └── "Delete" → StudentDeleteConfirmation

StudentFormDialog (Reusable)
├── Mode: 'create' | 'edit'
├── React Hook Form + Zod validation
├── Pre-fills data when mode='edit'
└── Calls useStudentMutations hooks

StudentDeleteConfirmation
├── Radix AlertDialog (forces acknowledgment)
├── Shows student name
└── Confirm/Cancel actions

Hooks:
├── useStudentForm: Form state management
├── useStudentMutations: React Query mutations (create, update, delete)
└── useConfirmDialog: Reusable confirmation pattern
```

## Implementation Priorities

### Phase 1: Add Student (P1) - Foundation
**Goal**: Enable basic roster management
**Components**: 5 new files (schema, 2 hooks, 2 components)
**Dependencies**: None (can start immediately)
**Estimated Effort**: 3-4 hours development + 2 hours testing
**Acceptance**: User Story 1 scenarios pass

### Phase 2: Edit Student (P2) - Iteration
**Goal**: Enable data correction
**Components**: Modify 2 existing files, update 1 hook
**Dependencies**: Phase 1 complete
**Estimated Effort**: 2 hours development + 1 hour testing
**Acceptance**: User Story 2 scenarios pass

### Phase 3: Delete Student (P3) - Cleanup
**Goal**: Enable roster maintenance
**Components**: 2 new files (hook, component), modify 1 table
**Dependencies**: Phase 1 complete (can parallelize with Phase 2)
**Estimated Effort**: 2 hours development + 1 hour testing
**Acceptance**: User Story 3 scenarios pass

**Total Estimated Effort**: 7-8 hours development + 4 hours testing = **11-12 hours**

## Validation Coverage

### Client-Side (Zod)
- ✅ Required fields (firstName, lastName, studentCode, email)
- ✅ Email format (regex validation)
- ✅ String length constraints
- ✅ Duplicate student ID (async check against cache)
- ✅ Date format (ISO 8601)
- ✅ Gender enum validation

### Server-Side (API)
- ✅ All client validations (backend should not trust client)
- ✅ Duplicate student ID (authoritative check)
- ✅ Permission checks (teacher owns class)
- ✅ Foreign key constraints (classId exists)
- ✅ Business rules (enrollment date logic)

## Success Metrics (from spec.md)

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| SC-001 | Add student < 30 seconds | Time from "Add Student" click to confirmation |
| SC-002 | Edit student < 20 seconds | Time from "Edit" click to save confirmation |
| SC-003 | 100% operation feedback | All operations show toast notifications |
| SC-004 | Zero data loss | Optimistic rollback on error, server persistence |
| SC-005 | 95% first-time success | User testing with new teachers |
| SC-006 | Roster update < 2 seconds | Time from submit to table update (actually immediate) |
| SC-007 | 100% duplicate detection | Validation prevents duplicate IDs |
| SC-008 | 100% accidental deletion prevention | Confirmation dialog required |

## Risk Mitigation

### Technical Risks
1. **Optimistic update rollback fails**
   - Mitigation: React Query handles this robustly; add error logging for monitoring

2. **Duplicate validation race condition**
   - Mitigation: Server is source of truth; client-side is UX optimization only

3. **Network failures during submission**
   - Mitigation: Error handling preserves form state, allows retry

### User Experience Risks
1. **Confusing validation errors**
   - Mitigation: All errors localized with clear messaging, inline field errors

2. **Accidental deletions**
   - Mitigation: Explicit confirmation dialog with student name displayed

3. **Lost form data on network error**
   - Mitigation: Form state preserved, mutation retryable

## Testing Coverage

### Unit Tests (Required)
- ✅ Zod schema validation (all rules)
- ✅ useStudentForm hook (form state management)
- ✅ useStudentMutations hook (mutations + optimistic updates)
- ✅ useConfirmDialog hook (dialog state)

### Component Tests (Required)
- ✅ StudentFormDialog (create mode)
- ✅ StudentFormDialog (edit mode)
- ✅ StudentDeleteConfirmation (confirm/cancel)
- ✅ StudentRosterTable (action buttons)

### Integration Tests (Required)
- ✅ Complete add flow (open dialog → fill form → submit → verify table)
- ✅ Complete edit flow (click edit → modify → save → verify)
- ✅ Complete delete flow (click delete → confirm → verify removal)
- ✅ Error handling (validation errors, API errors, network errors)

### Manual Testing (Checklist in quickstart.md)
- ✅ Add student happy path
- ✅ Add student validation errors
- ✅ Edit student happy path
- ✅ Edit student validation errors
- ✅ Delete with confirmation
- ✅ Delete cancellation
- ✅ Network error handling
- ✅ Permission denied scenarios

## Dependencies & Prerequisites

### Already Satisfied ✅
- React 19.1.0 + React DOM 19.1.0
- TypeScript 5.8.3
- React Hook Form 7.61.1
- Zod 4.0.10
- @hookform/resolvers 5.1.1
- @tanstack/react-query 5.83.0
- @tanstack/react-table 8.21.3
- Radix UI components (dialog, alert-dialog, form primitives)
- i18next 25.3.2 + react-i18next 15.6.0
- Tailwind CSS 4.1.11
- sonner 2.0.6 (toast notifications)

### New Dependencies: None Required ✅
All necessary libraries are already installed in the `container` workspace.

## File Checklist

### New Files (to create)
- [ ] `container/src/features/classes/schemas/studentSchema.ts`
- [ ] `container/src/features/classes/hooks/useStudentForm.ts`
- [ ] `container/src/features/classes/hooks/useStudentMutations.ts`
- [ ] `container/src/features/classes/components/roster/StudentRosterTable.tsx`
- [ ] `container/src/features/classes/components/roster/StudentFormDialog.tsx`
- [ ] `container/src/features/classes/components/roster/StudentDeleteConfirmation.tsx`
- [ ] `container/src/features/classes/locales/en/roster.json`
- [ ] `container/src/shared/hooks/useConfirmDialog.ts`
- [ ] `tests/features/classes/roster/StudentFormDialog.test.tsx`
- [ ] `tests/features/classes/roster/StudentDeleteConfirmation.test.tsx`
- [ ] `tests/features/classes/roster/useStudentMutations.test.ts`

### Modified Files (to update)
- [ ] `container/src/features/classes/api/service.ts` (add CRUD methods if missing)
- [ ] `container/src/features/classes/api/data/mockData.ts` (add mock students if needed)
- [ ] `container/src/features/classes/i18n/index.ts` (register roster translations)

### Existing Files (verify/use)
- ✅ `container/src/features/classes/types/entities/student.ts`
- ✅ `container/src/features/classes/types/requests/studentRequests.ts`
- ✅ `container/src/shared/components/ui/dialog.tsx`
- ✅ `container/src/shared/components/ui/alert-dialog.tsx`
- ✅ `container/src/shared/components/ui/form.tsx`
- ✅ `container/src/shared/components/ui/button.tsx`
- ✅ `container/src/shared/components/ui/input.tsx`

## Next Steps

### Immediate Actions
1. **Run `/speckit.tasks`** to generate Phase 2 implementation tasks
   - This will break down the implementation into granular, actionable steps
   - Tasks will be prioritized and ordered for efficient development

2. **Review Planning Artifacts**
   - Ensure all team members have read spec.md, plan.md, quickstart.md
   - Clarify any questions before implementation begins

3. **Set Up Development Environment**
   - Follow quickstart.md "Quick Setup" section
   - Verify all dependencies installed and tests passing

### Implementation Sequence
1. **Phase 1 (P1)**: Implement add student functionality (foundation)
2. **Phase 2 (P2)**: Implement edit student functionality (iteration)
3. **Phase 3 (P3)**: Implement delete student functionality (cleanup)
4. **Testing**: Complete all test suites (unit, component, integration)
5. **QA**: Manual testing against acceptance criteria
6. **Review**: Code review and constitution compliance check
7. **Deploy**: Merge to main branch after approval

---

## Document Index

| Document | Purpose | Status |
|----------|---------|--------|
| [spec.md](./spec.md) | Feature specification | ✅ Complete |
| [plan.md](./plan.md) | Implementation plan | ✅ Complete |
| [research.md](./research.md) | Technical research | ✅ Complete |
| [data-model.md](./data-model.md) | Data structures | ✅ Complete |
| [contracts/student-api.yaml](./contracts/student-api.yaml) | API contracts | ✅ Complete |
| [quickstart.md](./quickstart.md) | Developer guide | ✅ Complete |
| [checklists/requirements.md](./checklists/requirements.md) | Quality checklist | ✅ Complete |
| tasks.md | Implementation tasks | ⏳ Pending `/speckit.tasks` |

---

**Planning Phase Status**: ✅ **COMPLETE**

All Phase 0 and Phase 1 artifacts have been generated and validated. The feature is ready for task breakdown (Phase 2) and subsequent implementation.

**Constitution Compliance**: ✅ **PASSED** (all gates satisfied, no violations)

**Estimated Total Effort**: 11-12 hours (development + testing)

**Ready for**: `/speckit.tasks` command to generate implementation task breakdown
