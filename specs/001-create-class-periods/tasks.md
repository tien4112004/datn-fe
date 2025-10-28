# Tasks: Create Class Periods

**Input**: Design documents from `/specs/001-create-class-periods/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create directory structure `container/src/features/classes/components/schedule/add-period/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T002 Create the main dialog component `container/src/features/classes/components/schedule/add-period/AddPeriodDialog.tsx`.
- [x] T003 [P] In `container/src/features/classes/components/schedule/ScheduleTab.tsx`, import and render `AddPeriodDialog.tsx`, and pass the `onAddPeriod` handler to it to control its visibility.

**Checkpoint**: Foundation ready - The "Add Period" button in `ScheduleView` should now open an empty dialog.

---

## Phase 3: User Story 1 - Create a Single Class Period (Priority: P1) 🎯 MVP

**Goal**: As a teacher, I want to create a single, non-repeating class period by selecting from a list of predefined periods and assigning a date, so that I can quickly schedule one-off events.

**Independent Test**: A teacher can successfully create one class period by selecting a period template, view it on their schedule, and it does not repeat.

### Implementation for User Story 1

- [x] T004 [US1] Create the form component `container/src/features/classes/components/schedule/add-period/PeriodForm.tsx`. It should contain fields for selecting a `Period Template` and a `date`.
- [x] T005 [US1] Integrate `PeriodForm.tsx` into `AddPeriodDialog.tsx`.
- [x] T006 [US1] Implement the logic in `PeriodForm.tsx` to fetch and display a list of `Period Template`s.
- [x] T007 [US1] In `AddPeriodDialog.tsx`, implement the save logic to call the `addSchedulePeriod` mutation from `useApi.ts` with the data from `PeriodForm.tsx`.
- [x] T008 [US1] After successful creation, ensure the schedule view is refreshed to show the new period.

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Create Repeating Class Periods (Priority: P2)

**Goal**: As a teacher, I want to create a class period that repeats on a regular basis by selecting a predefined period and defining a repetition rule, so that I can quickly set up my entire class schedule for a term.

**Independent Test**: A teacher can define a repetition rule (e.g., weekly on certain days) for a selected period template and the system will generate all the corresponding class periods for a specified date range.

### Implementation for User Story 2

- [x] T009 [US2] Create the form component `container/src/features/classes/components/schedule/add-period/RepeatRuleForm.tsx`. It should contain options for daily and weekly repetition and an end date picker.
- [x] T010 [US2] In `AddPeriodDialog.tsx`, add a switch or radio button to toggle between "Single Period" and "Repeat Periods".
- [x] T011 [US2] Conditionally render `RepeatRuleForm.tsx` in `AddPeriodDialog.tsx` when "Repeat Periods" is selected.
- [x] T012 [US2] Update the save logic in `AddPeriodDialog.tsx` to handle the creation of repeating periods based on the rules from `RepeatRuleForm.tsx`.

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T013 [P] Add loading indicators while fetching data or creating periods.
- [x] T014 [P] Implement comprehensive error handling and display user-friendly error messages.
- [x] T015 [P] Ensure the UI is responsive and accessible.
- [x] T016 Run `quickstart.md` validation to ensure the feature is testable.

---

## Dependencies & Execution Order

- **Setup (Phase 1)** -> **Foundational (Phase 2)** -> **User Story 1 (Phase 3)** -> **User Story 2 (Phase 4)** -> **Polish (Phase 5)**

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Foundational (Phase 2).
- **User Story 2 (P2)**: Depends on User Story 1 (Phase 3) as it extends the same form.

## Implementation Strategy

### MVP First (User Story 1 Only)

1.  Complete Phase 1: Setup
2.  Complete Phase 2: Foundational
3.  Complete Phase 3: User Story 1
4.  **STOP and VALIDATE**: Test User Story 1 independently.
