/**
 * CSV Student Import Type Definitions
 *
 * This module defines all types and constants used in the CSV import feature.
 * Includes student row data, file validation, parse results, and import state.
 */

// ===== CORE ENTITIES =====

/**
 * Student data parsed from CSV row
 * Maps to required and optional CSV columns
 */
export interface CsvStudentRow {
  // Required fields (must be present in CSV)
  fullName: string;

  // Optional fields (may be absent in CSV)
  dateOfBirth?: string; // Format: YYYY-MM-DD or MM/DD/YYYY or DD/MM/YYYY
  phoneNumber?: string; // Free-form text, any international format
  parentGuardianName?: string;
  parentGuardianEmail?: string;
  additionalNotes?: string;

  // Internal metadata (not from CSV)
  _rowNumber: number; // 1-indexed row number for error reporting
  _isValid: boolean; // True if row passes frontend validation
  _errors: string[]; // Frontend validation error messages
}

// ===== FILE METADATA =====

/**
 * File information and validation state
 */
export interface CsvFileInfo {
  file: File; // Browser File object
  fileName: string; // Original filename
  fileSize: number; // Size in bytes
  fileSizeFormatted: string; // Human-readable size (e.g., "2.5 MB")
  uploadedAt: Date; // Client-side timestamp
}

// ===== IMPORT ERRORS AND WARNINGS =====

/**
 * Consolidated error types for file validation and CSV parsing.
 */
export const IMPORT_ERROR = {
  // File validation errors
  MIME_TYPE: 'mime_type',
  FILE_SIZE: 'file_size',
  FILE_EMPTY: 'file_empty',

  // CSV parsing errors
  MALFORMED_CSV: 'malformed_csv',
  MISSING_HEADERS: 'missing_headers',
  NO_DATA_ROWS: 'no_data_rows',
} as const;

export type ImportErrorType = (typeof IMPORT_ERROR)[keyof typeof IMPORT_ERROR];

export interface ImportError {
  type: ImportErrorType;
  message: string;
  details?: string; // Additional context for parsing errors
}

/**
 * Warning types for non-critical CSV issues.
 */
export const IMPORT_WARNING = {
  EXTRA_COLUMNS: 'extra_columns',
  INCONSISTENT_COLUMNS: 'inconsistent_columns',
  SPECIAL_CHARACTERS: 'special_characters',
} as const;

export type ImportWarningType = (typeof IMPORT_WARNING)[keyof typeof IMPORT_WARNING];

export interface ImportWarning {
  type: ImportWarningType;
  message: string;
  affectedRows?: number[]; // Row numbers if applicable
}

// ===== CSV PARSE RESULTS =====

/**
 * Result of CSV parsing operation
 */
export interface CsvParseResult {
  success: boolean;
  data: CsvStudentRow[]; // Empty array if parsing failed
  totalRows: number; // Total number of data rows (excluding header)
  previewRows: CsvStudentRow[]; // First 50 rows for preview
  errors: ImportError[]; // Parsing or structure errors
  warnings: ImportWarning[]; // Non-critical issues
}

// ===== IMPORT STATE MACHINE =====

export type ImportStatus = 'idle' | 'parsing' | 'preview' | 'submitting' | 'success' | 'error';

export interface ImportState {
  status: ImportStatus;
  fileInfo?: CsvFileInfo;
  parseResult?: CsvParseResult;
  error?: string; // For backend errors
}

export type ImportAction =
  | { type: 'FILE_SELECT'; payload: { fileInfo: CsvFileInfo; errors: ImportError[] } }
  | { type: 'PARSE_SUCCESS'; payload: CsvParseResult }
  | { type: 'PARSE_ERROR'; payload: CsvParseResult }
  | { type: 'SUBMIT' }
  | { type: 'SUBMIT_SUCCESS' }
  | { type: 'SUBMIT_ERROR'; payload: string }
  | { type: 'RESET' };

// ===== CONSTANTS =====

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes
export const MAX_PREVIEW_ROWS = 50;
export const ACCEPTED_MIME_TYPES = ['text/csv', 'application/csv', 'text/plain'] as const;
export const REQUIRED_COLUMNS = ['fullName'] as const;

// Type for required column keys
export type RequiredColumn = (typeof REQUIRED_COLUMNS)[number];
