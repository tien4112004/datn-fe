# CSV Student Import - Quick Start Guide

**Feature**: 005-csv-student-import  
**Date**: October 30, 2025

## Overview

Bulk import student accounts from CSV files. Frontend handles file validation, parsing, and preview. Backend handles business validation, duplicate detection, and account creation.

## Getting Started

### Prerequisites

- Node.js 20+ LTS
- pnpm 9+
- Existing project setup complete
- `container/` workspace configured

### Installation

1. **Install dependencies** (in container workspace):
   ```bash
   cd container
   pnpm add papaparse
   pnpm add -D @types/papaparse
   ```

2. **Verify installation**:
   ```bash
   pnpm typecheck  # Should pass
   pnpm lint       # Should pass
   ```

### Project Structure

Key files to work with:

```
container/src/features/classes/
├── components/import/       # NEW: CSV import components
│   ├── CsvImportButton.tsx
│   ├── CsvImportModal.tsx
│   ├── FileUploadZone.tsx
│   ├── CsvPreviewTable.tsx
│   ├── ImportProgress.tsx
│   └── ImportErrors.tsx
├── hooks/useCsvImport.ts   # NEW: Import logic
├── services/csvImportService.ts  # NEW: Parsing & API
└── types/csvImport.ts      # NEW: Type definitions

container/src/shared/
├── utils/
│   ├── csvParser.ts        # NEW: papaparse wrapper
│   └── fileValidator.ts    # NEW: File validation
```

## Development Workflow

### Phase 1: Implement Core Components

1. **Create type definitions** (`types/csvImport.ts`):
   - See [data-model.md](./data-model.md) for complete types
   - Export `CsvStudentRow`, `ImportSession`, etc.

2. **Implement file validation** (`shared/utils/fileValidator.ts`):
   - MIME type validation (text/csv, application/csv)
   - File size validation (≤5MB)
   - See [research.md](./research.md) for patterns

3. **Implement CSV parser** (`shared/utils/csvParser.ts`):
   - Wrap papaparse with project-specific types
   - Handle header normalization
   - Return structured parse results

4. **Build UI components**:
   - Start with `FileUploadZone` (file input + drag-drop)
   - Add `CsvPreviewTable` (display first 50 rows)
   - Build `CsvImportModal` (container component)
   - Add `CsvImportButton` (trigger in roster list)

### Phase 2: Add State Management

1. **Create custom hook** (`hooks/useCsvImport.ts`):
   - Manage file upload state
   - Handle CSV parsing
   - React Query mutation for API call

2. **Integrate with existing roster**:
   - Add import button to `StudentRosterList`
   - Invalidate roster query on success

### Phase 3: Testing

1. **Unit tests**:
   ```bash
   # Test file validator
   pnpm test fileValidator.test.ts
   
   # Test CSV parser
   pnpm test csvParser.test.ts
   ```

2. **Component tests**:
   ```bash
   # Test components
   pnpm test CsvImportModal.test.tsx
   ```

3. **Integration tests**:
   - Full import flow with mock data
   - Error handling scenarios

## CSV Format

### Required Columns

- **First Name**: Student's first name (non-empty)
- **Last Name**: Student's last name (non-empty)
- **Email**: Student's email address (non-empty, validated by backend)

### Optional Columns

- **Date of Birth**: Format: YYYY-MM-DD, MM/DD/YYYY, or DD/MM/YYYY
- **Phone Number**: Any format, stored as text
- **Parent/Guardian Name**: Parent or guardian's full name
- **Parent/Guardian Email**: Parent or guardian's email
- **Additional Notes**: Free-form text notes

### Example CSV

```csv
First Name,Last Name,Email,Date of Birth,Phone Number,Parent/Guardian Name,Parent/Guardian Email,Additional Notes
John,Doe,john.doe@example.com,2010-05-15,555-0100,Jane Doe,jane.doe@example.com,Honor student
Alice,Smith,alice.smith@example.com,2009-11-22,,,alice.parent@example.com,
Bob,Johnson,bob.j@example.com,,555-0102,Robert Johnson Sr,bob.sr@example.com,Transfer student
```

### Format Rules

- UTF-8 encoding
- RFC 4180 CSV standard
- Maximum 5MB file size
- Maximum 1000 rows (backend limit)
- Header row required
- Column order doesn't matter
- Extra columns ignored

## API Integration

### Mock Mode (Development)

Use Mock Service Worker (MSW) for development:

```typescript
// container/src/mocks/handlers/studentImport.ts
import { http, HttpResponse } from 'msw';

export const studentImportHandlers = [
  http.post('/api/classes/:classId/students/import', async ({ params, request }) => {
    const { classId } = params;
    const formData = await request.formData();
    const file = formData.get('file');
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Success response
    return HttpResponse.json({
      success: true,
      studentsCreated: 25,
      message: 'Successfully imported 25 students'
    }, { status: 201 });
  }),
];
```

### API Contract

See [contracts/import-api.yaml](./contracts/import-api.yaml) for complete OpenAPI specification.

**Endpoint**: `POST /api/classes/{classId}/students/import`

**Request**: `multipart/form-data` with CSV file

**Success Response** (201):
```json
{
  "success": true,
  "studentsCreated": 25,
  "message": "Successfully imported 25 students"
}
```

**Error Response** (400):
```json
{
  "success": false,
  "message": "Validation errors found",
  "errors": [
    {
      "row": 2,
      "field": "email",
      "message": "Email format is invalid",
      "code": "INVALID_EMAIL_FORMAT"
    }
  ]
}
```

## Testing Strategy

### Test Data Files

Create test CSV files in `container/tests/fixtures/`:

- `valid-students-10.csv` - 10 valid students
- `valid-students-100.csv` - 100 valid students (performance)
- `missing-columns.csv` - Missing required columns
- `empty-fields.csv` - Some required fields empty
- `special-characters.csv` - Names with accents, apostrophes
- `malformed.csv` - Invalid CSV format

### Running Tests

```bash
# All tests
pnpm test

# Specific test file
pnpm test csvParser.test.ts

# Watch mode
pnpm test:watch

# Coverage
pnpm test:coverage
```

## Common Issues & Solutions

### Issue: File not parsing

**Symptom**: "Unable to parse CSV file" error

**Solutions**:
- Verify file is valid CSV (not Excel .xlsx)
- Check for BOM characters (papaparse handles automatically)
- Ensure UTF-8 encoding
- Verify file is not corrupted

### Issue: Missing columns error

**Symptom**: "Required columns missing: First Name, Last Name, Email"

**Solutions**:
- Verify CSV has header row
- Check column header spelling and case
- Ensure no extra spaces in headers
- Download template and compare

### Issue: Preview not showing

**Symptom**: Modal opens but no preview table

**Solutions**:
- Check browser console for errors
- Verify CSV has data rows (not just headers)
- Check if data exceeds memory limits (>1000 rows)

### Issue: Import button not appearing

**Symptom**: Cannot find import button in roster

**Solutions**:
- Verify user has teacher permissions
- Check if component is rendered in correct location
- Verify feature flag is enabled (if using feature flags)

## Performance Considerations

- **Client-side parsing**: Fast for files up to 1000 rows (<2s)
- **Preview rendering**: Limited to 50 rows for fast DOM updates
- **Memory usage**: ~1MB per 1000 rows parsed
- **File validation**: <100ms for size/type checks

## Accessibility

- File input accessible via keyboard
- Drag-drop zone has keyboard alternative
- Error messages announced to screen readers
- Modal traps focus appropriately
- Preview table has proper semantic HTML

## Next Steps

1. Review [plan.md](./plan.md) for implementation strategy
2. Read [data-model.md](./data-model.md) for type definitions
3. Check [research.md](./research.md) for technical decisions
4. Review [contracts/import-api.yaml](./contracts/import-api.yaml) for API details
5. Run `/speckit.tasks` to generate implementation tasks

## Resources

- [papaparse Documentation](https://www.papaparse.com/docs)
- [RFC 4180 CSV Standard](https://tools.ietf.org/html/rfc4180)
- [React Query Mutations](https://tanstack.com/query/latest/docs/react/guides/mutations)
- [Radix UI Dialog](https://www.radix-ui.com/docs/primitives/components/dialog)
- [Spec](./spec.md) - Complete feature specification
- [Plan](./plan.md) - Implementation plan
