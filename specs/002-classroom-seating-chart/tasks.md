# Tasks: Classroom Seating Chart

**Input**: Design documents from `/specs/002-classroom-seating-chart/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No tests will be written for this feature as per user request.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- The paths in this document refer to the `container` workspace.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install new dependencies.

- [x] T001 Install `@dnd-kit/core`, `@dnd-kit/sortable`, and `@dnd-kit/utilities` in the `container` workspace.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- No foundational tasks for this feature.

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - View Seating Chart (Priority: P1) 🎯 MVP

**Goal**: As a homeroom teacher, I want to view the current seating chart for my class to understand where each student is seated.

**Independent Test**: Can be tested by logging in, navigating to a class, and verifying that the seating chart is displayed correctly.

### Implementation for User Story 1

- [x] T002 [US1] Add a view toggle button to switch between "List View" and "Seating Chart View" in `src/features/classes/components/detail/ClassStudentList.tsx`.
- [x] T003 [US1] Implement the grid layout for the seating chart in `src/features/classes/components/detail/ClassStudentList.tsx`.
- [x] T004 [US1] Fetch the seating chart data using the `GET /api/classes/{classId}/seating-chart` endpoint and display the students in the grid in `src/features/classes/components/detail/ClassStudentList.tsx`.
- [x] T005 [US1] Implement the display of unassigned students in a separate list in `src/features/classes/components/detail/ClassStudentList.tsx`.

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Rearrange Students (Priority: P2)

**Goal**: As a homeroom teacher, I want to rearrange students in the seating chart by dragging and dropping them to new seats.

**Independent Test**: Can be tested by entering an "edit mode" on the seating chart, and performing a drag-and-drop action. The change should be visually reflected.

### Implementation for User Story 2

- [x] T006 [US2] Integrate `dnd-kit` to make the students in the seating chart grid draggable in `src/features/classes/components/detail/ClassStudentList.tsx`.
- [x] T007 [US2] Implement the drag-and-drop functionality for the unassigned students list in `src/features/classes/components/detail/ClassStudentList.tsx`.
- [x] T008 [US2] Implement the logic to swap students when a student is dropped on an occupied seat in `src/features/classes/components/detail/ClassStudentList.tsx`.
- [x] T009 [US2] Add a "Save Layout" button that becomes active when changes are made in `src/features/classes/components/detail/ClassStudentList.tsx`.
- [x] T010 [US2] Implement the API call to save the new layout using the `PUT /api/classes/{classId}/seating-chart` endpoint when the "Save Layout" button is clicked in `src/features/classes/components/detail/ClassStudentList.tsx`.

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories.

- [x] T011 Add localization for all new UI elements using `react-i18next` in `src/features/classes/components/detail/ClassStudentList.tsx`.
- [x] T012 Ensure the UI is responsive and works well on different screen sizes.
- [x] T013 Run `pnpm lint` and fix any issues in `src/features/classes/components/detail/ClassStudentList.tsx`.
- [x] T014 Refactor `src/features/classes/components/detail/ClassStudentList.tsx` to improve maintainability by extracting sub-components for the list view, seating chart view, and the sortable items.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately.
- **User Stories (Phase 3 & 4)**: Depend on Setup completion.
- **Polish (Phase 5)**: Depends on all user stories being complete.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Setup (Phase 1).
- **User Story 2 (P2)**: Depends on User Story 1.

### Within Each User Story

- Tasks within each user story should be completed in the specified order.

### Parallel Opportunities

- Once Setup is complete, work on User Story 1 can begin.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1.  Complete Phase 1: Setup
2.  Complete Phase 3: User Story 1
3.  **STOP and VALIDATE**: Test User Story 1 independently.
4.  Deploy/demo if ready.

### Incremental Delivery

1.  Complete Setup.
2.  Add User Story 1 → Test independently → Deploy/Demo (MVP!).
3.  Add User Story 2 → Test independently → Deploy/Demo.
4.  Complete Polish phase.