# Tasks: Subject Context View

**Input**: Design documents from `/specs/007-subject-context-view/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `container/src/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure. This phase is already complete for this project.

- [X] T001 Create `subject-view` directory in `container/src/features/classes/components/schedule`

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented.

- [X] T002 [P] Update `ClassApiService` interface in `container/src/features/classes/types/index.ts`
- [X] T003 [P] Define `Subject` type in `container/src/features/classes/types/index.ts`
- [X] T004 Implement `getSubjects` and `getPeriodsBySubject` in `ClassRealApiService` in `container/src/features/classes/api/service.ts`
- [X] T005 Implement `getSubjects` and `getPeriodsBySubject` in `ClassMockApiService` in `container/src/features/classes/api/mock.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin.

## Phase 3: User Story 1 - View Subject Schedule (Priority: P1) 🎯 MVP

**Goal**: As a Primary Teacher, I want to view all scheduled periods for a single subject in a chronological list so that I can easily track the long-term pacing of my curriculum.

**Independent Test**: Can be fully tested by navigating to the schedule, selecting the subject view, and verifying the list of periods for a subject.

### Implementation for User Story 1

- [X] T006 [P] [US1] Create `useSubjects.ts` hook in `container/src/features/classes/hooks`
- [X] T007 [P] [US1] Create `useSubjectPeriods.ts` hook in `container/src/features/classes/hooks`
- [X] T008 [P] [US1] Create `ViewModeToggle.tsx` component in `container/src/features/classes/components/schedule`
- [X] T009 [P] [US1] Create `SubjectSelector.tsx` component in `container/src/features/classes/components/schedule/subject-view`
- [X] T010 [P] [US1] Create `SubjectPeriodItem.tsx` component in `container/src/features/classes/components/schedule/subject-view`
- [X] T011 [US1] Create `SubjectPeriodList.tsx` component in `container/src/features/classes/components/schedule/subject-view`
- [X] T012 [US1] Create `SubjectContextView.tsx` component in `container/src/features/classes/components/schedule/subject-view`
- [X] T013 [US1] Refactor `ScheduleView.tsx` to integrate the `ViewModeToggle` and `SubjectContextView` in `container/src/features/classes/components/schedule/ScheduleView.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories.

- [X] T014 Add loading and error states to `SubjectPeriodList.tsx`
- [X] T015 Localize all new UI text in `SubjectSelector.tsx`, `SubjectPeriodItem.tsx`, `SubjectPeriodList.tsx`, and `SubjectContextView.tsx`

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2)**: Depends on Setup completion.
- **User Story 1 (Phase 3)**: Depends on Foundational phase completion.
- **Polish (Phase 4)**: Depends on User Story 1 completion.

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2).

### Within Each User Story

- Hooks can be developed in parallel.
- Components can be developed in parallel, but `SubjectPeriodList` depends on `SubjectPeriodItem`.
- `SubjectContextView` depends on `SubjectSelector` and `SubjectPeriodList`.
- `ScheduleView` refactoring depends on `ViewModeToggle` and `SubjectContextView`.

### Parallel Opportunities

- All Foundational tasks marked [P] can run in parallel.
- All User Story 1 tasks marked [P] can run in parallel.

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently.
5. Deploy/demo if ready.
