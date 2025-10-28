# Research: CSV Student Import

**Feature**: 005-csv-student-import  
**Date**: October 30, 2025  
**Status**: Complete

## Overview

This document captures research decisions for implementing CSV student import functionality in the React frontend. The research focuses on CSV parsing libraries, file validation patterns, preview optimization, and error handling strategies.

## Research Tasks Completed

### 1. CSV Parsing Library Selection

**Decision**: Use `papaparse` (v5.4.1)

**Rationale**:
- Most popular CSV parser for JavaScript/TypeScript (10M+ weekly downloads)
- Supports streaming for large files (though we'll parse entire file for preview)
- Built-in type inference and header row detection
- Handles edge cases: quoted fields, escaped characters, different line endings
- Works entirely client-side (no Node.js dependencies)
- TypeScript definitions available via `@types/papaparse`
- Well-maintained with active community

**Alternatives Considered**:
- **csv-parse**: Node.js focused, less browser-friendly
- **csv-parser**: Requires streams API, more complex for simple use case
- **Native JavaScript split()**: Doesn't handle RFC 4180 CSV edge cases (quoted commas, newlines in fields)
- **xlsx/SheetJS**: Overkill for CSV-only, larger bundle size

**Implementation Pattern**:
```typescript
import Papa from 'papaparse';

Papa.parse<StudentRow>(file, {
  header: true,
  skipEmptyLines: true,
  transformHeader: (header) => header.trim(),
  complete: (results) => {
    // Handle parsed data
  },
  error: (error) => {
    // Handle parsing errors
  }
});
```

### 2. File Validation Patterns

**Decision**: Multi-layer validation approach

**Frontend Validation Layers**:

1. **MIME Type Validation** (immediate):
   ```typescript
   const validMimeTypes = ['text/csv', 'application/csv', 'text/plain'];
   const isValidType = validMimeTypes.includes(file.type);
   ```
   - Note: Some systems may report `.csv` as `text/plain`, so we accept it

2. **File Size Validation** (immediate):
   ```typescript
   const MAX_SIZE = 5 * 1024 * 1024; // 5MB
   const isValidSize = file.size <= MAX_SIZE;
   ```

3. **CSV Structure Validation** (after parsing):
   - Verify required column headers exist: "First Name", "Last Name", "Email"
   - Check column header variations (case-insensitive, trim whitespace)
   - Allow optional columns to be missing

4. **Preview Data Validation** (display only):
   - Show first 50 rows as-is
   - Don't validate individual cell values (backend's responsibility)
   - Mark rows with empty required fields visually

**Rationale**: Progressive validation provides fast feedback. File-level checks happen instantly. Structure validation happens after parsing (<2s for 1000 rows). Data validation deferred to backend prevents duplicate logic and maintains single source of truth.

**Alternatives Considered**:
- **Frontend validates everything**: Duplicates backend logic, increases maintenance burden
- **No frontend validation**: Poor UX, wastes backend resources on invalid files
- **Only file size/type**: Misses structural issues, user discovers problems late

### 3. Preview Optimization

**Decision**: Limit preview to first 50 rows, display total count

**Rationale**:
- Rendering 50 rows takes <100ms even on slower devices
- Gives user sufficient sample to verify data correctness
- Avoids DOM performance issues with large tables
- Total row count shown separately so user knows full scope
- Virtual scrolling not needed for 50 rows

**Implementation Approach**:
```typescript
const previewData = parsedData.slice(0, 50);
const totalCount = parsedData.length;
```

**Alternatives Considered**:
- **Virtual scrolling (react-window)**: Overkill for 50 rows, adds complexity
- **Show all rows**: Performance issues with 1000+ row tables
- **Pagination**: More complex UX for preview, unnecessary navigation

### 4. Error Handling & User Feedback

**Decision**: Layered error handling with specific messaging

**Error Categories**:

1. **File Selection Errors**:
   - Invalid file type → "Please select a CSV file (.csv)"
   - File too large → "File must be under 5MB. Selected file is {size}MB"

2. **Parsing Errors**:
   - Malformed CSV → "Unable to parse CSV file. Please check file format"
   - Empty file → "CSV file is empty. Please select a file with data"
   - Only headers → "CSV file contains only headers. Please add student data"

3. **Structure Errors**:
   - Missing required columns → "Required columns missing: {columns}. Please download template"
   - No columns detected → "No column headers found. First row must contain column names"

4. **Backend Errors** (after submission):
   - Validation errors → Display row-level errors with specific messages
   - Network errors → "Unable to connect to server. Please try again"
   - Timeout → "Import is taking longer than expected. Please try again"

**Rationale**: Specific error messages enable users to self-service. Each error includes actionable guidance. Errors displayed inline in the modal, not as generic toasts that disappear.

**Implementation Pattern**:
```typescript
type ImportError = {
  type: 'file' | 'parse' | 'structure' | 'backend';
  message: string;
  details?: string[];
};
```

### 5. State Management Pattern

**Decision**: Use React Query for backend API calls, local React state for UI

**Rationale**:
- React Query handles loading/error states automatically
- Built-in retry logic for network failures
- Cache invalidation triggers roster refresh after successful import
- Local state sufficient for file selection, parsing, preview (ephemeral data)

**State Flow**:
1. File selected → Local state (File object)
2. CSV parsed → Local state (parsed data, preview data)
3. User confirms → React Query mutation (send to backend)
4. Backend responds → React Query handles success/error
5. Success → Invalidate roster query cache

**Alternatives Considered**:
- **Zustand global state**: Overkill for feature-local state
- **All local state**: Loses React Query benefits (retry, cache, loading states)
- **Redux**: Too much boilerplate for this feature

### 6. Component Architecture

**Decision**: Compound component pattern with modal container

**Component Hierarchy**:
```
CsvImportButton (trigger)
  → CsvImportModal (container, state management)
    → FileUploadZone (file input, drag-drop)
    → CsvPreviewTable (displays parsed data)
    → ImportProgress (loading indicator)
    → ImportErrors (error messages)
```

**Rationale**:
- Each component has single responsibility
- Easy to test in isolation
- Modal contains feature-specific state
- Components reusable within import feature
- Follows existing modal patterns in codebase

### 7. Accessibility Considerations

**Requirements**:
- File input accessible via keyboard (native input element)
- Drag-drop zone has keyboard alternative
- Error messages associated with form via aria-describedby
- Loading states announced to screen readers (aria-live)
- Preview table has proper headers for screen readers
- Modal traps focus and restores on close

**Implementation**:
- Use Radix UI Dialog primitive (already in project)
- Native file input styled but not replaced
- ARIA labels on all interactive elements

### 8. Testing Strategy

**Test Coverage Required**:

1. **Unit Tests** (utils):
   - csvParser: Valid CSV, malformed CSV, empty file, edge cases
   - fileValidator: Valid/invalid MIME types, size limits

2. **Component Tests**:
   - CsvImportButton: Opens modal
   - FileUploadZone: File selection, drag-drop, validation errors
   - CsvPreviewTable: Displays data, shows total count, handles empty state
   - ImportErrors: Displays different error types

3. **Integration Tests**:
   - Complete flow: Select file → Parse → Preview → Confirm → Success
   - Error flow: Invalid file → Show error → Retry with valid file
   - Backend error: Successful parse → Backend rejects → Show errors

**Test Data**:
- Valid CSV with 10 rows
- Valid CSV with 100 rows (performance)
- CSV with missing required columns
- CSV with special characters (accents, quotes)
- Empty CSV
- Malformed CSV (inconsistent columns)

### 9. Mock Backend Strategy

**Decision**: MSW (Mock Service Worker) for API mocking during development

**Rationale**:
- Already used in project (check existing setup)
- Mocks at network level (works with Axios/React Query)
- Can simulate success/error responses
- Can add artificial delays to test loading states
- Doesn't require backend to be running

**Mock Endpoints**:
```typescript
// POST /api/classes/{classId}/students/import
// - Success: 201 with { count: number }
// - Validation errors: 400 with { errors: Array<{row, field, message}> }
// - Server error: 500
```

**Alternatives Considered**:
- **No mocking**: Blocks frontend development until backend ready
- **Axios interceptors**: Less realistic, harder to share with team
- **JSON Server**: Overkill, requires separate server process

## Technology Additions

**New Dependencies** (to be installed in `container/` workspace):
```json
{
  "dependencies": {
    "papaparse": "^5.4.1"
  },
  "devDependencies": {
    "@types/papaparse": "^5.3.14"
  }
}
```

**Existing Dependencies** (already in project, will use):
- React Hook Form 7.61.1 (form handling)
- Zod 4.0.10 (validation schemas)
- Axios 1.10.0 (HTTP client)
- React Query 5.83.0 (server state)
- Radix UI (modal, dialog primitives)
- Tailwind CSS (styling)

## Best Practices

### CSV Parsing Best Practices

1. **Always validate column headers case-insensitively**:
   ```typescript
   const headerMap = headers.map(h => h.toLowerCase().trim());
   ```

2. **Handle BOM (Byte Order Mark)** in UTF-8 files:
   - papaparse handles this automatically

3. **Trim whitespace from cell values**:
   ```typescript
   transform: (value) => value.trim()
   ```

4. **Preserve original data** for backend submission:
   - Don't transform data types on frontend
   - Send raw CSV file to backend
   - Backend handles parsing with business rules

### File Handling Best Practices

1. **Use FormData for file uploads**:
   ```typescript
   const formData = new FormData();
   formData.append('file', file);
   ```

2. **Show file size in human-readable format**:
   ```typescript
   const formatFileSize = (bytes: number) => {
     if (bytes < 1024) return `${bytes} B`;
     if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
     return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
   };
   ```

3. **Revoke object URLs** to prevent memory leaks:
   ```typescript
   const url = URL.createObjectURL(file);
   // ... use url ...
   URL.revokeObjectURL(url);
   ```

### React Query Best Practices

1. **Use mutation for POST requests**:
   ```typescript
   const importMutation = useMutation({
     mutationFn: (file: File) => importStudents(classId, file),
     onSuccess: () => {
       queryClient.invalidateQueries(['students', classId]);
     }
   });
   ```

2. **Handle loading/error states declaratively**:
   ```typescript
   if (importMutation.isPending) return <ImportProgress />;
   if (importMutation.isError) return <ImportErrors error={importMutation.error} />;
   ```

## Open Questions

None - all research complete and decisions made.

## References

- [papaparse Documentation](https://www.papaparse.com/docs)
- [RFC 4180 CSV Standard](https://tools.ietf.org/html/rfc4180)
- [React Query Mutations](https://tanstack.com/query/latest/docs/react/guides/mutations)
- [Radix UI Dialog](https://www.radix-ui.com/docs/primitives/components/dialog)
- [File API MDN](https://developer.mozilla.org/en-US/docs/Web/API/File)
