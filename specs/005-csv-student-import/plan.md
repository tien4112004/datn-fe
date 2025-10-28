# Implementation Plan: CSV Student Import

**Branch**: `005-csv-student-import` | **Date**: October 30, 2025 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-csv-student-import/spec.md`

## Summary

This feature enables teachers to bulk import student accounts from CSV files. The frontend handles file validation (MIME type, size up to 5MB), client-side CSV parsing, preview display (first 50 rows), and structural validation. The backend handles business rule validation, duplicate detection, student ID auto-generation, and account creation. The implementation uses React with TypeScript in the `container/` workspace, leveraging existing class roster management infrastructure.

## Technical Context

**Language/Version**: TypeScript 5.8.3, React 19.1.0  
**Primary Dependencies**: React Hook Form 7.61.1, Zod 4.0.10, papaparse (for CSV parsing), Axios 1.10.0, React Query 5.83.0  
**Storage**: Backend API endpoints (mock during development)  
**Testing**: Vitest with React Testing Library  
**Target Platform**: Web browsers (Chrome, Firefox, Safari, Edge latest versions)  
**Project Type**: Web application - `container/` workspace  
**Performance Goals**: 
- Parse and preview CSV with 1000 rows in <2 seconds
- Display preview of 50 rows in <1 second
- File validation in <100ms
**Constraints**: 
- 5MB maximum file size
- Client-side CSV parsing
- Only validation in mock mode (no backend integration initially)
**Scale/Scope**: 
- Support CSV files up to 1000 rows
- Single page component with preview modal
- 3-4 validation rules on frontend
- Integration with existing class roster feature

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Initial Check (Pre-Research)

- [x] **Component Modularity**: CSV import will be a self-contained feature in `container/src/features/classes/components/import/`
- [x] **Type Safety**: TypeScript strict mode enabled, all CSV parsing and validation will have explicit types
- [x] **Code Maintainability**: Component will follow single responsibility (separate concerns: file handling, parsing, preview, validation)
- [x] **Workspace Isolation**: New dependency (papaparse) will be installed in `container/` workspace only
- [x] **Quality Gates**: Tests will cover file validation, CSV parsing, preview display, error scenarios
- [x] **No Constitution Violations**: Standard React component following existing patterns

### Post-Design Check

*Completed after Phase 1*

- [x] **Component Modularity**: 
  - ✅ Self-contained: Import feature isolated in `/features/classes/components/import/`
  - ✅ Single Responsibility: Each component has one purpose (FileUploadZone handles upload, CsvPreviewTable handles display, etc.)
  - ✅ Independently Testable: Each component and utility can be tested in isolation
  - ✅ Reusable: csvParser and fileValidator in shared/utils/ for potential reuse

- [x] **Type Safety & Quality Enforcement**:
  - ✅ TypeScript Strict Mode: Enabled in workspace tsconfig.json
  - ✅ No `any` Types: All interfaces explicitly typed (see data-model.md)
  - ✅ Interface Contracts: Complete type definitions in types/csvImport.ts
  - ✅ Zero Type Errors: Will be verified by pre-commit hooks
  - ✅ Linting: ESLint configured and enforced

- [x] **Code Maintainability Standards**:
  - ✅ Consistent Formatting: Prettier on save enabled
  - ✅ Conventional Commits: Enforced by commitlint
  - ✅ Descriptive Naming: All components and functions have clear, descriptive names
  - ✅ Maximum Function Length: Components designed to stay under 50 lines, complex logic extracted
  - ✅ Documentation: Comments added for complex validation logic
  - ✅ No Dead Code: New feature, no legacy code to clean

- [x] **Workspace Isolation & Dependencies**:
  - ✅ Install in Workspace: papaparse installed in `container/` only
  - ✅ Shared Dependencies Aligned: Uses existing React 19, TypeScript 5.8.3
  - ✅ No Cross-Workspace Imports: All imports within container/ workspace
  - ✅ Dependency Review: papaparse justified in research.md (industry standard CSV parser)

- [x] **Quality Gates**:
  - ✅ Pre-commit Hooks: Husky configured for linting and commit messages
  - ✅ Build Success: Component structure designed to integrate cleanly
  - ✅ Test Coverage: Test plan defined for all components and utilities
  - ✅ Type Safety: All types defined, zero errors expected

**Conclusion**: All constitution principles satisfied. No violations or exceptions needed.

## Project Structure

### Documentation (this feature)

```text
specs/005-csv-student-import/
├── plan.md              # This file
├── research.md          # CSV parsing libraries, validation patterns
├── data-model.md        # Student import data structures
├── quickstart.md        # Developer setup guide
├── contracts/           # API contracts (mock endpoints)
│   └── import-api.yaml  # OpenAPI spec for import endpoint
└── tasks.md             # Implementation tasks (Phase 2)
```

### Source Code (repository root)

```text
container/
├── src/
│   ├── features/
│   │   └── classes/
│   │       ├── components/
│   │       │   ├── import/                    # NEW: CSV Import feature
│   │       │   │   ├── CsvImportButton.tsx    # Trigger button
│   │       │   │   ├── CsvImportModal.tsx     # Modal container
│   │       │   │   ├── FileUploadZone.tsx     # Drag-drop file input
│   │       │   │   ├── CsvPreviewTable.tsx    # Preview first 50 rows
│   │       │   │   ├── ImportProgress.tsx     # Loading indicator
│   │       │   │   ├── ImportErrors.tsx       # Error display
│   │       │   │   └── index.ts               # Exports
│   │       │   └── roster/                    # EXISTING: Update to integrate import button
│   │       │       └── StudentRosterList.tsx  # Add import button
│   │       ├── hooks/
│   │       │   └── useCsvImport.ts            # NEW: Import logic hook
│   │       ├── services/
│   │       │   └── csvImportService.ts        # NEW: CSV parsing & validation
│   │       └── types/
│   │           └── csvImport.ts               # NEW: Type definitions
│   └── shared/
│       ├── utils/
│       │   ├── csvParser.ts                   # NEW: Wrapper for papaparse
│       │   └── fileValidator.ts               # NEW: MIME type, size validation
│       └── types/
│           └── common.ts                       # Extend with CSV-related types
└── tests/
    └── features/
        └── classes/
            └── import/                         # NEW: Test suite
                ├── CsvImportButton.test.tsx
                ├── CsvImportModal.test.tsx
                ├── FileUploadZone.test.tsx
                ├── CsvPreviewTable.test.tsx
                ├── csvParser.test.ts
                └── fileValidator.test.ts
```

**Structure Decision**: Web application structure using the existing `container/` workspace. The CSV import feature integrates into the existing classes feature as a new component group under `features/classes/components/import/`. Shared utilities for CSV parsing and file validation are placed in `shared/utils/` for potential reuse. This follows the established pattern in the codebase and maintains workspace isolation.

## Complexity Tracking

> No constitution violations - this feature follows standard patterns
