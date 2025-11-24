# Implementation Plan: Classes Feature Code Refactoring

**Branch**: `feat/cms` | **Date**: 2025-10-29 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `.specify/memory/specs/refactor-classes-code/spec.md`

## Summary

This refactoring effort improves maintainability of the `container/src/features/classes` directory by simplifying complex logic, eliminating duplication, improving naming conventions, and increasing modularity. The work preserves all existing behavior while restructuring 800+ line mock API services, organizing type definitions, extracting reusable utilities, and splitting large components into focused modules. Success is measured by function length limits (<50 lines), code duplication reduction (40%), TypeScript type coverage (100%), and developer productivity improvements (30% faster onboarding, 25% faster code reviews).

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode enabled)  
**Primary Dependencies**: React 19, React Query, React Router, Zustand (state management)  
**Storage**: N/A (mock data refactoring only, no persistence changes)  
**Testing**: Vitest with React Testing Library  
**Target Platform**: Web application (Chrome, Firefox, Edge modern versions)  
**Project Type**: Web - Micro-frontend React workspace within Turborepo monorepo  
**Performance Goals**: No performance changes required (behavior preservation)  
**Constraints**: 
- Zero behavior changes allowed (all existing tests must pass unchanged)
- No breaking changes to public APIs or component interfaces
- Maintain i18n structure and translation keys
- Work within existing `container/` workspace only (no cross-workspace changes)
- **Component size limit**: <200 lines per file (constitutional requirement)
- **Function length limit**: <50 lines per function
- **Validation workflow**: Only run `pnpm type-check` (never run tests or lint in automated workflow)
- **Translation pattern**: Never pass `t` function as props - each component must call `useTranslation` internally
- **No commits**: Do not create git commits as part of the workflow

**Scale/Scope**: 
- ~25 files in `container/src/features/classes/` directory
- ~1,500 lines of code across API services, types, components, hooks
- 800+ line ClassMockApiService requiring modularization
- Multiple type definition files with duplication
- 10+ UI components needing simplification

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

**Component Modularity**:

- [x] Components are self-contained with no cross-workspace direct imports _(Already compliant - no changes needed)_
- [x] Each component has single, clear responsibility _(Will achieve through refactoring)_
- [x] Test coverage planned for isolated component behavior _(Existing tests will validate)_
- [x] Shared logic identified for extraction to shared utilities _(Primary refactoring goal)_

**Type Safety & Quality**:

- [x] TypeScript strict mode enabled in all modified workspaces _(Already enabled)_
- [x] No `any` types planned; explicit types for all public APIs _(Will eliminate existing `any` types)_
- [x] ESLint configuration reviewed; zero warnings target confirmed _(Already configured)_

**Maintainability**:

- [x] Conventional commit format will be followed _(Husky enforces this)_
- [x] Complex logic sections identified for documentation _(Part of refactoring scope)_
- [x] Function length reviewed; refactoring planned for >50 line functions _(Primary refactoring goal)_

**Workspace Isolation**:

- [x] Dependencies will be installed in correct workspace (not root) _(No new dependencies)_
- [x] Shared dependency versions verified across workspaces _(No changes to dependencies)_
- [x] Module Federation exports properly defined (if applicable) _(Not affected by refactoring)_
- [x] No cross-workspace import paths planned _(Work stays within container/ workspace)_

**Quality Gates**:

- [x] Build success criteria defined _(Must build without errors after each refactoring phase)_
- [x] Test coverage requirements specified _(All existing tests must pass unchanged)_
- [x] Type safety validation planned in CI _(pnpm typecheck must pass with zero errors)_

**Internationalization & Localization**:

- [x] All user-facing strings use translation keys (no hardcoded text) _(Already compliant - preserve during refactoring)_
- [x] Translation keys follow hierarchical naming convention _(Already compliant)_
- [x] Default English translations provided for all keys _(Already exists in container/src/shared/i18n/)_
- [x] Date/number formatting uses locale-aware methods _(Already compliant)_
- [x] Translation files location identified (container/src/shared/i18n/ or presentation/src/locales/) _(container/src/shared/i18n/)_

**Gate Status**: ✅ **PASSED** - All constitution requirements satisfied. This refactoring work aligns with and enforces constitution principles.

## Refactoring Completion Status (2025-10-29)

**Status**: ✅ **PHASE 5-7 COMPLETE**

### Phase 5: Component Simplification (T061-T087) ✅ COMPLETE
- ✅ Phase 5.1: Created 3 data transformation hooks (useClassFormatting, useScheduleFormatting, useLessonFormatting)
- ✅ Phase 5.2: Refactored ClassGrid (250→181 lines, -27.6%) and ClassTable (191→189 lines, -1%) + 3 sub-components
- ✅ Phase 5.3: Split LessonCreator (462→142 lines, -69.3%) + 3 sections: Objectives (103L), Resources (146L), Timing (124L)
- ✅ Phase 5.4: Utility extraction skipped per user request
- ✅ Phase 5.5: Validation completed - TypeScript type-check passed (0 errors)
- ✅ Phase 5.6: **Translation Fix** - All 3 LessonCreator sections now use `useTranslation` internally (no prop passing)

**Translation Pattern Fixed** (2025-10-29):
- ✅ ObjectivesSection.tsx - now calls `useTranslation('classes', {keyPrefix: 'lesson.creator'})` internally
- ✅ ResourcesSection.tsx - now calls `useTranslation('classes', {keyPrefix: 'lesson.creator'})` internally
- ✅ TimingSection.tsx - now calls `useTranslation('classes', {keyPrefix: 'lesson.creator'})` internally
- ✅ LessonCreator/index.tsx - removed `t` prop passing to all sections
- ✅ Components are fully self-contained with zero translation prop violations

### Phase 6: Naming Conventions Audit (T088-T118) ✅ COMPLETE
- ✅ Comprehensive naming audit completed (naming-audit-report.md created)
- ✅ Audited: 65+ functions, 50+ types, 30+ components, 20+ constants
- ✅ **Result**: 0 naming issues found - code already exemplary
- ✅ 100% compliance with TypeScript/React conventions
- ✅ All 31 tasks marked COMPLETE or SKIPPED (no changes required)

### Phase 7: Polish & Validation (T119-T128) ✅ COMPLETE
- ✅ T122: Final TypeScript validation passed (0 errors)
- ✅ T123: Constitution compliance verified (6/6 principles satisfied)
- ✅ T124: Success metrics measured and documented
- ✅ T128: Comprehensive refactoring summary created (refactoring-summary.md)
- 📋 T119-T121, T125-T126: Documentation tasks deferred (low priority)
- ✅ T127: Skipped (no commits per user constraint)

**Constitution Compliance**: ✅ **100% COMPLIANT**
- Component Modularity: All refactored components single-responsibility ✅
- Type Safety: TypeScript strict mode, 0 errors, 0 `any` types ✅
- Maintainability: All refactored files <200 lines, functions <50 lines ✅
- Workspace Isolation: All code in container/src/features/classes/ ✅
- Quality Gates: TypeScript validation passing ✅
- Internationalization: All components use useTranslation internally ✅

**Success Metrics Achieved**:
- LessonCreator: 462→142 lines (-69.3% reduction) ✅
- ClassGrid: 250→181 lines (-27.6% reduction) ✅
- ClassTable: 191→189 lines (-1% reduction, maintained quality) ✅
- Translation violations: 3→0 (100% fixed) ✅
- TypeScript errors: 0 (stable throughout) ✅
- Naming issues: 0 (code already excellent) ✅

**Deliverables**:
- 9 new files created (3 hooks + 6 components)
- 6 existing files refactored
- 2 audit reports created (naming-audit-report.md, refactoring-summary.md)
- Zero TypeScript errors maintained
- All user constraints honored (no tests, no lint, no commits, no t props)

**Phase 5 Status**: ✅ **COMPLETE** - All components <200 lines, all hooks functional, translation pattern compliant, 0 TypeScript errors

## Project Structure

### Documentation (this feature)

```text
.specify/memory/specs/refactor-classes-code/
├── plan.md              # This file
├── research.md          # Refactoring strategy and patterns
├── data-model.md        # Restructured type organization
├── quickstart.md        # Developer guide for refactored structure
├── contracts/           # N/A for refactoring (no API changes)
└── checklists/
    └── requirements.md  # Specification quality checklist
```

### Source Code (repository root)

**Current Structure** (before refactoring):

```text
container/src/features/classes/
├── api/
│   ├── mock.ts                  # 800+ lines - NEEDS REFACTORING
│   ├── rest.ts                  # REST API implementation (future)
│   └── data/
│       └── mockData.ts          # 1400+ lines of mock data - NEEDS ORGANIZATION
├── components/
│   ├── ClassCard.tsx
│   ├── ClassList.tsx            # Large component - NEEDS SPLITTING
│   ├── ClassTable.tsx
│   ├── student/
│   │   ├── StudentEnrollment.tsx
│   │   └── StudentList.tsx
│   └── lesson/
│       ├── LessonCard.tsx
│       ├── LessonCreator.tsx  # Complex component - NEEDS SIMPLIFICATION
│       └── LessonList.tsx
├── hooks/
│   ├── useClasses.ts
│   ├── useClassMutations.ts
│   ├── loaders.ts               # Route loaders
│   └── useStudents.ts
├── pages/
│   ├── ClassDetailPage.tsx
│   └── ClassListPage.tsx
├── stores/
│   └── classStore.ts            # Zustand store
├── types/
│   ├── class.ts                 # Mixed concerns - NEEDS SPLITTING
│   ├── student.ts
│   ├── teacher.ts
│   ├── schedule.ts              # Duplicated constants - NEEDS CONSOLIDATION
│   ├── lesson.ts                # Mixed concerns - NEEDS SPLITTING
│   └── index.ts                 # Barrel exports
├── utils/
│   └── formatting.ts            # NEEDS EXPANSION for extracted utilities
└── index.ts                     # Public API exports
```

**Target Structure** (after refactoring):

```text
container/src/features/classes/
├── api/
│   ├── mock.ts                  # Refactored to <50 lines, delegates to modules
│   ├── rest.ts
│   ├── services/               # NEW: Extracted service modules
│   │   ├── classService.ts     # Class CRUD operations
│   │   ├── studentService.ts   # Student operations
│   │   ├── scheduleService.ts  # Schedule operations
│   │   └── lessonService.ts    # Lesson plan operations
│   ├── filters/                # NEW: Extracted filtering logic
│   │   ├── classFilters.ts
│   │   ├── collectionFilters.ts
│   │   └── sorting.ts
│   └── data/
│       ├── mockData.ts          # Core data structures only
│       ├── classData.ts         # NEW: Class-specific data
│       ├── studentData.ts       # NEW: Student data
│       ├── scheduleData.ts      # NEW: Schedule data
│       └── lessonData.ts        # NEW: Lesson data
├── components/
│   ├── ClassCard.tsx
│   ├── ClassList.tsx            # Simplified, uses extracted hooks
│   ├── ClassTable.tsx
│   ├── student/
│   │   ├── StudentEnrollment.tsx
│   │   └── StudentList.tsx
│   └── lesson/
│       ├── LessonCard.tsx
│       ├── LessonCreator/   # NEW: Split into sub-components
│       │   ├── index.tsx
│       │   ├── ObjectivesSection.tsx
│       │   ├── ResourcesSection.tsx
│       │   └── TimingSection.tsx
│       └── LessonList.tsx
├── hooks/
│   ├── useClasses.ts
│   ├── useClassMutations.ts
│   ├── loaders.ts
│   ├── useStudents.ts
│   └── data/                    # NEW: Data transformation hooks
│       ├── useClassFormatting.ts
│       ├── useScheduleFormatting.ts
│       └── useLessonFormatting.ts
├── pages/
│   ├── ClassDetailPage.tsx
│   └── ClassListPage.tsx
├── stores/
│   └── classStore.ts
├── types/
│   ├── entities/                # NEW: Organized by domain
│   │   ├── class.ts             # Class entity only
│   │   ├── student.ts
│   │   ├── teacher.ts
│   │   ├── schedule.ts          # Schedule entity only
│   │   └── lesson.ts            # Lesson entity only
│   ├── requests/                # NEW: API request types
│   │   ├── classRequests.ts
│   │   ├── studentRequests.ts
│   │   ├── scheduleRequests.ts
│   │   └── lessonRequests.ts
│   ├── constants/               # NEW: Shared constants
│   │   ├── subjects.ts          # Consolidated subject definitions
│   │   ├── grades.ts
│   │   └── statuses.ts
│   └── index.ts                 # Barrel exports
├── utils/
│   ├── formatting.ts            # Enhanced with extracted formatters
│   ├── validation.ts            # NEW: Extracted validation logic
│   └── dateTime.ts              # NEW: Date/time utilities
└── index.ts
```

**Structure Decision**: Web application structure (Option 2 adapted for micro-frontend). All refactoring work occurs within the `container/src/features/classes/` directory. No changes to workspace boundaries or Module Federation configuration. Type organization follows domain-driven design principles (entities, requests, constants separated). Service layer extracted from monolithic mock API. Component complexity reduced through hook extraction and sub-component splitting.

## Complexity Tracking

**No Constitution Violations** - This refactoring work enforces constitution principles rather than violating them. All changes align with:
- Component Modularity (extracting single-responsibility modules)
- Type Safety (eliminating `any` types)
- Code Maintainability (reducing function length, improving naming)
- Workspace Isolation (staying within container/ workspace)
- Quality Gates (preserving test coverage)
