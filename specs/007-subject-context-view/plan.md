# Implementation Plan: Subject Context View

**Branch**: `007-subject-context-view` | **Date**: 2025-11-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/007-subject-context-view/spec.md`

## Summary

Introduce a "Subject View" to the `Schedule` tab. This view will provide a high-level, chronological list of all periods for a single subject, allowing teachers to perform long-term curriculum mapping and pacing. This will be achieved by refactoring the existing `ScheduleView` to support view switching and creating a new set of components to handle the subject-based view.

## Technical Context

**Language/Version**: TypeScript (React 19+)
**Primary Dependencies**: React, Zustand, Tailwind CSS, Vite, Vitest
**Storage**: N/A (Data fetched from backend API)
**Testing**: Vitest
**Target Platform**: Web
**Project Type**: Micro-frontend (Container)
**Performance Goals**: View loads in under 3 seconds.
**Constraints**: Must integrate with existing `ScheduleView` component.
**Scale/Scope**: This feature adds a new view to an existing feature.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **I. Component Modularity**: All new components will be self-contained and have a single responsibility.
- **II. Type Safety & Quality Enforcement**: All code will be strictly typed.
- **III. Code Maintainability Standards**: Code will follow existing project standards.
- **IV. Workspace Isolation & Dependencies**: All new dependencies will be added to the `container` workspace.
- **V. Code Review & Quality Gates**: All code will be reviewed and pass all quality gates.

## Project Structure

### Documentation (this feature)

```text
specs/007-subject-context-view/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
container/
└── src/
    ├── features/
    │   └── classes/
    │       ├── api/
    │       │   ├── index.ts
    │       │   ├── service.ts
    │       │   └── mock.ts
    │       ├── components/
    │       │   └── schedule/
    │       │       ├── subject-view/
    │       │       │   ├── SubjectContextView.tsx
    │       │       │   ├── SubjectSelector.tsx
    │       │       │   ├── SubjectPeriodList.tsx
    │       │       │   └── SubjectPeriodItem.tsx
    │       │       ├── ScheduleDialog.tsx
    │       │       ├── ScheduleList.tsx
    │       │       ├── ScheduleStats.tsx
    │       │       ├── ScheduleView.tsx
    │       │       └── ViewModeToggle.tsx
    │       ├── hooks/
    │       │   ├── useSubjects.ts
    │       │   └── useSubjectPeriods.ts
    │       └── types/
    │           └── index.ts
    └── shared/
        └── api/
            ├── api.ts
            └── base-service.ts
```

**Structure Decision**: The new "Subject View" components will be grouped in a `subject-view` subdirectory within `container/src/features/classes/components/schedule`. The `ViewModeToggle` will be placed in the `schedule` directory. This improves organization and aligns with the existing structure.

## Implementation Steps

1.  **Update `types`**:
    -   Navigate to `container/src/features/classes/types/index.ts`.
    -   Add `getSubjects(classId: string): Promise<Subject[]>;` and `getPeriodsBySubject(classId: string, subjectId: string): Promise<SchedulePeriod[]>;` to the `ClassApiService` interface.
    -   Define the `Subject` type based on `data-model.md`.

2.  **Update `service.ts`**:
    -   Navigate to `container/src/features/classes/api/service.ts`.
    -   Implement the `getSubjects` and `getPeriodsBySubject` methods in the `ClassRealApiService` class.

3.  **Update `mock.ts`**:
    -   Navigate to `container/src/features/classes/api/mock.ts`.
    -   Implement the `getSubjects` and `getPeriodsBySubject` methods in the `ClassMockApiService` class with mock data.

4.  **Frontend Scaffolding**:
    -   Create the new directories and files as specified in the "Source Code" section above.

5.  **Frontend Hooks**:
    -   Implement `useSubjects.ts` and `useSubjectPeriods.ts`.

6.  **Frontend Components**:
    -   Implement the new UI components in the `subject-view` directory.
    -   Implement the `ViewModeToggle.tsx` component.

7.  **Frontend Integration**:
    -   Refactor `ScheduleView.tsx` to include the `ViewModeToggle` and to conditionally render the "Day View" or the `SubjectContextView`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
|           |            |                                     |