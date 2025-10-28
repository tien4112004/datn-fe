# Tasks: Export Student Chart View

**Input**: Design documents from `/specs/008-export-student-chart/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: Tests are OPTIONAL and have been excluded as per the instructions.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Paths are relative to the `container` workspace root.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency installation.

- [X] T001 Install `html-to-image` library in the `container` workspace.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented.

- No foundational tasks for this feature.

--- 

## Phase 3: User Story 1 - Export Student Chart (Priority: P1) 🎯 MVP

**Goal**: As a teacher, I want to export the current student chart view so that I can have a local copy of the data for reporting or analysis.

**Independent Test**: Can be fully tested by navigating to the student chart, clicking 'Export', and verifying the downloaded file.

### Implementation for User Story 1

- [X] T002 [US1] Create the `useExportStudentChart` hook in `src/features/classes/hooks/useExportStudentChart.ts`.
- [X] T003 [US1] Implement the export logic in `src/features/classes/hooks/useExportStudentChart.ts` using the `html-to-image` library.
- [X] T004 [US1] Integrate the `useExportStudentChart` hook into `src/features/classes/components/student/seating-chart/SeatingChartGrid.tsx`.
- [X] T005 [US1] Add the "Export" button to the `src/features/classes/components/student/seating-chart/SeatingChartGrid.tsx` component.

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories.

- No polish tasks for this feature.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **User Story 1 (Phase 3)**: Depends on Setup completion.

### Within User Story 1

- T002 → T003 → T004 → T005

### Parallel Opportunities

- No parallel opportunities identified for this feature.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 3: User Story 1
3. **STOP and VALIDATE**: Test User Story 1 independently.
4. Deploy/demo if ready.
