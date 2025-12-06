/**
 * CSV Parser Utility
 *
 * Wraps papaparse library with project-specific types and business logic.
 * Handles CSV parsing, header normalization, and structural validation.
 */

import Papa from 'papaparse';
import type {
  CsvStudentRow,
  CsvParseResult,
  ImportError,
  ImportWarning,
} from '@/features/classes/import-student/types/csvImport';
import {
  REQUIRED_COLUMNS,
  MAX_PREVIEW_ROWS,
  IMPORT_WARNING,
  IMPORT_ERROR,
} from '@/features/classes/import-student/types/csvImport';

/**
 * Header normalization map
 * Maps various CSV header formats to standardized field names
 */
const HEADER_NORMALIZATION_MAP: Record<string, keyof CsvStudentRow> = {
  // Full Name variations
  fullname: 'fullName',
  full_name: 'fullName',
  'full name': 'fullName',
  name: 'fullName',
  hovaten: 'fullName',
  'ho va ten': 'fullName',

  // Date of Birth variations
  dateofbirth: 'dateOfBirth',
  date_of_birth: 'dateOfBirth',
  'date of birth': 'dateOfBirth',
  dob: 'dateOfBirth',
  birthdate: 'dateOfBirth',
  'birth date': 'dateOfBirth',

  // Phone Number variations
  phonenumber: 'phoneNumber',
  phone_number: 'phoneNumber',
  'phone number': 'phoneNumber',
  phone: 'phoneNumber',
  mobile: 'phoneNumber',
  cell: 'phoneNumber',

  // Parent/Guardian Name variations
  parentguardianname: 'parentGuardianName',
  parent_guardian_name: 'parentGuardianName',
  'parent guardian name': 'parentGuardianName',
  parentname: 'parentGuardianName',
  'parent name': 'parentGuardianName',
  guardianname: 'parentGuardianName',
  'guardian name': 'parentGuardianName',
  'parent/guardian name': 'parentGuardianName',

  // Parent/Guardian Email variations
  parentguardianemail: 'parentGuardianEmail',
  parent_guardian_email: 'parentGuardianEmail',
  'parent guardian email': 'parentGuardianEmail',
  parentemail: 'parentGuardianEmail',
  'parent email': 'parentGuardianEmail',
  guardianemail: 'parentGuardianEmail',
  'guardian email': 'parentGuardianEmail',
  'parent/guardian email': 'parentGuardianEmail',

  // Additional Notes variations
  additionalnotes: 'additionalNotes',
  additional_notes: 'additionalNotes',
  'additional notes': 'additionalNotes',
  notes: 'additionalNotes',
  note: 'additionalNotes',
  comments: 'additionalNotes',
  comment: 'additionalNotes',
  remarks: 'additionalNotes',
};

/**
 * Normalizes a CSV header to standard field name
 *
 * @param header - Raw header from CSV
 * @returns Normalized field name or null if not recognized
 */
function normalizeHeader(header: string): keyof CsvStudentRow | null {
  const normalized = header
    .toLowerCase()
    .trim()
    .replace(/[\s_-]+/g, ''); // Remove spaces, underscores, hyphens

  return HEADER_NORMALIZATION_MAP[normalized] || null;
}

/**
 * Validates that all required columns are present
 *
 * @param headers - Array of normalized headers
 * @returns Error if missing required columns, null if valid
 */
function validateRequiredColumns(headers: (keyof CsvStudentRow | null)[]): ImportError | null {
  const presentColumns = new Set(headers.filter((h): h is keyof CsvStudentRow => h !== null));
  const missingColumns = REQUIRED_COLUMNS.filter((col) => !presentColumns.has(col));

  if (missingColumns.length > 0) {
    return {
      type: IMPORT_ERROR.MISSING_HEADERS,
      message: `Missing required columns: ${missingColumns.join(', ')}`,
      details: `Required columns are: ${REQUIRED_COLUMNS.join(', ')}`,
    };
  }

  return null;
}

/**
 * Validates that a row has non-empty required fields
 * Handles edge cases like whitespace-only values and special characters
 *
 * @param row - Student row data
 * @returns Array of error messages
 */
function validateRowRequiredFields(row: Partial<CsvStudentRow>): string[] {
  const errors: string[] = [];

  // Check Full Name
  const fullName = row.fullName?.trim();
  if (!fullName) {
    errors.push('Full Name is required');
  }

  return errors;
}

/**
 * Parses a CSV file and returns structured data
 *
 * @param file - Browser File object containing CSV data
 * @returns Promise resolving to parse result with data or errors
 *
 * @example
 * ```typescript
 * const result = await parseCsvFile(file);
 * if (result.success) {
 *   console.log('Parsed', result.totalRows, 'students');
 *   console.log('Preview:', result.previewRows);
 * } else {
 *   console.error('Parse errors:', result.errors);
 * }
 * ```
 */
export async function parseCsvFile(file: File): Promise<CsvParseResult> {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: 'greedy', // Skip completely empty lines
      transformHeader: (header) => {
        // Keep original header for now, normalize later
        return header.trim();
      },
      complete: (results) => {
        const errors: ImportError[] = [];
        const warnings: ImportWarning[] = [];

        // Check if file is empty or no headers
        if (!results.meta.fields || results.meta.fields.length === 0) {
          errors.push({
            type: IMPORT_ERROR.FILE_EMPTY,
            message: 'The CSV file is empty or contains no headers.',
          });

          return resolve({
            success: false,
            data: [],
            totalRows: 0,
            previewRows: [],
            errors,
            warnings,
          });
        }

        // Check if data is empty (headers only)
        if (!results.data || results.data.length === 0) {
          errors.push({
            type: IMPORT_ERROR.NO_DATA_ROWS,
            message: 'The CSV file contains headers but no data rows.',
          });

          return resolve({
            success: false,
            data: [],
            totalRows: 0,
            previewRows: [],
            errors,
            warnings,
          });
        }

        // Check for parsing errors from papaparse (malformed CSV)
        if (results.errors && results.errors.length > 0) {
          const parseError: ImportError = {
            type: IMPORT_ERROR.MALFORMED_CSV,
            message: 'The CSV file contains formatting errors or inconsistent column counts.',
            details: results.errors.map((e) => `${e.message}${e.row ? ` at row ${e.row}` : ''}`).join('; '),
          };
          errors.push(parseError);

          // Don't try to parse more if CSV structure is broken
          return resolve({
            success: false,
            data: [],
            totalRows: 0,
            previewRows: [],
            errors,
            warnings,
          });
        }

        // Get original headers and normalize them
        const originalHeaders = results.meta.fields || [];
        const normalizedHeaders = originalHeaders.map(normalizeHeader);

        // Check for required columns
        const missingColumnsError = validateRequiredColumns(normalizedHeaders);
        if (missingColumnsError) {
          errors.push(missingColumnsError);

          return resolve({
            success: false,
            data: [],
            totalRows: 0,
            previewRows: [],
            errors,
            warnings,
          });
        }

        // Map raw data to CsvStudentRow with normalized headers
        const mappedData: CsvStudentRow[] = results.data.map((rawRow: any, index: number) => {
          const row: Partial<CsvStudentRow> = {};

          // Map each field using normalized headers
          originalHeaders.forEach((originalHeader, idx) => {
            const normalizedField = normalizedHeaders[idx];
            if (
              normalizedField &&
              normalizedField !== '_rowNumber' &&
              normalizedField !== '_isValid' &&
              normalizedField !== '_errors'
            ) {
              const value = rawRow[originalHeader];
              if (value !== undefined && value !== null) {
                (row as any)[normalizedField] = String(value).trim();
              }
            }
          });

          // Validate row and add metadata
          const rowErrors = validateRowRequiredFields(row);

          return {
            fullName: row.fullName || '',
            dateOfBirth: row.dateOfBirth,
            phoneNumber: row.phoneNumber,
            parentGuardianName: row.parentGuardianName,
            parentGuardianEmail: row.parentGuardianEmail,
            additionalNotes: row.additionalNotes,
            _rowNumber: index + 1, // 1-indexed
            _isValid: rowErrors.length === 0,
            _errors: rowErrors,
          };
        });

        // Check if all data rows are empty
        if (mappedData.length === 0) {
          errors.push({
            type: IMPORT_ERROR.NO_DATA_ROWS,
            message: 'The CSV file contains headers but no valid data rows.',
          });

          return resolve({
            success: false,
            data: [],
            totalRows: 0,
            previewRows: [],
            errors,
            warnings,
          });
        }

        // Warn about extra columns not recognized
        const recognizedColumns = normalizedHeaders.filter((h) => h !== null);
        if (recognizedColumns.length < originalHeaders.length) {
          warnings.push({
            type: IMPORT_WARNING.EXTRA_COLUMNS,
            message: `${originalHeaders.length - recognizedColumns.length} column(s) were not recognized and will be ignored.`,
          });
        }

        // Get preview rows (first 50)
        const previewRows = mappedData.slice(0, MAX_PREVIEW_ROWS);

        resolve({
          success: errors.length === 0,
          data: mappedData,
          totalRows: mappedData.length,
          previewRows,
          errors,
          warnings,
        });
      },
      error: (error) => {
        resolve({
          success: false,
          data: [],
          totalRows: 0,
          previewRows: [],
          errors: [
            {
              type: IMPORT_ERROR.MALFORMED_CSV,
              message: 'Failed to parse CSV file.',
              details: error.message,
            },
          ],
          warnings: [],
        });
      },
    });
  });
}

/**
 * Checks if parsed data has any invalid rows
 *
 * @param data - Array of parsed student rows
 * @returns true if at least one row is invalid
 */
export function hasInvalidRows(data: CsvStudentRow[]): boolean {
  return data.some((row) => !row._isValid);
}

/**
 * Gets count of invalid rows
 *
 * @param data - Array of parsed student rows
 * @returns Number of invalid rows
 */
export function getInvalidRowCount(data: CsvStudentRow[]): number {
  return data.filter((row) => !row._isValid).length;
}

/**
 * Gets all invalid rows
 *
 * @param data - Array of parsed student rows
 * @returns Array of invalid rows only
 */
export function getInvalidRows(data: CsvStudentRow[]): CsvStudentRow[] {
  return data.filter((row) => !row._isValid);
}
