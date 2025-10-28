# Data Model: CSV Student Import

**Feature**: 005-csv-student-import  
**Date**: October 30, 2025  
**Related**: [spec.md](./spec.md), [plan.md](./plan.md)

## Overview

This document defines the data structures used in the CSV student import feature, including TypeScript interfaces for frontend data handling, CSV row structure, validation results, and API request/response formats.

## Core Entities

### Student (from CSV)

Represents a student record parsed from the CSV file before submission to backend.

```typescript
/**
 * Student data parsed from CSV row
 * Maps to required and optional CSV columns
 */
interface CsvStudentRow {
  // Required fields (must be present in CSV)
  firstName: string;
  lastName: string;
  email: string;

  // Optional fields (may be absent in CSV)
  dateOfBirth?: string;        // Format: YYYY-MM-DD or MM/DD/YYYY or DD/MM/YYYY
  phoneNumber?: string;         // Free-form text, any international format
  parentGuardianName?: string;
  parentGuardianEmail?: string;
  additionalNotes?: string;

  // Internal metadata (not from CSV)
  _rowNumber: number;           // 1-indexed row number for error reporting
  _isValid: boolean;            // True if row passes frontend validation
  _errors: string[];            // Frontend validation error messages
}
```

**Validation Rules** (Frontend):
- `firstName`: Must be non-empty after trimming whitespace
- `lastName`: Must be non-empty after trimming whitespace
- `email`: Must be non-empty after trimming whitespace
- All optional fields: No frontend validation (empty is valid)

**Backend Validation** (not implemented in frontend):
- Email format validation
- Duplicate email detection (within file and against existing students)
- Date format parsing and validation
- Phone number normalization

### CSV File Metadata

Represents the uploaded file and its validation status.

```typescript
/**
 * File information and validation state
 */
interface CsvFileInfo {
  file: File;                   // Browser File object
  fileName: string;             // Original filename
  fileSize: number;             // Size in bytes
  fileSizeFormatted: string;    // Human-readable size (e.g., "2.5 MB")
  uploadedAt: Date;             // Client-side timestamp
}

/**
 * File validation result (before parsing)
 */
interface FileValidationResult {
  isValid: boolean;
  errors: FileValidationError[];
}

interface FileValidationError {
  type: 'mime_type' | 'file_size' | 'file_empty';
  message: string;
}
```

**Validation Constraints**:
- MIME Type: Must be `text/csv`, `application/csv`, or `text/plain`
- File Size: Must be ≤ 5MB (5 * 1024 * 1024 bytes)
- File Empty: File size must be > 0 bytes

### CSV Parse Result

Represents the result of parsing a CSV file.

```typescript
/**
 * Result of CSV parsing operation
 */
interface CsvParseResult {
  success: boolean;
  data: CsvStudentRow[];        // Empty array if parsing failed
  totalRows: number;            // Total number of data rows (excluding header)
  previewRows: CsvStudentRow[]; // First 50 rows for preview
  errors: CsvParseError[];      // Parsing or structure errors
  warnings: CsvParseWarning[];  // Non-critical issues
}

interface CsvParseError {
  type: 'malformed_csv' | 'missing_headers' | 'empty_file' | 'no_data_rows';
  message: string;
  details?: string;             // Additional context
}

interface CsvParseWarning {
  type: 'extra_columns' | 'inconsistent_columns' | 'special_characters';
  message: string;
  affectedRows?: number[];      // Row numbers if applicable
}
```

**Parse Error Conditions**:
- `malformed_csv`: papaparse cannot parse file (invalid CSV format)
- `missing_headers`: Required column headers not found
- `empty_file`: File contains no data
- `no_data_rows`: File contains only header row

### Import Session

Represents the state of an import operation.

```typescript
/**
 * Complete import session state
 */
interface ImportSession {
  id: string;                   // Unique session identifier (UUID)
  classId: string;              // Target class for import
  fileInfo: CsvFileInfo;
  parseResult: CsvParseResult;
  status: ImportStatus;
  submittedAt?: Date;           // When user confirmed import
  completedAt?: Date;           // When backend responded
  backendResult?: ImportBackendResult;
}

type ImportStatus =
  | 'file_selected'             // File chosen, not yet parsed
  | 'parsing'                   // CSV parsing in progress
  | 'parsed_success'            // Parsing complete, ready to preview
  | 'parsed_error'              // Parsing failed
  | 'submitting'                // Sending to backend
  | 'backend_validating'        // Backend processing
  | 'completed_success'         // Backend accepted, students created
  | 'completed_error';          // Backend rejected with errors

/**
 * Backend API response
 */
interface ImportBackendResult {
  success: boolean;
  studentsCreated?: number;     // Count of successfully created students
  errors?: ImportBackendError[];
}

interface ImportBackendError {
  row: number;                  // 1-indexed row number
  field?: string;               // Field name if field-specific error
  message: string;              // Human-readable error message
  code?: string;                // Machine-readable error code
}
```

## Data Relationships

```
ImportSession (1)
  ├─ contains ──> (1) CsvFileInfo
  ├─ contains ──> (1) CsvParseResult
  │                    └─ contains ──> (0..*) CsvStudentRow
  └─ contains ──> (0..1) ImportBackendResult
                          └─ contains ──> (0..*) ImportBackendError
```

## State Transitions

```
Import Session Status Flow:

   [User selects file]
          ↓
   file_selected
          ↓
   [Frontend parses CSV]
          ↓
      parsing
       ↙    ↘
parsed_error  parsed_success
   (stop)        ↓
            [User previews & confirms]
                 ↓
             submitting
                 ↓
         backend_validating
              ↙    ↘
   completed_error  completed_success
```

## CSV Column Mapping

### Expected CSV Structure

```csv
First Name,Last Name,Email,Date of Birth,Phone Number,Parent/Guardian Name,Parent/Guardian Email,Additional Notes
John,Doe,john.doe@example.com,2010-05-15,555-0100,Jane Doe,jane.doe@example.com,Honor student
Alice,Smith,alice.smith@example.com,2009-11-22,,,alice.parent@example.com,
```

### Column Header Variations (Accepted)

Frontend parsing accepts these header variations (case-insensitive, trimmed):

| Standard Header | Accepted Variations |
|----------------|---------------------|
| First Name | FirstName, first_name, first name, FIRST NAME |
| Last Name | LastName, last_name, last name, LAST NAME |
| Email | email, EMAIL, E-mail, E-Mail |
| Date of Birth | DateOfBirth, date_of_birth, DOB, dob, Birth Date |
| Phone Number | PhoneNumber, phone_number, phone, Phone, PHONE |
| Parent/Guardian Name | ParentGuardianName, parent_guardian_name, Parent Name, Guardian Name |
| Parent/Guardian Email | ParentGuardianEmail, parent_guardian_email, Parent Email, Guardian Email |
| Additional Notes | AdditionalNotes, additional_notes, notes, Notes, Comments |

**Implementation Note**: Header normalization happens during parsing:
```typescript
const normalizeHeader = (header: string): string => {
  const normalized = header.toLowerCase().trim().replace(/[\s_-]+/g, '');
  const headerMap: Record<string, string> = {
    'firstname': 'firstName',
    'lastname': 'lastName',
    'email': 'email',
    'dateofbirth': 'dateOfBirth',
    'dob': 'dateOfBirth',
    'birthdate': 'dateOfBirth',
    'phonenumber': 'phoneNumber',
    'phone': 'phoneNumber',
    'parentguardianname': 'parentGuardianName',
    'parentname': 'parentGuardianName',
    'guardianname': 'parentGuardianName',
    'parentguardianemail': 'parentGuardianEmail',
    'parentemail': 'parentGuardianEmail',
    'guardianemail': 'parentGuardianEmail',
    'additionalnotes': 'additionalNotes',
    'notes': 'additionalNotes',
    'comments': 'additionalNotes'
  };
  return headerMap[normalized] || header;
};
```

## API Contracts

### Import Students Endpoint

**Endpoint**: `POST /api/classes/{classId}/students/import`

**Request**:
```typescript
// Content-Type: multipart/form-data
{
  file: File; // CSV file
}
```

**Success Response** (201 Created):
```typescript
{
  success: true;
  studentsCreated: number;
  message: string; // e.g., "Successfully imported 25 students"
}
```

**Validation Error Response** (400 Bad Request):
```typescript
{
  success: false;
  errors: Array<{
    row: number;          // 1-indexed row number
    field?: string;       // e.g., "email", "firstName"
    message: string;      // Human-readable error
    code: string;         // e.g., "DUPLICATE_EMAIL", "INVALID_FORMAT"
  }>;
  message: string; // Summary message
}
```

**Server Error Response** (500 Internal Server Error):
```typescript
{
  success: false;
  message: string; // Error description
}
```

## Validation Rules Summary

### Frontend Validation (Immediate Feedback)

1. **File Validation**:
   - MIME type: `text/csv`, `application/csv`, or `text/plain`
   - File size: ≤ 5MB
   - File not empty

2. **Structure Validation**:
   - CSV is parseable (valid format)
   - Required column headers present: "First Name", "Last Name", "Email"
   - At least one data row (not just headers)

3. **Display Validation** (non-blocking):
   - Highlight rows with empty required fields
   - Show row count and column count
   - Display warnings for extra columns

### Backend Validation (After Submission)

1. **Data Validation**:
   - Email format (RFC 5322)
   - Email uniqueness (within file and system)
   - Date format parsing
   - Required fields non-empty

2. **Business Rules**:
   - Student ID generation
   - Association with teacher's class
   - Transaction integrity (all-or-nothing)

## Storage Considerations

**Client-Side (Browser)**:
- No persistent storage of CSV data
- File object held in React state temporarily
- Parsed data cleared on modal close or successful import
- No IndexedDB or localStorage usage

**Memory Management**:
- Maximum 1000 rows parsed (backend limit)
- Preview limited to 50 rows in DOM
- File reference released after import completes

**Security**:
- CSV file not stored in browser storage
- Sensitive data (emails, names) not logged
- File sent to backend via HTTPS only

## Example Data Scenarios

### Scenario 1: Valid Import (3 students)

```csv
First Name,Last Name,Email,Date of Birth,Phone Number
John,Doe,john.doe@example.com,2010-05-15,555-0100
Alice,Smith,alice.smith@example.com,2009-11-22,
Bob,Johnson,bob.j@example.com,,555-0102
```

**Expected Result**: 
- Frontend: Parse success, 3 rows, all valid
- Backend: Create 3 students with auto-generated IDs

### Scenario 2: Missing Required Column

```csv
First Name,Email,Date of Birth
John,john.doe@example.com,2010-05-15
```

**Expected Result**:
- Frontend: Parse error, "Missing required column: Last Name"
- User cannot proceed to submission

### Scenario 3: Empty Required Fields

```csv
First Name,Last Name,Email
John,Doe,john.doe@example.com
,Smith,alice.smith@example.com
Bob,,bob.j@example.com
```

**Expected Result**:
- Frontend: Parse success, highlight rows 2 and 3 as having empty fields
- Backend: Reject with errors for rows 2 and 3

### Scenario 4: Duplicate Emails (Backend Detection)

```csv
First Name,Last Name,Email
John,Doe,john.doe@example.com
Alice,Smith,john.doe@example.com
```

**Expected Result**:
- Frontend: Parse success, no duplicate detection on frontend
- Backend: Reject with error "Row 2: Email john.doe@example.com is already used (row 1)"

## TypeScript Type Exports

**Location**: `container/src/features/classes/types/csvImport.ts`

```typescript
// Re-export all types for external use
export type {
  CsvStudentRow,
  CsvFileInfo,
  FileValidationResult,
  FileValidationError,
  CsvParseResult,
  CsvParseError,
  CsvParseWarning,
  ImportSession,
  ImportStatus,
  ImportBackendResult,
  ImportBackendError
};

// Constants
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_PREVIEW_ROWS = 50;
export const ACCEPTED_MIME_TYPES = ['text/csv', 'application/csv', 'text/plain'];
export const REQUIRED_COLUMNS = ['firstName', 'lastName', 'email'] as const;
```
