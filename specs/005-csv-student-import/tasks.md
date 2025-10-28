# Tasks: CSV Student Import

**Feature**: 005-csv-student-import  
**Input**: Design documents from `/specs/005-csv-student-import/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/import-api.yaml

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency installation

- [X] T001 Install papaparse dependency in container workspace: `cd container && pnpm add papaparse`
- [X] T002 Install papaparse TypeScript definitions: `cd container && pnpm add -D @types/papaparse`
- [X] T003 Verify installation with typecheck: `cd container && pnpm type-check`
- [X] T004 Create feature directory structure: `container/src/features/classes/components/import/`
- [X] T005 [P] Create test directory structure: `container/tests/features/classes/import/`
- [X] T006 [P] Create shared utils directory if not exists: `container/src/shared/utils/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core type definitions and utilities that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T007 Create CSV import type definitions in `container/src/features/classes/types/csvImport.ts`
  - Define `CsvStudentRow`, `CsvFileInfo`, `FileValidationResult`, `FileValidationError`
  - Define `CsvParseResult`, `CsvParseError`, `CsvParseWarning`
  - Define `ImportSession`, `ImportStatus`, `ImportBackendResult`, `ImportBackendError`
  - Export constants: `MAX_FILE_SIZE`, `MAX_PREVIEW_ROWS`, `ACCEPTED_MIME_TYPES`, `REQUIRED_COLUMNS`

- [X] T008 [P] Implement file validator utility in `container/src/shared/utils/fileValidator.ts`
  - Validate MIME type (text/csv, application/csv, text/plain)
  - Validate file size (≤5MB)
  - Return `FileValidationResult`

- [X] T009 [P] Implement CSV parser wrapper in `container/src/shared/utils/csvParser.ts`
  - Wrap papaparse with project types
  - Implement header normalization function
  - Handle parsing errors
  - Return `CsvParseResult`
  - Limit preview to first 50 rows

- [X] T010 Create CSV import service in `container/src/features/classes/services/csvImportService.ts`
  - Use csvParser for parsing
  - Use fileValidator for validation
  - Structure validation (check required columns)
  - Export service functions

**Checkpoint**: Foundation ready - components can now be built

---

## Phase 3: User Story 1 - Upload and Process Valid CSV File (Priority: P1) 🎯 MVP

**Goal**: Teachers can upload a CSV file, see a preview of 50 rows, confirm import, and see success/error feedback inline

**Independent Test**: Upload a CSV with 10 valid students → Preview shows → Confirm → Mock success response displayed

### Implementation for User Story 1

- [X] T011 [P] [US1] Create FileUploadZone component in `container/src/features/classes/components/import/FileUploadZone.tsx`
  - File input with drag-and-drop support
  - Accept only CSV files
  - Display file info (name, size)
  - Trigger validation on file select
  - Show file validation errors

- [X] T012 [P] [US1] Create CsvPreviewTable component in `container/src/features/classes/components/import/CsvPreviewTable.tsx`
  - Display first 50 rows from parsed data
  - Show column headers
  - Display total row count
  - Highlight rows with empty required fields
  - Responsive table design

- [X] T013 [P] [US1] Create ImportProgress component in `container/src/features/classes/components/import/ImportProgress.tsx`
  - Loading spinner
  - Progress message
  - Loading state for backend submission

- [X] T014 [P] [US1] Create ImportErrors component in `container/src/features/classes/components/import/ImportErrors.tsx`
  - Display file validation errors
  - Display structure errors
  - Display backend validation errors with row numbers
  - Actionable error messages

- [X] T015 [US1] Create CsvImportModal component in `container/src/features/classes/components/import/CsvImportModal.tsx`
  - Modal container using Radix UI Dialog
  - State management for import session
  - Orchestrate: FileUploadZone → Parse → CsvPreviewTable → Confirm → ImportProgress → Success/Error
  - Handle all import states (file_selected, parsing, parsed_success, parsed_error, submitting, completed_success, completed_error)
  - Close modal on success or cancel

- [X] T016 [US1] Create useCsvImport custom hook in `container/src/features/classes/hooks/useCsvImport.ts`
  - Manage import session state
  - Handle file selection and parsing
  - React Query mutation for API submission
  - Handle success/error callbacks
  - Invalidate roster query on success

- [X] T017 [US1] Create CsvImportButton component in `container/src/features/classes/components/import/CsvImportButton.tsx`
  - Button to trigger import modal
  - Icon + "Import Students" text
  - Opens CsvImportModal

- [X] T018 [US1] Create index.ts barrel export in `container/src/features/classes/components/import/index.ts`
  - Export all import components
  - Clean public API

- [X] T019 [US1] Integrate CsvImportButton into StudentRosterList in `container/src/features/classes/components/roster/StudentRosterList.tsx`
  - Add import button to roster header/toolbar
  - Position appropriately in UI

- [X] T020 [US1] Setup MSW mock handler for import API in `container/src/mocks/handlers/studentImport.ts`
  - Mock POST /api/classes/:classId/students/import
  - Return success response with count
  - Simulate 1 second delay
  - Add to MSW handlers

**Checkpoint**: User Story 1 complete - Teachers can import valid CSV files and see results

---

## Phase 4: User Story 2 - Handle CSV Validation and Error Reporting (Priority: P2)

**Goal**: Teachers receive clear, actionable error messages for invalid CSV files (missing columns, malformed CSV, backend validation errors)

**Independent Test**: Upload CSV with missing columns → See frontend error. Upload CSV with duplicate emails → See backend row-level errors.

### Implementation for User Story 2

- [X] T021 [US2] Enhance FileUploadZone to show structural errors in `container/src/features/classes/components/import/FileUploadZone.tsx`
  - Display parsing errors (malformed CSV)
  - Display structure errors (missing columns, empty file, no data rows)
  - Prevent preview when structure invalid

- [X] T022 [US2] Enhance ImportErrors component for backend validation in `container/src/features/classes/components/import/ImportErrors.tsx`
  - Display backend errors grouped by row
  - Show field name and specific error message
  - Format error codes into user-friendly messages
  - Add "Download CSV with errors" link (optional enhancement)

- [X] T023 [US2] Add error state handling to CsvImportModal in `container/src/features/classes/components/import/CsvImportModal.tsx`
  - Handle parsed_error state (show errors, allow retry)
  - Handle completed_error state (show backend errors, allow retry)
  - Add "Try Another File" button for errors
  - Clear errors on new file selection

- [X] T024 [US2] Update MSW mock handler with error scenarios in `container/src/mocks/handlers/studentImport.ts`
  - Add validation error response (400) with row-level errors
  - Add malformed CSV detection
  - Add duplicate email detection
  - Make errors toggleable for testing

- [X] T025 [US2] Create test fixtures for invalid CSVs in `container/tests/fixtures/`
  - Create `missing-columns.csv` (missing required columns)
  - Create `empty-fields.csv` (required fields empty)
  - Create `malformed.csv` (invalid CSV format)
  - Create `special-characters.csv` (accents, quotes)

- [X] T026 [US2] Add edge case handling to csvParser in `container/src/shared/utils/csvParser.ts`
  - Handle empty files
  - Handle files with only headers
  - Handle inconsistent column counts
  - Handle special characters
  - Add parsing error details

**Checkpoint**: User Story 2 complete - Error handling is robust with clear user guidance

---

## Phase 5: User Story 3 - Download CSV Template and View Format Requirements (Priority: P3)

**Goal**: Teachers can download a pre-filled CSV template and see format requirements inline

**Independent Test**: Click "Download Template" → CSV file downloads with correct headers and example data. View modal → See format requirements documented.

### Implementation for User Story 3

- [X] T027 [P] [US3] Create CSV template file in `container/public/templates/student-import-template.csv`
  - Include all required and optional column headers
  - Include 2-3 example rows with realistic data
  - Use UTF-8 encoding

- [X] T028 [P] [US3] Create FormatRequirements component in `container/src/features/classes/components/import/FormatRequirements.tsx`
  - List required columns with descriptions
  - List optional columns with descriptions
  - Show data format examples (dates, phones, emails)
  - Show constraints (file size, row limit)
  - Expandable/collapsible section

- [X] T029 [US3] Add template download button to CsvImportModal in `container/src/features/classes/components/import/CsvImportModal.tsx`
  - "Download Template" button visible at start
  - Trigger browser download of template CSV
  - Position near file upload zone

- [X] T030 [US3] Add FormatRequirements to CsvImportModal in `container/src/features/classes/components/import/CsvImportModal.tsx`
  - Display format requirements section
  - Show/hide toggle or always visible
  - Position below upload zone or in sidebar

**Checkpoint**: User Story 3 complete - First-time users have clear guidance and template

---

## Phase 6: User Story 4 - Handle Partial Updates for Existing Students (Priority: P4)

**Goal**: Teachers can import CSV with mix of new and existing students, with update confirmation

**Independent Test**: Import CSV with existing student emails → See preview highlighting updates vs creates → Confirm → Both operations succeed

**Note**: This story requires backend support for detecting existing students by email and performing updates. Implementation deferred pending backend API design.

### Implementation for User Story 4

- [ ] T031 [US4] BLOCKED: Awaiting backend API for update detection
  - Backend needs to return indication of which rows are updates vs creates
  - Backend needs "updateExisting" flag in import request
  - Backend needs to return summary: {created: N, updated: M}

- [ ] T032 [US4] Add "Update Existing" checkbox to CsvImportModal (when backend ready)
  - Checkbox in preview screen
  - Default unchecked (create only)
  - Pass flag to backend API

- [ ] T033 [US4] Enhance CsvPreviewTable to highlight updates (when backend ready)
  - Different styling for rows that will update existing students
  - Show warning icon or badge for updates
  - Show summary count: "X new, Y updates"

- [ ] T034 [US4] Update success message for mixed operations (when backend ready)
  - Display: "Successfully created X students and updated Y students"
  - Show separate counts

**Status**: User Story 4 blocked pending backend API design. Can be implemented in future iteration.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T035 [P] Add loading states and skeleton screens throughout import flow
  - Added loading indicators and animations in ImportProgress component
  - Enhanced UI feedback during parsing and submission

- [X] T036 [P] Add accessibility improvements (ARIA labels, keyboard navigation, focus management)
  - Added role="dialog", aria-labelledby, aria-describedby to CsvImportModal DialogContent
  - Added role="alert", aria-live, aria-relevant to ImportErrors component
  - Added role="grid", aria-rowcount, aria-colcount, role="gridcell" to CsvPreviewTable
  - Added role="region", aria-label, aria-invalid to FileUploadZone
  - Added aria-expanded, aria-controls to FormatRequirements toggle button
  - Added role="status", role="alert", aria-live attributes to error displays
  - Added aria-hidden to decorative icons
  - Added sr-only spans for screen readers

- [X] T037 [P] Add i18n support for all user-facing text using existing i18next setup
  - Created comprehensive translation keys in `container/src/shared/i18n/locales/en/classes.ts` under csvImport namespace
  - Added Vietnamese translations in `container/src/shared/i18n/locales/vi/classes.ts` under csvImport namespace
  - Integrated i18n into CsvImportModal with useTranslation hook
  - Updated modal titles, descriptions, and button labels to use translation keys
  - Translation keys cover: modal states, upload UI, file errors, parse errors, preview, errors display, requirements, progress, success, and backend errors
- [ ] T038 [P] Performance optimization: Test with 1000-row CSV and optimize if needed
- [ ] T039 [P] Add error boundary around import modal to catch unexpected errors
- [ ] T040 Code review and refactoring for maintainability
- [ ] T041 Update project documentation in `specs/005-csv-student-import/quickstart.md` with final implementation notes
- [ ] T042 Create demo video or GIFs for documentation
- [ ] T043 Update `.github/copilot-instructions.md` with any additional context (if needed)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately ✅
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational (Phase 2) completion
  - User Story 1 (P1): Independent, can start after Phase 2
  - User Story 2 (P2): Independent, can start after Phase 2 (enhances US1 error handling)
  - User Story 3 (P3): Independent, can start after Phase 2 (adds template/docs to US1)
  - User Story 4 (P4): BLOCKED - needs backend API changes first
- **Polish (Phase 7)**: Should wait until US1, US2, US3 are complete

### Critical Path

```
Phase 1 (Setup)
    ↓
Phase 2 (Foundational) ← BLOCKS EVERYTHING
    ↓
Phase 3 (US1: Core Import) ← MVP MILESTONE 🎯
    ↓
Phase 4 (US2: Error Handling) ← Parallel with US3 possible
    ↓
Phase 5 (US3: Template & Docs) ← Parallel with US2 possible
    ↓
[Phase 6 (US4) - BLOCKED]
    ↓
Phase 7 (Polish)
```

### Within Each User Story

- Components marked [P] can be built in parallel (different files)
- Tests can be written in parallel with implementation (or before for TDD)
- Integration happens after individual components complete
- Each story should be independently testable before moving to next

### Parallel Opportunities

**Phase 1 (Setup)**: All tasks can run sequentially (quick, <5 mins total)

**Phase 2 (Foundational)**: 
```bash
# After T007 (types) completes, run these in parallel:
T008 [P] fileValidator.ts
T009 [P] csvParser.ts
# Then T010 (service) uses both
```

**Phase 3 (User Story 1)**:
```bash
# After foundational, run these in parallel:
T011 [P] [US1] FileUploadZone.tsx
T012 [P] [US1] CsvPreviewTable.tsx
T013 [P] [US1] ImportProgress.tsx
T014 [P] [US1] ImportErrors.tsx

# Then sequence:
T015 [US1] CsvImportModal.tsx (uses above components)
T016 [US1] useCsvImport.ts (with modal)
T017 [US1] CsvImportButton.tsx
T018 [US1] index.ts
T019 [US1] Integration into roster
T020 [US1] MSW mock handler
```

**Phase 4 & 5 (US2 and US3)**:
- Can work on US2 and US3 in parallel if team capacity allows
- Both enhance US1 without breaking it

**Phase 7 (Polish)**:
```bash
# All polish tasks marked [P] can run in parallel:
T035-T039 [P] Various improvements
```

---

## Implementation Strategy

### MVP First (Recommended - User Story 1 Only)

1. ✅ Complete Phase 1: Setup (~5 minutes)
2. ✅ Complete Phase 2: Foundational (~2-3 hours)
3. ✅ Complete Phase 3: User Story 1 (~6-8 hours)
4. **🎯 STOP and VALIDATE**: Test complete import flow with valid CSV
5. ✅ Deploy/demo MVP if ready

**MVP Delivers**: Teachers can import valid CSV files and see success

### Incremental Delivery (Full Feature)

1. ✅ MVP (US1) → Validate → Deploy
2. ✅ Add US2 (Error Handling) → Validate → Deploy (~3-4 hours)
3. ✅ Add US3 (Template & Docs) → Validate → Deploy (~2-3 hours)
4. ⏸️ US4 blocked - skip for now
5. ✅ Polish (Phase 7) → Final validation → Deploy (~2-3 hours)

**Total Effort**: ~16-20 hours for US1-US3 + Polish

### Parallel Team Strategy

With 2 developers after foundational phase completes:

- **Developer A**: User Story 1 (core import)
- **Developer B**: User Story 3 (template/docs preparation)
- After US1 complete, Developer A → User Story 2 (error handling)
- Both converge for integration testing and polish

---

## Task Count Summary

- **Phase 1 (Setup)**: 6 tasks
- **Phase 2 (Foundational)**: 4 tasks (BLOCKS everything)
- **Phase 3 (US1 - MVP)**: 10 tasks 🎯
- **Phase 4 (US2)**: 6 tasks
- **Phase 5 (US3)**: 4 tasks
- **Phase 6 (US4)**: 4 tasks (BLOCKED)
- **Phase 7 (Polish)**: 9 tasks

**Total**: 43 tasks (39 unblocked)

**Parallel Opportunities**: 11 tasks marked [P]

**MVP Scope**: Phases 1-3 only (20 tasks, ~11-16 hours)

---

## Notes

- All tasks follow strict checklist format: `- [ ] [ID] [P?] [Story?] Description with file path`
- [P] = parallelizable (different files, no blocking dependencies)
- [Story] = user story mapping (US1, US2, US3, US4)
- Each user story is independently testable
- US4 is blocked pending backend API design
- Focus on MVP (US1) first for fastest value delivery
- Use MSW for mocking during development
- Follow existing project patterns (Radix UI, React Query, Tailwind CSS)
- Maintain TypeScript strict mode and zero type errors
- Run `pnpm type-check` and `pnpm lint` after each task
- **Note**: Test tasks have been removed - tests can be added later if needed
